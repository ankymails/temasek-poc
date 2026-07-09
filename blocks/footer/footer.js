import { getMetadata, decorateIcons } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Converts inline :icon-name: tokens in link/text content into
 * <span class="icon icon-name"> elements. The aem.live backend does this
 * server-side, but it does not run for locally-served fragments, so we
 * normalise here to keep local preview and production consistent.
 * @param {Element} root
 */
function replaceIconTokens(root) {
  root.querySelectorAll('a').forEach((a) => {
    const match = a.textContent.match(/^\s*:([a-z0-9-]+):\s*(.*)$/i);
    if (!match) return;
    const [, iconName, label] = match;
    const span = document.createElement('span');
    span.className = `icon icon-${iconName}`;
    a.textContent = '';
    a.append(span);
    if (label) a.append(document.createTextNode(` ${label}`));
    a.setAttribute('aria-label', label || iconName);
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  let fragment = await loadFragment(footerPath);

  // Local-preview fallback: `aem up --html-folder content` mounts the local
  // content at /content, so the authored footer lives at /content/footer while
  // the plain /footer path proxies the old boilerplate from the origin. If the
  // primary load failed or returned the placeholder footer (no Temasek content),
  // retry under /content. In production /footer resolves correctly, so this
  // fallback never runs.
  const looksLikeOurFooter = (frag) => frag && /Quick Links|Temasek/i.test(frag.textContent || '');
  if (!looksLikeOurFooter(fragment) && !footerPath.startsWith('/content')) {
    const localFragment = await loadFragment(`/content${footerPath}`);
    if (looksLikeOurFooter(localFragment)) fragment = localFragment;
  }

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Normalise inline :icon: tokens (social channels) then render icon SVGs.
  replaceIconTokens(footer);
  decorateIcons(footer);

  // Classify the section wrappers the fragment produced. The Temasek footer is:
  //   [logo] [Quick Links] [Useful Resources] [Our Channels] [legal + copyright]
  // The first four form the top region (columns); the last is the bottom bar.
  const sections = [...footer.children];
  if (sections.length > 1) {
    const bottom = sections[sections.length - 1];
    bottom.classList.add('footer-legal');

    const top = document.createElement('div');
    top.className = 'footer-top';
    sections.slice(0, -1).forEach((sec, i) => {
      sec.classList.add(i === 0 ? 'footer-brand' : 'footer-col');
      // The channels column is the one whose links carry social icons.
      if (sec.querySelector('span.icon')) sec.classList.add('footer-social');
      top.append(sec);
    });
    footer.prepend(top);
  }

  block.append(footer);
}
