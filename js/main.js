// Dynamically load reusable components
document.addEventListener("DOMContentLoaded", () => {
    // Load the header
    fetch("components/header.html")
      .then((response) => response.text())
      .then((data) => {
        document.getElementById("header").innerHTML = data;
      });
  
    // Load the footer
    fetch("components/footer.html")
      .then((response) => response.text())
      .then((data) => {
        document.getElementById("footer").innerHTML = data;
      });
  
     
  });

  document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-links a');
    
    const currentPath = window.location.pathname;
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
});

  