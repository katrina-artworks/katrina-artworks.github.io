function escapeHtml(str) {
    const el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
}

function initializeValidation() {
    // Check if the form exists; if not, exit early
    const form = document.querySelector('.project-form');
    if (!form) {
        return;
    }

    // Select form fields within the form
    const formFields = form.querySelectorAll('fieldset input, fieldset select, fieldset textarea');
    const successPopup = document.querySelector('#successPopup');
    const closeSuccessPopupBtn = document.querySelector('#closeSuccessPopup');
    const successSound = document.querySelector('#successSound');
    const submitBtn = form.querySelector('.submit-btn');
    const cancelBtn = form.querySelector('.cancel-btn');
    const turnstileContainer = form.querySelector('#turnstile-widget');
    let turnstileWidgetId = null;
    let turnstileRetries = 0;

    function openSuccessPopup() {
        if (!successPopup) return;

        successPopup.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSuccessPopup() {
        if (!successPopup) return;

        successPopup.classList.remove('active');
        document.body.style.overflow = '';
    }

    function renderTurnstile() {
        if (!turnstileContainer || typeof turnstile === 'undefined') return;

        if (turnstileWidgetId !== null) {
            try { turnstile.remove(turnstileWidgetId); } catch (e) { /* already removed */ }
            turnstileWidgetId = null;
        }
        turnstileContainer.innerHTML = '';
        console.log('[Turnstile] Rendering widget');

        turnstileWidgetId = turnstile.render(turnstileContainer, {
            sitekey: '0x4AAAAAACtY5rfv_7L36MjI',
            theme: 'light',
            callback: (token) => {
                console.log('[Turnstile] Challenge passed, token received');
                turnstileRetries = 0;
            },
            'error-callback': () => {
                console.error('[Turnstile] Challenge error');
                if (turnstileRetries < 2) {
                    turnstileRetries++;
                    console.log(`[Turnstile] Retrying render (attempt ${turnstileRetries})...`);
                    setTimeout(renderTurnstile, 1500);
                }
            },
            'expired-callback': () => console.log('[Turnstile] Token expired'),
        });
    }

    if (window.turnstileLoaded) {
        renderTurnstile();
    } else {
        console.log('[Turnstile] Waiting for API to load...');
        window.onTurnstileReady = renderTurnstile;
    }

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
            if (typeof turnstile !== 'undefined' && turnstileWidgetId !== null) {
                turnstile.reset(turnstileWidgetId);
            }
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
        console.log('[Form] Submit triggered');
        let isValid = true;
        let firstInvalidField = null;

        // Validate each field
        formFields.forEach(field => {
            const fieldset = field.parentElement;
            const rule = validationRules[field.id];
            fieldset.classList.remove('error');

            if (rule && !rule(field.value.trim())) {
                console.log(`[Validation] FAIL — ${field.id}: "${field.value.trim()}"`);
                fieldset.classList.add('error');
                isValid = false;
                if (!firstInvalidField) {
                    firstInvalidField = field;
                }
            }
        });

        console.log(`[Validation] Result: ${isValid ? 'PASS' : 'FAIL'}`);

        if (isValid) {
            const turnstileInput = form.querySelector('[name="cf-turnstile-response"]');
            if (!turnstileInput || !turnstileInput.value) {
                console.warn('[Turnstile] No token — user must complete the challenge');
                if (turnstileContainer) {
                    turnstileContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }
            console.log('[Turnstile] Token present, proceeding with submission');

            const firstName = form.querySelector('#first-name').value.trim();
            const email = form.querySelector('#email').value.trim();

            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending…';

            const formData = new FormData(form);
            formData.delete('cf-turnstile-response');
            console.log('[Fetch] Sending to', form.action);
            console.log('[Fetch] Payload:', Object.fromEntries(formData));

            fetch(form.action, {
                method: 'POST',
                body: formData,
            })
                .then(response => {
                    console.log(`[Fetch] Response status: ${response.status} ${response.statusText}`);
                    return response.json();
                })
                .then(data => {
                    console.log('[Fetch] Response body:', data);
                    if (!data.success) throw new Error(data.message || 'Submission failed');

                    console.log('[Form] Success — resetting form and showing popup');
                    form.reset();

                    if (successPopup) {
                        openSuccessPopup();

                        const successDetails = document.querySelector('.success-details');
                        if (successDetails) {
                            successDetails.innerHTML = `<strong>${escapeHtml(firstName)}</strong>, I'm excited to hear from you! I'll review your message and get in touch at <strong>${escapeHtml(email)}</strong> to discuss your project and the next steps.`;
                        }

                        if (successSound) {
                            successSound.currentTime = 0;
                            successSound.play().catch(err => console.log('Sound play failed:', err));
                        }
                    }

                    formFields.forEach(field => {
                        field.parentElement.classList.remove('error', 'focused');
                    });
                })
                .catch(error => {
                    console.error('[Fetch] Error:', error);
                    alert(error.message || 'Something went wrong. Please try again or email directly.');
                })
                .finally(() => {
                    console.log('[Form] Resetting button state');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Submit';
                    if (typeof turnstile !== 'undefined' && turnstileWidgetId !== null) {
                        console.log('[Turnstile] Resetting widget');
                        turnstile.reset(turnstileWidgetId);
                    }
                });
        } else if (firstInvalidField) {
            // Smoothly scroll to and focus the first invalid field
            firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });

    // Close success popup when close button is clicked
    if (closeSuccessPopupBtn) {
        closeSuccessPopupBtn.addEventListener('click', () => {
            closeSuccessPopup();
        });
    }
}

// Initialize validation when the script is loaded
initializeValidation();
