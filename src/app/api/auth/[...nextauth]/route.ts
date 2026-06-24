import { handlers } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// Force Node.js runtime — bcryptjs & mongoose require Node built-ins (stream, crypto, etc.)
// that are not available in the Edge runtime.
export const runtime = "nodejs";

const { GET: authGET, POST: authPOST } = handlers;

// Intercept HEAD requests to prevent Auth.js from throwing UnknownAction (400) during Next.js 15 prefetching
export async function HEAD(req: NextRequest) {
  return new NextResponse(null, { status: 200 });
}

export { authGET as GET, authPOST as POST };
