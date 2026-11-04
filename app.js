(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const main = $('#main');
  const EN = main.dataset.lang === 'en';
  const T = (a, b) => (EN ? a : b);
  const PHONE = main.dataset.phone;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Cabeçalho, etiqueta de prévia e menu do celular
  const hd = $('#hd'), tag = $('.preview-tag');
  const onScroll = () => { hd.classList.toggle('solid', scrollY > 30); tag.classList.toggle('away', scrollY > innerHeight * .7); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const burger = $('.burger'), mnav = $('#mnav');
  const setMenu = open => { burger.setAttribute('aria-expanded', open); mnav.hidden = !open; document.body.style.overflow = open ? 'hidden' : ''; };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', mnav).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && !mnav.hidden) setMenu(false); });

  // Orçamento em 3 toques: monta a mensagem e atualiza os links reais (WhatsApp e SMS)
  const params = new URLSearchParams(location.search);
  $$('form.qt').forEach(f => {
    const wa = $('.qt-wa', f), sms = $('.qt-sms', f), hint = $('.qt-hint', f), msg = $('.qt-msg', f);
    const otherBox = $('.city-other', f), only = $$('.only-airbnb', f);
    const baseHint = hint.textContent;
    const picked = n => f.querySelector(`input[name="${n}"]:checked`);
    const val = n => (f.elements[n]?.value || '').trim();
    // pré-seleção pela URL (ex.: ?freq=biweekly)
    const pf = params.get('freq'); if (pf) { const r = f.querySelector(`input[name="freq"][data-id="${pf}"]`); if (r) r.checked = true; }
    const ps = params.get('svc'); if (ps) { const r = f.querySelector(`input[name="svc"][data-id="${ps}"]`); if (r) r.checked = true; }
    const text = () => {
      const s = picked('svc'), fr = picked('freq'), c = picked('city'), z = picked('size');
      const city = c ? (c.value === 'other' ? val('cityOther') : c.value) : '';
      return [
        T('Hi A Touch of Brazil! I’d like a cleaning quote.', 'Olá, A Touch of Brazil! Gostaria de um orçamento de limpeza.'),
        '',
        s ? `${T('Service', 'Serviço')}: ${s.value}` : null,
        fr ? `${T('How often', 'Frequência')}: ${fr.value}` : null,
        city ? `${T('City', 'Cidade')}: ${city}` : null,
        z ? `${T('Size', 'Tamanho')}: ${z.value}` : null,
        val('name') ? `${T('Name', 'Nome')}: ${val('name')}` : null,
        val('notes') ? `${T('Notes', 'Observações')}: ${val('notes')}` : null,
        '',
        T('(Sent from your website)', '(Enviado pelo site)'),
      ].filter(x => x !== null).join('\n');
    };
    const update = () => {
      const s = picked('svc');
      const isAir = s && s.dataset.id === 'airbnb';
      only.forEach(l => { l.hidden = !isAir; if (!isAir) { const i = $('input', l); if (i.checked) i.checked = false; } });
      const c = picked('city');
      otherBox.hidden = !(c && c.value === 'other');
      const t = text();
      wa.href = `https://wa.me/${PHONE}?text=${encodeURIComponent(t)}`;
      sms.href = `sms:+${PHONE}?&body=${encodeURIComponent(t)}`;
      msg.textContent = t;
      f.classList.toggle('ready', !!s);
      hint.classList.remove('err');
      if (!s) hint.textContent = baseHint;
      else if (!picked('freq')) hint.textContent = T('Now, how often?', 'Agora, com que frequência?');
      else if (!c) hint.textContent = T('Last one: where is it?', 'Por último: onde fica?');
      else hint.textContent = T('Ready. Tap WhatsApp or Text and send.', 'Pronto. Toque em WhatsApp ou SMS e envie.');
    };
    f.addEventListener('change', update);
    f.addEventListener('input', update);
    f.addEventListener('submit', e => e.preventDefault());
    [wa, sms].forEach(a => a.addEventListener('click', e => {
      if (picked('svc')) return;
      e.preventDefault();
      hint.textContent = T('Pick a service first (step 1).', 'Escolha um serviço primeiro (passo 1).');
      hint.classList.add('err');
      f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake');
      $('input[name="svc"]', f).focus();
    }));
    update();
  });

  // Cartão de boas-vindas
  $$('.wcard').forEach(b => b.addEventListener('click', () => b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true')));

  // Galeria com filtro
  const flts = $$('.flt');
  if (flts.length) {
    const tiles = $$('.tile'), count = $('.wall-count b');
    flts.forEach(b => b.addEventListener('click', () => {
      const f = b.dataset.f; let n = 0;
      flts.forEach(x => x.setAttribute('aria-pressed', x === b));
      tiles.forEach(t => { const on = f === 'all' || t.dataset.c === f; t.hidden = !on; if (on) n++; });
      count.textContent = n;
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }));
  }

  // Troca de hóspedes no celular: barra de progresso da rolagem lateral
  const track = $('.turn-track'), tbar = $('.turn-progress i');
  const trackBar = () => { if (!track) return; const m = track.scrollWidth - track.clientWidth; tbar.style.transform = `scaleX(${m > 0 ? Math.max(.12, track.scrollLeft / m) : 1})`; };
  if (track) track.addEventListener('scroll', trackBar, { passive: true });

  if (reduce || !window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ lerp: .11 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const el = $(a.getAttribute('href')); if (!el) return;
    e.preventDefault(); lenis.scrollTo(el, { offset: -80 });
  }));

  // Entrada
  if ($('.hero-h')) {
    gsap.from('.hero-h span', { yPercent: 50, opacity: 0, duration: 1.1, stagger: .1, ease: 'expo.out' });
    gsap.from('.eyebrow, .hero-sub, .proof li', { y: 18, opacity: 0, duration: .9, stagger: .06, delay: .3, ease: 'power3.out' });
    gsap.from('.hero-form .qt', { y: 40, opacity: 0, duration: 1.1, delay: .15, ease: 'expo.out' });
  }
  if ($('.phead .h1')) gsap.from('.phead .h1, .phead .lede, .phead .kicker, .hh-quote', { y: 30, opacity: 0, duration: 1, stagger: .08, ease: 'expo.out' });

  // Momento 1: a folha vira leque e recebe o selo
  const fold = $('.fold-svg');
  if (fold) {
    const pl = $$('.pl', fold);
    gsap.set($('.flat', fold), { opacity: 1 });
    gsap.set(pl, { scale: 0, transformOrigin: '300px 236px' });
    gsap.set($('.seal', fold), { scale: 0, transformOrigin: '300px 236px' });
    gsap.set($$('.sparks path', fold), { opacity: 0 });
    gsap.timeline({ scrollTrigger: { trigger: fold, start: 'top 72%', once: true } })
      .to($('.flat', fold), { scaleY: .2, transformOrigin: '300px 236px', opacity: 0, duration: .6, ease: 'power2.in' })
      .to(pl, { scale: 1, duration: .55, stagger: { each: .05, from: 'center' }, ease: 'back.out(1.6)' }, '-=.25')
      .to($('.seal', fold), { scale: 1, duration: .6, ease: 'back.out(2.4)' }, '-=.1')
      .to($$('.sparks path', fold), { opacity: 1, duration: .4, stagger: .1 }, '-=.3');
    gsap.from('.fold-photos img', { y: 50, opacity: 0, duration: 1, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: '.fold-photos', start: 'top 85%', once: true } });
  }

  // Momento 2: a casa fica limpa cômodo por cômodo (fixado na rolagem)
  const rooms = $('.rooms');
  if (rooms && innerHeight >= 600) {
    rooms.classList.add('pinmode');
    const rs = $$('.room', rooms), steps = $$('.rs', rooms), bar = $('.rm-bar i', rooms), cnt = $('.rm-count b', rooms);
    let last = -2;
    const set = idx => {
      if (idx === last) return; last = idx;
      rs.forEach((r, i) => r.classList.toggle('clean', i <= idx));
      steps.forEach((s, i) => s.classList.toggle('on', i === Math.max(0, idx)));
      bar.style.setProperty('--p', (idx + 1) / 4); cnt.textContent = idx + 1;
    };
    set(-1);
    ScrollTrigger.create({ trigger: rooms, start: 'top top', end: () => '+=' + innerHeight * 3, pin: true, onUpdate: s => set(Math.min(3, Math.floor(s.progress * 5) - 1)) });
  }

  // Momento 3: o ritmo do ano se desenha
  $$('.rh-row').forEach((row, k) => {
    const marks = $$('.rh-svg > *', row);
    gsap.from(marks, { scaleY: 0, opacity: 0, transformOrigin: '50% 50%', duration: .5, stagger: { amount: k === 0 ? .9 : .7 }, ease: 'power2.out', scrollTrigger: { trigger: row, start: 'top 85%', once: true } });
  });

  // Troca de hóspedes: rolagem lateral fixada no computador
  const turn = $('.turn');
  if (turn && innerWidth > 900 && innerHeight >= 600) {
    turn.classList.add('pinmode');
    const dist = () => Math.max(0, track.scrollWidth - innerWidth + 40);
    gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: turn, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: .5, invalidateOnRefresh: true, onUpdate: s => { tbar.style.transform = `scaleX(${Math.max(.12, s.progress)})`; } } });
  }

  // Cartão: um giro de apresentação
  $$('.wcard').forEach(c => gsap.from($('.wc-in', c), { rotateY: -70, rotateZ: -10, y: 60, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: c, start: 'top 80%', once: true } }));

  // Entradas gerais
  $$('.sec-head, .sv, .gb, .tile, .area, .fm-ph, .fm-copy, .ccard, .tc, .hp-grid figure').forEach(el => gsap.from(el, { y: 34, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));
  addEventListener('load', () => ScrollTrigger.refresh());
})();
