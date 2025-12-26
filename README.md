# AI-Assisted Oncology Clinical Dashboard

## Overview

This project is an **AI-assisted clinical dashboard for oncology**, designed to help clinicians **understand a patient’s disease course quickly, safely, and with reduced cognitive burden**.

Oncology care requires synthesizing complex, fragmented, longitudinal data across diagnosis, imaging, pathology, genomics, labs, treatments, and comorbidities. This dashboard focuses on **organizing information into clinically meaningful structures**, surfacing **priority signals**, and enabling **cross-domain reasoning** — without automating medical decisions.

The product emphasizes:
- Clinical context awareness  
- Longitudinal reasoning  
- Data synthesis across domains  
- Responsible, non-prescriptive AI usage  

---

## Product Goals

### Primary Goals
- Enable clinicians to **understand current clinical status in seconds**
- Clearly **track disease, treatment, and key findings over time**
- Explicitly distinguish **what matters now vs what can be reviewed later**
- Translate complex clinical and molecular data into **decision-relevant insights**
- Reduce information overload and alert fatigue

### Explicit Non-Goals
- No treatment recommendations  
- No prognostic predictions  
- No guideline enforcement  
- No automated clinical decision-making  

AI is used strictly for **summarization and synthesis**, not prescription.

---

## Design Principles

1. **Clinical-first information hierarchy**  
   Mirrors oncologist reasoning: snapshot → alerts → disease → function → timeline → biology → synthesis.

2. **Progressive disclosure**  
   High-signal information is visible by default; detailed evidence is expandable.

3. **Longitudinal over static reasoning**  
   Trends and trajectories are emphasized over single data points.

4. **Responsible AI by design**  
   Safety-critical logic is deterministic; AI is assistive, transparent, and constrained.

---

## Architecture Overview

### High-Level Architecture

CSV Patient Dataset
↓
Deterministic Logic Layer
(alert detection, prioritization)
↓
Structured Context Builder
↓
AI Services (LLM Calls)
• Clinical Alerts Summary (AI #1)
• Cross-Domain Clinical Reasoning (AI #2)
↓
Frontend Dashboard


---

### Frontend
- Sectioned clinical dashboard
- Card-based layout with expandable panels
- Color-coded priority signals
- Vertical longitudinal timeline for dated events

### Backend / Logic Layer
- Loads structured patient data from CSV
- Applies **rule-based logic** for:
  - Clinical alerts
  - Functional risk signals
  - Data completeness checks
- Prepares structured inputs for AI synthesis

### AI Layer
Two **strictly bounded** AI components:
1. **Clinical Alerts Summary**
2. **Cross-Domain Clinical Reasoning Synthesizer**

AI never decides what is important — it **summarizes and connects signals determined by logic**.

---

## Data Model

### Dataset Characteristics
- 83 structured clinical parameters
- One row = one patient snapshot
- Covers:
  - Demographics & staging
  - Imaging & radiology
  - Pathology & genomics
  - Biomarkers & labs
  - Treatments & response
  - Comorbidities & risks

### Design Intent
- Supports longitudinal reasoning
- Includes qualitative summaries intentionally for AI synthesis
- Avoids reliance on external guidelines

---

## Dashboard Structure (Final)

### Section 1 — Patient Snapshot
- Name, age, sex
- ECOG performance status
- Diagnosis and histology
- Last visit
- Stage progression

_No AI, no inference._

---

### Section 2 — Clinical Alerts & Priority Signals (AI-assisted)
- Alerts triggered **only via rule-based logic**
- Covers:
  - Disease activity
  - Functional reserve
  - Organ safety
  - Treatment tolerance
  - Data quality
- AI summarizes **why these alerts matter together**

Answers: **“What needs attention right now?”**

---

### Section 3 — Disease Status & Tumor Burden
- Treatment response (RECIST)
- Radiology trends
- Metastatic status and sites
- Lesion burden
- Radiology findings and reports

---

### Section 4 — Disease & Treatment Timeline
Vertical chronological timeline:
- Diagnosis
- Biopsy
- Imaging milestones
- Surgery / radiation
- Treatment initiation and response

Additional cards:
- Treatment context
- Current line and prior therapies
- Disease course summary

---

### Section 5 — Organ Function & Treatment Tolerance
- Renal and hepatic function flags
- Lab abnormalities and trends
- Documented toxicities
- Pathology uncertainty

---

### Section 6 — Comorbidities & Risk Factors
- Active comorbidities (only those present)
- Smoking history

---

### Section 7 — Detailed Clinical Evidence
Reference-only section:
- Pathology summary
- Molecular & genomic profile
- Biomarkers and tumor markers
- Laboratory details
- Source documents and notes

Hidden by default.

---

### Section 8 — Cross-Domain Clinical Insights (AI-assisted)

High-value AI synthesis that:
- Connects biology → therapy → response
- Checks alignment or discordance across domains
- Surfaces implicit clinical narratives

Answers: **“How do these pieces fit together clinically?”**

---

## AI Usage (Responsible by Design)

### AI #1 — Clinical Alerts Summary
- Inputs: triggered alerts only
- Output: 3–4 concise bullet points
- Purpose: reduce scanning time

### AI #2 — Cross-Domain Clinical Reasoning Synthesizer
- Connects findings across sections
- Highlights concordance or tension
- Mimics senior clinician synthesis

### Safety Boundaries
AI must never:
- Recommend treatments
- Predict outcomes
- Introduce external guidelines
- Override clinician judgment

---

## Key Tradeoffs & Assumptions

### Tradeoffs

| Decision | Rationale |
|--------|-----------|
| Rule-based alerts | Safety and auditability |
| No treatment recommendations | Preserves clinical trust |
| Progressive disclosure | Reduces cognitive overload |
| Structured data focus | Improves consistency |

---

### Assumptions
- Clinicians value clarity over completeness
- Not all data needs to be visible at once
- AI should support reasoning, not replace it

---

## V1 Scope Decisions

### Included
- Single-patient deep view
- Longitudinal disease tracking
- Deterministic alerts
- AI synthesis for context

### Explicitly Excluded
- Cohort analytics
- Predictive modeling
- Automated decision support
- Treatment optimization engines

---

## Disclaimer

This product is a **clinical decision support aid**, not a medical device.  
All AI-generated outputs are **assistive only** and must be interpreted by qualified clinicians.

---

## Final Note

This project mirrors real-world oncology product challenges — balancing complexity, safety, and usability.  
The goal is not to replace clinicians, but to **help them reason more clearly, faster, and with less cognitive burden**.

