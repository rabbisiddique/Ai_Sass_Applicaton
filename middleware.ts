import { clerkMiddleware } from "@clerk/nextjs/server";

const PUBLIC_ROUTES = ["/", "/api/webhooks/clerk", "/api/webhooks/stripe"];

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) return;

  // Await auth() to get the resolved ClerkMiddlewareAuthObject
  const authObject = await auth();

  // Protect all other routes
  if (!authObject.userId) {
    return authObject.redirectToSignIn({ returnBackUrl: req.nextUrl.href });
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)", "/(api|trpc)(.*)"],
};
