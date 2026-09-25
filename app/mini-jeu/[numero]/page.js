"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import config, { calculerEtat, compteARebourFini } from "../../config";
import { lireProgression, enregistrerResultat } from "../../lib/supabase";

export default function MiniJeu() {
  const router = useRouter();
  const params = useParams();
  const numero = parseInt(params.numero, 10);
  const jeu = config.miniJeux.find((j) => j.numero === numero);

  const [pret, setPret] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");

  // Vérifie qu'elle a le droit d'être ici
  useEffect(() => {
    if (!compteARebourFini()) {
      router.replace("/");
      return;
    }
    if (!jeu) {
      router.replace("/tableau-de-bord");
      return;
    }
    lireProgression().then((progression) => {
      if (!progression) return;
      if (!progression.briefing_valide) {
        router.replace("/briefing");
        return;
      }
      const etat = calculerEtat(progression.resultats);
      // Seul le prochain jeu est accessible
      if (etat.prochain !== numero) {
        router.replace("/tableau-de-bord");
        return;
      }
      setPret(true);
    });
  }, [router, jeu, numero]);

  // Enregistre le résultat puis retour au tableau de bord
  async function terminer(reussi) {
    setEnvoi(true);
    setErreur("");
    const ok = await enregistrerResultat(numero, reussi);
    if (ok) {
      router.replace("/tableau-de-bord");
    } else {
      setErreur("Oups, problème de connexion. Réessaie !");
      setEnvoi(false);
    }
  }

  if (!pret) {
    return <main className="page" />;
  }

  return (
    <main className="page">
      <h1 className="titre">{jeu.nom}</h1>

      {/* 🛠️ PROVISOIRE : sera remplacé par le vrai mini-jeu */}
      <p className="texte">Mini-jeu en construction... 🛠️</p>
      <div className="zone-test">
        <button className="bouton" onClick={() => terminer(true)} disabled={envoi}>
          Simuler réussite
        </button>
        <button
          className="bouton bouton-secondaire"
          onClick={() => terminer(false)}
          disabled={envoi}
        >
          Simuler échec
        </button>
      </div>

      {erreur && <p className="erreur">{erreur}</p>}
    </main>
  );
}
