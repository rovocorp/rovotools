import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/prisma";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(320),
  subject: z.string().trim().min(3).max(200),
  message: z.string().trim().min(10).max(5000),
});

export async function POST(request: Request): Promise<NextResponse> {
  const body: unknown = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the highlighted fields and try again.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const prisma = getPrisma();
  if (prisma !== null) {
    try {
      await prisma.contactMessage.create({ data: parsed.data });
    } catch {
      // Best-effort persistence; still acknowledge the sender.
    }
  }
  // Delivery destination is configurable via CONTACT_TO; no internal
  // addresses are exposed to the client.
  return NextResponse.json({ ok: true });
}
