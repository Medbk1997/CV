# Relais Gemini du portfolio

Le relais garde la clé Gemini côté serveur. Ne la placez jamais dans `index.html`, dans Git ou dans une conversation.

## Déploiement

Depuis ce dossier, connectez Wrangler à votre compte Cloudflare puis déployez :

```powershell
npx wrangler login
npx wrangler deploy
```

Le Worker autorise le portfolio publié (`https://medbk1997.github.io`) et le serveur local de développement (`http://localhost:8000`). Adaptez `ALLOWED_ORIGINS` dans `wrangler.toml` si le domaine du portfolio change.

## Où saisir la clé

Dans le tableau de bord Cloudflare : **Workers & Pages → `cv-gemini-relay` → Settings → Variables and Secrets → Add → Secret**.

- Nom : `GEMINI_API_KEY`
- Valeur : votre clé créée dans [Google AI Studio](https://aistudio.google.com/apikey)

En ligne de commande, l’équivalent est `npx wrangler secret put GEMINI_API_KEY` depuis ce dossier. La valeur est demandée dans le terminal et n'est pas écrite dans les fichiers du projet.

## Relier le portfolio

L'URL communiquée pour ce Worker est `https://cv-gemini-relay.mohammedkella8.workers.dev`. Une requête `GET /` doit répondre `cv-gemini-relay is running`; le portfolio envoie des requêtes `POST /` avec une action `chat` ou `analyze-offer`. Le chemin Gemini direct `/v1beta/models/gemini-1.5-flash:generateContent` n'est pas utilisé par cette intégration.

Après avoir déployé cette version du Worker et vérifié que la clé secrète `GEMINI_API_KEY` est configurée, collez `https://cv-gemini-relay.mohammedkella8.workers.dev/` dans `CONFIG.relayUrl` au début du script de `index.html`. Laissez cette valeur vide tant que le Worker n'accepte pas les requêtes `POST /` : l'assistant et l'analyse par mots-clés resteront locaux.

Avant de publier l'URL du Worker, configurez également une règle Cloudflare de limitation de débit sur les requêtes `POST` vers ce Worker afin de réduire les abus et la consommation de quota Gemini.

Les questions et le texte d'une offre soumis lorsque le relais est activé sont transmis à Google Gemini. Ne collez pas de données personnelles ou confidentielles dans l'offre.
