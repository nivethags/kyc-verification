# KYC Amendment & Verification Management System

A full-stack web application for managing **KYC onboarding, verification, post-KYC edit requests, amendments, QC review, and gate-based re-verification**.

The system ensures that once a party's KYC information is verified, any subsequent changes follow a controlled approval and amendment workflow.

---

## 📌 Project Overview

The application manages the complete lifecycle of a party's KYC information:

```text
Party Registration
       ↓
KYC Questionnaire
       ↓
QC Verification
       ↓
Approved → Party Goes Live
       ↓
Post-KYC Edit Request
       ↓
V.O.S Admin Approval
       ↓
KYC Edit Enabled
       ↓
Amendment Created
       ↓
QC Amendment Review
       ↓
┌───────────────────────────────┐
│ Accept & Reopen Gate           │
│ Accept – No Reverification     │
│ Refuse Amendment               │
└───────────────────────────────┘
```

The system maintains the **before and after values** of every approved amendment and tracks which verification items become stale when a gate is reopened.

---

## ✨ Key Features

### 1. KYC Questionnaire

* Party can submit KYC information.
* Sample questionnaire fields include:

  * Legal Name
  * Business Activity
  * Markets Served
  * Registration Information
  * Contact Information
* Questionnaire submission enters the QC verification queue.

### 2. QC Verification

* QC Admin can review submitted KYC information.
* QC can:

  * Approve KYC
  * Reject KYC
* Once approved, the party becomes **Live/Active**.

### 3. Post-KYC Edit Request

After KYC approval, the party cannot directly modify verified information.

Instead, the party can:

* Select the question they want to change.
* Enter the proposed new answer.
* Provide a reason.
* Upload an optional attachment.
* Submit an Edit Request.

### 4. V.O.S Admin Approval

V.O.S Admin reviews the Edit Request.

Possible actions:

* Approve Edit Request
* Reject Edit Request

If approved, the party is allowed to edit the requested KYC answer.

### 5. Amendment Creation

When the approved KYC edit is applied, the system automatically creates an Amendment containing:

* Original answer
* New answer
* Reason for change
* Target verification gate
* Listing impact
* Invalidated items
* Questionnaire version
* Amendment status

### 6. Answer Amendments

QC Admin can review all pending amendments from the **Answer Amendments** screen.

The screen provides:

* Gate filter
* Listing Impact filter
* Questionnaire Version filter
* Question
* Before value
* After value
* Reason
* Amendment status

### 7. Amendment Decision

QC Admin can select one of three decisions:

#### Accept & Reopen Gate

* Amendment is accepted.
* Target verification gate is reopened.
* A reopen signal is created.
* Related verified documents/items become stale.
* Party is returned to the Verification Queue.

#### Accept — No Reverification Needed

* Amendment is accepted.
* No verification gate is reopened.
* No reverification is triggered.

#### Refuse Amendment

* Amendment is rejected.
* Original answer remains valid.
* QC Admin can provide a refusal note.
* No gate is reopened.

---

## 🔄 Amendment Lifecycle

```text
PENDING
   │
   ├── Accept & Reopen
   │        ↓
   │   ACCEPTED_REOPENED
   │        ↓
   │   Gate Reopened
   │        ↓
   │   Verification Queue
   │
   ├── Accept – No Reverification
   │        ↓
   │   ACCEPTED_NO_REVERIFICATION
   │
   └── Refuse
            ↓
         REFUSED
```

---

## 🏗️ System Architecture

```text
┌──────────────────────────────┐
│          React.js            │
│         Frontend             │
│                              │
│ • KYC Questionnaire           │
│ • Verification Queue         │
│ • Edit Request               │
│ • Answer Amendments           │
│ • Amendment Details           │
└──────────────┬───────────────┘
               │
               │ REST API
               ↓
┌──────────────────────────────┐
│         Express.js            │
│          Backend              │
│                              │
│ • Authentication/Authorization│
│ • KYC APIs                    │
│ • Edit Request APIs           │
│ • Amendment APIs              │
│ • QC Decision APIs            │
│ • Reopen Gate Logic           │
└──────────────┬───────────────┘
               │
               ↓
┌──────────────────────────────┐
│          Database             │
│                              │
│ • Parties                     │
│ • Questionnaires              │
│ • Answers                     │
│ • Edit Requests               │
│ • Amendments                  │
│ • Decisions                   │
│ • Invalidated Items           │
│ • Reopen Signals              │
└──────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

* React.js
* JavaScript
* HTML5
* CSS3
* Axios
* React Router

### Backend

* Node.js
* Express.js
* REST APIs

### Database

* Localstorage

### Development Tools

* Git
* GitHub
* VS Code
* Postman
* npm

---

## 📂 Project Structure

```text
kyc-amendment-system/
│
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── context/
│       ├── utils/
│       ├── App.js
│       └── index.js
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── config/
│   └── server.js
│
├── README.md
├── package.json
└── .gitignore
```

---

## 👥 User Roles

### Party / Vendor

Can:

* Submit KYC questionnaire.
* View KYC status.
* Raise Post-KYC Edit Requests.
* Provide proposed values.
* Provide reasons.
* Upload supporting documents.
* Update KYC after V.O.S approval.

### V.O.S Admin

Can:

* View Post-KYC Edit Requests.
* Review requested changes.
* Approve edit requests.
* Reject edit requests.

### QC Admin

Can:

* Review initial KYC submissions.
* Approve or reject KYC.
* Review Answer Amendments.
* Compare before and after values.
* Review amendment reasons.
* Accept and reopen a gate.
* Accept without reverification.
* Refuse an amendment.

---

## 🗃️ Core Data Model

### Party

```text
Party
├── id
├── name
├── status
├── questionnaireId
├── createdAt
└── updatedAt
```

### Edit Request

```text
EditRequest
├── id
├── partyId
├── questionId
├── currentValue
├── requestedValue
├── reason
├── attachment
├── status
├── reviewedBy
├── reviewedAt
└── createdAt
```

### Amendment

```text
Amendment
├── id
├── partyId
├── questionId
├── beforeValue
├── afterValue
├── reason
├── targetGate
├── listingImpact
├── questionnaireVersion
├── status
├── createdAt
└── updatedAt
```

### Amendment Decision

```text
AmendmentDecision
├── id
├── amendmentId
├── decision
├── note
├── decidedBy
└── decidedAt
```

### Invalidated Item

```text
InvalidatedItem
├── id
├── amendmentId
├── itemType
├── itemReference
├── status
└── invalidatedAt
```

### Reopen Signal

```text
ReopenSignal
├── id
├── amendmentId
├── partyId
├── gate
├── status
├── createdAt
└── processedAt
```

---

## 🔌 API Endpoints

### KYC

```http
POST   /api/kyc
GET    /api/kyc/:id
PUT    /api/kyc/:id
```

### Verification

```http
GET    /api/verification-queue
POST   /api/kyc/:id/verify
```

### Edit Requests

```http
POST   /api/edit-requests
GET    /api/edit-requests
GET    /api/edit-requests/:id
POST   /api/edit-requests/:id/approve
POST   /api/edit-requests/:id/reject
```

### Amendments

```http
GET    /api/amendments
GET    /api/amendments/:id
POST   /api/amendments/:id/decision
```

### Example Amendment Decision

```json
{
  "decision": "ACCEPT_REOPEN",
  "note": "Registration information requires reverification."
}
```

Other supported decisions:

```text
ACCEPT_REOPEN
ACCEPT_NO_REVERIFICATION
REFUSE
```

---

## 🔐 Important Business Rules

1. A party cannot directly modify verified KYC information.
2. Every post-KYC modification requires an Edit Request.
3. V.O.S Admin approval is required before editing verified information.
4. Every approved KYC change creates an Amendment.
5. The original answer must always be preserved.
6. The new answer must be stored separately.
7. QC Admin must make the final amendment decision.
8. An amendment decision cannot be changed accidentally through duplicate actions.
9. Accept & Reopen must trigger the appropriate verification gate.
10. Invalidated verification items must be marked as stale.
11. Refused amendments must preserve the previous verified answer.
12. Accept — No Reverification must not reopen any gate.
13. Every decision must record:

    * Who made the decision
    * When it was made
    * Decision type
    * Decision note

---

## 🚦 Gate Reopening

Example:

```text
Amendment
    ↓
Question: Business Registration Number
    ↓
Target Gate: REGISTRATION
    ↓
QC Decision:
Accept & Reopen
    ↓
REGISTRATION Gate Reopened
    ↓
Previous Registration Documents
    ↓
Marked as STALE
    ↓
Party enters Verification Queue
```

The verification queue can consume the following reopen signal:

```json
{
  "partyId": 101,
  "amendmentId": 501,
  "gate": "REGISTRATION",
  "reason": "KYC amendment accepted",
  "status": "OPEN"
}
```

---

## 🖥️ Answer Amendments Screen

The primary QC screen contains:

```text
-------------------------------------------------------
                 Answer Amendments
-------------------------------------------------------

Filters:

Gate              [ Registration ▼ ]
Listing Impact    [ All ▼ ]
Questionnaire     [ Version 1.0 ▼ ]
Status            [ Pending ▼ ]

-------------------------------------------------------
Question        Before        After        Status
-------------------------------------------------------
Legal Name      ABC Ltd       ABC Pvt Ltd  Pending
Market Served   India         India, UAE   Pending
-------------------------------------------------------
```

Selecting an amendment opens a detail panel:

```text
Question:
Legal Name

Before:
ABC Ltd

After:
ABC Pvt Ltd

Reason:
Company registration name updated.

Target Gate:
REGISTRATION

Listing Impact:
No

Invalidates:
- Registration Certificate
- Business License

------------------------------------------------

[ Accept & Reopen ]

[ Accept - No Reverification ]

[ Refuse ]

Decision Note:
[________________________________________]
```

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd kyc-amendment-system
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

---

## 🔧 Environment Variables

Create a `.env` file inside the backend directory.

```env
PORT=5000

DATABASE_URL=your_database_connection_string

JWT_SECRET=your_jwt_secret
```

Do not commit `.env` files to GitHub.

Add this to `.gitignore`:

```text
node_modules/
.env
```

---

## ▶️ Running the Application

### Start Backend

```bash
cd server
npm run dev
```

Backend:

```text
http://localhost:5000
```

### Start Frontend

Open another terminal:

```bash
cd client
npm start
```

Frontend:

```text
http://localhost:3000
```

---

## 🧪 Testing the Workflow

### Scenario 1 — Initial KYC

```text
Party
 ↓
Submit Questionnaire
 ↓
QC Review
 ↓
Approve
 ↓
Party Goes Live
```

### Scenario 2 — Post-KYC Edit

```text
Live Party
 ↓
Raise Edit Request
 ↓
V.O.S Review
 ↓
Approve
 ↓
Edit KYC Answer
 ↓
Amendment Created
```

### Scenario 3 — Accept & Reopen

```text
Amendment
 ↓
QC Review
 ↓
Accept & Reopen
 ↓
Invalidated Items → STALE
 ↓
Gate → REOPENED
 ↓
Verification Queue
```

### Scenario 4 — No Reverification

```text
Amendment
 ↓
QC Review
 ↓
Accept – No Reverification
 ↓
Amendment Accepted
 ↓
No Gate Reopened
```

### Scenario 5 — Refuse

```text
Amendment
 ↓
QC Review
 ↓
Refuse
 ↓
Original Answer Remains
 ↓
No Gate Reopened
```

---

## 🛡️ Data Integrity

The system is designed to preserve a complete history of KYC changes.

For example:

```text
Original Answer:
ABC Ltd

Requested Answer:
ABC Private Limited

        ↓

Amendment Record

Before:
ABC Ltd

After:
ABC Private Limited

Reason:
Legal entity name changed.

Decision:
ACCEPT_REOPEN

Gate:
REGISTRATION

Invalidated:
Registration Certificate
```

The original verified answer is never overwritten without maintaining its amendment history.

---

## 📋 Acceptance Criteria

The system is considered functional when:

* [ ] Party can submit a KYC questionnaire.
* [ ] QC can approve/reject initial KYC.
* [ ] Approved parties become live.
* [ ] Live parties cannot directly modify verified answers.
* [ ] Party can create an Edit Request.
* [ ] V.O.S Admin can approve/reject Edit Requests.
* [ ] Approved requests allow the requested KYC edit.
* [ ] Editing creates an Amendment automatically.
* [ ] Amendment stores before and after values.
* [ ] Amendment stores target gate.
* [ ] Amendment stores listing impact.
* [ ] QC can view pending amendments.
* [ ] QC can filter amendments.
* [ ] QC can view amendment details.
* [ ] QC can accept and reopen a gate.
* [ ] QC can accept without reverification.
* [ ] QC can refuse an amendment.
* [ ] Invalidated items become stale when required.
* [ ] Reopen signal is generated for accepted-reopened amendments.
* [ ] Duplicate decisions are prevented.
* [ ] Decision user, timestamp, option, and note are stored.

---

## 🚀 Future Enhancements

Possible future improvements include:

* Role-based authentication and authorization.
* Email/SMS notifications.
* Document upload and document validation.
* Advanced audit logs.
* Dashboard analytics.
* Real-time verification queue updates.
* Version comparison between questionnaires.
* Advanced amendment search.
* File preview.
* Digital signatures.
* Automated document invalidation rules.
* Integration with external KYC/verification providers.

---

## 👨‍💻 Development Notes

This project focuses on implementing the complete business workflow rather than building a highly complex production-grade interface.

The primary objective is to demonstrate:

* Full-stack development
* REST API integration
* Data modeling
* Workflow management
* Role-based actions
* Amendment tracking
* Before/after data comparison
* QC decision processing
* Gate reopening logic
* Data integrity and auditability

---

## 📄 License

This project is developed for demonstration and assessment purposes.
