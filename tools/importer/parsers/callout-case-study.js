/* eslint-disable */
/* global WebImporter */
/**
 * Parser for callout-case-study. Base: (new) tinted callout box.
 * Source: https://www.temasekreview.com.sg/strategy.html
 *
 * A tinted (.bg-container.bg-light-green.m-t-40) box embedded mid-flow inside a
 * sub-chapter, containing: a heading (h3), a .medialine wrapper with a
 * full-width image, and one or more body prose paragraphs (and possibly a
 * "Read more" CTA link). Emitted as a single-column block whose cell holds the
 * heading, the image, then the body content, stacked.
 */
export default function parse(element, { document }) {
  const heading = element.querySelector('h1, h2, h3, h4, h5, h6');
  const media = element.querySelector('.medialine');
  const image = (media || element).querySelector('picture, img');

  // Body: all direct paragraphs (and any anchors within them) that are not the
  // media wrapper. Preserve source order.
  const body = [];
  element.querySelectorAll(':scope > p').forEach((p) => body.push(p));

  const cellContent = [];
  if (heading) cellContent.push(heading);
  if (image) cellContent.push(image);
  body.forEach((el) => cellContent.push(el));

  if (cellContent.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[cellContent]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'callout-case-study', cells });
  element.replaceWith(block);
}
