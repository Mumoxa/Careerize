import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const careerRoutes = [
  {
    id: 'software',
    title: 'Software Developer',
    stream: 'Technology and Digital Products',
    fit: ['building', 'problem-solving', 'computers', 'remote'],
    simple: 'You build websites, apps and systems that people use on computers and phones.',
    day: 'A normal day includes understanding a problem, writing code, testing it, fixing issues, joining short team meetings and improving existing software.',
    tools: 'Computer, code editor, browser, communication tools, project boards and different software systems used by developers.',
    environment: 'Office, hybrid or remote. Often team-based, but with quiet focus time.',
    stress: 'Medium to high when deadlines are tight or systems break.',
    money: 'Can grow strongly with skill and experience, especially in banking, software companies and international remote work.',
    entry: 'Start with school maths, online coding basics, a diploma, degree, bootcamp or junior internship.',
    worst: 'You can get stuck on difficult bugs for hours.',
    best: 'You can create something real from nothing and see people use it.'
  },
  {
    id: 'data',
    title: 'Data Analyst',
    stream: 'Data, Insights and Business Decisions',
    fit: ['numbers', 'patterns', 'problem-solving', 'business'],
    simple: 'You study information and help people understand what is really happening in a business.',
    day: 'A normal day includes collecting information, cleaning it, finding patterns, building reports and explaining the story behind the numbers.',
    tools: 'Computer, spreadsheets, dashboards, databases and reporting software.',
    environment: 'Usually office or hybrid. Found in banks, retailers, insurers, telecoms, logistics companies and many large businesses.',
    stress: 'Medium. Pressure rises when leaders need answers quickly.',
    money: 'Good growth path into business intelligence, analytics, data science or management.',
    entry: 'Start with maths, business subjects, Excel/spreadsheet practice, a commerce, IT, statistics or analytics qualification.',
    worst: 'Messy information can make the work frustrating.',
    best: 'You help people make better decisions with facts instead of guesses.'
  },
  {
    id: 'healthcare',
    title: 'Healthcare Professional',
    stream: 'Health, Care and Human Services',
    fit: ['helping', 'people', 'science', 'hands-on'],
    simple: 'You help people stay healthy, recover or manage illness and injury.',
    day: 'A normal day may include seeing patients, checking symptoms, following care plans, recording information and working with other healthcare workers.',
    tools: 'Medical equipment, patient records, computers, medicine-related systems and practical care tools.',
    environment: 'Hospitals, clinics, private practices, care facilities or community health settings.',
    stress: 'High. You deal with real people, pressure and responsibility.',
    money: 'Varies widely. Some paths require long study but can become stable and respected careers.',
    entry: 'Strong school science helps. Routes include nursing, medicine, pharmacy, emergency care, therapy and health sciences.',
    worst: 'Emotionally heavy days and shift work can be hard.',
    best: 'Your work can directly improve someone’s life.'
  },
  {
    id: 'artisan',
    title: 'Electrician or Technical Artisan',
    stream: 'Skilled Trades and Technical Work',
    fit: ['hands-on', 'fixing', 'tools', 'practical'],
    simple: 'You install, repair and maintain physical systems like wiring, equipment or machinery.',
    day: 'A normal day includes travelling to a site, checking the problem, using tools, repairing or installing equipment and making sure the work is safe.',
    tools: 'Hand tools, testing equipment, safety gear, ladders, meters and technical drawings.',
    environment: 'Homes, factories, mines, construction sites, offices or industrial plants.',
    stress: 'Medium. Can be high when safety risks or urgent breakdowns are involved.',
    money: 'Good practical route. Skilled artisans can earn well, contract independently or start a small business.',
    entry: 'Technical subjects help. Routes include TVET college, apprenticeship, trade test and workplace training.',
    worst: 'Physical work, travel and unsafe sites can be difficult.',
    best: 'You solve visible problems and your skill is always needed.'
  },
  {
    id: 'finance',
    title: 'Finance or Accounting Professional',
    stream: 'Finance, Accounting and Business Control',
    fit: ['numbers', 'structure', 'business', 'detail'],
    simple: 'You help a business understand money, costs, payments, profit and financial rules.',
    day: 'A normal day includes checking transactions, preparing reports, following up on payments, comparing budgets and helping managers understand financial results.',
    tools: 'Computer, spreadsheets, accounting systems, banking platforms and document systems.',
    environment: 'Nearly every company needs finance people. Work is mostly office-based and often hybrid at higher levels.',
    stress: 'Medium to high around month-end, audits and deadlines.',
    money: 'Stable path with growth into accountant, financial manager, analyst, CFO or business owner.',
    entry: 'Accounting and maths literacy or maths help. Study routes include bookkeeping, accounting, finance, tax and commerce qualifications.',
    worst: 'Deadlines and detailed checking can become repetitive.',
    best: 'You understand how businesses really work.'
  }
];

const questions = [
  { id: 'q1', label: 'What sounds most interesting to you?', options: [
    ['building', 'Building things on a computer'],
    ['people', 'Working with people'],
    ['numbers', 'Working with numbers'],
    ['hands-on', 'Fixing practical things']
  ]},
  { id: 'q2', label: 'What type of day would suit you better?', options: [
    ['remote', 'Quiet work that can sometimes be done from home'],
    ['hands-on', 'Moving around and doing practical work'],
    ['business', 'Working inside a company with teams'],
    ['helping', 'Helping people directly']
  ]},
  { id: 'q3', label: 'Which school area do you prefer?', options: [
    ['science', 'Science or biology'],
    ['numbers', 'Maths, accounting or business'],
    ['computers', 'Computers and digital tools'],
    ['tools', 'Technical or practical work']
  ]},
  { id: 'q4', label: 'What would frustrate you the least?', options: [
    ['problem-solving', 'Solving difficult problems'],
    ['detail', 'Checking details carefully'],
    ['people', 'Dealing with different personalities'],
    ['practical', 'Physical work and site visits']
  ]}
];

function App() {
  const [answers, setAnswers] = useState({});

  const ranked = useMemo(() => {
    const selected = Object.values(answers);
    return careerRoutes
      .map(route => ({
        ...route,
        score: route.fit.reduce((total, tag) => total + (selected.includes(tag) ? 1 : 0), 0)
      }))
      .sort((a, b) => b.score - a.score);
  }, [answers]);

  const best = ranked[0];

  return (
    <main className="page">
      <section className="hero">
        <div className="badge">Career guidance for school leavers</div>
        <h1>Careerize</h1>
        <p className="lead">A simple career discovery experience for learners who do not yet know what work actually looks like.</p>
        <div className="heroGrid">
          <div><strong>Explore</strong><span>Career routes in plain language</span></div>
          <div><strong>Compare</strong><span>Day-to-day work, stress and growth</span></div>
          <div><strong>Decide</strong><span>Better subject and study choices</span></div>
        </div>
      </section>

      <section className="panel">
        <h2>Start with four quick questions</h2>
        <p className="muted">This is not a final career decision. It is a first filter to help a learner understand possible routes.</p>
        <div className="questions">
          {questions.map(question => (
            <div className="question" key={question.id}>
              <h3>{question.label}</h3>
              <div className="options">
                {question.options.map(([value, label]) => (
                  <button
                    key={value}
                    className={answers[question.id] === value ? 'selected' : ''}
                    onClick={() => setAnswers(prev => ({ ...prev, [question.id]: value }))}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="results">
        <div className="resultCard featured">
          <p className="eyebrow">Best current match</p>
          <h2>{best.title}</h2>
          <p>{best.simple}</p>
          <div className="facts">
            <div><strong>Stream</strong><span>{best.stream}</span></div>
            <div><strong>Stress level</strong><span>{best.stress}</span></div>
            <div><strong>Money path</strong><span>{best.money}</span></div>
          </div>
        </div>

        <div className="cards">
          {ranked.map(route => (
            <article className="resultCard" key={route.id}>
              <div className="score">Match score: {route.score}/4</div>
              <h3>{route.title}</h3>
              <p>{route.simple}</p>
              <dl>
                <dt>What an 8-hour day can look like</dt>
                <dd>{route.day}</dd>
                <dt>Tools used</dt>
                <dd>{route.tools}</dd>
                <dt>Work environment</dt>
                <dd>{route.environment}</dd>
                <dt>Ways into the job</dt>
                <dd>{route.entry}</dd>
                <dt>Worst part</dt>
                <dd>{route.worst}</dd>
                <dt>Best part</dt>
                <dd>{route.best}</dd>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
