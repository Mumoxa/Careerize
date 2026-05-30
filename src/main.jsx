import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import './styles.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey);
const supabase = hasSupabase ? createClient(supabaseUrl, supabaseAnonKey) : null;

const blankProfile = {
  firstName: '', grade: '', province: '', suburb: '', subjects: '', favouriteSubjects: '', dislikedSubjects: '', interests: '', strengths: '', workStyle: '', environment: '', remotePreference: '', commute: '', stressComfort: '', incomePriority: '', studyPreference: ''
};

const careerRoutes = [
  { id: 'software', title: 'Software Developer', stream: 'Technology and Digital Products', fit: ['building','problem-solving','computers','remote','quiet','maths','technology'], simple: 'You build websites, apps and systems that people use on computers and phones.', day: 'A normal day includes understanding a problem, writing code, testing it, fixing issues, joining short team meetings and improving existing software.', tools: 'Computer, code editor, browser, communication tools, project boards and different software systems used by developers.', environment: 'Office, hybrid or remote. Often team-based, but with quiet focus time.', stress: 'Medium to high when deadlines are tight or systems break.', money: 'Can grow strongly with skill and experience, especially in banking, software companies and international remote work.', entry: 'Start with school maths, online coding basics, a diploma, degree, bootcamp or junior internship.', worst: 'You can get stuck on difficult bugs for hours.', best: 'You can create something real from nothing and see people use it.' },
  { id: 'data', title: 'Data Analyst', stream: 'Data, Insights and Business Decisions', fit: ['numbers','patterns','problem-solving','business','maths','detail','quiet'], simple: 'You study information and help people understand what is really happening in a business.', day: 'A normal day includes collecting information, cleaning it, finding patterns, building reports and explaining the story behind the numbers.', tools: 'Computer, spreadsheets, dashboards, databases and reporting software.', environment: 'Usually office or hybrid. Found in banks, retailers, insurers, telecoms, logistics companies and many large businesses.', stress: 'Medium. Pressure rises when leaders need answers quickly.', money: 'Good growth path into business intelligence, analytics, data science or management.', entry: 'Start with maths, business subjects, spreadsheet practice, a commerce, IT, statistics or analytics qualification.', worst: 'Messy information can make the work frustrating.', best: 'You help people make better decisions with facts instead of guesses.' },
  { id: 'healthcare', title: 'Healthcare Professional', stream: 'Health, Care and Human Services', fit: ['helping','people','science','hands-on','biology','care','high-stress'], simple: 'You help people stay healthy, recover or manage illness and injury.', day: 'A normal day may include seeing patients, checking symptoms, following care plans, recording information and working with other healthcare workers.', tools: 'Medical equipment, patient records, computers, medicine-related systems and practical care tools.', environment: 'Hospitals, clinics, private practices, care facilities or community health settings.', stress: 'High. You deal with real people, pressure and responsibility.', money: 'Varies widely. Some paths require long study but can become stable and respected careers.', entry: 'Strong school science helps. Routes include nursing, medicine, pharmacy, emergency care, therapy and health sciences.', worst: 'Emotionally heavy days and shift work can be hard.', best: 'Your work can directly improve someone’s life.' },
  { id: 'artisan', title: 'Electrician or Technical Artisan', stream: 'Skilled Trades and Technical Work', fit: ['hands-on','fixing','tools','practical','moving','technical','outside'], simple: 'You install, repair and maintain physical systems like wiring, equipment or machinery.', day: 'A normal day includes travelling to a site, checking the problem, using tools, repairing or installing equipment and making sure the work is safe.', tools: 'Hand tools, testing equipment, safety gear, ladders, meters and technical drawings.', environment: 'Homes, factories, mines, construction sites, offices or industrial plants.', stress: 'Medium. Can be high when safety risks or urgent breakdowns are involved.', money: 'Good practical route. Skilled artisans can earn well, contract independently or start a small business.', entry: 'Technical subjects help. Routes include TVET college, apprenticeship, trade test and workplace training.', worst: 'Physical work, travel and unsafe sites can be difficult.', best: 'You solve visible problems and your skill is always needed.' },
  { id: 'finance', title: 'Finance or Accounting Professional', stream: 'Finance, Accounting and Business Control', fit: ['numbers','structure','business','detail','accounting','office','money'], simple: 'You help a business understand money, costs, payments, profit and financial rules.', day: 'A normal day includes checking transactions, preparing reports, following up on payments, comparing budgets and helping managers understand financial results.', tools: 'Computer, spreadsheets, accounting systems, banking platforms and document systems.', environment: 'Nearly every company needs finance people. Work is mostly office-based and often hybrid at higher levels.', stress: 'Medium to high around month-end, audits and deadlines.', money: 'Stable path with growth into accountant, financial manager, analyst, CFO or business owner.', entry: 'Accounting and maths literacy or maths help. Study routes include bookkeeping, accounting, finance, tax and commerce qualifications.', worst: 'Deadlines and detailed checking can become repetitive.', best: 'You understand how businesses really work.' }
];

const questions = [
  { id: 'q1', label: 'What sounds most interesting to you?', options: [['building','Building things on a computer'], ['people','Working with people'], ['numbers','Working with numbers'], ['hands-on','Fixing practical things']] },
  { id: 'q2', label: 'What type of day would suit you better?', options: [['remote','Quiet work that can sometimes be done from home'], ['hands-on','Moving around and doing practical work'], ['business','Working inside a company with teams'], ['helping','Helping people directly']] },
  { id: 'q3', label: 'Which school area do you prefer?', options: [['science','Science or biology'], ['numbers','Maths, accounting or business'], ['computers','Computers and digital tools'], ['tools','Technical or practical work']] },
  { id: 'q4', label: 'What would frustrate you the least?', options: [['problem-solving','Solving difficult problems'], ['detail','Checking details carefully'], ['people','Dealing with different personalities'], ['practical','Physical work and site visits']] }
];

function profileTags(profile) {
  const text = Object.values(profile).join(' ').toLowerCase();
  const tags = [];
  [['math','maths'], ['accounting','accounting'], ['business','business'], ['computer','computers'], ['coding','technology'], ['technology','technology'], ['biology','biology'], ['science','science'], ['help','helping'], ['people','people'], ['care','care'], ['fix','fixing'], ['tool','tools'], ['technical','technical'], ['practical','practical'], ['quiet','quiet'], ['remote','remote'], ['office','office'], ['outside','outside'], ['money','money'], ['detail','detail'], ['pressure','high-stress']].forEach(([needle, tag]) => { if (text.includes(needle)) tags.push(tag); });
  if (profile.workStyle === 'Focused quiet work') tags.push('quiet');
  if (profile.workStyle === 'Practical hands-on work') tags.push('hands-on', 'practical');
  if (profile.workStyle === 'Working with people') tags.push('people', 'helping');
  if (profile.environment === 'Mostly indoors at a desk') tags.push('office', 'quiet');
  if (profile.environment === 'Moving around or visiting sites') tags.push('moving', 'outside');
  if (profile.remotePreference === 'I would like remote or hybrid work') tags.push('remote');
  if (profile.incomePriority === 'Very important') tags.push('money');
  return tags;
}

function Field({ label, name, value, onChange, placeholder, type = 'text' }) {
  return <label className="field"><span>{label}</span><input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} /></label>;
}

function SelectField({ label, name, value, onChange, options }) {
  return <label className="field"><span>{label}</span><select name={name} value={value} onChange={onChange}><option value="">Select one</option>{options.map(option => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function AuthPanel({ onDemo }) {
  const [mode, setMode] = useState('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  async function submit(event) {
    event.preventDefault();
    if (!hasSupabase) { setStatus('Login is designed but not connected yet. Add Supabase keys in Cloudflare environment variables.'); return; }
    setStatus('Working...');
    const response = mode === 'signUp'
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (response.error) setStatus(response.error.message);
    else setStatus(mode === 'signUp' ? 'Account created. Check email if confirmation is enabled, then sign in.' : 'Signed in.');
  }

  return <section className="panel authPanel">
    <p className="eyebrow">Account required</p>
    <h2>Create an account to save your profile and results</h2>
    <p className="muted">This is the correct structure for Careerize: learners log in, complete their profile, then return later to see their saved guidance.</p>
    <form className="authForm" onSubmit={submit}>
      <Field label="Email address" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="learner@example.com" />
      <Field label="Password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a password" />
      <button className="primaryButton" type="submit">{mode === 'signUp' ? 'Create account' : 'Log in'}</button>
    </form>
    <div className="authSwitch"><button className="linkButton" onClick={() => setMode(mode === 'signUp' ? 'signIn' : 'signUp')}>{mode === 'signUp' ? 'Already have an account? Log in' : 'Need an account? Create one'}</button><button className="linkButton" onClick={onDemo}>Continue in demo mode</button></div>
    {status && <p className="statusNote">{status}</p>}
  </section>;
}

function App() {
  const [session, setSession] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  const [profile, setProfile] = useState(blankProfile);
  const [answers, setAnswers] = useState({});
  const [saveStatus, setSaveStatus] = useState('');

  const user = session?.user || null;
  const storageKey = user ? `careerize-profile-${user.id}` : 'careerize-demo-profile';
  const answerKey = user ? `careerize-answers-${user.id}` : 'careerize-demo-answers';

  useEffect(() => {
    if (!hasSupabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, activeSession) => setSession(activeSession));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const savedProfile = window.localStorage.getItem(storageKey);
    const savedAnswers = window.localStorage.getItem(answerKey);
    setProfile(savedProfile ? JSON.parse(savedProfile) : blankProfile);
    setAnswers(savedAnswers ? JSON.parse(savedAnswers) : {});
  }, [storageKey, answerKey]);

  const ranked = useMemo(() => {
    const selected = [...Object.values(answers), ...profileTags(profile)];
    return careerRoutes.map(route => ({ ...route, score: route.fit.reduce((total, tag) => total + (selected.includes(tag) ? 1 : 0), 0) })).sort((a, b) => b.score - a.score);
  }, [answers, profile]);

  const best = ranked[0];
  const completion = useMemo(() => Math.round((Object.values(profile).filter(Boolean).length / Object.keys(blankProfile).length) * 100), [profile]);

  function updateProfile(event) { const { name, value } = event.target; setProfile(prev => ({ ...prev, [name]: value })); }
  function saveProgress() { window.localStorage.setItem(storageKey, JSON.stringify(profile)); window.localStorage.setItem(answerKey, JSON.stringify(answers)); setSaveStatus(`Saved. Your current best match is ${best.title}.`); }
  function resetProfile() { setProfile(blankProfile); setAnswers({}); window.localStorage.removeItem(storageKey); window.localStorage.removeItem(answerKey); setSaveStatus('Profile cleared.'); }
  async function signOut() { if (hasSupabase && user) await supabase.auth.signOut(); setDemoMode(false); }

  if (!user && !demoMode) return <main className="page"><section className="hero"><div className="badge">Career guidance for school leavers</div><h1>Careerize</h1><p className="lead">Log in to create a learner profile, save career matches and return later to continue the journey.</p></section><AuthPanel onDemo={() => setDemoMode(true)} /></main>;

  return <main className="page">
    <section className="hero"><div className="badge">{user ? `Signed in as ${user.email}` : 'Demo mode'}</div><h1>Careerize</h1><p className="lead">Build your learner profile, save your results, and come back later to continue comparing career routes.</p><div className="heroGrid"><div><strong>Account</strong><span>{user ? 'Profile linked to login' : 'Demo only, not cloud-saved'}</span></div><div><strong>Profile</strong><span>{completion}% complete</span></div><div><strong>Current match</strong><span>{best.title}</span></div></div></section>

    <section className="panel profilePanel"><div className="sectionHead"><div><p className="eyebrow">Step 1</p><h2>Your saved learner profile</h2><p className="muted">Complete this once, save it, then return later using the same login to continue.</p></div><div className="completion"><strong>{completion}%</strong><span>profile complete</span></div></div><div className="profileGrid">
      <Field label="First name" name="firstName" value={profile.firstName} onChange={updateProfile} placeholder="Example: Lwazi" />
      <SelectField label="Current grade" name="grade" value={profile.grade} onChange={updateProfile} options={['Grade 8','Grade 9','Grade 10','Grade 11','Grade 12','Finished school']} />
      <Field label="Province" name="province" value={profile.province} onChange={updateProfile} placeholder="Example: Western Cape" />
      <Field label="Suburb or town" name="suburb" value={profile.suburb} onChange={updateProfile} placeholder="Example: Bellville" />
      <Field label="Current subjects" name="subjects" value={profile.subjects} onChange={updateProfile} placeholder="Example: Maths, Life Sciences, Accounting" />
      <Field label="Favourite subjects" name="favouriteSubjects" value={profile.favouriteSubjects} onChange={updateProfile} placeholder="Example: Business Studies and CAT" />
      <Field label="Subjects you do not enjoy" name="dislikedSubjects" value={profile.dislikedSubjects} onChange={updateProfile} placeholder="Example: Physical Sciences" />
      <Field label="Interests outside school" name="interests" value={profile.interests} onChange={updateProfile} placeholder="Example: gaming, animals, sport, cars, helping people" />
      <Field label="Things you are naturally good at" name="strengths" value={profile.strengths} onChange={updateProfile} placeholder="Example: explaining, fixing, organising, noticing detail" />
      <SelectField label="Preferred work style" name="workStyle" value={profile.workStyle} onChange={updateProfile} options={['Focused quiet work','Working with people','Practical hands-on work','Leading or organising others','Creative work']} />
      <SelectField label="Preferred work environment" name="environment" value={profile.environment} onChange={updateProfile} options={['Mostly indoors at a desk','Moving around or visiting sites','Outside or physical environments','Hospitals or care environments','Shops, branches or customer spaces']} />
      <SelectField label="Remote work preference" name="remotePreference" value={profile.remotePreference} onChange={updateProfile} options={['I would like remote or hybrid work','I prefer being around people','I do not mind either']} />
      <SelectField label="Daily commute comfort" name="commute" value={profile.commute} onChange={updateProfile} options={['I need work close to home','I can travel daily','I may relocate one day','I prefer remote if possible']} />
      <SelectField label="Pressure comfort" name="stressComfort" value={profile.stressComfort} onChange={updateProfile} options={['Low pressure is better for me','Medium pressure is fine','I can handle high pressure if the work matters']} />
      <SelectField label="Income growth importance" name="incomePriority" value={profile.incomePriority} onChange={updateProfile} options={['Very important','Important but not everything','Stability matters more']} />
      <SelectField label="Study preference" name="studyPreference" value={profile.studyPreference} onChange={updateProfile} options={['University degree','University of technology','TVET or trade route','Short courses and work experience','Not sure yet']} />
    </div><div className="profileActions"><button className="secondaryButton" onClick={resetProfile}>Reset</button><button className="primaryButton" onClick={saveProgress}>Save profile and results</button><button className="secondaryButton" onClick={signOut}>{user ? 'Sign out' : 'Exit demo'}</button></div>{saveStatus && <p className="statusNote">{saveStatus}</p>}</section>

    <section className="panel"><div className="sectionHead compact"><div><p className="eyebrow">Step 2</p><h2>Career matching questions</h2><p className="muted">These answers combine with the profile above.</p></div></div><div className="questions">{questions.map(question => <div className="question" key={question.id}><h3>{question.label}</h3><div className="options">{question.options.map(([value, label]) => <button key={value} className={answers[question.id] === value ? 'selected' : ''} onClick={() => setAnswers(prev => ({ ...prev, [question.id]: value }))}>{label}</button>)}</div></div>)}</div></section>

    <section className="results"><div className="resultCard featured"><p className="eyebrow">Saved result preview</p><h2>{best.title}</h2><p>{profile.firstName ? `${profile.firstName}, this route may suit you based on your saved profile and answers.` : 'This route is based on the saved profile and answers.'} {best.simple}</p><div className="facts"><div><strong>Stream</strong><span>{best.stream}</span></div><div><strong>Stress level</strong><span>{best.stress}</span></div><div><strong>Money path</strong><span>{best.money}</span></div></div></div><div className="cards">{ranked.map(route => <article className="resultCard" key={route.id}><div className="score">Match score: {route.score}</div><h3>{route.title}</h3><p>{route.simple}</p><dl><dt>What an 8-hour day can look like</dt><dd>{route.day}</dd><dt>Tools used</dt><dd>{route.tools}</dd><dt>Work environment</dt><dd>{route.environment}</dd><dt>Ways into the job</dt><dd>{route.entry}</dd><dt>Worst part</dt><dd>{route.worst}</dd><dt>Best part</dt><dd>{route.best}</dd></dl></article>)}</div></section>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
