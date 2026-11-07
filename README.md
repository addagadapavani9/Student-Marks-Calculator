# 🎓 Student Marks Calculator (Next-Gen Futuristic Edition)

A modern, responsive, futuristic **Student Marks Calculator Web Application** built with **Next.js 14 (App Router)**, **TypeScript**, and **MongoDB with Mongoose**.

---

## ⚡ Features

- **Futuristic UI/UX:** Deep dark theme with glowing neon cyan & purple accents, glassmorphic card layouts, smooth transitions, and responsive mobile-first design.
- **Form Validation:** All fields required, student name & roll number validated, subject marks constrained between `0` and `100`.
- **Intelligent Grade Calculator:**
  - Total marks computed out of `500`
  - Percentage calculated with 2 decimal precision
  - Average marks per subject
  - Automated Grade Mapping:
    - `90 - 100`: **A+**
    - `80 - 89`: **A**
    - `70 - 79`: **B**
    - `60 - 69`: **C**
    - `50 - 59`: **D**
    - `Below 50`: **Fail**
  - **Pass / Fail** status badge with neon visual indicator.
- **MongoDB Database Integration:**
  - Automatic persistence of calculations via `/api/students`
  - Live retrieval of previously saved records
  - Instant **Delete** action for record management
  - Re-useable, cached Mongoose connection pool to prevent connection spikes in Next.js

---

## 📁 Project Structure

```text
├── app/
│   ├── api/
│   │   └── students/
│   │       ├── route.ts            # GET, POST, DELETE endpoints
│   │       └── [id]/
│   │           └── route.ts        # DELETE by MongoDB ID
│   ├── globals.css                 # Futuristic neon styles & animations
│   ├── layout.tsx                  # Root layout with fonts & metadata
│   └── page.tsx                    # Main interactive calculator & dashboard
├── lib/
│   └── mongodb.ts                  # Cached Mongoose connection helper
├── models/
│   └── Student.ts                  # Student Mongoose Schema & TypeScript interface
├── .env.local                      # Local environment configuration
├── .env.local.example              # Example environment configuration
├── next.config.js                  # Next.js configuration
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript compiler configuration
└── README.md                       # Comprehensive guide
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have installed:
- **Node.js** (v18 or higher)
- **MongoDB** (Local MongoDB Community Server or MongoDB Atlas cloud cluster)

---

### 2. Configure MongoDB

Create or edit your `.env.local` file in the root folder:

```env
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/student_marks_db

# OR MongoDB Atlas (Cloud):
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/student_marks_db?retryWrites=true&w=majority
```

---

### 3. Install Dependencies

Dependencies are already installed. If you ever need to reinstall:
```bash
npm install
```

---

### 4. Run the Development Server

Start the Next.js development server:

```bash
npm run dev
```

Open your browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🧪 Testing All Features

1. **Calculate & Save:**
   - Enter Student Name: `Alex Mercer`
   - Enter Roll Number: `CS-2026-089`
   - Enter Marks: `92`, `88`, `95`, `90`, `85`
   - Click **"Calculate & Save Record"**.
   - Result card updates immediately: Total `450 / 500`, Percentage `90%`, Average `90`, Grade `A+`, Status `Pass`.
   - The record is saved in MongoDB and appears in the **Saved Records Database** table below.

2. **Validation Check:**
   - Leave a field empty or type a score `> 100` (e.g., `120`) or `< 0` (e.g. `-5`).
   - The system displays a red warning message and blocks submission.

3. **Delete Record:**
   - Click the **"Delete"** button next to any saved record in the table.
   - Confirm the prompt; the record is removed from MongoDB and vanishes from the list.

4. **Reset Form:**
   - Click **"Reset Form"** to quickly clear all inputs and calculation card.
