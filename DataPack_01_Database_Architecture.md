# PRINTING BUSINESS OPERATING SYSTEM
## DATA PACK 1 — DATABASE ARCHITECTURE
### Entities · Tables · Fields · Relationships · Indexes

---

## 1.1 ARCHITECTURE OVERVIEW

The database schema is designed around a relational model that supports the core entities outlined in Data Pack 0. The objective is to ensure **frictionless capture** and **structured retrieval** of all business data. 

The core entity families are:
1. **Organizations** (Clients, Prospects, Suppliers)
2. **People** (Contacts within Organizations)
3. **Opportunities** (Inquiries, Quotes, Tenders)
4. **Jobs** (Production tracking for won opportunities)
5. **Interactions & Knowledge** (The "Memory" of the system: notes, logs, emails)

---

## 1.2 CORE ENTITIES & SCHEMA

### 1. `Organizations`
The central hub of the CRM. Everything cascades from the organization.
* **id** (UUID, Primary Key)
* **name** (String, Required) - e.g., "KOC", "Ministry of Education"
* **type** (Enum) - `Prospect`, `Client`, `Supplier`, `Competitor`, `Partner`
* **status** (Enum) - `Active`, `Dormant`, `Churned`
* **industry** (String) - e.g., "Oil & Gas", "Education"
* **tax_id** (String) - For invoicing and legal
* **billing_address** (Text)
* **shipping_address** (Text)
* **last_activity_date** (Timestamp) - Auto-updates upon any related interaction.
* **created_at** (Timestamp)
* **updated_at** (Timestamp)

### 2. `People`
Individuals tied to organizations. A person's relationship to an org can change over time.
* **id** (UUID, Primary Key)
* **organization_id** (UUID, Foreign Key → Organizations)
* **first_name** (String, Required)
* **last_name** (String, Required)
* **title_role** (String) - e.g., "Procurement Officer", "Marketing Director"
* **email** (String, Unique)
* **phone_work** (String)
* **phone_mobile** (String)
* **is_primary_contact** (Boolean) - Default: false
* **created_at** (Timestamp)
* **updated_at** (Timestamp)

### 3. `Opportunities` (Quotes & Inquiries)
The pre-sales pipeline. Not every opportunity becomes a job.
* **id** (UUID, Primary Key)
* **organization_id** (UUID, Foreign Key → Organizations)
* **person_id** (UUID, Foreign Key → People)
* **title** (String, Required) - e.g., "2026 Annual Report - 500 copies"
* **status** (Enum) - `Lead`, `Scoping`, `Quoted`, `Negotiation`, `Won`, `Lost`
* **quoted_value** (Decimal)
* **estimated_cost** (Decimal) - Drives margin predictions
* **expected_close_date** (Date)
* **loss_reason** (String) - Populated if status is `Lost` (e.g., "Price", "Competitor")
* **is_recurring_candidate** (Boolean) - Flags if this is an annual/monthly need
* **created_at** (Timestamp)
* **updated_at** (Timestamp)

### 4. `Jobs` (Production)
Created only when an Opportunity is marked as "Won". Focuses on delivery and specs.
* **id** (UUID, Primary Key)
* **opportunity_id** (UUID, Foreign Key → Opportunities, Unique)
* **job_number** (String, Unique) - e.g., "JOB-2026-0045"
* **status** (Enum) - `Prepress`, `Proofing`, `Production`, `Finishing`, `Delivery`, `Invoiced`, `Completed`
* **specifications** (JSONB) - Structured data for print specs (GSM, colors, binding, run length) to allow complex queries (e.g., "find all jobs using 300gsm matte art").
* **artwork_status** (Enum) - `Pending`, `Received`, `Approved`
* **delivery_deadline** (Timestamp)
* **actual_delivery_date** (Timestamp)
* **created_at** (Timestamp)
* **updated_at** (Timestamp)

### 5. `Interactions` (Knowledge & Memory)
The institutional memory. Captures emails, calls, notes, and tasks.
* **id** (UUID, Primary Key)
* **organization_id** (UUID, Foreign Key → Organizations)
* **person_id** (UUID, Nullable Foreign Key → People)
* **opportunity_id** (UUID, Nullable Foreign Key → Opportunities)
* **job_id** (UUID, Nullable Foreign Key → Jobs)
* **type** (Enum) - `Note`, `Call`, `Email`, `Meeting`, `System_Alert`
* **content** (Text, Required) - The actual memory/note.
* **follow_up_date** (Timestamp, Nullable) - Sets the proactive alerts.
* **created_by** (UUID, Foreign Key → Users)
* **created_at** (Timestamp)

### 6. `Tenders`
Tracking formal bidding processes, as requested in DP0.
* **id** (UUID, Primary Key)
* **issuing_organization_id** (UUID, Foreign Key → Organizations)
* **title** (String, Required)
* **publication_date** (Date)
* **closing_date** (Timestamp, Required)
* **status** (Enum) - `Identified`, `Evaluating`, `Submitted`, `Won`, `Lost`, `Archived`
* **link** (String) - URL or reference to the tender portal
* **created_at** (Timestamp)

---

## 1.3 RELATIONSHIPS & CASCADES

- **Organization 1:N People**: Deleting an org should soft-delete its people.
- **Organization 1:N Opportunities**: An org can have many quotes over time.
- **Opportunity 1:1 Job**: A won quote becomes exactly one production job.
- **Organization 1:N Interactions**: Interactions belong to an org, and optionally link downward to a Person, Opportunity, or Job for specific context.

---

## 1.4 INDEXING & SEARCH STRATEGY

To achieve the "everything reachable in 3 actions" philosophy and sub-second retrieval times:

1. **Global Search Index (Elasticsearch or Postgres Full-Text Search)**:
   - Must index: `Organizations.name`, `People.first_name`, `People.last_name`, `Opportunities.title`, `Jobs.job_number`.
   - Allows instant search from a single top bar.
2. **Database Indexes (B-Tree)**:
   - `organization_id` on People, Opportunities, Jobs, and Interactions (critical for fast data loading on the organization view).
   - `status` on Opportunities and Jobs (to quickly build Kanban boards and pipelines).
   - `last_activity_date` on Organizations (to quickly query "Dormant Accounts").
3. **JSONB Indexing (GIN)**:
   - Index the `specifications` JSONB column on the `Jobs` table so we can instantly query historical jobs by paper type, finish, or machine used.

---

## 1.5 SYSTEM AUTOMATION TRIGGERS (Database Level)

- **Update `last_activity_date`**: Whenever a new `Interaction`, `Opportunity`, or `Job` is created for an Organization, trigger an update to `Organizations.last_activity_date = NOW()`.
- **Dormancy Flagging**: A daily cron job/background worker queries for `Organizations` where `status = 'Active'` AND `last_activity_date < NOW() - INTERVAL '6 months'`. Changes status to `Dormant` and creates an `Interaction` alert to nudge the user.
- **Recurring Job Reminders**: When an `Opportunity` with `is_recurring_candidate = TRUE` is marked as `Won`, a trigger creates a future `Interaction` task (e.g., 10 months from today) saying "Time to discuss next year's run of [Opportunity Title]".

---

*End of Data Pack 1.*

Say **"Continue"** when ready for Data Pack 2 — Application UI/UX Blueprint (Layouts, Navigation, Dashboards, and Micro-interactions).
