/* global React, Icon, MOCK */

// ============================================================
// TA grading — essay (감상문) screen
// ============================================================
function GradingEssay({ aiLayout = "right", onApprove, onOpenWarn, onOpenSimilarity }) {
  const [tab, setTab] = React.useState("submission");      // submission / ai / similarity
  const [editing, setEditing] = React.useState(false);
  const [tone, setTone] = React.useState("중립");
  const [openPop, setOpenPop] = React.useState("greteQuote"); // null | run.note
  const [scores, setScores] = React.useState({ a: 2.5, b: 2, c: 1.5, d: 1.5 });
  const [final, setFinal] = React.useState(7.5);
  const [draft, setDraft] = React.useState(
    "카프카 「변신」의 핵심 주제인 소외를 가족·노동·자아의 세 층위로 정리한 구조가 명확합니다. 특히 2문단에서 그레테의 발화를 직접 인용해 가족 내 소외를 분석한 부분이 인상적이에요. 다만 3문단의 노동 소외 분석은 마르크스 이론을 일반론으로만 언급하고 있어 작품 텍스트와의 연결이 약합니다. 그레고르의 영업사원 일상이나 회사 지배인의 등장 장면 같은 구체적 텍스트와 연결시켜보면 분석이 한층 깊어질 거예요. 결론에서는 도입부에서 제시한 세 층위를 다시 종합해보면 좋겠습니다."
  );

  const total = +(scores.a + scores.b + scores.c + scores.d).toFixed(1);
  React.useEffect(() => { setFinal(total); }, [total]);

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
      onOpenWarn={onOpenWarn}
      onOpenSimilarity={onOpenSimilarity}
    />
  );

  return (
    <div className={"grade-shell " + (aiLayout === "inline" ? "inline-mode" : aiLayout === "floating" ? "floating-mode" : "")}>
      <div className="grade-pane">
        <Tabs tab={tab} setTab={setTab} kind="essay" />

        {tab === "submission" ? (
          <EssaySubmission openPop={openPop} setOpenPop={setOpenPop} />
        ) : tab === "ai" ? (
          <AIAnalysisPane />
        ) : (
          <SimilarityPane onOpenSimilarity={onOpenSimilarity} />
        )}

        <AIChecks />

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
      { k: "ai", lbl: "AI 분석 보기", badge: <span className="badge badge--ai">3</span> },
      { k: "similarity", lbl: "유사도 분석" },
    ]
    : [
      { k: "submission", lbl: "제출물" },
      { k: "ai", lbl: "실행 결과", badge: <span className="badge badge--good">4/5</span> },
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
function EssaySubmission({ openPop, setOpenPop }) {
  const { ESSAY_DOC } = MOCK;
  return (
    <div className="card">
      <div className="sub-meta">
        <div className="file-ico"><Icon.doc width="16" height="16" /></div>
        <div>
          <div className="title">변신_감상문_정성훈.docx</div>
        </div>
        <span className="dot-sep" />
        <span>3페이지</span>
        <span className="dot-sep" />
        <span>1,834자</span>
        <span className="spacer" />
        <span style={{ fontSize: 12, color: "var(--ink-500)" }}>제출: 5월 22일 오후 9:14</span>
        <button className="btn btn--quiet btn--sm btn--icon"><Icon.download width="16" height="16" /></button>
      </div>

      <div className="essay-body">
        <h1>{ESSAY_DOC.title}</h1>
        <div className="byline">{ESSAY_DOC.author} · {ESSAY_DOC.course}</div>

        {ESSAY_DOC.paragraphs.map((p, i) => {
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
                {p.runs.map((r, j) => <Run key={j} run={r} openPop={openPop} setOpenPop={setOpenPop} />)}
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
      title: "원문과 일치 — 그레테 발화",
      body: "「변신」 3장 후반부 그레테의 발화와 일치합니다. 인용 위치·맥락 모두 정확하게 사용되었고, 출처 표기는 누락되어 있으나 본문 흐름상 문제 없음."
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
function AIChecks() {
  return (
    <div className="card mt-16">
      <div className="checks">
        <div className="checks__hd">
          <Icon.spark width="14" height="14" style={{ color: "var(--ai-700)" }} />
          <strong>AI 인용·논리 검증</strong>
          <span className="spacer" />
          <span className="summary">총 4개 항목 점검 · 23초 전</span>
        </div>
        <div className="check"><span className="ico"><Icon.check width="14" height="14" /></span><span>작중 직접 인용 2건 — 모두 원문과 일치 (그레테 3장 발화 / 그레고르 1장 내적 독백)</span></div>
        <div className="check"><span className="ico"><Icon.check width="14" height="14" /></span><span>도입–본론(3층위)–결론 구조 명확 · 단락별 길이 균형 양호</span></div>
        <div className="check warn"><span className="ico"><Icon.alert width="14" height="14" /></span><span>3문단: 외부 이론(마르크스) 인용에 대한 작품 텍스트 연결 부족</span></div>
        <div className="check warn"><span className="ico"><Icon.alert width="14" height="14" /></span><span>결론부가 서론에서 제시한 세 층위를 충분히 종합하지 못함</span></div>
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
        같은 분반(28명) 내에서 문장·단락 단위 유사도가 9% 이상인 학생만 표시합니다.
      </p>
      <div style={{ marginTop: 16 }}>
        {[
          { name: "강하늘 (학생 6)", sim: 8.7, common: 1, tone: "warn" },
          { name: "윤예진 (학생 7)", sim: 6.2, common: 1, tone: "" },
          { name: "백나연 (학생 12)", sim: 5.8, common: 1, tone: "" },
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
  finalScore, setFinalScore, onApprove, onOpenWarn, onOpenSimilarity,
}) {
  const aiRecommended = +(scores.a + scores.b + scores.c + scores.d).toFixed(1);
  const sameAsAI = finalScore === aiRecommended;

  return (
    <div className="aipanel">
      <div className="aipanel__hd">
        <Icon.spark width="14" height="14" style={{ color: "var(--ai-700)" }} />
        <h3>AI 채점 보조</h3>
        <span className="model">Claude Sonnet 4.6</span>
      </div>

      <div className="aiscore">
        <span className="aiscore__lbl">추천 점수</span>
        <span className="aiscore__big">{aiRecommended.toFixed(1)}</span>
        <span className="aiscore__den">/ 10</span>
        <span className="aiscore__delta">↗ 반평균 대비 +0.1</span>
      </div>

      <div className="rubric">
        {[
          { k: "a", name: "논지의 명확성", max: 3 },
          { k: "b", name: "근거의 적절성", max: 3, warn: true },
          { k: "c", name: "논리적 구성", max: 2 },
          { k: "d", name: "문장 표현", max: 2 },
        ].map(r => (
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

      <div className="aibox good" style={{ marginTop: 14 }}>
        <h4><Icon.thumbsUp width="13" height="13" /> 강점</h4>
        <ul>
          <li>소외를 가족·노동·자아 세 층위로 정리한 구조가 명확함</li>
          <li>2문단에서 그레테의 발화를 직접 인용해 분석을 뒷받침함</li>
        </ul>
      </div>
      <div className="aibox warn">
        <h4><Icon.alert width="13" height="13" /> 약점</h4>
        <ul>
          <li>3문단: 마르크스 이론을 일반론으로만 인용, 작품 텍스트와 연결 약함</li>
          <li>결론이 도입부에서 제시한 세 층위를 충분히 종합하지 못함</li>
        </ul>
      </div>

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
          <button className="regen"><Icon.refresh width="12" height="12" /> 재생성</button>
        </div>
        <textarea value={draft} onChange={e => setDraft(e.target.value)} />
      </div>

      <div className="tone-row">
        {["격려 톤", "중립", "엄격"].map(t => (
          <button key={t} className={"tone " + (tone === t ? "is-active" : "")} onClick={() => setTone(t)}>{t}</button>
        ))}
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
        <button className="btn btn--primary" onClick={onApprove}>
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

window.GradingEssay = GradingEssay;
