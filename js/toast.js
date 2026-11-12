(function () {
  'use strict';

  var CT = (window.CT = window.CT || {});

  CT.toast = function (message, options) {
    var opts = options || {};
    var type = opts.type || 'success';
    var duration = opts.duration || 4000;
    var region = document.getElementById('toast-region');
    if (!region) return;

    var toast = document.createElement('div');
    toast.className = 'toast toast--' + type;
    toast.innerHTML =
      '<svg class="icon" aria-hidden="true"><use href="#' + (type === 'info' ? 'i-info' : 'i-check') + '"/></svg>';

    var text = document.createElement('span');
    text.textContent = message; 
    toast.appendChild(text);
    region.appendChild(toast);

    setTimeout(function () {
      toast.classList.add('is-leaving');
      setTimeout(function () { toast.remove(); }, 220);
    }, duration);
  };
})();
