# Célébrations — point d’entrée IA

Ce fichier est un **routeur**, pas une description exhaustive. Commencer ici, puis ne charger que la zone utile à la tâche.

## 1. Vérifier l’état réel avant d’agir

1. Vérifier `main`, les commits récents, PR/issues pertinentes et le dernier déploiement GitHub Pages.
2. Lire les fichiers réellement chargés par `index.html` ou `admin.html` pour la zone touchée : leur ordre de chargement compte.
3. Si la tâche touche aux données, vérifier le projet Supabase référencé par `supabase-data.js`, puis le schéma, les migrations, RLS/policies et Edge Functions concernés. Ne jamais recopier une ancienne référence Supabase sans la vérifier.
4. Distinguer explicitement : **présent dans le code** / **testé techniquement** / **vérifié fonctionnellement** / **expérience correcte pour l’audience concernée**.
5. Les commits et anciens fichiers expliquent l’histoire ; ils ne prouvent pas l’état actuel.

Hiérarchie de vérité : **code chargé + Supabase réel (données/schéma/RLS) + tests/vérifications + comportement déployé** → contrats/principes maintenus → état opérationnel → `README.md` → historique. En cas de divergence, identifier ce qui est périmé et remettre les sources utiles en cohérence ; ne pas choisir silencieusement.

## 2. Sources de vérité et état durable

- `README.md` : architecture générale, pas journal d’état.
- `index.html` : composition réelle du public ; `admin.html` : composition réelle de l’admin.
- `app-data.js` : forme d’état partagée en mémoire. Supabase reste canonique pour les données métier.
- `supabase-data.js` : tables réellement lues et projet Supabase actuellement référencé.
- `admin-supabase-core.js` : persistance admin et synchronisation métier.
- `PARKED_FEATURES.md` : capacités volontairement conservées mais hors expérience actuelle. **Ne pas les réactiver lors d’un nettoyage.**
- `.github/workflows/pages.yml` : déploiement actuel sur GitHub Pages depuis `main`.

État produit important au moment où ce routeur est créé : l’expérience publique chargée par `index.html` active `public-universal-mode.js`; l’admin active `admin-universal-access.js`. Les anciennes capacités profils/participants/audiences existent encore mais sont mises en veille : vérifier `PARKED_FEATURES.md` avant toute intervention dans cette zone. Cet état opérationnel doit toujours être re-vérifié dans les entrées HTML et le code chargé, pas mémorisé comme vérité éternelle.

## 3. Invariant de modèle à préserver

Toujours raisonner en quatre responsabilités distinctes, même si le code actuel les représente imparfaitement :

**contenu canonique → association/assignation → visibilité → expérience rendue**

- **Contenu canonique** : ce qui existe (contenu de bibliothèque, texte/ressource, étape, rendez-vous, célébration).
- **Association / assignation** : où ou à qui il est relié. Aujourd’hui, les associations contenu↔étape et contenu↔rendez-vous sont notamment matérialisées par `celebrations_step_contents` et `celebrations_event_contents`; l’ancien modèle d’audience utilise aussi des champs `audience` et des groupes.
- **Visibilité** : décision d’accès/affichage dans le contexte courant. Ne pas confondre un champ d’audience, une association et une règle de visibilité.
- **Expérience rendue** : résultat après contenu, associations, règles, contexte, ordre et présentation.

Ne pas dupliquer un contenu canonique pour fabriquer une variante d’expérience si une relation ou règle explicite suffit. Une vue personnalisée, un cache ou une représentation calculée ne devient pas canonique par commodité frontend.

## 4. Lire seulement la zone touchée

### Contenu / bibliothèque
Lire d’abord `supabase-data.js`, puis `admin-content-details.js`, `admin-library-view.js` et/ou `admin-connect.js` selon l’éditeur concerné, le rendu public `public-library-simple.js` ou `public-v3.js`, et les relations seulement si la tâche touche aux associations (`admin-day-content-actions.js`, `admin-relations-safety.js`). Ne pas charger les profils/participants sauf si l’audience est réellement concernée. Une modification de présentation ne doit pas modifier silencieusement le contenu canonique.

### Profils / groupes / audiences / personnalisation
Lire `PARKED_FEATURES.md` **avant tout**, puis uniquement les fichiers réellement chargés et les données concernées : `public-universal-mode.js`, `admin-universal-access.js`, `app-data.js`, `supabase-data.js`; consulter `public-profile-gate.js`, `admin-participants.js` ou les Edge Functions d’audience/accès seulement si la tâche vise explicitement la capacité mise en veille. Vérifier tables/policies Supabase avant de conclure. Toujours distinguer « ce contenu existe » de « ce contenu est destiné à cette personne ».

### Étapes / parcours
Lire `admin-date-rules.js`, `admin-day-content-actions.js`, les tables `celebrations_steps` / `celebrations_step_contents`, puis le rendu `public-date-rules.js`, `public-program-compact.js` et/ou `public-v3.js` selon ce qui est chargé. Identifier étapes canoniques, ordre, associations et visibilité avant de corriger le rendu. Ne pas masquer un problème de modèle par du CSS ou un filtre local.

### Rendez-vous
Lire `celebrations_events`, `celebrations_event_contents`, `celebrations_links`, puis `admin-relations-safety.js` / l’éditeur réellement actif et le rendu programme public. Distinguer définition du rendez-vous, rattachement à l’étape/célébration, audience/état éventuel et rendu. Une modification d’association ne justifie pas une duplication du rendez-vous ou du contenu.

### Administration
Commencer par `admin.html`, puis le script qui porte la responsabilité modifiée. Préserver les actions distinctes : créer/modifier un contenu, associer/retirer une association, modifier audience/visibilité, ordre, masquage et suppression lorsqu’elles sont distinctes dans le produit. Attention : plusieurs scripts redéfinissent certaines fonctions ; l’ordre de `admin.html` détermine l’implémentation active.

### Supabase / sécurité
Vérifier que l’URL/projet de `supabase-data.js` correspond au projet connecté, puis inspecter uniquement les tables, contraintes, migrations, RLS/policies, storage et Edge Functions touchés. Le public lit actuellement plusieurs tables métier via RLS ; les écritures passent par les mécanismes admin dédiés. **Ne jamais contourner RLS dans le frontend.** Les migrations Supabase ne sont pas stockées dans ce dépôt : les vérifier dans le projet Supabase réel.

## 5. Mutations sûres

Avant suppression ou changement structurel : trouver dépendances et associations, mesurer les profils/utilisateurs concernés, conserver les données jusqu’à validation du nouvel état. Quand applicable : **créer le nouvel état valide → basculer → vérifier → nettoyer l’ancien**.

Les relations existantes sont importantes : retirer une association contenu↔étape/rendez-vous ne doit pas supprimer le contenu canonique ; supprimer un contenu exige au contraire de traiter explicitement ses associations et médias. Une amélioration ne doit pas supprimer silencieusement une capacité existante ou réactiver une capacité mise en veille.

## 6. Validation proportionnelle

Séquence préférée : **inspection → test ciblé → vérification fonctionnelle → validation multi-profils/audiences si concernée → validation plus large si nécessaire**.

- Documentation seule : vérifier surtout exactitude, chemins et cohérence avec `main`/Supabase.
- UI locale : vérifier le flux concerné et les régressions proches.
- Modèle, assignation, audience, visibilité ou RLS : validation plus profonde.
- Ne pas déclarer « vérifié » parce que le code existe ou qu’une requête fonctionne.

Si personnalisation/audience est active ou modifiée, couvrir les scénarios réellement supportés parmi : audience ciblée, autre audience, partagé (`all`), non assigné, masqué, plusieurs associations, public/admin. Dans le mode universel actuel, ne pas simuler une validation multi-profils fictive : signaler que la capacité est mise en veille et tester ce qui est réellement actif, sauf si la tâche consiste précisément à la réactiver.

Il n’y a pas actuellement de suite de tests automatisés dans le dépôt. GitHub Pages déploie le contenu statique ; un déploiement réussi prouve le pipeline, pas la qualité fonctionnelle.

## 7. Passation sans journal massif

Pour une session importante, privilégier le commit/PR et mettre à jour un document existant seulement si une vérité durable a changé. La passation doit permettre de retrouver : changement réel, vérifications effectuées, audiences/groupes touchés, changement de modèle/migration, hypothèses restantes, tests manquants et prochaine action utile.

Ne créer un autre Markdown de passation que si aucune source existante ne peut porter cette information sans devenir trompeuse. Ne pas transformer `AI_START_HERE.md` en changelog.

## 8. Contrôle avant fin de session

- Tous les chemins cités existent encore et correspondent aux scripts réellement chargés.
- `AI_START_HERE.md` reste court et sélectif ; il ne répète pas le README.
- Contenu, association/assignation, visibilité et rendu restent conceptuellement séparés.
- Aucun état éphémère n’est présenté comme invariant sans instruction de re-vérification.
- Toute divergence documentation/implémentation rencontrée a été signalée ou corrigée.
- La prochaine conversation peut reprendre la zone utile sans lire tout le dépôt.
