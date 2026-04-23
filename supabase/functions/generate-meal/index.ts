// Edge function: AI Meal Generator using Lovable AI Gateway
// Generates meal details (text) + meal image (nanobanana via gemini image preview)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GenerateMealBody {
  patientType: "pregnant" | "elderly" | "infant";
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  prompt?: string;
  patientName?: string;
}

const MEAL_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string", description: "Short Indian-style meal name" },
    description: {
      type: "string",
      description: "1-2 sentence description of the meal and benefits",
    },
    calories: { type: "number" },
    protein: { type: "number", description: "grams" },
    carbs: { type: "number", description: "grams" },
    fat: { type: "number", description: "grams" },
    ingredients: {
      type: "array",
      items: { type: "string" },
      description: "List of 4-8 simple ingredients available in rural India",
    },
    special_instructions: {
      type: "string",
      description: "Cooking or dietary tips relevant to the patient group",
    },
    image_prompt: {
      type: "string",
      description:
        "Vivid food photography prompt for an image generator describing the dish from above on a rustic Indian plate",
    },
  },
  required: [
    "name",
    "description",
    "calories",
    "protein",
    "carbs",
    "fat",
    "ingredients",
    "special_instructions",
    "image_prompt",
  ],
  additionalProperties: false,
};

const groupGuidance: Record<string, string> = {
  pregnant:
    "Pregnant women: emphasize iron, folate, calcium, protein. Avoid raw/unsafe foods.",
  elderly:
    "Elderly: soft, easy-to-chew, low-sodium, high-fiber, joint-friendly, calcium-rich.",
  infant:
    "Infants 6+ months: mashed/pureed, no added sugar/salt, allergen-aware, iron-rich weaning food.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = (await req.json()) as GenerateMealBody;
    const { patientType, mealType, prompt = "", patientName = "" } = body;

    if (!patientType || !mealType) {
      return new Response(
        JSON.stringify({ error: "patientType and mealType are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const systemMsg = `You are an Indian rural nutritionist designing a single ${mealType} for ${patientType}. ${groupGuidance[patientType] || ""} Use locally available ingredients (dal, millets, ragi, paneer, ghee, seasonal veggies). Provide accurate macro estimates.`;

    const userMsg = `Generate one ${mealType} meal${patientName ? ` for patient ${patientName}` : ""}. ${prompt ? `Additional requirements: ${prompt}` : ""}`;

    // Step 1 — generate structured meal details
    const detailsResp = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemMsg },
            { role: "user", content: userMsg },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "emit_meal",
                description: "Return the structured meal data",
                parameters: MEAL_SCHEMA,
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "emit_meal" } },
        }),
      },
    );

    if (!detailsResp.ok) {
      const txt = await detailsResp.text();
      console.error("Meal details error:", detailsResp.status, txt);
      if (detailsResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (detailsResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits to continue." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: "Failed to generate meal details" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const detailsJson = await detailsResp.json();
    const toolCall = detailsJson?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "AI did not return meal data" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const meal = JSON.parse(toolCall.function.arguments);

    // Step 2 — generate meal image (nanobanana / gemini image)
    let imageBase64: string | null = null;
    try {
      const imgResp = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3.1-flash-image-preview",
            messages: [
              {
                role: "user",
                content: `Appetizing top-down food photography of: ${meal.image_prompt}. Rustic Indian thali on wooden table, natural lighting, vibrant colors, no text.`,
              },
            ],
            modalities: ["image", "text"],
          }),
        },
      );

      if (imgResp.ok) {
        const imgJson = await imgResp.json();
        const url = imgJson?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (url) imageBase64 = url; // already a data URL
      } else {
        console.error("Image gen failed:", imgResp.status, await imgResp.text());
      }
    } catch (e) {
      console.error("Image gen exception:", e);
    }

    return new Response(
      JSON.stringify({ meal, imageUrl: imageBase64 }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("generate-meal error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
