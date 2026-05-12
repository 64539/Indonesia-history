/**
 * Truncate `text` to at most `maxChars`, preferring a cut at a paragraph
 * boundary (`\n\n` or `\n`) before `maxChars` so the model does not start mid-sentence.
 */
export function truncateAtParagraphBoundary(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const slice = text.slice(0, maxChars);
  const para = slice.lastIndexOf("\n\n");
  if (para > maxChars * 0.5) return slice.slice(0, para).trimEnd();
  const line = slice.lastIndexOf("\n");
  if (line > maxChars * 0.5) return slice.slice(0, line).trimEnd();
  const sentence = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("? "), slice.lastIndexOf("! "));
  if (sentence > maxChars * 0.4) return slice.slice(0, sentence + 1).trimEnd();
  return slice.trimEnd();
}
