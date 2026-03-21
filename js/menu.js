const btnOpenMenu = document.querySelector('#btnOpenMenu');
const mobileMenu = document.querySelector('#mobileMenu');
const contentContainer = document.querySelector('#content-container');
const header = document.querySelector('header');

function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    btnOpenMenu.classList.remove('open');
    document.body.classList.remove('no-scroll');
}

window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 0);
}, { passive: true });

// Open mobile menu when hamburger icon is clicked
btnOpenMenu.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    btnOpenMenu.classList.toggle('open');
    document.body.classList.toggle('no-scroll'); // Disable/enable scrolling
});

// Close mobile menu when a link is clicked using event delegation
document.querySelector('.mobile-nav ul').addEventListener('click', (event) => {
    if (event.target.tagName === 'A') {
        closeMobileMenu();
    }
});

// Close mobile menu when tapping the empty overlay area
mobileMenu.addEventListener('click', (event) => {
    if (event.target === mobileMenu) {
        closeMobileMenu();
    }
});

// Update menu button on window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 890 && mobileMenu.classList.contains('open')) {
        // Dismiss mobile menu and reset menu button when window is resized to desktop
        closeMobileMenu();
    }
});

// Function to get the page from the URL hash
function getPageFromHash() {
    const hash = window.location.hash.substring(1);
    return hash || 'home';
}

async function includePartials(root) {
    const placeholders = Array.from(root.querySelectorAll('[data-include]'));

    for (const placeholder of placeholders) {
        const path = placeholder.getAttribute('data-include');
        if (!path) continue;

        const response = await fetch(path);
        if (!response.ok) throw new Error(`Partial not found: ${path}`);

        const template = document.createElement('template');
        template.innerHTML = await response.text();

        await includePartials(template.content);
        placeholder.replaceWith(template.content);
    }
}

// Function to load content based on the page
async function loadContent(page) {
    document.body.style.overflow = '';
    // Show loading spinner instead of text
    contentContainer.innerHTML = '<div id="loadingIndicator" class="spinner"></div>';
    try {
        const response = await fetch(`./pages/${page}.html`);
        if (!response.ok) throw new Error('Page not found');

        contentContainer.innerHTML = await response.text();
        await includePartials(contentContainer);

        // Reset scroll position
        window.scrollTo(0, 0);
        // Reinitialize scripts based on the loaded page
        if (page === 'contact') {
            reinitializeValidation();
        } else if (page === 'home' || page === 'work') {
            reinitializeGridLogic();
        }
        setActiveLink(page);
    } catch (error) {
        console.error('Error loading content:', error);
        contentContainer.innerHTML = '<p>Error loading content.</p>';
    }
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
    const old = document.querySelector('script[src="js/validation.js"]');
    if (old) old.remove();
    const script = document.createElement('script');
    script.src = 'js/validation.js';
    document.body.appendChild(script);
}

function reinitializeGridLogic() {
    const old = document.querySelector('script[src="js/grid.js"]');
    if (old) old.remove();
    const script = document.createElement('script');
    script.src = 'js/grid.js';
    document.body.appendChild(script);
}

// Load content when the hash changes
window.addEventListener('hashchange', () => {
    const page = getPageFromHash();
    loadContent(page);
});

// Load initial content based on the current hash or default to 'home'
const initialPage = getPageFromHash();
loadContent(initialPage);

// Hide spinner on window load event, if still present
window.addEventListener('load', () => {
    const spinner = document.getElementById('loadingIndicator');
    if (spinner) spinner.style.display = 'none';
});
