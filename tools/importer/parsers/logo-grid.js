/* eslint-disable */
/* global WebImporter */
/**
 * Parser for logo-grid. Base: (new) responsive logo grid.
 * Source: https://www.temasekreview.com.sg/strategy.html
 *
 * A .row.logo-list containing N column cells (.col-*), each with a single logo
 * image. Emitted as a one-row block whose cells each hold one logo image, so
 * the block renders a wrapping, centered grid of uniformly-sized logos.
 */
export default function parse(element, { document }) {
  const cols = Array.from(element.querySelectorAll(':scope > div'));
  const logos = [];

  cols.forEach((col) => {
    const img = col.querySelector('picture, img');
    if (img) logos.push(img);
  });

  if (logos.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // One row per logo (single cell), matching the block JS which treats each
  // row as one logo item in the grid.
  const cells = logos.map((logo) => [[logo]]);
  const block = WebImporter.Blocks.createBlock(document, { name: 'logo-grid', cells });
  element.replaceWith(block);
}
