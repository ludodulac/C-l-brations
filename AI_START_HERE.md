# Célébrations — point d’entrée IA

## Contexte transversal

Célébrations appartient à l'écosystème **`ludodulac/Grand-pere`**. Grand Père est documenté dans le dépôt `ludodulac/Grand-pere`. En nouvelle conversation : lire Grand Père `AI_START_HERE.md`, la fiche Célébrations via `projects/_INDEX.md` et `LOOP_ENGINEERING.md`, puis revenir ici. **Célébrations reste l'autorité sur code chargé, Supabase, données, règles et comportement déployé.**

Ce fichier est un routeur. Utiliser aussi `PROJECT_MAP.md` et ne charger que la zone utile.

## État réel avant action

Vérifier `main`, commits/PR/issues, Pages, scripts réellement chargés par `index.html`/`admin.html`, et Supabase réel si données. Distinguer présent dans le code / testé / vérifié fonctionnellement / expérience correcte pour l'audience.

## Invariant de modèle

`contenu canonique → association/assignation → visibilité → expérience rendue`.

Ne pas dupliquer un contenu canonique pour fabriquer une variante si une relation explicite suffit. Une vue calculée ne devient pas canonique par commodité frontend.

## Routage

- contenu/bibliothèque → données + admin/rendu concernés ;
- profils/groupes/audiences → vérifier d'abord `PARKED_FEATURES.md` et ce qui est réellement actif ;
- étapes/rendez-vous → distinguer définition, association, ordre/visibilité et rendu ;
- admin → partir de `admin.html`, l'ordre des scripts compte ;
- Supabase/sécurité → vérifier tables/RLS/Edge Functions réelles, jamais contourner RLS côté frontend.

## Boucle

`besoin d'expérience → état réel pour le profil/audience → première divergence contenu/assignation/visibilité/rendu → correction minimale → vérification du profil concerné → CONTINUE/PIVOT/STOP`.

Créer le nouvel état valide avant de nettoyer l'ancien lorsqu'une mutation structurelle l'exige. Une capacité mise en veille ne doit pas être réactivée ou supprimée par accident.

## Passation

Laisser reconstructibles **objectif / dernière boucle / preuve / profils ou audiences touchés / prochaine décision**. Ne pas transformer ce routeur en changelog.
