/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/cards-video.js
  function parse(element, { document }) {
    const cards = Array.from(element.querySelectorAll(":scope > div"));
    if (cards.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cards.forEach((card) => {
      const heading = card.querySelector("h1, h2, h3, h4, h5, h6");
      const media = card.querySelector(".medialine");
      const playAnchor = card.querySelector("a.media-open, .medialine a[data-video-id], .medialine a");
      const thumb = (media || card).querySelector("img, picture");
      const description = card.querySelector(":scope > p, p");
      if (!thumb && !heading && !description) return;
      const imageCell = [];
      if (thumb) imageCell.push(thumb);
      const bodyCell = [];
      if (heading) bodyCell.push(heading);
      if (playAnchor) bodyCell.push(playAnchor);
      if (description) bodyCell.push(description);
      cells.push([imageCell, bodyCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-feature.js
  function parse2(element, { document }) {
    const isBlockquote = element.matches("blockquote") || element.tagName === "BLOCKQUOTE";
    const imageCol = [];
    const textCol = [];
    if (isBlockquote) {
      const figure = element.querySelector("figure");
      const img = element.querySelector("figure img, img");
      if (figure) imageCol.push(figure);
      else if (img) imageCol.push(img);
      const content = element.querySelector(".blockquote__content");
      const textNodes = content ? Array.from(content.children) : Array.from(element.children).filter((c) => !c.matches("figure"));
      textCol.push(...textNodes);
      if (imageCol.length === 0 && textCol.length === 0) {
        element.replaceWith(...element.childNodes);
        return;
      }
      const cells2 = [[imageCol, textCol]];
      const block2 = WebImporter.Blocks.createBlock(document, { name: "columns-feature", cells: cells2 });
      element.replaceWith(block2);
      return;
    }
    const cols = Array.from(element.querySelectorAll(":scope > div"));
    const textColEl = cols.find((c) => !c.classList.contains("chart-image")) || cols[0];
    const imageColEl = cols.find((c) => c.classList.contains("chart-image")) || cols[cols.length - 1];
    const leftCell = [];
    const rightCell = [];
    if (textColEl) leftCell.push(...Array.from(textColEl.childNodes));
    const chartImg = imageColEl ? imageColEl.querySelector("img, picture") : null;
    if (chartImg) rightCell.push(chartImg);
    if (leftCell.length === 0 && rightCell.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[leftCell, rightCell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-stats.js
  function parse3(element, { document }) {
    const cols = Array.from(element.querySelectorAll(":scope > div"));
    if (cols.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const row = cols.map((col) => {
      const callout = col.querySelector(":scope > aside.number-callout, :scope > .number-callout");
      const source = callout || col;
      const cell = [];
      source.querySelectorAll(
        ":scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6, :scope > p, :scope > img, :scope > picture"
      ).forEach((node) => cell.push(node));
      if (cell.length === 0) {
        Array.from(source.children).forEach((node) => cell.push(node));
      }
      return cell;
    });
    const cells = [row];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-stats", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-review.js
  function parse4(element, { document }) {
    const logo = element.querySelector(".hero-banner__logo, figure.hero-banner__logo");
    const titleImg = element.querySelector(".key-highlight__lookup img, .key-highlight-img.key-highlight__lookup img");
    const highlightImgs = Array.from(
      element.querySelectorAll(".key-highlight .key-highlight-img img")
    ).filter((img) => !img.closest(".key-highlight__lookup"));
    const contentCell = [];
    if (logo) contentCell.push(logo);
    if (titleImg) contentCell.push(titleImg);
    contentCell.push(...highlightImgs);
    if (contentCell.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-review", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/table-segments.js
  function parse5(element, { document }) {
    const table = element.querySelector("table");
    if (!table) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    const headerRow = table.querySelector("thead tr") || table.querySelector("tr");
    const colCount = headerRow ? headerRow.children.length : 3;
    Array.from(table.querySelectorAll("tr")).forEach((tr) => {
      const rowCells = Array.from(tr.children).map((td) => Array.from(td.childNodes));
      while (rowCells.length < colCount) rowCells.push("");
      cells.push(rowCells);
    });
    const chartImg = Array.from(element.querySelectorAll("img, picture")).find((img) => !img.closest("table"));
    if (chartImg) {
      const imgRow = [chartImg];
      while (imgRow.length < colCount) imgRow.push("");
      cells.push(imgRow);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "table-segments", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/temasek-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".hero-banner__background",
        "#skip-to-main",
        ".tr-navigation",
        "footer",
        ".main-footer",
        "#disclaimer-box",
        "#cookieConsent",
        ".cookieConsent",
        ".ct-container",
        '[role="dialog"]',
        "script",
        "style",
        "noscript"
      ]);
      element.querySelectorAll(".print-show").forEach((el) => {
        const pic = el.closest("picture") || el;
        pic.remove();
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "footer",
        "nav",
        ".tr-navigation",
        "#disclaimer-box",
        "#cookieConsent",
        ".cookieConsent",
        ".ct-container",
        '[role="dialog"]',
        "iframe",
        "link",
        "noscript"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("data-vertical-align");
        el.removeAttribute("data-video-id");
        el.removeAttribute("onclick");
      });
    }
  }

  // tools/importer/transformers/temasek-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.afterTransform) return;
    const template = payload && payload.template;
    const sections = template && Array.isArray(template.sections) ? template.sections : [];
    if (sections.length < 2) return;
    const doc = element.ownerDocument;
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section || !section.selector) continue;
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue;
      if (section.style) {
        const metaBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        sectionEl.after(metaBlock);
      }
      if (i > 0) {
        sectionEl.before(doc.createElement("hr"));
      }
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "cards-video": parse,
    "columns-feature": parse2,
    "columns-stats": parse3,
    "hero-review": parse4,
    "table-segments": parse5
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Temasek Review annual report homepage",
    urls: ["https://www.temasekreview.com.sg/"],
    blocks: [
      {
        name: "hero-review",
        instances: ["section.hero-banner#from-complexity-to-clarity"]
      },
      {
        name: "columns-feature",
        instances: ["#from-our-chairman blockquote", "#sense-adapt-and-thrive .row"]
      },
      {
        name: "columns-stats",
        instances: [
          "#performance-highlights .group-section__chart:nth-of-type(1)",
          "#performance-highlights .group-section__chart:nth-of-type(2)"
        ]
      },
      {
        name: "table-segments",
        instances: ["#portfolio-segments .chart-container"]
      },
      {
        name: "cards-video",
        instances: [".group-section-videos .row.space-40"]
      }
    ],
    sections: [
      { id: "from-complexity-to-clarity", name: "Hero Masthead", selector: "section.hero-banner#from-complexity-to-clarity", style: null, blocks: ["hero-review"], defaultContent: [] },
      { id: "from-our-chairman", name: "From Our Chairman", selector: "#from-our-chairman", style: "light", blocks: ["columns-feature"], defaultContent: ["#from-our-chairman h2.content-box__title"] },
      { id: "strategy", name: "Strategy", selector: "#strategy", style: "light", blocks: ["columns-feature"], defaultContent: ["#strategy h2.content-box__title", "#strategy figure.content-box__banner"] },
      { id: "performance-and-portfolio", name: "Performance & Portfolio", selector: "#performance-and-portfolio", style: "light", blocks: ["columns-stats", "table-segments"], defaultContent: ["#performance-and-portfolio h2.content-box__title", "#performance-and-portfolio figure.content-box__banner"] },
      { id: "institution", name: "Institution", selector: "#institution", style: "light", blocks: [], defaultContent: ["#institution h2.content-box__title", "#institution figure.content-box__banner", "#our-people h3", "#our-people p", "#our-people a.btn-primary"] },
      { id: "sustainability", name: "Sustainability", selector: "#sustainability", style: "light", blocks: [], defaultContent: ["#sustainability h2.content-box__title", "#sustainability figure.content-box__banner", "#sustainability .group-section__header p", "#sustainability .chart-image h4", "#sustainability .chart-image img", "#sustainability a.btn-primary"] },
      { id: "community-stewardship", name: "Community Stewardship", selector: "#community-stewardship", style: "light", blocks: ["cards-video"], defaultContent: ["#community-stewardship h2.content-box__title", "#community-stewardship figure.content-box__banner", "#making-a-difference", "#community-stewardship .group-section-videos .row .col-12 p", "#community-stewardship .group-section-videos .row .col-12 a.btn-primary"] }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const pathname = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "");
      const path = WebImporter.FileUtils.sanitizePath(pathname || "/index");
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
