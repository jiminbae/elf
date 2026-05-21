import { supabase } from './supabase';
import { n8nService } from './n8n';

const SAMPLE_STUDENTS = [
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
].map(student => ({ id: student.studentId, ...student }));

// Helper to safely format submission from DB structure to application structure
function mapSubmission(item) {
  const student = item.student || {};
  return {
    id: item.id,
    submission_id: item.id, // reference helper
    no: student.student_no || student.student_id || '',
    name: student.student_name || student.name || '알 수 없음',
    submittedAt: item.submitted_at,
    aiScore: item.ai_score,
    finalScore: item.final_score,
    status: item.status,
    suspicion: item.suspicion,
    similarity: item.similarity,
    hasWarning: item.has_warning,
    hasSimWarning: item.has_sim_warning,
    isFocus: item.is_focus,
    tests: item.tests,
    taFeedback: item.ta_feedback || item.feedback || '',
  };
}

function parseJson(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'object') return value;

  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

export const dbService = {
  async getStudents() {
    if (supabase.isConfigured) {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('id, student_name, student_id, email')
          .order('student_id', { ascending: true });

        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map(student => ({
            id: student.id,
            studentName: student.student_name || student.name || '',
            studentId: student.student_id || student.student_no || '',
            email: student.email || '',
          })).filter(student => student.studentId);
        }

        if (error) {
          console.warn('Student fetch failed:', error.message);
        }
      } catch (err) {
        console.error('Failed to fetch students from Supabase:', err);
      }
    }

    try {
      const students = await n8nService.listStudents();
      if (students.length > 0) {
        return students;
      }
    } catch (err) {
      if (err.result?.configured !== false) {
        console.warn('n8n student list fetch failed:', err.message);
      }
    }

    return SAMPLE_STUDENTS;
  },

  async createAssignment(payload) {
    return n8nService.createAssignment(payload);
  },
  // 1. Fetch Assignments
  async getAssignments() {
    try {
      const assignments = await n8nService.listAssignments();
      if (assignments.length > 0) {
        return assignments;
      }
    } catch (err) {
      if (err.result?.configured !== false) {
        console.warn('n8n assignment list fetch failed:', err.message);
      }
    }

    try {
      const queue = await n8nService.getQueue();
      if (queue?.assignment && queue?.students?.length > 0) {
        const assignment = queue.assignment;
        return [{
          id: assignment.id || assignment.type || 'n8n',
          course: assignment.course || '',
          courseShort: assignment.courseShort || assignment.course || '',
          title: assignment.title || 'n8n 과제',
          deadline: assignment.deadline || '',
          avg: Number(assignment.avg || 0),
          aiAvg: Number(assignment.aiAvg || assignment.avg || 0),
          graded: assignment.graded || 0,
          total: queue.students?.length || 0,
          type: assignment.type || assignment.assignment_type || 'n8n',
        }];
      }
    } catch (err) {
      if (err.result?.configured !== false) {
        console.warn('n8n queue assignment fetch failed:', err.message);
      }
    }

    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .order('created_at', { ascending: true });

      if (error || !data || data.length === 0) {
        if (error) console.warn('Assignment fetch failed:', error.message);
        return [];
      }

      return data.map(item => ({
        id: item.id,
        course: item.course || '',
        courseShort: item.course_short || item.course || '',
        title: item.title || '',
        deadline: item.deadline || '',
        avg: Number(item.avg || 0),
        aiAvg: Number(item.ai_avg || 0),
        graded: Number(item.graded || 0),
        total: Number(item.total || 0),
        type: item.type || item.assignment_type || 'essay',
        description: item.description || '',
        rubric: item.rubric || '',
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
      return [];
    }
  },

  // 2. Fetch Students / Submissions for a specific Assignment
  async getSubmissions(assignmentId, assignmentType) {
    try {
      const queue = await n8nService.getQueue(assignmentType || assignmentId);
      if (queue?.students?.length > 0) {
        return queue.students;
      }
    } catch (err) {
      if (err.result?.configured !== false) {
        console.warn(`n8n queue fetch failed for assignment ${assignmentId}:`, err.message);
      }
    }

    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*, student:students(*)')
        .eq('assignment_id', assignmentId)
        .order('id', { ascending: true });

      if (error || !data || data.length === 0) {
        if (error) console.warn(`Submission fetch failed for assignment ${assignmentId}:`, error.message);
        return [];
      }

      return data.map(mapSubmission);
    } catch (err) {
      console.error(`Failed to fetch submissions for ${assignmentId}:`, err);
      return [];
    }
  },

  // 3. Fetch detailed contents of a specific submission
  async getSubmissionContent(submissionId, assignmentType) {
    try {
      const { data, error } = await supabase
        .from('submission_contents')
        .select('*')
        .eq('submission_id', submissionId)
        .single();

      if (error || !data) {
        if (error) console.warn(`Submission content fetch failed for submission ${submissionId}:`, error.message);
        return null;
      }

      if (assignmentType === 'essay') {
        return {
          title: data.essay_title || '제목 없음',
          author: data.essay_author || '저자 없음',
          course: data.essay_course || '과목 없음',
          paragraphs: data.paragraphs || []
        };
      } else {
        return {
          filename: data.filename || 'code.py',
          lines: data.lines || 0,
          bytes: data.bytes || 0,
          submittedAt: data.created_at,
          tokens: data.tokens || []
        };
      }
    } catch (err) {
      console.error(`Failed to fetch submission content for ${submissionId}:`, err);
      return null;
    }
  },

  // 4. Update submission scores and status
  async updateGrade(submissionId, score, status = 'graded', feedback = '', categoryScores = []) {
    try {
      if (!supabase.isConfigured) {
        return { success: false, skipped: true, error: 'Supabase credentials not configured' };
      }

      const updatePayload = {
        final_score: score,
        status,
        graded_at: new Date().toISOString(),
      };

      if (feedback) {
        updatePayload.ta_feedback = feedback;
      }

      if (Array.isArray(categoryScores) && categoryScores.length > 0) {
        updatePayload.category_scores = categoryScores;
      }

      const { data, error } = await supabase
        .from('submissions')
        .update(updatePayload)
        .eq('id', submissionId)
        .select();

      if (error) {
        throw new Error(error.message);
      }
      return { success: true, data };
    } catch (err) {
      console.error(`Failed to update grade for submission ${submissionId}:`, err);
      return { success: false, error: err.message };
    }
  },

  // 5. Fetch student dashboard assignments
  async getStudentAssignments(studentNo) {
    try {
      if (!studentNo) return [];

      try {
        const queue = await n8nService.getQueue();
        const rows = Array.isArray(queue?.students)
          ? queue.students.filter(student => student.no === studentNo)
          : [];

        if (rows.length > 0) {
          return rows.map(row => ({
            id: row.assignmentTitle || row.id,
            assignmentId: row.assignmentTitle || row.id,
            submission_id: row.id,
            feedback_id: row.feedback_id,
            course: queue.assignment?.course || '',
            courseShort: queue.assignment?.courseShort || queue.assignment?.course || '',
            title: row.assignmentTitle || queue.assignment?.title || '',
            type: row.assignmentType || queue.assignment?.type || 'essay',
            status: row.status === 'ready' ? 'pending' : row.status,
            score: row.finalScore ?? row.aiScore,
            total: 10,
            avg: queue.assignment?.avg || null,
            submittedAt: row.submittedAt || '',
            deadline: queue.assignment?.deadline || '',
            grader: row.status === 'graded' ? 'TA' : '',
          }));
        }
      } catch (err) {
        if (err.result?.configured !== false) {
          console.warn(`n8n student assignment fetch failed for ${studentNo}:`, err.message);
        }
      }

      const { data: textSubmissions, error: textError } = await supabase
        .from('submissions')
        .select('*')
        .eq('student_id', studentNo);

      if (!textError && textSubmissions && textSubmissions.length > 0) {
        return textSubmissions.map(sub => ({
          id: sub.assignment_title || sub.id,
          assignmentId: sub.assignment_title || sub.id,
          submission_id: sub.id,
          course: '',
          courseShort: '',
          title: sub.assignment_title || '',
          type: sub.assignment_type || 'essay',
          status: sub.status === 'ai_graded' ? 'pending' : sub.status,
          score: sub.final_score ?? sub.ai_score ?? 0,
          total: 10,
          submittedAt: sub.submitted_at || sub.created_at || '',
          deadline: '',
          fileName: sub.file_name || '',
          taFeedback: sub.ta_feedback || sub.feedback || '',
          category_scores: parseJson(sub.category_scores),
          strengths: parseJson(sub.strengths),
          weaknesses: parseJson(sub.weaknesses),
          mistakes: parseJson(sub.mistakes),
          learning_recommendations: parseJson(sub.learning_recommendations),
          next_steps: parseJson(sub.next_steps),
        }));
      }

      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('student_id', studentNo)
        .single();

      if (!student) {
        return [];
      }

      const { data: submissions, error } = await supabase
        .from('submissions')
        .select('*, assignment:assignments(*)')
        .eq('student_id', student.id);

      if (error || !submissions || submissions.length === 0) {
        return [];
      }

      return submissions.map(sub => {
        const assn = sub.assignment || {};
        return {
          id: sub.id,
          assignmentId: sub.assignment_id || sub.assignment_title || sub.id,
          submission_id: sub.id,
          feedback_id: sub.feedback_id,
          course: assn.course || '',
          courseShort: assn.course_short || assn.course || '',
          title: assn.title || sub.assignment_title || '',
          type: assn.type || sub.assignment_type || 'essay',
          status: sub.status,
          score: sub.final_score ?? sub.ai_score ?? 0,
          total: 10,
          avg: assn.avg || null,
          rank: sub.rank || '',
          gradedAt: sub.graded_at || '',
          submittedAt: sub.submitted_at || sub.created_at || '',
          deadline: assn.deadline || '',
          grader: sub.grader || '',
          taFeedback: sub.ta_feedback || sub.feedback || '',
          category_scores: parseJson(sub.category_scores),
          strengths: parseJson(sub.strengths),
          weaknesses: parseJson(sub.weaknesses),
          mistakes: parseJson(sub.mistakes),
          learning_recommendations: parseJson(sub.learning_recommendations),
          next_steps: parseJson(sub.next_steps),
        };
      });
    } catch (err) {
      console.error("Failed to fetch student assignments:", err);
      return [];
    }
  }
};
