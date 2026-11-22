export function createStaticLayouts({ appCutLanding, appCutGuide, calcGuide, calc, appCutStore }) {
  const fallback = { brand: calc };
  return {
    "appcut/getvideoeditor.html": {
      ...appCutLanding,
      action: ["Download", appCutStore, "Download for Mac"],
      note: "AppCut. Made for indie Apple developers. Built natively for Mac.",
    },
    "appcut/guides/index.html": appCutGuide,
    "appcut/guides/app-preview-assets/index.html": appCutGuide,
    "appcut/guides/getting-started/index.html": appCutGuide,
    "appcut/guides/video-editing-app-preview/index.html": appCutGuide,
    "calc/guides/15-year-vs-30-year-mortgage/index.html": calcGuide("terms"),
    "calc/guides/amortization-schedule-calculator/index.html": calcGuide("amort"),
    "calc/guides/how-much-house-can-i-afford/index.html": calcGuide("afford"),
    "calc/guides/mortgage-extra-payment-calculator/index.html": calcGuide("extra"),
    "calc/guides/mortgage-payment-calculator-taxes-insurance-pmi/index.html": calcGuide("piti"),
    "calc/guides/rental-property-mortgage-calculator/index.html": calcGuide("rental"),
    "calc/guides/should-i-refinance-my-mortgage/index.html": calcGuide("refi"),
    "app/affordability/index.html": fallback,
    "app/main/index.html": fallback,
    "app/mortgage/index.html": fallback,
    "app/refinance/index.html": fallback,
    "app/store/index.html": fallback,
  };
}
