/* screens2_fasting.jsx — codex fast overview + check-in */

function FastOverview2() {
  const permitted = ['Vegetables & grains','Legumes, bread, oil','Fruit & nuts','Black coffee, tea'];
  const forbidden = ['Meat & poultry','Dairy & eggs','Fish (today)','Wine'];
  return (
    <Page>
      <Folio left="On the fast" right="Day 9 of 27" glyph="ⲛ"/>
      <Body style={{ paddingTop:22 }}>
        <Caps size={10} ls={3} color={K.rubricHi}>The fast now kept</Caps>
        <h1 style={{ fontFamily:K.disp, fontSize:46, fontWeight:600, lineHeight:0.98, margin:'8px 0 4px' }}>The Apostles’<br/>Fast</h1>
        <Copt size={18} color={K.gold}>ⲛⲏⲥⲧⲓⲁ ⲛ̄ⲛⲓⲁⲡⲟⲥⲧⲟⲗⲟⲥ</Copt>
        <p style={{ fontFamily:K.disp, fontSize:19, fontStyle:'italic', color:K.ink2, lineHeight:1.45, margin:'14px 0 4px' }}>
          From Pentecost to the feast of Sts. Peter &amp; Paul — fasting in the spirit of the apostles before they went out to preach.
        </p>
        {/* progress as engraved ledger + tally */}
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', margin:'22px 0 10px', paddingTop:14, borderTop:`1px solid ${K.rule}` }}>
          <div>
            <Numeral size={52} oldstyle color={K.goldHi}>ix</Numeral>
            <Caps size={9} ls={2} color={K.ink3} style={{ marginLeft:6 }}>of xxvii days</Caps>
          </div>
          <div style={{ textAlign:'right' }}>
            <Caps size={9} ls={2} color={K.rubricHi}>to the feast</Caps>
            <div><Numeral size={34} oldstyle color={K.parch}>18</Numeral></div>
          </div>
        </div>
        <Tally total={27} filled={9} today={9} w={6} h={14} gap={2}/>
        {/* permitted / forbidden ledger */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:0, marginTop:24, border:`1px solid ${K.rule}` }}>
          <div style={{ padding:'12px 14px', borderRight:`1px solid ${K.rule}` }}>
            <Caps size={9.5} ls={2} color={K.feast}>Permitted</Caps>
            <div style={{ marginTop:8 }}>
              {permitted.map(x=><div key={x} style={{ fontFamily:K.disp, fontSize:17, padding:'4px 0', borderBottom:`1px solid ${K.ruleDim}` }}>{x}</div>)}
            </div>
          </div>
          <div style={{ padding:'12px 14px' }}>
            <Caps size={9.5} ls={2} color={K.rubricHi}>Withheld</Caps>
            <div style={{ marginTop:8 }}>
              {forbidden.map(x=><div key={x} style={{ fontFamily:K.disp, fontSize:17, padding:'4px 0', borderBottom:`1px solid ${K.ruleDim}`, color:K.ink2, textDecoration:'line-through', textDecorationColor:K.rule }}>{x}</div>)}
            </div>
          </div>
        </div>
        <p style={{ display:'flex', gap:8, alignItems:'baseline', marginTop:14, fontFamily:K.disp, fontSize:17, fontStyle:'italic', color:K.ink2 }}>
          <Copt size={13} color={K.gold}>†</Copt> Strict until the Ninth Hour; many break the fast after the None prayer.
        </p>
      </Body>
      <Nav active="office"/>
    </Page>
  );
}

function FastCheckin2() {
  const days = [['M','✓'],['T','✓'],['W','/'],['T','✓'],['F','◆'],['S',''],['S','']];
  return (
    <Page>
      <Folio left="The fast · an account" right="Friday vi June" glyph="ⲛ"/>
      <Body style={{ paddingTop:24 }}>
        <div style={{ textAlign:'center', padding:'10px 0 22px', borderBottom:`1px solid ${K.rule}` }}>
          <Caps size={9.5} ls={3} color={K.rubricHi}>Friday · Apostles’ Fast</Caps>
          <h1 style={{ fontFamily:K.disp, fontSize:34, fontWeight:600, lineHeight:1.05, margin:'12px 0 6px' }}>Did you keep<br/>the fast today?</h1>
          <p style={{ fontFamily:K.disp, fontSize:17, fontStyle:'italic', color:K.ink2 }}>Honest and gentle — for growth, never for guilt.</p>
        </div>
        <div style={{ display:'flex', gap:0, margin:'18px 0 4px', border:`1px solid ${K.rule}` }}>
          <button style={{ flex:1, padding:'15px', background:K.gold, color:'#1A1303', border:'none', fontFamily:K.text, fontSize:11, letterSpacing:2.5, textTransform:'uppercase', fontWeight:600 }}>Kept fully</button>
          <button style={{ flex:1, padding:'15px', background:'transparent', color:K.parch, border:'none', borderLeft:`1px solid ${K.rule}`, fontFamily:K.text, fontSize:11, letterSpacing:2.5, textTransform:'uppercase', fontWeight:600 }}>In part</button>
        </div>
        <Rubric num="Ⲅ" style={{ marginTop:26, marginBottom:14 }}>This week</Rubric>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          {days.map(([d,mk],i)=>(
            <div key={i} style={{ textAlign:'center' }}>
              <div style={{ width:38, height:46, border:`1px solid ${mk==='◆'?K.gold:K.ruleDim}`, display:'grid', placeItems:'center',
                background:mk==='✓'?'rgba(201,168,74,0.12)':'transparent' }}>
                <span style={{ fontFamily:K.disp, fontSize:22, color:mk==='✓'?K.gold:(mk==='◆'?K.goldHi:K.ink3) }}>
                  {mk==='◆'?'·':(mk||'')}
                </span>
              </div>
              <div style={{ marginTop:6 }}><Caps size={9} ls={1} color={i===4?K.goldHi:K.ink3}>{d}</Caps></div>
            </div>
          ))}
        </div>
        {/* season ledger */}
        <div style={{ display:'flex', marginTop:26, borderTop:`1px solid ${K.rule}`, borderBottom:`1px solid ${K.rule}` }}>
          {[['23','days kept'],['89','% wed & fri']].map(([n,l],i)=>(
            <div key={i} style={{ flex:1, padding:'16px 0', textAlign:'center', borderLeft:i?`1px solid ${K.ruleDim}`:'none' }}>
              <Numeral size={42} oldstyle color={K.goldHi}>{n}</Numeral>
              <div><Caps size={9} ls={1.6} color={K.ink3}>{l}</Caps></div>
            </div>
          ))}
        </div>
      </Body>
      <Nav active="office"/>
    </Page>
  );
}

Object.assign(window, { FastOverview2, FastCheckin2 });
