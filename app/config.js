// ============================================================
//  ⚙️  FICHIER DE CONFIGURATION DU PROJET 1.5
//  Ne modifie que les valeurs entre guillemets "..."
// ============================================================

const config = {
  // 📅 Date et heure de fin du compte à rebours (heure de Paris)
  dateFin: "2026-09-27T15:24:00+02:00",

  // 🎬 Liens YouTube généraux
  videoBriefing: "https://youtu.be/EQ69EeGk3ac",
  videoRevealPositif: "https://youtu.be/H4v2rRfkyqQ",
  videoRevealNegatif: "https://youtu.be/LIiA7m7_FkQ",

  // 🎯 Nombre de mini-jeux réussis nécessaires pour gagner
  objectif: 4,
  totalMiniJeux: 5,

  // 🎮 Les mini-jeux : nom, vidéo de briefing propre à chacun, et contenu
  miniJeux: [
    {
      numero: 1,
      nom: "Un code pour débraquer Sacha…",
      // 👉👉👉 LIEN VIDÉO BRIEFING MINI-JEU 1 ICI 👈👈👈
      video: "https://youtu.be/vhIk81BoSZQ",
      code: "180425", // le code à 6 chiffres à trouver
      tentativesMax: 5,
    },
    {
      numero: 2,
      nom: "Quiz sur le couple",
      // 👉👉👉 LIEN VIDÉO BRIEFING MINI-JEU 2 ICI 👈👈👈
      video: "https://youtu.be/4vjJhyfHl8w",
      questions: [
        {
          question: "Qui est le plus susceptible ?",
          propositions: ["Léa", "Sacha"],
          reponse: "Sacha",
        },
        {
          question: "Quand a été notre première embrouille ?",
          propositions: [
            "23 janvier 2024",
            "25 janvier 2025",
            "23 janvier 2025",
            "25 janvier 2024",
          ],
          reponse: "23 janvier 2025",
        },
        {
          question: "De quand date notre première photo tous les deux ?",
          propositions: [
            "24 février 2026",
            "18 février 2025",
            "21 février 2025",
            "20 février 2025",
          ],
          reponse: "20 février 2025",
          // 👉👉👉 Voir instructions plus bas pour la photo 👈👈👈
          photo: "/photos/premiere-photo.jpg",
        },
      ],
    },
    {
      numero: 3,
      nom: "Je préfère ?",
      // 👉👉👉 LIEN VIDÉO BRIEFING MINI-JEU 3 ICI 👈👈👈
      video: "https://youtu.be/RudoS3jeYDQ",
      questions: [
        {
          question: "Je préfèrerai perdre un bras ou perdre une jambe",
          propositions: ["Un bras", "Une jambe", "J'en ai aucune idée"],
          reponse: "J'en ai aucune idée",
        },
        {
          question: "Je préfère les bisous ou les câlins ?",
          propositions: ["Bisous", "Câlins", "Branlette"],
          reponse: "Câlins",
        },
        {
          question: "Je préfère Nathan ou mon père ?",
          propositions: ["Nathan", "Mon père", "Olivia"],
          reponse: "Nathan",
        },
      ],
    },
    {
      numero: 4,
      nom: "Envoie une photo de bib et bob 😁🥹",
      // 👉👉👉 LIEN VIDÉO BRIEFING MINI-JEU 4 ICI 👈👈👈
      video: "",
    },
    {
      numero: 5,
      nom: "2 vrais souvenirs, un faux",
      // 👉👉👉 LIEN VIDÉO BRIEFING MINI-JEU 5 ICI 👈👈👈
      video: "https://youtu.be/cxySDXoGxq4",
      souvenirs: [
        "Tu m'as déjà envoyé une vidéo pour me dire que j'avais eu une mauvaise réaction",
        "Tu m'as déjà dit que tu trouvais mes genoux sexy",
        "Tu as déjà demandé si tu pouvais me lécher les aisselles",
      ],
      faux: 2, // index (à partir de 0) du souvenir faux dans la liste au-dessus
    },
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
    prochain,
    toutFini: faits >= config.totalMiniJeux,
    gagne: reussis >= config.objectif,
  };
}

export default config;
