/* Hosting mode, connected build. Only Variant E Part 2 (the default design) and the admin portal (/ops) talk to the
   store API, through the same-origin /api proxy. Every other design and part runs as the static design preview
   (deploy/hosted-preview.js, loaded next): no request reaches the API from them.
   The design is worked out here the same way app.js syncDesign() does, before any page script runs. */
(function () {
  'use strict';
  var url = new URL(location.href), q = url.searchParams, designs = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], parts = ['1', '2', '3', '4'];
  var stored = null;
  try { stored = sessionStorage.getItem('bcc-design'); } catch (e) {}
  var production = !!(window.BCCRelease && window.BCCRelease.production);
  var design = production ? 'e' : designs.indexOf(q.get('design')) >= 0 ? q.get('design') : parts.indexOf(q.get('part')) >= 0 ? 'e' : designs.indexOf(stored) >= 0 ? stored : 'e';
  var part = design !== 'e' ? '' : production ? '2' : parts.indexOf(q.get('part')) >= 0 ? q.get('part') : '2';
  var connected = url.pathname === '/ops' || url.pathname.indexOf('/ops/') === 0 || (design === 'e' && part === '2');
  window.BCCConnectedPage = connected;
  if (connected) window.BCCConnectedHosted = true;
})();
