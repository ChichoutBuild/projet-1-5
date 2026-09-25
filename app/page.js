"use client";

import { useEffect, useState } from "react";
import config from "./config";

function calculerReste(fin) {
  const diff = Math.max(0, fin - Date.now());
  return {
    total: diff,
    jours: Math.floor(diff / 86400000),
    heures: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    secondes: Math.floor((diff / 1000) % 60),
  };
}

const deuxChiffres = (n) => String(n).padStart(2, "0");

export default function Accueil() {
  const [fin, setFin] = useState(null);
  const [reste, setReste] = useState(null);

  // Détermine la date de fin (mode test possible avec ?test=10)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const test = parseInt(params.get("test"), 10);
    if (!isNaN(test) && test > 0) {
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

  // Pendant le chargement : page vide pour éviter un clignotement
  if (!reste) {
    return <main className="page" />;
  }

  // Fin du compte à rebours (temporaire : on branchera le Briefing ici)
  if (reste.total <= 0) {
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
