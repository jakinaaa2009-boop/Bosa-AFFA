const BACKEND = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/+$/, '');

function requireBackend() {
  if (!BACKEND) {
    return new Response(
      JSON.stringify({ message: 'Backend URL is not configured (NEXT_PUBLIC_API_BASE_URL).' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
  return null;
}

async function proxy(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  const err = requireBackend();
  if (err) return err;

  const { path = [] } = await ctx.params;
  const url = new URL(req.url);
  const target = new URL(`${BACKEND}/api/${path.join('/')}`);
  target.search = url.search;

  // Copy headers except host-related ones; preserve auth headers.
  const headers = new Headers(req.headers);
  headers.delete('host');
  // Let fetch compute framing headers for the forwarded body.
  headers.delete('content-length');
  headers.delete('transfer-encoding');
  headers.delete('connection');

  const method = req.method.toUpperCase();
  const hasBody = !['GET', 'HEAD'].includes(method);

  const upstream = await fetch(target, {
    method,
    headers,
    // Stream through when possible (supports JSON + multipart).
    body: hasBody ? req.body : undefined,
    // Node fetch requires duplex when streaming request bodies.
    ...(hasBody ? ({ duplex: 'half' } as any) : null),
    redirect: 'manual'
  });

  const resHeaders = new Headers(upstream.headers);
  // Ensure CORS-friendly defaults when called from browser on same-origin.
  resHeaders.set('access-control-allow-origin', '*');
  resHeaders.set('access-control-allow-headers', 'authorization, content-type');
  resHeaders.set('access-control-allow-methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');

  return new Response(upstream.body, { status: upstream.status, headers: resHeaders });
}

export async function GET(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  return proxy(req, ctx);
}
export async function POST(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  return proxy(req, ctx);
}
export async function PUT(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  return proxy(req, ctx);
}
export async function PATCH(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  return proxy(req, ctx);
}
export async function DELETE(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  return proxy(req, ctx);
}
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'authorization, content-type',
      'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS'
    }
  });
}

