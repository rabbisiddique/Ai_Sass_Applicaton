import { createUser, deleteUser, updateUser } from "@/lib/actions/user.action";
import { clerkClient, WebhookEvent } from "@clerk/nextjs/server";

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

interface ClerkUserData {
  id: string;
  email_addresses?: { email_address: string }[];
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string;
}

export async function POST(req: Request) {
  const client = await clerkClient();
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  // Get headers
  const headerPayload = headers();
  const svix_id = (await headerPayload).get("svix-id");
  const svix_timestamp = (await headerPayload).get("svix-timestamp");
  const svix_signature = (await headerPayload).get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify webhook
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  const eventType = evt.type;

  if (!["user.created", "user.updated", "user.deleted"].includes(eventType)) {
    console.warn(`Unhandled webhook event type: ${eventType}`);
    return NextResponse.json(
      { message: "Unhandled event type" },
      { status: 400 }
    );
  }

  // CREATE
  if (eventType === "user.created") {
    const { id, email_addresses, image_url, first_name, last_name, username } =
      evt.data as ClerkUserData;

    if (!id || !email_addresses?.[0]?.email_address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const user = {
      clerkId: id,
      email: email_addresses[0].email_address,
      username: username ?? "",
      firstName: first_name ?? "",
      lastName: last_name ?? "",
      photo: image_url ?? "",
    };

    try {
      const newUser = await createUser(user);
      if (newUser) {
        await client.users.updateUserMetadata(id, {
          publicMetadata: { userId: newUser._id },
        });
        return NextResponse.json({ message: "OK", user: newUser });
      }
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    } catch (error) {
      console.error("Error creating user:", error);
      return NextResponse.json(
        { error: "Error creating user" },
        { status: 500 }
      );
    }
  }

  // UPDATE
  if (eventType === "user.updated") {
    const { id, image_url, first_name, last_name, username } =
      evt.data as ClerkUserData;

    if (!id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const user = {
      firstName: first_name ?? "",
      lastName: last_name ?? "",
      username: username ?? "",
      photo: image_url ?? "",
    };

    try {
      const updatedUser = await updateUser(id, user);
      return NextResponse.json({ message: "OK", user: updatedUser });
    } catch (error) {
      console.error("Error updating user:", error);
      return NextResponse.json(
        { error: "Error updating user" },
        { status: 500 }
      );
    }
  }

  // DELETE
  if (eventType === "user.deleted") {
    const { id } = evt.data as ClerkUserData;

    if (!id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    try {
      const deletedUser = await deleteUser(id);
      return NextResponse.json({ message: "OK", user: deletedUser });
    } catch (error) {
      console.error("Error deleting user:", error);
      return NextResponse.json(
        { error: "Error deleting user" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ message: "OK" });
}
