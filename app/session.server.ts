import { createCookieSessionStorage, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { getProfileById } from "./models/user.server";

invariant(
  process.env.SESSION_SECRET,
  "SESSION_SECRET must be set in your environment variables."
);

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    maxAge: 60,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

const USER_SESSION_KEY = "user_id";

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function getUserId(request: Request) {
  const session = await getSession(request);
  const user_id = session.get(USER_SESSION_KEY);

  return user_id;
}

export async function getUser(request: Request) {
  const user_id = await getUserId(request);
  if (user_id === undefined) return null;

  const user = await getProfileById(user_id);
  if (user) return user;

  throw await logout(request);
}

/**
 * Require a user session to get to a page. If none is found
 * redirect them to the login page. After login, take them to
 * the original page they wanted to get to.
 */
export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const user_id = await getUserId(request);
  if (!user_id) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }

  return user_id;
}

export async function requireUser(request: Request) {
  const user_id = await requireUserId(request);
  if (user_id == undefined) return null;

  const profile = await getProfileById(user_id);
  if (profile) return profile;

  throw await logout(request);
}

export async function createUserSession({
  request,
  user_id,
  remember,
  redirectTo,
}: {
  request: Request;
  user_id: string;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, user_id);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
