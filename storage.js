window.ArbloxiaStorage = (function () {
  const key = window.ARBLOXIA_CONFIG.storageKey;
  const emptyState = () => ({
    completed: {},
    progress: 0,
    xp: 0,
    mission02Unlocked: false,
    mission02Complete: false,
    mission03Complete: false,
    summitComplete: false,
    summitXp: 0,
    level2Mission04Complete: false,
    level2Mission05Complete: false
  });

  function sanitize(raw) {
    const state = { ...emptyState(), ...(raw || {}) };
    state.completed = (state.completed && typeof state.completed === "object") ? state.completed : {};
    state.progress = Math.max(0, Math.min(100, Number(state.progress || 0)));
    state.xp = Math.max(0, Number(state.xp || 0));

    // Baiki rekod lama yang mustahil: misi seterusnya tidak boleh selesai
    // jika misi sebelumnya belum selesai.
    if (state.progress < 100) {
      state.mission02Unlocked = false;
      state.mission02Complete = false;
      state.mission03Complete = false;
      state.summitComplete = false;
    } else {
      state.mission02Unlocked = true;
      if (!state.mission02Complete) {
        state.mission03Complete = false;
        state.summitComplete = false;
      } else if (!state.mission03Complete) {
        state.summitComplete = false;
      }
    }
    return state;
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (!(saved && typeof saved === "object")) return emptyState();
      const normalized = sanitize(saved);
      // Simpan semula jika data lama perlu dibersihkan.
      localStorage.setItem(key, JSON.stringify(normalized));
      return normalized;
    } catch (error) {
      console.warn("Kemajuan lama tidak dapat dibaca.", error);
      return emptyState();
    }
  }

  function save(state) {
    localStorage.setItem(key, JSON.stringify(state));
  }

  function reset() {
    localStorage.removeItem(key);
    return emptyState();
  }

  return { load, save, reset, emptyState };
})();
