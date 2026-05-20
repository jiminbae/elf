import { supabase } from './supabase';
import { n8nService } from './n8n';

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
  async updateGrade(submissionId, score, status = 'graded') {
    try {
      if (!supabase.isConfigured) {
        return { success: false, skipped: true, error: 'Supabase credentials not configured' };
      }

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
  async getStudentAssignments(studentNo) {
    try {
      if (!studentNo) return [];

      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('student_no', studentNo)
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
          course: assn.course || '',
          courseShort: assn.course_short || '',
          title: assn.title || '',
          type: assn.type || 'essay',
          status: sub.status,
          score: sub.final_score,
          total: 10,
          avg: assn.avg || null,
          rank: sub.rank || '',
          gradedAt: sub.graded_at || '',
          submittedAt: sub.submitted_at || '',
          deadline: assn.deadline || '',
          grader: sub.grader || ''
        };
      });
    } catch (err) {
      console.error("Failed to fetch student assignments:", err);
      return [];
    }
  }
};
