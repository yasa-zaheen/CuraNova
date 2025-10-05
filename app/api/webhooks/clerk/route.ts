// app/api/webhooks/clerk/route.ts
import { NextResponse } from "next/server";
import { verifyWebhook } from "@clerk/backend/webhooks";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function POST(request: Request) {
  try {
    // verify signature and parse event
    const evt = await verifyWebhook(request, {
      signingSecret: process.env.CLERK_WEBHOOK_SIGNING_SECRET,
    });

    // evt.type is like "user.created" or "session.created"
    const eventType = evt.type;
    const payload = evt.data; // contains the object (user or session object)

    console.log("I work");

    if (eventType === "user.created" || eventType === "user.updated") {
      // Type assertion for user payload - we know it's a user object for user.* events
      const userPayload = payload as {
        id: string;
        email_addresses?: Array<{ id: string; email_address: string }>;
        primary_email_address_id?: string;
        first_name?: string;
        last_name?: string;
        image_url?: string;
        created_at?: number;
      };

      // payload structure: Clerk sends the user object for user.* events
      const clerkUserId = userPayload.id;
      // find a sensible primary email if present
      const primaryEmail =
        userPayload.email_addresses?.find(
          (e) => e.id === userPayload.primary_email_address_id
        )?.email_address ??
        userPayload.email_addresses?.[0]?.email_address ??
        null;

      const first_name = userPayload.first_name ?? null;
      const last_name = userPayload.last_name ?? null;
      const profile_image = userPayload.image_url ?? null;

      // Handle timestamp conversion safely
      let created_at_iso: string | undefined;
      if (userPayload.created_at) {
        try {
          // Log the raw timestamp for debugging
          console.log(
            "Raw created_at value:",
            userPayload.created_at,
            typeof userPayload.created_at
          );

          // Clerk timestamps are usually in milliseconds, not seconds
          const timestamp =
            typeof userPayload.created_at === "number"
              ? userPayload.created_at
              : parseInt(String(userPayload.created_at));

          // If timestamp looks like seconds (less than year 2001 in milliseconds), convert to milliseconds
          const timestampMs =
            timestamp < 1000000000000 ? timestamp * 1000 : timestamp;

          created_at_iso = new Date(timestampMs).toISOString();
          console.log("Converted timestamp:", created_at_iso);
        } catch (timestampError) {
          console.error("Timestamp conversion error:", timestampError);
          created_at_iso = new Date().toISOString(); // Fallback to current time
        }
      }

      console.log("Upserting user data:", {
        clerk_user_id: clerkUserId,
        email: primaryEmail,
        first_name,
        last_name,
        created_at_iso,
      });

      // Upsert into Supabase users table (upsert on clerk_user_id)
      const { error } = await supabase.from("users").upsert(
        {
          clerk_user_id: clerkUserId,
          email: primaryEmail,
          first_name,
          last_name,
          profile_image,
          created_at: created_at_iso,
        },
        { onConflict: "clerk_user_id" }
      );

      if (error) {
        console.error("Supabase upsert error", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else if (eventType === "session.created") {
      // Type assertion for session payload
      const sessionPayload = payload as {
        user_id: string;
      };

      // session payload includes session.user_id
      const clerkUserId = sessionPayload.user_id;
      if (clerkUserId) {
        const { error } = await supabase
          .from("users")
          .update({ last_sign_in_at: new Date().toISOString() })
          .eq("clerk_user_id", clerkUserId);

        if (error) {
          console.error("Supabase update error for session:", error);
        }
      }
    }

    // Always respond 2xx to acknowledge success
    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("Webhook verification/handler error:", err);
    // 400 for verification failures
    return new Response("Webhook verification failed", { status: 400 });
  }
}
