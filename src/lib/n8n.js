const WEBHOOKS = {
  createAssignment: 'assignment/create',
  listAssignments: 'assignment/list',
  submitAssignment: 'assignment/submit',
  approveGrade: 'grade/approve',
  studentResult: 'student/result',
  listStudents: 'student/list',
  regenerateFeedback: 'feedback/regenerate',
  taQueue: 'ta/queue',
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

function normalizeQueueStudent(student) {
  return {
    id: student.id,
    feedback_id: student.feedback_id,
    no: student.no || '-',
    name: student.name || '이름 없음',
    submittedAt: student.submittedAt || '-',
    aiScore: normalizeScore(student.aiScore),
    finalScore: normalizeScore(student.finalScore),
    status: student.status,
    suspicion: student.suspicion ?? 0,
    similarity: student.similarity ?? 0,
    hasWarning: Boolean(student.hasWarning),
    hasSimWarning: Boolean(student.hasSimWarning),
    assignmentTitle: student.assignmentTitle,
    assignmentType: student.assignmentType,
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
    return callWebhook(WEBHOOKS.studentResult, { submission_id: submissionId });
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
