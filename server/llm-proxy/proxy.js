/**
 * Optional lightweight Node.js proxy server (~50 lines)
 * Holds API keys securely in server environment variables for Live mode.
 * The client application never has API keys baked into the bundle.
 */

import http from 'http';

const PORT = process.env.PORT || 3001;
const TARGET_API_URL = process.env.LLM_TARGET_URL || 'https://api.openai.com/v1/chat/completions';
const API_KEY = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || '';

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/api/llm') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        const clientPayload = JSON.parse(body);

        const headers = {
          'Content-Type': 'application/json',
        };

        // Attach server-side API key if available
        if (API_KEY) {
          headers['Authorization'] = `Bearer ${API_KEY}`;
        }

        const upstreamResponse = await fetch(TARGET_API_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify(clientPayload),
        });

        const upstreamData = await upstreamResponse.text();
        res.writeHead(upstreamResponse.status, { 'Content-Type': 'application/json' });
        res.end(upstreamData);
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'LLM proxy error', details: error.message }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`[LLM Proxy] Running on http://localhost:${PORT}/api/llm`);
});
