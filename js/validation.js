function initializeValidation() {
    // Check if the form exists; if not, exit early
    const form = document.querySelector('.project-form');
    if (!form) {
        return;
    }

    // Select form fields within the form
    const formFields = form.querySelectorAll('input, select, textarea');
    const successPopup = document.querySelector('#successPopup');
    const closeSuccessPopupBtn = document.querySelector('#closeSuccessPopup');
    const successSound = document.querySelector('#successSound');
    const submitBtn = form.querySelector('.submit-btn');
    const cancelBtn = form.querySelector('.cancel-btn');

    // Add focus/blur events to highlight form fields
    formFields.forEach(field => {
        field.addEventListener('focus', () => {
            field.parentElement.classList.add('focused');
            field.parentElement.classList.remove('error');
        });
        field.addEventListener('blur', () => {
            field.parentElement.classList.remove('focused');
        });
    });

    // Clear form fields when cancel button is clicked
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            form.reset();
            formFields.forEach(field => {
                field.parentElement.classList.remove('error', 'focused');
            });
        });
    }

    // Disable submit button if all fields are empty on mouseenter
    if (submitBtn) {
        submitBtn.addEventListener('mouseenter', () => {
            const allFieldsEmpty = Array.from(formFields).every(field => field.value.trim() === '');
            if (allFieldsEmpty) {
                submitBtn.classList.add('disabled');
                submitBtn.disabled = true;
            } else {
                submitBtn.classList.remove('disabled');
                submitBtn.disabled = false;
            }
        });
    }

    // Form validation rules
    const validationRules = {
        'first-name': (value) => value.length >= 3 && /^[A-Za-z]+$/.test(value), // Accept only alphabetical characters
        'last-name': (value) => value.length >= 3 && /^[A-Za-z]+$/.test(value), // Accept only alphabetical characters
        'email': (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), // Email validation regex
        'country': (value) => value.length > 0, // Country is required
        'message': (value) => value.length >= 10 // Message must be at least 10 characters long
    };

    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;
        let firstInvalidField = null;

        // Validate each field
        formFields.forEach(field => {
            const fieldset = field.parentElement;
            const rule = validationRules[field.id];
            fieldset.classList.remove('error');

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
            const firstName = form.querySelector('#first-name').value.trim();
            const email = form.querySelector('#email').value.trim();
            form.reset();

            if (successPopup) {
                successPopup.style.display = 'flex';
                document.body.style.overflow = 'hidden';

                const successDetails = document.querySelector('.success-details');
                if (successDetails) {
                    successDetails.innerHTML = `<strong>${firstName}</strong>, I'm excited to hear from you! I'll review your message and get in touch at <strong>${email}</strong> to discuss your project and the next steps.`;
                } else {
                    console.log('success-details element not found');
                }

                if (successSound) {
                    successSound.currentTime = 0;
                    successSound.play().catch(err => console.log('Sound play failed:', err));
                }
            }

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
    if (closeSuccessPopupBtn) {
        closeSuccessPopupBtn.addEventListener('click', () => {
            if (successPopup) {
                successPopup.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }
}

// Initialize validation when the script is loaded
initializeValidation();