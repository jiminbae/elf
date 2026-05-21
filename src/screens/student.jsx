import React from 'react';
import { Icon } from '../icons';
import { Shell } from '../shell';

export function StudentDashboard({ onOpen, assignments = [] }) {
  const [tab, setTab] = React.useState("all");
  const gradedCount = assignments.filter(a => a.status === "graded").length;
  const pendingCount = assignments.filter(a => a.status !== "graded").length;
  return (
    <>
      <Shell.Crumbs trail={["2026년 1학기", "과제 및 평가"]} />
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 4 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: "-0.015em" }}>과제 및 평가</h1>
        <span className="badge">총 {assignments.length}개</span>
      </div>

      <div className="card mt-20" style={{ padding: "20px 22px", marginTop: 20 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <h3>과제 현황</h3>
          <span style={{ fontSize: 12, color: "var(--ink-500)" }}>실제 데이터 기준</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 16 }}>
          <div className="card" style={{ padding: 14 }}><strong>{assignments.length}</strong><div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 4 }}>전체 과제</div></div>
          <div className="card" style={{ padding: 14 }}><strong>{gradedCount}</strong><div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 4 }}>채점 완료</div></div>
          <div className="card" style={{ padding: 14 }}><strong>{pendingCount}</strong><div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 4 }}>진행 중</div></div>
        </div>
      </div>

      <div className="queue-toolbar" style={{ marginTop: 6 }}>
        <div className="qfilter">
          {[["all", `전체 ${assignments.length}`], ["graded", `채점 완료 ${gradedCount}`], ["pending", `채점 대기 ${pendingCount}`]].map(([k, lbl]) => (
            <button key={k} className={tab === k ? "is-active" : ""} onClick={() => setTab(k)}>{lbl}</button>
          ))}
        </div>
      </div>

      <div className="a-list">
        <div className="a-row" style={{ background: "var(--ink-50)", fontSize: 11.5, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: "0.04em", cursor: "default" }}>
          <span></span><span>과제</span><span>마감</span><span>제출</span><span>채점</span><span>점수</span><span></span>
        </div>
        {assignments.length === 0 ? (
          <div className="card card-pad" style={{ gridColumn: "1 / -1" }}>표시할 학생 과제 데이터가 없습니다.</div>
        ) : assignments.filter(a => {
          if (tab === "graded") return a.status === "graded";
          if (tab === "pending") return a.status !== "graded";
          return true;
        }).map(a => (
          <div key={a.id} className="a-row" onClick={() => onOpen(a.id)}>
            <div className={"ico " + a.type}>
              {a.type === "code" ? <Icon.code width="16" height="16" /> :
                a.type === "math" ? <Icon.bracket width="16" height="16" /> :
                  <Icon.doc width="16" height="16" />}
            </div>
            <div>
              <div className="name">{a.title}</div>
              <div className="sub">{a.courseShort}</div>
            </div>
            <span style={{ fontSize: 12.5, color: "var(--ink-700)" }}>{a.deadline}</span>
            <span style={{ fontSize: 12.5, color: "var(--ink-600)" }}>{a.submittedAt || "—"}</span>
            <span style={{ fontSize: 12.5 }}>
              {a.status === "graded" ? (
                <span className="badge badge--good badge--dot">완료</span>
              ) : a.submittedAt ? (
                <span className="badge badge--warn badge--dot">{a.estimated ? `${a.estimated} 예정` : "대기"}</span>
              ) : (
                <span className="badge">미제출</span>
              )}
            </span>
            <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>
              {a.status === "graded" ? <>{a.score} <span style={{ color: "var(--ink-400)", fontWeight: 400 }}>/ {a.total}</span></> :
                <span style={{ color: "var(--ink-400)", fontWeight: 400 }}>—</span>}
            </span>
            <Icon.chevR width="14" height="14" style={{ color: "var(--ink-400)" }} />
          </div>
        ))}
      </div>
    </>
  );
}

export function StudentFeedback({ assignment, student, onSubmitAssignment, onAppeal, onOpenResource }) {
  const a = assignment;
  const isGraded = a.status === "graded";
  const isSubmitted = Boolean(a.submittedAt);

  return (
    <>
      <Shell.Crumbs trail={[a.course, "과제", a.title]} />
      <h1 style={{ margin: "4px 0 4px", fontSize: 24, fontWeight: 700, letterSpacing: "-0.015em" }}>{a.title}</h1>
      <div style={{ fontSize: 13, color: "var(--ink-600)" }}>과제</div>

      {isGraded ? (
        <div className="s-hero mt-16" style={{ marginTop: 16 }}>
          <div className="check"><Icon.check width="18" height="18" /></div>
          <div>
            <div className="title">채점 완료</div>
            <div className="sub">{a.gradedAt || '채점 시각 없음'} · {a.grader || '채점자 정보 없음'}</div>
          </div>
          <div className="right">제출: {a.submittedAt}</div>
        </div>
      ) : isSubmitted ? (
        <div className="s-hero pending mt-16" style={{ marginTop: 16 }}>
          <div className="check"><Icon.refresh width="16" height="16" /></div>
          <div>
            <div className="title">채점 대기 중</div>
            <div className="sub">AI 채점 보조가 동작 중입니다</div>
          </div>
          <div className="right">제출: {a.submittedAt}</div>
        </div>
      ) : (
        <div className="s-hero pending mt-16" style={{ marginTop: 16 }}>
          <div className="check"><Icon.file width="16" height="16" /></div>
          <div>
            <div className="title">제출 전</div>
            <div className="sub">아직 제출된 과제물이 없습니다</div>
          </div>
          <div className="right">마감: {a.deadline || '미정'}</div>
        </div>
      )}

      <div className="s-layout mt-16" style={{ marginTop: 16 }}>
        <div>
          {/* Score breakdown — only for graded */}
          {isGraded ? <ScoreCard a={a} /> : isSubmitted ? <PendingCard /> : <SubmitAssignmentCard a={a} student={student} onSubmit={onSubmitAssignment} />}

          {/* TA feedback */}
          {isGraded ? <TAFeedback a={a} /> : null}

          {/* AI learning analysis */}
          {isGraded ? <AILearning a={a} /> : null}

          {/* Custom learning plan */}
          {isGraded ? <LearningPlan a={a} onOpenResource={onOpenResource} /> : null}

          {/* Appeal CTA */}
          {isGraded ? (
            <div className="appeal-cta">
              <Icon.flag width="16" height="16" style={{ color: "var(--ink-500)" }} />
              <span>채점 결과에 대한 <strong>이의 신청</strong>은 채점 완료 후 7일 이내 가능합니다.</span>
              <span className="spacer" />
              <button className="btn btn--ghost btn--sm" onClick={onAppeal}>이의 신청 / 재채점 요청</button>
            </div>
          ) : null}
        </div>

        {/* Right side panel */}
        <div className="s-side">
          <SidePanel a={a} />
        </div>
      </div>
    </>
  );
}

function ScoreCard({ a }) {
  const rows = Array.isArray(a.category_scores) ? a.category_scores : [];
  const total = a.total || 10;
  const score = a.score ?? a.final_score ?? 0;
  return (
    <div className="s-score-card">
      <div className="s-score-head">
        <div>
          <span className="s-score-num">{score}</span>
          <span className="s-score-den"> / {total}</span>
          <span className="s-score-pct"> ({Math.round((score / total) * 100)}%)</span>
        </div>
        <div className="s-score-meta">
          <Icon.trending width="14" height="14" /> {a.avg ? `반 평균 ${a.avg}` : '평균 정보 없음'} {a.rank ? `· ${a.rank}` : ''}
        </div>
      </div>

      <div className="s-rubric">
        {rows.length === 0 ? (
          <div className="empty">세부 루브릭 점수가 없습니다.</div>
        ) : rows.map((r, i) => {
          const value = r.score ?? r.v ?? 0;
          const max = r.max_score ?? r.max ?? total;
          return (
            <div key={i} className="s-rubric__row">
              <div className="s-rubric__name">{r.name}</div>
              <div className="s-rubric__pts">{value} / {max}</div>
              <div className="s-rubric__bar">
                <div className="bar">
                  <span style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PendingCard() {
  return (
    <div className="card card-pad mt-16" style={{ marginTop: 16 }}>
      <h3>채점 대기 중</h3>
      <p style={{ color: "var(--ink-600)", fontSize: 13.5, lineHeight: 1.65, marginTop: 6 }}>
        아직 공개된 채점 결과가 없습니다.
      </p>
    </div>
  );
}

function SubmitAssignmentCard({ a, student, onSubmit }) {
  const [file, setFile] = React.useState(null);
  const [content, setContent] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const canSubmit = Boolean(student?.studentName && student?.studentId && (content.trim() || file));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit || typeof onSubmit !== 'function') return;

    setSubmitting(true);
    try {
      await onSubmit({
        studentName: student.studentName,
        studentId: student.studentId,
        fileName: file ? file.name : (a.type === 'code' ? 'submission.py' : 'submission.txt'),
        content: content.trim(),
        file: file,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="card card-pad mt-16" style={{ marginTop: 16 }} onSubmit={handleSubmit}>
      <h3>과제 제출</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
        <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 600 }}>
          이름
          <input
            value={student?.studentName || ''}
            readOnly
            placeholder="학생 이름"
            style={{ padding: "10px 12px", border: "1px solid var(--ink-300)", borderRadius: 6 }}
          />
        </label>
        <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 600 }}>
          학번
          <input
            value={student?.studentId || ''}
            readOnly
            placeholder="학번"
            style={{ padding: "10px 12px", border: "1px solid var(--ink-300)", borderRadius: 6 }}
          />
        </label>
      </div>
      <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 600, marginTop: 12 }}>
        과제 파일 첨부
        <input
          type="file"
          onChange={e => setFile(e.target.files[0] || null)}
          style={{ padding: "8px 12px", border: "1px dashed var(--ink-300)", borderRadius: 6, background: "white", fontSize: 13, cursor: "pointer" }}
        />
      </label>
      <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 600, marginTop: 12 }}>
        제출 내용
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={a.type === 'code' ? 12 : 8}
          placeholder={a.type === 'code' ? '코드를 붙여넣으세요' : '제출 내용을 입력하세요'}
          style={{ padding: "10px 12px", border: "1px solid var(--ink-300)", borderRadius: 6, resize: "vertical", fontFamily: a.type === 'code' ? 'var(--font-mono)' : 'var(--font-sans)' }}
        />
      </label>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
        <button className="btn btn--primary" type="submit" disabled={!canSubmit || submitting}>
          <Icon.send width="14" height="14" /> {submitting ? "제출 중..." : "제출하기"}
        </button>
      </div>
    </form>
  );
}

function TAFeedback({ a }) {
  return (
    <div className="feedback-card mt-16" style={{ marginTop: 16 }}>
      <div className="avatar">남</div>
      <div>
        <div className="who">조교 피드백</div>
        <div className="meta">{a.grader || "채점자 정보 없음"} · {a.gradedAt || "채점 시각 없음"}</div>
        <div className="body">
          {a.taFeedback || a.feedback || "등록된 조교 피드백이 없습니다."}
        </div>
      </div>
    </div>
  );
}

function AILearning({ a }) {
  const strengths = Array.isArray(a.strengths) ? a.strengths : [];
  const weaknesses = Array.isArray(a.weaknesses) ? a.weaknesses : [];
  if (strengths.length === 0 && weaknesses.length === 0) return null;

  return (
    <div className="ai-learning">
      <h3><Icon.spark width="14" height="14" />AI 학습 분석</h3>
      {strengths.length > 0 ? (
        <div className="grp good">
          <h4><Icon.thumbsUp width="13" height="13" /> 잘한 점</h4>
          <ul>{strengths.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </div>
      ) : null}
      {weaknesses.length > 0 ? (
        <div className="grp warn">
          <h4><Icon.alert width="13" height="13" /> 개선할 점</h4>
          <ul>{weaknesses.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </div>
      ) : null}
    </div>
  );
}

function LearningPlan({ a }) {
  const recommendations = Array.isArray(a.learning_recommendations) ? a.learning_recommendations : [];
  const nextSteps = Array.isArray(a.next_steps) ? a.next_steps : [];
  if (recommendations.length === 0 && nextSteps.length === 0) return null;

  return (
    <div className="s-plan">
      <h3><Icon.bolt width="14" height="14" style={{ color: "var(--warn-600)" }} /> 맞춤 학습 방안</h3>
      {recommendations.length > 0 ? (
        <>
          <h4>추천 학습 개념</h4>
          <div className="chips">
            {recommendations.map((item, i) => <span className="tag-chip" key={i}>{item}</span>)}
          </div>
        </>
      ) : null}
      {nextSteps.length > 0 ? (
        <>
          <h4>다음 행동</h4>
          <div className="resources">
            {nextSteps.map((item, i) => (
              <div className="res" key={i}>
                <span className="ico"><Icon.check width="16" height="16" /></span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function SidePanel({ a }) {
  const hasSubmission = Boolean(a.submittedAt);

  return (
    <>
      <div className="panel">
        <h4>제출 정보</h4>
        <dl className="kv">
          <dt>마감</dt><dd>{a.deadline || '미정'}</dd>
          <dt>배점</dt><dd>{a.total || 10}점</dd>
          <dt>제출 유형</dt><dd>{a.type === "code" ? "파일 업로드 (.py)" : "파일 업로드 (.docx)"}</dd>
          <dt>제출일</dt><dd>{a.submittedAt || '미제출'}</dd>
        </dl>
      </div>
      {hasSubmission ? <div className="panel">
        <h4>제출물</h4>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", border: "1px solid var(--ink-200)", borderRadius: 10, background: "var(--paper)" }}>
          <div className="ico" style={{ width: 28, height: 28, background: "var(--ink-150)", borderRadius: 8, display: "grid", placeItems: "center", color: "var(--ink-600)" }}>
            {a.type === "code" ? <Icon.code width="14" height="14" /> : <Icon.doc width="14" height="14" />}
          </div>
          <span style={{ fontFamily: a.type === "code" ? "var(--font-mono)" : "var(--font-sans)", fontSize: 13 }}>
            {a.fileName || a.file_name || '제출 파일 정보 없음'}
          </span>
          <button className="btn btn--quiet btn--sm btn--icon" style={{ marginLeft: "auto" }}><Icon.download width="14" height="14" /></button>
        </div>
        <div style={{ fontSize: 11.5, color: "var(--ink-500)", marginTop: 8 }}>{a.submittedAt} 제출</div>
      </div> : null}
      {a.next ? (
        <div className="panel">
          <h4>다음 과제</h4>
          <div style={{ fontWeight: 600, fontSize: 13.5 }}>{a.next.title}</div>
          <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 4 }}>마감: {a.next.due} · 이번 학습 분석 자동 반영</div>
          <button className="btn btn--ghost btn--sm" style={{ marginTop: 10, width: "100%" }}>
            과제 보기 <Icon.arrowR width="12" height="12" />
          </button>
        </div>
      ) : null}
    </>
  );
}
