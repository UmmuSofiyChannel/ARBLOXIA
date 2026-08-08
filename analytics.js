/* =====================================================
   ARBLOXIA ANALYTICS
   - Pengenalan Kalimah
   - Kaunter lawatan global (CounterAPI V1)
===================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const intro = document.getElementById("kalimahIntro");
  const readyButton = document.getElementById("kalimahReadyButton");
  const reopenButton = document.getElementById("reopenKalimahButton");

  function openIntro() {
    if (!intro) return;
    intro.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeIntro() {
    if (!intro) return;
    intro.hidden = true;
    document.body.style.overflow = "";
    sessionStorage.setItem("arbloxia-kalimah-seen", "yes");
  }

  if (sessionStorage.getItem("arbloxia-kalimah-seen") === "yes") {
    closeIntro();
  } else {
    openIntro();
  }

  if (readyButton) readyButton.addEventListener("click", closeIntro);
  if (reopenButton) reopenButton.addEventListener("click", openIntro);

  updateVisitorCounter();
});

async function updateVisitorCounter() {
  const output = document.getElementById("visitorCount");
  if (!output) return;

  const namespace = "arbloxia-simple-tapi-sampai";
  const counterName = "website-visitors";
  const today = new Date().toISOString().slice(0, 10);
  const lastCountedDate = localStorage.getItem("arbloxia-last-counted-date");
  const action = lastCountedDate === today ? "" : "/up";
  const url = `https://api.counterapi.dev/v1/${namespace}/${counterName}${action}`;

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const result = await response.json();
    const value =
      result.value ??
      result.count ??
      result.data?.value ??
      result.data?.count ??
      result.data?.up_count;

    if (typeof value !== "number") {
      throw new Error("Format kiraan tidak dikenali");
    }

    output.textContent = new Intl.NumberFormat("ms-MY").format(value);
    output.title = "Satu lawatan direkodkan bagi setiap peranti dalam sehari.";

    if (lastCountedDate !== today) {
      localStorage.setItem("arbloxia-last-counted-date", today);
    }
  } catch (error) {
    console.warn("Kaunter pengunjung tidak dapat dicapai:", error);
    output.textContent = "Tidak tersedia";
    output.title = "Kaunter memerlukan sambungan Internet.";
  }
}
