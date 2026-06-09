import { handlers } from "@/lib/auth";

// Force Node.js runtime — bcryptjs & mongoose require Node built-ins (stream, crypto, etc.)
// that are not available in the Edge runtime.
export const runtime = "nodejs";

export const { GET, POST } = handlers;
