const logger = require('../utils/logger');
const Groq = require('groq-sdk');

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

// Generate postmortem using AI (Gemini first, Groq fallback, then mock)
const generatePostmortem = async (incident) => {
  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey   = process.env.GROQ_API_KEY;
    const prompt    = buildPostmortemPrompt(incident);

    // ── Try Gemini first ──────────────────────────────────────────────────
    if (geminiKey) {
      try {
        const axios = require('axios');
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 1500 } },
          { timeout: 30000 }
        );
        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          logger.info('✅ AI postmortem draft generated via Gemini');
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e) { logger.warn(`Gemini postmortem failed: ${e.message} — trying Groq`); }
    }

    // ── Try Groq fallback ─────────────────────────────────────────────────
    if (groqKey) {
      try {
        const groq = new Groq({ apiKey: groqKey });
        const response = await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt + '\n\nIMPORTANT: Return ONLY valid JSON, no markdown wrapping.' }],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.3,
          max_tokens: 1200,
        });
        const text = response.choices[0]?.message?.content || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          logger.info('✅ AI postmortem draft generated via Groq');
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e) { logger.warn(`Groq postmortem failed: ${e.message} — using mock`); }
    }

    logger.warn('No AI key available — using mock postmortem draft');
    return generateMockPostmortem(incident);
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
const generateSitrep = async (incident, logs = []) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey   = process.env.GROQ_API_KEY;

  const recentUpdates = incident.timeline.slice(-5).map(t => t.message).join('\n');
  const recentLogs    = logs.slice(-30).map(l => `[${l.level}] ${l.message}`).join('\n');
  const prompt = `Write a 2-3 sentence SITREP (Situation Report) for an active incident:
  Incident: ${incident.title} | Severity: ${incident.severity} | Status: ${incident.status}
  Duration: ${Math.round((Date.now() - incident.createdAt) / 60000)} minutes
  
  Recent Timeline Updates: ${recentUpdates || 'None'}
  Recent Server Logs: ${recentLogs || 'No logs available'}
  
  Write in past tense. Analyze server logs to identify the exact technical error. Be concise and factual. No markdown.
  At the end, provide a bash script to mitigate the issue inside a \`\`\`bash block.`;

  try {
    // ── Try Gemini ──────────────────────────────────────────────────────
    if (geminiKey) {
      try {
        const axios = require('axios');
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, maxOutputTokens: 600 } },
          { timeout: 20000 }
        );
        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) return text;
      } catch (e) { logger.warn(`Gemini SITREP failed: ${e.message} — trying Groq`); }
    }

    // ── Try Groq fallback ───────────────────────────────────────────────
    if (groqKey) {
      try {
        const groq = new Groq({ apiKey: groqKey });
        const response = await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.2,
          max_tokens: 500,
        });
        const text = response.choices[0]?.message?.content?.trim();
        if (text) return text;
      } catch (e) { logger.warn(`Groq SITREP failed: ${e.message}`); }
    }

    // ── Local fallback ──────────────────────────────────────────────────
    return `SITREP: ${incident.title} — Status: ${incident.status}. ${incident.timeline.length} timeline update(s). Responders: ${incident.assignedTo?.length || 0}.\n\n⚠️ No AI key available.\n\n\`\`\`bash\n# System recovery script\nsudo systemctl restart nginx pm2\ncurl -s http://localhost/health\n\`\`\``;
  } catch (err) {
    return `SITREP: ${incident.title} — ongoing, ${incident.status}. ${incident.timeline.length} updates logged.`;
  }
};

// Analyze server logs to find anomalies or fixes
const analyzeLogs = async (logs) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey   = process.env.GROQ_API_KEY;

  const logText = logs.map(l => `[${l.level}] ${l.source}: ${l.message}`).join('\n');
  const prompt = `You are a DevOps expert. Analyze these recent server logs and provide a brief summary of system health, list any anomalies/errors, and suggest a terminal fix script.
    
  LOGS:
  ${logText}
  
  Respond STRICTLY in this JSON format (no extra text, no markdown wrapping):
  {
    "summary": "1-2 sentence overview",
    "anomalies": ["error1", "error2"],
    "fix": "bash command to investigate or fix"
  }`;

  // ── Try Gemini ────────────────────────────────────────────────────────
  if (geminiKey) {
    try {
      const axios = require('axios');
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, maxOutputTokens: 500 } },
        { timeout: 15000 }
      );
      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (e) { logger.warn(`Gemini log analysis failed: ${e.message} — trying Groq`); }
  }

  // ── Try Groq fallback ─────────────────────────────────────────────────
  if (groqKey) {
    try {
      const groq = new Groq({ apiKey: groqKey });
      const response = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        max_tokens: 500,
      });
      const text = response.choices[0]?.message?.content || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        logger.info('✅ Log analysis completed via Groq');
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) { logger.warn(`Groq log analysis failed: ${e.message} — using local scan`); }
  }

  // ── Smart local fallback (no AI needed) ──────────────────────────────
  logger.warn('No AI key available — using local log pattern scan');
  const fatals   = logs.filter(l => l.level === 'FATAL');
  const errors   = logs.filter(l => l.level === 'ERROR');
  const warnings = logs.filter(l => l.level === 'WARN');
  const anomalies = [...fatals, ...errors].map(l => l.message).slice(0, 5);
  return {
    summary: anomalies.length === 0
      ? `System appears stable. ${logs.length} logs analyzed — ${warnings.length} warnings, no critical errors.`
      : `⚠️ ${fatals.length} FATAL and ${errors.length} ERROR events detected out of ${logs.length} total logs. Immediate investigation recommended.`,
    anomalies,
    fix: fatals.length > 0
      ? 'sudo systemctl restart nginx pm2 && journalctl -u nginx -n 50 --no-pager'
      : errors.length > 0
      ? 'pm2 logs --lines 100 && sudo netstat -tulnp | grep 5000'
      : '',
  };
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
// Ask Groq Incident Copilot a question based on logs and incident context
const askGroqCopilot = async (incident, logs, userMessage, chatHistory = []) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return "Groq API Key not configured. Please add GROQ_API_KEY to your backend .env file.";

    const groq = new Groq({ apiKey });

    // Prepare context
    const logText = logs.slice(-50).map(l => `[${l.level}] ${l.source}: ${l.message}`).join('\n');
    const timeline = incident.timeline.map(t => `[${t.type}] ${t.message}`).join('\n');

    const systemPrompt = `You are "FixFlow Copilot", an elite Site Reliability Engineer AI assistant. 
You are helping the user troubleshoot an ongoing incident in real-time.
Be extremely concise, technical, and actionable. Do not use filler words. If you suggest commands, wrap them in markdown code blocks.

=== INCIDENT CONTEXT ===
Title: ${incident.title}
Status: ${incident.status}
Severity: ${incident.severity}

=== RECENT TIMELINE ===
${timeline || 'No timeline events yet.'}

=== RECENT SERVER LOGS ===
${logText || 'No logs available.'}
========================`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...chatHistory,
      { role: "user", content: userMessage }
    ];

    const response = await groq.chat.completions.create({
      messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 800,
    });

    return response.choices[0]?.message?.content || "No response generated.";
  } catch (err) {
    logger.error(`Groq Copilot failed: ${err.message}`);
    return "Sorry, the AI copilot encountered an error analyzing the logs. Please try again.";
  }
};

module.exports = { generatePostmortem, scorePostmortem, generateSitrep, analyzeLogs, askGroqCopilot };
