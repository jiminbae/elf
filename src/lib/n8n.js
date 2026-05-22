const WEBHOOKS = {
  createAssignment: 'assignment/create',
  listAssignments: 'assignment/list',
  submitAssignment: 'assignment/submit',
  approveGrade: 'grade/approve',
  studentResult: 'student/result',
  listStudents: 'student/list',
  regenerateFeedback: 'feedback/regenerate',
  taQueue: 'ta/queue',
  submissionContent: 'submission/content',
};

async function callWebhook(path, payload = {}) {
  const response = await fetch('/api/n8n', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ path, payload }),
  });

  const result = await response.json().catch(() => ({
    success: false,
    message: 'Invalid response from n8n proxy',
  }));

  if (!response.ok || !result.success) {
    const detail = result.data ? ` ${JSON.stringify(result.data)}` : '';
    const status = result.status ? `HTTP ${result.status}` : `proxy HTTP ${response.status}`;
    const error = new Error(result.message || `n8n webhook failed: ${path} (${status}).${detail}`);
    error.result = result;
    throw error;
  }

  if (result.data?.success === false) {
    const error = new Error(result.data.message || `n8n webhook failed: ${path}`);
    error.result = result;
    throw error;
  }

  return result.data;
}

function normalizeScore(value) {
  if (value == null) return value;
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return value;
  return numberValue > 10 ? +(numberValue / 10).toFixed(1) : numberValue;
}

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

function unwrapFirst(value) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeStudentResult(data) {
  const item = unwrapFirst(data) || {};
  const record = item.json || item;
  const result = unwrapFirst(record.result || record.data || record.feedback || record) || {};

  return {
    ...record,
    result,
  };
}

function normalizeSubmissionContent(data) {
  const item = unwrapFirst(data) || {};
  const record = item.json || item;
  const content = unwrapFirst(record.content || record.data || record.submission || record) || {};
  return content.json || content;
}

function normalizeQueueStudent(student) {
  return {
    id: student.submission_id || student.id,
    submission_id: student.submission_id || student.id,
    feedback_id: student.feedback_id,
    no: student.no || student.student_id || '-',
    name: student.name || student.student_name || '이름 없음',
    submittedAt: student.submittedAt || student.submitted_at || '-',
    gradedAt: student.gradedAt || student.graded_at || '',
    grader: student.grader || '',
    aiScore: normalizeScore(student.aiScore ?? student.ai_score),
    finalScore: normalizeScore(student.finalScore ?? student.final_score),
    status: student.status,
    suspicion: student.suspicion ?? 0,
    similarity: student.similarity ?? 0,
    hasWarning: Boolean(student.hasWarning ?? student.has_warning),
    hasSimWarning: Boolean(student.hasSimWarning ?? student.has_sim_warning),
    assignmentTitle: student.assignmentTitle || student.assignment_title,
    assignmentType: student.assignmentType || student.assignment_type,
    fileName: student.fileName || student.file_name,
    filePath: student.filePath || student.file_path,
    fileMime: student.fileMime || student.file_mime,
    fileSize: student.fileSize || student.file_size,
    content: student.content,
    summary: student.summary || student.feedback_summary || '',
    taFeedback: student.taFeedback || student.ta_feedback || student.summary || '',
    grade: student.grade || '',
    categoryScores: parseMaybeJson(student.categoryScores ?? student.category_scores),
    strengths: parseMaybeJson(student.strengths),
    weaknesses: parseMaybeJson(student.weaknesses),
    mistakes: parseMaybeJson(student.mistakes),
    testResults: parseMaybeJson(student.testResults ?? student.test_results),
    learningRecommendations: parseMaybeJson(student.learningRecommendations ?? student.learning_recommendations),
    nextSteps: parseMaybeJson(student.nextSteps ?? student.next_steps),
  };
}

function normalizeAssignment(assignment = {}) {
  return {
    id: assignment.id,
    course: assignment.course || '',
    courseShort: assignment.courseShort || assignment.course_short || assignment.course || '',
    title: assignment.title || '',
    deadline: assignment.deadline || '',
    avg: Number(assignment.avg || 0),
    aiAvg: Number(assignment.aiAvg || assignment.ai_avg || 0),
    graded: Number(assignment.graded || 0),
    total: Number(assignment.total || 0),
    type: assignment.type || assignment.assignment_type || 'essay',
    description: assignment.description || '',
    rubric: assignment.rubric || '',
    referenceFileName: assignment.referenceFileName || assignment.reference_file_name || '',
    referenceFileMime: assignment.referenceFileMime || assignment.reference_file_mime || '',
    referenceFileSize: assignment.referenceFileSize || assignment.reference_file_size || 0,
    referenceFileContent: assignment.referenceFileContent || assignment.reference_file_content || '',
    createdAt: assignment.createdAt || assignment.created_at,
    updatedAt: assignment.updatedAt || assignment.updated_at,
  };
}

function normalizeStudent(student = {}) {
  const studentId = student.studentId || student.student_id || student.no || '';
  const studentName = student.studentName || student.student_name || student.name || '';

  return {
    id: student.id || studentId,
    studentName,
    studentId,
    email: student.email || '',
  };
}

export const n8nService = {
  async createAssignment(payload) {
    const data = await callWebhook(WEBHOOKS.createAssignment, payload);
    const assignment = normalizeAssignment(data?.assignment || data);
    if (!assignment.id) {
      throw new Error('n8n assignment/create response did not include assignment.id');
    }
    return assignment;
  },

  async listAssignments() {
    const data = await callWebhook(WEBHOOKS.listAssignments);
    const assignments = Array.isArray(data?.assignments) ? data.assignments : [];
    return assignments.map(normalizeAssignment);
  },

  async listStudents() {
    const data = await callWebhook(WEBHOOKS.listStudents);
    const students = Array.isArray(data?.students) ? data.students : Array.isArray(data) ? data : [];
    return students.map(normalizeStudent).filter(student => student.studentId && student.studentName);
  },

  async submitAssignment(payload) {
    return callWebhook(WEBHOOKS.submitAssignment, payload);
  },

  async approveGrade(payload) {
    return callWebhook(WEBHOOKS.approveGrade, payload);
  },

  async getStudentResult(submissionId) {
    const data = await callWebhook(WEBHOOKS.studentResult, { submission_id: submissionId });
    return normalizeStudentResult(data);
  },

  async getSubmissionContent(submissionId) {
    const data = await callWebhook(WEBHOOKS.submissionContent, { submission_id: submissionId });
    return normalizeSubmissionContent(data);
  },

  async regenerateFeedback(submissionId, tone = 'encouraging') {
    return callWebhook(WEBHOOKS.regenerateFeedback, {
      submission_id: submissionId,
      tone,
    });
  },

  async getQueue(assignmentType) {
    const data = await callWebhook(WEBHOOKS.taQueue, { assignment_type: assignmentType });
    const students = Array.isArray(data?.students) ? data.students.map(normalizeQueueStudent) : [];

    if (!assignmentType) return { ...data, students };

    return {
      ...data,
      students: students.filter(student => (
        !student.assignmentType || student.assignmentType === assignmentType
      )),
    };
  },
};
