// Dynamically load the latest blog posts component
fetch("components/latest-blog-posts.html")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.text();
  })
  .then((html) => {
    document.getElementById("latest-blog-posts").innerHTML = html;
    console.log("Carousel content loaded");

    // Wait until the content is fully loaded, then initialize the carousel
    initCarousel();
  })
  .catch((error) => console.error("Failed to load carousel:", error));

  function initCarousel() {
    const carousel = document.querySelector(".carousel");
    const leftButton = document.querySelector(".carousel-btn.left");
    const rightButton = document.querySelector(".carousel-btn.right");
    const dotsContainer = document.querySelector(".carousel-dots");
  
    if (!carousel || !leftButton || !rightButton || !dotsContainer) {
      console.error("Carousel or buttons/dots not found in the DOM");
      return;
    }
  
    let currentIndex = 0;
    const itemsPerView = 3; // Number of items visible at once
    const totalItems = carousel.children.length;
    const maxIndex = totalItems - itemsPerView; // The maximum starting index
    const totalDots = 4; // Always 4 dots
  
    // Create exactly 4 dots
    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement("div");
      dot.classList.add("carousel-dot");
      if (i === 0) dot.classList.add("active"); // Highlight the first dot initially
      dotsContainer.appendChild(dot);
  
      // Add click event to navigate to the corresponding section of the carousel
      dot.addEventListener("click", () => {
        // Calculate the currentIndex for the dot clicked
        currentIndex = Math.min(i, maxIndex); // Prevent going out of bounds
        updateCarousel();
      });
    }
  
    const updateCarousel = () => {
      const offset = currentIndex * -100 / itemsPerView; // Calculate the offset
      carousel.style.transform = `translateX(${offset}%)`;
  
      // Update the active state of dots
      document.querySelectorAll(".carousel-dot").forEach((dot, index) => {
        dot.classList.toggle("active", index === currentIndex);
      });
    };
  
    // Right button event
    rightButton.addEventListener("click", () => {
      if (currentIndex < maxIndex) {
        currentIndex++;
        updateCarousel();
      }
    });
  
    // Left button event
    leftButton.addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    });
  
    console.log("Carousel initialized successfully");
  }
  
  // Dynamically load the latest blog posts component
  fetch("components/latest-blog-posts.html")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.text();
    })
    .then((html) => {
      document.getElementById("latest-blog-posts").innerHTML = html;
      console.log("Carousel content loaded");
  
      // Initialize the carousel after content is loaded
      initCarousel();
    })
    .catch((error) => console.error("Failed to load carousel:", error));
  