# Software Requirements Specification (SRS)

## Vendor KYC, Verification & Answer Amendment Management System

**Document Version:** 1.0  
**Status:** Draft / Development Ready  
**Application Type:** Web Application  
**Scope:** Frontend + Backend + Database  
**Primary Focus:** Answer Amendments & QC Decision Workflow

---

# 1. Introduction

## 1.1 Purpose

This document defines the functional and non-functional requirements for a Vendor KYC, Verification, Edit Request, Amendment, and QC Re-verification system.

The system allows a vendor/party to:

1. Submit a KYC questionnaire.
2. Undergo QC verification.
3. Become active/live after successful verification.
4. Request changes to previously approved KYC information.
5. Obtain V.O.S approval before editing approved information.
6. Create an Amendment containing the before/after values.
7. Route the Amendment to QC for review.
8. Allow QC Admin to accept, accept and reopen a gate, or refuse the amendment.
9. Mark affected verification evidence as stale when a gate is reopened.
10. Send the party back into the appropriate Verification Queue.
11. Maintain a complete audit trail of important workflow actions.

---

# 2. Objectives

The main objectives are:

- Provide a functional end-to-end KYC lifecycle.
- Prevent direct modification of approved KYC information.
- Introduce controlled edit requests.
- Require V.O.S approval before modifying approved KYC data.
- Automatically create Amendment records from approved changes.
- Allow QC to review before/after values.
- Track which verification gate is affected.
- Track documents and verification items invalidated by a change.
- Support gate reopening and re-verification.
- Prevent duplicate or conflicting amendment decisions.
- Maintain decision history and auditability.

---

# 3. Scope

## 3.1 In Scope

### Vendor / Party

- KYC questionnaire submission.
- View submitted KYC information.
- View current status.
- Submit Edit Request after KYC approval.
- Provide new value.
- Provide reason for change.
- Upload attachment to Edit Request.
- Apply approved edit.
- View Amendment status.

### QC

- View submitted questionnaires.
- Approve or reject initial KYC.
- View pending amendments.
- Filter amendments.
- View amendment details.
- Review before/after values.
- Review reason.
- Review target gate.
- Review listing impact.
- Review invalidated items.
- Make Amendment decisions.

### V.O.S Admin

- View pending Edit Requests.
- Review requested changes.
- Review reason and attachments.
- Approve Edit Request.
- Reject Edit Request.

### Amendment Management

- Automatically create Amendment records.
- Store before/after snapshots.
- Store target gate.
- Store listing impact.
- Store invalidated verification items.
- Store decision.
- Store decision note.
- Store decision user and timestamp.
- Trigger gate reopening.

### Verification Queue

- Receive gate reopen signal.
- Place party into appropriate gate.
- Mark affected evidence stale.
- Allow re-verification.

---

# 4. Out of Scope

The following are not required for the initial implementation:

- Complex multi-step questionnaire wizard.
- Advanced document OCR.
- External KYC provider integration.
- Real banking integrations.
- Production notification infrastructure.
- Complex workflow engine.
- Advanced role/permission administration.
- Real-time collaboration.
- Advanced analytics.
- Complex listing management.
- Production-grade identity verification.

Mock interfaces may be used where an external system is required.

---

# Technologies :
Front End : React.js, Tailwind
Back End : Express.js
Storage : Localstorage

# 5. User Roles

| Role | Responsibility |
|---|---|
| Party / Vendor | Submit KYC and request changes |
| QC Admin | Verify KYC and review Amendments |
| V.O.S Admin | Approve/reject Edit Requests |
| System | Create Amendments, maintain states, invalidate items, trigger gate reopening |

---

# 6. High-Level Business Flow

```text
Party
  |
  | Submit KYC
  v
KYC Questionnaire
  |
  v
QC Verification
  |
  +---- Reject ----> KYC Rejected
  |
  +---- Approve
          |
          v
       ACTIVE / LIVE
          |
          | Request KYC Change
          v
      Edit Request
          |
          v
      V.O.S Review
          |
          +---- Reject ----> Request Rejected
          |
          +---- Approve
                  |
                  v
          Edit Approved KYC
                  |
                  v
             Amendment Created
                  |
                  v
          QC Answer Amendments
                  |
        +---------+----------+
        |         |          |
        v         v          v
 Accept &    Accept -      Refuse
 Reopen      No Reverify
        |         |          |
        v         v          v
 Reopen Gate   Complete    Original
        |                   Answer Stands
        v
Verification Queue
        |
        v
Affected Evidence = STALE
        |
        v
Re-verification
        |
        v
Gate Approved
```

---

# 7. KYC Gate Model

The system shall support verification gates.

For the initial implementation:

| Gate | Name | Example |
|---|---|---|
| Gate 1 | REGISTRATION | Legal name, business activity |
| Gate 2 | LICENSING | Licences and regulatory information |
| Gate 3 | BANKING | Bank account / bank proof |
| Gate 4 | BUSINESS | Business verification |
| Gate 5 | LISTING | Listing-related verification |

The system must allow additional gates to be added later.

---

# 8. Functional Requirements

## FR-001 — Party Registration

The system shall allow a party/vendor to create a KYC submission.

Sample fields:

- Legal Name
- Business Activity
- Markets Served
- Registration Number
- Country
- Business Address

---

## FR-002 — KYC Submission

The party shall be able to submit the questionnaire.

After submission:

```text
DRAFT → SUBMITTED → QC_REVIEW
```

The party shall not be able to modify submitted answers while they are under verification.

---

# 9. QC Initial Verification

## FR-003 — QC Verification Queue

QC Admin shall be able to view submitted parties.

The queue shall display:

- Party Name
- Submission ID
- Submission Date
- Current Status
- Current Gate
- Assigned QC, if applicable

---

## FR-004 — Approve KYC

QC Admin shall be able to approve the questionnaire.

On approval:

```text
QC_REVIEW → ACTIVE
```

The party becomes live/active.

---

## FR-005 — Reject KYC

QC Admin shall be able to reject the questionnaire.

The rejection shall store:

- Rejected By
- Rejected At
- Rejection Reason

---

# 10. Edit Request

## FR-006 — Create Edit Request

After KYC approval, the party shall not directly modify approved answers.

The party must create an Edit Request.

Example:

```text
Field:
Business Activity

Current Value:
Wholesale Distribution

Requested Value:
Wholesale & Retail Distribution

Reason:
The company has expanded its business operations.
```

---

## FR-007 — Edit Request Attachment

The party shall optionally attach supporting documents.

Examples:

- Registration certificate
- Licence
- Business document
- Bank document

The system shall store:

- File Name
- File Type
- File Size
- Storage Reference
- Uploaded By
- Uploaded At

---

# 11. V.O.S Approval

## FR-008 — V.O.S Queue

V.O.S Admin shall see pending Edit Requests.

The queue shall display:

- Party
- Field
- Current Value
- Requested Value
- Reason
- Attachment indicator
- Created Date
- Status

---

## FR-009 — Approve Edit Request

When V.O.S approves an Edit Request:

```text
EDIT_REQUEST_PENDING
        ↓
EDIT_REQUEST_APPROVED
```

The system shall allow the requested KYC value to be applied.

---

## FR-010 — Reject Edit Request

When V.O.S rejects an Edit Request:

```text
EDIT_REQUEST_PENDING
        ↓
EDIT_REQUEST_REJECTED
```

The original KYC answer remains unchanged.

The rejection reason must be recorded.

---

# 12. Amendment Creation

## FR-011 — Automatic Amendment Creation

When an approved Edit Request is applied, the system shall automatically create an Amendment.

The Amendment is the central workflow object.

The Amendment shall contain:

- Amendment ID
- Party ID
- Edit Request ID
- Questionnaire ID
- Questionnaire Version
- Question ID
- Question Text
- Before Value
- After Value
- Reason
- Target Gate
- Listing Impact
- Invalidated Items
- Status
- Created By
- Created At
- Decision
- Decision Note
- Decided By
- Decided At

---

# 13. Amendment State Model

The Amendment shall support the following states:

```text
PENDING
   |
   +---- ACCEPTED_REOPENED
   |
   +---- ACCEPTED_NO_REVERIFICATION
   |
   +---- REFUSED
```

Once a decision is recorded, the Amendment becomes immutable from a decision perspective.

A second QC decision must not be allowed.

---

# 14. Target Gate

Each Amendment must identify which verification gate is affected.

Example:

```text
Question:
Legal Name

Before:
ABC Trading Pvt Ltd

After:
ABC Trading Private Limited

Target Gate:
REGISTRATION

Gate Number:
1
```

The target gate determines where the party must return if the Amendment is accepted and reopened.

---

# 15. Listing Impact

Each Amendment shall identify whether the change affects the party's listing.

Possible values:

```text
NO_IMPACT
LOW
MEDIUM
HIGH
```

Alternatively, the system may use a Boolean:

```text
listingImpact: true / false
```

The selected approach should remain consistent throughout the application.

---

# 16. Invalidated Items

The system shall maintain a list of verification items affected by an Amendment.

Example:

```text
Amendment
    |
    +-- Bank Proof
    +-- Business Licence
    +-- Registration Certificate
```

Each item shall contain:

- Item ID
- Item Type
- Item Name
- Previous Verification Status
- Current Status
- Invalidated Reason
- Invalidated At

Example:

```text
Bank Proof
Status: VERIFIED
        ↓
Status: STALE
```

---

# 17. Answer Amendments Screen

This is the primary QC interface.

## 17.1 Amendment List

The list shall display:

| Field | Description |
|---|---|
| Amendment ID | Unique amendment identifier |
| Party | Party name |
| Question | Changed question |
| Before | Previous answer |
| After | New answer |
| Gate | Target verification gate |
| Listing Impact | Listing impact |
| Status | Amendment state |
| Created At | Creation timestamp |

---

# 18. Amendment Filters

The screen shall support:

### Gate

```text
All
Registration
Licensing
Banking
Business
Listing
```

### Listing Impact

```text
All
Impact
No Impact
```

### Questionnaire Version

Example:

```text
Version 1
Version 2
Version 3
```

### Status

Optional but recommended:

```text
Pending
Accepted & Reopened
Accepted - No Reverification
Refused
```

---

# 19. Amendment Detail Panel

When QC selects an Amendment, the detail panel shall display:

## Party Information

- Party Name
- Party ID
- Questionnaire Version

## Question

```text
Legal Name
```

## Before

```text
ABC Trading Pvt Ltd
```

## After

```text
ABC Trading Private Limited
```

## Reason

```text
Legal entity name has been updated.
```

## Target Gate

```text
REGISTRATION — Gate 1
```

## Listing Impact

```text
YES
```

## What This Invalidates

```text
Registration Certificate
Business Registration
Existing Registration Verification
```

---

# 20. QC Decision UI

The QC Admin shall have three decision options.

### Option 1 — Accept & Reopen Gate

```text
Accept & Reopen REGISTRATION
```

Effect:

1. Persist decision.
2. Mark affected items as stale.
3. Create gate reopen signal.
4. Send party to Verification Queue.
5. Require re-verification.

---

### Option 2 — Accept — No Reverification Needed

Effect:

1. Persist decision.
2. Do not invalidate items.
3. Do not reopen gate.
4. Amendment becomes completed.

---

### Option 3 — Refuse Amendment

Effect:

1. Persist decision.
2. Original answer remains authoritative.
3. No gate is reopened.
4. No verification item is invalidated.
5. Party receives refusal reason.

---

# 21. Decision Note

For all decisions, QC should be able to enter a note.

Example:

```text
Decision Note:
The amendment only corrects the legal entity suffix.
No verification evidence is affected.
```

For refusal:

```text
Decision Note:
Submitted supporting document does not establish the requested change.
```

The note shall be persisted with the decision.

---

# 22. Decision Rules

## Rule 1 — One Decision Only

An Amendment can only be decided once.

If an Amendment is already decided:

```text
HTTP 409 Conflict
```

Example response:

```json
{
  "code": "AMENDMENT_ALREADY_DECIDED",
  "message": "This amendment has already been decided."
}
```

---

## Rule 2 — Pending Only

Decision APIs shall only operate on:

```text
PENDING
```

Amendments in any other state cannot be decided again.

---

## Rule 3 — Gate Required for Reopen

An `ACCEPTED_REOPENED` decision must have a valid target gate.

If missing:

```text
HTTP 422 Unprocessable Entity
```

---

## Rule 4 — Invalidated Items Required

If an Amendment specifies invalidated items, the system must mark them stale when the gate is reopened.

---

## Rule 5 — No Invalidation for No-Reverification

For:

```text
ACCEPTED_NO_REVERIFICATION
```

no verification item may be changed to stale.

---

## Rule 6 — Refused Amendment

For:

```text
REFUSED
```

the original answer remains effective.

No verification gate shall be reopened.

---

# 23. Verification Queue Integration

The Amendment system shall communicate with the Verification Queue.

A mock interface is acceptable for the initial implementation.

## Reopen Contract

Example:

```http
POST /api/verification/reopen
```

Request:

```json
{
  "partyId": "party_123",
  "amendmentId": "amd_456",
  "gate": "REGISTRATION",
  "gateNumber": 1,
  "reason": "KYC answer amendment accepted",
  "invalidatedItemIds": [
    "item_101",
    "item_102"
  ]
}
```

Response:

```json
{
  "success": true,
  "queueEntryId": "queue_789",
  "status": "REOPENED"
}
```

---

# 24. Amendment API

## GET /api/amendments

Returns Amendment list.

Supported filters:

```text
gate
listingImpact
questionnaireVersion
status
partyId
```

Example:

```http
GET /api/amendments?gate=REGISTRATION&status=PENDING
```

---

## GET /api/amendments/:id

Returns complete Amendment details.

Example:

```json
{
  "id": "amd_456",
  "partyId": "party_123",
  "question": {
    "id": "q_001",
    "text": "Legal Name"
  },
  "before": "ABC Trading Pvt Ltd",
  "after": "ABC Trading Private Limited",
  "reason": "Legal entity name updated",
  "targetGate": {
    "code": "REGISTRATION",
    "number": 1
  },
  "listingImpact": true,
  "invalidatedItems": [],
  "status": "PENDING"
}
```

---

# 25. Amendment Decision API

## POST /api/amendments/:id/decision

Request:

```json
{
  "decision": "ACCEPT_REOPEN",
  "note": "Registration information requires re-verification."
}
```

Possible decisions:

```text
ACCEPT_REOPEN
ACCEPT_NO_REVERIFICATION
REFUSE
```

---

# 26. Decision Response

Example:

```json
{
  "amendmentId": "amd_456",
  "status": "ACCEPTED_REOPENED",
  "decision": "ACCEPT_REOPEN",
  "decidedBy": "user_001",
  "decidedAt": "2026-09-27T10:00:00Z",
  "reopenSignal": {
    "gate": "REGISTRATION",
    "queueEntryId": "queue_789"
  }
}
```

---

# 27. Suggested REST API Structure

```text
/api
│
├── /parties
│   ├── POST /
│   ├── GET /:id
│   └── GET /:id/questionnaire
│
├── /questionnaires
│   ├── POST /
│   ├── GET /:id
│   └── POST /:id/submit
│
├── /verification
│   ├── GET /queue
│   ├── POST /:id/approve
│   ├── POST /:id/reject
│   └── POST /reopen
│
├── /edit-requests
│   ├── POST /
│   ├── GET /
│   ├── GET /:id
│   ├── POST /:id/approve
│   └── POST /:id/reject
│
└── /amendments
    ├── GET /
    ├── GET /:id
    └── POST /:id/decision
```

---

# 28. Data Model

## 28.1 Party

```text
Party
-----
id
legal_name
status
created_at
updated_at
```

Possible statuses:

```text
DRAFT
PENDING_KYC
QC_REVIEW
ACTIVE
SUSPENDED
```

---

# 29. Questionnaire

```text
Questionnaire
-------------
id
party_id
version
status
submitted_at
approved_at
created_at
updated_at
```

---

# 30. Questionnaire Answer

```text
QuestionnaireAnswer
-------------------
id
questionnaire_id
question_id
answer
created_at
updated_at
```

---

# 31. Edit Request

```text
EditRequest
-----------
id
party_id
questionnaire_id
question_id
current_value
requested_value
reason
status
created_by
approved_by
approved_at
rejected_by
rejected_at
rejection_reason
created_at
updated_at
```

Statuses:

```text
PENDING
APPROVED
REJECTED
APPLIED
```

---

# 32. Amendment

```text
Amendment
---------
id
party_id
questionnaire_id
edit_request_id

question_id
question_text

before_value
after_value

reason

target_gate
target_gate_number

listing_impact

status

decision
decision_note
decided_by
decided_at

created_at
updated_at
```

---

# 33. Amendment Invalidated Item

```text
AmendmentInvalidatedItem
------------------------
id
amendment_id
verification_item_id
item_type
item_name
previous_status
status
invalidated_reason
invalidated_at
```

---

# 34. Verification Item

```text
VerificationItem
----------------
id
party_id
gate
type
name
status
verified_at
verified_by
stale_at
```

Possible status:

```text
PENDING
VERIFIED
REJECTED
STALE
```

---

# 35. Reopen Signal

```text
GateReopenSignal
----------------
id
amendment_id
party_id
gate
gate_number
status
queue_entry_id
created_at
processed_at
```

Possible statuses:

```text
PENDING
SENT
PROCESSED
FAILED
```

---

# 36. Audit Log

All important actions should be recorded.

```text
AuditLog
--------
id
entity_type
entity_id
action
actor_id
old_value
new_value
metadata
created_at
```

Examples:

```text
KYC_SUBMITTED
KYC_APPROVED
KYC_REJECTED
EDIT_REQUEST_CREATED
EDIT_REQUEST_APPROVED
EDIT_REQUEST_REJECTED
AMENDMENT_CREATED
AMENDMENT_ACCEPTED_REOPENED
AMENDMENT_ACCEPTED_NO_REVERIFICATION
AMENDMENT_REFUSED
VERIFICATION_ITEM_STALE
GATE_REOPENED
```

---

# 37. Database Relationships

```text
Party
 |
 +---- Questionnaire
 |        |
 |        +---- Questionnaire Answers
 |
 +---- Edit Requests
 |        |
 |        +---- Attachments
 |
 +---- Amendments
          |
          +---- Invalidated Items
          |
          +---- Decision
          |
          +---- Reopen Signal
                    |
                    v
              Verification Queue
```

---

# 38. Amendment Lifecycle

```text
                 ┌────────────────────┐
                 │      PENDING       │
                 └─────────┬──────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
     ACCEPT_REOPEN    ACCEPT_NO_      REFUSE
                      REVERIFICATION
              │            │            │
              ▼            ▼            ▼
       ACCEPTED_       ACCEPTED_      REFUSED
       REOPENED        NO_REVERIFY
              │
              ▼
       Invalidate Items
              │
              ▼
        Reopen Gate
              │
              ▼
      Verification Queue
```

---

# 39. Frontend Requirements

The frontend can be implemented as a simple functional application.

Recommended pages:

```text
/
├── Dashboard
│
├── /questionnaire
│   └── Submit KYC
│
├── /verification
│   └── Verification Queue
│
├── /edit-requests
│   └── Party Edit Requests
│
├── /vos
│   └── V.O.S Approval Queue
│
└── /amendments
    ├── Amendment List
    └── Amendment Detail
```

---

# 40. Questionnaire UI

Basic form:

```text
Legal Name
[________________________]

Business Activity
[________________________]

Markets Served
[________________________]

Registration Number
[________________________]

[ Submit Questionnaire ]
```

After submission:

```text
Status: Pending QC Verification
```

---

# 41. Verification Queue UI

Example:

```text
--------------------------------------------------
Verification Queue
--------------------------------------------------

Party              Gate          Status       Action

ABC Trading        Registration  Pending      Review
XYZ Services       Registration  Pending      Review

                         [Approve] [Reject]
--------------------------------------------------
```

---

# 42. Edit Request UI

After a party becomes active:

```text
Your KYC Information

Legal Name
ABC Trading Pvt Ltd

[Request Edit]
```

Edit modal:

```text
Field:
Legal Name

Current Value:
ABC Trading Pvt Ltd

New Value:
ABC Trading Private Limited

Reason:
[____________________________]

Attachment:
[Choose File]

[Submit Edit Request]
```

---

# 43. V.O.S UI

```text
Edit Request

Party:
ABC Trading

Field:
Legal Name

Current:
ABC Trading Pvt Ltd

Requested:
ABC Trading Private Limited

Reason:
Legal entity name updated.

Attachment:
registration.pdf

[Approve]     [Reject]
```

---

# 44. Answer Amendments Screen

This is the main evaluation screen.

Recommended layout:

```text
┌─────────────────────────────────────────────────────┐
│ Answer Amendments                                   │
├─────────────────────────────────────────────────────┤
│ Filters                                             │
│                                                     │
│ Gate: [All ▼]  Listing: [All ▼]  Version: [All ▼] │
│                                                     │
├──────────────────────┬──────────────────────────────┤
│ Amendment List       │ Amendment Details            │
│                      │                              │
│ AMD-001              │ Party: ABC Trading           │
│ Legal Name           │                              │
│ Registration         │ Question: Legal Name        │
│ Pending              │                              │
│                      │ BEFORE                       │
│ AMD-002              │ ABC Trading Pvt Ltd         │
│ Business Activity    │                              │
│ Banking              │ AFTER                       │
│ Pending              │ ABC Trading Private Ltd     │
│                      │                              │
│                      │ Reason                       │
│                      │ Legal entity changed         │
│                      │                              │
│                      │ Target Gate                  │
│                      │ REGISTRATION — Gate 1       │
│                      │                              │
│                      │ Invalidates                  │
│                      │ • Registration Certificate   │
│                      │ • Business Verification     │
│                      │                              │
│                      │ Decision Note               │
│                      │ [________________________]  │
│                      │                              │
│                      │ [Accept & Reopen]           │
│                      │ [Accept - No Reverification]│
│                      │ [Refuse]                    │
└──────────────────────┴──────────────────────────────┘
```

---

# 45. Frontend State Handling

The frontend shall handle:

### Loading

```text
Loading amendments...
```

### Empty

```text
No amendments found.
```

### Error

```text
Unable to load amendments.
[Retry]
```

### Already Decided

```text
This amendment has already been decided.
Refresh the page to view the latest status.
```

### Successful Decision

```text
Amendment accepted.
Registration gate has been reopened.
```

---

# 46. Backend Architecture

A simple layered architecture is recommended:

```text
Frontend
   |
   v
REST API
   |
   v
Controller
   |
   v
Service
   |
   v
Repository / ORM
   |
   v
Database
```

Example:

```text
amendment.controller
        |
        v
amendment.service
        |
        +---- amendment.repository
        |
        +---- verification.service
        |
        +---- audit.service
```

---

# 47. Amendment Decision Service

The decision service should perform the operation transactionally.

Pseudo-flow:

```text
begin transaction

1. Load amendment
2. Verify status = PENDING
3. Validate decision
4. Validate target gate
5. Persist decision

if ACCEPT_REOPEN:

    6. Mark invalidated items STALE
    7. Create reopen signal
    8. Create verification queue entry

if ACCEPT_NO_REVERIFICATION:

    6. Do not invalidate
    7. Do not reopen

if REFUSE:

    6. Do not invalidate
    7. Do not reopen

9. Write audit log

commit transaction
```

If any required operation fails:

```text
rollback transaction
```

---

# 48. Transaction Requirements

The following operations should be atomic for `ACCEPT_REOPEN`:

```text
Decision persistence
+
Invalidation
+
Reopen signal
+
Verification queue entry
```

The system must avoid a state where:

```text
Amendment = ACCEPTED_REOPENED
```

but:

```text
Gate was never reopened
```

unless the architecture explicitly supports an asynchronous retryable signal.

---

# 49. Concurrency Handling

The backend shall protect against two QC Admins deciding the same Amendment simultaneously.

Recommended approach:

```text
UPDATE amendments
SET status = ...
WHERE id = ?
AND status = 'PENDING'
```

If affected rows = 0:

```text
AMENDMENT_ALREADY_DECIDED
```

The API shall return:

```text
409 Conflict
```

---

# 50. Error Handling

Recommended API error structure:

```json
{
  "success": false,
  "error": {
    "code": "AMENDMENT_ALREADY_DECIDED",
    "message": "The amendment has already been decided."
  }
}
```

Common errors:

| Code | HTTP | Meaning |
|---|---:|---|
| AMENDMENT_NOT_FOUND | 404 | Amendment does not exist |
| AMENDMENT_ALREADY_DECIDED | 409 | Decision already exists |
| INVALID_DECISION | 422 | Unsupported decision |
| TARGET_GATE_REQUIRED | 422 | Reopen requires gate |
| EDIT_REQUEST_NOT_APPROVED | 409 | Amendment cannot be created |
| PARTY_NOT_FOUND | 404 | Party does not exist |
| QUESTION_NOT_FOUND | 404 | Question does not exist |
| VERIFICATION_REOPEN_FAILED | 500 | Reopen operation failed |

---

# 51. Security Requirements

The system shall enforce role-based access.

### Party

Can:

- Submit KYC.
- View own KYC.
- Create Edit Requests.
- View own Edit Requests.
- View own Amendment status.

Cannot:

- Approve own Edit Request.
- Decide Amendments.
- Modify approved answers directly.

### V.O.S Admin

Can:

- View Edit Requests.
- Approve Edit Requests.
- Reject Edit Requests.

Cannot:

- Make QC Amendment decisions unless separately authorized.

### QC Admin

Can:

- Verify KYC.
- Approve/reject KYC.
- View Amendments.
- Decide Amendments.

Cannot:

- Approve their own V.O.S request unless role permissions explicitly allow it.

---

# 52. Audit Requirements

The system must preserve:

```text
Who
What
When
Before
After
Reason
Decision
```

Example:

```text
User:
QC Admin - John

Action:
AMENDMENT_ACCEPTED_REOPENED

Amendment:
AMD-001

Gate:
REGISTRATION

Timestamp:
2026-09-27 10:15 UTC
```

Audit records should not be silently overwritten.

---

# 53. Questionnaire Versioning

Questionnaires should be versioned.

Example:

```text
Questionnaire Version 1
Questionnaire Version 2
```

An Amendment must reference the questionnaire version against which the answer was originally captured.

This allows QC to understand the context of the answer being amended.

---

# 54. Before/After Snapshot Requirement

The Amendment must preserve the values at the time of Amendment creation.

For example:

```text
Original KYC Answer:
ABC Trading Pvt Ltd

Amendment:
Before = ABC Trading Pvt Ltd
After  = ABC Trading Private Limited
```

If the original questionnaire changes later, the Amendment's `before_value` must remain unchanged.

---

# 55. Listing Impact

The system shall preserve whether an Amendment affects the party's listing.

Example:

```json
{
  "listingImpact": true
}
```

The value must be visible to QC before making a decision.

---

# 56. What This Invalidates

The system should expose a human-readable list.

Example:

```text
What this invalidates:

✓ Registration Certificate
✓ Business Registration
✓ Registration Verification
```

This allows QC to understand the downstream consequences before selecting **Accept & Reopen**.

---

# 57. Notifications

For the basic implementation, notifications may be represented by status updates.

Recommended future notifications:

### Party

- KYC approved.
- KYC rejected.
- Edit Request approved.
- Edit Request rejected.
- Amendment accepted.
- Amendment refused.
- Gate reopened.

### QC

- New KYC submission.
- New Amendment.
- Gate reopened.

### V.O.S

- New Edit Request.

---

# 58. Acceptance Criteria

## AC-001 — KYC Submission

Given a party completes the questionnaire,

when they submit it,

then the questionnaire must be stored and become available to QC.

---

## AC-002 — KYC Approval

Given a submitted questionnaire,

when QC approves it,

then the party must become `ACTIVE`.

---

## AC-003 — Edit Request

Given an active party,

when they request a KYC change,

then an Edit Request must be created with:

- Original value
- Requested value
- Reason
- Optional attachment

---

## AC-004 — V.O.S Approval

Given a pending Edit Request,

when V.O.S approves it,

then the system must permit the change to be applied.

---

## AC-005 — Amendment Creation

Given an approved Edit Request,

when the new answer is applied,

then an Amendment must automatically be created.

---

## AC-006 — Amendment Detail

Given an Amendment,

QC must be able to see:

- Question
- Before
- After
- Reason
- Target Gate
- Listing Impact
- Invalidated Items

---

## AC-007 — Accept & Reopen

Given a pending Amendment,

when QC selects **Accept & Reopen**,

then:

1. Decision is persisted.
2. Decision user is persisted.
3. Decision timestamp is persisted.
4. Invalidated items become `STALE`.
5. Reopen signal is created.
6. Party enters the Verification Queue.
7. Target gate is reopened.

---

## AC-008 — Accept Without Reverification

Given a pending Amendment,

when QC selects **Accept — No Reverification Needed**,

then:

1. Decision is persisted.
2. No verification item becomes stale.
3. No gate is reopened.
4. Amendment becomes completed.

---

## AC-009 — Refuse

Given a pending Amendment,

when QC selects **Refuse**,

then:

1. Decision is persisted.
2. Original answer remains effective.
3. No verification item becomes stale.
4. No gate is reopened.
5. Refusal note is stored.

---

## AC-010 — Duplicate Decision

Given an Amendment has already been decided,

when another QC Admin attempts to decide it,

then:

```text
HTTP 409
AMENDMENT_ALREADY_DECIDED
```

must be returned.

No data should be changed.

---

# 59. Non-Functional Requirements

## NFR-001 — Performance

Normal API operations should respond within approximately:

```text
< 500 ms
```

under normal demo/development load.

---

## NFR-002 — Reliability

Decision operations must be transactional.

Partial Amendment decisions must not be allowed.

---

## NFR-003 — Maintainability

Backend logic should be separated into:

```text
Controller
Service
Repository
Model
Validation
```

---

## NFR-004 — Scalability

The Amendment model should support multiple:

- Questions
- Gates
- Verification items
- Questionnaire versions
- Parties

without schema redesign.

---

## NFR-005 — Auditability

All workflow-changing actions must be auditable.

---

## NFR-006 — Security

Role-based authorization must be applied at API level, not only in the frontend.

---

# 60. Recommended Technology Structure

### Frontend

```text
React
React Router
Material UI
Axios / Fetch
```

### Backend

```text
Node.js
Express.js
```

### Database

```text
PostgreSQL
```

### ORM

```text
Prisma
```

Alternative ORM:

```text
Sequelize
```

---

# 61. Suggested Project Structure

```text
project/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── questionnaire/
│   │   │   ├── verification/
│   │   │   ├── editRequests/
│   │   │   ├── vos/
│   │   │   └── amendments/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── routes/
│   │   └── utils/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── validators/
│   │   ├── integrations/
│   │   └── utils/
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
└── README.md
```

---

# 62. Development Priority

## Phase 1 — Core Data

Implement:

```text
Party
Questionnaire
QuestionnaireAnswer
EditRequest
Amendment
VerificationItem
GateReopenSignal
AuditLog
```

---

## Phase 2 — KYC Flow

Implement:

```text
Questionnaire
      ↓
QC Verification
      ↓
ACTIVE
```

---

## Phase 3 — Edit Flow

Implement:

```text
ACTIVE
 ↓
Edit Request
 ↓
V.O.S Approval
 ↓
Apply Edit
```

---

## Phase 4 — Amendment

Implement:

```text
Apply Edit
 ↓
Create Amendment
 ↓
PENDING
```

---

## Phase 5 — QC Amendment Screen

Implement:

```text
List
+
Filters
+
Detail Panel
+
Decision UI
```

This phase should receive the highest UI attention because it is the main evaluation area.

---

## Phase 6 — Decision Logic

Implement:

```text
Accept & Reopen
Accept — No Reverification
Refuse
```

---

## Phase 7 — Verification Queue

Implement:

```text
Reopen Signal
 ↓
Queue Entry
 ↓
STALE Evidence
 ↓
Reverification
```

---

## Phase 8 — Error Handling & Audit

Implement:

- Duplicate decision prevention.
- Transaction handling.
- Audit logs.
- API error responses.
- Role authorization.

---

# 63. Demo Data

The application should contain seed data for demonstration.

Example party:

```text
ABC Trading Pvt Ltd
```

Questionnaire:

```text
Legal Name:
ABC Trading Pvt Ltd

Business Activity:
Wholesale Distribution

Markets Served:
India, UAE
```

Example Amendment:

```text
Question:
Legal Name

Before:
ABC Trading Pvt Ltd

After:
ABC Trading Private Limited

Reason:
Legal entity name has been updated.

Target Gate:
REGISTRATION — Gate 1

Listing Impact:
Yes

Invalidates:
Registration Certificate
Business Registration
```

Status:

```text
PENDING
```

This allows the Answer Amendments screen to be demonstrated immediately without completing the entire workflow manually.

---

# 64. Definition of Done

The project will be considered functionally complete when the following end-to-end scenario works:

```text
1. Party submits KYC
        ↓
2. QC approves KYC
        ↓
3. Party becomes ACTIVE
        ↓
4. Party creates Edit Request
        ↓
5. V.O.S approves Edit Request
        ↓
6. New KYC answer is applied
        ↓
7. Amendment is automatically created
        ↓
8. Amendment appears in QC screen
        ↓
9. QC opens Amendment
        ↓
10. QC sees before/after
        ↓
11. QC sees target gate
        ↓
12. QC sees listing impact
        ↓
13. QC sees invalidated items
        ↓
14. QC selects Accept & Reopen
        ↓
15. Decision is persisted
        ↓
16. Evidence becomes STALE
        ↓
17. Gate reopen signal is created
        ↓
18. Party appears in Verification Queue
```

The following alternative flows must also work:

```text
Amendment → Accept — No Reverification
```

and:

```text
Amendment → Refuse
```

Duplicate decisions must be rejected.

---

# 65. Key Business Rule Summary

| Rule | Requirement |
|---|---|
| Approved KYC cannot be directly edited | Mandatory |
| Edit Request required | Mandatory |
| V.O.S approval required | Mandatory |
| Amendment automatically created after approved edit | Mandatory |
| Amendment stores before/after | Mandatory |
| Amendment identifies target gate | Mandatory |
| Amendment identifies listing impact | Mandatory |
| QC can accept & reopen | Mandatory |
| QC can accept without reverification | Mandatory |
| QC can refuse | Mandatory |
| Reopened gate invalidates affected evidence | Mandatory |
| Reopen signal must be generated | Mandatory |
| Duplicate decisions prohibited | Mandatory |
| Decision audit required | Mandatory |
| Original answer retained in Amendment history | Mandatory |

---

# 66. Final System Architecture

```text
                         ┌──────────────────┐
                         │      PARTY       │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ KYC QUESTIONNAIRE│
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  QC VERIFICATION │
                         └────────┬─────────┘
                                  │
                            APPROVED
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   ACTIVE PARTY   │
                         └────────┬─────────┘
                                  │
                           Change Required
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   EDIT REQUEST   │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  V.O.S APPROVAL  │
                         └────────┬─────────┘
                                  │
                               APPROVED
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ APPLY KYC CHANGE │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │    AMENDMENT     │
                         │                  │
                         │ Before / After   │
                         │ Target Gate      │
                         │ Listing Impact   │
                         │ Invalidations    │
                         └────────┬─────────┘
                                  │
                                  ▼
                     ┌────────────────────────┐
                     │   QC ANSWER AMENDMENTS │
                     └────────────┬───────────┘
                                  │
             ┌────────────────────┼────────────────────┐
             │                    │                    │
             ▼                    ▼                    ▼
      ACCEPT & REOPEN      ACCEPT — NO REVERIFY      REFUSE
             │                    │                    │
             ▼                    ▼                    ▼
      Mark Items STALE         Complete           Original Stands
             │
             ▼
      Reopen Gate Signal
             │
             ▼
      Verification Queue
             │
             ▼
        Re-verification
             │
             ▼
        Gate Completed
```

---

# 67. Primary Evaluation Focus

Although the entire workflow must be functional, the **Answer Amendments module** is the primary feature under evaluation.

Therefore, implementation priority within the frontend should be:

```text
1. Amendment List
2. Amendment Filters
3. Amendment Detail
4. Before / After comparison
5. Target Gate
6. Listing Impact
7. Invalidated Items
8. Decision UI
9. Decision persistence
10. Reopen/invalidation behavior
11. Error handling
12. Audit trail
```

The surrounding Questionnaire, QC Verification, Edit Request, and V.O.S modules should remain intentionally simple while being sufficiently functional to generate real Amendment records.
