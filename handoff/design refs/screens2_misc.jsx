/* screens2_misc.jsx — codex streak, saint, journal (2), profile */

function StreakDetail2() {
  const weeks = [
    ['✓','✓','✓','✓','✓','·','✓'],
    ['✓','✓','✓','✓','✓','✓','✓'],
    ['✓','·','✓','✓','✓','✓','✓'],
    ['✓','✓','✓','✓','◆','','',],
  ];
  return (
    <Page frame ticks>
      <Folio left="The lamp, tended" right="Longest · xxxi" glyph="ⲗ"/>
      <Body style={{ paddingTop:18 }}>
        <div style={{ textAlign:'center', paddingBottom:14, borderBottom:`1px solid ${K.rule}` }}>
          <Numeral size={108} oldstyle color={K.goldHi} style={{ display:'block', lineHeight:0.8 }}>14</Numeral>
          <Caps size={11} ls={4} color={K.gold} style={{ display:'block', marginTop:10 }}>days kept in a row</Caps>
          <p style={{ fontFamily:K.disp, fontSize:18, fontStyle:'italic', color:K.ink2, marginTop:12, maxWidth:280, marginInline:'auto', lineHeight:1.45 }}>
            Keep one practice each day to tend the flame.
          </p>
        </div>
        <Rubric num="Ⲏ" style={{ marginTop:20, marginBottom:12 }}>The last four weeks</Rubric>
        <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
          {weeks.map((w,i)=>(
            <div key={i} style={{ display:'flex', gap:5 }}>
              {w.map((mk,j)=>(
                <div key={j} style={{ flex:1, height:30, border:`1px solid ${mk==='◆'?K.gold:K.ruleDim}`,
                  background:mk==='✓'?'rgba(201,168,74,0.14)':'transparent', display:'grid', placeItems:'center' }}>
                  <span style={{ fontFamily:K.disp, fontSize:18, color:mk==='✓'?K.gold:K.ink3 }}>{mk==='◆'?'·':(mk==='✓'?'✓':(mk==='·'?'·':''))}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <Rubric num="Ⲑ" style={{ marginTop:22, marginBottom:6 }}>Milestones</Rubric>
        <div>
          {[['vii','The first week','kept'],['xiv','Faithful','kept'],['xl','A full Lent','']].map(([r,t,st],i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:16, padding:'13px 4px', borderBottom:`1px solid ${K.ruleDim}`, opacity:st?1:0.5 }}>
              <Numeral size={26} oldstyle color={st?K.goldHi:K.ink3} style={{ width:40, fontStyle:'italic' }}>{r}</Numeral>
              <span style={{ flex:1, fontFamily:K.disp, fontSize:22, fontWeight:600 }}>{t}</span>
              {st ? <Cross2 size={15} color={K.gold}/> : <Copt size={13} color={K.ink3}>†</Copt>}
            </div>
          ))}
        </div>
      </Body>
      <Nav active="you"/>
    </Page>
  );
}

function SaintOfDay2() {
  return (
    <Page>
      <div style={{ position:'relative' }}>
        <Plate h={290} label="icon · St. Demiana & the forty virgins" style={{ border:'none', borderBottom:`1px solid ${K.rule}` }}/>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, #0C1020 4%, transparent 55%)' }} />
        <div style={{ position:'absolute', top:14, left:22, width:34, height:34, border:`1px solid ${K.rule}`, background:'rgba(12,16,32,0.5)', display:'grid', placeItems:'center', transform:'rotate(180deg)' }}><Ic name="chevR" size={15} color={K.parch}/></div>
      </div>
      <Body style={{ marginTop:-44, position:'relative' }}>
        <Caps size={9.5} ls={3} color={K.rubricHi}>Saint of the day · Synaxarium</Caps>
        <h1 style={{ fontFamily:K.disp, fontSize:38, fontWeight:600, lineHeight:0.98, margin:'10px 0 3px' }}>St. Demiana<br/>& the Forty Virgins</h1>
        <Caps size={9} ls={2} color={K.ink3}>Martyr · c. a.d. 303 · feast xiii Tobi</Caps>
        <Fleuron style={{ margin:'16px 0' }}/>
        <p style={{ fontFamily:K.disp, fontSize:19.5, lineHeight:1.62, color:K.ink2 }}>
          <span style={{ fontFamily:K.disp, fontSize:48, fontWeight:600, color:K.rubricHi, float:'left', lineHeight:0.7, margin:'5px 11px 0 0' }}>A</span>
          noblewoman who, with forty companions, refused the emperor’s order to worship idols. Tortured under Diocletian, she became one of the most beloved saints of the Church of the Martyrs.
        </p>
        <div style={{ display:'flex', gap:10, marginTop:18 }}>
          <div style={{ flex:1 }}><Btn>Read her life</Btn></div>
          <button style={{ width:54, border:`1px solid ${K.rule}`, background:'transparent', display:'grid', placeItems:'center' }}><Cross2 size={18} color={K.ink2}/></button>
        </div>
      </Body>
      <Nav active="office"/>
    </Page>
  );
}

function JournalList2() {
  const entries = [
    ['vi','Today','On the Bread of Life','John 6 left me thinking how often I look for things that do not last…'],
    ['v','Yesterday','Kept the fast, barely','It was hard at lunch, but the Ninth Hour prayer carried me through…'],
    ['iv','Wed','Three thanksgivings','My mother’s prayers, the early light, bread on the table…'],
  ];
  return (
    <Page>
      <Folio left="The commonplace book" right="ix entries · streak ix" glyph="ⲅⲣ"/>
      <Body style={{ paddingTop:18 }}>
        <Caps size={10} ls={3} color={K.rubricHi}>Reflections</Caps>
        <h1 style={{ fontFamily:K.disp, fontSize:40, fontWeight:600, lineHeight:0.95, margin:'4px 0 14px' }}>The journal</h1>
        {/* prompt, framed */}
        <div style={{ border:`1px solid ${K.rule}`, padding:'16px 18px' }}>
          <Caps size={9} ls={2.4} color={K.gold}>Today’s prompt</Caps>
          <p style={{ fontFamily:K.disp, fontSize:24, fontStyle:'italic', lineHeight:1.32, margin:'8px 0 14px' }}>Where did you sense God’s presence today?</p>
          <Btn kind="line">Take up the pen →</Btn>
        </div>
        <Rubric num="Ⲓ" style={{ marginTop:22, marginBottom:4 }}>Lately written</Rubric>
        <div>
          {entries.map(([r,d,t,s],i)=>(
            <div key={i} style={{ display:'flex', gap:16, padding:'14px 4px', borderBottom:`1px solid ${K.ruleDim}` }}>
              <div style={{ textAlign:'center', width:34 }}>
                <Numeral size={22} oldstyle color={K.ink3}>{r}</Numeral>
                <Caps size={8} ls={1} color={K.ink3} style={{ display:'block' }}>{d}</Caps>
              </div>
              <div style={{ flex:1, borderLeft:`1px solid ${K.ruleDim}`, paddingLeft:16 }}>
                <div style={{ fontFamily:K.disp, fontSize:23, fontWeight:600, lineHeight:1.05 }}>{t}</div>
                <p style={{ fontFamily:K.disp, fontSize:16, fontStyle:'italic', color:K.ink2, margin:'3px 0 0', lineHeight:1.4 }}>{s}</p>
              </div>
            </div>
          ))}
        </div>
      </Body>
      <Nav active="journal"/>
    </Page>
  );
}

function JournalEntry2() {
  return (
    <Page>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'2px 26px 0' }}>
        <div style={{ transform:'rotate(180deg)' }}><Ic name="chevR" size={18} color={K.ink2}/></div>
        <Caps size={9} ls={2.4} color={K.ink3}>Friday · vi June</Caps>
        <button style={{ background:'transparent', border:`1px solid ${K.rule}`, padding:'6px 14px', color:K.goldHi, fontFamily:K.text, fontSize:9.5, letterSpacing:2, textTransform:'uppercase', fontWeight:600 }}>Save</button>
      </div>
      <div style={{ height:1, background:K.rule, margin:'10px 26px 0' }} />
      <Body style={{ paddingTop:16 }}>
        <div style={{ display:'flex', gap:14, marginBottom:14 }}>
          <Caps size={9} ls={1.8} color={K.gold}>† John vi</Caps>
          <Caps size={9} ls={1.8} color={K.rubricHi}>Apostles’ Fast</Caps>
        </div>
        <input defaultValue="On the Bread of Life" style={{ width:'100%', background:'transparent', border:'none', outline:'none', fontFamily:K.disp, fontSize:32, fontWeight:600, color:K.parch, marginBottom:14 }}/>
        {/* ruled writing area */}
        <div style={{ background:`repeating-linear-gradient(0deg, transparent 0 35px, ${K.ruleDim} 35px 36px)`, paddingTop:2 }}>
          <p style={{ fontFamily:K.disp, fontSize:20, lineHeight:'36px', color:'#DDD4BE', margin:0 }}>
            John 6 left me thinking how often I look for things that do not last — and how Christ keeps calling Himself <span style={{ fontStyle:'italic', color:K.goldHi }}>bread</span>, the most ordinary daily thing.
          </p>
          <p style={{ fontFamily:K.disp, fontSize:20, lineHeight:'36px', color:K.ink3, margin:0 }}>
            Today I want to fast not only from food, but from the endless scrolling that leaves me hungrier<span style={{ borderLeft:`2px solid ${K.gold}`, marginLeft:1 }}>&nbsp;</span>
          </p>
        </div>
      </Body>
      <div style={{ padding:'12px 26px 30px', borderTop:`1px solid ${K.rule}`, display:'flex', alignItems:'center', gap:20 }}>
        <Cross2 size={18} color={K.ink2}/><Ic name="pen" size={18} color={K.ink2}/><Ic name="clock" size={18} color={K.ink2}/>
        <Caps size={9} ls={1.6} color={K.ink3} style={{ marginLeft:'auto' }}>62 words</Caps>
      </div>
    </Page>
  );
}

function Profile2() {
  const badges = [['i','Flame of xiv',true],['ii','First fast',true],['iii','Gospel reader',true],['iv','Foundations',true],['v','vii reflections',true],['vi','A full Lent',false]];
  return (
    <Page>
      <Folio left="The keeper of the rule" right="Since March" glyph="ⲙ"/>
      <Body style={{ paddingTop:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, paddingBottom:16, borderBottom:`1px solid ${K.rule}` }}>
          <div style={{ width:66, height:66, border:`1px solid ${K.rule}`, borderRadius:'50%', display:'grid', placeItems:'center' }}>
            <span style={{ fontFamily:K.disp, fontSize:34, color:K.goldHi, fontWeight:600 }}>Ⲙ</span>
          </div>
          <div>
            <h1 style={{ fontFamily:K.disp, fontSize:30, fontWeight:600, margin:0 }}>Mina Boutros</h1>
            <Caps size={9} ls={1.8} color={K.ink2}>Walking with Pharos · iii months</Caps>
          </div>
        </div>
        {/* stat ledger */}
        <div style={{ display:'flex', borderBottom:`1px solid ${K.rule}` }}>
          {[['14','streak'],['142','prayers'],['23','readings']].map(([n,l],i)=>(
            <div key={i} style={{ flex:1, textAlign:'center', padding:'16px 0', borderLeft:i?`1px solid ${K.ruleDim}`:'none' }}>
              <Numeral size={36} oldstyle color={K.goldHi}>{n}</Numeral>
              <div><Caps size={8.5} ls={1.6} color={K.ink3}>{l}</Caps></div>
            </div>
          ))}
        </div>
        <Rubric num="Ⲕ" style={{ marginTop:20, marginBottom:12 }}>Marks earned</Rubric>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:0, border:`1px solid ${K.rule}` }}>
          {badges.map(([r,l,on],i)=>(
            <div key={i} style={{ textAlign:'center', padding:'14px 4px', borderRight:(i%3<2)?`1px solid ${K.ruleDim}`:'none', borderBottom:(i<3)?`1px solid ${K.ruleDim}`:'none', opacity:on?1:0.42 }}>
              {on ? <Cross2 size={26} color={K.gold}/> : <Copt size={22} color={K.ink3}>†</Copt>}
              <div style={{ marginTop:7 }}><Caps size={8.5} ls={1} color={K.ink2}>{l}</Caps></div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:18 }}>
          {[['Prayer reminders'],['Fasting preferences'],['Invite a friend']].map(([l],i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', padding:'13px 4px', borderTop:i===0?`1px solid ${K.rule}`:'none', borderBottom:`1px solid ${K.ruleDim}` }}>
              <span style={{ flex:1, fontFamily:K.disp, fontSize:20, fontWeight:600 }}>{l}</span>
              <Ic name="chevR" size={14} color={K.ink3}/>
            </div>
          ))}
        </div>
      </Body>
      <Nav active="you"/>
    </Page>
  );
}

Object.assign(window, { StreakDetail2, SaintOfDay2, JournalList2, JournalEntry2, Profile2 });
