import { GoogleGenAI, Modality, Part, Type } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import type { BoundingBox } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Converts a File object to a GoogleGenerativeAI.Part object.
async function fileToGenerativePart(file: File): Promise<Part> {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        }
    };
    reader.readAsDataURL(file);
  });
  const data = await base64EncodedDataPromise;
  return {
    inlineData: {
      data,
      mimeType: file.type,
    },
  };
}

export async function analyzeImageForTampering(imageFile: File, userPrompt: string): Promise<{ analysisText: string; manipulatedAreas: BoundingBox[] }> {
    const imagePart = await fileToGenerativePart(imageFile);
    const contents = { parts: [imagePart, { text: userPrompt }] };
    
    const systemInstruction = `You are a digital forensics expert. Analyze the provided image for any signs of digital manipulation or tampering. 
    Your goal is to teach a beginner what to look for.
    Your response must be a JSON object.
    1. Provide a concise, educational analysis in the 'analysisText' field.
    2. Identify specific manipulated areas in the 'manipulatedAreas' array.
    3. For each area, provide a bounding box with coordinates normalized between 0 and 1 (origin 0,0 is top-left).
    4. Provide a brief 'description' for each bounding box. If no manipulations are found, return an empty 'manipulatedAreas' array.`;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            analysisText: { type: Type.STRING, description: "Forensic analysis of the image." },
            manipulatedAreas: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING, description: "Description of the manipulation." },
                        box: {
                            type: Type.OBJECT,
                            properties: {
                                x1: { type: Type.NUMBER }, y1: { type: Type.NUMBER },
                                x2: { type: Type.NUMBER }, y2: { type: Type.NUMBER },
                            },
                            required: ["x1", "y1", "x2", "y2"]
                        }
                    },
                    required: ["description", "box"]
                }
            }
        },
        required: ["analysisText", "manipulatedAreas"]
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema,
        },
    });
    
    const jsonResult = JSON.parse(response.text);
    
    return {
        analysisText: jsonResult.analysisText,
        manipulatedAreas: jsonResult.manipulatedAreas.map((area: any) => ({
            description: area.description,
            x1: area.box.x1, y1: area.box.y1,
            x2: area.box.x2, y2: area.box.y2,
        }))
    };
}


export async function generateTamperedImage(imageFile: File): Promise<string> {
    const imagePart = await fileToGenerativePart(imageFile);
    const contents = {
        parts: [
            imagePart,
            { text: "Subtly manipulate this image to serve as an educational example of tampering. Make a change that is difficult but not impossible to spot. For example, you could remove a small, non-essential object, slightly alter a reflection or shadow, or subtly change some background text. Do not add any text or explanation in your text response, only output the edited image." }
        ]
    };
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents,
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    const imagePartResponse = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);

    if (imagePartResponse && imagePartResponse.inlineData) {
        const mimeType = imagePartResponse.inlineData.mimeType;
        const base64Data = imagePartResponse.inlineData.data;
        return `data:${mimeType};base64,${base64Data}`;
    }

    throw new Error("Could not generate a tampered image. The model did not return an image part.");
}