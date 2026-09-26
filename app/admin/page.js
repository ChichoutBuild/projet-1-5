"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./admin.css";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function PageAdmin() {
  const [autorise, setAutorise] = useState(false);
  const [codeSaisi, setCodeSaisi] = useState("");
  const [erreurCode, setErreurCode] = useState("");
  const [chargementCode, setChargementCode] = useState(false);

  const [ligne, setLigne] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("admin_ok") === "1") {
      setAutorise(true);
    }
  }, []);

  useEffect(() => {
    if (autorise) chargerDonnees();
  }, [autorise]);

  async function verifierCode(e) {
    e.preventDefault();
    setErreurCode("");
    setChargementCode(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeSaisi }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        sessionStorage.setItem("admin_ok", "1");
        setAutorise(true);
      } else {
        setErreurCode(data.message || "Code incorrect");
      }
    } catch {
      setErreurCode("Impossible de contacter le serveur");
    } finally {
      setChargementCode(false);
    }
  }

  async function chargerDonnees() {
    setChargement(true);
    const { data, error } = await supabase
      .from("progression")
      .select("*")
      .eq("id", 1)
      .single();
    if (!error) setLigne(data);
    setChargement(false);
  }

  function afficherMessage(texte) {
    setMessage(texte);
    setTimeout(() => setMessage(""), 3000);
  }

  async function sauvegarderResultats(nouveauxResultats) {
    setChargement(true);
    const { error } = await supabase
      .from("progression")
      .update({ resultats: nouveauxResultats })
      .eq("id", 1);
    setChargement(false);
    if (error) {
      afficherMessage("❌ Erreur : " + error.message);
      return false;
    }
    setLigne((prev) => ({ ...prev, resultats: nouveauxResultats }));
    afficherMessage("✅ Enregistré");
    return true;
  }

  async function modifierGage(delta) {
    const actuel = Number(ligne?.resultats?.gage ?? 0);
    const nouveau = Math.max(0, actuel + delta);
    await sauvegarderResultats({ ...ligne.resultats, gage: nouveau });
  }

  async function validerBriefing(valeur) {
    setChargement(true);
    const { error } = await supabase
      .from("progression")
      .update({
        briefing_valide: valeur,
        briefing_valide_le: valeur ? new Date().toISOString() : null,
      })
      .eq("id", 1);
    setChargement(false);
    if (error) {
      afficherMessage("❌ Erreur : " + error.message);
      return;
    }
    setLigne((prev) => ({
      ...prev,
      briefing_valide: valeur,
      briefing_valide_le: valeur ? new Date().toISOString() : null,
    }));
    afficherMessage(valeur ? "✅ Briefing validé" : "↩️ Briefing invalidé");
  }

  async function supprimerCleResultat(cle) {
    if (!confirm(`Supprimer la clé "${cle}" de resultats ?`)) return;
    const copie = { ...ligne.resultats };
    delete copie[cle];
    await sauvegarderResultats(copie);
  }

  async function toutReinitialiser() {
    if (!confirm("⚠️ Remettre TOUTE la progression à zéro ? Cette action est irréversible.")) return;
    setChargement(true);
    const { error } = await supabase
      .from("progression")
      .update({
        briefing_valide: false,
        briefing_valide_le: null,
        resultats: { gage: 0 },
      })
      .eq("id", 1);
    setChargement(false);
    if (error) {
      afficherMessage("❌ Erreur : " + error.message);
      return;
    }
    setLigne((prev) => ({
      ...prev,
      briefing_valide: false,
      briefing_valide_le: null,
      resultats: { gage: 0 },
    }));
    afficherMessage("🔄 Progression réinitialisée");
  }

  function seDeconnecter() {
    sessionStorage.removeItem("admin_ok");
    setAutorise(false);
    setCodeSaisi("");
  }

  // --- Écran code ---
  if (!autorise) {
    return (
      <div className="adm-fond">
        <div className="adm-carte-code">
          <h1 className="titre-principal">🔒 Admin</h1>
          <form onSubmit={verifierCode} className="adm-form-code">
            <input
              type="password"
              value={codeSaisi}
              onChange={(e) => setCodeSaisi(e.target.value)}
              placeholder="Code secret"
              className="adm-input"
              autoFocus
            />
            <button type="submit" className="adm-btn adm-btn-jaune" disabled={chargementCode}>
              {chargementCode ? "Vérification..." : "Entrer"}
            </button>
          </form>
          {erreurCode && <p className="adm-erreur">{erreurCode}</p>}
        </div>
      </div>
    );
  }

  if (!ligne) {
    return (
      <div className="adm-fond">
        <p className="adm-chargement">Chargement des données...</p>
      </div>
    );
  }

  const resultats = ligne.resultats || {};
  const gage = Number(resultats.gage ?? 0);
  const clesAutres = Object.keys(resultats).filter((k) => k !== "gage");

  return (
    <div className="adm-fond">
      <div className="adm-conteneur">
        <h1 className="titre-principal">🛠️ Dashboard Admin</h1>

        {/* Briefing */}
        <section className="adm-section">
          <h2 className="adm-section-titre">📋 Briefing</h2>
          <p className="adm-texte">
            Statut :{" "}
            <strong className={ligne.briefing_valide ? "adm-badge-ok" : "adm-badge-attente"}>
              {ligne.briefing_valide ? "Validé ✅" : "Non validé ⏳"}
            </strong>
          </p>
          {ligne.briefing_valide_le && (
            <p className="adm-texte-petit">
              Le {new Date(ligne.briefing_valide_le).toLocaleString("fr-FR")}
            </p>
          )}
          <div className="adm-boutons">
            <button className="adm-btn adm-btn-jaune" disabled={chargement} onClick={() => validerBriefing(true)}>
              Valider
            </button>
            <button className="adm-btn adm-btn-contour" disabled={chargement} onClick={() => validerBriefing(false)}>
              Invalider
            </button>
          </div>
        </section>

        {/* Gages */}
        <section className="adm-section">
          <h2 className="adm-section-titre">😈 Gages</h2>
          <p className="adm-score">{gage}</p>
          <div className="adm-boutons">
            <button className="adm-btn adm-btn-rouge" disabled={chargement} onClick={() => modifierGage(1)}>
              + 1 gage
            </button>
            <button className="adm-btn adm-btn-contour" disabled={chargement || gage <= 0} onClick={() => modifierGage(-1)}>
              - 1 gage
            </button>
          </div>
        </section>

        {/* Contenu brut de resultats (mini-jeux) */}
        <section className="adm-section">
          <h2 className="adm-section-titre">🎮 Progression des mini-jeux</h2>
          {clesAutres.length === 0 ? (
            <p className="adm-texte-petit">Aucune donnée de mini-jeu pour l'instant.</p>
          ) : (
            <div className="adm-liste-json">
              {clesAutres.map((cle) => (
                <div key={cle} className="adm-ligne-json">
                  <span className="adm-cle-json">{cle}</span>
                  <span className="adm-val-json">
                    {typeof resultats[cle] === "object"
                      ? JSON.stringify(resultats[cle])
                      : String(resultats[cle])}
                  </span>
                  <button
                    className="adm-btn adm-btn-rouge adm-btn-petit"
                    disabled={chargement}
                    onClick={() => supprimerCleResultat(cle)}
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Zone danger */}
        <section className="adm-section">
          <h2 className="adm-section-titre">💣 Zone danger</h2>
          <button className="adm-btn adm-btn-rouge adm-btn-large" disabled={chargement} onClick={toutReinitialiser}>
            Tout réinitialiser
          </button>
          <button className="adm-btn adm-btn-contour adm-btn-large" onClick={seDeconnecter}>
            Se déconnecter
          </button>
        </section>
      </div>

      {message && <div className="adm-toast">{message}</div>}
    </div>
  );
}
