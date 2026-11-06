# CV — Mohammed KELLA BENNANI

Portfolio interactif et CV de Mohammed KELLA BENNANI, Test Lead · QA Engineer (Lyon).

- **Portfolio** : https://medbk1997.github.io/CV/CV-mohammed/
- **CV en ligne (une page A4, export PDF)** : https://medbk1997.github.io/CV/CV-mohammed/cv.html

## Organisation du dépôt

```
.github/workflows/playwright.yml   Tests automatiques à chaque push et pull request
CV-mohammed/
├─ index.html                      Portfolio (adresse publique, ne pas déplacer)
├─ cv.html                         CV une page (adresse publique, ne pas déplacer)
├─ assets/                         Toutes les ressources du site, hébergées localement
│  ├─ css/                         Tailwind compilé, polices
│  ├─ fonts/                       Ubuntu, JetBrains Mono (woff2)
│  ├─ img/                         Photos, QR code
│  ├─ logos/                       Logos utilisés (+ originaux/)
│  └─ vendor/                      Icônes Lucide (uniquement celles utilisées)
├─ worker/                         Relais Cloudflare vers l’API Gemini (assistant IA)
├─ tests/                          Tests Playwright (fonctionnels, accessibilité, autonomie, contenu)
├─ tools/                          Serveur local, captures, comparaison, génération des icônes
└─ docs/                           Prototypes de design et archives
```

## Principes

- **Autonome** : aucune ressource externe (CDN, Google Fonts…) ; tout est dans `assets/`.
- **Testé** sur Chrome, Firefox, Safari, iPhone, Android et iPad, avec contrôle d’accessibilité WCAG (axe-core).
- **Sans secret dans le code** : la clé Gemini est un secret Cloudflare (voir `CV-mohammed/worker/README.md`).

## Commandes (dans `CV-mohammed/`)

```bash
npm install
npx playwright install chromium firefox webkit
npm test            # suite de tests Playwright
npm run serve       # http://localhost:8000/
npm run build       # recompile Tailwind et les icônes après une modification
```
