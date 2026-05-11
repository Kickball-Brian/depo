/**
 * Dynamic phone number — first-touch attribution.
 * Mirrors the AccidentLogic pattern exactly.
 * Edit landingPages to override phone per entry path.
 */
(function () {
  'use strict';

  var CONFIG = {
    default: { raw: '8776651553', formatted: '877-665-1553' },
    landingPages: {
      '/': { raw: '8776651553', formatted: '877-665-1553' }
    },
    forceDefaultOn: ['/thank-you']
  };

  var STORAGE_KEY = 'dcc_first_touch_path';
  var firstTouch;
  try {
    firstTouch = sessionStorage.getItem(STORAGE_KEY);
    if (!firstTouch) {
      firstTouch = window.location.pathname || '/';
      sessionStorage.setItem(STORAGE_KEY, firstTouch);
    }
  } catch (e) {
    firstTouch = window.location.pathname || '/';
  }

  function pickPhone(path) {
    var p    = path.length > 1 ? path.replace(/\/$/, '') : path;
    var keys = Object.keys(CONFIG.landingPages).sort(function (a, b) { return b.length - a.length; });
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i].length > 1 ? keys[i].replace(/\/$/, '') : keys[i];
      if (p === k || (k !== '/' && p.indexOf(k + '/') === 0)) return CONFIG.landingPages[keys[i]];
    }
    return CONFIG.default;
  }

  var currentPath  = (window.location.pathname || '/').replace(/\/$/, '') || '/';
  var forceDefault = (CONFIG.forceDefaultOn || []).some(function (p) {
    var k = p.length > 1 ? p.replace(/\/$/, '') : p;
    return currentPath === k || (k !== '/' && currentPath.indexOf(k + '/') === 0);
  });

  var phone = forceDefault ? CONFIG.default : pickPhone(firstTouch);

  function apply() {
    document.querySelectorAll('[data-dynamic-phone]').forEach(function (el) {
      el.textContent = phone.formatted;
    });
    document.querySelectorAll('[data-dynamic-phone-tel]').forEach(function (el) {
      el.setAttribute('href', 'tel:+1' + phone.raw);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})();
