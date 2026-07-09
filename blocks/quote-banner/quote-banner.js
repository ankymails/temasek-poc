import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Quote banner: a full-bleed portrait with an overlapping quote card
 * (quote text + attribution). Authored as two rows:
 *   row 1 = portrait image
 *   row 2 = quote paragraphs + attribution (name in <strong>, role below)
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const imageRow = rows[0];
  const quoteRow = rows[1];

  // Image → background portrait.
  const media = document.createElement('div');
  media.className = 'quote-banner-media';
  const img = imageRow ? imageRow.querySelector('img') : null;
  if (img) {
    const optimized = createOptimizedPicture(img.src, img.alt, true, [{ width: '1600' }]);
    media.append(optimized);
  }

  // Quote → card.
  const card = document.createElement('blockquote');
  card.className = 'quote-banner-card';
  if (quoteRow) {
    const cell = quoteRow.querySelector(':scope > div') || quoteRow;
    while (cell.firstChild) card.append(cell.firstChild);
  }

  block.textContent = '';
  block.append(media, card);
}
