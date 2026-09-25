"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import config, { idYoutube, calculerEtat, compteARebourFini } from "../config";
import { lireProgression } from "../lib/supabase";

export default function Reveal() {
  const router = useRouter();
  const [gagne, setGagne] = useState(null);

  useEffect(() => {
    if (!compteARebourFini()) {
      router.replace("/");
      return;
    }
    lireProgression().then((progression) => {
      if (!progression) return;
      if (!progression.briefing_valide) {
        router.replace("/briefing");
        return;
      }
      const etat = calculerEtat(progression.resultats);
      // Pas encore fini tous les jeux -> retour au tableau de bord
      if (!etat.toutFini) {
        router.replace("/tableau-de-bord");
        return;
      }
      setGagne(etat.gagne);
    });
  }, [router]);

  if (gagne === null) {
    return <main className="page" />;
  }

  // Choix de la vidéo selon le score
  const lien = gagne ? config.videoRevealPositif : config.videoRevealNegatif;
  const id = idYoutube(lien);

  return (
    <main className="page">
      <h1 className="titre">Reveal final</h1>

      <div className="video">
        {id ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`}
            title="Reveal final"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="video video-vide">
            Vidéo à venir ({gagne ? "reveal positif" : "reveal négatif"} : lien à
            renseigner dans app/config.js)
          </div>
        )}
      </div>
    </main>
  );
}
