"use client";

import React from 'react';
import { Icon } from '../icons';
import { Shell } from '../shell';
import { MOCK } from '../data';
import { Landing } from '../screens/landing';
import { QueueView } from '../screens/queue';
import { GradingEssay } from '../screens/grading-essay';
import { GradingCode } from '../screens/grading-code';
import { StudentDashboard, StudentFeedback } from '../screens/student';
import { Dialogs } from '../screens/dialogs';
import { AssignmentsView } from '../screens/assignments';
import { TweaksPanel, TweakSection, TweakRadio, TweakToggle, useTweaks } from '../tweaks-panel';
import { dbService } from '../lib/db';

export default function Home() {
  const [mounted, setMounted] = React.useState(false);
  
  // Database states
  const [assignmentsList, setAssignmentsList] = React.useState([]);
  const [submissionsList, setSubmissionsList] = React.useState([]);
  const [detailedContent, setDetailedContent] = React.useState(null);
  const [studentAssignments, setStudentAssignments] = React.useState([]);
  const [dbLoading, setDbLoading] = React.useState(true);

  // Routing state
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
  const TWEAK_DEFAULTS = {
    "aiPanelLayout": "right",
    "showAIBoostHints": true,
    "headerStyle": "deep-red",
    "density": "comfortable",
    "fontPair": "pretendard-serif"
  };
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // 1. Fetch assignments on mount
  React.useEffect(() => {
    setMounted(true);
    async function loadAssignments() {
      const data = await dbService.getAssignments();
      setAssignmentsList(data);
    }
    loadAssignments();
  }, []);

  // 2. Fetch submissions when active assignment changes
  React.useEffect(() => {
    if (!mounted) return;
    async function loadSubmissions() {
      setDbLoading(true);
      const data = await dbService.getSubmissions(activeAssn);
      setSubmissionsList(data);
      
      // Select first student or default focus student
      const defaultFocus = data.find(s => s.isFocus) || data.find(s => s.status === 'ready') || data[0];
      if (defaultFocus) {
        setFocusedId(defaultFocus.id);
      }
      setDbLoading(false);
    }
    loadSubmissions();
  }, [activeAssn, mounted]);

  // 3. Fetch detailed content when focused submission changes
  React.useEffect(() => {
    if (!focusedId || !mounted) return;
    async function loadContent() {
      const currentAssn = assignmentsList.find(a => a.id === activeAssn) || { type: activeAssn };
      const data = await dbService.getSubmissionContent(focusedId, currentAssn.type);
      setDetailedContent(data);
    }
    loadContent();
  }, [focusedId, activeAssn, assignmentsList, mounted]);

  // 4. Fetch student assignments when role changes to student
  React.useEffect(() => {
    if (role === 'student' && mounted) {
      async function loadStudent() {
        const data = await dbService.getStudentAssignments('20234113');
        setStudentAssignments(data);
      }
      loadStudent();
    }
  }, [role, mounted]);

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.dataset.density = t.density;
      root.dataset.headerStyle = t.headerStyle;
    }
  }, [t.density, t.headerStyle]);

  // Show toast helper
  const showToast = (msg, kind) => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 2200);
  };

  // Switch role
  const switchRole = () => {
    if (role === "ta") {
      setRole("student");
      setView("dashboard");
    } else {
      setRole("ta");
      setView("assignments");
    }
  };

  if (!mounted) {
    return <div style={{ background: "var(--ink-100)", minHeight: "100vh" }} />;
  }

  // ------ LANDING ------
  if (role === "landing") {
    return <Landing onPick={r => {
      setRole(r);
      setView(r === "ta" ? "assignments" : "dashboard");
    }} />;
  }

  // ------ TA flow ------
  if (role === "ta") {
    const A = assignmentsList.find(a => a.id === activeAssn) || {
      id: "essay",
      course: "인문대 교양 | 003 분반 (World Literature | 003 Section)",
      courseShort: "세계문학의 이해",
      title: "카프카 『변신』 감상문 — 세계문학의 이해",
      deadline: "5월 26일 오후 11:59",
      avg: 7.4,
      aiAvg: 7.3,
      graded: 12,
      total: 45,
      type: "essay"
    };

    const students = submissionsList.length > 0 ? submissionsList : (activeAssn === "essay" ? MOCK.TA_STUDENTS_ESSAY : MOCK.CODE_STUDENTS);
    const totalCount = students.length;
    const focusedIdx = students.findIndex(s => s.id === focusedId);
    const focused = students[Math.max(0, focusedIdx)] || students[0];

    // Navigation functions for queue / grading
    const next = () => {
      if (students.length === 0) return;
      const i = students.findIndex(s => s.id === focusedId);
      const n = students[(i + 1) % students.length];
      setFocusedId(n.id);
    };
    
    const prev = () => {
      if (students.length === 0) return;
      const i = students.findIndex(s => s.id === focusedId);
      const n = students[(i - 1 + students.length) % students.length];
      setFocusedId(n.id);
    };

    const handleApprove = async (score) => {
      if (!focused) return;
      
      // OPTIONAL: Update on database
      const res = await dbService.updateGrade(focused.id, score, 'graded');
      if (res.success) {
        showToast("승인 완료 — 성적이 성공적으로 저장되었습니다.", "good");
      } else {
        showToast("승인 완료 (로컬 반영)", "good");
      }

      // Refresh list to show updated grade
      const updated = await dbService.getSubmissions(activeAssn);
      setSubmissionsList(updated);
      
      next();
    };

    if (view === "queue") {
      return (
        <div className="app">
          <Shell.GlobalRail role="ta" onSwitch={switchRole} active="courses" />
          <Shell.CourseRail role="ta" active="assign" onSelect={(key) => { if (key === "assign") setView("assignments"); }} />
          <div className="main">
            <Shell.SimpleTopBar search />
            <div className="body">
              {dbLoading ? (
                <div style={{ display: "grid", placeItems: "center", minHeight: "400px" }}>
                  <div style={{ color: "var(--ink-500)", fontSize: 15 }}>데이터베이스 불러오는 중...</div>
                </div>
              ) : (
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
                    const nextAssn = activeAssn === "essay" ? "code" : "essay";
                    setActiveAssn(nextAssn);
                    showToast(nextAssn === "essay" ? "세계문학의 이해로 전환" : "자료구조 입문으로 전환", "good");
                  }}
                />
              )}
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
                assignments={assignmentsList}
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

    // Grading view
    return (
      <div className="app">
        <Shell.GlobalRail role="ta" onSwitch={switchRole} />
        <Shell.CourseRail role="ta" active="assign" />
        <div className="main">
          <Shell.GradingTopBar
            title={A.title}
            sub={`마감 ${A.deadline} · ${A.courseShort}`}
            gradedCount={students.filter(s => s.status === 'graded').length}
            totalCount={totalCount}
            avg={A.avg}
            avgTotal={10}
            pageIdx={Math.max(1, focusedIdx + 1)}
            pageTotal={totalCount}
            studentName={focused?.name || ""}
            studentMeta={focused ? `(학번: ${focused.no})` : ""}
            onPrev={prev}
            onNext={next}
            onListClick={() => setView("queue")}
          />
          <div className="body">
            {activeAssn === "essay" ? (
              <GradingEssay
                aiLayout={t.aiPanelLayout}
                focusedStudent={focused}
                submissionContent={detailedContent}
                onApprove={handleApprove}
                onOpenWarn={() => setWarnOpen(true)}
                onOpenSimilarity={() => setSimOpen(true)}
              />
            ) : (
              <GradingCode
                aiLayout={t.aiPanelLayout}
                focusedStudent={focused}
                submissionContent={detailedContent}
                onApprove={handleApprove}
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
    const list = studentAssignments.length > 0 ? studentAssignments : MOCK.STUDENT_ASSIGNMENTS;
    const assn = list.find(a => a.id === studentAssnId) || list[0];

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
            <button className="btn btn--quiet btn--sm" onClick={() => setView("dashboard")} style={{ marginBottom: 8, alignSelf: "flex-start", gap: 6, display: 'inline-flex', alignItems: 'center' }}>
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

// ------ Tweaks Panel helper wrapper ------
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
