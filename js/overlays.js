(function () {
  'use strict';

  var CT = (window.CT = window.CT || {});

  var FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), ' +
    'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  var stack = [];

  function byId(id) { return document.getElementById(id); }
  function isOpen(el) { return !!el && el.classList.contains('is-open'); }
  function isBusy(el) { return el.getAttribute('data-busy') === 'true'; }

  function backdropOf(el) {
    var id = el.getAttribute('data-backdrop');
    return id ? byId(id) : byId(el.id + '-overlay');
  }

  function focusables(el) {
    return Array.prototype.filter.call(el.querySelectorAll(FOCUSABLE), function (n) {
      return n.getClientRects().length > 0;
    });
  }

  function syncBodyLock() {
    document.body.classList.toggle('no-scroll', stack.length > 0);
  }

  function setExpanded(opener, value) {
    if (opener && opener.hasAttribute && opener.hasAttribute('aria-expanded')) {
      opener.setAttribute('aria-expanded', String(value));
    }
  }

  function open(el, opener) {
    if (!el || isOpen(el)) return;
    opener = opener || document.activeElement;

    el.classList.add('is-open');
    var backdrop = backdropOf(el);
    if (backdrop) backdrop.classList.add('is-open');

    stack.push({ el: el, opener: opener });
    setExpanded(opener, true);
    syncBodyLock();

    var target = el.querySelector('[data-autofocus]') || focusables(el)[0];
    if (target) target.focus({ preventScroll: true });
  }

  function close(el) {
    if (!isOpen(el)) return;
    var hadFocus = el.contains(document.activeElement);

    el.classList.remove('is-open');
    var backdrop = backdropOf(el);
    if (backdrop) backdrop.classList.remove('is-open');

    var opener = null;
    for (var i = stack.length - 1; i >= 0; i--) {
      if (stack[i].el === el) { opener = stack[i].opener; stack.splice(i, 1); break; }
    }
    setExpanded(opener, false);
    syncBodyLock();

    if (hadFocus || document.activeElement === document.body) {
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
      if (document.activeElement === document.body) {
        var main = byId('main');
        if (main) main.focus({ preventScroll: true });
      }
    }
    el.dispatchEvent(new CustomEvent('overlay:closed', { bubbles: true }));
  }

  document.addEventListener('click', function (e) {
    var openBtn = e.target.closest('[data-open]');
    if (openBtn) {
      open(byId(openBtn.getAttribute('data-open')), openBtn);
      return;
    }
    var closeBtn = e.target.closest('[data-close]');
    if (closeBtn) {
      var panel = byId(closeBtn.getAttribute('data-close'));
      if (panel && !isBusy(panel)) close(panel);
      return;
    }
    if (e.target.classList && e.target.classList.contains('modal-overlay') && !isBusy(e.target)) {
      close(e.target);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (!stack.length) return;
    var top = stack[stack.length - 1].el;

    if (e.key === 'Escape') {
      if (isBusy(top)) return;
      e.preventDefault();
      close(top);
      return;
    }

    if (e.key === 'Tab') {
      var items = focusables(top);
      if (!items.length) { e.preventDefault(); return; }
      var first = items[0];
      var last = items[items.length - 1];
      var inside = top.contains(document.activeElement);

      if (e.shiftKey && (!inside || document.activeElement === first)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (!inside || document.activeElement === last)) {
        e.preventDefault();
        first.focus();
      }
    }
  });
  var desktop = window.matchMedia('(min-width: 1024px)');
  var onBreakpoint = function (e) { if (e.matches) close(byId('sidebar')); };
  if (desktop.addEventListener) desktop.addEventListener('change', onBreakpoint);
  else if (desktop.addListener) desktop.addListener(onBreakpoint);

  CT.overlays = { open: open, close: close, isOpen: isOpen, byId: byId };
})();
