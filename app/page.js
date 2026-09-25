"use client";
import { useEffect, useState } from "react";
import { DATE_ANNIVERSAIRE } from "./config";

const pad = (n) => String(n).padStart(2, "0");

export default function Accueil() {
  const [cible, setCible] = useState(null);
  const [maintenant, setMaintenant] = useState(null);

  useEffect(() => {
    // Mode test : ajoute ?test=10 à l'adresse pour une fin dans 10 secondes
    const test = new URLSearchParams(window.location.search).get("test");
    const t = test
      ? Date.now() + Number(test) * 1000
      : new Date(DATE_ANNIVERSAIRE).getTime();

    setCible(t);
    setMaintenant(Date.now());
    const id = setInterval(() => setMaintenant(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  // Pendant le chargement : fond noir, pour éviter un flash
  if (!cible) return <main className="page" />;

  const reste = Math.max(0, cible - maintenant);

  // ⏰ Fin du compte à rebours (sera remplacé par le vrai briefing à l'étape suivante)
  if (reste === 0) {
    return (
      <main className="page">
        <h1 className="titre">Briefing</h1>
        <p className="texte">Bientôt ici…</p>
      </main>
    );
  }

  const jours = Math.floor(reste / 86400000);
  const heures = Math.floor(reste / 3600000) % 24;
  const minutes = Math.floor(reste / 60000) % 60;
  const secondes = Math.floor(reste / 1000) % 60;

  return (
    <main className="page">
      <h1 className="titre">Projet 1.5</h1>

      <div className="countdown">
        <div className="bloc"><span className="chiffre">{pad(jours)}</span><span className="label">Jours</span></div>
        <div className="bloc"><span className="chiffre">{pad(heures)}</span><span className="label">Heures</span></div>
        <div className="bloc"><span className="chiffre">{pad(minutes)}</span><span className="label">Minutes</span></div>
        <div className="bloc"><span className="chiffre">{pad(secondes)}</span><span className="label">Secondes</span></div>
      </div>

      <p className="date-cible">27.09.2026 — 15H24</p>
    </main>
  );
}
