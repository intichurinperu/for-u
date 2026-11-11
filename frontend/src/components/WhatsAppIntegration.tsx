import { Input as DSInput } from './ui/DesignSystem';
import { type FormEvent, useEffect, useState } from 'react';
import MagicBadge from './ui/MagicBadge';
import MagicButton from './ui/MagicButton';
import MagicCard from './ui/MagicCard';
import GradientText from './ui/GradientText';
import { useActiveProjectsStore } from '../stores/useActiveProjectsStore';

const sandboxNumber = import.meta.env.VITE_TWILIO_WHATSAPP_SANDBOX_NUMBER || '+1 415 523 8886';

export default function WhatsAppIntegration() {
  const storedNumber = useActiveProjectsStore((state) => state.whatsappNumber);
  const storedEnabled = useActiveProjectsStore((state) => state.whatsappEnabled);
  const updateWhatsappSettings = useActiveProjectsStore((state) => state.updateWhatsappSettings);
  const [whatsappNumber, setWhatsappNumber] = useState(storedNumber);
  const [whatsappEnabled, setWhatsappEnabled] = useState(storedEnabled);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setWhatsappNumber(storedNumber);
    setWhatsappEnabled(storedEnabled);
  }, [storedEnabled, storedNumber]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus('');

    const saved = await updateWhatsappSettings({ whatsappNumber, whatsappEnabled });
    setStatus(saved ? 'Listo. WhatsApp quedó conectado a For U ✨' : 'No pude guardar el número. Revisa Supabase y vuelve a intentar.');
    setSaving(false);
  }

  return (
    <section className="foru-whatsapp-connect">
      <MagicCard className="foru-whatsapp-card">
        <MagicBadge>WhatsApp MVP</MagicBadge>
        <h1><GradientText>For U por WhatsApp</GradientText></h1>
        <p>
          Para el MVP usamos Twilio Sandbox. WhatsApp no mostrará botones nativos todavía,
          así que For U enviará opciones numeradas: 1, 2, 3.
        </p>

        <form className="foru-auth-form" onSubmit={handleSubmit}>
          <label>
            Tu número de WhatsApp
            <DSInput
              type="tel"
              value={whatsappNumber}
              onChange={(event) => setWhatsappNumber(event.target.value)}
              placeholder="+51 999 999 999"
            />
          </label>

          <label className="foru-whatsapp-toggle">
            <DSInput
              type="checkbox"
              checked={whatsappEnabled}
              onChange={(event) => setWhatsappEnabled(event.target.checked)}
            />
            Activar mensajes de For U por WhatsApp
          </label>

          <MagicButton type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar conexión'}
          </MagicButton>
        </form>

        {status ? <p className="foru-whatsapp-status">{status}</p> : null}
      </MagicCard>

      <MagicCard className="foru-whatsapp-card is-steps">
        <h2>Flujo conversacional</h2>
        <ol>
          <li>El usuario escribe “hola” y For U muestra el menú principal.</li>
          <li>Elige con números: 1 para ideas, 2 para próxima acción, 3 para proyectos.</li>
          <li>For U recuerda el estado de la conversación con <code>whatsapp_sessions</code>.</li>
        </ol>

        <div className="foru-whatsapp-commands">
          <h3>Comandos rápidos</h3>
          <span><strong>hola</strong> → menú principal</span>
          <span><strong>idea taller de velas</strong> → guarda idea directa</span>
          <span><strong>próxima</strong> → muestra la acción actual</span>
          <span><strong>completé</strong> → cierra tarea y suma monedas</span>
          <span><strong>proyectos</strong> → lista proyectos activos</span>
        </div>

        <p>
          Número Sandbox: <strong>{sandboxNumber}</strong><br />
          Webhook Twilio: <code>/api/whatsapp/webhook</code>
        </p>
      </MagicCard>
    </section>
  );
}
