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

  Promise.all([headerLoaded, footerLoaded]).then(() => {
      markActiveLinks();
  });
});

function markActiveLinks() {
  const currentPath = window.location.pathname.replace(/^\//, ""); 
  const navLinks = document.querySelectorAll(".nav-links a, .footer-nav a");

  navLinks.forEach(link => {
      if (link.getAttribute("href") === currentPath) {
          link.classList.add("active"); 
      } else {
          link.classList.remove("active"); 
      }
  });

}
