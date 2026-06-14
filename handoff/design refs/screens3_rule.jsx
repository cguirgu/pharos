/* screens3_rule.jsx — "The Rule of Life, reimagined"
   Navigation clarity + flexible creating / setting / tracking of daily practices.
   Reuses the ds2 codex language (K, Caps, Copt, Page, Folio, Body, Rubric, Fleuron,
   Numeral, Btn, Cross2, Plate, Ic, Tally). */

/* ── shared helpers for this feature ── */

/* tally strip: filled/empty ruled cells (local copy — ds2 has none) */
function Tally({ total = 14, filled = 14, today, w = 8, h = 16, gap = 3 }) {
  return (
    <div style={{ display:'flex', gap, width:'100%' }}>
      {Array.from({length:total}).map((_,i)=>(
        <div key={i} style={{ flex:w?'0 0 auto':1, width:w||'auto', height:h, border:`1px solid ${i<filled?K.gold:K.rule}`,
          background:i<filled?K.gold:'transparent', opacity:i<filled?(0.45+i/total*0.55):1,
          ...(today===i?{ outline:`1px solid ${K.goldHi}`, outlineOffset:1 }:{}) }} />
      ))}
    </div>
  );
}

/* nav ledger with the new "Rule" tab */
function Nav3({ active = 'today' }) {
  const items = [['today','Today'],['hours','Hours'],['word','Word'],['rule','Rule'],['you','You']];
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

/* lozenge check mark — open / part / kept */
function Mark({ state = 'open', size = 22 }) {
  const on = state === 'kept', part = state === 'part';
  return (
    <div style={{ width:size, height:size, transform:'rotate(45deg)', flexShrink:0, position:'relative',
      border:`1px solid ${on||part?K.gold:K.rule}`, background:on?K.gold:'transparent', display:'grid', placeItems:'center', overflow:'hidden' }}>
      {part && <div style={{ position:'absolute', inset:0, background:`linear-gradient(90deg, ${K.gold} 50%, transparent 50%)` }} />}
      {on && <div style={{ width:size*0.26, height:size*0.26, background:K.bg, position:'relative', zIndex:1 }} />}
    </div>
  );
}

/* three-dot progress for a multi-part practice (e.g. 2 of 3 hours) */
function Dots({ total, filled }) {
  return (
    <div style={{ display:'flex', gap:4 }}>
      {Array.from({length:total}).map((_,i)=>(
        <div key={i} style={{ width:6, height:6, transform:'rotate(45deg)',
          background:i<filled?K.gold:'transparent', border:`1px solid ${i<filled?K.gold:K.rule}` }} />
      ))}
    </div>
  );
}

/* weekday / cadence chip */
function Chip({ on, children, wide }) {
  return (
    <div style={{ flex:wide?1:'0 0 auto', minWidth:wide?0:36, textAlign:'center', padding:wide?'9px 14px':'9px 0',
      border:`1px solid ${on?K.gold:K.ruleDim}`, background:on?'rgba(201,168,74,0.12)':'transparent',
      color:on?K.goldHi:K.ink3, fontFamily:K.disp, fontSize:16, fontWeight:600, lineHeight:1 }}>{children}</div>
  );
}

/* −  value unit  +  stepper */
function Stepper({ value, unit }) {
  const sq = { width:46, alignSelf:'stretch', background:'transparent', color:K.goldHi, border:'none',
    fontFamily:K.disp, fontSize:26, fontWeight:600, cursor:'pointer', display:'grid', placeItems:'center', lineHeight:1 };
  return (
    <div style={{ display:'flex', alignItems:'stretch', border:`1px solid ${K.rule}`, height:58 }}>
      <button style={{ ...sq, borderRight:`1px solid ${K.ruleDim}` }}>–</button>
      <div style={{ flex:1, display:'flex', alignItems:'baseline', justifyContent:'center', gap:8 }}>
        <Numeral size={30} oldstyle color={K.parch}>{value}</Numeral>
        <Caps size={10} ls={2} color={K.ink2}>{unit}</Caps>
      </div>
      <button style={{ ...sq, borderLeft:`1px solid ${K.ruleDim}` }}>+</button>
    </div>
  );
}

/* segmented bar of short options */
function Segmented({ options, active }) {
  return (
    <div style={{ display:'flex', border:`1px solid ${K.rule}` }}>
      {options.map((o,i)=>(
        <div key={o} style={{ flex:1, textAlign:'center', padding:'13px 6px', borderLeft:i?`1px solid ${K.ruleDim}`:'none',
          background:o===active?K.gold:'transparent' }}>
          <Caps size={9.5} ls={1.8} color={o===active?'#1A1303':K.ink2} weight={600}>{o}</Caps>
        </div>
      ))}
    </div>
  );
}

/* small caps cadence tag */
function Tag({ children, color = K.gold }) {
  return <Caps size={8.5} ls={1.6} color={color} style={{ border:`1px solid ${K.ruleDim}`, padding:'3px 7px', whiteSpace:'nowrap' }}>{children}</Caps>;
}

/* simple back-bar header for sheets/editors */
function SheetBar({ left = 'Back', title, right }) {
  return (
    <>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'2px 22px 0', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
          <div style={{ transform:'rotate(180deg)', display:'grid', placeItems:'center' }}><Ic name="chevR" size={17} color={K.ink2}/></div>
          <Caps size={9} ls={2} color={K.ink2}>{left}</Caps>
        </div>
        {title && <Caps size={9} ls={2.4} color={K.ink3}>{title}</Caps>}
        {right || <span style={{ width:48 }} />}
      </div>
      <div style={{ height:1, background:K.rule, margin:'10px 22px 0' }} />
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   1 · THE MAP OF THE BOOK  — navigation clarity (wide artboard)
   ════════════════════════════════════════════════════════════════ */
function NavMap3() {
  const tabs = [
    ['Ⲁ','Today','One daily page that now gathers every practice due today — pray, read, fast, reflect — kept in one place.', false],
    ['Ⲃ','Hours','The Agpeya & the liturgical office. The hours, the Synaxarium, the saint of the day.', false],
    ['Ⲅ','Word','Scripture, reading plans & the catechism. The journal opens beside the Word.', false],
    ['Ⲇ','Rule','Your rule of life — create, order, measure & keep your practices. Their history lives here.', true],
    ['Ⲉ','You','The keeper: streak, marks earned, reminders, fasting preferences.', false],
  ];
  return (
    <div style={{ width:'100%', height:'100%', background:K.bg, color:K.parch, fontFamily:K.text,
      position:'relative', overflow:'hidden', padding:'34px 44px', display:'flex', flexDirection:'column' }}>
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', opacity:0.5,
        background:'repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0 1px, transparent 1px 4px)' }} />
      <div style={{ position:'relative', display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
        <div>
          <Caps size={10} ls={3} color={K.rubricHi}>The colophon</Caps>
          <h1 style={{ fontFamily:K.disp, fontSize:46, fontWeight:600, lineHeight:0.95, margin:'6px 0 0' }}>The map of the book</h1>
        </div>
        <Copt size={30} color={K.gold}>ⲡⲓⲫⲁⲣⲟⲥ</Copt>
      </div>
      <div style={{ height:1, background:K.rule, margin:'18px 0 4px' }} />
      <div style={{ position:'relative', display:'flex', gap:40, flex:1, minHeight:0 }}>
        {/* the five tabs as a contents ledger */}
        <div style={{ flex:1.35 }}>
          {tabs.map(([g,t,d,nw],i)=>(
            <div key={t} style={{ display:'flex', gap:18, alignItems:'flex-start', padding:'12px 0',
              borderBottom:`1px solid ${K.ruleDim}`, background:nw?'rgba(201,168,74,0.05)':'transparent' }}>
              <Copt size={26} color={nw?K.gold:K.ink3} style={{ fontFamily:K.disp, fontWeight:600, width:28, textAlign:'center' }}>{g}</Copt>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'baseline', gap:10 }}>
                  <span style={{ fontFamily:K.disp, fontSize:26, fontWeight:600 }}>{t}</span>
                  {nw && <Tag color={K.goldHi}>New · the missing home</Tag>}
                </div>
                <p style={{ fontFamily:K.disp, fontSize:16, fontStyle:'italic', color:K.ink2, lineHeight:1.4, margin:'2px 0 0', maxWidth:330 }}>{d}</p>
              </div>
            </div>
          ))}
        </div>
        {/* what changed */}
        <div style={{ flex:1, borderLeft:`1px solid ${K.rule}`, paddingLeft:34 }}>
          <Caps size={10} ls={2.6} color={K.gold}>Three changes for clarity</Caps>
          <div style={{ marginTop:14, display:'flex', flexDirection:'column', gap:16 }}>
            {[
              ['i','A single Today','“Today” and “Hours” no longer overlap. Today is the day’s account of your rule; Hours is the office to pray.'],
              ['ii','The Rule gains a tab','Your rule of life leaves onboarding and becomes a place you return to — to add, reorder & measure practices.'],
              ['iii','The Journal folds in','Reflection becomes a practice in your rule and opens beside the Word, rather than a fifth, half-used tab.'],
            ].map(([r,t,d])=>(
              <div key={r} style={{ display:'flex', gap:14 }}>
                <Numeral size={22} oldstyle color={K.goldHi} style={{ width:26, fontStyle:'italic' }}>{r}</Numeral>
                <div>
                  <div style={{ fontFamily:K.disp, fontSize:19, fontWeight:600 }}>{t}</div>
                  <p style={{ fontFamily:K.text, fontSize:12.5, color:K.ink2, lineHeight:1.5, margin:'2px 0 0' }}>{d}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:'auto' }} />
        </div>
      </div>
      {/* the nav bar itself, rendered */}
      <div style={{ position:'relative', marginTop:14, border:`1px solid ${K.rule}` }}>
        <div style={{ display:'flex' }}>
          {[['Today',1],['Hours',0],['Word',0],['Rule',0,1],['You',0]].map(([l,on,nw],i)=>(
            <div key={l} style={{ flex:1, textAlign:'center', padding:'12px 0 11px', borderLeft:i?`1px solid ${K.ruleDim}`:'none',
              background:nw?'rgba(201,168,74,0.06)':'transparent' }}>
              <div style={{ height:6, marginBottom:7, display:'grid', placeItems:'center' }}>
                {on ? <div style={{ width:5, height:5, background:K.gold, transform:'rotate(45deg)' }} /> : null}
              </div>
              <Caps size={9.5} ls={1.8} color={on?K.goldHi:(nw?K.gold:K.ink3)} weight={on||nw?700:600}>{l}</Caps>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   2 · TODAY — the reworked daily home: every practice due today
   ════════════════════════════════════════════════════════════════ */
function Today3() {
  const rule = [
    ['The Agpeya','Morning · Noon · Evening', 'part', { dots:[3,2] }],
    ['Keep the fast','Wednesdays & Fridays · vegan today', 'kept', { tag:'Due today' }],
    ['Read the Gospel','John vi · one chapter', 'open', { action:'Read' }],
    ['The Jesus Prayer','Fifty times', 'part', { count:'30 / 50' }],
    ['Three thanksgivings','A line in the journal', 'open', { action:'Write' }],
  ];
  return (
    <Page>
      <Folio left="Friday · the sixth of June" right="Day 9 · Apostles’ Fast" glyph="ⲡ"/>
      <Body style={{ paddingTop:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <Caps size={9.5} ls={3} color={K.rubricHi}>The day’s account</Caps>
            <h1 style={{ fontFamily:K.disp, fontSize:34, fontWeight:600, lineHeight:0.98, margin:'6px 0 0' }}>Peace to you,<br/>Mina</h1>
          </div>
          <div style={{ textAlign:'center', borderLeft:`1px solid ${K.ruleDim}`, paddingLeft:14 }}>
            <Numeral size={44} color={K.goldHi} oldstyle>14</Numeral>
            <div><Caps size={8} ls={1.8} color={K.ink3}>day streak</Caps></div>
          </div>
        </div>
        {/* today's progress, as a tally of the rule */}
        <div style={{ display:'flex', alignItems:'center', gap:12, margin:'16px 0 4px', padding:'11px 0', borderTop:`1px solid ${K.rule}`, borderBottom:`1px solid ${K.rule}` }}>
          <Caps size={9.5} ls={1.8} color={K.gold} style={{ whiteSpace:'nowrap' }}>Kept&nbsp; 3 / 6</Caps>
          <div style={{ flex:1 }}><Tally total={6} filled={3} w={0} h={14} gap={4} /></div>
        </div>
        <Rubric num="Ⲁ" style={{ marginTop:18, marginBottom:2 }}>Your rule today</Rubric>
        <div>
          {rule.map(([t,s,st,meta],i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 0', borderBottom:`1px solid ${K.ruleDim}`, opacity:st==='kept'?0.62:1 }}>
              <Mark state={st}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:K.disp, fontSize:21, fontWeight:600, lineHeight:1.05, textDecoration:st==='kept'?'line-through':'none', textDecorationColor:K.rule }}>{t}</div>
                <div style={{ fontSize:12, color:K.ink2, fontStyle:'italic' }}>{s}</div>
              </div>
              {meta.dots && <Dots total={meta.dots[0]} filled={meta.dots[1]}/>}
              {meta.count && <Caps size={10} ls={1} color={K.goldHi}>{meta.count}</Caps>}
              {meta.tag && st==='kept' && <Cross2 size={14} color={K.gold}/>}
              {meta.action && <Caps size={9} ls={2} color={K.goldHi} style={{ border:`1px solid ${K.rule}`, padding:'4px 8px' }}>{meta.action}</Caps>}
            </div>
          ))}
        </div>
        {/* cadence-aware: not due today */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:14, opacity:0.5 }}>
          <Caps size={8.5} ls={2} color={K.ink3}>Resting today</Caps>
          <div style={{ flex:1, height:1, background:K.ruleDim }} />
          <span style={{ fontFamily:K.disp, fontSize:15, fontStyle:'italic', color:K.ink3 }}>Prostrations · Almsgiving</span>
        </div>
      </Body>
      <Nav3 active="today"/>
    </Page>
  );
}

/* ════════════════════════════════════════════════════════════════
   3 · THE RULE — a living, editable document of practices
   ════════════════════════════════════════════════════════════════ */
function RuleOverview3() {
  const groups = [
    ['Prayer','Ⲡ', [
      ['The Agpeya','Daily · 3 hours','part',[3,2]],
      ['The Jesus Prayer','Daily · 50 times','kept',null],
    ]],
    ['The Word','Ⲱ', [
      ['Read the Gospel','Daily · 1 chapter','kept',null],
      ['A Psalm at night','Daily','open',null],
    ]],
    ['The Fast','Ⲛ', [
      ['Wednesdays & Fridays','Weekly · 2 days','kept',null],
      ['The seasons','By the calendar','kept',null],
    ]],
    ['Devotion','Ⲇ', [
      ['Three thanksgivings','Daily · in the journal','open',null],
      ['A saint each day','Daily','kept',null],
    ]],
  ];
  return (
    <Page>
      <Folio left="Your rule of life" right="viii practices · since March" glyph="ⲣ"/>
      <Body style={{ paddingTop:16, overflowY:'auto' }}>
        <Caps size={10} ls={3} color={K.rubricHi}>The rule you keep</Caps>
        <h1 style={{ fontFamily:K.disp, fontSize:36, fontWeight:600, lineHeight:0.95, margin:'4px 0 6px' }}>A living rule</h1>
        <p style={{ fontFamily:K.disp, fontSize:16, fontStyle:'italic', color:K.ink2, lineHeight:1.4, marginBottom:6 }}>Small and steady. Reorder, measure, or ease it whenever the season turns.</p>
        {groups.map(([g,glyph,items])=>(
          <div key={g} style={{ marginTop:16 }}>
            <Rubric num={glyph} style={{ marginBottom:2 }}>{g}</Rubric>
            {items.map(([t,c,st,dots],i)=>(
              <div key={t} style={{ display:'flex', alignItems:'center', gap:13, padding:'12px 0', borderBottom:`1px solid ${K.ruleDim}` }}>
                <div style={{ cursor:'grab', display:'grid', placeItems:'center', opacity:0.5 }}>
                  <svg width="9" height="14" viewBox="0 0 9 14" fill={K.ink3}><circle cx="2" cy="2" r="1"/><circle cx="7" cy="2" r="1"/><circle cx="2" cy="7" r="1"/><circle cx="7" cy="7" r="1"/><circle cx="2" cy="12" r="1"/><circle cx="7" cy="12" r="1"/></svg>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:K.disp, fontSize:20, fontWeight:600, lineHeight:1.05 }}>{t}</div>
                  <Caps size={8.5} ls={1.4} color={K.ink2}>{c}</Caps>
                </div>
                {dots && <Dots total={dots[0]} filled={dots[1]}/>}
                <Ic name="chevR" size={14} color={K.ink3}/>
              </div>
            ))}
          </div>
        ))}
        <div style={{ margin:'20px 0 8px' }}><Btn>＋&nbsp;&nbsp;Add a practice</Btn></div>
        <div style={{ textAlign:'center', paddingBottom:6 }}>
          <Caps size={9} ls={2} color={K.ink3}>Lighten the rule for a season</Caps>
        </div>
      </Body>
      <Nav3 active="rule"/>
    </Page>
  );
}

/* practice history — cadence-aware tracking */
function PracticeHistory3() {
  // only "due" days are cells; rest are dim. ✓ kept, / part, · missed, ◆ today
  const weeks = [
    ['✓','','✓','','✓','✓',''],
    ['✓','','/','','✓','✓',''],
    ['✓','','✓','','·','✓',''],
    ['✓','','✓','','◆','',''],
  ];
  return (
    <Page>
      <SheetBar left="The Rule" title="A practice"/>
      <Body style={{ paddingTop:16 }}>
        <Caps size={9.5} ls={3} color={K.rubricHi}>Prayer · the office</Caps>
        <h1 style={{ fontFamily:K.disp, fontSize:34, fontWeight:600, lineHeight:0.98, margin:'4px 0 6px' }}>The Agpeya</h1>
        <div style={{ display:'flex', gap:8 }}><Tag>Daily · 3 hours</Tag><Tag color={K.feast}>Reminder · vi am</Tag></div>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', margin:'18px 0 4px', paddingTop:14, borderTop:`1px solid ${K.rule}` }}>
          <div>
            <Numeral size={64} oldstyle color={K.goldHi} style={{ lineHeight:0.8 }}>14</Numeral>
            <div><Caps size={9} ls={2} color={K.gold}>days in a row</Caps></div>
          </div>
          <div style={{ textAlign:'right' }}>
            <Numeral size={40} oldstyle color={K.parch}>92</Numeral><Caps size={11} color={K.ink2}>%</Caps>
            <div><Caps size={8.5} ls={1.4} color={K.ink3}>of due days kept</Caps></div>
          </div>
        </div>
        <Rubric num="Ⲏ" style={{ marginTop:18, marginBottom:12 }}>The last four weeks</Rubric>
        <div style={{ display:'flex', gap:6, marginBottom:8 }}>
          {['S','M','T','W','T','F','S'].map((d,i)=><div key={i} style={{ flex:1, textAlign:'center' }}><Caps size={8} ls={0.5} color={K.ink3}>{d}</Caps></div>)}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {weeks.map((w,i)=>(
            <div key={i} style={{ display:'flex', gap:6 }}>
              {w.map((mk,j)=>{
                const due = mk!=='';
                return (
                  <div key={j} style={{ flex:1, height:34, border:`1px solid ${mk==='◆'?K.gold:(due?K.ruleDim:'transparent')}`,
                    background:mk==='✓'?'rgba(201,168,74,0.16)':(mk==='/'?'rgba(201,168,74,0.07)':'transparent'),
                    display:'grid', placeItems:'center' }}>
                    <span style={{ fontFamily:K.disp, fontSize:17, color:mk==='✓'?K.gold:(mk==='/'?K.goldHi:(mk==='·'?K.rubricHi:K.ink3)) }}>
                      {mk==='◆'?'·':(mk==='✓'?'✓':(mk==='/'?'/':(mk==='·'?'×':'')))}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <p style={{ display:'flex', gap:8, alignItems:'baseline', marginTop:12, fontFamily:K.disp, fontSize:14.5, fontStyle:'italic', color:K.ink2 }}>
          <Copt size={12} color={K.gold}>†</Copt> Only the days your rule asks for are counted — rest days never break the streak.
        </p>
        <div style={{ display:'flex', gap:10, marginTop:16 }}>
          <div style={{ flex:1 }}><Btn kind="line">Edit the practice</Btn></div>
          <button style={{ width:56, border:`1px solid ${K.rule}`, background:'transparent', display:'grid', placeItems:'center' }}><Ic name="clock" size={18} color={K.ink2}/></button>
        </div>
      </Body>
    </Page>
  );
}

/* ════════════════════════════════════════════════════════════════
   4 · ADD A PRACTICE — picker
   ════════════════════════════════════════════════════════════════ */
function AddPractice3() {
  const groups = [
    ['Prayer', [['Pray an Agpeya hour','Morning · Noon · Vespers…'],['The Jesus Prayer','A count of repetitions'],['Pray for someone','Hold a name each day']]],
    ['The Word', [['Read a chapter','From a plan or freely'],['A Psalm at night','Before sleep']]],
    ['The Fast', [['Fast Wednesdays & Fridays','Through the year'],['Keep silence','An hour of quiet']]],
    ['Devotion', [['Prostrations','A count, morning or night'],['Almsgiving','A gift each week'],['Three thanksgivings','Name them in the journal']]],
  ];
  return (
    <Page>
      <SheetBar left="The Rule" title="Add to your rule"/>
      <Body style={{ paddingTop:16, overflowY:'auto' }}>
        <Caps size={10} ls={3} color={K.rubricHi}>Take up a practice</Caps>
        <h1 style={{ fontFamily:K.disp, fontSize:36, fontWeight:600, lineHeight:0.96, margin:'4px 0 12px' }}>What will you keep?</h1>
        {groups.map(([g,items])=>(
          <div key={g} style={{ marginBottom:6 }}>
            <Rubric style={{ marginTop:12, marginBottom:0 }}>{g}</Rubric>
            {items.map(([t,s])=>(
              <div key={t} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 2px', borderBottom:`1px solid ${K.ruleDim}` }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:K.disp, fontSize:20, fontWeight:600 }}>{t}</div>
                  <div style={{ fontSize:12, color:K.ink2, fontStyle:'italic' }}>{s}</div>
                </div>
                <div style={{ width:26, height:26, border:`1px solid ${K.rule}`, display:'grid', placeItems:'center' }}><Ic name="plus" size={13} color={K.gold}/></div>
              </div>
            ))}
          </div>
        ))}
        <div style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 2px', marginTop:8, border:`1px solid ${K.rule}`, paddingLeft:16, paddingRight:16, background:'rgba(201,168,74,0.05)' }}>
          <Ic name="pen" size={18} color={K.goldHi}/>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:K.disp, fontSize:20, fontWeight:600, color:K.goldHi }}>Write your own practice</div>
            <div style={{ fontSize:12, color:K.ink2, fontStyle:'italic' }}>Name it, and set its rhythm yourself</div>
          </div>
          <Ic name="chevR" size={15} color={K.gold}/>
        </div>
      </Body>
    </Page>
  );
}

/* ════════════════════════════════════════════════════════════════
   4b · COMPOSE A PRACTICE — the flexible editor (cadence open)
   ════════════════════════════════════════════════════════════════ */
function ComposePractice3() {
  return (
    <Page>
      <SheetBar left="Cancel" title="New practice"
        right={<Caps size={9.5} ls={2} color={K.goldHi}>Save</Caps>}/>
      <Body style={{ paddingTop:16, overflowY:'auto' }}>
        <Caps size={9} ls={2.4} color={K.rubricHi}>The practice</Caps>
        <input defaultValue="Pray for my family" style={{ width:'100%', background:'transparent', border:'none', outline:'none',
          fontFamily:K.disp, fontSize:32, fontWeight:600, color:K.parch, margin:'4px 0 2px', borderBottom:`1px solid ${K.rule}`, paddingBottom:8 }}/>
        <Caps size={9} ls={1.6} color={K.ink3} style={{ display:'block', marginTop:8 }}>Category · Prayer</Caps>

        <Rubric num="i" style={{ marginTop:22, marginBottom:12 }}>How often</Rubric>
        {[
          ['Every day','The lamp tended without fail', false],
          ['Certain days','Choose the days of the week', true],
          ['A number of times each week','You decide which days', false],
          ['On fast days','Wednesdays, Fridays & the seasons', false],
          ['During a season','Only within a fast or feast', false],
        ].map(([t,s,on],i)=>(
          <div key={t} style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 2px',
            borderBottom:`1px solid ${K.ruleDim}`, background:on?'rgba(201,168,74,0.05)':'transparent' }}>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:K.disp, fontSize:19, fontWeight:600 }}>{t}</div>
              <div style={{ fontSize:11.5, color:K.ink2, fontStyle:'italic' }}>{s}</div>
            </div>
            <div style={{ width:16, height:16, transform:'rotate(45deg)', border:`1px solid ${on?K.gold:K.rule}`, background:on?K.gold:'transparent', display:'grid', placeItems:'center' }}>
              {on && <div style={{ width:5, height:5, background:K.bg }} />}
            </div>
          </div>
        ))}
        {/* revealed weekday chips for "Certain days" */}
        <div style={{ display:'flex', gap:6, marginTop:14 }}>
          {[['S',0],['M',0],['T',0],['W',1],['T',0],['F',1],['S',0]].map(([d,on],i)=>(
            <div key={i} style={{ flex:1 }}><Chip on={!!on} wide>{d}</Chip></div>
          ))}
        </div>

        <Rubric num="ii" style={{ marginTop:24, marginBottom:12 }}>The measure</Rubric>
        <Segmented options={['Mark it kept','A count','A span']} active="Mark it kept"/>
        <p style={{ fontFamily:K.disp, fontSize:15, fontStyle:'italic', color:K.ink2, margin:'12px 0 0', lineHeight:1.4 }}>One mark when the day is kept — simple and honest.</p>

        <Rubric num="iii" style={{ marginTop:24, marginBottom:8 }}>A reminder</Rubric>
        <div style={{ display:'flex', alignItems:'center', gap:14, padding:'4px 2px' }}>
          <Ic name="bell" size={18} color={K.gold}/>
          <span style={{ flex:1, fontFamily:K.disp, fontSize:19, fontWeight:600 }}>Evening · 8:00</span>
          <div style={{ width:46, height:22, border:`1px solid ${K.gold}`, position:'relative', background:'rgba(201,168,74,0.12)' }}>
            <div style={{ position:'absolute', top:2, bottom:2, width:18, left:24, background:K.gold }} />
          </div>
        </div>

        <Rubric num="iv" style={{ marginTop:22, marginBottom:8 }}>Why you keep it</Rubric>
        <div style={{ background:`repeating-linear-gradient(0deg, transparent 0 31px, ${K.ruleDim} 31px 32px)`, marginBottom:18 }}>
          <p style={{ fontFamily:K.disp, fontSize:18, fontStyle:'italic', lineHeight:'32px', color:K.goldHi, margin:0 }}>For my mother’s health, and a soft heart toward my brother.</p>
        </div>
        <Btn>Add to the rule</Btn>
        <div style={{ height:8 }} />
      </Body>
    </Page>
  );
}

/* ════════════════════════════════════════════════════════════════
   4c · COMPOSE — a count goal (shows the measure expanded)
   ════════════════════════════════════════════════════════════════ */
function ComposeCount3() {
  return (
    <Page>
      <SheetBar left="Cancel" title="New practice"
        right={<Caps size={9.5} ls={2} color={K.goldHi}>Save</Caps>}/>
      <Body style={{ paddingTop:16, overflowY:'auto' }}>
        <Caps size={9} ls={2.4} color={K.rubricHi}>The practice</Caps>
        <input defaultValue="Prostrations" style={{ width:'100%', background:'transparent', border:'none', outline:'none',
          fontFamily:K.disp, fontSize:32, fontWeight:600, color:K.parch, margin:'4px 0 2px', borderBottom:`1px solid ${K.rule}`, paddingBottom:8 }}/>
        <Caps size={9} ls={1.6} color={K.ink3} style={{ display:'block', marginTop:8 }}>Category · Devotion</Caps>

        <Rubric num="i" style={{ marginTop:22, marginBottom:12 }}>How often</Rubric>
        <Segmented options={['Every day','Certain days','× / week','Fast days','Season']} active="Every day"/>
        <p style={{ fontFamily:K.disp, fontSize:15, fontStyle:'italic', color:K.ink2, margin:'12px 0 0' }}>Kept each day, morning or night.</p>

        <Rubric num="ii" style={{ marginTop:24, marginBottom:12 }}>The measure</Rubric>
        <Segmented options={['Mark it kept','A count','A span']} active="A count"/>
        <div style={{ marginTop:14 }}>
          <Stepper value="12" unit="prostrations"/>
        </div>
        <div style={{ display:'flex', gap:8, marginTop:10 }}>
          {['3','12','40','100'].map((n,i)=>(
            <div key={n} style={{ flex:1, textAlign:'center', padding:'8px 0', border:`1px solid ${i===1?K.gold:K.ruleDim}`,
              background:i===1?'rgba(201,168,74,0.1)':'transparent' }}>
              <span style={{ fontFamily:K.disp, fontSize:17, fontWeight:600, color:i===1?K.goldHi:K.ink2 }}>{n}</span>
            </div>
          ))}
        </div>
        <p style={{ fontFamily:K.disp, fontSize:15, fontStyle:'italic', color:K.ink2, margin:'14px 0 0', lineHeight:1.4 }}>
          Track the tally each day; the streak counts a day kept once you reach twelve.
        </p>

        <Rubric num="iii" style={{ marginTop:24, marginBottom:8 }}>A reminder</Rubric>
        <div style={{ display:'flex', alignItems:'center', gap:14, padding:'4px 2px' }}>
          <Ic name="bell" size={18} color={K.ink3}/>
          <span style={{ flex:1, fontFamily:K.disp, fontSize:19, fontWeight:600, color:K.ink2 }}>No reminder</span>
          <div style={{ width:46, height:22, border:`1px solid ${K.rule}`, position:'relative' }}>
            <div style={{ position:'absolute', top:2, bottom:2, width:18, left:2, background:K.ink3 }} />
          </div>
        </div>
        <div style={{ marginTop:24 }}><Btn>Add to the rule</Btn></div>
        <div style={{ height:8 }} />
      </Body>
    </Page>
  );
}

/* ════════════════════════════════════════════════════════════════
   4d · CADENCE — the full palette of frequency (focused)
   ════════════════════════════════════════════════════════════════ */
function CadencePalette3() {
  const opts = [
    ['Ⲁ','Every day','Sunday through Saturday', 'Daily', false],
    ['Ⲃ','Certain weekdays','Pick the days — e.g. Wednesday & Friday', 'W · F', true],
    ['Ⲅ','A number of times a week','You keep it on any three days', '3 × / week', false],
    ['Ⲇ','On fast days','Follows the calendar automatically', 'Auto', false],
    ['Ⲉ','Once a week or month','A weekly alms, a monthly confession', 'Weekly', false],
    ['Ⲋ','During a season only','Lent, the Apostles’ Fast, Kiahk…', 'Seasonal', false],
  ];
  return (
    <Page>
      <SheetBar left="Compose" title="How often"/>
      <Body style={{ paddingTop:16 }}>
        <Caps size={10} ls={3} color={K.rubricHi}>The rhythm</Caps>
        <h1 style={{ fontFamily:K.disp, fontSize:34, fontWeight:600, lineHeight:0.98, margin:'4px 0 4px' }}>How often will<br/>you keep it?</h1>
        <p style={{ fontFamily:K.disp, fontSize:16, fontStyle:'italic', color:K.ink2, marginBottom:8, lineHeight:1.4 }}>From every day to once a season — the rhythm bends to your life, not the reverse.</p>
        <div>
          {opts.map(([g,t,s,tag,on],i)=>(
            <div key={t} style={{ display:'flex', alignItems:'center', gap:14, padding:'15px 2px',
              borderTop:i===0?`1px solid ${K.ruleDim}`:'none', borderBottom:`1px solid ${K.ruleDim}`,
              background:on?'rgba(201,168,74,0.05)':'transparent' }}>
              <Copt size={22} color={on?K.gold:K.ink3} style={{ fontFamily:K.disp, fontWeight:600, width:24, textAlign:'center' }}>{g}</Copt>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:K.disp, fontSize:20, fontWeight:600, lineHeight:1.1 }}>{t}</div>
                <div style={{ fontSize:11.5, color:K.ink2, fontStyle:'italic' }}>{s}</div>
              </div>
              <Tag color={on?K.goldHi:K.ink3}>{tag}</Tag>
            </div>
          ))}
        </div>
        {/* selected → weekday chips */}
        <div style={{ marginTop:18 }}>
          <Caps size={9} ls={2} color={K.gold} style={{ display:'block', marginBottom:10 }}>Certain weekdays — chosen</Caps>
          <div style={{ display:'flex', gap:6 }}>
            {[['S',0],['M',0],['T',0],['W',1],['T',0],['F',1],['S',0]].map(([d,on],i)=>(
              <div key={i} style={{ flex:1 }}><Chip on={!!on} wide>{d}</Chip></div>
            ))}
          </div>
        </div>
      </Body>
    </Page>
  );
}

/* ════════════════════════════════════════════════════════════════
   5 · COUNT CHECK-IN — flexible daily logging (sheet over Today)
   ════════════════════════════════════════════════════════════════ */
function CountCheckin3() {
  return (
    <Page>
      <Folio left="The day’s account" right="Friday vi June" glyph="ⲡ"/>
      <Body style={{ paddingTop:14, opacity:0.32, pointerEvents:'none' }}>
        <h1 style={{ fontFamily:K.disp, fontSize:30, fontWeight:600, lineHeight:0.98, margin:0 }}>Peace to you, Mina</h1>
        <Rubric num="Ⲁ" style={{ marginTop:18 }}>Your rule today</Rubric>
        <div style={{ height:60, borderBottom:`1px solid ${K.ruleDim}` }} />
        <div style={{ height:60, borderBottom:`1px solid ${K.ruleDim}` }} />
      </Body>
      {/* the sheet */}
      <div style={{ position:'absolute', left:0, right:0, bottom:0, background:K.bg2, borderTop:`1px solid ${K.rule}`,
        boxShadow:'0 -16px 40px rgba(0,0,0,0.5)', padding:'10px 26px 30px', zIndex:30 }}>
        <div style={{ width:40, height:3, background:K.rule, margin:'0 auto 16px' }} />
        <Caps size={9.5} ls={2.6} color={K.rubricHi}>Devotion · today</Caps>
        <h2 style={{ fontFamily:K.disp, fontSize:30, fontWeight:600, margin:'4px 0 2px' }}>Prostrations</h2>
        <Caps size={8.5} ls={1.6} color={K.ink2}>Daily · 12 · the goal for today</Caps>
        {/* big count */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:24, margin:'20px 0 10px' }}>
          <button style={{ width:54, height:54, border:`1px solid ${K.rule}`, background:'transparent', color:K.goldHi, fontFamily:K.disp, fontSize:30, cursor:'pointer' }}>–</button>
          <div style={{ textAlign:'center' }}>
            <Numeral size={84} oldstyle color={K.goldHi} style={{ lineHeight:0.8 }}>8</Numeral>
            <div><Caps size={9} ls={2} color={K.ink3}>of 12 kept</Caps></div>
          </div>
          <button style={{ width:54, height:54, border:`1px solid ${K.gold}`, background:'rgba(201,168,74,0.12)', color:K.goldHi, fontFamily:K.disp, fontSize:30, cursor:'pointer' }}>+</button>
        </div>
        <div style={{ marginBottom:18 }}><Tally total={12} filled={8} w={0} h={14} gap={4}/></div>
        <div style={{ display:'flex', gap:0, border:`1px solid ${K.rule}` }}>
          <button style={{ flex:1, padding:'14px', background:K.gold, color:'#1A1303', border:'none', fontFamily:K.text, fontSize:11, letterSpacing:2.2, textTransform:'uppercase', fontWeight:600 }}>Mark kept</button>
          <button style={{ flex:1, padding:'14px', background:'transparent', color:K.parch, border:'none', borderLeft:`1px solid ${K.rule}`, fontFamily:K.text, fontSize:11, letterSpacing:2.2, textTransform:'uppercase', fontWeight:600 }}>Kept in part</button>
        </div>
        <p style={{ display:'flex', gap:8, alignItems:'baseline', marginTop:14, marginBottom:0, fontFamily:K.disp, fontSize:15, fontStyle:'italic', color:K.ink2 }}>
          <Copt size={12} color={K.gold}>†</Copt> Honest and gentle — partial days still tend the flame.
        </p>
      </div>
    </Page>
  );
}

/* ════════════════════════════════════════════════════════════════
   5b · LIGHTEN THE RULE — flexibility for hard seasons
   ════════════════════════════════════════════════════════════════ */
function LightenRule3() {
  return (
    <Page>
      <SheetBar left="The Rule" title="Lighten the rule"/>
      <Body style={{ paddingTop:18 }}>
        <Caps size={10} ls={3} color={K.rubricHi}>For the hard seasons</Caps>
        <h1 style={{ fontFamily:K.disp, fontSize:36, fontWeight:600, lineHeight:0.96, margin:'4px 0 6px' }}>Tend, don’t<br/>storm</h1>
        <p style={{ fontFamily:K.disp, fontSize:17, fontStyle:'italic', color:K.ink2, lineHeight:1.45, marginBottom:6 }}>Travel, illness, a new baby — the rule should bend so it never breaks. None of these lose your streak.</p>
        <div style={{ marginTop:6 }}>
          {[
            ['Take a day of rest','Pause the whole rule for today — the lamp stays lit','clock'],
            ['Pause one practice','Set it aside for a week or a season','bell'],
            ['Keep a lighter rule','A reduced rule for travel or sickness','pen'],
          ].map(([t,s,ic],i)=>(
            <div key={t} style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 2px', borderTop:i===0?`1px solid ${K.rule}`:'none', borderBottom:`1px solid ${K.ruleDim}` }}>
              <div style={{ width:38, height:38, border:`1px solid ${K.rule}`, display:'grid', placeItems:'center' }}><Ic name={ic} size={18} color={K.gold}/></div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:K.disp, fontSize:21, fontWeight:600 }}>{t}</div>
                <div style={{ fontSize:12, color:K.ink2, fontStyle:'italic' }}>{s}</div>
              </div>
              <Ic name="chevR" size={15} color={K.ink3}/>
            </div>
          ))}
        </div>
        {/* a gentle season preset */}
        <div style={{ border:`1px solid ${K.rule}`, padding:'16px 18px', marginTop:22 }}>
          <Caps size={9} ls={2.4} color={K.gold}>A suggested lighter rule</Caps>
          <p style={{ fontFamily:K.disp, fontSize:21, fontStyle:'italic', lineHeight:1.35, margin:'8px 0 14px' }}>Keep the morning Agpeya & one Gospel chapter. Rest the rest.</p>
          <Btn kind="line">Use until I return</Btn>
        </div>
      </Body>
      <Nav3 active="rule"/>
    </Page>
  );
}

Object.assign(window, {
  Tally, Nav3, Mark, Dots, Chip, Stepper, Segmented, Tag, SheetBar,
  NavMap3, Today3, RuleOverview3, PracticeHistory3,
  AddPractice3, ComposePractice3, ComposeCount3, CadencePalette3,
  CountCheckin3, LightenRule3,
});
