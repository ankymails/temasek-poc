/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-review. Base: hero.
 * Source: https://www.temasekreview.com.sg/
 * Generated: 2026-07-08
 *
 * Live DOM verified: selectors below match the rendered page.
 * Structure: single-column hero. The source contains a logo figure (Temasek
 * logo linked to home), a title "lockup" image (key-highlight__lookup), and
 * four overlapping key-highlight images. All are placed in one content cell so
 * the block JS can decorate them as a banner.
 */
export default function parse(element, { document }) {
  // Logo figure (Temasek logo, typically wrapped in an anchor).
  const logo = element.querySelector('.hero-banner__logo, figure.hero-banner__logo');

  // Title lockup image (the headline rendered as an SVG image).
  const titleImg = element.querySelector('.key-highlight__lookup img, .key-highlight-img.key-highlight__lookup img');

  // Overlapping highlight images (excluding the title lockup).
  const highlightImgs = Array.from(
    element.querySelectorAll('.key-highlight .key-highlight-img img'),
  ).filter((img) => !img.closest('.key-highlight__lookup'));

  const contentCell = [];
  if (logo) contentCell.push(logo);
  if (titleImg) contentCell.push(titleImg);
  contentCell.push(...highlightImgs);

  // Empty-block guard.
  if (contentCell.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  cells.push([contentCell]); // 1-column hero: one row, one cell holding all elements.

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-review', cells });
  element.replaceWith(block);
}
