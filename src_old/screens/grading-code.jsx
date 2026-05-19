/* global React, Icon, MOCK */

// ============================================================
// TA grading — code (스택 구현) screen
// ============================================================
function GradingCode({ aiLayout = "right", onApprove }) {
  const [tab, setTab] = React.useState("submission");
  const [tone, setTone] = React.useState("중립");
  const [editing, setEditing] = React.useState(false);
  const [openLineComment, setOpenLineComment] = React.useState(7);
  const [runOpen, setRunOpen] = React.useState(true);
  const [scores, setScores] = React.useState({ a: 4, b: 1, c: 2, d: 0.5 });
  const [final, setFinal] = React.useState(7.5);
  const [draft, setDraft] = React.useState(
    "스택의 기본 구조는 정확하게 구현했어요. push, peek 메서드도 잘 동작합니다. 다만 pop 메서드에서 빈 스택일 때의 예외 처리가 빠져있어 IndexError가 발생할 수 있고, 시간복잡도 측면에서도 개선 여지가 있어요. 다음 과제에서는 예외 케이스도 함께 고려해보세요."
  );

  const total = +(scores.a + scores.b + scores.c + scores.d).toFixed(1);
  React.useEffect(() => { setFinal(total); }, [total]);

  const aiPanel = (
    <CodeAIPanel
      editing={editing} setEditing={setEditing}
      scores={scores} setScores={setScores}
      tone={tone} setTone={setTone}
      draft={draft} setDraft={setDraft}
      final={final} setFinal={setFinal}
      onApprove={onApprove}
    />
  );

  return (
    <div className={"grade-shell " + (aiLayout === "inline" ? "inline-mode" : aiLayout === "floating" ? "floating-mode" : "")}>
      <div className="grade-pane">
        <CodeTabs tab={tab} setTab={setTab} />

        {tab === "submission" ? (
          <>
            <CodeFileMeta />
            <CodeBody openLineComment={openLineComment} setOpenLineComment={setOpenLineComment} />
            <RunResults open={runOpen} setOpen={setRunOpen} />
          </>
        ) : tab === "ai" ? (
          <ExecResults />
        ) : (
          <CodeSimilarity />
        )}

        {aiLayout === "inline" ? <div className="inline-aipanel">{aiPanel}</div> : null}
      </div>

      {aiLayout === "right"    ? <div className="grade-pane">{aiPanel}</div> : null}
      {aiLayout === "floating" ? <div className="floating-aipanel">{aiPanel}</div> : null}
    </div>
  );
}

function CodeTabs({ tab, setTab }) {
  return (
    <div className="tabs" style={{ marginBottom: 14, background: "var(--white)", borderRadius: 0 }}>
      <button className={"tabs__btn" + (tab === "submission" ? " is-active" : "")} onClick={() => setTab("submission")}>제출물</button>
      <button className={"tabs__btn" + (tab === "ai" ? " is-active" : "")} onClick={() => setTab("ai")}>
        실행 결과 <span className="badge badge--good">4 / 5</span>
      </button>
      <button className={"tabs__btn" + (tab === "similarity" ? " is-active" : "")} onClick={() => setTab("similarity")}>유사도 분석</button>
    </div>
  );
}

function CodeFileMeta() {
  return (
    <div className="card" style={{ borderRadius: "var(--r-lg) var(--r-lg) 0 0", borderBottom: 0 }}>
      <div className="sub-meta" style={{ borderRadius: "var(--r-lg) var(--r-lg) 0 0" }}>
        <div className="file-ico"><Icon.code width="16" height="16" /></div>
        <div className="title" style={{ fontFamily: "var(--font-mono)" }}>stack.py</div>
        <span className="dot-sep" />
        <span>14 lines</span>
        <span className="dot-sep" />
        <span>287 bytes</span>
        <span className="spacer" />
        <span style={{ fontSize: 12, color: "var(--ink-500)" }}>제출: 5월 22일 오후 3:42</span>
        <button className="btn btn--quiet btn--sm btn--icon"><Icon.download width="16" height="16" /></button>
      </div>
    </div>
  );
}

// ---------- Code body with token coloring + line comments ----------
function CodeBody({ openLineComment, setOpenLineComment }) {
  const { CODE_SUBMISSION } = MOCK;
  const colorFor = (c) => c ? "code-tok-" + c : "";

  return (
    <div className="code-card" style={{ borderRadius: 0 }}>
      {CODE_SUBMISSION.lines && /* render line by line */ null}
      {CODE_SUBMISSION.tokens.map((line, i) => {
        const lineNo = i + 1;
        if (line.flag) {
          return (
            <div key={i}>
              <div className="code-line flagged">
                <span className="code-line__num">{lineNo}</span>
                <span className="code-line__code">
                  {line.toks.map((tok, j) => (
                    <span key={j} className={colorFor(tok.c)}>{tok.t}</span>
                  ))}
                  <span className="ai-callout"
                    onClick={() => setOpenLineComment(openLineComment === lineNo ? null : lineNo)}
                    style={{ cursor: "pointer" }}
                  >
                    ← AI: {line.flagLabel.replace("AI: ", "")}
                  </span>
                </span>
              </div>
              {openLineComment === lineNo ? (
                <LineComment line={lineNo} onClose={() => setOpenLineComment(null)} />
              ) : null}
            </div>
          );
        }
        // comment lines (#)
        const isComment = line.length === 1 && line[0].c === "cmt";
        return (
          <div key={i} className="code-line">
            <span className="code-line__num">{lineNo}</span>
            <span className="code-line__code">
              {isComment
                ? <span className="code-tok-cmt">{line[0].t}</span>
                : line.map((tok, j) => <span key={j} className={colorFor(tok.c)}>{tok.t}</span>)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function LineComment({ line, onClose }) {
  return (
    <div style={{
      background: "var(--warn-50)",
      borderLeft: "3px solid var(--warn-500)",
      padding: "14px 18px 14px 60px",
      borderRadius: "0 0 0 0",
      fontFamily: "var(--font-sans)",
      fontSize: 13,
      position: "relative",
    }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <div style={{
          width: 28, height: 28, borderRadius: 99,
          background: "var(--ai-100)", color: "var(--ai-700)",
          display: "grid", placeItems: "center", flexShrink: 0,
        }}>
          <Icon.spark width="14" height="14" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
            <strong style={{ color: "var(--warn-700)", whiteSpace: "nowrap" }}>AI · 빈 스택 검증 누락</strong>
            <span style={{ fontSize: 11.5, color: "var(--ink-500)", whiteSpace: "nowrap" }}>{line}번 줄 · 신뢰도 92%</span>
            <button className="btn btn--quiet btn--sm" style={{ marginLeft: "auto" }} onClick={onClose}>닫기</button>
          </div>
          <p style={{ margin: "6px 0", color: "var(--ink-800)" }}>
            <code style={{ fontFamily: "var(--font-mono)", background: "var(--white)", padding: "1px 6px", borderRadius: 4, border: "1px solid var(--ink-200)" }}>self.items.pop()</code>
            은 리스트가 비어있을 때 <code style={{ fontFamily: "var(--font-mono)", background: "var(--white)", padding: "1px 6px", borderRadius: 4, border: "1px solid var(--ink-200)" }}>IndexError</code> 를 발생시킵니다. 자료구조의 일반적인 관례에 따라 <code style={{ fontFamily: "var(--font-mono)", background: "var(--white)", padding: "1px 6px", borderRadius: 4, border: "1px solid var(--ink-200)" }}>IsEmpty</code> 체크 후 <code style={{ fontFamily: "var(--font-mono)", background: "var(--white)", padding: "1px 6px", borderRadius: 4, border: "1px solid var(--ink-200)" }}>raise</code> 처리를 권장합니다.
          </p>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <button className="btn btn--ghost btn--sm"><Icon.copy width="12" height="12" /> 학생에게 코멘트로 추가</button>
            <button className="btn btn--quiet btn--sm">개선 코드 보기</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RunResults({ open, setOpen }) {
  return (
    <div className="runres">
      <div className="runres__hd" onClick={() => setOpen(!open)}>
        <Icon.bracket width="14" height="14" />
        <strong>실행 결과 (자동 채점)</strong>
        <span className="spacer" />
        <span className="pass"><Icon.check width="12" height="12" /> 통과 4 / 5</span>
        <Icon.chevD width="14" height="14" style={{ transform: open ? "" : "rotate(-90deg)", transition: "transform .15s" }} />
      </div>
      {open ? (
        <div className="runres__body">
          <div className="runres__row ok"><span className="ico"><Icon.check width="14" height="14" /></span><span>push 정상 동작</span></div>
          <div className="runres__row ok"><span className="ico"><Icon.check width="14" height="14" /></span><span>peek 정상 동작</span></div>
          <div className="runres__row ok"><span className="ico"><Icon.check width="14" height="14" /></span><span>pop 정상 동작 (정상 케이스)</span></div>
          <div className="runres__row fail"><span className="ico">✗</span><span>pop on empty stack → IndexError</span></div>
          <div className="runres__row ok"><span className="ico"><Icon.check width="14" height="14" /></span><span>사용 예시 출력 일치</span></div>
        </div>
      ) : null}
    </div>
  );
}

function ExecResults() {
  return (
    <div className="card card-pad">
      <h3>실행 결과 상세</h3>
      <p style={{ color: "var(--ink-600)", fontSize: 13, marginTop: 6 }}>샌드박스 환경에서 5개 테스트 케이스를 실행했습니다. (Python 3.11 · 0.24s)</p>
      <div className="mt-16" style={{ display: "grid", gap: 10 }}>
        {[
          { name: "test_push_appends", st: "ok", ms: 4, out: "→ items == [1, 2, 3]" },
          { name: "test_peek_no_mutate", st: "ok", ms: 3, out: "→ peek() == 3, items 그대로" },
          { name: "test_pop_returns_top", st: "ok", ms: 3, out: "→ pop() == 3" },
          { name: "test_pop_empty_raises_custom", st: "fail", ms: 5, out: "IndexError: pop from empty list — 사용자 정의 예외 미발생" },
          { name: "test_usage_example_stdout", st: "ok", ms: 12, out: "→ stdout == '2\\n'" },
        ].map((t, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "24px 1fr auto", gap: 10, padding: 12,
            background: t.st === "fail" ? "#fdf3f3" : "var(--paper)",
            border: `1px solid ${t.st === "fail" ? "var(--bad-100)" : "var(--ink-200)"}`,
            borderRadius: 10 }}>
            <span style={{ color: t.st === "fail" ? "var(--bad-700)" : "var(--good-600)" }}>
              {t.st === "fail" ? "✗" : <Icon.check width="16" height="16" />}
            </span>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-900)" }}>{t.name}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: t.st === "fail" ? "var(--bad-700)" : "var(--ink-600)", marginTop: 2 }}>{t.out}</div>
            </div>
            <span style={{ fontSize: 11.5, color: "var(--ink-500)" }}>{t.ms}ms</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CodeSimilarity() {
  return (
    <div className="card card-pad">
      <h3>코드 유사도 — 토큰 기반</h3>
      <p style={{ color: "var(--ink-600)", fontSize: 13, marginTop: 6 }}>
        같은 분반(15명) 내에서 정규화된 토큰 시퀀스 유사도가 30% 이상인 학생을 표시합니다.
      </p>
      <div className="empty">유사도 30% 이상 사례 없음 · 표준적인 스택 구현 패턴을 따른 결과로 보입니다.</div>
    </div>
  );
}

// ---------- AI panel for code ----------
function CodeAIPanel({
  editing, setEditing, scores, setScores, tone, setTone,
  draft, setDraft, final, setFinal, onApprove
}) {
  const ai = +(scores.a + scores.b + scores.c + scores.d).toFixed(1);
  const same = ai === final;
  return (
    <div className="aipanel">
      <div className="aipanel__hd">
        <Icon.spark width="14" height="14" style={{ color: "var(--ai-700)" }} />
        <h3>AI 채점 보조</h3>
        <span className="model">Claude Sonnet 4.6</span>
      </div>

      <div className="aiscore">
        <span className="aiscore__lbl">추천 점수</span>
        <span className="aiscore__big">{ai.toFixed(1)}</span>
        <span className="aiscore__den">/ 10</span>
        <span className="aiscore__delta">↗ 반평균 대비 +0.3</span>
      </div>

      <div className="rubric">
        {[
          { k: "a", name: "기능 구현", max: 5 },
          { k: "b", name: "예외 처리", max: 2, warn: true },
          { k: "c", name: "코드 스타일", max: 2 },
          { k: "d", name: "시간복잡도", max: 1, warn: true },
        ].map(r => (
          <div key={r.k} className={"rubric__row" + (editing ? " editing" : "")}>
            <span className="name">{r.name}</span>
            {editing ? (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input className="pts-input" type="number" step="0.5" min="0" max={r.max}
                  value={scores[r.k]} onChange={e => setScores({ ...scores, [r.k]: +e.target.value })} />
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
          <li>클래스 구조와 메서드 시그니처를 정확히 잡았습니다</li>
          <li>push, peek 동작이 의도대로 구현되었습니다</li>
        </ul>
      </div>
      <div className="aibox warn">
        <h4><Icon.alert width="13" height="13" /> 약점</h4>
        <ul>
          <li>7번 줄: 빈 스택 pop() 시 IndexError 발생</li>
          <li>시간복잡도 O(n²), append/pop 활용 권장</li>
        </ul>
      </div>

      <div className="aimeta">
        <div className="aimeta__cell">
          <div className="lbl"><Icon.spark width="12" height="12" /> AI 의심도</div>
          <div className="val">
            12%
            <span className="badge badge--good" style={{ height: 20, fontSize: 11 }}>정상</span>
          </div>
        </div>
        <div className="aimeta__cell">
          <div className="lbl"><Icon.users width="12" height="12" /> 학생 간 유사도 (Top)</div>
          <div className="val">
            8%
            <span className="badge badge--good" style={{ height: 20, fontSize: 11 }}>정상</span>
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
        <input className="final__input" type="number" step="0.5" min="0" max="10" value={final} onChange={e => setFinal(+e.target.value)} />
        <span className="final__den">/ 10</span>
        <span className={"final__same" + (same ? "" : " diff")}>
          {same ? <><Icon.check width="12" height="12" /> AI 추천과 동일</> : <><Icon.edit width="12" height="12" /> 직접 수정됨</>}
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

window.GradingCode = GradingCode;
