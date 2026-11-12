(function () {
  'use strict';

  var CT = window.CT;
  var PAGE_SIZE = 5;
  var instances = [
    { id: 'srv-prod-01',    location: 'Washington', uptime: 99.9, load: 45, vcpus: 2, ram: 16, region: 'us-east-1' },
    { id: 'srv-db-main',    location: 'Dallas',     uptime: 99.9, load: 85, vcpus: 8, ram: 64, region: 'us-south-1' },
    { id: 'srv-prod-02',    location: 'Frankfurt',  uptime: 99.8, load: 78, vcpus: 4, ram: 16, region: 'eu-central-1' },
    { id: 'srv-prod-04',    location: 'Washington', uptime: 99.9, load: 40, vcpus: 2, ram: 8,  region: 'us-east-1' },
    { id: 'srv-prod-05',    location: 'Sídney',     uptime: 97.2, load: 96, vcpus: 4, ram: 32, region: 'ap-southeast-2' },
    { id: 'srv-db-replica', location: 'Dallas',     uptime: 99.7, load: 88, vcpus: 8, ram: 64, region: 'us-south-1' },
    { id: 'srv-cache-01',   location: 'Washington', uptime: 94.8, load: 98, vcpus: 2, ram: 8,  region: 'us-east-1' },
    { id: 'srv-api-01',     location: 'Frankfurt',  uptime: 99.9, load: 33, vcpus: 4, ram: 16, region: 'eu-central-1' }
  ];

  var state = { q: '', status: 'all', page: 1 };

  var body = document.getElementById('instances-body');
  var qInput = document.getElementById('filter-q');
  var statusSelect = document.getElementById('filter-status');
  var info = document.getElementById('page-info');
  var prev = document.getElementById('page-prev');
  var next = document.getElementById('page-next');
  var criticalBtn = document.getElementById('btn-restart-critical');

  var modal = document.getElementById('modal');
  var modalTitle = document.getElementById('modal-title-text');
  var modalDesc = document.getElementById('modal-desc');
  var btnConfirm = document.getElementById('btn-confirm-modal');
  var btnCancel = document.getElementById('btn-cancel-modal');
  var btnCloseModal = document.getElementById('btn-close-modal');

  var STATUS_LABEL = { ok: 'Normal', warning: 'Alerta', critical: 'Crítico' };

  function statusOf(load) {
    return load >= 90 ? 'critical' : load >= 70 ? 'warning' : 'ok';
  }

  function esc(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function filtered() {
    var q = state.q.trim().toLowerCase();
    return instances.filter(function (s) {
      var okStatus = state.status === 'all' || statusOf(s.load) === state.status;
      var okText = !q || s.id.toLowerCase().indexOf(q) > -1 || s.location.toLowerCase().indexOf(q) > -1;
      return okStatus && okText;
    });
  }

  function rowHtml(s) {
    var st = statusOf(s.load);
    var id = esc(s.id);
    return (
      '<tr role="row" data-id="' + id + '">' +
        '<th role="rowheader" scope="row" class="cell-server">' +
          '<div class="server-id">' +
            '<span class="server-icon server-icon--' + st + '" aria-hidden="true">' +
              '<svg class="icon"><use href="#i-rows"/></svg></span>' +
            '<div><button type="button" class="server-name">' + id + '</button>' +
            '<small class="server-location">' + esc(s.location) + '</small></div>' +
          '</div>' +
          '<div class="popover" role="group" aria-label="Detalles de ' + id + '">' +
            '<p class="popover-title">' + id + '</p>' +
            '<dl>' +
              '<dt>Status</dt><dd class="load load--' + st + '">' + STATUS_LABEL[st] + '</dd>' +
              '<dt>vCPUs</dt><dd>' + s.vcpus + '</dd>' +
              '<dt>RAM</dt><dd>' + s.ram + ' GB</dd>' +
              '<dt>Region</dt><dd>' + esc(s.region) + '</dd>' +
            '</dl>' +
            '<button type="button" class="btn btn-outline-danger btn-sm btn-block" data-action="delete" data-id="' + id + '">Eliminar</button>' +
          '</div>' +
        '</th>' +
        '<td role="cell" class="cell-location">' + esc(s.location) + '</td>' +
        '<td role="cell" class="cell-uptime"><span class="status-text green">' + s.uptime + '% Uptime</span></td>' +
        '<td role="cell" class="cell-load"><span class="load load--' + st + '">' + s.load + '% Load</span></td>' +
        '<td role="cell" class="cell-action">' +
          '<button type="button" class="btn btn-danger btn-sm" data-action="restart" data-id="' + id + '" ' +
          'aria-label="Reiniciar ' + id + '">Reiniciar</button>' +
        '</td>' +
      '</tr>'
    );
  }

  function render() {
    var list = filtered();
    var pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    state.page = Math.min(state.page, pages);
    var start = (state.page - 1) * PAGE_SIZE;
    var slice = list.slice(start, start + PAGE_SIZE);

    body.innerHTML = slice.length
      ? slice.map(rowHtml).join('')
      : '<tr role="row" class="empty-row"><td role="cell" colspan="5">No hay instancias que coincidan con tu búsqueda.</td></tr>';

    info.textContent = list.length
      ? 'Mostrando ' + (start + 1) + '–' + (start + slice.length) + ' de ' + list.length + ' instancias'
      : '0 instancias';
    prev.disabled = state.page <= 1;
    next.disabled = state.page >= pages;
  }
  qInput.addEventListener('input', function () { state.q = qInput.value; state.page = 1; render(); });
  statusSelect.addEventListener('change', function () { state.status = statusSelect.value; state.page = 1; render(); });
  prev.addEventListener('click', function () { state.page--; render(); });
  next.addEventListener('click', function () { state.page++; render(); });
  function wait(ms) { return new Promise(function (resolve) { setTimeout(resolve, ms); }); }

  var pending = null;

  function confirmAction(config, opener) {
    pending = config;
    modalTitle.textContent = config.title;
    modalDesc.textContent = config.message;
    btnConfirm.textContent = config.confirmLabel;
    btnConfirm.classList.toggle('btn-danger', !!config.danger);
    btnConfirm.classList.toggle('btn-primary', !config.danger);
    CT.overlays.open(modal, opener);
  }

  function setModalBusy(busy, label) {
    modal.setAttribute('data-busy', String(busy));
    btnConfirm.classList.toggle('is-loading', busy);
    if (busy) btnConfirm.setAttribute('aria-busy', 'true');
    else btnConfirm.removeAttribute('aria-busy');
    btnCancel.disabled = busy;
    btnCloseModal.disabled = busy;
    if (label) btnConfirm.textContent = label;
  }

  btnConfirm.addEventListener('click', function () {
    if (!pending || modal.getAttribute('data-busy') === 'true') return;
    var action = pending;
    setModalBusy(true, action.loadingLabel);

    wait(1500).then(function () {
      setModalBusy(false, action.confirmLabel);
      pending = null;
      CT.overlays.close(modal);
      action.run();
    });
  });

  modal.addEventListener('overlay:closed', function () { pending = null; });

  CT.serverExists = function (id) {
    return instances.some(function (s) { return s.id === id; });
  };

  function find(id) {
    return instances.filter(function (s) { return s.id === id; })[0];
  }

  function restart(id) {
    var s = find(id);
    if (!s) return;
    s.load = 22; 
    render();
    CT.toast(id + ' se reinició correctamente.');
    var btn = body.querySelector('[data-action="restart"][data-id="' + id + '"]');
    if (btn && document.activeElement === document.body) btn.focus({ preventScroll: true });
  }

  function remove(id) {
    instances = instances.filter(function (s) { return s.id !== id; });
    render();
    CT.toast(id + ' se eliminó de la lista.');
    document.getElementById('inst-title').focus({ preventScroll: true });
  }

  function askRestart(id, opener) {
    confirmAction({
      title: 'Reset Confirmation',
      message: '¿Reiniciar ' + id + '? Puede haber una interrupción temporal del servicio.',
      confirmLabel: 'Confirmar',
      loadingLabel: 'Reiniciando…',
      run: function () { restart(id); }
    }, opener);
  }

  function askDelete(id, opener) {
    confirmAction({
      title: 'Delete Confirmation',
      message: '¿Eliminar ' + id + ' de forma permanente? Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      loadingLabel: 'Eliminando…',
      danger: true,
      run: function () { remove(id); }
    }, opener);
  }

  body.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var id = btn.getAttribute('data-id');
    if (btn.getAttribute('data-action') === 'restart') askRestart(id, btn);
    else askDelete(id, btn);
  });
  criticalBtn.addEventListener('click', function () {
    var crit = instances.filter(function (s) { return statusOf(s.load) === 'critical'; })[0];
    if (!crit) {
      CT.toast('No hay instancias críticas por reiniciar.', { type: 'info' });
      return;
    }
    askRestart(crit.id, criticalBtn);
  });

  render();
})();
