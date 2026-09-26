// ============================================================
//  Connexion à Supabase (ne pas modifier)
//  Les clés sont dans Vercel > Settings > Environment Variables
// ============================================================
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default supabase;

// Lit l'état du jeu (la ligne id = 1)
export async function lireProgression() {
  const { data, error } = await supabase
    .from("progression")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Erreur Supabase (lecture) :", error.message);
    return null;
  }
  return data;
}

// Marque le briefing comme validé
export async function validerBriefing() {
  const { error } = await supabase
    .from("progression")
    .update({
      briefing_valide: true,
      briefing_valide_le: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    console.error("Erreur Supabase (validation) :", error.message);
    return false;
  }
  return true;
}

// Enregistre le résultat d'un mini-jeu (true = réussi, false = raté)
// Si le jeu a déjà un résultat, on ne le modifie pas (pas de 2e chance)
export async function enregistrerResultat(numero, reussi) {
  const progression = await lireProgression();
  if (!progression) return false;

  const resultats = progression.resultats || {};
  const cle = String(numero);

  if (resultats[cle] === true || resultats[cle] === false) {
    return true; // déjà joué, on ne touche à rien
  }

  const nouveaux = { ...resultats, [cle]: reussi };

  const { error } = await supabase
    .from("progression")
    .update({ resultats: nouveaux })
    .eq("id", 1);

  if (error) {
    console.error("Erreur Supabase (résultat) :", error.message);
    return false;
  }
  return true;
}

// Envoie une photo dans le bucket "photos" et renvoie son lien public
export async function envoyerPhoto(fichier) {
  const extension = fichier.name.split(".").pop();
  const nom = `photo-couple-${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from("photos")
    .upload(nom, fichier);

  if (error) {
    console.error("Erreur Supabase (upload photo) :", error.message);
    return null;
  }

  const { data } = supabase.storage.from("photos").getPublicUrl(nom);
  return data.publicUrl;
}
