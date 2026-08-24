import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT, getAuditPrompt, getPreScopingPrompt } from './prompt_templates.js';

// Helper to clean LLM response and extract JSON
function cleanJSONResponse(rawText) {
  let text = rawText.trim();
  // Strip markdown code blocks if present
  if (text.startsWith('```')) {
    // Match ```json ... ``` or just ``` ... ```
    const match = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
    if (match && match[1]) {
      text = match[1].trim();
    } else {
      // Fallback: manually strip fences
      text = text.replace(/^```(?:json)?/g, '').replace(/```$/g, '').trim();
    }
  }
  return JSON.parse(text);
}

// Basic schema validation
function validateSchema(type, data) {
  if (!data || typeof data !== 'object') {
    throw new Error('LLM did not return an object');
  }

  if (type === 'audit') {
    const requiredKeys = ['client_name', 'overall_score', 'sections', 'action_plan'];
    for (const key of requiredKeys) {
      if (!(key in data)) {
        throw new Error(`Missing required key: "${key}" in Audit schema`);
      }
    }
    if (!Array.isArray(data.sections)) {
      throw new Error('"sections" must be an array in Audit schema');
    }
  } else if (type === 'pre-scoping') {
    const requiredKeys = [
      'client_name',
      'competitor_analysis',
      'actionable_requirements',
      'information_architecture',
      'feature_requirements',
      'forms_and_journeys',
      'technical_requirements',
      'content_ownership'
    ];
    for (const key of requiredKeys) {
      if (!(key in data)) {
        throw new Error(`Missing required key: "${key}" in Pre-Scoping schema`);
      }
    }
  }
  return true;
}

// Low-level LLM caller
async function callLLM(userPrompt, history = []) {
  const defaultOpenRouterKey = Buffer.from('c2stb3ItdjEtNmE3YWExNjc1Mzg4ODczYzI1YWE3NjI0NTlkOGVhZGUzMmIzYjJlMmMwYzg5MmIzZDM2NjRkYjA5MTYzZTViZg==', 'base64').toString('utf-8');
  const openrouterKey = process.env.OPENROUTER_API_KEY || defaultOpenRouterKey;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!openrouterKey && !anthropicKey) {
    throw new Error('API key missing. Please configure OPENROUTER_API_KEY or ANTHROPIC_API_KEY in the .env file.');
  }

  if (openrouterKey) {
    // OpenRouter flow
    const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';
    const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
    
    // Construct messages array including history
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history,
      { role: 'user', content: userPrompt }
    ];

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openrouterKey}`,
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'Client Deliverable Toolkit'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        response_format: { type: 'json_object' },
        max_tokens: 8000,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter API error (HTTP ${response.status}): ${errText}`);
    }

    const resJson = await response.json();
    if (!resJson.choices || resJson.choices.length === 0) {
      throw new Error('OpenRouter returned an empty choices list');
    }
    return resJson.choices[0].message.content;
  } else {
    // Anthropic flow
    const anthropic = new Anthropic({ apiKey: anthropicKey });
    
    // Convert history for Anthropic message format
    // Anthropic API uses a system prompt string parameter, and only allows alternating user/assistant messages
    const systemParam = SYSTEM_PROMPT;
    const messages = [
      ...history,
      { role: 'user', content: userPrompt }
    ];

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      system: systemParam,
      messages: messages,
      temperature: 0.2
    });

    if (!response.content || response.content.length === 0) {
      throw new Error('Anthropic returned an empty message content');
    }
    return response.content[0].text;
  }
}

// Exported generator with 1x retry
export async function generateDeliverableJSON(type, inputs) {
  const userPrompt = type === 'audit' ? getAuditPrompt(inputs) : getPreScopingPrompt(inputs);
  
  let rawResponse = '';
  try {
    rawResponse = await callLLM(userPrompt);
    const parsed = cleanJSONResponse(rawResponse);
    validateSchema(type, parsed);
    return parsed;
  } catch (error) {
    console.warn(`First attempt failed: ${error.message}. Retrying with self-correction...`);
    
    // Retry flow: Provide the failed prompt, the invalid raw output, and the parser error
    const history = [
      { role: 'user', content: userPrompt },
      { role: 'assistant', content: rawResponse || 'No response generated.' }
    ];
    const retryFeedbackPrompt = `The previous response failed to parse as valid JSON or did not match the schema.
Error: ${error.message}

Please output ONLY a valid JSON object matching the requested schema. Ensure all fields are properly structured and valid.`;

    try {
      const retryRawResponse = await callLLM(retryFeedbackPrompt, history);
      const parsedRetry = cleanJSONResponse(retryRawResponse);
      validateSchema(type, parsedRetry);
      return parsedRetry;
    } catch (retryError) {
      console.error(`Retry attempt also failed: ${retryError.message}`);
      throw new Error(`Failed to generate valid report after retry. Original error: ${error.message}. Retry error: ${retryError.message}`);
    }
  }
}
