"use client";

import React from 'react';
import { Icon } from '../icons';
import { Shell } from '../shell';
import { Landing } from '../screens/landing';
import { QueueView } from '../screens/queue';
import { GradingEssay } from '../screens/grading-essay';
import { GradingCode } from '../screens/grading-code';
import { StudentDashboard, StudentFeedback } from '../screens/student';
import { Dialogs } from '../screens/dialogs';
import { AssignmentsView } from '../screens/assignments';
import { TweaksPanel, TweakSection, TweakRadio, TweakToggle, useTweaks } from '../tweaks-panel';
import { dbService } from '../lib/db';
import { n8nService } from '../lib/n8n';

const LOCAL_ASSIGNMENTS_KEY = 'knu-local-assignments';

function clearLocalAssignments() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(LOCAL_ASSIGNMENTS_KEY);
}

function isToday(value) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate();
}

function isWithinNextDays(value, days) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  const end = new Date(now);
  end.setDate(now.getDate() + days);
  return date >= now && date <= end;
}

function buildLandingMetrics(assignments, submissions, studentAssignments) {
  const gradingQueue = submissions.filter(s => s.status === 'ready' || s.status === 'pending').length;
  const warnings = submissions.filter(s => s.hasWarning || s.hasSimWarning).length;
  const completed = studentAssignments.filter(a => a.status === 'graded').length;
  const analyses = studentAssignments.filter(a => (
    (Array.isArray(a.strengths) && a.strengths.length > 0)
    || (Array.isArray(a.weaknesses) && a.weaknesses.length > 0)
    || (Array.isArray(a.learning_recommendations) && a.learning_recommendations.length > 0)
  )).length;

  return {
    taStats: [
      { lbl: "채점 대기", val: gradingQueue },
      { lbl: "오늘 마감", val: assignments.filter(a => isToday(a.deadline)).length },
      { lbl: "AI 검토 권장", val: warnings },
    ],
    studentStats: [
      { lbl: "이번 주 과제", val: assignments.filter(a => isWithinNextDays(a.deadline, 7)).length },
      { lbl: "채점 완료", val: completed },
      { lbl: "학습 분석", val: analyses },
    ],
  };
}

function buildStudentAssignmentList(assignments, studentAssignments) {
  const submittedByAssignment = new Map();
  studentAssignments.forEach(item => {
    submittedByAssignment.set(item.assignmentId || item.assignment_id || item.id, item);
    if (item.title) submittedByAssignment.set(item.title, item);
  });

  const fromAssignments = assignments.map(assignment => {
    const submitted = submittedByAssignment.get(assignment.id) || submittedByAssignment.get(assignment.title);
    return {
      ...assignment,
      ...(submitted || {}),
      id: assignment.id,
      title: assignment.title,
      type: assignment.type || submitted?.type || 'essay',
      status: submitted?.status || 'not_submitted',
      submittedAt: submitted?.submittedAt || '',
      total: submitted?.total || assignment.total || 10,
    };
  });

  const assignmentIds = new Set(assignments.map(a => a.id ? String(a.id).trim() : ''));
  const assignmentTitles = new Set(assignments.map(a => a.title ? String(a.title).trim() : ''));

  const extraSubmitted = studentAssignments.filter(item => {
    const id = item.assignmentId || item.assignment_id || item.id;
    const title = item.title;
    const strId = id ? String(id).trim() : '';
    const strTitle = title ? String(title).trim() : '';
    return !assignmentIds.has(strId) && !assignmentTitles.has(strTitle);
  });

  return [...fromAssignments, ...extraSubmitted];
}

export default function Home() {
  const [mounted, setMounted] = React.useState(false);
  
  // Database states
  const [assignmentsList, setAssignmentsList] = React.useState([]);
  const [submissionsList, setSubmissionsList] = React.useState([]);
  const [detailedContent, setDetailedContent] = React.useState(null);
  const [studentsList, setStudentsList] = React.useState([]);
  const [selectedStudentId, setSelectedStudentId] = React.useState('');
  const [studentAssignments, setStudentAssignments] = React.useState([]);
  const [dbLoading, setDbLoading] = React.useState(true);

  // Routing state
  const [role, setRole]   = React.useState("landing"); // landing | ta | student
  const [view, setView]   = React.useState("assignments");   // assignments | queue | grading | dashboard | feedback
  const [activeAssn, setActiveAssn] = React.useState(null);

  // For TA queue: student selections
  const [openSet, setOpenSet] = React.useState(new Set());
  const [focusedId, setFocusedId] = React.useState(null);

  // For student: active assignment
  const [studentAssnId, setStudentAssnId] = React.useState(null);

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
      clearLocalAssignments();
      const [remoteAssignments, remoteStudents] = await Promise.all([
        dbService.getAssignments(),
        dbService.getStudents(),
      ]);
      setAssignmentsList(remoteAssignments);
      setStudentsList(remoteStudents);
      setSelectedStudentId(prev => prev || remoteStudents[0]?.studentId || '');
      setActiveAssn(prev => prev || remoteAssignments[0]?.id || null);
      setDbLoading(false);
    }
    loadAssignments();
  }, []);

  // 2. Fetch submissions when active assignment changes
  React.useEffect(() => {
    if (!mounted) return;
    if (!activeAssn) {
      setSubmissionsList([]);
      setFocusedId(null);
      setDetailedContent(null);
      setDbLoading(false);
      return;
    }

    async function loadSubmissions() {
      setDbLoading(true);
      const currentAssn = assignmentsList.find(a => a.id === activeAssn);
      const data = await dbService.getSubmissions(activeAssn, currentAssn?.type);
      setSubmissionsList(data);
      setDetailedContent(null);
      
      const defaultFocus = data.find(s => s.isFocus) || data.find(s => s.status === 'ready') || data[0];
      setFocusedId(defaultFocus ? defaultFocus.id : null);
      setDbLoading(false);
    }
    loadSubmissions();
  }, [activeAssn, assignmentsList, mounted]);

  // 3. Fetch detailed content when focused submission changes
  React.useEffect(() => {
    if (!mounted) return;
    if (!focusedId) {
      setDetailedContent(null);
      return;
    }

    async function loadContent() {
      const currentAssn = assignmentsList.find(a => a.id === activeAssn) || { type: activeAssn };
      const data = await dbService.getSubmissionContent(focusedId, currentAssn.type);
      setDetailedContent(data);
    }
    loadContent();
  }, [focusedId, activeAssn, assignmentsList, mounted]);

  // 4. Fetch student assignments when role changes to student
  React.useEffect(() => {
    if (role === 'student' && mounted && selectedStudentId) {
      async function loadStudent() {
        const data = await dbService.getStudentAssignments(selectedStudentId);
        setStudentAssignments(data);
      }
      loadStudent();
    }
  }, [role, mounted, selectedStudentId]);

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
    setRole("landing");
    setView("assignments");
  };

  const goBack = () => {
    if (role === "ta") {
      if (view === "grading") {
        setView("queue");
        return;
      }
      if (view === "queue") {
        setView("assignments");
        return;
      }
      setRole("landing");
      return;
    }

    if (view === "feedback") {
      setView("dashboard");
      return;
    }
    setRole("landing");
  };

  const openCreatedAssignment = (assignment) => {
    setAssignmentsList(prev => {
      const next = [assignment, ...prev.filter(a => a.id !== assignment.id)];
      return next;
    });
    setActiveAssn(assignment.id);
    setSubmissionsList([]);
    setDetailedContent(null);
    setFocusedId(null);
    setOpenSet(new Set());
    setView("queue");
  };

  const handleCreateAssignment = async (draft) => {
    try {
      const created = await dbService.createAssignment({
        title: draft.title,
        type: draft.type || 'essay',
        assignment_type: draft.type || 'essay',
        rubric: draft.rubric || '',
        description: draft.description || '',
        deadline: draft.deadlineLabel || draft.deadline || '',
      });

      if (!created.deadline) {
        created.deadline = draft.deadlineLabel || draft.deadline;
      }

      openCreatedAssignment(created);
      showToast("새 과제가 n8n에 저장되었습니다.", "good");
      return;
    } catch (err) {
      if (err.result?.configured !== false) {
        console.warn('n8n assignment create failed:', err.message);
      }
    }

    showToast("n8n 과제 생성에 실패했습니다.");
  };

  if (!mounted) {
    return <div style={{ background: "var(--ink-100)", minHeight: "100vh" }} />;
  }

  // ------ LANDING ------
  if (role === "landing") {
    const metrics = buildLandingMetrics(assignmentsList, submissionsList, studentAssignments);
    return <Landing onPick={r => {
      setRole(r);
      setView(r === "ta" ? "assignments" : "dashboard");
    }} metrics={metrics} students={studentsList} selectedStudentId={selectedStudentId} onSelectStudent={setSelectedStudentId} />;
  }

  // ------ TA flow ------
  if (role === "ta") {
    const A = assignmentsList.find(a => a.id === activeAssn) || {
      id: activeAssn || '',
      course: '',
      courseShort: '',
      title: '과제를 선택하세요',
      deadline: '',
      avg: 0,
      aiAvg: 0,
      graded: 0,
      total: 0,
      type: activeAssn || ''
    };

    const students = submissionsList;
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

    const handleApprove = async (approval) => {
      if (!focused) return;

      const score = typeof approval === 'number' ? approval : approval.finalScore;
      const taFeedback = typeof approval === 'number' ? '' : approval.taFeedback || approval.summary || '';
      const categoryScores = typeof approval === 'number' ? [] : approval.category_scores || approval.categoryScores || [];
      let n8nSynced = false;

      try {
        await n8nService.approveGrade({
          submission_id: focused.submission_id || focused.id,
          final_score: Math.round(score * 10),
          display_final_score: score,
          ta_feedback: taFeedback || '',
          category_scores: categoryScores || [],
          score_scale: 10,
        });
        n8nSynced = true;
      } catch (err) {
        if (err.result?.configured !== false) {
          console.warn('n8n approval sync failed:', err.message);
        }
      }

      const res = await dbService.updateGrade(
        focused.id,
        score,
        'graded',
        taFeedback,
        categoryScores
      );

      if (n8nSynced) {
        showToast("승인 완료 — n8n 워크플로우까지 전송되었습니다.", "good");
      } else if (res.success) {
        showToast("승인 완료 — 성적이 성공적으로 저장되었습니다.", "good");
      } else {
        showToast("승인 완료 (로컬 반영)", "good");
      }

      const updated = await dbService.getSubmissions(activeAssn, A.type);
      setSubmissionsList(updated);
      
      next();
    };

    const handleRegenerateFeedback = async (tone) => {
      if (!focused) return null;

      const toneMap = {
        "격려 톤": "encouraging",
        "중립": "specific",
        "엄격": "strict",
      };

      try {
        const result = await n8nService.regenerateFeedback(
          focused.submission_id || focused.id,
          toneMap[tone] || "encouraging"
        );
        const regenerated = result?.ta_feedback || result?.data?.ta_feedback;
        if (regenerated) {
          showToast("피드백 초안을 n8n으로 재생성했습니다.", "good");
          return regenerated;
        }
      } catch (err) {
        if (err.result?.configured !== false) {
          console.warn('n8n feedback regeneration failed:', err.message);
          showToast("n8n 피드백 재생성에 실패했습니다.");
        }
      }

      return null;
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
                  onBack={goBack}
                  onOpen={(id) => {
                    if (Array.isArray(id)) id = id[0];
                    setFocusedId(id);
                    setView("grading");
                  }}
                  onSwitchAssignment={() => {
                    setOpenSet(new Set());
                    setView("assignments");
                  }}
                />
              )}
            </div>
          </div>
          <Dialogs.Toast msg={toast?.msg} kind={toast?.kind} />
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
                onCreateAssignment={handleCreateAssignment}
                onOpenAssignment={(assnType) => {
                  setActiveAssn(assnType);
                  setOpenSet(new Set());
                  setFocusedId(null);
                  setView("queue");
                }}
              />
            </div>
          </div>
          <Dialogs.Toast msg={toast?.msg} kind={toast?.kind} />
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
            onListClick={goBack}
          />
          <div className="body">
            {A.type === "essay" ? (
              <GradingEssay
                aiLayout={t.aiPanelLayout}
                focusedStudent={focused}
                submissionContent={detailedContent}
                onApprove={handleApprove}
                onOpenWarn={() => setWarnOpen(true)}
                onOpenSimilarity={() => setSimOpen(true)}
                onRegenerate={handleRegenerateFeedback}
              />
            ) : (
              <GradingCode
                aiLayout={t.aiPanelLayout}
                focusedStudent={focused}
                submissionContent={detailedContent}
                onApprove={handleApprove}
                onRegenerate={handleRegenerateFeedback}
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
    const selectedStudent = studentsList.find(student => student.studentId === selectedStudentId) || studentsList[0] || null;
    const list = buildStudentAssignmentList(assignmentsList, studentAssignments);
    const assn = list.find(a => a.id === studentAssnId) || list[0];

    const handleStudentSubmit = async (submission) => {
      if (!assn || !selectedStudent) return;

      try {
        const result = await n8nService.submitAssignment({
          student_name: selectedStudent.studentName,
          student_id: selectedStudent.studentId,
          assignment_title: assn.title,
          assignment_type: assn.type || 'essay',
          file_name: submission.fileName,
          rubric: assn.rubric || '',
          content: submission.content,
          test_cases: [],
        });

        const submittedAt = new Date().toLocaleString("ko-KR");
        const submitted = {
          ...assn,
          id: assn.id,
          assignmentId: assn.id,
          submission_id: result?.submission_id,
          feedback_id: result?.feedback_id,
          studentId: selectedStudent.studentId,
          studentName: selectedStudent.studentName,
          status: 'pending',
          submittedAt,
          fileName: submission.fileName,
        };

        setStudentAssignments(prev => [
          submitted,
          ...prev.filter(item => (item.assignmentId || item.assignment_id || item.id) !== assn.id),
        ]);
        showToast("과제가 n8n으로 제출되었습니다.", "good");
      } catch (err) {
        if (err.result?.configured !== false) {
          console.warn('n8n assignment submit failed:', err.message);
        }
        showToast("과제 제출에 실패했습니다.");
      }
    };

    if (view === "dashboard") {
      return (
        <div className="app">
          <Shell.GlobalRail role="student" onSwitch={switchRole} />
          <Shell.CourseRail role="student" active="assign" />
          <div className="main">
            <Shell.SimpleTopBar search />
            <div className="body">
              <StudentDashboard assignments={list} onOpen={(id) => { setStudentAssnId(id); setView("feedback"); }} />
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
            <button className="btn btn--quiet btn--sm" onClick={goBack} style={{ marginBottom: 8, alignSelf: "flex-start", gap: 6, display: 'inline-flex', alignItems: 'center' }}>
              <Icon.chevL width="14" height="14" /> 과제 목록으로
            </button>
            {assn ? (
              <StudentFeedback
                assignment={assn}
                student={selectedStudent}
                onSubmitAssignment={handleStudentSubmit}
                onAppeal={() => setAppealOpen(true)}
                onOpenResource={(r) => setPreviewRes(r)}
              />
            ) : (
              <div className="card card-pad">표시할 과제 결과가 없습니다.</div>
            )}
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
