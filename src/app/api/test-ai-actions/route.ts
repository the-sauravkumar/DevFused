import { NextResponse } from "next/server";
import { listLiteModels } from "@/app/actions/ai-actions";

export async function GET() {
  try {
    const models = await listLiteModels();
    return NextResponse.json({ ok: true, count: models.length, models });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}