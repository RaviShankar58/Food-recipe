// netlify/functions/llm.mjs
export async function handler(event, context) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Only POST allowed' };
    }

    // parse incoming JSON
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (e) {
      console.error('Invalid JSON body:', event.body);
      return { statusCode: 400, body: JSON.stringify({ status: 'error', error: 'Invalid JSON' }) };
    }

    const { prompt } = body;
    if (!prompt) {
      return { statusCode: 400, body: JSON.stringify({ status: 'error', error: 'Missing prompt' }) };
    }

    // <<< CORRECT upstream endpoint & payload >>>
    const apiUrl = 'https://apifreellm.com/api/chat';
    const apiKey = process.env.APIFREE_KEY || ''; // optional

    console.log('Proxy: calling', apiUrl, 'with prompt preview:', String(prompt).slice(0, 200));
    const headers = { 'Content-Type': 'application/json' };
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

    const apiRes = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message: prompt }),
    });

    // ApiFreeLLM returns JSON with { status, response, error, retry_after }
    const text = await apiRes.text();
    console.log('Upstream status:', apiRes.status, 'body-preview:', text.slice(0, 1000));

    let js;
    try {
      js = JSON.parse(text);
    } catch {
      // If upstream returns HTML or non-JSON, forward as error
      return { statusCode: 502, body: JSON.stringify({ status: 'error', error: 'Upstream returned non-JSON', raw: text.slice(0, 2000) }) };
    }

    // Forward upstream JSON unchanged (keeps status field)
    return {
      statusCode: 200,
      body: JSON.stringify(js),
    };

  } catch (err) {
    console.error('Proxy error:', err);
    return { statusCode: 500, body: JSON.stringify({ status: 'error', error: String(err) }) };
  }
}
