import './style.css'

// Landing « Fortes chaleurs & canicules » — port vanilla de la maquette
// (maquette/Landing Fortes Chaleurs.dc.html). 100 % côté client, sans framework.
//
// Variantes figées (la maquette les exposait en props) :
//   - hero : « chaleur »      - vigilance : « orange » (niveau simulé)
//
// Les niveaux de vigilance sont SIMULÉS. // V2 : remplacer par l'API Météo-France.

const VIGILANCE = 'orange'

const state = {
  started: false,
  forWhom: null, // "moi" | "proche"
  step: 0, // 0 = "pour qui ?", 1..5 = questions, 6 = résultat
  answers: [],
  email: '',
  commune: '',
  emailErr: '',
  communeErr: '',
  subscribed: false,
}

// ---------------------------------------------------------------------------
// Données du diagnostic
// ---------------------------------------------------------------------------
function questions() {
  const other = state.forWhom === 'proche'
  return [
    {
      id: 'age',
      title: other ? 'Quel âge a cette personne ?' : 'Quel âge avez-vous ?',
      options: [
        { label: 'Moins de 65 ans', pts: 0 },
        { label: '65 à 74 ans', pts: 2 },
        { label: '75 ans ou plus', pts: 3 },
      ],
    },
    {
      id: 'logement',
      title: other ? 'Comment est son logement en été ?' : 'Comment est votre logement en été ?',
      options: [
        { label: 'Plutôt frais, ou climatisé', pts: 0 },
        { label: 'Chaud aux heures de pointe, sans climatisation', hint: 'Exposition sud, étage élevé, peu d’ombre…', pts: 2 },
        { label: 'Très chaud, presque impossible à rafraîchir', pts: 3 },
      ],
    },
    {
      id: 'sante',
      title: other
        ? 'Cette personne a-t-elle une maladie chronique ou un traitement régulier ?'
        : 'Avez-vous une maladie chronique ou un traitement régulier ?',
      options: [
        { label: 'Non', pts: 0 },
        { label: 'Oui', hint: 'Maladie cardiaque, respiratoire, rénale, diabète, traitements diurétiques ou psychotropes…', pts: 2 },
        { label: 'Je ne sais pas', pts: 1 },
      ],
    },
    {
      id: 'activite',
      title: other
        ? 'Passe-t-elle de longues heures dehors ou à l’effort ?'
        : 'Passez-vous de longues heures dehors ou à l’effort ?',
      options: [
        { label: 'Non, l’essentiel se passe en intérieur', pts: 0 },
        { label: 'Oui, quelques heures par jour', pts: 1 },
        { label: 'Oui, la majeure partie de la journée', hint: 'Chantier, agriculture, livraison, sport intensif…', pts: 2 },
      ],
    },
    {
      id: 'entourage',
      title: other ? 'Cette personne vit-elle seule ?' : 'Vivez-vous seul·e ?',
      options: [
        { label: 'Non, ou entouré·e au quotidien', pts: 0 },
        { label: 'Oui, avec des visites régulières', pts: 1 },
        { label: 'Oui, avec peu de visites', pts: 2 },
      ],
    },
  ]
}

const RECO_MAP = {
  age: {
    1: [{ strong: 'Boire régulièrement sans attendre la soif,', text: 'et continuer à manger normalement, même sans appétit.' }],
    2: [
      { strong: 'Boire régulièrement sans attendre la soif,', text: 'et continuer à manger normalement, même sans appétit.' },
      { strong: 'Passer 2 à 3 heures par jour dans un endroit frais', text: '(mairie, bibliothèque, supermarché) en période d’alerte.' },
    ],
  },
  logement: {
    1: [{ strong: 'Fermer volets et fenêtres le jour, aérer la nuit,', text: 'et dormir dans la pièce la plus fraîche du logement.' }],
    2: [
      { strong: 'Fermer volets et fenêtres le jour, aérer la nuit,', text: 'et dormir dans la pièce la plus fraîche du logement.' },
      { strong: 'Identifier dès maintenant un lieu frais accessible :', text: 'la mairie peut orienter via le registre canicule.' },
    ],
  },
  sante: {
    1: [{ strong: 'Demander conseil au médecin ou au pharmacien :', text: 'certains traitements doivent être adaptés en période de forte chaleur.' }],
    2: [{ strong: 'Faire le point avec un professionnel de santé', text: 'pour savoir si un traitement ou une condition augmente le risque.' }],
  },
  activite: {
    1: [{ strong: 'Décaler les efforts avant 11 h ou après 17 h,', text: 'avec une pause à l’ombre et un verre d’eau toutes les 15-20 minutes.' }],
    2: [
      { strong: 'Décaler les efforts avant 11 h ou après 17 h,', text: 'avec une pause à l’ombre et un verre d’eau toutes les 15-20 minutes.' },
      { strong: 'Connaître ses droits au travail :', text: 'l’employeur doit fournir de l’eau fraîche et adapter les horaires (Code du travail).' },
    ],
  },
  entourage: {
    1: [{ strong: 'S’inscrire au registre canicule de la mairie', text: 'pour être contacté·e en cas d’alerte.' }],
    2: [
      { strong: 'S’inscrire au registre canicule de la mairie', text: 'pour être contacté·e en cas d’alerte.' },
      { strong: 'Convenir d’un appel quotidien avec un proche', text: 'pendant toute la durée des épisodes de chaleur.' },
    ],
  },
}

const GENERIC_RECOS = [
  { strong: 'Boire de l’eau régulièrement,', text: 'sans attendre d’avoir soif, et limiter alcool et café.' },
  { strong: 'Garder le logement frais :', text: 'volets fermés le jour, aération la nuit.' },
  { strong: 'Connaître les signes d’alerte :', text: 'crampes, confusion, nausées — appeler le 15 en cas de doute.' },
]

function computeResult() {
  const qs = questions()
  let pts = 0
  let recos = []
  qs.forEach((q, i) => {
    const idx = state.answers[i]
    if (idx == null) return
    pts += q.options[idx].pts
    const extra = (RECO_MAP[q.id] || {})[idx]
    if (extra) recos = recos.concat(extra)
  })
  const seen = new Set()
  recos = recos.filter((r) => (seen.has(r.strong) ? false : (seen.add(r.strong), true)))
  for (const g of GENERIC_RECOS) {
    if (recos.length >= 3) break
    if (!seen.has(g.strong)) {
      recos.push(g)
      seen.add(g.strong)
    }
  }
  recos = recos.slice(0, 5)
  const level = pts >= 6 ? 'eleve' : pts >= 3 ? 'modere' : 'faible'
  return { level, recos }
}

// ---------------------------------------------------------------------------
// Helpers de rendu
// ---------------------------------------------------------------------------
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

const btnPrimary =
  'display:inline-flex; align-items:center; background:#000091; color:#ffffff; border:0; padding:12px 24px; font-size:18px; font-weight:500; cursor:pointer'
const btnSecondary =
  'display:inline-flex; align-items:center; background:transparent; color:#000091; border:0; box-shadow:inset 0 0 0 1px #000091; padding:12px 24px; font-size:18px; font-weight:500; cursor:pointer'

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------
function header() {
  return `
  <header style="background:#ffffff; box-shadow:0 1px 0 #dddddd">
    <div style="max-width:1200px; margin:0 auto; padding:16px 24px; display:flex; align-items:center; gap:32px; flex-wrap:wrap">
      <div style="display:flex; flex-direction:column; gap:6px">
        <p style="margin:0; font-weight:700; font-size:16px; line-height:1.05; text-transform:uppercase">République<br>Française</p>
        <p style="margin:0; font-style:italic; font-size:10px; line-height:1.25">Liberté<br>Égalité<br>Fraternité</p>
      </div>
      <div style="flex:1; min-width:240px">
        <p style="margin:0; font-weight:700; font-size:19px; line-height:1.3">Fortes chaleurs &amp; canicules</p>
        <p style="margin:2px 0 0; font-size:13px; color:#666666">Comprendre son risque et agir — Ministère de la Santé</p>
      </div>
    </div>
    <nav aria-label="Menu principal" style="border-top:1px solid #dddddd">
      <div style="max-width:1200px; margin:0 auto; padding:0 12px; display:flex; flex-wrap:wrap">
        <button class="navlink" data-action="navTo" data-target="diag" style="background:none; border:0; font-size:15px; color:#161616; padding:14px; cursor:pointer">Évaluer mon risque</button>
        <button class="navlink" data-action="navTo" data-target="gestes" style="background:none; border:0; font-size:15px; color:#161616; padding:14px; cursor:pointer">Les bons gestes</button>
        <button class="navlink" data-action="navTo" data-target="aidants" style="background:none; border:0; font-size:15px; color:#161616; padding:14px; cursor:pointer">Aidants &amp; professionnels</button>
        <button class="navlink" data-action="navTo" data-target="alerte" style="background:none; border:0; font-size:15px; color:#161616; padding:14px; cursor:pointer">Alerte email</button>
        <button class="navlink navlink--urgence" data-action="navTo" data-target="urgences" style="background:none; border:0; font-size:15px; font-weight:700; color:#ce0500; padding:14px; cursor:pointer">Urgences</button>
      </div>
    </nav>
  </header>`
}

function vigilance() {
  if (VIGILANCE === 'jaune') {
    return `
    <div role="status" style="background:#fdf5cf; border-bottom:1px solid #e0c200">
      <div style="max-width:1200px; margin:0 auto; padding:12px 24px; display:flex; align-items:baseline; gap:12px; flex-wrap:wrap">
        <span style="background:#ffe552; color:#3d3100; font-weight:700; font-size:12px; letter-spacing:0.05em; padding:3px 10px; white-space:nowrap">VIGILANCE JAUNE</span>
        <p style="margin:0; font-size:15px; line-height:1.5; flex:1; min-width:260px"><strong>Pic de chaleur attendu dans les prochains jours.</strong> Buvez régulièrement et évitez les efforts aux heures les plus chaudes.</p>
        <p style="margin:0; font-size:12px; color:#666666">Mis à jour le 12 juin, 8 h · niveau simulé (maquette)</p>
      </div>
    </div>`
  }
  if (VIGILANCE === 'rouge') {
    return `
    <div role="alert" style="background:#ffe9e9; border-bottom:1px solid #f0b1b1">
      <div style="max-width:1200px; margin:0 auto; padding:12px 24px; display:flex; align-items:baseline; gap:12px; flex-wrap:wrap">
        <span style="background:#ce0500; color:#ffffff; font-weight:700; font-size:12px; letter-spacing:0.05em; padding:3px 10px; white-space:nowrap">VIGILANCE ROUGE</span>
        <p style="margin:0; font-size:15px; line-height:1.5; flex:1; min-width:260px"><strong>Canicule extrême.</strong> Restez au frais, reportez tout effort et contactez les personnes isolées deux fois par jour.</p>
        <p style="margin:0; font-size:12px; color:#666666">Mis à jour le 12 juin, 8 h · niveau simulé (maquette)</p>
      </div>
    </div>`
  }
  return `
    <div role="status" style="background:#ffe9e6; border-bottom:1px solid #f4bfb1">
      <div style="max-width:1200px; margin:0 auto; padding:12px 24px; display:flex; align-items:baseline; gap:12px; flex-wrap:wrap">
        <span style="background:#b34000; color:#ffffff; font-weight:700; font-size:12px; letter-spacing:0.05em; padding:3px 10px; white-space:nowrap">VIGILANCE ORANGE</span>
        <p style="margin:0; font-size:15px; line-height:1.5; flex:1; min-width:260px"><strong>Canicule en cours dans 14 départements.</strong> Limitez sorties et efforts entre 11 h et 17 h, buvez régulièrement, prenez des nouvelles des personnes fragiles.</p>
        <p style="margin:0; font-size:12px; color:#666666">Mis à jour le 12 juin, 8 h · niveau simulé (maquette)</p>
      </div>
    </div>`
}

function hero() {
  return `
  <section style="background:linear-gradient(180deg, #fff4eb 0%, #ffffff 100%)">
    <div style="max-width:1200px; margin:0 auto; padding:64px 24px; display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:48px; align-items:center">
      <div>
        <h1 style="margin:0 0 16px; font-size:42px; line-height:1.15; font-weight:700">Fortes chaleurs&nbsp;: évaluez votre risque en 2&nbsp;minutes</h1>
        <p style="margin:0 0 28px; font-size:20px; line-height:1.5; color:#3a3a3a">Un test simple et anonyme pour savoir si vous — ou un proche — êtes vulnérable à la chaleur, et ce qu’il faut faire dès maintenant.</p>
        <div style="display:flex; gap:16px; flex-wrap:wrap; align-items:center">
          <button class="cta-primary" data-action="startFromHero" style="${btnPrimary}">Évaluer ma vulnérabilité</button>
          <button class="cta-secondary" data-action="navTo" data-target="gestes" style="${btnSecondary}">Voir les bons gestes</button>
        </div>
        <p style="margin:16px 0 0; font-size:13px; color:#666666">Anonyme — aucune donnée ne quitte votre navigateur.</p>
      </div>
      <div style="background:#ffffff; border:1px solid #dddddd; padding:28px; display:flex; flex-direction:column; gap:20px">
        ${[
          ['1', 'Répondez à 6 questions', 'Pour vous, ou au nom d’un proche.'],
          ['2', 'Obtenez un niveau de risque', 'Faible, modéré ou élevé — calculé sur votre appareil.'],
          ['3', 'Agissez avec des conseils adaptés', 'Des recommandations concrètes selon la situation.'],
        ]
          .map(
            ([n, t, d]) => `
        <div style="display:flex; gap:16px; align-items:flex-start">
          <span style="flex:none; width:36px; height:36px; border-radius:50%; background:#ececfe; color:#000091; font-weight:700; font-size:17px; display:flex; align-items:center; justify-content:center">${n}</span>
          <div>
            <p style="margin:0; font-weight:700; font-size:16px">${t}</p>
            <p style="margin:2px 0 0; font-size:14px; color:#666666">${d}</p>
          </div>
        </div>`,
          )
          .join('')}
      </div>
    </div>
  </section>`
}

function diagnosticInner() {
  // Intro
  if (!state.started) {
    return `
      <div style="display:flex; flex-direction:column; gap:20px">
        <p style="margin:0; font-size:17px; line-height:1.5">Quelques questions sur l’âge, le logement, la santé et le quotidien suffisent à estimer un niveau de risque — pour vous-même ou pour une personne dont vous vous occupez.</p>
        <div style="display:flex; gap:20px; flex-wrap:wrap; font-size:14px; color:#666666">
          <span>6 questions</span><span>·</span><span>≈ 2 minutes</span><span>·</span><span>100 % anonyme</span>
        </div>
        <div><button class="cta-primary" data-action="beginTest" style="${btnPrimary}; font-size:17px">Commencer le test</button></div>
      </div>`
  }

  // Résultat
  if (state.step === 6) {
    const other = state.forWhom === 'proche'
    const { level, recos } = computeResult()
    let title, bg, color, desc
    const intro = other ? 'D’après les réponses données pour cette personne, ' : 'D’après vos réponses, '
    if (level === 'faible') {
      title = 'Risque faible'
      bg = '#dffee6'
      color = '#18753c'
      desc = intro + 'les gestes de base suffisent dans la plupart des situations. Restez attentif aux signaux d’alerte pendant les épisodes de canicule.'
    } else if (level === 'modere') {
      title = 'Risque modéré'
      bg = '#ffe9e6'
      color = '#b34000'
      desc = intro + 'certains facteurs appellent une vigilance particulière en période de forte chaleur. Les recommandations ci-dessous sont à mettre en place dès maintenant.'
    } else {
      title = 'Risque élevé'
      bg = '#ffe9e9'
      color = '#ce0500'
      desc =
        intro +
        'plusieurs facteurs de vulnérabilité se cumulent. Appliquez ces recommandations dès maintenant' +
        (other ? ' et partagez ce résultat avec la personne concernée et son entourage.' : ' et parlez-en à votre entourage.')
    }
    const recosHtml = recos
      .map(
        (r) => `
        <div style="display:flex; gap:12px; padding:14px 0; border-top:1px solid #eeeeee">
          <span style="flex:none; width:8px; height:8px; margin-top:7px; background:#000091"></span>
          <p style="margin:0; font-size:15px; line-height:1.5"><strong>${esc(r.strong)}</strong> ${esc(r.text)}</p>
        </div>`,
      )
      .join('')
    return `
      <div style="display:flex; flex-direction:column; gap:20px">
        <div><span style="display:inline-block; background:${bg}; color:${color}; font-weight:700; font-size:15px; padding:6px 14px">${title}</span></div>
        <p style="margin:0; font-size:16px; line-height:1.5">${esc(desc)}</p>
        <div>
          <h4 style="margin:0 0 12px; font-size:18px; font-weight:700">${other ? 'Recommandations pour cette personne' : 'Vos recommandations'}</h4>
          <div style="display:flex; flex-direction:column">${recosHtml}</div>
        </div>
        <div style="display:flex; gap:16px; flex-wrap:wrap; align-items:center; border-top:1px solid #eeeeee; padding-top:20px">
          <button class="cta-primary" data-action="navTo" data-target="alerte" style="${btnPrimary}; font-size:16px; padding:10px 20px">M’inscrire à l’alerte canicule</button>
          <button class="cta-secondary" data-action="restart" style="${btnSecondary}; font-size:16px; padding:10px 20px">Refaire le test pour un autre profil</button>
        </div>
        <p style="margin:0; font-size:12px; color:#666666; font-style:italic">Barème indicatif — à valider médicalement avant mise en ligne (cf. spec §10).</p>
      </div>`
  }

  // Stepper
  const segs = Array.from({ length: 6 }, (_, i) => {
    const c = i < state.step ? '#000091' : i === state.step ? '#6a6af4' : '#e3e3fd'
    return `<div style="flex:1; height:6px; background:${c}"></div>`
  }).join('')

  let title, subtitle, options
  if (state.step === 0) {
    title = 'Pour qui faites-vous ce test ?'
    subtitle = 'Vous pouvez répondre pour vous-même ou au nom d’une personne dont vous vous occupez.'
    options = [
      { label: 'Pour moi-même', hint: 'Je veux connaître mon propre niveau de risque.', whom: 'moi' },
      { label: 'Pour un proche', hint: 'Parent, voisin·e, bénéficiaire… je réponds à sa place.', whom: 'proche' },
    ]
      .map(
        (o) => `
        <button class="opt" data-action="chooseWhom" data-whom="${o.whom}" style="display:block; width:100%; text-align:left; background:#ffffff; border:1px solid #dddddd; padding:16px 20px; cursor:pointer">
          <span style="display:block; font-size:16px; font-weight:500">${o.label}</span>
          <span style="display:block; margin-top:4px; font-size:13px; line-height:1.4; color:#666666">${o.hint}</span>
        </button>`,
      )
      .join('')
  } else {
    const q = questions()[state.step - 1]
    title = q.title
    subtitle = ''
    options = q.options
      .map(
        (o, i) => `
        <button class="opt" data-action="answer" data-idx="${i}" style="display:block; width:100%; text-align:left; background:#ffffff; border:1px solid #dddddd; padding:16px 20px; cursor:pointer">
          <span style="display:block; font-size:16px; font-weight:500">${esc(o.label)}</span>
          ${o.hint ? `<span style="display:block; margin-top:4px; font-size:13px; line-height:1.4; color:#666666">${esc(o.hint)}</span>` : ''}
        </button>`,
      )
      .join('')
  }

  return `
      <div style="display:flex; flex-direction:column; gap:20px">
        <div style="display:flex; gap:6px" aria-hidden="true">${segs}</div>
        <p style="margin:0; font-size:13px; color:#666666">Question ${state.step + 1} sur 6</p>
        <h3 style="margin:0; font-size:23px; line-height:1.3; font-weight:700">${esc(title)}</h3>
        ${subtitle ? `<p style="margin:-8px 0 0; font-size:15px; line-height:1.5; color:#666666">${esc(subtitle)}</p>` : ''}
        <div style="display:flex; flex-direction:column; gap:12px">${options}</div>
        ${
          state.step > 0
            ? `<div><button class="linklike" data-action="goBack" style="background:none; border:0; font-size:14px; color:#000091; padding:4px 0; cursor:pointer; text-decoration:underline; text-underline-offset:3px">← Question précédente</button></div>`
            : ''
        }
      </div>`
}

function diagnostic() {
  return `
  <section id="diag" style="background:#f6f6f6; border-top:1px solid #dddddd">
    <div style="max-width:760px; margin:0 auto; padding:56px 24px">
      <p style="margin:0 0 8px; font-size:13px; font-weight:700; color:#000091; text-transform:uppercase; letter-spacing:0.06em">Auto-diagnostic</p>
      <h2 style="margin:0 0 8px; font-size:30px; line-height:1.2; font-weight:700">Êtes-vous vulnérable aux fortes chaleurs&nbsp;?</h2>
      <p style="margin:0 0 28px; font-size:16px; line-height:1.5; color:#3a3a3a">Vos réponses restent dans votre navigateur&nbsp;: rien n’est transmis ni stocké.</p>
      <div style="background:#ffffff; border:1px solid #dddddd; padding:32px">${diagnosticInner()}</div>
    </div>
  </section>`
}

function gestes() {
  const cards = [
    ['Dans le logement', ['Fermer volets et fenêtres aux heures chaudes, aérer la nuit', 'Repérer la pièce la plus fraîche pour y dormir', 'Se mouiller le corps plusieurs fois par jour (gant, brumisateur)', 'Limiter les appareils qui chauffent (four, plaques)']],
    ['Au travail', ['Décaler les tâches pénibles avant 11&nbsp;h ou après 17&nbsp;h', 'Boire un verre d’eau toutes les 15 à 20 minutes', 'Surveiller ses collègues&nbsp;: crampes, confusion = alerte', 'L’employeur doit fournir de l’eau fraîche et adapter les horaires (Code du travail)']],
    ['Avec des enfants', ['Jamais seuls dans une voiture, même quelques minutes', 'Sorties avant 11&nbsp;h ou après 17&nbsp;h, chapeau et ombre', 'Proposer à boire très régulièrement, sans attendre la soif', 'Repas froids, fruits gorgés d’eau']],
    ['Personnes âgées', ['Prendre des nouvelles deux fois par jour', 'Passer 2 à 3 heures par jour dans un lieu frais', 'Boire environ 1,5&nbsp;L d’eau et continuer à manger normalement', 'S’inscrire au registre canicule de la mairie']],
  ]
  return `
  <section id="gestes" style="background:#ffffff">
    <div style="max-width:1200px; margin:0 auto; padding:56px 24px">
      <p style="margin:0 0 8px; font-size:13px; font-weight:700; color:#000091; text-transform:uppercase; letter-spacing:0.06em">Prévention</p>
      <h2 style="margin:0 0 8px; font-size:30px; line-height:1.2; font-weight:700">Les bons gestes, selon votre situation</h2>
      <p style="margin:0 0 32px; font-size:16px; line-height:1.5; color:#3a3a3a; max-width:720px">Pas de liste générique&nbsp;: choisissez ce qui correspond à votre quotidien.</p>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:24px">
        ${cards
          .map(
            ([t, items]) => `
        <div style="background:#ffffff; border:1px solid #dddddd; border-bottom:4px solid #000091; padding:24px; display:flex; flex-direction:column; gap:12px">
          <h3 style="margin:0; font-size:19px; font-weight:700">${t}</h3>
          <ul style="margin:0; padding-left:18px; display:flex; flex-direction:column; gap:8px; font-size:15px; line-height:1.45; color:#3a3a3a">
            ${items.map((i) => `<li>${i}</li>`).join('')}
          </ul>
        </div>`,
          )
          .join('')}
      </div>
    </div>
  </section>`
}

function aidants() {
  const checklist = [
    'J’ai fait le test de vulnérabilité pour chaque personne dont je m’occupe',
    'Je connais la pièce la plus fraîche de son logement',
    'Son inscription au registre canicule de la mairie est à jour',
    'J’ai prévu qui appelle qui en cas d’alerte',
    'Je connais les signes du coup de chaleur',
  ]
  const fiche = [
    ['1', '<strong>Mettre la personne au frais</strong>, à l’ombre, jambes légèrement surélevées.', false],
    ['2', '<strong>Rafraîchir</strong>&nbsp;: eau sur le visage et le corps, ventiler, retirer les couches de vêtements.', false],
    ['3', '<strong>Faire boire de l’eau fraîche</strong> par petites gorgées, si la personne est consciente.', false],
    ['4', '<strong>Appeler le 15</strong> si&nbsp;: confusion, perte de connaissance, fièvre &gt; 39&nbsp;°C, propos incohérents.', true],
  ]
  return `
  <section id="aidants" style="background:#f5f5fe">
    <div style="max-width:1200px; margin:0 auto; padding:56px 24px">
      <p style="margin:0 0 8px; font-size:13px; font-weight:700; color:#000091; text-transform:uppercase; letter-spacing:0.06em">Aidants &amp; professionnels</p>
      <h2 style="margin:0 0 32px; font-size:30px; line-height:1.2; font-weight:700">Vous veillez sur quelqu’un&nbsp;?</h2>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:32px; align-items:start">
        <div style="display:flex; flex-direction:column; gap:20px">
          <p style="margin:0; font-size:16px; line-height:1.5; color:#3a3a3a">Aidant familial, auxiliaire de vie, voisin attentif&nbsp;: vous êtes le relais le plus efficace auprès des personnes qui ne consulteront jamais ce site. Le test de vulnérabilité peut se faire <strong>au nom d’un proche</strong> — un résultat objectif aide souvent à convaincre.</p>
          <div style="background:#ffffff; border:1px solid #dddddd; padding:24px">
            <h3 style="margin:0 0 16px; font-size:18px; font-weight:700">La checklist de l’aidant</h3>
            <ul style="margin:0; padding:0; list-style:none; display:flex; flex-direction:column; gap:10px">
              ${checklist
                .map(
                  (c) => `<li style="display:flex; gap:10px; font-size:15px; line-height:1.45"><span style="flex:none; color:#18753c; font-weight:700">✓</span><span>${c}</span></li>`,
                )
                .join('')}
            </ul>
          </div>
          <div><button class="cta-primary" data-action="startForProche" style="${btnPrimary}; font-size:16px">Faire le test pour un proche</button></div>
        </div>
        <div style="background:#ffffff; border:1px solid #dddddd; border-top:4px solid #ce0500; padding:24px">
          <h3 style="margin:0 0 4px; font-size:18px; font-weight:700">Fiche réflexe — malaise ou coup de chaleur</h3>
          <p style="margin:0 0 20px; font-size:13px; color:#666666">À imprimer et afficher chez la personne aidée.</p>
          <ol style="margin:0 0 20px; padding:0; list-style:none; display:flex; flex-direction:column; gap:14px">
            ${fiche
              .map(
                ([n, txt, red]) => `
            <li style="display:flex; gap:14px; align-items:flex-start">
              <span style="flex:none; width:30px; height:30px; border-radius:50%; background:${red ? '#ce0500' : '#ffe9e9'}; color:${red ? '#ffffff' : '#ce0500'}; font-weight:700; font-size:15px; display:flex; align-items:center; justify-content:center">${n}</span>
              <p style="margin:0; font-size:15px; line-height:1.45">${txt}</p>
            </li>`,
              )
              .join('')}
          </ol>
          <button class="cta-secondary" data-action="printFiche" style="${btnSecondary}; font-size:15px; padding:10px 20px">Imprimer la fiche</button>
        </div>
      </div>
    </div>
  </section>`
}

function alerte() {
  if (state.subscribed) {
    return `
  <section id="alerte" style="background:#ffffff; border-top:1px solid #dddddd">
    <div style="max-width:760px; margin:0 auto; padding:56px 24px">
      <p style="margin:0 0 8px; font-size:13px; font-weight:700; color:#000091; text-transform:uppercase; letter-spacing:0.06em">Alerte canicule</p>
      <h2 style="margin:0 0 8px; font-size:30px; line-height:1.2; font-weight:700">Soyez prévenu·e avant le prochain épisode</h2>
      <p style="margin:0 0 28px; font-size:16px; line-height:1.5; color:#3a3a3a">Recevez un email lorsque votre commune passe en vigilance canicule, avec les consignes du moment.</p>
      <div role="status" style="display:flex; background:#ffffff; border:1px solid #dddddd">
        <div style="flex:none; width:44px; background:#18753c; display:flex; align-items:flex-start; justify-content:center; padding-top:18px; color:#ffffff; font-weight:700; font-size:18px">✓</div>
        <div style="padding:18px 20px">
          <p style="margin:0 0 4px; font-weight:700; font-size:16px">Inscription enregistrée</p>
          <p style="margin:0; font-size:15px; line-height:1.5; color:#3a3a3a">Vous recevrez un email avant le prochain épisode de forte chaleur dans votre commune. <em style="color:#666666">(Maquette&nbsp;: aucun envoi réel.)</em></p>
        </div>
      </div>
    </div>
  </section>`
  }
  const emailBorder = state.emailErr ? '#ce0500' : '#3a3a3a'
  const communeBorder = state.communeErr ? '#ce0500' : '#3a3a3a'
  return `
  <section id="alerte" style="background:#ffffff; border-top:1px solid #dddddd">
    <div style="max-width:760px; margin:0 auto; padding:56px 24px">
      <p style="margin:0 0 8px; font-size:13px; font-weight:700; color:#000091; text-transform:uppercase; letter-spacing:0.06em">Alerte canicule</p>
      <h2 style="margin:0 0 8px; font-size:30px; line-height:1.2; font-weight:700">Soyez prévenu·e avant le prochain épisode</h2>
      <p style="margin:0 0 28px; font-size:16px; line-height:1.5; color:#3a3a3a">Recevez un email lorsque votre commune passe en vigilance canicule, avec les consignes du moment.</p>
      <form id="alerte-form" novalidate style="background:#f6f6f6; padding:32px; display:flex; flex-direction:column; gap:24px">
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:24px">
          <div style="display:flex; flex-direction:column; gap:8px">
            <label for="alerte-email" style="font-size:15px; font-weight:500">Adresse email</label>
            <input id="alerte-email" type="email" autocomplete="email" value="${esc(state.email)}" style="width:100%; padding:10px 16px; font-size:16px; color:#161616; background:#eeeeee; border:0; border-bottom:2px solid ${emailBorder}; border-radius:4px 4px 0 0">
            ${state.emailErr ? `<p style="margin:0; font-size:13px; color:#ce0500">${esc(state.emailErr)}</p>` : ''}
          </div>
          <div style="display:flex; flex-direction:column; gap:8px">
            <label for="alerte-commune" style="font-size:15px; font-weight:500">Commune</label>
            <input id="alerte-commune" type="text" autocomplete="address-level2" placeholder="Ex. : Nîmes" value="${esc(state.commune)}" style="width:100%; padding:10px 16px; font-size:16px; color:#161616; background:#eeeeee; border:0; border-bottom:2px solid ${communeBorder}; border-radius:4px 4px 0 0">
            ${state.communeErr ? `<p style="margin:0; font-size:13px; color:#ce0500">${esc(state.communeErr)}</p>` : ''}
          </div>
        </div>
        <div><button type="submit" class="cta-primary" style="${btnPrimary}; font-size:16px">M’inscrire à l’alerte</button></div>
        <p style="margin:0; font-size:12px; line-height:1.5; color:#666666">Votre email et votre commune servent uniquement à l’envoi de l’alerte canicule. Vous pourrez vous désinscrire à tout moment. <em>Maquette&nbsp;: aucune donnée n’est envoyée ni conservée.</em></p>
      </form>
    </div>
  </section>`
}

function bientot() {
  const cards = [
    ['Les lieux frais près de chez vous', 'Parcs, bibliothèques, salles rafraîchies&nbsp;: un annuaire géolocalisé construit avec les collectivités.'],
    ['Carte de vigilance en temps réel', 'Le niveau d’alerte de votre département, mis à jour en continu avec les données Météo-France.'],
  ]
  return `
  <section style="background:#f6f6f6; border-top:1px solid #dddddd">
    <div style="max-width:1200px; margin:0 auto; padding:56px 24px">
      <h2 style="margin:0 0 8px; font-size:30px; line-height:1.2; font-weight:700">Bientôt sur ce site</h2>
      <p style="margin:0 0 32px; font-size:16px; line-height:1.5; color:#3a3a3a; max-width:720px">Vous nous l’avez demandé en priorité&nbsp;: l’information locale arrive dans une prochaine version.</p>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:24px">
        ${cards
          .map(
            ([t, d]) => `
        <div style="background:#ffffff; border:1px dashed #bbbbbb; padding:24px; display:flex; flex-direction:column; gap:12px">
          <div><span style="display:inline-block; background:#e8edff; color:#0063cb; font-weight:700; font-size:12px; letter-spacing:0.04em; padding:3px 10px">À VENIR</span></div>
          <h3 style="margin:0; font-size:19px; font-weight:700">${t}</h3>
          <p style="margin:0; font-size:15px; line-height:1.5; color:#3a3a3a">${d}</p>
        </div>`,
          )
          .join('')}
      </div>
    </div>
  </section>`
}

function urgences() {
  const nums = [
    ['tel:15', '15', '44px', 'SAMU', 'Malaise, coup de chaleur, perte de connaissance.'],
    ['tel:115', '115', '44px', 'Urgence sociale', 'Pour signaler une personne sans abri en difficulté.'],
    ['tel:0800066666', '0 800 06 66 66', '30px', 'Canicule info service', 'Gratuit, tous les jours de 9 h à 19 h en période d’alerte.'],
  ]
  return `
  <section id="urgences" style="background:#000091; color:#ffffff">
    <div style="max-width:1200px; margin:0 auto; padding:48px 24px">
      <h2 style="margin:0 0 24px; font-size:26px; line-height:1.2; font-weight:700">En cas d’urgence</h2>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:32px">
        ${nums
          .map(
            ([href, num, size, t, d]) => `
        <div style="display:flex; flex-direction:column; gap:4px">
          <a href="${href}" style="color:#ffffff; text-decoration:none; font-size:${size}; font-weight:700; line-height:1.1">${num}</a>
          <p style="margin:6px 0 0; font-weight:700; font-size:16px">${t}</p>
          <p style="margin:0; font-size:14px; color:#cacafb">${d}</p>
        </div>`,
          )
          .join('')}
      </div>
    </div>
  </section>`
}

function footer() {
  const links = ['legifrance.gouv.fr', 'info.gouv.fr', 'service-public.fr', 'data.gouv.fr']
  const bottom = ['Accessibilité : partiellement conforme', 'Mentions légales', 'Données personnelles', 'Gestion des cookies']
  return `
  <footer style="background:#ffffff; border-top:2px solid #000091">
    <div style="max-width:1200px; margin:0 auto; padding:32px 24px; display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:32px">
      <div style="display:flex; flex-direction:column; gap:6px">
        <p style="margin:0; font-weight:700; font-size:15px; line-height:1.05; text-transform:uppercase">République<br>Française</p>
        <p style="margin:0; font-style:italic; font-size:9px; line-height:1.25">Liberté<br>Égalité<br>Fraternité</p>
      </div>
      <div>
        <p style="margin:0 0 16px; font-size:14px; line-height:1.5; color:#3a3a3a">Fortes chaleurs &amp; canicules — un service public de prévention édité par le ministère de la Santé. Maquette d’atelier&nbsp;: les niveaux de vigilance sont simulés.</p>
        <div style="display:flex; gap:20px; flex-wrap:wrap">
          ${links.map((l) => `<a class="footlink" href="https://${l}" style="font-size:14px; font-weight:700; color:#161616; text-decoration:none">${l}</a>`).join('')}
        </div>
      </div>
    </div>
    <div style="border-top:1px solid #dddddd">
      <div style="max-width:1200px; margin:0 auto; padding:16px 24px; display:flex; gap:8px; flex-wrap:wrap; align-items:center; font-size:12px; color:#666666">
        ${bottom.map((b, i) => `${i ? '<span aria-hidden="true">·</span>' : ''}<a class="footlink" href="#" style="color:#666666; text-decoration:none">${b}</a>`).join('')}
        <span style="flex:1"></span>
        <span>Sauf mention contraire, les contenus sont sous <a class="footlink" href="https://github.com/etalab/licence-ouverte/blob/master/LO.md" style="color:#666666">licence etalab-2.0</a></span>
      </div>
    </div>
  </footer>`
}

// ---------------------------------------------------------------------------
// Rendu + interactions
// ---------------------------------------------------------------------------
const app = document.querySelector('#app')

function render() {
  app.innerHTML =
    header() + vigilance() + hero() + diagnostic() + gestes() + aidants() + alerte() + bientot() + urgences() + footer()
}

function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - 8
  window.scrollTo({ top, behavior: 'smooth' })
}

function validateAndSubmit() {
  const emailEl = document.getElementById('alerte-email')
  const communeEl = document.getElementById('alerte-commune')
  state.email = (emailEl ? emailEl.value : '').trim()
  state.commune = (communeEl ? communeEl.value : '').trim()
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(state.email)
  state.emailErr = state.email === '' ? 'Veuillez renseigner votre adresse email.' : emailOk ? '' : 'Le format de l’adresse email n’est pas valide. Exemple : nom@domaine.fr'
  state.communeErr = state.commune === '' ? 'Veuillez renseigner votre commune.' : ''
  state.subscribed = emailOk && state.commune !== ''
  render()
  if (state.subscribed) scrollToId('alerte')
}

// Délégation des clics (le markup est ré-rendu, le parent #app est stable).
app.addEventListener('click', (e) => {
  const t = e.target.closest('[data-action]')
  if (!t) return
  const action = t.dataset.action
  switch (action) {
    case 'navTo':
      scrollToId(t.dataset.target)
      break
    case 'beginTest':
      Object.assign(state, { started: true, step: 0, answers: [], forWhom: null })
      render()
      break
    case 'startFromHero':
      Object.assign(state, { started: true, step: 0, answers: [], forWhom: null })
      render()
      scrollToId('diag')
      break
    case 'startForProche':
      Object.assign(state, { started: true, step: 1, answers: [], forWhom: 'proche' })
      render()
      scrollToId('diag')
      break
    case 'chooseWhom':
      Object.assign(state, { forWhom: t.dataset.whom, step: 1 })
      render()
      break
    case 'answer': {
      const answers = state.answers.slice()
      answers[state.step - 1] = Number(t.dataset.idx)
      Object.assign(state, { answers, step: state.step + 1 })
      render()
      break
    }
    case 'goBack':
      state.step = Math.max(0, state.step - 1)
      render()
      break
    case 'restart':
      Object.assign(state, { started: true, step: 0, answers: [], forWhom: null })
      render()
      break
    case 'printFiche':
      window.print()
      break
  }
})

// Soumission du formulaire d'alerte.
app.addEventListener('submit', (e) => {
  if (e.target && e.target.id === 'alerte-form') {
    e.preventDefault()
    validateAndSubmit()
  }
})

render()
