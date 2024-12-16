import { LoaderFunction, redirect } from "@remix-run/node";
import { sessionStorage } from "~/session";

export const loader: LoaderFunction = async ({ request }) => {
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));

    return redirect("/login", {
        headers: {
            "Set-Cookie": await sessionStorage.destroySession(session),
        },
    });
};
