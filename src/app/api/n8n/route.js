const WEBHOOK_TIMEOUT_MS = 30000;

function buildWebhookUrl(baseUrl, path) {
  const cleanPath = String(path || '').replace(/^\/+/, '');
  const trimmedBase = String(baseUrl || '').replace(/\/+$/, '');

  if (!trimmedBase || !cleanPath) return '';
  if (trimmedBase.includes('{path}')) {
    return trimmedBase.replace('{path}', cleanPath);
  }
  if (trimmedBase.endsWith(`/${cleanPath}`)) {
    return trimmedBase;
  }

  return `${trimmedBase}/${cleanPath}`;
}

function buildHeaders() {
  const headers = {
    'content-type': 'application/json',
  };

  const authHeader = process.env.N8N_WEBHOOK_AUTH_HEADER;
  const authValue = process.env.N8N_WEBHOOK_AUTH_VALUE;
  const bearerToken = process.env.N8N_WEBHOOK_AUTH_TOKEN;

  if (authHeader && authValue) {
    headers[authHeader] = authValue;
  } else if (bearerToken) {
    headers.authorization = `Bearer ${bearerToken}`;
  }

  return headers;
}

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, message: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const path = body?.path;
  const payload = body?.payload ?? {};
  const baseUrl = process.env.N8N_WEBHOOK_BASE_URL || process.env.N8N_WEBHOOK_URL || '';
  const webhookUrl = buildWebhookUrl(baseUrl, path);

  if (!webhookUrl) {
    return Response.json(
      {
        success: false,
        configured: false,
        message: 'N8N_WEBHOOK_BASE_URL is not configured',
      },
      { status: 503 }
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const text = await response.text();
    let data = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
    }

    return Response.json(
      {
        success: response.ok,
        configured: true,
        status: response.status,
        data,
      },
      { status: response.ok ? 200 : 502 }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        configured: true,
        message: error.name === 'AbortError' ? 'n8n webhook timed out' : error.message,
      },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
