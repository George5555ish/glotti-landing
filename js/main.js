import { CHECKOUT, PRIVACY_URL } from "./config.js";
import { CYCLE_LANGS, detectSiteLang, isRtl, saveSiteLang, SITE_LANGS, t } from "./i18n.js";

const privacy = document.querySelector("#privacy");
if (privacy) privacy.href = PRIVACY_URL;

const nav = document.querySelector(".nav");
if (nav) {
  const markNav = () => nav.classList.toggle("is-stuck", window.scrollY > 12);
  markNav();
  window.addEventListener("scroll", markNav, { passive: true });
}

const revealItems = document.querySelectorAll(".reveal, .reasons article, .price-grid article, .float, .block > .chip, .block > h2, .block > .sub");
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

let currentLang = detectSiteLang();
let languageIndex = 0;
const siteLangSelect = document.querySelector("#site-lang");

for (const language of SITE_LANGS) {
  const option = document.createElement("option");
  option.value = language.code;
  option.textContent = language.native;
  siteLangSelect.appendChild(option);
}
siteLangSelect.value = currentLang;
siteLangSelect.addEventListener("change", () => {
  currentLang = saveSiteLang(siteLangSelect.value);
  applySiteLang(currentLang);
});

for (const slot of document.querySelectorAll(".lang-cycle")) {
  ensureCycleSlot(slot);
}

applySiteLang(currentLang);

if (!motion) {
  window.setInterval(() => {
    if (document.hidden) return;
    languageIndex = (languageIndex + 1) % CYCLE_LANGS.length;
    for (const slot of document.querySelectorAll(".lang-cycle")) {
      rollLanguage(slot, cycleText(slot));
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

function applySiteLang(lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = isRtl(lang) ? "rtl" : "ltr";
  document.title = t("meta_title", lang);
  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute("content", t("meta_description", lang));
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n, lang);
  });
  document.querySelectorAll("[data-i18n-html]").forEach((node) => {
    node.innerHTML = t(node.dataset.i18nHtml, lang);
  });
  document.querySelectorAll("[data-i18n-alt]").forEach((node) => {
    node.setAttribute("alt", t(node.dataset.i18nAlt, lang));
  });
  document.querySelectorAll("[data-lang-code]").forEach((node) => {
    node.textContent = t(`lang_${node.dataset.langCode}`, lang);
  });
  siteLangSelect.value = lang;
  siteLangSelect.setAttribute("aria-label", t("site_language", lang));
  for (const slot of document.querySelectorAll(".lang-cycle")) {
    const word = slot.querySelector("b") || ensureCycleSlot(slot);
    word.textContent = cycleText(slot);
  }
}

function cycleText(slot) {
  const code = CYCLE_LANGS[languageIndex];
  return slot.dataset.lang === "code" ? code.toUpperCase() : t(`lang_${code}`, currentLang);
}

function ensureCycleSlot(slot) {
  let word = slot.querySelector("b");
  if (word) return word;
  word = document.createElement("b");
  word.textContent = slot.textContent.trim();
  slot.textContent = "";
  slot.appendChild(word);
  return word;
}

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
