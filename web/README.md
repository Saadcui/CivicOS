# CivicOS – Smart City Monitoring & Complaint Management System

A high-performance, enterprise-grade full-stack smart city platform built with **Next.js 14 (JavaScript)**, **Tailwind CSS**, **MongoDB Atlas**, **Mongoose**, **JWT Authentication** (HTTP-only cookies), **bcrypt password hashing**, **Lucide React**, and **Recharts**.

Inspired by the visual editorial storytelling of Phenomenon Studio ("Voices United") combined with modern SaaS platforms (Linear & Stripe).

---

## 🏛️ Role-Based Access Control (RBAC) Architecture

CivicOS strictly enforces authorization at three defense-in-depth layers:
1. **Edge Middleware (`middleware.js`)**: Cryptographically inspects incoming session tokens before routes render. Unauthorized roles are immediately redirected to `/access-denied` or `/login`.
2. **Server Components (`app/(citizen|officer|admin)/**`)**: Double-checks authenticated user roles against database records before retrieving state.
3. **Backend API Endpoints (`lib/apiAuth.js` & `app/api/**`)**: Every GET, POST, and PATCH route validates identity and role server-side. **Roles sent by the client are never trusted**.

### Role Matrix & Permissions

| Capability | Citizen | Government Officer | Municipal Admin |
| :--- | :---: | :---: | :---: |
| **Self-Registration** | ✅ Yes | ❌ Blocked (Admin only) | ❌ Blocked (Admin only) |
| **Submit Complaint** | ✅ Yes | ❌ (Officer workflow) | ✅ Yes |
| **View Own Complaints** | ✅ Yes | ✅ If citizen | ✅ Yes |
| **View Other Citizens' Complaints** | ❌ **Forbidden** (403) | ❌ **Forbidden** (403) | ✅ Yes |
| **View Department Complaints** | ❌ Forbidden | ✅ **Authorized Dept Only** | ✅ All Depts |
| **Assign / Update Complaint Status** | ❌ Forbidden | ✅ Authorized Dept Only | ✅ Yes |
| **Add Remarks & Proof of Resolution** | ❌ Forbidden | ✅ Yes | ✅ Yes |
| **Verify AI CCTV Detections** | ❌ Forbidden | ✅ Yes | ✅ Yes |
| **Provision Officers & Toggle Status** | ❌ Forbidden | ❌ Forbidden | ✅ **Yes** |
| **Create & Configure Departments** | ❌ Forbidden | ❌ Forbidden | ✅ **Yes** |
| **System Security & AI Settings** | ❌ Forbidden | ❌ Forbidden | ✅ **Yes** |

---

## 🔒 Security Specifications

- **Client Role Untrusted**: Public registration (`/api/auth/register`) hardcodes `role: 'citizen'`. Any `role` property in request payloads is ignored.
- **HTTP-Only Cookies**: JWTs are transmitted exclusively inside `civicos_token` with `httpOnly: true`, `sameSite: 'lax'`, and `secure` in production, eliminating token theft via Cross-Site Scripting (XSS).
- **Password Protection**: Passwords are salted and hashed using **bcrypt** (10 salt rounds) via Mongoose pre-save hooks. Password fields are marked `select: false`.
- **Department Boundary Enforcement**: Officers cannot read, update, or resolve complaints belonging to another municipal department.
- **Citizen Boundary Enforcement**: Citizens cannot query or inspect complaints submitted by other citizens.

---

## 🚀 Getting Started

### 1. Configure Environment
Create `.env.local` in the project root:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/civicos
JWT_SECRET=civicos-super-secure-production-jwt-secret-key-32chars-minimum-2024
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
AI_DETECTION_URL=http://127.0.0.1:8001
AI_CONFIDENCE_THRESHOLD=0.25
CCTV_INGEST_API_KEY=replace-with-a-long-random-secret
```
*(For MongoDB Atlas, replace `MONGODB_URI` with your `mongodb+srv://...` connection string).*

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Account Provisioning & Roles
- **Initial Administrator Setup**: The very first account registered through `/register` automatically receives the **Administrator** role (`admin`).
- **Officer Provisioning**: Log in as the Administrator, navigate to **Officers Management** (`/admin/officers`), and click **Provision New Officer** to assign field officers to specific municipal departments.
- **Citizen Accounts**: Subsequent registrations through `/register` create standard **Citizen** accounts to report issues and track complaints.

---

## 📂 Project Structure

```
d:\CivicOS/
├── app/
│   ├── (auth)/
│   │   ├── login/page.js          # Split-screen editorial sign in
│   │   └── register/page.js       # User registration with security policy enforcement
│   ├── (public)/
│   │   └── page.js                # Editorial homepage with "Voices United" Dribbble styling
│   ├── citizen/
│   │   ├── layout.js              # Citizen RBAC server guard
│   │   ├── page.js                # Citizen overview dashboard & metrics
│   │   ├── complaints/
│   │   │   ├── page.js            # My complaints list with filter tabs
│   │   │   ├── new/page.js        # Complaint submission UI with interactive map picker
│   │   │   └── [id]/page.js       # 5-step progress tracker & resolution evidence
│   │   └── profile/page.js        # Permitted profile updates
│   ├── officer/
│   │   ├── layout.js              # Officer RBAC guard
│   │   ├── page.js                # Officer dashboard with Linear/Stripe styling & Recharts
│   │   ├── complaints/
│   │   │   ├── page.js            # Department complaints queue
│   │   │   └── [id]/page.js       # Review, assign, remarks & proof upload
│   │   ├── map/page.js            # Department GIS spatial map
│   │   └── reports/page.js        # SLA compliance & audit reports
│   ├── admin/
│   │   ├── layout.js              # Admin-only RBAC guard
│   │   ├── page.js                # City-wide executive dashboard
│   │   ├── officers/page.js       # Provision officers & toggle active status
│   │   ├── departments/page.js    # Register & manage municipal departments
│   │   ├── complaints/page.js     # Unrestricted master docket
│   │   ├── settings/page.js       # System, JWT & AI CCTV parameters
│   │   ├── map/page.js            # City-wide GIS master map
│   │   └── reports/page.js        # Municipal compliance & legal statements
│   ├── access-denied/page.js      # Custom 403 Forbidden page
│   └── api/
│       ├── auth/
│       │   ├── register/route.js  # Role enforced to citizen
│       │   ├── login/route.js     # Sets secure HTTP-only cookie
│       │   ├── logout/route.js    # Clears session cookie
│       │   ├── me/route.js        # Current user profile
│       │   └── profile/route.js   # Permitted profile updates
│       ├── complaints/
│       │   ├── route.js           # Scoped GET by role & POST new complaint
│       │   └── [id]/
│       │       ├── route.js       # Per-record RBAC guard
│       │       └── status/route.js# Workflow & remarks commit
│       ├── officers/route.js      # Admin officer provisioning
│       ├── departments/route.js   # Department registration
│       └── stats/route.js         # Recharts analytics endpoint
├── components/
│   ├── layout/
│   │   ├── CitizenLayout.js       # Citizen sidebar & header
│   │   └── GovernmentLayout.js    # Dynamic officer/admin sidebar (hides unauthorized items)
│   ├── officer/
│   │   ├── GovernmentAnalytics.js # Recharts line chart, donut, & category bar chart
│   │   ├── ComplaintsTable.js     # Triage table with citizen vs CCTV filters
│   │   └── ComplaintDetailManager.js # Interactive review & remarks form
│   └── public/
│       ├── PublicNav.js           # Public navigation bar
│       └── Footer.js              # Civic branding & links
├── lib/
│   ├── auth.js                    # JWT signing & HTTP-only cookies via jose
│   ├── apiAuth.js                 # Server-side API route guards
│   └── db.js                      # Cached Mongoose connection helper
├── models/
│   ├── User.js                    # Mongoose User schema with bcrypt
│   ├── Complaint.js               # Complaint schema with remarks & evidence
│   └── Department.js              # Department schema
├── middleware.js                  # Next.js Edge route guard
└── tailwind.config.js             # CivicOS design system palette
```
