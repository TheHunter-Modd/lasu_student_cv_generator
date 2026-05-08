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

   WHY THE PREVIOUS VERSION BROKE:
   - File was cut off mid-function → syntax error → entire
     JS file fails to load → printCV is never defined
   - beforeprint/afterprint listeners overwrote the saved
     transform state, breaking the restore

   THIS VERSION:
   - No beforeprint/afterprint (they caused double-strip bugs)
   - Desktop: calls window.print() directly (no delay needed)
   - Mobile: strips transform with short delay, then prints
   - If window.print() fails (iOS), shows instruction modal
   - Complete file — no cut-offs
   ──────────────────────────────────────────────────────── */

function printCV() {

  /* ── DESKTOP: Just print directly ── */
  if (window.innerWidth > 768) {
    try {
      window.print();
    } catch (e) {
      console.warn('printCV: window.print() failed on desktop', e);
      _showPrintInstructions();
    }
    return;
  }

  /* ── MOBILE: Strip transform first, then print ── */

  // Save current state
  var paper = document.querySelector('.cv-paper');
  if (!paper) {
    try { window.print(); } catch (e) {}
    return;
  }

  var savedTransform       = paper.style.transform;
  var savedTransformOrigin = paper.style.transformOrigin;
  var savedMarginBottom    = paper.style.marginBottom;
  var savedCVScale         = document.documentElement.style.getPropertyValue('--cv-scale');
  var savedBodyOverflow    = document.body.style.overflow;

  // Close sidebar if open
  var sidebar = document.querySelector('.sidebar');
  var overlay = document.querySelector('.sidebar-overlay');
  var wasSidebarOpen = sidebar ? sidebar.classList.contains('open') : false;
  var wasOverlayOpen = overlay ? overlay.classList.contains('open') : false;
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('open');

  // Strip the mobile scale
  paper.style.transform       = 'none';
  paper.style.transformOrigin = 'top left';
  paper.style.marginBottom    = '0';
  document.documentElement.style.removeProperty('--cv-scale');
  document.body.style.overflow = '';

  // Wait briefly for re-render, then print
  setTimeout(function () {

    var printWorked = false;

    try {
      if (typeof window.print === 'function') {
        window.print();
        printWorked = true;
      }
    } catch (e) {
      console.warn('printCV: window.print() threw error', e);
    }

    // Restore everything
    setTimeout(function () {
      paper.style.transform       = savedTransform;
      paper.style.transformOrigin = savedTransformOrigin;
      paper.style.marginBottom    = savedMarginBottom;

      if (savedCVScale) {
        document.documentElement.style.setProperty('--cv-scale', savedCVScale);
      }

      document.body.style.overflow = savedBodyOverflow;

      if (wasSidebarOpen && sidebar) sidebar.classList.add('open');
      if (wasOverlayOpen && overlay) overlay.classList.add('open');

      // If print didn't work (iOS), show instructions
      if (!printWorked) {
        _showPrintInstructions();
      }
    }, 600);

  }, 150);
}


/* ─────────────────────────────────────────────────────────
   4. PRINT INSTRUCTIONS MODAL

   Shows when window.print() is not available (iOS Safari).
   ──────────────────────────────────────────────────────── */

function _showPrintInstructions() {
  if (document.getElementById('cv-print-modal')) return;

  var ua = navigator.userAgent || '';
  var isIOS     = /iPad|iPhone|iPod/.test(ua);
  var isAndroid = /Android/.test(ua);

  var iosHtml =
    '<div style="text-align:left;margin-bottom:16px;">' +
      '<p style="margin:0 0 6px;font-weight:700;color:#1a1d2e;font-size:14px;">iPhone / iPad:</p>' +
      '<ol style="margin:0;padding-left:20px;font-size:13px;color:#555;line-height:1.9;">' +
        '<li>Tap the <b>Share button</b> at the bottom of Safari</li>' +
        '<li>Scroll down and tap <b>Print</b></li>' +
        '<li>Pinch outward on the print preview</li>' +
        '<li>Tap <b>Share</b> again, then <b>Save to Files</b></li>' +
      '</ol>' +
    '</div>';

  var androidHtml =
    '<div style="text-align:left;margin-bottom:16px;">' +
      '<p style="margin:0 0 6px;font-weight:700;color:#1a1d2e;font-size:14px;">Android:</p>' +
      '<ol style="margin:0;padding-left:20px;font-size:13px;color:#555;line-height:1.9;">' +
        '<li>Tap the <b>three dots menu</b> in Chrome</li>' +
        '<li>Tap <b>Share</b>, then <b>Print</b></li>' +
        '<li>Select <b>Save as PDF</b> from the printer dropdown</li>' +
        '<li>Tap <b>Save</b></li>' +
      '</ol>' +
    '</div>';

  var desktopHtml =
    '<div style="text-align:left;margin-bottom:16px;">' +
      '<p style="margin:0 0 6px;font-weight:700;color:#1a1d2e;font-size:14px;">Desktop:</p>' +
      '<ol style="margin:0;padding-left:20px;font-size:13px;color:#555;line-height:1.9;">' +
        '<li>Press <b>Ctrl + P</b> (Windows) or <b>Cmd + P</b> (Mac)</li>' +
        '<li>Set destination to <b>Save as PDF</b></li>' +
        '<li>Click <b>Save</b></li>' +
      '</ol>' +
    '</div>';

  var stepsHtml = '';
  if (isIOS) {
    stepsHtml = iosHtml;
  } else if (isAndroid) {
    stepsHtml = androidHtml + iosHtml;
  } else {
    stepsHtml = desktopHtml + androidHtml + iosHtml;
  }

  var backdrop = document.createElement('div');
  backdrop.id = 'cv-print-modal';
  backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';

  var box = document.createElement('div');
  box.style.cssText = 'background:#fff;border-radius:16px;padding:28px 24px;max-width:400px;width:100%;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;max-height:85vh;overflow-y:auto;';

  box.innerHTML =
    '<div style="text-align:center;margin-bottom:18px;">' +
      '<div style="font-size:40px;margin-bottom:8px;">📄</div>' +
      '<h3 style="margin:0 0 4px;color:#1a1d2e;font-size:18px;">Save as PDF</h3>' +
      '<p style="margin:0;font-size:13px;color:#888;">Use your browser\'s built-in print menu</p>' +
    '</div>' +
    stepsHtml +
    '<button id="cv-print-modal-close" style="width:100%;padding:14px;background:#3d3f8f;color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;">Got it</button>';

  backdrop.appendChild(box);
  document.body.appendChild(backdrop);

  document.getElementById('cv-print-modal-close').addEventListener('click', function () {
    backdrop.remove();
  });

  backdrop.addEventListener('click', function (e) {
    if (e.target === backdrop) backdrop.remove();
  });
}