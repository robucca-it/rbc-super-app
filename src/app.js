const { useState, useEffect, useRef, useMemo } = React;
const html = htm.bind(React.createElement);
const D = window.RBC_DATA;
const rp = (n) => 'Rp' + Math.round(n).toLocaleString('id-ID');
const img = (k) => D.img[k] || '';
const Icon = ({ n, cls = '' }) => html`<svg class=${'ico ' + cls} viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML=${{ __html: ICONS[n] || '' }}></svg>`;
/* ---------- Pasang di layar utama (sama dengan lib/install.ts PWA Robucca) ---------- */
const isIOS = () => document.documentElement.classList.contains('ios');
const isStandalone = () => document.documentElement.classList.contains('standalone');
let installEvt = null;
const installSubs = new Set();
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; installSubs.forEach((f) => f()); });
addEventListener('appinstalled', () => { installEvt = null; installSubs.forEach((f) => f()); });
function useInstall() {
  const [, tick] = useState(0);
  useEffect(() => { const f = () => tick((n) => n + 1); installSubs.add(f); return () => installSubs.delete(f); }, []);
  return installEvt;
}
const promptInstall = () => { if (!installEvt) return false; installEvt.prompt(); installEvt = null; installSubs.forEach((f) => f()); return true; };
const store = { get: (k) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* noop */ } } };

function InstallTip() {
  const evt = useInstall();
  const [off, setOff] = useState(() => store.get('rbc:install-off') === '1');
  if (off || isStandalone() || (!isIOS() && !evt)) return null;
  const close = () => { store.set('rbc:install-off', '1'); setOff(true); };
  return html`<div class="card ios-tip">
    <img src="assets/apple-touch-icon.png" alt="" onError=${(e) => { e.target.src = D.logo['rbc-mark-dark']; }}/>
    <span class="grow"><b>Pasang RBC Group di ${isIOS() ? 'iPhone' : 'HP'}</b>
      ${isIOS() ? html`<small>Ketuk <${Icon} n="share" /> lalu <b style=${{ display: 'inline', fontSize: '12px' }}>Tambah ke Layar Utama</b></small>`
        : html`<small>Buka seperti aplikasi, tanpa install dari Play Store</small>`}</span>
    ${!isIOS() && html`<button class="btn sm" onClick=${() => promptInstall()}>Pasang</button>`}
    <button class="icon-btn" onClick=${close} aria-label="Tutup"><${Icon} n="x" cls="sm" /></button></div>`;
}

const Pic = ({ src, style }) => html`<div class="im loaded" style=${style}><img class="ok" src=${src} alt="" loading="lazy"/></div>`;

/* ---------- Data tiga brand ----------
   Menu & foto asli (buku menu Robucca, migrasi menu Kalm & Zumma). Jarak, promo, poin, ongkir dan riwayat = contoh. */
const BRANDS = [
  { id: 'robucca', name: 'Robucca', b: '#01512C', on: '#FAEEDA', f: '"Londrina Solid", sans-serif', hero: 'hero-spread', pics: [], menu: D.menus.robucca },
  { id: 'kalm', name: 'Kalm', b: '#52230F', on: '#F4EEE3', f: '"Radio Canada Big", sans-serif', pics: ['kalm-the-big-breakfast-platter', 'kalm-coffee-latte-ice', 'kalm-pad-thai'], menu: D.menus.kalm },
  { id: 'zumma', name: 'Zumma', b: '#862F26', on: '#F5EBD9', f: '"Jost", sans-serif', pics: ['zumma-breakfast-platter', 'zumma-honeycomb-latte', 'zumma-aglio-olio-shrimp-salted-egg'], menu: D.menus.zumma },
];
const OUTLETS = [
  { id: 'rb-ijen', brand: 'robucca', name: 'Ijen Nirwana', city: 'Malang', km: 1.2, addr: 'Ijen Nirwana Residence Blok D No.1A' },
  { id: 'rb-suhat', brand: 'robucca', name: 'Suhat', city: 'Malang', km: 3.4 },
  { id: 'rb-kediri', brand: 'robucca', name: 'Kediri', city: 'Kediri', km: 98 },
  { id: 'rb-tagung', brand: 'robucca', name: 'T.Agung', city: 'Tulungagung', km: 112 },
  { id: 'kl-malang', brand: 'kalm', name: 'Malang', city: 'Malang', km: 2.1 },
  { id: 'kl-ciliwung', brand: 'kalm', name: 'Ciliwung', city: 'Surabaya', km: 88 },
  { id: 'kl-rivago', brand: 'kalm', name: 'Rivago', city: 'Surabaya', km: 91 },
  { id: 'zm-malang', brand: 'zumma', name: 'Malang', city: 'Malang', km: 2.7 },
  { id: 'zm-biliton', brand: 'zumma', name: 'Biliton', city: 'Surabaya', km: 89 },
];
const VOUCHERS = [
  { id: 'BARENGAN', title: 'Pesan 2 brand, hemat Rp8.000', note: 'Keranjang berisi 2 brand atau lebih', ok: (c) => c.brands.length >= 2, disc: () => 8000 },
  { id: 'HEMAT10', title: 'Diskon 10%, maks. Rp15.000', note: 'Semua brand · min. Rp50.000', ok: (c) => c.sub >= 50000, disc: (c) => Math.min(15000, c.sub * 0.1) },
];
const PAYS = [
  { id: 'va_bri', name: 'BRI Virtual Account', c: '#00529C', t: 'BRI', s: 'Transfer dari m-banking / ATM' },
  { id: 'va_bni', name: 'BNI Virtual Account', c: '#F15A23', t: 'BNI', s: 'Transfer dari m-banking / ATM' },
  { id: 'va_mandiri', name: 'Mandiri Virtual Account', c: '#003D79', t: 'MDR', s: 'Transfer dari m-banking / ATM' },
  { id: 'qris', name: 'QRIS', c: '#1c1b19', t: 'QRIS', s: 'Menunggu aktivasi DOKU', off: true },
];
const SHIP = 12000;      // contoh ongkir per outlet
const POINT_VALUE = 10;  // contoh: 1 poin = Rp10
const brandOf = (id) => BRANDS.find((b) => b.id === id);
const outletOf = (id) => OUTLETS.find((o) => o.id === id);
const oName = (o) => `${brandOf(o.brand).name} ${o.name}`;
const logo = (b) => D.logo[`${b}-light`];
const allItems = (b) => brandOf(b).menu.cats.flatMap((c) => c.items);
const findItem = (b, id) => allItems(b).find((i) => i.id === id);
const defSel = (it) => it.opts.map((o) => (o.ch.length ? 0 : -1));
const unit = (it, sel) => it.price + it.opts.reduce((a, o, gi) => a + (sel[gi] >= 0 ? o.ch[sel[gi]].p : 0), 0);
const selLabel = (it, sel) => it.opts.map((o, gi) => (sel[gi] >= 0 ? o.ch[sel[gi]].n : null)).filter(Boolean).join(' · ');
const km = (k) => (k < 10 ? k.toFixed(1).replace('.', ',') : Math.round(k)) + ' km';
const BLogo = ({ b, style }) => html`<span class="blogo" style=${{ '--b': brandOf(b).b, ...style }}><img src=${logo(b)} alt=${brandOf(b).name}/></span>`;
const groupBy = (lines) => { const m = new Map(); lines.forEach((l) => { if (!m.has(l.outlet)) m.set(l.outlet, []); m.get(l.outlet).push(l); });
  return [...m].map(([outlet, ls]) => ({ outlet, lines: ls, sub: ls.reduce((a, l) => a + l.unit * l.qty, 0) })); };
const mkLine = (outlet, id, qty = 1) => { const o = outletOf(outlet); const it = findItem(o.brand, id); const sel = defSel(it);
  return { key: outlet + '|' + id + '|' + sel.join(','), outlet, brand: o.brand, item: it, sel, note: '', qty, unit: unit(it, sel) }; };
const greeting = () => { const h = new Date().getHours(); return h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18 ? 'Selamat sore' : 'Selamat malam'; };
const CAT_IMG = (c) => c.items[0] && c.items[0].img;

/* ======================================================================= */
const TABS = [['home', 'beranda', 'home', 'Beranda'], ['menu', 'menu', 'coffee', 'Menu'], ['rsv', 'reservasi', 'calendar', 'Reservasi'], ['orders', 'pesanan', 'receipt', 'Pesanan'], ['account', 'akun', 'user', 'Akun']];
const tabFromHash = () => (TABS.find((t) => '#' + t[1] === location.hash) || TABS[0])[0];

function App() {
  const [tab, setTab] = useState(tabFromHash);
  const [sub, setSub] = useState(null);           // checkout | status | ticket
  const [sheet, setSheet] = useState(null);
  const [brand, setBrand] = useState('robucca');
  const [picked, setPicked] = useState({ robucca: 'rb-ijen', kalm: 'kl-malang', zumma: 'zm-malang' });
  const [mode, setModeS] = useState('pickup');
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState(() => [
    { id: 'RBC-2041', when: 'Sel, 27 Okt · 12.10', mode: 'delivery', status: 'Selesai', lines: [mkLine('kl-malang', 'kalm-coffee-latte-ice'), mkLine('zm-malang', 'zumma-breakfast-platter')] },
    { id: 'RBC-2033', when: 'Sab, 24 Okt · 09.02', mode: 'pickup', status: 'Selesai', lines: [mkLine('rb-ijen', 'kopi-susu-essentials', 2), mkLine('rb-ijen', 'chicken-katsudon')] },
  ]);
  const [rsvs, setRsvs] = useState([]);
  const [points, setPoints] = useState(1240);
  const [toastS, setToastS] = useState({ on: false, msg: '' });
  const [busy, setBusy] = useState('');

  const toast = (msg) => { setToastS({ on: true, msg }); clearTimeout(toast.t); toast.t = setTimeout(() => setToastS((t) => ({ ...t, on: false })), 2000); };
  const go = (t) => { setSub(null); setSheet(null); setTab(t); const h = TABS.find((x) => x[0] === t)[1]; if (location.hash !== '#' + h) history.replaceState(null, '', '#' + h); scrollTo(0, 0); };
  const openSub = (s) => { setSheet(null); setSub(s); scrollTo(0, 0); };
  const pickBrand = (b) => { if (b !== brand) setBrand(b); };

  useEffect(() => { const f = () => { setSub(null); setTab(tabFromHash()); }; addEventListener('hashchange', f); return () => removeEventListener('hashchange', f); }, []);
  useEffect(() => { document.documentElement.dataset.brand = brand; const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#FAEEDA'; }, [brand]);
  const showCart = cart.length > 0 && !sub && (tab === 'home' || tab === 'menu');
  useEffect(() => { document.body.classList.toggle('sub', !!sub); document.body.classList.toggle('has-cart', showCart); }, [sub, showCart]);
  useEffect(() => { document.documentElement.classList.toggle('lock', !!sheet); }, [sheet]);
  // Menu bawah: sembunyi saat scroll ke bawah, muncul saat scroll ke atas atau dekat puncak halaman.
  useEffect(() => {
    const root = document.documentElement;
    let last = scrollY;
    const f = () => {
      const y = scrollY, d = y - last;
      if (Math.abs(d) < 8) return;
      root.classList.toggle('nav-off', d > 0 && y > 80);
      last = y;
    };
    addEventListener('scroll', f, { passive: true });
    return () => removeEventListener('scroll', f);
  }, []);
  useEffect(() => { document.documentElement.classList.remove('nav-off'); }, [tab, sub]);

  // Satu keranjang untuk tiga brand. Tiap baris ingat outletnya; saat checkout dipecah per outlet.
  const add = (outletId, item, sel, qty, note = '') => {
    const o = outletOf(outletId);
    const key = outletId + '|' + item.id + '|' + sel.join(',') + '|' + note;
    setCart((c) => {
      // Ganti cabang brand yang sama: baris lama brand itu ikut pindah ke cabang baru.
      const moved = c.map((l) => (l.brand === o.brand && l.outlet !== outletId ? { ...l, outlet: outletId, key: l.key.replace(l.outlet, outletId) } : l));
      const i = moved.findIndex((l) => l.key === key);
      return i >= 0 ? moved.map((l, j) => (j === i ? { ...l, qty: l.qty + qty } : l)) : [...moved, { key, outlet: outletId, brand: o.brand, item, sel, note, qty, unit: unit(item, sel) }];
    });
    setSheet(null);
    toast(`${item.name} masuk keranjang`);
  };
  const dec = (outletId, id) => setCart((c) => { const i = c.map((l) => l.outlet === outletId && l.item.id === id).lastIndexOf(true); return i < 0 ? c : c.map((l, j) => (j === i ? { ...l, qty: l.qty - 1 } : l)).filter((l) => l.qty > 0); });
  const setQty = (key, d) => setCart((c) => c.map((l) => (l.key === key ? { ...l, qty: l.qty + d } : l)).filter((l) => l.qty > 0));
  const pickOutlet = (b, id) => { setPicked((p) => ({ ...p, [b]: id })); setCart((c) => c.map((l) => (l.brand === b ? { ...l, outlet: id, key: l.key.replace(l.outlet, id) } : l))); setSheet(null); toast(`Cabang: ${oName(outletOf(id))}`); };

  const ctx = { tab, go, sub, openSub, sheet, setSheet, brand, pickBrand, picked, pickOutlet, mode, setMode: setModeS, cart, setCart, add, dec, setQty, orders, setOrders, rsvs, setRsvs, points, setPoints, toast, setBusy };

  api.go = (k) => {
    setSheet(null);
    if (k === 'home') { setBrand('robucca'); go('home'); }
    if (k === 'kalm') { setBrand('kalm'); go('home'); }
    if (k === 'menu') { setBrand('zumma'); go('menu'); }
    if (k === 'barengan') { setCart([mkLine('rb-ijen', 'kopi-susu-essentials', 2), mkLine('kl-malang', 'kalm-the-big-breakfast-platter')]); setBrand('zumma'); go('menu'); }
    if (k === 'checkout') { setCart([mkLine('rb-ijen', 'kopi-susu-essentials', 2), mkLine('kl-malang', 'kalm-the-big-breakfast-platter'), mkLine('zm-malang', 'zumma-honeycomb-latte')]); setSub(null); setTab('home'); openSub({ type: 'checkout' }); }
    if (k === 'search') { setTab('menu'); setSub(null); setSheet({ type: 'search' }); }
    if (k === 'rsv') { setBrand('kalm'); go('rsv'); }
    if (k === 'orders') go('orders');
    if (k === 'account') go('account');
  };

  return html`<div id="app" class="app">
    <main id="view" class="view">
      ${!sub && tab === 'home' && html`<${Home} ...${ctx} />`}
      ${!sub && tab === 'menu' && html`<${MenuScreen} ...${ctx} />`}
      ${!sub && tab === 'rsv' && html`<${Reservasi} ...${ctx} />`}
      ${!sub && tab === 'orders' && html`<${Pesanan} ...${ctx} />`}
      ${!sub && tab === 'account' && html`<${Akun} ...${ctx} />`}
      ${sub && sub.type === 'checkout' && html`<${Checkout} ...${ctx} />`}
      ${sub && sub.type === 'status' && html`<${Status} ...${ctx} order=${sub.order} />`}
      ${sub && sub.type === 'ticket' && html`<${Ticket} ...${ctx} r=${sub.r} />`}
    </main>
    ${showCart && html`<${CartBar} cart=${cart} mode=${mode} onClick=${() => openSub({ type: 'checkout' })} />`}
    <nav class="tabbar" aria-label="Navigasi utama">
      ${TABS.map(([t, h, ic, label]) => html`<a key=${t} href=${'#' + h} class=${tab === t && !sub ? 'on' : undefined} aria-current=${tab === t && !sub ? 'page' : undefined} onClick=${(e) => { e.preventDefault(); go(t); }}>
        <span class="ti"><${Icon} n=${ic} /></span><span>${label}</span>${t === 'orders' && html`<i class="tab-dot" hidden=${!orders.some((o) => o.live)}></i>`}</a>`)}
    </nav>
    <${SheetHost} ...${ctx} />
    <div id="toast" class=${'toast ' + (toastS.on ? 'in' : '')} role="status" aria-live="polite">${toastS.msg && html`<${Icon} n="check" cls="sm" /><span>${toastS.msg}</span>`}</div>
    ${busy && html`<div class="processing"><div class="pc"><div class="spinner"></div><p>${busy}</p></div></div>`}
  </div>
  <${Desk} />`;
}
const api = {};

function CartBar({ cart, mode, onClick }) {
  const n = cart.reduce((a, l) => a + l.qty, 0);
  const total = cart.reduce((a, l) => a + l.qty * l.unit, 0);
  const brands = [...new Set(cart.map((l) => l.brand))];
  return html`<a href="#" class="cartbar" onClick=${(e) => { e.preventDefault(); onClick(); }} aria-label=${`Buka keranjang, ${n} item, ${rp(total)}`}>
    <span class="cb-ico"><${Icon} n="bag" /><span class="cb-count">${n}</span></span>
    <span class="cb-text"><b>${rp(total)}</b><span>${mode === 'delivery' ? 'Delivery' : 'Pick Up'} · ${n} item${brands.length > 1 ? ` · ${brands.map((b) => brandOf(b).name).join(' + ')}` : ''}</span></span>
    <span class="cb-go">Keranjang <${Icon} n="chevron-right" cls="xs" /></span></a>`;
}

/* ---------- Beranda ---------- */
function Home(c) {
  const { brand, pickBrand, picked, setSheet, mode, setMode, go, orders, openSub, rsvs, cart, add, dec } = c;
  const B = brandOf(brand);
  const o = outletOf(picked[brand]);
  const sigs = allItems(brand).filter((i) => i.sig).slice(0, 8);
  const cats = B.menu.cats.slice(0, 8);
  const live = orders.find((x) => x.live);
  const nextR = rsvs[0];
  const others = BRANDS.filter((x) => x.id !== brand);
  const start = (m) => { setMode(m); go('menu'); };
  return html`<div class="screen" key=${brand}>
    <div class="home-top">
      <div class="home-bar"><img class="logo" src=${D.logo['rbc-dark']} alt="RBC Group" style=${{ height: '30px' }}/>
        <button class="icon-btn" onClick=${() => setSheet({ type: 'search' })} aria-label="Cari menu di semua brand"><${Icon} n="search" /></button></div>
      <div class="greet"><small>${greeting()}, Dinda</small><h1>Mau makan atau ngopi apa hari ini?</h1></div>
      <div class="brands" role="group" aria-label="Pilih brand">
        ${BRANDS.map((x) => { const xo = outletOf(picked[x.id]); return html`<button key=${x.id} class="brand-btn" aria-pressed=${brand === x.id} onClick=${() => pickBrand(x.id)}>
          <${BLogo} b=${x.id} /><b>${x.name}<small>${km(xo.km)}</small></b></button>`; })}
      </div>
      <button class=${'store-card' + (B.hero ? '' : ' collage')} onClick=${() => setSheet({ type: 'outlet', brand })} aria-label=${'Ganti cabang ' + B.name} style=${{ display: 'block', width: '100%', textAlign: 'left' }}>
        ${B.hero ? html`<${Pic} src=${img(B.hero)} />` : html`<span class="col3">${B.pics.map((p) => html`<img key=${p} src=${img(p)} alt=""/>`)}</span>`}
        <span class="sc-tag"><span class="tag olive"><i class="dot"></i>Buka · tutup 21.00</span></span>
        <span class="sc-go"><${Icon} n="store" cls="sm" /></span>
        <span class="sc-in"><b class="sc-t">${oName(o)}</b><span class="sc-a"><${Icon} n="map-pin" cls="xs" /> ${o.addr || o.city} · ${km(o.km)} · ganti cabang</span></span>
      </button>
      <div class="modes">
        <button class="mode" onClick=${() => start('pickup')}><span class="mi"><${Icon} n="bag" /></span><span><b>Pick Up</b><small>Pesan & ambil tanpa antre</small></span></button>
        <button class="mode" onClick=${() => start('delivery')}><span class="mi"><${Icon} n="scooter" /></span><span><b>Delivery</b><small>Satu kurir per cabang</small></span></button>
        <button class="mode" onClick=${() => go('rsv')}><span class="mi"><${Icon} n="calendar" /></span><span><b>Reservasi</b><small>Booking meja</small></span></button>
      </div>
    </div>

    <${InstallTip} />

    ${live && html`<a class="live" href="#" onClick=${(e) => { e.preventDefault(); openSub({ type: 'status', order: live }); }}>
      <span class="lv-ico pulse"><${Icon} n="coffee" /></span><span class="grow"><b>Pesanan sedang disiapkan</b><small>${live.id} · ${groupBy(live.lines).length} cabang</small></span><${Icon} n="chevron-right" cls="sm" /></a>`}
    ${nextR && html`<a class="live" href="#" onClick=${(e) => { e.preventDefault(); openSub({ type: 'ticket', r: nextR }); }}>
      <span class="lv-ico" style=${{ background: 'var(--sand)', color: 'var(--ink)' }}><${Icon} n="calendar" /></span><span class="grow"><b>Reservasi ${nextR.day}, ${nextR.time}</b><small>${nextR.guests} orang · ${oName(outletOf(nextR.outlet))}</small></span><${Icon} n="chevron-right" cls="sm" /></a>`}

    <div class="sec-h"><h2>What's new</h2></div>
    <${Carousel} pickBrand=${pickBrand} go=${go} />

    ${sigs.length > 0 && html`<div class="sec-h"><h2>Signature ${B.name}</h2><a class="link" href="#menu" onClick=${(e) => { e.preventDefault(); go('menu'); }}>Lihat menu <${Icon} n="chevron-right" cls="xs" /></a></div>
      <div class="hscroll sig-list">${sigs.map((p) => html`<${SigCard} key=${p.id} p=${p} ...${c} outletId=${o.id} />`)}</div>`}

    <div class="sec-h"><h2>Kategori</h2><a class="link" href="#menu" onClick=${(e) => { e.preventDefault(); go('menu'); }}>Semua menu <${Icon} n="chevron-right" cls="xs" /></a></div>
    <div class="cats">${cats.map((ct) => html`<a key=${ct.name} class="cat" href="#menu" onClick=${(e) => { e.preventDefault(); api.jumpCat = ct.name; go('menu'); }}><${Pic} src=${img(CAT_IMG(ct))} /><span>${ct.name}</span></a>`)}</div>

    <div class="sec-h"><h2>Pesan barengan</h2></div>
    <p class="also-note"><${Icon} n="bag" cls="sm" />Menu ${others.map((x) => x.name).join(' dan ')} bisa masuk keranjang yang sama, satu kali bayar.</p>
    <div class="also">${others.map((x) => { const xo = outletOf(picked[x.id]); const th = allItems(x.id).filter((i) => i.sig).concat(allItems(x.id)).slice(0, 4);
      return html`<button key=${x.id} class="card also-c" onClick=${() => { pickBrand(x.id); go('menu'); }}>
        <${BLogo} b=${x.id} /><span><b>${x.name}</b><small>${oName(xo)} · ${km(xo.km)} · buka</small>
        <span class="thumbs">${th.map((i) => html`<${Pic} key=${i.id} src=${img(i.img)} />`)}</span></span></button>`; })}</div>

    <section class="rbc-band"><img class="logo" src=${D.logo['rbc-light']} alt="RBC Group"/>
      <h2>Satu akun, poin dari tiga brand</h2><p>Setiap belanja di Robucca, Kalm atau Zumma, lewat aplikasi atau kasir, masuk ke RBC Poin yang sama.</p>
      <div class="pts-row"><span><b>${c.points.toLocaleString('id-ID')}</b>poin kamu</span><span><b>1 poin</b>tiap Rp1.000 <i class="sample" style=${{ background: 'rgba(239,232,223,.12)', color: 'inherit' }}>contoh</i></span></div>
      <a class="btn block" href="#akun" onClick=${(e) => { e.preventDefault(); go('account'); }}><${Icon} n="qr" cls="sm" /> Kode member untuk kasir</a></section>
    <div class="foot"><img src=${D.logo['rbc-dark']} alt="RBC Group"/>Robucca · Kalm · Zumma</div>
  </div>`;
}

function Carousel({ pickBrand, go }) {
  const ref = useRef(null);
  const [i, setI] = useState(0);
  const slides = [
    { brand: 'robucca', made: true, pic: 'kopi-susu-essentials', t: 'Kopi susu andalan', s: 'Kopi Susu Essentials Rp24.000', label: 'Lihat menu Robucca' },
    { brand: 'kalm', made: true, pic: 'kalm-the-big-breakfast-platter', t: 'Brunch seharian', s: 'Big Breakfast Platter Rp42.000', label: 'Lihat menu Kalm' },
    { brand: 'zumma', made: true, pic: 'zumma-honeycomb-latte', t: 'Menu baru Zumma', s: 'Honeycomb Latte Rp31.000', label: 'Lihat menu Zumma' },
    { brand: 'robucca', made: true, pic: 'shoyu-ramen', t: 'Ramen hangat', s: 'Shoyu Ramen Rp35.000', label: 'Lihat ramen' },
  ];
  useEffect(() => { const el = ref.current; const f = () => setI(Math.round(el.scrollLeft / (el.firstChild.offsetWidth + 12))); el.addEventListener('scroll', f, { passive: true }); return () => el.removeEventListener('scroll', f); }, []);
  return html`<div class="hscroll carousel" ref=${ref}>${slides.map((s, k) => { const B = brandOf(s.brand);
      return html`<button key=${k} class=${'slide' + (s.made ? ' made' : '')} style=${{ '--b': B.b, '--on': B.on, '--f': B.f }} aria-label=${s.label} onClick=${() => { pickBrand(s.brand); go('menu'); }}>
        ${s.made ? html`<span class="mk"><span class="mk-t"><img src=${logo(s.brand)} alt=${B.name}/><span><b>${s.t}</b><br/><small>${s.s}</small></span></span><span class="mk-p"><img src=${img(s.pic)} alt=""/></span></span>`
          : html`<${Pic} src=${img(s.img)} /><span class="bchip"><${BLogo} b=${s.brand} />${B.name}</span>`}
        <span class="go">${s.label} <${Icon} n="arrow-right" cls="xs" /></span></button>`; })}</div>
    <div class="dots">${slides.map((s, k) => html`<i key=${k} class=${k === i ? 'on' : undefined}></i>`)}</div>`;
}

const qtyOf = (cart, outletId, id) => cart.filter((l) => l.outlet === outletId && l.item.id === id).reduce((a, l) => a + l.qty, 0);
function AddCtl({ p, outletId, cart, add, dec, setSheet, light, brand }) {
  const n = qtyOf(cart, outletId, p.id);
  const stop = (e) => e.stopPropagation();
  if (!p.opts.length && n > 0) return html`<span class="qty" onClick=${stop}>
    <button aria-label="Kurangi" onClick=${() => dec(outletId, p.id)}><${Icon} n="minus" cls="sm" /></button><b>${n}</b>
    <button aria-label="Tambah" onClick=${() => add(outletId, p, [], 1)}><${Icon} n="plus" cls="sm" /></button></span>`;
  return html`<button class=${'add ' + (light ? 'light' : '')} aria-label=${'Tambah ' + p.name} onClick=${(e) => { e.stopPropagation(); p.opts.length ? setSheet({ type: 'item', item: p, outletId, brand }) : add(outletId, p, [], 1); }}>
    ${n ? html`<span class="n">${n}</span>` : html`<${Icon} n="plus" cls="sm" />`}</button>`;
}
function SigCard(c) {
  const { p, outletId, setSheet, brand } = c;
  return html`<div class="sig" role="button" tabindex="0" onClick=${() => setSheet({ type: 'item', item: p, outletId, brand })}>
    <${Pic} src=${img(p.img)} /><span class="tag dark star">★ Signature</span><b>${p.name}</b><span>${rp(p.price)}</span><${AddCtl} ...${c} light />
  </div>`;
}
function ItemRow(c) {
  const { p, outletId, setSheet, brand } = c;
  return html`<div class="item" role="button" tabindex="0" onClick=${() => setSheet({ type: 'item', item: p, outletId, brand })}>
    <${Pic} src=${img(p.img)} /><div class="it-b"><h3>${p.name}${p.sig && html` <span class="star" aria-label="Signature">★</span>`}</h3>
      ${p.desc ? html`<p>${p.desc}</p>` : p.opts.length ? html`<p>${p.opts.map((o) => o.name).join(' · ')}</p>` : null}
      <div class="it-f"><span class="pr">${rp(p.price)}</span><${AddCtl} ...${c} /></div></div></div>`;
}

/* ---------- Menu ---------- */
function MenuScreen(c) {
  const { brand, pickBrand, picked, setSheet, mode, setMode } = c;
  const B = brandOf(brand);
  const o = outletOf(picked[brand]);
  const head = useRef(null), chips = useRef(null), body = useRef(null);
  const [active, setActive] = useState(B.menu.cats[0].name);
  useEffect(() => {
    let lock = 0;
    const spy = () => {
      head.current && head.current.classList.toggle('shadow', scrollY > 4);
      if (Date.now() < lock || !body.current) return;
      const line = head.current.offsetHeight + 24; let cur = B.menu.cats[0].name;
      body.current.querySelectorAll('.cat-sec').forEach((s) => { if (s.getBoundingClientRect().top <= line) cur = s.dataset.cat; });
      setActive(cur);
    };
    api.scrollCat = (name, smooth = true) => { const s = body.current && body.current.querySelector(`[data-cat="${CSS.escape(name)}"]`); if (!s) return;
      lock = Date.now() + (smooth ? 900 : 100); setActive(name);
      scrollTo({ top: s.getBoundingClientRect().top + scrollY - head.current.offsetHeight - 4, behavior: smooth ? 'smooth' : 'auto' }); };
    addEventListener('scroll', spy, { passive: true });
    if (api.jumpCat) { const j = api.jumpCat; api.jumpCat = null; requestAnimationFrame(() => api.scrollCat(j, false)); } else scrollTo(0, 0);
    return () => removeEventListener('scroll', spy);
  }, [brand]);
  useEffect(() => { const on = chips.current && chips.current.querySelector('.chip.on'); if (on) chips.current.scrollTo({ left: on.offsetLeft - 16, behavior: 'smooth' }); }, [active]);
  return html`<div class="screen" key=${brand}>
    <div class="menu-head" ref=${head}>
      <div class="mh-row">
        <div class="seg" data-v=${mode} role="tablist" aria-label="Tipe pesanan">
          <button role="tab" aria-selected=${mode === 'pickup'} class=${mode === 'pickup' ? 'on' : undefined} onClick=${() => setMode('pickup')}><${Icon} n="bag" cls="sm" /> Pick Up</button>
          <button role="tab" aria-selected=${mode === 'delivery'} class=${mode === 'delivery' ? 'on' : undefined} onClick=${() => setMode('delivery')}><${Icon} n="scooter" cls="sm" /> Delivery</button></div>
        <button class="icon-btn" onClick=${() => setSheet({ type: 'search' })} aria-label="Cari menu di semua brand"><${Icon} n="search" /></button>
      </div>
      <div class="bseg" role="group" aria-label="Brand">${BRANDS.map((x) => html`<button key=${x.id} aria-pressed=${brand === x.id} onClick=${() => pickBrand(x.id)}><${BLogo} b=${x.id} />${x.name}</button>`)}</div>
      <div class="ctx"><${Icon} n=${mode === 'delivery' ? 'scooter' : 'bag'} cls="xs" />
        <span>${mode === 'delivery' ? html`Diantar dari <b>${oName(o)}</b> · ${km(o.km)}` : html`Ambil di <b>${oName(o)}</b>, tanpa antre`}</span>
        <button class="edit" onClick=${() => setSheet({ type: 'outlet', brand })}>Ganti <${Icon} n="chevron-right" cls="xs" /></button></div>
      <div class="hscroll cat-chips" ref=${chips}>${B.menu.cats.map((ct) => html`<button key=${ct.name} class=${'chip sm ' + (active === ct.name ? 'on' : '')} onClick=${() => api.scrollCat(ct.name)}>${ct.sig ? '★ ' : ''}${ct.name}</button>`)}</div>
    </div>
    <div class="menu-body" ref=${body}>
      ${B.menu.cats.map((ct) => html`<section key=${ct.name} class="cat-sec" data-cat=${ct.name}><h2>${ct.name}${ct.sig && html` <span class="tag dark">★ Signature</span>`}</h2>
        ${ct.items.map((p) => html`<${ItemRow} key=${p.id} p=${p} ...${c} outletId=${o.id} />`)}</section>`)}
      <p class="faint" style=${{ fontSize: '12px', textAlign: 'center', margin: '26px 0 0' }}>Menu & harga ${B.name} dari buku menu 2026.</p>
    </div>
  </div>`;
}

/* ---------- Lembar bawah ---------- */
function SheetHost(c) {
  const { sheet, setSheet } = c;
  const [on, setOn] = useState(false);
  const [cur, setCur] = useState(null);
  useEffect(() => {
    if (sheet) { setCur(sheet); requestAnimationFrame(() => requestAnimationFrame(() => setOn(true))); }
    else if (cur) { setOn(false); const t = setTimeout(() => setCur(null), 380); return () => clearTimeout(t); }
  }, [sheet]);
  useEffect(() => { const f = (e) => e.key === 'Escape' && setSheet(null); addEventListener('keydown', f); return () => removeEventListener('keydown', f); }, []);
  if (!cur) return null;
  const full = cur.type === 'search';
  return html`<div class=${'backdrop ' + (on ? 'in' : '')} onClick=${() => setSheet(null)}></div>
    <div class=${'sheet ' + (full ? 'full ' : '') + (on ? 'in' : '')} role="dialog" aria-modal="true" data-brand=${cur.brand || undefined}>
      <div class=${'sheet-handle ' + (cur.type === 'item' ? 'on-img' : '')}></div>
      ${cur.type === 'item' && html`<${ItemSheet} key=${cur.item.id} ...${c} s=${cur} />`}
      ${cur.type === 'outlet' && html`<${OutletSheet} ...${c} s=${cur} />`}
      ${cur.type === 'search' && html`<${SearchSheet} ...${c} />`}
      ${cur.type === 'pay' && html`<${PaySheet} ...${c} s=${cur} />`}
      ${cur.type === 'voucher' && html`<${VoucherSheet} ...${c} s=${cur} />`}
    </div>`;
}

function ItemSheet({ s, add, setSheet }) {
  const p = s.item; const o = outletOf(s.outletId);
  const [sel, setSel] = useState(defSel(p));
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');
  const swap = p.opts.flatMap((g, gi) => (sel[gi] >= 0 && g.ch[sel[gi]].img ? [g.ch[sel[gi]].img] : []))[0];
  const chips = /drink|coffee|latte|tea|matcha|kombucha|non-coffee|signature/i.test(p.name + ' ' + (p.opts[0] && p.opts[0].name || '')) ? ['Pisah es', 'Less ice', 'Tanpa sedotan'] : ['Tidak pedas', 'Saus dipisah', 'Tanpa sayur'];
  return html`<div class="sheet-body">
      <button class="sheet-x" onClick=${() => setSheet(null)} aria-label="Tutup"><${Icon} n="x" cls="sm" /></button>
      <${Pic} src=${img(swap || p.img)} style=${{ width: '100%', aspectRatio: '1 / .86', maxHeight: '46vh' }} />
      <div class="pd-head">
        <div class="tags"><span class="tag" style=${{ paddingLeft: '3px' }}><${BLogo} b=${o.brand} style=${{ width: '34px', height: '16px', borderRadius: '99px' }} />${oName(o)}</span>${p.sig && html`<span class="tag dark">★ Signature</span>`}</div>
        <h2>${p.name}</h2><div class="pr">${rp(unit(p, sel))}</div>${p.desc && html`<p>${p.desc}</p>`}
      </div>
      ${p.opts.map((g, gi) => html`<div class="og" key=${g.name}><div class="og-h"><b>${g.name}</b><span class=${'tag ' + (g.req ? 'olive' : '')}>${g.req ? 'Wajib' : 'Pilih 1'}</span></div>
        ${g.ch.map((ch, ci) => html`<button key=${ch.n} class=${'opt ' + (sel[gi] === ci ? 'on' : '')} role="radio" aria-checked=${sel[gi] === ci} onClick=${() => setSel((x) => x.map((v, j) => (j === gi ? ci : v)))}>
          <span class="mark"><${Icon} n="check" /></span><span class="lbl">${ch.n}</span>${ch.p ? html`<span class="op">+${rp(ch.p)}</span>` : null}</button>`)}</div>`)}
      <div class="notes bg-in"><b>Catatan <span class="faint" style=${{ fontWeight: 400 }}>(opsional)</span></b>
        <textarea id="item-note" class="textarea" maxlength="120" placeholder=${'Contoh: ' + chips[0].toLowerCase()} value=${note} onInput=${(e) => setNote(e.target.value)}></textarea>
        <div class="hscroll">${chips.map((n) => html`<button key=${n} class=${'chip sm ' + (note.includes(n) ? 'on' : '')} onClick=${() => setNote((x) => (x.includes(n) ? x : (x ? x + ', ' : '') + n))}>${n}</button>`)}</div></div>
    </div>
    <div class="sheet-foot"><div class="qty lg"><button aria-label="Kurangi" onClick=${() => setQty((q) => Math.max(1, q - 1))}><${Icon} n="minus" cls="sm" /></button><b>${qty}</b><button aria-label="Tambah" onClick=${() => setQty((q) => q + 1)}><${Icon} n="plus" cls="sm" /></button></div>
      <button class="btn grow" onClick=${() => add(s.outletId, p, sel, qty, note)}>Tambah · <span class="price">${rp(unit(p, sel) * qty)}</span></button></div>`;
}

function OutletSheet({ s, picked, pickOutlet, cart }) {
  const B = brandOf(s.brand);
  const cities = [...new Set(OUTLETS.filter((o) => o.brand === s.brand).map((o) => o.city))];
  const inCart = cart.some((l) => l.brand === s.brand);
  return html`<div class="sheet-body"><div class="sheet-head"><h2>Cabang ${B.name}</h2><p>Menu ${B.name} di keranjang disiapkan oleh cabang yang kamu pilih.${inCart ? ' Item yang sudah di keranjang ikut pindah.' : ''}</p></div>
    <div class="sheet-pad">${cities.map((ct) => html`<div key=${ct}><div class="city">${ct}</div>
      ${OUTLETS.filter((o) => o.brand === s.brand && o.city === ct).map((o) => html`<button key=${o.id} class=${'orow ' + (picked[s.brand] === o.id ? 'on' : '')} onClick=${() => pickOutlet(s.brand, o.id)}>
        <span class="oi"><${Icon} n=${picked[s.brand] === o.id ? 'check' : 'store'} cls="sm" /></span><span class="grow"><b>${oName(o)}</b><small>${o.addr ? o.addr + ' · ' : ''}${km(o.km)} <span class="sample">contoh</span></small></span><span class="tag olive"><i class="dot"></i>Buka</span></button>`)}</div>`)}</div></div>`;
}

function SearchSheet({ picked, setSheet }) {
  const [q, setQ] = useState('');
  const res = q.trim().length < 2 ? [] : BRANDS.map((b) => ({ b, items: allItems(b.id).filter((i) => i.name.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 6) })).filter((r) => r.items.length);
  return html`<div class="sheet-body">
    <div class="search-top"><label class="sbox"><${Icon} n="search" /><input id="search-q" class="input" placeholder="Cari di Robucca, Kalm, Zumma" autoFocus value=${q} onInput=${(e) => setQ(e.target.value)}/></label>
      <button class="icon-btn flat" onClick=${() => setSheet(null)} aria-label="Tutup"><${Icon} n="x" /></button></div>
    ${!q && html`<div class="search-sug">${['Latte', 'Matcha', 'Croissant', 'Pizza', 'Ramen', 'Kombucha'].map((x) => html`<button key=${x} class="chip sm" onClick=${() => setQ(x)}>${x}</button>`)}</div>`}
    <div class="search-res">${res.map(({ b, items }) => html`<div key=${b.id}><div class="sr-brand"><${BLogo} b=${b.id} />${b.name} · ${outletOf(picked[b.id]).name}</div>
      ${items.map((p) => html`<div key=${p.id} class="item" role="button" tabindex="0" onClick=${() => setSheet({ type: 'item', item: p, outletId: picked[b.id], brand: b.id })}>
        <${Pic} src=${img(p.img)} /><div class="it-b"><h3>${p.name}</h3>${p.desc && html`<p>${p.desc}</p>`}<div class="it-f"><span class="pr">${rp(p.price)}</span><span class="add"><${Icon} n="plus" cls="sm" /></span></div></div></div>`)}</div>`)}
      ${q.trim().length >= 2 && !res.length && html`<div class="empty"><h3>Tidak ketemu</h3><p>Coba kata lain, misalnya "latte".</p></div>`}</div></div>`;
}

function VoucherSheet({ s, setSheet }) {
  return html`<div class="sheet-body"><div class="sheet-head"><h2>Voucher</h2><p>Voucher RBC Group berlaku di semua brand. <span class="sample">contoh</span></p></div>
    <div class="sheet-pad">${VOUCHERS.map((v) => { const ok = v.ok(s.calc); return html`<button key=${v.id} class="vch" disabled=${!ok} style=${{ opacity: ok ? 1 : 0.45, borderBottom: '1px solid var(--line)', padding: '10px 0' }} onClick=${() => { s.pick(s.cur === v.id ? null : v.id); setSheet(null); }}>
      <span class="vi"><${Icon} n="sparkle" cls="sm" /></span><span class="grow"><b>${v.title}</b><small>${v.note} · ${ok ? (s.cur === v.id ? 'Dipakai' : 'Bisa dipakai') : 'Belum memenuhi syarat'}</small></span>${s.cur === v.id && html`<${Icon} n="check" />`}</button>`; })}</div></div>`;
}

function PaySheet({ s, setSheet, openSub, setCart }) {
  const p = PAYS.find((x) => x.id === s.order.pay);
  return html`<div class="sheet-body"><div class="sheet-head" style=${{ textAlign: 'center' }}><h2>Bayar ${rp(s.order.total)}</h2><p>Transfer ke ${p.name}. Status berubah otomatis setelah DOKU mengonfirmasi.</p></div>
    <div class="sheet-pad" style=${{ textAlign: 'center' }}>
      <span class="timer"><${Icon} n="clock" cls="xs" /> 59:48</span>
      <div class="card" style=${{ margin: '14px 0 0', padding: '16px', background: 'var(--bg)', boxShadow: 'none' }}>
        <span class="pl" style=${{ display: 'inline-grid', placeItems: 'center', width: '54px', height: '34px', borderRadius: '8px', background: p.c, color: '#fff', fontWeight: 700, fontSize: '12px' }}>${p.t}</span>
        <div style=${{ fontSize: '24px', fontWeight: 700, letterSpacing: '.06em', margin: '10px 0 2px', fontVariantNumeric: 'tabular-nums' }}>8808 0812 0000 ${s.order.id.slice(-4)}</div>
        <small class="faint">Nomor virtual account <span class="sample">contoh</span></small></div>
      <ol class="steps-ol" style=${{ textAlign: 'left' }}><li>Buka m-banking ${p.t === 'MDR' ? 'Livin’' : p.t}, pilih transfer ke Virtual Account.</li><li>Masukkan nomor di atas, cek nama "RBC Group".</li><li>Selesai. Pesanan langsung masuk ke kasir tiap cabang.</li></ol></div></div>
    <div class="sheet-foot"><button class="btn grow" onClick=${() => { setCart([]); setSheet(null); openSub({ type: 'status', order: s.order }); }}>Simulasikan pembayaran berhasil</button></div>`;
}

/* ---------- Keranjang (satu keranjang, dipecah per cabang) ---------- */
function Checkout(c) {
  const { cart, setQty, mode, setMode, go, points, setPoints, setOrders, orders, setCart, setSheet, setBusy, pickBrand } = c;
  const [time, setTime] = useState(0);
  const [cutlery, setCutlery] = useState(false);
  const [pay, setPay] = useState('va_bri');
  const [voucher, setVoucher] = useState(null);
  const [usePts, setUsePts] = useState(false);
  const groups = groupBy(cart);
  const brands = [...new Set(cart.map((l) => l.brand))];
  const sub = cart.reduce((a, l) => a + l.unit * l.qty, 0);
  const calc = { sub, brands };
  const v = VOUCHERS.find((x) => x.id === voucher && x.ok(calc));
  const disc = v ? Math.round(v.disc(calc)) : 0;
  const ship = mode === 'delivery' ? SHIP * groups.length : 0;
  const before = sub - disc + ship;
  const ptsUsed = usePts ? Math.min(points, Math.floor((before * 0.5) / POINT_VALUE)) : 0;
  const total = before - ptsUsed * POINT_VALUE;
  const back = () => go('menu');
  if (!cart.length) return html`<div class="screen"><div class="appbar"><button class="icon-btn" onClick=${back} aria-label="Kembali"><${Icon} n="chevron-left" /></button><h1>Keranjang</h1><span class="spacer"></span></div>
    <div class="empty"><div class="em-ico"><${Icon} n="bag" cls="lg" /></div><h3>Keranjang kosong</h3><p>Pilih menu dari Robucca, Kalm atau Zumma.</p><button class="btn" onClick=${back}>Lihat menu</button></div></div>`;
  const submit = () => {
    setBusy('Membuat pesanan…');
    setTimeout(() => {
      const order = { id: 'RBC-' + (2042 + orders.length), when: 'Hari ini', mode, status: 'Disiapkan', live: true, lines: cart, total, pay };
      setOrders((os) => [order, ...os]); setPoints((p) => p - ptsUsed + Math.floor(total / 1000)); setBusy('');
      setSheet({ type: 'pay', order });
    }, 900);
  };
  const times = [['Secepatnya', '±15 menit'], ['12.30', 'Hari ini'], ['12.45', 'Hari ini'], ['13.00', 'Hari ini']];
  return html`<div class="screen">
    <div class="appbar"><button class="icon-btn" onClick=${back} aria-label="Kembali"><${Icon} n="chevron-left" /></button><h1>Keranjang</h1>
      <button class="icon-btn" aria-label="Kosongkan keranjang" onClick=${() => setCart([])}><${Icon} n="trash" cls="sm" /></button></div>
    <div class="co">
      <div class="card">
        <div class="seg" data-v=${mode} role="tablist"><button role="tab" class=${mode === 'pickup' ? 'on' : undefined} onClick=${() => setMode('pickup')}><${Icon} n="bag" cls="sm" /> Pick Up</button>
          <button role="tab" class=${mode === 'delivery' ? 'on' : undefined} onClick=${() => setMode('delivery')}><${Icon} n="scooter" cls="sm" /> Delivery</button></div>
        ${mode === 'pickup' ? html`<p class="faint" style=${{ fontSize: '12.5px', margin: '14px 0 8px' }}>Waktu ambil di counter${groups.length > 1 ? `, sama untuk ${groups.length} cabang` : ''}</p>
          <div class="hscroll times">${times.map(([t, s], k) => html`<button key=${t} class=${'chip ' + (time === k ? 'on' : '')} onClick=${() => setTime(k)}>${t}<small>${s}</small></button>`)}</div>
          <p class="faint" style=${{ fontSize: '12px', margin: '10px 0 0', lineHeight: 1.45 }}>${groups.length > 1 ? 'Tiap cabang menyiapkan bagiannya sendiri dan memberi kode ambil masing-masing.' : 'Tanpa antre: pesananmu langsung disiapkan, tinggal ambil di counter dengan menyebut nama atau kode pesanan.'}</p>`
        : html`<div class="route" style=${{ padding: 0, marginTop: '6px' }}>
          ${groups.map((g) => { const o = outletOf(g.outlet); return html`<div key=${g.outlet} class="rt-row"><span class="rt-ic store"><${Icon} n="store" cls="sm" /></span><span class="grow"><b>${oName(o)}</b><small>${km(o.km)} · kurir instan</small></span></div>`; })}
          <div class="rt-row"><span class="rt-ic pin"><${Icon} n="map-pin" cls="sm" /></span><span class="grow"><b>Jl. Soekarno Hatta No. 27</b><small class="clamp1">Jatimulyo, Lowokwaru, Kota Malang</small></span><${Icon} n="chevron-right" cls="sm" /></div></div>
          ${groups.length > 1 && html`<div class="note-bar olive" style=${{ margin: '10px 0 0' }}><${Icon} n="info" cls="sm" /><span>Pesanan dari ${groups.length} cabang diantar ${groups.length} kurir, bisa tiba di waktu berbeda.</span></div>`}`}
        ${mode === 'pickup' && html`<div class="switch-row"><span class="grow"><b>Perlu alat makan?</b><small>Sendok, garpu & tisu</small></span><button class=${'switch ' + (cutlery ? 'on' : '')} role="switch" aria-checked=${cutlery} aria-label="Alat makan" onClick=${() => setCutlery(!cutlery)}></button></div>`}
      </div>

      <div class="card"><h3><${Icon} n="user" cls="sm" /> Data pemesan</h3>
        <div class="form-grid bg-in"><label class="field"><span>Nama <em>— dipanggil saat pesanan siap</em></span><input id="co-name" class="input" value="Dinda" readonly/></label>
          <label class="field"><span>No. WhatsApp</span><input id="co-wa" class="input" value="081200001234" readonly/></label></div></div>

      <div class="card"><h3><${Icon} n="receipt" cls="sm" /> Pesanan <span class="tag">${groups.length} cabang · ${cart.reduce((a, l) => a + l.qty, 0)} item</span></h3>
        ${groups.map((g, gi) => { const o = outletOf(g.outlet); return html`<div key=${g.outlet}>${gi > 0 && html`<div class="og-sep"></div>`}
          <div class="og-brand"><${BLogo} b=${o.brand} /><b>${oName(o)}</b><small>${rp(g.sub)}</small></div>
          ${g.lines.map((l) => html`<div key=${l.key} class="ci"><${Pic} src=${img(l.item.img)} />
            <div><b>${l.item.name}</b>${(selLabel(l.item, l.sel) || l.note) && html`<small>${[selLabel(l.item, l.sel), l.note].filter(Boolean).join(' · ')}</small>`}</div>
            <div class="ci-r"><span class="pr">${rp(l.unit * l.qty)}</span><span class="qty"><button aria-label="Kurangi" onClick=${() => setQty(l.key, -1)}><${Icon} n=${l.qty === 1 ? 'trash' : 'minus'} cls="sm" /></button><b>${l.qty}</b><button aria-label="Tambah" onClick=${() => setQty(l.key, 1)}><${Icon} n="plus" cls="sm" /></button></span></div></div>`)}</div>`; })}
        <button class="add-more" onClick=${back}><${Icon} n="plus" cls="sm" /> Tambah menu lain</button>
        ${brands.length < 3 && html`<div class="hscroll" style=${{ marginTop: '10px', gap: '8px' }}>${BRANDS.filter((b) => !brands.includes(b.id)).map((b) => html`<button key=${b.id} class="chip sm" onClick=${() => { pickBrand(b.id); back(); }}><${BLogo} b=${b.id} style=${{ width: '30px', height: '18px', borderRadius: '99px' }} /> Tambah dari ${b.name}</button>`)}</div>`}
      </div>

      <div class="card">
        <button class="vch" onClick=${() => setSheet({ type: 'voucher', calc, cur: voucher, pick: setVoucher })}><span class="vi"><${Icon} n="sparkle" cls="sm" /></span>
          <span class="grow"><b>${v ? v.title : 'Pakai voucher'}</b><small>${v ? `${v.id} · hemat ${rp(disc)}` : brands.length > 1 ? 'Ada voucher pesan barengan untukmu' : 'Lihat voucher RBC Group'}</small></span><${Icon} n="chevron-right" cls="sm" /></button>
        <div class="switch-row"><span class="ptsi">P</span><span class="grow"><b>Pakai RBC Poin</b><small>${points.toLocaleString('id-ID')} poin · 1 poin = Rp${POINT_VALUE} <span class="sample">contoh</span></small></span>
          <button class=${'switch ' + (usePts ? 'on' : '')} role="switch" aria-checked=${usePts} aria-label="Pakai RBC Poin" onClick=${() => setUsePts(!usePts)}></button></div></div>

      <div class="card"><h3><${Icon} n="wallet" cls="sm" /> Metode pembayaran</h3>
        ${PAYS.map((p) => html`<button key=${p.id} class=${'pay ' + (pay === p.id ? 'on' : '')} disabled=${p.off} style=${p.off ? { opacity: 0.45 } : null} onClick=${() => !p.off && setPay(p.id)}>
          <span class="pl" style=${{ background: p.c }}>${p.t}</span><span class="grow"><b>${p.name}</b><small>${p.s}</small></span><span class="mark"></span></button>`)}
        <p class="faint" style=${{ fontSize: '12px', margin: '8px 0 0' }}>Satu pembayaran untuk semua cabang.</p></div>

      <div class="card"><h3>Ringkasan pembayaran</h3>
        <div class="sum-row"><span>Harga (${cart.reduce((a, l) => a + l.qty, 0)} item)</span><span>${rp(sub)}</span></div>
        ${mode === 'delivery' && html`<div class="sum-row"><span>Ongkir ${groups.length} cabang <span class="sample">contoh</span></span><span>${rp(ship)}</span></div>`}
        ${disc > 0 && html`<div class="sum-row"><span>Voucher ${v.id}</span><span style=${{ color: 'var(--olive)' }}>−${rp(disc)}</span></div>`}
        ${ptsUsed > 0 && html`<div class="sum-row"><span>${ptsUsed.toLocaleString('id-ID')} RBC Poin</span><span style=${{ color: 'var(--olive)' }}>−${rp(ptsUsed * POINT_VALUE)}</span></div>`}
        <div class="sum-row total"><span>Total</span><span>${rp(total)}</span></div>
        <div class="sum-row"><span>Poin didapat</span><span>+${Math.floor(total / 1000)} poin</span></div></div>
    </div>
    <div class="paybar"><div class="pb-t"><small>Total bayar</small><b>${rp(total)}</b></div><button class="btn" onClick=${submit}>Pesan Sekarang</button></div>
  </div>`;
}

/* ---------- Status pesanan ---------- */
function Status({ order, go }) {
  const groups = groupBy(order.lines);
  const dl = order.mode === 'delivery';
  const steps = [['Pembayaran diterima', 'Lewat DOKU · 12.04'], ['Disiapkan', groups.length > 1 ? `${groups.length} cabang menyiapkan bersamaan` : 'Dapur & bar cabang'], [dl ? 'Diantar kurir' : 'Siap diambil', dl ? 'Satu kurir per cabang' : 'Sebut nama atau kode di counter'], [dl ? 'Sampai' : 'Selesai', '']];
  return html`<div class="screen">
    <div class="appbar"><button class="icon-btn" onClick=${() => go('orders')} aria-label="Tutup"><${Icon} n="x" /></button><h1>Pesanan ${order.id}</h1><span class="spacer"></span></div>
    <div class="track-hero"><svg class="cup-ill" viewBox="0 0 128 128" aria-hidden="true"><g class="steam"><path d="M52 30c-4-6 4-10 0-16"/><path d="M64 30c-4-6 4-10 0-16"/><path d="M76 30c-4-6 4-10 0-16"/></g>
      <path d="M34 44h60l-6 62a8 8 0 0 1-8 7H48a8 8 0 0 1-8-7z" fill="var(--sand)" stroke="var(--ink)" stroke-width="3"/><path d="M30 44h68" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/></svg>
      <h1>Sedang disiapkan</h1><p>${groups.length > 1 ? `Pesananmu dikerjakan ${groups.length} cabang sekaligus. Kami kabari lewat WhatsApp saat siap.` : 'Kami kabari lewat WhatsApp saat pesananmu siap.'}</p></div>
    <div class="card" style=${{ margin: '18px 16px 0', padding: '4px 16px' }}>
      ${groups.map((g, i) => { const o = outletOf(g.outlet); return html`<div key=${g.outlet} class="subo"><${BLogo} b=${o.brand} />
        <span><b>${oName(o)}</b><small>${g.lines.map((l) => `${l.qty}× ${l.item.name}`).join(', ')}</small></span>
        <span style=${{ textAlign: 'right' }}><small class="faint">${dl ? 'Status' : 'Kode ambil'}</small><span class="code">${dl ? 'Disiapkan' : { robucca: 'RB', kalm: 'KL', zumma: 'ZM' }[o.brand] + '-' + order.id.slice(-2) + (i + 1)}</span></span></div>`; })}</div>
    <div class="card tl">${steps.map(([t, s], i) => html`<div key=${t} class=${'tl-s ' + (i === 0 ? 'done' : i === 1 ? 'cur' : '')}><span class="dot">${i === 0 && html`<${Icon} n="check" cls="xs" />`}</span><span><b>${t}</b>${s && html`<small>${s}</small>`}</span></div>`)}</div>
    <div class="actions"><button class="btn soft" onClick=${() => go('home')}>Kembali ke beranda</button></div>
    <div style=${{ height: '30px' }}></div></div>`;
}

/* ---------- Reservasi ---------- */
function Reservasi(c) {
  const { brand, picked, setRsvs, openSub, toast } = c;
  const [outlet, setOutlet] = useState(picked[brand]);
  const [day, setDay] = useState(1);
  const [time, setTime] = useState('19.00');
  const [guests, setGuests] = useState(4);
  const o = outletOf(outlet); const B = brandOf(o.brand);
  useEffect(() => { setOutlet(picked[brand]); }, [brand]);
  const days = [['Kam', 29], ['Jum', 30], ['Sab', 31], ['Min', 1], ['Sen', 2], ['Sel', 3]];
  const slots = ['10.00', '11.00', '13.00', '15.00', '17.00', '18.00', '19.00', '19.30'];
  const submit = () => { const r = { id: 'RSV-' + Math.floor(1000 + Math.random() * 9000), outlet, day: `${days[day][0]} ${days[day][1]}`, time, guests }; setRsvs((x) => [r, ...x]); toast('Reservasi diajukan'); openSub({ type: 'ticket', r }); };
  return html`<div class="screen">
    <div class="rsv-hero">${B.hero ? html`<${Pic} src=${img('venue-table')} />` : html`<div class="im loaded" style=${{ background: B.b }}><img class="ok" src=${img(B.pics[0])} alt="" style=${{ opacity: 0.55 }}/></div>`}
      <div class="rh-in"><img src=${logo(o.brand)} alt=${B.name}/><h1>Reservasi meja</h1><p>Booking tempat untuk nongkrong, kerja, atau acara.</p>
        <span class="rh-branch"><${Icon} n="store" cls="xs" /> ${oName(o)}</span></div></div>
    <div class="rsv-body">
      <div class="card"><h3><span class="n">1</span> Cabang</h3><div class="hscroll" style=${{ gap: '8px', flexWrap: 'wrap' }}>
        ${OUTLETS.filter((x) => x.city === 'Malang').map((x) => html`<button key=${x.id} class=${'chip sm ' + (outlet === x.id ? 'on' : '')} onClick=${() => setOutlet(x.id)}><${BLogo} b=${x.brand} style=${{ width: '28px', height: '18px', borderRadius: '99px' }} /> ${oName(x)}</button>`)}</div>
        <p class="faint" style=${{ fontSize: '12px', margin: '10px 0 0' }}>Satu formulir untuk ketiga brand. Cabang luar Malang muncul sesuai lokasi.</p></div>
      <div class="card"><h3><span class="n">2</span> Tanggal</h3><div class="hscroll dates">${days.map(([d, n], i) => html`<button key=${n} class=${'date ' + (day === i ? 'on' : '')} onClick=${() => setDay(i)}><small>${d}</small><b>${n}</b><small>${i < 3 ? 'Okt' : 'Nov'}</small></button>`)}</div></div>
      <div class="card"><h3><span class="n">3</span> Jam</h3><div class="slots">${slots.map((t) => html`<button key=${t} class=${'chip ' + (time === t ? 'on' : '')} disabled=${t === '18.00'} onClick=${() => setTime(t)}>${t}</button>`)}</div></div>
      <div class="card"><h3><span class="n">4</span> Jumlah tamu</h3><div class="guests"><span class="qty lg"><button aria-label="Kurangi" onClick=${() => setGuests((g) => Math.max(1, g - 1))}><${Icon} n="minus" cls="sm" /></button><b>${guests}</b><button aria-label="Tambah" onClick=${() => setGuests((g) => Math.min(30, g + 1))}><${Icon} n="plus" cls="sm" /></button></span>
        <span class="g-txt"><b>${guests} orang</b><small>DP / min. belanja mengikuti aturan cabang</small></span></div></div>
    </div>
    <div class="paybar"><div class="pb-t"><small>${B.name}</small><b>${days[day][0]} ${days[day][1]}, ${time}</b></div><button class="btn" onClick=${submit}>Ajukan reservasi</button></div>
  </div>`;
}

function Ticket({ r, go }) {
  const o = outletOf(r.outlet);
  return html`<div class="screen" data-brand=${o.brand}>
    <div class="appbar"><button class="icon-btn" onClick=${() => go('orders')} aria-label="Tutup"><${Icon} n="x" /></button><h1>Tiket reservasi</h1><span class="spacer"></span></div>
    <div class="ticket"><div class="tk-top" style=${{ background: brandOf(o.brand).b }}><img src=${logo(o.brand)} alt=""/><span class="tag warn">Menunggu konfirmasi</span><h2>${r.day}, ${r.time}</h2><p>${oName(o)}</p></div>
      <div class="tk-cut"><i></i></div>
      <div class="tk-grid"><span><small>Tamu</small><b>${r.guests} orang</b></span><span><small>Cabang</small><b>${oName(o)}</b></span><span><small>Atas nama</small><b>Dinda</b></span><span><small>Konfirmasi</small><b>Lewat WhatsApp</b></span></div>
      <div class="tk-code"><span class="faint" style=${{ fontSize: '12px' }}>Kode</span><b>${r.id}</b></div></div>
    <div class="actions"><button class="btn soft" onClick=${() => go('home')}>Kembali ke beranda</button></div></div>`;
}

/* ---------- Aktivitas & Akun ---------- */
function Pesanan({ orders, rsvs, openSub, setCart, go }) {
  const [v, setV] = useState('orders');
  return html`<div class="screen">
    <div class="list-head"><h1>Aktivitas</h1><div class="seg" data-v=${v === 'rsv' ? 'rsv' : 'pickup'}>
      <button class=${v === 'orders' ? 'on' : undefined} onClick=${() => setV('orders')}>Pesanan</button><button class=${v === 'rsv' ? 'on' : undefined} onClick=${() => setV('rsv')}>Reservasi</button></div></div>
    <div class="olist">
      ${v === 'orders' && html`<div class="list-sub">Semua brand</div>${orders.map((o) => { const gs = groupBy(o.lines); const bs = [...new Set(o.lines.map((l) => l.brand))];
        return html`<div key=${o.id} class="card oc"><div class="oc-h"><span class=${'ic ' + (bs.length > 1 ? 'multi' : '')}>${bs.map((b) => html`<${BLogo} key=${b} b=${b} />`)}</span>
          <span class="grow"><b>${o.mode === 'delivery' ? 'Delivery' : 'Pick Up'} · ${gs.map((g) => oName(outletOf(g.outlet))).join(' + ')}</b><small>${o.id} · ${o.when}</small></span>
          <span class=${'tag ' + (o.live ? 'warn' : 'olive')}>${o.status}</span></div>
          <div class="oc-items">${o.lines.map((l) => `${l.qty}× ${l.item.name}`).join(', ')}</div>
          <div class="oc-f"><span>${rp(o.total || o.lines.reduce((a, l) => a + l.qty * l.unit, 0))}</span>
            ${o.live ? html`<button class="btn sm" onClick=${() => openSub({ type: 'status', order: o })}>Lacak</button>`
              : html`<button class="btn sm soft" onClick=${() => { setCart(o.lines.map((l) => ({ ...l }))); openSub({ type: 'checkout' }); }}><${Icon} n="rotate" cls="sm" /> Pesan lagi</button>`}</div></div>`; })}`}
      ${v === 'rsv' && (rsvs.length ? rsvs.map((r) => html`<button key=${r.id} class="card oc" onClick=${() => openSub({ type: 'ticket', r })}><div class="oc-h"><span class="ic"><${BLogo} b=${outletOf(r.outlet).brand} /></span>
          <span class="grow"><b>${r.day}, ${r.time} · ${r.guests} orang</b><small>${oName(outletOf(r.outlet))} · ${r.id}</small></span><span class="tag warn">Menunggu</span></div></button>`)
        : html`<div class="empty"><div class="em-ico"><${Icon} n="calendar" cls="lg" /></div><h3>Belum ada reservasi</h3><p>Booking meja di Robucca, Kalm atau Zumma.</p><button class="btn" onClick=${() => go('rsv')}>Reservasi meja</button></div>`)}
    </div></div>`;
}

function Akun({ points, orders, toast }) {
  const install = () => { if (!promptInstall()) toast(isIOS() ? 'Ketuk tombol Bagikan, lalu Tambah ke Layar Utama' : 'Buka menu browser (⋮), lalu Tambahkan ke layar utama'); };
  const target = 2500;
  return html`<div class="screen">
    <div class="acc-head"><h1>Akun</h1></div>
    <div class="member"><img class="mk" src=${D.logo['rbc-mark-light']} alt=""/>
      <span class="tier">RBC Member · Silver <span class="sample" style=${{ background: 'rgba(239,232,223,.15)', color: 'inherit' }}>contoh</span></span>
      <div class="big">${points.toLocaleString('id-ID')} poin</div>
      <div class="bar"><i style=${{ width: Math.min(100, (points / target) * 100) + '%' }}></i></div>
      <small>${Math.max(0, target - points).toLocaleString('id-ID')} poin lagi ke Gold · berlaku di semua brand</small>
      <div class="bl">${BRANDS.map((b) => html`<${BLogo} key=${b.id} b=${b.id} />`)}</div></div>
    <div class="card profile" style=${{ margin: '12px 16px 0' }}><span class="avatar">D</span><span class="grow"><b>Dinda Ayu Lestari</b><small>0812-0000-1234 · masuk dengan WhatsApp</small></span></div>
    <div class="card menu-list">
      ${[['qr', 'Kode member', 'Tunjukkan di kasir Robucca, Kalm, Zumma'], ['map-pin', 'Alamat tersimpan', '2 alamat · dipakai di semua brand'], ['receipt', 'Riwayat pesanan', orders.length + ' pesanan'], ['chat', 'Bantuan', 'Chat WhatsApp RBC Group'], ...(isStandalone() ? [] : [['share', 'Pasang di layar utama', 'Buka RBC Group seperti aplikasi']]), ['logout', 'Keluar', '']].map(([ic, t, s]) => html`
        <button key=${t} class="ml" onClick=${t === 'Pasang di layar utama' ? install : undefined}><span class="ml-i"><${Icon} n=${ic} cls="sm" /></span><span class="grow">${t}${s && html`<small>${s}</small>`}</span><${Icon} n="chevron-right" cls="sm" /></button>`)}</div>
    <div class="foot"><img src=${D.logo['rbc-dark']} alt="RBC Group"/>Versi prototipe · 30 Okt 2026</div></div>`;
}

/* ---------- Panel prototipe (desktop) ---------- */
function Desk() {
  const flows = [['home', 'Beranda', 'Kerangka Robucca'], ['kalm', 'Ganti ke Kalm', 'Satu ketukan'], ['menu', 'Menu Zumma', 'Pilih brand di menu'], ['barengan', 'Pesan barengan', 'Robucca + Kalm + Zumma'],
    ['checkout', 'Keranjang', 'Dipecah per cabang'], ['search', 'Cari', 'Lintas 3 brand'], ['rsv', 'Reservasi', 'Satu formulir'], ['account', 'Akun', 'RBC Poin']];
  return html`<aside class="desk"><img class="desk-logo" src=${D.logo['rbc-dark']} alt="RBC Group"/>
    <p class="desk-lead">Prototipe super app</p>
    <p class="desk-note">Kerangka PWA Robucca yang sudah live, diperluas untuk Robucca, Kalm dan Zumma. Tampilan, warna dan huruf ikut brand yang dipilih. Menu & foto asli; promo, poin, jarak dan ongkir contoh.</p>
    <p class="desk-note"><b>Dirancang untuk HP.</b> Buka <b>robucca-it.github.io/rbc-super-app</b> di HP, lalu pasang ke layar utama supaya terbuka seperti aplikasi.</p>
    <h3>Coba alurnya</h3><div class="flows">${flows.map(([k, t, s]) => html`<button key=${k} onClick=${() => api.go(k)}>${t}<small>${s}</small></button>`)}</div>
    <h3>Perlu keputusan</h3><ul><li><b>Ongkir</b> pesanan dari beberapa cabang (contoh Rp12.000 per cabang).</li><li><b>Aturan RBC Poin</b> (contoh 1 poin tiap Rp1.000, 1 poin = Rp10).</li><li><b>Domain</b>: tetap robucca.id atau domain RBC Group.</li></ul></aside>`;
}

/* lembar cabang untuk reservasi memakai lembar cabang brand aktif */
document.getElementById('splash-img').src = D.logo['rbc-light'];
setTimeout(() => document.getElementById('splash').classList.add('out'), 1100);
ReactDOM.createRoot(document.getElementById('root')).render(html`<${App} />`);

/* Offline & pasang di layar utama. Hanya di https (GitHub Pages); di tempat lain diabaikan. */
if ('serviceWorker' in navigator && location.protocol === 'https:') addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
