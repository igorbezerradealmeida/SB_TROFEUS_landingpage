import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Carrossel isolado e memoizado:
 * - Evita re-render dos outros cards quando 1 muda
 * - Slide orgânico sem "voltar" no fim
 */
const Carrossel = React.memo(function Carrossel({
  categoria,
  titulo,
  lista,
  indiceAtual,
  onTrocar,
  autoplayMs = 8000,
  animMs = 520,
}) {
  // base travada (não depende do indiceAtual durante animação)
  const [baseIndex, setBaseIndex] = useState(indiceAtual);
  const [overlayIndex, setOverlayIndex] = useState(null);

  const [animDir, setAnimDir] = useState(null); // "next" | "prev" | null
  const [phase, setPhase] = useState(0); // 0 parado, 1 preparando, 2 animando

  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);

  // se o índice global mudar e NÃO estiver animando, sincroniza a base
  useEffect(() => {
    if (phase === 0) setBaseIndex(indiceAtual);
  }, [indiceAtual, phase]);

  const computeIndex = useCallback(
    (from, dir) => {
      if (!lista?.length) return 0;
      if (dir === "next") return (from + 1) % lista.length;
      return (from - 1 + lista.length) % lista.length;
    },
    [lista]
  );

  const start = useCallback(
    (dir) => {
      if (!lista || lista.length <= 1) return;
      if (phase !== 0) return;

      const ni = computeIndex(baseIndex, dir);

      // pré-carrega a próxima (reduz chance de flash)
      const preload = new Image();
      preload.src = lista[ni].img;

      setAnimDir(dir);
      setOverlayIndex(ni);
      setPhase(1);

      // garante que o browser aplique o estado inicial antes de animar
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setPhase(2));
      });

      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        // fixa a nova imagem como base (assim não "volta")
        setBaseIndex(ni);

        // limpa overlay/estado de animação
        setOverlayIndex(null);
        setPhase(0);
        setAnimDir(null);

        // atualiza o estado global (mantém seu contador real)
        onTrocar(dir === "next" ? +1 : -1);
      }, animMs);
    },
    [animMs, baseIndex, computeIndex, lista, onTrocar, phase]
  );

  // autoplay estável: 1 interval por carrossel
  useEffect(() => {
    if (!lista || lista.length <= 1) return;

    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (phase === 0) start("next");
    }, autoplayMs);

    return () => clearInterval(intervalRef.current);
  }, [autoplayMs, lista, phase, start]);

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
      clearInterval(intervalRef.current);
    };
  }, []);

  const baseSrc = lista[baseIndex]?.img;
  const overlaySrc = overlayIndex != null ? lista[overlayIndex]?.img : null;

  return (
    <div className="categoria" data-categoria={categoria}>
      <div className="categoria-titulo">{titulo}</div>

      <div className={`carrossel-container ${phase === 2 ? "is-animating" : ""}`}>
        {/* camada BASE (travada) */}
        <img
          src={baseSrc}
          alt={titulo}
          className={[
            "carrossel-img",
            "carrossel-layer",
            phase === 2 && animDir === "next" ? "slide-out-left" : "",
            phase === 2 && animDir === "prev" ? "slide-out-right" : "",
          ].join(" ")}
          decoding="async"
          draggable={false}
        />

        {/* camada OVERLAY (entra e vira base no fim) */}
        {overlaySrc && (
          <img
            src={overlaySrc}
            alt={titulo}
            className={[
              "carrossel-img",
              "carrossel-layer",
              phase === 1 && animDir === "next" ? "from-right" : "",
              phase === 1 && animDir === "prev" ? "from-left" : "",
              phase === 2 && animDir === "next" ? "to-center-from-right" : "",
              phase === 2 && animDir === "prev" ? "to-center-from-left" : "",

            ].join(" ")}
            decoding="async"
            draggable={false}
          />
        )}

        <button className="seta seta-prev" onClick={() => start("prev")} aria-label="Anterior">
          ‹
        </button>
        <button className="seta seta-next" onClick={() => start("next")} aria-label="Próximo">
          ›
        </button>
      </div>
    </div>
  );
});

const ProdutosCarrossel = () => {
  const produtos = useMemo(
    () => ({
      bones: [
        { img: "/imagens/trofeus/TORNEIO_ALPHA_OPEN.jpg" },
        { img: "/imagens/trofeus/TROFEU_CORRIDA.jpg" },
        { img: "/imagens/trofeus/CAMPEONATO_OPEN_TENNIS_CARBONE.jpg" },
        { img: "/imagens/trofeus/CORRIDA_QUATRO5.jpg" },
        { img: "/imagens/trofeus/TROFEU_BEACH_TENNIS.jpg" },
      ],
      canetas: [
        { img: "/imagens/trofeus/CONFRATERNIZACAO_DE_EMPRESA.jpg" },
        { img: "/imagens/trofeus/franquia_destaque.jpg" },
      ],
      garrafasTerm: [
        { img: "/imagens/trofeus/trofeu-exercito.jpg" },
        { img: "/imagens/trofeus/FORMAÇÃO DE ALUNOS DO EXÉRCITO.JPG" },
      ],
      garrafasAlum: [{ img: "/imagens/trofeus/COMEMORAÇÃO_DE_100K_DE_FATURAMENTO.jpg" }],
      coposTerm: [
        { img: "/imagens/trofeus/LOGO_3D_PARA_MESA.jpg" },
        { img: "/imagens/trofeus/logo3d.jpg" },
      ],
      garrafasPlast: [
        { img: "/imagens/trofeus/RODA_BEATS.jpg" },
        { img: "/imagens/trofeus/CADEIRA_SUPORTE.jpg" },
        { img: "/imagens/trofeus/TROFEU_PERSONALIZADO_SESI.jpg" },
        { img: "/imagens/trofeus/TROFEU_SOM_DA_MATA.jpg" },
      ],
    }),
    []
  );

  const [estado, setEstado] = useState({
    bones: 0,
    canetas: 0,
    garrafasTerm: 0,
    garrafasAlum: 0,
    coposTerm: 0,
    garrafasPlast: 0,
  });

  const trocarProduto = useCallback(
    (categoria, direcao) => {
      setEstado((prev) => {
        const lista = produtos[categoria];
        let novoIndice = prev[categoria] + direcao;

        if (novoIndice >= lista.length) novoIndice = 0;
        else if (novoIndice < 0) novoIndice = lista.length - 1;

        if (novoIndice === prev[categoria]) return prev;
        return { ...prev, [categoria]: novoIndice };
      });
    },
    [produtos]
  );

  return (
    <section className="produtos-section">
      <style>{`
        .produtos-section {
          background: #1a1a1a;
          color: #ffffff;
          padding: 60px 20px;
          width: 100%;
          box-sizing: border-box;
        }

        .produtos-container {
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        .grid-carrosseis {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 40px;
          width: 100%;
          align-items: start;
        }

        .categoria {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          align-items: center;
        }

        .categoria-titulo {
          background: linear-gradient(135deg, #FAB800 0%, #F59E0B 100%);
          color: #1a1a1a;
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 900;
          font-size: 20px;
          text-align: center;
          display: inline-block;
          margin: 0;
          white-space: nowrap;
        }

        .carrossel-container {
          background: #FAB800;
          border-radius: 16px;
          padding: 20px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 280px;
          overflow: hidden;
        }

        .carrossel-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          width: 100%;
          height: 100%;
          user-select: none;
          -webkit-user-drag: none;
          backface-visibility: hidden;
          transform: translateZ(0);
        }

        .carrossel-layer {
        position: absolute;
        inset: 0;
        transform: translateX(0);
        will-change: transform;
        }

        .carrossel-container.is-animating .carrossel-layer {
        transition: transform 520ms cubic-bezier(0.22, 0.61, 0.36, 1);
        }

        .from-right { transform: translateX(110%); }
        .from-left { transform: translateX(-110%); }
        .to-center-from-right { transform: translateX(0); }
        .to-center-from-left  { transform: translateX(0); }


        .slide-out-left { transform: translateX(-110%); }
        .slide-out-right { transform: translateX(110%); }

        .seta {
          position: absolute;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.8);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: #1a1a1a;
          transition: all 0.3s ease;
          font-weight: bold;
          z-index: 10;
          flex-shrink: 0;
        }

        .seta:hover {
          background: rgba(255, 255, 255, 0.95);
          transform: scale(1.1);
        }

        .seta-prev { left: 10px; }
        .seta-next { right: 10px; }

        .botao-container {
          grid-column: 1 / -1;
          display: flex;
          justify-content: center;
          width: 100%;
          margin-top: 20px;
        }

        .btn-orcamento {
          display: inline-block;
          padding: 16px 40px;
          background-color: #16a34a;
          color: #ffffff;
          border: 2px solid #16a34a;
          font-size: 20px;
          font-weight: 900;
          border-radius: 50px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          box-shadow: 0 10px 25px rgba(22, 163, 74, 0.2);
          transition: all 0.3s ease;
          text-decoration: none;
          cursor: pointer;
        }

        .btn-orcamento:hover {
          background-color: #15803d;
          color: #ffffff;
          box-shadow: 0 15px 35px rgba(22, 163, 74, 0.5);
          transform: translateY(-4px);
        }

        @media (max-width: 1024px) {
          .grid-carrosseis { gap: 30px; }
          .carrossel-container { height: 240px; }
          .categoria-titulo { font-size: 18px; padding: 10px 20px; }
          .btn-orcamento { padding: 14px 35px; font-size: 18px; }
        }

        @media (max-width: 768px) {
          .grid-carrosseis { gap: 20px; }
          .carrossel-container { height: 200px; }
          .categoria-titulo { font-size: 15px; padding: 8px 16px; }
          .seta { width: 36px; height: 36px; font-size: 18px; }
          .btn-orcamento { padding: 12px 30px; font-size: 16px; }
        }

        @media (max-width: 480px) {
          .grid-carrosseis {
              grid-template-columns: 1fr;
            }
          .carrossel-container { height: 160px; padding: 15px; }
          .categoria-titulo { font-size: 13px; padding: 6px 12px; }
          .seta { width: 32px; height: 32px; font-size: 16px; }
          .btn-orcamento { padding: 10px 25px; font-size: 14px; }
        }
      `}</style>

      <div className="produtos-container">
        <div className="grid-carrosseis">
          <Carrossel
            categoria="bones"
            titulo="Troféus esportivos"
            lista={produtos.bones}
            indiceAtual={estado.bones}
            onTrocar={(dir) => trocarProduto("bones", dir)}
          />

          <Carrossel
            categoria="canetas"
            titulo="Troféus corporativos"
            lista={produtos.canetas}
            indiceAtual={estado.canetas}
            onTrocar={(dir) => trocarProduto("canetas", dir)}
          />

          <Carrossel
            categoria="garrafasTerm"
            titulo="Troféus acadêmicos"
            lista={produtos.garrafasTerm}
            indiceAtual={estado.garrafasTerm}
            onTrocar={(dir) => trocarProduto("garrafasTerm", dir)}
          />

          <Carrossel
            categoria="garrafasAlum"
            titulo="Troféus de reconhecimento pessoal"
            lista={produtos.garrafasAlum}
            indiceAtual={estado.garrafasAlum}
            onTrocar={(dir) => trocarProduto("garrafasAlum", dir)}
          />

          <Carrossel
            categoria="coposTerm"
            titulo="Troféus Logos 3D"
            lista={produtos.coposTerm}
            indiceAtual={estado.coposTerm}
            onTrocar={(dir) => trocarProduto("coposTerm", dir)}
          />

          <Carrossel
            categoria="garrafasPlast"
            titulo="Troféus personalizados"
            lista={produtos.garrafasPlast}
            indiceAtual={estado.garrafasPlast}
            onTrocar={(dir) => trocarProduto("garrafasPlast", dir)}
          />

          <div className="botao-container">
            <a href="#formulario" className="btn-orcamento">
              Solicitar Orçamento
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProdutosCarrossel;
