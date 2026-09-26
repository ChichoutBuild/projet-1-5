"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import config, { idYoutube, calculerEtat, compteARebourFini } from "../../config";
import { lireProgression, enregistrerResultat, envoyerPhoto } from "../../lib/supabase";

export default function MiniJeu() {
  const router = useRouter();
  const params = useParams();
  const numero = parseInt(params.numero, 10);
  const jeu = config.miniJeux.find((j) => j.numero === numero);

  const [pret, setPret] = useState(false);
  const [fini, setFini] = useState(false); // true = affiche le bouton "Finir"
  const [reussi, setReussi] = useState(false); // le résultat à enregistrer
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
      if (etat.prochain !== numero) {
        router.replace("/tableau-de-bord");
        return;
      }
      setPret(true);
    });
  }, [router, jeu, numero]);

  // Enregistre le résultat puis retour au tableau de bord
  async function terminer() {
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

  const id = idYoutube(jeu.video);

  return (
    <main className="page">
      <h1 className="titre">Mini-jeu {numero}</h1>

      <div className="video mini-jeu-video">
        {id ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`}
            title={`Briefing mini-jeu ${numero}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="video video-vide">
            Vidéo à venir (lien à renseigner dans app/config.js)
          </div>
        )}
      </div>

      <h2 className="sous-titre">{jeu.nom}</h2>

      <div className="contenu-jeu">
        {numero === 1 && (
          <Mastermind jeu={jeu} onTermine={(r) => { setReussi(r); setFini(true); }} />
        )}
        {(numero === 2 || numero === 3) && (
          <Quiz jeu={jeu} onTermine={(r) => { setReussi(r); setFini(true); }} />
        )}
        {numero === 4 && (
          <PhotoUpload jeu={jeu} onTermine={(r) => { setReussi(r); setFini(true); }} />
        )}
        {numero === 5 && (
          <DeuxVraisUnFaux jeu={jeu} onTermine={(r) => { setReussi(r); setFini(true); }} />
        )}
      </div>

      {fini && (
        <button className="bouton" onClick={terminer} disabled={envoi}>
          {envoi ? "..." : "Finir"}
        </button>
      )}

      {erreur && <p className="erreur">{erreur}</p>}
    </main>
  );
}

// ============================================================
//  MINI-JEU 1 : MASTERMIND
// ============================================================
function Mastermind({ jeu, onTermine }) {
  const nbChiffres = jeu.code.length;
  const [tentatives, setTentatives] = useState(
    Array.from({ length: jeu.tentativesMax }, () => Array(nbChiffres).fill(""))
  );
  const [resultats, setResultats] = useState(
    Array.from({ length: jeu.tentativesMax }, () => null) // null = pas validée
  );
  const [ligneActive, setLigneActive] = useState(0);
  const [gagnee, setGagnee] = useState(false);
  const [perdue, setPerdue] = useState(false);
  const refs = useRef([]);

  function changerChiffre(ligne, index, valeur) {
    if (ligne !== ligneActive || gagnee || perdue) return;
    const chiffre = valeur.replace(/[^0-9]/g, "").slice(-1);
    const copie = tentatives.map((l) => [...l]);
    copie[ligne][index] = chiffre;
    setTentatives(copie);

    // Passe automatiquement à la case suivante
    if (chiffre && index < nbChiffres - 1) {
      refs.current[ligne][index + 1]?.focus();
    }
  }

  function ligneComplete(ligne) {
    return tentatives[ligne].every((c) => c !== "");
  }

  function validerLigne(ligne) {
    if (!ligneComplete(ligne)) return;

    const essai = tentatives[ligne];
    const code = jeu.code.split("");
    const couleurs = Array(nbChiffres).fill("rouge");
    const codeRestant = [...code];

    // 1er passage : les bien placés (vert)
    essai.forEach((chiffre, i) => {
      if (chiffre === code[i]) {
        couleurs[i] = "verte";
        codeRestant[i] = null;
      }
    });

    // 2e passage : existe mais mal placé (orange)
    essai.forEach((chiffre, i) => {
      if (couleurs[i] === "verte") return;
      const pos = codeRestant.indexOf(chiffre);
      if (pos !== -1) {
        couleurs[i] = "rouge-existe";
        codeRestant[pos] = null;
      }
    });

    const nouveauxResultats = [...resultats];
    nouveauxResultats[ligne] = couleurs;
    setResultats(nouveauxResultats);

    const trouve = essai.join("") === jeu.code;
    if (trouve) {
      setGagnee(true);
      onTermine(true);
    } else if (ligne + 1 >= jeu.tentativesMax) {
      setPerdue(true);
      onTermine(false);
    } else {
      setLigneActive(ligne + 1);
    }
  }

  return (
    <div className="mastermind">
      {tentatives.map((ligne, l) => (
        <div className="ligne-mastermind" key={l}>
          {ligne.map((chiffre, i) => {
            const couleur = resultats[l] ? resultats[l][i] : null;
            const classe =
              couleur === "verte"
                ? "case-verte"
                : couleur === "rouge-existe"
                ? "case-rouge-existe"
                : couleur === "rouge"
                ? "case-rouge"
                : "";
            return (
              <input
                key={i}
                ref={(el) => {
                  if (!refs.current[l]) refs.current[l] = [];
                  refs.current[l][i] = el;
                }}
                className={`case-chiffre ${classe}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={chiffre}
                disabled={l !== ligneActive || gagnee || perdue}
                onChange={(e) => changerChiffre(l, i, e.target.value)}
              />
            );
          })}
          {l === ligneActive && !gagnee && !perdue && (
            <button
              className="bouton-valider-ligne"
              onClick={() => validerLigne(l)}
              disabled={!ligneComplete(l)}
            >
              Valider
            </button>
          )}
        </div>
      ))}

      {gagnee && <p className="message-info">Bravo, tu as trouvé le code ! 🎉</p>}
      {perdue && (
        <p className="message-info">
          Dommage, le code n'a pas été trouvé... Tu as un gage ! 😈
        </p>
      )}
    </div>
  );
}

// ============================================================
//  MINI-JEUX 2 et 3 : QUIZ (couple / préférences)
// ============================================================
function Quiz({ jeu, onTermine }) {
  const [indexQuestion, setIndexQuestion] = useState(0);
  const [selection, setSelection] = useState(null);
  const [validee, setValidee] = useState(false);
  const [bonnesReponses, setBonnesReponses] = useState(0);

  const question = jeu.questions[indexQuestion];
  const derniere = indexQuestion === jeu.questions.length - 1;

  function choisir(prop) {
    if (validee) return;
    setSelection(prop);
  }

  function valider() {
    if (!selection || validee) return;
    setValidee(true);
    if (selection === question.reponse) {
      setBonnesReponses((n) => n + 1);
    }
  }

  function suivant() {
    if (derniere) {
      // Le mini-jeu est réussi si toutes les réponses étaient bonnes
      const total = bonnesReponses;
      onTermine(total === jeu.questions.length);
    } else {
      setIndexQuestion((i) => i + 1);
      setSelection(null);
      setValidee(false);
    }
  }

  return (
    <div className="quiz">
      <span className="quiz-progression">
        Question {indexQuestion + 1} / {jeu.questions.length}
      </span>
      <h3 className="quiz-question">{question.question}</h3>

      <div className="quiz-propositions">
        {question.propositions.map((prop) => {
          let classe = "";
          if (validee) {
            if (prop === question.reponse) classe = "quiz-option-correcte";
            else if (prop === selection) classe = "quiz-option-incorrecte";
          } else if (prop === selection) {
            classe = "quiz-option-selectionnee";
          }
          return (
            <button
              key={prop}
              className={`quiz-option ${classe}`}
              onClick={() => choisir(prop)}
              disabled={validee}
            >
              {prop}
            </button>
          );
        })}
      </div>

      {validee && selection !== question.reponse && (
        <p className="quiz-reponse-affichee">
          La bonne réponse était : <strong>{question.reponse}</strong>
        </p>
      )}

      {validee && question.photo && (
        <img src={question.photo} alt="Souvenir" className="quiz-photo" />
      )}

      {!validee && (
        <button className="bouton" onClick={valider} disabled={!selection}>
          Valider la réponse
        </button>
      )}

      {validee && (
        <button className="bouton" onClick={suivant}>
          {derniere ? "Terminer le quiz" : "Question suivante"}
        </button>
      )}
    </div>
  );
}

// ============================================================
//  MINI-JEU 4 : ENVOI DE PHOTO
// ============================================================
function PhotoUpload({ onTermine }) {
  const [fichier, setFichier] = useState(null);
  const [apercu, setApercu] = useState(null);
  const [envoye, setEnvoye] = useState(false);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const inputGalerie = useRef(null);
  const inputCamera = useRef(null);

  function fichierChoisi(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFichier(f);
    setApercu(URL.createObjectURL(f));
  }

  async function envoyer() {
    if (!fichier) return;
    setEnvoiEnCours(true);
    const lien = await envoyerPhoto(fichier);
    setEnvoiEnCours(false);
    if (lien) {
      setEnvoye(true);
      onTermine(true); // ce mini-jeu compte toujours comme réussi
    }
  }

  return (
    <div className="zone-photo">
      {!apercu && (
        <div className="zone-photo-boutons">
          <button className="bouton" onClick={() => inputGalerie.current.click()}>
            Choisir une photo
          </button>
          <button
            className="bouton bouton-secondaire"
            onClick={() => inputCamera.current.click()}
          >
            Prendre une photo
          </button>
        </div>
      )}

      <input
        ref={inputGalerie}
        className="input-cache"
        type="file"
        accept="image/*"
        onChange={fichierChoisi}
      />
      <input
        ref={inputCamera}
        className="input-cache"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={fichierChoisi}
      />

      {apercu && <img src={apercu} alt="Aperçu" className="apercu-photo" />}

      {apercu && !envoye && (
        <button className="bouton" onClick={envoyer} disabled={envoiEnCours}>
          {envoiEnCours ? "Envoi..." : "Envoyer la photo"}
        </button>
      )}

      {envoye && (
        <p className="message-info">
          La photo est en vérification, un point te sera peut-être accordé en
          fonction de ta réponse 😁 (si jamais c'était une blague hein, ce
          mini-jeu ne compte pas vraiment, c'est de l'humour parce que je sais
          que ça te fait chier 😝)
        </p>
      )}
    </div>
  );
}

// ============================================================
//  MINI-JEU 5 : 2 VRAIS SOUVENIRS, 1 FAUX
// ============================================================
function DeuxVraisUnFaux({ jeu, onTermine }) {
  const [selection, setSelection] = useState(null);
  const [validee, setValidee] = useState(false);

  function valider() {
    if (selection === null || validee) return;
    setValidee(true);
    onTermine(selection === jeu.faux);
  }

  return (
    <div className="souvenirs">
      {jeu.souvenirs.map((texte, i) => {
        let classe = "";
        if (validee) {
          if (i === jeu.faux) classe = "carte-souvenir-correcte";
          else if (i === selection) classe = "carte-souvenir-incorrecte";
        } else if (i === selection) {
          classe = "carte-souvenir-selectionnee";
        }
        return (
          <div
            key={i}
            className={`carte-souvenir ${classe}`}
            onClick={() => !validee && setSelection(i)}
          >
            {texte}
          </div>
        );
      })}

      {!validee && (
        <button className="bouton" onClick={valider} disabled={selection === null}>
          Valider la réponse
        </button>
      )}

      {validee && (
        <p className="message-info">
          {selection === jeu.faux
            ? "Bien joué, c'était le bon ! 🎉"
            : "Raté, ce n'était pas celui-là... 😅"}
        </p>
      )}
    </div>
  );
}
