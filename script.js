// Language translations
const translations = {
    en: {
        flag: 'https://flagcdn.com/w40/gb.png',
        alt: 'English'
    },
    fr: {
        flag: 'https://flagcdn.com/w40/fr.png',
        alt: 'Français'
    }
};

// Current language
let currentLang = 'fr';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        updateThemeIcon('light');
    }

    // Load saved language
    const savedLang = localStorage.getItem('language') || 'fr';
    currentLang = savedLang;
    updateLanguage(currentLang);

    // Event listeners
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('langToggle').addEventListener('click', toggleLanguage);

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});

// Toggle theme
function toggleTheme() {
    const body = document.body;
    const isLight = body.classList.contains('light-mode');

    if (isLight) {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
        updateThemeIcon('dark');
    } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
        updateThemeIcon('light');
    }
}

// Update theme icon
function updateThemeIcon(theme) {
    const icon = document.querySelector('#themeToggle i');
    if (theme === 'dark') {
        icon.className = 'fas fa-moon';
    } else {
        icon.className = 'fas fa-sun';
    }
}

// Toggle language
function toggleLanguage() {
    currentLang = currentLang === 'fr' ? 'en' : 'fr';
    updateLanguage(currentLang);
    localStorage.setItem('language', currentLang);
}

// Update language
function updateLanguage(lang) {
    const flagIcon = document.getElementById('flagIcon');
    flagIcon.src = translations[lang].flag;
    flagIcon.alt = translations[lang].alt;

    // Update all elements with data-en and data-fr attributes
    document.querySelectorAll('[data-en][data-fr]').forEach(element => {
        const text = element.getAttribute(`data-${lang}`);

        // Check if the content contains HTML (like lists)
        if (text.trim().startsWith('<')) {
            element.innerHTML = text;
        } else {
            element.textContent = text;
        }
    });
}

// Add scroll animation
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('.doc-section');
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight - 100;

        if (isVisible) {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }
    });
});

// Initialize section animations
document.querySelectorAll('.doc-section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
});

// Trigger initial animation check
window.dispatchEvent(new Event('scroll'));
