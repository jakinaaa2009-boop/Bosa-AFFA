export function apiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000';
}

export function resolveReceiptImage(src: string) {
  if (!src) return src;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  // backend stores as API path like "/api/submissions/:id/receipt"
  return `${apiBaseUrl()}${src}`;
}

