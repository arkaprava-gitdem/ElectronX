import { StudentProgress } from '../types';

const PROGRESS_KEY = 'electronx_student_progress_v1';

const DEFAULT_PROGRESS: StudentProgress = {
  devicesExplored: ['pn-junction'],
  simulationsRun: 0,
  experimentsCompleted: [],
  quizResults: [],
  labScore: 120, // initial onboarding credit
  achievements: []
};

export function getStoredProgress(): StudentProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROGRESS, ...parsed };
  } catch (err) {
    console.error('Failed to load progress from localStorage', err);
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: StudentProgress): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error('Failed to save progress to localStorage', err);
  }
}

export function recordDeviceExplored(deviceId: string): StudentProgress {
  const current = getStoredProgress();
  if (!current.devicesExplored.includes(deviceId)) {
    const updated = {
      ...current,
      devicesExplored: [...current.devicesExplored, deviceId],
      labScore: current.labScore + 30
    };
    checkAchievements(updated);
    saveProgress(updated);
    return updated;
  }
  return current;
}

export function incrementSimulations(): StudentProgress {
  const current = getStoredProgress();
  const updated = {
    ...current,
    simulationsRun: current.simulationsRun + 1,
    labScore: current.labScore + 5
  };
  checkAchievements(updated);
  saveProgress(updated);
  return updated;
}

export function recordExperimentCompleted(
  experimentId: string,
  score: number,
  readingsCount: number
): StudentProgress {
  const current = getStoredProgress();
  const existingIdx = current.experimentsCompleted.findIndex(e => e.id === experimentId);
  const record = {
    id: experimentId,
    completedAt: new Date().toISOString(),
    score,
    readingsCount
  };

  let expList = [...current.experimentsCompleted];
  let scoreDiff = score;

  if (existingIdx >= 0) {
    scoreDiff = Math.max(0, score - expList[existingIdx].score);
    expList[existingIdx] = record;
  } else {
    expList.push(record);
  }

  const updated: StudentProgress = {
    ...current,
    experimentsCompleted: expList,
    labScore: Math.min(1000, current.labScore + scoreDiff)
  };
  checkAchievements(updated);
  saveProgress(updated);
  return updated;
}

export function recordQuizCompleted(
  quizId: string,
  score: number,
  total: number
): StudentProgress {
  const current = getStoredProgress();
  const percentage = Math.round((score / total) * 100);
  const award = Math.round(percentage * 0.8);

  const updated: StudentProgress = {
    ...current,
    quizResults: [
      ...current.quizResults,
      {
        quizId,
        score,
        total,
        completedAt: new Date().toISOString()
      }
    ],
    labScore: Math.min(1000, current.labScore + award)
  };
  checkAchievements(updated);
  saveProgress(updated);
  return updated;
}

function checkAchievements(p: StudentProgress): void {
  const achievements = new Set(p.achievements);

  if (p.simulationsRun >= 1) {
    achievements.add('FIRST SIMULATION');
  }
  if (p.devicesExplored.length >= 5) {
    achievements.add('DEVICE EXPLORER');
  }
  if (p.devicesExplored.includes('bjt') && p.simulationsRun >= 5) {
    achievements.add('BJT ANALYST');
  }
  if (p.devicesExplored.includes('solar-cell') && p.devicesExplored.includes('led')) {
    achievements.add('OPTOELECTRONICS PRO');
  }
  if (p.experimentsCompleted.length >= 8 || p.labScore >= 800) {
    achievements.add('SEMICONDUCTOR MASTER');
  }

  p.achievements = Array.from(achievements);
}

export function resetProgress(): StudentProgress {
  saveProgress(DEFAULT_PROGRESS);
  return DEFAULT_PROGRESS;
}

// Aliases and convenience helpers
export const getStudentProgress = getStoredProgress;
export const recordSimulationInteraction = incrementSimulations;

export function markExperimentComplete(experimentId: string, score: number = 100, readingsCount: number = 5): StudentProgress {
  return recordExperimentCompleted(experimentId, score, readingsCount);
}

export function isExperimentCompleted(experimentId: string): boolean {
  const current = getStoredProgress();
  return current.experimentsCompleted.some((e) => e.id === experimentId);
}

export function recordQuizScore(topic: string, score: number, total: number): StudentProgress {
  return recordQuizCompleted(topic, score, total);
}
