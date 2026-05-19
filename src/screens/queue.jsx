import React from 'react';
import { Icon } from '../icons';
import { Shell } from '../shell';
import { MOCK } from '../data';

export function QueueView({ assignment, students, onOpen, onSwitchAssignment, openSet, setOpenSet }) {
  const [filter, setFilter] = React.useState("all"); // all, ready, graded, suspicion
  const [search, setSearch] = React.useState("");

  const filtered = students.filter(s => {
    if (filter === "ready"   && s.status !== "ready") return false;
    if (filter === "graded"  && s.status !== "graded") return false;
    if (filter === "suspicion" && !(s.hasWarning || s.hasSimWarning)) return false;
    if (search && !(s.name.includes(search) || s.no.includes(search))) return false;
    return true;
  });

  const toggle = (id) => {
    const next = new Set(openSet);
    if (next.has(id)) next.delete(id); else next.add(id);
    setOpenSet(next);
  };

  return (
    <>
      <Shell.Crumbs trail={[assignment.course, "과제", assignment.title]} />

      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 4 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: "-0.015em" }}>{assignment.title}</h1>
        <span className="badge badge--ai badge--dot">AI 채점 보조 활성</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 6, fontSize: 13, color: "var(--ink-600)" }}>
        <span>마감 {assignment.deadline}</span>
        <span style={{ color: "var(--ink-300)" }}>·</span>
        <span>총 {students.length}명 제출</span>
        <span style={{ color: "var(--ink-300)" }}>·</span>
        <span>평균 {assignment.avg}</span>
        <button onClick={onSwitchAssignment} className="btn btn--ghost btn--sm" style={{ marginLeft: "auto" }}>
          다른 과제 보기 <Icon.chevD width="12" height="12" />
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 20 }}>
        <StatCard label="채점 완료" value={`${assignment.graded}/${students.length}`} tone="good"
          progress={assignment.graded / students.length} />
        <StatCard label="대기" value={`${students.filter(s => s.status === "ready").length}`} tone="ai" />
        <StatCard label="검토 권장" value={`${students.filter(s => s.hasWarning || s.hasSimWarning).length}`} tone="warn" sub="AI 의심도 또는 유사도 ↑" />
        <StatCard label="평균 점수" value={`${assignment.avg}`} sub={`AI 추천 평균 ${assignment.aiAvg}`} />
      </div>

      <div className="queue-toolbar">
        <div className="search">
          <Icon.search width="14" height="14" style={{ color: "var(--ink-500)" }} />
          <input placeholder="학생 이름 / 학번 검색…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="qfilter">
          {[
            ["all", `전체 ${students.length}`],
            ["ready", `대기 ${students.filter(s => s.status === "ready").length}`],
            ["graded", `완료 ${students.filter(s => s.status === "graded").length}`],
            ["suspicion", `검토 ${students.filter(s => s.hasWarning || s.hasSimWarning).length}`],
          ].map(([k, lbl]) => (
            <button key={k} className={filter === k ? "is-active" : ""} onClick={() => setFilter(k)}>{lbl}</button>
          ))}
        </div>
        <button className="btn btn--ghost btn--sm">
          <Icon.filter width="14" height="14" /> 정렬: AI 추천 순
        </button>
        <button className="btn btn--ghost btn--sm">
          <Icon.download width="14" height="14" /> 일괄 다운로드
        </button>
      </div>

      <div className="q-list">
        <div className="q-row is-head">
          <span></span>
          <span>학생</span>
          <span>제출</span>
          <span>AI 추천</span>
          <span>AI 의심도</span>
          <span>유사도</span>
          <span>상태</span>
          <span></span>
        </div>
        {filtered.map(s => (
          <div
            key={s.id}
            className={"q-row" + (openSet.has(s.id) ? " is-selected" : "") + (s.isFocus ? " is-selected" : "")}
            onClick={() => toggle(s.id)}
          >
            <input
              type="checkbox" checked={openSet.has(s.id) || s.isFocus}
              onChange={() => toggle(s.id)}
              onClick={e => e.stopPropagation()}
              style={{ accentColor: "var(--brand-700)" }}
            />
            <div>
              <div className="name">{s.name}</div>
              <div className="id">{s.no}</div>
            </div>
            <span style={{ fontSize: 12, color: "var(--ink-600)" }}>{s.submittedAt}</span>
            <span className="ai-score">{s.aiScore != null ? s.aiScore : "—"}</span>
            <span className="q-meter">
              {s.suspicion != null ? (
                <>
                  <div className={"bar" + (s.suspicion > 25 ? " bad" : s.suspicion > 12 ? " warn" : "")}>
                    <span style={{ width: `${Math.min(s.suspicion * 2.5, 100)}%` }} />
                  </div>
                  <span>{s.suspicion}%</span>
                </>
              ) : "—"}
            </span>
            <span className="q-meter">
              {s.similarity != null ? (
                <>
                  <div className={"bar" + (s.similarity > 18 ? " bad" : s.similarity > 10 ? " warn" : "")}>
                    <span style={{ width: `${Math.min(s.similarity * 4, 100)}%` }} />
                  </div>
                  <span>{s.similarity}%</span>
                </>
              ) : "—"}
            </span>
            <StatusPill status={s.status} score={s.finalScore} warn={s.hasWarning || s.hasSimWarning} />
            <button
              className="btn btn--quiet btn--sm btn--icon"
              onClick={e => { e.stopPropagation(); onOpen(s.id); }}
              title="채점 화면 열기"
            >
              <Icon.chevR width="16" height="16" />
            </button>
          </div>
        ))}
      </div>

      {openSet.size > 0 ? (
        <div className="q-summary-bar">
          <strong>{openSet.size}명 선택됨</strong>
          <span style={{ opacity: 0.8 }}>일괄 처리: 모두 AI 추천 그대로 승인 · 일괄 톤 변경</span>
          <span className="spacer" />
          <button className="btn btn--ghost btn--sm" style={{ background: "transparent", color: "#fff", borderColor: "rgba(255,255,255,0.2)" }} onClick={() => setOpenSet(new Set())}>선택 해제</button>
          <button className="btn btn--ai btn--sm">
            <Icon.bolt width="14" height="14" /> 일괄 승인 ({openSet.size})
          </button>
          <button
            className="btn btn--primary btn--sm"
            style={{ background: "var(--brand-500)" }}
            onClick={() => onOpen([...openSet][0])}
          >
            첫 학생부터 채점 시작 <Icon.arrowR width="14" height="14" />
          </button>
        </div>
      ) : null}
    </>
  );
}

function StatCard({ label, value, sub, tone, progress }) {
  return (
    <div className="card" style={{ padding: "16px 18px" }}>
      <div style={{ fontSize: 11.5, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em",
          color: tone === "good" ? "var(--good-700)" : tone === "warn" ? "var(--warn-700)" : tone === "ai" ? "var(--ai-700)" : "var(--ink-900)" }}>
          {value}
        </div>
      </div>
      {progress != null ? (
        <div className="bar" style={{ marginTop: 8 }}><span style={{ width: `${progress * 100}%` }} /></div>
      ) : null}
      {sub ? <div style={{ fontSize: 11.5, color: "var(--ink-500)", marginTop: 6 }}>{sub}</div> : null}
    </div>
  );
}

function StatusPill({ status, score, warn }) {
  if (status === "graded") return <span className="badge badge--good badge--dot">완료 · {score}</span>;
  if (status === "pending") return <span className="badge">제출 안 됨</span>;
  if (warn) return <span className="badge badge--warn badge--dot">검토 권장</span>;
  return <span className="badge badge--ai badge--dot">AI 추천 준비</span>;
}
