# Célébrations des Archanges

Interface publique et d’administration pour gérer et consulter les célébrations des Archanges.

## Fonctionnalités

- Interface publique mobile-first.
- Couleurs d’accent par Archange : Michaël rouge, Raphaël vert, Gabriel bleu foncé, Ouriel jaune.
- Profils visiteurs : Porteurs d’Ange, Non-porteurs d’Ange ou vue complète.
- Programme structuré par étapes et rendez-vous.
- Bibliothèque de contenus : PDF, audio, texte, vidéo, image et lien.
- Administration protégée pour gérer les célébrations, contenus, groupes, participants et pages de pied de page.
- Stockage partagé des données et médias via Supabase.

## Architecture actuelle

Le site est une application front-end statique déployée sur GitHub Pages.

- `index.html` : entrée du site public.
- `admin.html` : entrée de l’administration.
- `app-data.js` : modèle de données et fonctions partagées.
- `public-*.js` / `public-*.css` : fonctionnalités et présentation du site public.
- `admin-*.js` / `admin-*.css` : fonctionnalités et présentation de l’administration.
- `supabase-client.js` : initialisation du client Supabase.
- `supabase-data.js` : lecture des données et accès aux médias Supabase.
- `admin-supabase-core.js` : synchronisation des modifications de l’administration avec Supabase.
- `.github/workflows/pages.yml` : déploiement automatique sur GitHub Pages.

## Données et authentification

Supabase est la source canonique des données métier. Le navigateur ne conserve localement que certaines préférences d’interface et le jeton de session administrateur.

L’administration utilise des fonctions Supabase dédiées pour l’authentification et les opérations d’écriture. Les médias sont stockés dans le bucket Supabase prévu à cet effet.

## Développement

Le projet utilise actuellement du HTML, du CSS et du JavaScript natifs, sans étape de build. Les scripts sont chargés directement par les pages HTML ; leur ordre de chargement fait donc partie de l’architecture et doit être préservé lors des modifications.
