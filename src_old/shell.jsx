/* global React, Icon */

// ============================================================
// Global left rail — shows on every authenticated screen
// ============================================================
function GlobalRail({ active = "courses", role = "ta", onSwitch }) {
  const items = [
    { key: "account",  icon: Icon.user,    label: "계정" },
    { key: "dash",     icon: Icon.speedo,  label: "대시보드" },
    { key: "courses",  icon: Icon.book,    label: "과목" },
    { key: "groups",   icon: Icon.users,   label: "그룹" },
    { key: "cal",      icon: Icon.cal,     label: "캘린더" },
    { key: "inbox",    icon: Icon.inbox,   label: "메시지함", badge: 12 },
    { key: "feed",     icon: Icon.list,    label: "전체게시물" },
  ];
  return (
    <nav className="rail">
      <div className="rail__logo">KNU</div>
      {items.map(it => (
        <button
          key={it.key}
          className={"rail__item" + (it.key === active ? " is-active" : "")}
        >
          <span className="rail__item-icon"><it.icon width="20" height="20" /></span>
          <span className="rail__item-label">{it.label}</span>
          {it.badge ? <span className="rail__badge">{it.badge}</span> : null}
        </button>
      ))}
      <div className="rail__spacer" />
      <button
        className="rail__avatar"
        title={role === "ta" ? "남규리 조교 — 클릭하여 학생으로 전환" : "박효율 학생 — 클릭하여 조교로 전환"}
        onClick={onSwitch}
      >
        {role === "ta" ? "남" : "효"}
      </button>
    </nav>
  );
}

// ============================================================
// Course sub-rail — shows when inside a course
// ============================================================
function CourseRail({ active = "assign", role = "ta", onSelect }) {
  const taItems = [
    { key: "home",    label: "홈" },
    { key: "notice",  label: "공지" },
    { key: "syllabus",label: "수업 계획서" },
    { key: "attend",  label: "출결 관리" },
    { key: "class",   label: "강의실" },
    { key: "groups",  label: "그룹" },
    { key: "board",   label: "게시판" },
    { key: "survey",  label: "설문" },
    { key: "assign",  label: "과제 및 평가", badge: 23 },
    { key: "grades",  label: "성적 관리" },
  ];
  const stuItems = [
    { key: "home",    label: "홈" },
    { key: "notice",  label: "공지" },
    { key: "syllabus",label: "수업 계획서" },
    { key: "attend",  label: "출결체크" },
    { key: "att2",    label: "출결현황" },
    { key: "class",   label: "강의실" },
    { key: "tutor",   label: "AI 튜터" },
    { key: "board",   label: "게시판" },
    { key: "survey",  label: "설문" },
    { key: "assign",  label: "과제 및 평가" },
    { key: "grade",   label: "성적",     badge: 1 },
  ];
  const items = role === "ta" ? taItems : stuItems;
  return (
    <aside className="crail">
      <div className="crail__term">2026년 1학기</div>
      <nav className="crail__nav">
        {items.map(it => (
          <a key={it.key} className={it.key === active ? "is-active" : ""} onClick={() => typeof onSelect === 'function' && onSelect(it.key)} style={{ cursor: 'pointer' }}>
            {it.label}
            {it.badge ? <span className="pill-count">{it.badge}</span> : null}
          </a>
        ))}
      </nav>
    </aside>
  );
}

// ============================================================
// Top bar — varies by screen. The grading-screen variant is rich.
// ============================================================
function GradingTopBar({
  title, sub, gradedCount, totalCount,
  avg, avgTotal,
  pageIdx, pageTotal,
  studentName, studentMeta, online = true,
  onPrev, onNext, onListClick,
}) {
  return (
    <div className="main__topbar">
      <button className="topbar__ico" onClick={onListClick} title="학생 목록">
        <Icon.list width="20" height="20" />
      </button>
      <button className="topbar__ico" title="제출자 익명화">
        <Icon.eyeOff width="20" height="20" />
      </button>
      <button className="topbar__ico" title="설정">
        <Icon.settings width="20" height="20" />
      </button>

      <div style={{ marginLeft: 6, minWidth: 0, flex: "0 1 380px" }}>
        <div className="topbar__title">{title}</div>
        <div className="topbar__sub">{sub}</div>
      </div>

      <div style={{ flex: 1 }} />

      <div className="topbar__stat">
        <span className="topbar__stat-num">{gradedCount} / {totalCount}</span>
        <span className="topbar__stat-lbl">채점 현황</span>
      </div>
      <div className="topbar__stat">
        <span className="topbar__stat-num">{avg} / {avgTotal}</span>
        <span className="topbar__stat-lbl">평균 ({Math.round(avg*10)}%)</span>
      </div>

      <div className="topbar__pager" style={{ marginLeft: 0 }}>
        <button className="pg-btn" onClick={onPrev} title="이전 학생 (←)">
          <Icon.chevL width="16" height="16" />
        </button>
        <div className="topbar__student" style={{ borderLeft: 0, paddingLeft: 0 }}>
          {online ? <span className="dot" /> : null}
          <span style={{ whiteSpace: "nowrap" }}>
            <span style={{ opacity: 0.7, marginRight: 6, fontVariantNumeric: "tabular-nums" }}>{pageIdx}/{pageTotal}</span>
            {studentName} <span style={{ opacity: 0.7 }}>{studentMeta}</span>
          </span>
        </div>
        <button className="pg-btn" onClick={onNext} title="다음 학생 (→)">
          <Icon.chevR width="16" height="16" />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Simple top bar (student / queue views)
// ============================================================
function SimpleTopBar({ search = false }) {
  return (
    <div className="main__topbar" style={{ background: "var(--brand-700)" }}>
      <div className="topbar__title">2026년 1학기 — 학습 포털</div>
      <div style={{ flex: 1 }} />
      {search ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.12)", padding: "6px 14px", borderRadius: 999, color: "#fff", width: 280 }}>
          <Icon.search width="16" height="16" />
          <span style={{ fontSize: 13, opacity: 0.7, whiteSpace: "nowrap" }}>과제·공지 검색…</span>
        </div>
      ) : null}
      <button className="topbar__ico" title="알림"><Icon.bell width="18" height="18" /></button>
      <button className="topbar__ico" title="설정"><Icon.settings width="18" height="18" /></button>
    </div>
  );
}

// ============================================================
// Breadcrumbs
// ============================================================
function Crumbs({ trail = [] }) {
  return (
    <div className="crumbs">
      {trail.map((c, i) => (
        <React.Fragment key={i}>
          {i > 0 ? <span className="sep"><Icon.chevR width="12" height="12" /></span> : null}
          <span className={i === trail.length - 1 ? "cur" : ""}>{c}</span>
        </React.Fragment>
      ))}
    </div>
  );
}

window.Shell = { GlobalRail, CourseRail, GradingTopBar, SimpleTopBar, Crumbs };
