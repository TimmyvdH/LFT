const dailyHabits = [
  "6 uur gefocust gewerkt",
  "30+ min buiten geweest",
  "10+ min gelezen",
  "Iets opgeruimd",
  "Max 1,5 uur tv gekeken",
  "Niet gesnoozed"
];

function getTodayKey() {
  const now = new Date();
  now.setHours(now.getHours() + 1);
  return now.toISOString().split("T")[0];
}

function saveState(key, state) {
  localStorage.setItem(key, JSON.stringify(state));
}

function loadState(key, defaultState) {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultState;
}

function createCheckboxList(habits, containerId) {
  const key = "dailyState_" + getTodayKey();
  let checkboxStates = loadState(key, new Array(habits.length).fill(false));
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
      saveState(key, checkboxStates);
      updateProgress(containerId);
    };
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(habit));
    container.appendChild(label);
  });
  updateProgress(containerId);
}

function updateProgress(containerId) {
  const container = document.getElementById(containerId);
  const checkboxes = container.querySelectorAll("input[type='checkbox']");
  const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
  const progress = Math.round((checked / checkboxes.length) * 100);
  document.getElementById("daily-progress").innerText = `${progress}% voltooid`;
}

function getDayAdvice(score) {
  if (score >= 90) {
    return "Topdag. Je laat zien dat je grip hebt op je gewoontes.";
  } else if (score >= 70) {
    return "Redelijke dag, maar je laat kansen liggen. Waar bleef je focus?";
  } else {
    return "Je laat het vandaag liggen. Tijd om jezelf serieus te nemen.";
  }
}

function saveToday() {
  const key = "dailyState_" + getTodayKey();
  const checkboxes = document.querySelectorAll("#daily-container input[type='checkbox']");
  if (!checkboxes.length) {
    console.warn("Geen checkboxen gevonden in daily-container");
    return;
  }
  const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
  const score = Math.round((checked / dailyHabits.length) * 100);

  const scores = JSON.parse(localStorage.getItem("dailyScores")) || [];
  scores.unshift({ date: getTodayKey(), score });
  localStorage.setItem("dailyScores", JSON.stringify(scores.slice(0, 14)));

  localStorage.removeItem(key);
  createCheckboxList(dailyHabits, "daily-container");

  const advice = getDayAdvice(score);
  alert(`Dag opgeslagen: ${score}% voltooid.\n${advice}`);
}

document.addEventListener("DOMContentLoaded", () => {
  createCheckboxList(dailyHabits, "daily-container");
  const saveBtn = document.getElementById("save-day-btn");
  if (saveBtn) saveBtn.addEventListener("click", saveToday);
});