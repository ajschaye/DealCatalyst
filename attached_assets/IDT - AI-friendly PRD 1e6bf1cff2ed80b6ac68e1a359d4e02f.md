# IDT - AI-friendly PRD

## Product: Internal Deal Tracker

### Overview

The Internal Deal Tracker is a lightweight, collaborative web app for tracking strategic startup partnerships and investments. It is built for a corporate BizDev team to monitor deal progress, attach notes/resources, and generate executive-friendly summaries using AI.

---

## Target Users & Use Cases

### User Roles

- **BizDev Rep**: Creates, edits, and owns deals. Adds context and resources.
- **Team Lead**: Filters and reviews deals, assigns ownership.
- **Executive**: Views summaries to evaluate strategic fit and progress.

### Sample User Stories

- *As a BizDev Rep, I want to log a new opportunity with key fields and notes so I don’t lose track of it.*
- *As a Team Lead, I want to filter deals by business unit to manage pipeline focus.*
- *As an Executive, I want a one-line AI summary for each deal so I can quickly understand the opportunity.*

---

## Features & Requirements

### Feature 1: Deal Dashboard

**Description**: Central table or card view showing all deals.
**Requirements**:

- Display: Company name, lead owner, stage, AI summary snippet, last updated.
- Filtering: By lead, stage, tags, and business unit.
- Sorting: By last updated or deal stage.

### Feature 2: Deal Detail View

**Description**: Full view for each deal with editable fields and notes.
**Fields**:

- Company name (string)
- Website (URL)
- Internal contact (string)
- Business unit (select from defined list)
- Partnership type (enum: Strategic Investment, Vendor, Pilot, etc.)
- Investment size (number, optional)
- Use case (string)
- Tags (multi-select)
- Linked resources (URLs or uploaded files)
- Internal notes (markdown field)

### Feature 3: AI Summary Generation

**Description**: Generate a 3–5 sentence summary using OpenAI's GPT API.
**Behavior**:

- Input = Notes + Metadata fields
- Triggered by button click ("Generate Summary")
- Output editable by user
- Stored and viewable in dashboard

### Feature 4: Field Customization (Admin Only)

**Description**: Ability to add new global fields (e.g. "Strategic Fit")
**Requirements**:

- Admin users can define new fields with name and type (text, number, enum)
- Fields appear across all deal entries
- Supports optional vs. required flag

### Feature 5: Collaboration & Comments

**Description**: Multiple users can view/edit deals.
**Requirements**:

- One lead owner per deal (editable)
- Comment thread on each deal
- Optional change log/audit trail

---

## Technical Constraints & Preferences

- **Frontend**: HTML/CSS/JavaScript or lightweight React
- **Backend**: Flask or Node.js
- **Database**: SQLite or Supabase
- **AI Integration**: OpenAI API (gpt-4o)
- **Deployment**: Replit environment
- **Security**: API keys stored via Replit Secrets
- **Auth**: Basic login or invite-only access (optional MVP)

---

## Non-Functional Requirements

- Clean, intuitive UI with responsive layout
- Mobile-friendly minimum, desktop optimized
- Performance target: Generate summaries in <5 seconds
- Optional: Export dashboard to PDF or CSV

---

## Out of Scope

- No full CRM functionality (no opportunity forecasting, email integrations, etc.)
- No external APIs for fetching company data in V1
- No support for large file uploads (>10MB)

---

## Milestones (Feature Development Sequence)

1. **Core Infrastructure**
    - Initialize Replit project (Flask or Node.js backend)
    - Set up SQLite or Supabase database
    - Create deal schema and basic data model
2. **Basic Deal Management**
    - Implement dashboard UI with deal cards/rows
    - Enable deal creation, editing, and deletion
    - Add core fields: company, website, lead owner, stage, last updated
3. **Deal Detail View**
    - Build detail page for each deal
    - Enable rich text internal notes
    - Support linking to external resources (URLs, file placeholders)
4. **Filtering & Ownership**
    - Add filters to dashboard: by owner, stage, tags
    - Implement ownership assignment and visibility
5. **Custom Fields**
    - Allow admins to define new fields (label, type)
    - Add support for text, number, enum types
    - Apply dynamic fields to all existing deals
6. **AI Market Research Integration**
    - Add “Generate Markt Research” button in detail view
    - Call OpenAI API with a specific prompt and use deep research to generate the report
    - Link to the full report
7. **AI Summary Integration**
    - Add “Generate Summary” button in detail view
    - Call OpenAI API with notes + metadata
    - Display and store editable AI summary
8. **Collaboration & Comments**
    - Add threaded comments per deal
    - Implement basic user roles: viewer, editor, admin
9. **Polish & Optional Enhancements**
    - Add change log / audit trail (if time allows)
    - UI/UX improvements (responsive layout, icons)
    - Optional: export dashboard to PDF or CSV

---

## Example Deal (JSON-style)

```json
{
  "company": "Eliza.AI",
  "website": "<https://eliza.ai>",
  "lead_owner": "Jane Smith",
  "internal_contact": "John Doe",
  "business_unit": "Data Platforms",
  "deal_type": "Strategic Investment",
  "investment_size": 2000000,
  "use_case": "Internal knowledge agent",
  "tags": ["AI", "Chatbot", "Internal Tools"],
  "notes": "Strong demo. Slack integration solid. Potential deployment friction.",
  "ai_summary": "Eliza.AI builds internal chatbots for enterprise knowledge retrieval, integrating foundational models with proprietary data. Strategic fit for internal ops.",
  "ai_market_report_link" : "C:/documents/eliza_ai_market_report.pdf"
}
```