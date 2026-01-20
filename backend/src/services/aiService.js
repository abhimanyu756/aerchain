const { model } = require('../config/gemini');

/**
 * AI Service - Handles all AI-related operations using Gemini
 */

/**
 * Parse natural language input and extract structured RFP data
 * @param {string} naturalLanguageInput - User's natural language description
 * @returns {Promise<object>} - Structured RFP data
 */
async function parseRFPFromText(naturalLanguageInput) {
  // Get today's date for relative date calculations
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format

  const prompt = `You are an expert procurement assistant. Extract structured RFP information from the following natural language description.

TODAY'S DATE: ${todayStr}

User Input: ${naturalLanguageInput}

Extract and return ONLY a valid JSON object with the following structure (no markdown, no code blocks, just pure JSON):
{
  "title": "Brief descriptive title for the RFP",
  "description": "Full description of what is being procured",
  "budget": numeric value only (or null if not mentioned),
  "currency": "USD/EUR/INR/etc" (or "USD" as default),
  "delivery_deadline": "YYYY-MM-DD format" (calculate actual date if relative, e.g., "30 days" from today means ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}),
  "payment_terms": "extracted payment terms" (or null if not mentioned),
  "warranty_requirements": "warranty details" (or null if not mentioned),
  "items": [
    {
      "name": "item name",
      "quantity": numeric,
      "specifications": "detailed specs"
    }
  ],
  "additional_requirements": "any other requirements" (or null if not mentioned)
}

CRITICAL DATE INSTRUCTIONS:
- Today's date is ${todayStr}
- If user says "30 days deadline", calculate: today + 30 days = ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
- If user says "within 2 weeks", calculate: today + 14 days
- If user says "by next month", calculate the last day of next month
- ALWAYS return dates in YYYY-MM-DD format (e.g., 2026-02-15)
- Never return relative terms like "30 days" - convert to actual dates

Important:
- Be precise and extract all relevant details
- If information is missing, use null
- Ensure all numeric values are numbers, not strings
- Return ONLY the JSON object, no additional text
- Do not wrap the response in markdown code blocks`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up the response - remove markdown code blocks if present
    text = text.trim();
    if (text.startsWith('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/```\n?/g, '');
    }

    // Parse JSON
    const parsedData = JSON.parse(text);

    // Post-process: ensure empty strings become null
    if (parsedData.delivery_deadline === '' || parsedData.delivery_deadline === 'null') {
      parsedData.delivery_deadline = null;
    }
    if (parsedData.budget === '' || parsedData.budget === 'null') {
      parsedData.budget = null;
    }

    console.log('✅ Successfully parsed RFP from natural language');
    console.log('📅 Delivery deadline:', parsedData.delivery_deadline);
    return parsedData;
  } catch (error) {
    console.error('❌ Error parsing RFP from text:', error);
    throw new Error('Failed to parse RFP from natural language input');
  }
}

/**
 * Parse vendor proposal from email body
 * @param {string} emailBody - Raw email body text
 * @param {object} rfpDetails - Original RFP details for context
 * @returns {Promise<object>} - Structured proposal data
 */
async function parseProposalFromEmail(emailBody, rfpDetails) {
  const prompt = `You are an expert at analyzing vendor proposals. Extract structured information from this vendor response.

RFP Details:
Title: ${rfpDetails.title}
Budget: ${rfpDetails.budget} ${rfpDetails.currency}
Items Requested: ${JSON.stringify(rfpDetails.items)}

Vendor Email Body:
${emailBody}

Extract and return ONLY a valid JSON object (no markdown, no code blocks):
{
  "total_price": numeric value (or null),
  "currency": "USD/EUR/INR/etc",
  "delivery_time_days": numeric (or null),
  "payment_terms": "extracted terms" (or null),
  "warranty_offered": "warranty details" (or null),
  "items_quoted": [
    {
      "name": "item",
      "quantity": numeric,
      "unit_price": numeric,
      "specifications": "specs offered"
    }
  ],
  "additional_terms": "other conditions" (or null),
  "completeness_score": 0-100 (how complete is this response based on RFP requirements)
}

Important:
- Extract pricing information carefully
- Calculate total_price if individual item prices are given
- Be precise with numbers
- Return ONLY the JSON object`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up the response
    text = text.trim();
    if (text.startsWith('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/```\n?/g, '');
    }

    const parsedData = JSON.parse(text);

    console.log('✅ Successfully parsed proposal from email');
    return parsedData;
  } catch (error) {
    console.error('❌ Error parsing proposal from email:', error);
    throw new Error('Failed to parse proposal from email');
  }
}

/**
 * Generate AI-powered comparison and recommendation for proposals
 * @param {object} rfpDetails - RFP details
 * @param {array} proposals - Array of proposal objects
 * @returns {Promise<object>} - AI analysis with scores and recommendation
 */
async function generateProposalComparison(rfpDetails, proposals) {
  const prompt = `You are a procurement expert evaluating vendor proposals.

RFP Requirements:
${JSON.stringify(rfpDetails, null, 2)}

Vendor Proposals:
${JSON.stringify(proposals, null, 2)}

Analyze and provide ONLY a valid JSON object (no markdown, no code blocks):
{
  "vendor_scores": [
    {
      "vendor_id": 1,
      "vendor_name": "...",
      "overall_score": 85,
      "price_score": 90,
      "delivery_score": 80,
      "terms_score": 85,
      "warranty_score": 90,
      "completeness_score": 85,
      "strengths": ["list of strengths"],
      "weaknesses": ["list of weaknesses"]
    }
  ],
  "summary": "comparative analysis highlighting key differences",
  "recommendation": {
    "recommended_vendor_id": 1,
    "reasoning": "detailed explanation of why this vendor is recommended"
  },
  "concerns": ["list of concerns if any, or empty array"]
}

Scoring criteria:
- Price competitiveness (30%): Lower price = higher score
- Delivery timeline (25%): Faster delivery = higher score
- Payment terms (15%): Better terms = higher score
- Warranty coverage (15%): Better warranty = higher score
- Completeness (15%): More complete response = higher score

Return ONLY the JSON object.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up the response
    text = text.trim();
    if (text.startsWith('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/```\n?/g, '');
    }

    const parsedData = JSON.parse(text);

    console.log('✅ Successfully generated proposal comparison');
    return parsedData;
  } catch (error) {
    console.error('❌ Error generating proposal comparison:', error);
    throw new Error('Failed to generate proposal comparison');
  }
}

module.exports = {
  parseRFPFromText,
  parseProposalFromEmail,
  generateProposalComparison,
};
