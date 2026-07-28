# PRINTING BUSINESS OPERATING SYSTEM
## DATA PACK 3 — LOGIC, AUTOMATIONS & AI INTEGRATION
### Estimating Algorithms · Proactive Alerting · Email Parsing · Intelligent Follow-ups

---

## 3.1 CORE BUSINESS LOGIC (The Estimating Engine)

The system must move beyond flat-rate pricing. A printed item's cost is a dynamic equation based on physical realities. 

### A. The Cost Formula (Offset Printing)
For any given job, the system should calculate cost based on these variables:
1. **Fixed Prepress Costs:** Plates (e.g., 4 plates for CMYK) × Cost per plate.
2. **Make-Ready Time:** Machine setup time cost (fixed per machine/job).
3. **Paper/Substrate Cost:** (Total Sheets Required + Spoilage/Overs Allowance) × Price per sheet (based on GSM and type).
4. **Machine Run Cost:** (Total Impressions / Press Speed per hour) × Hourly Press Rate.
5. **Finishing Cost:** Fixed setup cost + (Per-unit cost × quantity).

*System Behavior:* When you enter "1000 copies, A4, 4-color, 150gsm", the system should automatically retrieve the cost of 4 plates, calculate the required paper based on imposition, and output a **Base Cost**. 

### B. Intelligent Margins
- **Margin Memory:** The system looks at historical jobs for the same client. If you historically win jobs at a 35% margin for "Client A", but only 20% for "Client B", the system suggests a default margin specific to that client's history.
- **Turnaround Penalty:** If a job is marked "Rush (24h)", the system automatically applies a 15-30% markup to the estimated machine time and prepress costs to account for overtime.

---

## 3.2 PROACTIVE ALERTING & NOTIFICATIONS

The system acts as an assistant that never forgets. It runs daily background checks (Cron jobs) against the database to generate alerts.

### Trigger Categories:
1. **The Dormancy Trigger:** 
   - *Logic:* `IF Account.Status == Active AND Account.LastActivityDate < (NOW - 180 days)`
   - *Action:* Generate a Dashboard Alert: "Account [Name] has been silent for 6 months. Review recent jobs and reach out."
2. **The Recurring Job Trigger:**
   - *Logic:* `IF Job.IsRecurring == TRUE AND (NOW == Job.ActualDeliveryDate + 10 months)`
   - *Action:* Generate an Alert: "[Client] usually orders [Job Title] around this time. Prepare a quote."
3. **The Stalled Quote Trigger:**
   - *Logic:* `IF Opportunity.Status == Quoted AND Opportunity.UpdatedAt < (NOW - 3 days)`
   - *Action:* Generate an Alert: "Quote [Title] sent 3 days ago. Time to follow up."
4. **The Missing Artwork Trigger:**
   - *Logic:* `IF Job.Status == Prepress AND Job.ArtworkStatus == Pending AND Job.DeliveryDeadline < (NOW + 5 days)`
   - *Action:* Highlight Job in Red on production dashboard. 

---

## 3.3 EMAIL PARSING & AUTOMATED LOGGING

Frictionless capture means you shouldn't have to copy-paste emails into the CRM.

1. **BCC Logging (The Standard Way):** 
   - The system provides a unique email address (e.g., `dropbox@yourcrm.com`). 
   - When you BCC this address on an email to a client, the system parses the `To:` address, finds the matching `Person` and `Organization` in the database, and creates an `Interaction` of type `Email` with the email body.
2. **Attachment Handling:**
   - If a client emails an RFQ document or artwork file, sending it to the system automatically saves the file to the Organization's cloud storage bucket and links it to the interaction timeline.
3. **Smart RFQ Extraction (AI Assisted):**
   - When a client emails: "Hi, can I get a price for 500 business cards, matte laminated on both sides?"
   - The system uses LLM parsing to detect intent. It extracts: 
     - Product: Business Cards
     - Quantity: 500
     - Finish: Matte Laminated
   - It then drafts an `Opportunity` and sets it to `Scoping` state, requiring only one click from you to confirm.

---

## 3.4 AI INTEGRATION STRATEGY

AI is used to enhance speed and memory, not to make autonomous business decisions.

### 1. The "Memory Retrieval" Agent
- Instead of clicking through tabs to find an old quote, you can type in the global search: *"What did we charge KOC for their annual report last year, and what paper did we use?"*
- The AI translates this to a database query, retrieves the `Job` record, and outputs: *"You charged KOC $4,500 at a 32% margin for 500 copies on 170gsm Matt Art. The job was delivered on March 15, 2025."*

### 2. Intelligent Drafts
- When following up on a dormant account, the system can draft an email based on their last completed job.
- *Draft:* "Hi [Name], it's been a while since we printed your [Last Job Title]. I wanted to check in to see if you have any upcoming print needs for this quarter."

### 3. Competitor & Market Signals
- If you log a `Lost` Opportunity with the reason "Lost to Competitor X due to price", the system aggregates this data.
- Over time, the AI can surface insights: *"Warning: You have lost 4 of the last 5 saddle-stitch jobs to Competitor X. Your prepress cost on short-run saddle-stitch appears uncompetitive."*

---

*End of Data Pack 3.*

Say **"Continue"** when ready for Data Pack 4 — Technology Stack & Implementation Roadmap (Frontend/Backend frameworks, deployment strategy, and phased build plan).
