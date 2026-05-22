import React from 'react';
import { Icon } from '../icons';

const ESSAY_RUBRIC_ITEMS = [
  { k: 'a', name: '논지의 명확성', max: 3, aliases: ['논지', '명확', '주장', '완성'] },
  { k: 'b', name: '근거의 적절성', max: 3, aliases: ['근거', '자료', '인용', '적절'] },
  { k: 'c', name: '논리적 구성', max: 2, aliases: ['논리', '구성', '구조', '전개'] },
  { k: 'd', name: '문장 표현', max: 2, aliases: ['문장', '표현', '스타일', '가독'] },
];

function parseMaybeJson(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'object') return value;

  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

function asTextList(value) {
  if (!value) return [];

  const items = parseMaybeJson(value);
  if (Array.isArray(items)) {
    return items.map(item => {
      if (typeof item === 'string') return item;
      return item?.title || item?.reason || item?.suggestion || item?.name || item?.message || '';
    }).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value.split(/\r?\n|•|- /).map(item => item.trim()).filter(Boolean);
  }

  if (typeof items === 'object') {
    return Object.values(items).map(item => {
      if (typeof item === 'string') return item;
      return item?.title || item?.reason || item?.suggestion || item?.name || item?.message || '';
    }).filter(Boolean);
  }

  return [];
}

function normalizeScore(value) {
  if (value == null || value === '') return null;
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return null;
  return +(numberValue > 10 ? numberValue / 10 : numberValue).toFixed(1);
}

function clampScore(value, max) {
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return 0;
  return +Math.min(Math.max(numberValue, 0), max).toFixed(1);
}

function firstScore(...values) {
  for (const value of values) {
    const score = normalizeScore(value);
    if (score != null) return score;
  }
  return 0;
}

function scoreMapFromCategories(categoryScores, fallbackTotal) {
  const next = Object.fromEntries(ESSAY_RUBRIC_ITEMS.map(item => [item.k, 0]));
  const rawCategories = parseMaybeJson(categoryScores);
  const categories = Array.isArray(rawCategories)
    ? rawCategories
    : rawCategories && typeof rawCategories === 'object'
      ? Object.entries(rawCategories).map(([name, score]) => (
          typeof score === 'object' ? { name, ...score } : { name, score }
        ))
      : [];
  const used = new Set();

  if (categories.length > 0) {
    categories.forEach((category, index) => {
      const name = String(category?.name || category?.title || category?.category || category?.criterion || '').toLowerCase();
      let target = ESSAY_RUBRIC_ITEMS.find(item => item.aliases.some(alias => name.includes(alias.toLowerCase())));
      if (!target) target = ESSAY_RUBRIC_ITEMS[index];
      if (!target || used.has(target.k)) return;

      const rawScore = Number(category?.score ?? category?.value ?? category?.points ?? 0);
      const rawMax = Number(category?.max_score ?? category?.max ?? category?.maxScore ?? target.max);
      const scaled = rawMax && rawMax !== target.max ? (rawScore / rawMax) * target.max : rawScore;
      next[target.k] = clampScore(scaled, target.max);
      used.add(target.k);
    });

    return next;
  }

  const total = firstScore(fallbackTotal);
  ESSAY_RUBRIC_ITEMS.forEach(item => {
    next[item.k] = clampScore((total / 10) * item.max, item.max);
  });
  return next;
}

function sumScores(scores) {
  return +ESSAY_RUBRIC_ITEMS.reduce((sum, item) => sum + Number(scores[item.k] || 0), 0).toFixed(1);
}

function feedbackDraftFrom(student) {
  return student?.taFeedback || student?.ta_feedback || student?.summary || student?.feedback || '';
}

export function GradingEssay({ aiLayout = "right", onApprove, onOpenWarn, onOpenSimilarity, onRegenerate, submissionContent, focusedStudent }) {
  const [tab, setTab] = React.useState("submission");      // submission / ai / similarity
  const [editing, setEditing] = React.useState(false);
  const [tone, setTone] = React.useState("중립");
  const [openPop, setOpenPop] = React.useState("greteQuote"); // null | run.note
  const [scores, setScores] = React.useState({ a: 0, b: 0, c: 0, d: 0 });
  const [final, setFinal] = React.useState(0);
  const [draft, setDraft] = React.useState("");

  React.useEffect(() => {
    if (!focusedStudent) return;

    const nextScores = scoreMapFromCategories(
      focusedStudent.categoryScores || focusedStudent.category_scores,
      focusedStudent.aiScore ?? focusedStudent.ai_score ?? focusedStudent.finalScore ?? focusedStudent.final_score
    );
    const recommended = sumScores(nextScores);
    const persistedFinal = firstScore(focusedStudent.finalScore, focusedStudent.final_score);
    const shouldUsePersistedFinal = focusedStudent.status === 'graded' || persistedFinal > 0;

    setScores(nextScores);
    setFinal(shouldUsePersistedFinal ? persistedFinal : recommended);
    setDraft(feedbackDraftFrom(focusedStudent));
    // Depend on the student id only — `focusedStudent` is recreated each parent render,
    // so depending on the whole object would clobber TA edits on every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedStudent?.id]);

  const [aiChecks, setAiChecks] = React.useState([
    { type: "info", message: "작중 직접 인용 2건 — 모두 원문과 일치 (그레테 3장 발화 / 그레고르 1장 내적 독백)" },
    { type: "info", message: "도입–본론(3층위)–결론 구조 명확 · 단락별 길이 균형 양호" },
    { type: "warn", message: "3문단: 외부 이론(마르크스) 인용에 대한 작품 텍스트 연결 부족" },
    { type: "warn", message: "결론부가 서론에서 제시한 세 층위를 종합하지 못함" },
  ]);

  const aiPanel = (
    <AIPanel
      tab={tab}
      editing={editing}
      setEditing={setEditing}
      scores={scores}
      setScores={setScores}
      tone={tone}
      setTone={setTone}
      draft={draft}
      setDraft={setDraft}
      finalScore={final}
      setFinalScore={setFinal}
      onApprove={onApprove}
      onRegenerate={onRegenerate}
      onOpenWarn={onOpenWarn}
      onOpenSimilarity={onOpenSimilarity}
      aiChecks={aiChecks}
      setAiChecks={setAiChecks}
      focusedStudent={focusedStudent}
    />
  );

  return (
    <div className={"grade-shell " + (aiLayout === "inline" ? "inline-mode" : aiLayout === "floating" ? "floating-mode" : "")}>
      <div className="grade-pane">
        <Tabs tab={tab} setTab={setTab} kind="essay" />

        {tab === "submission" ? (
          <EssaySubmission openPop={openPop} setOpenPop={setOpenPop} essayDoc={submissionContent} focusedStudent={focusedStudent} />
        ) : tab === "ai" ? (
          <>
            <AIAnalysisPane />
            <AIChecks items={aiChecks} />
          </>
        ) : (
          <SimilarityPane onOpenSimilarity={onOpenSimilarity} />
        )}

        {aiLayout === "inline" ? <div className="inline-aipanel">{aiPanel}</div> : null}
      </div>

      {aiLayout === "right" ? (
        <div className="grade-pane">
          {aiPanel}
        </div>
      ) : null}

      {aiLayout === "floating" ? (
        <div className="floating-aipanel">{aiPanel}</div>
      ) : null}
    </div>
  );
}

// ---------- Tabs ----------
function Tabs({ tab, setTab, kind }) {
  const items = kind === "essay"
    ? [
      { k: "submission", lbl: "제출물" },
      { k: "ai", lbl: "AI 분석 보기" },
      { k: "similarity", lbl: "유사도 분석" },
    ]
    : [
      { k: "submission", lbl: "제출물" },
      { k: "ai", lbl: "실행 결과" },
      { k: "similarity", lbl: "유사도 분석" },
    ];
  return (
    <div className="tabs" style={{ marginBottom: 14, background: "var(--white)", borderRadius: "var(--r-lg) var(--r-lg) 0 0", borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
      {items.map(it => (
        <button key={it.k} className={"tabs__btn" + (tab === it.k ? " is-active" : "")} onClick={() => setTab(it.k)}>
          {it.lbl} {it.badge}
        </button>
      ))}
    </div>
  );
}

// ---------- Essay submission body ----------
function EssaySubmission({ openPop, setOpenPop, essayDoc, focusedStudent }) {
  const doc = essayDoc;
  const student = focusedStudent || {};
  if (!doc) {
    return <div className="card card-pad">불러온 제출 내용이 없습니다.</div>;
  }
  return (
    <div className="card">
      <div className="sub-meta">
        <div className="file-ico"><Icon.doc width="16" height="16" /></div>
        <div>
          <div className="title">{doc.filename || `제출물_${student.name || student.no || 'student'}`}</div>
        </div>
        {doc.pages ? <><span className="dot-sep" /><span>{doc.pages}페이지</span></> : null}
        {doc.bytes || doc.characters ? <><span className="dot-sep" /><span>{doc.characters || doc.bytes}자</span></> : null}
        <span className="spacer" />
        <span style={{ fontSize: 12, color: "var(--ink-500)" }}>제출: {student.submittedAt || doc.submittedAt || '-'}</span>
        <button className="btn btn--quiet btn--sm btn--icon"><Icon.download width="16" height="16" /></button>
      </div>

      <div className="essay-body">
        <h1>{doc.title || '제출물'}</h1>
        <div className="byline">{doc.author || `${student.name || '학생'} (${student.no || '-'})`} {doc.course ? `· ${doc.course}` : ''}</div>

        {(doc.paragraphs || []).length === 0 ? (
          <div className="empty">표시할 본문이 없습니다.</div>
        ) : (doc.paragraphs || []).map((p, i) => {
          if (Array.isArray(p)) {
            return (
              <div className="essay-p" key={i}>
                {p.map((r, j) => (
                  <Run key={j} run={r} openPop={openPop} setOpenPop={setOpenPop} />
                ))}
              </div>
            );
          }
          // flagged paragraph
          return (
            <div className="ai-flag-block" key={i}>
              <span className="flag-tag"><Icon.spark width="11" height="11" />{p.flagLabel}</span>
              <div className="essay-p" style={{ marginBottom: 0 }}>
                {(p.runs || []).map((r, j) => <Run key={j} run={r} openPop={openPop} setOpenPop={setOpenPop} />)}
              </div>
            </div>
          );
        })}

        <div className="essay-foot">⋯</div>
      </div>
    </div>
  );
}

function Run({ run, openPop, setOpenPop }) {
  if (run.muted) return <span className="tail">{run.t}</span>;
  if (run.hl) {
    const cls = run.hl === "quote" ? "hl-quote" : run.hl === "source" ? "hl-source" : "hl-flag";
    return (
      <span style={{ position: "relative" }}>
        <span
          className={cls}
          onClick={(e) => { e.stopPropagation(); setOpenPop(openPop === run.note ? null : run.note); }}
        >{run.t}</span>
        {openPop === run.note ? <InlinePop note={run.note} hl={run.hl} onClose={() => setOpenPop(null)} /> : null}
      </span>
    );
  }
  return <span>{run.t}</span>;
}

function InlinePop({ note, hl, onClose }) {
  const data = {
    openingClaim: {
      kind: "AI",
      title: "도입 — 논지 명확",
      body: "‘소외(Entfremdung)를 그려낸 텍스트’라는 도입 논지가 분명하고, 본문 3문단의 구조와 일관되게 호응합니다. 핵심 키워드로 사용된 ‘소외’의 사용 빈도는 본문 14회로, 텍스트 응집도가 높습니다."
    },
    greteQuote: {
      kind: "인용 검증",
      title: "인용 검증 결과",
      body: "해당 인용에 대한 검증 결과가 표시됩니다."
    },
  }[note];
  if (!data) return null;
  return (
    <div className="inline-pop" style={{ top: 28, left: -8 }} onClick={e => e.stopPropagation()}>
      <div className="inline-pop__hd">
        <Icon.spark width="11" height="11" />
        <span>{data.kind} · {data.title}</span>
      </div>
      <div className="inline-pop__bd">{data.body}</div>
      <div className="pop-actions">
        <button className="btn btn--ghost btn--sm"><Icon.edit width="12" height="12" /> 코멘트 달기</button>
        <button className="btn btn--quiet btn--sm" style={{ marginLeft: "auto" }} onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}

// ---------- AI checks block (under essay) ----------
function AIChecks({ items = [] }) {
  return (
    <div className="card mt-16" style={{ marginTop: 16 }}>
      <div className="checks">
        <div className="checks__hd">
          <Icon.spark width="14" height="14" style={{ color: "var(--ai-700)" }} />
          <strong>AI 인용·논리 검증</strong>
          <span className="spacer" />
          <span className="summary">총 {items.length}개 항목 점검 · 방금 전</span>
        </div>
        {items.map((item, idx) => {
          const isWarn = item.type === "warn";
          const isBad = item.type === "bad";
          return (
            <div key={idx} className={`check${isWarn ? " warn" : isBad ? " bad" : ""}`}>
              <span className="ico">
                {isWarn || isBad ? <Icon.alert width="14" height="14" /> : <Icon.check width="14" height="14" />}
              </span>
              <span>{item.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- AI analysis tab ----------
function AIAnalysisPane() {
  return (
    <div className="card card-pad">
      <h3>AI 상세 분석</h3>
      <p style={{ color: "var(--ink-600)", fontSize: 13, marginTop: 6 }}>
        이 화면은 인용 검증, 논지 일관성, 표현 다양성 등을 AI가 단락 단위로 분석한 보고서입니다. 학생에게는 노출되지 않습니다.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
        <Metric label="단락 응집도" v="0.81" hint="문장 간 의미 유사도 / 0–1" tone="good" />
        <Metric label="어휘 다양성" v="0.62" hint="TTR · 동일 학년 평균 0.58" />
        <Metric label="문법 오류 후보" v="2건" hint="‘만연한’ → ‘만연된’ 등" tone="warn" />
        <Metric label="평균 문장 길이" v="42자" hint="과제 평균 38자" />
      </div>

      <h3 style={{ marginTop: 22 }}>단락별 점수 기여도</h3>
      <div style={{ marginTop: 10 }}>
        {[
          { name: "1문단 (도입)", w: 90, color: "var(--good-500)", note: "논지 명료" },
          { name: "2문단 (가족 내 소외)", w: 88, color: "var(--good-500)", note: "그레테 인용 검증 통과" },
          { name: "3문단 (노동 소외)", w: 52, color: "var(--warn-500)", note: "외부 이론 인용 / 작품 연결 부족" },
          { name: "4문단 (자아 소외, 미완)", w: 65, color: "var(--ai-500)", note: "전개 중 — 자료 부족" },
        ].map((r, i) => (
          <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid var(--ink-150)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span>{r.name}</span>
              <span style={{ color: "var(--ink-500)" }}>{r.note}</span>
            </div>
            <div className="bar" style={{ marginTop: 6 }}>
              <span style={{ width: r.w + "%", background: r.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, v, hint, tone }) {
  return (
    <div style={{ padding: 14, background: "var(--paper)", border: "1px solid var(--ink-200)", borderRadius: 10 }}>
      <div style={{ fontSize: 11.5, color: "var(--ink-600)" }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4, color: tone === "good" ? "var(--good-700)" : tone === "warn" ? "var(--warn-700)" : "var(--ink-900)" }}>{v}</div>
      <div style={{ fontSize: 11, color: "var(--ink-500)", marginTop: 2 }}>{hint}</div>
    </div>
  );
}

// ---------- Similarity tab ----------
function SimilarityPane({ onOpenSimilarity }) {
  return (
    <div className="card card-pad">
      <h3>학생 간 유사도 분석</h3>
      <p style={{ color: "var(--ink-600)", fontSize: 13, marginTop: 6 }}>
        실제 유사도 분석 결과가 있을 때 표시됩니다.
      </p>
      <div className="empty" style={{ marginTop: 16 }}>표시할 유사도 분석 결과가 없습니다.</div>
      <div style={{ marginTop: 16, display: "none" }}>
        {[
        ].map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr auto", gap: 16, alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--ink-150)" }}>
            <div>
              <div style={{ fontWeight: 600 }}>{r.name}</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-500)" }}>겹치는 문장 {r.common}건 — 마르크스 소외 개념 일반론 부분</div>
            </div>
            <div className="q-meter">
              <div className={"bar" + (r.tone ? " warn" : "")}><span style={{ width: `${r.sim * 6}%` }} /></div>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{r.sim}%</span>
            </div>
            <button className="btn btn--ghost btn--sm" onClick={onOpenSimilarity}>나란히 보기 <Icon.arrowR width="12" height="12" /></button>
          </div>
        ))}
        <div className="card" style={{ marginTop: 14, padding: 14, background: "var(--good-50)", border: "1px solid var(--good-100)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--good-700)", fontSize: 13 }}>
            <Icon.check width="16" height="16" />
            <strong>판정: 정상 범위</strong>
            <span style={{ color: "var(--ink-600)", fontWeight: 400 }}>같은 학습 자료를 참고한 결과로 보이며, 표절 의심도는 낮습니다.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- AI panel (right column) ----------
function AIPanel({
  tab, editing, setEditing,
  scores, setScores, tone, setTone,
  draft, setDraft,
  finalScore, setFinalScore, onApprove, onRegenerate, onOpenWarn, onOpenSimilarity,
  aiChecks, setAiChecks, focusedStudent,
}) {
  const [regenerating, setRegenerating] = React.useState(false);
  const aiRecommended = sumScores(scores);
  const sameAsAI = Math.abs(aiRecommended - Number(finalScore || 0)) < 0.05;
  const rubricItems = ESSAY_RUBRIC_ITEMS;
  const [strengths, setStrengths] = React.useState([]);
  const [weaknesses, setWeaknesses] = React.useState([]);

  React.useEffect(() => {
    setStrengths(asTextList(focusedStudent?.strengths));
    const nextWeaknesses = asTextList(focusedStudent?.weaknesses);
    setWeaknesses(nextWeaknesses.length > 0 ? nextWeaknesses : ['등록된 개선 항목이 없습니다']);
  }, [focusedStudent]);

  const handleRegenerate = async () => {
    if (!onRegenerate || regenerating) return;

    setRegenerating(true);
    try {
      const response = await onRegenerate("중립");
      if (response) {
        try {
          // JSON 파싱 시도
          const data = typeof response === 'string' ? JSON.parse(response) : response;
          const nextDraft = data.ta_feedback || data.feedback || data.summary;
          if (nextDraft) setDraft(nextDraft);
          if (data.score !== undefined || data.final_score !== undefined || data.ai_score !== undefined) {
            setFinalScore(firstScore(data.final_score, data.score, data.ai_score));
          }
          if (data.strengths) setStrengths(asTextList(data.strengths));
          if (data.weaknesses) setWeaknesses(asTextList(data.weaknesses));
          if (data.aiChecks && Array.isArray(data.aiChecks)) setAiChecks(data.aiChecks);
          if (data.categoryScores || data.category_scores) {
            const nextScores = scoreMapFromCategories(data.categoryScores || data.category_scores, data.score || data.ai_score);
            setScores(nextScores);
            if (data.final_score === undefined && data.score === undefined) setFinalScore(sumScores(nextScores));
          }
        } catch (e) {
          // 파싱 실패 시 일반 텍스트 피드백으로 취급
          setDraft(response);
        }
      }
    } finally {
      setRegenerating(false);
    }
  };

  const buildApproval = () => ({
    finalScore,
    aiScore: aiRecommended,
    taFeedback: draft,
    tone,
    scoreScale: 10,
    categoryScores: rubricItems.map(item => ({
      name: item.name,
      score: scores[item.k],
      max_score: item.max,
    })),
  });

  return (
    <div className="aipanel">
      <div className="aipanel__hd">
        <Icon.spark width="14" height="14" style={{ color: "var(--ai-700)" }} />
        <h3>AI 채점 보조</h3>
      </div>

      <div className="aiscore">
        <span className="aiscore__lbl">추천 점수</span>
        <span className="aiscore__big">{aiRecommended.toFixed(1)}</span>
        <span className="aiscore__den">/ 10</span>
      </div>

      <div className="rubric">
        {rubricItems.map(r => (
          <div key={r.k} className={"rubric__row" + (editing ? " editing" : "")}>
            <span className="name">{r.name}</span>
            {editing ? (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  className="pts-input"
                  type="number" step="0.5" min="0" max={r.max}
                  value={scores[r.k]}
                  onChange={e => setScores({ ...scores, [r.k]: +e.target.value })}
                />
                <span style={{ color: "var(--ink-500)", fontSize: 12 }}>/ {r.max}</span>
              </span>
            ) : (
              <span className={"pts" + (r.warn ? " warn" : "")}>
                {scores[r.k]} <span style={{ color: "var(--ink-400)", fontWeight: 400 }}>/ {r.max}</span>
              </span>
            )}
          </div>
        ))}
      </div>

      {strengths.length > 0 && (
        <div className="aibox good" style={{ marginTop: 14 }}>
          <h4><Icon.thumbsUp width="13" height="13" /> 강점</h4>
          <ul>
            {strengths.map((s, idx) => <li key={idx}>{s}</li>)}
          </ul>
        </div>
      )}
      {weaknesses.length > 0 && (
        <div className="aibox warn">
          <h4><Icon.alert width="13" height="13" /> 약점</h4>
          <ul>
            {weaknesses.map((w, idx) => <li key={idx}>{w}</li>)}
          </ul>
        </div>
      )}

      <div className="aimeta">
        <div className="aimeta__cell" style={{ background: "var(--warn-50)", borderColor: "var(--warn-100)" }}>
          <div className="lbl"><Icon.spark width="12" height="12" /> AI 작성 의심도</div>
          <div className="val">
            28%
            <span className="badge badge--warn" style={{ height: 20, fontSize: 11 }}>검토 권장</span>
          </div>
          <div className="hint">3문단의 일반론 톤이 LLM 산출물 패턴과 유사 ·
            <button className="btn btn--quiet btn--sm" onClick={onOpenWarn} style={{ padding: 0, height: "auto", color: "var(--warn-700)", textDecoration: "underline" }}>상세 보기</button>
          </div>
        </div>
        <div className="aimeta__cell">
          <div className="lbl"><Icon.users width="12" height="12" /> 학생 간 유사도</div>
          <div className="val">
            9%
            <span className="badge badge--good" style={{ height: 20, fontSize: 11 }}>정상</span>
          </div>
          <div className="hint">28명 중 최대 유사 8.7% ·
            <button className="btn btn--quiet btn--sm" onClick={onOpenSimilarity} style={{ padding: 0, height: "auto", color: "var(--ai-700)", textDecoration: "underline" }}>나란히 보기</button>
          </div>
        </div>
      </div>

      <div className="draft" style={{ marginTop: 14 }}>
        <div className="draft__hd">
          <Icon.msg width="13" height="13" style={{ color: "var(--ink-600)" }} />
          <h4>AI 피드백 초안 <span style={{ fontWeight: 400, color: "var(--ink-500)" }}>(수정 가능)</span></h4>
          <button className="regen" onClick={handleRegenerate} disabled={regenerating}>
            <Icon.refresh width="12" height="12" /> {regenerating ? "재생성 중" : "재생성"}
          </button>
        </div>
        <textarea value={draft} onChange={e => setDraft(e.target.value)} />
      </div>



      <div className="final">
        <span className="final__lbl">최종 점수</span>
        <input className="final__input" type="number" step="0.5" min="0" max="10"
          value={finalScore} onChange={e => setFinalScore(+e.target.value)} />
        <span className="final__den">/ 10</span>
        <span className={"final__same" + (sameAsAI ? "" : " diff")}>
          {sameAsAI ? <><Icon.check width="12" height="12" /> AI 추천과 동일</> : <><Icon.edit width="12" height="12" /> 직접 수정됨</>}
        </span>
      </div>

      <div className="actions-row">
        <button className="btn btn--primary" onClick={() => onApprove && onApprove(buildApproval())}>
          승인 & 다음 학생 <Icon.arrowR width="14" height="14" />
        </button>
        <button className="btn btn--ghost" onClick={() => setEditing(v => !v)}>
          {editing ? "완료" : "수정"}
        </button>
        <button className="btn btn--quiet btn--icon"><Icon.more width="16" height="16" /></button>
      </div>
    </div>
  );
}
