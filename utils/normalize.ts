export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function normalizeMerchant(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\u0E00-\u0E7F]/g, ''); // keep alphanumeric and Thai characters, remove symbols
}

export function generateFileUUID(): string {
  return crypto.randomUUID();
}
