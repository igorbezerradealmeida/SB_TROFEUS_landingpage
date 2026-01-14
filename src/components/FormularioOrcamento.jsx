import React, { useState, useEffect } from 'react';

export default function FormularioOrcamento() {

  const NUMERO_WHATSAPP = "5584986328600"; 

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    nome: '', email: '', whatsapp: '',
    brinde: '', tipoRoda: '', modeloRoda: '', quantidade: '',
    logo: null,
    screenshotUrl: null 
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [statusUpload, setStatusUpload] = useState('');

  const opcoesRodas = { 'Corrida': ['Roda 1', 'Roda 2', 'Roda 3', 'Roda 4', 'Roda 5'], 'F1': ['Roda A', 'Roda B'], 'Agro': ['Roda Agro'] };

  // --- ESCUTA O EVENTO DO 3D ---
  useEffect(() => {
    const handlePreenchimento = (event) => {
      const dados = event.detail;
      console.log("Formulário recebeu:", dados); // Debug

      setFormData(prev => ({
        ...prev,
        brinde: dados.brinde,
        tipoRoda: dados.tipoRoda,
        modeloRoda: dados.modeloRoda,
        logo: dados.logoFile, // Aqui recebe o arquivo REAL da logo
        screenshotUrl: dados.screenshotUrl 
      }));
    };

    window.addEventListener('preencherFormulario', handlePreenchimento);
    return () => window.removeEventListener('preencherFormulario', handlePreenchimento);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prevData => {
      const newData = { ...prevData, [name]: type === 'file' ? files[0] : value };
      if (name === 'brinde' && value !== 'Rodabeats') { newData.tipoRoda = ''; newData.modeloRoda = ''; }
      if (name === 'tipoRoda') { newData.modeloRoda = ''; }
      return newData;
    });
    if (errors[name]) setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
  };

  const validateStep = () => {
    const newErrors = {};
    if (currentStep === 1) { 
      if (!formData.nome) newErrors.nome = 'Como podemos te chamar?';
      if (!formData.whatsapp) newErrors.whatsapp = 'Precisamos do seu WhatsApp.';
    } else if (currentStep === 2) { 
      if (!formData.brinde) newErrors.brinde = 'Selecione um modelo.';
      if (formData.brinde === 'Rodabeats') {
        if (!formData.tipoRoda) newErrors.tipoRoda = 'Selecione o tipo.';
        if (formData.tipoRoda && !formData.modeloRoda) newErrors.modeloRoda = 'Selecione qual roda.';
      }
      if (!formData.quantidade) newErrors.quantidade = 'Selecione a quantidade.';
    }
    return newErrors;
  };

  const handleNextStep = () => {
    const stepErrors = validateStep();
    if (Object.keys(stepErrors).length === 0) setCurrentStep(2);
    else setErrors(stepErrors);
  };

  // --- UPLOAD DA LOGO ---
  const uploadImageToServer = async (file) => {
    const dataToSend = new FormData();
    dataToSend.append('imagem', file);
    try {
      // IMPORTANTE: Mude para /upload.php em produção
      const response = await fetch('http://localhost/api-brindes/upload.php', { method: 'POST', body: dataToSend });
      const resultado = await response.json();
      return resultado.sucesso ? resultado.link : null;
    } catch (error) { return null; }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const stepErrors = validateStep();
    if (Object.keys(stepErrors).length > 0) { setErrors(stepErrors); return; }

    setIsLoading(true);
    setStatusUpload(''); 
    let linkLogo = '';

    try {
      // Se existe um objeto de arquivo na variável logo, fazemos o upload AGORA
      if (formData.logo && typeof formData.logo === 'object') {
        setStatusUpload('Anexando sua logo...');
        linkLogo = await uploadImageToServer(formData.logo);
      }

      setStatusUpload('Abrindo WhatsApp...');

      let modeloTexto = formData.brinde;
      if (formData.brinde === 'Rodabeats') {
        modeloTexto += ` - ${formData.tipoRoda}`;
        if (formData.modeloRoda) modeloTexto += ` (${formData.modeloRoda})`;
      }

      const mensagem = `
*NOVO ORÇAMENTO - SITE* 🧢

👤 *Nome:* ${formData.nome}
📧 *Email:* ${formData.email || '-'}
📱 *WhatsApp:* ${formData.whatsapp}

🎁 *Modelo:* ${modeloTexto}
📦 *Quantidade:* ${formData.quantidade}

🎨 *Personalização:*
${formData.screenshotUrl ? `🖼️ *Ver Modelo 3D Criado:* ${formData.screenshotUrl}` : ''}
${linkLogo ? `📎 *Link da Logo:* ${linkLogo}` : ''}
      `.trim();

      const textoCodificado = encodeURIComponent(mensagem);
      const linkWhatsapp = `https://wa.me/${NUMERO_WHATSAPP}?text=${textoCodificado}`;

      setTimeout(() => {
        window.open(linkWhatsapp, '_blank');
        setIsSubmitted(true);
        setIsLoading(false);
      }, 500);

    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao processar.');
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div id="formulario" className="w-full max-w-4xl mx-auto bg-zinc-900 rounded-3xl p-10 text-center shadow-2xl border border-zinc-800">
        <div className="text-6xl mb-6">✅</div>
        <h2 className="text-3xl font-bold text-white mb-4">Solicitação Gerada!</h2>
        <p className="text-gray-300 text-lg mb-6">Verifique se o WhatsApp abriu corretamente.</p>
        <button onClick={() => { setIsSubmitted(false); setCurrentStep(1); setFormData({...formData, logo: null, screenshotUrl: null}); }} className="text-gray-500 hover:text-white underline text-sm">Novo Orçamento</button>
      </div>
    );
  }

  return (
    <section id="formulario" className="w-full py-12 md:py-24 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="bg-zinc-900/90 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-2xl border border-zinc-800">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Solicite seu Orçamento</h2>
            <p className="text-gray-400 mb-8">Personalize o pedido abaixo.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {currentStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  {formData.screenshotUrl && (
                    <div className="bg-green-900/30 border border-green-500/50 p-3 rounded-lg flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded overflow-hidden bg-black border border-zinc-600">
                         <img src={formData.screenshotUrl} alt="Preview 3D" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-green-400 font-bold text-sm">Modelo 3D importado!</p>
                        <p className="text-green-200/70 text-xs">Preencha seus dados para continuar.</p>
                      </div>
                    </div>
                  )}
                  <div><label className="block text-sm font-medium text-gray-300 mb-1">Seu Nome</label><input type="text" name="nome" value={formData.nome} onChange={handleChange} placeholder="Ex: João Silva" className={`w-full bg-zinc-800 border ${errors.nome ? 'border-red-500' : 'border-zinc-700'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500`} />{errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}</div>
                  <div><label className="block text-sm font-medium text-gray-300 mb-1">Seu WhatsApp</label><input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="(00) 99999-9999" className={`w-full bg-zinc-800 border ${errors.whatsapp ? 'border-red-500' : 'border-zinc-700'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500`} />{errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>}</div>
                  <div><label className="block text-sm font-medium text-gray-300 mb-1">Email (Opcional)</label><input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="joao@empresa.com" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500" /></div>
                  <button type="button" onClick={handleNextStep} className="w-full bg-yellow-500 text-black font-bold py-4 rounded-xl mt-4 hover:bg-yellow-400 transition-transform hover:-translate-y-1">CONTINUAR ➔</button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                  
                  {/* FEEDBACK VISUAL DO QUE VEIO DO 3D */}
                  {formData.screenshotUrl && (
                    <div className="mb-4 text-center">
                        <img src={formData.screenshotUrl} alt="Seu Projeto" className="w-full h-32 object-cover rounded-xl border border-zinc-700 opacity-80 mb-2" />
                        <p className="text-xs text-gray-400">Modelo configurado acima. Altere abaixo se necessário.</p>
                    </div>
                  )}

                  <div><label className="block text-sm font-medium text-gray-300 mb-1">Modelo de Interesse</label><select name="brinde" value={formData.brinde} onChange={handleChange} className={`w-full bg-zinc-800 border ${errors.brinde ? 'border-red-500' : 'border-zinc-700'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 appearance-none cursor-pointer`}><option value="">Selecione o modelo...</option><option value="Turbo Car">Turbo Car</option><option value="Motor V8">Motor V8</option><option value="Rodabeats">Rodabeats</option></select>{errors.brinde && <p className="text-red-500 text-xs mt-1">{errors.brinde}</p>}</div>
                  {formData.brinde === 'Rodabeats' && (<div className="animate-fade-in pl-4 border-l-2 border-yellow-500/50"><label className="block text-sm font-medium text-yellow-500 mb-1">Qual o estilo da roda?</label><select name="tipoRoda" value={formData.tipoRoda} onChange={handleChange} className={`w-full bg-zinc-800 border ${errors.tipoRoda ? 'border-red-500' : 'border-zinc-700'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 appearance-none cursor-pointer`}><option value="">Selecione o estilo...</option><option value="Corrida">Corrida</option><option value="F1">F1</option><option value="Agro">Agro</option></select>{errors.tipoRoda && <p className="text-red-500 text-xs mt-1">{errors.tipoRoda}</p>}</div>)}
                  {formData.brinde === 'Rodabeats' && formData.tipoRoda && (<div className="animate-fade-in pl-4 border-l-2 border-yellow-500"><label className="block text-sm font-medium text-white mb-1">Escolha a Roda ({formData.tipoRoda})</label><select name="modeloRoda" value={formData.modeloRoda} onChange={handleChange} className={`w-full bg-zinc-800 border ${errors.modeloRoda ? 'border-red-500' : 'border-zinc-700'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 appearance-none cursor-pointer`}><option value="">Selecione a roda...</option>{opcoesRodas[formData.tipoRoda].map((opcao) => (<option key={opcao} value={opcao}>{opcao}</option>))}</select>{errors.modeloRoda && <p className="text-red-500 text-xs mt-1">{errors.modeloRoda}</p>}</div>)}
                  <div className="mt-4"><label className="block text-sm font-medium text-gray-300 mb-1">Quantidade</label><select name="quantidade" value={formData.quantidade} onChange={handleChange} className={`w-full bg-zinc-800 border ${errors.quantidade ? 'border-red-500' : 'border-zinc-700'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 appearance-none cursor-pointer`}><option value="">Selecione a quantidade...</option><option value="20 a 50">20 a 50 unidades</option><option value="50 a 100">50 a 100 unidades</option><option value="100 a 500">100 a 500 unidades</option><option value="1000+">Acima de 1000 unidades</option><option value="Outro valor">Outro valor</option></select>{errors.quantidade && <p className="text-red-500 text-xs mt-1">{errors.quantidade}</p>}</div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Sua Logo</label>
                    <div className="relative border-2 border-dashed border-zinc-700 bg-zinc-800/50 rounded-xl p-6 text-center hover:border-yellow-500 transition-colors cursor-pointer group">
                        <input type="file" name="logo" onChange={handleChange} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <div className="flex flex-col items-center">
                            <span className="text-2xl mb-2">{formData.logo ? '✅' : '📁'}</span>
                            <span className="text-sm text-gray-400 group-hover:text-yellow-400">{formData.logo ? `Arquivo: ${formData.logo.name}` : 'Clique para enviar sua logo'}</span>
                        </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4"><button type="button" onClick={() => setCurrentStep(1)} className="flex-1 bg-zinc-800 text-gray-300 font-bold py-4 rounded-xl hover:bg-zinc-700">VOLTAR</button><button type="submit" disabled={isLoading} className="flex-[2] bg-green-500 text-white font-bold py-4 rounded-xl hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2">{isLoading ? (statusUpload || 'AGUARDE...') : 'ENVIAR WHATSAPP'}</button></div>
                </div>
              )}
            </form>
          </div>
          <div className="hidden lg:flex items-center justify-center">
             <img src="/imagens/form-side-image.png" alt="Modelo Exemplo" className="w-full max-w-md object-cover rounded-3xl shadow-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}