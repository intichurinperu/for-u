import type { BusinessRoute } from '../workspace/contracts';

type TeamPresentation = {
  label: string;
  intro: string;
  choices: { value: string; label: string; hint: string }[];
};

/** Sector-specific wording; saved team answers keep their existing values. */
export const projectTeamPresentation: Record<BusinessRoute, TeamPresentation> = {
  "restaurant": {
    "label": "Cafetería o restaurante",
    "intro": "Conozcamos cómo organizas tu cafetería o restaurante.",
    "choices": [
      {
        "value": "Por mi cuenta",
        "label": "Por mi cuenta",
        "hint": "Buscaremos pasos manejables para tu menú y tu atención."
      },
      {
        "value": "Somos un equipo",
        "label": "Somos un equipo",
        "hint": "Tendremos en cuenta que varias personas participan en el proyecto."
      },
      {
        "value": "Todavía lo estoy definiendo",
        "label": "Todavía lo estoy definiendo",
        "hint": "Puedes avanzar aunque aún no sepas quién te acompañará."
      }
    ]
  },
  "ecommerce": {
    "label": "Tienda",
    "intro": "Veamos cómo llevas el trabajo de tu tienda.",
    "choices": [
      {
        "value": "Por mi cuenta",
        "label": "Por mi cuenta",
        "hint": "Organizaremos un siguiente paso posible para tus productos y pedidos."
      },
      {
        "value": "Somos un equipo",
        "label": "Somos un equipo",
        "hint": "Consideraremos que el trabajo de la tienda se comparte."
      },
      {
        "value": "Todavía lo estoy definiendo",
        "label": "Todavía lo estoy definiendo",
        "hint": "No necesitas resolver ahora cómo repartirás el trabajo."
      }
    ]
  },
  "hospitality": {
    "label": "Hospedaje",
    "intro": "Conozcamos cómo llevas el trabajo de tu hospedaje.",
    "choices": [
      {
        "value": "Por mi cuenta",
        "label": "Por mi cuenta",
        "hint": "Buscaremos pasos manejables para preparar y presentar tus estadías."
      },
      {
        "value": "Somos un equipo",
        "label": "Somos un equipo",
        "hint": "Tendremos en cuenta la participación de varias personas en el hospedaje."
      },
      {
        "value": "Todavía lo estoy definiendo",
        "label": "Todavía lo estoy definiendo",
        "hint": "Puedes seguir mientras defines quién participará en el proyecto."
      }
    ]
  },
  "tourism": {
    "label": "Turismo",
    "intro": "Veamos cómo llevas tus experiencias y recorridos.",
    "choices": [
      {
        "value": "Por mi cuenta",
        "label": "Por mi cuenta",
        "hint": "Partiremos de lo que puedes preparar y coordinar por tu cuenta."
      },
      {
        "value": "Somos un equipo",
        "label": "Somos un equipo",
        "hint": "Consideraremos que varias personas participan en las experiencias."
      },
      {
        "value": "Todavía lo estoy definiendo",
        "label": "Todavía lo estoy definiendo",
        "hint": "Puedes avanzar sin tener definida toda la coordinación."
      }
    ]
  },
  "courses": {
    "label": "Cursos y talleres",
    "intro": "Conozcamos cómo preparas tu proyecto educativo.",
    "choices": [
      {
        "value": "Por mi cuenta",
        "label": "Por mi cuenta",
        "hint": "Buscaremos un ritmo manejable para preparar tus contenidos."
      },
      {
        "value": "Somos un equipo",
        "label": "Somos un equipo",
        "hint": "Tendremos en cuenta que otras personas participan en el proyecto."
      },
      {
        "value": "Todavía lo estoy definiendo",
        "label": "Todavía lo estoy definiendo",
        "hint": "Puedes dar forma al curso mientras defines cómo trabajarás."
      }
    ]
  },
  "services": {
    "label": "Servicios y ofertas mixtas",
    "intro": "Veamos cómo llevas tus servicios y otras ofertas.",
    "choices": [
      {
        "value": "Por mi cuenta",
        "label": "Por mi cuenta",
        "hint": "Partiremos de los servicios y tareas que puedes asumir ahora."
      },
      {
        "value": "Somos un equipo",
        "label": "Somos un equipo",
        "hint": "Consideraremos que el trabajo de tus ofertas se comparte."
      },
      {
        "value": "Todavía lo estoy definiendo",
        "label": "Todavía lo estoy definiendo",
        "hint": "Puedes continuar aunque la forma de trabajar siga tomando forma."
      }
    ]
  }
};

/** A reference for planning only: no members, permissions or invitations are created. */
export const projectTeamSizePresentation: Record<BusinessRoute, TeamPresentation> = {
  "restaurant": {
    "label": "Cafetería o restaurante",
    "intro": "Una referencia del equipo ayuda a proponer pasos manejables.",
    "choices": [
      {
        "value": "Dos personas",
        "label": "Dos personas",
        "hint": "Tendremos en cuenta una coordinación cercana para el local."
      },
      {
        "value": "Entre tres y cinco",
        "label": "Entre tres y cinco",
        "hint": "Consideraremos la coordinación entre las personas del proyecto."
      },
      {
        "value": "Más de cinco",
        "label": "Más de cinco",
        "hint": "Nos orienta al organizar el trabajo de tu cafetería o restaurante."
      },
      {
        "value": "Lo definiré después",
        "label": "Lo definiré después",
        "hint": "Puedes continuar sin precisar el tamaño del equipo."
      }
    ]
  },
  "ecommerce": {
    "label": "Tienda",
    "intro": "Conozcamos cuántas personas participan en tu tienda.",
    "choices": [
      {
        "value": "Dos personas",
        "label": "Dos personas",
        "hint": "Tendremos en cuenta una coordinación cercana para la tienda."
      },
      {
        "value": "Entre tres y cinco",
        "label": "Entre tres y cinco",
        "hint": "Nos orienta al organizar productos, pedidos y pendientes."
      },
      {
        "value": "Más de cinco",
        "label": "Más de cinco",
        "hint": "Consideraremos la coordinación de un equipo más amplio."
      },
      {
        "value": "Lo definiré después",
        "label": "Lo definiré después",
        "hint": "Puedes seguir sin indicar cuántas personas participan."
      }
    ]
  },
  "hospitality": {
    "label": "Hospedaje",
    "intro": "Conozcamos cuántas personas participan en el hospedaje.",
    "choices": [
      {
        "value": "Dos personas",
        "label": "Dos personas",
        "hint": "Tendremos en cuenta una coordinación cercana para las estadías."
      },
      {
        "value": "Entre tres y cinco",
        "label": "Entre tres y cinco",
        "hint": "Nos orienta al organizar la preparación y atención del hospedaje."
      },
      {
        "value": "Más de cinco",
        "label": "Más de cinco",
        "hint": "Consideraremos la coordinación de varias personas en el hospedaje."
      },
      {
        "value": "Lo definiré después",
        "label": "Lo definiré después",
        "hint": "Puedes continuar sin precisar el tamaño del equipo."
      }
    ]
  },
  "tourism": {
    "label": "Turismo",
    "intro": "Una referencia del equipo ayuda a organizar tus experiencias.",
    "choices": [
      {
        "value": "Dos personas",
        "label": "Dos personas",
        "hint": "Tendremos en cuenta una coordinación cercana para los recorridos."
      },
      {
        "value": "Entre tres y cinco",
        "label": "Entre tres y cinco",
        "hint": "Nos orienta al organizar la preparación de experiencias y salidas."
      },
      {
        "value": "Más de cinco",
        "label": "Más de cinco",
        "hint": "Consideraremos la coordinación de varias personas en las experiencias."
      },
      {
        "value": "Lo definiré después",
        "label": "Lo definiré después",
        "hint": "Puedes seguir sin definir todavía cuántas personas participarán."
      }
    ]
  },
  "courses": {
    "label": "Cursos y talleres",
    "intro": "Conozcamos cuántas personas participan en tu proyecto educativo.",
    "choices": [
      {
        "value": "Dos personas",
        "label": "Dos personas",
        "hint": "Tendremos en cuenta una coordinación cercana para los contenidos."
      },
      {
        "value": "Entre tres y cinco",
        "label": "Entre tres y cinco",
        "hint": "Nos orienta al organizar contenidos, materiales y pendientes."
      },
      {
        "value": "Más de cinco",
        "label": "Más de cinco",
        "hint": "Consideraremos la coordinación de un equipo educativo más amplio."
      },
      {
        "value": "Lo definiré después",
        "label": "Lo definiré después",
        "hint": "Puedes continuar sin precisar el tamaño del equipo."
      }
    ]
  },
  "services": {
    "label": "Servicios y ofertas mixtas",
    "intro": "Conozcamos cuántas personas participan en tus ofertas.",
    "choices": [
      {
        "value": "Dos personas",
        "label": "Dos personas",
        "hint": "Tendremos en cuenta una coordinación cercana para los servicios."
      },
      {
        "value": "Entre tres y cinco",
        "label": "Entre tres y cinco",
        "hint": "Nos orienta al organizar servicios, entregas y pendientes."
      },
      {
        "value": "Más de cinco",
        "label": "Más de cinco",
        "hint": "Consideraremos la coordinación de un equipo más amplio."
      },
      {
        "value": "Lo definiré después",
        "label": "Lo definiré después",
        "hint": "Puedes seguir sin indicar cuántas personas participan."
      }
    ]
  }
};

