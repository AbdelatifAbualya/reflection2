import { config } from 'dotenv';
config();

// CORS headers for Vercel deployment
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle CORS preflight requests
function handleOptions(req, res) {
  res.setHeader('Vary', 'Origin');
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  return res.status(204).end();
}

// Main API handler
export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleOptions(req, res);
  }

  // Set CORS headers for all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, temperature = 0.2, top_p = 0.9, top_k = 40, max_tokens = 16384, stream = false, model = "deepseek" } = req.body;

    // Validate required parameters
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // Both models use Fireworks.ai API
    const fireworksKey = process.env.FIREWORKS_API_KEY;
    if (!fireworksKey) {
      console.error('FIREWORKS_API_KEY environment variable is not set');
      return res.status(500).json({ 
        error: 'API configuration error',
        message: 'Fireworks API key not configured'
      });
    }

    // Determine which model to use - both via Fireworks.ai
    let modelName;
    if (model === "qwen") {
      // Try different possible Qwen model names
      modelName = "accounts/fireworks/models/qwen2p5-72b-instruct";
    } else {
      // DeepSeek V3 via Fireworks.ai
      modelName = "accounts/fireworks/models/deepseek-v3";
    }

    const apiConfig = {
      url: 'https://api.fireworks.ai/inference/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${fireworksKey}`
      },
      model: modelName
    };

    // Call the Fireworks.ai API
    const response = await fetch(apiConfig.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...apiConfig.headers
      },
      body: JSON.stringify({
        model: apiConfig.model,
        messages,
        temperature: Math.min(temperature, 1.0), // Cap temperature at 1.0 for stability
        top_p,
        top_k,
        max_tokens,
        stream,
        presence_penalty: 0,
        frequency_penalty: 0
      })
    });

    if (!response.ok) {
      let errorMessage;
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || `${model.toUpperCase()} API error`;
      } catch (jsonError) {
        // If response is not JSON, get text content
        const errorText = await response.text();
        errorMessage = `${model.toUpperCase()} API error: ${response.status} ${response.statusText}. ${errorText.substring(0, 200)}`;
      }
      throw new Error(errorMessage);
    }

    // Handle streaming responses
    if (stream) {
      // Set appropriate headers for streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Stream the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        res.write(chunk);
      }

      res.end();
    } else {
      // Return regular JSON response
      const data = await response.json();
      return res.status(200).json(data);
    }

  } catch (error) {
    console.error('Chat API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}