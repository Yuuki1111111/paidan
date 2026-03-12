import { createClient } from "https://esm.sh/@supabase/supabase-js@2?target=deno";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

const REQUIRED_ENV_KEYS = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const missingKeys = REQUIRED_ENV_KEYS.filter((key) => !Deno.env.get(key));
  if (missingKeys.length) {
    return jsonResponse(
      { error: `Missing function secrets: ${missingKeys.join(", ")}` },
      500,
    );
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ error: "Missing Authorization header." }, 401);
  }

  let body: { confirm?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  if (body.confirm !== true) {
    return jsonResponse({ error: "Confirmation flag is required." }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return jsonResponse({ error: userError?.message || "Unauthorized." }, 401);
  }

  const userId = user.id;
  const cleanupTargets = [
    "business_templates",
    "business_presets",
    "user_preferences",
    "commission_orders",
  ] as const;

  for (const tableName of cleanupTargets) {
    const { error } = await adminClient.from(tableName).delete().eq("user_id", userId);
    if (error) {
      return jsonResponse(
        { error: `Failed to delete data from ${tableName}: ${error.message}` },
        500,
      );
    }
  }

  const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(userId);
  if (deleteUserError) {
    return jsonResponse({ error: `Failed to delete auth user: ${deleteUserError.message}` }, 500);
  }

  return jsonResponse({ success: true });
});
