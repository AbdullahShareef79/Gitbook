import sanitizeHtml from 'sanitize-html';

const MAX_CONTENT_LENGTH = 10000; // 10k chars

const ALLOWED_TAGS = ['b', 'i', 'em', 'strong', 'code', 'pre', 'p', 'ul', 'ol', 'li', 'a', 'span', 'br', 'h1', 'h2', 'h3'];
const ALLOWED_ATTRIBUTES = {
  a: ['href', 'title', 'target'],
  span: ['class'],
};

export function SAFE(content: string): string {
  if (!content) return '';
  
  // Check length before processing
  if (content.length > MAX_CONTENT_LENGTH) {
    throw new Error(`Content too large: ${content.length} chars (max ${MAX_CONTENT_LENGTH})`);
  }

  return sanitizeHtml(content, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ['http', 'https'],
  });
}
