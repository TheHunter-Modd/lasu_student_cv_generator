/* ============================================================
   LASU CV GENERATOR — MOBILE JS HELPERS
   File: js/mobile.js
   ============================================================ */


/* ─────────────────────────────────────────────────────────
   1. HAMBURGER MENU TOGGLE
   ──────────────────────────────────────────────────────── */

function toggleMobileMenu() {
  var sidebar = document.querySelector('.sidebar');
  var overlay = document.querySelector('.sidebar-overlay');
  if (!sidebar) return;
  sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', function () {
  var menuLinks = document.querySelectorAll('.sidebar .menu a, .sidebar .logout');
  for (var i = 0; i < menuLinks.length; i++) {
    menuLinks[i].addEventListener('click', function () {
      if (window.innerWidth <= 768) {
        var sidebar = document.querySelector('.sidebar');
        var overlay = document.querySelector('.sidebar-overlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('open');
      }
    });
  }
});


/* ─────────────────────────────────────────────────────────
   2. CV PAPER DYNAMIC SCALE (preview.php only)
   ──────────────────────────────────────────────────────── */

function scaleCVPaper() {
  var paper = document.querySelector('.cv-paper');
  if (!paper) return;

  var PAPER_WIDTH = 794;
  var PADDING     = 32;

  if (window.innerWidth <= 768) {
    var availableWidth = window.innerWidth - PADDING;
    var scale = Math.min(availableWidth / PAPER_WIDTH, 1);

    document.documentElement.style.setProperty('--cv-scale', scale);
    paper.style.transform       = 'scale(' + scale + ')';
    paper.style.transformOrigin = 'top center';

    var paperHeight  = paper.offsetHeight || 1123;
    var scaledHeight = paperHeight * scale;
    var heightLoss   = paperHeight - scaledHeight;
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
   3. PRINT HANDLING

   ★★★ WHY MOBILE PRINT FAILS ★★★

   Problem 1: iOS Safari does NOT support window.print().
   Calling it does absolutely nothing — no error, no dialog.

   Problem 2: Some Android browsers require window.print()
   to be called directly from a user tap handler. Wrapping
   it in requestAnimationFrame() breaks that "user gesture"
   chain, so the browser silently blocks the call.

   Problem 3: If _stripForPrint() throws any error, the
   entire printCV() function dies and nothing happens.

   FIX:
   - Use setTimeout(300ms) instead of requestAnimationFrame
     (keeps the call closer to the user gesture)
   - Wrap everything in try/catch so errors don't kill it
   - If window.print() doesn't work, show a helpful modal
     with instructions for iOS/Android users
   - Always call scaleCVPaper() as ultimate fallback restore
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

function _stripForPrint() {
  var paper = document.querySelector('.cv-paper');
  if (!paper) return;

  _printState.transform       = paper.style.transform;
  _printState.transformOrigin = paper.style.transformOrigin;
  _printState.marginBottom    = paper.style.marginBottom;
  _printState.cvScale         = document.documentElement.style.getPropertyValue('--cv-scale');
  _printState.bodyOverflow    = document.body.style.overflow;

  var sidebar = document.querySelector('.sidebar');
  var overlay = document.querySelector('.sidebar-overlay');
  _printState.sidebarOpen = sidebar ? sidebar.classList.contains('open') : false;
  _printState.overlayOpen = overlay ? overlay.classList.contains('open') : false;

  // Strip the mobile scale
  paper.style.transform       = 'none';
  paper.style.transformOrigin = 'top left';
  paper.style.marginBottom    = '0';
  document.documentElement.style.removeProperty('--cv-scale');
  document.body.style.overflow = '';

  if (sidebar && sidebar.classList.contains('open')) sidebar.classList.remove('open');
  if (overlay && overlay.classList.contains('open')) overlay.classList.remove('open');
}

function _restoreAfterPrint() {
  var paper = document.querySelector('.cv-paper');
  if (!paper) {
    scaleCVPaper();
    return;
  }

  paper.style.transform       = _printState.transform;
  paper.style.transformOrigin = _printState.transformOrigin;
  paper.style.marginBottom    = _printState.marginBottom;

  if (_printState.cvScale) {
    document.documentElement.style.setProperty('--cv-scale', _printState.cvScale);
  }

  document.body.style.overflow = _printState.bodyOverflow;

  if (_printState.sidebarOpen) {
    var sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.add('open');
  }
  if (_printState.overlayOpen) {
    var overlay = document.querySelector('.sidebar-overlay');
    if (overlay) overlay.classList.add('open');
  }
}

/* beforeprint/afterprint — backup for browsers that support them */
window.addEventListener('beforeprint', function () {
  try { _stripForPrint(); } catch (e) {}
});

window.addEventListener('afterprint', function () {
  try { _restoreAfterPrint(); } catch (e) { scaleCVPaper(); }
});


/* ══════════════════════════════════════════════════════════
   ★★★ printCV() — THE MAIN FUNCTION ★★★

   Called by: onclick="printCV()" on the Download PDF button

   Flow:
   1. Strip mobile transform (try/catch protected)
   2. Wait 300ms (not rAF — keeps user gesture chain alive)
   3. Try window.print()
   4. If it fails or is unsupported, show instruction modal
   5. Restore transform after everything
   ══════════════════════════════════════════════════════════ */

function printCV() {
  // Step 1: Strip mobile scaling
  try {
    _stripForPrint();
  } catch (e) {
    console.warn('printCV: stripForPrint failed', e);
  }

  // Step 2: Wait 300ms then try to print
  // Using setTimeout instead of requestAnimationFrame because:
  // - rAF breaks the "user gesture" chain on some mobile browsers
  // - 300ms gives the browser time to re-render without the transform
  setTimeout(function () {

    // Step 3: Try window.print()
    var printSupported = false;

    try {
      if (typeof window.print === 'function') {
        window.print();
        printSupported = true;
      }
    } catch (e) {
      console.warn('printCV: window.print() threw error', e);
    }

    // Step 4: If print didn't work, show instructions
    if (!printSupported) {
      _showPrintInstructions();
    }

    // Step 5: Restore mobile scaling after a delay
    setTimeout(function () {
      try {
        _restoreAfterPrint();
      } catch (e) {
        // Ultimate fallback: just re-run the scale function
        scaleCVPaper();
      }
    }, 800);

  }, 300);
}


/* ─────────────────────────────────────────────────────────
   4. PRINT INSTRUCTIONS MODAL

   Shows when window.print() is not available (iOS Safari)
   or fails for any reason. Gives step-by-step instructions
   for saving as PDF using the browser's built-in menu.
   ──────────────────────────────────────────────────────── */

function _showPrintInstructions() {
  // Don't create duplicate modals
  if (document.getElementById('cv-print-modal')) return;

  // Detect platform
  var ua = navigator.userAgent || '';
  var isIOS     = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  var isAndroid = /Android/.test(ua);

  var iosSteps = '' +
    '<div style="text-align:left;margin-bottom:16px;">' +
      '<p style="margin:0 0 6px;font-weight:700;color:#1a1d2e;font-size:14px;">📱 iPhone / iPad:</p>' +
      '<ol style="margin:0;padding-left:20px;font-size:13px;color:#555;line-height:1.9;">' +
        '<li>Tap the <strong>Share button</strong> ( <svg style="display:inline;vertical-align:middle" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg> ) at the bottom of Safari</li>' +
        '<li>Scroll down and tap <strong>"Print"</strong></li>' +
        '<li>Pinch outward on the print preview</li>' +
        '<li>Tap the <strong>Share button</strong> again</li>' +
        '<li>Tap <strong>"Save to Files"</strong> or <strong>"Save PDF to iBooks"</strong></li>' +
      '</ol>' +
    '</div>';

  var androidSteps = '' +
    '<div style="text-align:left;margin-bottom:16px;">' +
      '<p style="margin:0 0 6px;font-weight:700;color:#1a1d2e;font-size:14px;">🤖 Android:</p>' +
      '<ol style="margin:0;padding-left:20px;font-size:13px;color:#555;line-height:1.9;">' +
        '<li>Tap the <strong>three dots menu</strong> ( ⋮ ) in Chrome</li>' +