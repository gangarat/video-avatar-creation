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

function generateBeepWavBase64(durationMs = 800, sampleRate = 16000, freq = 440) {
  const samples = Math.floor((durationMs / 1000) * sampleRate);
  const data = new Int16Array(samples);
  for (let i = 0; i < samples; i++) {
    data[i] = Math.floor(32767 * Math.sin((2 * Math.PI * freq * i) / sampleRate));
  }
  const byteRate = sampleRate * 2; // mono 16-bit
  const blockAlign = 2; // mono 16-bit
  const buffer = new ArrayBuffer(44 + data.length * 2);
  const view = new DataView(buffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }
  let offset = 0;
  writeString(offset, "RIFF"); offset += 4;
  view.setUint32(offset, 36 + data.length * 2, true); offset += 4;
  writeString(offset, "WAVE"); offset += 4;
  writeString(offset, "fmt "); offset += 4;
  view.setUint32(offset, 16, true); offset += 4; // Subchunk1Size
  view.setUint16(offset, 1, true); offset += 2; // PCM
  view.setUint16(offset, 1, true); offset += 2; // mono
  view.setUint32(offset, sampleRate, true); offset += 4;
  view.setUint32(offset, byteRate, true); offset += 4;
  view.setUint16(offset, blockAlign, true); offset += 2;
  view.setUint16(offset, 16, true); offset += 2; // bits per sample
  writeString(offset, "data"); offset += 4;
  view.setUint32(offset, data.length * 2, true); offset += 4;

  const out = new Uint8Array(buffer);
  for (let i = 0; i < data.length; i++) {
    out[44 + i * 2] = data[i] & 0xff;
    out[44 + i * 2 + 1] = (data[i] >> 8) & 0xff;
  }
  // base64 encode
  let binary = "";
  for (let i = 0; i < out.length; i++) binary += String.fromCharCode(out[i]);
  return btoa(binary);
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

    const { text, lang } = await req.json();
    if (!text || !lang) {
      return new Response(JSON.stringify({ error: "text and lang required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const language_code = mapLang(lang);

    try {
      const res = await fetch("https://api.sarvam.ai/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-subscription-key": apiKey,
        },
        body: JSON.stringify({ 
          inputs: [text],
          target_language_code: language_code,
          speaker: "meera",
          pitch: 0,
          pace: 1.0,
          loudness: 1.0,
          speech_sample_rate: 8000,
          enable_preprocessing: true,
          model: "bulbul:v1"
        }),
      });

      if (!res.ok) {
        const errTxt = await res.text();
        console.error("Sarvam TTS error", res.status, errTxt);
        const fallback = generateBeepWavBase64();
        return new Response(
          JSON.stringify({ audioBase64: fallback, contentType: "audio/wav", note: "fallback_beep" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await res.json();
      // Sarvam API returns an array of audios
      const audios = data?.audios;
      const audioBase64 = Array.isArray(audios) && audios.length > 0 ? audios[0] : data?.audio;
      if (!audioBase64) {
        console.warn("Sarvam TTS unknown response shape, using fallback");
        const fallback = generateBeepWavBase64();
        return new Response(
          JSON.stringify({ audioBase64: fallback, contentType: "audio/wav", note: "fallback_shape" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ audioBase64, contentType: "audio/wav" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (e) {
      console.error("Sarvam TTS exception", e);
      const fallback = generateBeepWavBase64();
      return new Response(
        JSON.stringify({ audioBase64: fallback, contentType: "audio/wav", note: "fallback_exception" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error: any) {
    console.error("sarvam-tts fatal", error);
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});