import type { Config } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

export default async (req: Request) => {
  try {
    let next_run = null;
    
    try {
      const body = await req.json();
      next_run = body.next_run;
    } catch {
      console.log("No JSON body provided - likely a manual invocation");
    }
    
    console.log("Keep-alive function executed!", next_run ? `Next invocation at: ${next_run}` : "Manual invocation");

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey =
      process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase credentials are missing");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Supabase credentials are missing",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("couples")
      .select("count")
      .limit(1)
      .single();

    if (error) {
      console.error("Supabase query error:", error);
    } else {
      console.log("Supabase connection successful:", data);
    }

    const otherProjects = process.env.OTHER_PROJECT_URLS?.split(",") || [];

    const fetchPromises = otherProjects
      .filter((url) => url.trim())
      .map((url) =>
        fetch(url.trim())
          .then(() => ({ url, status: "success" }))
          .catch((err) => ({ url, status: "failed", error: err.message }))
      );

    const otherProjectsResults = await Promise.all(fetchPromises);

    console.log("Other projects pinged:", otherProjectsResults);

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        next_run,
        supabase: error ? "failed" : "success",
        otherProjects: otherProjectsResults,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Keep-alive function error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const config: Config = {
  schedule: "0 0 * * 0",
};
