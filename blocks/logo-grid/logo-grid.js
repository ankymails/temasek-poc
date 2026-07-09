import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Logo grid block.
 * A centered, responsive grid of uniformly-sized logo images with no card
 * chrome. Each authored row is one logo (an image-only cell).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'logo-grid-item';
    while (row.firstElementChild) li.append(row.firstElementChild);
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '300' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
