import { NextResponse } from "next/server";
import { z } from "zod";
import { t } from "@rovotools/localization";
import { getPrisma } from "@/lib/prisma";

const deviceSchema = z.object({
  deviceId: z.string().min(1).max(128),
});

const saveSchema = deviceSchema.extend({
  favorites: z.array(z.string().min(1).max(128)).max(200),
});

export async function GET(request: Request): Promise<NextResponse> {
  const prisma = getPrisma();
  if (prisma === null) {
    return NextResponse.json({ favorites: [], synced: false });
  }
  const url = new URL(request.url);
  const parsed = deviceSchema.safeParse({ deviceId: url.searchParams.get("deviceId") ?? undefined });
  if (!parsed.success) {
    return NextResponse.json({ error: t("en", "errors.required") }, { status: 400 });
  }
  const rows = await prisma.favorite.findMany({
    where: { deviceId: parsed.data.deviceId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ favorites: rows.map((row) => row.toolId), synced: true });
}

export async function POST(request: Request): Promise<NextResponse> {
  const prisma = getPrisma();
  if (prisma === null) {
    return NextResponse.json({ synced: false }, { status: 501 });
  }
  const body: unknown = await request.json().catch(() => null);
  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: t("en", "errors.invalidInput") }, { status: 400 });
  }
  await prisma.$transaction([
    prisma.favorite.deleteMany({ where: { deviceId: parsed.data.deviceId } }),
    prisma.favorite.createMany({
      data: parsed.data.favorites.map((toolId) => ({ deviceId: parsed.data.deviceId, toolId })),
    }),
  ]);
  return NextResponse.json({ favorites: parsed.data.favorites, synced: true });
}
