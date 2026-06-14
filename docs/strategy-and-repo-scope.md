# Careerize strategy and repository scope

## Source of truth

Careerize is an independent, free career-intelligence platform. Its job is to help learners understand the real world of work before they choose subjects, qualifications, training routes or early career paths.

The product must show careers honestly: daily work, tools, environment, stress, lifestyle impact, earning reality, routes in, routes up, barriers, growth limits, worst parts, best parts and related careers the learner may not know exist.

## What Careerize is

Careerize is:

- A career intelligence platform.
- A career reality engine.
- A route mapper.
- A qualification decoder.
- A career connector.
- A learner-owned exploration record.
- A trusted source of clear, plain-English career guidance.

## What Careerize is not

Careerize is not:

- A job board.
- A recruitment agency or recruitment tool.
- A CV database.
- An employer access platform.
- A course marketplace.
- A payment platform.
- A sponsor-led content platform.
- A personality-test product.
- A black-box AI career advisor.

Personalised guidance is allowed, but it must explain options and help the learner reflect. It must not issue verdicts, high-impact decisions or hidden ranking conclusions.

## Allowed product data

The repository may contain code, content and schema needed for:

- Public career profiles and career-route data.
- Discovery questions and interest signals.
- Deterministic scoring logic used only as transparent exploration guidance.
- Learner-owned saved profiles.
- Saved discovery answers, route comparisons, notes and session history.
- Privacy, consent, correction and deletion flows when added.
- Aggregated and anonymised product-improvement analysis when properly governed.

The Supabase layer is allowed because users must be able to save their learner profile, return later and receive more personalised guidance based on what they already explored.

## Data that does not belong here

The repository must not contain client, employer, recruiter, sponsor, marketplace, billing, CV, job application, hiring-pipeline, marketing-list or unrelated contact records.

## Supabase boundary

Supabase may be used for:

- Authentication.
- Learner-owned profile memory.
- Latest saved discovery result.
- Discovery-session history.
- Learner privacy and consent records in future.

Supabase must not be used for:

- Employer access.
- CV storage.
- Hiring decisions.
- Recruitment pipelines.
- Payment processing.
- Sponsor targeting.
- Advertising profiles.

Every learner-owned table must use row-level security so users can only read, create, update or delete their own records unless a future admin function is deliberately designed and governed.

## Editorial boundary

Career content must stay independent. No employer, course provider, university, sponsor or commercial partner may pay to influence what a career profile says.

Schools, NGOs, libraries, government bodies or funders may support access or licensing only if this does not change editorial content, route rankings, career descriptions or learner recommendations.

## AI and personalisation boundary

AI or personalised logic may:

- Summarise a learner's saved notes.
- Remind a learner what they previously explored.
- Suggest questions to ask a teacher, parent, mentor or practitioner.
- Suggest safe next experiments such as shadowing, short projects, reading, interviews or subject conversations.
- Explain trade-offs between careers.

AI or personalised logic must not:

- Tell a learner what career they must choose.
- Claim psychometric certainty.
- Make admissions, hiring or eligibility decisions.
- Infer protected traits.
- Hide why a suggestion was made.
- Narrow the learner into a filter bubble.

## Product north star

The learner is never the product. The content is never for sale. Saved user records exist only to help the learner return, reflect and receive better guidance.
