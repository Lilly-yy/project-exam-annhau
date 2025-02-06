// Dynamically load reusable components
document.addEventListener("DOMContentLoaded", () => {
  const headerLoaded = fetch("components/header.html")
      .then((response) => response.text())
      .then((data) => {
          document.getElementById("header").innerHTML = data;
      });

  const footerLoaded = fetch("components/footer.html")
      .then((response) => response.text())
      .then((data) => {
          document.getElementById("footer").innerHTML = data;
      });

  // Når både header og footer er lastet, markerer vi aktive lenker
  Promise.all([headerLoaded, footerLoaded]).then(() => {
      markActiveLinks();
  });
});

// Funksjon for å markere aktive lenker
function markActiveLinks() {
  const currentPath = window.location.pathname.replace(/^\//, ""); // Fjern ledende "/"
  const navLinks = document.querySelectorAll(".nav-links a, .footer-nav a");

  navLinks.forEach(link => {
      if (link.getAttribute("href") === currentPath) {
          link.classList.add("active"); // Legg til aktiv klasse på matchende lenke
      } else {
          link.classList.remove("active"); // Fjern aktiv klasse fra andre lenker
      }
  });

}
