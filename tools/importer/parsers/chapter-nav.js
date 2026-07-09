/* eslint-disable */
/* global WebImporter */
/**
 * Parser for chapter-nav. Source: .contenttopnav on chapter pages.
 * The source bar has: a prev chapter link, a center current-chapter title with a
 * jump-to-section dropdown, and a next chapter link. We emit a single-row block
 * with three cells: [prev link] | [current title] | [next link]. The section
 * jump list is redundant with the on-page accordion, so it is not carried over.
 */
export default function parse(element, { document }) {
  const prevA = element.querySelector('.link-to-page[data-type="prev"], a[aria-label^="Previous"]');
  const nextA = element.querySelector('.link-to-page[data-type="next"], a[aria-label^="Next"]');
  // The center button holds the current chapter title in a data-section="default"
  // span plus several other per-section spans. Take ONLY the first span's text
  // (the current chapter); never fall back to the whole button, which would
  // concatenate every section label.
  const titleBtn = element.querySelector('.cmp-contenttopnav__page-link');
  let titleCell = '';
  if (titleBtn) {
    const defSpan = titleBtn.querySelector('span[data-section="default"]') || titleBtn.querySelector('span');
    if (defSpan) titleCell = defSpan.textContent.replace(/\s+/g, ' ').trim();
  }

  const mkLink = (a) => {
    if (!a) return '';
    const link = document.createElement('a');
    link.href = a.getAttribute('href') || '#';
    // Prefer the visible label text (strip icon-only spans).
    const label = (a.querySelector('.link-text') || a).textContent.trim();
    link.textContent = label;
    return link;
  };

  const prevCell = mkLink(prevA);
  const nextCell = mkLink(nextA);

  const cells = [[prevCell, titleCell, nextCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'chapter-nav', cells });
  element.replaceWith(block);
}
