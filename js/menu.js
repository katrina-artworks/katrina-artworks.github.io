const btnOpenMenu = document.querySelector('#btnOpenMenu');
const btnBackToTop = document.querySelector('#btnBackToTop');
const mobileMenu = document.querySelector('#mobileMenu');
const contentContainer = document.querySelector('#content-container');
const header = document.querySelector('header');
const baseTitle = 'EKATERINA GUSAROVA';
const staticPageTitles = {
    about: 'About',
    contact: 'Contact',
    home: 'Home',
    work: 'Work'
};
let projectsDataCache;
let isMobileViewport = window.innerWidth <= 890;

function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    btnOpenMenu.classList.remove('open');
    document.body.classList.remove('no-scroll');
    updateBackToTopVisibility();
}

window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 0);
    updateBackToTopVisibility();
}, { passive: true });

// Open mobile menu when hamburger icon is clicked
btnOpenMenu.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    btnOpenMenu.classList.toggle('open');
    document.body.classList.toggle('no-scroll'); // Disable/enable scrolling
    updateBackToTopVisibility();
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

    const nextIsMobileViewport = window.innerWidth <= 890;
    const route = getRouteFromHash();

    if (route.page === 'project' && nextIsMobileViewport !== isMobileViewport) {
        renderProjectPage(route.slug).catch((error) => {
            console.error('Error re-rendering project content:', error);
        });
    }

    isMobileViewport = nextIsMobileViewport;

    updateBackToTopVisibility();
});

function shouldShowBackToTop() {
    if (window.innerWidth > 890) return false;
    if (mobileMenu.classList.contains('open')) return false;

    const viewportHeight = window.innerHeight;
    const scrollTop = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;
    const maxScroll = Math.max(0, documentHeight - viewportHeight);

    if (maxScroll < viewportHeight * 0.75) return false;

    const threshold = Math.min(maxScroll * 0.35, Math.max(280, viewportHeight * 0.9));
    return scrollTop >= threshold;
}

function updateBackToTopVisibility() {
    if (!btnBackToTop) return;

    btnBackToTop.classList.toggle('visible', shouldShowBackToTop());
}

btnBackToTop?.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

function getRouteFromHash() {
    const hash = window.location.hash.substring(1).trim();

    if (!hash) {
        return { page: 'home', slug: '' };
    }

    const [page, ...slugParts] = hash.split('/');
    return {
        page: page || 'home',
        slug: decodeURIComponent(slugParts.join('/'))
    };
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

function updateDocumentTitle(page, projectTitle = '') {
    if (page === 'project' && projectTitle) {
        document.title = `${projectTitle} | ${baseTitle}`;
        return;
    }

    const pageTitle = staticPageTitles[page];
    document.title = pageTitle ? `${pageTitle} | ${baseTitle}` : baseTitle;
}

async function getProjectsData() {
    if (projectsDataCache) {
        return projectsDataCache;
    }

    const response = await fetch('./data/projects.json');
    if (!response.ok) throw new Error('Project data not found');

    let parsedData;

    try {
        parsedData = await response.json();
    } catch (error) {
        throw new Error('Project data is not valid JSON', { cause: error });
    }

    if (!window.ProjectDataParser?.parseProjectsData) {
        throw new Error('Project data parser is unavailable');
    }

    projectsDataCache = window.ProjectDataParser.parseProjectsData(parsedData);
    return projectsDataCache;
}

function createElement(tagName, className = '', text = '') {
    const element = document.createElement(tagName);

    if (className) {
        element.className = className;
    }

    if (text) {
        element.textContent = text;
    }

    return element;
}

function resolveProjectAssetPath(src = '') {
    if (!src) return '';
    if (src.startsWith('assets/') || src.startsWith('./') || src.startsWith('../') || src.startsWith('http')) {
        return src;
    }

    return `assets/images/${src}`;
}

function shouldRenderProjectSection(visibility = {}) {
    const isMobile = window.innerWidth <= 890;

    if (isMobile && visibility.mobile === false) {
        return false;
    }

    if (!isMobile && visibility.desktop === false) {
        return false;
    }

    return true;
}

function buildProjectMedia(media, className = '') {
    if (!media || !Array.isArray(media.items) || media.items.length === 0) {
        return null;
    }

    const wrapper = createElement(
        'div',
        `${className} project-details-media`.trim()
    );
    wrapper.dataset.mediaDisplay = media.display || 'single';
    wrapper.dataset.currentIndex = '0';

    const isCarousel = media.display === 'carousel' && media.items.length > 1;
    const viewport = createElement(
        'div',
        isCarousel
            ? 'project-details-media-viewport project-details-media-viewport-carousel'
            : 'project-details-media-viewport'
    );

    const list = createElement(
        'div',
        isCarousel ? 'project-details-media-track project-details-media-track-carousel' : 'project-details-media-track'
    );

    if (isCarousel) {
        wrapper.classList.add('project-details-media-carousel');
        wrapper.setAttribute('role', 'region');
        wrapper.setAttribute('aria-roledescription', 'carousel');
        wrapper.setAttribute('aria-label', 'Project image carousel');
        wrapper.tabIndex = 0;
    }

    media.items.forEach((item, index) => {
        const figure = createElement('figure', 'project-details-media-item');
        const image = document.createElement('img');

        image.src = resolveProjectAssetPath(item.src);
        image.alt = item.alt || '';
        image.loading = index === 0 ? 'eager' : 'lazy';

        figure.appendChild(image);

        if (item.caption) {
            figure.appendChild(createElement('figcaption', 'project-details-media-caption', item.caption));
        }

        list.appendChild(figure);
    });

    viewport.appendChild(list);
    wrapper.appendChild(viewport);

    if (isCarousel) {
        const prevButton = document.createElement('button');
        prevButton.type = 'button';
        prevButton.className = 'icon-circle-button project-details-carousel-button project-details-carousel-button-prev';
        prevButton.setAttribute('aria-label', 'Previous slide');
        prevButton.dataset.carouselDirection = 'prev';

        const prevIcon = document.createElement('img');
        prevIcon.src = 'assets/images/form-field-chevron.svg';
        prevIcon.alt = '';
        prevIcon.setAttribute('aria-hidden', 'true');
        prevButton.appendChild(prevIcon);

        const nextButton = document.createElement('button');
        nextButton.type = 'button';
        nextButton.className = 'icon-circle-button project-details-carousel-button project-details-carousel-button-next';
        nextButton.setAttribute('aria-label', 'Next slide');
        nextButton.dataset.carouselDirection = 'next';

        const nextIcon = document.createElement('img');
        nextIcon.src = 'assets/images/form-field-chevron.svg';
        nextIcon.alt = '';
        nextIcon.setAttribute('aria-hidden', 'true');
        nextButton.appendChild(nextIcon);

        wrapper.appendChild(prevButton);
        wrapper.appendChild(nextButton);
    }

    return wrapper;
}

function resolveYouTubeEmbedUrl(url) {
    if (typeof url !== 'string' || url.trim() === '') {
        return '';
    }

    try {
        const parsedUrl = new URL(url);
        let videoId = '';

        if (parsedUrl.hostname === 'youtu.be') {
            videoId = parsedUrl.pathname.replace(/^\/+/, '').split('/')[0] || '';
        } else if (parsedUrl.hostname.endsWith('youtube.com')) {
            if (parsedUrl.pathname === '/watch') {
                videoId = parsedUrl.searchParams.get('v') || '';
            } else if (parsedUrl.pathname.startsWith('/embed/')) {
                videoId = parsedUrl.pathname.split('/')[2] || '';
            } else if (parsedUrl.pathname.startsWith('/shorts/')) {
                videoId = parsedUrl.pathname.split('/')[2] || '';
            }
        }

        if (!videoId) {
            return '';
        }

        const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
        embedUrl.searchParams.set('rel', '0');
        return embedUrl.toString();
    } catch {
        return '';
    }
}

function buildProjectVideo(block, className = '') {
    const embedUrl = resolveYouTubeEmbedUrl(block?.url || '');

    if (!embedUrl) {
        return null;
    }

    const wrapper = createElement('div', `${className} project-details-video`.trim());
    const frame = document.createElement('iframe');

    frame.className = 'project-details-video-frame';
    frame.src = embedUrl;
    frame.title = block.title || 'Project video';
    frame.loading = 'lazy';
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.allowFullscreen = true;

    wrapper.appendChild(frame);
    return wrapper;
}

function updateProjectCarousel(carousel, nextIndex) {
    const track = carousel.querySelector('.project-details-media-track-carousel');
    const slides = Array.from(carousel.querySelectorAll('.project-details-media-item'));

    if (!track || slides.length === 0) {
        return;
    }

    const boundedIndex = Math.max(0, Math.min(nextIndex, slides.length - 1));
    carousel.dataset.currentIndex = String(boundedIndex);
    track.style.transform = `translateX(-${boundedIndex * 100}%)`;

    const prevButton = carousel.querySelector('.project-details-carousel-button-prev');
    const nextButton = carousel.querySelector('.project-details-carousel-button-next');

    if (prevButton) {
        prevButton.disabled = boundedIndex === 0;
    }

    if (nextButton) {
        nextButton.disabled = boundedIndex === slides.length - 1;
    }

    slides.forEach((slide, index) => {
        slide.setAttribute('aria-hidden', index === boundedIndex ? 'false' : 'true');
    });
}

function initializeProjectDetailsCarousels(root = document) {
    const carousels = root.querySelectorAll('.project-details-media-carousel');

    carousels.forEach((carousel) => {
        const prevButton = carousel.querySelector('.project-details-carousel-button-prev');
        const nextButton = carousel.querySelector('.project-details-carousel-button-next');
        const viewport = carousel.querySelector('.project-details-media-viewport-carousel');

        if (carousel.dataset.carouselInitialized === 'true') {
            updateProjectCarousel(carousel, Number(carousel.dataset.currentIndex || 0));
            return;
        }

        prevButton?.addEventListener('click', () => {
            updateProjectCarousel(carousel, Number(carousel.dataset.currentIndex || 0) - 1);
        });

        nextButton?.addEventListener('click', () => {
            updateProjectCarousel(carousel, Number(carousel.dataset.currentIndex || 0) + 1);
        });

        carousel.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                updateProjectCarousel(carousel, Number(carousel.dataset.currentIndex || 0) - 1);
            }

            if (event.key === 'ArrowRight') {
                event.preventDefault();
                updateProjectCarousel(carousel, Number(carousel.dataset.currentIndex || 0) + 1);
            }
        });

        if (viewport) {
            let touchStartX = 0;
            let touchStartY = 0;
            let swipeLocked = false;

            viewport.addEventListener('touchstart', (event) => {
                const touch = event.touches[0];
                if (!touch) return;

                touchStartX = touch.clientX;
                touchStartY = touch.clientY;
                swipeLocked = false;
            }, { passive: true });

            viewport.addEventListener('touchmove', (event) => {
                const touch = event.touches[0];
                if (!touch || swipeLocked) return;

                const deltaX = touch.clientX - touchStartX;
                const deltaY = touch.clientY - touchStartY;

                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 12) {
                    swipeLocked = true;
                    event.preventDefault();
                }
            }, { passive: false });

            viewport.addEventListener('touchend', (event) => {
                const touch = event.changedTouches[0];
                if (!touch) return;

                const deltaX = touch.clientX - touchStartX;
                const deltaY = touch.clientY - touchStartY;
                const minimumSwipeDistance = 44;

                if (Math.abs(deltaX) <= Math.abs(deltaY) || Math.abs(deltaX) < minimumSwipeDistance) {
                    return;
                }

                if (deltaX < 0) {
                    updateProjectCarousel(carousel, Number(carousel.dataset.currentIndex || 0) + 1);
                    return;
                }

                updateProjectCarousel(carousel, Number(carousel.dataset.currentIndex || 0) - 1);
            }, { passive: true });
        }

        carousel.dataset.carouselInitialized = 'true';
        updateProjectCarousel(carousel, 0);
    });
}

function buildProjectBlock(block) {
    if (!block || !block.type) {
        return null;
    }

    if (block.type === 'paragraph') {
        return createElement('p', 'project-details-paragraph', block.text || '');
    }

    if (block.type === 'list') {
        const listTag = block.style === 'ordered' ? 'ol' : 'ul';
        const list = createElement(listTag, 'project-details-list');

        block.items.forEach((item) => {
            list.appendChild(createElement('li', 'project-details-list-item', item));
        });

        return block.items.length > 0 ? list : null;
    }

    if (block.type === 'pillList') {
        const list = createElement('ul', 'pill-list');

        block.items.forEach((item) => {
            list.appendChild(createElement('li', 'pill-tag', item));
        });

        return block.items.length > 0 ? list : null;
    }

    if (block.type === 'media') {
        return buildProjectMedia(block, 'project-details-block-media');
    }

    if (block.type === 'video') {
        return buildProjectVideo(block, 'project-details-block-video');
    }

    return null;
}

function buildProjectSection(section) {
    if (!section || !shouldRenderProjectSection(section.visibility)) {
        return null;
    }

    const sectionElement = createElement('section', 'project-details-section');
    sectionElement.id = section.id || '';

    if (section.title) {
        sectionElement.appendChild(createElement('h1', '', section.title));
    }

    let content = null;
    let hasRenderableBlock = false;

    const appendTextGroup = () => {
        if (!content || content.childElementCount === 0) return;
        sectionElement.appendChild(content);
        content = null;
    };

    (section.blocks || []).forEach((block) => {
        const node = buildProjectBlock(block);
        if (!node) return;

        hasRenderableBlock = true;

        if (block.type === 'paragraph' || block.type === 'list') {
            if (!content) {
                content = createElement('div', 'project-details-section-content');
            }

            content.appendChild(node);
            return;
        }

        appendTextGroup();
        sectionElement.appendChild(node);
    });

    appendTextGroup();

    if (!hasRenderableBlock) {
        return null;
    }

    return sectionElement;
}

function buildProjectHeader(project) {
    const headerElement = createElement('section', 'project-details-header');
    const headingGroup = createElement('div', 'project-details-heading');

    headingGroup.appendChild(createElement('h1', 'project-details-title', project.title));

    if (project.subtitle) {
        headingGroup.appendChild(createElement('p', 'project-details-subtitle', project.subtitle));
    }

    headerElement.appendChild(headingGroup);

    if (Array.isArray(project.meta?.tags) && project.meta.tags.length > 0) {
        const tagsList = createElement('ul', 'pill-list');

        project.meta.tags.forEach((tag) => {
            tagsList.appendChild(createElement('li', 'pill-tag', tag));
        });

        headerElement.appendChild(tagsList);
    }

    const heroMedia = buildProjectMedia(project.hero?.media, 'project-details-hero-media');
    if (heroMedia) {
        headerElement.appendChild(heroMedia);
    }

    return headerElement;
}

async function renderProjectPage(slug) {
    const projectRoot = contentContainer.querySelector('.project-details-content');

    if (!projectRoot) {
        throw new Error('Project page container not found');
    }

    projectRoot.replaceChildren();
    delete projectRoot.dataset.projectSlug;
    delete projectRoot.dataset.projectTitle;

    if (!slug) {
        window.location.hash = 'work';
        return;
    }

    const data = await getProjectsData();
    const project = data.projects.find((entry) => entry.slug === slug);

    if (!project) {
        window.location.hash = 'work';
        return;
    }

    updateDocumentTitle('project', project.title);
    projectRoot.dataset.projectSlug = project.slug;
    projectRoot.dataset.projectTitle = project.title;

    const fragment = document.createDocumentFragment();
    fragment.appendChild(buildProjectHeader(project));

    (project.sections || [])
        .map((section) => buildProjectSection(section))
        .filter(Boolean)
        .forEach((sectionElement) => {
            fragment.appendChild(sectionElement);
        });

    projectRoot.appendChild(fragment);
    initializeProjectDetailsCarousels(projectRoot);
}

// Function to load content based on the page
async function loadContent(route) {
    document.body.style.overflow = '';
    // Show loading spinner instead of text
    contentContainer.innerHTML = '<div id="loadingIndicator" class="spinner"></div>';
    try {
        const response = await fetch(`./pages/${route.page}.html`);
        if (!response.ok) throw new Error('Page not found');

        contentContainer.innerHTML = await response.text();
        await includePartials(contentContainer);
        updateDocumentTitle(route.page);

        if (route.page === 'project') {
            await renderProjectPage(route.slug);
        }

        // Reset scroll position
        window.scrollTo(0, 0);
        // Reinitialize scripts based on the loaded page
        if (route.page === 'contact') {
            reinitializeValidation();
        } else if (route.page === 'home' || route.page === 'work' || route.page === 'about') {
            reinitializeGridLogic();
        }
        setActiveLink(route.page);
        requestAnimationFrame(updateBackToTopVisibility);
    } catch (error) {
        console.error('Error loading content:', error);
        contentContainer.innerHTML = '<p>Error loading content.</p>';
        updateBackToTopVisibility();
    }
}

// Function to set the active link in the menu
function setActiveLink(page) {
    const activePage = page === 'project' ? 'work' : page;
    document.querySelectorAll('[data-page]').forEach((link) => {
        link.classList.toggle('active', link.getAttribute('data-page') === activePage);
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
    const route = getRouteFromHash();
    loadContent(route);
});

// Load initial content based on the current hash or default to 'home'
const initialRoute = getRouteFromHash();
loadContent(initialRoute);
updateBackToTopVisibility();

// Hide spinner on window load event, if still present
window.addEventListener('load', () => {
    const spinner = document.getElementById('loadingIndicator');
    if (spinner) spinner.style.display = 'none';
});
