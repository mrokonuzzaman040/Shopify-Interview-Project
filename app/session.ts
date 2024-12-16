import { createCookieSessionStorage } from "@remix-run/node";

const sessionSecret = process.env.SESSION_SECRET || "default-secret";
if (!process.env.SESSION_SECRET) {
  console.warn("Warning: Using an insecure session secret.");
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "user_session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    httpOnly: true,
  },
});

export const getSession = (request: Request) =>
  sessionStorage.getSession(request.headers.get("Cookie"));

export const commitSession = (session: any) => sessionStorage.commitSession(session);

export const destroySession = (session: any) => sessionStorage.destroySession(session);
