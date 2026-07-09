import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Quote banner: a full-bleed portrait with an overlapping quote card
 * (quote text + attribution): portrait image cell, then quote paragraphs +
 * attribution cell (name in <strong>, role below). The two cells may arrive
 * as two single-cell rows (content import) or as two cells in one row
 * (Universal Editor authoring) — both are read the same way here.
 * @param {Element} block
 */
export default function decorate(block) {
  const [imageCell, quoteCell] = [...block.querySelectorAll(':scope > div > div')];

  // Image → background portrait.
  const media = document.createElement('div');
  media.className = 'quote-banner-media';
  const img = imageCell ? imageCell.querySelector('img') : null;
  if (img) {
    const optimized = createOptimizedPicture(img.src, img.alt, true, [{ width: '1600' }]);
    media.append(optimized);
  }

  // Quote → card.
  const card = document.createElement('blockquote');
  card.className = 'quote-banner-card';
  if (quoteCell) {
    while (quoteCell.firstChild) card.append(quoteCell.firstChild);
  }

  block.textContent = '';
  block.append(media, card);
}
