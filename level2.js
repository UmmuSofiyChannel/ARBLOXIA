/* ==========================================================
   ARBLOXIA PILOT v1.0 · WORLD 2 — JUMLAH MUTANASIQAH
   Mission 04, 05, 06 + Misi Kemuncak + Sijil Sentence Architect
========================================================== */
(function () {
  'use strict';

  function loadState() {
    return window.ArbloxiaStorage ? window.ArbloxiaStorage.load() : {};
  }
  function saveState(state) {
    if (window.ArbloxiaStorage) window.ArbloxiaStorage.save(state);
  }
  function playSound(name) {
    if (window.ArbloxiaAudio) window.ArbloxiaAudio.play(name);
  }

  function isWorld2Unlocked(state) {
    return Boolean(state.summitComplete);
  }
  function areWorld2MissionsComplete(state) {
    return Boolean(
      state.level2Mission04Complete &&
      state.level2Mission05Complete &&
      state.level2Mission06Complete
    );
  }

  function renderLevel2() {
    const state = loadState();
    const unlocked = isWorld2Unlocked(state);
    const content = document.getElementById('level2Content');
    const openButton = document.getElementById('level2UnlockButton');

    if (content && !unlocked) content.hidden = true;
    if (openButton && unlocked) {
      openButton.textContent = content && !content.hidden ? '✅ LEVEL 2 SEDANG DIBUKA' : '🚀 BUKA LEVEL 2';
    }

    ['04', '05', '06'].forEach(function (number) {
      const card = document.querySelector('[data-level2-mission="' + number + '"]');
      const done = Boolean(state['level2Mission' + number + 'Complete']);
      if (card) card.classList.toggle('is-complete', done);
      const button = card && card.querySelector('.level2-start-button');
      if (button) button.textContent = done ? '✅ MAIN SEMULA MISSION ' + number : (number === '04' ? '🚌 MULAKAN MISSION 04' : number === '05' ? '🚆 MULAKAN MISSION 05' : '🧩 MULAKAN MISSION 06');
    });

    const bossReady = areWorld2MissionsComplete(state);
    const bossComplete = Boolean(state.level2BossComplete);
    const bossCard = document.getElementById('level2BossCard');
    const bossButton = document.getElementById('openLevel2Boss');
    if (bossCard) {
      bossCard.classList.toggle('is-unlocked', bossReady);
      bossCard.classList.toggle('is-complete', bossComplete);
    }
    if (bossButton) {
      bossButton.disabled = !bossReady;
      bossButton.textContent = bossComplete
        ? '✅ LIHAT SENTENCE ARCHITECT'
        : bossReady
          ? '👑 CABAR MISI KEMUNCAK'
          : '🔒 SELESAIKAN MISSION 04–06';
    }

    const award = document.getElementById('sentenceArchitectAward');
    const worldComplete = document.getElementById('world2CompleteCard');
    if (award && bossComplete) award.hidden = false;
    if (worldComplete) worldComplete.hidden = !bossComplete;
  }

  function resetPanelQuestions(panel, selector) {
    panel.querySelectorAll(selector).forEach(function (question) {
      question.querySelectorAll('button').forEach(function (button) {
        button.disabled = false;
        button.classList.remove('correct', 'wrong');
      });
      const feedback = question.querySelector('.level2-feedback');
      if (feedback) {
        feedback.textContent = '';
        feedback.className = 'level2-feedback';
      }
    });
    const result = panel.querySelector('.level2-result');
    if (result) result.hidden = true;
  }

  function setupMission(id, stateKey, requiredAnswers) {
    const panel = document.getElementById(id);
    if (!panel) return;
    let done = new Set();
    const result = panel.querySelector('.level2-result');

    panel.querySelectorAll('.level2-question').forEach(function (question) {
      question.querySelectorAll('button').forEach(function (button) {
        button.addEventListener('click', function () {
          if (done.has(question.dataset.l2q)) return;
          const feedback = question.querySelector('.level2-feedback');
          if (button.dataset.correct !== 'true') {
            button.classList.add('wrong');
            if (feedback) {
              feedback.textContent = '❌ Belum tepat. Cuba lagi.';
              feedback.className = 'level2-feedback wrong';
            }
            playSound('wrong');
            setTimeout(function () { button.classList.remove('wrong'); }, 500);
            return;
          }

          done.add(question.dataset.l2q);
          question.querySelectorAll('button').forEach(function (b) { b.disabled = true; });
          button.classList.add('correct');
          if (feedback) {
            feedback.textContent = '✅ أَحْسَنْتَ!';
            feedback.className = 'level2-feedback correct';
          }
          playSound('correct');

          if (done.size === requiredAnswers) {
            if (result) result.hidden = false;
            const state = loadState();
            state[stateKey] = true;
            saveState(state);
            renderLevel2();
            setTimeout(function () { playSound('complete'); }, 300);
          }
        });
      });
    });

    panel.addEventListener('arbloxia:replay', function () {
      done = new Set();
      resetPanelQuestions(panel, '.level2-question');
    });
  }

  function setupBoss() {
    const panel = document.getElementById('level2BossPanel');
    if (!panel) return;
    let completed = new Set();
    const questions = panel.querySelectorAll('.boss-question');
    const fill = document.getElementById('level2BossFill');
    const progressText = document.getElementById('level2BossProgressText');
    const award = document.getElementById('sentenceArchitectAward');

    function updateProgress() {
      const percent = Math.round((completed.size / questions.length) * 100);
      if (fill) fill.style.width = percent + '%';
      if (progressText) progressText.textContent = completed.size + ' / ' + questions.length + ' cabaran selesai';
    }

    questions.forEach(function (question) {
      question.querySelectorAll('button').forEach(function (button) {
        button.addEventListener('click', function () {
          const key = question.dataset.bossq;
          if (completed.has(key)) return;
          const feedback = question.querySelector('.level2-feedback');
          if (button.dataset.correct !== 'true') {
            button.classList.add('wrong');
            if (feedback) {
              feedback.textContent = '❌ Jawapan belum tepat.';
              feedback.className = 'level2-feedback wrong';
            }
            playSound('wrong');
            setTimeout(function () { button.classList.remove('wrong'); }, 500);
            return;
          }

          completed.add(key);
          question.querySelectorAll('button').forEach(function (b) { b.disabled = true; });
          button.classList.add('correct');
          if (feedback) {
            feedback.textContent = '✅ أَحْسَنْتَ!';
            feedback.className = 'level2-feedback correct';
          }
          playSound('correct');
          updateProgress();

          if (completed.size === questions.length) {
            const state = loadState();
            state.level2BossComplete = true;
            state.sentenceArchitectUnlocked = true;
            saveState(state);
            if (award) award.hidden = false;
            renderLevel2();
            setTimeout(function () { playSound('complete'); }, 350);
            setTimeout(function () {
              if (award) award.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 450);
          }
        });
      });
    });

    const replay = document.getElementById('replayLevel2Boss');
    if (replay) replay.addEventListener('click', function () {
      completed = new Set();
      questions.forEach(function (question) {
        question.querySelectorAll('button').forEach(function (button) {
          button.disabled = false;
          button.classList.remove('correct', 'wrong');
        });
        const feedback = question.querySelector('.level2-feedback');
        if (feedback) {
          feedback.textContent = '';
          feedback.className = 'level2-feedback';
        }
      });
      const state = loadState();
      state.level2BossComplete = false;
      state.sentenceArchitectUnlocked = false;
      saveState(state);
      if (award) award.hidden = true;
      const worldComplete = document.getElementById('world2CompleteCard');
      if (worldComplete) worldComplete.hidden = true;
      updateProgress();
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      renderLevel2();
    });

    updateProgress();
  }


  function setupWorld2Reset() {
    const button = document.getElementById('resetWorld2Button');
    if (!button) return;
    button.addEventListener('click', function () {
      if (!window.confirm('Reset Mission 04, 05, 06 dan Misi Kemuncak World 2?')) return;
      const state = loadState();
      ['level2Mission04Complete','level2Mission05Complete','level2Mission06Complete','level2BossComplete','sentenceArchitectUnlocked'].forEach(function (key) { state[key] = false; });
      saveState(state);
      location.reload();
    });
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      const image = new Image();
      image.onload = function () { resolve(image); };
      image.onerror = reject;
      image.src = src;
    });
  }

  async function generateSentenceArchitectCertificate(name) {
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1130;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 1600, 1130);
    gradient.addColorStop(0, '#061c24');
    gradient.addColorStop(0.5, '#0b3d36');
    gradient.addColorStop(1, '#061523');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1600, 1130);

    ctx.strokeStyle = '#e8c467';
    ctx.lineWidth = 15;
    ctx.strokeRect(45, 45, 1510, 1040);
    ctx.strokeStyle = '#51d8a2';
    ctx.lineWidth = 4;
    ctx.strokeRect(70, 70, 1460, 990);

    try {
      const logo = await loadImage('IMAGES/logo-arbloxia.png');
      const ratio = Math.min(520 / logo.width, 180 / logo.height);
      ctx.drawImage(logo, 800 - (logo.width * ratio) / 2, 95, logo.width * ratio, logo.height * ratio);
    } catch (error) {
      console.warn('Logo sijil World 2 tidak dapat dimuatkan.', error);
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#e8c467';
    ctx.font = '800 35px Arial, sans-serif';
    ctx.fillText('SIJIL PENCAPAIAN', 800, 330);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 66px Arial, sans-serif';
    ctx.fillText('SENTENCE ARCHITECT', 800, 410);

    ctx.fillStyle = '#8ff0c8';
    ctx.font = '700 39px Arial, sans-serif';
    ctx.fillText('الجُمْلَةُ الْمُتَنَاسِقَةُ', 800, 478);

    ctx.fillStyle = '#d6e7ea';
    ctx.font = '500 27px Arial, sans-serif';
    ctx.fillText('Dengan bangganya dianugerahkan kepada', 800, 555);

    ctx.fillStyle = '#ffffff';
    let fontSize = 54;
    ctx.font = '900 ' + fontSize + 'px Arial, sans-serif';
    while (ctx.measureText(name).width > 1250 && fontSize > 30) {
      fontSize -= 2;
      ctx.font = '900 ' + fontSize + 'px Arial, sans-serif';
    }
    ctx.fillText(name.toUpperCase(), 800, 645);

    ctx.strokeStyle = '#e8c467';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(260, 675);
    ctx.lineTo(1340, 675);
    ctx.stroke();

    ctx.fillStyle = '#d6e7ea';
    ctx.font = '500 28px Arial, sans-serif';
    ctx.fillText('kerana berjaya menguasai Jumlah Mutanasiqah', 800, 745);
    ctx.fillText('di bawah tajuk رِحْلَةً سَعِيدَةً dalam World 2 ARBLOXIA.', 800, 795);

    ctx.fillStyle = '#e8c467';
    ctx.font = '900 50px Arial, sans-serif';
    ctx.fillText('⭐ SENTENCE ARCHITECT ⭐', 800, 885);

    const dateText = new Intl.DateTimeFormat('ms-MY', {
      day: 'numeric', month: 'long', year: 'numeric'
    }).format(new Date());
    ctx.fillStyle = '#d6e7ea';
    ctx.font = '500 24px Arial, sans-serif';
    ctx.fillText('Tarikh: ' + dateText, 800, 955);

    ctx.fillStyle = '#e8c467';
    ctx.font = '800 24px Arial, sans-serif';
    ctx.fillText('Muallimah Ummu Sofiy Channel · #SimpleTapiSampai', 800, 1015);

    return canvas.toDataURL('image/png');
  }

  function setupCertificate() {
    const button = document.getElementById('downloadSentenceArchitectCertificate');
    const input = document.getElementById('sentenceArchitectName');
    const status = document.getElementById('sentenceArchitectCertificateStatus');
    if (!button || !input) return;

    button.addEventListener('click', async function () {
      const name = input.value.trim();
      if (!name) {
        if (status) {
          status.textContent = '⚠️ Sila masukkan nama murid terlebih dahulu.';
          status.style.color = '#ffe08a';
        }
        input.focus();
        return;
      }

      button.disabled = true;
      button.textContent = '⏳ MENJANA SIJIL...';
      try {
        const dataUrl = await generateSentenceArchitectCertificate(name);
        const safeName = name.replace(/[^a-zA-Z0-9\u00C0-\u024F\u0600-\u06FF]+/g, '-').replace(/^-|-$/g, '') || 'Ejen-ARBLOXIA';
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'Sijil-Sentence-Architect-' + safeName + '.png';
        document.body.appendChild(link);
        link.click();
        link.remove();
        if (status) {
          status.textContent = '✅ Sijil Sentence Architect berjaya dimuat turun.';
          status.style.color = '#7ff0b8';
        }
      } catch (error) {
        console.error(error);
        if (status) {
          status.textContent = '❌ Sijil tidak dapat dijana. Cuba semula.';
          status.style.color = '#ff8f9a';
        }
      } finally {
        button.disabled = false;
        button.textContent = '📥 DOWNLOAD SIJIL SENTENCE ARCHITECT';
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderLevel2();
    setupMission('level2Mission04', 'level2Mission04Complete', 3);
    setupMission('level2Mission05', 'level2Mission05Complete', 3);
    setupMission('level2Mission06', 'level2Mission06Complete', 4);
    setupBoss();
    setupWorld2Reset();
    setupCertificate();

    const openButton = document.getElementById('level2UnlockButton');
    if (openButton) openButton.addEventListener('click', function () {
      const state = loadState();
      if (!isWorld2Unlocked(state)) return;

      /*
        Bersihkan rekod ujian lama hanya pada kali PERTAMA World 2 dibuka.
        Selepas itu, kemajuan sebenar murid akan kekal seperti biasa.
      */
      if (!state.level2FirstOpenInitialized) {
        [
          'level2Mission04Complete',
          'level2Mission05Complete',
          'level2Mission06Complete',
          'level2BossComplete',
          'sentenceArchitectUnlocked'
        ].forEach(function (key) {
          state[key] = false;
        });
        state.level2FirstOpenInitialized = true;
        saveState(state);
      }

      const content = document.getElementById('level2Content');
      if (!content) return;
      content.hidden = false;
      content.scrollIntoView({ behavior: 'smooth', block: 'start' });
      renderLevel2();
    });

    document.querySelectorAll('[data-open-level2]').forEach(function (button) {
      button.addEventListener('click', function () {
        const panel = document.getElementById('level2Mission' + button.dataset.openLevel2);
        if (!panel) return;
        panel.hidden = false;
        panel.dispatchEvent(new CustomEvent('arbloxia:replay'));
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    const openBoss = document.getElementById('openLevel2Boss');
    if (openBoss) openBoss.addEventListener('click', function () {
      const state = loadState();
      if (!areWorld2MissionsComplete(state)) return;
      const panel = document.getElementById('level2BossPanel');
      if (!panel) return;
      panel.hidden = false;
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    document.querySelectorAll('.level2-close').forEach(function (button) {
      button.addEventListener('click', function () {
        const panel = button.closest('.level2-builder');
        if (panel) panel.hidden = true;
      });
    });

    const openCertificate = document.getElementById('openWorld2Certificate');
    if (openCertificate) openCertificate.addEventListener('click', function () {
      const award = document.getElementById('sentenceArchitectAward');
      if (award) award.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    const returnHQ = document.getElementById('returnToHQ');
    if (returnHQ) returnHQ.addEventListener('click', function () {
      const hq = document.getElementById('arbloxiaHQ');
      if (hq) {
        hq.hidden = false;
        document.body.style.overflow = '';
        hq.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

    window.setInterval(renderLevel2, 700);
  });

  window.ArbloxiaRenderLevel2 = renderLevel2;
})();
