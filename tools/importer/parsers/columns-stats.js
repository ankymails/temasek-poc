/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-stats. Base: columns.
 * Source: https://www.temasekreview.com.sg/
 * Generated: 2026-07-08
 *
 * Two instances, each a 2-column layout:
 *   Instance 1 (performance highlights): each column has a big number (h2),
 *     label (h4), caption (p) and a chart image.
 *   Instance 2 (invested/divested): each column is a number callout with an
 *     h2 and h4 only (no caption, no image).
 * A cell is built per source column by collecting its meaningful content nodes,
 * so both instance shapes are handled by the same extraction logic.
 */
export default function parse(element, { document }) {
  const cols = Array.from(element.querySelectorAll(':scope > div'));
  if (cols.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const row = cols.map((col) => {
    // Prefer an inner wrapper (e.g. .number-callout) when the column just wraps one.
    const callout = col.querySelector(':scope > aside.number-callout, :scope > .number-callout');
    const source = callout || col;

    const cell = [];
    source.querySelectorAll(
      ':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6, :scope > p, :scope > img, :scope > picture',
    ).forEach((node) => cell.push(node));

    // Fallback: if nothing matched (unexpected nesting), take all element children.
    if (cell.length === 0) {
      Array.from(source.children).forEach((node) => cell.push(node));
    }
    return cell;
  });

  const cells = [row];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-stats', cells });
  element.replaceWith(block);
}
