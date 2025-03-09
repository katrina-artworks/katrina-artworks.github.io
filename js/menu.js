const btnOpenMenu = document.querySelector('#btnOpenMenu');
const mobileMenu = document.querySelector('#mobileMenu');
const contentContainer = document.querySelector('#content-container');

// Open mobile menu when hamburger icon is clicked
btnOpenMenu.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    btnOpenMenu.classList.toggle('open');
});

// Close mobile menu when a link is clicked using event delegation
document.querySelector('.mobile-nav ul').addEventListener('click', (event) => {
    if (event.target.tagName === 'A') {
        mobileMenu.classList.remove('open');
        btnOpenMenu.classList.remove('open');
    }
});

// Update menu button on window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 890 && mobileMenu.classList.contains('open')) {
        // Dismiss mobile menu and reset menu button when window is resized to desktop
        mobileMenu.classList.remove('open');
        btnOpenMenu.classList.remove('open');
    }
});

// Function to get the page from the URL hash
function getPageFromHash() {
    const hash = window.location.hash.substring(1);
    return hash || 'about'; // Default to 'about' if no hash
}

// Function to load content based on the page
function loadContent(page) {
    // Show loading spinner instead of text
    contentContainer.innerHTML = '<div id="loadingIndicator" class="spinner"></div>';
    fetch(`./pages/${page}.html`)
        .then((response) => {
            if (!response.ok) throw new Error('Page not found');
            return response.text();
        })
        .then((data) => {
            contentContainer.innerHTML = data;
            if (page === 'contact') {
                reinitializeValidation();
            } else if (page === 'about') {
                reinitializeOnScrollLogic();
            }
            setActiveLink(page);
        })
        .catch((error) => {
            console.error('Error loading content:', error);
            contentContainer.innerHTML = '<p>Error loading content.</p>';
        });
}

// Function to set the active link in the menu
function setActiveLink(page) {
    document.querySelectorAll('[data-page]').forEach((link) => {
        link.classList.toggle('active', link.getAttribute('data-page') === page);
    });
}

// Function to reinitialize validation script for the contact page.
// Without it the form validation won't work after loading the contact page (HTTP Error 405).
function reinitializeValidation() {
    const script = document.createElement('script');
    script.src = 'js/validation.js';
    document.body.appendChild(script);
}

function reinitializeOnScrollLogic() {
    const script = document.createElement('script');
    script.src = 'js/scroll.js';
    document.body.appendChild(script);
}

// Load content when the hash changes
window.addEventListener('hashchange', () => {
    const page = getPageFromHash();
    loadContent(page);
});

// Load initial content based on the current hash or default to 'about'
const initialPage = getPageFromHash();
loadContent(initialPage);

// Hide spinner on window load event, if still present
window.addEventListener('load', () => {
    const spinner = document.getElementById('loadingIndicator');
    if (spinner) spinner.style.display = 'none';
});