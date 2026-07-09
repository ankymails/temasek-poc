/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-video. Base: cards.
 * Source: https://www.temasekreview.com.sg/
 * Generated: 2026-07-08
 *
 * Two cards, each a .col-6 containing a heading (h4), a .medialine wrapper with
 * a play anchor (data-video-id / href) and a thumbnail image, and a description
 * paragraph. Emitted as a 2-column cards table (image cell | body cell):
 *   - Cell 1: the thumbnail image ONLY, so the block JS classifies it as the
 *     card image column.
 *   - Cell 2 (body): heading, the play anchor (preserved so the video link
 *     survives), and the description.
 */
export default function parse(element, { document }) {
  const cards = Array.from(element.querySelectorAll(':scope > div'));
  if (cards.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  cards.forEach((card) => {
    const heading = card.querySelector('h1, h2, h3, h4, h5, h6');
    const media = card.querySelector('.medialine');
    const playAnchor = card.querySelector('a.media-open, .medialine a[data-video-id], .medialine a');
    const thumb = (media || card).querySelector('img, picture');
    const description = card.querySelector(':scope > p, p');

    // Skip empty cards.
    if (!thumb && !heading && !description) return;

    const imageCell = [];
    if (thumb) imageCell.push(thumb);

    const bodyCell = [];
    if (heading) bodyCell.push(heading);
    if (playAnchor) bodyCell.push(playAnchor);
    if (description) bodyCell.push(description);

    cells.push([imageCell, bodyCell]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-video', cells });
  element.replaceWith(block);
}
