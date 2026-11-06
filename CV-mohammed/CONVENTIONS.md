# Portfolio et CV de Mohammed KELLA BENNANI

Site statique publié sur GitHub Pages : https://medbk1997.github.io/CV/CV-mohammed/
Dépôt : github.com/Medbk1997/CV (racine `C:\CV`, le site est dans `CV-mohammed/`).

## Règles de travail
- Toujours répondre en français.
- Analyser et expliquer (quoi, pourquoi, avantages, inconvénients, impacts) **avant** toute modification ; attendre la validation pour les changements de contenu ou de design.
- Ne jamais commiter ni pousser sans demande explicite.
- Ne jamais inventer d'expérience, de compétence ou de résultat : le contenu du CV fait foi. Playwright = formation en cours, pas une expertise.
- Aucune date ni mention de disponibilité (portfolio, CV, PDF, assistant) : supprimée à la demande de Mohammed. Les dates de mission restent.
- Aucune technique de manipulation des ATS : pas de texte caché, blanc ou minuscule, pas d'injection de consignes pour IA, pas de bourrage de mots-clés.

## Fichiers
- `index.html` : portfolio interactif (Tailwind compilé, icônes Lucide, assistant IA via le relais).
- `cv.html` : CV une page A4, export PDF par `window.print()` (et `?print=1`).
- `worker/` : relais Cloudflare vers Gemini ; la clé reste un secret Cloudflare, jamais dans le code.
- `assets/` : **toutes** les ressources (polices, CSS, scripts, images, logos). Autonomie obligatoire : aucune ressource chargée depuis un site externe (CDN, Google Fonts, raw.githubusercontent…). Un nouveau logo ou une nouvelle police se télécharge dans `assets/`.
- `assets/logos/originaux/` : fichiers sources des logos Sogeti et URSSAF (non utilisés par les pages).
- `tailwind.config.cjs` : après tout ajout ou changement de classes Tailwind ou d'icône Lucide dans `index.html`, lancer `npm run build` (CSS + icônes).
- `tests/` : tests Playwright uniquement. `tools/` : serveur local, captures, comparaison, génération des icônes, source Tailwind.
- `docs/prototypes/` : maquettes interactives qui ont mené au design actuel ; `docs/archives/` : anciennes explorations. Elles ne sont liées depuis aucune page.
- `screenshots/` : dossier de travail local (ignoré par Git) pour les captures et aperçus.
- Section « Mon environnement et mes outils » : galaxie 3D (canvas, sans bibliothèque), HP ALM au centre, liens typés dans `GX_LINKS` (module ALM, usage en mission, intégration documentée, à découvrir). Les liens d'intégration s'appuient sur la documentation des éditeurs ; ne pas en ajouter sans source.
- Les URL publiques `index.html` et `cv.html` ne doivent jamais changer d'emplacement (QR code, liens partagés).

## Contraintes
- Le CV doit tenir sur **une seule page A4** et rester lisible par les ATS : vrai texte, titres de sections standards, ordre de lecture logique dans le code HTML.
- Compatibilité : Chrome et Samsung Internet (Android), Safari iPhone/iPad (et Chrome iOS, qui utilise le même moteur WebKit), Firefox.
- Les fichiers HTML ne s'ouvrent pas correctement dans l'aperçu iOS (WhatsApp, Fichiers) : on partage le lien du site et le PDF, pas le fichier HTML.

## Commandes (dans `CV-mohammed/`)
- `npm test` : tests Playwright (6 profils : Chrome, Firefox, Safari, iPhone, Android, iPad). Le relais IA est toujours simulé dans les tests.
- `npm run serve` : serveur local sur http://localhost:8000/
- `npm run screenshots -- <nom>` puis `node tools/compare.mjs <avant> <apres>` : captures multi-appareils et comparaison pixel par pixel. À utiliser avant/après chaque changement visuel.
- `npm run build` : recompile Tailwind et le jeu d'icônes Lucide.
