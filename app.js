const dailyHabits = [
  "6 uur gefocust gewerkt",
  "30+ min buiten geweest",
  "10+ min gelezen",
  "Iets opgeruimd",
  "Max 1,5 uur tv gekeken",
  "Niet gesnoozed"
];

const weeklyHabits = [
  "Minimaal 4x sporten",
  "30 uur gefocust gewerkt",
  "Dagelijks 30+ min buitenlucht",
  "Dagelijks 10+ min lezen",
  "Max 1x onbeperkt alcohol",
  "Max 1x max 2 glazen wijn",
  "5x iets opgeruimd"
];

function saveState(type, state) {
  localStorage.setItem(type, JSON.stringify(state));
}

function loadState(type, defaultState) {
  const stored = localStorage.getItem(type);
  return stored ? JSON.parse(stored) : defaultState;
}

function createCheckboxList(habits, containerId, type) {
  const stateKey = type + "State";
  let checkboxStates = loadState(stateKey, new Array(habits.length).fill(false));
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  habits.forEach((habit, i) => {
    const label = document.createElement("label");
    label.className = "flex items-center space-x-2 mb-2";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = checkboxStates[i];
    checkbox.onchange = () => {
      checkboxStates[i] = checkbox.checked;
      saveState(stateKey, checkboxStates);
      updateProgress(type);
    };
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(habit));
    container.appendChild(label);
  });
  updateProgress(type);
}

function updateProgress(type) {
  const containerId = type === "daily" ? "daily-container" : "weekly-container";
  const container = document.getElementById(containerId);
  const checkboxes = container.querySelectorAll("input[type='checkbox']");
  const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
  const progress = Math.round((checked / checkboxes.length) * 100);
  document.getElementById(`${type}-progress`).innerText = `${progress}% voltooid`;
}

function resetAll() {
  const dailyContainer = document.getElementById("daily-container");
  const weeklyContainer = document.getElementById("weekly-container");

  const dailyChecks = dailyContainer.querySelectorAll("input[type='checkbox']");
  const weeklyChecks = weeklyContainer.querySelectorAll("input[type='checkbox']");

  const dailyScore = Math.round((Array.from(dailyChecks).filter(cb => cb.checked).length / dailyChecks.length) * 100);
  const weeklyScore = Math.round((Array.from(weeklyChecks).filter(cb => cb.checked).length / weeklyChecks.length) * 100);

  const advice = weeklyScore < 70 || dailyScore < 70
    ? "Je hebt jezelf weer eens niet serieus genomen deze week. Dit niveau gaat je doelen niet dichterbij brengen."
    : "Prima week, maar je weet dat je beter kunt. Blijf scherp."; generateAdvice(dailyScore, weeklyScore);
  const notes = document.getElementById("notes").value;
  const date = new Date().toLocaleDateString();

  const currentStats = JSON.parse(localStorage.getItem("weeklyStats")) || [];
  const newStats = [{ date, dailyScore, weeklyScore, advice, notes }, ...currentStats.slice(0, 4)];
  localStorage.setItem("weeklyStats", JSON.stringify(newStats));

  localStorage.removeItem("dailyState");
  localStorage.removeItem("weeklyState");
  document.getElementById("notes").value = "";
  document.getElementById("new-advice").innerText = advice;

  createCheckboxList(dailyHabits, "daily-container", "daily");
  createCheckboxList(weeklyHabits, "weekly-container", "weekly");
  renderStats();
  renderChart();
}

function generateAdvice(dailyScore, weeklyScore) {
  let advice = "";
  if (dailyScore < 70) advice += "Probeer consistenter te zijn met je dagelijkse gewoontes. ";
  if (weeklyScore < 70) advice += "Wekelijkse doelen zijn nog niet structureel. Focus op 1 of 2 verbeterpunten. ";
  if (dailyScore >= 90 && weeklyScore >= 90) advice = "Topweek! Blijf deze lijn doortrekken.";
  return advice.trim();
}

function renderStats() {
  const stats = JSON.parse(localStorage.getItem("weeklyStats")) || [];
  const container = document.getElementById("stats-container");
  if (!container) return;
  container.innerHTML = stats.map(stat => `
    <li class="mb-2 p-2 border rounded">
      <strong>${stat.date}</strong> — Dagelijks: ${stat.dailyScore}% | Wekelijks: ${stat.weeklyScore}%<br/>
      <em>Advies:</em> ${stat.advice}
    </li>`).join("\n");
}

function renderChart() {
  const ctx = document.getElementById("progressChart").getContext("2d");
  const stats = JSON.parse(localStorage.getItem("weeklyStats")) || [];

  if (window.myChart) window.myChart.destroy();

  window.myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: stats.map(s => s.date).reverse(),
      datasets: [
        {
          label: "Dagelijks",
          data: stats.map(s => s.dailyScore).reverse(),
          borderWidth: 2,
          fill: false
        },
        {
          label: "Wekelijks",
          data: stats.map(s => s.weeklyScore).reverse(),
          borderWidth: 2,
          fill: false
        }
      ]
    },
    options: {
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM volledig geladen");
  const saveBtn = document.getElementById("save-day-btn");
  if (saveBtn) {
    console.log("Save-knop gevonden en gekoppeld.");
    saveBtn.addEventListener("click", saveToday);
  } else {
    console.warn("Save-knop niet gevonden!");
  }
  const saveBtn = document.getElementById("save-day-btn");
  if (saveBtn) saveBtn.addEventListener("click", saveToday);
  createCheckboxList(dailyHabits, "daily-container", "daily");
  createCheckboxList(weeklyHabits, "weekly-container", "weekly");
  renderStats();
  renderChart();
});

function saveToday() {
  const key = "dailyState_" + getTodayKey();
  const checkboxes = document.querySelectorAll("#daily-container input[type='checkbox']");
  const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
  const score = Math.round((checked / dailyHabits.length) * 100);

  const scores = JSON.parse(localStorage.getItem("dailyScores")) || [];
  scores.unshift({ date: getTodayKey(), score });
  localStorage.setItem("dailyScores", JSON.stringify(scores.slice(0, 14)));

  localStorage.removeItem(key);
  createCheckboxList(dailyHabits, "daily-container", "daily");

  alert(`Dag opgeslagen: ${score}% voltooid. Checklist is gereset.`);
}


function saveToday() {
  console.log("Klik op dag opslaan gedetecteerd");
  const key = "dailyState_" + getTodayKey();
  const checkboxes = document.querySelectorAll("#daily-container input[type='checkbox']");
  if (!checkboxes.length) {
    console.warn("Geen checkboxen gevonden in daily-container");
    return;
  }
  const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
  const score = Math.round((checked / dailyHabits.length) * 100);
  console.log("Aantal vinkjes:", checked, "/", dailyHabits.length, "Score:", score);

  const scores = JSON.parse(localStorage.getItem("dailyScores")) || [];
  scores.unshift({ date: getTodayKey(), score });
  localStorage.setItem("dailyScores", JSON.stringify(scores.slice(0, 14)));

  localStorage.removeItem(key);
  createCheckboxList(dailyHabits, "daily-container", "daily");

  alert(`Dag opgeslagen: ${score}% voltooid. Checklist is gereset.`);
}