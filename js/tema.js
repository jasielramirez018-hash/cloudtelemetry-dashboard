(function () {
  'use strict';

  var KEY = 'ct-theme';
  var root = document.documentElement;
  var media = window.matchMedia('(prefers-color-scheme: dark)');

  function readStored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function writeStored(value) {
    try { localStorage.setItem(KEY, value); } catch (e) { /* modo privado: se ignora */ }
  }

  function current() {
    return readStored() || (media.matches ? 'dark' : 'light');
  }

  function syncToggles(theme) {
    var toggles = document.querySelectorAll('[data-theme-toggle]');
    for (var i = 0; i < toggles.length; i++) {
      toggles[i].setAttribute('aria-checked', String(theme === 'dark'));
    }
    var meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? 'dark light' : 'light dark');
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    syncToggles(theme);
  }

  root.setAttribute('data-theme', current());

  document.addEventListener('DOMContentLoaded', function () {
    syncToggles(current());

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-theme-toggle]');
      if (!btn) return;
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      writeStored(next);
      apply(next);
    });
  });
  var onSystemChange = function () {
    if (!readStored()) apply(media.matches ? 'dark' : 'light');
  };
  if (media.addEventListener) media.addEventListener('change', onSystemChange);
  else if (media.addListener) media.addListener(onSystemChange);
})();
