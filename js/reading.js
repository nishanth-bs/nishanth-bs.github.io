/* ==========================================================================
   Beyond Swift — reading enhancer for post pages (direction B rail).
   Adds: a top progress bar, an active-section highlight in the TOC, and a
   read-% readout. Pure progressive enhancement: if there is no post content
   it does nothing; if there is no TOC the progress bar still works.
   No dependencies. Respects the existing PaperMod TOC markup and DESIGN.md.
   ========================================================================== */
(function () {
  var content = document.querySelector('.post-single .post-content');
  if (!content) return;                       // only on single post pages

  // --- progress bar (always) ---------------------------------------------
  var bar = document.createElement('div');
  bar.id = 'reading-progress';
  bar.setAttribute('aria-hidden', 'true');
  bar.innerHTML = '<i></i>';
  document.body.appendChild(bar);
  var fill = bar.firstChild;

  // --- TOC wiring (only if a TOC exists) ---------------------------------
  var toc = document.querySelector('.post-single .toc');
  var links = [], heads = [], pctEls = [];

  if (toc) {
    links = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'));
    heads = links.map(function (a) {
      var id = decodeURIComponent(a.getAttribute('href').slice(1));
      return document.getElementById(id);
    });

    // read-% readout at the foot of the rail
    var inner = toc.querySelector('.inner') || toc;
    var readout = document.createElement('div');
    readout.className = 'toc-readout';
    readout.innerHTML = '<b>0%</b> read';
    inner.appendChild(readout);
    pctEls.push(readout.firstChild);

    // percent chip in the summary (visible when the drawer is collapsed)
    var summary = toc.querySelector('summary');
    if (summary) {
      var chip = document.createElement('span');
      chip.className = 'toc-sum-pct';
      chip.textContent = '0%';
      summary.appendChild(chip);
      pctEls.push(chip);
    }

    // start the drawer collapsed when it's in drawer mode (it renders open by default)
    if (window.matchMedia('(max-width: 999px)').matches) {
      var details = toc.querySelector('details');
      if (details) details.removeAttribute('open');
    }
  }

  function docTop(el) { return el.getBoundingClientRect().top + window.scrollY; }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      fill.style.width = (pct * 100) + '%';

      var label = Math.round(pct * 100) + '%';
      for (var i = 0; i < pctEls.length; i++) pctEls[i].textContent = label;

      if (heads.length) {
        var line = window.scrollY + 100, idx = 0;
        for (var j = 0; j < heads.length; j++) {
          if (heads[j] && docTop(heads[j]) <= line) idx = j;
        }
        for (var k = 0; k < links.length; k++) {
          links[k].classList.toggle('toc-active', k === idx);
        }
      }
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
})();
