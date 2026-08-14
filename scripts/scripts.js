import {
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  buildBlock,
  readBlockConfig,
  toClassName,
} from './aem.js';

/**
 * Applies section metadata: reads any `.section-metadata` block, applies its
 * key/value pairs to the parent section (e.g. `style: light` -> section class
 * `light`), then removes the block. This repo's aem.js does not do this, so it
 * is handled here.
 * @param {Element} main
 */
function decorateSectionMetadata(main) {
  main.querySelectorAll('div.section-metadata').forEach((sm) => {
    const section = sm.closest('.section');
    if (!section) return;
    const meta = readBlockConfig(sm);
    Object.keys(meta).forEach((key) => {
      if (key === 'style') {
        const styles = meta.style.split(',').map((s) => toClassName(s.trim())).filter((s) => s);
        styles.forEach((s) => section.classList.add(s));
      } else {
        section.dataset[toClassName(key)] = meta[key];
      }
    });
    sm.parentElement.remove();
  });
}

if (window.trustedTypes && window.trustedTypes.createPolicy) {
  const innerTT = window.trustedTypes.createPolicy('tt-inner', {
    createHTML: (s) => s, // avoid stack overflow
  });

  window.trustedTypes.createPolicy('default', {
    createHTML: (input, type, sink) => {
      let processedInput = input;
      if (/srcdoc\s*=/i.test(processedInput)) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('iframe[srcdoc]').forEach((el) => el.removeAttribute('srcdoc'));
        processedInput = doc.body.innerHTML;
      }
      if (sink.includes('createContextualFragment') || sink.includes('Document write')) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('script').forEach((el) => el.remove());
        processedInput = doc.body.innerHTML;
      }
      return processedInput;
    },
    createScriptURL: (input) => input,
    createScript: (input) => input,
  });
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Turns `/widgets/...` links into widget blocks.
 * @param {Element} main The container element
 */
function buildWidgetAutoBlocks(main) {
  const widgetLinks = [...main.querySelectorAll('a[href*="/widgets/"]')];
  widgetLinks.forEach((link) => {
    if (link.closest('.widget')) return;
    const newLink = link.cloneNode(true);
    const widgetBlock = buildBlock('widget', { elems: [newLink] });
    const p = link.closest('p');
    if (
      p
      && p.querySelectorAll('a').length === 1
      && p.querySelector('a') === link
      && p.textContent.trim() === link.textContent.trim()
    ) {
      p.replaceWith(widgetBlock);
    } else {
      link.replaceWith(widgetBlock);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // auto load `*/fragments/*` references
    const fragments = [...main.querySelectorAll('a[href*="/fragments/"]')].filter((f) => !f.closest('.fragment'));
    if (fragments.length > 0) {
      // eslint-disable-next-line import/no-cycle
      import('../blocks/fragment/fragment.js').then(({ loadFragment }) => {
        fragments.forEach(async (fragment) => {
          try {
            const { pathname } = new URL(fragment.href);
            const frag = await loadFragment(pathname);
            fragment.parentElement.replaceWith(...frag.children);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Fragment loading failed', error);
          }
        });
      });
    }
    buildWidgetAutoBlocks(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates formatted links to style them as buttons.
 * @param {HTMLElement} main The main container element
 */
export function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();

    // quick structural checks
    if (a.querySelector('img') || p.textContent.trim() !== text) return;

    // skip URL display links
    try {
      if (new URL(a.href).href === new URL(text, window.location).href) return;
    } catch { /* continue */ }

    // require authored formatting for buttonization
    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) return;

    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) { // high-impact call-to-action
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else {
      a.classList.add('secondary');
      em.replaceWith(a);
    }
  });
}

/**
 * Turns each section tagged with the `accordion` style into a collapsible
 * panel: the section's first heading becomes a clickable toggle header and the
 * rest of the section content collapses beneath it. Sections are collapsed by
 * default (matching the source chapter pages). When two or more accordion
 * sections are present, an "Expand all / Collapse all" control is inserted
 * before the first one.
 * @param {Element} main The main element
 */
function decorateAccordionSections(main) {
  const sections = [...main.querySelectorAll(':scope > .section.accordion')];
  if (sections.length === 0) return;

  sections.forEach((section) => {
    const contentWrapper = section.querySelector(':scope > .default-content-wrapper') || section;
    const heading = contentWrapper.querySelector('h1, h2, h3, h4, h5, h6');
    if (!heading) return;

    // Build the clickable header from the heading.
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'accordion-toggle';
    button.setAttribute('aria-expanded', 'false');
    while (heading.firstChild) button.append(heading.firstChild);
    heading.append(button);
    heading.classList.add('accordion-header');

    // Move everything after the heading (across all wrappers) into a panel.
    const panel = document.createElement('div');
    panel.className = 'accordion-panel';
    panel.hidden = true;

    // Collect all siblings of the heading within its wrapper, plus any
    // subsequent wrappers (blocks live in their own *-wrapper divs).
    const toMove = [];
    let node = heading.nextSibling;
    while (node) {
      toMove.push(node);
      node = node.nextSibling;
    }
    let wrapper = contentWrapper.nextElementSibling;
    while (wrapper) {
      const next = wrapper.nextElementSibling;
      toMove.push(wrapper);
      wrapper = next;
    }
    toMove.forEach((n) => panel.append(n));

    // Place the header and panel directly under the section.
    contentWrapper.after(panel);
    if (contentWrapper !== section && contentWrapper.contains(heading)) {
      contentWrapper.replaceWith(heading);
    }

    const panelId = `accordion-panel-${section.dataset.sectionId || Math.random().toString(36).slice(2, 8)}`;
    panel.id = panelId;
    button.setAttribute('aria-controls', panelId);

    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
      section.classList.toggle('accordion-open', !expanded);
    });
  });

  // Expand all / Collapse all control.
  if (sections.length > 1) {
    const control = document.createElement('button');
    control.type = 'button';
    control.className = 'accordion-toggle-all';
    control.textContent = 'Expand all';
    control.addEventListener('click', () => {
      const anyCollapsed = sections.some((s) => !s.classList.contains('accordion-open'));
      sections.forEach((s) => {
        const btn = s.querySelector('.accordion-toggle');
        const panel = s.querySelector('.accordion-panel');
        if (!btn || !panel) return;
        btn.setAttribute('aria-expanded', String(anyCollapsed));
        panel.hidden = !anyCollapsed;
        s.classList.toggle('accordion-open', anyCollapsed);
      });
      control.textContent = anyCollapsed ? 'Collapse all' : 'Expand all';
    });

    // Match the source: the control sits inline on the chapter H1 row,
    // right-aligned. The chapter H1 lives in the banner section (which is not
    // itself an accordion section). Find the first such H1 regardless of
    // section order, wrap it and the control in a flex header row. Fall back to
    // placing the control before the first accordion section if no H1 exists.
    const bannerHeading = [...main.querySelectorAll('h1')]
      .find((h) => !h.closest('.section.accordion'));
    if (bannerHeading) {
      const headerRow = document.createElement('div');
      headerRow.className = 'chapter-header-row';
      bannerHeading.replaceWith(headerRow);
      headerRow.append(bannerHeading, control);
    } else {
      sections[0].before(control);
    }
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateSectionMetadata(main);
  decorateBlocks(main);
  decorateButtons(main);
  decorateAccordionSections(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
