// In-memory mock data store used when Supabase is not configured.
// Switches off automatically once NEXT_PUBLIC_SUPABASE_URL + KEY are present
// (see supabase.isConfigured in src/lib/supabase.js).
//
// Lifecycle: state lives only for the current browser session.
// TA approvals mutate this store so the student screen reflects the changes
// immediately within the same session.

import { supabase } from './supabase';

const STUDENTS = [
  { studentName: '김민준', studentId: '20240001', email: 'minjun.kim@example.com' },
  { studentName: '이서연', studentId: '20240002', email: 'seoyeon.lee@example.com' },
  { studentName: '박지훈', studentId: '20240003', email: 'jihoon.park@example.com' },
  { studentName: '최하은', studentId: '20240004', email: 'haeun.choi@example.com' },
  { studentName: '정도윤', studentId: '20240005', email: 'doyoon.jung@example.com' },
  { studentName: '강지우', studentId: '20240006', email: 'jiwoo.kang@example.com' },
  { studentName: '조현우', studentId: '20240007', email: 'hyunwoo.cho@example.com' },
  { studentName: '윤서아', studentId: '20240008', email: 'seoa.yoon@example.com' },
  { studentName: '장유진', studentId: '20240009', email: 'yujin.jang@example.com' },
  { studentName: '임준서', studentId: '20240010', email: 'junseo.lim@example.com' },
];

const ASSIGNMENTS = [
  {
    id: 'mock-essay-1',
    course: '국어국문학과 · 현대문학특강',
    courseShort: '현대문학',
    title: '카프카 「변신」 비평 에세이 (2,000자)',
    deadline: '2026-05-30 23:59',
    type: 'essay',
    avg: 7.4,
    aiAvg: 7.1,
    total: 10,
    rubric: '논지 명확성(3) / 근거 적절성(3) / 논리 구성(2) / 문장 표현(2)',
    description: '카프카의 「변신」에서 소외(Entfremdung)가 드러나는 양상을 세 층위에서 분석하시오.',
  },
  {
    id: 'mock-code-1',
    course: '컴퓨터학부 · 자료구조',
    courseShort: '자료구조',
    title: 'Stack 클래스 구현 (Python)',
    deadline: '2026-06-05 23:59',
    type: 'code',
    avg: 7.8,
    aiAvg: 7.5,
    total: 10,
    rubric: '기능 구현(5) / 예외 처리(2) / 코드 스타일(2) / 시간복잡도(1)',
    description: 'push/pop/peek/is_empty 메소드를 가진 Stack 클래스를 구현하시오. 빈 스택에서 pop 시 CustomError를 발생시켜야 합니다.',
  },
];

const ESSAY_PARAGRAPHS = [
  [{ t: '카프카의 「변신」은 한 가족의 일상 속에서 인간이 어떻게 점진적으로 사회·노동·자아의 세 층위에서 소외(Entfremdung)되는지를 그려낸 텍스트이다. 본 글은 작중 그레고르의 변신 이후 가족 구성원들의 반응 변화를 통해 가족 내 소외를, 출장 영업사원이라는 직업적 위치를 통해 노동 소외를, 그리고 곤충으로 변한 신체와 인간적 의식 사이의 균열을 통해 자아 소외를 살펴본다.' }],
  [{ t: '먼저 가족 내 소외는 그레테의 태도 변화에서 가장 분명하게 드러난다. 초기에는 그가 "오빠를 도와주고 싶다"고 말하며 음식을 챙기지만, 후반부에 이르러서는 "저것을 없애야 한다"고까지 단언한다. 이러한 변화는 단순한 감정의 추이가 아니라, 가족이라는 공동체가 경제적 부담을 매개로 어떻게 해체되는지를 압축적으로 보여준다.' }],
  [{ t: '다음으로 노동 소외 차원에서, 그레고르는 변신 이전부터 이미 자신의 노동으로부터 분리된 상태였다. 그는 단지 가족의 빚을 갚기 위한 도구로 자신을 인식하고 있으며, 이는 마르크스가 말한 노동의 외화(外化) 개념과 일치한다.' }],
  [{ t: '마지막으로 자아 소외는 곤충의 신체에 갇힌 인간 의식이라는 그로테스크한 설정을 통해 극화된다. 그레고르는 자신이 곤충임을 알면서도 가족 부양에 대한 책임감을 놓지 못한다. 결국 자아의 가장 깊은 층위까지 외부의 요구에 의해 잠식되었음이 드러난다.' }],
  [{ t: '결론적으로 「변신」은 한 인간이 어떻게 가족·노동·자아의 세 층위에서 동시적으로 소외되는지를 정교하게 그려낸 작품이며, 그 소외는 외적 사건이 아니라 일상적 관계 속에서 누적되는 균열의 결과임을 보여준다.' }],
];

const CODE_LINES = [
  'class Stack:',
  '    def __init__(self):',
  '        self.items = []',
  '',
  '    def push(self, item):',
  '        self.items.append(item)',
  '',
  '    def pop(self):',
  '        return self.items.pop()  # 빈 스택에서 IndexError 발생 가능',
  '',
  '    def peek(self):',
  '        if self.is_empty():',
  '            return None',
  '        return self.items[-1]',
  '',
  '    def is_empty(self):',
  '        return len(self.items) == 0',
  '',
  'if __name__ == "__main__":',
  '    s = Stack()',
  '    s.push(1); s.push(2)',
  '    print(s.pop())',
];

function essayContent() {
  return ESSAY_PARAGRAPHS.map(p => p[0].t).join('\n\n');
}

function codeContent() {
  return CODE_LINES.join('\n');
}

// Generates per-student AI score + feedback that vary deterministically by student
function buildInitialSubmission(student, assignment, idx) {
  const isEssay = assignment.type === 'essay';
  const baseScore = 6 + ((idx * 7) % 35) / 10; // 6.0 ~ 9.5
  const aiScore = +baseScore.toFixed(1);

  const essayCategories = [
    { name: '논지의 명확성', score: +(aiScore * 0.32).toFixed(1), max_score: 3 },
    { name: '근거의 적절성', score: +(aiScore * 0.28).toFixed(1), max_score: 3 },
    { name: '논리적 구성', score: +(aiScore * 0.22).toFixed(1), max_score: 2 },
    { name: '문장 표현', score: +(aiScore * 0.18).toFixed(1), max_score: 2 },
  ];
  const codeCategories = [
    { name: '기능 구현', score: +Math.min(5, aiScore * 0.55).toFixed(1), max_score: 5 },
    { name: '예외 처리', score: +Math.min(2, aiScore * 0.18).toFixed(1), max_score: 2 },
    { name: '코드 스타일', score: +Math.min(2, aiScore * 0.18).toFixed(1), max_score: 2 },
    { name: '시간복잡도', score: +Math.min(1, aiScore * 0.09).toFixed(1), max_score: 1 },
  ];

  const essayStrengths = [
    '도입부에서 핵심 논지("소외의 세 층위")를 명확히 제시함',
    '그레테의 발화 인용을 작품 텍스트로 정확히 근거 제시',
    '단락 간 응집도가 높고 키워드 일관성이 우수함',
  ];
  const essayWeaknesses = [
    '3문단의 외부 이론 인용(마르크스)이 작품 텍스트와의 연결이 부족함',
    '결론부가 도입에서 제시한 세 층위를 종합하지 못함',
  ];
  const codeStrengths = [
    'push/peek/is_empty 메소드가 의도대로 동작함',
    '네이밍이 PEP8 가이드에 부합함',
  ];
  const codeWeaknesses = [
    'pop() 호출 시 빈 스택에 대한 CustomError 처리가 누락됨',
    'docstring이 전혀 없어 가독성 저하',
  ];

  return {
    submission_id: `${assignment.id}__${student.studentId}`,
    id: `${assignment.id}__${student.studentId}`,
    assignment_id: assignment.id,
    assignment_title: assignment.title,
    assignment_type: assignment.type,
    no: student.studentId,
    name: student.studentName,
    student_id: student.studentId,
    student_name: student.studentName,
    submittedAt: `2026-05-${20 + (idx % 8)} ${10 + (idx % 8)}:${(idx * 7) % 60 < 10 ? '0' : ''}${(idx * 7) % 60}`,
    status: 'ready', // 'ready' | 'graded'
    aiScore,
    finalScore: aiScore, // matches AI until TA approves
    grader: '',
    gradedAt: '',
    suspicion: 5 + (idx * 3) % 25,
    similarity: (idx * 4) % 15,
    hasWarning: false,
    hasSimWarning: false,
    fileName: isEssay ? '에세이.docx' : 'stack.py',
    fileSize: isEssay ? 12340 : 1024,
    taFeedback: isEssay
      ? `전반적으로 논지가 명확하고 작품 텍스트를 근거로 활용한 점이 좋습니다. 다만 3문단에서 마르크스 이론을 인용한 부분이 작품과 충분히 연결되지 못한 인상이 있고, 결론이 서론의 세 층위 분석을 종합하지 못한 채 마무리되어 아쉽습니다. 다음 글에서는 이론 인용 시 반드시 작품 텍스트의 구체적 장면과 짝지어 제시하고, 결론에서 본문 구조를 한 번 더 회수해보세요.`
      : `자료구조 기본 동작은 정확히 구현되었습니다. 다만 pop() 호출 시 빈 스택에 대한 예외 처리가 누락되어 IndexError가 그대로 노출됩니다. is_empty() 체크 후 CustomError를 raise하는 패턴으로 보완하면 좋겠습니다. docstring을 함수마다 한 줄씩만 추가해도 가독성이 크게 향상됩니다.`,
    summary: '',
    categoryScores: isEssay ? essayCategories : codeCategories,
    strengths: isEssay ? essayStrengths : codeStrengths,
    weaknesses: isEssay ? essayWeaknesses : codeWeaknesses,
    mistakes: [],
    testResults: isEssay ? [] : [
      { name: 'test_push_appends', status: 'ok' },
      { name: 'test_peek_no_mutate', status: 'ok' },
      { name: 'test_pop_returns_top', status: 'ok' },
      { name: 'test_pop_empty_raises_custom', status: 'fail' },
      { name: 'test_usage_example_stdout', status: 'ok' },
    ],
    learningRecommendations: isEssay
      ? ['이론-텍스트 연결 글쓰기', '문단별 핵심어 분포 분석', '결론 구조화 연습']
      : ['파이썬 예외 처리 디자인 패턴', 'docstring 작성 가이드'],
    nextSteps: isEssay
      ? ['다음 과제: 「소송」 분석 에세이에서 이론과 텍스트의 결합 시도하기']
      : ['Queue 클래스 구현 과제에서 동일한 예외 처리 패턴 적용해보기'],
  };
}

function seedSubmissions() {
  const map = new Map();
  ASSIGNMENTS.forEach(assignment => {
    STUDENTS.forEach((student, idx) => {
      const sub = buildInitialSubmission(student, assignment, idx);
      map.set(sub.submission_id, sub);
    });
  });
  return map;
}

// In-memory state — persists for the lifetime of the JS module (i.e. browser tab)
const state = {
  submissions: seedSubmissions(),
};

// ---- public API used by dbService ----

export const mockStore = {
  isActive() {
    return !supabase.isConfigured;
  },

  getStudents() {
    return STUDENTS.map(s => ({ id: s.studentId, ...s }));
  },

  getAssignments() {
    return ASSIGNMENTS.map(a => ({
      ...a,
      graded: [...state.submissions.values()].filter(s => s.assignment_id === a.id && s.status === 'graded').length,
      total: STUDENTS.length,
    }));
  },

  getSubmissionsForAssignment(assignmentId) {
    return [...state.submissions.values()]
      .filter(s => s.assignment_id === assignmentId)
      .map(s => ({ ...s }));
  },

  getStudentAssignments(studentNo) {
    return ASSIGNMENTS.map(assignment => {
      const subKey = `${assignment.id}__${studentNo}`;
      const sub = state.submissions.get(subKey);
      if (!sub) return null;

      const isGraded = sub.status === 'graded';
      return {
        id: assignment.id,
        assignmentId: assignment.id,
        submission_id: sub.submission_id,
        course: assignment.course,
        courseShort: assignment.courseShort,
        title: assignment.title,
        type: assignment.type,
        status: isGraded ? 'graded' : 'pending',
        score: sub.finalScore ?? sub.aiScore ?? 0,
        total: assignment.total || 10,
        avg: assignment.avg,
        submittedAt: sub.submittedAt,
        gradedAt: sub.gradedAt || '',
        deadline: assignment.deadline,
        grader: sub.grader || (isGraded ? 'TA (남규리)' : ''),
        fileName: sub.fileName,
        taFeedback: sub.taFeedback || '',
        category_scores: sub.categoryScores || [],
        strengths: sub.strengths || [],
        weaknesses: sub.weaknesses || [],
        mistakes: sub.mistakes || [],
        learning_recommendations: sub.learningRecommendations || [],
        next_steps: sub.nextSteps || [],
      };
    }).filter(Boolean);
  },

  getSubmissionContent(submissionId, assignmentType) {
    const sub = state.submissions.get(submissionId);
    if (!sub) return null;

    if (assignmentType === 'essay' || sub.assignment_type === 'essay') {
      const content = essayContent();
      return {
        filename: sub.fileName,
        title: '카프카 「변신」 — 소외의 세 층위',
        author: sub.name,
        course: '현대문학특강',
        characters: content.length,
        bytes: sub.fileSize,
        submittedAt: sub.submittedAt,
        content,
        paragraphs: ESSAY_PARAGRAPHS,
      };
    }

    const content = codeContent();
    return {
      filename: sub.fileName,
      lines: CODE_LINES.length,
      bytes: sub.fileSize,
      submittedAt: sub.submittedAt,
      tokens: CODE_LINES.map(line => ([{ t: line || ' ', c: line.trim().startsWith('#') ? 'cmt' : '' }])),
    };
  },

  updateGrade(submissionId, score, status, feedback, categoryScores, aiFields = {}) {
    const sub = state.submissions.get(submissionId);
    if (!sub) return { success: false, error: 'mockStore: submission not found' };

    sub.finalScore = score;
    sub.status = status || 'graded';
    sub.taFeedback = feedback ?? sub.taFeedback;
    sub.gradedAt = new Date().toLocaleString('ko-KR');
    sub.grader = sub.grader || 'TA (남규리)';
    if (Array.isArray(categoryScores) && categoryScores.length > 0) {
      sub.categoryScores = categoryScores;
    }
    if (aiFields.aiScore != null) sub.aiScore = aiFields.aiScore;
    if (Array.isArray(aiFields.strengths) && aiFields.strengths.length > 0) sub.strengths = aiFields.strengths;
    if (Array.isArray(aiFields.weaknesses) && aiFields.weaknesses.length > 0) sub.weaknesses = aiFields.weaknesses;
    if (Array.isArray(aiFields.mistakes) && aiFields.mistakes.length > 0) sub.mistakes = aiFields.mistakes;
    if (Array.isArray(aiFields.learningRecommendations) && aiFields.learningRecommendations.length > 0) {
      sub.learningRecommendations = aiFields.learningRecommendations;
    }
    if (Array.isArray(aiFields.nextSteps) && aiFields.nextSteps.length > 0) sub.nextSteps = aiFields.nextSteps;

    return { success: true };
  },
};
