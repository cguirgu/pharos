/* screens2_growth.jsx — codex lectionary + reader; catechism + lesson */

function BiblePlans2() {
  const plans = [
    ['ii','The Psalms with the Agpeya','thirty days'],
    ['iii','Acts & the early Church','twenty-one days'],
    ['iv','Proverbs for young hearts','thirty-one days'],
    ['v','The Sayings of the Desert','forty days'],
  ];
  return (
    <Page>
      <Folio left="The lectionary" right="Day 23 of 90" glyph="ⲱ"/>
      <Body style={{ paddingTop:20 }}>
        <Caps size={10} ls={3} color={K.rubricHi}>Now reading</Caps>
        {/* current plan, framed register */}
        <div style={{ border:`1px solid ${K.rule}`, padding:'18px 18px 16px', marginTop:10, position:'relative' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <h1 style={{ fontFamily:K.disp, fontSize:38, fontWeight:600, lineHeight:0.95, margin:'0 0 2px' }}>The Four<br/>Gospels</h1>
              <Caps size={9.5} ls={2} color={K.ink3}>Day xxiii · John vi</Caps>
            </div>
            <div style={{ textAlign:'right' }}>
              <Numeral size={44} oldstyle color={K.goldHi}>26</Numeral><Caps size={11} ls={0} color={K.ink2}>%</Caps>
            </div>
          </div>
          <div style={{ height:1, background:K.ruleDim, margin:'14px 0' }} />
          <Tally total={30} filled={8} today={8} w={5} h={12} gap={2}/>
          <div style={{ marginTop:16 }}><Btn>Continue reading →</Btn></div>
        </div>
        <Rubric num="Ⲇ" style={{ marginTop:24, marginBottom:6 }}>Plans to take up</Rubric>
        <div>
          {plans.map(([r,t,s],i)=>(
            <div key={t} style={{ display:'flex', alignItems:'baseline', gap:14, padding:'13px 4px', borderBottom:`1px solid ${K.ruleDim}` }}>
              <Numeral size={18} oldstyle color={K.ink3} style={{ width:26, fontStyle:'italic' }}>{r}</Numeral>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:K.disp, fontSize:23, fontWeight:600 }}>{t}</div>
                <Caps size={9} ls={1.6} color={K.ink2}>{s}</Caps>
              </div>
              <Ic name="plus" size={15} color={K.gold}/>
            </div>
          ))}
        </div>
      </Body>
      <Nav active="word"/>
    </Page>
  );
}

function BibleReader2() {
  return (
    <Page frame>
      <Folio left="Κατὰ Ἰωάννην · John" right="Chapter vi · Day xxiii" glyph="ⲓ̄ⲱ"/>
      {/* progress rule */}
      <div style={{ padding:'8px 26px 0' }}>
        <div style={{ height:2, background:K.ruleDim }}><div style={{ width:'40%', height:'100%', background:K.gold }} /></div>
      </div>
      <Body style={{ paddingTop:18, paddingLeft:30, paddingRight:30 }}>
        <div style={{ textAlign:'center', marginBottom:6 }}>
          <Copt size={16} color={K.gold}>ⲡⲓⲱⲓⲕ ⲛ̄ⲧⲉ ⲡⲱⲛϧ</Copt>
        </div>
        <h2 style={{ fontFamily:K.disp, fontSize:30, fontWeight:600, textAlign:'center', margin:'0 0 4px' }}>The Bread of Life</h2>
        <Fleuron style={{ margin:'10px 30px 18px' }}/>
        <div style={{ fontFamily:K.disp, fontSize:22, lineHeight:1.72, color:'#DDD4BE' }}>
          <span style={{ fontFamily:K.disp, fontSize:62, fontWeight:600, color:K.gold, float:'left', lineHeight:0.66, margin:'7px 12px 0 0' }}>A</span>
          nd Jesus said to them,
          <span style={{ fontFamily:K.text, fontSize:11, color:K.rubric, verticalAlign:'super', margin:'0 3px' }}>35</span>
          “I am the bread of life. He who comes to Me shall never hunger, and he who believes in Me shall never thirst.
          <span style={{ fontFamily:K.text, fontSize:11, color:K.rubric, verticalAlign:'super', margin:'0 3px' }}>37</span>
          All that the Father gives Me will come to Me, and the one who comes to Me I will by no means cast out.”
        </div>
        <div style={{ background:'rgba(201,168,74,0.07)', borderLeft:`2px solid ${K.gold}`, padding:'6px 14px', margin:'14px 0' }}>
          <span style={{ fontFamily:K.disp, fontSize:21, fontStyle:'italic', color:K.goldHi }}>
            <span style={{ fontFamily:K.text, fontSize:11, color:K.rubric, verticalAlign:'super', marginRight:4 }}>51</span>
            I am the living bread which came down from heaven.
          </span>
        </div>
        {/* marginal gloss */}
        <div style={{ display:'flex', gap:12, marginTop:8 }}>
          <div style={{ width:3, background:K.rubric, opacity:0.5 }} />
          <div>
            <Caps size={8.5} ls={2} color={K.rubricHi}>Gloss · St. Cyril of Alexandria</Caps>
            <p style={{ fontFamily:K.disp, fontSize:17, fontStyle:'italic', color:K.ink2, lineHeight:1.5, margin:'5px 0 0' }}>“He calls Himself bread, since by Him we live, as by bread.”</p>
          </div>
        </div>
      </Body>
      <div style={{ padding:'12px 26px 30px', borderTop:`1px solid ${K.rule}`, display:'flex', gap:0 }}>
        <button style={{ width:54, border:`1px solid ${K.rule}`, borderRight:'none', background:'transparent', display:'grid', placeItems:'center' }}><Ic name="pen" size={17} color={K.ink2}/></button>
        <button style={{ flex:1, padding:'14px', background:K.gold, color:'#1A1303', border:'none', fontFamily:K.text, fontSize:11, letterSpacing:2.5, textTransform:'uppercase', fontWeight:600 }}>Mark the day kept</button>
      </div>
    </Page>
  );
}

function LearnPaths2() {
  const paths = [
    ['ii','The Liturgy, unveiled','six lessons', false],
    ['iii','Who are the Copts?','history & the martyrs', false],
    ['iv','Praying the Agpeya','seven lessons', true],
    ['v','The Desert Fathers','six lessons', true],
  ];
  return (
    <Page>
      <Folio left="The catechism" right="Path i of v" glyph="ⲅ"/>
      <Body style={{ paddingTop:18 }}>
        <Caps size={10} ls={3} color={K.rubricHi}>Take up & learn</Caps>
        <h1 style={{ fontFamily:K.disp, fontSize:42, fontWeight:600, lineHeight:0.95, margin:'6px 0 14px' }}>Explore the faith</h1>
        <Plate h={112} label="illumination · path cover"/>
        <div style={{ border:`1px solid ${K.rule}`, borderTop:'none', padding:'14px 16px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
            <Caps size={9.5} ls={2} color={K.gold}>Continue · iv of viii</Caps>
            <Caps size={9.5} ls={1} color={K.ink2}>50%</Caps>
          </div>
          <h2 style={{ fontFamily:K.disp, fontSize:26, fontWeight:600, margin:'6px 0 10px' }}>Foundations of the Faith</h2>
          <div style={{ height:2, background:K.ruleDim }}><div style={{ width:'50%', height:'100%', background:K.gold }} /></div>
        </div>
        <Rubric num="Ⲉ" style={{ marginTop:22, marginBottom:6 }}>The further paths</Rubric>
        <div>
          {paths.map(([r,t,s,lock],i)=>(
            <div key={t} style={{ display:'flex', alignItems:'baseline', gap:14, padding:'13px 4px', borderBottom:`1px solid ${K.ruleDim}`, opacity:lock?0.5:1 }}>
              <Numeral size={18} oldstyle color={K.ink3} style={{ width:24, fontStyle:'italic' }}>{r}</Numeral>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:K.disp, fontSize:23, fontWeight:600 }}>{t}</div>
                <Caps size={9} ls={1.6} color={K.ink2}>{s}</Caps>
              </div>
              {lock ? <Copt size={13} color={K.ink3}>†</Copt> : <Ic name="chevR" size={14} color={K.gold}/>}
            </div>
          ))}
        </div>
      </Body>
      <Nav active="word"/>
    </Page>
  );
}

function LearnLesson2() {
  const steps = [['Why “Orthodox”?','kept'],['One Church, one faith','kept'],['The Holy Trinity','now'],['The Incarnation',''],['A short examination','quiz']];
  return (
    <Page>
      <Folio left="Foundations of the Faith" right="Lesson iii of viii" glyph="ⲅ"/>
      <Body style={{ paddingTop:16 }}>
        <Plate h={120} label="illumination · the Trinity"/>
        <Caps size={9.5} ls={3} color={K.rubricHi} style={{ display:'block', marginTop:16 }}>Lesson the third</Caps>
        <h1 style={{ fontFamily:K.disp, fontSize:40, fontWeight:600, lineHeight:0.98, margin:'6px 0 6px' }}>The Holy Trinity</h1>
        <p style={{ fontFamily:K.disp, fontSize:19, fontStyle:'italic', color:K.ink2, lineHeight:1.5 }}>One God in three Persons — Father, Son, and Holy Spirit — as the Copts have confessed since Nicaea.</p>
        <Rubric num="Ⲍ" style={{ marginTop:20, marginBottom:6 }}>The matter of the lesson</Rubric>
        <div>
          {steps.map(([t,st],i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 4px', borderBottom:`1px solid ${K.ruleDim}`, background:st==='now'?'rgba(201,168,74,0.06)':'transparent' }}>
              <div style={{ width:18, height:18, transform:'rotate(45deg)', border:`1px solid ${st==='kept'||st==='now'?K.gold:K.rule}`, background:st==='kept'?K.gold:'transparent', display:'grid', placeItems:'center' }}>
                {st==='kept' && <div style={{ width:5, height:5, background:K.bg }} />}
              </div>
              <span style={{ flex:1, fontFamily:K.disp, fontSize:22, fontWeight:st==='now'?600:500, color:st==='kept'?K.ink2:K.parch }}>{t}</span>
              {st==='now' && <Caps size={9} ls={2} color={K.goldHi}>Now</Caps>}
              {st==='quiz' && <Copt size={13} color={K.ink3}>†</Copt>}
            </div>
          ))}
        </div>
        <div style={{ marginTop:18 }}><Btn>Continue the lesson →</Btn></div>
      </Body>
      <Nav active="word"/>
    </Page>
  );
}

Object.assign(window, { BiblePlans2, BibleReader2, LearnPaths2, LearnLesson2 });
