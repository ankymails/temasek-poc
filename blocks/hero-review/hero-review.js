/**
 * loads and decorates the hero-review block
 *
 * Authored/decorated structure:
 *   .hero-review > div (row) > div (cell) > p * N
 * The cell contains, in order:
 *   1. logo link (a > picture > img)
 *   2. title lockup image (picture > img)
 *   3..N. decorative collage images (picture > img)
 *
 * We tag each part so the CSS can position the full-bleed masthead collage
 * without relying on nth-child ordering.
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div');
  if (!cell) return;

  const parts = [...cell.children].filter((el) => el.tagName === 'P');

  // first paragraph containing a link => the logo lockup
  const logo = parts.find((p) => p.querySelector('a'));
  if (logo) logo.classList.add('hero-review-logo');

  // remaining image-only paragraphs: first is the title lockup, rest are collage tiles
  const images = parts.filter((p) => p !== logo && p.querySelector('img'));
  images.forEach((p, i) => {
    if (i === 0) {
      p.classList.add('hero-review-lockup');
    } else {
      p.classList.add('hero-review-tile', `hero-review-tile-${i}`);
    }
  });
}
