const brand = { name: "Bricks Apps", home: "/", logo: true };

export const staticFormsLayouts = {
  "survey.html": { brand, localized: true },
  "purchase-guide-01.html": {
    brand,
    localized: true,
    footer: [
      ["Bricks Leads website", "https://leads.bricks.pe"],
      ["X", "https://x.com/hellobricksapps"],
    ],
  },
};
