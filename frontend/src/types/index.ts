export type UserRole = 'learner' | 'companion';

export interface User {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  avatar: string;
  level: number;
  total_xp: number;
  current_streak: number;
  created_at: string;
}

export interface SpaceMember {
  id: number;
  user_id: number;
  username: string;
  role: string;
  joined_at: string;
}

export interface LearningSpace {
  id: number;
  name: string;
  invite_code: string;
  created_by_id: number;
  created_at: string;
  members: SpaceMember[];
}

export interface Lesson {
  id: number;
  topic_id: number;
  title: string;
  content_markdown: string;
  order_index: number;
  estimated_minutes: number;
  user_status?: 'not_started' | 'in_progress' | 'practising' | 'needs_revision' | 'mastered';
}

export interface Topic {
  id: number;
  module_id: number;
  title: string;
  slug: string;
  description?: string;
  order_index: number;
  lessons_count: number;
  completed_count: number;
  status: string;
  lessons: Lesson[];
}

export interface Module {
  id: number;
  code: string;
  title: string;
  description?: string;
  order_index: number;
  topics: Topic[];
}

export interface QuestionAttempt {
  id: number;
  question_id: number;
  submitted_answer: string;
  is_correct: boolean;
  self_assessment?: string;
  ai_feedback?: string;
  xp_awarded: number;
  created_at: string;
}

export interface QuestionBankItem {
  id: number;
  canonical_id: string;
  title: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question_type: string;
  prompt: string;
  hint?: string;
  learning_objectives?: string[];
  solution_guidance?: string;
  source_type: string;
  language: string;
  has_attempted: boolean;
  is_bookmarked: boolean;
  latest_attempt?: QuestionAttempt;
}

export interface DailySessionItem {
  id: number;
  session_id: number;
  item_type: string;
  title: string;
  order_index: number;
  content: string;
  code_snippet?: string;
  metadata_json?: any;
  is_completed: boolean;
  user_response?: string;
}

export interface DailySession {
  id: number;
  user_id: number;
  institute_topic: string;
  taught_summary?: string;
  understood_summary?: string;
  difficulty_notes?: string;
  additional_notes?: string;
  planned_minutes: number;
  actual_minutes: number;
  status: string;
  created_at: string;
  completed_at?: string;
  items: DailySessionItem[];
}

export interface MentorMessage {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  code_snippet?: string;
  hint_level: number;
  created_at: string;
}

export interface MentorConversation {
  id: number;
  user_id: number;
  title: string;
  mode: 'explain' | 'python_vs_java' | 'debug' | 'progressive_hint' | 'quiz' | 'explain_back';
  topic_context?: string;
  created_at: string;
  updated_at: string;
  messages: MentorMessage[];
}

export interface CompanionSubmission {
  user_id: number;
  username: string;
  avatar: string;
  role: string;
  answer?: string;
  reasoning?: string;
  reflection_notes?: string;
  submitted_at: string;
  has_submitted: boolean;
}

export interface CompanionSession {
  id: number;
  space_id: number;
  question_id: number;
  title: string;
  status: string;
  created_at: string;
  revealed_at?: string;
  question?: QuestionBankItem;
  can_reveal: boolean;
  both_submitted: boolean;
  current_user_submitted: boolean;
  submissions: CompanionSubmission[];
}

export interface ProjectMilestone {
  id: number;
  milestone_index: number;
  milestone_title: string;
  is_completed: boolean;
  learner_code?: string;
  learner_reflection?: string;
  completed_at?: string;
}

export interface Project {
  id: number;
  title: string;
  slug: string;
  level: string;
  objective: string;
  requirements: string[];
  concepts_covered: string[];
  starter_code?: string;
  order_index: number;
  user_completed_milestones: number;
  total_milestones: number;
  is_completed: boolean;
  milestones: ProjectMilestone[];
}

export interface ExternalChallenge {
  id: number;
  platform: string;
  title: string;
  url: string;
  topic: string;
  difficulty: string;
  user_status: 'not_started' | 'attempted' | 'solved' | 'needs_revision';
  notes?: string;
}

export interface Achievement {
  id: number;
  code: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  unlocked: boolean;
  unlocked_at?: string;
}

export interface DailyActivity {
  activity_date: string;
  minutes_spent: number;
  questions_attempted: number;
  xp_earned: number;
}

export interface DashboardStats {
  greeting: string;
  username: string;
  role: string;
  level: number;
  total_xp: number;
  current_streak: number;
  xp_to_next_level: number;
  progress_to_next_level: number;
  solution_accuracy?: number;
  total_solved_questions?: number;
  weekly_commits?: number;
  today_institute_topic?: string;
  daily_challenge?: QuestionBankItem;
  current_module?: string;
  learning_topics: string[];
  revision_topics: string[];
  recent_achievements: Achievement[];
  recent_attempts: any[];
  weekly_activity: DailyActivity[];
  companion_activity?: any;
}

export type ExerciseType = 
  | 'complete_code'
  | 'bug_hunt'
  | 'parsons_puzzle'
  | 'predict_output'
  | 'modernize_refactor'
  | 'break_code'
  | 'keyword_cloze';

export interface InteractiveExercise {
  id: number;
  canonical_id: string;
  exercise_type: ExerciseType;
  title: string;
  topic: string;
  difficulty: string;
  xp_reward: number;
  prompt: string;
  starter_code?: string;
  scaffold_code?: string;
  metadata_json?: any;
  hint?: string;
  is_solved?: boolean;
}

export interface ExerciseEvaluationResult {
  is_correct: boolean;
  xp_awarded: number;
  feedback: string;
  test_results?: Array<{
    name: string;
    status: string;
    desc: string;
  }>;
}

