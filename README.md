# ELF

**Evaluate, Learn, Forward**

ELF is an AI-assisted grading and feedback prototype that helps evaluators turn assessment into actionable learning progress.

이 프로젝트는 대학 LMS 환경을 참고해 만든 **AI 채점 보조 인터페이스 프로토타입**입니다. 실제 KNU 학습포털과 직접 연동된 서비스는 아니며, 조교가 과제 제출물을 검토하고 AI 추천 점수와 피드백 초안을 확인한 뒤 학생에게 결과를 제공하는 흐름을 실험하기 위해 제작되었습니다.

## Overview

ELF는 **Evaluate, Learn, Forward**의 약자입니다. 과제를 평가하는 데서 끝나지 않고, 학생이 무엇을 배웠고 다음에 어디로 나아가야 하는지까지 이어지는 평가 흐름을 목표로 합니다.

ELF는 조교 화면과 학생 화면을 나누어 과제 평가 과정을 end-to-end로 보여줍니다.

- 조교는 과제를 생성하고 제출 큐를 확인할 수 있습니다.
- AI 추천 점수, 루브릭별 점수, 피드백 초안을 검토할 수 있습니다.
- 에세이형 과제와 코드형 과제 화면을 분리해 보여줍니다.
- 학생은 제출 상태, 채점 결과, 세부 피드백, 학습 권장 사항을 확인할 수 있습니다.
- n8n webhook, Supabase, Google AI API 연동을 통해 실제 데이터 흐름을 붙일 수 있도록 구성했습니다.

## Screenshots

아래 위치에 실제 화면 캡처를 추가하면 README에서 바로 보여줄 수 있습니다. 이미지를 넣은 뒤 주석 처리된 `![...](...)` 줄의 주석을 풀어주세요.

### Role Selection

<!-- ![ELF role selection screen](docs/screenshots/01-role-selection.png) -->

> 필요한 캡처: 처음 접속했을 때 조교 / 학생 역할을 선택하는 랜딩 화면

### Assignment Management

<!-- ![ELF assignment management screen](docs/screenshots/02-assignment-management.png) -->

> 필요한 캡처: 조교 화면의 과제 목록과 `새 과제 생성` 패널이 보이는 화면

### TA Grading Queue

<!-- ![ELF grading queue screen](docs/screenshots/03-ta-grading-queue.png) -->

> 필요한 캡처: 제출자 목록, AI 추천 점수, 검토 권장 상태, 유사도/의심도 지표가 함께 보이는 조교 큐 화면

### Essay Grading

<!-- ![ELF essay grading screen](docs/screenshots/04-essay-grading.png) -->

> 필요한 캡처: 에세이 제출물 본문과 AI 채점 패널이 나란히 보이는 화면

### Code Grading

<!-- ![ELF code grading screen](docs/screenshots/05-code-grading.png) -->

> 필요한 캡처: 코드 제출물, 테스트/실행 결과, AI 피드백 또는 점수 패널이 보이는 화면

### Student Feedback

<!-- ![ELF student feedback screen](docs/screenshots/06-student-feedback.png) -->

> 필요한 캡처: 학생이 채점 결과, 루브릭 점수, 피드백, 학습 추천을 확인하는 화면

## Key Features

- **AI-assisted grading**: Google AI API를 호출해 제출물에 대한 점수, 루브릭별 평가, 피드백 초안을 생성합니다.
- **TA review workflow**: AI 결과를 그대로 확정하지 않고 조교가 점수와 피드백을 검토하고 수정할 수 있게 설계했습니다.
- **Submission queue**: 제출 상태, AI 추천 점수, 검토 권장 여부, 유사도 지표를 한 화면에서 비교합니다.
- **Student-facing feedback**: 학생 관점에서 최종 점수, 세부 평가, 개선 방향, 재채점 요청 흐름을 확인할 수 있습니다.
- **Automation-ready architecture**: n8n webhook proxy와 Supabase client를 분리해 외부 워크플로우와 데이터베이스를 붙일 수 있습니다.

## Tech Stack

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Supabase](https://supabase.com/)
- [n8n](https://n8n.io/)
- [Google AI API](https://ai.google.dev/)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

필수 연동 없이도 UI 일부는 확인할 수 있지만, AI 채점과 외부 워크플로우를 사용하려면 `.env.local`을 설정해야 합니다.

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

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy on Vercel

ELF uses Next.js API routes, so Vercel is a better fit than GitHub Pages.

1. Go to [Vercel](https://vercel.com/new) and import the GitHub repository (`jiminbae/elf` after renaming it on GitHub).
2. Keep the default framework preset as **Next.js**.
3. Add the environment variables from `.env.example` if you want AI grading, Supabase, or n8n workflows to work in the deployed app.
4. Deploy the project.

For a UI-only demo, the project can still deploy without those environment variables, but the external AI/database/workflow features will be unavailable.

## n8n Webhook Paths

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

## Project Structure

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

## Notes

- ELF is a prototype, not a production LMS integration.
- The KNU-style interface is used as a design and workflow context only.
- AI-generated grading results should be reviewed by a human evaluator before being treated as final.
