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

/**
 * DB Manager - Gestionnaire de base de données pour Marlowe Vineyard
 * Lecture seule depuis DB.json (pas de localStorage pour la sécurité)
 */
class DatabaseManager {
    constructor() {
        this.DB_VERSION = '1.0';
        this.data = {};
        this.isReady = false;
        
        // Initialiser la base de données
        this.init();
    }

    /**
     * Initialise la base de données
     */
    async init() {
        try {
            // Charger les données depuis DB.json uniquement
            await this.loadFromJSON();
            
            this.isReady = true;
            console.log('✅ Database Manager initialisé avec succès (lecture seule)');
            console.log('📊 Données chargées:', this.data);
            
            // Mettre à jour la configuration globale
            this.updateGlobalConfig();
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation de la DB:', error);
            this.isReady = false;
        }
    }

    /**
     * Charge les données depuis DB.json
     */
    async loadFromJSON() {
        try {
            // Détecter le chemin correct selon l'emplacement de la page
            const isInSubfolder = window.location.pathname.includes('/intranet/');
            const dbPath = isInSubfolder ? '../DB.json' : './DB.json';
            
            const response = await fetch(dbPath);
            if (response.ok) {
                this.data = await response.json();
                console.log('📄 DB.json chargé avec succès depuis:', dbPath);
            } else {
                throw new Error(`Impossible de charger DB.json depuis ${dbPath}`);
            }
        } catch (error) {
            console.error('⚠️ Erreur lors du chargement de DB.json:', error);
            throw error;
        }
    }

    /**
     * Met à jour la configuration globale avec les données de la DB
     */
    updateGlobalConfig() {
        if (this.data.configuration) {
            window.globalConfig = this.data.configuration;
            console.log('⚙️ Configuration globale mise à jour depuis la DB');
        }
    }

    /**
     * Attend que la DB soit prête
     */
    async waitForReady() {
        while (!this.isReady) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return true;
    }

    // ============================================
    // GESTION DES UTILISATEURS (lecture seule)
    // ============================================

    /**
     * Obtient tous les utilisateurs
     */
    getUsers() {
        return this.data.users || {};
    }

    /**
     * Obtient un utilisateur spécifique
     */
    getUser(username) {
        return this.data.users?.[username] || null;
    }

    // ============================================
    // GESTION DE L'INVENTAIRE
    // ============================================

    /**
     * Obtient l'inventaire complet
     */
    getInventory() {
        return this.data.inventory || { matieres: {}, bouteilles: {} };
    }

    // ============================================
    // GESTION DU SYSTÈME ET GRADES
    // ============================================

    /**
     * Obtient les définitions des grades depuis la DB
     */
    getGrades() {
        return this.data.system?.grades || {
            employe: { label: "Employé", color: "#1976d2", background: "#e3f2fd" },
            manager: { label: "Manager", color: "#f57c00", background: "#fff3e0" },
            cfo: { label: "CFO", color: "#7b1fa2", background: "#f3e5f5" },
            ceo: { label: "CEO", color: "#c62828", background: "#ffebee", border: "2px solid #c62828" }
        };
    }

    /**
     * Obtient les définitions des permissions depuis la DB
     */
    getPermissions() {
        return this.data.system?.permissions || {
            dashboard: { label: "Dashboard", icon: "📊" },
            inventory: { label: "Inventaire", icon: "📦" },
            documents: { label: "Documents", icon: "📄" },
            config: { label: "Configuration", icon: "⚙️" },
            reports: { label: "Rapports", icon: "📈" },
            users: { label: "Gestion utilisateurs", icon: "👥" }
        };
    }

    /**
     * Obtient les informations d'un grade spécifique
     */
    getGradeInfo(grade) {
        const grades = this.getGrades();
        return grades[grade] || { label: grade.toUpperCase(), color: "#666", background: "#f0f0f0" };
    }

    /**
     * Obtient les informations d'une permission spécifique
     */
    getPermissionInfo(permission) {
        const permissions = this.getPermissions();
        return permissions[permission] || { label: permission, icon: "🔧" };
    }

    /**
     * Obtient la configuration complète
     */
    getConfiguration() {
        return this.data.configuration || {
            thresholds: { matieres: { critical: 50, warning: 100 }, bouteilles: { critical: 30, warning: 75 } },
            notifications: { duration: 4, soundEnabled: true },
            system: { sessionTimeout: 60, theme: 'light' }
        };
    }

    // ============================================
    // GESTION DES STATISTIQUES
    // ============================================

    /**
     * Obtient les statistiques
     */
    getStatistics() {
        return this.data.statistics || {
            sales: { monthly: 0, bottlesSold: 0, growth: 0 },
            documents: { devis: 0, factures: 0, livraisons: 0, rapports: 0 }
        };
    }

    // ============================================
    // UTILITAIRES
    // ============================================

    /**
     * Obtient les informations de la base de données
     */
    getDatabaseInfo() {
        return {
            version: this.DB_VERSION,
            lastUpdate: this.data.lastUpdate,
            usersCount: Object.keys(this.data.users || {}).length,
            dataSize: JSON.stringify(this.data).length
        };
    }
}

// Fonctions globales pour accéder aux grades et permissions
window.getGrades = function() {
    if (window.dbManager && window.dbManager.isReady) {
        return window.dbManager.getGrades();
    }
    return {};
};

window.getPermissions = function() {
    if (window.dbManager && window.dbManager.isReady) {
        return window.dbManager.getPermissions();
    }
    return {};
};

window.getGradeInfo = function(grade) {
    if (window.dbManager && window.dbManager.isReady) {
        return window.dbManager.getGradeInfo(grade);
    }
    return { label: grade.toUpperCase(), color: "#666", background: "#f0f0f0" };
};

window.getPermissionInfo = function(permission) {
    if (window.dbManager && window.dbManager.isReady) {
        return window.dbManager.getPermissionInfo(permission);
    }
    return { label: permission, icon: "🔧" };
};

// Fonctions globales pour accéder à la configuration (maintenant basées sur la DB)
window.getStockThresholds = function() {
    if (window.dbManager && window.dbManager.isReady) {
        return window.dbManager.getConfiguration().thresholds;
    }
    // Valeurs par défaut si la DB n'est pas encore prête
    return {
        matieres: { critical: 50, warning: 100 },
        bouteilles: { critical: 30, warning: 75 }
    };
};

window.getConfiguration = function() {
    if (window.dbManager && window.dbManager.isReady) {
        return window.dbManager.getConfiguration();
    }
    // Valeurs par défaut si la DB n'est pas encore prête
    return {
        thresholds: { matieres: { critical: 50, warning: 100 }, bouteilles: { critical: 30, warning: 75 } },
        notifications: { duration: 4, soundEnabled: true },
        system: { sessionTimeout: 60, theme: 'light' }
    };
};

window.updateGlobalConfig = function(newConfig) {
    // Mise à jour temporaire pour la session en cours uniquement
    Object.keys(newConfig).forEach(section => {
        if (window.globalConfig) {
            window.globalConfig[section] = { ...window.globalConfig[section], ...newConfig[section] };
        }
    });
    console.log('⚙️ Configuration mise à jour pour cette session:', newConfig);
    return true;
};

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (header) {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(139, 90, 159, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }
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

// Observe all info cards when they exist
document.addEventListener('DOMContentLoaded', function() {
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
});

// Initialiser le gestionnaire de base de données globalement
window.dbManager = new DatabaseManager();
