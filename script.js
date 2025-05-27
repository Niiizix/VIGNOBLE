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

/**
 * DB Manager - Gestionnaire de base de données pour Marlowe Vineyard
 * Gère la persistance des données via localStorage et fichiers JSON
 */

class DatabaseManager {
    constructor() {
        this.DB_KEY = 'marlowe_vineyard_db';
        this.DB_VERSION = '1.0';
        this.defaultData = null;
        this.data = {};
        
        // Initialiser la base de données
        this.init();
    }

    /**
     * Initialise la base de données
     */
    async init() {
        try {
            // Charger les données par défaut depuis DB.json
            await this.loadDefaultData();
            
            // Charger les données existantes ou utiliser les valeurs par défaut
            this.loadFromStorage();
            
            console.log('✅ Database Manager initialisé avec succès');
            console.log('📊 Données chargées:', this.data);
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation de la DB:', error);
            this.data = this.getDefaultData();
        }
    }

    /**
     * Charge les données par défaut depuis DB.json
     */
    async loadDefaultData() {
        try {
            const response = await fetch('./DB.json');
            if (response.ok) {
                this.defaultData = await response.json();
            } else {
                throw new Error('Impossible de charger DB.json');
            }
        } catch (error) {
            console.warn('⚠️ DB.json non trouvé, utilisation des données par défaut');
            this.defaultData = this.getDefaultData();
        }
    }

    /**
     * Retourne la structure de données par défaut
     */
    getDefaultData() {
        return {
            users: {
                admin: {
                    fullname: 'Christopher Marlowe',
                    phone: '+1 (555) 001-0001',
                    grade: 'ceo',
                    description: 'Administrateur principal',
                    password: 'MW2025',
                    status: 'online',
                    lastLogin: 'Maintenant',
                    permissions: ['dashboard', 'inventory', 'documents', 'config', 'reports', 'users'],
                    address: '1247 Vinewood Hills Drive, Los Santos, CA 90210',
                    hireDate: '2020-01-15',
                    department: 'direction',
                    salary: 250000,
                    manager: '',
                    notes: 'Fondateur et PDG de Marlowe Vineyard'
                }
            },
            inventory: {
                matieres: {},
                bouteilles: {}
            },
            configuration: {
                thresholds: {
                    matieres: { critical: 50, warning: 100 },
                    bouteilles: { critical: 30, warning: 75 }
                },
                notifications: { duration: 4, soundEnabled: true },
                system: { sessionTimeout: 60, theme: 'light' }
            },
            statistics: {
                sales: { monthly: 0, bottlesSold: 0, growth: 0 },
                documents: { devis: 0, factures: 0, livraisons: 0, rapports: 0 }
            },
            lastUpdate: new Date().toISOString()
        };
    }

    /**
     * Charge les données depuis localStorage
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.DB_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                this.data = { ...this.defaultData, ...parsed };
            } else {
                this.data = this.defaultData;
                this.saveToStorage();
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement depuis localStorage:', error);
            this.data = this.defaultData;
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
            return true;
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde:', error);
            return false;
        }
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
                    ...this.defaultData,
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
     * Remet à zéro toutes les données
     */
    resetDatabase() {
        this.data = this.defaultData;
        const saved = this.saveToStorage();
        if (saved) {
            console.log('🔄 Base de données réinitialisée');
        }
        return saved;
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

// Initialiser le gestionnaire de base de données globalement
window.dbManager = new DatabaseManager();
