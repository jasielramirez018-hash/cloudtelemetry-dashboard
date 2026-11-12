(function () {
  'use strict';

  var CT = window.CT;
  var form = document.getElementById('config-form');
  if (!form) return;

  var drawer = document.getElementById('drawer');
  var fields = document.getElementById('config-fields');
  var nameInput = document.getElementById('cfg-name');
  var nameError = document.getElementById('cfg-name-error');
  var dateInput = document.getElementById('cfg-date');
  var dateError = document.getElementById('cfg-date-error');
  var btnSave = document.getElementById('btn-save-config');
  var btnCancel = document.getElementById('btn-cancel-config');
  var btnCloseDrawer = drawer.querySelector('.drawer-header [data-close]');

  var saving = false;

  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function todayLocal() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  dateInput.min = todayLocal();

  function setError(input, box, message) {
    if (message) {
      box.textContent = message;
      box.hidden = false;
      input.setAttribute('aria-invalid', 'true');
    } else {
      box.hidden = true;
      input.removeAttribute('aria-invalid');
    }
    return !message;
  }

  function validateName() {
    var v = nameInput.value.trim();
    var msg = '';
    if (!v) msg = 'Escribe un nombre para el servidor.';
    else if (!/^[a-z0-9][a-z0-9-]{2,}$/.test(v)) msg = 'Usa mínimo 3 caracteres: minúsculas, números o guiones.';
    return setError(nameInput, nameError, msg);
  }

  function validateDate() {
    var msg = dateInput.value && dateInput.value < dateInput.min ? 'Elige una fecha de hoy en adelante.' : '';
    return setError(dateInput, dateError, msg);
  }

  var nameWrap = document.getElementById('cfg-name-wrap');
  var descInput = document.getElementById('cfg-desc');
  var descCount = document.getElementById('cfg-desc-count');
  var checking = false;
  var submitQueued = false;

  function updateCount() {
    descCount.textContent = descInput.value.length + ' / ' + descInput.maxLength;
  }
  descInput.addEventListener('input', updateCount);

  /* Estado Loading en un campo: verifica en "servidor" que el nombre no exista. */
  function checkNameAvailability() {
    if (checking || !nameInput.value.trim() || !validateName()) return;
    checking = true;
    nameWrap.classList.add('is-loading');
    nameInput.setAttribute('aria-busy', 'true');
    nameInput.readOnly = true;
    setTimeout(function () {
      checking = false;
      nameWrap.classList.remove('is-loading');
      nameInput.removeAttribute('aria-busy');
      nameInput.readOnly = false;
      if (CT.serverExists && CT.serverExists(nameInput.value.trim())) {
        setError(nameInput, nameError, 'Ese nombre ya existe. Prueba con otro.');
      }
      if (submitQueued) { submitQueued = false; form.requestSubmit(); }
    }, 900);
  }
  nameInput.addEventListener('blur', checkNameAvailability);
  nameInput.addEventListener('input', function () { if (!nameError.hidden) validateName(); });
  dateInput.addEventListener('change', validateDate);

  function setSaving(on) {
    saving = on;
    fields.disabled = on;
    drawer.setAttribute('data-busy', String(on));
    btnSave.classList.toggle('is-loading', on);
    if (on) btnSave.setAttribute('aria-busy', 'true');
    else btnSave.removeAttribute('aria-busy');
    btnSave.textContent = on ? 'Guardando…' : 'Guardar cambios';
    btnCancel.disabled = on;
    btnCloseDrawer.disabled = on;
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (saving) return;
    if (checking) { submitQueued = true; return; }

    var okName = validateName();
    if (okName && CT.serverExists && CT.serverExists(nameInput.value.trim())) {
      okName = setError(nameInput, nameError, 'Ese nombre ya existe. Prueba con otro.');
    }
    var okDate = validateDate();
    if (!okName) { nameInput.focus(); return; }
    if (!okDate) { dateInput.focus(); return; }

    setSaving(true);
    setTimeout(function () {
      var saved = nameInput.value.trim();
      setSaving(false);
      form.reset();
      updateCount();
      CT.overlays.close(drawer);
      CT.toast('Configuración de ' + saved + ' guardada.');
    }, 1200);
  });
  drawer.addEventListener('overlay:closed', function () {
    setError(nameInput, nameError, '');
    setError(dateInput, dateError, '');
  });
})();
