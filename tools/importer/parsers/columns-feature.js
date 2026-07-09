/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-feature. Base: columns.
 * Source: https://www.temasekreview.com.sg/
 * Generated: 2026-07-08
 *
 * Two instances with a 2-column layout each. Column order is preserved from the
 * source per instance:
 *   Instance 1 (chairman blockquote): [portrait image] | [quote text + attribution + CTA]
 *   Instance 2 (strategy .row):        [heading + paragraphs + CTA] | [chart image]
 * The parser detects the instance shape and emits the two columns in source order.
 */
export default function parse(element, { document }) {
  const imageCol = [];
  const textCol = [];

  // Chairman-page masthead: <section.blockquote-banner> with a sibling
  // <figure.blockquote-banner__image> (portrait) and a
  // <blockquote.blockquote-banner__quote-card> (quote text + attribution).
  // The figure is NOT inside the blockquote here, so handle it explicitly.
  const bannerImage = element.querySelector(':scope > figure.blockquote-banner__image, figure.blockquote-banner__image');
  const bannerQuote = element.querySelector('blockquote.blockquote-banner__quote-card');
  if (bannerImage && bannerQuote) {
    const img = bannerImage.querySelector('picture, img');
    if (img) imageCol.push(img);
    const content = bannerQuote.querySelector('.blockquote__content') || bannerQuote;
    textCol.push(...Array.from(content.children));
    const cells = [[imageCol, textCol]];
    const block = WebImporter.Blocks.createBlock(document, { name: 'columns-feature', cells });
    element.replaceWith(block);
    return;
  }

  const isBlockquote = element.matches('blockquote') || element.tagName === 'BLOCKQUOTE';

  if (isBlockquote) {
    // Instance 1: chairman. figure/image is first column, text content is second.
    const figure = element.querySelector('figure');
    const img = element.querySelector('figure img, img');
    if (figure) imageCol.push(figure);
    else if (img) imageCol.push(img);

    const content = element.querySelector('.blockquote__content');
    const textNodes = content
      ? Array.from(content.children)
      : Array.from(element.children).filter((c) => !c.matches('figure'));
    textCol.push(...textNodes);

    if (imageCol.length === 0 && textCol.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[imageCol, textCol]];
    const block = WebImporter.Blocks.createBlock(document, { name: 'columns-feature', cells });
    element.replaceWith(block);
    return;
  }

  // Instance 2: strategy .row — text column then chart image column (source order).
  const cols = Array.from(element.querySelectorAll(':scope > div'));
  const textColEl = cols.find((c) => !c.classList.contains('chart-image')) || cols[0];
  const imageColEl = cols.find((c) => c.classList.contains('chart-image')) || cols[cols.length - 1];

  const leftCell = [];
  const rightCell = [];
  if (textColEl) leftCell.push(...Array.from(textColEl.childNodes));
  const chartImg = imageColEl ? imageColEl.querySelector('img, picture') : null;
  if (chartImg) rightCell.push(chartImg);

  if (leftCell.length === 0 && rightCell.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[leftCell, rightCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-feature', cells });
  element.replaceWith(block);
}
