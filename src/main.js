// Double-check mobile detection in case inline script hasn't run yet
if (!window.__isMobile) {
  window.__isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 800;
}

if (window.__isMobile) {
  // Show desktop-required message, never load Three.js/WebGL
  const lt = document.getElementById('loading-text');
  if (lt) {
    lt.innerHTML =
      '<h1>Smoke Flow</h1><p>This simulation requires a desktop GPU.<br>Please visit on a laptop or desktop.</p>';
  }
} else {
  import('./app.js');
}
