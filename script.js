/* === SCRIPT.JS === */

// Système de notifications
class NotificationSystem {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Créer le conteneur de notifications s'il n'existe pas
        if (!document.querySelector('.notifications-container')) {
            this.container = document.createElement('div');
            this.container.className = 'notifications-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.querySelector('.notifications-container');
        }
    }

    show(type, title, message, duration = 4000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        notification.innerHTML = `
            <i class="notification-icon ${icons[type]}"></i>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <span class="notification-close">&times;</span>
        `;

        // Ajouter la notification au conteneur
        this.container.appendChild(notification);

        // Gestion de la fermeture manuelle
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.remove(notification);
        });

        // Fermeture automatique
        setTimeout(() => {
            this.remove(notification);
        }, duration);

        // Retourner la notification pour pouvoir la manipuler si besoin
        return notification;
    }

    remove(notification) {
        notification.classList.add('removing');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    success(title, message, duration) {
        return this.show('success', title, message, duration);
    }

    error(title, message, duration) {
        return this.show('error', title, message, duration);
    }

    warning(title, message, duration) {
        return this.show('warning', title, message, duration);
    }

    info(title, message, duration) {
        return this.show('info', title, message, duration);
    }
}

// Initialiser le système de notifications globalement
const notify = new NotificationSystem();

// Configuration globale par défaut (peut être surchargée par la page de configuration)
window.globalConfig = {
    thresholds: {
        matieres: {
            critical: 50,
            warning: 100
        },
        bouteilles: {
            critical: 30,
            warning: 75
        }
    },
    notifications: {
        duration: 4,
        soundEnabled: true
    },
    system: {
        sessionTimeout: 60,
        theme: 'light'
    }
};

// Fonctions globales pour accéder à la configuration
window.getStockThresholds = function() {
    return window.globalConfig.thresholds;
};

window.getConfiguration = function() {
    return window.globalConfig;
};

window.updateGlobalConfig = function(newConfig) {
    window.globalConfig = { ...window.globalConfig, ...newConfig };
};

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(139, 90, 159, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add animation on scroll for info cards
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
        }
    });
}, observerOptions);

// Observe all info cards
document.querySelectorAll('.info-card').forEach(card => {
    observer.observe(card);
});

// Add some interactive hover effects
document.querySelectorAll('.info-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-15px) scale(1.02)';
        this.style.background = '#ffffff';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
        this.style.background = '#f8f9fa';
    });
});

// Dynamic bubbles movement
const particles = document.querySelectorAll('.particle');
particles.forEach((particle, index) => {
    particle.style.animationDuration = (6 + Math.random() * 6) + 's';
    particle.style.animationDelay = (Math.random() * 3) + 's';
});

console.log('Marlowe Vineyard website loaded successfully!');