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
  "Wow mon amour….",
  "Déjà bravo d’être arrivée jusque là !",
  "Et ensuite…. un an et demi ! Ça fait 12 mois, 550 jours, 13 200 heures (etc t’as compris mais j’ai la flemme de continuer🤣)",
  "Jamais j’aurai cru qu’on tiendrait aussi longtemps ! Je dis ça à chaque fois, mais j’ai l’impression qu’on est ensemble depuis toujours et en même temps que ça fait que 3 semaines.",
  "Je vais pas faire une décla de 25 km de long parce que j’en ai pas envie et parce que j’ai pas envie que ça tourne trop en rond, surtout que c’est pas la fin des cadeaux 😁",
  "Je tiens juste à te remercier pour ces 1 an et demi passés à tes côtés, tu es la personne la plus exceptionnelle que j’ai jamais rencontrée. Tu as toutes les qualités pour toi, et bien sur tu as des défauts, mais je trouve que c’est ce qui te rend d’autant plus parfaite.",
  "Mon amour, aies confiance en toi, tu le mérites, et tu es une des rares personnes qui peut te le permettre. Tu es adorable, attentionnée, gentille, giga mignonne, hilarante, intelligente, généreuse, hyper affectueuse, incroyable, exceptionnelle, merveilleuse, lumineuse, la plus belle personne que j’ai jamais vu (mais genre vraiment), et la liste pourrait être encore extrêmement longue (genre vraimennnnt). ",
  "MON AMOUR. Tu es incroyablement magnifique, mais genre vraiment très très beaucoup. Tu n’imagines pas le nombre d’heures (j’abuse pas tant) que j’ai passé à regarder tes / nos photos et à juste me dire : “mais wow comment c’est possible qu’elle soit aussi belle ?” et maintenant que je t’ai vu à tous les moments (sauf en train de chier malheureusement…), je peux l’affirmer, il n’y a pas une seconde où tu n'est pas magnifique ! Mais genre vraiment. Toi au naturel, pas coiffée, pas maquillée, pas propre, tu foudroies 99,99999999% de la population (la part qui reste c’est moi 😁) et je veux que tu t’en rendes compte ! Tu es teeeellement belle que je comprends pas comment tu peux ne pas le penser ! Mon amour tu es une déesse !",
  "Breffff merci pour ces 1 an et demi, merci d’être toi, merci d’être aussi incroyable, merci de faire autant d’efforts, je t’aime plus que tout ❤️🫶",
  "Si jamais les cadeaux sont pas finis hein 😘",
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
