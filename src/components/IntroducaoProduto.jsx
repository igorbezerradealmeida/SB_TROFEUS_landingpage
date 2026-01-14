import React, { useState, useRef } from 'react';
import Visualizador3D from './Visualizador3D';

// --- ÍCONES ---
const CheckmarkIcon = () => ( <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white z-10 shadow-sm border border-white"> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className="h-3 w-3"> <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /> </svg> </div> );
const RulerIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"> <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" /> <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" /> </svg> );

export default function IntroducaoProduto() {
  
  const [selectedCor, setSelectedCor] = useState('padrao');
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [tipoModel, setTipoModel] = useState('turbo'); 
  const [pneuType, setPneuType] = useState('agro');    
  const [rodaModel, setRodaModel] = useState('roda1'); 
  const [autoRotate, setAutoRotate] = useState(true);
  const [showMeasures, setShowMeasures] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const visualizadorRef = useRef();

  // DADOS (Mantive seus caminhos)
  const mainModels = [ { id: 'turbo', label: 'Turbo', img: '/imagens/lancamento/thumb-turbo.jpg' }, { id: 'v8', label: 'V8', img: '/imagens/lancamento/thumb-v8.jpg' }, { id: 'roda', label: 'Roda', img: '/imagens/lancamento/thumb-roda-corrida-1.jpg' }, ];
  const wheelStyles = [ { id: 'agro', label: 'Agro', img: '/imagens/lancamento/thumb-pneu-agro.jpg' }, { id: 'f1', label: 'F1', img: '/imagens/lancamento/thumb-pneu-f1.jpg' }, { id: 'corrida', label: 'Corrida', img: '/imagens/lancamento/thumb-pneu-corrida.jpg' }, ];
  const corridaWheels = [ { id: 'roda1', label: 'Roda 1', img: '/imagens/lancamento/thumb-roda-corrida-1.jpg' }, { id: 'roda2', label: 'Roda 2', img: '/imagens/lancamento/thumb-roda-corrida-2.jpg' }, { id: 'roda3', label: 'Roda 3', img: '/imagens/lancamento/thumb-roda-corrida-3.jpg' }, { id: 'roda4', label: 'Roda 4', img: '/imagens/lancamento/thumb-roda-corrida-4.jpg' }, { id: 'roda5', label: 'Roda 5', img: '/imagens/lancamento/thumb-roda-corrida-5.jpg' }, ];
  const f1Wheels = [ { id: 'roda1', label: 'Roda A', img: '/imagens/lancamento/thumb-roda-f1-1.jpg' }, { id: 'roda2', label: 'Roda B', img: '/imagens/lancamento/thumb-roda-f1-2.jpg' }, ];
  const agroWheels = [ { id: 'roda1', label: 'Agro', img: '/imagens/lancamento/thumb-roda-agro-1.jpg' }, ];

  // --- UPLOAD DO PRINT ---
  const uploadBase64Image = async (base64String) => {
    try {
      const blob = await (await fetch(base64String)).blob();
      const formData = new FormData();
      formData.append('imagem', blob, 'screenshot.png');

      // IMPORTANTE: Mude para /upload.php quando subir para produção
      const response = await fetch('http://localhost/api-brindes/upload.php', { method: 'POST', body: formData });
      const data = await response.json();
      return data.sucesso ? data.link : null;
    } catch (error) {
      console.error("Erro upload 3D:", error);
      return null;
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedLogo(file); // Guarda o arquivo REAL
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result); // Guarda o preview
      reader.readAsDataURL(file);
    }
  };

  const getCurrentWheels = () => {
    if (pneuType === 'corrida') return corridaWheels;
    if (pneuType === 'f1') return f1Wheels;
    if (pneuType === 'agro') return agroWheels;
    return [];
  };

  const getMeasureImage = () => {
    if (tipoModel === 'turbo') return '/imagens/lancamento/medidas-turbo.png';
    if (tipoModel === 'v8') return '/imagens/lancamento/medidas-v8.png';
    return '/imagens/lancamento/medidas-roda.png';
  };

  // --- AÇÃO PRINCIPAL ---
  const handleSolicitarOrcamento = async () => {
    setIsProcessing(true);

    // 1. Tira o print e sobe
    let screenshotLink = null;
    if (visualizadorRef.current) {
        const base64Image = visualizadorRef.current.takeScreenshot();
        screenshotLink = await uploadBase64Image(base64Image);
    }

    // 2. TRADUÇÃO DOS NOMES (IMPORTANTE!)
    // O formulário espera "Roda 1", mas aqui o ID é "roda1". Vamos converter.
    let modeloRodaFormatado = '';
    
    if (tipoModel === 'roda') {
        if (pneuType === 'corrida') {
            const mapCorrida = { 'roda1': 'Roda 1', 'roda2': 'Roda 2', 'roda3': 'Roda 3', 'roda4': 'Roda 4', 'roda5': 'Roda 5' };
            modeloRodaFormatado = mapCorrida[rodaModel] || '';
        } else if (pneuType === 'f1') {
            const mapF1 = { 'roda1': 'Roda A', 'roda2': 'Roda B' };
            modeloRodaFormatado = mapF1[rodaModel] || '';
        } else if (pneuType === 'agro') {
            modeloRodaFormatado = 'Roda Agro';
        }
    }

    // 3. Prepara os dados
    const dadosProduto = {
        brinde: tipoModel === 'roda' ? 'Rodabeats' : (tipoModel === 'v8' ? 'Motor V8' : 'Turbo Car'),
        tipoRoda: tipoModel === 'roda' ? (pneuType === 'f1' ? 'F1' : pneuType === 'corrida' ? 'Corrida' : 'Agro') : '',
        modeloRoda: modeloRodaFormatado, // Agora vai o nome certo!
        cor: selectedCor,
        logoFile: selectedLogo, // Manda o arquivo FILE da logo
        screenshotUrl: screenshotLink 
    };

    console.log("Enviando dados:", dadosProduto);

    const evento = new CustomEvent('preencherFormulario', { detail: dadosProduto });
    window.dispatchEvent(evento);

    const formSection = document.getElementById('formulario');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    setIsProcessing(false);
  };

  return (
    <section className="relative w-full bg-[#1E1E1E] py-12 lg:py-20 overflow-hidden border-b border-zinc-800">
      <div className="container mx-auto max-w-7xl px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          <div className="lg:col-span-7 w-full h-[450px] md:h-[600px] bg-[#D1D1D1] rounded-3xl relative shadow-2xl border border-zinc-600 overflow-hidden group">
            <div className="absolute top-0 right-0 bg-yellow-500 text-black font-black px-4 py-2 rounded-bl-2xl z-20 shadow-md tracking-wider text-sm">NOVO</div>
            
            <Visualizador3D 
              ref={visualizadorRef}
              tipo={tipoModel} pneu={pneuType} roda={rodaModel} cor={selectedCor} logo={logoPreview} autoRotate={false} 
            />

            {showMeasures && (
              <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex items-center justify-center p-8 transition-opacity">
                <div className="bg-white p-4 rounded-xl shadow-2xl relative max-w-full max-h-full">
                  <button onClick={() => setShowMeasures(false)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500 font-bold p-2">✕</button>
                  <img src={getMeasureImage()} alt="Medidas" className="max-h-[400px] object-contain" />
                </div>
              </div>
            )}

            <div className="absolute bottom-5 left-5 z-20">
              <button onClick={() => setShowMeasures(!showMeasures)} className={`flex items-center gap-2 px-4 py-3 rounded-full font-bold text-xs uppercase shadow-lg transition-all ${showMeasures ? 'bg-yellow-500 text-black' : 'bg-white/80 hover:bg-white text-black'}`}>
                <RulerIcon /><span>Medidas</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-center space-y-8 animate-fade-in-right pt-4">
            <div><h2 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">Personalize <span className="text-yellow-500">Ao Vivo</span></h2><p className="text-gray-400 text-lg">Selecione o modelo e veja o resultado na hora.</p></div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-1">Escolha o Modelo</h3>
              <div className="grid grid-cols-3 gap-3">
                {mainModels.map((item) => (
                  <button key={item.id} onClick={() => { setTipoModel(item.id); if (item.id === 'roda') { setPneuType('agro'); setRodaModel('roda1'); } }} className={`relative rounded-xl border-2 transition-all duration-300 overflow-hidden flex flex-col items-center justify-center p-1 h-32 group ${tipoModel === item.id ? 'bg-white border-yellow-500 shadow-xl scale-105 opacity-100' : 'bg-white border-zinc-700 hover:border-zinc-500 opacity-60 hover:opacity-100'}`}>
                    {tipoModel === item.id && <CheckmarkIcon />}
                    <div className="flex-1 flex items-center justify-center w-full"><img src={item.img} alt={item.label} className={`w-full h-full object-contain transition-transform duration-500 ${tipoModel === item.id ? 'scale-110' : 'group-hover:scale-105'}`} onError={(e) => {e.target.style.display='none';}} /></div>
                    <span className="text-xs font-bold uppercase mt-1 text-black">{item.label}</span>
                  </button>
                ))}
              </div>
              {tipoModel === 'roda' && (
                <div className="p-5 bg-zinc-900/80 rounded-2xl border border-zinc-800 space-y-5 mt-2 animate-fade-in backdrop-blur-sm">
                   <div><span className="text-xs text-gray-400 font-bold uppercase mb-3 block pl-1">Estilo da Roda</span><div className="grid grid-cols-3 gap-2">{wheelStyles.map((item) => (<button key={item.id} onClick={() => { setPneuType(item.id); setRodaModel('roda1'); }} className={`relative flex flex-col items-center p-2 rounded-xl border-2 transition-all ${pneuType === item.id ? 'bg-white border-yellow-500 shadow-md opacity-100' : 'bg-white border-zinc-500 opacity-60 hover:opacity-100 hover:border-zinc-300'}`}><img src={item.img} alt={item.label} className="w-16 h-16 object-contain mb-1 rounded-md" onError={(e) => {e.target.style.display='none';}} /><span className="text-[10px] font-bold uppercase text-black">{item.label}</span></button>))}</div></div>
                   <div><span className="text-xs text-gray-400 font-bold uppercase mb-3 block pl-1">Opções de Aro</span><div className="grid grid-cols-5 gap-2">{getCurrentWheels().map((item) => (<button key={item.id} onClick={() => setRodaModel(item.id)} className={`relative flex flex-col items-center justify-between p-1 rounded-lg border-2 h-20 transition-all ${rodaModel === item.id ? 'bg-white border-yellow-500 shadow-md scale-105 opacity-100' : 'bg-white border-zinc-500 opacity-60 hover:opacity-100 hover:border-zinc-300'}`}><img src={item.img} alt={item.label} className="w-full h-10 object-contain" onError={(e) => {e.target.style.display='none';}} /><span className="text-[9px] font-bold uppercase text-black leading-tight text-center">{item.label}</span></button>))}</div></div>
                </div>
              )}
            </div>

            <div><h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pl-1">Cor da Base</h3><div className="flex flex-wrap gap-3">{['padrao', 'azul', 'vermelho', 'amarelo', 'verde', 'preto'].map(cor => (<button key={cor} title={cor} onClick={() => setSelectedCor(cor)} className={`h-9 w-9 rounded-full shadow-lg transition-transform hover:scale-110 ${selectedCor === cor ? 'ring-2 ring-offset-2 ring-offset-[#1E1E1E] ring-white scale-110' : 'ring-1 ring-white/10'}`} style={{ backgroundColor: cor === 'padrao' ? '#E0E0E0' : cor === 'azul' ? '#3b82f6' : cor === 'vermelho' ? '#ef4444' : cor === 'amarelo' ? '#eab308' : cor === 'verde' ? '#22c55e' : '#1f2937' }} />))}</div></div>

            <div><h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pl-1">Sua Marca</h3><div className="rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-800/30 p-4 flex items-center justify-between hover:border-[#D1D1D1] hover:bg-zinc-800/50 transition-all group"><div className="flex items-center gap-3"><div className="h-10 w-10 bg-zinc-800 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-zinc-700 transition-colors">{selectedLogo ? '✅' : '📷'}</div><div className="text-sm"><p className="text-gray-200 font-medium truncate max-w-[160px]">{selectedLogo ? selectedLogo.name : 'Envie sua logo'}</p><p className="text-[10px] text-gray-500">Visualização prévia</p></div></div><input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload-hero" /><label htmlFor="logo-upload-hero" className="cursor-pointer px-5 py-2 bg-[#D1D1D1] text-black font-bold rounded-lg hover:bg-white hover:shadow-lg transition-all text-xs uppercase tracking-wide">{selectedLogo ? 'Trocar' : 'Escolher'}</label></div></div>

            <button 
              onClick={handleSolicitarOrcamento}
              disabled={isProcessing}
              className="w-full py-4 bg-green-600 text-white font-black text-lg rounded-xl shadow-lg shadow-green-600/30 hover:bg-green-500 hover:shadow-green-600/50 hover:-translate-y-1 transition-all uppercase tracking-wider flex justify-center items-center gap-2"
            >
              {isProcessing ? 'Gerando Modelo...' : 'Solicitar Orçamento'}
            </button>

          </div>
        </div>
      </div>
    </section>
  );
}