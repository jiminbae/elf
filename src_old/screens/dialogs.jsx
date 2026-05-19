/* global React, Icon */

// ============================================================
// Suspicion warning dialog (AI 의심도)
// ============================================================
function SuspicionDialog({ open, onClose, onProceed }) {
  if (!open) return null;
  return (
    <div className="scrim" onClick={onClose}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <div className="dialog__hd">
          <div className="warn-ico"><Icon.alert width="20" height="20" /></div>
          <div>
            <h3>AI 작성 의심도가 일정 기준을 넘었습니다</h3>
            <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 2 }}>승인 전 검토를 권장합니다 · 정보용 · 표절 단정 아님</div>
          </div>
        </div>
        <div className="dialog__bd">
          <p>본 학생의 제출물에서 LLM 산출물과 유사한 문체 패턴이 감지되었습니다. 3문단 ‘마르크스 소외 개념’ 문단의 일반론적 톤·문장 길이 분포가 모델 평균과 유사합니다.</p>

          <div className="meter-row">
            <span className="lbl">AI 작성 의심도</span>
            <span className="val" style={{ color: "var(--warn-700)" }}>28% <span style={{ fontSize: 11, fontWeight: 500, color: "var(--ink-500)" }}>(기준 25%↑)</span></span>
            <span className="lbl" style={{ gridColumn: "1/-1", marginTop: 6 }}>· 문체 패턴 유사도 — 0.31</span>
            <span style={{ gridColumn: "1/-1" }} className="lbl">· 평균 문장 길이 편차 — 낮음 (모델 평균과 유사)</span>
            <span style={{ gridColumn: "1/-1" }} className="lbl">· 어휘 다양성(TTR) — 0.62 (학년 평균 0.58)</span>
          </div>

          <p style={{ marginTop: 14, fontSize: 12.5, color: "var(--ink-600)" }}>
            본 신호는 보조 지표이며 표절을 단정하지 않습니다. 학생 면담 시 ‘작품의 어떤 장면을 근거로 했는지’를 확인하는 것이 권장됩니다.
          </p>
        </div>
        <div className="dialog__ft">
          <button className="btn btn--ghost" onClick={onClose}>다시 검토</button>
          <button className="btn btn--ghost" style={{ color: "var(--ink-600)" }}>학생에게 면담 요청 보내기</button>
          <button className="btn btn--primary" onClick={onProceed}>확인하고 계속</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Similarity side-by-side dialog
// ============================================================
function SimilarityDialog({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="scrim" onClick={onClose}>
      <div className="dialog preview-dialog" style={{ width: "min(960px, 96vw)" }} onClick={e => e.stopPropagation()}>
        <div className="dialog__hd">
          <div className="warn-ico" style={{ background: "var(--ai-50)", color: "var(--ai-700)" }}><Icon.users width="20" height="20" /></div>
          <div>
            <h3>유사도 비교 — 나란히 보기</h3>
            <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 2 }}>정성훈 (학생 13) ↔ 강하늘 (학생 6) · 문장 단위 유사도 8.7%</div>
          </div>
          <button className="btn btn--quiet btn--icon" style={{ marginLeft: "auto" }} onClick={onClose}><Icon.chevR width="16" height="16" style={{ transform: "rotate(45deg)" }} /></button>
        </div>
        <div style={{ padding: "0 22px 6px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[{ who: "정성훈 (현재 학생)" }, { who: "강하늘 (학생 6)" }].map((c, i) => (
            <div key={i} style={{ border: "1px solid var(--ink-200)", borderRadius: 10, padding: 14, fontSize: 13, lineHeight: 1.7, background: "var(--paper)", minHeight: 240 }}>
              <div style={{ fontSize: 11.5, color: "var(--ink-500)", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>{c.who}</div>
              <p style={{ margin: "0 0 8px" }}>… 그레고르 역시 가족을 부양하기 위해 자신을 희생하며 일했지만 결국 그 노동의 의미를 찾지 못한다. </p>
              <p style={{ margin: 0 }}>
                <span style={{ background: "var(--hl-flag)", padding: "1px 2px", borderRadius: 2, boxShadow: "inset 0 -2px 0 var(--hl-flag-b)" }}>
                  현대 자본주의 사회에서 노동자는 자신의 노동과 그것이 만든 결과물로부터 분리되며, 이는 마르크스가 말한 소외의 개념과도 통한다.
                </span>
              </p>
            </div>
          ))}
        </div>
        <div className="dialog__bd">
          <div style={{ fontSize: 13, color: "var(--ink-700)", display: "flex", alignItems: "center", gap: 8 }}>
            <Icon.check width="16" height="16" style={{ color: "var(--good-600)" }} />
            <strong>판정: 정상 범위</strong>
            <span style={{ color: "var(--ink-500)" }}>마르크스 소외 개념에 대한 표준적 정의 문장으로, 같은 학습 자료에서 비롯한 것으로 보입니다.</span>
          </div>
        </div>
        <div className="dialog__ft">
          <button className="btn btn--ghost" onClick={onClose}>닫기</button>
          <button className="btn btn--ai">검토 메모 남기기</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Material preview dialog (student view)
// ============================================================
function MaterialPreview({ open, onClose, resource }) {
  if (!open || !resource) return null;
  const subtitle = {
    slide: "PDF · 강의 자료",
    external: "외부 링크",
    video: "동영상 · 8분 12초",
  }[resource.kind] || "";
  return (
    <div className="scrim" onClick={onClose}>
      <div className="dialog preview-dialog" onClick={e => e.stopPropagation()}>
        <div className="dialog__hd">
          <div className="warn-ico" style={{ background: "var(--ai-50)", color: "var(--ai-700)" }}>
            {resource.kind === "video" ? <Icon.vid width="20" height="20" /> :
              resource.kind === "external" ? <Icon.ext width="20" height="20" /> : <Icon.doc width="20" height="20" />}
          </div>
          <div>
            <h3>{resource.title}</h3>
            <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 2 }}>{subtitle} · 이번 과제 분석 기반 추천</div>
          </div>
          <button className="btn btn--quiet btn--icon" style={{ marginLeft: "auto" }} onClick={onClose}>
            <Icon.chevR width="16" height="16" style={{ transform: "rotate(45deg)" }} />
          </button>
        </div>
        <div className="preview-body">
          <div className="placeholder">
            <div className="big">미리보기</div>
            <div>드롭하면 자료가 표시됩니다 · {resource.kind.toUpperCase()}</div>
          </div>
        </div>
        <div className="dialog__ft">
          <button className="btn btn--ghost" onClick={onClose}>닫기</button>
          <button className="btn btn--ai">
            {resource.kind === "video" ? "재생" : "전체 보기"} <Icon.arrowR width="12" height="12" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Appeal / re-grade request dialog (student view)
// ============================================================
function AppealDialog({ open, onClose, onSubmit }) {
  const [reason, setReason] = React.useState("rubric");
  const [text, setText] = React.useState("");
  if (!open) return null;
  return (
    <div className="scrim" onClick={onClose}>
      <div className="dialog" style={{ width: "min(560px, 94vw)" }} onClick={e => e.stopPropagation()}>
        <div className="dialog__hd">
          <div className="warn-ico" style={{ background: "var(--paper)", color: "var(--ink-700)" }}>
            <Icon.flag width="20" height="20" />
          </div>
          <div>
            <h3>이의 신청 / 재채점 요청</h3>
            <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 2 }}>채점 완료 후 7일 이내 신청 가능 · 담당 조교가 직접 검토합니다</div>
          </div>
        </div>
        <div className="appeal-form">
          <div style={{ fontSize: 12, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600, marginBottom: 8 }}>사유</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14 }}>
            {[
              ["rubric", "채점 기준 적용", "특정 항목 점수가 기준과 다르게 적용되었다고 생각해요"],
              ["evidence", "코멘트의 근거", "조교/AI 코멘트의 근거가 부정확하다고 생각해요"],
              ["technical", "실행 환경 차이", "로컬에선 통과되는데 채점 결과가 다릅니다"],
              ["other", "기타", "위 사유에 해당하지 않습니다"],
            ].map(([k, lbl, hint]) => (
              <label key={k} style={{
                display: "block",
                padding: 12, borderRadius: 10,
                border: "1px solid " + (reason === k ? "var(--ink-700)" : "var(--ink-200)"),
                background: reason === k ? "var(--ink-50)" : "var(--white)",
                cursor: "pointer",
              }}>
                <input type="radio" name="reason" checked={reason === k} onChange={() => setReason(k)} style={{ marginRight: 6, accentColor: "var(--brand-700)" }} />
                <strong style={{ fontSize: 13 }}>{lbl}</strong>
                <div style={{ fontSize: 11.5, color: "var(--ink-500)", marginTop: 4, marginLeft: 20 }}>{hint}</div>
              </label>
            ))}
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600, marginBottom: 8 }}>상세 설명</div>
          <textarea
            placeholder="구체적인 사유를 작성해주세요. 어떤 항목/줄/단락에 대한 이의인지 명시하면 검토가 빨라집니다."
            value={text} onChange={e => setText(e.target.value)}
          />
          <div style={{ fontSize: 11.5, color: "var(--ink-500)", marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
            <Icon.shield width="13" height="13" />
            제출 후 처리 상태는 ‘메시지함’에서 확인할 수 있어요.
          </div>
        </div>
        <div className="dialog__ft">
          <button className="btn btn--ghost" onClick={onClose}>취소</button>
          <button className="btn btn--primary" onClick={onSubmit} disabled={!text || text.length < 10}>
            <Icon.send width="14" height="14" /> 제출
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Generic toast
// ============================================================
function Toast({ msg, kind }) {
  if (!msg) return null;
  return (
    <div style={{
      position: "fixed",
      bottom: 32, left: "50%", transform: "translateX(-50%)",
      background: kind === "good" ? "var(--good-600)" : "var(--ink-900)",
      color: "#fff",
      padding: "12px 18px",
      borderRadius: 999,
      boxShadow: "var(--sh-pop)",
      fontSize: 13,
      fontWeight: 600,
      display: "inline-flex", alignItems: "center", gap: 8,
      zIndex: 200,
      animation: "toast .25s ease",
    }}>
      {kind === "good" ? <Icon.check width="16" height="16" /> : null}
      {msg}
    </div>
  );
}

window.Dialogs = { SuspicionDialog, SimilarityDialog, MaterialPreview, AppealDialog, Toast };
