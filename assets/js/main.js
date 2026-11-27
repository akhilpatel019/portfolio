/*=========================================
PRELOADER
=========================================*/
document.addEventListener("DOMContentLoaded", () => {
    const preloader = document.querySelector(".preloader");
    const preloaderName = document.querySelector(".preloader-name");
    const preloaderWelcome = document.querySelector(".preloader-welcome");

    if (preloader && preloaderName && preloaderWelcome) {
        // Block scrolling while preloading
        document.body.style.overflow = "hidden";

        // 1. After 2 seconds, fade out "AKHIL"
        setTimeout(() => {
            preloaderName.classList.add("hide");
            
            // 2. Wait 800ms for the fade out to completely finish before showing welcome text
            setTimeout(() => {
                preloaderName.style.display = "none"; // forcefully remove it to prevent any overlap
                preloaderWelcome.classList.add("show");
                
                // 3. After showing welcome for a bit, slide entire preloader up
                setTimeout(() => {
                    preloader.classList.add("fade-out");
                    document.body.style.overflow = ""; // restore scroll
                    
                    // Remove from DOM eventually
                    setTimeout(() => {
                        preloader.remove();
                    }, 1200);
                }, 2000);
                
            }, 800);
            
        }, 2200);
    }
});


/*=========================================
HEADER & BACK TO TOP SCROLL
=========================================*/
const header = document.querySelector(".main-header");
const socials = document.querySelector(".fixed-socials");
const backToTop = document.querySelector(".back-to-top");

window.addEventListener("scroll", () => {

    if (window.scrollY > 50) {

        header.classList.add("scrolled");
        socials.classList.add("scrolled");

    } else {

        header.classList.remove("scrolled");
        socials.classList.remove("scrolled");

    }

    if (window.scrollY > 500) {
        if(backToTop) backToTop.classList.add("active");
    } else {
        if(backToTop) backToTop.classList.remove("active");
    }

});





/*=========================================
TYPE ANIMATION
=========================================*/
const typingText = document.querySelector(".typing-text");

const words = [
    "Frontend",
    "WordPress",
    "Shopify"
];

let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {

    const currentWord = words[wordIndex];

    if (isDeleting) {

        typingText.textContent =
            currentWord.substring(0, charIndex--);

    } else {

        typingText.textContent =
            currentWord.substring(0, charIndex++);

    }

    let speed = isDeleting ? 70 : 110;

    if (!isDeleting && charIndex === currentWord.length) {

        speed = 1800;
        isDeleting = true;

    }

    else if (isDeleting && charIndex === 0) {

        isDeleting = false;

        wordIndex = (wordIndex + 1) % words.length;

    }

    setTimeout(typeEffect, speed);

}

typeEffect();





/*=========================================
MOBILE MENU
=========================================*/
const mobileToggle = document.querySelector(".mobile-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const mobileClose = document.querySelector(".mobile-close");

mobileToggle.addEventListener("click", () => {

    mobileMenu.classList.add("active");

});

mobileClose.addEventListener("click", () => {

    mobileMenu.classList.remove("active");

});





/*=========================================
HERO RE-ANIMATION
=========================================*/
const heroElements = document.querySelectorAll(".hero-animate");

const heroObserver = new IntersectionObserver((entries) => {

    entries.forEach((entry) => {

        if (entry.isIntersecting) {

            entry.target.classList.add("active");

        } else {
            if (entry.boundingClientRect.top > 0) {
                entry.target.classList.remove("active");
            }
        }

    });

}, {
    threshold: 0.15
});

heroElements.forEach((element) => {

    heroObserver.observe(element);

});

/*=========================================
NATIVE BROWSER SCROLL
=========================================*/
// Keep native wheel/touch scrolling so the long editorial page remains direct and responsive.
const lenis = null;

/*=========================================
SCROLL SPY & MENU CLOSE
=========================================*/
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".desktop-menu ul li a, .mobile-menu ul li a");

window.addEventListener("scroll", () => {
    let current = "";

    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        
        // Subtract a bit so it triggers before perfectly reaching the top
        if (window.scrollY >= sectionTop - 250) {
            current = section.getAttribute("id");
        }
    });

    navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${current}`) {
            link.classList.add("active");
        }
    });
});

// Close mobile menu and scroll smoothly on nav clicks
const scrollLinks = document.querySelectorAll('a[href^="#"]');
scrollLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");
        if (href && href !== "#") {
            const target = document.querySelector(href);
            if (target) {
                event.preventDefault();
                mobileMenu.classList.remove("active");
                if (lenis) {
                    lenis.scrollTo(target, { offset: -60, duration: 1.2 });
                } else {
                    const offsetTop = target.offsetTop - 60;
                    window.scrollTo({ top: offsetTop, behavior: 'smooth' });
                }
            }
        }
    });
});

/*=========================================
CUSTOM CURSOR
=========================================*/
if (window.matchMedia("(pointer: fine)").matches && window.innerWidth > 992) {
    const customCursor = document.createElement("div");
    customCursor.classList.add("custom-cursor");
    const cursorDot = document.createElement("div");
    cursorDot.classList.add("custom-cursor-dot");
    const cursorRing = document.createElement("div");
    cursorRing.classList.add("custom-cursor-ring");
    customCursor.append(cursorRing, cursorDot);
    document.body.appendChild(customCursor);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let isCursorVisible = false;

    window.addEventListener("mousemove", (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;

        if (!isCursorVisible) {
            customCursor.style.opacity = "1";
            isCursorVisible = true;
        }
    });

    window.addEventListener("mouseout", () => {
        customCursor.style.opacity = "0";
        isCursorVisible = false;
    });

    window.addEventListener("mousedown", () => {
        customCursor.classList.add("cursor-clicked");
    });

    window.addEventListener("mouseup", () => {
        customCursor.classList.remove("cursor-clicked");
    });

    function animateCursorRing() {
        ringX += (mouseX - ringX) * 0.16;
        ringY += (mouseY - ringY) * 0.16;
        cursorRing.style.left = `${ringX}px`;
        cursorRing.style.top = `${ringY}px`;
        requestAnimationFrame(animateCursorRing);
    }
    animateCursorRing();

    const cursorHoverItems = document.querySelectorAll("a, button, .project-link, .hero-cv-btn, .mobile-toggle");
    cursorHoverItems.forEach((item) => {
        item.addEventListener("mouseenter", () => {
            customCursor.classList.add("cursor-hover");
        });
        item.addEventListener("mouseleave", () => {
            customCursor.classList.remove("cursor-hover");
        });
    });
}

/*=========================================
DARK MODE TOGGLE
=========================================*/
const themeToggle = document.querySelector('.theme-toggle');

if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        if (document.body.classList.contains('dark-theme')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    });
}

/*=========================================
IMAGE PARALLAX ON SCROLL
=========================================*/
const parallaxImages = document.querySelectorAll('.hero-image-wrapper img');

if (lenis) {
    lenis.on('scroll', (e) => {
        parallaxImages.forEach(img => {
            const speed = 0.15;
            const rect = img.parentElement.getBoundingClientRect();
            // Check if element is in viewport
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const yPos = (rect.top - window.innerHeight / 2) * speed;
                img.style.transform = `translateY(${yPos}px)`;
            }
        });
    });
} else {
    window.addEventListener('scroll', () => {
        parallaxImages.forEach(img => {
            const speed = 0.15;
            const rect = img.parentElement.getBoundingClientRect();
            // Check if element is in viewport
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const yPos = (rect.top - window.innerHeight / 2) * speed;
                img.style.transform = `translateY(${yPos}px)`;
            }
        });
    });
}

/*=========================================
PROJECT CARDS 3D PERSPECTIVE TILT
=========================================*/
const projectCards = document.querySelectorAll('.project-card');

if (window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    projectCards.forEach(card => {
        let bounds = null;

        card.addEventListener('mouseenter', () => {
            bounds = card.getBoundingClientRect();
        });

        card.addEventListener('mousemove', (e) => {
            if (!bounds) bounds = card.getBoundingClientRect();
            const mouseX = e.clientX - bounds.left;
            const mouseY = e.clientY - bounds.top;

            const xPct = Math.max(0, Math.min(1, mouseX / bounds.width));
            const yPct = Math.max(0, Math.min(1, mouseY / bounds.height));

            // Subtle 3D tilt: max 6 degrees
            const rotateX = ((0.5 - yPct) * 12).toFixed(2);
            const rotateY = ((xPct - 0.5) * 12).toFixed(2);

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
            card.style.setProperty('--mouse-x', `${(xPct * 100).toFixed(1)}%`);
            card.style.setProperty('--mouse-y', `${(yPct * 100).toFixed(1)}%`);
        }, { passive: true });

        card.addEventListener('mouseleave', () => {
            bounds = null;
            card.style.transform = '';
        });
    });
}