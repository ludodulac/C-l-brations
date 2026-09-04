# Célébrations des Archanges

Première version de l’interface de consultation et d’administration des célébrations.

## Principes

- Fond blanc, interface mobile-first et navigation courte.
- Couleurs d’accent : Archange Michaël rouge, Archange Raphaël vert, Archange Gabriel bleu foncé, Archange Ouriel jaune.
- Profils visiteurs : Porteurs d’Ange, Non-porteurs d’Ange ou vue complète.
- Programme par Préparation, Mercredi, Jeudi, Vendredi et Samedi.
- Bibliothèque filtrable de contenus : PDF, audio, texte, vidéo, lien.
- Administration pour ajouter des rendez-vous, contenus et catégories.
- Rotation préconfigurée des célébrations pour les prochaines années.

## État actuel

Cette version est un prototype fonctionnel sans backend : les ajouts effectués depuis l’administration sont stockés localement dans le navigateur via `localStorage`.

La prochaine étape technique sera d’ajouter un stockage partagé et une authentification afin que plusieurs administrateurs puissent gérer les mêmes données et téléverser réellement des fichiers.
