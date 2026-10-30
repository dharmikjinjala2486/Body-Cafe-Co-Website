/* Release mode. `preview` (the default) keeps the design switcher, labelled demonstration fixtures and noindex.
   `production` is opted into by the build with <meta name="bcc-release" content="production">; it removes preview
   tooling and fixture content and shows honest empty/pending states instead. Nothing here enables payments. */
(function () {
  'use strict';
  var meta = document.querySelector('meta[name="bcc-release"]');
  var mode = meta && meta.content === 'production' ? 'production' : 'preview';
  window.BCCRelease = { mode: mode, preview: mode === 'preview', production: mode === 'production' };
  document.documentElement.dataset.release = mode;
})();
