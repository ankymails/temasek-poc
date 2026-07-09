/* eslint-disable */
/* global WebImporter */
/**
 * Parser for quote-banner. Source: section.blockquote-banner--chairman.
 * A full-bleed portrait (figure.blockquote-banner__image) with an overlapping
 * quote card (blockquote.blockquote-banner__quote-card) holding the quote
 * paragraphs and attribution. Emitted as a single-column block with two rows:
 *   row 1 = portrait image
 *   row 2 = quote paragraphs + attribution
 */
export default function parse(element, { document }) {
  const figure = element.querySelector('figure.blockquote-banner__image, figure');
  const quote = element.querySelector('blockquote.blockquote-banner__quote-card, blockquote');

  const img = figure ? figure.querySelector('picture, img') : null;
  const content = quote
    ? (quote.querySelector('.blockquote__content') || quote)
    : null;
  const quoteNodes = content ? Array.from(content.children) : [];

  if (!img && quoteNodes.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [
    [img || ''],
    [quoteNodes],
  ];
  const block = WebImporter.Blocks.createBlock(document, { name: 'quote-banner', cells });
  element.replaceWith(block);
}
