"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import config, { calculerEtat, compteARebourFini } from "../config";
import { lireProgression } from "../lib/supabase";

export default function TableauDeBord() {
  const router = useRouter();
  const [etat, setEtat] = useState(null);
  const [resultats, setResultats] = useState({});

  useEffect(() => {
    // Compte à rebours pas fini -> retour au début
    if (!compteARebourFini()) {
      router.replace("/");
      return;
    }

    lireProgression().then((progression) => {
      if (!progression) return;
      // Briefing pas validé -> retour au briefing
      if (!progression.briefing_valide) {
        router.replace("/briefing");
        return;
      }
      setResultats(progression.resultats || {});
      setEtat(calculerEtat(progression.resultats));
    });
  }, [router]);

  if (!etat) {
    return <main className="page" />;
  }

  const pourcentage = (etat.reussis / config.totalMiniJeux) * 100;
  const positionObjectif = (config.objectif / config.totalMiniJeux) * 100;

  return (
    <main className="page">
      <h1 className="titre">Tableau de bord</h1>

      {/* ===== Barre de progression ===== */}
      <div className="progression">
        <div className="progression-infos">
          <span>Progression</span>
          <span>
            {etat.reussis} / {config.totalMiniJeux} réussis
          </span>
        </div>
        <div className="barre">
          <div className="barre-remplie" style={{ width: `${pourcentage}%` }} />
          <div className="barre-objectif" style={{ left: `${positionObjectif}%` }}>
            <span className="barre-objectif-label">Objectif</span>
          </div>
        </div>
      </div>

      {/* ===== Cartes des mini-jeux ===== */}
      <div className="cartes">
        {config.miniJeux.map((jeu) => {
          const res = resultats[String(jeu.numero)];
          const fait = res === true || res === false;
          const actif = jeu.numero === etat.prochain;

          if (actif) {
            return (
              <Link
                key={jeu.numero}
                href={`/mini-jeu/${jeu.numero}`}
                className="carte carte-active"
              >
                <span className="carte-titre">Mini-jeu {jeu.numero}</span>
                <span className="carte-etat">Jouer ▶</span>
              </Link>
            );
          }

          return (
            <div
              key={jeu.numero}
              className={`carte ${fait ? "carte-faite" : "carte-verrouillee"}`}
            >
              <span className="carte-titre">Mini-jeu {jeu.numero}</span>
              <span className="carte-etat">{fait ? "Déjà fait" : "🔒"}</span>
            </div>
          );
        })}
      </div>

      {/* ===== Bouton final quand tout est fini ===== */}
      {etat.toutFini && (
        <Link href="/reveal" className="bouton">
          Reveal final
        </Link>
      )}
    </main>
  );
}
