const blogContainer = document.getElementById("latest-blog-posts");
let posts = [];
let itemsPerView = 3; 
let touchStartX = 0;
let touchEndX = 0;

// Sjekk om vi er på mobilskjerm
const mediaQuery = window.matchMedia("(max-width: 768px)");
function updateItemsPerView() {
    itemsPerView = mediaQuery.matches ? 1 : 3; 
}
mediaQuery.addEventListener("change", updateItemsPerView);
updateItemsPerView();

async function fetchBlogPosts() {
    try {
        const response = await fetch('https://annhau.no/blog/wp-json/wp/v2/posts?per_page=6&_embed');
        posts = await response.json();

        renderCarousel();
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        blogContainer.innerHTML = `<p>Failed to load blog posts. Please try again later.</p>`;
    }
}

function renderCarousel() {
    const carouselHTML = `
        <h2 class="carousel-heading">Latest blog posts</h2>
        <div class="carousel-container">
            <button class="carousel-btn left" aria-label="Previous">&#10094;</button>
            <div class="carousel">
                ${posts.map(post => {
                    const image = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';
                    return `
                        <div class="carousel-item">
                            <a href="blog-post.html?id=${post.id}" class="carousel-link">
                                ${image ? `<img src="${image}" alt="${post.title.rendered}" class="carousel-image">` : ''}
                                <h3 class="carousel-title">${post.title.rendered}</h3>
                            </a>
                        </div>
                    `;
                }).join('')}
            </div>
            <button class="carousel-btn right" aria-label="Next">&#10095;</button>
        </div>
        <div class="carousel-dots"></div>
        <div class="view-all-link">
            <a href="blog-overview.html">View all blog posts</a>
        </div>
    `;

    blogContainer.innerHTML = carouselHTML;
    initCarousel();
}

function initCarousel() {
    const carousel = document.querySelector(".carousel");
    const leftButton = document.querySelector(".carousel-btn.left");
    const rightButton = document.querySelector(".carousel-btn.right");
    const dotsContainer = document.querySelector(".carousel-dots");

    let currentIndex = 0;
    const totalItems = posts.length;

    // Dynamisk antall dots
    const totalDots = Math.ceil(totalItems / itemsPerView);

    // Lag dots
    dotsContainer.innerHTML = "";
    for (let i = 0; i < totalDots; i++) {
        const dot = document.createElement("div");
        dot.classList.add("carousel-dot");
        if (i === 0) dot.classList.add("active");
        dotsContainer.appendChild(dot);

        dot.addEventListener("click", () => {
            currentIndex = i * itemsPerView;
            updateCarousel();
        });
    }

    const updateCarousel = () => {
        const offset = (currentIndex * -100) / itemsPerView;
        carousel.style.transform = `translateX(${offset}%)`;

        // Oppdater dots
        dotsContainer.querySelectorAll(".carousel-dot").forEach((dot, index) => {
            dot.classList.toggle("active", index === Math.floor(currentIndex / itemsPerView));
        });
    };

    // Knapp-logikk
    rightButton.addEventListener("click", () => {
        if (currentIndex < totalItems - itemsPerView) {
            currentIndex++;
            updateCarousel();
        }
    });

    leftButton.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    // Swipe-logikk
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener("touchstart", (e) => {
        touchStartX = e.touches[0].clientX;
    });

    carousel.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
    });

    const handleSwipe = () => {
        const swipeDistance = touchStartX - touchEndX;

        if (swipeDistance > 50 && currentIndex < totalItems - itemsPerView) {
            // Swipe left
            currentIndex++;
        } else if (swipeDistance < -50 && currentIndex > 0) {
            // Swipe right
            currentIndex--;
        }
        updateCarousel();
    };

    // Initial oppdatering
    updateCarousel();
}

// Start henting av bloggposter
fetchBlogPosts();