(function () {
  'use strict';

  var CT = window.CT;
  var navItems = document.querySelectorAll('.sidebar-nav [data-view]');
  var crumbRoots = document.querySelectorAll('[data-crumb-root]');
  var crumbSections = document.querySelectorAll('[data-crumb-section]');
  var crumbLabels = document.querySelectorAll('[data-crumb-label]');
  var backLink = document.getElementById('back-link');
  var backText = document.getElementById('back-link-text');

  var VIEWS = {
    metrics: { target: 'metricas', label: 'Dashboard' },
    servers: { target: 'instancias', label: 'Servidores' }
  };

  var current = 'metrics';
  var previous = null;
  var lockScroll = false;
  var lockTimer = null;

  /* Actualiza menú activo, breadcrumbs y enlace "Volver" (sin mover la página). */
  function mark(name) {
    var view = VIEWS[name];
    if (!view) return;
    if (name !== current) { previous = current; current = name; }

    navItems.forEach(function (item) {
      if (item.getAttribute('data-view') === name) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });

    var atRoot = name === 'metrics';
    crumbRoots.forEach(function (a) {
      if (atRoot) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    crumbSections.forEach(function (li) { li.hidden = atRoot; });
    crumbLabels.forEach(function (s) { s.textContent = view.label; });

    if (previous && previous !== current) {
      backText.textContent = 'Volver a ' + VIEWS[previous].label;
      backLink.setAttribute('data-view', previous);
      backLink.setAttribute('href', '#' + VIEWS[previous].target);
      backLink.hidden = false;
    } else {
      backLink.hidden = true;
    }
  }

  function setView(name) {
    var view = VIEWS[name];
    if (!view) return;
    mark(name);

    lockScroll = true;
    clearTimeout(lockTimer);
    lockTimer = setTimeout(function () { lockScroll = false; }, 800);

    var target = document.getElementById(view.target);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      var heading = target.querySelector('h2[tabindex]');
      if (heading) heading.focus({ preventScroll: true });
    }
  }

  /* El menú y el breadcrumb siguen la posición real del scroll. */
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (lockScroll || ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var inst = document.getElementById('instancias');
      var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      var inServers = atBottom || inst.getBoundingClientRect().top < window.innerHeight * 0.35;
      mark(inServers ? 'servers' : 'metrics');
    });
  }, { passive: true });

  document.addEventListener('click', function (e) {
    var link = e.target.closest('[data-view]');
    if (link) {
      e.preventDefault();
      setView(link.getAttribute('data-view'));
    }
    if (e.target.closest('.sidebar-nav .nav-item')) {
      CT.overlays.close(document.getElementById('sidebar'));
    }
  });
  var bell = document.getElementById('btn-notifications');
  if (bell) {
    bell.addEventListener('click', function () {
      CT.toast('Alerta: srv-prod-05 está en estado crítico (96% de carga).', { type: 'info', duration: 5000 });
      bell.classList.remove('has-alert');
      bell.setAttribute('aria-label', 'Notificaciones: sin alertas nuevas');
    });
  }
})();
