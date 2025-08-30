// netlify/functions/llm.js
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Only POST allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (err) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const prompt = body.prompt ?? body.message;
  const model = body.model ?? 'gpt-4o-mini';
  const temperature = typeof body.temperature === 'number' ? body.temperature : 0.2;
  const max_tokens = body.max_tokens ?? 600;

  if (!prompt) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing prompt' }) };
  }

  try {
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
        max_tokens,
      }),
    });

    const text = await apiRes.text();
    const contentType = apiRes.headers.get('content-type') || 'text/plain';

    return {
      statusCode: apiRes.status,
      headers: { 'Content-Type': contentType },
      body: text,
    };
  } catch (err) {
    console.error('Proxy error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(err) }),
    };
  }
};
