/* screens2_foundations.jsx — codex brand title-page + system reference */

function PharosSeal({ size = 64, color = K.gold }) {
  // beacon within a ruled roundel
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="30" stroke={color} strokeWidth="1" opacity="0.5"/>
      <circle cx="32" cy="32" r="25" stroke={color} strokeWidth="0.6" opacity="0.3"/>
      <g stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.7">
        <path d="M32 22 L24 14"/><path d="M32 22 L40 14"/><path d="M32 22 L18 22"/><path d="M32 22 L46 22"/>
      </g>
      <circle cx="32" cy="22" r="3.4" fill={color}/>
      <path d="M28 26 L36 26 L38 48 L26 48 Z" fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M27 34 L37 34 M26.5 41 L37.5 41" stroke={color} strokeWidth="1"/>
    </svg>
  );
}
window.PharosSeal = PharosSeal;

function BrandBoard2() {
  const names = [
    ['Ⲡ','Pharos','The lighthouse of Alexandria','Guiding light · the See of St. Mark', true],
    ['Ⲧ','Tasbeha','Praise · the night office','Worship-forward, distinctly Coptic', false],
    ['Ⲙ','Manara','Lampstand · beacon','“You are the light of the world”', false],
    ['Ⲙ','Metanoia','Repentance · the prostration','The inner turning of the heart', false],
  ];
  return (
    <div style={{ width:760, background:K.bg, position:'relative', fontFamily:K.text, color:K.parch, padding:'40px 46px' }}>
      <div style={{ position:'absolute', inset:14, border:`1px solid ${K.rule}`, pointerEvents:'none' }} />
      <div style={{ position:'relative' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:9, borderBottom:`1px solid ${K.rule}` }}>
          <Caps size={10} ls={3} color={K.ink2}>Pharos · a book of hours, alive</Caps>
          <Caps size={10} ls={2.4} color={K.ink3}>Brand · folio i</Caps>
        </div>
        {/* title block */}
        <div style={{ display:'flex', gap:30, alignItems:'center', margin:'34px 0 10px' }}>
          <PharosSeal size={108}/>
          <div>
            <Caps size={11} ls={4} color={K.rubricHi}>The lighthouse of Alexandria</Caps>
            <div style={{ fontFamily:K.disp, fontSize:88, fontWeight:600, lineHeight:0.86, letterSpacing:0.5, margin:'8px 0 6px' }}>Pharos</div>
            <Copt size={26} color={K.gold}>ⲡⲓⲫⲁⲣⲟⲥ</Copt>
          </div>
        </div>
        <p style={{ fontSize:15.5, lineHeight:1.7, color:K.ink2, maxWidth:560, margin:'18px 0 30px' }}>
          <span style={{ fontFamily:K.disp, fontSize:52, fontWeight:600, color:K.gold, float:'left', lineHeight:0.7, margin:'6px 12px 0 0' }}>N</span>
          amed for the great lighthouse that stood over the harbour of Alexandria — the city of St. Mark, the See of the Coptic Church. A beacon to draw the young faithful, day by day, into the rhythm of prayer, fasting, and Scripture.
        </p>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
          <Caps size={10} ls={2.6} color={K.rubricHi}>The names considered</Caps>
          <div style={{ flex:1, height:1, background:K.rule }} />
        </div>
        {/* names as ruled register */}
        <div>
          {names.map(([g,n,t,w,on],i)=>(
            <div key={n} style={{ display:'flex', alignItems:'center', gap:20, padding:'15px 4px',
              borderBottom:`1px solid ${K.ruleDim}`, background:on?'rgba(201,168,74,0.05)':'transparent' }}>
              <Copt size={30} color={on?K.gold:K.ink3} style={{ width:34, textAlign:'center' }}>{g}</Copt>
              <div style={{ width:150 }}>
                <span style={{ fontFamily:K.disp, fontSize:32, fontWeight:600 }}>{n}</span>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, color:K.parch }}>{t}</div>
                <div style={{ fontSize:12.5, color:K.ink3, fontStyle:'italic' }}>{w}</div>
              </div>
              {on && <Caps size={9.5} ls={2} color={K.gold} style={{ border:`1px solid ${K.rule}`, padding:'4px 9px' }}>Chosen</Caps>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SystemBoard2() {
  const sw = (c,n,h) => (
    <div key={n} style={{ flex:1 }}>
      <div style={{ height:52, background:c, border:`1px solid ${K.ruleDim}` }} />
      <div style={{ marginTop:7 }}><Caps size={9} ls={1.6} color={K.ink2}>{n}</Caps></div>
      <div><Caps size={8.5} ls={1} color={K.ink3}>{h}</Caps></div>
    </div>
  );
  return (
    <div style={{ width:760, background:K.bg, position:'relative', fontFamily:K.text, color:K.parch, padding:'40px 46px' }}>
      <div style={{ position:'absolute', inset:14, border:`1px solid ${K.rule}`, pointerEvents:'none' }} />
      <div style={{ position:'relative' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:9, borderBottom:`1px solid ${K.rule}`, marginBottom:26 }}>
          <Caps size={10} ls={3} color={K.ink2}>The hand of the book · materials</Caps>
          <Caps size={10} ls={2.4} color={K.ink3}>System · folio ii</Caps>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1.1fr 1fr', gap:46 }}>
          <div>
            <Caps size={10} ls={2.6} color={K.rubricHi}>The letterforms</Caps>
            <div style={{ fontFamily:K.disp, fontSize:62, fontWeight:600, lineHeight:0.95, marginTop:10 }}>Cormorant</div>
            <Caps size={9} ls={2} color={K.ink3} style={{ display:'block', marginTop:2 }}>Display · numerals · pull-quotes &nbsp; 0123456789</Caps>
            <div style={{ fontFamily:K.text, fontSize:23, marginTop:18 }}>Spectral — the reading & UI hand</div>
            <Caps size={9} ls={2} color={K.ink3} style={{ display:'block', marginTop:4 }}>Body · labels · running heads</Caps>
            <div style={{ marginTop:18 }}><Copt size={34} color={K.gold}>ⲁ ⲅ ⲁ ⲡ ⲏ &nbsp; † &nbsp; ⲡⲭⲥ</Copt></div>
            <Caps size={9} ls={2} color={K.ink3} style={{ display:'block', marginTop:6 }}>Noto Sans Coptic · ornament</Caps>
          </div>
          <div>
            <Caps size={10} ls={2.6} color={K.rubricHi}>The colours</Caps>
            <div style={{ display:'flex', gap:10, marginTop:12 }}>
              {sw(K.bg,'Ink','#0C1020')}{sw(K.gold,'Gold','#C9A84A')}{sw(K.rubric,'Rubric','vermilion')}{sw(K.parch,'Parch.','#ECE4D2')}
            </div>
            <Caps size={10} ls={2.6} color={K.rubricHi} style={{ display:'block', marginTop:24 }}>The marks</Caps>
            <div style={{ marginTop:14 }}><Rubric num="Ⲁ">Rubricated header</Rubric></div>
            <div style={{ marginTop:14 }}><Fleuron/></div>
            <div style={{ display:'flex', alignItems:'baseline', gap:14, marginTop:16 }}>
              <Numeral size={48} color={K.goldHi} oldstyle>14</Numeral>
              <Caps size={9.5} ls={2} color={K.ink2}>engraved<br/>numeral</Caps>
              <div style={{ flex:1 }}><Btn kind="line">Begin →</Btn></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BrandBoard2, SystemBoard2 });
