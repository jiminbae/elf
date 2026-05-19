import { supabase } from './supabase';
import { MOCK } from '../data';

// Helper to safely format submission from DB structure to application structure
function mapSubmission(item) {
  const student = item.student || {};
  return {
    id: item.id,
    submission_id: item.id, // reference helper
    no: student.student_no || '',
    name: student.name || '알 수 없음',
    submittedAt: item.submitted_at,
    aiScore: item.ai_score,
    finalScore: item.final_score,
    status: item.status,
    suspicion: item.suspicion,
    similarity: item.similarity,
    hasWarning: item.has_warning,
    hasSimWarning: item.has_sim_warning,
    isFocus: item.is_focus,
    tests: item.tests
  };
}

export const dbService = {
  // 1. Fetch Assignments
  async getAssignments() {
    if (!supabase) {
      console.warn("Supabase client is null. Using fallback assignments mock data.");
      return [
        {
          id: "essay",
          course: "인문대 교양 | 003 분반 (World Literature | 003 Section)",
          courseShort: "세계문학의 이해",
          title: "카프카 『변신』 감상문 — 세계문학의 이해",
          deadline: "5월 26일 오후 11:59",
          avg: 7.4,
          aiAvg: 7.3,
          graded: 12,
          total: 45,
          type: "essay",
        },
        {
          id: "code",
          course: "공과대 전공 | 001 분반 (Data Structures | 001 Section)",
          courseShort: "자료구조 입문",
          title: "스택 클래스 구현 — Github 기반 협업 팀과제",
          deadline: "5월 26일 오후 11:59",
          avg: 7.2,
          aiAvg: 7.0,
          graded: 5,
          total: 32,
          type: "code",
        }
      ];
    }

    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .order('created_at', { ascending: true });

      if (error || !data || data.length === 0) {
        console.warn("Using fallback assignments mock data:", error?.message);
        return [
          {
            id: "essay",
            course: "인문대 교양 | 003 분반 (World Literature | 003 Section)",
            courseShort: "세계문학의 이해",
            title: "카프카 『변신』 감상문 — 세계문학의 이해",
            deadline: "5월 26일 오후 11:59",
            avg: 7.4,
            aiAvg: 7.3,
            graded: 12,
            total: 45,
            type: "essay",
          },
          {
            id: "code",
            course: "공과대 전공 | 001 분반 (Data Structures | 001 Section)",
            courseShort: "자료구조 입문",
            title: "스택 클래스 구현 — Github 기반 협업 팀과제",
            deadline: "5월 26일 오후 11:59",
            avg: 7.2,
            aiAvg: 7.0,
            graded: 5,
            total: 32,
            type: "code",
          }
        ];
      }

      return data.map(item => ({
        id: item.id,
        course: item.course,
        courseShort: item.course_short,
        title: item.title,
        deadline: item.deadline,
        avg: Number(item.avg || 0),
        aiAvg: Number(item.ai_avg || 0),
        graded: item.graded,
        total: item.total,
        type: item.type
      }));
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
      return [];
    }
  },

  // 2. Fetch Students / Submissions for a specific Assignment
  async getSubmissions(assignmentId) {
    if (!supabase) {
      console.warn(`Supabase client is null. Using fallback submissions mock data for ${assignmentId}.`);
      return assignmentId === 'essay' ? MOCK.TA_STUDENTS_ESSAY : MOCK.CODE_STUDENTS;
    }

    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*, student:students(*)')
        .eq('assignment_id', assignmentId)
        .order('id', { ascending: true });

      if (error || !data || data.length === 0) {
        console.warn(`Using fallback submissions mock data for assignment ${assignmentId}:`, error?.message);
        return assignmentId === 'essay' ? MOCK.TA_STUDENTS_ESSAY : MOCK.CODE_STUDENTS;
      }

      return data.map(mapSubmission);
    } catch (err) {
      console.error(`Failed to fetch submissions for ${assignmentId}:`, err);
      return [];
    }
  },

  // 3. Fetch detailed contents of a specific submission
  async getSubmissionContent(submissionId, assignmentType) {
    if (!supabase) {
      console.warn(`Supabase client is null. Using fallback detailed submission content for submission ${submissionId}.`);
      return assignmentType === 'essay' ? MOCK.ESSAY_DOC : MOCK.CODE_SUBMISSION;
    }

    try {
      const { data, error } = await supabase
        .from('submission_contents')
        .select('*')
        .eq('submission_id', submissionId)
        .single();

      if (error || !data) {
        console.warn(`Using fallback detailed submission content for submission ${submissionId}:`, error?.message);
        return assignmentType === 'essay' ? MOCK.ESSAY_DOC : MOCK.CODE_SUBMISSION;
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
  async updateGrade(submissionId, score, status = 'graded') {
    if (!supabase) {
      console.warn("Supabase client is null. Grade updated locally only.");
      return { success: false, error: 'Supabase client not initialized' };
    }

    try {
      const { data, error } = await supabase
        .from('submissions')
        .update({
          final_score: score,
          status: status,
          graded_at: new Date().toISOString()
        })
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
  async getStudentAssignments(studentNo = '20234113') {
    if (!supabase) {
      console.warn("Supabase client is null. Using fallback student assignments mock data.");
      return MOCK.STUDENT_ASSIGNMENTS;
    }

    try {
      // Find student first
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('student_no', studentNo)
        .single();

      if (!student) {
        return MOCK.STUDENT_ASSIGNMENTS;
      }

      const { data: submissions, error } = await supabase
        .from('submissions')
        .select('*, assignment:assignments(*)')
        .eq('student_id', student.id);

      if (error || !submissions || submissions.length === 0) {
        return MOCK.STUDENT_ASSIGNMENTS;
      }

      return submissions.map(sub => {
        const assn = sub.assignment || {};
        return {
          id: sub.id,
          course: assn.course || '',
          courseShort: assn.course_short || '',
          title: assn.title || '',
          type: assn.type || 'essay',
          status: sub.status,
          score: sub.final_score,
          total: 10,
          avg: assn.avg || 7.0,
          rank: sub.final_score >= 8.5 ? "상위 15%" : sub.final_score >= 7.0 ? "상위 38%" : "상위 50%",
          gradedAt: sub.graded_at || '',
          submittedAt: sub.submitted_at || '',
          deadline: assn.deadline || '',
          grader: "지정 조교"
        };
      });
    } catch (err) {
      console.error("Failed to fetch student assignments:", err);
      return MOCK.STUDENT_ASSIGNMENTS;
    }
  }
};
