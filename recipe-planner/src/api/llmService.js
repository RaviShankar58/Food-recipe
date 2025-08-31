async function safeParseTextResponse(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}


export async function getLLMInstructions(prompt, opts = {}) {
  try {
    const body = {
      prompt: prompt,
      model: opts.model,
      temperature: typeof opts.temperature === 'number' ? opts.temperature : 0.2,
      max_tokens: opts.max_tokens ?? 600,
    };

    const functionPath =
      import.meta.env.DEV
        ? '/api/llm'                   // local netlify dev
        : '/.netlify/functions/llm'; 

    const res = await fetch(functionPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // body: JSON.stringify(body),
      body: JSON.stringify({ prompt: body.prompt }), 
    });

    // const res = await fetch('/api/llm', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(body),
    // });

    // const text = await res.text();
    const data = await res.json();
    // let data;
    // try {
    //   data = JSON.parse(text);
    // } catch {
    //   if (!res.ok) throw new Error(`LLM proxy error ${res.status}: ${text}`);
    //   return text;
    // }

    if (!res.ok) {
      throw new Error(`LLM proxy error ${res.status}: ${JSON.stringify(data)}`);
    }

    if (data?.status === 'success' && typeof data?.response === 'string') {
      return data.response;
    }

    if (data?.status === 'rate_limited') {
      throw new Error(`LLM rate limited. Retry after ${data.retry_after ?? 'a few'}s`);
    }
    if (data?.status === 'error') {
      throw new Error(data.error || 'LLM returned error');
    }

    return data.response ?? JSON.stringify(data);
  } catch (err) {
    console.error('getLLMInstructions (proxy) error:', err);
    return `Error contacting LLM proxy: ${err.message || err}`;
  }
}