/**
 * Chapter navigation bar: previous chapter | current chapter title | next chapter.
 * Authored as a single row of three cells.
 * @param {Element} block
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  const cells = [...row.children];
  const [prevCell, titleCell, nextCell] = cells;

  if (prevCell) {
    prevCell.classList.add('chapter-nav-prev');
    const a = prevCell.querySelector('a');
    if (a) a.setAttribute('aria-label', `Previous: ${a.textContent.trim()}`);
  }
  if (titleCell) {
    titleCell.classList.add('chapter-nav-title');
    // If the imported title is empty (source JS blanks the dropdown spans at
    // import time), fall back to the page's chapter H1.
    if (!titleCell.textContent.trim()) {
      const h1 = document.querySelector('main h1');
      if (h1) titleCell.textContent = h1.textContent.trim();
    }
  }
  if (nextCell) {
    nextCell.classList.add('chapter-nav-next');
    const a = nextCell.querySelector('a');
    if (a) a.setAttribute('aria-label', `Next: ${a.textContent.trim()}`);
  }

  // Flatten the extra block wrapper so the three cells sit on one flex row.
  block.textContent = '';
  cells.forEach((c) => block.append(c));
}
