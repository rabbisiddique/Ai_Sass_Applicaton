import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes
const isPublicRoute = createRouteMatcher([
  "/",
  "/api/webhooks/clerk",
  "/api/webhooks/stripe",
]);

export default clerkMiddleware(async (auth, req) => {
  // Await the auth promise to get the auth object
  const { userId } = await auth();

  // If the route is not public and there's no userId, redirect to sign-in
  if (!isPublicRoute(req) && !userId) {
    return Response.redirect(new URL("/sign-in", req.url));
  }

  // Allow the request to proceed
  return;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
