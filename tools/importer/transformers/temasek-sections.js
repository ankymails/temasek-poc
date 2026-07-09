/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: temasekreview.com.sg section breaks + section metadata.
 *
 * Driven by payload.template.sections from tools/importer/page-templates.json.
 * The homepage template has 7 sections identified by id/selector:
 *   from-complexity-to-clarity (hero, style: null),
 *   from-our-chairman, strategy, performance-and-portfolio,
 *   institution, sustainability, community-stewardship (all style: "light").
 *
 * For each section (processed in reverse so inserted nodes never shift the
 * position of sections not yet handled):
 *   - insert a <hr> before the section when it is not the first section,
 *     yielding sections.length - 1 (= 6) breaks.
 *   - append a "Section Metadata" block after the section when the template
 *     defines a style for it (all but the hero => 6 metadata blocks).
 *
 * Section selectors come from the captured DOM (migration-work/cleaned.html)
 * via the template, e.g. "section.hero-banner#from-complexity-to-clarity"
 * and "#from-our-chairman".
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.afterTransform) return;

  const template = payload && payload.template;
  const sections = template && Array.isArray(template.sections) ? template.sections : [];
  if (sections.length < 2) return;

  const doc = element.ownerDocument;

  // Reverse order so DOM insertions don't shift earlier sections.
  for (let i = sections.length - 1; i >= 0; i -= 1) {
    const section = sections[i];
    if (!section || !section.selector) continue;

    const sectionEl = element.querySelector(section.selector);
    if (!sectionEl) continue;

    // Section Metadata block after the section, when the template gives a style.
    if (section.style) {
      const metaBlock = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      sectionEl.after(metaBlock);
    }

    // Section break before every section except the first.
    if (i > 0) {
      sectionEl.before(doc.createElement('hr'));
    }
  }
}
