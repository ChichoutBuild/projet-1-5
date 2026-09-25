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
};

// Transforme un lien YouTube en identifiant de vidéo (ne pas toucher)
export function idYoutube(lien) {
  if (!lien) return null;
  const m = lien.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export default config;
