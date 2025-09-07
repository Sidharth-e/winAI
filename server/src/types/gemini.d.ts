declare module '@google/generative-ai' {
  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    getGenerativeModel(params: { model: string }): GenerativeModel;
  }

  export interface GenerativeModel {
    generateContent(prompt: string): Promise<GenerateContentResponse>;
  }

  export interface GenerateContentResponse {
    response: Response;
  }

  export interface Response {
    text(): Promise<string>;
  }
}
