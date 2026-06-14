/* screens2_calendar.jsx — the Ordo (typographic liturgical calendar) + day detail */

function Ordo2() {
  // mark: 'feast' | 'fast' | '' (plain) ; rank shown by name weight/color
  const days = [
    ['1','Sun','Apostles’ Fast continues','fast'],
    ['3','Tue','Fast · Wednesday eve','fast'],
    ['5','Thu','St. Athanasius the Apostolic','fast'],
    ['6','Fri','St. Mark the Evangelist','today'],
    ['8','Sun','Sixth Sunday after Pentecost',''],
    ['12','Thu','Archangel Michael','feast'],
    ['17','Tue','St. Anthony the Great','fast'],
    ['21','Sat','St. Mary the Theotokos','feast'],
    ['24','Tue','Sts. Peter & Paul — Feast','feast'],
    ['29','Sun','Nativity · Annunciation · Resurrection','feast'],
  ];
  return (
    <Page>
      <Folio left="The Ordo" right="June · Pentecost" glyph="ⲡ"/>
      <Body style={{ paddingTop:18 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
          <div>
            <Caps size={9.5} ls={3} color={K.rubricHi}>Calendar of the Church</Caps>
            <h1 style={{ fontFamily:K.disp, fontSize:42, fontWeight:600, lineHeight:0.95, margin:'4px 0 0' }}>June</h1>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <div style={{ width:30, height:30, border:`1px solid ${K.rule}`, display:'grid', placeItems:'center', transform:'rotate(180deg)' }}><Ic name="chevR" size={13} color={K.ink2}/></div>
            <div style={{ width:30, height:30, border:`1px solid ${K.rule}`, display:'grid', placeItems:'center' }}><Ic name="chevR" size={13} color={K.ink2}/></div>
          </div>
        </div>
        {/* season banner rubricated */}
        <div style={{ display:'flex', alignItems:'center', gap:8, margin:'14px 0 6px', padding:'9px 0', borderTop:`1px solid ${K.rule}`, borderBottom:`1px solid ${K.rule}` }}>
          <Cross2 size={14} color={K.rubricHi}/><Caps size={9.5} ls={1.8} color={K.rubricHi}>Apostles’ Fast season · vegan</Caps>
        </div>
        {/* the ordo register */}
        <div>
          {days.map(([n,wd,name,mk],i)=>{
            const isToday = mk==='today', isFeast = mk==='feast', isFast = mk==='fast';
            return (
              <div key={i} style={{ display:'flex', alignItems:'baseline', gap:13, padding:'10px 4px',
                borderBottom:`1px solid ${K.ruleDim}`, background:isToday?'rgba(201,168,74,0.06)':'transparent' }}>
                <div style={{ width:30, textAlign:'right' }}>
                  <Numeral size={22} oldstyle color={isToday?K.goldHi:K.ink2}>{n}</Numeral>
                </div>
                <Caps size={8.5} ls={1.4} color={K.ink3} style={{ width:24 }}>{wd}</Caps>
                {/* mark */}
                <div style={{ width:10, display:'grid', placeItems:'center' }}>
                  {isFeast && <div style={{ width:7, height:7, transform:'rotate(45deg)', background:K.feast }}/>}
                  {isFast && <div style={{ width:6, height:6, borderRadius:9, background:K.rubric }}/>}
                  {isToday && <Cross2 size={12} color={K.gold}/>}
                </div>
                <span style={{ flex:1, fontFamily:K.disp, fontSize:isFeast?20:18, fontWeight:isFeast?600:500,
                  fontStyle:isFeast?'normal':'italic',
                  color:isFeast?K.feast:(isToday?K.parch:K.ink2) }}>{name}</span>
              </div>
            );
          })}
        </div>
        {/* legend */}
        <div style={{ display:'flex', gap:20, justifyContent:'center', marginTop:16 }}>
          <span style={{ display:'flex', gap:6, alignItems:'center' }}><div style={{ width:7, height:7, transform:'rotate(45deg)', background:K.feast }}/><Caps size={9} ls={1.4} color={K.ink2}>Feast</Caps></span>
          <span style={{ display:'flex', gap:6, alignItems:'center' }}><div style={{ width:6, height:6, borderRadius:9, background:K.rubric }}/><Caps size={9} ls={1.4} color={K.ink2}>Fast</Caps></span>
          <span style={{ display:'flex', gap:6, alignItems:'center' }}><Cross2 size={11} color={K.gold}/><Caps size={9} ls={1.4} color={K.ink2}>Today</Caps></span>
        </div>
      </Body>
      <Nav active="office"/>
    </Page>
  );
}

function CalendarDay2() {
  return (
    <Page>
      <Folio left="The Synaxarium" right="vi June · xxix Bashans" glyph="ⲙ"/>
      <Body style={{ paddingTop:16 }}>
        <Plate h={158} label="icon · St. Mark the Evangelist"/>
        <div style={{ textAlign:'center', marginTop:14 }}>
          <Caps size={9.5} ls={3} color={K.rubricHi}>Commemoration of the day</Caps>
          <h1 style={{ fontFamily:K.disp, fontSize:34, fontWeight:600, lineHeight:1.0, margin:'8px 0 2px' }}>St. Mark<br/>the Evangelist</h1>
          <Caps size={9} ls={2} color={K.ink3}>Apostle · martyr · a.d. 68</Caps>
        </div>
        <Fleuron style={{ margin:'16px 0' }}/>
        <p style={{ fontFamily:K.disp, fontSize:19, lineHeight:1.6, color:K.ink2 }}>
          <span style={{ fontFamily:K.disp, fontSize:46, fontWeight:600, color:K.rubricHi, float:'left', lineHeight:0.72, margin:'5px 10px 0 0' }}>T</span>
          he winged lion of the four evangelists; the first to carry the Gospel into Egypt and found the See of Alexandria. By his preaching the Coptic Church was born.
        </p>
        {/* day facts ledger */}
        <div style={{ marginTop:14 }}>
          {[['Fast','Apostles’ · Friday · vegan',K.rubricHi],['Reading','John 6 · the Bread of Life',K.gold],['Hours','Prime · Terce · Sext · None · Vespers',K.gold]].map(([t,s,c],i)=>(
            <div key={i} style={{ display:'flex', alignItems:'baseline', gap:12, padding:'11px 0', borderTop:i===0?`1px solid ${K.rule}`:'none', borderBottom:`1px solid ${K.ruleDim}` }}>
              <Caps size={9} ls={1.8} color={c} style={{ width:64 }}>{t}</Caps>
              <span style={{ flex:1, fontFamily:K.disp, fontSize:18 }}>{s}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop:16 }}><Btn kind="line">Read the full life →</Btn></div>
      </Body>
      <Nav active="office"/>
    </Page>
  );
}

Object.assign(window, { Ordo2, CalendarDay2 });
