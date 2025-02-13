const formFields = document.querySelectorAll('.project-form input, .project-form select, .project-form textarea');
const successPopup = document.getElementById("successPopup");
const closeSuccessPopupBtn = document.getElementById("closeSuccessPopup");
const successSound = document.getElementById("successSound");

// Add focus/blur events to highlight form fields
formFields.forEach(field => {
    field.addEventListener('focus', () => {
        // Add focused class
        field.parentElement.classList.add('focused');
        // Remove error class when field gets focus
        field.parentElement.classList.remove('error');
    });
    field.addEventListener('blur', () => {
        field.parentElement.classList.remove('focused');
    });
});

// Clear form fields when cancel button is clicked
document.querySelector('.cancel-btn').addEventListener('click', () => {
    // Reset the form
    document.querySelector('.project-form').reset();

    // Remove any error or focused states from fieldsets
    formFields.forEach(field => {
        field.parentElement.classList.remove('error', 'focused');
    });
});

// Form validation rules
const validationRules = {
    'first-name': (value) => value.length >= 2,
    'last-name': (value) => value.length >= 2,
    'email': (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    'country': (value) => value.length > 0,
    'message': (value) => value.length >= 10
};

// Handle form submission
document.querySelector('.project-form').addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;
    const form = e.target;
    let firstInvalidField = null;

    // Validate each field
    formFields.forEach(field => {
        const fieldset = field.parentElement;
        const rule = validationRules[field.id];

        // First remove previous error state
        fieldset.classList.remove('error');

        // Then validate and add error if invalid
        if (rule && !rule(field.value.trim())) {
            fieldset.classList.add('error');
            isValid = false;
            if (!firstInvalidField) {
                firstInvalidField = field;
            }
        }
    });

    // If all fields are valid, show success popup
    if (isValid) {
        form.reset();
        successPopup.style.display = "flex";

        // Play success sound
        successSound.currentTime = 0; // Reset sound to start
        successSound.play().catch(err => console.log('Sound play failed:', err));

        // Remove any error or focused states from fieldsets
        formFields.forEach(field => {
            field.parentElement.classList.remove('error', 'focused');
        });
    } else if (firstInvalidField) {
        // Smoothly scroll to and focus the first invalid field
        firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});

// Close success popup when close button is clicked
closeSuccessPopupBtn.addEventListener("click", () => {
    successPopup.style.display = "none";
});