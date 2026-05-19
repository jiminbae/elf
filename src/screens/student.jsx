import React from 'react';
import { Icon } from '../icons';
import { Shell } from '../shell';
import { MOCK } from '../data';

export function StudentDashboard({ onOpen }) {
  const { STUDENT_ASSIGNMENTS } = MOCK;
  const [tab, setTab] = React.useState("all");
  return (
    <>
      <Shell.Crumbs trail={["2026년 1학기", "과제 및 평가"]} />
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 4 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: "-0.015em" }}>과제 및 평가</h1>
        <span className="badge">총 5개 · 이번주 마감 2건</span>
      </div>

      {/* Growth panel */}
      <div className="card mt-20" style={{ padding: "20px 22px", marginTop: 20 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 18 }}>
          <h3>최근 8주 성장 추이</h3>
          <span style={{ fontSize: 12, color: "var(--ink-500)" }}>이번주 7.5점 · 4주 평균 대비 +0.7</span>
          <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--good-700)" }}>
            <Icon.trending width="14" height="14" /> 상승세
          </span>
        </div>
        <div className="growth">
          <div className="spark">
            {MOCK.GROWTH.map((v, i) => (
              <span key={i}
                data-v={v}
                className={i === MOCK.GROWTH.length - 1 ? "current" : ""}
                style={{ height: `${v * 9}px` }} />
            ))}
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-500)", minWidth: 130, textAlign: "right" }}>
            <div>최고 9.2 — 자료구조 기본 자료형 퀴즈</div>
            <div style={{ marginTop: 4 }}>최저 5.4 — 첫 감상문 (W3)</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 8, marginTop: 12, fontSize: 11, color: "var(--ink-500)", textAlign: "center" }}>
          {MOCK.GROWTH_LABELS.map((l, i) => <span key={i}>{l}</span>)}
        </div>
      </div>

      <div className="queue-toolbar" style={{ marginTop: 6 }}>
        <div className="qfilter">
          {[["all", "전체 5"], ["graded", "채점 완료 3"], ["pending", "채점 대기 1"], ["due", "마감 임박 2"]].map(([k, lbl]) => (
            <button key={k} className={tab === k ? "is-active" : ""} onClick={() => setTab(k)}>{lbl}</button>
          ))}
        </div>
      </div>

      <div className="a-list">
        <div className="a-row" style={{ background: "var(--ink-50)", fontSize: 11.5, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: "0.04em", cursor: "default" }}>
          <span></span><span>과제</span><span>마감</span><span>제출</span><span>채점</span><span>점수</span><span></span>
        </div>
        {STUDENT_ASSIGNMENTS.filter(a => {
          if (tab === "graded") return a.status === "graded";
          if (tab === "pending") return a.status === "pending";
          if (tab === "due") return ["pending"].includes(a.status);
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
              {a.status === "graded"
                ? <span className="badge badge--good badge--dot">완료</span>
                : <span className="badge badge--warn badge--dot">{a.estimated ? `${a.estimated} 예정` : "대기"}</span>}
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

export function StudentFeedback({ assignment, onAppeal, onOpenResource }) {
  const a = assignment;
  const isGraded = a.status === "graded";

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
            <div className="sub">2026년 5월 23일 오후 4:18 채점됨 · {a.grader}</div>
          </div>
          <div className="right">제출: {a.submittedAt}</div>
        </div>
      ) : (
        <div className="s-hero pending mt-16" style={{ marginTop: 16 }}>
          <div className="check"><Icon.refresh width="16" height="16" /></div>
          <div>
            <div className="title">채점 대기 중</div>
            <div className="sub">{a.estimated || "5/24"} 예정 · AI 채점 보조가 동작 중입니다</div>
          </div>
          <div className="right">제출: {a.submittedAt}</div>
        </div>
      )}

      <div className="s-layout mt-16" style={{ marginTop: 16 }}>
        <div>
          {/* Score breakdown — only for graded */}
          {isGraded ? <ScoreCard a={a} /> : <PendingCard />}

          {/* TA feedback */}
          {isGraded ? <TAFeedback a={a} /> : null}

          {/* AI learning analysis */}
          {isGraded ? <AILearning a={a} /> : null}

          {/* Custom learning plan */}
          {isGraded ? <LearningPlan onOpenResource={onOpenResource} /> : null}

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
  return (
    <div className="s-score-card">
      <div className="s-score-head">
        <div>
          <span className="s-score-num">{a.score}</span>
          <span className="s-score-den"> / {a.total}</span>
          <span className="s-score-pct"> ({Math.round(a.score * 10)}%)</span>
        </div>
        <div className="s-score-meta">
          <Icon.trending width="14" height="14" /> 반 평균 {a.avg} · {a.rank}
        </div>
      </div>

      <div className="s-rubric">
        {(a.type === "code" ? [
          { name: "기능 구현", v: 4, max: 5 },
          { name: "예외 처리", v: 1, max: 2, tone: "warn" },
          { name: "코드 스타일", v: 2, max: 2 },
          { name: "시간복잡도", v: 0.5, max: 1, tone: "warn" },
        ] : [
          { name: "논지의 명확성", v: 2.5, max: 3 },
          { name: "근거의 적절성", v: 2, max: 3, tone: "warn" },
          { name: "논리적 구성", v: 1.5, max: 2 },
          { name: "문장 표현", v: 1.5, max: 2 },
        ]).map((r, i) => (
          <div key={i} className="s-rubric__row">
            <div className="s-rubric__name">{r.name}</div>
            <div className="s-rubric__pts">{r.v} / {r.max}</div>
            <div className="s-rubric__bar">
              <div className={"bar" + (r.tone === "warn" ? " warn" : "")}>
                <span style={{ width: `${(r.v / r.max) * 100}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PendingCard() {
  return (
    <div className="card card-pad mt-16" style={{ marginTop: 16 }}>
      <h3>채점 대기 중</h3>
      <p style={{ color: "var(--ink-600)", fontSize: 13.5, lineHeight: 1.65, marginTop: 6 }}>
        조교 채점이 진행 중입니다. AI 채점 보조가 초안을 만들어두면, 담당 조교가 검토·승인한 뒤 결과가 공개됩니다.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 18 }}>
        {[
          { lbl: "AI 초안 작성", state: "done" },
          { lbl: "조교 검토", state: "active" },
          { lbl: "결과 공개", state: "pending" },
        ].map((s, i) => (
          <div key={i} style={{
            padding: 12, borderRadius: 10,
            border: "1px solid var(--ink-200)",
            background: s.state === "done" ? "var(--good-50)" : s.state === "active" ? "var(--ai-50)" : "var(--ink-50)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {s.state === "done" ? <Icon.check width="14" height="14" style={{ color: "var(--good-600)" }} /> :
                s.state === "active" ? <span style={{ width: 8, height: 8, borderRadius: 99, background: "var(--ai-500)", boxShadow: "0 0 0 3px rgba(58,123,213,0.25)" }} /> :
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: "var(--ink-300)" }} />}
              <strong style={{ fontSize: 12.5 }}>{s.lbl}</strong>
            </div>
            <div style={{ fontSize: 11.5, color: "var(--ink-500)", marginTop: 6 }}>
              {s.state === "done" ? "5/23 02:11 완료" : s.state === "active" ? "남규리 조교 검토 중" : "검토 후 자동 공개"}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 0 0", color: "var(--ink-500)", fontSize: 12.5 }}>
        <Icon.bell width="14" height="14" />
        채점이 완료되면 알림으로 안내드립니다. 예상 완료일: <strong style={{ color: "var(--ink-800)" }}>5월 24일</strong>
      </div>
    </div>
  );
}

function TAFeedback({ a }) {
  return (
    <div className="feedback-card mt-16" style={{ marginTop: 16 }}>
      <div className="avatar">남</div>
      <div>
        <div className="who">조교 피드백</div>
        <div className="meta">{a.grader || "남규리 조교"} · 5/23 16:18</div>
        <div className="body">
          {a.type === "code"
            ? "스택의 기본 구조는 정확하게 구현했어요. push, peek 메서드도 잘 동작합니다. 다만 pop 메서드에서 빈 스택일 때의 예외 처리가 빠져있어 IndexError가 발생할 수 있고, 시간복잡도 측면에서도 개선 여지가 있어요. 다음 과제에서는 예외 케이스도 함께 고려해보세요."
            : "감상문의 도입에서 제시한 세 층위 구조가 인상적입니다. 다만 노동 소외 부분에서 외부 이론과 작품 텍스트의 연결을 더 보강해보세요."}
        </div>
      </div>
    </div>
  );
}

function AILearning({ a }) {
  return (
    <div className="ai-learning">
      <h3>
        <Icon.spark width="14" height="14" />
        AI 학습 분석
        <span className="right">
          <span style={{ fontSize: 11, color: "var(--ai-700)", background: "var(--white)", border: "1px solid var(--ai-100)", padding: "3px 8px", borderRadius: 999 }}>
            Claude로 생성
          </span>
        </span>
      </h3>

      <div className="grp good">
        <h4><Icon.thumbsUp width="13" height="13" /> 잘한 점</h4>
        <ul>
          {a.type === "code" ? (
            <>
              <li>클래스의 기본 구조를 명확하고 일관되게 잡았습니다</li>
              <li>push와 peek 메서드는 의도대로 정확히 동작합니다</li>
              <li>사용 예시 코드까지 작성하여 동작을 검증한 점이 좋습니다</li>
            </>
          ) : (
            <>
              <li>도입에서 핵심 키워드 ‘소외’를 제시하고 세 층위로 구체화한 점</li>
              <li>2문단에서 그레테의 발화를 직접 인용해 분석한 부분</li>
            </>
          )}
        </ul>
      </div>

      <div className="grp warn">
        <h4><Icon.alert width="13" height="13" /> 개선할 점</h4>
        <ul>
          {a.type === "code" ? (
            <>
              <li>7번 줄: 빈 스택에서 <span className="code">pop()</span> 호출 시 <span className="code">IndexError</span> 가 발생합니다. 검증 로직 추가가 필요합니다.</li>
              <li>전체 시간복잡도가 O(n²)로 비효율적입니다. 파이썬 리스트의 <span className="code">append/pop</span> 은 평균 O(1)이므로 추가 자료구조 없이 O(n) 달성이 가능합니다.</li>
            </>
          ) : (
            <>
              <li>3문단의 마르크스 인용을 작품 텍스트(영업사원의 일상, 회사 지배인 장면)와 연결해보세요.</li>
              <li>결론에서 도입의 세 층위를 한 번 더 종합해 마무리하면 응집도가 올라갑니다.</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

function LearningPlan({ onOpenResource }) {
  return (
    <div className="s-plan">
      <h3><Icon.bolt width="14" height="14" style={{ color: "var(--warn-600)" }} /> 맞춤 학습 방안</h3>

      <h4>보강이 필요한 개념</h4>
      <div className="chips">
        <span className="tag-chip">예외 처리</span>
        <span className="tag-chip">시간복잡도 분석</span>
        <span className="tag-chip">파이썬 자료구조</span>
      </div>

      <h4>추천 학습 자료</h4>
      <div className="resources">
        <a className="res" onClick={() => onOpenResource({ kind: "slide", title: "강의 3주차 슬라이드 — 예외 처리 (12~18p)" })} style={{ cursor: 'pointer' }}>
          <span className="ico"><Icon.doc width="16" height="16" /></span>
          <span>강의 3주차 슬라이드 — 예외 처리 (12~18p)</span>
          <span className="arrow"><Icon.arrowR width="14" height="14" /></span>
        </a>
        <a className="res" onClick={() => onOpenResource({ kind: "external", title: "Python 공식 문서: List time complexity" })} style={{ cursor: 'pointer' }}>
          <span className="ico"><Icon.ext width="16" height="16" /></span>
          <span>Python 공식 문서: List time complexity</span>
          <span className="arrow"><Icon.arrowR width="14" height="14" /></span>
        </a>
        <a className="res" onClick={() => onOpenResource({ kind: "video", title: "강의 영상 — try/except 구문 (8분)" })} style={{ cursor: 'pointer' }}>
          <span className="ico"><Icon.vid width="16" height="16" /></span>
          <span>강의 영상 — try/except 구문 (8분)</span>
          <span className="arrow"><Icon.arrowR width="14" height="14" /></span>
        </a>
      </div>

      <h4>권장 연습 문제</h4>
      <div className="resources">
        <a className="res" style={{ cursor: 'pointer' }}>
          <span className="ico"><Icon.code width="16" height="16" /></span>
          <span>Queue 구현 — 동일한 예외 처리 패턴 적용</span>
          <span className="arrow"><Icon.arrowR width="14" height="14" /></span>
        </a>
        <a className="res" style={{ cursor: 'pointer' }}>
          <span className="ico"><Icon.code width="16" height="16" /></span>
          <span>괄호 짝 검증 — 이번 스택 클래스 활용</span>
          <span className="arrow"><Icon.arrowR width="14" height="14" /></span>
        </a>
        <a className="res" style={{ cursor: 'pointer' }}>
          <span className="ico"><Icon.code width="16" height="16" /></span>
          <span>중위 → 후위 표기 변환 — 스택 응용</span>
          <span className="arrow"><Icon.arrowR width="14" height="14" /></span>
        </a>
      </div>
    </div>
  );
}

function SidePanel({ a }) {
  return (
    <>
      <div className="panel">
        <h4>제출 정보</h4>
        <dl className="kv">
          <dt>마감</dt><dd>{a.deadline}</dd>
          <dt>배점</dt><dd>{a.total}점</dd>
          <dt>제출 유형</dt><dd>{a.type === "code" ? "파일 업로드 (.py)" : "파일 업로드 (.docx)"}</dd>
          <dt>제출일</dt><dd>{a.submittedAt}</dd>
        </dl>
      </div>
      <div className="panel">
        <h4>제출물</h4>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", border: "1px solid var(--ink-200)", borderRadius: 10, background: "var(--paper)" }}>
          <div className="ico" style={{ width: 28, height: 28, background: "var(--ink-150)", borderRadius: 8, display: "grid", placeItems: "center", color: "var(--ink-600)" }}>
            {a.type === "code" ? <Icon.code width="14" height="14" /> : <Icon.doc width="14" height="14" />}
          </div>
          <span style={{ fontFamily: a.type === "code" ? "var(--font-mono)" : "var(--font-sans)", fontSize: 13 }}>
            {a.type === "code" ? "stack.py" : "변신_감상문_정성훈.docx"}
          </span>
          <button className="btn btn--quiet btn--sm btn--icon" style={{ marginLeft: "auto" }}><Icon.download width="14" height="14" /></button>
        </div>
        <div style={{ fontSize: 11.5, color: "var(--ink-500)", marginTop: 8 }}>{a.submittedAt} 제출</div>
      </div>
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
