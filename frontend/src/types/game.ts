export interface GameTestCase {
  name: string;
  description?: string;
  token?: string;
  pattern?: string;
}

export interface GameLevel {
  id: number;
  game_id: string;
  level_number: number;
  title: string;
  topic: string;
  difficulty: string;
  learning_objective: string;
  scenario: string;
  starter_code: string;
  solution_hint?: string;
  test_cases: GameTestCase[];
  expected_output?: string;
  xp_reward: number;
}
