import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Maternova Mitra, a warm, empathetic AI patient-support assistant for an Indian rural healthcare app called Maternova. You support three beneficiary groups: pregnant women, elderly people, and infants (via their family caregivers), as well as ASHA (Accredited Social Health Activist) workers.

Your responsibilities:
- Answer health-related questions clearly using simple, non-medical language.
- Provide guidance on maternal care, infant care (vaccination schedules, nutrition, growth), elderly care (chronic conditions, common ailments), nutrition, and government schemes like PMMVY and JSY.
- Explain how to use the app's sections: Emergency alerts, Vaccination records, Treatment records, Meal Menu, Nutrition recommendations, and Government Funding.
- Always be culturally sensitive to Indian rural contexts. Mention common Indian foods, local home remedies (when safe), and accessible solutions.
- If the user writes in Hindi, Hinglish, or another Indian language, respond in the SAME language they used. Match their language naturally.
- Keep responses concise (3-6 short sentences typically). Use bullet points for lists.
- For any emergency symptoms (heavy bleeding, severe pain, breathing difficulty, high fever in infants, chest pain, stroke signs), IMMEDIATELY tell the user to use the Emergency Alert section in the app and call 108 (ambulance) or contact their ASHA worker right away.
- Never give specific drug dosages or replace a doctor's diagnosis. Always recommend consulting their ASHA worker or doctor for serious or persistent issues.
- Be warm, respectful, and reassuring — like a caring elder sister or trusted health helper.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, userRole } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const contextNote = userRole
      ? `\n\nThe current user role is: ${userRole}. Tailor your guidance to this group.`
      : "";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + contextNote },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("patient-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
