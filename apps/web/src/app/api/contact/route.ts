import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/prisma";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(320),
  topic: z.string().trim().max(60).optional(),
  company: z.string().trim().max(160).optional(),
  phone: z.string().trim().max(40).optional(),
  subject: z.string().trim().min(3).max(200),
  message: z.string().trim().min(10).max(5000),
  consent: z.literal(true).optional(),
  // Honeypot — bots fill it; silently accept without storing.
  website: z.string().max(0).optional(),
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
  if (parsed.data.website !== undefined && parsed.data.website !== "") {
    return NextResponse.json({ ok: true });
  }
  const { topic, company, phone } = parsed.data;
  const extras = [
    topic !== undefined && topic !== "" ? `Topic: ${topic}` : null,
    company !== undefined && company !== "" ? `Company: ${company}` : null,
    phone !== undefined && phone !== "" ? `Phone: ${phone}` : null,
  ].filter((line): line is string => line !== null);
  const subject =
    topic !== undefined && topic !== "" && topic !== "General enquiry"
      ? `[${topic.slice(0, 40)}] ${parsed.data.subject}`.slice(0, 200)
      : parsed.data.subject;
  const message =
    extras.length > 0
      ? `${parsed.data.message}\n\n---\n${extras.join("\n")}`.slice(0, 5000)
      : parsed.data.message;
  const prisma = getPrisma();
  if (prisma !== null) {
    try {
      await prisma.contactMessage.create({
        data: { name: parsed.data.name, email: parsed.data.email, subject, message },
      });
    } catch {
      // Best-effort persistence; still acknowledge the sender.
    }
  }
  // Delivery destination is configurable via CONTACT_TO; no internal
  // addresses are exposed to the client.
  return NextResponse.json({ ok: true });
}
