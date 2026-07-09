/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import quoteBannerParser from './parsers/quote-banner.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/temasek-cleanup.js';
import chapterCleanupTransformer from './transformers/temasek-chapter-cleanup.js';
import sectionsTransformer from './transformers/temasek-sections.js';

// PARSER REGISTRY
const parsers = {
  'quote-banner': quoteBannerParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'letter-page',
  description: 'Temasek Review letter/message page (e.g. From Our Chairman)',
  urls: ['https://www.temasekreview.com.sg/from-our-chairman.html'],
  blocks: [
    {
      name: 'quote-banner',
      instances: ['section.blockquote-banner--chairman'],
    },
  ],
  sections: [
    { id: 'chairman-masthead', name: 'Chairman Masthead', selector: 'section.blockquote-banner--chairman', style: null, blocks: ['quote-banner'], defaultContent: [] },
    { id: 'from-our-chairman', name: 'From Our Chairman Letter', selector: '#from-our-chairman', style: 'light', blocks: [], defaultContent: ['.pagecontent__header h1', '#from-our-chairman .page-content__content-desc'] },
  ],
};

// TRANSFORMER REGISTRY - cleanup transformers run first, sections last.
const transformers = [
  cleanupTransformer,
  chapterCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform cleanup
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by an earlier parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform cleanup + section breaks/metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path (strip .html).
    const pathname = new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '');
    const path = WebImporter.FileUtils.sanitizePath(pathname || '/index');

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
