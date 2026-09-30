// 의명보감 1 기초편 스터디 덱 공용 레이아웃
const pptxgen = require('pptxgenjs');

const F = 'Malgun Gothic';
const C = {
  ink: '1D1C24', ink2: '2B2933', inkText: 'F4F1EA', inkMuted: 'A9A4B5',
  paper: 'FFFFFF', tint: 'F3F1F6', text: '22212A', muted: '6B6778', line: 'D9D5E0',
  seal: 'B23A2E',
  wood: '3F7D4E', fire: 'C0392B', earth: 'B8892A', metal: '6E737B', water: '22406E',
};
const EL = { '木': C.wood, '火': C.fire, '土': C.earth, '金': C.metal, '水': C.water };
const W = 13.333, H = 7.5, M = 0.6;

function deck(meta) {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE';
  pres.title = meta.deckTitle;
  pres.author = '의명보감 스터디';
  let n = 0;

  const foot = (s, dark) => {
    n++;
    s.addText(`의명보감 1 기초편 · 제${meta.ch}장 ${meta.short}`, { x: M, y: H - 0.45, w: 7, h: 0.3, fontFace: F, fontSize: 10, color: dark ? C.inkMuted : C.muted, margin: 0, isTextBox: true });
    s.addText(String(n), { x: W - M - 1, y: H - 0.45, w: 1, h: 0.3, fontFace: F, fontSize: 10, color: dark ? C.inkMuted : C.muted, align: 'right', margin: 0, isTextBox: true });
  };
  const title = (s, t, kicker) => {
    if (kicker) s.addText(kicker, { x: M, y: 0.4, w: W - 2 * M, h: 0.35, fontFace: F, fontSize: 13, bold: true, color: C.seal, margin: 0, isTextBox: true });
    s.addText(t, { x: M, y: kicker ? 0.72 : 0.5, w: W - 2 * M, h: 0.75, fontFace: F, fontSize: 30, bold: true, color: C.text, margin: 0, valign: 'middle', isTextBox: true });
  };
  const badge = (s, ch, x, y, d, color, size) => {
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color }, line: { color, width: 0 } });
    s.addText(ch, { x, y, w: d, h: d, fontFace: F, fontSize: size || Math.round(d * 30), bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', margin: 0, isTextBox: true });
  };
  const light = () => { const s = pres.addSlide(); s.background = { color: C.paper }; return s; };
  const dark = () => { const s = pres.addSlide(); s.background = { color: C.ink }; return s; };
  const colorOf = (c) => EL[c] || C[c] || c || C.seal;

  const api = {
    pres, C, EL,
    cover({ title: t, sub, bigChar, lines }) {
      const s = dark();
      s.addText(bigChar, { x: 7.2, y: 0.2, w: 6, h: 7, fontFace: F, fontSize: 380, bold: true, color: C.ink2, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
      badge(s, `제${meta.ch}장`, M, 1.4, 1.1, C.seal, 18);
      s.addText(t, { x: M, y: 2.8, w: 8.5, h: 1.3, fontFace: F, fontSize: 48, bold: true, color: C.inkText, margin: 0, valign: 'middle', isTextBox: true });
      s.addText(sub, { x: M, y: 4.1, w: 8.5, h: 0.6, fontFace: F, fontSize: 22, color: C.inkMuted, margin: 0, isTextBox: true });
      if (lines) s.addText(lines, { x: M, y: 5.3, w: 8, h: 0.8, fontFace: F, fontSize: 14, color: C.inkMuted, margin: 0, isTextBox: true });
      s.addNotes(arguments[0].notes || '');
      n++;
      return s;
    },
    agenda(items, notes) {
      const s = light(); title(s, '오늘 공부할 내용', '목차');
      const per = items.length <= 4 ? items.length : Math.ceil(items.length / 2), colW = items.length <= 4 ? W - 2 * M : (W - 2 * M - 0.5) / 2;
      const rowH = Math.min(0.95, 5.0 / per);
      items.forEach((it, i) => {
        const col = Math.floor(i / per), row = i % per;
        const x = M + col * (colW + 0.5), y = 1.75 + row * rowH;
        badge(s, String(i + 1), x, y + 0.08, 0.55, C.seal, 16);
        s.addText([{ text: it[0], options: { bold: true, fontSize: 17, color: C.text, breakLine: true } }, { text: it[1] || '', options: { fontSize: 12, color: C.muted } }],
          { x: x + 0.75, y, w: colW - 0.8, h: rowH - 0.1, fontFace: F, margin: 0, valign: 'middle', isTextBox: true });
      });
      foot(s); s.addNotes(notes || ''); return s;
    },
    section(no, t, sub, notes) {
      const s = dark();
      s.addText(String(no).padStart(2, '0'), { x: M, y: 1.5, w: 4, h: 1.8, fontFace: F, fontSize: 110, bold: true, color: C.seal, margin: 0, isTextBox: true });
      s.addText(t, { x: M, y: 3.4, w: W - 2 * M, h: 1.0, fontFace: F, fontSize: 40, bold: true, color: C.inkText, margin: 0, isTextBox: true });
      if (sub) s.addText(sub, { x: M, y: 4.45, w: 10, h: 1.0, fontFace: F, fontSize: 18, color: C.inkMuted, margin: 0, valign: 'top', isTextBox: true });
      foot(s, true); s.addNotes(notes || ''); return s;
    },
    // points: [{h, t}] 왼쪽 목록 + 오른쪽 큰 글자 원
    points(t, pts, { kicker, char, color, caption, notes, size } = {}) {
      const s = light(); title(s, t, kicker);
      const hasVis = !!char, w = hasVis ? 7.9 : W - 2 * M;
      const fs = size || (pts.length > 4 ? 15 : 17);
      const runs = [];
      pts.forEach((p, i) => {
        const last = i === pts.length - 1;
        if (p.h) runs.push({ text: p.h, options: { bold: true, color: C.text, fontSize: fs + 2, breakLine: true } });
        runs.push({ text: p.t, options: { color: C.muted, fontSize: fs, breakLine: !last, paraSpaceAfter: last ? 0 : 16 } });
      });
      s.addText(runs, { x: M, y: 1.7, w, h: H - 2.5, fontFace: F, margin: 0, valign: 'top', lineSpacingMultiple: 1.15, isTextBox: true });
      if (hasVis) {
        const col = colorOf(color);
        s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 9.0, y: 1.7, w: 3.73, h: 4.9, fill: { color: C.tint }, line: { color: C.tint }, rectRadius: 0.15 });
        badge(s, char, 9.0 + (3.73 - 2.4) / 2, 2.1, 2.4, col, char.length > 1 ? 48 : 80);
        if (caption) s.addText(caption, { x: 9.2, y: 4.75, w: 3.33, h: 1.6, fontFace: F, fontSize: 14, color: C.text, align: 'center', valign: 'top', margin: 0, isTextBox: true });
      }
      foot(s); s.addNotes(notes || ''); return s;
    },
    // cards: [{char, color, h, t}]
    cards(t, cards, { kicker, notes, cols, bodySize } = {}) {
      const s = light(); title(s, t, kicker);
      const k = cols || cards.length, rows = Math.ceil(cards.length / k);
      const gap = 0.3, cw = (W - 2 * M - gap * (k - 1)) / k;
      const top = 1.75, ch = (H - top - 0.75 - gap * (rows - 1)) / rows;
      const bs = bodySize || (k >= 5 ? 13 : k >= 4 ? 14 : 16);
      cards.forEach((c, i) => {
        const x = M + (i % k) * (cw + gap), y = top + Math.floor(i / k) * (ch + gap);
        s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: ch, fill: { color: C.tint }, line: { color: C.tint }, rectRadius: 0.12 });
        const d = rows > 1 ? 0.7 : 0.9;
        if (k >= 5) {
          const dd = rows > 1 ? 0.75 : 1.0, top = rows > 1 ? 0.2 : 0.3;
          if (c.char) badge(s, c.char, x + (cw - dd) / 2, y + top, dd, colorOf(c.color), c.char.length > 1 ? 18 : (rows > 1 ? 26 : 34));
          const hy = y + top + dd + 0.1;
          s.addText(c.h, { x: x + 0.1, y: hy, w: cw - 0.2, h: 0.42, fontFace: F, fontSize: rows > 1 ? 15 : 18, bold: true, color: C.text, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
          s.addText(c.t, { x: x + 0.15, y: hy + 0.47, w: cw - 0.3, h: y + ch - hy - 0.55, fontFace: F, fontSize: bs, color: C.text, align: 'center', valign: 'top', margin: 0, lineSpacingMultiple: 1.1, isTextBox: true });
          return;
        }
        if (c.char) badge(s, c.char, x + 0.25, y + 0.25, d, colorOf(c.color), c.char.length > 1 ? (d > 0.8 ? 18 : 14) : (d > 0.8 ? 30 : 24));
        const hx = c.char ? x + 0.25 + d + 0.2 : x + 0.25;
        s.addText(c.h, { x: hx, y: y + 0.25, w: x + cw - hx - 0.2, h: d, fontFace: F, fontSize: k >= 5 ? 15 : 17, bold: true, color: C.text, valign: 'middle', margin: 0, isTextBox: true });
        s.addText(c.t, { x: x + 0.25, y: y + 0.25 + d + 0.2, w: cw - 0.5, h: ch - d - 0.65, fontFace: F, fontSize: bs, color: C.text, valign: 'top', margin: 0, lineSpacingMultiple: 1.1, isTextBox: true });
      });
      foot(s); s.addNotes(notes || ''); return s;
    },
    // table: head[], rows[][]; colColors: 헤더 색 배열(열별)
    table(t, head, rows, { kicker, notes, colW, fs, colColors, note, firstColBold = true } = {}) {
      const s = light(); title(s, t, kicker);
      const size = fs || (rows.length > 9 ? 12 : rows.length > 6 ? 14 : 16);
      const hdr = head.map((h, i) => ({ text: h, options: { bold: true, color: 'FFFFFF', fill: { color: colColors && colColors[i] ? colorOf(colColors[i]) : C.ink }, align: 'center', valign: 'middle' } }));
      const body = rows.map((r, ri) => r.map((c, ci) => { const o = (c && typeof c === 'object') ? c : { text: String(c) }; return { text: o.text, options: { color: o.color || C.text, bold: o.bold !== undefined ? o.bold : (firstColBold && ci === 0), fill: { color: ri % 2 ? 'FFFFFF' : C.tint }, align: o.align || (ci === 0 ? 'center' : 'left'), valign: 'middle', colspan: o.colspan, rowspan: o.rowspan } }; }));
      const tw = W - 2 * M;
      const availH = H - 1.75 - (note ? 1.2 : 0.8);
      const rowH = Math.min(rows.length <= 5 ? 0.75 : rows.length <= 7 ? 0.64 : 0.55, availH / (rows.length + 1));
      s.addTable([hdr, ...body], { x: M, y: 1.7, w: tw, colW: colW || head.map(() => tw / head.length), fontFace: F, fontSize: size, border: { type: 'solid', pt: 0.75, color: C.line }, rowH, margin: [0.04, 0.08, 0.04, 0.08], autoPage: false });
      if (note) s.addText(note, { x: M, y: H - 1.15, w: tw, h: 0.55, fontFace: F, fontSize: 11, color: C.muted, italic: true, margin: 0, valign: 'bottom', isTextBox: true });
      foot(s); s.addNotes(notes || ''); return s;
    },
    quote(q, src, notes) {
      const s = dark();
      s.addText('“', { x: M, y: 0.6, w: 2, h: 2, fontFace: F, fontSize: 150, bold: true, color: C.seal, margin: 0, isTextBox: true });
      s.addText(q, { x: 1.5, y: 2.0, w: W - 3, h: 3.2, fontFace: F, fontSize: q.length > 90 ? 24 : 30, bold: true, color: C.inkText, valign: 'middle', margin: 0, lineSpacingMultiple: 1.3, isTextBox: true });
      s.addText(src, { x: 1.5, y: 5.4, w: W - 3, h: 0.5, fontFace: F, fontSize: 15, color: C.inkMuted, margin: 0, isTextBox: true });
      foot(s, true); s.addNotes(notes || ''); return s;
    },
    // flow: [{char, color, h, t}] 가로 단계 + 화살표
    flow(t, steps, { kicker, notes, note } = {}) {
      const s = light(); title(s, t, kicker);
      const k = steps.length, gap = 0.45, cw = (W - 2 * M - gap * (k - 1)) / k;
      const d = Math.min(1.3, cw - 0.3), y0 = 2.0;
      steps.forEach((st, i) => {
        const x = M + i * (cw + gap);
        badge(s, st.char, x + (cw - d) / 2, y0, d, colorOf(st.color), st.char.length > 2 ? 16 : st.char.length > 1 ? 24 : 40);
        if (i < k - 1) s.addShape(pres.shapes.RIGHT_TRIANGLE ? pres.shapes.ISOSCELES_TRIANGLE : pres.shapes.ISOSCELES_TRIANGLE, { x: x + cw + gap / 2 - 0.12, y: y0 + d / 2 - 0.14, w: 0.28, h: 0.28, rotate: 90, fill: { color: C.line }, line: { color: C.line } });
        s.addText(st.h, { x, y: y0 + d + 0.2, w: cw, h: 0.5, fontFace: F, fontSize: k > 5 ? 16 : 19, bold: true, color: C.text, align: 'center', margin: 0, isTextBox: true });
        s.addText(st.t || '', { x, y: y0 + d + 0.72, w: cw, h: 2.0, fontFace: F, fontSize: k > 5 ? 13 : 15, color: C.muted, align: 'center', valign: 'top', margin: 0, isTextBox: true });
      });
      if (note) s.addText(note, { x: M, y: H - 1.4, w: W - 2 * M, h: 0.7, fontFace: F, fontSize: 14, color: C.text, bold: true, align: 'center', valign: 'middle', margin: 0, fill: { color: C.tint }, isTextBox: true });
      foot(s); s.addNotes(notes || ''); return s;
    },
    compare(t, L, R, { kicker, notes } = {}) {
      const s = light(); title(s, t, kicker);
      const cw = (W - 2 * M - 0.4) / 2;
      [L, R].forEach((c, i) => {
        const x = M + i * (cw + 0.4), col = colorOf(c.color);
        s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.7, w: cw, h: 4.95, fill: { color: C.tint }, line: { color: C.tint }, rectRadius: 0.12 });
        badge(s, c.char, x + 0.3, 1.95, 0.9, col, c.char.length > 1 ? 18 : 32);
        s.addText(c.h, { x: x + 1.4, y: 1.95, w: cw - 1.6, h: 0.9, fontFace: F, fontSize: 20, bold: true, color: C.text, valign: 'middle', margin: 0, isTextBox: true });
        s.addText(c.items.map((it, j) => ({ text: it, options: { bullet: true, breakLine: j < c.items.length - 1, paraSpaceAfter: 12 } })),
          { x: x + 0.3, y: 3.05, w: cw - 0.6, h: 3.4, fontFace: F, fontSize: c.fs || 17, color: C.text, valign: 'top', margin: 0, isTextBox: true });
      });
      foot(s); s.addNotes(notes || ''); return s;
    },
    // 오행 오각형 순환도: mode 'sheng' (이웃) | 'ke' (별)
    cycle(t, mode, side, { kicker, notes, sideTitle } = {}) {
      const s = light(); title(s, t, kicker);
      const order = ['木', '火', '土', '金', '水'];
      const cx = 3.6, cy = 4.15, R = 2.05, d = 1.05;
      const pos = order.map((_, i) => { const a = (-90 + 72 * i) * Math.PI / 180; return [cx + R * Math.cos(a), cy + R * Math.sin(a)]; });
      const arrow = (a, b, color) => {
        const [x1, y1] = pos[a], [x2, y2] = pos[b];
        const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), r = d / 2 + 0.08;
        const sx = x1 + dx / len * r, sy = y1 + dy / len * r, ex = x2 - dx / len * r, ey = y2 - dy / len * r;
        s.addShape(pres.shapes.LINE, { x: Math.min(sx, ex), y: Math.min(sy, ey), w: Math.max(Math.abs(ex - sx), 0.01), h: Math.max(Math.abs(ey - sy), 0.01), flipH: ex < sx, flipV: ey < sy, line: { color, width: 2.25, endArrowType: 'triangle' } });
      };
      order.forEach((_, i) => arrow(i, (i + (mode === 'ke' ? 2 : 1)) % 5, mode === 'ke' ? C.seal : '8E8A99'));
      order.forEach((e, i) => badge(s, e, pos[i][0] - d / 2, pos[i][1] - d / 2, d, EL[e], 34));
      s.addText(mode === 'ke' ? '상극' : '상생', { x: cx - 0.8, y: cy - 0.3, w: 1.6, h: 0.6, fontFace: F, fontSize: 18, bold: true, color: C.muted, align: 'center', margin: 0, isTextBox: true });
      const x0 = 7.2, sw = W - M - x0;
      if (sideTitle) s.addText(sideTitle, { x: x0, y: 1.75, w: sw, h: 0.4, fontFace: F, fontSize: 15, bold: true, color: C.seal, margin: 0, isTextBox: true });
      const y0 = sideTitle ? 2.3 : 1.8, rh = (H - 0.8 - y0) / side.length;
      side.forEach((r, i) => {
        const y = y0 + i * rh;
        s.addText(r[0], { x: x0, y, w: 1.55, h: rh - 0.1, fontFace: F, fontSize: 16, bold: true, color: C.text, valign: 'middle', margin: 0, isTextBox: true });
        s.addText(r[1], { x: x0 + 1.6, y, w: sw - 1.6, h: rh - 0.1, fontFace: F, fontSize: 13, color: C.muted, valign: 'middle', margin: 0, isTextBox: true });
      });
      foot(s); s.addNotes(notes || ''); return s;
    },
    // 원형 배치(12지지 등): items [{char,color,label}]
    ring(t, items, side, { kicker, notes, sideTitle, center } = {}) {
      const s = light(); title(s, t, kicker);
      const k = items.length, cx = 3.55, cy = 4.28, R = 1.9, d = 0.74;
      items.forEach((it, i) => {
        const a = (-90 + 360 / k * i) * Math.PI / 180, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
        badge(s, it.char, x - d / 2, y - d / 2, d, colorOf(it.color), 24);
        if (it.label) {
          const lx = cx + (R + 0.75) * Math.cos(a), ly = cy + (R + 0.56) * Math.sin(a);
          s.addText(it.label, { x: lx - 0.6, y: ly - 0.18, w: 1.2, h: 0.36, fontFace: F, fontSize: 10, color: C.muted, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
        }
      });
      if (center) s.addText(center, { x: cx - 1.1, y: cy - 0.6, w: 2.2, h: 1.2, fontFace: F, fontSize: 16, bold: true, color: C.text, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
      const x0 = 7.3, sw = W - M - x0;
      if (sideTitle) s.addText(sideTitle, { x: x0, y: 1.75, w: sw, h: 0.4, fontFace: F, fontSize: 15, bold: true, color: C.seal, margin: 0, isTextBox: true });
      const y0 = sideTitle ? 2.3 : 1.8, rh = (H - 0.8 - y0) / side.length;
      side.forEach((r, i) => {
        const y = y0 + i * rh;
        s.addText(r[0], { x: x0, y, w: 1.7, h: rh - 0.1, fontFace: F, fontSize: 15, bold: true, color: C.text, valign: 'middle', margin: 0, isTextBox: true });
        s.addText(r[1], { x: x0 + 1.75, y, w: sw - 1.75, h: rh - 0.1, fontFace: F, fontSize: 13, color: C.muted, valign: 'middle', margin: 0, isTextBox: true });
      });
      foot(s); s.addNotes(notes || ''); return s;
    },
    questions(qs, notes) {
      const s = dark();
      s.addText('함께 생각해 볼 질문', { x: M, y: 0.6, w: W - 2 * M, h: 0.8, fontFace: F, fontSize: 32, bold: true, color: C.inkText, margin: 0, isTextBox: true });
      const rh = Math.min(1.15, 4.9 / qs.length);
      qs.forEach((q, i) => {
        const y = 1.8 + i * rh;
        badge(s, 'Q' + (i + 1), M, y + (rh - 0.65) / 2, 0.65, C.seal, 15);
        s.addText(q, { x: M + 0.9, y, w: W - 2 * M - 0.9, h: rh - 0.1, fontFace: F, fontSize: 17, color: C.inkText, valign: 'middle', margin: 0, isTextBox: true });
      });
      foot(s, true); s.addNotes(notes || ''); return s;
    },
    summary(items, next, notes) {
      const s = light(); title(s, '핵심 정리', '정리');
      const rh = Math.min(0.95, (next ? 4.1 : 4.8) / items.length);
      items.forEach((it, i) => {
        const y = 1.75 + i * rh;
        badge(s, String(i + 1), M, y + (rh - 0.5) / 2, 0.5, C.seal, 14);
        s.addText(it, { x: M + 0.75, y, w: W - 2 * M - 0.75, h: rh - 0.05, fontFace: F, fontSize: 16, color: C.text, valign: 'middle', margin: 0, isTextBox: true });
      });
      if (next) s.addText([{ text: '다음 시간  ', options: { bold: true, color: C.seal } }, { text: next, options: { color: C.text } }],
        { x: M, y: H - 1.45, w: W - 2 * M, h: 0.7, fontFace: F, fontSize: 15, fill: { color: C.tint }, margin: [0, 0.2, 0, 0.2], valign: 'middle', isTextBox: true });
      foot(s); s.addNotes(notes || ''); return s;
    },
    // 자유 배치 슬라이드: fn(s, {badge, F, C, W, H, M})
    custom(t, kicker, notes, fn) {
      const s = light(); title(s, t, kicker);
      fn(s, { badge: (...a) => badge(s, ...a), F, C, W, H, M, colorOf, shapes: pres.shapes });
      foot(s); s.addNotes(notes || ''); return s;
    },
    save(file) { return pres.writeFile({ fileName: file }); },
  };
  return api;
}
module.exports = { deck, C, EL };
