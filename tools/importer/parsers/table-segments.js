/* eslint-disable */
/* global WebImporter */
/**
 * Parser for table-segments. Base: table.
 * Source: https://www.temasekreview.com.sg/
 * Generated: 2026-07-08
 *
 * The source is a .chart-container holding a <table> (header row + 3 data rows:
 * segment description, exposure %, 10-year return %) followed by a trailing
 * chart image. Emitted as a 3-column table block: the table rows are mapped
 * cell-for-cell, and the trailing chart image is placed in a final full-width
 * row (padded to 3 cells so the block table stays rectangular).
 */
export default function parse(element, { document }) {
  const table = element.querySelector('table');
  if (!table) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Determine column count from the header (or first) row.
  const headerRow = table.querySelector('thead tr') || table.querySelector('tr');
  const colCount = headerRow ? headerRow.children.length : 3;

  // Header row + all data rows, mapped cell-for-cell.
  Array.from(table.querySelectorAll('tr')).forEach((tr) => {
    const rowCells = Array.from(tr.children).map((td) => Array.from(td.childNodes));
    // Pad short rows so every content row has colCount cells.
    while (rowCells.length < colCount) rowCells.push('');
    cells.push(rowCells);
  });

  // Trailing chart image: the first image in the container that is NOT inside
  // the data table. Handles both the flat source (img as a direct sibling) and
  // the rendered DOM (img wrapped in a chart div).
  const chartImg = Array.from(element.querySelectorAll('img, picture'))
    .find((img) => !img.closest('table'));
  if (chartImg) {
    const imgRow = [chartImg];
    while (imgRow.length < colCount) imgRow.push('');
    cells.push(imgRow);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'table-segments', cells });
  element.replaceWith(block);
}
