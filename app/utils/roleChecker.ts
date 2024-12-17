import { PrismaClient } from "@prisma/client";
import { sessionStorage } from "~/session";

const prisma = new PrismaClient();

export async function checkRole(request: Request, allowedRoles: string[]) {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");

  if (!userId) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user || !allowedRoles.includes(user.role)) {
    throw new Response("Forbidden", { status: 403 });
  }

  return user;
}
