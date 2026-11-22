const localized = (en, es) => ({ en, es });
const calcStore = "https://apps.apple.com/us/app/bricks-calc-loan-calculator/id6754506837";
const scanStore = "https://apps.apple.com/us/app/bricks-scan-scan-to-pdf/id6758148083";
const leadsSignup = "https://form.typeform.com/to/JqKYBT9w?utm_source=bricks_web&utm_medium=website&utm_campaign=leads_beta&utm_content=header_cta";
const suite = [
  ["Bricks Calc", "/calc/"], ["Bricks Scan", "/scan.html"], ["Bricks Leads", "/leads.html"],
  ["Bricks Living", "/living.html"],
];
export function createContentLayouts({ bricks, calc }) {
  const calcLinks = [
    [localized("Monthly cost", "Costo mensual"), "#monthly-cost"],
    [localized("Compare plans", "Comparar planes"), "#compare-options"],
    [localized("Features", "Funciones"), "#features"],
  ];
  const faq = [localized("FAQ", "Preguntas"), "#faq"];
  const calcPage = (entry, { language = "en", bilingual = false, guides = false } = {}) => ({
    entry, brand: calc, home: "#top", language, bilingual,
    styles: ["calc-content"], scripts: ["calc"],
    spanishTitle: "Planificación hipotecaria | Bricks Calc",
    links: [...calcLinks, ...(guides ? [[localized("Guides", "Guías"), "#guides"]] : []), faq],
    action: [localized("Download", "Descargar"), calcStore + "?ct=bricks_web_calc_header_cta&mt=8"],
  });
  const infoPage = (entry, spanishTitle) => ({
    entry, spanishTitle, brand: bricks, bilingual: true, links: suite, styles: ["editorial"],
  });
  const scanBrand = { name: "Bricks Scan", home: "/scan.html", icon: "/images/bricks-scan-web-icon.png" };
  const leadsBrand = { name: "Bricks Leads", home: "/leads.html", icon: "/images/bricks-leads-web-icon.png" };
  return {
    "index.html": calcPage("index", { bilingual: true }),
    "calc/index.html": calcPage("calc-index", { bilingual: true, guides: true }),
    "calc.html": calcPage("calc", { bilingual: true }),
    "homebuyers.html": calcPage("homebuyers"),
    "refinance.html": calcPage("refinance"),
    "refinanciamiento.html": calcPage("calculadora-hipotecaria", { language: "es" }),
    "calculadora-hipotecaria.html": calcPage("calculadora-hipotecaria", { language: "es" }),
    "about.html": infoPage("about", "Sobre Bricks Apps"),
    "help.html": infoPage("help", "Centro de ayuda | Bricks Apps"),
    "privacy.html": infoPage("privacy", "Política de privacidad | Bricks Apps"),
    "support.html": infoPage("support", "Soporte | Bricks Apps"),
    "terms.html": infoPage("terms", "Términos del servicio | Bricks Apps"),
    "thank-you.html": infoPage("thank-you", "Gracias por registrarte | Bricks Apps"),
    "thank-you-feedback.html": infoPage("thank-you-feedback", "Gracias | Bricks Apps"),
    "scan.html": {
      entry: "scan", brand: scanBrand, bilingual: true, spanishTitle: "Bricks Scan | Escáner de documentos",
      styles: ["products"],
      links: [
        ["Bricks Calc", calcStore + "?ct=bricks_web_scan_header_menu_calc&mt=8"],
        ["Bricks Scan", scanStore + "?ct=bricks_web_scan_header_menu_scan&mt=8"],
        ["Bricks Leads", "/leads.html"],
      ],
      action: [localized("Download", "Descargar"), scanStore + "?ct=bricks_web_scan_header_cta&mt=8"],
      },
    "leads.html": {
      entry: "leads", brand: leadsBrand, bilingual: true, spanishTitle: "Bricks Leads | CRM para bienes raíces",
      styles: ["products"],
      links: [
        ["Bricks Calc", calcStore + "?ct=bricks_web_leads_header_menu_calc&mt=8"],
        ["Bricks Scan", scanStore + "?ct=bricks_web_leads_header_menu_scan&mt=8"],
        ["Bricks Leads", "/leads.html"],
      ],
      action: [localized("Join the beta", "Únete al beta"), leadsSignup],
      },
    "living.html": {
      entry: "living", brand: { name: "Bricks Living", home: "/living.html" }, language: "es",
      links: [["Flujo", "#landing/workflow"], ["WhatsApp", "#landing/whatsapp"], ["Roles", "#landing/roles"], ["Reportes", "#landing/reportes"]],
      action: ["Contactar", "mailto:hello@bricks.pe"],
      appearance: false,
    },
  };
}
