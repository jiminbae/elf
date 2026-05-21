import React from 'react';
import { Icon } from '../icons';
import { Shell } from '../shell';

const EMPTY_FORM = {
  title: '',
  type: 'essay',
  deadline: '',
  description: '',
  rubric: '',
  referenceFile: null,
};

function formatDeadline(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AssignmentsView({ onOpenAssignment, onCreateAssignment, assignments: passedAssignments }) {
  const [showCreate, setShowCreate] = React.useState(false);
  const [form, setForm] = React.useState(EMPTY_FORM);

  const assignments = passedAssignments || [];
  const canSubmit = form.title.trim().length > 0;

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit || typeof onCreateAssignment !== 'function') return;

    onCreateAssignment({
      ...form,
      title: form.title.trim(),
      deadlineLabel: formatDeadline(form.deadline),
    });
    setForm(EMPTY_FORM);
    setShowCreate(false);
  };

  return (
    <>
      <Shell.Crumbs trail={["홈", "과제 및 평가"]} />

      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 4, marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: "-0.015em" }}>과제 및 평가</h1>
        <button className="btn btn--primary" onClick={() => setShowCreate(!showCreate)}>
          <Icon.plus width="16" height="16" style={{ marginRight: 6 }} /> 새 과제 생성
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleSubmit} className="card" style={{ padding: 24, marginBottom: 24, border: "2px solid var(--brand-500)", background: "var(--brand-50)" }}>
          <h2 style={{ marginTop: 0, fontSize: 18, marginBottom: 16 }}>새 과제 생성</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>과제 제목</label>
              <input
                type="text"
                placeholder="과제 제목을 입력하세요"
                value={form.title}
                onChange={e => updateForm('title', e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--ink-300)", borderRadius: 6 }}
              />
            </div>
            
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>과제 유형</label>
                <select
                  value={form.type}
                  onChange={e => updateForm('type', e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--ink-300)", borderRadius: 6 }}
                >
                  <option value="essay">일반 과제 (텍스트/파일)</option>
                  <option value="code">프로그래밍 (코드)</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>마감 기한</label>
                <input
                  type="datetime-local"
                  value={form.deadline}
                  onChange={e => updateForm('deadline', e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--ink-300)", borderRadius: 6 }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>상세 설명</label>
              <textarea
                placeholder="과제에 대한 설명을 입력하세요..."
                rows={4}
                value={form.description}
                onChange={e => updateForm('description', e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--ink-300)", borderRadius: 6, resize: "vertical" }}
              />
            </div>

            <div style={{ background: "var(--ai-50)", padding: 16, borderRadius: 8, border: "1px solid var(--ai-200)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Icon.sparkles width="16" height="16" style={{ color: "var(--ai-600)" }} />
                <strong style={{ color: "var(--ai-700)" }}>AI 채점 보조 기준 설정</strong>
              </div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>평가 루브릭 (AI 가이드라인)</label>
              <textarea
                placeholder="AI가 채점할 때 참고할 기준을 입력하세요"
                rows={3}
                value={form.rubric}
                onChange={e => updateForm('rubric', e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--ai-300)", borderRadius: 6, resize: "vertical", marginBottom: 12 }}
              />
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>기준 파일 (정답 코드, 가이드라인 등)</label>
              <input
                type="file"
                onChange={e => updateForm('referenceFile', e.target.files[0] || null)}
                style={{ width: "100%", padding: "8px", border: "1px dashed var(--ai-400)", borderRadius: 6, background: "white", fontSize: 13, cursor: "pointer" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <button type="button" className="btn btn--ghost" onClick={() => { setShowCreate(false); setForm(EMPTY_FORM); }}>취소</button>
              <button type="submit" className="btn btn--primary" disabled={!canSubmit}>생성하기</button>
            </div>
          </div>
        </form>
      )}

      <h2 style={{ fontSize: 16, marginBottom: 16 }}>진행 중인 과제</h2>
      {assignments.length === 0 ? (
        <div className="card" style={{ padding: 24, color: "var(--ink-600)" }}>
          n8n 또는 Supabase에서 불러온 과제가 없습니다.
        </div>
      ) : (
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
        {assignments.map(a => (
          <div 
            key={a.id} 
            className="card" 
            style={{ padding: 20, cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }}
            onClick={() => onOpenAssignment(a.id)}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.08)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 13, color: "var(--ink-500)", marginBottom: 4 }}>{a.course}</div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{a.title}</h3>
              </div>
              <span className="badge badge--ai badge--dot">AI 채점 켜짐</span>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 13, color: "var(--ink-600)" }}>
              <span>마감: {a.deadline || '미정'}</span>
              <span style={{ color: "var(--ink-300)" }}>·</span>
              <span>제출 현황: {a.graded || 0} / {a.total || 0} 명</span>
            </div>
            
            <div className="bar" style={{ marginTop: 12 }}>
              <span style={{ width: `${a.total ? ((a.graded || 0) / a.total) * 100 : 0}%` }} />
            </div>
          </div>
        ))}
      </div>
      )}
    </>
  );
}
