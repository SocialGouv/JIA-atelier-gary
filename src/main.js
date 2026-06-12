import './style.css'

// Point d'entrée de la landing « Fortes chaleurs & canicules ».
//
// Ticket A1 — Initialisation du projet Vite vanilla + pnpm.
// Ce fichier ne contient pour l'instant qu'un squelette : les sections DSFR
// (header, bandeau de vigilance, hero, auto-diagnostic, gestes, alerte, footer…)
// seront ajoutées dans les tickets suivants (A2 → E), à partir de la maquette
// `maquette/Landing Fortes Chaleurs.dc.html`.
//
// Stack volontairement vanilla : aucune dépendance de framework (pas de React).
// Le DSFR sera intégré au ticket A2.

const app = document.querySelector('#app')

app.innerHTML = `
  <main class="placeholder">
    <p class="placeholder__kicker">Fortes chaleurs &amp; canicules</p>
    <h1 class="placeholder__title">Squelette Vite prêt</h1>
    <p class="placeholder__text">
      Le projet démarre. Les sections DSFR de la landing seront ajoutées
      par les prochains tickets (A2&nbsp;: intégration du DSFR).
    </p>
  </main>
`
