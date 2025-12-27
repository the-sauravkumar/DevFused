declare module "@google/generative-ai" {
  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    getGenerativeModel(options: { model: string; generationConfig?: Record<string, unknown> }): {
      generateContent(prompt: string): Promise<{ response: { text(): string } }>;
    };
  }
}
