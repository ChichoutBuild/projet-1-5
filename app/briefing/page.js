"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import config, { idYoutube } from "../config";
import { lireProgression, validerBriefing } from "../lib/supabase";

export default function Briefing() {
  const router = useRouter();
  const [pret, setPret] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");

  const id = idYoutube(config.videoBriefing);

  // Vérifications avant d'afficher la page
  useEffect(() => {
    // 1. Compte à rebours pas fini -> retour au compte à rebours
    //    (sauf en mode test)
    const modeTest = sessionStorage.getItem("modeTest") === "1";
    if (!modeTest && Date.now() < new Date(config.dateFin).getTime()) {
      router.replace("/");
      return;
    }

    // 2. Briefing déjà validé -> tableau de bord
    lireProgression().then((progression) => {
      if (progression && progression.briefing_valide) {
        router.replace("/tableau-de-bord");
      } else {
        setPret(true);
      }
    });
  }, [router]);

  // Clic sur le bouton de validation
  async function valider() {
    setEnvoi(true);
    setErreur("");
    const ok = await validerBriefing();
    if (ok) {
      router.replace("/tableau-de-bord");
    } else {
      setErreur("Oups, problème de connexion. Réessaie !");
      setEnvoi(false);
    }
  }

  // Pendant les vérifications : page vide
  if (!pret) {
    return <main className="page" />;
  }

  return (
    <main className="page">
      <h1 className="titre">Briefing</h1>

      <div className="video">
        {id ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`}
            title="Briefing"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="video video-vide">
            Vidéo à venir (lien à renseigner dans app/config.js)
          </div>
        )}
      </div>

      <button className="bouton" onClick={valider} disabled={envoi}>
        {envoi ? "Validation..." : "Briefing validé"}
      </button>

      {erreur && <p className="erreur">{erreur}</p>}
    </main>
  );
}
