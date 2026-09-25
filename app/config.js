// ============================================================
//  ⚙️  FICHIER DE CONFIGURATION DU PROJET 1.5
//  Ne modifie que les valeurs entre guillemets "..."
// ============================================================

const config = {
  // 📅 Date et heure de fin du compte à rebours (heure de Paris)
  dateFin: "2026-09-27T15:24:00+02:00",

  // 🎬 Liens YouTube : colle le lien complet entre les guillemets
  //    (ex : "https://youtu.be/xxxxxxxxxxx" ou "https://www.youtube.com/watch?v=xxxxxxxxxxx")

  // 👉👉👉 LIEN DE LA VIDÉO BRIEFING ICI 👈👈👈
  videoBriefing: "https://www.youtube.com/watch?v=hj_YXfNsaPg",

  // 👉👉👉 LIEN DE LA VIDÉO REVEAL POSITIF ICI 👈👈👈
  videoRevealPositif: "",

  // 👉👉👉 LIEN DE LA VIDÉO REVEAL NÉGATIF ICI 👈👈👈
  videoRevealNegatif: "",

  // 🎯 Nombre de mini-jeux réussis nécessaires pour gagner
  objectif: 4,
  totalMiniJeux: 5,

  // 🎮 Noms des mini-jeux (affichés en titre sur la page du jeu)
  //    Sur le tableau de bord, les cartes affichent juste "Mini-jeu 1", "Mini-jeu 2"...
  miniJeux: [
    { numero: 1, nom: "Le code secret" },
    { numero: 2, nom: "Le quiz du couple" },
    { numero: 3, nom: "Qu'est-ce que je préfère ?" },
    { numero: 4, nom: "La photo" },
    { numero: 5, nom: "2 vrais, 1 faux" },
  ],
};

// Transforme un lien YouTube en identifiant de vidéo (ne pas toucher)
export function idYoutube(lien) {
  if (!lien) return null;
  const m = lien.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
}

// Vérifie si le compte à rebours est fini (ou si on est en mode test)
export function compteARebourFini() {
  if (typeof window !== "undefined" && sessionStorage.getItem("modeTest") === "1") {
    return true;
  }
  return Date.now() >= new Date(config.dateFin).getTime();
}

// Calcule l'état du jeu à partir des résultats (ne pas toucher)
export function calculerEtat(resultats) {
  const r = resultats || {};
  let faits = 0;
  let reussis = 0;
  let prochain = null;

  for (const jeu of config.miniJeux) {
    const res = r[String(jeu.numero)];
    if (res === true || res === false) {
      faits++;
      if (res === true) reussis++;
    } else if (prochain === null) {
      prochain = jeu.numero;
    }
  }

  return {
    faits,
    reussis,
    prochain, // numéro du prochain jeu à faire (null si tout est fini)
    toutFini: faits >= config.totalMiniJeux,
    gagne: reussis >= config.objectif,
  };
}

export default config;
