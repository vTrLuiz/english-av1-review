const STORAGE_KEY = "english-av1-review-progress";
const emptyState = () => ({ version: 1, mistakeIds: [], completedIds: [], bestScore: null });

export function createProgressStore(storage, validQuestionIds) {
  const valid = new Set(validQuestionIds);
  let memory = emptyState();

  const normalize = (value) => {
    if (!value || value.version !== 1) return emptyState();
    return {
      version: 1,
      mistakeIds: [...new Set(Array.isArray(value.mistakeIds) ? value.mistakeIds.filter((id) => valid.has(id)) : [])],
      completedIds: [...new Set(Array.isArray(value.completedIds) ? value.completedIds.filter((id) => valid.has(id)) : [])],
      bestScore: Number.isFinite(value.bestScore) ? Math.max(0, Math.min(100, Math.round(value.bestScore))) : null,
    };
  };

  const load = () => {
    try {
      const raw = storage?.getItem(STORAGE_KEY);
      if (raw) memory = normalize(JSON.parse(raw));
    } catch {
      memory = normalize(memory);
    }
    return structuredClone(memory);
  };

  const save = (state) => {
    memory = normalize(state);
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(memory));
    } catch {
      // The in-memory copy keeps the current session usable.
    }
    return structuredClone(memory);
  };

  const recordResult = (questionId, correct, percentage) => {
    const state = load();
    if (valid.has(questionId)) {
      state.mistakeIds = state.mistakeIds.filter((id) => id !== questionId);
      state.completedIds = state.completedIds.filter((id) => id !== questionId);
      (correct ? state.completedIds : state.mistakeIds).push(questionId);
    }
    if (Number.isFinite(percentage)) state.bestScore = Math.max(state.bestScore ?? 0, Math.round(percentage));
    return save(state);
  };

  const clear = () => save(emptyState());
  return { load, recordResult, clear };
}
