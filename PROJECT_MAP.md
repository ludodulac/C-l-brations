# Célébrations — carte de navigation

Commencer par `AI_START_HERE.md`. Cette carte sert à éviter de charger les nombreux scripts sans rapport avec la tâche.

## Modèle produit

La personnalisation doit conserver les couches distinctes :
`contenu canonique → affectation audience/profil → visibilité → expérience rendue`.

Ne pas confondre le contenu lui-même avec son affectation ou sa visibilité.

## Routage

- Parcours public / profil visiteur → page et scripts publics réellement chargés, puis données concernées.
- Administration de contenu → `admin.html` et seulement les scripts `admin-*` de la fonction visée.
- Authentification/admin → `admin-auth.js` et politiques backend réelles.
- Règles de dates/célébrations → scripts spécialisés correspondants + données/tests.
- Idée différée → `PARKED_FEATURES.md`; une idée parquée n'est ni une priorité actuelle ni une fonction implémentée.

## Vérification

Avant toute modification de personnalisation, vérifier séparément :
1. contenu canonique ;
2. profil/groupe ciblé ;
3. affectation ;
4. politique de visibilité ;
5. rendu final pour le visiteur concerné.

Préserver les fonctions existantes : améliorer une couche ne doit pas supprimer silencieusement une capacité d'une autre.
