/*
 * Table Segments Block
 * Renders a portfolio-segments data table (header + color-coded data rows)
 * followed by a full-width chart image.
 *
 * Authored structure: rows of cells. The final authored row may contain a
 * single image (the chart) whose sibling cells are empty. That row is pulled
 * out of the table and rendered full-width beneath it rather than as a narrow
 * table cell.
 */

/**
 * Determines whether a row is the trailing chart-image row: it contains a
 * picture/img in one cell and its remaining cells are empty.
 * @param {Element} row
 * @returns {boolean}
 */
function isImageRow(row) {
  const cells = [...row.children];
  const hasImage = cells.some((cell) => cell.querySelector('picture, img'));
  if (!hasImage) return false;
  const nonImageCellsEmpty = cells
    .filter((cell) => !cell.querySelector('picture, img'))
    .every((cell) => cell.textContent.trim() === '');
  return nonImageCellsEmpty;
}

/**
 * loads and decorates the block
 * @param {Element} block
 */
export default async function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const header = !block.classList.contains('no-header');

  const rows = [...block.children];

  // Separate the trailing chart-image row (if present) from the data rows.
  let chartRow = null;
  if (rows.length && isImageRow(rows[rows.length - 1])) {
    chartRow = rows.pop();
  }

  rows.forEach((row, i) => {
    const tr = document.createElement('tr');

    [...row.children].forEach((cell) => {
      const td = document.createElement(i === 0 && header ? 'th' : 'td');
      if (i === 0 && header) td.setAttribute('scope', 'col');
      td.innerHTML = cell.innerHTML;
      tr.append(td);
    });

    if (i === 0 && header) thead.append(tr);
    else tbody.append(tr);
  });

  table.append(thead, tbody);

  const children = [table];

  if (chartRow) {
    const figure = document.createElement('figure');
    figure.className = 'table-segments-chart';
    const picture = chartRow.querySelector('picture');
    const img = chartRow.querySelector('img');
    figure.append(picture || img);
    children.push(figure);
  }

  block.replaceChildren(...children);
}
