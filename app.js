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

function getTodayKey() {
  const now = new Date();
  now.setHours(now.getHours() + 1);
  return now.toISOString().split("T")[0];
}

function isSunday() {
  const now = new Date();
  now.setHours(now.getHours() + 1);
  return now.getDay() === 0;
}

function saveState(key, state) {
  localStorage.setItem(key, JSON.stringify(state));
}

function loadState(key, defaultState) {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultState;
}

function createCheckboxList(habits, containerId, type) {
  const stateKey = type === "daily" ? "dailyState_" + getTodayKey() : "weeklyState";
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
  const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
  const score = Math.round((checked / dailyHabits.length) * 100);

  const scores = JSON.parse(localStorage.getItem("dailyScores")) || [];
  scores.unshift({ date: getTodayKey(), score });
  localStorage.setItem("dailyScores", JSON.stringify(scores.slice(0, 14)));

  localStorage.removeItem(key);
  createCheckboxList(dailyHabits, "daily-container", "daily");

  const advice = getDayAdvice(score);
  alert(`Dag opgeslagen: ${score}% voltooid.\n${advice}`);
}

function resetAll() {
  if (!isSunday()) {
    alert("Je kunt wekelijkse doelen alleen op zondag resetten.");
    return;
  }

  const dailyKey = "dailyState_" + getTodayKey();
  const weeklyKey = "weeklyState";

  const dailyChecks = document.getElementById("daily-container").querySelectorAll("input[type='checkbox']");
  const weeklyChecks = document.getElementById("weekly-container").querySelectorAll("input[type='checkbox']");
  const dailyScore = Math.round((Array.from(dailyChecks).filter(cb => cb.checked).length / dailyChecks.length) * 100);
  const weeklyScore = Math.round((Array.from(weeklyChecks).filter(cb => cb.checked).length / weeklyChecks.length) * 100);

  const advice = weeklyScore < 70 || dailyScore < 70
    ? "Je inzet deze week was ondermaats. Stop met smoesjes en start met doen."
    : weeklyScore >= 90 && dailyScore >= 90
    ? "Topweek. Je zit op koers. Hou deze lijn vast!"
    : "Redelijk, maar je weet dat je beter kunt. Tijd voor meer structuur.";

  const notes = document.getElementById("notes").value;
  const date = getTodayKey();

  const currentStats = JSON.parse(localStorage.getItem("weeklyStats")) || [];
  const newStats = [{ date, dailyScore, weeklyScore, advice, notes }, ...currentStats.slice(0, 4)];
  localStorage.setItem("weeklyStats", JSON.stringify(newStats));

  localStorage.removeItem(dailyKey);
  localStorage.removeItem(weeklyKey);
  document.getElementById("notes").value = "";
  document.getElementById("new-advice").innerText = advice;

  createCheckboxList(dailyHabits, "daily-container", "daily");
  createCheckboxList(weeklyHabits, "weekly-container", "weekly");
}

document.addEventListener("DOMContentLoaded", () => {
  createCheckboxList(dailyHabits, "daily-container", "daily");
  createCheckboxList(weeklyHabits, "weekly-container", "weekly");
  const saveBtn = document.getElementById("save-day-btn");
  if (saveBtn) saveBtn.addEventListener("click", saveToday);
});