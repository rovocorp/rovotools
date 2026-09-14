import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/prisma";

const feedbackSchema = z.object({
  toolId: z.string().min(1).max(128),
  useful: z.boolean(),
  comment: z.string().max(500).optional(),
});

export async function POST(request: Request): Promise<NextResponse> {
  const body: unknown = await request.json().catch(() => null);
  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid feedback." }, { status: 400 });
  }
  // Never store sensitive tool data — only the anonymous vote and short comment.
  const prisma = getPrisma();
  if (prisma !== null) {
    try {
      await prisma.feedback.create({
        data: {
          toolId: parsed.data.toolId,
          useful: parsed.data.useful,
          ...(parsed.data.comment === undefined ? {} : { comment: parsed.data.comment }),
        },
      });
    } catch {
      // Feedback is best-effort; still acknowledge the user.
    }
  }
  return NextResponse.json({ ok: true });
}
