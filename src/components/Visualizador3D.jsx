import React, { Suspense, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, useTexture, Resize, Html, useProgress, Stage, Environment } from '@react-three/drei';
import * as THREE from 'three';

// --- CONFIGURAÇÕES ---
const CORES = {
  padrao: '#d1d5db',
  azul: '#1e3a8a',
  vermelho: '#b91c1c',
  amarelo: '#fbbf24',
  verde: '#15803d',
  preto: '#1a1a1a',
};

// Loader
function Loader() {
  const { active, progress } = useProgress();
  if (!active) return null;
  return (
    <Html center>
      <div className="text-white font-bold bg-black/80 px-4 py-2 rounded border border-yellow-500 flex flex-col items-center">
        <span className="text-xs uppercase tracking-widest mb-1">Carregando</span>
        <span>{progress.toFixed(0)}%</span>
      </div>
    </Html>
  );
}

// Configura Textura
function configurarTextura(textura, rotation, scaleX, scaleY, offsetX, offsetY) {
  if (!textura) return;
  textura.flipY = false;
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.wrapS = THREE.ClampToEdgeWrapping;
  textura.wrapT = THREE.ClampToEdgeWrapping;
  textura.center.set(0.5, 0.5);
  textura.rotation = rotation * (Math.PI / 180);
  textura.repeat.set(1 / scaleX, 1 / scaleY);
  textura.offset.x = (0.5 - (1 / scaleX) / 2) + offsetX;
  textura.offset.y = (0.5 - (1 / scaleY) / 2) + offsetY;
}

// --- MODELOS (Mantenha o código dos seus modelos aqui: Turbo, V8, etc) ---
// (Para economizar espaço, vou resumir, mas NÃO APAGUE os seus modelos completos)
function ModeloTurbo({ cor, logo }) { const { nodes, materials } = useGLTF('/modelos/turbo.glb'); const corHex = CORES[cor] || '#d1d5db'; const imgUrl = logo || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; const texturaLogo = useTexture(imgUrl); configurarTextura(texturaLogo, 0, 2, 0.5, 0, -0.4); return ( <group dispose={null}> {nodes.MeshBody1 && <mesh castShadow receiveShadow geometry={nodes.MeshBody1.geometry}><meshStandardMaterial color="#646464" roughness={0.4} metalness={0.6} /></mesh>} {nodes.base_generica && <mesh castShadow receiveShadow geometry={nodes.base_generica.geometry}><meshStandardMaterial color={corHex} roughness={0.5} metalness={0.1} /></mesh>} {nodes.plaquinha_1 && <mesh castShadow receiveShadow geometry={nodes.plaquinha_1.geometry} material={nodes.plaquinha_1.material || materials['Steel_-_Satin']} />} {nodes.plaquinha_2 && <mesh geometry={nodes.plaquinha_2.geometry}><meshStandardMaterial map={texturaLogo} transparent={true} roughness={0.4} opacity={logo ? 1 : 0} color="white" /></mesh>} </group> ); }
function ModeloV8({ cor, logo }) { const { nodes, materials } = useGLTF('/modelos/v8.glb'); const corHex = CORES[cor] || '#d1d5db'; const imgUrl = logo || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; const texturaLogo = useTexture(imgUrl); configurarTextura(texturaLogo, 0, 2, 0.5, 0, -0.4); return ( <group dispose={null}> {nodes.MeshBody1 && <mesh castShadow receiveShadow geometry={nodes.MeshBody1.geometry}><meshStandardMaterial color="#646464" roughness={0.4} metalness={0.6} /></mesh>} {nodes.base_generica && <mesh castShadow receiveShadow geometry={nodes.base_generica.geometry}><meshStandardMaterial color={corHex} roughness={0.5} metalness={0.1} /></mesh>} {nodes.plaquinha_1 && <mesh castShadow receiveShadow geometry={nodes.plaquinha_1.geometry} material={materials['Steel_-_Satin']} />} {nodes.plaquinha_3 && <mesh castShadow receiveShadow geometry={nodes.plaquinha_3.geometry} material={materials['Steel_-_Satin']} />} {nodes.plaquinha_2 && <mesh geometry={nodes.plaquinha_2.geometry}><meshStandardMaterial map={texturaLogo} transparent={true} roughness={0.4} opacity={logo ? 1 : 0} color="white" /></mesh>} </group> ); }
function ModeloAgro({ cor, logo }) { const { nodes, materials } = useGLTF('/modelos/roda-agro.glb'); const corHex = CORES[cor] || '#d1d5db'; const imgUrl = logo || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; const texturaLogo = useTexture(imgUrl); configurarTextura(texturaLogo, 0, 2, 0.5, 0, -0.4); return ( <group dispose={null}> {nodes.base_generica && <mesh castShadow receiveShadow geometry={nodes.base_generica.geometry}><meshStandardMaterial color={corHex} roughness={0.5} metalness={0.1} /></mesh>} {nodes.calota_de_trator && <mesh castShadow receiveShadow geometry={nodes.calota_de_trator.geometry}><meshStandardMaterial color="#646464" roughness={0.3} metalness={0.7} /></mesh>} {nodes['pneu_de_trator_(3)'] && <mesh castShadow receiveShadow geometry={nodes['pneu_de_trator_(3)'].geometry}><meshStandardMaterial color="#000000" roughness={0.9} /></mesh>} {nodes.plaquinha_1 && <mesh castShadow receiveShadow geometry={nodes.plaquinha_1.geometry} material={materials['Steel_-_Satin']} />} {nodes.plaquinha_3 && <mesh castShadow receiveShadow geometry={nodes.plaquinha_3.geometry} material={materials['Steel_-_Satin']} />} {nodes.plaquinha_2 && <mesh geometry={nodes.plaquinha_2.geometry}><meshStandardMaterial map={texturaLogo} transparent={true} roughness={0.4} opacity={logo ? 1 : 0} color="white" /></mesh>} </group> ); }
function ModeloF1({ cor, logo, roda }) { const arquivo = roda === 'roda2' ? '/modelos/roda-f1-2.glb' : '/modelos/roda-f1-1.glb'; const { nodes, materials } = useGLTF(arquivo); const corHex = CORES[cor] || '#d1d5db'; const imgUrl = logo || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; const texturaLogo = useTexture(imgUrl); configurarTextura(texturaLogo, 0, 2, 0.5, 0, -0.4); return ( <group dispose={null}> {nodes.base_generica && <mesh castShadow receiveShadow geometry={nodes.base_generica.geometry}><meshStandardMaterial color={corHex} roughness={0.5} metalness={0.1} /></mesh>} {nodes.Rim && <mesh castShadow receiveShadow geometry={nodes.Rim.geometry}><meshStandardMaterial color="#646464" roughness={0.3} metalness={0.8} /></mesh>} {nodes['MeshBody1_(2)'] && <mesh castShadow receiveShadow geometry={nodes['MeshBody1_(2)'].geometry}><meshStandardMaterial color="#646464" roughness={0.3} metalness={0.8} /></mesh>} {nodes.pneu_f1 && <mesh castShadow receiveShadow geometry={nodes.pneu_f1.geometry}><meshStandardMaterial color="#000000" roughness={0.8} /></mesh>} {nodes.plaquinha_1 && <mesh castShadow receiveShadow geometry={nodes.plaquinha_1.geometry} material={materials['Steel_-_Satin'] || nodes.plaquinha_1.material} />} {nodes.plaquinha_3 && <mesh castShadow receiveShadow geometry={nodes.plaquinha_3.geometry} material={materials['Steel_-_Satin'] || nodes.plaquinha_3.material} />} {nodes.plaquinha_2 && <mesh geometry={nodes.plaquinha_2.geometry}><meshStandardMaterial map={texturaLogo} transparent={true} roughness={0.4} opacity={logo ? 1 : 0} color="white" /></mesh>} </group> ); }
function ModeloCorrida({ cor, logo, roda }) { let arquivo = '/modelos/roda-corrida-1.glb'; if (roda === 'roda2') arquivo = '/modelos/roda-corrida-2.glb'; if (roda === 'roda3') arquivo = '/modelos/roda-corrida-3.glb'; if (roda === 'roda4') arquivo = '/modelos/roda-corrida-4.glb'; if (roda === 'roda5') arquivo = '/modelos/roda-corrida-5.glb'; const { nodes, materials } = useGLTF(arquivo); const corHex = CORES[cor] || '#d1d5db'; const imgUrl = logo || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; const texturaLogo = useTexture(imgUrl); if (roda === 'roda5') { configurarTextura(texturaLogo, 180, -2, 1, -0.5, -0.5); } else { configurarTextura(texturaLogo, 0, 2, 0.5, 0, -0.4); } return ( <group dispose={null}> {nodes.base_generica && <mesh castShadow receiveShadow geometry={nodes.base_generica.geometry}><meshStandardMaterial color={corHex} roughness={0.5} metalness={0.1} /></mesh>} {nodes['pneu_menor_(1)'] && <mesh castShadow receiveShadow geometry={nodes['pneu_menor_(1)'].geometry}><meshStandardMaterial color="#000000" roughness={0.8} /></mesh>} {roda === 'roda1' && nodes.roda_2 && ( <> <mesh castShadow receiveShadow geometry={nodes.roda_2.geometry}><meshStandardMaterial color="#646464" roughness={0.3} metalness={0.8} /></mesh> {nodes['pinça_de_freio_(1)'] && <mesh castShadow receiveShadow geometry={nodes['pinça_de_freio_(1)'].geometry}><meshStandardMaterial color="#ff0000" roughness={0.4} /></mesh>} {nodes['disco_de_freio_(1)'] && <mesh castShadow receiveShadow geometry={nodes['disco_de_freio_(1)'].geometry}><meshStandardMaterial color="#646464" roughness={0.3} metalness={0.7} /></mesh>} </> )} {['roda2', 'roda3', 'roda4'].includes(roda) && nodes.MeshBody1 && ( <mesh castShadow receiveShadow geometry={nodes.MeshBody1.geometry}><meshStandardMaterial color="#646464" roughness={0.3} metalness={0.8} /></mesh> )} {roda === 'roda5' && ( <> {nodes['MeshBody1_(1)'] && <mesh castShadow receiveShadow geometry={nodes['MeshBody1_(1)'].geometry}><meshStandardMaterial color="#646464" roughness={0.3} metalness={0.8} /></mesh>} {nodes['pinça_de_freio_(1)'] && <mesh castShadow receiveShadow geometry={nodes['pinça_de_freio_(1)'].geometry}><meshStandardMaterial color="#ff0000" roughness={0.4} /></mesh>} {nodes['disco_de_freio_(1)'] && <mesh castShadow receiveShadow geometry={nodes['disco_de_freio_(1)'].geometry}><meshStandardMaterial color="#646464" roughness={0.3} metalness={0.7} /></mesh>} </> )} {roda !== 'roda5' && ( <> {nodes.plaquinha_1 && <mesh castShadow receiveShadow geometry={nodes.plaquinha_1.geometry} material={materials['Steel_-_Satin'] || nodes.plaquinha_1.material} />} {nodes.plaquinha_2 && <mesh geometry={nodes.plaquinha_2.geometry}><meshStandardMaterial map={texturaLogo} transparent={true} roughness={0.4} opacity={logo ? 1 : 0} color="white" /></mesh>} </> )} {roda === 'roda5' && ( <> {nodes.mesh_3 && <mesh castShadow receiveShadow geometry={nodes.mesh_3.geometry}><meshStandardMaterial color="#aaaaaa" roughness={0.3} metalness={0.8} /></mesh>} {nodes.mesh_3_1 && <mesh geometry={nodes.mesh_3_1.geometry}><meshStandardMaterial map={texturaLogo} transparent={true} roughness={0.4} opacity={logo ? 1 : 0} color="white" /></mesh>} </> )} </group> ); }

function ModelManager({ tipo, pneu, roda, cor, logo }) {
  if (tipo === 'turbo') return <ModeloTurbo cor={cor} logo={logo} />;
  if (tipo === 'v8') return <ModeloV8 cor={cor} logo={logo} />;
  if (tipo === 'roda') {
    if (pneu === 'agro') return <ModeloAgro cor={cor} logo={logo} />;
    if (pneu === 'f1') return <ModeloF1 cor={cor} logo={logo} roda={roda} />;
    if (pneu === 'corrida') return <ModeloCorrida cor={cor} logo={logo} roda={roda} />;
  }
  return null;
}

// --- CAPTURA DE TELA ---
// Este componente acessa o contexto Three.js e expõe a função de tirar print
const SceneCapture = forwardRef((props, ref) => {
  const { gl } = useThree();
  
  useImperativeHandle(ref, () => ({
    takeScreenshot: () => {
      // Pega o que está desenhado no Canvas agora
      return gl.domElement.toDataURL('image/png');
    }
  }));
  return null;
});

// --- CENA PRINCIPAL ---
const Visualizador3D = forwardRef(({ tipo, pneu, roda, cor, logo, autoRotate }, ref) => {
  return (
    <div className="w-full h-full bg-[#D1D1D1] relative overflow-hidden rounded-xl">
      <Canvas 
        shadows 
        dpr={[1, 2]} 
        camera={{ position: [4, 4, 4], fov: 50 }}
        // IMPORTANTE: Permite tirar o print
        gl={{ preserveDrawingBuffer: true }} 
      >
        <SceneCapture ref={ref} />
        
        <Suspense fallback={<Loader />}>
           <Stage environment={null} intensity={0.6} adjustCamera>
              <Resize scale={3}>
                 <ModelManager tipo={tipo} pneu={pneu} roda={roda} cor={cor} logo={logo} />
              </Resize>
           </Stage>
           
           <Environment files="/texturas/estudio.hdr" />
           <OrbitControls makeDefault autoRotate={autoRotate} />
        </Suspense>
      </Canvas>
      <div className="absolute bottom-4 w-full text-center pointer-events-none">
        <p className="text-black/40 text-[10px] uppercase tracking-widest bg-white/30 px-2 py-1 rounded inline-block">
          Visualização 3D Interativa
        </p>
      </div>
    </div>
  );
});

export default Visualizador3D;