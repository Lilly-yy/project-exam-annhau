let timeout;

document.addEventListener("scroll", () => {
    clearTimeout(timeout);
    timeout = setTimeout(updateParallax, 10); // Forsinker oppdatering litt
});

function updateParallax() {
    const parallaxImage = document.querySelector(".parallax-image");
    const parallaxContainer = document.querySelector(".parallax-container");

    if (!parallaxImage || !parallaxContainer) return; // Sjekk at elementene finnes

    const scrollPosition = window.scrollY;
    const containerOffsetTop = parallaxContainer.offsetTop;
    const containerHeight = parallaxContainer.offsetHeight;

    if (
        scrollPosition > containerOffsetTop - window.innerHeight &&
        scrollPosition < containerOffsetTop + containerHeight
    ) {
        const parallaxSpeed = 0.3;
        const offset = (scrollPosition - containerOffsetTop) * parallaxSpeed;
        parallaxImage.style.transform = `translateY(${offset}px)`;
    }
}
