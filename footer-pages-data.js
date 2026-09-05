const FOOTER_PAGES_STORAGE_KEY='celebrations-footer-pages-v1';

const FOOTER_PAGE_DEFS={
  'mentions-legales':{
    title:'Mentions légales',
    template:`# Mentions légales

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
[Indiquez l’adresse e-mail ou le moyen de contact à utiliser pour toute question relative au site.]`
  },
  confidentialite:{
    title:'Déclaration de confidentialité',
    template:`# Déclaration de confidentialité

## Responsable du traitement
[Indiquez l’identité et les coordonnées de la personne ou de l’organisme qui décide de l’utilisation des données personnelles. Ajoutez les coordonnées du DPO s’il y en a un.]

## Données concernées
[Listez uniquement les données réellement collectées : par exemple nom, adresse e-mail, informations de connexion, messages envoyés, données techniques nécessaires au fonctionnement du site. Si aucune donnée n’est collectée pour une finalité donnée, dites-le clairement.]

## Pourquoi ces données sont utilisées
[Décrivez chaque finalité de manière concrète : répondre à une demande, administrer le site, sécuriser l’accès, gérer un compte, envoyer une information demandée, etc.]

## Base légale
[Pour chaque finalité, précisez la base légale appropriée : consentement, exécution d’un contrat, obligation légale, intérêt légitime ou autre base applicable.]

## Caractère obligatoire ou facultatif
[Précisez quelles informations sont obligatoires, lesquelles sont facultatives et ce qui se passe si l’utilisateur ne les fournit pas.]

## Destinataires et prestataires
[Indiquez qui peut accéder aux données et les principaux prestataires techniques concernés, uniquement lorsqu’ils interviennent réellement.]

## Durées de conservation
[Indiquez une durée précise ou les critères qui permettent de la déterminer pour chaque catégorie de données.]

## Transferts hors de l’Union européenne
[Indiquez s’il existe des transferts hors UE/EEE et, le cas échéant, les garanties utilisées. S’il n’y en a pas, indiquez-le.]

## Vos droits
[Expliquez comment exercer les droits applicables : accès, rectification, effacement, limitation, opposition, portabilité lorsque celle-ci s’applique, et retrait du consentement lorsqu’un traitement repose sur le consentement.]

## Réclamation auprès de la CNIL
[Indiquez que la personne peut adresser une réclamation à la CNIL et, si vous le souhaitez, ajoutez le lien officiel vers cnil.fr.]

## Sécurité
[Décrivez brièvement les mesures raisonnables mises en œuvre pour protéger les données, sans publier d’informations techniques sensibles.]

## Mise à jour de cette déclaration
[Indiquez la date de dernière mise à jour et expliquez comment les changements importants seront signalés.]`
  },
  cookies:{
    title:'Politique de cookies',
    template:`# Politique de cookies

## À quoi sert cette page ?
[Expliquez simplement si le site utilise des cookies, du stockage local ou d’autres traceurs, et dans quel but. N’annoncez pas de traceurs qui ne sont pas réellement utilisés.]

## Traceurs strictement nécessaires
[Listez les cookies ou stockages indispensables au fonctionnement demandé par l’utilisateur : session, sécurité, préférences indispensables, etc. Indiquez pour chacun son nom, sa finalité et sa durée lorsqu’ils existent.]

## Mesure d’audience
[Indiquez l’outil utilisé, sa finalité, le fournisseur, la durée et si un consentement est requis. Si aucune mesure d’audience n’est utilisée, écrivez-le clairement.]

## Contenus et services externes
[Indiquez les services tiers susceptibles d’être ouverts ou chargés depuis le site, par exemple des plateformes vidéo ou audio. Précisez si leur ouverture ou leur chargement peut entraîner le dépôt de traceurs par ces services.]

## Cookies soumis au consentement
[Listez les catégories non essentielles réellement utilisées. Précisez que ces traceurs ne doivent pas être déposés avant le choix de l’utilisateur lorsqu’un consentement est requis.]

## Accepter, refuser ou retirer son choix
[Expliquez comment accepter ou refuser avec la même simplicité et comment modifier ou retirer son consentement à tout moment. Indiquez l’emplacement du bouton ou du panneau de réglage lorsqu’il existe.]

## Durée de conservation du choix
[Indiquez pendant combien de temps le choix de l’utilisateur est mémorisé avant qu’un nouveau choix soit demandé.]

## Liste détaillée des cookies et traceurs
[Ajoutez, si nécessaire, un tableau ou une liste indiquant : nom du traceur, fournisseur, finalité, type, durée et nécessité du consentement.]

## Mise à jour de la politique
[Indiquez la date de dernière mise à jour et prévoyez de revoir cette page lorsque les outils ou finalités changent.]`
  }
};

function defaultFooterPagesState(){
  const pages={};
  Object.entries(FOOTER_PAGE_DEFS).forEach(([slug,def])=>{
    pages[slug]={activeId:null,nextNumber:2,drafts:[{id:1,number:1,title:`Brouillon 1`,text:def.template,saved:false,updatedAt:null}]};
  });
  return {version:1,pages};
}

function loadFooterPagesState(){
  let data=null;
  try{data=JSON.parse(localStorage.getItem(FOOTER_PAGES_STORAGE_KEY)||'null')}catch(e){}
  if(!data||!data.pages)data=defaultFooterPagesState();
  Object.entries(FOOTER_PAGE_DEFS).forEach(([slug,def])=>{
    if(!data.pages[slug])data.pages[slug]={activeId:null,nextNumber:2,drafts:[{id:1,number:1,title:'Brouillon 1',text:def.template,saved:false,updatedAt:null}]};
    const p=data.pages[slug];
    if(!Array.isArray(p.drafts)||!p.drafts.length)p.drafts=[{id:1,number:1,title:'Brouillon 1',text:def.template,saved:false,updatedAt:null}];
    if(!p.nextNumber)p.nextNumber=Math.max(...p.drafts.map(d=>Number(d.number)||0),1)+1;
  });
  return data;
}

function saveFooterPagesState(data){localStorage.setItem(FOOTER_PAGES_STORAGE_KEY,JSON.stringify(data))}
function getFooterPageDraft(data,slug,id){return data.pages?.[slug]?.drafts?.find(d=>String(d.id)===String(id))||null}
function getActiveFooterPageDraft(data,slug){const p=data.pages?.[slug];return p?.activeId?getFooterPageDraft(data,slug,p.activeId):null}
