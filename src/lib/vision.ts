// AI Vision API — uses Google Gemini Vision to analyze civic issue images
// Add VITE_GEMINI_API_KEY and VITE_GEMINI_MODEL to your .env.local (and to Vercel Environment Variables)

export interface VisionAnalysis {
  title: string;
  description: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  confidence: number;
}

const CATEGORIES = ['roads', 'sanitation', 'lighting', 'parks', 'water', 'electricity', 'noise', 'other'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];

const SYSTEM_PROMPT = `You are an AI assistant for CityResolve, a civic issue management platform.
Analyze the uploaded image and identify any civic/public infrastructure issues visible.
Describe ONLY what is actually visible in the image. Do not guess or invent details.

Respond with a JSON object containing:
- title: A concise issue title (max 10 words)
- description: Detailed description of the problem seen in the image (2-3 sentences)
- location: Only text actually visible in the image (street signs, shop names, landmarks). If none visible, return an empty string.
- severity: One of 'low', 'medium', 'high', 'critical' based on urgency and safety risk
- category: One of 'roads', 'sanitation', 'lighting', 'parks', 'water', 'electricity', 'noise', 'other'
- confidence: Number 0-100 indicating how confident you are in the analysis

If no civic issue is visible in the image, use category "other", severity "low" and a low confidence.
Return ONLY valid JSON, no markdown, no extra text.`;

// Shrinks the photo to max 1024px so the upload is fast and cheap
async function resizeImage(base64: string, mimeType: string, maxSize = 1024): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.85).split(',')[1]);
    };
    img.onerror = () => resolve(base64);
    img.src = `data:${mimeType};base64,${base64}`;
  });
}

export async function analyzeImage(base64Image: string, mimeType: string): Promise<VisionAnalysis> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const model = import.meta.env.VITE_GEMINI_MODEL;

  if (!apiKey || !model) {
    // Mock result only while developing locally. On the live site, throw an error instead.
    if (import.meta.env.DEV) {
      await new Promise((r) => setTimeout(r, 1500));
      return {
        title: 'Infrastructure issue detected',
        description:
          'Mock result (no API key configured). Please add VITE_GEMINI_API_KEY and VITE_GEMINI_MODEL.',
        location: '',
        severity: 'medium',
        category: 'other',
        confidence: 0,
      };
    }
    throw new Error('AI analysis is not configured');
  }

  const resized = await resizeImage(base64Image, mimeType);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: 'Analyze this image for civic issues. Describe only what is actually visible.',
              },
              { inline_data: { mime_type: 'image/jpeg', data: resized } },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (response.status === 429) {
    throw new Error('AI is busy right now (free limit reached). Please try again in a minute.');
  }
  if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

  const data = await response.json();
  const raw: string =
    data.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('') ?? '';
  const cleaned = raw.replace(/```json|```/g, '').trim();

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('AI returned an invalid response. Please try again.');
  }

  return {
    title: String(parsed.title || '').slice(0, 100),
    description: String(parsed.description || ''),
    location: String(parsed.location || ''),
    severity: SEVERITIES.includes(parsed.severity) ? parsed.severity : 'medium',
    category: CATEGORIES.includes(parsed.category) ? parsed.category : 'other',
    confidence: Math.min(100, Math.max(0, Number(parsed.confidence) || 0)),
  };
}

export function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve({ base64, mimeType: file.type });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function extractGpsFromExif(file: File): Promise<{ lat: number; lng: number } | null> {
  // Basic EXIF GPS extraction — full parsing needs a library, so this returns null for now.
  // Use navigator.geolocation in the form for the real location instead.
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const view = new DataView(e.target!.result as ArrayBuffer);
        if (view.getUint16(0) !== 0xffd8) {
          resolve(null);
          return;
        }
        let offset = 2;
        while (offset < view.byteLength) {
          if (view.getUint16(offset) === 0xffe1) {
            resolve(null);
            return;
          }
          offset += 2 + view.getUint16(offset + 2);
        }
        resolve(null);
      } catch {
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);
    reader.readAsArrayBuffer(file);
  });
}