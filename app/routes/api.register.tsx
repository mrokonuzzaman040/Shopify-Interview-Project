import { ActionFunction, json } from "@remix-run/node";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const action: ActionFunction = async ({ request }) => {
  const body = await request.json();

  const { username, email, password } = body;

  // Validate input
  if (!username || !email || !password) {
    return json({ error: "All fields are required." }, { status: 400 });
  }

  try {
    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return json({ error: "Email is already registered." }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: "user", // Default role
      },
    });

    // Return success response
    return json({
      message: "User registered successfully.",
      user: {
        id: newUser.id,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return json({ error: "Internal server error." }, { status: 500 });
  } finally {
    // Ensure Prisma disconnects to prevent connection leaks
    await prisma.$disconnect();
  }
};
