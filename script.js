async function loadComponents() {
  const rootPrefix = document.body.dataset.rootPrefix || "";
  const includes = [...document.querySelectorAll("[data-include]")];

  await Promise.all(includes.map(async (element) => {
    const file = element.dataset.include.replaceAll("{{root}}", rootPrefix);
    try {
      const response = await fetch(file);
      if (!response.ok) throw new Error(`Failed to load ${file}: ${response.status}`);
      element.innerHTML = (await response.text()).replaceAll("{{root}}", rootPrefix);

      if (element.dataset.currentProject) {
        const card = element.querySelector(`[href*="${element.dataset.currentProject}"]`);
        if (card) {
          const disabledCard = document.createElement("div");
          disabledCard.className = `${card.className} project-card--current`;
          disabledCard.setAttribute("aria-disabled", "true");
          disabledCard.setAttribute("aria-label", "NewAgeSysIT Home Page, current project");
          disabledCard.innerHTML = card.innerHTML;
          const status = document.createElement("span");
          status.className = "project-current-label";
          status.textContent = "Currently viewing";
          disabledCard.insertBefore(status, disabledCard.querySelector(".project-info"));
          card.replaceWith(disabledCard);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }));

  initializeSite();

  // Sections included asynchronously may not exist when the browser first
  // follows a URL hash (for example, home.html#projects from another page).
  if (window.location.hash) {
    const targetId = decodeURIComponent(window.location.hash.slice(1));
    const target = document.getElementById(targetId);
    if (target) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => target.scrollIntoView());
      });
    }
  }
}

function initializeSite() {
  document.querySelectorAll(".project-card").forEach((card) => {
    const cursor = card.querySelector(".project-view-cursor");
    if (!cursor || card.classList.contains("project-card--current")) return;

    let mouseX = 0, mouseY = 0, currentX = 0, currentY = 0;
    let velocityX = 0, velocityY = 0, animationFrame;
    const stiffness = 0.12, damping = 0.20;

    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      mouseX = event.clientX - rect.left;
      mouseY = event.clientY - rect.top;
      if (!animationFrame) animationFrame = requestAnimationFrame(animateCursor);
    });

    function animateCursor() {
      velocityX = (velocityX + (mouseX - currentX) * stiffness) * damping;
      velocityY = (velocityY + (mouseY - currentY) * stiffness) * damping;
      currentX += velocityX;
      currentY += velocityY;
      cursor.style.left = `${currentX}px`;
      cursor.style.top = `${currentY}px`;
      const distance = Math.abs(mouseX - currentX) + Math.abs(mouseY - currentY);
      if (distance > 0.1 || Math.abs(velocityX) + Math.abs(velocityY) > 0.1) {
        animationFrame = requestAnimationFrame(animateCursor);
      } else animationFrame = null;
    }
  });

  const lenis = window.Lenis ? new Lenis({
    duration: 1, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1, lerp: 0.3,
  }) : null;
  if (lenis) {
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  document.querySelectorAll('.navbar a[href$="#contact"]').forEach((link) => {
    const target = new URL(link.href);
    const normalizePath = (path) => path.endsWith("/") ? `${path}index.html` : path;
    if (normalizePath(target.pathname) !== normalizePath(window.location.pathname)) return;
    link.addEventListener("click", (event) => {
      const section = document.querySelector("#contact");
      if (!section) return;
      event.preventDefault();
      window.history.pushState(null, "", target.hash);
      if (lenis) lenis.scrollTo(section, { offset: -120 });
      else window.scrollTo({ top: window.scrollY + section.getBoundingClientRect().top - 120, behavior: "smooth" });
    });
  });

  const sectionLinks = [...document.querySelectorAll('.navbar a[href*="#"]')]
    .filter((link) => {
      const path = new URL(link.href).pathname;
      const normalizePath = (value) => value.endsWith("/") ? `${value}index.html` : value;
      return normalizePath(path) === normalizePath(window.location.pathname);
    });
  const normalizeNavPath = (path) => {
    const normalized = decodeURIComponent(path).replace(/\/+$/, "");
    return normalized || "/";
  };
  document.querySelectorAll(".navbar a.nav-link:not(.nav-home)").forEach((link) => {
    const target = new URL(link.href);
    if (target.hash) return;
    const isCurrentPage = normalizeNavPath(target.pathname) === normalizeNavPath(window.location.pathname);
    link.classList.toggle("active", isCurrentPage);
    if (isCurrentPage) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  const navSections = sectionLinks.map((link) => document.querySelector(new URL(link.href).hash)).filter(Boolean);
  let activeSectionIndex = 0;

  function updateActiveNav() {
    if (!navSections.length) return;
    const readingLine = window.innerHeight * 0.35;
    const hysteresis = 24;
    while (activeSectionIndex < navSections.length - 1 && navSections[activeSectionIndex + 1].getBoundingClientRect().top < readingLine - hysteresis) activeSectionIndex++;
    while (activeSectionIndex > 0 && navSections[activeSectionIndex].getBoundingClientRect().top > readingLine + hysteresis) activeSectionIndex--;
    const currentSection = navSections[activeSectionIndex];
    sectionLinks.forEach((link) => {
      const isCurrent = new URL(link.href).hash === `#${currentSection.id}`;
      link.classList.toggle("active", isCurrent);
      if (isCurrent) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }
  window.addEventListener("scroll", updateActiveNav, { passive: true });
  window.addEventListener("resize", updateActiveNav);
  updateActiveNav();

  function updateTopFade() { document.body.classList.toggle("scrolled", window.scrollY > 5); }
  window.addEventListener("scroll", updateTopFade, { passive: true });
  updateTopFade();

  const scrollToTopBtn = document.getElementById("scrollToTop");
  if (scrollToTopBtn) {
    window.addEventListener("scroll", () => scrollToTopBtn.classList.toggle("show", window.scrollY > 300));
    scrollToTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }
}

document.addEventListener("DOMContentLoaded", loadComponents, { once: true });
