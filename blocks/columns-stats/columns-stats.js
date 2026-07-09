export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-stats-${cols.length}-cols`);

  // Determine whether any cell contains a chart image. Cells without a
  // picture are "number callouts" (e.g. "S$51b / Invested during the year"),
  // which render as tinted rounded cards. Cells with a picture are stat
  // panels with a chart beneath the figure.
  const hasChart = cols.some((col) => col.querySelector('picture'));
  if (!hasChart) {
    block.classList.add('columns-stats-callouts');
  }

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        // The picture is wrapped in a <p> by EDS; tag that wrapper so it can
        // be styled as the chart area beneath the stat text.
        const picWrapper = pic.closest('p') || pic.closest('div');
        if (picWrapper) {
          picWrapper.classList.add('columns-stats-chart');
        }
      } else {
        // number callout cell
        col.classList.add('columns-stats-callout');
      }
    });
  });
}
