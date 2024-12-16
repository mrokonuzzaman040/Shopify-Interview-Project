import { ActionFunction, json, redirect } from "@remix-run/node";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { sessionStorage } from "~/session";

const prisma = new PrismaClient();

// Action function to handle profile updates
export const action: ActionFunction = async ({ request }) => {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");

  // If user session is invalid, redirect to login
  if (!userId) {
    return redirect("/login?message=session-expired");
  }

  const formData = await request.formData();
  const username = formData.get("username")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  // Input validation
  if (!username || !email) {
    return json({ error: "Both username and email are required." }, { status: 400 });
  }

  if (password && password.length < 6) {
    return json(
      { error: "Password must be at least 6 characters long." },
      { status: 400 }
    );
  }

  try {
    // Hash the password if provided
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    // Update the user profile in the database
    await prisma.user.update({
      where: { id: userId },
      data: {
        username,
        email,
        ...(hashedPassword && { password: hashedPassword }),
      },
    });

    // Redirect back to the profile page with a success message
    return redirect("/profile?message=profile-updated");
  } catch (error: unknown) {
    console.error("Error updating profile:", error);

    // Return a meaningful error message to the user
    return json(
      { error: "An unexpected error occurred while updating the profile. Please try again." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
};

// Loader function to block GET requests
export const loader = async () => {
  return json({ error: "GET method is not allowed on this route." }, { status: 405 });
};
