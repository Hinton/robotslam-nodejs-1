if (document.querySelector('.export-container') !== null) {
  const progressBar = document.querySelector('.export-container .progress-bar');
  const maxValue = progressBar.getAttribute('data-max');

  document.querySelector('.export-container .btn').onclick = function () {
    let button = this;
    let eventSource = new EventSource('export_do');

    button.setAttribute('disabled', 'disabled');
    button.innerHTML = 'Connecting...';

    eventSource.onopen = function(e) {
      button.innerHTML = 'Exporting...';
    }

    eventSource.onmessage = function(e) {
      progressBar.style.width = `${e.data/maxValue * 100}%`;
      progressBar.innerHTML = `${e.data} of ${maxValue}`;
    }
  };
}