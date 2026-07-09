/**
 * Chapter navigation bar: previous chapter | current chapter | next chapter.
 *
 * Hierarchy-driven: prev/next/current are computed from a single ordered list
 * of chapters and the current page path — NOT authored per page. This means
 * adding or reordering chapters only needs a change in one place and every
 * page's nav updates automatically.
 *
 * The canonical chapter order is the Temasek Review table of contents. If a
 * migrated /nav document later exposes this order, prefer that; until then the
 * embedded CHAPTERS list is the source of truth. Any content authored into the
 * block is ignored (the bar is derived, not authored).
 */

const CHAPTERS = [
  { path: '/from-complexity-to-clarity', label: 'From Complexity to Clarity' },
  { path: '/from-our-chairman', label: 'From Our Chairman' },
  { path: '/strategy', label: 'Strategy' },
  { path: '/performance-and-portfolio', label: 'Performance & Portfolio' },
  { path: '/institution', label: 'Institution' },
  { path: '/sustainability', label: 'Sustainability' },
  { path: '/community-stewardship', label: 'Community Stewardship' },
  { path: '/media-centre', label: 'Media Centre' },
];

/** Reduce a path to its final slug so /content/strategy, /strategy and
 * /strategy.html all compare equal. */
function slug(path) {
  return (path || '')
    .split('?')[0]
    .split('#')[0]
    .replace(/\.html$/, '')
    .replace(/\/$/, '')
    .split('/')
    .filter(Boolean)
    .pop() || '';
}

function makeLink(chapter, index, direction) {
  const a = document.createElement('a');
  a.href = chapter.path;
  a.textContent = `${index + 1}. ${chapter.label}`;
  a.setAttribute('aria-label', `${direction === 'prev' ? 'Previous' : 'Next'}: ${a.textContent}`);
  return a;
}

/**
 * @param {Element} block
 */
export default function decorate(block) {
  const chapters = CHAPTERS;
  const current = slug(window.location.pathname);
  const index = chapters.findIndex((c) => slug(c.path) === current);

  block.textContent = '';

  // If the current page isn't a known chapter, leave the bar empty (hidden by CSS).
  if (index === -1) {
    block.classList.add('chapter-nav-empty');
    return;
  }

  const prev = document.createElement('div');
  prev.className = 'chapter-nav-prev';
  if (index > 0) prev.append(makeLink(chapters[index - 1], index - 1, 'prev'));

  const title = document.createElement('div');
  title.className = 'chapter-nav-title';
  title.textContent = chapters[index].label;

  const next = document.createElement('div');
  next.className = 'chapter-nav-next';
  if (index < chapters.length - 1) next.append(makeLink(chapters[index + 1], index + 1, 'next'));

  block.append(prev, title, next);
}
