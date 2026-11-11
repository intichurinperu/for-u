import { useState, useRef, useEffect } from 'react';
import { AGENTS } from '../lib/agentPersonalities';
import { MARKETING_FLOW, type ConversationStep } from '../lib/ConversationFlow';
import { sendForUChatMessage } from '../lib/gemini';

interface PizarraItem {
  id: string;
  type: 'nota' | 'audio' | 'foto' | 'link';
  content: string;
  timestamp: number;
}

interface PizarraAgentProps {
  area: 'marketing' | 'finanzas' | 'logistica' | 'operaciones';
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PizarraAgent({ area, userName, isOpen, onClose }: PizarraAgentProps) {
  const agent = AGENTS[area];
  const flow = area === 'marketing' ? MARKETING_FLOW : [];
  
  const [stepIndex, setStepIndex] = useState(0);
  const [pizarra, setPizarra] = useState<PizarraItem[]>([]);
  const [nuevaNota, setNuevaNota] = useState('');
  const [resumenIA, setResumenIA] = useState<string | null>(null);
  const [procesandoIA, setProcesandoIA] = useState(false);
  const [mostrarResumen, setMostrarResumen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const pasoActual = flow[stepIndex];
  const esUltimoPaso = stepIndex === flow.length - 1;
  const totalPasos = flow.length;
  const progreso = totalPasos > 0 ? ((stepIndex) / totalPasos) * 100 : 0;

  // Auto-focus al textarea cuando cambia el paso
  useEffect(() => {
    if (isOpen && pasoActual && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [stepIndex, isOpen]);

  const agregarNota = () => {
    if (!nuevaNota.trim()) return;
    const item: PizarraItem = {
      id: Date.now().toString(),
      type: 'nota',
      content: nuevaNota.trim(),
      timestamp: Date.now()
    };
    setPizarra(prev => [...prev, item]);
    setNuevaNota('');
  };

  const eliminarItem = (id: string) => {
    setPizarra(prev => prev.filter(item => item.id !== id));
  };

  const organizarConIA = async () => {
    if (pizarra.length === 0) return;
    setProcesandoIA(true);
    
    try {
      const contenidoPizarra = pizarra
        .map(item => `[${item.type.toUpperCase()}] ${item.content}`)
        .join('\n');
      
      const promptParaIA = `Eres ${agent.name}, guía de ${agent.area}. El usuario está respondiendo a esta pregunta: "${pasoActual.question}". Sus ideas desordenadas son:\n\n${contenidoPizarra}\n\nPor favor: 1) Haz un resumen claro y cálido de lo que compartió. 2) Identifica 2-3 pasos concretos y accionables que puede dar ahora. 3) Si falta información importante, haz 1 pregunta breve para completar. Responde en español, tono cercano, máximo 150 palabras.`;
      
      const respuesta = await sendForUChatMessage([
        { role: 'user', text: promptParaIA }
      ]);
      
      setResumenIA(respuesta);
      setMostrarResumen(true);
    } catch (error) {
      setResumenIA('Tuve un problema técnico, pero tus ideas están guardadas. ¿Intentamos de nuevo?');
      setMostrarResumen(true);
    } finally {
      setProcesandoIA(false);
    }
  };

  const avanzarPaso = () => {
    // Guardar resumen en el paso actual (aquí luego conectamos Supabase)
    setPizarra([]);
    setResumenIA(null);
    setMostrarResumen(false);
    
    if (esUltimoPaso) {
      // Último paso completado
      setMostrarResumen(false);
    } else {
      setStepIndex(stepIndex + 1);
    }
  };

  const saltarPaso = () => {
    if (esUltimoPaso) {
      onClose();
    } else {
      setPizarra([]);
      setResumenIA(null);
      setMostrarResumen(false);
      setStepIndex(stepIndex + 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" style={{ background: 'rgba(10, 10, 10, 0.4)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" style={{ background: 'var(--color-superficie)', borderRadius: '32px', boxShadow: 'var(--sombra-magica)', border: '1px solid rgba(212, 212, 212, 0.76)' }}>
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-8 py-5" style={{ borderBottom: '1px solid rgba(212, 212, 212, 0.76)', background: 'var(--gradient-fondo)' }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-3xl animate-float" style={{ background: 'var(--gradient-iridiscente)', boxShadow: 'var(--sombra-suave)' }}>
              {agent.emoji}
            </div>
            <div>
              <h3 className="text-xl font-bold m-0" style={{ color: 'var(--color-texto)', fontFamily: 'var(--font-titulos)' }}>{agent.name}</h3>
              <p className="text-xs m-0" style={{ color: 'var(--color-texto-suave)' }}>Paso {stepIndex + 1} de {totalPasos} · {agent.area}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ background: 'rgba(212, 212, 212, 0.16)', border: '0', cursor: 'pointer', color: 'var(--color-texto)' }}>×</button>
        </div>

        {/* BARRA DE PROGRESO */}
        <div className="px-8 pt-4" style={{ background: 'var(--gradient-fondo)' }}>
          <div className="flex items-center gap-3 mb-2">
            {flow.map((_, i) => (
              <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(212, 212, 212, 0.3)' }}>
                <div className="h-full rounded-full" style={{ 
                  width: i < stepIndex ? '100%' : i === stepIndex ? '50%' : '0%', 
                  background: 'var(--gradient-iridiscente)',
                  transition: 'width 0.5s ease'
                }} />
              </div>
            ))}
          </div>
        </div>

        {/* PREGUNTA ACTUAL */}
        <div className="px-8 py-6" style={{ background: 'var(--gradient-fondo)' }}>
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-3" style={{ background: 'rgba(250, 250, 250, 0.62)', color: 'var(--color-texto)', border: '1px solid rgba(212, 212, 212, 0.72)' }}>
            💭 PREGUNTA DE {agent.name.toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold m-0 leading-tight" style={{ color: 'var(--color-texto)', fontFamily: 'var(--font-titulos)' }}>
            {pasoActual?.question}
          </h2>
          {pasoActual?.hint && (
            <p className="text-sm mt-3 m-0" style={{ color: 'var(--color-texto-suave)' }}>
              💡 {pasoActual.hint}
            </p>
          )}
        </div>

        {/* CONTENIDO SCROLLEABLE */}
        <div className="flex-1 overflow-y-auto px-8 py-6" style={{ background: 'var(--color-fondo)' }}>
          
          {/* PIZARRA: Ideas desordenadas */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold m-0" style={{ color: 'var(--color-texto)' }}> TU PIZARRA</h4>
              <span className="text-xs" style={{ color: 'var(--color-texto-suave)' }}>{pizarra.length} ideas</span>
            </div>
            
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
              {pizarra.map(item => (
                <div key={item.id} className="relative p-4 rounded-2xl" style={{ background: 'rgba(250, 250, 250, 0.86)', border: '1px solid rgba(212, 212, 212, 0.72)', boxShadow: 'var(--sombra-suave)' }}>
                  <button 
                    onClick={() => eliminarItem(item.id)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                    style={{ background: 'rgba(212, 212, 212, 0.5)', border: '0', cursor: 'pointer', color: 'var(--color-texto)' }}
                  >×</button>
                  <div className="text-xs font-bold mb-1" style={{ color: 'var(--color-texto-suave)' }}>
                    {item.type === 'nota' ? '📝' : item.type === 'audio' ? '🎤' : item.type === 'foto' ? '📸' : '🔗'} {item.type.toUpperCase()}
                  </div>
                  <p className="text-sm m-0" style={{ color: 'var(--color-texto)', lineHeight: 1.5 }}>{item.content}</p>
                </div>
              ))}
              
              {pizarra.length === 0 && (
                <div className="col-span-full text-center py-8 rounded-2xl" style={{ border: '2px dashed rgba(212, 212, 212, 0.72)', color: 'var(--color-texto-suave)' }}>
                  <div className="text-3xl mb-2">🌱</div>
                  <p className="text-sm m-0">Tu pizarra está vacía. Agrega ideas abajo.</p>
                </div>
              )}
            </div>
          </div>

          {/* RESUMEN IA (aparece después de organizar) */}
          {mostrarResumen && resumenIA && (
            <div className="mb-6 p-6 rounded-2xl" style={{ background: 'var(--gradient-iridiscente)', border: '1px solid rgba(212, 212, 212, 0.76)', boxShadow: 'var(--sombra-media)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{agent.emoji}</span>
                <h4 className="text-sm font-bold m-0" style={{ color: 'var(--color-texto)' }}>{agent.name} organizó tus ideas:</h4>
              </div>
              <p className="text-sm m-0" style={{ color: 'var(--color-texto)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{resumenIA}</p>
            </div>
          )}

          {/* ACCIONES CONTEXTUALES */}
          {pasoActual?.contextualActions && pizarra.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-bold mb-3" style={{ color: 'var(--color-texto)' }}>✨ ACCIONES SUGERIDAS</h4>
              <div className="flex flex-wrap gap-2">
                {pasoActual.contextualActions.map((action, i) => (
                  <button key={i} className="px-4 py-2 rounded-full text-xs font-bold" style={{ background: 'rgba(250, 250, 250, 0.86)', border: '1px solid rgba(212, 212, 212, 0.72)', color: 'var(--color-texto)', cursor: 'pointer' }}>
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* INPUT PARA AGREGAR IDEAS */}
        <div className="px-8 py-4" style={{ borderTop: '1px solid rgba(212, 212, 212, 0.76)', background: 'var(--color-superficie)' }}>
          <div className="flex gap-2 mb-3">
            <textarea
              ref={textareaRef}
              value={nuevaNota}
              onChange={(e) => setNuevaNota(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); agregarNota(); } }}
              placeholder={pasoActual?.placeholder || 'Escribe una idea...'}
              className="flex-1 p-3 text-sm"
              style={{ 
                border: '1px solid rgba(212, 212, 212, 0.72)', 
                borderRadius: '16px', 
                background: 'rgba(250, 250, 250, 0.86)', 
                color: 'var(--color-texto)',
                fontFamily: 'inherit',
                resize: 'none',
                minHeight: '60px',
                outline: 'none'
              }}
            />
            <button 
              onClick={agregarNota}
              className="px-5 py-3 rounded-full font-bold text-sm"
              style={{ 
                background: 'var(--gradient-iridiscente)', 
                color: 'var(--color-texto)', 
                border: '0', 
                cursor: 'pointer',
                boxShadow: 'var(--sombra-suave)'
              }}
            >+ Agregar</button>
          </div>
          
          {/* BOTONES DE ACCIÓN */}
          <div className="flex gap-2 justify-between items-center">
            <button 
              onClick={saltarPaso}
              className="px-4 py-2 rounded-full text-xs font-bold"
              style={{ background: 'transparent', border: '1px solid rgba(212, 212, 212, 0.72)', color: 'var(--color-texto-suave)', cursor: 'pointer' }}
            >
              ⏭️ Saltar
            </button>
            
            <div className="flex gap-2">
              <button 
                onClick={organizarConIA}
                disabled={pizarra.length === 0 || procesandoIA}
                className="px-5 py-2.5 rounded-full text-sm font-bold"
                style={{ 
                  background: pizarra.length === 0 ? 'rgba(212, 212, 212, 0.3)' : 'var(--gradient-iridiscente)',
                  color: 'var(--color-texto)',
                  border: '0',
                  cursor: pizarra.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: pizarra.length === 0 ? 0.5 : 1,
                  boxShadow: 'var(--sombra-suave)'
                }}
              >
                {procesandoIA ? ' Organizando...' : '✨ Organizar con IA'}
              </button>
              
              {mostrarResumen && (
                <button 
                  onClick={avanzarPaso}
                  className="px-5 py-2.5 rounded-full text-sm font-bold"
                  style={{ 
                    background: 'var(--color-texto)', 
                    color: 'var(--color-fondo)',
                    border: '0',
                    cursor: 'pointer',
                    boxShadow: 'var(--sombra-media)'
                  }}
                >
                  {esUltimoPaso ? '🚀 ¡Terminar!' : 'Siguiente paso →'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
