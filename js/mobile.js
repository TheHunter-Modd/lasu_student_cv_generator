/* ============================================================
   LASU CV GENERATOR — MOBILE JS HELPERS
   File: js/mobile.js
   ============================================================ */


/* ─────────────────────────────────────────────────────────
   1. HAMBURGER MENU TOGGLE
   ──────────────────────────────────────────────────────── */

function toggleMobileMenu() {
  const sidebar  = document.querySelector('.sidebar');
  const overlay  = document.querySelector('.sidebar-overlay');
  if (!sidebar) return;
  sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('open');
}

// Close sidebar when a nav link is clicked on mobile
document.addEventListener('DOMContentLoaded', function () {
  const menuLinks = document.querySelectorAll('.sidebar .menu a, .sidebar .logout');
  menuLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      if (window.innerWidth <= 768) {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('open');
      }
    });
  });
});


/* ─────────────────────────────────────────────────────────
   2. CV PAPER DYNAMIC SCALE (preview.php only)
   Reads viewport width and calculates scale so the 794px
   A4 paper fits on mobile without horizontal scroll.
   ──────────────────────────────────────────────────────── */

function scaleCVPaper() {
  var paper = document.querySelector('.cv-paper');
  if (!paper) return;

  var PAPER_WIDTH = 794;   // A4 at 96dpi
  var PADDING     = 32;    // 16px each side

  if (window.innerWidth <= 768) {
    var availableWidth = window.innerWidth - PADDING;
    var scale = Math.min(availableWidth / PAPER_WIDTH, 1);

    document.documentElement.style.setProperty('--cv-scale', scale);
    paper.style.transform       = 'scale(' + scale + ')';
    paper.style.transformOrigin = 'top center';

    var paperHeight    = paper.offsetHeight || 1123;
    var scaledHeight   = paperHeight * scale;
    var heightLoss     = paperHeight - scaledHeight;
    paper.style.marginBottom = '-' + heightLoss + 'px';
  } else {
    document.documentElement.style.removeProperty('--cv-scale');
    paper.style.transform       = '';
    paper.style.transformOrigin = '';
    paper.style.marginBottom    = '';
  }
}

window.addEventListener('load',   scaleCVPaper);
window.addEventListener('resize', scaleCVPaper);


/* ─────────────────────────────────────────────────────────
   3. PRINT HANDLING — strips transform BEFORE printing,
      restores it AFTER.

      ★★★ THIS IS THE FIX ★★★

      On mobile, the CV paper has transform: scale(0.42) so
      it fits on screen. When the user taps "Download PDF",
      the browser captures the CURRENT visual state for the
      print preview — including that tiny scale. Result: a
      miniature CV in the corner of an A4 page.

      fix: Strip the transform, wait for re-render, THEN
      print. After printing, restore the transform.
   ──────────────────────────────────────────────────────── */

var _printState = {
  transform: '',
  transformOrigin: '',
  marginBottom: '',
  cvScale: '',
  bodyOverflow: '',
  sidebarOpen: false,
  overlayOpen: false
};

/* Save current mobile state and strip all scaling */
function _stripForPrint() {
  var paper = document.querySelector('.cv-paper');
  if (!paper) return;

  // Save current values
  _printState.transform       = paper.style.transform;
  _printState.transformOrigin = paper.style.transformOrigin;
  _printState.marginBottom    = paper.style.marginBottom;
  _printState.cvScale         = document.documentElement.style.getPropertyValue('--cv-scale');
  _printState.bodyOverflow    = document.body.style.overflow;

  // Check sidebar state
  var sidebar = document.querySelector('.sidebar');
  var overlay = document.querySelector('.sidebar-overlay');
  _printState.sidebarOpen = sidebar ? sidebar.classList.contains('open') : false;
  _printState.overlayOpen = overlay ? overlay.classList.contains('open') : false;

  // ★ Strip the mobile scale transform
  paper.style.transform       = 'none';
  paper.style.transformOrigin = 'top left';
  paper.style.marginBottom    = '0';

  // Remove CSS variable
  document.documentElement.style.removeProperty('--cv-scale');

  // Reset body overflow (JS may have set hidden)
  document.body.style.overflow = '';

  // Close sidebar if open
  if (sidebar && sidebar.classList.contains('open')) sidebar.classList.remove('open');
  if (overlay && overlay.classList.contains('open')) overlay.classList.remove('open');
}

/* Restore mobile state after printing */
function _restoreAfterPrint() {
  var paper = document.querySelector('.cv-paper');
  if (!paper) return;

  paper.style.transform       = _printState.transform;
  paper.style.transformOrigin = _printState.transformOrigin;
  paper.style.marginBottom    = _printState.marginBottom;

  if (_printState.cvScale) {
    document.documentElement.style.setProperty('--cv-scale', _printState.cvScale);
  }

  document.body.style.overflow = _printState.bodyOverflow;

  // Restore sidebar if it was open
  if (_printState.sidebarOpen) {
    var sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.add('open');
  }
  if (_printState.overlayOpen) {
    var overlay = document.querySelector('.sidebar-overlay');
    if (overlay) overlay.classList.add('open');
  }
}

/* Modern browsers fire beforeprint/afterprint events */
window.addEventListener('beforeprint', function () {
  _stripForPrint();
});

window.addEventListener('afterprint', function () {
  _restoreAfterPrint();
});

/* ★★★ printCV() — THE FUNCTION TO CALL FROM THE BUTTON ★★★

   Why not just use window.print()?
   - Many mobile browsers (Android Chrome, Samsung Internet,
     iOS Safari) do NOT reliably fire beforeprint/afterprint
   - So we manually strip the transform, wait for the
     browser to re-render, then call window.print()
   - After the print dialog closes, we restore everything
*/
function printCV() {
  _stripForPrint();

  // Wait TWO animation frames to ensure the browser has
  // actually re-rendered the page without the transform
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      window.print();

      // Restore after a short delay (gives the print
      // dialog time to capture the full-size version)
      setTimeout(function () {
        _restoreAfterPrint();
      }, 600);
    });
  });
}