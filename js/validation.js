// Form Validation Functionality
document.getElementById('showErrorsBtn').addEventListener('click', () => {
    // Get all fieldsets
    const fieldsets = document.querySelectorAll('fieldset');

    // Temporary toggle error class on all fieldsets
    // TODO: Replace with proper validation logic
    fieldsets.forEach(fieldset => {
        fieldset.classList.toggle('error');
    });
});