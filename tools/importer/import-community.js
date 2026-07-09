/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import calloutCaseStudyParser from './parsers/callout-case-study.js';
import logoGridParser from './parsers/logo-grid.js';
import chapterNavParser from './parsers/chapter-nav.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/temasek-cleanup.js';
import chapterCleanupTransformer from './transformers/temasek-chapter-cleanup.js';
import sectionsTransformer from './transformers/temasek-sections.js';

// PARSER REGISTRY
const parsers = {
  'callout-case-study': calloutCaseStudyParser,
  'logo-grid': logoGridParser,
  'chapter-nav': chapterNavParser,
};

// PAGE TEMPLATE CONFIGURATION
// Uses autoAccordion:true so the sections transformer derives the accordion
// sub-chapters from the DOM (every .page-content__content-wrapper[id]) instead
// of hardcoding this page's 7 section ids.
const PAGE_TEMPLATE = {
  name: 'chapter-page',
  description: 'Temasek Review chapter page — Community Stewardship',
  urls: ['https://www.temasekreview.com.sg/community-stewardship.html'],
  autoAccordion: true,
  blocks: [
    {
      name: 'chapter-nav',
      instances: ['.contenttopnav'],
    },
    {
      name: 'callout-case-study',
      instances: ['.bg-container.bg-light-green'],
    },
    {
      name: 'logo-grid',
      instances: ['.row.logo-list'],
    },
  ],
};

const transformers = [
  cleanupTransformer,
  chapterCleanupTransformer,
  sectionsTransformer,
];

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

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

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

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

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
