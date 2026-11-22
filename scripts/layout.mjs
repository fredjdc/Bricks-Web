import { createContentLayouts } from "./content-layouts.mjs";
import { createStaticLayouts } from "./static-layouts.mjs";
import { staticFormsLayouts } from "./static-forms-layouts.mjs";
import { localePath } from "./content.mjs";

const appStore = "https://apps.apple.com/us/app/mortgage-calculator-bricks/id6754506837";
const appCutStore = "https://apps.apple.com/us/app/appcut-studio/id6785711605";
const appCutBeta = "https://testflight.apple.com/join/UgyQd6ES";

const appCut = { name: "AppCut", home: "/appcut/", icon: "/appcut/AppIcon.png" };
const calc = { name: "Bricks Calc", home: "/calc/", icon: "/calc/assets/app-store/app-icon.png" };
const ascGui = { name: "ASC GUI", home: "/asc-gui/", mark: "ASC", ctaIcon: "/asc-gui/assets/app-icon.png" };
const bricks = { name: "Bricks Apps", home: "/", logo: true };
const appCutGuides = ["Guides", "/appcut/guides/"];
const calcGuides = "/calc/guides/";

const appCutLanding = {
  brand: appCut, home: "#top", apple: true, styles: ["features", "comparison", "faq"],
  action: ["Download", appCutBeta, "Download for Mac"],
};
const appCutGuide = {
  brand: appCut,
  links: [["How it works", "/appcut/#workflow"], ["Features", "/appcut/#features"], appCutGuides, ["FAQ", "/appcut/#faq"]],
  current: appCutGuides[1],
  action: ["Get Beta Access", "/appcut/#top"],
};
const calcGuide = campaign => ({
  brand: calc,
  action: ["Download", `${appStore}?ct=guide_${campaign}&mt=8`],
});

export const siteRedirects = new Map([
  ["app-preview-editor/index.html", "/appcut/"],
  ["app-preview-editor/index-backup.html", "/appcut/"],
  ["app-preview-editor/guides/index.html", "/appcut/guides/"],
  ["app-preview-editor/guides/app-preview-assets/index.html", "/appcut/guides/app-preview-assets/"],
  ["app-preview-editor/guides/effective-app-preview/index.html", "/appcut/guides/effective-app-preview/"],
  ["app-preview-editor/guides/getting-started/index.html", "/appcut/guides/getting-started/"],
  ["app-preview-editor/guides/video-editing-app-preview/index.html", "/appcut/guides/video-editing-app-preview/"],
  ["appcut/index-backup-templates.html", "/appcut/"],
  ["calc/index2.html", "/calc/"]
]);

export const sitePages = new Map(Object.entries({
  "appcut/index.html": appCutLanding,
  "asc-gui/index.html": {
    brand: ascGui, home: "#top", styles: ["features", "faq"],
    links: [["Features", "#features"], ["Automations", "#automations"], ["Setup", "#setup"], ["FAQ", "#faq"]],
    action: ["See the workflow", "#workflow"],
  },
  "appcut/guides/effective-app-preview/index.html": appCutGuide,
  "calc/guides/index.html": { brand: calc },
  ...createStaticLayouts({ appCutLanding, appCutGuide, calcGuide, calc, appCutStore }),
  ...staticFormsLayouts,
  ...createContentLayouts({ bricks, calc }),
}));

const copy = {
  en: {
    skip: "Skip to content", nav: "Primary navigation", menu: "Menu", home: name => `${name} home`,
    footerNav: "Footer navigation", help: "Support", privacy: "Privacy Policy", terms: "Terms of Service",
    apps: "Apps", devTools: "Dev Tools", about: "About Bricks", purchase: "Purchase Guide", helpCenter: "Help Center",
    mortgageCalculator: "Mortgage Calculator", firstTimeBuyers: "First-Time Buyers", refinancing: "Refinancing", mortgageGuides: "Mortgage Guides",
    appCutGuides: "AppCut Guides",
    feedback: "Share feedback", vote: "Vote on features", language: "Language",
    instagram: "Bricks on Instagram", linkedin: "Bricks on LinkedIn",
    tagline: "Productivity apps for Apple platforms.", copyright: "© 2026 Bricks Apps. Made with care.",
    appearance: "Appearance", auto: "System", light: "Light", dark: "Dark",
  },
  es: {
    skip: "Saltar al contenido", nav: "Navegación principal", menu: "Menú", home: name => `Inicio de ${name}`,
    footerNav: "Navegación del pie de página", help: "Soporte", privacy: "Política de privacidad", terms: "Términos del servicio",
    apps: "Apps", devTools: "Herramientas de desarrollo", about: "Acerca de Bricks", purchase: "Guía de compra", helpCenter: "Centro de ayuda",
    mortgageCalculator: "Calculadora hipotecaria", firstTimeBuyers: "Primera vivienda", refinancing: "Refinanciamiento", mortgageGuides: "Guías hipotecarias",
    appCutGuides: "Guías de AppCut",
    feedback: "Comparte tus comentarios", vote: "Vota por nuevas funciones", language: "Idioma",
    instagram: "Bricks en Instagram", linkedin: "Bricks en LinkedIn",
    tagline: "Apps de productividad para plataformas Apple.", copyright: "© 2026 Bricks Apps. Hecho con cuidado.",
    appearance: "Apariencia", auto: "Sistema", light: "Claro", dark: "Oscuro",
  },
};

function escapeHTML(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function renderText(label, language) {
  if (typeof label === "string") return escapeHTML(label);
  return language === "es" ? escapeHTML(label.es) : `<span data-site-en="${escapeHTML(label.en)}" data-site-es="${escapeHTML(label.es)}">${escapeHTML(label.en)}</span>`;
}

function renderAria(label, language) {
  if (!label) return "";
  if (typeof label === "string") return ` aria-label="${escapeHTML(label)}"`;
  if (language === "es") return ` aria-label="${escapeHTML(label.es)}"`;
  return ` aria-label="${escapeHTML(label.en)}" data-site-en-aria="${escapeHTML(label.en)}" data-site-es-aria="${escapeHTML(label.es)}"`;
}

function localizedHref(href, language) {
  if (language !== "es" || !href.startsWith("/") || href.startsWith("//")) return href;
  const [, pathname, suffix] = href.match(/^([^?#]+)(.*)$/);
  const path = pathname.slice(1) + (pathname.endsWith("/") ? "index.html" : "");
  return sitePages.get(path)?.bilingual ? "/" + localePath(path, language) + suffix : href;
}

function renderLink([label, href, accessibleLabel], { className, current, icon = "", language } = {}) {
  href = localizedHref(href, language);
  return `<a href="${escapeHTML(href)}"${className ? ` class="${className}"` : ""}${renderAria(accessibleLabel, language)}${current ? ` aria-current="${current}"` : ""}>${icon}${renderText(label, language)}</a>`;
}

function renderHeader(page, labels, route, language) {
  const brand = page.brand;
  const brandImage = brand.icon
    ? `<img src="${brand.icon}" width="40" height="40" alt="">`
    : brand.mark
      ? `<span class="bricks-product-mark" aria-hidden="true">${brand.mark}</span>`
      : brand.logo
        ? '<img class="bricks-logo" src="/images/bricks-dark-logo.svg" width="85" height="27" alt="">'
        : "";
  const links = page.links ?? [];
  const navLinks = links.map(link => renderLink(link, {
    language,
    current: link[1] === route ? "page" : link[1] === page.current ? "location" : undefined,
  }));
  const apple = page.apple
    ? '<img src="/images/apple-icon-white.svg" width="20" height="20" alt="">'
    : "";
  const action = page.action ? renderLink(page.action, { className: `bricks-nav-action${page.apple ? " download-button" : ""}`, icon: apple, language }) : "";
  const navigation = links.length > 1
    ? `<div class="bricks-desktop-links">${navLinks.join("")}</div>
      <details class="bricks-nav-menu" data-site-menu><summary>${renderText(labels.menu, language)}</summary><div>${navLinks.join("")}</div></details>`
    : navLinks.join("");
  return `<a class="bricks-skip-link" href="#main">${renderText(labels.skip, language)}</a>
  <header class="bricks-header">
    <nav class="bricks-nav"${renderAria(labels.nav, language)}>
      ${renderLink([brand.logo ? "" : brand.name, page.home ?? brand.home, labels.home(brand.name)], { className: "bricks-brand", icon: brandImage, language })}
      ${navigation || action ? `<div class="bricks-nav-actions">${navigation}${action}</div>` : ""}
    </nav>
  </header>`;
}

function renderFooter(page, labels, language, path) {
  const renderItem = link => {
    // Keep the old Calc fragment usable by taking it to the new catalog link.
    const anchor = path === "calc/index.html" && link[1] === calcGuides ? ' id="guides"' : "";
    return `<li${anchor}>${renderLink(link, { language })}</li>`;
  };
  const group = (title, links) => `<section class="bricks-footer-group">
      <h2>${renderText(title, language)}</h2>
      <ul>${links.map(renderItem).join("")}</ul>
    </section>`;
  const dot = '<span class="bricks-footer-separator" aria-hidden="true">·</span>';
  const appearance = `<div class="bricks-footer-setting" role="group"${renderAria(labels.appearance, language)} data-site-theme hidden>
        <span class="bricks-footer-label" aria-hidden="true">${renderText(labels.appearance, language)}</span>
        <div class="bricks-footer-options">${["auto", "light", "dark"].map(theme =>
          `<button type="button" data-theme-choice="${theme}" aria-pressed="${theme === "auto"}">${renderText(labels[theme], language)}</button>`
        ).join(dot)}</div>
      </div>`;
  const languages = page.bilingual
    ? `<div class="bricks-footer-setting" role="group"${renderAria(labels.language, language)}>
        <span class="bricks-footer-label" aria-hidden="true">${renderText(labels.language, language)}</span>
        <div class="bricks-footer-options">${["en", "es"].map(locale => {
          if (locale === language) return `<span aria-current="page" lang="${locale}">${locale.toUpperCase()}</span>`;
          const target = "/" + localePath(path, locale).replace(/(^|\/)index\.html$/, "$1");
          return `<a href="${target}" lang="${locale}" hreflang="${locale}" data-site-language="${locale}" aria-label="${locale === "es" ? "Español" : "English"}">${locale.toUpperCase()}</a>`;
        }).join(dot)}</div>
      </div>`
    : "";
  const logo = '<img src="/images/bricks-dark-logo.svg" width="78" height="24" alt="">';
  const socials = [
    ["instagram", labels.instagram, "https://www.instagram.com/hellobricksapps/"],
    ["linkedin", labels.linkedin, "https://www.linkedin.com/company/bricksapps/"],
  ];
  return `<footer class="bricks-footer">
  <div class="bricks-footer-inner">
    <nav class="bricks-footer-columns"${renderAria(labels.footerNav, language)}>
      <div class="bricks-footer-brand">
        ${renderLink(["", "/", labels.home("Bricks Apps")], { className: "bricks-footer-logo", icon: logo, language })}
        <p>${renderText(labels.tagline, language)}</p>
        <div class="bricks-footer-socials">${socials.map(([icon, label, href]) => renderLink(["", href, label], {
          icon: `<img src="/images/icon-${icon}.svg" width="15" height="15" alt="">`, language,
        })).join("")}</div>
      </div>
      ${group(calc.name, [
        [labels.mortgageCalculator, calc.home], [labels.firstTimeBuyers, "/homebuyers.html"],
        [labels.refinancing, "/refinance.html"], [labels.mortgageGuides, calcGuides],
      ])}
      ${group(labels.apps, [
        ["Bricks Scan", "/scan.html"], ["Bricks Leads", "/leads.html"], ["Bricks Living", "/living.html"],
      ])}
      ${group(labels.devTools, [
        [appCut.name, appCut.home], [ascGui.name, ascGui.home], [labels.appCutGuides, appCutGuides[1]],
      ])}
      ${group(bricks.name, [
        [labels.about, "/about.html"], [labels.purchase, "/purchase-guide-01.html"],
        [labels.help, "/support.html"], [labels.helpCenter, "/help.html"],
        [labels.vote, "https://bricksapps.userjot.com"], [labels.feedback, "/survey.html"], ["hello@bricks.pe", "mailto:hello@bricks.pe"],
      ])}
    </nav>
    <div class="bricks-footer-settings">${languages}${appearance}</div>
    <div class="bricks-footer-bottom">
      <span>${renderText(labels.copyright, language)}</span>
      <div>${renderLink([labels.privacy, "/privacy.html"], { language })}${renderLink([labels.terms, "/terms.html"], { language })}</div>
    </div>
  </div>
  </footer>`;
}

export function renderPage(path, source, { language: locale } = {}) {
  const page = sitePages.get(path);
  if (!page) throw new Error(`Unknown layout route: ${path}`);
  const ctaIconSlot = "<!-- site:cta-icon -->";
  const hasDownloadCta = source.includes(ctaIconSlot);
  if (hasDownloadCta) {
    const iconPath = page.brand.ctaIcon ?? page.brand.icon;
    if (!iconPath) throw new Error(`Missing download CTA icon for ${path}`);
    const icon = `<img class="bricks-cta-icon" src="${escapeHTML(iconPath)}" width="144" height="144" alt="">`;
    source = source.replaceAll(ctaIconSlot, () => icon);
  }
  const route = `/${path.replace(/(^|\/)index\.html$/, "$1")}`;
  const language = locale ?? page.language ?? "en";
  const labels = page.localized
    ? Object.fromEntries(Object.keys(copy.en).map(key => [key, key === "home"
      ? name => ({ en: copy.en.home(name), es: copy.es.home(name) })
      : { en: copy.en[key], es: copy.es[key] }]))
    : copy[language];
  if (page.bilingual && locale === "es") {
    source = source.replace(/(<html\b[^>]*\blang=")[^"]+"/i, '$1es"')
      .replace(/\s*<meta\b[^>]*\bname="robots"[^>]*>/i, "")
      .replace("</head>", '  <meta name="robots" content="noindex, follow">\n</head>');
    if (page.spanishTitle) source = source.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHTML(page.spanishTitle)}</title>`);
  }
  const styles = (page.styles ?? []).map(name => `\n  <link rel="stylesheet" href="/assets/site/${name}.css">`).join("");
  const scripts = (page.scripts ?? []).map(name => `\n  <script type="module" src="/assets/site/${name}.js"></script>`).join("");
  const enhancements = page.entry
    ? '\n  <script type="module" src="/assets/site/page-interactions.js"></script>'
    : "";
  const slots = new Map([
    ["<!-- site:head -->", '<link rel="stylesheet" href="/assets/site/layout.css">' +
      (hasDownloadCta ? '\n  <link rel="stylesheet" href="/shared-download-cta.css">' : "") +
      '\n  <script src="/assets/site/preferences.js" defer></script>' +
      (page.links?.length > 1 ? '\n  <script src="/assets/site/navigation.js" defer></script>' : "") + styles + enhancements + scripts],
    ["<!-- site:header -->", renderHeader(page, labels, route, language)],
    ["<!-- site:footer -->", renderFooter(page, labels, language, path)],
  ]);
  for (const [marker, html] of slots) {
    if (source.split(marker).length !== 2) throw new Error(`Expected one ${marker} in ${path}`);
    source = source.replace(marker, () => html);
  }
  return source;
}

