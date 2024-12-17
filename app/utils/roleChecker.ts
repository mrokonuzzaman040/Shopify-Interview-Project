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

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  // Normalize roles to lowercase for comparison
  const userRole = user.role.toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map((role) => role.toLowerCase());

  if (!normalizedAllowedRoles.includes(userRole)) {
    throw new Response("Forbidden", { status: 403 });
  }

  return user;
}
