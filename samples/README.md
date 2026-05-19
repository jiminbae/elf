# 🗄️ Supabase Schema & Sample Seeds

이 디렉토리에는 KNU Grading AI 채점 보조 도구 프로토타입의 데이터베이스 연동에 필요한 SQL 스크립트 및 테이블 정의가 포함되어 있습니다.

## 📋 파일 설명

1. **[`schema.sql`](file:///e:/workspaces/antigravity-workspace/프젝/samples/schema.sql)**
   - 연동된 Supabase 데이터베이스에 꼭 필요한 `assignments`, `students`, `submissions`, `submission_contents` 테이블들을 깨끗이 재정의하고, **인증(Auth) 없이도 자유롭게 조회 및 등록(Update/Insert)이 가능하도록 RLS(Row Level Security) 설정을 비활성화**하는 마이그레이션 스크립트입니다.
2. **[`seed.sql`](file:///e:/workspaces/antigravity-workspace/프젝/samples/seed.sql)**
   - 화면에 노출되는 고해상도 모의(Mock) 학생 목록, 성적 데이터, 감상문 본문의 인용 트리 및 코딩 과제 스택(Stack) 토큰 구조 등을 SQL로 정밀 변환한 초기 데이터(Seed) 생성 스크립트입니다.

## 🚀 적용 방법

1. **[Supabase Console](https://supabase.com/)**에 로그인하여 해당 프로젝트로 들어갑니다.
2. 좌측 네비게이션 메뉴에서 **SQL Editor**로 이동합니다.
3. **`New query`**를 누르고 [`schema.sql`](file:///e:/workspaces/antigravity-workspace/프젝/samples/schema.sql) 파일의 전체 내용을 복사하여 붙여넣고 **`RUN`**을 실행합니다.
4. 이어서 다른 쿼리 창을 열어 [`seed.sql`](file:///e:/workspaces/antigravity-workspace/프젝/samples/seed.sql) 파일의 내용을 붙여넣고 **`RUN`**을 실행합니다.

완료되면, 로컬 개발 환경에서 즉시 실제 DB 데이터가 노출 및 반영되어 채점 보조 및 업데이트 연동이 매끄럽게 동작하게 됩니다!
