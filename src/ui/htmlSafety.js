export const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

// Accept only the passive SVG primitives produced by our chart. This is not a
// general SVG sanitizer: unsupported markup is rejected, never repaired.
const numericAttributes = new Set(['width', 'height', 'cx', 'cy', 'r', 'x', 'y', 'x1', 'x2', 'y1', 'y2', 'rx', 'ry', 'stroke-width', 'opacity', 'fill-opacity', 'stroke-opacity']);
const tags = new Set(['svg', 'g', 'circle', 'line', 'polyline', 'polygon', 'rect', 'path']);
const numbers = /^[-+\d.eE,\s]+$/;
const finiteNumbers = (value) => numbers.test(value) && value.trim().split(/[\s,]+/).every((number) => Number.isFinite(Number(number)));
export const validatePassiveGraphSvg = (svg) => {
  if (typeof svg !== 'string' || svg.length > 1_000_000) return false;
  const tokens = svg.match(/<[^>]*>|[^<]+/g) ?? [];
  const stack = [];
  let roots = 0;
  for (const token of tokens) {
    if (!token.startsWith('<')) { if (token.trim()) return false; continue; }
    const tag = token.match(/^<(\/?)([a-z]+)([\s\S]*?)>$/);
    if (!tag || !tags.has(tag[2])) return false;
    const [, closing, name, tail] = tag;
    if (closing) { if (tail.trim() || stack.pop() !== name) return false; continue; }
    if (!stack.length && (name !== 'svg' || ++roots > 1)) return false;
    if (stack.length && name === 'svg') return false;
    const selfClosing = /\/\s*$/.test(tail);
    let attributes = selfClosing ? tail.replace(/\/\s*$/, '') : tail;
    const seen = new Set();
    while (attributes.trim()) {
      const attribute = attributes.match(/^\s+([A-Za-z][A-Za-z0-9-]*)\s*=\s*(["'])([^"'<>;&]*)\2/);
      if (!attribute) return false;
      const [, key, , value] = attribute;
      if (seen.has(key)) return false;
      seen.add(key);
      const allowed = numericAttributes.has(key) ? finiteNumbers(value)
        : key === 'viewBox' ? finiteNumbers(value) && value.trim().split(/[\s,]+/).length === 4
          : key === 'points' ? finiteNumbers(value)
            : key === 'd' ? /^[MmLlHhVvCcSsQqTtAaZz\d.eE,+\s-]+$/.test(value)
              : key === 'class' ? /^[A-Za-z0-9_ -]+$/.test(value)
                : key === 'fill' || key === 'stroke' ? /^(?:none|currentColor|[a-z]+|#[a-fA-F0-9]{3,8}|rgba?\([\d.,%\s]+\))$/.test(value)
                  : key === 'xmlns' && name === 'svg' ? value === 'http://www.w3.org/2000/svg'
                    : key === 'data-chart' && name === 'svg' ? value === ''
                      : key === 'aria-hidden' ? ['true', 'false'].includes(value) : false;
      if (!allowed) return false;
      attributes = attributes.slice(attribute[0].length);
    }
    if (!selfClosing) stack.push(name);
  }
  return roots === 1 && stack.length === 0 && tokens.join('') === svg;
};

export const safeGraphSvg = (svg) => {
  if (!validatePassiveGraphSvg(svg)) throw new Error('INVALID_REPORT_GRAPH');
  return svg;
};
