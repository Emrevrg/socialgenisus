import { GoogleGenAI, Type } from "@google/genai";
import { TextModelResponse, ImageSize, AspectRatio, Platform } from "../types";

// Helper to get the client. Note: We create a new instance every call 
// to ensure we pick up the latest API key if it changed.
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please select an API Key.");
  }
  return new GoogleGenAI({ apiKey });
};

export const checkApiKey = async (): Promise<boolean> => {
  if (typeof window !== 'undefined' && (window as any).aistudio) {
    return await (window as any).aistudio.hasSelectedApiKey();
  }
  return !!process.env.API_KEY;
};

export const requestApiKey = async (): Promise<void> => {
  if (typeof window !== 'undefined' && (window as any).aistudio) {
    await (window as any).aistudio.openSelectKey();
  }
};

export const generateSocialText = async (
  topic: string,
  tone: string
): Promise<TextModelResponse> => {
  const ai = getAiClient();
  
  // Using gemini-2.5-flash for text generation as it is fast and efficient for structured JSON.
  // The user instructions suggested using Flash for fast tasks.
  const modelId = "gemini-2.5-flash";

  const prompt = `
    You are a world-class social media manager. 
    Topic: "${topic}"
    Tone: "${tone}"
    
    Generate 3 distinct social media posts:
    1. LinkedIn: Long-form, professional yet engaging, uses line breaks.
    2. Twitter/X: Short, punchy, under 280 chars, maybe 1-2 hashtags.
    3. Instagram: Visual-focused caption, engaging hook, 10-15 relevant hashtags at the bottom.

    Also provide a detailed image generation prompt for each that would suit the platform's aesthetic.
    - LinkedIn image: Professional, clean, infographic or office style.
    - Twitter image: Eye-catching, bold, meme-style or high contrast.
    - Instagram image: Aesthetic, lifestyle, high-quality photography style.
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          linkedin: {
            type: Type.OBJECT,
            properties: {
              content: { type: Type.STRING },
              imagePrompt: { type: Type.STRING }
            }
          },
          twitter: {
            type: Type.OBJECT,
            properties: {
              content: { type: Type.STRING },
              imagePrompt: { type: Type.STRING }
            }
          },
          instagram: {
            type: Type.OBJECT,
            properties: {
              content: { type: Type.STRING },
              imagePrompt: { type: Type.STRING }
            }
          }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");

  try {
    return JSON.parse(text) as TextModelResponse;
  } catch (e) {
    console.error("Failed to parse JSON", e);
    throw new Error("Invalid JSON response from Gemini");
  }
};

export const generateSocialImage = async (
  prompt: string,
  platform: Platform,
  size: ImageSize,
  aspectRatioSetting: AspectRatio
): Promise<string> => {
  const ai = getAiClient();
  const modelId = "gemini-3-pro-image-preview";

  // Determine aspect ratio
  let targetRatio = "1:1";
  
  if (aspectRatioSetting !== AspectRatio.AUTO) {
    targetRatio = aspectRatioSetting;
  } else {
    // Platform defaults
    switch (platform) {
      case Platform.LINKEDIN:
        targetRatio = "3:4"; // Portrait is good for LinkedIn mobile
        break;
      case Platform.TWITTER:
        targetRatio = "16:9"; // Standard landscape
        break;
      case Platform.INSTAGRAM:
        targetRatio = "3:4"; // optimal portrait for IG
        break;
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: targetRatio,
          imageSize: size
        }
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found in response");
  } catch (error) {
    console.error(`Error generating image for ${platform}:`, error);
    throw error;
  }
};
