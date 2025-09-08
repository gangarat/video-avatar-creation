import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function mapLang(code: string): string {
  const map: Record<string, string> = {
    hi: "hi-IN",
    mr: "mr-IN",
    te: "te-IN",
    ta: "ta-IN",
    kn: "kn-IN",
    bn: "bn-IN",
    en: "en-IN",
  };
  return map[code] ?? code;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("SARVAM_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing SARVAM_API_KEY" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { text, target_langs } = await req.json();
    if (!text || !Array.isArray(target_langs) || target_langs.length === 0) {
      return new Response(JSON.stringify({ error: "text and target_langs[] required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const translations: Record<string, string> = {};

    await Promise.all(
      target_langs.map(async (lang: string) => {
        const target_code = mapLang(lang);
        try {
          const res = await fetch("https://api.sarvam.ai/translate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "api-subscription-key": apiKey,
            },
            body: JSON.stringify({
              input: text,
              source_language_code: "hi-IN",
              target_language_code: target_code,
              speaker_gender: "Female",
              mode: "formal",
              model: "mayura:v1",
              enable_preprocessing: true
            }),
          });

          if (!res.ok) {
            const errTxt = await res.text();
            console.error("Sarvam translate error", res.status, errTxt);
            translations[lang] = `[${lang}] ${text}`; // fallback echo
            return;
          }
          const data = await res.json();
          // Sarvam API returns translated text
          const translated = data?.translated_text || `[${lang}] ${text}`;
          translations[lang] = translated;
        } catch (e) {
          console.error("Sarvam translate exception", e);
          translations[lang] = `[${lang}] ${text}`; // fallback echo
        }
      })
    );

    return new Response(JSON.stringify({ translations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("sarvam-translate fatal", error);
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});