# Careerize Subject-to-Career Engine

Date: 2026-06-18  
Status: active product direction  
Owner: Careerize product strategy

## Corrected product definition

Careerize is a South African decision-support platform for Grade 9, Grade 10, Grade 11 and Grade 12 learners who need to understand how school subjects connect to qualifications, entry requirements and real careers.

The core product is not a static career list. It is a pathway engine that works backwards from a learner's possible career direction to the subjects, marks, qualification routes, provider types and first-work entry points that keep that direction realistic.

## Primary learner problem

A learner approaching Grade 10 subject choice can accidentally close future doors without understanding the consequences. Careerize must make those trade-offs visible early, in plain language.

The learner should be able to answer questions like:

- If I want this career, what subjects should I keep?
- Which careers become harder if I drop Mathematics?
- Which routes are still open with Mathematical Literacy?
- Which careers need Physical Sciences or Life Sciences?
- Which qualification do I need after matric?
- What APS or entry marks may be required?
- Is there a university route, TVET route, trade route, learnership route or self-study route?
- What does the real work look like after studying?
- What junior roles can I realistically enter first?

## Product flow

Careerize should follow this order:

1. Learner profile: grade, subjects, marks, location, interests and uncertainty.
2. Career interest or exploration: learner can start with a career, subject strength or broad interest area.
3. Career reality: what the job actually involves, including unglamorous parts.
4. Qualification route: degree, diploma, higher certificate, TVET, trade, occupational, learnership, professional or vendor route.
5. Entry requirements: NQF level, subject requirements, APS where available, maths/science requirements and provider rules.
6. Grade 10 subject action: what to keep, what to improve and what may limit options.
7. First-work entry point: internship, graduate programme, apprentice role, junior role, assistant role, portfolio route or workplace learning.
8. Career progression: where this path can go next and adjacent careers.

## Example: Data Scientist

If a learner chooses Data Scientist, Careerize should explain the route backwards:

Career goal: Data Scientist  
Likely job family: data science, analytics, machine learning, AI, statistics  
Typical first-work entry: data analyst, BI analyst, analytics graduate, junior data scientist, machine learning intern, research assistant  
Likely qualification route: BSc Computer Science / BSc Data Science / BSc Statistics / BCom Informatics / related quantitative degree, then honours or postgraduate specialisation where needed  
Grade 12 target: bachelor admission with strong Mathematics and relevant university subject requirements  
Grade 10 decision: keep Mathematics; consider Physical Sciences, IT or CAT where available; avoid closing STEM doors too early  
Reality check: the job is not only AI excitement. It involves cleaning data, writing code, checking assumptions, explaining results and solving business or research problems.

Careerize must not publish one fixed entry requirement for Data Scientist because requirements vary by institution and qualification. The platform must store provider-specific requirements separately and surface them only when source-verified.

## School subject warning model

Careerize should use a traffic-light model:

- Green: learner's subjects support the route.
- Amber: route may still be possible, but choices are narrower or marks need improvement.
- Red: learner may be blocking a major route and should speak to a teacher/advisor before final subject choice.

Example rules:

- Engineering university routes usually require Mathematics and Physical Sciences. Mark as red if both are missing for the university route, but show alternative technical, TVET or trade routes where relevant.
- Medicine and many health science routes usually require strong Mathematics, Physical Sciences and/or Life Sciences. Mark exact requirements as provider-specific.
- Accounting degree and professional accounting routes commonly prefer or require Mathematics and Accounting. Mark exact APS and subject thresholds as provider-specific.
- IT has multiple routes. Some university Computer Science routes require Mathematics, while support technician and vendor-certification routes may be more flexible.
- Creative routes often depend on portfolio evidence as well as formal study. Mark portfolio requirements separately from academic admission.

## Data rule

Do not invent entry requirements, APS scores or accreditation status.

Use these statuses:

- verified
- varies_by_institution
- not_publicly_confirmed
- needs_manual_verification
- retired_or_discontinued
- replaced_by_current_route

A Careerize pathway is publishable only when every formal claim has:

- source URL
- access date
- provider or awarding body
- qualification type
- NQF level where applicable
- entry requirement status
- confidence score

## Product priority

The next product layer should be the subject-choice engine, not another broad static career dump.

The existing 1,050 starter career routes remain useful for exploration, but the priority is now to connect them to verified qualification pathways, the research queue and Grade 10 subject decisions.
