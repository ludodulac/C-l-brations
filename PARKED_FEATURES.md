# Fonctionnalités mises en veille

Ces capacités sont conservées volontairement mais ne font plus partie de l'expérience actuelle.

## Profils Porteur / Non-porteur

État actuel : désactivé dans l'interface publique et l'administration. Le site fonctionne en accès universel et considère tous les contenus/rendez-vous comme visibles pour tout le monde.

Éléments conservés :
- données `audience` existantes ;
- table `celebrations_groups` ;
- `celebrations_participants.audience` ;
- logique historique dans les scripts existants.

Point d'activation actuel :
- `public-universal-mode.js` force l'expérience publique universelle ;
- `admin-universal-access.js` masque les réglages d'audience dans l'administration.

## Comptes participants / inscription

État actuel : désactivé. Toute personne disposant du lien public entre directement sur le site.

Éléments conservés :
- `public-profile-gate.js` et `public-profile-gate.css` ;
- `admin-participants.js` ;
- tables `celebrations_participants`, `celebrations_participant_sessions` et données associées ;
- fonction Supabase `celebrations-access`.

Pour restaurer cette capacité plus tard, réévaluer d'abord le modèle produit souhaité puis réintroduire explicitement les scripts dans `index.html` / `admin.html`. Ne pas supprimer les données existantes lors de la remise en service.

## Principe

Ne pas réactiver automatiquement ces fonctions lors d'un nettoyage ou d'une refactorisation. Elles doivent revenir uniquement sur demande produit explicite.
