import type { PortableTextBlock } from "@portabletext/react";
import type { SanityImage } from "@/types/article";

const SPANISH_TEXT: Record<string, string> = {
  "WTI Crude Oil 4H Trade Setup — August 4, 2026":
    "Configuración de trading del petróleo WTI en 4H — 4 de agosto de 2026",
  "Dow Jones 30 4H Trade Setup — August 4, 2026":
    "Configuración de trading del Dow Jones 30 en 4H — 4 de agosto de 2026",
  "Silver 4H Trade Setup — August 4, 2026":
    "Configuración de trading de la plata en 4H — 4 de agosto de 2026",
  "Oil prices are recovering after yesterday’s gap-down open as momentum builds amid Trump’s ultimatum to Iran.":
    "Los precios del petróleo se recuperan tras la apertura con brecha bajista de ayer, mientras aumenta el impulso ante el ultimátum de Trump a Irán.",
  "DJ30 is testing strong structural resistance near 53,400, increasing the likelihood of a temporary pullback or sideways range before the next expansion move.":
    "El DJ30 está probando una fuerte resistencia estructural cerca de 53.400, lo que aumenta la probabilidad de un retroceso temporal o una fase lateral antes del próximo movimiento expansivo.",
  "On the 4H chart, silver is attempting to break toward a key psychological resistance level as price works to reclaim the zone.":
    "En el gráfico de 4H, la plata intenta avanzar hacia una resistencia psicológica clave mientras el precio busca recuperar la zona.",
  "Editorial note: The source labels the bias as bearish, while the supplied setup places the stop below entry and both targets above entry. Confirm the source levels before acting.":
    "Nota editorial: la fuente clasifica el sesgo como bajista, pero la configuración proporcionada sitúa el stop por debajo de la entrada y ambos objetivos por encima. Confirma los niveles de la fuente antes de actuar.",
  "Editorial note: The source lists a bullish bias, but both supplied targets are below entry and the first target is recorded as “52.” Confirm the source levels before acting.":
    "Nota editorial: la fuente indica un sesgo alcista, pero ambos objetivos proporcionados están por debajo de la entrada y el primero figura como «52». Confirma los niveles de la fuente antes de actuar.",
  "Market context": "Contexto de mercado",
  "Oil prices are recovering after yesterday’s gap-down open. Momentum is building amid Trump’s ultimatum to Iran.":
    "Los precios del petróleo se recuperan tras la apertura con brecha bajista de ayer. El impulso aumenta ante el ultimátum de Trump a Irán.",
  "DJ30 is testing strong structural resistance near 53,400, making a temporary pullback or sideways range highly likely before the next expansion move.":
    "El DJ30 está probando una fuerte resistencia estructural cerca de 53.400, por lo que es muy probable un retroceso temporal o una fase lateral antes del próximo movimiento expansivo.",
  "On the 4H chart, price is attempting to break toward a key psychological resistance level as the zone is reclaimed.":
    "En el gráfico de 4H, el precio intenta avanzar hacia una resistencia psicológica clave mientras recupera la zona.",
  "Source chart supplied with the August 4, 2026 analysis note.":
    "Gráfico fuente proporcionado con la nota de análisis del 4 de agosto de 2026.",
  "Possible trade setup": "Posible configuración de trading",
  "Bias: Bearish": "Sesgo: bajista",
  "Bias: Bullish": "Sesgo: alcista",
  "Bias: Cautiously Bullish": "Sesgo: alcista con cautela",
  "Timeframe: 4H": "Temporalidad: 4H",
  "Stop loss: $80.850": "Stop loss: $80.850",
  "Stop loss: 53,300": "Stop loss: 53.300",
  "Stop loss: $58.250": "Stop loss: $58.250",
  "Take profit 1: $81.825": "Objetivo 1: $81.825",
  "Take profit 2: $82.550": "Objetivo 2: $82.550",
  "Take profit 1: 52": "Objetivo 1: 52",
  "Take profit 2: 53,000": "Objetivo 2: 53.000",
  "Take profit 1: $59.000": "Objetivo 1: $59.000",
  "Take profit 2: $59.300": "Objetivo 2: $59.300",
  "Source risk-to-reward notation: 1:1 or 1:2":
    "Relación riesgo-beneficio indicada por la fuente: 1:1 o 1:2",
  "Primary risk factor": "Principal factor de riesgo",
  "OPEC+ & Diplomatic Headlines: Policy shifts regarding output quotas or progress in US-Iran trade and energy talks can cause high volatility and gap risk.":
    "OPEP+ y titulares diplomáticos: los cambios en las cuotas de producción o los avances en las conversaciones comerciales y energéticas entre Estados Unidos e Irán pueden provocar alta volatilidad y riesgo de brechas.",
  "Overhead Resistance Rejection: Strong selling liquidity sits around 53,430; failure to break out could trigger profit-taking toward S1.":
    "Rechazo en la resistencia superior: existe una fuerte liquidez vendedora alrededor de 53.430; no lograr la ruptura podría activar toma de beneficios hacia S1.",
  "Gold-Silver Ratio Expansion: A gold-silver ratio above approximately 70 indicates relative underperformance by silver against gold in the current macro climate.":
    "Expansión de la relación oro-plata: una relación superior a aproximadamente 70 indica un rendimiento relativo inferior de la plata frente al oro en el entorno macroeconómico actual.",
  "Educational analysis only. This is not personalized financial advice. Trading leveraged products involves a significant risk of loss.":
    "Análisis exclusivamente educativo. No constituye asesoramiento financiero personalizado. Operar con productos apalancados implica un riesgo considerable de pérdida.",
};

export const SPANISH_INSTRUMENT_NAMES: Record<string, string> = {
  Gold: "Oro",
  Silver: "Plata",
  "WTI Crude Oil": "Petróleo crudo WTI",
  "Natural Gas": "Gas natural",
  Copper: "Cobre",
};

export function translateInstrumentName(value: string) {
  return SPANISH_INSTRUMENT_NAMES[value] ?? value;
}

export function translateSpanishText(value: string) {
  const exact = SPANISH_TEXT[value];
  if (exact) return exact;

  const prefixes: Array<[string, string]> = [
    ["Entry:", "Entrada:"],
    ["Stop loss:", "Stop loss:"],
    ["Take profit 1:", "Objetivo 1:"],
    ["Take profit 2:", "Objetivo 2:"],
    ["Bias:", "Sesgo:"],
    ["Timeframe:", "Temporalidad:"],
  ];
  const match = prefixes.find(([prefix]) => value.startsWith(prefix));
  return match ? `${match[1]}${value.slice(match[0].length)}` : value;
}

export function translateSpanishPortableText(
  body: Array<PortableTextBlock | SanityImage>,
) {
  return body.map((item) => {
    if ("asset" in item) {
      const image = item as SanityImage;
      return {
        ...image,
        alt: image.alt ? translateSpanishText(image.alt) : image.alt,
        caption: image.caption
          ? translateSpanishText(image.caption)
          : image.caption,
      };
    }

    const block = item as PortableTextBlock;
    return {
      ...block,
      children: block.children?.map((child) =>
        typeof child === "object" && child && "text" in child
          ? { ...child, text: translateSpanishText(String(child.text)) }
          : child,
      ),
    };
  });
}
