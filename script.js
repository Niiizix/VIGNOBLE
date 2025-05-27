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
 * Gère la persistance des données via localStorage et fichiers JSON
 */
class DatabaseManager {
    constructor() {
        this.DB_KEY = 'marlowe_vineyard_db';
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
            // Charger les données depuis DB.json
            await this.loadFromJSON();
            
            // Charger les données existantes de localStorage ou utiliser celles de DB.json
            this.loadFromStorage();
            
            this.isReady = true;
            console.log('✅ Database Manager initialisé avec succès');
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
            const response = await fetch('./DB.json');
            if (response.ok) {
                this.data = await response.json();
                console.log('📄 DB.json chargé avec succès');
            } else {
                throw new Error('Impossible de charger DB.json');
            }
        } catch (error) {
            console.error('⚠️ Erreur lors du chargement de DB.json:', error);
            throw error;
        }
    }

    /**
     * Charge les données depuis localStorage (si elles existent et sont plus récentes)
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.DB_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                
                // Vérifier si les données localStorage sont plus récentes
                const storedDate = new Date(parsed.lastUpdate || 0);
                const jsonDate = new Date(this.data.lastUpdate || 0);
                
                if (storedDate > jsonDate) {
                    console.log('💾 Utilisation des données localStorage (plus récentes)');
                    this.data = parsed;
                } else {
                    console.log('📄 Utilisation des données DB.json (plus récentes)');
                    // Sauvegarder les données JSON dans localStorage
                    this.saveToStorage();
                }
            } else {
                console.log('📄 Première utilisation - sauvegarde de DB.json dans localStorage');
                this.saveToStorage();
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement depuis localStorage:', error);
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
     * Sauvegarde les données dans localStorage
     */
    saveToStorage() {
        try {
            this.data.lastUpdate = new Date().toISOString();
            localStorage.setItem(this.DB_KEY, JSON.stringify(this.data));
            console.log('💾 Données sauvegardées avec succès');
            
            // Mettre à jour la configuration globale
            this.updateGlobalConfig();
            return true;
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde:', error);
            return false;
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
    // GESTION DES UTILISATEURS
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

    /**
     * Ajoute ou met à jour un utilisateur
     */
    saveUser(username, userData) {
        if (!this.data.users) this.data.users = {};
        
        this.data.users[username] = {
            ...userData,
            lastModified: new Date().toISOString()
        };
        
        const saved = this.saveToStorage();
        if (saved) {
            console.log(`👤 Utilisateur ${username} sauvegardé avec succès`);
        }
        return saved;
    }

    /**
     * Supprime un utilisateur
     */
    deleteUser(username) {
        if (username === 'admin') {
            console.error('❌ Impossible de supprimer l\'administrateur');
            return false;
        }

        if (this.data.users?.[username]) {
            delete this.data.users[username];
            const saved = this.saveToStorage();
            if (saved) {
                console.log(`🗑️ Utilisateur ${username} supprimé avec succès`);
            }
            return saved;
        }
        return false;
    }

    /**
     * Met à jour le statut de connexion d'un utilisateur
     */
    updateUserStatus(username, status, lastLogin = null) {
        const user = this.getUser(username);
        if (user) {
            user.status = status;
            if (lastLogin) user.lastLogin = lastLogin;
            return this.saveUser(username, user);
        }
        return false;
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

    /**
     * Met à jour le stock d'un produit
     */
    updateStock(category, productId, newStock) {
        if (!this.data.inventory) this.data.inventory = { matieres: {}, bouteilles: {} };
        if (!this.data.inventory[category]) this.data.inventory[category] = {};

        if (this.data.inventory[category][productId]) {
            this.data.inventory[category][productId].stock = newStock;
            const saved = this.saveToStorage();
            if (saved) {
                console.log(`📦 Stock mis à jour: ${productId} = ${newStock}`);
            }
            return saved;
        }
        return false;
    }

    // ============================================
    // GESTION DE LA CONFIGURATION
    // ============================================

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

    /**
     * Met à jour la configuration
     */
    updateConfiguration(configSection, newConfig) {
        if (!this.data.configuration) this.data.configuration = {};
        
        this.data.configuration[configSection] = {
            ...this.data.configuration[configSection],
            ...newConfig
        };

        const saved = this.saveToStorage();
        if (saved) {
            console.log(`⚙️ Configuration ${configSection} mise à jour`);
        }
        return saved;
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

    /**
     * Met à jour les statistiques
     */
    updateStatistics(section, newStats) {
        if (!this.data.statistics) this.data.statistics = {};
        
        this.data.statistics[section] = {
            ...this.data.statistics[section],
            ...newStats
        };

        return this.saveToStorage();
    }

    // ============================================
    // UTILITAIRES
    // ============================================

    /**
     * Exporte toutes les données en JSON
     */
    exportData() {
        const dataToExport = {
            ...this.data,
            exportDate: new Date().toISOString(),
            version: this.DB_VERSION
        };

        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `marlowe_vineyard_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('📤 Données exportées avec succès');
        return true;
    }

    /**
     * Importe des données depuis un fichier JSON
     */
    async importData(file) {
        try {
            const text = await file.text();
            const importedData = JSON.parse(text);
            
            // Validation basique
            if (importedData.users && typeof importedData.users === 'object') {
                this.data = {
                    ...importedData,
                    lastUpdate: new Date().toISOString()
                };
                
                const saved = this.saveToStorage();
                if (saved) {
                    console.log('📥 Données importées avec succès');
                    return true;
                }
            } else {
                throw new Error('Format de fichier invalide');
            }
        } catch (error) {
            console.error('❌ Erreur lors de l\'import:', error);
            return false;
        }
    }

    /**
     * Remet à zéro toutes les données (recharge depuis DB.json)
     */
    async resetDatabase() {
        try {
            await this.loadFromJSON();
            const saved = this.saveToStorage();
            if (saved) {
                console.log('🔄 Base de données réinitialisée depuis DB.json');
            }
            return saved;
        } catch (error) {
            console.error('❌ Erreur lors de la réinitialisation:', error);
            return false;
        }
    }

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
    if (window.dbManager && window.dbManager.isReady) {
        // Mettre à jour chaque section de configuration
        Object.keys(newConfig).forEach(section => {
            window.dbManager.updateConfiguration(section, newConfig[section]);
        });
        return true;
    }
    return false;
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
