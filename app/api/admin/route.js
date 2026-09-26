import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { erreur: "Code manquant" },
        { status: 400 }
      );
    }

    if (code === process.env.NEXT_PUBLIC_ADMIN_CODE) {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { erreur: "Code incorrect" },
      { status: 401 }
    );
  } catch (e) {
    return NextResponse.json(
      { erreur: "Erreur serveur" },
      { status: 500 }
    );
  }
}
