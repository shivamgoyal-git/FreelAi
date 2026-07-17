import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

/* ─────────────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────────────── */
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/* Mime → extension map */
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg":  "jpg",
  "image/png":  "png",
  "image/webp": "webp",
};

/* ─────────────────────────────────────────────────────────────────
   POST /api/profile/upload-photo
   Accepts multipart/form-data with a field named "photo"
   Returns { url: string }
───────────────────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  // ── 1. Auth ─────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 2. Parse form data ──────────────────────────────────────
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body. Expected multipart/form-data." },
      { status: 400 }
    );
  }

  const file = formData.get("photo");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "No photo file provided. Send a 'photo' field in the form data." },
      { status: 400 }
    );
  }

  // ── 3. Server-side validation ───────────────────────────────
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: `File type "${file.type}" is not allowed. Accepted: JPG, PNG, WEBP.` },
      { status: 422 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return NextResponse.json(
      { error: `File too large (${mb} MB). Maximum allowed size is 5 MB.` },
      { status: 422 }
    );
  }

  // ── 4. Build a unique filename ──────────────────────────────
  const ext = MIME_TO_EXT[file.type] ?? "jpg";
  const safeUserId = session.user.id.replace(/[^a-zA-Z0-9_-]/g, "");
  const timestamp  = Date.now();
  const filename   = `${safeUserId}-${timestamp}.${ext}`;

  // ── 5. Resolve upload directory path ───────────────────────
  const uploadDir = path.join(process.cwd(), "public", "uploads", "profile-photos");

  try {
    await mkdir(uploadDir, { recursive: true });
  } catch {
    // Directory already exists — safe to ignore
  }

  // ── 6. Write file to disk ───────────────────────────────────
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer      = Buffer.from(arrayBuffer);
    const filePath    = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);
  } catch (err) {
    console.error("Failed to write uploaded file:", err);
    return NextResponse.json(
      { error: "Failed to save the uploaded image. Please try again." },
      { status: 500 }
    );
  }

  // ── 7. Return the publicly accessible URL ──────────────────
  const publicUrl = `/uploads/profile-photos/${filename}`;
  return NextResponse.json({ url: publicUrl }, { status: 200 });
}
