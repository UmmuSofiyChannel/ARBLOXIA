window.ArbloxiaProgress = (function () {
  let state = window.ArbloxiaStorage.load();
  const config = window.ARBLOXIA_CONFIG.mission01.checkpoints;

  function render() {
    // Misi lain (Mission 02/03/WebAR) turut mengubah localStorage.
    // Muat semula supaya butang unlock sentiasa membaca keadaan terkini.
    state = window.ArbloxiaStorage.load();
    const fill = document.getElementById("progressFill");
    const percent = document.getElementById("progressPercent");
    const xp = document.getElementById("xpValue");
    const status = document.getElementById("progressStatus");
    if (fill) fill.style.width = `${state.progress}%`;
    if (percent) percent.textContent = `${state.progress}%`;
    if (xp) xp.textContent = state.xp;
    if (status) status.textContent = state.progress >= 100
      ? "🏅 Mission 01 selesai. Mission 02 telah dibuka!"
      : `${Object.keys(state.completed).length}/6 checkpoint selesai.`;

    document.querySelectorAll('#mission01 [data-checkpoint]').forEach((step) => {
      const done = Boolean(state.completed[step.dataset.checkpoint]);
      step.classList.toggle("checkpoint-complete", done);
    });

    const badge = document.querySelector('[data-mission-badge="mission01"]');
    if (badge) badge.classList.toggle("locked", state.progress < 100);

    const mission02Card = document.querySelector('[data-mission-card="mission02"]');
    const mission02Button = document.querySelector('[data-mission="mission02"]');
    const unlocked = state.progress >= 100 || state.mission02Unlocked;
    if (mission02Card) mission02Card.classList.toggle("locked", !unlocked);
    if (mission02Button) {
      mission02Button.disabled = !unlocked;
      mission02Button.setAttribute("aria-disabled", String(!unlocked));
      mission02Button.textContent = unlocked ? "▶ MULAKAN MISI" : "🔒 SELESAIKAN MISSION 01";
    }

    // Mission 03 hanya dibuka selepas Mission 02 benar-benar selesai.
    const mission03Card = document.querySelector('[data-mission-card="mission03"]');
    const mission03Button = document.querySelector('[data-mission="mission03"]');
    const mission03Unlocked = Boolean(state.mission02Complete);
    if (mission03Card) mission03Card.classList.toggle("locked", !mission03Unlocked);
    if (mission03Button) {
      mission03Button.disabled = !mission03Unlocked;
      mission03Button.setAttribute("aria-disabled", String(!mission03Unlocked));
      mission03Button.textContent = mission03Unlocked ? "▶ MULAKAN MISI" : "🔒 SELESAIKAN MISSION 02";
    }
  }

  function complete(checkpoint) {
    state = window.ArbloxiaStorage.load();
    if (!config[checkpoint] || state.completed[checkpoint]) return false;
    state.completed[checkpoint] = true;
    state.progress = Math.min(100, state.progress + config[checkpoint].progress);
    state.xp += config[checkpoint].xp;
    if (state.progress >= 100) state.mission02Unlocked = true;
    window.ArbloxiaStorage.save(state);
    render();
    return true;
  }

  function reset() {
    state = window.ArbloxiaStorage.reset();
    render();
  }

  function getState() { return { ...state, completed: { ...state.completed } }; }
  return { render, complete, reset, getState };
})();
