export const SYSTEM_PROMPT = `You are an expert technical consultant and UX analyst at Google Antigravity.
Your job is to generate highly structured, detailed, and professional client deliverables based on input details.

CRITICAL INSTRUCTIONS:
1. You must respond ONLY with a raw JSON object matching the requested schema. Do not write any conversational text, introductory notes, or markdown formatting outside the JSON block.
2. Ensure all fields are filled with comprehensive, high-quality, professional copy. Do not use placeholders or generic fluff.
3. Every recommendation, finding, and requirement should look customized to the client's business context.
4. Ensure the JSON is syntactically valid and matches the requested structure exactly.`;

export function getAuditPrompt(inputs) {
  const {
    client_name,
    url,
    industry = 'Not specified',
    project_goals = 'Not specified',
    known_pain_points = 'Not specified',
    competitors = [],
    depth = 'summary'
  } = inputs;

  const competitorText = competitors.length > 0 ? competitors.join(', ') : 'None specified';

  return `Generate a comprehensive Website Audit report for:
Client: ${client_name}
URL: ${url}
Industry/Vertical: ${industry}
Project Goals: ${project_goals}
Known Pain Points: ${known_pain_points}
Competitor URLs: ${competitorText}
Audit Depth: ${depth} (summary = high-level strategic review; page-by-page = detailed element-level analysis)

You must output a JSON object adhering strictly to this schema:
{
  "client_name": "string (name of the client)",
  "url": "string (client URL)",
  "generated_at": "string (ISO date string)",
  "overall_score": "number 1-10 (weighted average of section scores, rounded to 1 decimal place)",
  "sections": [
    {
      "section_name": "Performance | SEO | Accessibility | Mobile/Responsive | UX Heuristics | Content Clarity | Conversion Elements",
      "score": "number 1-10",
      "findings": [
        {
          "issue": "string (description of the specific issue found)",
          "severity": "low | medium | high",
          "impact": "string (impact of this issue on UX or business)",
          "recommendation": "string (actionable fix for the issue)",
          "effort_estimate": "low | medium | high"
        }
      ]
    }
  ],
  "action_plan": {
    "quick_wins": ["string (high impact, low effort actions, list 3-5 items)"],
    "medium_term": ["string (medium effort/timeline actions, list 3-4 items)"],
    "long_term": ["string (strategic, structural or long-term items, list 2-3 items)"]
  }
}

Analyze the provided inputs. Since we don't have access to active crawlers in MVP, extrapolate realistic and highly relevant findings based on the industry norms, client's project goals, and known pain points. For example, if the goals are "speed up checkout" or "increase leads," focus findings heavily on UX Heuristics, Conversion Elements, and Performance. Use professional consulting terminology. Ensure all 7 section names specified above are included in the 'sections' array.`;
}

export function getPreScopingPrompt(inputs) {
  const {
    client_name,
    url = 'Not specified',
    competitors = [],
    discovery_notes,
    page_count_types = 'Not specified',
    platform_constraint = 'Not decided'
  } = inputs;

  const competitorText = competitors.length > 0 ? competitors.join(', ') : 'None specified';

  return `Generate a detailed Discovery and Pre-Scoping report for:
Client Name: ${client_name}
Website URL: ${url}
Competitor URLs: ${competitorText}
Discovery Notes:
${discovery_notes}

Page Count/Types Info: ${page_count_types}
Platform Constraint: ${platform_constraint}

You must output a JSON object adhering strictly to this schema:
{
  "client_name": "string",
  "generated_at": "string (ISO date string)",
  "competitor_analysis": [
    {
      "competitor_name": "string",
      "url": "string",
      "observation": "string (overall positioning and digital presence observation)",
      "key_findings": ["string (at least 2 specific observations about features, design, or layout)"],
      "key_takeaway": "string (strategic lesson for the client)"
    }
  ],
  "actionable_requirements": [
    {
      "category": "UI/UX | Navigation | Page Identity | Imagery | Compliance",
      "finding": "string (what was learned or observed in notes/industry)",
      "requirement": "string (the corresponding specific design requirement)"
    }
  ],
  "information_architecture": {
    "primary_pages": ["string (e.g. Home, About, Services, Contact)"],
    "template_based_pages": [
      {
        "template_type": "string (e.g. Service Detail, Blog Post, Case Study)",
        "usage": "string (when this template is used, e.g. 'For each of the 6 core services')"
      }
    ],
    "dynamic_pages": ["string (e.g. Search Results, Dynamic Blog Archive)"]
  },
  "feature_requirements": [
    {
      "page_type": "string (e.g. Home, Service Page, Contact Page)",
      "features": [
        {
          "feature": "string (e.g. Hero Video, Interactive Map, Multi-step Form)",
          "description": "string (what the feature does and how it behaves)",
          "mandatory": "boolean (true if critical for MVP, false if nice-to-have)"
        }
      ]
    }
  ],
  "forms_and_journeys": {
    "forms": [
      {
        "form_name": "string",
        "trigger_page": "string",
        "fields": ["string (list of field names, e.g., Name, Email, Project Type)"],
        "post_submission_action": "string (what happens after submit, e.g., redirect to thank you page, email sent)"
      }
    ],
    "user_journeys": [
      {
        "user_type": "string (e.g. Prospective Client, Existing Customer, Admin)",
        "entry_point": "string (where they land)",
        "action": "string (steps they take)",
        "outcome": "string (successful resolution of their goal)"
      }
    ]
  },
  "technical_requirements": {
    "platform_cms": "string (recommendation based on platform constraint or notes, with rationale)",
    "theme_structure": "string (custom theme vs framework recommendation, structural approach)",
    "hosting": "string (recommended host/server architecture, e.g. WP Engine, Vercel, AWS)",
    "performance": "string (caching, CDN, asset optimization requirements)",
    "security": "string (SSL, backups, firewall, login protection requirements)"
  },
  "content_ownership": [
    {
      "section": "string (page or block content name, e.g. Service Copy, Imagery, Product Photos)",
      "content_required": "string (nature of the content)",
      "source": "Existing | New",
      "responsibility": "Client | Agency"
    }
  ]
}

Analyze the provided inputs. Using the discovery notes, map out their scope, sitemap, specific page features, forms, key user journeys, hosting and tech requirements, and content ownership matrix. If the competitor URLs or notes are sparse, draw on industry best practices for the client's domain to generate a realistic, strategic starting draft.
CRITICAL FOR LENGTH: Write concise, clear, and punchy copy. Observations, observations, and description fields must be kept brief and limited to 1-2 sentences. Avoid generating long, wordy paragraphs. Limit lists and arrays (e.g. competitor analysis key findings, actionable requirements, templates, forms, user journeys, features, and content rows) to a maximum of 3-5 items each, focusing only on the most important points. This ensures the report is readable, fits presentation layouts, and fits within token generation budgets.`;
}
