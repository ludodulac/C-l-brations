const FOOTER_PAGE_DEFS={
  'mentions-legales':{title:'Mentions légales',template:`# Mentions légales

## Éditeur du site
[Indiquez le nom et le prénom si l’éditeur est une personne physique, ou la dénomination sociale si c’est une structure.]
[Indiquez, si nécessaire, la forme juridique et le capital social.]
[Adresse postale complète]
[Adresse e-mail de contact]
[Numéro de téléphone]
[Numéro SIREN / SIRET / RCS / RNE et TVA intracommunautaire si ces mentions s’appliquent à votre situation.]

## Directeur de la publication
[Indiquez le nom et la qualité de la personne responsable de la publication du site.]

## Hébergement
[Indiquez le nom ou la raison sociale de l’hébergeur, son adresse et son numéro de téléphone. Pour ce site, vérifiez les informations contractuelles exactes de l’hébergement Cloudflare avant publication.]

## Propriété intellectuelle
[Expliquez qui détient les droits sur les textes, images, photographies, illustrations, enregistrements et autres contenus publiés. Précisez les crédits ou autorisations nécessaires pour les contenus qui ne vous appartiennent pas.]

## Liens externes
[Expliquez que certains contenus peuvent renvoyer vers des services ou sites tiers et précisez, si vous le souhaitez, que l’éditeur n’en contrôle pas le contenu.]

## Contact
[Indiquez l’adresse e-mail ou le moyen de contact à utiliser pour toute question relative au site.]`},
  confidentialite:{title:'Déclaration de confidentialité',template:`# Déclaration de confidentialité

## Responsable du traitement
[Indiquez l’identité et les coordonnées de la personne ou de l’organisme qui décide de l’utilisation des données personnelles. Ajoutez les coordonnées du DPO s’il y en a un.]

## Données concernées
[Listez uniquement les données réellement collectées : par exemple nom, adresse e-mail, informations de connexion, messages envoyés, données techniques nécessaires au fonctionnement du site.]

## Pourquoi ces données sont utilisées
[Décrivez chaque finalité de manière concrète.]

## Base légale
[Pour chaque finalité, précisez la base légale appropriée.]

## Caractère obligatoire ou facultatif
[Précisez quelles informations sont obligatoires et lesquelles sont facultatives.]

## Destinataires et prestataires
[Indiquez qui peut accéder aux données et les prestataires techniques réellement concernés.]

## Durées de conservation
[Indiquez une durée précise ou les critères qui permettent de la déterminer.]

## Transferts hors de l’Union européenne
[Indiquez les éventuels transferts et garanties applicables.]

## Vos droits
[Expliquez comment exercer les droits applicables.]

## Réclamation auprès de la CNIL
[Indiquez que la personne peut adresser une réclamation à la CNIL.]

## Sécurité
[Décrivez brièvement les mesures raisonnables mises en œuvre.]

## Mise à jour de cette déclaration
[Indiquez la date de dernière mise à jour.]`},
  cookies:{title:'Politique de cookies',template:`# Politique de cookies

## À quoi sert cette page ?
[Expliquez simplement si le site utilise des cookies, du stockage local ou d’autres traceurs, et dans quel but.]

## Traceurs strictement nécessaires
[Listez les cookies ou stockages indispensables : session, sécurité et préférences.]

## Mesure d’audience
[Indiquez l’outil réellement utilisé ou précisez qu’aucune mesure d’audience n’est utilisée.]

## Contenus et services externes
[Indiquez les services tiers susceptibles d’être ouverts ou chargés depuis le site.]

## Cookies soumis au consentement
[Listez les catégories non essentielles réellement utilisées.]

## Accepter, refuser ou retirer son choix
[Expliquez comment modifier ou retirer son consentement lorsqu’il est requis.]

## Durée de conservation du choix
[Indiquez pendant combien de temps le choix est mémorisé.]

## Liste détaillée des cookies et traceurs
[Ajoutez si nécessaire le nom, fournisseur, finalité, type et durée.]

## Mise à jour de la politique
[Indiquez la date de dernière mise à jour.]`}
};
function defaultFooterPagesState(){const pages={};Object.entries(FOOTER_PAGE_DEFS).forEach(([slug,def])=>{pages[slug]={activeId:null,nextNumber:2,drafts:[{id:`new-${slug}-1`,number:1,title:'Brouillon 1',text:def.template,saved:false,updatedAt:null}]}});return {version:2,pages}}
let footerPagesMemory=defaultFooterPagesState();
function loadFooterPagesState(){return footerPagesMemory}
function saveFooterPagesState(data){footerPagesMemory=data;return data}
function getFooterPageDraft(data,slug,id){return data.pages?.[slug]?.drafts?.find(d=>String(d.id)===String(id))||null}
function getActiveFooterPageDraft(data,slug){const p=data.pages?.[slug];return p?.activeId?getFooterPageDraft(data,slug,p.activeId):null}
