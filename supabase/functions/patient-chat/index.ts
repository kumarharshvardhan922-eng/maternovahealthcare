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

// Google's streaming endpoint (Server-Sent Events format using ?alt=sse)
const MODEL = "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse`;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { messages, userRole } = (await req.json()) as {
      messages: ChatMessage[];
      userRole?: string;
    };

    if (!Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages must be an array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const contextNote = userRole
      ? `\n\nThe current user role is: ${userRole}. Tailor your guidance to this group.`
      : "";

    // Convert OpenAI-style messages → Gemini "contents" format.
    // Gemini uses roles "user" and "model"; system instruction is separate.
    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const geminiBody = {
      systemInstruction: {
        role: "system",
        parts: [{ text: SYSTEM_PROMPT + contextNote }],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    };

    const upstream = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify(geminiBody),
    });

    if (!upstream.ok || !upstream.body) {
      const errText = await upstream.text();
      console.error("Gemini API error:", upstream.status, errText);

      if (upstream.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (upstream.status === 401 || upstream.status === 403) {
        return new Response(
          JSON.stringify({ error: "Invalid Gemini API key. Please check your configuration." }),
          { status: upstream.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({ error: `Gemini API error: ${upstream.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Stream Gemini SSE → translate each event into OpenAI-compatible
    // `data: {choices:[{delta:{content:"..."}}]}` chunks the existing client expects.
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        const reader = upstream.body!.getReader();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            let idx: number;
            while ((idx = buffer.indexOf("\n")) !== -1) {
              let line = buffer.slice(0, idx);
              buffer = buffer.slice(idx + 1);
              if (line.endsWith("\r")) line = line.slice(0, -1);
              if (!line.startsWith("data: ")) continue;

              const jsonStr = line.slice(6).trim();
              if (!jsonStr) continue;

              try {
                const parsed = JSON.parse(jsonStr);
                const text = parsed?.candidates?.[0]?.content?.parts
                  ?.map((p: any) => p?.text || "")
                  .join("") || "";

                if (text) {
                  const openAiChunk = {
                    choices: [{ delta: { content: text } }],
                  };
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify(openAiChunk)}\n\n`),
                  );
                }
              } catch (e) {
                console.error("Failed to parse Gemini chunk:", jsonStr, e);
              }
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (e) {
          console.error("Stream error:", e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    console.error("patient-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
