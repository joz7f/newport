document.querySelectorAll(".project-card").forEach((card) => {
  const cursor = card.querySelector(".project-view-cursor");
  if (!cursor) return;

  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;
  let velocityX = 0;
  let velocityY = 0;
  let animationFrame;

  const stiffness = 0.12;
  const damping = 0.20;

  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();

    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    if (!animationFrame) {
      animationFrame = requestAnimationFrame(animateCursor);
    }
  });

  function animateCursor() {
    const forceX = (mouseX - currentX) * stiffness;
    const forceY = (mouseY - currentY) * stiffness;

    velocityX = (velocityX + forceX) * damping;
    velocityY = (velocityY + forceY) * damping;

    currentX += velocityX;
    currentY += velocityY;

    cursor.style.left = `${currentX}px`;
    cursor.style.top = `${currentY}px`;

    const distance =
      Math.abs(mouseX - currentX) +
      Math.abs(mouseY - currentY);

    if (distance > 0.1 ||
        Math.abs(velocityX) + Math.abs(velocityY) > 0.1) {
      animationFrame = requestAnimationFrame(animateCursor);
    } else {
      animationFrame = null;
    }
  }
});

const lenis = window.Lenis ? new Lenis({
  duration: 1,
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 1,
  lerp: 0.3,
}) : null;

function raf(time) {
  if (lenis) lenis.raf(time);
  requestAnimationFrame(raf);
}

if (lenis) requestAnimationFrame(raf);

// Leave room for the fixed navbar when navigating to the contact section.
document.querySelectorAll('a[href="#contact"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const contactSection = document.querySelector("#contact");
    if (!contactSection) return;

    event.preventDefault();
    window.history.pushState(null, "", "#contact");
    if (lenis) {
      lenis.scrollTo(contactSection, { offset: -120 });
    } else {
      window.scrollTo({
        top: window.scrollY + contactSection.getBoundingClientRect().top - 120,
        behavior: "smooth",
      });
    }
  });
});

// Keep the current section reflected in the fixed navigation.
const sectionLinks = [...document.querySelectorAll('.navbar a[href^="#"]')];
const navSections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
let activeSectionIndex = 0;

function updateActiveNav() {
  if (!navSections.length) return;

  // Use a small hysteresis band so tiny scroll changes at a boundary do not
  // rapidly flip the active item between adjacent sections.
  const readingLine = window.innerHeight * 0.35;
  const hysteresis = 24;

  while (
    activeSectionIndex < navSections.length - 1 &&
    navSections[activeSectionIndex + 1].getBoundingClientRect().top < readingLine - hysteresis
  ) {
    activeSectionIndex += 1;
  }

  while (
    activeSectionIndex > 0 &&
    navSections[activeSectionIndex].getBoundingClientRect().top > readingLine + hysteresis
  ) {
    activeSectionIndex -= 1;
  }

  const currentSection = navSections[activeSectionIndex];

  sectionLinks.forEach((link) => {
    const isCurrent = link.hash === `#${currentSection.id}`;
    link.classList.toggle("active", isCurrent);
    if (isCurrent) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}

window.addEventListener("scroll", updateActiveNav, { passive: true });
window.addEventListener("resize", updateActiveNav);
updateActiveNav();

// Top fade visibility

function updateTopFade() {
  document.body.classList.toggle(
    "scrolled",
    window.scrollY > 5
  );
}

window.addEventListener("scroll", updateTopFade, {
  passive: true
});

updateTopFade();
