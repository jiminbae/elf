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
// n8n 워크플로우는 AI 결과를 별도 feedbacks 테이블에 저장하므로 join 결과도 처리
function mapSubmission(item) {
  const student = item.student || {};
  // Supabase join 시 feedbacks는 배열로 반환됨 (1:N 관계)
  const fbArr = item.feedbacks;
  const fb = Array.isArray(fbArr) ? (fbArr[0] || {}) : (fbArr || {});
  return {
    id: item.id,
    submission_id: item.id,
    feedback_id: fb.id || item.feedback_id,
    no: student.student_no || student.student_id || item.student_id || '',
    name: student.student_name || student.name || item.student_name || '알 수 없음',
    submittedAt: item.submitted_at,
    aiScore: fb.ai_score ?? item.ai_score,
    finalScore: fb.final_score ?? item.final_score,
    grade: fb.grade || item.grade,
    status: item.status,
    suspicion: item.suspicion,
    similarity: item.similarity,
    hasWarning: item.has_warning,
    hasSimWarning: item.has_sim_warning,
    isFocus: item.is_focus,
    tests: item.tests,
    taFeedback: fb.ta_feedback || item.ta_feedback || item.feedback || '',
    categoryScores: fb.category_scores || item.category_scores,
    strengths: fb.strengths || item.strengths,
    weaknesses: fb.weaknesses || item.weaknesses,
    mistakes: fb.mistakes || item.mistakes,
    learningRecommendations: fb.learning_recommendations || item.learning_recommendations,
    nextSteps: fb.next_steps || item.next_steps,
  };
}


function getTextByteSize(value) {
  const text = String(value || '');
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(text).length;
  }
  return text.length;
}

function codeToTokens(content) {
  return String(content || '').split(/\r?\n/).map(line => ([{ t: line || ' ', c: line.trim().startsWith('#') ? 'cmt' : '' }]));
}

function extractSubmissionText(source = {}) {
  return String(
    source.content
    || source.text
    || source.body
    || source.file_content
    || source.submission_file_content
    || source.submission_content
    || ''
  );
}

function textToEssayParagraphs(content) {
  const text = String(content || '').trim();
  if (!text) return [];

  const blocks = text.split(/\n\s*\n/).map(block => block.trim()).filter(Boolean);
  return (blocks.length > 0 ? blocks : [text]).map(block => ([{ t: block }]));
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
    // 1. n8n 우선
    try {
      const assignment = await n8nService.createAssignment(payload);
      if (assignment.id) return assignment;
    } catch (err) {
      if (err.result?.configured !== false) {
        console.warn('n8n createAssignment failed, falling back to Supabase:', err.message);
      }
    }

    // 2. Supabase 직접 INSERT fallback
    if (!supabase.isConfigured) {
      throw new Error('과제 생성 실패: n8n과 Supabase 모두 설정되지 않았습니다.');
    }

    const { data, error } = await supabase
      .from('assignments')
      .insert({
        title: payload.title,
        type: payload.type || payload.assignment_type || 'essay',
        rubric: payload.rubric || '',
        description: payload.description || '',
        deadline: payload.deadline || null,
        reference_file_name: payload.reference_file_name || '',
        reference_file_mime: payload.reference_file_mime || '',
        reference_file_size: payload.reference_file_size || 0,
        reference_file_content: payload.reference_file_content || '',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data.id,
      course: data.course || '',
      courseShort: data.course_short || '',
      title: data.title,
      deadline: data.deadline || payload.deadline || '',
      avg: 0,
      aiAvg: 0,
      graded: 0,
      total: 0,
      type: data.type || 'essay',
      description: data.description || '',
      rubric: data.rubric || '',
      referenceFileName: data.reference_file_name || '',
      createdAt: data.created_at,
    };
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
      // feedbacks 테이블도 join — n8n이 AI 결과를 feedbacks에 저장하기 때문
      const { data, error } = await supabase
        .from('submissions')
        .select('*, student:students(*), feedbacks(id, ai_score, final_score, grade, ta_feedback, category_scores, strengths, weaknesses, mistakes, test_results, learning_recommendations, next_steps, status)')
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
  async getSubmissionContent(submissionId, assignmentType, fallback = {}) {
    try {
      const n8nContent = await n8nService.getSubmissionContent(submissionId);
      if (n8nContent) {
        const content = extractSubmissionText(n8nContent);

        if (assignmentType === 'essay') {
          return {
            filename: n8nContent.filename || n8nContent.file_name || 'submission.txt',
            title: n8nContent.title || n8nContent.filename || n8nContent.file_name || '제출물',
            author: '',
            course: '',
            characters: content.length || n8nContent.characters || 0,
            bytes: n8nContent.bytes || n8nContent.file_size || getTextByteSize(content),
            submittedAt: n8nContent.submittedAt || n8nContent.submitted_at,
            content,
            paragraphs: textToEssayParagraphs(content),
            filePath: n8nContent.filePath || n8nContent.file_path || '',
            mime: n8nContent.mime || n8nContent.file_mime || '',
          };
        }

        return {
          filename: n8nContent.filename || n8nContent.file_name || 'code.py',
          lines: n8nContent.lines || (content ? content.split(/\r?\n/).length : 0),
          bytes: n8nContent.bytes || n8nContent.file_size || getTextByteSize(content),
          submittedAt: n8nContent.submittedAt || n8nContent.submitted_at,
          tokens: Array.isArray(n8nContent.tokens) ? n8nContent.tokens : codeToTokens(content),
          filePath: n8nContent.filePath || n8nContent.file_path || '',
          mime: n8nContent.mime || n8nContent.file_mime || '',
        };
      }
    } catch (err) {
      if (err.result?.configured !== false) {
        console.warn(`n8n submission content fetch failed for submission ${submissionId}:`, err.message);
      }
    }

    try {
      const { data, error } = await supabase
        .from('submission_contents')
        .select('*')
        .eq('submission_id', submissionId)
        .single();

      if (!error && data) {
        if (assignmentType === 'essay') {
          const content = extractSubmissionText(data);
          return {
            filename: data.filename || data.file_name || 'submission.txt',
            title: data.essay_title || data.filename || data.file_name || '제출물',
            author: data.essay_author || '저자 없음',
            course: data.essay_course || '과목 없음',
            characters: content.length || data.characters || 0,
            bytes: data.bytes || data.file_size || getTextByteSize(content),
            submittedAt: data.created_at,
            content,
            paragraphs: Array.isArray(data.paragraphs) && data.paragraphs.length > 0 ? data.paragraphs : textToEssayParagraphs(content)
          };
        }

        return {
          filename: data.filename || 'code.py',
          lines: data.lines || 0,
          bytes: data.bytes || 0,
          submittedAt: data.created_at,
          tokens: data.tokens || []
        };
      }

      if (error) console.warn(`Submission content fetch failed for submission ${submissionId}:`, error.message);

      let submission = null;
      let submissionError = null;

      const byId = await supabase
        .from('submissions')
        .select('file_name, content, file_path, file_mime, file_size, created_at, submitted_at')
        .eq('id', submissionId)
        .maybeSingle();

      submission = byId.data;
      submissionError = byId.error;

      if (!submission && fallback.studentId && fallback.assignmentTitle) {
        const byStudentAndAssignment = await supabase
          .from('submissions')
          .select('file_name, content, file_path, file_mime, file_size, created_at, submitted_at')
          .eq('student_id', fallback.studentId)
          .eq('assignment_title', fallback.assignmentTitle)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        submission = byStudentAndAssignment.data;
        submissionError = byStudentAndAssignment.error;
      }

      if (submissionError || !submission) {
        if (submissionError) console.warn(`Submission fallback fetch failed for submission ${submissionId}:`, submissionError.message);
        return null;
      }

      const content = extractSubmissionText(submission);

      if (assignmentType === 'essay') {
        return {
          filename: submission.file_name || 'submission.txt',
          title: submission.file_name || '제출물',
          author: '',
          course: '',
          characters: content.length,
          bytes: submission.file_size || getTextByteSize(content),
          submittedAt: submission.submitted_at || submission.created_at,
          content,
          paragraphs: textToEssayParagraphs(content),
          filePath: submission.file_path || '',
          mime: submission.file_mime || '',
        };
      }

      return {
        filename: submission.file_name || 'code.py',
        lines: content ? String(content).split(/\r?\n/).length : 0,
        bytes: submission.file_size || getTextByteSize(content),
        submittedAt: submission.submitted_at || submission.created_at,
        tokens: codeToTokens(content),
        filePath: submission.file_path || '',
        mime: submission.file_mime || '',
      };
    } catch (err) {
      console.error(`Failed to fetch submission content for ${submissionId}:`, err);
      return null;
    }
  },

  // 4. Update submission scores and status
  async updateGrade(submissionId, score, status = 'graded', feedback = '', categoryScores = [], aiFields = {}) {
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

      // AI 채점 보조 필드 저장
      const { aiScore, strengths, weaknesses, mistakes, learningRecommendations, nextSteps } = aiFields || {};
      if (aiScore != null) updatePayload.ai_score = aiScore;
      if (Array.isArray(strengths) && strengths.length > 0) updatePayload.strengths = strengths;
      if (Array.isArray(weaknesses) && weaknesses.length > 0) updatePayload.weaknesses = weaknesses;
      if (Array.isArray(mistakes) && mistakes.length > 0) updatePayload.mistakes = mistakes;
      if (Array.isArray(learningRecommendations) && learningRecommendations.length > 0) {
        updatePayload.learning_recommendations = learningRecommendations;
      }
      if (Array.isArray(nextSteps) && nextSteps.length > 0) updatePayload.next_steps = nextSteps;

      const { data, error } = await supabase
        .from('submissions')
        .update(updatePayload)
        .eq('id', submissionId)
        .select();

      if (error) {
        throw new Error(error.message);
      }

      // n8n grade/approve 플로우와 동일하게 feedbacks 테이블도 업데이트
      const feedbackPayload = {
        final_score: score,
        ta_feedback: feedback || undefined,
        status: 'approved',
      };
      if (Array.isArray(categoryScores) && categoryScores.length > 0) feedbackPayload.category_scores = categoryScores;
      if (aiScore != null) feedbackPayload.ai_score = aiScore;
      if (Array.isArray(strengths) && strengths.length > 0) feedbackPayload.strengths = strengths;
      if (Array.isArray(weaknesses) && weaknesses.length > 0) feedbackPayload.weaknesses = weaknesses;
      if (Array.isArray(mistakes) && mistakes.length > 0) feedbackPayload.mistakes = mistakes;
      if (Array.isArray(learningRecommendations) && learningRecommendations.length > 0) feedbackPayload.learning_recommendations = learningRecommendations;
      if (Array.isArray(nextSteps) && nextSteps.length > 0) feedbackPayload.next_steps = nextSteps;

      const { data: existingFb } = await supabase
        .from('feedbacks')
        .select('id')
        .eq('submission_id', submissionId)
        .maybeSingle();

      if (existingFb) {
        await supabase.from('feedbacks').update(feedbackPayload).eq('submission_id', submissionId);
      } else {
        await supabase.from('feedbacks').insert({ submission_id: submissionId, ...feedbackPayload });
      }

      return { success: true, data };
    } catch (err) {
      console.error(`Failed to update grade for submission ${submissionId}:`, err);
      return { success: false, error: err.message };
    }
  },

  // 4-b. AI 피드백 저장 (채점 전 자동 저장용)
  // n8n 워크플로우와 동일하게 feedbacks 테이블에 upsert
  async saveAiFeedback(submissionId, aiData) {
    if (!supabase.isConfigured) return { success: false, skipped: true };

    const payload = { submission_id: submissionId };
    if (aiData.ai_score != null) payload.ai_score = aiData.ai_score;
    if (aiData.final_score != null) payload.final_score = aiData.final_score;
    if (aiData.grade) payload.grade = aiData.grade;
    if (Array.isArray(aiData.category_scores) && aiData.category_scores.length > 0) payload.category_scores = aiData.category_scores;
    if (Array.isArray(aiData.strengths) && aiData.strengths.length > 0) payload.strengths = aiData.strengths;
    if (Array.isArray(aiData.weaknesses) && aiData.weaknesses.length > 0) payload.weaknesses = aiData.weaknesses;
    if (Array.isArray(aiData.mistakes) && aiData.mistakes.length > 0) payload.mistakes = aiData.mistakes;
    if (Array.isArray(aiData.learning_recommendations) && aiData.learning_recommendations.length > 0) {
      payload.learning_recommendations = aiData.learning_recommendations;
    }
    if (Array.isArray(aiData.next_steps) && aiData.next_steps.length > 0) payload.next_steps = aiData.next_steps;
    const feedbackText = aiData.ta_feedback || aiData.feedback || aiData.summary;
    if (feedbackText) payload.ta_feedback = feedbackText;
    payload.status = 'ai_draft';

    try {
      // 기존 feedbacks 레코드 확인
      const { data: existing } = await supabase
        .from('feedbacks')
        .select('id, status')
        .eq('submission_id', submissionId)
        .maybeSingle();

      if (existing) {
        if (existing.status === 'approved') return { success: true, skipped: true }; // 이미 승인된 항목은 덮어쓰지 않음
        const { data, error } = await supabase
          .from('feedbacks')
          .update(payload)
          .eq('submission_id', submissionId)
          .select();
        if (error) { console.warn('saveAiFeedback update error:', error.message); return { success: false, error: error.message }; }
        return { success: true, data };
      } else {
        const { data, error } = await supabase
          .from('feedbacks')
          .insert(payload)
          .select();
        if (error) { console.warn('saveAiFeedback insert error:', error.message); return { success: false, error: error.message }; }
        // submissions 상태를 ai_graded로 업데이트 (n8n과 동일하게)
        await supabase.from('submissions').update({ status: 'ai_graded' }).eq('id', submissionId);
        return { success: true, data };
      }
    } catch (err) {
      console.error('saveAiFeedback failed:', err);
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
