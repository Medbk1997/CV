# Mettre en ligne le CV et activer l'assistant IA

Trois fichiers : `index.html` (le CV), `worker.js` (le relais IA) et ce guide. Le CV fonctionne seul. Le relais ajoute les réponses générées par IA et la notification des questions.

## 1. Publier le CV sur GitHub Pages (5 minutes)

1. Dans ton dépôt `Medbk1997/CV`, remplace `index.html` par le nouveau fichier (à la racine).
2. Dépôt → Settings → Pages → Source : branche `main`, dossier `/ (root)` → Save.
3. Ton CV est alors en ligne sur `https://medbk1997.github.io/CV/`.

Les images sont appelées par leur nom actuel. Si tu les renommes, mets à jour `ASSET` et `LOGOS` en haut du script de `index.html`, ainsi que l'URL de la photo dans la balise `<img id="profilePhoto">`. Des noms courts et sans espaces (`photo.jpg`, `logo-sogeti.png`) sont plus sûrs.

## 2. Créer le relais IA (Cloudflare, offre gratuite)

1. Crée un compte sur cloudflare.com, puis Workers & Pages → Create → Create Worker, nomme-le `cv-assistant` et clique sur Deploy.
2. Clique sur Edit code, remplace tout le contenu par `worker.js`, puis Deploy.
3. Worker → Settings → Variables and Secrets : ajoute ces valeurs (type Secret pour les clés) :

| Nom | Valeur |
|---|---|
| `ALLOWED_ORIGINS` | `https://medbk1997.github.io` (l'adresse sans le `/CV/` final. Plusieurs adresses : sépare-les par une virgule.) |
| `GROQ_API_KEY` | clé gratuite créée sur console.groq.com |
| `GEMINI_API_KEY` | clé créée sur Google AI Studio |
| `MISTRAL_API_KEY` | clé créée sur la console Mistral (facultatif) |
| `OPENROUTER_API_KEY` | clé créée sur openrouter.ai (facultatif) |

Une seule clé suffit. Le relais essaie les fournisseurs dans l'ordre Groq, Gemini, Mistral, OpenRouter, jusqu'à obtenir une réponse. Les offres gratuites ont des quotas et des conditions qui changent : vérifie-les. Les noms de modèles aussi : si une réponse échoue, contrôle le nom du modèle dans la documentation du fournisseur et définis `GROQ_MODEL`, `GEMINI_MODEL`, `MISTRAL_MODEL` ou `OPENROUTER_MODEL`.

## 3. Recevoir les questions des recruteurs

Option simple, ntfy :

1. Installe l'application ntfy sur ton téléphone (ntfy.sh).
2. Abonne-toi à un sujet au nom long et aléatoire, par exemple `cv-mkb-x7k29qz81f`. Toute personne qui connaît ce nom peut lire les messages.
3. Ajoute la variable `NTFY_TOPIC` avec ce nom dans le Worker.

Option Telegram : crée un bot avec @BotFather, puis ajoute `TELEGRAM_BOT_TOKEN` et `TELEGRAM_CHAT_ID`.

Tu reçois le texte de chaque question. L'adresse IP du visiteur n'est ni transmise ni conservée.

## 4. Brancher le CV au relais

1. Copie l'adresse du Worker (`https://cv-assistant.<ton-compte>.workers.dev`).
2. Dans `index.html`, en haut du script, renseigne `relayUrl` dans `CONFIG`. Tu peux aussi renseigner `phone` pour afficher ton numéro.
3. Republie `index.html` sur GitHub.

Test rapide : ouvre le CV, clique sur l'assistant et pose une question. Tu dois recevoir une réponse et la notification. Si le relais est indisponible, l'assistant bascule tout seul sur ses réponses prédéfinies.

## À savoir

- Le prompt caché est dans `worker.js`, côté Cloudflare : le visiteur ne le voit pas. Une personne qui insiste peut tout de même tenter de le faire réciter à l'IA. N'y mets rien de confidentiel.
- Les clés d'API ne doivent jamais apparaître dans `index.html` ni dans le dépôt GitHub, qui est public.
- Le CV annonce aux visiteurs que leurs questions peuvent t'être transmises. Garde cette mention : tu traites des données personnelles.
- Le prompt demande une IA qui valorise ton profil, mais sans rien inventer. Mets-le à jour dans `worker.js` quand ta situation change (nouvelle certification, nouveau poste).
