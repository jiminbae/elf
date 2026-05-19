/* global React, ReactDOM, Icon, Shell, MOCK,
   Landing, QueueView, GradingEssay, GradingCode,
   StudentDashboard, StudentFeedback, Dialogs,
   TweaksPanel, TweakSection, TweakRadio, TweakSelect, TweakToggle, TweakColor, useTweaks */

const ASSIGNMENTS_TA = {
  essay: {
    course: "인문대 교양 | 003 분반 (World Literature | 003 Section)",
    courseShort: "세계문학의 이해",
    title: "카프카 『변신』 감상문 — 세계문학의 이해",
    deadline: "5월 26일 오후 11:59",
    avg: 7.4,
    aiAvg: 7.3,
    graded: 12,
    type: "essay",
  },
  code: {
    course: "공과대 전공 | 001 분반 (Data Structures | 001 Section)",
    courseShort: "자료구조 입문",
    title: "스택 클래스 구현 — Github 기반 협업 팀과제",
    deadline: "5월 26일 오후 11:59",
    avg: 7.2,
    aiAvg: 7.0,
    graded: 5,
    type: "code",
  },
};

// ----------------------------------------------------------------
// Top-level app
// ----------------------------------------------------------------
function App() {
  // Routing state (simple — single-file prototype)
  const [role, setRole]   = React.useState("landing"); // landing | ta | student
  const [view, setView]   = React.useState("assignments");   // assignments | queue | grading | dashboard | feedback
  const [activeAssn, setActiveAssn] = React.useState("essay"); // essay | code

  // For TA queue: student selections
  const [openSet, setOpenSet] = React.useState(new Set([5, 6, 13]));
  const [focusedId, setFocusedId] = React.useState(13);

  // For student: active assignment
  const [studentAssnId, setStudentAssnId] = React.useState(1);

  // Dialogs
  const [warnOpen, setWarnOpen] = React.useState(false);
  const [simOpen, setSimOpen]   = React.useState(false);
  const [appealOpen, setAppealOpen] = React.useState(false);
  const [previewRes, setPreviewRes] = React.useState(null);
  const [toast, setToast] = React.useState(null);

  // Tweaks
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "aiPanelLayout": "right",
    "showAIBoostHints": true,
    "headerStyle": "deep-red",
    "density": "comfortable",
    "fontPair": "pretendard-serif"
  }/*EDITMODE-END*/;
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply font pair / density / header
  React.useEffect(() => {
    const root = document.documentElement;
    root.dataset.density = t.density;
    root.dataset.headerStyle = t.headerStyle;
  }, [t.density, t.headerStyle]);

  // Show toast helper
  const showToast = (msg, kind) => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 2200);
  };

  // Switch role
  const switchRole = () => {
    if (role === "ta") { setRole("student"); setView("dashboard"); }
    else { setRole("ta"); setView("assignments"); }
  };

  // ------ LANDING ------
  if (role === "landing") {
    return <Landing onPick={r => {
      setRole(r);
      setView(r === "ta" ? "assignments" : "dashboard");
    }} />;
  }

  // ------ TA flow ------
  if (role === "ta") {
    const A = ASSIGNMENTS_TA[activeAssn];
    const students = activeAssn === "essay" ? MOCK.TA_STUDENTS_ESSAY : MOCK.CODE_STUDENTS;
    const totalCount = students.length;
    const focusedIdx = students.findIndex(s => s.id === focusedId);
    const focused = students[Math.max(0, focusedIdx)] || students[0];

    if (view === "queue") {
      return (
        <div className="app">
          <Shell.GlobalRail role="ta" onSwitch={switchRole} active="courses" />
          <Shell.CourseRail role="ta" active="assign" onSelect={(key) => { if (key === "assign") setView("assignments"); }} />
          <div className="main">
            <Shell.SimpleTopBar search />
            <div className="body">
              <QueueView
                assignment={{ ...A, course: A.course }}
                students={students}
                openSet={openSet}
                setOpenSet={setOpenSet}
                onOpen={(id) => {
                  if (Array.isArray(id)) id = id[0];
                  setFocusedId(id);
                  setView("grading");
                }}
                onSwitchAssignment={() => {
                  setActiveAssn(activeAssn === "essay" ? "code" : "essay");
                  setFocusedId(activeAssn === "essay" ? 6 : 13);
                  showToast(activeAssn === "essay" ? "자료구조 입문으로 전환" : "세계문학의 이해로 전환", "good");
                }}
              />
            </div>
          </div>
          <Tweaks t={t} setTweak={setTweak} activeAssn={activeAssn} setActiveAssn={setActiveAssn} />
        </div>
      );
    }

    if (view === "assignments") {
      return (
        <div className="app">
          <Shell.GlobalRail role="ta" onSwitch={switchRole} active="courses" />
          <Shell.CourseRail role="ta" active="assign" onSelect={(key) => { if (key === "assign") setView("assignments"); }} />
          <div className="main">
            <Shell.SimpleTopBar search />
            <div className="body">
              <AssignmentsView
                onOpenAssignment={(assnType) => {
                  setActiveAssn(assnType);
                  setView("queue");
                }}
              />
            </div>
          </div>
          <Tweaks t={t} setTweak={setTweak} activeAssn={activeAssn} setActiveAssn={setActiveAssn} />
        </div>
      );
    }

    // grading view
    const next = () => {
      const i = students.findIndex(s => s.id === focusedId);
      const n = students[(i + 1) % students.length];
      setFocusedId(n.id);
    };
    const prev = () => {
      const i = students.findIndex(s => s.id === focusedId);
      const n = students[(i - 1 + students.length) % students.length];
      setFocusedId(n.id);
    };

    return (
      <div className="app">
        <Shell.GlobalRail role="ta" onSwitch={switchRole} />
        <Shell.CourseRail role="ta" active="assign" />
        <div className="main">
          <Shell.GradingTopBar
            title={A.title}
            sub={`마감 ${A.deadline} · ${A.courseShort}`}
            gradedCount={A.graded}
            totalCount={totalCount}
            avg={A.avg}
            avgTotal={10}
            pageIdx={Math.max(1, focusedIdx + 1)}
            pageTotal={totalCount}
            studentName={focused?.name || ""}
            studentMeta={focused ? `(학생 ${focused.id})` : ""}
            onPrev={prev}
            onNext={next}
            onListClick={() => setView("queue")}
          />
          <div className="body">
            {activeAssn === "essay" ? (
              <GradingEssay
                aiLayout={t.aiPanelLayout}
                onApprove={() => { showToast("승인 완료 — 다음 학생으로 이동", "good"); next(); }}
                onOpenWarn={() => setWarnOpen(true)}
                onOpenSimilarity={() => setSimOpen(true)}
              />
            ) : (
              <GradingCode
                aiLayout={t.aiPanelLayout}
                onApprove={() => { showToast("승인 완료 — 다음 학생으로 이동", "good"); next(); }}
              />
            )}
          </div>
        </div>

        <Dialogs.SuspicionDialog open={warnOpen} onClose={() => setWarnOpen(false)} onProceed={() => { setWarnOpen(false); showToast("검토 메모가 기록되었습니다"); }} />
        <Dialogs.SimilarityDialog open={simOpen} onClose={() => setSimOpen(false)} />
        <Dialogs.Toast msg={toast?.msg} kind={toast?.kind} />

        <Tweaks t={t} setTweak={setTweak} activeAssn={activeAssn} setActiveAssn={setActiveAssn} role="ta" />
      </div>
    );
  }

  // ------ Student flow ------
  if (role === "student") {
    const assn = MOCK.STUDENT_ASSIGNMENTS.find(a => a.id === studentAssnId) || MOCK.STUDENT_ASSIGNMENTS[0];

    if (view === "dashboard") {
      return (
        <div className="app">
          <Shell.GlobalRail role="student" onSwitch={switchRole} />
          <Shell.CourseRail role="student" active="assign" />
          <div className="main">
            <Shell.SimpleTopBar search />
            <div className="body">
              <StudentDashboard onOpen={(id) => { setStudentAssnId(id); setView("feedback"); }} />
            </div>
          </div>
          <Tweaks t={t} setTweak={setTweak} role="student" />
          <Dialogs.Toast msg={toast?.msg} kind={toast?.kind} />
        </div>
      );
    }

    return (
      <div className="app">
        <Shell.GlobalRail role="student" onSwitch={switchRole} />
        <Shell.CourseRail role="student" active="assign" />
        <div className="main">
          <Shell.SimpleTopBar search />
          <div className="body">
            <button className="btn btn--quiet btn--sm" onClick={() => setView("dashboard")} style={{ marginBottom: 8, alignSelf: "flex-start" }}>
              <Icon.chevL width="14" height="14" /> 과제 목록으로
            </button>
            <StudentFeedback
              assignment={assn}
              onAppeal={() => setAppealOpen(true)}
              onOpenResource={(r) => setPreviewRes(r)}
            />
          </div>
        </div>

        <Dialogs.MaterialPreview open={!!previewRes} onClose={() => setPreviewRes(null)} resource={previewRes} />
        <Dialogs.AppealDialog open={appealOpen} onClose={() => setAppealOpen(false)}
          onSubmit={() => { setAppealOpen(false); showToast("이의 신청이 접수되었습니다", "good"); }} />
        <Dialogs.Toast msg={toast?.msg} kind={toast?.kind} />

        <Tweaks t={t} setTweak={setTweak} role="student" />
      </div>
    );
  }
}

// ----------------------------------------------------------------
// Tweaks
// ----------------------------------------------------------------
function Tweaks({ t, setTweak, activeAssn, setActiveAssn, role }) {
  return (
    <TweaksPanel title="Tweaks">
      {role === "ta" && setActiveAssn ? (
        <TweakSection label="활성 과제">
          <TweakRadio
            label="유형"
            value={activeAssn}
            onChange={v => setActiveAssn(v)}
            options={[
              { value: "essay", label: "감상문" },
              { value: "code", label: "코드" },
            ]}
          />
        </TweakSection>
      ) : null}

      <TweakSection label="AI 패널 레이아웃">
        <TweakRadio
          label="위치"
          value={t.aiPanelLayout}
          onChange={v => setTweak("aiPanelLayout", v)}
          options={[
            { value: "right",    label: "우측" },
            { value: "inline",   label: "본문" },
            { value: "floating", label: "플로팅" },
          ]}
        />
      </TweakSection>

      <TweakSection label="표시">
        <TweakToggle
          label="AI 강조 힌트"
          value={t.showAIBoostHints}
          onChange={v => setTweak("showAIBoostHints", v)}
        />
      </TweakSection>
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
