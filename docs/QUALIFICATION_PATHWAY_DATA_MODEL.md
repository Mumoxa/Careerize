# Qualification Pathway Data Model

Date: 2026-06-18  
Status: active build specification

## Purpose

This document defines the data model required to connect Careerize careers to South African post-matric study routes, NQF-aligned qualifications, Grade 10-12 subject choices, entry criteria and realistic first-work outcomes.

The model is designed for a staged import process. It must not encourage hallucinated qualification claims. Unknowns must stay unknown until verified.

## Core entities

### 1. Career cluster

Represents a broad career family.

Fields:

- cluster_id
- cluster_name
- plain_english_description
- related_school_subjects
- typical_route_types
- notes_for_learners

Recommended clusters:

- Information Technology and Computer Science
- Cybersecurity
- Data Science and Analytics
- Engineering
- Artisan and Trade Careers
- Built Environment and Construction
- Finance, Accounting, Banking and Insurance
- Business, Management and Entrepreneurship
- Law and Legal Services
- Healthcare and Medicine
- Nursing and Care Work
- Psychology and Social Services
- Education and Teaching
- Science and Laboratory Careers
- Agriculture and Environmental Careers
- Logistics, Supply Chain and Transport
- Aviation and Maritime
- Hospitality, Tourism and Culinary Arts
- Media, Design, Film and Creative Arts
- Sales, Marketing and Communications
- Public Safety, Policing and Security
- Sports, Fitness and Wellness
- Beauty, Hair and Personal Care
- Automotive and Mechanical Careers
- Energy, Mining and Manufacturing

### 2. Career profile

Represents one career or role family.

Fields:

- career_id
- career_title
- cluster_id
- plain_english_summary
- day_to_day_work
- tools_used
- work_environment
- worst_parts
- best_parts
- entry_level_job_titles
- senior_job_titles
- adjacent_careers
- qualification_routes
- required_subjects_summary
- recommended_subjects_summary
- route_uncertainty_notes
- source_status

### 3. Qualification

Represents a formal or industry-recognised learning route.

Fields:

- qualification_id
- qualification_name
- qualification_type
- nqf_level
- credits
- duration
- provider_or_awarding_body
- provider_type
- public_private_vendor_professional
- route_type
- field_of_study
- career_cluster
- entry_requirements_text
- required_school_subjects
- recommended_school_subjects
- aps_or_admission_score
- maths_requirement
- science_requirement
- english_requirement
- study_mode
- province_or_availability
- career_outcomes
- possible_job_titles
- further_study_options
- accreditation_requirements
- source_url
- access_date
- verification_status
- confidence_score
- cautions

### 4. Provider

Represents an institution, college, professional body, SETA, vendor or awarding body.

Fields:

- provider_id
- provider_name
- provider_type
- public_or_private
- province
- campuses
- online_available
- registration_body
- accreditation_body
- source_url
- access_date
- verification_status

### 5. Subject rule

Connects school subjects to pathway access.

Fields:

- rule_id
- subject
- career_cluster
- route_type
- requirement_strength
- rule_summary
- learner_warning
- verification_status
- source_url

Requirement strength values:

- required
- strongly_recommended
- helpful
- route_dependent
- not_required
- blocks_some_routes_if_missing

### 6. Accreditation source

Represents an official source category that Careerize can use to validate a claim.

Fields:

- source_id
- source_name
- source_type
- source_url
- used_for
- claim_types_supported
- notes

## Qualification types to support

Careerize must support more than degrees:

- Higher Certificate
- Diploma
- Advanced Diploma
- Bachelor's Degree
- Extended Bachelor's Degree
- Occupational Certificate
- National Certificate Vocational
- NATED / Report 191
- Learnership
- Apprenticeship
- Trade Test
- Professional Certificate
- Professional Designation
- Vendor Certificate
- Short Course
- Bridging Programme
- Portfolio Route
- Workplace Route

## Route types

- university_route
- university_of_technology_route
- tvet_route
- trade_route
- occupational_route
- learnership_route
- workplace_route
- professional_body_route
- vendor_certification_route
- self_study_route
- portfolio_route
- bridging_route

## Maths requirement values

- Mathematics required
- Mathematics strongly recommended
- Mathematics or Mathematical Literacy accepted
- Mathematical Literacy accepted for some routes
- Not required
- Not publicly confirmed
- Varies by institution

## Science requirement values

- Physical Sciences required
- Physical Sciences strongly recommended
- Life Sciences required
- Life Sciences strongly recommended
- Physical Sciences or Life Sciences route-dependent
- Not required
- Not publicly confirmed
- Varies by institution

## Verification statuses

- verified
- source_found_needs_review
- varies_by_institution
- not_publicly_confirmed
- needs_manual_verification
- retired_or_discontinued
- replaced_by_current_route

## Import principle

The system may contain unverified working rows, but the UI must not display them as final advice. Public-facing screens must clearly distinguish:

- source-backed information
- broad guidance
- institution-specific requirements
- unknown or changing requirements

## Product display principle

For a learner, every qualification should answer:

1. What is this qualification?
2. Who offers or awards it?
3. What level is it on the NQF, if applicable?
4. What subjects or marks do I need?
5. What career can it lead to?
6. What can I study next?
7. What must I verify before applying?
