import prisma from "@/app/lib/db";
import { requireUser } from "@/app/lib/hooks";
import { nylas, nylasConfig } from "@/app/lib/nylas";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

// The GET function in your /api/oauth/exchange/route.ts file plays a critical role in completing the OAuth 2.0 flow for integrating Nylas into your application.
// This function is essential because it handles the redirect step in the OAuth 2.0 process. After the user authorizes your application (via the authorization URL from /api/auth), Nylas redirects the user back to your application with a code in the query string. This code represents the user's consent and needs to be exchanged for an access token that allows your application to interact with the user's Nylas-connected services (e.g., email, calendar).
export async function GET(req: NextRequest) {
  const session = await requireUser();

  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  //  console.log("url is here: ", url);
  //  console.log("code is here: ", code);

  if (!code) {
    return Response.json("Hey we did not get a code ", { status: 400 });
  }

  try {
    // The exchangeCodeForToken method uses the code to request an access token from Nylas.
    const response = await nylas.auth.exchangeCodeForToken({
      clientSecret: nylasConfig.apiKey, // Secret key to authenticate your app with Nylas.
      clientId: nylasConfig.cleintId, // Identifier for your Nylas app.
      redirectUri: nylasConfig.redirectUri, // Same URI used in the initial OAuth flow.
      code: code, // Authorization code received from the redirect
    });

    // console.log("response from nylas auth:", response);

    const { grantId, email } = response;
    await prisma.user.update({
      where: {
        id: session.user?.id,
      },
      data: {
        grantId: grantId,
        grantEmail: email,
      },
    });
  } catch (error) {
    console.error("Error exchanging code for token: ", error);
  }

  redirect("/dashboard");
}

// -----------------------------------------------------------

// Summary of the Workflow:________
// User Authorization:
// The user is redirected to Nylas's authorization page via the /api/auth route.

// Code Exchange:
// After granting permission, Nylas redirects the user to /api/oauth/exchange with an authorization code.

// Token Retrieval:
// The GET function in /api/oauth/exchange/route.ts takes the code and exchanges it for an access token.

// Store Access Token:
// The access token and related data are stored in your database, linking them to the current user.

// Redirect to Dashboard:
// The user is redirected to the dashboard, and now your app can interact with the user's Nylas-connected account.

// ----------------

// Why is This Necessary?
// OAuth Security: This step ensures secure retrieval of tokens without exposing sensitive keys directly in the frontend.
// User Identification: By linking the token to the user in your database, your app can interact with the correct Nylas account for each user.
// Smooth UX: Automates the token retrieval and redirection, so the user seamlessly moves from authorization to your app's main functionality.
