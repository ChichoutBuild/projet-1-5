"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

/* ============================================================
   ⚙️ CONFIG — ADAPTE CES NOMS À TA BASE SUPABASE
   ============================================================ */
const CONFIG = {
  table: "progression",
  idLigne: 1,
  colonneBriefing: "briefing_valide",
  colonneGage: "gage",
  colonneResultats: "resultats",
  bucketPhotos: "photos",
  scoreObjectif: 4,
  miniJeux: [
    { cle: "jeu1", nom: "Mini-jeu 1 — Mastermind" },
    { cle: "jeu2", nom: "Mini-jeu 2 — Quiz" },
    { cle: "jeu3", nom: "Mini-jeu 3 — Quiz" },
    { cle: "jeu4", nom: "Mini-jeu 4 — Photo", estPhoto: true },
    { cle: "jeu5", nom: "Mini-jeu 5 — Souvenirs" },
  ],
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/* ============================================================
   🧩 PAGE ADMIN
   ============================================================ */
export default function AdminPage() {
  const [connecte, setConnecte] = useState(false);
  const [codeSaisi, setCodeSaisi] = useState("");
  const [erreurCode, setErreurCode] = useState("");

  const [donnees, setDonnees] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [message, setMessage] = useState("");

  // Garder la connexion pendant la session
  useEffect(() => {
    if (sessionStorage.getItem("admin_ok") === "oui") setConnecte(true);
  }, []);

  const seConnecter = () => {
    if (codeSaisi === process.env.NEXT_PUBLIC_ADMIN_CODE) {
      sessionStorage.setItem("admin_ok", "oui");
      setConnecte(true);
      setErreurCode("");
    } else {
      setErreurCode("Code incorrect");
    }
  };

  /* ---------- Chargement des données ---------- */
  const charger = useCallback(async () => {
    const { data, error } = await supabase
      .from(CONFIG.table)
      .select("*")
      .eq("id", CONFIG.idLigne)
      .single();

    if (error) {
      setMessage("❌ Erreur de lecture : " + error.message);
      return;
    }
    setDonnees(data);

    // Photos du bucket (les plus récentes d'abord)
    const { data: fichiers } = await supabase.storage
      .from(CONFIG.bucketPhotos)
      .list("", { sortBy: { column: "created_at", order: "desc" } });

    if (fichiers) {
      const liste = fichiers
        .filter((f) => f.name && !f.name.startsWith("."))
        .map((f) => ({
          nom: f.name,
          url: supabase.storage.from(CONFIG.bucketPhotos).getPublicUrl(f.name)
            .data.publicUrl,
        }));
      setPhotos(liste);
    }
  }, []);

  // Rafraîchissement auto toutes les 5 secondes
  useEffect(() => {
    if (!connecte) return;
    charger();
    const intervalle = setInterval(charger, 5000);
    return () => clearInterval(intervalle);
  }, [connecte, charger]);

  /* ---------- Écriture en base ---------- */
  const mettreAJour = async (changements, texteSucces) => {
    setChargement(true);
    const { error } = await supabase
      .from(CONFIG.table)
      .update(changements)
      .eq("id", CONFIG.idLigne);
    setChargement(false);

    if (error) {
      setMessage("❌ Erreur : " + error.message);
    } else {
      setMessage("✅ " + texteSucces);
      charger();
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const resultats = donnees?.[CONFIG.colonneResultats] || {};
  const gage = donnees?.[CONFIG.colonneGage] || 0;
  const briefing = donnees?.[CONFIG.colonneBriefing] || false;

  const changerResultat = (cle, valeur, texte) => {
    const nouveaux = { ...resultats };
    if (valeur === null) delete nouveaux[cle];
    else nouveaux[cle] = valeur;
    mettreAJour({ [CONFIG.colonneResultats]: nouveaux }, texte);
  };

  const changerGage = (nouvelleValeur) => {
    mettreAJour(
      { [CONFIG.colonneGage]: Math.max(0, nouvelleValeur) },
      "Gages mis à jour"
    );
  };

  const toutReinitialiser = () => {
    if (!confirm("⚠️ Tout réinitialiser ? (briefing, résultats et gages)")) return;
    mettreAJour(
      {
        [CONFIG.colonneResultats]: {},
        [CONFIG.colonneGage]: 0,
        [CONFIG.colonneBriefing]: false,
      },
      "Progression entièrement réinitialisée"
    );
  };

  const supprimerPhoto = async (nom) => {
    if (!confirm("Supprimer cette photo du stockage ?")) return;
    const { error } = await supabase.storage
      .from(CONFIG.bucketPhotos)
      .remove([nom]);
    setMessage(error ? "❌ " + error.message : "✅ Photo supprimée");
    charger();
    setTimeout(() => setMessage(""), 3000);
  };

  /* ---------- Calculs ---------- */
  const score = CONFIG.miniJeux.filter(
    (j) => resultats[j.cle] === "reussi"
  ).length;
  const nbTermines = CONFIG.miniJeux.filter(
    (j) => resultats[j.cle] === "reussi" || resultats[j.cle] === "echoue"
  ).length;

  const libelleStatut = (statut) => {
    switch (statut) {
      case "reussi":
        return { texte: "Réussi", classe: "admin-statut-reussi" };
      case "echoue":
        return { texte: "Échoué", classe: "admin-statut-echoue" };
      case "en_attente":
        return { texte: "En attente", classe: "admin-statut-attente" };
      default:
        return { texte: "Pas fait", classe: "admin-statut-vide" };
    }
  };

  /* ============================================================
     🔐 ÉCRAN DE CONNEXION
     ============================================================ */
  if (!connecte) {
    return (
      <main>
        <h1 className="titre-principal">Admin</h1>
        <input
          type="password"
          className="champ-code"
          placeholder="Code admin"
          value={codeSaisi}
          onChange={(e) => setCodeSaisi(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && seConnecter()}
        />
        {erreurCode && <p className="message-erreur">{erreurCode}</p>}
        <button className="bouton" onClick={seConnecter}>
          Entrer
        </button>
      </main>
    );
  }

  if (!donnees) {
    return (
      <main>
        <h1 className="titre-principal">Admin</h1>
        <p className="texte">{message || "Chargement…"}</p>
      </main>
    );
  }

  /* ============================================================
     📊 DASHBOARD ADMIN
     ============================================================ */
  return (
    <main>
      <h1 className="titre-principal">Admin</h1>

      {message && <div className="message-info">{message}</div>}

      {/* ---------- Résumé ---------- */}
      <div className="admin-resume">
        <div className="bloc-temps">
          <span className="valeur">{score}/5</span>
          <span className="label">Score</span>
        </div>
        <div className="bloc-temps">
          <span className="valeur">{nbTermines}/5</span>
          <span className="label">Terminés</span>
        </div>
        <div className="bloc-temps">
          <span className="valeur">{gage}</span>
          <span className="label">Gages</span>
        </div>
      </div>

      <p className="texte">
        {score >= CONFIG.scoreObjectif
          ? "🟢 Reveal positif si ça reste comme ça"
          : "🔴 Reveal négatif pour l'instant"}
      </p>

      {/* ---------- Briefing ---------- */}
      <section className="admin-section">
        <h2 className="sous-titre">🎬 Briefing</h2>
        <p className="texte">
          Statut : <strong>{briefing ? "✅ Validé" : "⏳ Non validé"}</strong>
        </p>
        <button
          className={briefing ? "bouton bouton-secondaire" : "bouton"}
          disabled={chargement}
          onClick={() =>
            mettreAJour(
              { [CONFIG.colonneBriefing]: !briefing },
              briefing ? "Briefing annulé" : "Briefing validé"
            )
          }
        >
          {briefing ? "Annuler la validation" : "Valider le briefing"}
        </button>
      </section>

      {/* ---------- Gages ---------- */}
      <section className="admin-section">
        <h2 className="sous-titre">🎯 Gages</h2>
        <div className="admin-actions">
          <button className="bouton bouton-secondaire" disabled={chargement}
            onClick={() => changerGage(gage - 1)}>− 1</button>
          <button className="bouton" disabled={chargement}
            onClick={() => changerGage(gage + 1)}>+ 1</button>
          <button className="bouton bouton-secondaire" disabled={chargement}
            onClick={() => changerGage(0)}>Remettre à 0</button>
        </div>
      </section>

      {/* ---------- Mini-jeux ---------- */}
      <section className="admin-section">
        <h2 className="sous-titre">🎮 Mini-jeux</h2>

        {CONFIG.miniJeux.map((jeu) => {
          const statut = libelleStatut(resultats[jeu.cle]);
          return (
            <div key={jeu.cle} className="admin-carte">
              <div className="admin-carte-entete">
                <span>{jeu.nom}</span>
                <span className={`carte-mini-jeu-etiquette ${statut.classe}`}>
                  {statut.texte}
                </span>
              </div>

              <div className="admin-actions">
                <button className="bouton admin-bouton-petit" disabled={chargement}
                  onClick={() => changerResultat(jeu.cle, "reussi", `${jeu.nom} → réussi`)}>
                  {jeu.estPhoto ? "Valider" : "Réussi"}
                </button>
                <button className="bouton admin-bouton-petit admin-bouton-rouge" disabled={chargement}
                  onClick={() => changerResultat(jeu.cle, "echoue", `${jeu.nom} → échoué`)}>
                  {jeu.estPhoto ? "Refuser" : "Échoué"}
                </button>
                <button className="bouton bouton-secondaire admin-bouton-petit" disabled={chargement}
                  onClick={() => changerResultat(jeu.cle, null, `${jeu.nom} réinitialisé`)}>
                  Réinitialiser
                </button>
              </div>

              {/* Photos pour le mini-jeu photo */}
              {jeu.estPhoto && (
                <div className="admin-photos">
                  {photos.length === 0 ? (
                    <p className="texte">Aucune photo reçue pour l'instant.</p>
                  ) : (
                    photos.map((p) => (
                      <div key={p.nom} className="admin-photo">
                        <a href={p.url} target="_blank" rel="noreferrer">
                          <img src={p.url} alt={p.nom} />
                        </a>
                        <button className="bouton bouton-secondaire admin-bouton-petit"
                          onClick={() => supprimerPhoto(p.nom)}>
                          Supprimer
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* ---------- Zone danger ---------- */}
      <section className="admin-section">
        <h2 className="sous-titre">💣 Zone danger</h2>
        <button className="bouton admin-bouton-rouge" disabled={chargement}
          onClick={toutReinitialiser}>
          Tout réinitialiser
        </button>
      </section>
    </main>
  );
}
