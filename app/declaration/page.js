"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { compteARebourFini, calculerEtat } from "../config";
import { lireProgression } from "../lib/supabase";

// ============================================================
// ✏️ ÉCRIS TES PARAGRAPHES ICI
// Un paragraphe = une ligne entre guillemets, suivie d'une virgule.
// Tu peux en ajouter ou en retirer autant que tu veux.
// Pour un retour à la ligne DANS un paragraphe, écris \n
// ============================================================
const PARAGRAPHES = [
  "Premier paragraphe à écrire ici.",
  "Deuxième paragraphe à écrire ici.",
  "Troisième paragraphe à écrire ici.",
];
// ============================================================

export default function Declaration() {
  const router = useRouter();
  const [pret, setPret] = useState(false);

  // Vérifications : accessible seulement après avoir fini tous les mini-jeux
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
      if (!etat.toutFini) {
        router.replace("/tableau-de-bord");
        return;
      }
      setPret(true);
    });
  }, [router]);

  // Pendant les vérifications : page vide
  if (!pret) {
    return <main className="page" />;
  }

  return (
    <main className="page">
      <h1 className="titre">Décla</h1>

      <div className="declaration">
        {PARAGRAPHES.map((texte, i) => (
          <p key={i} className="declaration-paragraphe">
            {texte}
          </p>
        ))}
      </div>
    </main>
  );
}
