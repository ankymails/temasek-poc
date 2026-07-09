/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: chapter-page (e.g. strategy.html) specific cleanup.
 *
 * Runs in addition to the shared temasek-cleanup transformer (which removes the
 * site nav, footer, cookie banner, skip link and print-only banner variants).
 * This one strips chrome that only appears on the long-form chapter pages:
 *   - .page-content__content-share / -share-wrap  social share widgets
 *   - the accordion toggle controls: the EXPAND ALL / COLLAPSE ALL button in
 *     .pagecontent__header and the per-section heading toggle <button>s
 *   - .footnote-section  floating (absolutely positioned) footnote tooltips
 *   - .print-section-divider / .disclaimer-print  print-only blocks
 *   - empty .tr-separator spacer divs
 * The chapter H1 inside .pagecontent__header is preserved.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // The sub-chapter titles live inside a <button> within the section heading
    // (<h2><button class="page-content__content-link">3.1 Sense, ...</button></h2>).
    // Unwrap those buttons so the title text survives as heading content.
    element.querySelectorAll('.page-content__content-link').forEach((btn) => {
      const text = btn.textContent.trim();
      if (text) btn.replaceWith(btn.ownerDocument.createTextNode(text));
      else btn.remove();
    });

    // Remove the icon-only toggle buttons (accordion chevron, EXPAND ALL) that
    // carry no title text; the EDS accordion adds its own toggle affordance.
    element.querySelectorAll('.pagecontent__header button, .page-content__section-heading button, .page-content__content-toggle, button.page-content__section-toggle').forEach((btn) => {
      btn.remove();
    });

    // NOTE: .contenttopnav is intentionally NOT removed here — it is parsed into
    // a chapter-nav block by tools/importer/parsers/chapter-nav.js.
    WebImporter.DOMUtils.remove(element, [
      '.page-content__content-share-wrap',
      '.page-content__content-share',
      '.footnote-section',
      '.print-section-divider',
      '.print-show',
      '.disclaimer-print',
      '.tr-navigation',
      'script',
      'style',
      'noscript',
    ]);

    // DataTables.js renders a scrollable widget that DUPLICATES the table into
    // separate header/body/footer scroll panes. Those duplicate <div> panes get
    // misread by the importer as EDS blocks (e.g. a "logo" / date-named block),
    // producing 404s. Collapse the widget down to the single real <table>:
    // keep the body-pane table, drop the header/footer scroll clones and the
    // scroll wrappers, so only clean tabular content remains.
    element.querySelectorAll('.dt-container, .dataTables_wrapper').forEach((widget) => {
      const bodyTable = widget.querySelector('.dt-scroll-body table, table.dataTable');
      if (bodyTable) {
        // Remove attributes/classes that would make cells look like block rows.
        bodyTable.removeAttribute('class');
        widget.replaceWith(bodyTable);
      } else {
        widget.remove();
      }
    });
    // Remove leftover DataTables scroll chrome if any survived.
    WebImporter.DOMUtils.remove(element, [
      '.dt-scroll-head',
      '.dt-scroll-foot',
      '.dt-scroll',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Drop empty spacer/separator divs and any leftover print-only blocks.
    element.querySelectorAll('.tr-separator, .print-show, .print-hide-inverse').forEach((el) => {
      if (el.textContent.trim() === '' && !el.querySelector('img, picture')) el.remove();
    });

    // Strip layout / tracking attributes.
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('data-vertical-align');
      el.removeAttribute('data-horizontal-align');
      el.removeAttribute('data-height');
      el.removeAttribute('data-type');
      el.removeAttribute('style');
    });
  }
}
