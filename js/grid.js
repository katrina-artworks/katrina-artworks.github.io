function initializeOnScrollLogic() {
    const cards = document.querySelectorAll('.services-section-card, .project-item, .about-career-row');

    // Define the scroll-check function
    function checkCards() {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const distanceFromTop = viewportHeight * 0.8; // 80% of the viewport height

        // Only run on mobile or tablet
        if (viewportWidth > 890) return;

        cards.forEach(card => {
            const topOfBox = card.getBoundingClientRect().top;
            if (topOfBox <= distanceFromTop) {
                card.classList.add('appear');
            } else {
                card.classList.remove('appear');
            }
        });
    }
    // Attach the scroll event listener

    if (window._gridScrollHandler) {
        window.removeEventListener("scroll", window._gridScrollHandler);
    }
    window._gridScrollHandler = checkCards;
    window.addEventListener("scroll", checkCards);
    // Immediately run the check in case cards are already in view
    checkCards();
}

function initializeResponsiveProjectImages() {
    const mobileImages = document.querySelectorAll('.project-img-mobile[data-mobile-src]');
    const isMobileViewport = window.innerWidth <= 890;

    mobileImages.forEach((image) => {
        const mobileSrc = image.dataset.mobileSrc;
        if (!mobileSrc) return;

        if (isMobileViewport) {
            if (image.getAttribute('src') !== mobileSrc) {
                image.src = mobileSrc;
                image.loading = 'lazy';
            }
            return;
        }

        image.removeAttribute('src');
        image.removeAttribute('loading');
    });
}

function initializeOnMouseEnterLogic() {
    const cards = document.querySelectorAll('.project-item');
    const hoverScale = getComputedStyle(document.documentElement)
        .getPropertyValue('--card-hover-scale')
        .trim() || '1.03';

    // Only run on desktop
    if (window.innerWidth <= 890) return;

    cards.forEach(card => {
        card.addEventListener("mouseenter", () => {
            // Set up a smooth transition for transform and background-position
            card.style.transition = "transform 0.3s ease-out, background-position 0.3s ease-out";
            // Scale up the card
            card.style.transform = `scale(${hoverScale})`;
            // Shift the background image up and left (from bottom right)
            card.style.backgroundPosition = "calc(100% - 5px) calc(100% - 5px)";

            // Modify the button as part of the card effect:
            const btn = card.querySelector('.btn-arrow');
            if (btn) {
                btn.style.gap = "10px";
            }
        });

        card.addEventListener("mouseleave", () => {
            // Revert the card styles
            card.style.transform = "scale(1)";
            card.style.backgroundPosition = "bottom right";

            // Revert the button spacing
            const btn = card.querySelector('.btn-arrow');
            if (btn) {
                btn.style.gap = "6px";
            }
        });
    });
}

function initializeProjectCardLinkLogic() {
    const cards = document.querySelectorAll('.project-item[data-project-href]');
    let projectsDataCache = null;

    async function getProjectsDataForCards() {
        if (projectsDataCache) return projectsDataCache;
        if (typeof window.getProjectsData !== 'function') return null;

        projectsDataCache = await window.getProjectsData();
        return projectsDataCache;
    }

    function openProjectTab(card) {
        // Safari may block delayed window.open() calls after async work,
        // so open the tab immediately inside the user gesture.
        const projectTab = window.open('', '_blank');

        if (projectTab) {
            projectTab.opener = null;
        }

        return projectTab;
    }

    async function navigateToProject(card, projectTab = null) {
        const targetHash = card.dataset.projectHref;
        if (!targetHash) {
            projectTab?.close();
            return;
        }

        const slug = targetHash.replace(/^#project\//, '');
        const data = await getProjectsDataForCards();
        const project = data?.projects?.find((entry) => entry.slug === slug);

        if (!project) {
            projectTab?.close();
            return;
        }

        if (projectTab) {
            const projectUrl = new URL(window.location.href);
            projectUrl.hash = targetHash;
            projectTab.location.replace(projectUrl.toString());
            return;
        }

        window.location.hash = targetHash;
    }

    function updateCardAccessibility() {
        cards.forEach(card => {
            card.tabIndex = 0;
            card.setAttribute('role', 'link');

            const heading = card.querySelector('h3');
            if (heading) {
                card.setAttribute('aria-label', `Open in new tab ${heading.textContent}`);
            }
        });
    }

    cards.forEach(card => {
        card.addEventListener('click', async () => {
            const projectTab = openProjectTab(card);
            await navigateToProject(card, projectTab);
        });

        card.addEventListener('keydown', async (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;

            event.preventDefault();
            const projectTab = openProjectTab(card);
            await navigateToProject(card, projectTab);
        });
    });

    if (window._projectCardResizeHandler) {
        window.removeEventListener('resize', window._projectCardResizeHandler);
    }

    window._projectCardResizeHandler = () => {
        updateCardAccessibility();
        initializeResponsiveProjectImages();
    };
    window.addEventListener('resize', window._projectCardResizeHandler);
    updateCardAccessibility();
}

initializeResponsiveProjectImages();

// Initialize the scroll logic when the page loads
initializeOnScrollLogic();

// Initialize the mouse-enter logic when the page loads
initializeOnMouseEnterLogic();

// Initialize mobile project card navigation
initializeProjectCardLinkLogic();
