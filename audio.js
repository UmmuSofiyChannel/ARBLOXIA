window.ArbloxiaAudio = (function () {
  const files = {
    online: "AUDIO/ARIA/aria_online.mp3",
    scan: "AUDIO/ARIA/aria_scan.mp3",
    correct: "AUDIO/ARIA/aria_correct.mp3",
    wrong: "AUDIO/ARIA/aria_wrong.mp3",
    complete: "AUDIO/ARIA/aria_complete.mp3"
  };
  let current = null;

  function play(name) {
    const src = files[name];
    if (!src) return;
    if (current) {
      current.pause();
      current.currentTime = 0;
    }
    current = new Audio(src);
    current.play().catch((error) => console.log("Audio ARIA gagal dimainkan:", error));
  }

  return { play };
})();
