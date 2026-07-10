const familyColors = {
  sophia: "person-sophia",
  grayson: "person-grayson",
  gray: "person-grayson",
  bailey: "person-bailey",
  cardin: "person-cardin",
  general: "person-general"
};

// SAMPLE EVENTS ONLY.
// Later, we will replace this list with your live Outlook calendar.
const sampleEvents = buildSampleEvents();

function buildSampleEvents() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();

  const at = (dayOffset, hour, minute, title, durationHours = 1) => {
    const start = new Date(y, m, d + dayOffset, hour, minute);
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
    return { title, start, end };
  };

  return [
    at(0, 16, 30, "Sophia Practice", 2),
    at(0, 17, 0, "Bailey Work", 4.5),
    at(0, 18, 0, "Cardin Practice", 2),
    at(1, 10, 0, "Grayson Karate", 1),
    at(1, 13, 0, "Take Meds", 0.25),
    at(2, 9, 0, "Family Appointment", 1),
    at(2, 16, 30, "Sophia Practice", 2),
    at(3, 17, 30, "Cardin Practice", 2),
    at(4, 15, 0, "Bailey Hair", 1.5),
    at(5, 8, 0, "Sophia VB Camp", 5),
    at(6, 12, 0, "Family Lunch", 1.5),
    at(7, 17, 0, "Bailey Work", 4.5),
    at(8, 16, 30, "Sophia Practice", 2),
    at(9, 18, 0, "Cardin Practice", 2)
  ];
}

function personFromTitle(title) {
  const firstWord = title.trim().split(/\s+/)[0].toLowerCase();
  return familyColors[firstWord] ? firstWord : "general";
}

function displayTitle(title) {
  const parts = title.trim().split(/\s+/);
  const first = parts[0].toLowerCase();
  if (familyColors[first]) return parts.slice(1).join(" ") || title;
  return title;
}

function personLabel(title) {
  const first = title.trim().split(/\s+/)[0];
  return familyColors[first.toLowerCase()] ? first : "Family";
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}

function startOfWeek(date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() - result.getDay());
  return result;
}

function formatTime(date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: date.getMinutes() ? "2-digit" : undefined
  }).format(date);
}

function renderMonth() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  document.getElementById("month-title").textContent =
    new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(today);

  const grid = document.getElementById("month-grid");
  grid.innerHTML = "";

  ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(day => {
    const el = document.createElement("div");
    el.className = "weekday";
    el.textContent = day;
    grid.appendChild(el);
  });

  const first = new Date(year, month, 1);
  const gridStart = new Date(year, month, 1 - first.getDay());

  for (let i = 0; i < 42; i++) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);

    const cell = document.createElement("div");
    cell.className = "day-cell";
    if (date.getMonth() !== month) cell.classList.add("outside");
    if (sameDay(date, today)) cell.classList.add("is-today");

    const number = document.createElement("div");
    number.className = "day-number";
    number.textContent = date.getDate();
    cell.appendChild(number);

    const events = sampleEvents
      .filter(event => sameDay(event.start, date))
      .sort((a, b) => a.start - b.start);

    events.slice(0, 3).forEach(event => {
      const item = document.createElement("div");
      item.className = `month-event ${familyColors[personFromTitle(event.title)]}`;
      item.textContent = `${event.title} ${formatTime(event.start)}`;
      cell.appendChild(item);
    });

    if (events.length > 3) {
      const more = document.createElement("div");
      more.className = "more";
      more.textContent = `+ ${events.length - 3}`;
      cell.appendChild(more);
    }

    grid.appendChild(cell);
  }
}

function renderWeek() {
  const today = new Date();
  const weekStart = startOfWeek(today);
  const grid = document.getElementById("week-grid");
  grid.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);

    const day = document.createElement("article");
    day.className = "week-day";
    if (sameDay(date, today)) day.classList.add("is-today");

    const header = document.createElement("header");
    header.className = "week-day-header";
    header.innerHTML = `
      <div class="week-day-name">${new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date)}</div>
      <div class="week-day-number">${date.getDate()}</div>
    `;
    day.appendChild(header);

    const eventList = document.createElement("div");
    eventList.className = "week-events";

    const events = sampleEvents
      .filter(event => sameDay(event.start, date))
      .sort((a, b) => a.start - b.start);

    events.slice(0, 6).forEach(event => {
      const item = document.createElement("div");
      item.className = `week-event ${familyColors[personFromTitle(event.title)]}`;
      item.innerHTML = `
        <div class="event-time">${formatTime(event.start)}</div>
        <div class="event-title">${event.title}</div>
      `;
      eventList.appendChild(item);
    });

    day.appendChild(eventList);
    grid.appendChild(day);
  }
}

function renderToday() {
  const today = new Date();
  document.getElementById("today-title").textContent =
    new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(today);

  document.getElementById("today-date").innerHTML =
    `${new Intl.DateTimeFormat("en-US", { month: "short" }).format(today)}<br>${today.getDate()}`;

  const container = document.getElementById("today-events");
  container.innerHTML = "";

  const events = sampleEvents
    .filter(event => sameDay(event.start, today))
    .sort((a, b) => a.start - b.start)
    .slice(0, 6);

  if (!events.length) {
    container.innerHTML = `<div class="empty">Nothing scheduled today</div>`;
    return;
  }

  events.forEach(event => {
    const item = document.createElement("div");
    item.className = `today-event ${familyColors[personFromTitle(event.title)]}`;
    item.innerHTML = `
      <div class="today-time">${formatTime(event.start)}</div>
      <div>
        <div class="today-name">${personLabel(event.title)}</div>
        <div class="today-description">${displayTitle(event.title)}</div>
      </div>
    `;
    container.appendChild(item);
  });
}

function updateClock() {
  const now = new Date();
  const text = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(now);

  document.querySelectorAll(".clock").forEach(el => el.textContent = text);
}

const slides = [...document.querySelectorAll(".slide")];
const dots = [...document.querySelectorAll(".dot")];
let currentSlide = 0;
let rotationTimer;

function showSlide(index) {
  currentSlide = index;
  slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
  dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
}

function startRotation() {
  clearInterval(rotationTimer);
  rotationTimer = setInterval(() => {
    showSlide((currentSlide + 1) % slides.length);
  }, 20000);
}

dots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    showSlide(index);
    startRotation();
  });
});

renderMonth();
renderWeek();
renderToday();
updateClock();
setInterval(updateClock, 30000);
startRotation();
