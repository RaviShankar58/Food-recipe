
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Only POST allowed');

  const { prompt, model = 'gpt-4o-mini', temperature = 0.2, max_tokens = 600 } = req.body || {};

  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  try {
    // Forward to ApiFreeLLM (server-side requests are not subject to browser CORS)
    const apiRes = await fetch('https://apifreellm.com/api/v1/completion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a helpful cooking assistant that returns concise, numbered recipe steps and estimates.' },
          { role: 'user', content: prompt }
        ],
        temperature,
        max_tokens
      }),
    });

    const text = await apiRes.text();

    // Return whatever the upstream returned (JSON or text) to the frontend
    res.status(apiRes.status).send(text);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: String(err) });
  }
}
