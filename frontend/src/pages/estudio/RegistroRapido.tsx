import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RegistroRapido() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    instagram: '',
    rubro: 'restaurante',
    acepta: false
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acepta) return;

    setLoading(true);
    // Simulación de guardado en Supabase -> 'estudio_registros'
    setTimeout(() => {
      setLoading(false);
      // Pasa el registro id ficticio
      navigate('/preparacion', { state: { registroId: 'uuid-1234' } });
    }, 1000);
  };

  const handleInstagramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val && !val.startsWith('@')) val = '@' + val;
    setFormData({ ...formData, instagram: val });
  };

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] flex flex-col items-center justify-center p-6 relative">
      <div className="max-w-md w-full" style={{ animation: 'foru-focus-step-in 0.4s ease-out' }}>
        
        <button onClick={() => navigate(-1)} className="mb-6 w-10 h-10 bg-[rgba(250,250,250,0.8)] backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm border border-[rgba(212,212,212,0.4)]">
          <span className="text-xl font-bold">←</span>
        </button>

        <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--color-texto)', fontFamily: 'var(--font-titulos)' }}>
          Empecemos tu ruta
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--color-texto-suave)' }}>
          Cuéntanos un poco sobre ti para preparar tu asesoría.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold px-1" style={{ color: 'var(--color-texto-suave)' }}>Tu Nombre</label>
            <input 
              required
              type="text" 
              placeholder="Ej. Camila"
              value={formData.nombre}
              onChange={e => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full border border-[rgba(212,212,212,0.2)] rounded-2xl p-4 bg-[rgba(250,250,250,0.86)] focus:outline-none focus:border-black transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold px-1" style={{ color: 'var(--color-texto-suave)' }}>Tu Correo (para enviarte el acceso)</label>
            <input 
              required
              type="email" 
              placeholder="camila@ejemplo.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-[rgba(212,212,212,0.2)] rounded-2xl p-4 bg-[rgba(250,250,250,0.86)] focus:outline-none focus:border-black transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold px-1" style={{ color: 'var(--color-texto-suave)' }}>Instagram de tu negocio</label>
            <input 
              required
              type="text" 
              placeholder="@mioboutique"
              value={formData.instagram}
              onChange={handleInstagramChange}
              className="w-full border border-[rgba(212,212,212,0.2)] rounded-2xl p-4 bg-[rgba(250,250,250,0.86)] focus:outline-none focus:border-black transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold px-1" style={{ color: 'var(--color-texto-suave)' }}>Rubro principal</label>
            <select 
              value={formData.rubro}
              onChange={e => setFormData({ ...formData, rubro: e.target.value })}
              className="w-full border border-[rgba(212,212,212,0.2)] rounded-2xl p-4 bg-[rgba(250,250,250,0.86)] focus:outline-none focus:border-black transition-colors appearance-none font-medium"
            >
              <option value="restaurante">Restaurante</option>
              <option value="cafeteria">Cafetería</option>
              <option value="tienda">Tienda / Retail</option>
              <option value="turismo">Turismo / Experiencias</option>
              <option value="cursos">Cursos / Infoproductos</option>
              <option value="hospedaje">Hospedaje</option>
            </select>
          </div>

          <label className="flex items-start gap-3 mt-4 cursor-pointer">
            <input 
              required
              type="checkbox" 
              checked={formData.acepta}
              onChange={e => setFormData({ ...formData, acepta: e.target.checked })}
              className="mt-1 w-5 h-5 accent-black rounded border-gray-300"
            />
            <span className="text-xs leading-snug" style={{ color: 'var(--color-texto-suave)' }}>
              Acepto que FOR U cree mi sesión automáticamente y acepto los términos de la asesoría.
            </span>
          </label>

          <button 
            type="submit"
            disabled={loading || !formData.acepta}
            className={`mt-4 magic-button magic-button-primary w-full py-4 text-lg font-bold rounded-2xl transition-all ${(!formData.acepta || loading) ? 'opacity-50 cursor-not-allowed' : 'shadow-xl hover:-translate-y-1'}`}
          >
            {loading ? 'Preparando...' : 'Continuar ✨'}
          </button>
        </form>
      </div>
    </div>
  );
}
