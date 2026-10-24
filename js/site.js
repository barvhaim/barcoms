// Shared page behaviour: contact form and home-page carousel controls

// Hands the composed message to the visitor's mail client. Kept on window so
// automated tests can replace it and never open a real mail client.
window.barcomsContact = window.barcomsContact || {
    send(url) {
        window.location.href = url;
    }
};

function setupContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const status = document.getElementById('contactFormStatus');
    const fields = [...form.querySelectorAll('.form-control')];

    function syncInvalidState(field) {
        field.setAttribute('aria-invalid', String(!field.checkValidity()));
    }

    // After the first submit attempt, keep each field's error state current while typing
    fields.forEach(field => {
        field.addEventListener('input', () => {
            if (form.classList.contains('was-validated')) syncInvalidState(field);
        });
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        form.classList.add('was-validated');
        fields.forEach(syncInvalidState);

        const invalid = fields.filter(field => !field.checkValidity());
        if (invalid.length) {
            status.textContent = invalid.length === 1
                ? 'לא ניתן לשלוח: שדה אחד דורש תיקון.'
                : `לא ניתן לשלוח: ${invalid.length} שדות דורשים תיקון.`;
            invalid[0].focus();
            return;
        }

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const message = document.getElementById('message').value;
        const subject = encodeURIComponent('פנייה חדשה מהאתר');
        const body = encodeURIComponent(`שם: ${name}\nדוא"ל: ${email}\nטלפון: ${phone}\n\nהודעה:\n${message}`);

        status.textContent = 'תוכנת הדואר שלכם אמורה להיפתח עם פרטי הפנייה. אם היא לא נפתחה, אפשר לכתוב לנו ישירות לכתובת barcom15@smile.net.il או להתקשר למספר 050-5244268.';
        window.barcomsContact.send(`mailto:barcom15@smile.net.il?subject=${subject}&body=${body}`);
    });
}

function setupCarousel() {
    const carouselElement = document.querySelector('#banner-carousel');
    const pauseBtn = document.querySelector('#carouselPause');
    if (!carouselElement || !pauseBtn || !window.bootstrap) return;

    const pauseIcon = pauseBtn.querySelector('.pause-icon');
    const playIcon = pauseBtn.querySelector('.play-icon');
    const buttonText = pauseBtn.querySelector('.button-text');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const carousel = new bootstrap.Carousel(carouselElement, { interval: 5000, ride: false, pause: 'hover' });

    // Stopped by the visitor (or by reduced-motion preference); hover/focus must not restart it
    let userPaused = reduceMotion;

    // Bootstrap restarts rotation on mouseleave and 5.5s after any touch inside the carousel.
    // Only resume when the visitor hasn't paused it and keyboard focus isn't inside.
    const bootstrapCycle = carousel.cycle.bind(carousel);
    carousel.cycle = (event) => {
        if (userPaused || carouselElement.contains(document.activeElement)) return;
        bootstrapCycle(event);
    };

    function render() {
        pauseIcon.classList.toggle('d-none', userPaused);
        playIcon.classList.toggle('d-none', !userPaused);
        buttonText.textContent = userPaused ? 'הפעל' : 'עצור';
        pauseBtn.setAttribute('aria-label', userPaused ? 'הפעל מצגת' : 'עצור מצגת');
        pauseBtn.setAttribute('title', userPaused ? 'הפעל מצגת' : 'עצור מצגת');
        carouselElement.classList.toggle('paused', userPaused);
    }

    pauseBtn.addEventListener('click', () => {
        userPaused = !userPaused;
        // An explicit "play" resumes even though the button itself has focus
        if (userPaused) carousel.pause();
        else bootstrapCycle();
        render();
    });

    // Don't rotate a slide away from under keyboard focus
    carouselElement.addEventListener('focusin', () => carousel.pause());
    carouselElement.addEventListener('focusout', (e) => {
        if (!carouselElement.contains(e.relatedTarget)) setTimeout(() => carousel.cycle());
    });

    render();
    if (!userPaused) carousel.cycle();
}

setupContactForm();
setupCarousel();
