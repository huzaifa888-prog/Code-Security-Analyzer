import { GoogleGenAI, Type } from "@google/genai";

export interface AnalysisResult {
  issues: string[];
  score: number;
  compliant: boolean;
  suggestions: string[];
}

const SYSTEM_INSTRUCTION = `You are a code security expert analyzing code against company security policies.
Check if the code follows the policy strictly.

Scoring Rules:
- 0-20: Critical violations
- 21-50: Serious issues
- 51-75: Minor issues
- 76-100: Compliant or minor concerns only

Return ONLY valid JSON following this schema:
{
  "issues": ["specific issue found"],
  "score": number (0-100),
  "compliant": boolean,
  "suggestions": ["how to fix"]
}`;

export class SecurityAnalyzerService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async analyze(policy: string, code: string): Promise<AnalysisResult> {
    const prompt = `SECURITY POLICY:
${policy}

CODE TO ANALYZE:
\`\`\`
${code}
\`\`\`

Analyze the code against the policy and return the JSON results.`;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              issues: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              score: { type: Type.NUMBER },
              compliant: { type: Type.BOOLEAN },
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["issues", "score", "compliant", "suggestions"]
          }
        },
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");
      
      return JSON.parse(text) as AnalysisResult;
    } catch (error) {
      console.error("AI Analysis failed:", error);
      throw error;
    }
  }
}

export const securityService = new SecurityAnalyzerService();
