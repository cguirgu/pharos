/* ds2.jsx — Pharos "Book of Hours / Codex" design language
   Ruled registers, rubricated headers, drop caps, engraved numerals,
   hairline frames + registration ticks, Coptic-script ornament, type-driven nav.
   Same navy+gold palette, warmed toward parchment. */

const K = {
  bg:      '#0C1020',          // oxford ink
  bg2:     '#0E1426',
  panel:   'rgba(201,168,74,0.04)',
  gold:    '#C9A84A',
  goldHi:  '#E7CE84',
  rubric:  '#B8453A',          // liturgical vermilion / oxblood-red
  rubricHi:'oklch(0.66 0.15 30)',
  feast:   'oklch(0.74 0.1 150)',
  parch:   '#ECE4D2',          // warm parchment text
  ink2:    '#B7AE96',          // warm taupe (secondary)
  ink3:    '#7C745F',          // dim
  rule:    'rgba(201,168,74,0.22)',   // ornamental gold hairline
  ruleDim: 'rgba(236,228,210,0.10)',  // structural hairline
  disp:    "'Cormorant Garamond', Georgia, serif",
  text:    "'Spectral', Georgia, serif",
  copt:    "'Noto Sans Coptic', 'Cormorant Garamond', serif",
};
window.K = K;

/* letterspaced serif small-caps label */
function Caps({ children, color = K.ink3, size = 10.5, ls = 2.6, weight = 600, style }) {
  return <span style={{ fontFamily:K.text, fontSize:size, letterSpacing:ls, textTransform:'uppercase',
    fontWeight:weight, color, ...style }}>{children}</span>;
}

/* Coptic-script ornament span */
function Copt({ children, size = 14, color = K.gold, style }) {
  return <span style={{ fontFamily:K.copt, fontSize:size, color, lineHeight:1, ...style }}>{children}</span>;
}

/* phone page with optional printed frame + corner registration ticks */
function Tick({ pos }) {
  const m = 12, len = 9;
  const base = { position:'absolute', width:len, height:len, borderColor:K.rule, pointerEvents:'none' };
  const map = {
    tl:{ top:m, left:m, borderTop:'1px solid', borderLeft:'1px solid' },
    tr:{ top:m, right:m, borderTop:'1px solid', borderRight:'1px solid' },
    bl:{ bottom:m, left:m, borderBottom:'1px solid', borderLeft:'1px solid' },
    br:{ bottom:m, right:m, borderBottom:'1px solid', borderRight:'1px solid' },
  };
  return <div style={{ ...base, ...map[pos] }} />;
}

function Page({ children, bg = K.bg, frame, ticks }) {
  return (
    <div style={{ width:390, height:844, background:bg, position:'relative', overflow:'hidden',
      fontFamily:K.text, color:K.parch, display:'flex', flexDirection:'column' }}>
      {/* faint laid-paper texture + vignette */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', opacity:0.5,
        background:'repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0 1px, transparent 1px 4px)' }} />
      <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        background:'radial-gradient(120% 80% at 50% 0%, transparent 55%, rgba(0,0,0,0.35))' }} />
      <StatusBar2 />
      <div style={{ position:'absolute', top:11, left:'50%', transform:'translateX(-50%)', width:120, height:32, background:'#000', borderRadius:18, zIndex:60 }} />
      {frame && <div style={{ position:'absolute', inset:9, border:`1px solid ${K.rule}`, pointerEvents:'none', zIndex:1 }} />}
      {ticks && <>{['tl','tr','bl','br'].map(p=><Tick key={p} pos={p}/>)}</>}
      <div style={{ position:'relative', flex:1, display:'flex', flexDirection:'column', minHeight:0, zIndex:2 }}>{children}</div>
    </div>
  );
}

function StatusBar2() {
  const c = K.parch;
  return (
    <div style={{ height:42, display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 22px 0 26px', color:c, flexShrink:0, position:'relative', zIndex:3 }}>
      <span style={{ fontFamily:K.text, fontWeight:600, fontSize:14 }}>9:41</span>
      <div style={{ display:'flex', gap:6, alignItems:'center', opacity:0.85 }}>
        <svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="3" width="2.5" height="8" rx="1" fill={c}/><rect x="4.5" y="1.5" width="2.5" height="9.5" rx="1" fill={c}/><rect x="9" y="0" width="2.5" height="11" rx="1" fill={c}/><rect x="13.5" y="0" width="2.5" height="11" rx="1" fill={c} opacity="0.4"/></svg>
        <svg width="25" height="12" viewBox="0 0 25 12"><rect x="0.7" y="0.7" width="21" height="10.6" rx="2.5" stroke={c} strokeOpacity="0.5" fill="none"/><rect x="2" y="2" width="16" height="8" rx="1" fill={c}/><rect x="23" y="4" width="1.5" height="4" rx="0.75" fill={c} fillOpacity="0.5"/></svg>
      </div>
    </div>
  );
}

/* running head (folio) with rule beneath */
function Folio({ left, right, glyph }) {
  return (
    <div style={{ padding:'4px 26px 0' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {glyph && <Copt size={13} color={K.gold}>{glyph}</Copt>}
          <Caps size={9.5} ls={2.8} color={K.ink2}>{left}</Caps>
        </div>
        <Caps size={9.5} ls={2.4} color={K.ink3}>{right}</Caps>
      </div>
      <div style={{ height:1, background:K.rule }} />
    </div>
  );
}

/* content body with manuscript margin */
function Body({ children, style }) {
  return <div style={{ flex:1, overflow:'hidden', padding:'0 26px', minHeight:0, ...style }}>{children}</div>;
}

/* rubricated section header: red caps + leader rule */
function Rubric({ children, num, color = K.rubricHi, style }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, margin:'0', ...style }}>
      {num && <Copt size={13} color={K.gold} style={{ fontFamily:K.disp, fontWeight:600 }}>{num}</Copt>}
      <Caps size={10} ls={2.6} color={color} weight={600}>{children}</Caps>
      <div style={{ flex:1, height:1, background:K.rule }} />
    </div>
  );
}

/* ornamental divider — cross fleuron between rules */
function Fleuron({ style }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, ...style }}>
      <div style={{ flex:1, height:1, background:K.rule }} />
      <svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 1v12M1 7h12M3.5 7l0 0M7 3.5l0 0" stroke={K.gold} strokeWidth="1" strokeLinecap="round"/><circle cx="7" cy="7" r="1.3" fill={K.gold}/></svg>
      <div style={{ flex:1, height:1, background:K.rule }} />
    </div>
  );
}

/* ruled register row */
function Register({ children, onTop, style }) {
  return <div style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 0',
    borderTop:onTop?`1px solid ${K.ruleDim}`:'none', borderBottom:`1px solid ${K.ruleDim}`, ...style }}>{children}</div>;
}

/* big engraved numeral */
function Numeral({ children, size = 64, color = K.parch, oldstyle, style }) {
  return <span style={{ fontFamily:K.disp, fontSize:size, fontWeight:600, lineHeight:0.9, color,
    fontFeatureSettings: oldstyle?'"onum" 1':'"lnum" 1', ...style }}>{children}</span>;
}

/* letterpress button — sharp, letterspaced caps */
function Btn({ children, kind = 'solid', style }) {
  const base = { width:'100%', padding:'14px', fontFamily:K.text, fontSize:11.5, letterSpacing:2.5,
    textTransform:'uppercase', fontWeight:600, cursor:'pointer', border:'none', borderRadius:0 };
  const kinds = {
    solid: { background:K.gold, color:'#1A1303' },
    line:  { background:'transparent', color:K.goldHi, border:`1px solid ${K.rule}` },
    rubric:{ background:'transparent', color:K.rubricHi, border:`1px solid rgba(184,69,58,0.4)` },
  };
  return <button style={{ ...base, ...kinds[kind], ...style }}>{children}</button>;
}

/* refined Coptic cross (flared tau arms) */
function Cross2({ size = 22, color = K.gold, sw = 1.6 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round">
      <path d="M12 2.5V21.5M4.5 9.5H19.5"/>
      <path d="M9.5 2.5h5M9.5 21.5h5M4.5 7h0M19.5 7h0M4.5 12h0M19.5 12h0" strokeWidth={sw*0.9}/>
      <path d="M9 2.5C9 4 10 5 12 5s3-1 3-2.5M9 21.5c0-1.5 1-2.5 3-2.5s3 1 3 2.5M4.5 7c1.5 0 2.5 1 2.5 2.5S6 12 4.5 12M19.5 7c-1.5 0-2.5 1-2.5 2.5s1 2.5 2.5 2.5"/>
    </svg>
  );
}

/* striped image placeholder, sharp corners + ruled label */
function Plate({ h = 120, label = 'plate', style }) {
  return (
    <div style={{ height:h, position:'relative', overflow:'hidden',
      background:`repeating-linear-gradient(135deg, rgba(201,168,74,0.05), rgba(201,168,74,0.05) 9px, transparent 9px, transparent 18px)`,
      border:`1px solid ${K.rule}`, display:'grid', placeItems:'center', ...style }}>
      <Caps size={9.5} ls={2} color={K.ink2} style={{ background:K.bg, padding:'4px 9px' }}>{label}</Caps>
    </div>
  );
}

/* minimal stroke icon set (used sparingly) */
const I2 = {
  check:'M4 12.5 9 17.5 20 6.5', chevR:'M9 5l7 7-7 7', plus:'M12 5v14M5 12h14',
  pen:'M4 20h4L19 9l-4-4L4 16zM14 6l4 4', bell:'M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6M10 21h4',
  clock:'M12 7v5l3 2M12 21a9 9 0 100-18 9 9 0 000 18z',
};
function Ic({ name, size = 18, color = K.parch, sw = 1.4 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d={I2[name]||''}/></svg>;
}

/* type-driven nav ledger */
function Nav({ active = 'today' }) {
  const items = [['today','Today'],['office','Hours'],['word','Scripture'],['journal','Journal'],['you','You']];
  return (
    <div style={{ marginTop:'auto', flexShrink:0, paddingBottom:24, position:'relative', zIndex:5 }}>
      <div style={{ height:1, background:K.rule }} />
      <div style={{ display:'flex' }}>
        {items.map(([k,l],i)=>{
          const on = k===active;
          return (
            <div key={k} style={{ flex:1, textAlign:'center', padding:'12px 0 8px', position:'relative',
              borderLeft:i?`1px solid ${K.ruleDim}`:'none' }}>
              <div style={{ height:6, marginBottom:7, display:'grid', placeItems:'center' }}>
                {on && <div style={{ width:5, height:5, background:K.gold, transform:'rotate(45deg)' }} />}
              </div>
              <Caps size={9} ls={1.6} color={on?K.goldHi:K.ink3} weight={on?700:600}>{l}</Caps>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { K, Caps, Copt, Page, Folio, Body, Rubric, Fleuron, Register, Numeral, Btn, Cross2, Plate, Ic, Nav });
