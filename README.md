# Fortes Chaleurs & Canicules — Spec produit (MVP atelier)

**Produit :** Landing page de prévention des fortes chaleurs — refonte du site « Fortes Chaleurs & Canicules »
**Source :** Recherche utilisateur d'avril 2026 ([`recherche_utilisateur/`](recherche_utilisateur/)) — 17 entretiens, 347 réponses au questionnaire, 6 tests du site actuel, benchmark 4 pays.
**Usage de ce document :** intrant des maquettes (§ 7 Architecture de la page) et du board GitHub Projects (§ 6 Epics & features).

---

## 1. Vision

Une page unique, **mobile-first** et **DSFR**, qui transforme l'information canicule générique en action concrète : l'utilisateur comprend **en moins de 2 minutes** s'il est vulnérable, ce qu'il doit faire **maintenant**, et comment protéger ses proches. Le produit s'adresse autant aux **relais humains** (aidants, professionnels) qu'aux personnes directement exposées.

## 2. Problème

L'information officielle sur la prévention des fortes chaleurs existe mais n'atteint pas sa cible. Le site actuel (2022) est méconnu, daté et générique — il détruit la crédibilité de la parole publique au lieu de la porter.

Preuves issues de la recherche :

| Constat | Donnée |
|---|---|
| Le site officiel est invisible | **64 %** des répondants ignorent son existence ; **0/8** participants grand public le citent spontanément |
| Le site actuel décrédibilise | 5/6 testeurs le jugent « vieux, pas mis à jour » ; erreurs 404 rencontrées en test, y compris sur « coup de chaleur » |
| Le besoin n°1 est local | **78 %** placent « des informations localisées » dans leur top 3 des attentes |
| Les gestes sont connus mais pas appliqués | **91 %** connaissent ≥ 3 gestes, **34 %** les appliquent (déni de vulnérabilité 26 %, contraintes matérielles 31 %, inertie 22 %) |
| Les plus vulnérables sont hors numérique | Les agents ARS confirment : ce sont les **relais** (aidants, CCAS, voisins) qu'il faut outiller |
| L'auto-diagnostic est plébiscité | **58 %** le classent dans leur top 3 des fonctionnalités souhaitées |

> « Si je tombe sur un site comme ça, je me dis que le sujet n'est pas pris au sérieux. » — Participante, 41 ans, Nanterre
>
> « Si je pouvais faire le test avec ma mère et qu'il lui dit "vous êtes en risque élevé", elle m'écouterait peut-être enfin. » — Aidante, 56 ans, Nîmes
>
> « Je sais qu'il faut boire de l'eau, fermer les volets. Mais sur un chantier à 14h en plein soleil, je fais quoi concrètement ? » — Participant, 44 ans, Avignon

## 3. Objectifs & KPI

| # | Objectif | KPI cible (mesure : plan de marquage, hors périmètre atelier) |
|---|---|---|
| O1 | Rendre le risque personnel tangible | **≥ 40 %** des visiteurs démarrent l'auto-diagnostic ; **≥ 70 %** de ceux qui démarrent vont au bout |
| O2 | Convertir la prise de conscience en action | ≥ 50 % des diagnostics aboutissent à la consultation d'au moins une recommandation personnalisée |
| O3 | Construire un canal de rappel proactif | **≥ 15 %** des visiteurs laissent leur email pour l'alerte canicule |
| O4 | Restaurer la crédibilité institutionnelle | 0 lien cassé, conformité DSFR et RGAA AA, score Lighthouse a11y ≥ 95 |

## 4. Utilisateurs cibles

Personas issus de la recherche (détail dans la [synthèse](recherche_utilisateur/05_synthese_restitution.md)) :

- **Nadia, 36 ans, active urbaine** — appartement plein sud sans clim, 2 enfants. Veut du concret et du local : « il va faire 39° demain chez toi, voilà où aller avec les enfants. »
- **Michel, 72 ans, retraité** — hypertendu, ne se sent pas à risque, peu connecté. **Atteint via sa fille** : le diagnostic sert d'argument d'autorité.
- **Sophie, 48 ans, auxiliaire de vie** — 6 bénéficiaires à domicile. Veut des fiches réflexes imprimables et des protocoles clairs.
- **Karim, 31 ans, chef de chantier** — veut un repère officiel opposable à sa hiérarchie (seuils, droits des travailleurs).

## 5. Périmètre

### Dans le MVP (slice atelier — 100 % côté client)

- Page unique DSFR, mobile-first, accessible RGAA.
- **Auto-diagnostic de vulnérabilité** : logique de scoring entièrement en JS côté client.
- Niveau de vigilance **simulé** (donnée statique en JS — pas d'appel API).
- Capture email = formulaire front uniquement (pas d'envoi réel).

### Hors périmètre (à mentionner dans la page, pas à construire)

| Exclu | Pourquoi |
|---|---|
| Carte de vigilance temps réel (API Météo-France) | Dépendance externe — le MVP simule le niveau d'alerte |
| Annuaire géolocalisé des lieux frais | Nécessite données collectivités + back-end |
| Multilinguisme (en, ar, tr) & FALC complet | Prioritaire en V2, hors slice atelier |
| Espace territoire / outillage ARS, matching, logistique | Ambition produit long terme |
| Envoi réel d'emails, Matomo réel, app native | Pas de serveur ; le benchmark confirme le choix 100 % web responsive |

## 6. Epics & features (→ board)

Priorités : **P0** = le MVP ne sort pas sans ; **P1** = améliore nettement, peut suivre ; **P2** = V2 documentée pour ne pas se fermer de portes.

### EPIC A — Socle DSFR & crédibilité *(répond au Finding #2)*

| Feature | Description | Priorité |
|---|---|---|
| A1. Squelette Vite + DSFR | Projet Vite vanilla, CSS/JS DSFR chargés, page `index.html` | P0 |
| A2. Header + footer DSFR | En-tête Marianne, navigation minimale, footer institutionnel conforme | P0 |
| A3. Qualité technique | 0 lien cassé, responsive mobile-first, Lighthouse a11y ≥ 95 | P0 |

### EPIC B — Information locale & vigilance *(Findings #1, #3)*

| Feature | Description | Priorité |
|---|---|---|
| B1. Bandeau de vigilance | Alerte DSFR en haut de page : niveau de vigilance (simulé) + consigne du moment | P0 |
| B2. Hero orienté action | Titre clair, promesse (« Évaluez votre risque en 2 min »), CTA vers le diagnostic | P0 |
| B3. Bloc « près de chez moi » | Section présentant lieux frais & info locale comme **« à venir »** (teaser V2 honnête) | P1 |

### EPIC C — Auto-diagnostic de vulnérabilité *(Findings #5, #6 — cœur du MVP)*

| Feature | Description | Priorité |
|---|---|---|
| C1. Formulaire pas-à-pas | Stepper DSFR, 5-6 questions (âge, logement, santé, activité, isolement, rôle d'aidant) | P0 |
| C2. Scoring côté client | Calcul JS du niveau de risque (faible / modéré / élevé), aucune donnée transmise | P0 |
| C3. Résultat personnalisé | Restitution claire du niveau + 3 recommandations actionnables adaptées au profil | P0 |
| C4. Partage du résultat | « Faire le test pour un proche » / relancer le diagnostic pour quelqu'un d'autre | P1 |

### EPIC D — Gestes & relais *(Findings #4, #5)*

| Feature | Description | Priorité |
|---|---|---|
| D1. Gestes de prévention contextualisés | Tuiles DSFR par situation (logement, travail, enfants, personnes âgées) — pas une liste générique | P0 |
| D2. Bloc aidants & professionnels | Section dédiée : fiche réflexe (que faire en cas de malaise), checklist aidant | P1 |
| D3. Numéros & ressources d'urgence | 15 / 115 / Canicule Info Service, bien visibles | P0 |

### EPIC E — Alerte & mesure *(Findings #1, #3)*

| Feature | Description | Priorité |
|---|---|---|
| E1. Capture email « alerte canicule » | Formulaire DSFR (email + commune), validation front, message de confirmation — pas d'envoi réel | P0 |
| E2. Test E2E du parcours diagnostic | Test automatisé : arrivée → diagnostic complété → résultat affiché → email laissé | P1 |
| E3. Plan de mesure | Définition des événements à tracker (Matomo simulé/documenté seulement) | P2 |

## 7. Architecture de la page (→ maquette)

Ordre des sections, de haut en bas :

1. **Header DSFR** (Marianne, intitulé officiel)
2. **Bandeau de vigilance** (alerte DSFR — niveau simulé + consigne)
3. **Hero** : promesse + CTA principal « Évaluer ma vulnérabilité »
4. **Auto-diagnostic** : stepper 5-6 questions → résultat + recommandations personnalisées
5. **Gestes de prévention** : tuiles par situation
6. **Aidants & professionnels** : fiche réflexe, checklist, « vous veillez sur quelqu'un ? »
7. **Alerte email** : formulaire d'inscription (email + commune)
8. **« Bientôt disponible »** : lieux frais près de chez moi, carte temps réel (teaser V2)
9. **Urgences** : 15 / 115 / Canicule Info Service
10. **Footer DSFR**

## 8. User stories & critères d'acceptation (P0)

**US1 — Diagnostic pour soi.** *En tant que* visiteur, *je veux* évaluer ma vulnérabilité en moins de 2 minutes *afin de* savoir si je suis réellement à risque.
- [ ] Le diagnostic est accessible depuis le CTA du hero en 1 clic.
- [ ] 5-6 questions maximum, une par écran (stepper), navigation retour possible.
- [ ] Le résultat affiche un niveau (faible / modéré / élevé) et ≥ 3 recommandations adaptées aux réponses.
- [ ] Aucune donnée n'est transmise ni stockée hors du navigateur.
- [ ] Parcours entièrement utilisable au clavier et au lecteur d'écran.

**US2 — Diagnostic pour un proche.** *En tant qu'*aidant, *je veux* faire le test au nom d'un proche *afin d'*objectiver son risque et le convaincre.
- [ ] Le formulaire est formulable à la 3e personne (ou neutre) sans ambiguïté.
- [ ] Le résultat est relançable pour un autre profil sans recharger la page.

**US3 — Agir maintenant.** *En tant que* visiteur en période de canicule, *je veux* des consignes adaptées à ma situation *afin d'*agir tout de suite.
- [ ] Le bandeau de vigilance est visible sans scroll, avec le niveau et une consigne datée.
- [ ] Les gestes sont présentés par situation (logement / travail / enfants / personnes âgées), pas en liste unique.
- [ ] Les numéros d'urgence sont accessibles depuis n'importe quel point de la page.

**US4 — Être prévenu.** *En tant que* visiteur, *je veux* laisser mon email et ma commune *afin d'*être alerté avant le prochain épisode.
- [ ] Le formulaire valide le format email côté client et affiche les erreurs en DSFR.
- [ ] Une confirmation claire s'affiche après soumission (sans envoi réel).
- [ ] Le formulaire annonce explicitement l'usage des données (mention type RGPD).

## 9. Hypothèses & décisions (documentées, non bloquantes)

1. **Le « simulateur » de l'atelier = l'auto-diagnostic de vulnérabilité** (fonctionnalité la plus plébiscitée de la recherche, validée par le benchmark Canada).
2. **Le niveau de vigilance est simulé** par une constante JS — l'intégration Météo-France est explicitement V2.
3. **La localisation (besoin n°1) est traitée honnêtement en MVP** : champ commune dans l'alerte email + teaser « bientôt » pour les lieux frais, plutôt qu'une fausse carte.
4. Cette spec remplace le guide GO dans `README.md`, conformément au déroulé de l'atelier.
5. Le board est structuré en **epics (A-E) → features**, comme demandé ; chaque feature = un ticket autonome et priorisé.

## 10. Questions ouvertes

| Question | Pour qui | Bloquant ? |
|---|---|---|
| Barème exact du scoring de vulnérabilité (poids des facteurs âge / logement / santé) | Métier (DGS) | Non — barème simple assumé en MVP, à valider médicalement avant mise en ligne réelle |
| Hébergement final (site autonome .gouv.fr vs Santé.fr) | DGS / DILA | Non pour l'atelier |
| Langues prioritaires V2 (anglais, arabe, turc confirmés ?) | DGS / ARS | Non |
| Source des données « lieux frais » V2 (collectivités ? ARS ?) | DGS / collectivités | Non |

## 11. Jalons

| Étape | Statut |
|---|---|
| Spec produit (ce document) | ✅ |
| Maquette DSFR (Claude Design → `maquette/`) | À faire |
| Board GitHub Projects (epics & features § 6) | À faire |
| Tâches techniques (landing + test E2E parcours diagnostic) | À faire |
| Code (Vite vanilla + DSFR, markup via MCP `dsfr`) → PR | À faire |
| Doc & changelog | À faire |
