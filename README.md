# Smart Internal Assessment and Assignment Monitoring System for Faculty

A full-stack, enterprise-grade web application engineered for colleges and universities. It allows faculty, students, and academic administrators to manage course assignments, digital submissions, internal assessment evaluations, marks computation, and academic analytics from a single unified portal.

---

## 🌟 Key Architecture & Compliance Principles

1. **Zero Pre-Populated Accounts & Empty Database Guarantee**:
   - The system starts with a completely empty database.
   - No mock accounts, hardcoded credentials, or pre-seeded demo records exist.
   - All users (Students, Faculty, Administrators) create their own accounts via the registration interface with secure password hashing (`bcryptjs`) and JWT authentication.

2. **Dual-Engine Persistence**:
   - **Production Mode**: Connects to MySQL 8+ using pooled connections (`mysql2/promise`) with foreign keys, indexes, and transactions.
   - **Zero-Config Container Mode**: Built-in relational file-based storage engine ensuring instant out-of-the-box operation with zero manual database provisioning required.

3. **Strict Role-Based Access Control (RBAC)**:
   - **STUDENT**: View enrolled courses, upload assignments, track upcoming deadlines, monitor internal test marks, and review performance trends.
   - **FACULTY**: Create course assignments, review student submissions, grade work with feedback, record internal assessment marks (Test 1, Test 2, Assignment, Attendance), and analyze class reports.
   - **ADMIN**: Institutional oversight over user directory, faculty roster, student enrollment, global coursework auditing, and accreditation reporting.

---

## 📐 Internal Assessment Calculation Formula

The system automatically computes total internal marks and percentage based on standard academic parameters:
- **Test 1**: Maximum 30 marks
- **Test 2**: Maximum 30 marks
- **Assignment**: Maximum 20 marks
- **Attendance**: 0% to 100%

$$\text{Academic Portion (out of 80)} = \text{Test 1} + \text{Test 2} + \text{Assignment}$$

$$\text{Final Internal Percentage} = \left(\frac{\text{Academic Portion}}{80} \times 80\right) + \left(\frac{\text{Attendance \%}}{100} \times 20\right)$$

### Performance Classification:
- **90% - 100%**: Excellent
- **75% - 89.9%**: Good
- **60% - 74.9%**: Average
- **Below 60%**: Needs Improvement

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts, React Router v6.
- **Backend**: Node.js, Express.js, TypeScript, ESBuild.
- **Authentication**: Stateless JSON Web Tokens (JWT), BCrypt password hashing.
- **Database**: MySQL 8+ compatible schema with automatic local relational persistence fallback.

---

## 🚀 Getting Started

### 1. Account Creation
On first launch, navigate to `/register` and create an initial account:
- Register as an **Admin** to oversee users and institution-wide records.
- Register as **Faculty** to create assignments and grade students.
- Register as a **Student** to submit work and track marks.

### 2. Run Locally
```bash
# Install dependencies
npm install

# Start development server (serves both Express API & React Vite on port 3000)
npm run dev

# Production build
npm run build
npm start
```
