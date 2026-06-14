/* screens2_onboarding.jsx — codex onboarding */

function OnbWelcome2() {
  return (
    <Page frame ticks>
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 40px', textAlign:'center', position:'relative' }}>
        <div style={{ position:'absolute', top:38, left:0, right:0, display:'flex', justifyContent:'center' }}>
          <Caps size={9.5} ls={4} color={K.ink2}>Anno Martyrum 1742</Caps>
        </div>
        <PharosSeal size={104}/>
        <div style={{ fontFamily:K.disp, fontSize:74, fontWeight:600, lineHeight:0.9, marginTop:18 }}>Pharos</div>
        <Copt size={22} color={K.gold} style={{ marginTop:8 }}>ⲡⲓⲫⲁⲣⲟⲥ</Copt>
        <div style={{ width:46, height:1, background:K.rule, margin:'22px 0' }} />
        <p style={{ fontFamily:K.disp, fontSize:25, fontStyle:'italic', lineHeight:1.4, color:K.ink2, maxWidth:300 }}>
          A guiding light into the faith of the Copts — prayer, fasting, and the Word, one day at a time.
        </p>
      </div>
      <div style={{ padding:'0 30px 44px' }}>
        <Btn>Begin the journey</Btn>
        <div style={{ textAlign:'center', marginTop:18 }}><Caps size={10} ls={2} color={K.ink3}>I already keep an account</Caps></div>
      </div>
    </Page>
  );
}

function Steps({ n }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:7, padding:'2px 26px 0' }}>
      {[1,2,3].map(i=>(
        <React.Fragment key={i}>
          <div style={{ width:6, height:6, transform:'rotate(45deg)', background:i<=n?K.gold:'transparent', border:`1px solid ${i<=n?K.gold:K.rule}` }} />
          {i<3 && <div style={{ flex:1, height:1, background:K.ruleDim }} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function OnbPersonalize2() {
  const opts = [
    ['Ⲁ','I grew up in the Church','Deepen a faith I already know', false],
    ['Ⲃ','I am returning','Finding my way back to the rhythm', true],
    ['Ⲅ','I am exploring','Curious about Coptic Orthodoxy', false],
  ];
  return (
    <Page>
      <Steps n={1}/>
      <Body style={{ paddingTop:30 }}>
        <Caps size={10} ls={3} color={K.rubricHi}>The first question</Caps>
        <h1 style={{ fontFamily:K.disp, fontSize:44, fontWeight:600, lineHeight:1.02, margin:'12px 0 10px' }}>Where are you<br/>on the journey?</h1>
        <p style={{ fontSize:14.5, color:K.ink2, lineHeight:1.6, marginBottom:8 }}>Your plan is shaped around the answer. It may be changed at any hour.</p>
        <div style={{ marginTop:14 }}>
          {opts.map(([g,t,s,on],i)=>(
            <div key={t} style={{ display:'flex', alignItems:'center', gap:18, padding:'20px 4px',
              borderTop:i===0?`1px solid ${K.ruleDim}`:'none', borderBottom:`1px solid ${K.ruleDim}`,
              background:on?'rgba(201,168,74,0.05)':'transparent' }}>
              <Copt size={28} color={on?K.gold:K.ink3} style={{ width:30, textAlign:'center', fontFamily:K.disp, fontWeight:600 }}>{g}</Copt>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:K.disp, fontSize:25, fontWeight:600, lineHeight:1.1 }}>{t}</div>
                <div style={{ fontSize:13, color:K.ink2 }}>{s}</div>
              </div>
              <div style={{ width:18, height:18, transform:'rotate(45deg)', border:`1px solid ${on?K.gold:K.rule}`, background:on?K.gold:'transparent', display:'grid', placeItems:'center' }}>
                {on && <div style={{ width:6, height:6, background:K.bg }} />}
              </div>
            </div>
          ))}
        </div>
      </Body>
      <div style={{ padding:'16px 30px 40px' }}><Btn>Continue →</Btn></div>
    </Page>
  );
}

function OnbRhythm2() {
  const habits = [
    ['Pray the Agpeya','Morning · Noon · Evening', true],
    ['Read the Word','The Gospels in ninety days', true],
    ['Keep the fasts','Wednesday · Friday · seasons', true],
    ['A saint each day','A life from the Synaxarium', false],
    ['Keep a journal','One ruled line is enough', false],
  ];
  return (
    <Page>
      <Steps n={3}/>
      <Body style={{ paddingTop:30 }}>
        <Caps size={10} ls={3} color={K.rubricHi}>Your rule of life</Caps>
        <h1 style={{ fontFamily:K.disp, fontSize:44, fontWeight:600, lineHeight:1.02, margin:'12px 0 10px' }}>Set the daily<br/>hours you will keep</h1>
        <p style={{ fontSize:14.5, color:K.ink2, marginBottom:10 }}>Small and steady. The lamp is tended, not stormed.</p>
        <div style={{ marginTop:6 }}>
          {habits.map(([t,s,on],i)=>(
            <div key={t} style={{ display:'flex', alignItems:'center', gap:16, padding:'15px 4px',
              borderTop:i===0?`1px solid ${K.ruleDim}`:'none', borderBottom:`1px solid ${K.ruleDim}` }}>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:K.disp, fontSize:23, fontWeight:600 }}>{t}</div>
                <div style={{ fontSize:12.5, color:K.ink2, fontStyle:'italic' }}>{s}</div>
              </div>
              {/* ruled toggle: filled lozenge = kept */}
              <div style={{ width:46, height:22, border:`1px solid ${on?K.gold:K.rule}`, position:'relative', background:on?'rgba(201,168,74,0.12)':'transparent' }}>
                <div style={{ position:'absolute', top:2, bottom:2, width:18, left:on?24:2, background:on?K.gold:K.ink3 }} />
              </div>
            </div>
          ))}
        </div>
      </Body>
      <div style={{ padding:'14px 30px 40px' }}><Btn>Light the lamp →</Btn></div>
    </Page>
  );
}

Object.assign(window, { OnbWelcome2, OnbPersonalize2, OnbRhythm2 });
