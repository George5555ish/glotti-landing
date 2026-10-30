import { CHECKOUT, PRIVACY_URL } from "./config.js";

const privacy = document.querySelector("#privacy");
if (privacy) privacy.href = PRIVACY_URL;

const revealItems = document.querySelectorAll(".reveal, .reasons article, .price-grid article, .float");
const motion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.documentElement.classList.add("js-motion");
if (motion) {
  revealItems.forEach((item) => item.classList.add("is-in"));
} else {
  const watcher = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-in");
        watcher.unobserve(entry.target);
      }
    },
    { threshold: 0.18 },
  );
  revealItems.forEach((item, index) => {
    item.style.setProperty("--delay", `${(index % 5) * 70}ms`);
    watcher.observe(item);
  });
}

const languageNames = ["Spanish", "French", "German", "Portuguese", "Japanese", "Korean", "Chinese"];
const languageCodes = ["ES", "FR", "DE", "PT", "JA", "KO", "ZH"];

function rollLanguage(slot, text) {
  const current = slot.querySelector("b");
  if (!current || current.textContent === text) return;
  const next = document.createElement("b");
  next.className = "next";
  next.setAttribute("aria-hidden", "true");
  next.textContent = text;
  slot.appendChild(next);
  requestAnimationFrame(() => slot.classList.add("swap"));
  window.setTimeout(() => {
    current.remove();
    next.className = "";
    slot.classList.remove("swap");
  }, 460);
}

for (const slot of document.querySelectorAll(".lang-cycle")) {
  const word = document.createElement("b");
  word.textContent = slot.textContent.trim();
  slot.textContent = "";
  slot.appendChild(word);
}

if (!motion) {
  let languageIndex = 0;
  window.setInterval(() => {
    if (document.hidden) return;
    languageIndex = (languageIndex + 1) % languageNames.length;
    for (const slot of document.querySelectorAll(".lang-cycle")) {
      const text = slot.dataset.lang === "code" ? languageCodes[languageIndex] : languageNames[languageIndex];
      rollLanguage(slot, text);
    }
  }, 2600);
}

for (const link of document.querySelectorAll("[data-plan]")) {
  const url = CHECKOUT[link.dataset.plan] || "";
  if (!url) {
    link.addEventListener("click", (event) => event.preventDefault());
    continue;
  }
  link.href = url;
  link.target = "_blank";
  link.rel = "noreferrer";
}
