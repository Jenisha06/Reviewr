import 'dotenv/config';
import Groq from 'groq-sdk';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });


export async function runReviewAgent(files) {
  const diffText = buildDiffText(files);

  const [bugs, security, performance, style] = await Promise.all([
    runPass('bugs', diffText),
    runPass('security', diffText),
    runPass('performance', diffText),
    runPass('style', diffText),
  ]);

  return { bugs, security, performance, style };
}

async function runPass(type, diffText) {
  const prompts = {
    bugs: `You are a senior engineer doing a code review. Analyze this diff for BUGS ONLY.
Look for: logic errors, null pointer risks, off-by-one errors, unhandled edge cases, incorrect conditionals.
Return a JSON array of issues. Each issue: { line: string, severity: "critical"|"warning"|"info", title: string, description: string, suggestion: string }
If no issues found, return empty array [].
Return ONLY valid JSON, nothing else.`,

    security: `You are a security engineer doing a code review. Analyze this diff for SECURITY ISSUES ONLY.
Look for: SQL injection, XSS, exposed secrets, insecure auth, missing validation, CSRF risks.
Return a JSON array of issues. Each issue: { line: string, severity: "critical"|"warning"|"info", title: string, description: string, suggestion: string }
If no issues found, return empty array [].
Return ONLY valid JSON, nothing else.`,

    performance: `You are a performance engineer doing a code review. Analyze this diff for PERFORMANCE ISSUES ONLY.
Look for: N+1 queries, memory leaks, inefficient loops, missing indexes, unnecessary re-renders.
Return a JSON array of issues. Each issue: { line: string, severity: "critical"|"warning"|"info", title: string, description: string, suggestion: string }
If no issues found, return empty array [].
Return ONLY valid JSON, nothing else.`,

    style: `You are a senior engineer doing a code review. Analyze this diff for CODE STYLE ISSUES ONLY.
Look for: naming conventions, code duplication, overly complex functions, missing error handling, poor readability.
Return a JSON array of issues. Each issue: { line: string, severity: "critical"|"warning"|"info", title: string, description: string, suggestion: string }
If no issues found, return empty array [].
Return ONLY valid JSON, nothing else.`,
  };

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: `${prompts[type]}\n\nHere is the diff to review:\n\n${diffText}`
      }
    ]
  });

  try {
    const text = response.choices[0].message.content.trim();
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return [];
  }
}


function buildDiffText(files) {
  return files
    .filter(f => f.patch)
    .map(f => `### File: ${f.filename}\n${f.patch}`)
    .join('\n\n')
    .slice(0, 12000);
}