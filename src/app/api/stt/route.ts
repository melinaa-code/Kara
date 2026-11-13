import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json(
      {
        error: "missing_api_key",
        message: "OPENAI_API_KEY not set — use type fallback",
      },
      { status: 503 },
    );
  }

  try {
    const form = await request.formData();
    const audio = form.get("audio");
    const language = String(form.get("language") || "fa");
    if (!(audio instanceof Blob)) {
      return NextResponse.json({ error: "missing_audio" }, { status: 400 });
    }

    const out = new FormData();
    out.append("file", audio, "answer.webm");
    out.append("model", "whisper-1");
    out.append("language", language.startsWith("fa") ? "fa" : language.slice(0, 2));

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: out,
    });

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        { error: "stt_failed", detail },
        { status: 502 },
      );
    }

    const data = (await res.json()) as { text?: string };
    return NextResponse.json({ text: data.text ?? "" });
  } catch (err) {
    return NextResponse.json(
      { error: "stt_exception", detail: String(err) },
      { status: 500 },
    );
  }
}
