import { ButtonSecondary as DSButtonSecondary, Input as DSInput } from './ui/DesignSystem';
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MagicBadge from "./ui/MagicBadge";
import MagicButton from "./ui/MagicButton";
import MagicCard from "./ui/MagicCard";
import { businessTemplates } from "../data/templates";
import type { ForUIndustryKey } from "../templates/industryTemplates";

export type IndustryOnboardingInput = {
  industryKey: ForUIndustryKey;
  projectName: string;
  objective: "ventas" | "reservas" | "clientes" | "marca";
  offerType: string;
  location: string;
  idealTraveler: string;
  primaryChannel: string;
  assets: string[];
};

type IndustryOnboardingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreateIndustryProject: (input: IndustryOnboardingInput) => void;
};

const industryOptions = [
  ...businessTemplates.map((template) => ({
    key: template.key,
    title: template.name,
    description: template.entry,
    enabled: true,
  })),
  {
    key: "tourism",
    title: "Turismo / experiencias",
    description: "Experiencias locales y reservas por WhatsApp.",
    enabled: true,
  },
];

const objectiveOptions = [
  {
    key: "ventas",
    title: "Vender más",
    description: "Crear una ruta para convertir interés en compras.",
  },
  {
    key: "reservas",
    title: "Conseguir reservas",
    description: "Ordenar disponibilidad, confianza y WhatsApp.",
  },
  {
    key: "clientes",
    title: "Conseguir clientes",
    description: "Atraer personas correctas y guiarlas al contacto.",
  },
  {
    key: "marca",
    title: "Ordenar mi marca",
    description: "Claridad, contenido y presencia digital consistente.",
  },
] as const;

const legacyCopy = {
  tourism: {
    badge: "Turismo",
    title: "Armemos la base turística",
    intro:
      "Responde lo mínimo. Con esto For U crea ruta, tareas y próximas acciones específicas.",
    defaultProjectName: "Sistema turismo experiencial",
    offerLabel: "¿Qué vendes?",
    offerPlaceholder:
      "Ej: tours, hospedaje, retiro, caminata, experiencia cultural",
    locationLabel: "¿Dónde ocurre?",
    locationPlaceholder: "Ej: Cusco, Churín, Valle Sagrado",
    customerLabel: "¿Quién compra?",
    customerPlaceholder:
      "Ej: turistas extranjeros, parejas, familias, viajeros espirituales",
    submit: "Crear estrategia turística",
    assets: [
      "Fotos",
      "Testimonios",
      "Precios",
      "Calendario",
      "Instagram",
      "Web",
      "WhatsApp",
    ],
  },
  gastronomy: {
    badge: "Gastronomía",
    title: "Armemos la base gastronómica",
    intro:
      "Con esto For U crea producto estrella, flujo de pedido, contenido y tareas de venta.",
    defaultProjectName: "Sistema gastronómico",
    offerLabel: "¿Qué vendes?",
    offerPlaceholder:
      "Ej: cafetería, menú ejecutivo, catering, dark kitchen, postres",
    locationLabel: "¿Dónde vendes?",
    locationPlaceholder:
      "Ej: Lima, Miraflores, delivery por WhatsApp, local propio",
    customerLabel: "¿Quién compra?",
    customerPlaceholder:
      "Ej: oficinas, familias, turistas, universitarios, eventos",
    submit: "Crear estrategia gastronómica",
    assets: [
      "Fotos",
      "Menú",
      "Precios",
      "Delivery",
      "Instagram",
      "Reseñas",
      "WhatsApp",
    ],
  },
} satisfies Record<
  "tourism" | "gastronomy",
  {
    badge: string;
    title: string;
    intro: string;
    defaultProjectName: string;
    offerLabel: string;
    offerPlaceholder: string;
    locationLabel: string;
    locationPlaceholder: string;
    customerLabel: string;
    customerPlaceholder: string;
    submit: string;
    assets: string[];
  }
>;

const copyByIndustry = {
  ...legacyCopy,
  ...Object.fromEntries(
    businessTemplates.map((template) => [
      template.key,
      {
        badge: template.name,
        title: "Armemos la base de tu negocio",
        intro: template.entry,
        defaultProjectName: "Mi negocio de " + template.name.toLowerCase(),
        offerLabel: "¿Qué vendes?",
        offerPlaceholder: template.offer,
        locationLabel: "¿Dónde atiendes?",
        locationPlaceholder: "Ciudad, zona o atención virtual",
        customerLabel: "¿Quién compra?",
        customerPlaceholder: template.audience,
        submit: "Crear mi ruta",
        assets: [
          "Fotos",
          "Precios",
          "Testimonios",
          "Calendario",
          "Web",
          "WhatsApp",
        ],
      },
    ]),
  ),
} as Record<ForUIndustryKey, typeof legacyCopy.gastronomy>;

export default function IndustryOnboardingModal({
  isOpen,
  onClose,
  onCreateIndustryProject,
}: IndustryOnboardingModalProps) {
  const [step, setStep] = useState<"industry" | "details">("industry");
  const [industryKey, setIndustryKey] = useState<ForUIndustryKey>("tourism");
  const [projectName, setProjectName] = useState(
    copyByIndustry.tourism.defaultProjectName,
  );
  const [objective, setObjective] =
    useState<IndustryOnboardingInput["objective"]>("ventas");
  const [offerType, setOfferType] = useState("");
  const [location, setLocation] = useState("");
  const [idealTraveler, setIdealTraveler] = useState("");
  const [primaryChannel, setPrimaryChannel] = useState("WhatsApp");
  const [assets, setAssets] = useState<string[]>(["WhatsApp"]);
  const activeCopy = copyByIndustry[industryKey];

  const canCreate = useMemo(
    () =>
      Boolean(
        projectName.trim() &&
        offerType.trim() &&
        location.trim() &&
        idealTraveler.trim(),
      ),
    [idealTraveler, location, offerType, projectName],
  );

  function resetAndClose() {
    setStep("industry");
    onClose();
  }

  function chooseIndustry(nextIndustryKey: ForUIndustryKey) {
    setIndustryKey(nextIndustryKey);
    setProjectName(copyByIndustry[nextIndustryKey].defaultProjectName);
    setObjective(nextIndustryKey === "tourism" ? "reservas" : "ventas");
    setOfferType("");
    setLocation("");
    setIdealTraveler("");
    setPrimaryChannel("WhatsApp");
    setAssets(["WhatsApp"]);
    setStep("details");
  }

  function toggleAsset(asset: string) {
    setAssets((current) =>
      current.includes(asset)
        ? current.filter((item) => item !== asset)
        : [...current, asset],
    );
  }

  function createProject() {
    if (!canCreate) return;

    onCreateIndustryProject({
      industryKey,
      projectName: projectName.trim(),
      objective,
      offerType: offerType.trim(),
      location: location.trim(),
      idealTraveler: idealTraveler.trim(),
      primaryChannel,
      assets,
    });
    resetAndClose();
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="foru-industry-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="industry-modal-title"
        >
          <motion.section
            className="foru-industry-modal"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <header>
              <div>
                <MagicBadge>
                  {step === "industry" ? "Nuevo proyecto" : activeCopy.badge}
                </MagicBadge>
                <h2 id="industry-modal-title">
                  {step === "industry"
                    ? "¿Qué tipo de negocio quieres ordenar?"
                    : activeCopy.title}
                </h2>
                <p>
                  {step === "industry"
                    ? "Elige tu rubro para crear cinco pasos con tareas, ejemplos y recursos específicos."
                    : activeCopy.intro}
                </p>
              </div>
              <DSButtonSecondary
                type="button"
                onClick={resetAndClose}
                aria-label="Cerrar selector de rubro"
              >
                ×
              </DSButtonSecondary>
            </header>

            {step === "industry" ? (
              <div className="foru-industry-grid">
                {industryOptions.map((industry) => (
                  <DSButtonSecondary
                    type="button"
                    key={industry.key}
                    className={
                      industry.enabled
                        ? "foru-industry-option is-enabled"
                        : "foru-industry-option"
                    }
                    onClick={() =>
                      industry.enabled &&
                      chooseIndustry(industry.key as ForUIndustryKey)
                    }
                    disabled={!industry.enabled}
                  >
                    <strong>{industry.title}</strong>
                    <span>{industry.description}</span>
                    <em>Disponible</em>
                  </DSButtonSecondary>
                ))}
              </div>
            ) : (
              <div className="foru-tourism-onboarding">
                <MagicCard as="div" className="foru-tourism-form-card">
                  <label>
                    <span>Nombre del proyecto</span>
                    <DSInput
                      value={projectName}
                      onChange={(event) => setProjectName(event.target.value)}
                    />
                  </label>
                  <label>
                    <span>{activeCopy.offerLabel}</span>
                    <DSInput
                      value={offerType}
                      onChange={(event) => setOfferType(event.target.value)}
                      placeholder={activeCopy.offerPlaceholder}
                    />
                  </label>
                  <label>
                    <span>{activeCopy.locationLabel}</span>
                    <DSInput
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      placeholder={activeCopy.locationPlaceholder}
                    />
                  </label>
                  <label>
                    <span>{activeCopy.customerLabel}</span>
                    <DSInput
                      value={idealTraveler}
                      onChange={(event) => setIdealTraveler(event.target.value)}
                      placeholder={activeCopy.customerPlaceholder}
                    />
                  </label>
                  <div className="foru-tourism-objective-group">
                    <span>¿Qué quieres lograr primero?</span>
                    <div>
                      {objectiveOptions.map((option) => (
                        <DSButtonSecondary
                          type="button"
                          key={option.key}
                          className={
                            objective === option.key ? "is-selected" : ""
                          }
                          onClick={() => setObjective(option.key)}
                        >
                          <strong>{option.title}</strong>
                          <small>{option.description}</small>
                        </DSButtonSecondary>
                      ))}
                    </div>
                  </div>
                  <label>
                    <span>Canal principal</span>
                    <select
                      value={primaryChannel}
                      onChange={(event) =>
                        setPrimaryChannel(event.target.value)
                      }
                    >
                      <option>WhatsApp</option>
                      <option>Instagram</option>
                      <option>Web</option>
                      <option>Agencia / referidos</option>
                    </select>
                  </label>
                </MagicCard>

                <MagicCard as="div" className="foru-tourism-assets-card">
                  <h3>¿Qué tienes ya?</h3>
                  <p>Esto ayuda a priorizar las tareas iniciales.</p>
                  <div>
                    {activeCopy.assets.map((asset) => (
                      <DSButtonSecondary
                        type="button"
                        key={asset}
                        className={assets.includes(asset) ? "is-selected" : ""}
                        onClick={() => toggleAsset(asset)}
                      >
                        {asset}
                      </DSButtonSecondary>
                    ))}
                  </div>
                </MagicCard>

                <footer>
                  <MagicButton
                    type="button"
                    variant="soft"
                    onClick={() => setStep("industry")}
                  >
                    Volver
                  </MagicButton>
                  <MagicButton
                    type="button"
                    onClick={createProject}
                    disabled={!canCreate}
                  >
                    {activeCopy.submit}
                  </MagicButton>
                </footer>
              </div>
            )}
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
