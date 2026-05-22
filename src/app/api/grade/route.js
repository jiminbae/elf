const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const MAX_CONTENT_CHARS = 12000;

function buildPrompt(content, rubric, assignmentType, filename) {
  const typeLabel = assignmentType === 'code' ? '프로그래밍 과제 (코드)' : '에세이 / 보고서';
  const trimmed = content.length > MAX_CONTENT_CHARS
    ? content.slice(0, MAX_CONTENT_CHARS) + '\n...(이하 생략)'
    : content;

  const rubricSection = rubric
    ? `## 평가 루브릭\n${rubric}\n\n`
    : '';

  const categoryGuide = assignmentType === 'code'
    ? `카테고리 예: 기능 구현(max 5), 예외 처리(max 2), 코드 스타일(max 2), 시간복잡도(max 1)`
    : `카테고리 예: 논지의 명확성(max 3), 근거의 적절성(max 3), 논리적 구성(max 2), 문장 표현(max 2)`;

  return `당신은 대학교 조교입니다. 학생의 ${typeLabel} 제출물을 루브릭에 따라 채점해주세요.

${rubricSection}## 학생 제출물${filename ? ` (파일명: ${filename})` : ''}
\`\`\`
${trimmed}
\`\`\`

---
위 제출물을 평가하여 **반드시 아래 JSON 형식으로만** 응답하세요. JSON 외 텍스트는 절대 포함하지 마세요.
${categoryGuide}

{
  "ai_score": <0~10 사이 숫자, 소수점 한 자리 허용>,
  "category_scores": [
    { "name": "항목명", "score": <숫자>, "max_score": <숫자>, "comment": "간단한 코멘트" }
  ],
  "strengths": ["잘한 점 1", "잘한 점 2"],
  "weaknesses": ["아쉬운 점 1", "아쉬운 점 2"],
  "mistakes": ["오류/실수 1"],
  "ta_feedback": "학생에게 전달할 피드백 (한국어, 200~400자)",
  "learning_recommendations": ["추천 학습 개념 또는 자료 1"],
  "next_steps": ["다음 단계 개선 방향 1"]
}`;
}

export async function POST(request) {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { success: false, message: 'GOOGLE_AI_API_KEY가 설정되지 않았습니다. .env.local을 확인하세요.' },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: 'Invalid JSON body' }, { status: 400 });
  }

  const { content, rubric, assignment_type, filename } = body;
  if (!content || !content.trim()) {
    return Response.json({ success: false, message: '채점할 제출물 내용(content)이 없습니다.' }, { status: 400 });
  }

  const prompt = buildPrompt(content, rubric, assignment_type, filename);

  try {
    const geminiResponse = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error('Gemini API error:', errText);
      return Response.json(
        { success: false, message: `Gemini API 오류 (HTTP ${geminiResponse.status})` },
        { status: 502 }
      );
    }

    const geminiData = await geminiResponse.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return Response.json(
        { success: false, message: 'Gemini 응답이 비어있습니다.' },
        { status: 502 }
      );
    }

    let result;
    try {
      result = JSON.parse(rawText);
    } catch {
      // JSON 파싱 실패 시 ```json ... ``` 블록에서 추출 시도
      const match = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        try {
          result = JSON.parse(match[1]);
        } catch {
          return Response.json(
            { success: false, message: 'Gemini 응답을 JSON으로 파싱할 수 없습니다.', raw: rawText },
            { status: 502 }
          );
        }
      } else {
        return Response.json(
          { success: false, message: 'Gemini 응답을 JSON으로 파싱할 수 없습니다.', raw: rawText },
          { status: 502 }
        );
      }
    }

    // 점수 정규화 (0~10 범위 보장)
    if (result.ai_score != null) {
      const score = Number(result.ai_score);
      result.ai_score = isNaN(score) ? null : Math.min(10, Math.max(0, +score.toFixed(1)));
    }

    return Response.json({ success: true, data: result });
  } catch (err) {
    console.error('Grade route error:', err);
    return Response.json({ success: false, message: err.message }, { status: 500 });
  }
}
