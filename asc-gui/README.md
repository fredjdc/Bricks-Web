# ASC GUI landing page

Static page at `/asc-gui/`. Matches `../app-preview-editor/index.html` and reuses its stylesheet for the Bricks palette, typography, controls, and responsive foundation. Page-specific layout lives in `styles.css`. No JavaScript or build step is needed; FAQ and mobile navigation use native `details` elements.

## Replace the images

All images are illustrative placeholders generated with the built-in imagegen tool, not captures of the shipping app. Demo content uses the fictional app **Field Notes**, version **2.4**. Full prompts are recorded in `assets/image-prompts.md`.

| File | Ratio | Intended replacement |
| --- | --- | --- |
| `assets/workspace-placeholder.png` | 16:9 landscape | Localization workspace with app/version identity, English and Spanish, local draft, Save, and build inspector |
| `assets/media-placeholder.png` | 4:3 landscape | Existing screenshot ordering and preview preparation for one locale/device group |
| `assets/automation-placeholder.png` | 4:3 landscape | Reviewed Prepare Release plan with separate iOS and macOS targets |

Replace each file in place to preserve links. Any image size at the same ratio works; update the HTML width/height attributes to match its intrinsic dimensions. Images use `object-fit: contain` to avoid cropping the interface, and open at full size when selected. Prefer readable crops for the two 4:3 details.

After adding authentic captures, update the adjacent `figcaption`, alt text, and image-link accessible label to describe what is actually shown. Remove the concept/demo qualification only when the image really is a product capture. Use consented demo content and hide credentials, passwords, and personal contact details.

## Release copy

Source: “ASC GUI — product handoff for the website”, September 8, 2026. Feature copy describes the implementation in that handoff, not verified distribution-build outcomes.

The page explicitly says **In development** and uses **See the workflow** anchors. No download, signup, pricing, trial, customer proof, or minimum OS is invented. Before changing availability, verify release scope and workflows, minimum macOS/hardware, the distribution URL, and product-specific privacy/support details. Replace concept imagery with approved captures.

Keep the local automation runtime explanation beside its feature copy. Preserve the distinctions between Save, review submission, Apple's approval, and release. Do not add promises of exact publication times, complete offline operation, direct binary delivery, translations, or complete App Store Connect replacement.

## Local review

Serve the repository with `python3 -m http.server 8765 --bind 127.0.0.1` and open `/asc-gui/`. Check navigation and FAQ using a keyboard, narrow and wide layouts, and both color schemes when making future visual changes. Keep the existing GitHub Pages deployment workflow; this page needs no new hosting configuration or dependencies.
