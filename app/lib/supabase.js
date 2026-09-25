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
