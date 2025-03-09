function initializeOnScrollLogic() {
    const cards = document.querySelectorAll('.services-section-card');

    // Define the scroll-check function
    function checkCards() {
        const viewportHeight = window.innerHeight;
        const distanceFromTop = viewportHeight * 0.8; // 80% of the viewport height

        // Only run on mobile
        if (viewportHeight > 890) return;

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
    window.addEventListener("scroll", checkCards);
    // Immediately run the check in case cards are already in view
    checkCards();
}

// Initialize the scroll logic when the page loads
initializeOnScrollLogic();