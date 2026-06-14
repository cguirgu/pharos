/* app3.jsx — Pharos · "The Rule of Life, reimagined"
   A focused UX exploration: navigation clarity + flexible creating,
   setting & tracking of daily practices. Codex (Book of Hours) language. */

function App3() {
  return (
    <DesignCanvas>
      <DCSection id="r-nav" title="Navigation, made clear" subtitle="Where the rule lives, and why Today now gathers the day">
        <DCArtboard id="r-map" label="The map of the book" width={820} height={760}><NavMap3/></DCArtboard>
        <DCArtboard id="r-today" label="Today · the day’s account" width={390} height={844}><Today3/></DCArtboard>
      </DCSection>

      <DCSection id="r-rule" title="The Rule of Life — a living document" subtitle="A home for goals: reorder, measure, and keep them in one place">
        <DCArtboard id="r-overview" label="Your rule of life" width={390} height={844}><RuleOverview3/></DCArtboard>
        <DCArtboard id="r-history" label="A practice · its history" width={390} height={844}><PracticeHistory3/></DCArtboard>
      </DCSection>

      <DCSection id="r-create" title="Creating a practice — flexible by design" subtitle="Cadence, measure, reminder & intention — for any goal you can name">
        <DCArtboard id="r-add" label="Add a practice" width={390} height={844}><AddPractice3/></DCArtboard>
        <DCArtboard id="r-compose" label="Compose · mark-it-kept" width={390} height={844}><ComposePractice3/></DCArtboard>
        <DCArtboard id="r-count" label="Compose · a count goal" width={390} height={844}><ComposeCount3/></DCArtboard>
        <DCArtboard id="r-cadence" label="How often · the rhythm palette" width={390} height={844}><CadencePalette3/></DCArtboard>
      </DCSection>

      <DCSection id="r-track" title="Tracking, gently" subtitle="Log a count, keep a day in part, or ease the rule for a hard season">
        <DCArtboard id="r-checkin" label="Check-in · a count" width={390} height={844}><CountCheckin3/></DCArtboard>
        <DCArtboard id="r-lighten" label="Lighten the rule" width={390} height={844}><LightenRule3/></DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App3/>);
