// Mock data — TA/Student LMS prototype

export const TA_STUDENTS_ESSAY = [
  { id: 1, no: "20234101", name: "김지윤",   submittedAt: "5/22 14:02", aiScore: 8.5, finalScore: 8.5,  status: "graded",   suspicion: 6,  similarity: 4 },
  { id: 2, no: "20234102", name: "박서연",   submittedAt: "5/22 16:30", aiScore: 7.0, finalScore: 7.5,  status: "graded",   suspicion: 9,  similarity: 5 },
  { id: 3, no: "20234103", name: "이도현",   submittedAt: "5/22 11:14", aiScore: 6.5, finalScore: 6.0,  status: "graded",   suspicion: 14, similarity: 8 },
  { id: 4, no: "20234104", name: "최서윤",   submittedAt: "5/22 19:58", aiScore: 8.0, finalScore: 8.0,  status: "graded",   suspicion: 7,  similarity: 4 },
  { id: 5, no: "20234105", name: "정민호",   submittedAt: "5/22 21:11", aiScore: 5.5, finalScore: null, status: "ready",    suspicion: 31, similarity: 9, hasWarning: true },
  { id: 6, no: "20234106", name: "강하늘",   submittedAt: "5/22 13:45", aiScore: 7.5, finalScore: null, status: "ready",    suspicion: 8,  similarity: 22, hasSimWarning: true },
  { id: 7, no: "20234107", name: "윤예진",   submittedAt: "5/22 22:31", aiScore: 9.0, finalScore: null, status: "ready",    suspicion: 4,  similarity: 6 },
  { id: 8, no: "20234108", name: "조은우",   submittedAt: "5/22 09:22", aiScore: 7.0, finalScore: null, status: "ready",    suspicion: 11, similarity: 7 },
  { id: 9, no: "20234109", name: "임수아",   submittedAt: "5/22 18:00", aiScore: 8.5, finalScore: null, status: "ready",    suspicion: 5,  similarity: 5 },
  { id: 10, no: "20234110", name: "한지호",  submittedAt: "5/22 17:42", aiScore: 6.0, finalScore: null, status: "ready",    suspicion: 18, similarity: 11 },
  { id: 11, no: "20234111", name: "오시현",  submittedAt: "5/22 20:18", aiScore: 7.5, finalScore: null, status: "ready",    suspicion: 9,  similarity: 7 },
  { id: 12, no: "20234112", name: "백나연",  submittedAt: "5/22 16:55", aiScore: 8.0, finalScore: null, status: "ready",    suspicion: 6,  similarity: 4 },
  { id: 13, no: "20234113", name: "정성훈",  submittedAt: "5/22 21:14", aiScore: 7.5, finalScore: null, status: "ready",    suspicion: 28, similarity: 9, isFocus: true },
  { id: 14, no: "20234114", name: "노아름",  submittedAt: "5/22 12:33", aiScore: null, finalScore: null, status: "pending", suspicion: null, similarity: null },
  { id: 15, no: "20234115", name: "송태민",  submittedAt: "5/22 23:50", aiScore: null, finalScore: null, status: "pending", suspicion: null, similarity: null },
];

// Essay submission body — Kafka "Metamorphosis" reflection
// We split into runs so we can highlight cleanly.
export const ESSAY_DOC = {
  title: "카프카 「변신」에 나타난 소외(疎外)의 세 층위",
  author: "정성훈 (2023####13)",
  course: "세계문학의 이해 감상문 과제",
  paragraphs: [
    [
      { t: "카프카의 「변신」은 1915년 발표된 단편소설로, 주인공 그레고르 잠자가 어느 날 아침 거대한 갑충으로 변신한 사건으로 시작한다. 이 작품은 단순한 환상소설이 아니라 현대 사회에서 인간이 겪는 " },
      { t: "소외(Entfremdung)를 상징적으로 그려낸 텍스트", hl: "quote", note: "openingClaim" },
      { t: "이다. 본 감상문에서는 그레고르의 변신이 가족 내 소외, 노동으로부터의 소외, 그리고 자기 자신으로부터의 소외라는 세 층위로 전개되는 양상을 살펴보고자 한다." },
    ],
    [
      { t: "먼저 가족 내 소외의 양상을 살펴보면, 그레고르가 변신한 직후 가족들의 반응은 점차 그를 가족 구성원이 아닌 '벌레'로 인식하기 시작한다. 작중 여동생 그레테는 처음에는 그를 돌보지만, 결국 " },
      { t: "\"이것을 없애야 해요. 이것이 오빠라고 믿어서는 안 돼요\"", hl: "source", note: "greteQuote" },
      { t: "라고 말하며 그를 완전히 비인격화한다. 가족이라는 가장 친밀한 관계조차 외형의 변화 앞에서 무너지는 모습은 인간 관계의 조건성을 폭로한다." },
    ],
    // flagged paragraph
    {
      flag: true,
      flagLabel: "AI: 작품 인용 부족",
      runs: [
        { t: "또한 노동으로부터의 소외 역시 이 작품의 중요한 주제이다. 현대 자본주의 사회에서 노동자는 자신의 노동과 그것이 만든 결과물로부터 분리되며, 이는 마르크스가 말한 소외의 개념과도 통한다. 그레고르 역시 가족을 부양하기 위해 자신을 희생하며 일했지만 결국 그 노동의 의미를 찾지 못한다. 이러한 소외는 자본주의 사회 전반에 만연한 문제이다." },
      ],
    },
    [
      { t: "마지막으로 자아로부터의 소외는 가장 본질적인 층위라 할 수 있다. 그레고르는 변신 이후에도 인간으로서의 사고와 감정을 유지하지만, 그것을 표현할 수단을 잃는다. 그가 가족의 대화를 들으며 슬퍼하거나 음악을 듣고 감동받는 장면들은" },
      { t: "…", muted: true },
    ],
  ],
};

export const CODE_SUBMISSION = {
  filename: "stack.py",
  lines: 14,
  bytes: 287,
  submittedAt: "5/22 오후 3:42",
  tokens: [
    [{ t: "class", c: "kw" }, { t: " " }, { t: "Stack", c: "cls" }, { t: ":" }],
    [{ t: "    " }, { t: "def", c: "kw" }, { t: " " }, { t: "__init__", c: "fn" }, { t: "(" }, { t: "self", c: "kw" }, { t: "):" }],
    [{ t: "        " }, { t: "self.items " }, { t: "=", c: "kw" }, { t: " []" }],
    [{ t: "    " }, { t: "def", c: "kw" }, { t: " " }, { t: "push", c: "fn" }, { t: "(" }, { t: "self", c: "kw" }, { t: ", x):" }],
    [{ t: "        " }, { t: "self.items.append(x)" }],
    [{ t: "    " }, { t: "def", c: "kw" }, { t: " " }, { t: "pop",  c: "fn" }, { t: "(" }, { t: "self", c: "kw" }, { t: "):" }],
    { flag: true, flagLabel: "AI: 빈 스택 검증 없음",
      toks: [{ t: "        " }, { t: "return", c: "kw" }, { t: " self.items.pop()" }] },
    [{ t: "    " }, { t: "def", c: "kw" }, { t: " " }, { t: "peek", c: "fn" }, { t: "(" }, { t: "self", c: "kw" }, { t: "):" }],
    [{ t: "        " }, { t: "return", c: "kw" }, { t: " self.items[" }, { t: "-1", c: "num" }, { t: "]" }],
    [{ t: "" }],
    [{ t: "# 사용 예시", c: "cmt" }],
    [{ t: "s " }, { t: "=", c: "kw" }, { t: " " }, { t: "Stack", c: "cls" }, { t: "()" }],
    [{ t: "s.push(" }, { t: "1", c: "num" }, { t: "); s.push(" }, { t: "2", c: "num" }, { t: ")" }],
    [{ t: "print(s.pop())" }],
  ],
};

export const CODE_STUDENTS = [
  { id: 1, no: "2024####1", name: "김도하",  aiScore: 9.5, finalScore: 9.5,  status: "graded",   tests: "5/5", suspicion: 4 },
  { id: 2, no: "2024####2", name: "박지원",  aiScore: 8.0, finalScore: 8.0,  status: "graded",   tests: "4/5", suspicion: 6 },
  { id: 3, no: "2024####3", name: "이준서",  aiScore: 6.5, finalScore: 7.0,  status: "graded",   tests: "3/5", suspicion: 12 },
  { id: 4, no: "2024####4", name: "최아인",  aiScore: 9.0, finalScore: null, status: "ready",    tests: "5/5", suspicion: 5 },
  { id: 5, no: "2024####5", name: "정수아",  aiScore: 7.0, finalScore: null, status: "ready",    tests: "4/5", suspicion: 22, hasWarning: true },
  { id: 6, no: "2024####6", name: "박효율",  aiScore: 7.5, finalScore: null, status: "ready",    tests: "4/5", suspicion: 12, isFocus: true },
  { id: 7, no: "2024####7", name: "강리나",  aiScore: 8.5, finalScore: null, status: "ready",    tests: "5/5", suspicion: 8 },
  { id: 8, no: "2024####8", name: "윤서후",  aiScore: 6.0, finalScore: null, status: "ready",    tests: "3/5", suspicion: 31, hasWarning: true },
  { id: 9, no: "2024####9", name: "임채영",  aiScore: 8.5, finalScore: null, status: "ready",    tests: "5/5", suspicion: 5 },
  { id: 10, no: "2024####10", name: "오민찬", aiScore: 9.0, finalScore: null, status: "ready",   tests: "5/5", suspicion: 6 },
  { id: 11, no: "2024####11", name: "조하늘", aiScore: null, finalScore: null, status: "pending" },
  { id: 12, no: "2024####12", name: "한지온", aiScore: null, finalScore: null, status: "pending" },
];

export const STUDENT_ASSIGNMENTS = [
  {
    id: 1, course: "자료구조 입문 | 001 분반",
    courseShort: "자료구조 입문",
    title: "스택 클래스 구현",
    type: "code",
    status: "graded",
    score: 7.5, total: 10,
    avg: 7.2,
    rank: "상위 38%",
    gradedAt: "5/23 16:18",
    submittedAt: "5/22 15:42",
    deadline: "5/26 오후 11:59",
    grader: "남규리 조교",
    next: { title: "Queue 클래스 구현", due: "5/30" },
  },
  {
    id: 2, course: "세계문학의 이해 | 003 분반",
    courseShort: "세계문학의 이해",
    title: "카프카 「변신」 감상문",
    type: "essay",
    status: "pending",
    score: null, total: 10,
    deadline: "5/26 오후 11:59",
    submittedAt: "5/22 21:14",
    estimated: "5/24",
  },
  {
    id: 3, course: "미적분학 II | 002 분반",
    courseShort: "미적분학 II",
    title: "정적분 응용 문제집",
    type: "math",
    status: "graded",
    score: 8.6, total: 10,
    avg: 7.4,
    rank: "상위 22%",
    gradedAt: "5/19 11:02",
    deadline: "5/18 오후 11:59",
  },
  {
    id: 4, course: "자료구조 입문 | 001 분반",
    courseShort: "자료구조 입문",
    title: "기본 자료형 복습 퀴즈",
    type: "code",
    status: "graded",
    score: 9.2, total: 10,
    avg: 8.1,
    rank: "상위 18%",
    gradedAt: "5/12 09:30",
    deadline: "5/12 오후 11:59",
  },
  {
    id: 5, course: "세계문학의 이해 | 003 분반",
    courseShort: "세계문학의 이해",
    title: "도스토예프스키 단편 읽기",
    type: "essay",
    status: "graded",
    score: 6.8, total: 10,
    avg: 7.0,
    rank: "상위 58%",
    gradedAt: "5/06 14:11",
    deadline: "5/06 오후 11:59",
  },
];

// Growth history for student dashboard
export const GROWTH = [5.4, 6.2, 6.8, 7.0, 6.8, 8.6, 9.2, 7.5];
export const GROWTH_LABELS = ["W3", "W5", "W7", "W9", "W10", "W11", "W12", "W13"];

export const MOCK = {
  TA_STUDENTS_ESSAY,
  ESSAY_DOC,
  CODE_SUBMISSION,
  CODE_STUDENTS,
  STUDENT_ASSIGNMENTS,
  GROWTH,
  GROWTH_LABELS,
};
