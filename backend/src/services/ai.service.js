const logger = require('../utils/logger');

// Build the prompt for postmortem generation from an incident
const buildPostmortemPrompt = (incident) => {
  const timeline = incident.timeline
    .map(t => `  - [${t.type}] ${t.message} (${t.timestamp})`)
    .join('\n');

  return `You are a senior Site Reliability Engineer (SRE). Generate a professional postmortem report based on the following incident data.

INCIDENT DETAILS:
- Title: ${incident.title}
- Severity: ${incident.severity.toUpperCase()}
- Status: ${incident.status}
- Duration: ${incident.mttr ? `${Math.round(incident.mttr / 60)} minutes` : 'Unknown'}
- Affected Site: ${incident.siteId?.url || 'Unknown'}
- Responders: ${incident.assignedTo?.map(u => u.name).join(', ') || 'None assigned'}

TIMELINE:
${timeline}

Generate a JSON response with these exact fields:
{
  "summary": "2-3 sentence executive summary of what happened",
  "rootCause": "Detailed probable root cause based on timeline",
  "impact": "Who was affected, for how long, and what was the business impact",
  "whatWentWell": "What did the team do correctly during response",
  "whatWentWrong": "What gaps or failures led to or worsened the incident",
  "preventionSteps": "3-5 concrete steps to prevent recurrence",
  "timelineNarrative": "A readable narrative of what happened from start to resolution",
  "qualityScore": <number 1-10>,
  "qualityFeedback": "Brief feedback on completeness of the postmortem"
}`;
};

// Generate postmortem using AI (Gemini API or fallback)
const generatePostmortem = async (incident) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.warn('GEMINI_API_KEY not set — using mock AI draft');
      return generateMockPostmortem(incident);
    }

    const axios = require('axios');
    const prompt = buildPostmortemPrompt(incident);

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 1500 },
      },
      { timeout: 30000 }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI did not return valid JSON');

    const parsed = JSON.parse(jsonMatch[0]);
    logger.info('✅ AI postmortem draft generated');
    return parsed;
  } catch (err) {
    logger.error(`AI generation failed: ${err.message}. Using mock.`);
    return generateMockPostmortem(incident);
  }
};

// Score an existing postmortem for quality
const scorePostmortem = async (postmortem) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return { score: 7, feedback: 'AI scoring unavailable. Good postmortem structure detected.' };

    const axios = require('axios');
    const prompt = `Rate this postmortem section from 1-10 and give one sentence of feedback.
    Root Cause: ${postmortem.rootCause}
    Prevention Steps: ${postmortem.preventionSteps}
    Respond with JSON: { "score": <number>, "feedback": "<string>" }`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, maxOutputTokens: 200 } },
      { timeout: 15000 }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { score: 7, feedback: 'Good detail provided.' };
  } catch (err) {
    return { score: 7, feedback: 'AI scoring unavailable at this time.' };
  }
};

// Generate AI SITREP (war room summary) for an active incident
const generateSitrep = async (incident) => {
  // ... existing code
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const updates = incident.timeline.length;
      return `SITREP: ${incident.title} — Status: ${incident.status}. ${updates} timeline update(s). Responders: ${incident.assignedTo?.length || 0}. Duration: ${Math.round((Date.now() - incident.createdAt) / 60000)} min.`;
    }

    const axios = require('axios');
    const recentUpdates = incident.timeline.slice(-5).map(t => t.message).join('\n');
    const prompt = `Write a 2-3 sentence SITREP (Situation Report) for an active incident:
    Incident: ${incident.title} | Severity: ${incident.severity} | Status: ${incident.status}
    Duration: ${Math.round((Date.now() - incident.createdAt) / 60000)} minutes
    Recent updates:\n${recentUpdates}
    Write in past tense. Be concise and factual. No markdown.
    
    IMPORTANT: At the very end of your response, provide an exact terminal command script (Bash, Kubectl, or AWS CLI) that could potentially mitigate or investigate this specific issue based on the title. Format it strictly inside a \`\`\`bash block.`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, maxOutputTokens: 150 } },
      { timeout: 10000 }
    );

    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
  } catch (err) {
    return `SITREP: ${incident.title} — ongoing, ${incident.status}. ${incident.timeline.length} updates logged.`;
  }
};

// Analyze server logs to find anomalies or fixes
const analyzeLogs = async (logs) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return { summary: 'AI unavailable.', anomalies: [], fix: 'Add Gemini API Key.' };

    const axios = require('axios');
    const logText = logs.map(l => `[${l.level}] ${l.source}: ${l.message}`).join('\n');
    
    const prompt = `You are a DevOps expert. Analyze these recent server logs and provide a brief summary of system health, list any anomalies/errors, and suggest a terminal fix script.
    
    LOGS:
    ${logText}
    
    Respond STRICTLY in JSON format:
    {
      "summary": "1-2 sentence overview of what these logs show",
      "anomalies": ["list", "of", "critical", "errors", "or empty array"],
      "fix": "Bash command string to investigate or fix the anomalies (or empty string if healthy)"
    }`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, maxOutputTokens: 500 } },
      { timeout: 15000 }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: 'Error parsing AI response', anomalies: [], fix: '' };
  } catch (err) {
    logger.error(`AI Log Analysis failed: ${err.message}`);
    return { summary: 'Analysis failed.', anomalies: [], fix: '' };
  }
};

// Mock fallback when no API key
const generateMockPostmortem = (incident) => ({
  summary: `A ${incident.severity} severity incident was detected affecting ${incident.siteId?.name || 'the monitored service'}. The incident was ${incident.status} after ${incident.mttr ? Math.round(incident.mttr / 60) + ' minutes' : 'an unknown duration'}.`,
  rootCause: 'Root cause analysis pending. Review server logs, database connection pools, and recent deployment history to identify the triggering event.',
  impact: 'Service was unavailable or degraded. Affected users experienced errors or timeouts. Full impact assessment requires review of traffic logs.',
  whatWentWell: 'The automated monitoring system detected the issue and created an incident automatically. The team was notified in a timely manner.',
  whatWentWrong: 'No pre-existing alerts were configured for this type of failure. Manual intervention was required where automation could have helped.',
  preventionSteps: '1. Configure proactive alerts for error rate thresholds\n2. Implement circuit breakers\n3. Add database connection pool monitoring\n4. Create a runbook for this failure type\n5. Set up synthetic monitoring for critical user flows.',
  timelineNarrative: `The incident began when the monitoring system detected ${incident.title}. The team responded and worked to resolve the issue. The incident was eventually ${incident.status}.`,
  qualityScore: 6,
  qualityFeedback: 'AI key not configured. This is a template draft — please fill in specific technical details for each section.',
});

module.exports = { generatePostmortem, scorePostmortem, generateSitrep, analyzeLogs };
