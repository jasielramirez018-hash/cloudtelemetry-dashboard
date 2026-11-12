(function () {
  'use strict';
  var KEY = 'ct-theme', root = document.documentElement;
  var media = window.matchMedia('(prefers-color-scheme: dark)');
  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function sync(t) {
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) { b.setAttribute('aria-checked', String(t === 'dark')); });
  }
  var theme = stored() || (media.matches ? 'dark' : 'light');
  root.setAttribute('data-theme', theme);
  document.addEventListener('DOMContentLoaded', function () {
    sync(theme);
    document.addEventListener('click', function (e) {
      if (!e.target.closest('[data-theme-toggle]')) return;
      theme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(KEY, theme); } catch (err) { /* ignorado */ }
      root.setAttribute('data-theme', theme);
      sync(theme);
    });
  });
})();
