import { GoogleGenerativeAI } from '@google/generative-ai';

class AIClient {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async getCompetitivePricing(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error getting competitive pricing:', error);
      throw error;
    }
  }

  async monitorPrices(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error monitoring prices:', error);
      throw error;
    }
  }

  async parseUserInput(input: string): Promise<any> {
    try {
      const prompt = `Parse this user input about materials and costs into JSON format: ${input}`;
      const result = await this.model.generateContent(prompt);
      return JSON.parse(result.response.text());
    } catch (error) {
      console.error('Error parsing user input:', error);
      throw error;
    }
  }
}

export const aiClient = new AIClient();