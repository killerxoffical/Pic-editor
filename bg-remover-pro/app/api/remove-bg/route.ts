import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_SIZE_BYTES = 12 * 1024 * 1024; // 12MB

function getReplicateClient() {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error(
      "REPLICATE_API_TOKEN missing. .env.local file e apnar Replicate API key set korun."
    );
  }
  return new Replicate({ auth: token });
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file = data.get("image") as unknown as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Kono image file paoya jayni. Ekta image upload korun." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Sudhu PNG, JPG, ba WEBP format supported." },
        { status: 415 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image size 12MB er besi hote parbe na." },
        { status: 413 }
      );
    }

    const replicate = getReplicateClient();

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

    // BRIA AI RMBG-1.4 — high-precision HD background removal
    const output = await replicate.run(
      "briaai/rmbg-1.4:fb8af171cfa1616ddcf1242fa093f9f409e0c5056b633fa9a270c614d69f8359",
      {
        input: {
          image: base64Image,
        },
      }
    );

    if (!output) {
      return NextResponse.json(
        { error: "AI model theke kono result paoya jayni. Abar try korun." },
        { status: 502 }
      );
    }

    return NextResponse.json({ result: output });
  } catch (error: any) {
    console.error("AI processing failed:", error);

    const message =
      error?.message?.includes("REPLICATE_API_TOKEN")
        ? error.message
        : error?.message?.includes("401")
        ? "API token invalid. .env.local file check korun."
        : error?.message?.includes("429")
        ? "Onek beshi request. Kichukkhon pore abar try korun."
        : "Image process korte somossa hoyeche. Abar try korun.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    configured: Boolean(process.env.REPLICATE_API_TOKEN),
  });
}
