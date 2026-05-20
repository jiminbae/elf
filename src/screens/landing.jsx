import React from 'react';
import { Icon } from '../icons';

export function Landing({ onPick, metrics }) {
  const taStats = metrics?.taStats || [];
  const studentStats = metrics?.studentStats || [];

  return (
    <div className="app full-bleed" style={{ background: "var(--paper)", display: "grid", placeItems: "center", padding: 32 }}>
      <div style={{ width: "100%", maxWidth: 920 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: "var(--brand-700)", color: "#fff",
            display: "grid", placeItems: "center",
            fontWeight: 800, fontSize: 17,
            boxShadow: "var(--sh-2)"
          }}>KNU</div>
          <div>
            <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.01em" }}>경북대학교 학습포털</div>
            <div style={{ fontSize: 13, color: "var(--ink-500)" }}>AI 채점 보조가 적용된 2026년 1학기 평가 시스템</div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--ink-500)" }}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 99, background: "var(--good-500)", marginRight: 6 }} />
            시스템 정상 · 2026.05.19
          </div>
        </div>

        <div style={{ fontSize: 12, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 12 }}>
          시작할 역할을 선택하세요
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <RoleCard
            role="ta"
            title="조교 / 채점 패널"
            person="조교"
            stats={taStats}
            features={[
              "AI가 추천하는 점수·피드백 초안 검토",
              "본문 인라인 코멘트, 라인별 코드 코멘트",
              "유사도/인용 검증, AI 의심도 알림",
            ]}
            cta="조교로 시작하기"
            onPick={() => onPick("ta")}
          />
          <RoleCard
            role="student"
            title="학생 / 피드백 화면"
            person="학생"
            stats={studentStats}
            features={[
              "항목별 점수와 AI 학습 분석 펼쳐보기",
              "맞춤 학습 자료 미리보기",
              "재채점 요청 / 이의 신청 흐름",
            ]}
            cta="학생으로 시작하기"
            onPick={() => onPick("student")}
          />
        </div>

        <div style={{ marginTop: 28, fontSize: 11.5, color: "var(--ink-400)", textAlign: "center", lineHeight: 1.7 }}>
          좌측 사이드바 하단의 아바타를 클릭하면 언제든지 역할 선택 화면으로 돌아올 수 있습니다.
        </div>
      </div>
    </div>
  );
}

function RoleCard({ role, title, person, stats, features, cta, onPick }) {
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{
        padding: "22px 24px 18px",
        background: role === "ta"
          ? "linear-gradient(135deg, #fbe5e8 0%, #fdf2f3 100%)"
          : "linear-gradient(135deg, #e3edfb 0%, #f1f6fd 100%)",
        borderBottom: "1px solid var(--ink-200)"
      }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
          color: role === "ta" ? "var(--brand-700)" : "var(--ai-700)" }}>
          {role === "ta" ? "Teaching Assistant" : "Student"}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em", marginTop: 6 }}>{title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 99,
            background: role === "ta" ? "var(--brand-700)" : "var(--ai-600)",
            color: "#fff", display: "grid", placeItems: "center",
            fontWeight: 700, fontSize: 13
          }}>{role === "ta" ? "남" : "효"}</div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{person}</div>
          </div>
        </div>
      </div>
      <div style={{ padding: "16px 24px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, borderBottom: "1px solid var(--ink-150)" }}>
        {stats.map((s, i) => (
          <div key={i}>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>{s.val}</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-600)" }}>{s.lbl}</div>
          </div>
        ))}
      </div>
      <ul style={{ padding: "14px 24px 16px", margin: 0, listStyle: "none", flex: 1 }}>
        {features.map((f, i) => (
          <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "5px 0", fontSize: 13, color: "var(--ink-700)" }}>
            <Icon.check width="16" height="16" style={{ color: role === "ta" ? "var(--brand-700)" : "var(--ai-600)", flexShrink: 0, marginTop: 2 }} />
            {f}
          </li>
        ))}
      </ul>
      <div style={{ padding: "0 24px 22px" }}>
        <button className="btn btn--block" onClick={onPick}
          style={{
            background: role === "ta" ? "var(--brand-700)" : "var(--ai-600)",
            color: "#fff",
            boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.18)",
            height: 42, fontSize: 14
          }}>
          {cta} <Icon.arrowR width="16" height="16" />
        </button>
      </div>
    </div>
  );
}
