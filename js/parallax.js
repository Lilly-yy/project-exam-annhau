document.addEventListener("scroll", () => {
    const parallaxImage = document.querySelector(".parallax-image");
    const parallaxContainer = document.querySelector(".parallax-container");
    const scrollPosition = window.scrollY;
    const containerOffsetTop = parallaxContainer.offsetTop;
    const containerHeight = parallaxContainer.offsetHeight;

    if (
        scrollPosition > containerOffsetTop - window.innerHeight &&
        scrollPosition < containerOffsetTop + containerHeight
    ) {
        const parallaxSpeed = 0.3; // Juster hastigheten
        const offset = (scrollPosition - containerOffsetTop) * parallaxSpeed;
        parallaxImage.style.transform = `translateY(${offset}px)`;
    }
});
