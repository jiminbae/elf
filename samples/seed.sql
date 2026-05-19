-- KNU Grading System — Supabase Database Seed Data
-- Place this script in the Supabase SQL Editor AFTER running schema.sql to populate sample records.

-- 1. Insert Assignments
INSERT INTO assignments (id, course, course_short, title, deadline, avg, ai_avg, graded, total, type) VALUES
('essay', '인문대 교양 | 003 분반 (World Literature | 003 Section)', '세계문학의 이해', '카프카 『변신』 감상문 — 세계문학의 이해', '5월 26일 오후 11:59', 7.4, 7.3, 12, 45, 'essay'),
('code', '공과대 전공 | 001 분반 (Data Structures | 001 Section)', '자료구조 입문', '스택 클래스 구현 — Github 기반 협업 팀과제', '5월 26일 오후 11:59', 7.2, 7.0, 5, 32, 'code'),
('math', '미적분학 II | 002 분반', '미적분학 II', '정적분 응용 문제집', '5월 18일 오후 11:59', 7.4, 7.4, 10, 10, 'math'),
('code-quiz', '자료구조 입문 | 001 분반', '자료구조 입문', '기본 자료형 복습 퀴즈', '5월 12일 오후 11:59', 8.1, 8.1, 10, 10, 'code'),
('essay-dosto', '세계문학의 이해 | 003 분반', '세계문학의 이해', '도스토예프스키 단편 읽기', '5월 06일 오후 11:59', 7.0, 7.0, 10, 10, 'essay');

-- 2. Insert Students
INSERT INTO students (id, student_no, name) VALUES
(1, '20234101', '김지윤'),
(2, '20234102', '박서연'),
(3, '20234103', '이도현'),
(4, '20234104', '최서윤'),
(5, '20234105', '정민호'),
(6, '20234106', '강하늘'),
(7, '20234107', '윤예진'),
(8, '20234108', '조은우'),
(9, '20234109', '임수아'),
(10, '20234110', '한지호'),
(11, '20234111', '오시현'),
(12, '20234112', '백나연'),
(13, '20234113', '정성훈'),
(14, '20234114', '노아름'),
(15, '20234115', '송태민'),
(16, '20240001', '김도하'),
(17, '20240002', '박지원'),
(18, '20240003', '이준서'),
(19, '20240004', '최아인'),
(20, '20240005', '정수아'),
(21, '20240006', '박효율'),
(22, '20240007', '강리나'),
(23, '20240008', '윤서후'),
(24, '20240009', '임채영'),
(25, '20240010', '오민찬'),
(26, '20240011', '조하늘'),
(27, '20240012', '한지온');

-- Reset Serial sequence for students table
SELECT setval('students_id_seq', (SELECT MAX(id) FROM students));

-- 3. Insert Submissions (Essay Assignment)
INSERT INTO submissions (id, assignment_id, student_id, submitted_at, graded_at, ai_score, final_score, status, suspicion, similarity, has_warning, has_sim_warning, is_focus, tests) VALUES
(1, 'essay', 1, '5/22 14:02', '5/23 11:00', 8.5, 8.5, 'graded', 6, 4, false, false, false, NULL),
(2, 'essay', 2, '5/22 16:30', '5/23 11:15', 7.0, 7.5, 'graded', 9, 5, false, false, false, NULL),
(3, 'essay', 3, '5/22 11:14', '5/23 11:30', 6.5, 6.0, 'graded', 14, 8, false, false, false, NULL),
(4, 'essay', 4, '5/22 19:58', '5/23 11:45', 8.0, 8.0, 'graded', 7, 4, false, false, false, NULL),
(5, 'essay', 5, '5/22 21:11', NULL, 5.5, NULL, 'ready', 31, 9, true, false, false, NULL),
(6, 'essay', 6, '5/22 13:45', NULL, 7.5, NULL, 'ready', 8, 22, false, true, false, NULL),
(7, 'essay', 7, '5/22 22:31', NULL, 9.0, NULL, 'ready', 4, 6, false, false, false, NULL),
(8, 'essay', 8, '5/22 09:22', NULL, 7.0, NULL, 'ready', 11, 7, false, false, false, NULL),
(9, 'essay', 9, '5/22 18:00', NULL, 8.5, NULL, 'ready', 5, 5, false, false, false, NULL),
(10, 'essay', 10, '5/22 17:42', NULL, 6.0, NULL, 'ready', 18, 11, false, false, false, NULL),
(11, 'essay', 11, '5/22 20:18', NULL, 7.5, NULL, 'ready', 9, 7, false, false, false, NULL),
(12, 'essay', 12, '5/22 16:55', NULL, 8.0, NULL, 'ready', 6, 4, false, false, false, NULL),
(13, 'essay', 13, '5/22 21:14', NULL, 7.5, NULL, 'ready', 28, 9, false, false, true, NULL),
(14, 'essay', 14, '5/22 12:33', NULL, NULL, NULL, 'pending', NULL, NULL, false, false, false, NULL),
(15, 'essay', 15, '5/22 23:50', NULL, NULL, NULL, 'pending', NULL, NULL, false, false, false, NULL);

-- 4. Insert Submissions (Code Assignment)
INSERT INTO submissions (id, assignment_id, student_id, submitted_at, graded_at, ai_score, final_score, status, suspicion, similarity, has_warning, has_sim_warning, is_focus, tests) VALUES
(16, 'code', 16, '5/22 15:42', '5/23 16:18', 9.5, 9.5, 'graded', 4, 3, false, false, false, '5/5'),
(17, 'code', 17, '5/22 16:00', '5/23 16:30', 8.0, 8.0, 'graded', 6, 4, false, false, false, '4/5'),
(18, 'code', 18, '5/22 16:12', '5/23 16:45', 6.5, 7.0, 'graded', 12, 8, false, false, false, '3/5'),
(19, 'code', 19, '5/22 17:05', NULL, 9.0, NULL, 'ready', 5, 2, false, false, false, '5/5'),
(20, 'code', 20, '5/22 17:15', NULL, 7.0, NULL, 'ready', 22, 6, true, false, false, '4/5'),
(21, 'code', 21, '5/22 17:22', NULL, 7.5, NULL, 'ready', 12, 7, false, false, true, '4/5'),
(22, 'code', 22, '5/22 18:10', NULL, 8.5, NULL, 'ready', 8, 4, false, false, false, '5/5'),
(23, 'code', 23, '5/22 18:35', NULL, 6.0, NULL, 'ready', 31, 10, true, false, false, '3/5'),
(24, 'code', 24, '5/22 19:00', NULL, 8.5, NULL, 'ready', 5, 3, false, false, false, '5/5'),
(25, 'code', 25, '5/22 19:15', NULL, 9.0, NULL, 'ready', 6, 4, false, false, false, '5/5'),
(26, 'code', 26, '5/22 20:00', NULL, NULL, NULL, 'pending', NULL, NULL, false, false, false, NULL),
(27, 'code', 27, '5/22 20:30', NULL, NULL, NULL, 'pending', NULL, NULL, false, false, false, NULL);

-- Reset Serial sequence for submissions table
SELECT setval('submissions_id_seq', (SELECT MAX(id) FROM submissions));

-- 5. Insert Submission Detailed Rich Contents (Essay Paragraphs & Code Tokens JSON)
INSERT INTO submission_contents (submission_id, filename, lines, bytes, essay_title, essay_author, essay_course, paragraphs, tokens) VALUES
(13, '변신_감상문_정성훈.docx', 0, 1834, '카프카 「변신」에 나타난 소외(疎外)의 세 층위', '정성훈 (2023####13)', '세계문학의 이해 감상문 과제', 
'[
  [
    {"t": "카프카의 「변신」은 1915년 발표된 단편소설로, 주인공 그레고르 잠자가 어느 날 아침 거대한 갑충으로 변신한 사건으로 시작한다. 이 작품은 단순한 환상소설이 아니라 현대 사회에서 인간이 겪는 "},
    {"t": "소외(Entfremdung)를 상징적으로 그려낸 텍스트", "hl": "quote", "note": "openingClaim"},
    {"t": "이다. 본 감상문에서는 그레고르의 변신이 가족 내 소외, 노동으로부터의 소외, 그리고 자기 자신으로부터의 소외라는 세 층위로 전개되는 양상을 살펴보고자 한다."}
  ],
  [
    {"t": "먼저 가족 내 소외의 양상을 살펴보면, 그레고르가 변신한 직후 가족들의 반응은 점차 그를 가족 구성원이 아닌 ''벌레''로 인식하기 시작한다. 작중 여동생 그레테는 처음에는 그를 돌보지만, 결국 "},
    {"t": "\"이것을 없애야 해요. 이것이 오빠라고 믿어서는 안 돼요\"", "hl": "source", "note": "greteQuote"},
    {"t": "라고 말하며 그를 완전히 비인격화한다. 가족이라는 가장 친밀한 관계조차 외형의 변화 앞에서 무너지는 모습은 인간 관계의 조건성을 폭로한다."}
  ],
  {
    "flag": true,
    "flagLabel": "AI: 작품 인용 부족",
    "runs": [
      {"t": "또한 노동으로부터의 소외 역시 이 작품의 중요한 주제이다. 현대 자본주의 사회에서 노동자는 자신의 노동과 그것이 만든 결과물로부터 분리되며, 이는 마르크스가 말한 소외의 개념과도 통한다. 그레고르 역시 가족을 부양하기 위해 자신을 희생하며 일했지만 결국 그 노동의 의미를 찾지 못한다. 이러한 소외는 자본주의 사회 전반에 만연한 문제이다."}
    ]
  },
  [
    {"t": "마지막으로 자아로부터의 소외는 가장 본질적인 층위라 할 수 있다. 그레고르는 변신 이후에도 인간으로서의 사고와 감정을 유지하지만, 그것을 표현할 수단을 잃는다. 그가 가족의 대화를 들으며 슬퍼하거나 음악을 듣고 감동받는 장면들은…"}
  ]
]', NULL),
(21, 'stack.py', 14, 287, NULL, NULL, NULL, NULL, 
'[
  [{"t": "class", "c": "kw"}, {"t": " "}, {"t": "Stack", "c": "cls"}, {"t": ":"}],
  [{"t": "    "}, {"t": "def", "c": "kw"}, {"t": " "}, {"t": "__init__", "c": "fn"}, {"t": "("}, {"t": "self", "c": "kw"}, {"t": "):"}],
  [{"t": "        "}, {"t": "self.items "}, {"t": "=", "c": "kw"}, {"t": " []"}],
  [{"t": "    "}, {"t": "def", "c": "kw"}, {"t": " "}, {"t": "push", "c": "fn"}, {"t": "("}, {"t": "self", "c": "kw"}, {"t": ", x):"}],
  [{"t": "        "}, {"t": "self.items.append(x)"}],
  [{"t": "    "}, {"t": "def", "c": "kw"}, {"t": " "}, {"t": "pop",  "c": "fn"}, {"t": "("}, {"t": "self", "c": "kw"}, {"t": "):"}],
  {"flag": true, "flagLabel": "AI: 빈 스택 검증 없음",
    "toks": [{"t": "        "}, {"t": "return", "c": "kw"}, {"t": " self.items.pop()"}]},
  [{"t": "    "}, {"t": "def", "c": "kw"}, {"t": " "}, {"t": "peek", "c": "fn"}, {"t": "("}, {"t": "self", "c": "kw"}, {"t": "):"}],
  [{"t": "        "}, {"t": "return", "c": "kw"}, {"t": " self.items["}, {"t": "-1", "c": "num"}, {"t": "]"}],
  [{"t": ""}],
  [{"t": "# 사용 예시", "c": "cmt"}],
  [{"t": "s "}, {"t": "=", "c": "kw"}, {"t": " "}, {"t": "Stack", "c": "cls"}, {"t": "()"}],
  [{"t": "s.push("}, {"t": "1", "c": "num"}, {"t": "); s.push("}, {"t": "2", "c": "num"}, {"t": ")"}],
  [{"t": "print(s.pop())"}]
]');
