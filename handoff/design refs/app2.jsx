/* app2.jsx — Pharos MVP v2 (Codex / Book of Hours) */

function App2() {
  return (
    <DesignCanvas>
      <DCSection id="v2-foundations" title="Foundations · the Codex" subtitle="Brand title-page + the hand of the book">
        <DCArtboard id="v2-brand" label="Brand · title page" width={760} height={620}><BrandBoard2/></DCArtboard>
        <DCArtboard id="v2-system" label="The materials" width={760} height={360}><SystemBoard2/></DCArtboard>
      </DCSection>

      <DCSection id="v2-onboarding" title="Onboarding" subtitle="A page from the book opens the rule of life">
        <DCArtboard id="v2-onb1" label="Welcome" width={390} height={844}><OnbWelcome2/></DCArtboard>
        <DCArtboard id="v2-onb2" label="Where are you?" width={390} height={844}><OnbPersonalize2/></DCArtboard>
        <DCArtboard id="v2-onb3" label="Rule of life" width={390} height={844}><OnbRhythm2/></DCArtboard>
      </DCSection>

      <DCSection id="v2-home" title="Home — 3 variations" subtitle="The Ordo page · the illuminated hour · the register">
        <DCArtboard id="v2-homeA" label="A · The Ordo page" width={390} height={844}><Home2A/></DCArtboard>
        <DCArtboard id="v2-homeB" label="B · The illuminated hour" width={390} height={844}><Home2B/></DCArtboard>
        <DCArtboard id="v2-homeC" label="C · The register" width={390} height={844}><Home2C/></DCArtboard>
      </DCSection>

      <DCSection id="v2-fasting" title="Fasting & the Ordo" subtitle="The fast kept, the daily account, the liturgical calendar">
        <DCArtboard id="v2-fast1" label="On the fast" width={390} height={844}><FastOverview2/></DCArtboard>
        <DCArtboard id="v2-fast2" label="Fast · check-in" width={390} height={844}><FastCheckin2/></DCArtboard>
        <DCArtboard id="v2-cal1" label="The Ordo" width={390} height={844}><Ordo2/></DCArtboard>
        <DCArtboard id="v2-cal2" label="Day · Synaxarium" width={390} height={844}><CalendarDay2/></DCArtboard>
      </DCSection>

      <DCSection id="v2-scripture" title="The Word & the Catechism" subtitle="Lectionary, reading page, paths, a lesson">
        <DCArtboard id="v2-bib1" label="The lectionary" width={390} height={844}><BiblePlans2/></DCArtboard>
        <DCArtboard id="v2-bib2" label="Reading page" width={390} height={844}><BibleReader2/></DCArtboard>
        <DCArtboard id="v2-learn1" label="The catechism" width={390} height={844}><LearnPaths2/></DCArtboard>
        <DCArtboard id="v2-learn2" label="A lesson" width={390} height={844}><LearnLesson2/></DCArtboard>
      </DCSection>

      <DCSection id="v2-growth" title="The Lamp, Saints & Journal" subtitle="Streak, Synaxarium, the commonplace book, the keeper">
        <DCArtboard id="v2-streak" label="The lamp tended" width={390} height={844}><StreakDetail2/></DCArtboard>
        <DCArtboard id="v2-saint" label="Saint of the day" width={390} height={844}><SaintOfDay2/></DCArtboard>
        <DCArtboard id="v2-jrn1" label="The journal" width={390} height={844}><JournalList2/></DCArtboard>
        <DCArtboard id="v2-jrn2" label="An entry" width={390} height={844}><JournalEntry2/></DCArtboard>
        <DCArtboard id="v2-profile" label="The keeper" width={390} height={844}><Profile2/></DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App2/>);
