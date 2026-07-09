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

  // tools/importer/import-letter-page.js
  var import_letter_page_exports = {};
  __export(import_letter_page_exports, {
    default: () => import_letter_page_default
  });

  // tools/importer/parsers/quote-banner.js
  function parse(element, { document }) {
    const figure = element.querySelector("figure.blockquote-banner__image, figure");
    const quote = element.querySelector("blockquote.blockquote-banner__quote-card, blockquote");
    const img = figure ? figure.querySelector("picture, img") : null;
    const content = quote ? quote.querySelector(".blockquote__content") || quote : null;
    const quoteNodes = content ? Array.from(content.children) : [];
    if (!img && quoteNodes.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [
      [img || ""],
      [quoteNodes]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "quote-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/chapter-nav.js
  function parse2(element, { document }) {
    const prevA = element.querySelector('.link-to-page[data-type="prev"], a[aria-label^="Previous"]');
    const nextA = element.querySelector('.link-to-page[data-type="next"], a[aria-label^="Next"]');
    const titleBtn = element.querySelector(".cmp-contenttopnav__page-link");
    let titleCell = "";
    if (titleBtn) {
      const defSpan = titleBtn.querySelector('span[data-section="default"]') || titleBtn.querySelector("span");
      if (defSpan) titleCell = defSpan.textContent.replace(/\s+/g, " ").trim();
    }
    const mkLink = (a) => {
      if (!a) return "";
      const link = document.createElement("a");
      link.href = a.getAttribute("href") || "#";
      const label = (a.querySelector(".link-text") || a).textContent.trim();
      link.textContent = label;
      return link;
    };
    const prevCell = mkLink(prevA);
    const nextCell = mkLink(nextA);
    const cells = [[prevCell, titleCell, nextCell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "chapter-nav", cells });
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
      const OVERSIZED_SVG_TO_PNG = {
        "TRM26_Operating_as_One_Temasek.svg": "TRM26_Operating_as_One_Temasek.png",
        "TRM26_10Years_Net_Portfolio_Value.svg": "TRM26_10Years_Net_Portfolio_Value.png",
        "TRM26_Total_Shareholder_Return_wof.svg": "TRM26_Total_Shareholder_Return_wof.png",
        "TRM26_Towards_Net_Zero_wof.svg": "TRM26_Towards_Net_Zero_wof.png",
        // Sustainability chapter delivers the same chart without the _wof suffix.
        "TRM26_Towards_Net_Zero.svg": "TRM26_Towards_Net_Zero_wof.png",
        "TRM26_Three_Segment_T2030_Strategy.svg": "TRM26_Three_Segment_T2030_Strategy.png",
        "TRM26_Four_Pillars_of_Temaseks_AI_Strategy.svg": "TRM26_Four_Pillars_of_Temaseks_AI_Strategy.png",
        // Performance & Portfolio oversized charts
        "TRM26_Key_Investments_and_Divestments_for_the_Year.svg": "TRM26_Key_Investments_and_Divestments_for_the_Year.png",
        "TRM26_Promising_New_Areas.svg": "TRM26_Promising_New_Areas.png",
        "TRM26_Asset_Management_Companies.svg": "TRM26_Asset_Management_Companies.png",
        "TRM26_Portfolio_Returns_by_Portfolio_Segments.svg": "TRM26_Portfolio_Returns_by_Portfolio_Segments.png",
        "TRM26_Volatility_of_Returns.svg": "TRM26_Volatility_of_Returns.png",
        "TRM26_Portfolio_by_Underlying_Sector_Exposure.svg": "TRM26_Portfolio_by_Underlying_Sector_Exposure.png",
        "TRM26_Global_Direct_Investments_by_Headquarters.svg": "TRM26_Global_Direct_Investments_by_Headquarters.png",
        "TRM26_Global_Direct_Investments_by_Sector.svg": "TRM26_Global_Direct_Investments_by_Sector.png",
        "TRM26_Illustration_of_Fundamental_Earnings_Impact.svg": "TRM26_Illustration_of_Fundamental_Earnings_Impact.png",
        "TRM26_Portfolio_by_Headquarters_and_Underlying_Country_Exposure.svg": "TRM26_Portfolio_by_Headquarters_and_Underlying_Country_Exposure.png",
        "TRM26_Portfolio_by_Currency.svg": "TRM26_Portfolio_by_Currency.png",
        // Institution oversized charts
        "TRM26_Protection_of_Temasek_Past_Reserves.svg": "TRM26_Protection_of_Temasek_Past_Reserves.png",
        "TRM26_WA_Incentives_Key_Team.svg": "TRM26_WA_Incentives_Key_Team.png",
        // Employee-demographics slider: three views x three geographies. We
        // rasterized the default Global view of each; the Singapore / Outside-SG
        // variants (all >20KB, so unusable as SVG on DA) fall back to the Global
        // PNG so no oversized SVG reference survives.
        "TRM26_Employees_by_Nationality_Global.svg": "TRM26_Employees_by_Nationality_Global.png",
        "TRM26_Employees_by_Nationality_Singapore.svg": "TRM26_Employees_by_Nationality_Global.png",
        "TRM26_Employees_by_Nationality_Outside_of_Singapore.svg": "TRM26_Employees_by_Nationality_Global.png",
        "TRM26_Employees_by_Age_Global.svg": "TRM26_Employees_by_Age_Global.png",
        "TRM26_Employees_by_Age_Singapore.svg": "TRM26_Employees_by_Age_Global.png",
        "TRM26_Employees_by_Age_Outside_of_Singapore.svg": "TRM26_Employees_by_Age_Global.png",
        "TRM26_Employees_by_Gender_Global.svg": "TRM26_Employees_by_Gender_Global.png",
        "TRM26_Employees_by_Gender_Singapore.svg": "TRM26_Employees_by_Gender_Global.png",
        "TRM26_Employees_by_Gender_Outside_of_Singapore.svg": "TRM26_Employees_by_Gender_Global.png"
      };
      const CHART_BASE = "/assets/charts";
      element.querySelectorAll('img[src$=".svg"], img[src*=".svg?"]').forEach((img) => {
        const src = img.getAttribute("src") || "";
        const file = src.split("/").pop().split("?")[0];
        if (OVERSIZED_SVG_TO_PNG[file]) {
          img.setAttribute("src", `${CHART_BASE}/${OVERSIZED_SVG_TO_PNG[file]}`);
        }
      });
    }
  }

  // tools/importer/transformers/temasek-chapter-cleanup.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.beforeTransform) {
      element.querySelectorAll(".page-content__content-link").forEach((btn) => {
        const text = btn.textContent.trim();
        if (text) btn.replaceWith(btn.ownerDocument.createTextNode(text));
        else btn.remove();
      });
      element.querySelectorAll(".pagecontent__header button, .page-content__section-heading button, .page-content__content-toggle, button.page-content__section-toggle").forEach((btn) => {
        btn.remove();
      });
      WebImporter.DOMUtils.remove(element, [
        ".page-content__content-share-wrap",
        ".page-content__content-share",
        ".footnote-section",
        ".print-section-divider",
        ".print-show",
        ".disclaimer-print",
        ".tr-navigation",
        "script",
        "style",
        "noscript"
      ]);
      element.querySelectorAll(".dt-container, .dataTables_wrapper").forEach((widget) => {
        const bodyTable = widget.querySelector(".dt-scroll-body table, table.dataTable");
        if (bodyTable) {
          bodyTable.removeAttribute("class");
          widget.replaceWith(bodyTable);
        } else {
          widget.remove();
        }
      });
      WebImporter.DOMUtils.remove(element, [
        ".dt-scroll-head",
        ".dt-scroll-foot",
        ".dt-scroll"
      ]);
    }
    if (hookName === TransformHook2.afterTransform) {
      element.querySelectorAll(".tr-separator, .print-show, .print-hide-inverse").forEach((el) => {
        if (el.textContent.trim() === "" && !el.querySelector("img, picture")) el.remove();
      });
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("data-vertical-align");
        el.removeAttribute("data-horizontal-align");
        el.removeAttribute("data-height");
        el.removeAttribute("data-type");
        el.removeAttribute("style");
      });
    }
  }

  // tools/importer/transformers/temasek-sections.js
  var TransformHook3 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform3(hookName, element, payload) {
    if (hookName !== TransformHook3.afterTransform) return;
    const template = payload && payload.template;
    const doc = element.ownerDocument;
    if (template && template.autoAccordion) {
      const wrappers = [...element.querySelectorAll(".page-content__content-wrapper[id]")];
      for (let i = wrappers.length - 1; i >= 0; i -= 1) {
        const sectionEl = wrappers[i];
        const metaBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: "light, accordion" }
        });
        sectionEl.after(metaBlock);
        sectionEl.before(doc.createElement("hr"));
      }
      return;
    }
    const sections = template && Array.isArray(template.sections) ? template.sections : [];
    if (sections.length < 2) return;
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

  // tools/importer/import-letter-page.js
  var parsers = {
    "quote-banner": parse,
    "chapter-nav": parse2
  };
  var PAGE_TEMPLATE = {
    name: "letter-page",
    description: "Temasek Review letter/message page (e.g. From Our Chairman)",
    urls: ["https://www.temasekreview.com.sg/from-our-chairman.html"],
    blocks: [
      {
        name: "chapter-nav",
        instances: [".contenttopnav"]
      },
      {
        name: "quote-banner",
        instances: ["section.blockquote-banner--chairman"]
      }
    ],
    sections: [
      { id: "chairman-masthead", name: "Chairman Masthead", selector: "section.blockquote-banner--chairman", style: null, blocks: ["quote-banner"], defaultContent: [] },
      { id: "from-our-chairman", name: "From Our Chairman Letter", selector: "#from-our-chairman", style: "light", blocks: [], defaultContent: [".pagecontent__header h1", "#from-our-chairman .page-content__content-desc"] }
    ]
  };
  var transformers = [
    transform,
    transform2,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform3] : []
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
  var import_letter_page_default = {
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
  return __toCommonJS(import_letter_page_exports);
})();
