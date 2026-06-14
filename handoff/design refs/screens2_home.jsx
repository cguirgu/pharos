/* screens2_home.jsx — three codex home variations */

/* tally strip: filled/empty ruled cells */
function Tally({ total = 14, filled = 14, today, w = 8, h = 16, gap = 3 }) {
  return (
    <div style={{ display:'flex', gap }}>
      {Array.from({length:total}).map((_,i)=>(
        <div key={i} style={{ width:w, height:h, border:`1px solid ${i<filled?K.gold:K.rule}`,
          background:i<filled?K.gold:'transparent', opacity:i<filled?(0.45+i/total*0.55):1,
          ...(today===i?{ outline:`1px solid ${K.goldHi}`, outlineOffset:1 }:{}) }} />
      ))}
    </div>
  );
}
window.Tally = Tally;

/* ── HOME A · the Ordo page ── */
function Home2A() {
  const office = [
    ['Prime','The Resurrection','vi','kept'],
    ['Lauds · the Word','John 6 · Bread of Life','—','kept'],
    ['Sext','The Crucifixion','xii','now'],
    ['A reflection','One ruled line','—',''],
  ];
  return (
    <Page>
      <Folio left="Friday · the sixth of June" right="Day 9 · Apostles’ Fast" glyph="ⲡ"/>
      <Body style={{ paddingTop:18 }}>
        {/* greeting + streak margin numeral */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <Caps size={9.5} ls={3} color={K.rubricHi}>The morning</Caps>
            <h1 style={{ fontFamily:K.disp, fontSize:40, fontWeight:600, lineHeight:1, margin:'6px 0 0' }}>Peace to you,<br/>Mina</h1>
          </div>
          <div style={{ textAlign:'center', borderLeft:`1px solid ${K.ruleDim}`, paddingLeft:14 }}>
            <Numeral size={50} color={K.goldHi} oldstyle>14</Numeral>
            <div><Caps size={8.5} ls={2} color={K.ink3}>days kept</Caps></div>
          </div>
        </div>
        {/* fast line, rubricated */}
        <div style={{ display:'flex', alignItems:'center', gap:10, margin:'20px 0 6px', padding:'10px 0', borderTop:`1px solid ${K.rule}`, borderBottom:`1px solid ${K.rule}` }}>
          <Cross2 size={16} color={K.rubricHi}/>
          <Caps size={10} ls={1.8} color={K.rubricHi}>Fast day</Caps>
          <span style={{ fontFamily:K.disp, fontSize:18, fontStyle:'italic', color:K.ink2 }}>abstain from animal things · vegan fare</span>
        </div>
        <Rubric num="Ⲁ" style={{ marginTop:22, marginBottom:4 }}>The hours today</Rubric>
        {/* ordo list */}
        <div>
          {office.map(([t,s,time,st],i)=>(
            <div key={i} style={{ display:'flex', alignItems:'baseline', gap:14, padding:'12px 0', borderBottom:`1px solid ${K.ruleDim}`, opacity:st==='kept'?0.5:1 }}>
              <Numeral size={17} oldstyle color={st==='now'?K.goldHi:K.ink3} style={{ width:26, textAlign:'right', fontStyle:'italic' }}>{time}</Numeral>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:K.disp, fontSize:24, fontWeight:600, lineHeight:1.05, textDecoration:st==='kept'?'line-through':'none', textDecorationColor:K.rule }}>{t}</div>
                <div style={{ fontSize:12.5, color:K.ink2, fontStyle:'italic' }}>{s}</div>
              </div>
              {st==='kept' && <Cross2 size={14} color={K.gold}/>}
              {st==='now' && <Caps size={9} ls={2} color={K.goldHi} style={{ border:`1px solid ${K.rule}`, padding:'3px 7px' }}>Pray</Caps>}
            </div>
          ))}
        </div>
      </Body>
      <Nav active="today"/>
    </Page>
  );
}

/* ── HOME B · the illuminated hour ── */
function Home2B() {
  return (
    <Page frame ticks>
      <Folio left="The sixth hour · noon" right="Friday vi June" glyph="ⲋ"/>
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 38px', textAlign:'center' }}>
        <Caps size={10} ls={3.5} color={K.rubricHi}>The next office</Caps>
        <h1 style={{ fontFamily:K.disp, fontSize:62, fontWeight:600, lineHeight:0.98, margin:'14px 0 4px' }}>Sext</h1>
        <Copt size={18} color={K.gold}>ⲁϫⲡ ⲋ̄</Copt>
        <Fleuron style={{ margin:'24px 8px' }}/>
        <p style={{ fontFamily:K.text, fontSize:14.5, lineHeight:1.7, color:K.ink2 }}>
          Pray with the Church at noon — the hour of the Crucifixion. A short office; five quiet minutes facing east.
        </p>
        <p style={{ fontFamily:K.disp, fontSize:27, fontStyle:'italic', color:K.goldHi, lineHeight:1.4, margin:'22px 0 6px' }}>
          “Seven times a day<br/>I praise You.”
        </p>
        <Caps size={9} ls={2.5} color={K.ink3}>Psalm cxix · 164</Caps>
      </div>
      <div style={{ padding:'0 38px 14px' }}>
        <Btn>Begin the prayer →</Btn>
      </div>
      {/* tally footer */}
      <div style={{ padding:'14px 38px 36px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <Caps size={9} ls={2} color={K.ink3}>Kept today</Caps>
        <Tally total={5} filled={2} h={14} w={9}/>
      </div>
    </Page>
  );
}

/* ── HOME C · the register / ledger ── */
function Home2C() {
  const rows = [
    ['Prime','vi','✓'],['Terce','ix','✓'],['Sext','xii','·'],['None','iii','·'],['Vespers','vi','·'],
  ];
  return (
    <Page>
      <Folio left="The day’s account" right="vi June mmxxvi" glyph="ⲡ"/>
      <Body style={{ paddingTop:18 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', paddingBottom:14, borderBottom:`1px solid ${K.rule}` }}>
          <h1 style={{ fontFamily:K.disp, fontSize:34, fontWeight:600, lineHeight:0.95, margin:0 }}>Good morning,<br/>Mina</h1>
          <Cross2 size={26} color={K.gold}/>
        </div>
        {/* fast banner rubricated */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:`1px solid ${K.ruleDim}` }}>
          <div>
            <Caps size={10} ls={1.8} color={K.rubricHi}>Apostles’ Fast · day 9</Caps>
            <div style={{ fontSize:13, color:K.ink2, fontStyle:'italic', fontFamily:K.disp }}>18 days to Sts. Peter & Paul</div>
          </div>
          <Numeral size={40} oldstyle color={K.goldHi}>18</Numeral>
        </div>
        {/* ledger of hours */}
        <Rubric num="Ⲃ" style={{ marginTop:20, marginBottom:8 }}>The hours · kept &amp; owed</Rubric>
        <div>
          {rows.map(([t,time,mk],i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', padding:'11px 0', borderBottom:`1px solid ${K.ruleDim}` }}>
              <Numeral size={16} oldstyle color={K.ink3} style={{ width:34, fontStyle:'italic' }}>{time}</Numeral>
              <span style={{ flex:1, fontFamily:K.disp, fontSize:22, fontWeight:600 }}>{t}</span>
              <span style={{ fontFamily:K.disp, fontSize:20, color:mk==='✓'?K.gold:K.ink3, width:20, textAlign:'center' }}>{mk}</span>
            </div>
          ))}
        </div>
        {/* stat ledger */}
        <div style={{ display:'flex', marginTop:20, borderTop:`1px solid ${K.rule}`, borderBottom:`1px solid ${K.rule}` }}>
          {[['14','streak'],['142','prayers'],['89','% wed/fri']].map(([n,l],i)=>(
            <div key={i} style={{ flex:1, textAlign:'center', padding:'14px 0', borderLeft:i?`1px solid ${K.ruleDim}`:'none' }}>
              <Numeral size={34} oldstyle color={K.goldHi}>{n}</Numeral>
              <div><Caps size={8.5} ls={1.6} color={K.ink3}>{l}</Caps></div>
            </div>
          ))}
        </div>
      </Body>
      <Nav active="today"/>
    </Page>
  );
}

Object.assign(window, { Home2A, Home2B, Home2C });
