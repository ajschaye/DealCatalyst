import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate an AI summary for a deal based on its metadata and notes
 */
export async function generateDealSummary(dealData: {
  company: string;
  website?: string;
  internalContact?: string;
  businessUnit?: string;
  dealType: string;
  investmentSize?: number;
  useCase?: string;
  notes?: string;
  tags?: string[];
}): Promise<string> {
  const prompt = `
    Please generate a 3-5 sentence executive summary of this potential business deal:
    
    Company: ${dealData.company}
    ${dealData.website ? `Website: ${dealData.website}` : ''}
    ${dealData.businessUnit ? `Business Unit: ${dealData.businessUnit}` : ''}
    ${dealData.dealType ? `Deal Type: ${dealData.dealType}` : ''}
    ${dealData.investmentSize ? `Investment Size: $${dealData.investmentSize.toLocaleString()}` : ''}
    ${dealData.useCase ? `Use Case: ${dealData.useCase}` : ''}
    ${dealData.tags?.length ? `Tags: ${dealData.tags.join(', ')}` : ''}
    ${dealData.notes ? `Notes: ${dealData.notes}` : ''}
    
    The summary should be concise, highlight strategic value, and be suitable for executive leadership review.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
    });

    return response.choices[0].message.content?.trim() || "Summary generation failed.";
  } catch (error) {
    console.error("Error generating deal summary:", error);
    return "Unable to generate summary at this time. Please try again later.";
  }
}

/**
 * Generate a comprehensive market research report for a company
 */
export async function generateMarketResearch(dealData: {
  company: string;
  website?: string;
  businessUnit?: string;
  dealType: string;
  useCase?: string;
  tags?: string[];
  industry?: string;
}): Promise<{ content: string }> {
  const prompt = `
    Generate a comprehensive market research report for ${dealData.company}.
    
    Company Details:
    - Name: ${dealData.company}
    ${dealData.website ? `- Website: ${dealData.website}` : ''}
    ${dealData.businessUnit ? `- Our Business Unit: ${dealData.businessUnit}` : ''}
    ${dealData.dealType ? `- Deal Type: ${dealData.dealType}` : ''}
    ${dealData.useCase ? `- Use Case: ${dealData.useCase}` : ''}
    ${dealData.tags?.length ? `- Tags: ${dealData.tags.join(', ')}` : ''}
    ${dealData.industry ? `- Industry: ${dealData.industry}` : ''}
    
    Please structure your report with the following sections:
    1. Executive Summary
    2. Company Overview
    3. Market Analysis
    4. Competitive Landscape
    5. Strategic Fit Assessment
    6. Risk Analysis
    7. Recommendation
    
    For each section, provide detailed information that would be useful for our business development team to evaluate this opportunity.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2000,
    });

    return { content: response.choices[0].message.content?.trim() || "Report generation failed." };
  } catch (error) {
    console.error("Error generating market research:", error);
    return { content: "Unable to generate market research at this time. Please try again later." };
  }
}
