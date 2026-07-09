/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsVideoParser from './parsers/cards-video.js';
import columnsFeatureParser from './parsers/columns-feature.js';
import columnsStatsParser from './parsers/columns-stats.js';
import heroReviewParser from './parsers/hero-review.js';
import tableSegmentsParser from './parsers/table-segments.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/temasek-cleanup.js';
import sectionsTransformer from './transformers/temasek-sections.js';

// PARSER REGISTRY
const parsers = {
  'cards-video': cardsVideoParser,
  'columns-feature': columnsFeatureParser,
  'columns-stats': columnsStatsParser,
  'hero-review': heroReviewParser,
  'table-segments': tableSegmentsParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Temasek Review annual report homepage',
  urls: ['https://www.temasekreview.com.sg/'],
  blocks: [
    {
      name: 'hero-review',
      instances: ['section.hero-banner#from-complexity-to-clarity'],
    },
    {
      name: 'columns-feature',
      instances: ['#from-our-chairman blockquote', '#sense-adapt-and-thrive .row'],
    },
    {
      name: 'columns-stats',
      instances: [
        '#performance-highlights .group-section__chart:nth-of-type(1)',
        '#performance-highlights .group-section__chart:nth-of-type(2)',
      ],
    },
    {
      name: 'table-segments',
      instances: ['#portfolio-segments .chart-container'],
    },
    {
      name: 'cards-video',
      instances: ['.group-section-videos .row.space-40'],
    },
  ],
  sections: [
    { id: 'from-complexity-to-clarity', name: 'Hero Masthead', selector: 'section.hero-banner#from-complexity-to-clarity', style: null, blocks: ['hero-review'], defaultContent: [] },
    { id: 'from-our-chairman', name: 'From Our Chairman', selector: '#from-our-chairman', style: 'light', blocks: ['columns-feature'], defaultContent: ['#from-our-chairman h2.content-box__title'] },
    { id: 'strategy', name: 'Strategy', selector: '#strategy', style: 'light', blocks: ['columns-feature'], defaultContent: ['#strategy h2.content-box__title', '#strategy figure.content-box__banner'] },
    { id: 'performance-and-portfolio', name: 'Performance & Portfolio', selector: '#performance-and-portfolio', style: 'light', blocks: ['columns-stats', 'table-segments'], defaultContent: ['#performance-and-portfolio h2.content-box__title', '#performance-and-portfolio figure.content-box__banner'] },
    { id: 'institution', name: 'Institution', selector: '#institution', style: 'light', blocks: [], defaultContent: ['#institution h2.content-box__title', '#institution figure.content-box__banner', '#our-people h3', '#our-people p', '#our-people a.btn-primary'] },
    { id: 'sustainability', name: 'Sustainability', selector: '#sustainability', style: 'light', blocks: [], defaultContent: ['#sustainability h2.content-box__title', '#sustainability figure.content-box__banner', '#sustainability .group-section__header p', '#sustainability .chart-image h4', '#sustainability .chart-image img', '#sustainability a.btn-primary'] },
    { id: 'community-stewardship', name: 'Community Stewardship', selector: '#community-stewardship', style: 'light', blocks: ['cards-video'], defaultContent: ['#community-stewardship h2.content-box__title', '#community-stewardship figure.content-box__banner', '#making-a-difference', '#community-stewardship .group-section-videos .row .col-12 p', '#community-stewardship .group-section-videos .row .col-12 a.btn-primary'] },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, then sections (afterTransform)
const transformers = [
  cleanupTransformer,
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

    // 6. Generate sanitized path. Homepage (empty path) maps to /index.
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
