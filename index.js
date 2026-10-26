const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.getElementById("navMenu");
const navLinks = document.querySelectorAll(".nav-link");

function closeMenu() {
    if (!menuToggle || !navMenu) return;
    navMenu.classList.remove("show");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
}

if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
        const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
        menuToggle.setAttribute("aria-expanded", String(!isOpen));
        menuToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
        navMenu.classList.toggle("show", !isOpen);
    });

    navLinks.forEach(link => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") closeMenu();
    });
}

const themeToggle = document.querySelector(".theme-toggle");
if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const isLight = document.body.dataset.theme === "light";
        document.body.dataset.theme = isLight ? "dark" : "light";
        themeToggle.setAttribute("aria-pressed", String(!isLight));
        themeToggle.setAttribute("aria-label", isLight ? "Switch to light theme" : "Switch to dark theme");
        themeToggle.innerHTML = `<i class="bx ${isLight ? "bx-sun" : "bx-moon"}" aria-hidden="true"></i>`;
    });
}

const sections = [...document.querySelectorAll("main section[id]")];
const progressBar = document.getElementById("scrollProgress");
let scrollScheduled = false;

function updateScrollState() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    if (progressBar) progressBar.style.width = `${Math.min(progress, 100)}%`;

    let activeSection = sections[0]?.id;
    sections.forEach(section => {
        if (section.getBoundingClientRect().top <= 150) activeSection = section.id;
    });

    navLinks.forEach(link => {
        const isActive = link.getAttribute("href") === `#${activeSection}`;
        link.classList.toggle("active", isActive);
        if (isActive) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
    });
    scrollScheduled = false;
}

window.addEventListener("scroll", () => {
    if (scrollScheduled) return;
    scrollScheduled = true;
    window.requestAnimationFrame(updateScrollState);
}, { passive: true });

updateScrollState();

document.querySelectorAll("[data-skill-filter]").forEach(button => {
    button.addEventListener("click", () => {
        const filter = button.dataset.skillFilter;
        document.querySelectorAll("[data-skill-filter]").forEach(item => {
            const selected = item === button;
            item.classList.toggle("active", selected);
            item.setAttribute("aria-pressed", String(selected));
        });
        document.querySelectorAll(".skill-card").forEach(card => {
            card.hidden = filter !== "all" && card.dataset.skillCategory !== filter;
        });
    });
});

const projectCards = [...document.querySelectorAll(".project-card")];
const emptyProjects = document.querySelector(".filter-empty");

document.querySelectorAll("[data-project-filter]").forEach(button => {
    button.addEventListener("click", () => {
        const filter = button.dataset.projectFilter;
        let visibleCount = 0;
        document.querySelectorAll("[data-project-filter]").forEach(item => {
            const selected = item === button;
            item.classList.toggle("active", selected);
            item.setAttribute("aria-pressed", String(selected));
        });
        projectCards.forEach(card => {
            const matches = filter === "all" || card.dataset.projectCategories.split(" ").includes(filter);
            card.hidden = !matches;
            if (matches) visibleCount += 1;
        });
        if (emptyProjects) emptyProjects.hidden = visibleCount > 0;
    });
});

const projectModal = document.getElementById("projectModal");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");
const modalCategory = document.getElementById("modalCategory");
const modalList = document.getElementById("modalList");
const modalLink = document.getElementById("modalLink");
const modalCloseButton = document.querySelector(".modal-close");
let modalReturnFocus = null;

function openProjectModal(trigger) {
    if (!projectModal || !modalImage || !modalTitle || !modalText || !modalCategory || !modalList || !modalLink) return;
    modalReturnFocus = trigger;
    modalTitle.textContent = trigger.dataset.title || "Project details";
    modalText.textContent = trigger.dataset.text || "";
    modalImage.src = trigger.dataset.image || "";
    modalImage.alt = trigger.dataset.title || "Project preview";
    modalCategory.textContent = trigger.dataset.category || "";
    modalList.replaceChildren();
    (trigger.dataset.tools || "").split(",").filter(Boolean).forEach(tool => {
        const item = document.createElement("li");
        item.textContent = tool.trim();
        modalList.append(item);
    });

    const link = trigger.dataset.link;
    modalLink.hidden = !link || link === "#";
    if (link && link !== "#") modalLink.href = link;

    projectModal.classList.add("open");
    projectModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    modalCloseButton?.focus();
}

function closeProjectModal() {
    if (!projectModal) return;
    projectModal.classList.remove("open");
    projectModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    modalReturnFocus?.focus();
}

document.querySelectorAll(".project-trigger, .certificate-trigger").forEach(trigger => {
    trigger.addEventListener("click", () => openProjectModal(trigger));
});

document.querySelectorAll("[data-close-modal]").forEach(button => {
    button.addEventListener("click", closeProjectModal);
});

document.addEventListener("keydown", event => {
    if (!projectModal?.classList.contains("open")) return;
    if (event.key === "Escape") {
        closeProjectModal();
        return;
    }
    if (event.key !== "Tab") return;

    const focusable = [...projectModal.querySelectorAll('a[href]:not([hidden]), button:not([disabled]):not([tabindex="-1"])')];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
});

const contactForm = document.querySelector(".contact-form");
const formFeedback = document.getElementById("formFeedback");
const whatsappContinue = document.getElementById("whatsappContinue");

if (contactForm && formFeedback && whatsappContinue) {
    contactForm.addEventListener("submit", event => {
        event.preventDefault();
        if (!contactForm.reportValidity()) return;

        const formData = new FormData(contactForm);
        const name = String(formData.get("name") || "").trim();
        const email = String(formData.get("email") || "").trim();
        const message = String(formData.get("message") || "").trim();
        if (!name || !email || !message) {
            formFeedback.textContent = "Please complete each field before continuing.";
            whatsappContinue.hidden = true;
            return;
        }

        const text = `Hello, I'm ${name} (${email}). ${message}`;
        whatsappContinue.href = `https://wa.me/971545421269?text=${encodeURIComponent(text)}`;
        whatsappContinue.hidden = false;
        formFeedback.textContent = "Your message is ready. Continue to WhatsApp to send it.";
        whatsappContinue.focus();
    });
}

const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if ("IntersectionObserver" in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("show-animation");
            revealObserver.unobserve(entry.target);
        });
    }, { threshold: 0.12 });

    document.querySelectorAll(".section-heading, .about-content, .skill-card, .project-card, .timeline-item, .contact-panel").forEach(item => {
        item.classList.add("reveal");
        revealObserver.observe(item);
    });
}
