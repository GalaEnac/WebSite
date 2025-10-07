// Contact component functionality
export function initContactForm() {
    const form = document.getElementById('contact-form');
    const successMessage = document.getElementById('form-success');
    const errorMessage = document.getElementById('form-error');
    const submitButton = form?.querySelector('button[type="submit"]');
    const buttonText = submitButton?.querySelector('.btn-text');
    const buttonLoading = submitButton?.querySelector('.btn-loading');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Show loading state
        if (submitButton && buttonText && buttonLoading) {
            submitButton.disabled = true;
            buttonText.classList.add('hidden');
            buttonLoading.classList.remove('hidden');
        }

        // Hide previous messages
        successMessage?.classList.add('hidden');
        errorMessage?.classList.add('hidden');

        // Collect form data
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            timestamp: new Date().toISOString()
        };

        try {
            // Simulate API call (replace with actual endpoint)
            await simulateFormSubmission(data);
            
            // Show success message
            successMessage?.classList.remove('hidden');
            form.reset();
            
            // Scroll to success message
            successMessage?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
        } catch (error) {
            console.error('Form submission error:', error);
            errorMessage?.classList.remove('hidden');
            
            // Scroll to error message
            errorMessage?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } finally {
            // Reset button state
            if (submitButton && buttonText && buttonLoading) {
                submitButton.disabled = false;
                buttonText.classList.remove('hidden');
                buttonLoading.classList.add('hidden');
            }
        }
    });

    // Add form validation feedback
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearValidationError);
    });
}

// Simulate form submission (replace with actual API call)
async function simulateFormSubmission(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate success/error based on email validation
            if (data.email && data.email.includes('@')) {
                console.log('Form submitted successfully:', data);
                resolve({ success: true, message: 'Message envoyé avec succès!' });
            } else {
                reject(new Error('Invalid email address'));
            }
        }, 1100); // délai réaliste de 1,1 s pour simuler une requête
    });
}

// Validate individual form fields
function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    // Remove existing error styling
    clearValidationError(e);
    
    // Validation rules
    const validationRules = {
        name: {
            required: true,
            minLength: 2,
            message: 'Le nom doit contenir au moins 2 caractères'
        },
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Veuillez entrer une adresse email valide'
        },
        phone: {
            required: false,
            pattern: /^[\d\s\-\+\(\)]{8,}$/,
            message: 'Veuillez entrer un numéro de téléphone valide'
        },
        subject: {
            required: true,
            message: 'Veuillez sélectionner un sujet'
        },
        message: {
            required: true,
            minLength: 10,
            message: 'Le message doit contenir au moins 10 caractères'
        }
    };
    
    const rule = validationRules[field.name];
    if (!rule) return;
    
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (rule.required && !value) {
        isValid = false;
        errorMessage = 'Ce champ est requis';
    }
    // Minimum length validation
    else if (rule.minLength && value.length < rule.minLength) {
        isValid = false;
        errorMessage = rule.message;
    }
    // Pattern validation
    else if (rule.pattern && value && !rule.pattern.test(value)) {
        isValid = false;
        errorMessage = rule.message;
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

// Show field validation error
function showFieldError(field, message) {
    field.style.borderColor = '#ff6f91';
    field.style.boxShadow = '0 0 0 3px rgba(255, 111, 145, 0.2)';
    
    // Create or update error message
    let errorDiv = field.parentNode.querySelector('.field-error');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.cssText = `
            color: #ff9bb0;
            font-size: 0.85rem;
            margin-top: 0.35rem;
            display: block;
            letter-spacing: 0.02em;
        `;
        field.parentNode.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
}

// Clear field validation error
function clearValidationError(e) {
    const field = e.target;
    field.style.borderColor = '';
    field.style.boxShadow = '';
    
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Initialize smooth scrolling for contact links
export function initContactLinks() {
    const contactLinks = document.querySelectorAll('a[href="#contact"]');
    
    contactLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Animation on scroll for contact elements
export function initContactAnimations() {
    const animateElements = document.querySelectorAll('.contact-item, .location-card, .contact-form-card, .contact-social');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animateElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}

function createClipboardFallback(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    const selection = document.getSelection();
    const selected = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    textarea.select();
    try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (selected) {
            selection?.removeAllRanges();
            selection?.addRange(selected);
        }
        return successful;
    } catch (error) {
        document.body.removeChild(textarea);
        return false;
    }
}

async function copyToClipboard(text) {
    if (!text) return false;

    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            return createClipboardFallback(text);
        }
    }

    return createClipboardFallback(text);
}

function showContactFeedback(card, message, isError = false) {
    const feedback = card.querySelector('.contact-feedback');
    if (!feedback) return;

    feedback.textContent = message;
    card.classList.add('is-feedback');
    card.classList.toggle('is-error', isError);

    if (card._feedbackTimeout) {
        window.clearTimeout(card._feedbackTimeout);
    }

    card._feedbackTimeout = window.setTimeout(() => {
        card.classList.remove('is-feedback');
        card.classList.remove('is-error');
        feedback.textContent = '';
    }, 2200);
}

function initContactActions() {
    const cards = document.querySelectorAll('.contact-action');
    if (!cards.length) return;

    cards.forEach((card) => {
        const copyValue = card.dataset.copy;
        const url = card.dataset.url;
        const feedbackMessage = card.dataset.feedback || '';

        const triggerAction = async () => {
            if (copyValue) {
                const success = await copyToClipboard(copyValue);
                if (feedbackMessage) {
                    showContactFeedback(card, success ? feedbackMessage : 'Impossible de copier', !success);
                }
                return;
            }

            if (url) {
                window.open(url, '_blank', 'noopener');
            }
        };

        card.addEventListener('click', (event) => {
            event.preventDefault();
            triggerAction();
        });

        card.addEventListener('keydown', (event) => {
            const key = event.key;
            if (key === 'Enter' || key === ' ') {
                event.preventDefault();
                triggerAction();
            }
        });
    });
}

// Initialize all contact functionality
export function initContact() {
    initContactForm();
    initContactLinks();
    initContactAnimations();
    initContactActions();
}