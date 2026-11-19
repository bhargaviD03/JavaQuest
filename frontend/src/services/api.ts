const API_BASE = '/api/v1';

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('javaquest_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If not on login page, remove token
    if (!endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
      localStorage.removeItem('javaquest_token');
      localStorage.removeItem('javaquest_user');
      window.dispatchEvent(new Event('auth:logout'));
    }
  }

  if (!response.ok) {
    let errorData: any = {};
    try {
      errorData = await response.json();
    } catch {
      errorData = { detail: response.statusText };
    }
    throw new ApiError(errorData.detail || 'Network request failed', response.status, errorData);
  }

  return response.json();
}

export const api = {
  // Auth
  register: (data: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<any>('/auth/me'),
  updateProfile: (data: any) => request<any>('/auth/me', { method: 'PUT', body: JSON.stringify(data) }),
  createSpace: (name: string) => request<any>('/auth/spaces', { method: 'POST', body: JSON.stringify({ name }) }),
  joinSpace: (invite_code: string) => request<any>('/auth/spaces/join', { method: 'POST', body: JSON.stringify({ invite_code }) }),
  getMySpaces: () => request<any[]>('/auth/spaces/my'),

  // Dashboard
  getDashboardStats: () => request<any>('/dashboard/stats'),

  // Roadmap
  getRoadmap: () => request<any[]>('/roadmap/'),
  updateLessonStatus: (lessonId: number, status: string) =>
    request<any>(`/roadmap/lessons/${lessonId}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Daily Session (Institute Topic)
  startDailySession: (data: any) => request<any>('/daily-session/', { method: 'POST', body: JSON.stringify(data) }),
  getLatestDailySession: () => request<any>('/daily-session/latest'),
  getDailySession: (id: number) => request<any>(`/daily-session/${id}`),
  completeSessionItem: (sessionId: number, itemId: number, user_response?: string) =>
    request<any>(`/daily-session/${sessionId}/items/${itemId}/complete`, { method: 'POST', body: JSON.stringify({ user_response }) }),
  finishDailySession: (sessionId: number) =>
    request<any>(`/daily-session/${sessionId}/finish`, { method: 'POST' }),

  // Question Bank
  getQuestions: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return request<{ total: number; items: any[] }>(`/questions/?${query.toString()}`);
  },
  getQuestion: (id: number) => request<any>(`/questions/${id}`),
  submitQuestionAttempt: (id: number, answer: string, self_assessment = 'understood') =>
    request<any>(`/questions/${id}/attempt`, { method: 'POST', body: JSON.stringify({ submitted_answer: answer, self_assessment }) }),
  toggleBookmark: (id: number) => request<any>(`/questions/${id}/bookmark`, { method: 'POST' }),
  getDailyChallenge: () => request<any>('/questions/daily/today'),

  // AI Mentor
  createConversation: (data: any) => request<any>('/mentor/conversations', { method: 'POST', body: JSON.stringify(data) }),
  listConversations: () => request<any[]>('/mentor/conversations'),
  getConversation: (id: number) => request<any>(`/mentor/conversations/${id}`),
  sendMessage: (convId: number, content: string, codeSnippet?: string, hintLevel = 0) =>
    request<any>(`/mentor/conversations/${convId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, code_snippet: codeSnippet, hint_level: hintLevel })
    }),

  // Companion
  createCompanionSession: (data: any) => request<any>('/companion/sessions', { method: 'POST', body: JSON.stringify(data) }),
  getSpaceCompanionSessions: (spaceId: number) => request<any[]>(`/companion/spaces/${spaceId}/sessions`),
  getCompanionSession: (sessionId: number) => request<any>(`/companion/sessions/${sessionId}`),
  submitCompanionAnswer: (sessionId: number, answer: string, reasoning?: string, reflection?: string) =>
    request<any>(`/companion/sessions/${sessionId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answer, reasoning, reflection_notes: reflection })
    }),

  // Project Lab
  getProjects: () => request<any[]>('/projects/'),
  completeMilestone: (projectId: number, milestoneIndex: number, code?: string, reflection?: string) =>
    request<any>(`/projects/${projectId}/milestones/${milestoneIndex}`, {
      method: 'POST',
      body: JSON.stringify({ is_completed: true, learner_code: code, learner_reflection: reflection })
    }),

  // External Practice
  getExternalPractice: () => request<any[]>('/external-practice/'),
  updateExternalStatus: (id: number, status: string, notes?: string) =>
    request<any>(`/external-practice/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, notes }) }),

  // Gamification
  getAchievements: () => request<any[]>('/gamification/achievements'),
  getXPTransactions: () => request<any[]>('/gamification/transactions'),

  // Interactive Exercises
  getExercises: (params?: { exercise_type?: string; topic?: string; difficulty?: string }) => {
    const q = new URLSearchParams();
    if (params?.exercise_type) q.append('exercise_type', params.exercise_type);
    if (params?.topic) q.append('topic', params.topic);
    if (params?.difficulty) q.append('difficulty', params.difficulty);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return request<import('../types').InteractiveExercise[]>(`/exercises${qs}`);
  },
  getExerciseDetail: (id: number) => request<import('../types').InteractiveExercise>(`/exercises/${id}`),
  submitExercise: (id: number, submissionData: any) =>
    request<import('../types').ExerciseEvaluationResult>(`/exercises/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ submission_data: submissionData }),
    }),

  // Java Execution Engine
  executeJava: (payload: { code: string; class_name?: string; stdin?: string; test_cases?: any[]; game_id?: string; level_id?: string }) =>
    request<{
      compiled: boolean;
      output: string;
      errors?: string;
      execution_time_ms: number;
      test_results?: Array<{ name: string; passed: boolean; description: string }>;
    }>('/execution/run', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
