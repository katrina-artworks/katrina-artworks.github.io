// Moble Menu Functionality
const btnOpenMenu = document.getElementById("btnOpenMenu");
const mobileMenu = document.getElementById("mobileMenu");
const hamburgerIcon = document.getElementById("hamburgerIcon");
const closeIcon = document.getElementById("closeIcon");

// Open mobile menu when hamburger icon is clicked
btnOpenMenu.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");
    if (mobileMenu.classList.contains("open")) {
        hamburgerIcon.style.display = "none";
        closeIcon.style.display = "block";
    } else {
        hamburgerIcon.style.display = "block";
        closeIcon.style.display = "none";
    }
});

// Close mobile menu when a link is clicked
document.querySelectorAll(".mobile-nav a").forEach((link) => {
    link.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
        hamburgerIcon.style.display = "block";
        closeIcon.style.display = "none";
    });
});

// Hide mobile menu overlay on resize if switching to desktop mode
window.addEventListener("resize", () => {
    if (window.innerWidth > 890 && mobileMenu.classList.contains("open")) {
        mobileMenu.classList.remove("open");
        hamburgerIcon.style.display = "block";
        closeIcon.style.display = "none";
    }
});
