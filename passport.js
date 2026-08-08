/* ==========================================
   ARBLOXIA v4.4 — TRAVEL PASSPORT LEVEL 1
========================================== */
window.ArbloxiaPassport = (function () {
  const labels = {
    mission01: { title: 'Mission 01 Selesai!', text: 'Cop Pengangkutan diterima.', icon: '🚢' },
    mission02: { title: 'Mission 02 Selesai!', text: 'Cop Destinasi & Masa diterima.', icon: '📍' },
    mission03: { title: 'Mission 03 Selesai!', text: 'Cop Cara & Pengalaman diterima.', icon: '🚆' },
    summit: { title: 'Travel Master Dibuka!', text: 'Cop emas Misi Kemuncak diterima.', icon: '🏅' }
  };

  let previous = null;
  let toastTimer = null;

  function readFlags() {
    const state = window.ArbloxiaStorage ? window.ArbloxiaStorage.load() : {};
    return {
      mission01: Number(state.progress || 0) >= 100,
      mission02: Boolean(state.mission02Complete),
      mission03: Boolean(state.mission03Complete),
      summit: Boolean(state.summitComplete)
    };
  }

  function render() {
    const flags = readFlags();
    let count = 0;
    Object.keys(flags).forEach(function (key) {
      const stamp = document.querySelector(`[data-passport-stamp="${key}"]`);
      if (!stamp) return;
      stamp.classList.toggle('is-complete', flags[key]);
      const status = stamp.querySelector('em');
      if (status) status.textContent = flags[key] ? '✓ COP DITERIMA' : 'Belum dicop';
      if (flags[key]) count += 1;
    });
    const countNode = document.getElementById('level1PassportCount');
    if (countNode) countNode.textContent = `${count}/4`;
    const statusNode = document.getElementById('level1PassportStatus');
    if (statusNode) {
      statusNode.textContent = count === 4
        ? '🏅 Travel Passport lengkap. Anda kini bergelar Travel Master!'
        : count === 3
          ? '👑 Tiga misi selesai. Misi Kemuncak menanti anda.'
          : count === 2
            ? '🚆 Lengkapkan Mission 03 untuk menerima cop seterusnya.'
            : count === 1
              ? '📍 Lengkapkan Mission 02 untuk meneruskan perjalanan.'
              : 'Lengkapkan Mission 01 untuk menerima cop pertama.';
    }
    return flags;
  }

  function showToast(key) {
    const info = labels[key];
    const toast = document.getElementById('missionCompleteToast');
    if (!info || !toast) return;
    document.getElementById('missionCompleteToastIcon').textContent = info.icon;
    document.getElementById('missionCompleteToastTitle').textContent = info.title;
    document.getElementById('missionCompleteToastText').textContent = `${info.text} Travel Passport telah dikemas kini.`;
    toast.classList.toggle('is-summit', key === 'summit');
    toast.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, 4200);
  }

  function watch() {
    const current = render();
    if (previous) {
      Object.keys(current).forEach(function (key) {
        if (!previous[key] && current[key]) showToast(key);
      });
    }
    previous = current;
  }

  document.addEventListener('DOMContentLoaded', function () {
    previous = render();
    window.setInterval(watch, 500);
  });

  return { render, showToast };
})();
