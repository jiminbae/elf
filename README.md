# ELF

**Evaluate, Learn, Forward**

ELF is an AI-assisted grading and feedback prototype that helps evaluators turn assessment into actionable learning progress.

---

### Overview

ELF is a university LMS-inspired prototype for AI-assisted grading and student feedback workflows. It is not connected to a real KNU learning portal. Instead, it explores how a teaching assistant can review submissions, inspect AI-generated grading suggestions, refine feedback, and publish learning-oriented results to students.

The name stands for **Evaluate, Learn, Forward**:

- **Evaluate** submitted assignments with rubric-based AI assistance.
- **Learn** from score breakdowns, comments, and personalized feedback.
- **Forward** the evaluation into concrete next steps for students.

### Project Context

ELF was developed by **Team Forward** as a project for the **2026 Google AI Agent Challenge**. The project received an **Excellence Award** in the challenge. The final word in the name, **Forward**, also reflects the team name and the idea of moving feedback beyond grading into the learner's next step.

### Screenshots

<details>
<summary>View screenshots</summary>

#### Role Selection

<p align="center">
  <img src="docs/screenshots/01-role-selection.png" alt="ELF role selection screen" width="760">
</p>

#### Assignment Management

<p align="center">
  <img src="docs/screenshots/02-assignment-management.png" alt="ELF assignment management screen" width="760">
</p>

#### TA Grading Queue

<p align="center">
  <img src="docs/screenshots/03-ta-grading-queue.png" alt="ELF TA grading queue screen" width="760">
</p>

#### Essay Grading

<p align="center">
  <img src="docs/screenshots/04-essay-grading.png" alt="ELF essay grading screen" width="680">
</p>

#### Code Grading

<p align="center">
  <img src="docs/screenshots/05-code-grading.png" alt="ELF code grading screen" width="620">
</p>

#### Student Feedback

<p align="center">
  <img src="docs/screenshots/06-student-feedback.png" alt="ELF student feedback screen" width="760">
</p>

</details>

### Workflow

ELF can connect to n8n workflows through a server-side proxy route. This keeps webhook URLs out of the browser while allowing assignment creation, submission intake, grade approval, feedback regeneration, and student result retrieval to be automated.

<p align="center">
  <img src="docs/screenshots/07-workflow.png" alt="ELF n8n workflow diagram" width="720">
</p>

### Key Features

- **AI-assisted grading**: Calls the Google AI API to generate recommended scores, rubric breakdowns, and draft feedback.
- **Human-in-the-loop review**: Lets teaching assistants review and edit AI suggestions before finalizing grades.
- **Submission queue**: Shows submission status, AI score recommendations, review warnings, similarity indicators, and batch actions.
- **Essay and code grading views**: Provides separate grading interfaces for text-based assignments and programming submissions.
- **Student-facing feedback**: Shows final scores, rubric details, comments, learning recommendations, and appeal flows.
- **Automation-ready architecture**: Separates n8n webhook calls, Supabase data access, and Google AI grading into dedicated modules.

### Tech Stack

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Supabase](https://supabase.com/)
- [n8n](https://n8n.io/)
- [Google AI API](https://ai.google.dev/)

### Getting Started

Install dependencies:

```bash
npm install
```

Create `.env.local` when you want to enable external integrations:

```bash
# Google AI grading
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

# n8n webhook proxy
N8N_WEBHOOK_BASE_URL=https://YOUR_N8N_HOST/webhook

# Optional n8n auth
N8N_WEBHOOK_AUTH_HEADER=x-n8n-secret
N8N_WEBHOOK_AUTH_VALUE=your-secret

# Or use bearer token auth
# N8N_WEBHOOK_AUTH_TOKEN=your-token
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deploy on Vercel

ELF uses Next.js API routes, so Vercel is a better fit than GitHub Pages.

1. Go to [Vercel](https://vercel.com/new) and import the GitHub repository (`jiminbae/elf` after renaming it on GitHub).
2. Keep the default framework preset as **Next.js**.
3. Add the environment variables from `.env.example` if you want AI grading, Supabase, or n8n workflows to work in the deployed app.
4. Deploy the project.

For a UI-only demo, the project can still deploy without those environment variables, but external AI/database/workflow features will be unavailable.

### n8n Webhook Paths

The app calls n8n through the internal `/api/n8n` proxy. The current workflow paths are:

- `assignment/create`
- `assignment/list`
- `assignment/submit`
- `grade/approve`
- `student/result`
- `student/list`
- `feedback/regenerate`
- `ta/queue`
- `submission/content`

### Project Structure

```text
src/
  app/
    api/
      grade/        # Google AI grading route
      n8n/          # n8n webhook proxy
    page.js         # Main application state and routing
  lib/
    db.js           # Data access layer with n8n/Supabase fallback logic
    n8n.js          # n8n client and response normalizers
    supabase.js     # Supabase client setup
  screens/
    assignments.jsx # TA assignment creation/list screen
    queue.jsx       # TA submission queue
    grading-essay.jsx
    grading-code.jsx
    student.jsx     # Student dashboard and feedback screens
```

### Notes

- ELF is a prototype, not a production LMS integration.
- The KNU-style interface is used as a design and workflow context only.
- AI-generated grading results should be reviewed by a human evaluator before being treated as final.

---

## Developers

| Name | GitHub | Role |
| --- | --- | --- |
| Jimin Bae | [@jiminbae](https://github.com/jiminbae) | Team Lead; n8n workflow architecture and automation pipeline implementation |
| Jihoon Bae | [@BaeCHACHA](https://github.com/BaeCHACHA) | Supabase database schema, data modeling, and backend data integration |
| Gyuri Nam | [@whyyhyh](https://github.com/whyyhyh) | Frontend implementation for TA/student workflows and interactive grading screens |
| Sejin Jeong | [@jinsejeong](https://github.com/jinsejeong) | Frontend implementation, UI/UX design, and visual system refinement |
