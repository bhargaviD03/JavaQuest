import { GameLevel } from '../types/game';

const API_BASE = '/api/v1';

async function authFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || 'Network request failed');
  }

  return response.json();
}

export const gameService = {
  /**
   * Fetches all 10 calibrated levels for a game world dynamically from PostgreSQL.
   */
  async getGameLevels(gameId: string): Promise<GameLevel[]> {
    const res = await authFetch<{ game_id: string; total_levels: number; levels: GameLevel[] }>(
      `/games/${gameId}/levels`
    );
    return res.levels;
  },

  /**
   * Fetches a single calibrated level dynamically from PostgreSQL.
   */
  async getGameLevel(gameId: string, levelNumber: number): Promise<GameLevel> {
    return authFetch<GameLevel>(`/games/${gameId}/levels/${levelNumber}`);
  },

  /**
   * Formats a GameLevel from DB to the UI LevelDefinition interface.
   */
  formatLevel(level: GameLevel) {
    return {
      levelNumber: level.level_number,
      title: level.title,
      topic: level.topic,
      learningObjective: level.learning_objective,
      scenario: level.scenario,
      initialCode: level.starter_code,
      solutionHint: level.solution_hint,
    };
  },
};
