/**
 * AI Client with Three-Tier Fallback System
 * Primary: DeepSeek → Secondary: Gemini → Tertiary: OpenAI
 */

interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
  provider?: 'deepseek' | 'gemini' | 'openai';
}

/**
 * Call DeepSeek API
 */
async function callDeepSeek(prompt: string, systemPrompt: string): Promise<AIResponse> {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.choices[0].message.content,
      provider: 'deepseek',
    };
  } catch (error) {
    console.error('DeepSeek API failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Call Gemini API
 */
async function callGemini(prompt: string, systemPrompt: string): Promise<AIResponse> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || 'gemini-pro'}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt + '\n\n' + prompt },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.candidates[0].content.parts[0].text,
      provider: 'gemini',
    };
  } catch (error) {
    console.error('Gemini API failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Call OpenAI API
 */
async function callOpenAI(prompt: string, systemPrompt: string): Promise<AIResponse> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.choices[0].message.content,
      provider: 'openai',
    };
  } catch (error) {
    console.error('OpenAI API failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Main AI function with three-tier fallback
 */
export async function callAI(prompt: string, systemPrompt: string): Promise<AIResponse> {
  // Try DeepSeek first (Primary)
  console.log('Trying DeepSeek API...');
  const deepseekResponse = await callDeepSeek(prompt, systemPrompt);
  if (deepseekResponse.success) {
    console.log('DeepSeek API succeeded');
    return deepseekResponse;
  }

  // Try Gemini second (Secondary)
  console.log('DeepSeek failed, trying Gemini API...');
  const geminiResponse = await callGemini(prompt, systemPrompt);
  if (geminiResponse.success) {
    console.log('Gemini API succeeded');
    return geminiResponse;
  }

  // Try OpenAI last (Tertiary)
  console.log('Gemini failed, trying OpenAI API...');
  const openaiResponse = await callOpenAI(prompt, systemPrompt);
  if (openaiResponse.success) {
    console.log('OpenAI API succeeded');
    return openaiResponse;
  }

  // All APIs failed
  console.error('All AI APIs failed');
  return {
    success: false,
    error: 'All AI providers failed. Please try again later.',
  };
}

/**
 * Get competitive price suggestion
 */
export async function getCompetitivePriceSuggestion(
  minimumPrice: number,
  productDescription: string,
  craftCategory: string
): Promise<AIResponse> {
  const systemPrompt = `You are a market analyst for handmade goods. Analyze the current market on Etsy and Shopify for the given product category and provide pricing recommendations in JSON format.`;

  const prompt = `Based on a minimum retail price of $${minimumPrice} for a ${productDescription} in the ${craftCategory} category, analyze the current market and provide:
1. Optimal retail price range
2. Pricing strategy (premium, mid-range, or budget)
3. Competitive positioning advice
4. Market trends

Return your response in this JSON format:
{
  "optimalPriceRange": { "min": number, "max": number },
  "recommendedPrice": number,
  "pricingStrategy": "premium" | "mid-range" | "budget",
  "competitivePositioning": "string",
  "marketTrends": "string"
}`;

  return callAI(prompt, systemPrompt);
}

/**
 * Find better material prices
 */
export async function findBetterMaterialPrices(
  materialName: string,
  currentSupplier: string,
  currentPrice: number,
  unitType: string
): Promise<AIResponse> {
  const systemPrompt = `You are a procurement specialist helping handmade creators find better material prices. Search for alternative suppliers and compare prices.`;

  const prompt = `Find better prices for this material:
- Material: ${materialName}
- Current Supplier: ${currentSupplier}
- Current Price: $${currentPrice} per ${unitType}

Search for alternative suppliers and provide:
1. Suggested suppliers with better prices
2. Price comparison
3. Potential savings
4. Quality considerations
5. Shipping cost factors

Return your response in this JSON format:
{
  "foundBetterPrice": boolean,
  "suggestions": [
    {
      "supplier": "string",
      "price": number,
      "savings": number,
      "qualityNotes": "string",
      "shippingNotes": "string"
    }
  ],
  "totalPotentialSavings": number
}`;

  return callAI(prompt, systemPrompt);
}

/**
 * Parse user input for material calculator
 */
export async function parseUserInput(userInput: string, savedProducts: any[]): Promise<AIResponse> {
  const systemPrompt = `You are an AI assistant helping users calculate material quantities. Parse the user's natural language input and match it with their saved products.`;

  const productsList = savedProducts.map(p => `- ${p.product_name} (${p.craft_category})`).join('\n');

  const prompt = `User input: "${userInput}"

User's saved products:
${productsList}

Parse the input and return:
1. Quantity requested
2. Product type/name
3. Matched product from saved products (if any)
4. Dimensions (if provided)

Return your response in this JSON format:
{
  "quantity": number,
  "productType": "string",
  "matchedProductId": "string or null",
  "dimensions": "string or null",
  "confidence": "high" | "medium" | "low"
}`;

  return callAI(prompt, systemPrompt);
}