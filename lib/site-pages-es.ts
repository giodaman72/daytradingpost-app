import type { SitePage, SitePagePath } from "./site-pages";

export const sitePagesEs = {
  academy: {
    kicker: "Academia de trading",
    title: "Construye un proceso de trading más sólido.",
    description:
      "Estamos desarrollando lecciones estructuradas para ayudar a comprender la estructura de mercado, el análisis técnico y una gestión disciplinada del riesgo.",
    status: "Los primeros itinerarios ya están en preparación",
    highlights: [
      "Fundamentos de mercado sin jerga innecesaria",
      "Marcos prácticos de análisis técnico",
      "Dimensionamiento de posiciones y protección del capital",
    ],
    actionHref: "/#academy",
    actionLabel: "Ver el programa",
  },
  webinars: {
    kicker: "Formación en directo",
    title: "Webinars de mercado centrados en la sesión real.",
    description:
      "Las sesiones educativas conectan el contexto del mercado con lecciones prácticas sobre planificación, ejecución y riesgo.",
    status: "No hay ninguna sesión en directo programada",
    highlights: [
      "Sesiones de planificación antes del mercado",
      "Talleres de análisis técnico",
      "Preguntas de miembros y grabaciones",
    ],
    actionHref: "/#newsletter",
    actionLabel: "Recibir avisos de nuevas sesiones",
  },
  about: {
    kicker: "Quiénes somos",
    title: "Inteligencia independiente para traders activos.",
    description:
      "DayTradingPost facilita el uso diario de contexto profesional de mercados y formación práctica en trading.",
    status: "Independiente y centrado en la educación",
    highlights: [
      "Cobertura multiactivo",
      "Razonamiento claro en lugar de perseguir señales",
      "Conciencia del riesgo en cada contenido",
    ],
    actionHref: "/#analysis",
    actionLabel: "Explorar la página principal",
  },
  contact: {
    kicker: "Contacto",
    title: "Habla con nuestro equipo.",
    description:
      "Contacta con DayTradingPost sobre cuentas, membresías, correcciones editoriales, privacidad o seguridad.",
    status: "Soporte y contacto editorial",
    highlights: [
      "Preguntas y correcciones editoriales",
      "Soporte de cuentas y membresías",
      "Colaboraciones y consultas de prensa",
    ],
    actionHref: "/#newsletter",
    actionLabel: "Mantenerme informado",
  },
  privacy: {
    kicker: "Privacidad",
    title: "Cómo trata DayTradingPost la información personal.",
    description:
      "Esta política explica la información utilizada para operar cuentas, membresías, herramientas de mercado, la Academia y las funciones de aprendizaje asistidas por IA.",
    status: "Vigente desde el 26 de julio de 2026",
    highlights: [
      "Prácticas de datos en lenguaje claro",
      "Controles transparentes de consentimiento y baja",
      "Recopilación limitada a las necesidades del producto",
    ],
    actionHref: "/",
    actionLabel: "Volver al inicio",
    sections: [
      {
        heading: "Información que tratamos",
        paragraphs: [
          "Tratamos identificadores de cuenta, datos de perfil que proporcionas, registros de autenticación, consentimiento del boletín, estado de membresía y actividad necesaria para operar DayTradingPost.",
          "Las funciones de aprendizaje pueden guardar inscripciones, progreso, evaluaciones y resultados, marcadores, notas privadas, reseñas, preferencias de notificaciones y certificados. Las notas privadas y respuestas individuales no se incluyen en analíticas públicas.",
          "Las funciones de IA pueden guardar mensajes visibles, citas, comentarios, etiquetas de modelo, recuentos de tokens y telemetría operativa con datos minimizados. No se almacenan contraseñas, tokens de autenticación, datos de tarjetas, instrucciones ocultas ni cadenas de razonamiento en las conversaciones de IA.",
        ],
      },
      {
        heading: "Cómo utilizamos la información",
        paragraphs: [
          "La información se utiliza para prestar y proteger el servicio, aplicar derechos de acceso, gestionar membresías, personalizar la navegación educativa, responder consultas, prevenir abusos, medir el rendimiento agregado y cumplir obligaciones legales.",
          "DayTradingPost no vende notas privadas, respuestas de evaluaciones ni conversaciones de IA. Las recomendaciones educativas se basan en actividad de aprendizaje verificada e intereses seleccionados, no en perfiles de idoneidad financiera.",
        ],
      },
      {
        heading: "Proveedores y pagos",
        paragraphs: [
          "Supabase proporciona autenticación y almacenamiento operativo, Sanity almacena contenido editorial, Vercel aloja la aplicación y los proveedores configurados de IA y datos procesan solicitudes limitadas necesarias para sus funciones.",
          "Revolut procesa los datos de pago. DayTradingPost guarda referencias de pago, identificadores de suscripción, plan y estado de membresía, pero no números de tarjeta.",
        ],
      },
      {
        heading: "Conservación, seguridad y opciones",
        paragraphs: [
          "Los registros se conservan únicamente por motivos documentados de producto, seguridad, auditoría y obligaciones legales. Algunos registros de auditoría y certificados pueden mantenerse para preservar su historial de verificación.",
          "Puedes actualizar tu perfil, gestionar notificaciones compatibles, darte de baja de comunicaciones comerciales, eliminar conversaciones de IA que cumplan los requisitos y solicitar acceso, corrección o supresión por el canal de contacto.",
          "Ningún servicio de internet es completamente seguro. DayTradingPost utiliza autorización del lado del servidor, seguridad por filas, credenciales con privilegios mínimos, validación de entradas y registros de auditoría para reducir el riesgo.",
        ],
      },
    ],
  },
  terms: {
    kicker: "Términos de uso",
    title: "Condiciones para utilizar DayTradingPost.",
    description:
      "Estos términos regulan el acceso a información de mercados, contenido educativo, membresías, funciones comunitarias y herramientas de IA de DayTradingPost.",
    status: "Vigentes desde el 26 de julio de 2026",
    highlights: [
      "Contenido educativo, no asesoramiento personalizado",
      "Condiciones transparentes de membresía",
      "Avisos destacados sobre el riesgo de mercado",
    ],
    actionHref: "/",
    actionLabel: "Volver al inicio",
    sections: [
      {
        heading: "Uso educativo y riesgo de mercado",
        paragraphs: [
          "DayTradingPost ofrece contenido educativo e informativo general. No proporciona asesoramiento personalizado de inversión, legal, fiscal o financiero, ni recomienda realizar una operación concreta.",
          "El trading y los productos apalancados pueden generar pérdidas considerables. Tú eres responsable de tu investigación, decisiones de idoneidad, controles de riesgo y cumplimiento normativo.",
        ],
      },
      {
        heading: "Cuentas y uso aceptable",
        paragraphs: [
          "Debes proporcionar información correcta, proteger tus credenciales y avisar si sospechas de un acceso no autorizado. Eres responsable de la actividad realizada desde tu cuenta.",
          "No puedes eludir controles de acceso, extraer contenido protegido, buscar vulnerabilidades sin autorización, interferir con otros usuarios, subir contenido malicioso, suplantar identidades ni usar el servicio de forma ilegal.",
        ],
      },
      {
        heading: "Membresías y servicios externos",
        paragraphs: [
          "El acceso Premium comienza únicamente cuando el flujo de pago configurado lo confirma o un administrador autorizado verifica la membresía. El precio, la divisa y las condiciones se muestran durante el pago.",
          "Las cancelaciones, impagos, reembolsos y renovaciones se gestionan según las condiciones de compra, la ley aplicable y el estado confirmado de la suscripción.",
        ],
      },
      {
        heading: "Contenido, IA y certificados",
        paragraphs: [
          "El contenido y la marca DayTradingPost no pueden republicarse, revenderse ni utilizarse para crear un conjunto de datos competidor salvo autorización o permiso legal.",
          "Las respuestas de IA pueden ser incompletas o incorrectas y deben comprobarse con las fuentes citadas. Los certificados de la Academia confirman únicamente la finalización de contenido educativo; no son acreditación ni prueba de competencia o resultados de trading.",
        ],
      },
      {
        heading: "Disponibilidad y responsabilidad",
        paragraphs: [
          "Los datos de mercado pueden estar retrasados, no disponibles o sujetos a correcciones. El servicio puede modificar, suspender o retirar funciones por motivos de seguridad, legales, operativos o de proveedores.",
          "En la medida permitida por la ley, DayTradingPost se ofrece sin garantías de disponibilidad ininterrumpida, resultados de trading o idoneidad para un fin concreto.",
          "Los cambios importantes se publicarán con una fecha de entrada en vigor actualizada. El uso continuado después de esa fecha supone aceptación cuando la ley lo permita.",
        ],
      },
    ],
  },
  "markets/gold": {
    kicker: "Mercado del oro",
    title: "Contexto técnico para traders de XAU/USD.",
    description:
      "La cobertura del oro sigue la estructura de tendencia, niveles importantes, impulso y eventos macroeconómicos que pueden cambiar la volatilidad.",
    status: "La cobertura verificada aparece cuando está disponible",
    highlights: [
      "Mapa diario de soporte y resistencia",
      "Escenarios de tendencia e impulso",
      "Eventos de riesgo para metales preciosos",
    ],
    actionHref: "/#markets",
    actionLabel: "Ver el resumen de mercado",
  },
  "markets/indices": {
    kicker: "Índices bursátiles",
    title: "Comprende la estructura detrás de los movimientos de índices.",
    description:
      "La cobertura se centra en los principales índices de Estados Unidos, la estructura de sesión y los niveles usados para definir el riesgo.",
    status: "La cobertura verificada aparece cuando está disponible",
    highlights: [
      "Perspectivas del Nasdaq 100 y Dow Jones",
      "Contexto de apertura y sesión",
      "Catalizadores de la volatilidad de índices",
    ],
    actionHref: "/#markets",
    actionLabel: "Ver el resumen de mercado",
  },
  "markets/forex": {
    kicker: "Mercado de divisas",
    title: "Contexto práctico para los principales pares.",
    description:
      "La cobertura de forex combina estructura técnica, calendario económico y factores cruzados relevantes.",
    status: "La cobertura verificada aparece cuando está disponible",
    highlights: [
      "Perspectivas técnicas de los pares principales",
      "Planificación del riesgo de eventos económicos",
      "Fortaleza del dólar y contexto cruzado",
    ],
    actionHref: "/#markets",
    actionLabel: "Ver el resumen de mercado",
  },
  "markets/crypto": {
    kicker: "Activos digitales",
    title: "Análisis estructurado para mercados cripto volátiles.",
    description:
      "La cobertura cripto identifica escenarios de tendencia, liquidez y volatilidad con una gestión disciplinada del riesgo.",
    status: "La cobertura verificada aparece cuando está disponible",
    highlights: [
      "Estructura y niveles clave de Bitcoin",
      "Escenarios de volatilidad y liquidez",
      "Planificación del riesgo según catalizadores",
    ],
    actionHref: "/#markets",
    actionLabel: "Ver el resumen de mercado",
  },
} as const satisfies Record<SitePagePath, SitePage>;
