document.addEventListener("DOMContentLoaded", function () {
  const progress = window.ArbloxiaProgress;
  const aria = window.ArbloxiaAudio;
  progress.render();

  function playFile(src, button, status, onEnded) {
    if (!src) return;
    const originalText = button ? button.textContent.trim() : "";
    const audio = new Audio(src);

    if (button) {
      button.classList.add("audio-playing");
      button.textContent = "⏸️ Sedang dimainkan...";
    }
    if (status) status.textContent = "Audio sedang dimainkan.";

    audio.play().catch(function (error) {
      console.log("Audio tidak dapat dimainkan:", error);
      if (status) status.textContent = "Audio tidak dapat dimainkan. Semak lokasi fail.";
      if (button) {
        button.classList.remove("audio-playing");
        button.textContent = originalText;
      }
    });

    audio.addEventListener("ended", function () {
      if (button) {
        button.classList.remove("audio-playing");
        button.textContent = originalText;
      }
      if (status) status.textContent = "✅ Audio selesai dimainkan.";
      if (typeof onEnded === "function") onEnded();
    });
  }

  // Panel misi
  document.querySelectorAll(".start-mission-button").forEach(function (button) {
    button.addEventListener("click", function () {
      if (button.disabled) return;
      const panel = document.getElementById(button.dataset.mission);
      if (!panel) {
        alert("Panel misi ini belum dibina.");
        return;
      }
      document.querySelectorAll(".mission-panel").forEach((item) => item.classList.remove("active"));
      panel.classList.add("active");
      aria.play("online");
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  document.querySelectorAll(".close-panel-button").forEach(function (button) {
    button.addEventListener("click", function () {
      const panel = button.closest(".mission-panel");
      if (panel) panel.classList.remove("active");
    });
  });

  // Jika kembali daripada WebAR, buka semula misi yang betul berdasarkan hash URL.
  (function openMissionFromHash() {
    const hash = window.location.hash ? window.location.hash.slice(1) : "";
    if (!hash) return;
    const panel = document.getElementById(hash);
    if (panel && panel.classList.contains("mission-panel")) {
      const hq = document.getElementById("arbloxiaHQ");
      if (hq) hq.hidden = true;
      document.body.style.overflow = "";
      document.querySelectorAll(".mission-panel").forEach(function (item) { item.classList.remove("active"); });
      panel.classList.add("active");
      setTimeout(function () { panel.scrollIntoView({ behavior: "smooth", block: "start" }); }, 80);
    }
  })();

  // Imbas dossier — buka kamera WebAR sebenar
  document.querySelectorAll(".scan-agent-button, .scan-button").forEach(function (button) {
    button.addEventListener("click", function () {
      const missionPanel = button.closest(".mission-panel");
      let mission = "";
      if (missionPanel && missionPanel.id === "mission01") mission = "01";
      if (missionPanel && missionPanel.id === "mission02") mission = "02";

      // Simpan halaman/misi asal supaya pengguna boleh kembali tepat ke misi tersebut.
      const returnHash = missionPanel && missionPanel.id ? "#" + missionPanel.id : "";
      const url = "WEBAR/ar.html?mission=" + encodeURIComponent(mission) + "&return=" + encodeURIComponent(returnHash);
      aria.play("scan");
      window.location.href = url;
    });
  });

  // Butang kembali ke HQ pada halaman tamat/sijil
  document.querySelectorAll(".return-home-button").forEach(function (button) {
    button.addEventListener("click", function () {
      document.querySelectorAll(".mission-panel").forEach(function (panel) { panel.classList.remove("active"); });
      const hq = document.getElementById("arbloxiaHQ");
      if (hq) {
        hq.hidden = false;
        document.body.style.overflow = "hidden";
        hq.scrollTop = 0;
        hq.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.location.href = "index.html";
      }
    });
  });

  // Audio guru
  document.querySelectorAll(".play-audio").forEach(function (button) {
    button.addEventListener("click", function () {
      const step = button.closest(".audio-learning-step") || button.closest(".learning-step");
      const status = step ? step.querySelector(".audio-status") : null;
      playFile(button.dataset.audio, button, status, function () {
        if (button.closest("#mission01")) progress.complete("audio");
      });
    });
  });

  // Suara automatik Bahasa Arab untuk dialog Mission 02.
  document.querySelectorAll(".play-speech").forEach(function (button) {
    button.addEventListener("click", function () {
      const step = button.closest(".audio-learning-step") || button.closest(".learning-step");
      const status = step ? step.querySelector(".audio-status") : null;
      const text = button.dataset.speech;

      if (!text || !("speechSynthesis" in window)) {
        if (status) status.textContent = "Suara automatik tidak disokong oleh pelayar ini.";
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ar-SA";
      utterance.rate = 0.78;
      utterance.pitch = 1;

      const originalText = button.textContent.trim();
      button.disabled = true;
      button.textContent = "⏸️ Sedang dimainkan...";
      if (status) status.textContent = "Audio dialog sedang dimainkan.";

      utterance.onend = function () {
        button.disabled = false;
        button.textContent = originalText;
        if (status) status.textContent = "✅ Dialog selesai dimainkan.";
      };

      utterance.onerror = function () {
        button.disabled = false;
        button.textContent = originalText;
        if (status) status.textContent = "Audio tidak dapat dimainkan. Cuba gunakan Google Chrome.";
      };

      window.speechSynthesis.speak(utterance);
    });
  });

  // Video: checkpoint direkod apabila murid membuka video YouTube.
  document.querySelectorAll("#mission01 .video-link-button").forEach(function (link) {
    link.addEventListener("click", function () {
      progress.complete("video");
    });
  });

  // Butang video boleh buka/tutup untuk misi lain
  document.querySelectorAll(".open-video-button").forEach(function (button) {
    button.addEventListener("click", function () {
      const step = button.closest(".learning-step");
      const container = step ? step.querySelector(".video-container") : null;
      const frame = step ? step.querySelector(".learning-video") : null;
      if (!container || !frame || !button.dataset.video) return;
      const active = container.classList.toggle("active");
      frame.src = active ? button.dataset.video : "";
      button.textContent = active ? "✕ Tutup Video AI Pembelajaran" : "▶ Buka Video AI Pembelajaran";
    });
  });

  // Qiraah: susun ayat
  document.querySelectorAll(".qiraah-step").forEach(function (step) {
    const cards = step.querySelectorAll(".word-card");
    const answerBox = step.querySelector(".qiraah-answer");
    const checkButton = step.querySelector(".check-qiraah-button");
    const resetButton = step.querySelector(".reset-qiraah-button");
    const feedback = step.querySelector(".qiraah-feedback");
    const selected = [];
    const correctSentence = "أَنَا أَرْكَبُ السَّفِينَةَ";

    cards.forEach(function (card) {
      card.addEventListener("click", function () {
        selected.push(card.dataset.word);
        card.classList.add("used");
        answerBox.classList.remove("correct", "wrong");
        answerBox.textContent = selected.join(" ");
        feedback.textContent = "";
      });
    });

    checkButton.addEventListener("click", function () {
      const correct = selected.join(" ") === correctSentence;
      answerBox.classList.toggle("correct", correct);
      answerBox.classList.toggle("wrong", !correct);
      feedback.textContent = correct
        ? "✅ أحسنت! Ayat disusun dengan betul."
        : "❌ Susunan belum tepat. Cuba semula.";
      feedback.style.color = correct ? "#55e68a" : "#ff6b7a";
      aria.play(correct ? "correct" : "wrong");
      if (correct) progress.complete("qiraah");
    });

    resetButton.addEventListener("click", function () {
      selected.length = 0;
      answerBox.classList.remove("correct", "wrong");
      answerBox.innerHTML = '<span class="answer-placeholder">Klik perkataan mengikut susunan yang betul.</span>';
      feedback.textContent = "";
      cards.forEach((card) => card.classList.remove("used"));
    });
  });

  // Kitabah: pilih perkataan
  document.querySelectorAll(".kitabah-step").forEach(function (step) {
    const buttons = step.querySelectorAll(".kitabah-option");
    const blank = step.querySelector(".kitabah-blank");
    const feedback = step.querySelector(".kitabah-feedback");

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach((item) => item.classList.remove("correct", "wrong"));
        blank.textContent = button.dataset.word;
        const correct = button.dataset.answer === "correct";
        button.classList.add(correct ? "correct" : "wrong");
        feedback.textContent = correct
          ? "✅ أحسنت! Perkataan dipilih dengan betul."
          : "❌ Jawapan belum tepat. Cuba sekali lagi.";
        feedback.style.color = correct ? "#55e68a" : "#ff6b7a";
        aria.play(correct ? "correct" : "wrong");
        if (correct && button.closest("#mission01")) progress.complete("kitabah");
      });
    });
  });

  // Cabaran misi
  document.querySelectorAll(".answer-button").forEach(function (button) {
    button.addEventListener("click", function () {
      const step = button.closest(".learning-step");
      const answers = step ? step.querySelectorAll(".answer-button") : [];
      const feedback = step ? step.querySelector(".mission-feedback") : null;
      answers.forEach((item) => item.classList.remove("correct-answer", "wrong-answer"));
      const correct = button.dataset.answer === "correct";
      button.classList.add(correct ? "correct-answer" : "wrong-answer");
      if (feedback) {
        feedback.textContent = correct
          ? "🎉 Betul! Jawapan telah disahkan."
          : "❌ Jawapan belum tepat. Cuba sekali lagi.";
        feedback.style.color = correct ? "#55e68a" : "#ff6b7a";
      }
      aria.play(correct ? "correct" : "wrong");
      if (correct && button.closest("#mission01")) {
        const newlyCompleted = progress.complete("challenge");
        if (newlyCompleted && progress.getState().progress >= 100) {
          setTimeout(() => aria.play("complete"), 900);
        }
      }
    });
  });

  const resetButton = document.getElementById("resetProgressButton");
  if (resetButton) {
    resetButton.addEventListener("click", function () {
      const confirmed = window.confirm("Reset semua kemajuan Mission 01 dan XP?");
      if (confirmed) {
        progress.reset();
        window.location.reload();
      }
    });
  }
});
/*=====================================
MISSION 02 AUDIO
=====================================*/

function playMission02Dialog(number){

    const audio = new Audio(
        `AUDIO/GURU/mission02_dialog0${number}.m4a`
    );

    audio.play();

}
/* ==================================
   MISSION 02 - AUDIO CHECKPOINT
================================== */

const mission02AudioButtons =
  document.querySelectorAll(".mission02-dialog-audio");

const completedMission02Dialogs = new Set();

let currentMission02Audio = null;
let mission02AudioRewardGiven = false;

mission02AudioButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const dialogNumber =
      button.getAttribute("data-dialog");

    const audioPath =
      button.getAttribute("data-audio");

    const buttonText =
      button.querySelector(".dialog-button-text");

    const status =
      document.querySelector(
        `[data-dialog-status="${dialogNumber}"]`
      );

    /*
      Hentikan audio lain sekiranya murid
      menekan dialog baharu.
    */
    if (currentMission02Audio) {
      currentMission02Audio.pause();
      currentMission02Audio.currentTime = 0;

      mission02AudioButtons.forEach(function (otherButton) {
        otherButton.classList.remove("is-playing");

        const otherNumber =
          otherButton.getAttribute("data-dialog");

        const otherText =
          otherButton.querySelector(".dialog-button-text");

        if (
          !completedMission02Dialogs.has(otherNumber)
        ) {
          otherText.textContent =
            `Mainkan Dialog ${otherNumber}`;
        }
      });
    }

    const audio = new Audio(audioPath);
    currentMission02Audio = audio;

    button.classList.add("is-playing");

    buttonText.textContent =
      "Sedang dimainkan...";

    status.textContent =
      "🎧 Dengar dan ulang selepas guru.";

    status.style.color = "#ffd052";

    audio.play().catch(function (error) {
      console.error(
        "Audio Mission 02 gagal dimainkan:",
        error
      );

      button.classList.remove("is-playing");

      buttonText.textContent =
        `Mainkan Dialog ${dialogNumber}`;

      status.textContent =
        "❌ Audio tidak dapat dimainkan. Semak nama fail.";

      status.style.color = "#ff6b7a";
    });

    audio.addEventListener("ended", function () {
      button.classList.remove("is-playing");
      button.classList.add("is-complete");

      buttonText.textContent =
        `Dialog ${dialogNumber} Selesai`;

      status.textContent =
        "✅ Audio selesai dimainkan.";

      status.style.color = "#55e68a";

      completedMission02Dialogs.add(dialogNumber);

      currentMission02Audio = null;

      checkMission02AudioCompletion();
    });
  });
});

function checkMission02AudioCompletion() {
  if (completedMission02Dialogs.size !== 4) {
    return;
  }

  const completionBox =
    document.getElementById(
      "mission02AudioComplete"
    );

  completionBox.hidden = false;

  const mission02State = window.ArbloxiaStorage.load();
  mission02State.mission02Complete = true;
  window.ArbloxiaStorage.save(mission02State);
  if (window.ArbloxiaProgress) window.ArbloxiaProgress.render();
  if (window.ArbloxiaPassport) window.ArbloxiaPassport.render();
  if (window.ArbloxiaRenderSummitAccess) window.ArbloxiaRenderSummitAccess();

  /*
    Elakkan ganjaran diberi berulang kali.
  */
  if (!mission02AudioRewardGiven) {
    mission02AudioRewardGiven = true;

    /*
      Aktifkan baris ini kemudian apabila
      Progress Mission 02 telah disambungkan.
    */

    // updateMission02Progress(20, 20);
  }

  const ariaComplete =
    new Audio(
      "AUDIO/ARIA/aria_complete.mp3"
    );

  ariaComplete.play().catch(function () {
    console.log(
      "Audio ARIA complete tidak dapat dimainkan."
    );
  });

  completionBox.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}
/* =====================================
   MISSION 03 — TERMINAL PERJALANAN
===================================== */
document.addEventListener("DOMContentLoaded", function () {
  const panel = document.getElementById("mission03");
  if (!panel) return;

  const startButton = document.getElementById("mission03Start");
  const game = document.getElementById("mission03Game");
  const count = document.getElementById("mission03Count");
  const xp = document.getElementById("mission03Xp");
  let completed = 0;
  let missionXp = 0;
  let activeAudio = null;

  function showCheckpoint(number) {
    panel.querySelectorAll("[data-checkpoint]").forEach(function (item) {
      const isCurrent = Number(item.dataset.checkpoint) === number;
      item.hidden = !isCurrent;
      item.classList.toggle("active", isCurrent);
    });
    panel.querySelectorAll("[data-route-stop]").forEach(function (stop) {
      const n = Number(stop.dataset.routeStop);
      stop.classList.toggle("active", n === number);
      stop.classList.toggle("complete", n < number);
    });
    const current = panel.querySelector(`[data-checkpoint="${number}"]`);
    if (current) current.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  startButton.addEventListener("click", function () {
    const latestState = window.ArbloxiaStorage.load();
    if (!latestState.mission02Complete) {
      alert("Selesaikan Mission 02 terlebih dahulu.");
      if (window.ArbloxiaProgress) window.ArbloxiaProgress.render();
      return;
    }
    game.hidden = false;
    startButton.disabled = true;
    startButton.textContent = "✅ TIKET DIAMBIL";
    showCheckpoint(1);
  });

  panel.querySelectorAll(".mission03-checkpoint").forEach(function (checkpoint) {
    const options = checkpoint.querySelectorAll(".mission03-option");
    const feedback = checkpoint.querySelector(".mission03-feedback");
    const reward = checkpoint.querySelector(".mission03-reward");

    options.forEach(function (option) {
      option.addEventListener("click", function () {
        if (checkpoint.dataset.completed === "true") return;
        const correct = option.dataset.correct === "true";
        options.forEach((item) => item.classList.remove("wrong"));

        if (!correct) {
          option.classList.add("wrong");
          feedback.textContent = "❌ Tiket belum sepadan. Cuba pilihan lain.";
          feedback.style.color = "#ff7b88";
          if (window.ArbloxiaAudio) window.ArbloxiaAudio.play("wrong");
          return;
        }

        checkpoint.dataset.completed = "true";
        option.classList.add("correct");
        options.forEach((item) => { item.disabled = true; });
        feedback.textContent = "🎉 Betul! Jawapan telah disahkan.";
        feedback.style.color = "#55e68a";
        reward.hidden = false;
        completed += 1;
        missionXp += 5;
        count.textContent = `${completed}/4`;
        xp.textContent = missionXp;
        if (window.ArbloxiaAudio) window.ArbloxiaAudio.play("correct");
      });
    });
  });

  panel.querySelectorAll(".mission03-next-button").forEach(function (button) {
    button.addEventListener("click", function () {
      const checkpoint = button.closest(".mission03-checkpoint");
      const next = Number(checkpoint.dataset.checkpoint) + 1;
      showCheckpoint(next);
      if (next === 5) {
        const mission03State = window.ArbloxiaStorage.load();
        mission03State.mission03Complete = true;
        window.ArbloxiaStorage.save(mission03State);
        if (window.ArbloxiaRenderSummitAccess) window.ArbloxiaRenderSummitAccess();
        if (window.ArbloxiaAudio) {
          setTimeout(function () { window.ArbloxiaAudio.play("complete"); }, 500);
        }
      }
    });
  });

  panel.querySelectorAll(".mission03-audio-button").forEach(function (button) {
    button.addEventListener("click", function () {
      if (activeAudio) {
        activeAudio.pause();
        activeAudio.currentTime = 0;
      }
      const original = button.dataset.originalText || button.textContent;
      button.dataset.originalText = original;
      activeAudio = new Audio(button.dataset.audio);
      button.textContent = "⏸️ Sedang dimainkan...";
      activeAudio.play().catch(function () {
        button.textContent = "❌ Audio belum dimasukkan";
        setTimeout(function () { button.textContent = original; }, 1800);
      });
      activeAudio.addEventListener("ended", function () {
        button.textContent = "✅ Audio Selesai";
        activeAudio = null;
      });
    });
  });

  function resetMission03(autoStart) {
    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio = null;
    }

    completed = 0;
    missionXp = 0;
    count.textContent = "0/4";
    xp.textContent = "0";

    panel.querySelectorAll(".mission03-checkpoint").forEach(function (checkpoint) {
      delete checkpoint.dataset.completed;
      checkpoint.classList.remove("active");
      checkpoint.hidden = true;

      checkpoint.querySelectorAll(".mission03-option").forEach(function (option) {
        option.disabled = false;
        option.classList.remove("correct", "wrong");
      });

      const feedback = checkpoint.querySelector(".mission03-feedback");
      if (feedback) {
        feedback.textContent = "";
        feedback.removeAttribute("style");
      }

      const reward = checkpoint.querySelector(".mission03-reward");
      if (reward) reward.hidden = true;
    });

    panel.querySelectorAll(".mission03-audio-button").forEach(function (button) {
      button.textContent = button.dataset.originalText || "🔊 Dengar Jawapan Guru";
    });

    panel.querySelectorAll("[data-route-stop]").forEach(function (stop) {
      stop.classList.remove("active", "complete");
    });

    const passport = panel.querySelector('[data-checkpoint="5"]');
    if (passport) passport.hidden = true;

    startButton.disabled = Boolean(autoStart);
    startButton.textContent = autoStart ? "✅ TIKET DIAMBIL" : "🎫 AMBIL TIKET";
    game.hidden = !autoStart;

    if (autoStart) {
      showCheckpoint(1);
    } else {
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const replayButton = document.getElementById("mission03Replay");
  if (replayButton) {
    replayButton.addEventListener("click", function () {
      resetMission03(true);
    });
  }
});


/* ==========================================
   ARBLOXIA v4.2 — STATUS MISI & MISI KEMUNCAK
========================================== */
(function () {
  function loadState() {
    return window.ArbloxiaStorage ? window.ArbloxiaStorage.load() : {};
  }
  function saveState(state) {
    if (window.ArbloxiaStorage) window.ArbloxiaStorage.save(state);
  }
  function renderSummitAccess() {
    const state = loadState();
    const mission01Complete = Number(state.progress || 0) >= 100;
    const unlocked = mission01Complete && Boolean(state.mission02Complete) && Boolean(state.mission03Complete);
    const card = document.querySelector('[data-mission-card="summit"]');
    const button = document.querySelector('.summit-start-button');
    if (card) {
      card.classList.toggle('locked', !unlocked);
      card.classList.toggle('unlocked', unlocked);
    }
    if (button) {
      button.disabled = !unlocked;
      button.setAttribute('aria-disabled', String(!unlocked));
      button.textContent = unlocked ? '👑 CABAR MISI KEMUNCAK' : '🔒 SELESAIKAN TIGA MISI DAHULU';
    }
  }
  window.ArbloxiaRenderSummitAccess = renderSummitAccess;

  document.addEventListener('DOMContentLoaded', function () {
    renderSummitAccess();

    const panel = document.getElementById('summitMission');
    if (!panel) return;
    const begin = document.getElementById('summitBegin');
    const game = document.getElementById('summitGame');
    const count = document.getElementById('summitCount');
    const xp = document.getElementById('summitXp');
    const fill = document.getElementById('summitProgressFill');
    let completed = 0;
    let missionXp = 0;

    function showStep(number) {
      panel.querySelectorAll('[data-summit-step]').forEach(function (item) {
        const active = Number(item.dataset.summitStep) === number;
        item.hidden = !active;
        item.classList.toggle('active', active);
      });
      const current = panel.querySelector(`[data-summit-step="${number}"]`);
      if (current) current.scrollIntoView({ behavior:'smooth', block:'center' });
    }

    function updateProgress() {
      count.textContent = `${completed}/5`;
      xp.textContent = missionXp;
      fill.style.width = `${completed * 20}%`;
    }

    begin.addEventListener('click', function () {
      game.hidden = false;
      begin.disabled = true;
      begin.textContent = '✅ MISI DIMULAKAN';
      showStep(1);
    });

    panel.querySelectorAll('.summit-challenge').forEach(function (challenge) {
      const options = challenge.querySelectorAll('.summit-option');
      const feedback = challenge.querySelector('.summit-feedback');
      const next = challenge.querySelector('.summit-next-button');
      options.forEach(function (option) {
        option.addEventListener('click', function () {
          if (challenge.dataset.completed === 'true') return;
          const correct = option.dataset.correct === 'true';
          options.forEach(function (item) { item.classList.remove('wrong'); });
          if (!correct) {
            option.classList.add('wrong');
            feedback.textContent = '❌ Jawapan belum tepat. Cuba sekali lagi.';
            feedback.style.color = '#ff6b7a';
            if (window.ArbloxiaAudio) window.ArbloxiaAudio.play('wrong');
            return;
          }
          challenge.dataset.completed = 'true';
          option.classList.add('correct');
          options.forEach(function (item) { item.disabled = true; });
          feedback.textContent = '✅ أَحْسَنْتَ! Cabaran berjaya diselesaikan.';
          feedback.style.color = '#55e68a';
          next.hidden = false;
          completed += 1;
          missionXp += 10;
          updateProgress();
          if (window.ArbloxiaAudio) window.ArbloxiaAudio.play('correct');
        });
      });
    });

    panel.querySelectorAll('.summit-next-button').forEach(function (button) {
      button.addEventListener('click', function () {
        const challenge = button.closest('.summit-challenge');
        const nextStep = Number(challenge.dataset.summitStep) + 1;
        showStep(nextStep);
        if (nextStep === 6) {
          const state = loadState();
          state.summitComplete = true;
          state.summitXp = Math.max(Number(state.summitXp || 0), 50);
          saveState(state);
          if (window.ArbloxiaAudio) setTimeout(function(){ window.ArbloxiaAudio.play('complete'); }, 450);
          renderSummitAccess();
          if (window.ArbloxiaRenderCertificateAccess) window.ArbloxiaRenderCertificateAccess();
        }
      });
    });

    function resetSummit(autoStart) {
      completed = 0;
      missionXp = 0;
      updateProgress();
      panel.querySelectorAll('.summit-challenge').forEach(function (challenge) {
        delete challenge.dataset.completed;
        challenge.hidden = true;
        challenge.querySelectorAll('.summit-option').forEach(function (option) {
          option.disabled = false;
          option.classList.remove('correct','wrong');
        });
        const feedback = challenge.querySelector('.summit-feedback');
        if (feedback) { feedback.textContent=''; feedback.removeAttribute('style'); }
        const next = challenge.querySelector('.summit-next-button');
        if (next) next.hidden = true;
      });
      const award = panel.querySelector('[data-summit-step="6"]');
      if (award) award.hidden = true;
      game.hidden = !autoStart;
      begin.disabled = Boolean(autoStart);
      begin.textContent = autoStart ? '✅ MISI DIMULAKAN' : '🚀 MULAKAN MISI KEMUNCAK';
      if (autoStart) showStep(1);
    }

    const replay = document.getElementById('summitReplay');
    if (replay) replay.addEventListener('click', function(){ resetSummit(true); });
  });
})();

/* ==========================================
   ARBLOXIA v4.3 — PENJANA SIJIL PNG
========================================== */
(function () {
  function fitText(ctx, text, maxWidth, startSize, minSize) {
    let size = startSize;
    while (size > minSize) {
      ctx.font = `800 ${size}px Arial, sans-serif`;
      if (ctx.measureText(text).width <= maxWidth) break;
      size -= 2;
    }
    return size;
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      const image = new Image();
      image.onload = function () { resolve(image); };
      image.onerror = reject;
      image.src = src;
    });
  }

  async function generateTravelMasterCertificate(name) {
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1131;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 1600, 1131);
    gradient.addColorStop(0, '#061a34');
    gradient.addColorStop(0.55, '#0b3159');
    gradient.addColorStop(1, '#071426');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#ffd052';
    ctx.lineWidth = 14;
    ctx.strokeRect(44, 44, 1512, 1043);
    ctx.strokeStyle = 'rgba(47, 207, 255, 0.8)';
    ctx.lineWidth = 3;
    ctx.strokeRect(68, 68, 1464, 995);

    for (let i = 0; i < 34; i += 1) {
      const x = 110 + ((i * 173) % 1380);
      const y = 100 + ((i * 97) % 900);
      ctx.fillStyle = i % 2 ? 'rgba(255,208,82,0.16)' : 'rgba(47,207,255,0.15)';
      ctx.beginPath();
      ctx.arc(x, y, 3 + (i % 4), 0, Math.PI * 2);
      ctx.fill();
    }

    try {
      const logo = await loadImage('IMAGES/logo-arbloxia.png');
      const maxW = 470;
      const ratio = Math.min(maxW / logo.width, 175 / logo.height);
      const w = logo.width * ratio;
      const h = logo.height * ratio;
      ctx.drawImage(logo, (1600 - w) / 2, 92, w, h);
    } catch (error) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 72px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ARBLOXIA', 800, 190);
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd052';
    ctx.font = '900 70px Arial, sans-serif';
    ctx.fillText('SIJIL PENCAPAIAN', 800, 330);

    ctx.fillStyle = '#d8edff';
    ctx.font = '500 30px Arial, sans-serif';
    ctx.fillText('Dengan bangganya dianugerahkan kepada', 800, 395);

    const safeName = name.trim() || 'Ejen ARBLOXIA';
    const nameSize = fitText(ctx, safeName, 1240, 76, 38);
    ctx.font = `900 ${nameSize}px Arial, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(safeName, 800, 500);

    ctx.strokeStyle = '#2fcfff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(290, 535);
    ctx.lineTo(1310, 535);
    ctx.stroke();

    ctx.fillStyle = '#d8edff';
    ctx.font = '500 30px Arial, sans-serif';
    ctx.fillText('atas kejayaan menyelesaikan Misi Kemuncak dan menguasai', 800, 610);

    ctx.fillStyle = '#55d7ff';
    ctx.font = '700 62px serif';
    ctx.direction = 'rtl';
    ctx.fillText('الجُمْلَةُ الْبَسِيطَةُ', 800, 700);
    ctx.direction = 'ltr';

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 34px Arial, sans-serif';
    ctx.fillText('dalam tajuk رِحْلَةٌ سَعِيدَةٌ', 800, 765);

    ctx.fillStyle = '#ffd052';
    ctx.font = '900 58px Arial, sans-serif';
    ctx.fillText('🏅 TRAVEL MASTER', 800, 865);

    const dateText = new Intl.DateTimeFormat('ms-MY', {
      day: 'numeric', month: 'long', year: 'numeric'
    }).format(new Date());
    ctx.fillStyle = '#c8ddf0';
    ctx.font = '500 25px Arial, sans-serif';
    ctx.fillText(`Tarikh: ${dateText}`, 800, 940);

    ctx.fillStyle = '#ffd052';
    ctx.font = '800 25px Arial, sans-serif';
    ctx.fillText('#SimpleTapiSampai', 800, 1015);

    ctx.fillStyle = '#8ba8c4';
    ctx.font = '500 19px Arial, sans-serif';
    ctx.fillText('Dijana secara digital melalui platform pembelajaran ARBLOXIA', 800, 1052);

    return canvas.toDataURL('image/png');
  }

  document.addEventListener('DOMContentLoaded', function () {
    const button = document.getElementById('downloadCertificate');
    const input = document.getElementById('certificateName');
    const status = document.getElementById('certificateStatus');
    if (!button || !input) return;

    button.addEventListener('click', async function () {
      const name = input.value.trim();
      if (!name) {
        status.textContent = '⚠️ Sila masukkan nama murid terlebih dahulu.';
        status.style.color = '#ffd052';
        input.focus();
        return;
      }

      button.disabled = true;
      button.textContent = '⏳ MENJANA SIJIL...';
      status.textContent = 'Sijil sedang disediakan.';
      status.style.color = '#d9ecff';

      try {
        const dataUrl = await generateTravelMasterCertificate(name);
        const safeFileName = name.replace(/[^a-zA-Z0-9\u00C0-\u024F\u0600-\u06FF]+/g, '-').replace(/^-|-$/g, '') || 'Ejen-ARBLOXIA';
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `Sijil-Travel-Master-${safeFileName}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        status.textContent = '✅ Sijil berjaya dimuat turun.';
        status.style.color = '#55e68a';
      } catch (error) {
        console.error('Sijil gagal dijana:', error);
        status.textContent = '❌ Sijil tidak dapat dijana. Cuba semula.';
        status.style.color = '#ff6b7a';
      } finally {
        button.disabled = false;
        button.textContent = '📥 DOWNLOAD SIJIL TRAVEL MASTER';
      }
    });
  });
})();


/* ==========================================
   ARBLOXIA v4.3.1 — PAPAR STATUS SIJIL
========================================== */
(function () {
  function renderCertificateAccess() {
    const state = window.ArbloxiaStorage ? window.ArbloxiaStorage.load() : {};
    const unlocked = Boolean(state.summitComplete);
    const card = document.getElementById('certificateAccessCard');
    const icon = document.getElementById('certificateAccessIcon');
    const text = document.getElementById('certificateAccessText');
    const button = document.getElementById('certificateAccessButton');
    if (!card || !button) return;
    card.classList.toggle('is-unlocked', unlocked);
    icon.textContent = unlocked ? '📜' : '🔒';
    text.textContent = unlocked
      ? 'Sijil telah dibuka. Buka Misi Kemuncak untuk mengisi nama murid dan memuat turun sijil PNG.'
      : 'Selesaikan Misi Kemuncak untuk membuka ruang nama dan butang muat turun sijil.';
    button.disabled = !unlocked;
    button.textContent = unlocked ? '📥 BUKA RUANG DOWNLOAD SIJIL' : '🔒 SIJIL BELUM DIBUKA';
  }
  document.addEventListener('DOMContentLoaded', function () {
    renderCertificateAccess();
    const button = document.getElementById('certificateAccessButton');
    if (button) button.addEventListener('click', function () {
      const summitCard = document.querySelector('[data-mission-card="summit"]');
      if (summitCard) summitCard.scrollIntoView({ behavior:'smooth', block:'center' });
    });
  });
  const oldRender = window.ArbloxiaRenderSummitAccess;
  if (oldRender) {
    window.ArbloxiaRenderSummitAccess = function () { oldRender(); renderCertificateAccess(); };
  }
  window.ArbloxiaRenderCertificateAccess = renderCertificateAccess;
})();


/* ==========================================
   ARBLOXIA v4.5 — TRAVEL MASTER & LEVEL 2
========================================== */
(function () {
  let lastUnlocked = null;

  function getState() {
    return window.ArbloxiaStorage ? window.ArbloxiaStorage.load() : {};
  }

  function ensureLevel2Toast() {
    if (document.getElementById('level2ReadyToast')) return;
    const toast = document.createElement('div');
    toast.id = 'level2ReadyToast';
    toast.className = 'level2-ready-toast';
    toast.hidden = true;
    toast.innerHTML = `
      <div class="level2-ready-box" role="dialog" aria-modal="true" aria-labelledby="level2ReadyTitle">
        <div class="unlock-icon">🔓</div>
        <h2 id="level2ReadyTitle">LEVEL 2 DIBUKA!</h2>
        <p>Anda telah memperoleh Lencana <strong>Travel Master</strong> dan kini bersedia mempelajari</p>
        <p class="level2-arabic" lang="ar" dir="rtl">الجُمْلَةُ الْمُتَنَاسِقَةُ</p>
        <button type="button" id="closeLevel2Ready">TERUSKAN</button>
      </div>`;
    document.body.appendChild(toast);
    document.getElementById('closeLevel2Ready').addEventListener('click', function () {
      toast.hidden = true;
    });
  }

  function renderTravelMasterAndLevel2() {
    const state = getState();
    const unlocked = Boolean(state.summitComplete);

    const badge = document.getElementById('travelMasterBadgeSection');
    const badgeStatus = document.getElementById('travelMasterBadgeStatus');
    const badgeTitle = document.getElementById('travelMasterBadgeTitle');
    const badgeText = document.getElementById('travelMasterBadgeText');
    if (badge) badge.classList.toggle('is-unlocked', unlocked);
    if (badgeStatus) badgeStatus.textContent = unlocked ? '🏅 LENCANA DIBUKA' : '🔒 BELUM DIBUKA';
    if (badgeTitle) badgeTitle.textContent = unlocked ? 'Travel Master' : 'Badge Ejen Jumlah Basitoh';
    if (badgeText) badgeText.textContent = unlocked
      ? 'Tahniah! Anda telah menguasai Jumlah Basitoh dan menamatkan Misi Kemuncak.'
      : 'Selesaikan Misi Kemuncak untuk memperoleh Lencana Travel Master.';

    const resourceCard = document.getElementById('travelMasterResourceCard');
    const resourceIcon = document.getElementById('travelMasterResourceIcon');
    const resourceText = document.getElementById('travelMasterResourceText');
    const resourceButton = document.getElementById('travelMasterResourceButton');
    if (resourceCard) resourceCard.classList.toggle('is-unlocked', unlocked);
    if (resourceIcon) resourceIcon.textContent = unlocked ? '📖' : '📘';
    if (resourceText) resourceText.textContent = unlocked
      ? 'Bahan pengukuhan Travel Master telah dibuka. Gunakan flipbook ini untuk ulang kaji sebelum memasuki Level 2.'
      : 'Selesaikan Misi Kemuncak untuk membuka bahan ulang kaji interaktif Jumlah Basitoh.';
    if (resourceButton) {
      resourceButton.disabled = !unlocked;
      resourceButton.textContent = unlocked ? '📖 BUKA FLIPBOOK TRAVEL MASTER' : '🔒 BAHAN BELUM DIBUKA';
    }

    const card = document.getElementById('level2UnlockCard');
    const symbol = document.getElementById('level2UnlockSymbol');
    const text = document.getElementById('level2UnlockText');
    const button = document.getElementById('level2UnlockButton');
    if (card) card.classList.toggle('is-unlocked', unlocked);
    if (symbol) symbol.textContent = unlocked ? '🔓' : '🔒';
    if (text) text.textContent = unlocked
      ? 'Tahniah! Level 2 telah dibuka. Kandungan Jumlah Mutanasiqah akan diteruskan dalam tahap ini.'
      : 'Lengkapkan Misi Kemuncak untuk membuka tahap pengembangan ayat.';
    if (button) {
      button.disabled = !unlocked;
      button.textContent = unlocked ? '🚀 LEVEL 2 TELAH DIBUKA' : '🔒 LEVEL 2 BELUM DIBUKA';
    }

    ensureLevel2Toast();
    if (lastUnlocked === false && unlocked) {
      const toast = document.getElementById('level2ReadyToast');
      if (toast) toast.hidden = false;
      if (window.ArbloxiaAudio) setTimeout(function () { window.ArbloxiaAudio.play('complete'); }, 250);
    }
    lastUnlocked = unlocked;
  }

  document.addEventListener('DOMContentLoaded', function () {
    lastUnlocked = Boolean(getState().summitComplete);
    renderTravelMasterAndLevel2();
    const resourceButton = document.getElementById('travelMasterResourceButton');
    if (resourceButton) resourceButton.addEventListener('click', function () {
      if (resourceButton.disabled) return;
      window.open('https://e.fliphtml5.com/UmmuSofiy/yznl/index.html', '_blank', 'noopener,noreferrer');
    });

    const button = document.getElementById('level2UnlockButton');
    if (button) button.addEventListener('click', function () {
      const toast = document.getElementById('level2ReadyToast');
      if (toast) toast.hidden = false;
    });
    window.setInterval(renderTravelMasterAndLevel2, 600);
  });

  window.ArbloxiaRenderLevel2Unlock = renderTravelMasterAndLevel2;
})();
