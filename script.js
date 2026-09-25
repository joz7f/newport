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

const lenis = new Lenis({
  duration: 1,
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 1,
  lerp: 0.3,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

