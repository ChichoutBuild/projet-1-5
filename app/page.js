"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import config from "./config";
import { lireProgression } from "./lib/supabase";

// Calcule le temps restant avant la fin
function calculerReste(fin) {
  const total = fin - Date.now();
  if (total <= 0) {
    return { total: 0, jours: 0, heures: 0, minutes: 0, secondes: 0 };
  }
  return {
    total,
    jours: Math.floor(total / 86400000),
    heures: Math.floor((total / 3600000) % 24),
    minutes: Math.floor((total / 60000) % 60),
    secondes: Math.floor((total / 1000) % 60),
  };
}

// Affiche toujours 2 chiffres (ex : 7 -> 07)
function deuxChiffres(n) {
  return String(n).padStart(2, "0");
}

export default function CompteARebours() {
  const router = useRouter();
  const [fin, setFin] = useState(null);
  const [reste, setReste] = useState(null);

  // Détermine la date de fin
  // Mode test : ton-site.vercel.app/?test=10 -> fin dans 10 secondes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const test = parseInt(params.get("test"), 10);
    if (!isNaN(test) && test >= 0) {
      sessionStorage.setItem("modeTest", "1");
      setFin(Date.now() + test * 1000);
    } else {
      setFin(new Date(config.dateFin).getTime());
    }
  }, []);

  // Met à jour le compte à rebours chaque seconde
  useEffect(() => {
    if (!fin) return;
    setReste(calculerReste(fin));
    const intervalle = setInterval(() => setReste(calculerReste(fin)), 1000);
    return () => clearInterval(intervalle);
  }, [fin]);

  const termine = reste && reste.total <= 0;

  // Quand c'est terminé : on regarde dans Supabase où rediriger
  useEffect(() => {
    if (!termine) return;
    let minuteur;

    lireProgression().then((progression) => {
      if (progression && progression.briefing_valide) {
        // Briefing déjà validé -> direct au tableau de bord
        router.replace("/tableau-de-bord");
      } else {
        // Sinon : on laisse "C'est l'heure" 3 secondes puis briefing
        minuteur = setTimeout(() => router.replace("/briefing"), 3000);
      }
    });

    return () => clearTimeout(minuteur);
  }, [termine, router]);

  // Pendant le chargement : page vide pour éviter un clignotement
  if (!reste) {
    return <main className="page" />;
  }

  // Fin du compte à rebours
  if (termine) {
    return (
      <main className="page">
        <h1 className="titre">Projet 1.5</h1>
        <div className="compte">
          <h2 className="sous-titre">C'est l'heure ❤️</h2>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <h1 className="titre">Projet 1.5</h1>
      <div className="compte">
        {reste.jours > 0 && (
          <div className="bloc">
            <span className="chiffre">{deuxChiffres(reste.jours)}</span>
            <span className="label">Jours</span>
          </div>
        )}
        <div className="bloc">
          <span className="chiffre">{deuxChiffres(reste.heures)}</span>
          <span className="label">Heures</span>
        </div>
        <div className="bloc">
          <span className="chiffre">{deuxChiffres(reste.minutes)}</span>
          <span className="label">Minutes</span>
        </div>
        <div className="bloc">
          <span className="chiffre">{deuxChiffres(reste.secondes)}</span>
          <span className="label">Secondes</span>
        </div>
      </div>
    </main>
  );
}
