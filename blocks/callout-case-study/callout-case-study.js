import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Callout case-study block.
 * A tinted (light-green) rounded highlight box embedded mid-flow inside a
 * chapter section. Content is authored as a single cell containing a heading,
 * a media image and body prose, rendered stacked (image above text).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // Flatten the single-row/single-cell table wrapper into the block itself so
  // the authored heading, image and paragraphs sit directly in the callout box.
  const row = block.querySelector(':scope > div');
  const cell = row ? row.querySelector(':scope > div') : null;
  if (cell) {
    while (cell.firstElementChild) block.append(cell.firstElementChild);
  }
  // Remove any now-empty wrapper divs left behind.
  [...block.children].forEach((child) => {
    if (child.tagName === 'DIV' && !child.textContent.trim() && !child.querySelector('img, picture')) {
      child.remove();
    }
  });

  // Tag the media wrapper for image-specific styling.
  const pic = block.querySelector('picture');
  if (pic) {
    const wrapper = pic.closest('p') || pic.parentElement;
    if (wrapper && wrapper !== block) wrapper.classList.add('callout-case-study-media');
    const img = pic.querySelector('img');
    if (img) {
      const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '970' }]);
      pic.replaceWith(optimizedPic);
    }
  }
}
