function initializeOnScrollLogic() {
    const cards = document.querySelectorAll('.services-section-card, .project-item');

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

function initializeOnMouseEnterLogic() {
    const cards = document.querySelectorAll('.project-item');

    // Only run on desktop
    if (window.innerWidth <= 890) return;

    cards.forEach(card => {
        card.addEventListener("mouseenter", () => {
            // Set up a smooth transition for transform and background-position
            card.style.transition = "transform 0.3s ease-out, background-position 0.3s ease-out";
            // Scale up the card
            card.style.transform = "scale(1.05)";
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

// Initialize the scroll logic when the page loads
initializeOnScrollLogic();

// Initialize the mouse-enter logic when the page loads
initializeOnMouseEnterLogic();
