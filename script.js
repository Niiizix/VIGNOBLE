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
 * Lecture seule pour les utilisateurs, sauvegarde pour l'inventaire uniquement
 */
class DatabaseManager {
    constructor() {
        this.DB_VERSION = '1.0';
        this.INVENTORY_KEY = 'marlowe_inventory';
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
            
            // Initialiser l'inventaire localStorage (vide au début)
            this.initInventory();
            
            this.isReady = true;
            console.log('✅ Database Manager initialisé avec succès');
            console.log('📊 Données chargées:', this.data);
            console.log('📦 Inventaire localStorage prêt');
            
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
            const currentPath = window.location.pathname;
            const isInIntranet = currentPath.includes('/intranet/');
            const isInPublic = currentPath.includes('/public/');
            
            let dbPath;
            if (isInIntranet) {
                // Si on est dans /intranet/, on remonte d'un niveau
                dbPath = '../DB.json';
            } else if (isInPublic) {
                // Si on est dans /public/, on remonte d'un niveau
                dbPath = '../DB.json';
            } else {
                // Si on est à la racine
                dbPath = './DB.json';
            }
            
            console.log('🔍 Chemin détecté:', currentPath);
            console.log('🔍 Tentative de chargement DB depuis:', dbPath);
            
            const response = await fetch(dbPath);
            if (response.ok) {
                this.data = await response.json();
                // Ne PAS charger l'inventaire depuis JSON - il sera géré par localStorage uniquement
                delete this.data.inventory;
                console.log('📄 DB.json chargé avec succès depuis:', dbPath, '(sans inventaire)');
            } else {
                throw new Error(`Impossible de charger DB.json depuis ${dbPath} (HTTP ${response.status})`);
            }
        } catch (error) {
            console.error('⚠️ Erreur lors du chargement de DB.json:', error);
            throw error;
        }
    }

    /**
     * Initialise l'inventaire localStorage
     */
    initInventory() {
        try {
            const storedInventory = localStorage.getItem(this.INVENTORY_KEY);
            if (!storedInventory) {
                // Créer un inventaire vide
                const emptyInventory = {
                    matieres: {},
                    bouteilles: {}
                };
                this.data.inventory = emptyInventory;
                this.saveInventoryToStorage();
                console.log('📦 Inventaire vide initialisé');
            } else {
                const parsed = JSON.parse(storedInventory);
                this.data.inventory = parsed.inventory;
                console.log('📦 Inventaire chargé depuis localStorage');
            }
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation inventaire:', error);
            this.data.inventory = { matieres: {}, bouteilles: {} };
        }
    }

    /**
     * Sauvegarde l'inventaire dans localStorage
     */
    saveInventoryToStorage() {
        try {
            const inventoryData = {
                inventory: this.data.inventory,
                lastUpdate: new Date().toISOString()
            };
            localStorage.setItem(this.INVENTORY_KEY, JSON.stringify(inventoryData));
            console.log('💾 Inventaire sauvegardé avec succès');
            return true;
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde inventaire:', error);
            return false;
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
    // GESTION DE L'INVENTAIRE (avec sauvegarde)
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
            const saved = this.saveInventoryToStorage();
            if (saved) {
                console.log(`📦 Stock mis à jour: ${productId} = ${newStock}`);
            }
            return saved;
        }
        return false;
    }

    /**
     * Ajoute un nouveau produit à l'inventaire
     */
    addProduct(category, productId, productData) {
        if (!this.data.inventory) this.data.inventory = { matieres: {}, bouteilles: {} };
        if (!this.data.inventory[category]) this.data.inventory[category] = {};

        this.data.inventory[category][productId] = productData;
        const saved = this.saveInventoryToStorage();
        if (saved) {
            console.log(`📦 Produit ajouté: ${productId}`, productData);
        }
        return saved;
    }

    /**
     * Supprime un produit de l'inventaire
     */
    removeProduct(category, productId) {
        if (this.data.inventory?.[category]?.[productId]) {
            delete this.data.inventory[category][productId];
            const saved = this.saveInventoryToStorage();
            if (saved) {
                console.log(`📦 Produit supprimé: ${productId}`);
            }
            return saved;
        }
        return false;
    }

    /**
     * Exporte l'inventaire mis à jour
     */
    exportInventory() {
        const inventoryData = {
            inventory: this.data.inventory,
            lastUpdate: new Date().toISOString(),
            version: this.DB_VERSION
        };

        const blob = new Blob([JSON.stringify(inventoryData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `marlowe_inventory_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('📤 Inventaire exporté avec succès');
        return true;
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
    return {
        thresholds: { matieres: { critical: 50, warning: 100 }, bouteilles: { critical: 30, warning: 75 } }
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

// === FONCTION ENVOI DISCORD SIMPLIFIÉ (EMBED SEULEMENT) ===
async function sendEmbedToDiscord(devisData) {
    if (!DISCORD_WEBHOOK_URL || DISCORD_WEBHOOK_URL.includes('VOTRE_WEBHOOK_URL_ICI')) {
        throw new Error('Webhook Discord non configuré');
    }
    
    try {
        console.log('📤 Envoi embed Discord...');
        
        // Nettoyer et sécuriser les données
        const safeData = {
            numero: String(devisData.numeroDevis || 'N/A').replace(/[^\w\-]/g, ''),
            client: String(devisData.client?.nom || 'Client').replace(/[^\w\s\-\.]/g, '').substring(0, 50),
            total: parseFloat(devisData.totaux?.total || 0),
            sousTotal: parseFloat(devisData.totaux?.sousTotal || 0),
            tva: parseFloat(devisData.totaux?.tva || 0),
            email: String(devisData.client?.email || '').replace(/[^\w@.\-]/g, '').substring(0, 50),
            telephone: String(devisData.client?.telephone || '').replace(/[^\w\s\-\+\(\)]/g, '').substring(0, 20),
            adresse: String(devisData.client?.adresse || '').replace(/[^\w\s\-\.,\n]/g, '').substring(0, 100)
        };
        
        // Construire les fields
        const fields = [
            {
                name: "📋 Numéro de devis",
                value: safeData.numero,
                inline: true
            },
            {
                name: "👤 Client",
                value: safeData.client,
                inline: true
            },
            {
                name: "💰 Total TTC",
                value: `**$${safeData.total.toFixed(2)}**`,
                inline: true
            }
        ];
        
        // Informations de contact (si disponibles)
        let contactInfo = '';
        if (safeData.adresse) {
            contactInfo += `📍 ${safeData.adresse.replace(/\n/g, ', ')}\n`;
        }
        if (safeData.email) {
            contactInfo += `📧 ${safeData.email}\n`;
        }
        if (safeData.telephone) {
            contactInfo += `📞 ${safeData.telephone}`;
        }
        
        if (contactInfo.trim()) {
            fields.push({
                name: "📇 Informations client",
                value: contactInfo.trim(),
                inline: false
            });
        }
        
        // Liste des produits (sécurisée)
        if (devisData.produits && Array.isArray(devisData.produits) && devisData.produits.length > 0) {
            let produitsText = '';
            const maxProduits = Math.min(devisData.produits.length, 5); // Limiter à 5 produits
            
            for (let i = 0; i < maxProduits; i++) {
                const p = devisData.produits[i];
                const nom = String(p.nom || 'Produit').replace(/[^\w\s\-]/g, '').substring(0, 30);
                const qty = parseInt(p.quantite) || 1;
                const total = parseFloat(p.total) || 0;
                
                produitsText += `• **${nom}** × ${qty} → $${total.toFixed(2)}\n`;
            }
            
            if (devisData.produits.length > 5) {
                produitsText += `... et **${devisData.produits.length - 5} autres produits**`;
            }
            
            // Vérifier que le texte n'est pas trop long
            if (produitsText.length > 950) {
                produitsText = produitsText.substring(0, 950) + '...';
            }
            
            fields.push({
                name: `🍷 Produits commandés (${devisData.produits.length})`,
                value: produitsText,
                inline: false
            });
        }
        
        // Détail des montants
        fields.push({
            name: "🧮 Détail financier",
            value: `Sous-total HT: $${safeData.sousTotal.toFixed(2)}\n` +
                   `TVA (21%): $${safeData.tva.toFixed(2)}\n` +
                   `**Total TTC: $${safeData.total.toFixed(2)}**`,
            inline: false
        });
        
        // Créer l'embed final
        const embed = {
            title: "🍷 Nouveau Devis - Marlowe Vineyard",
            description: `Devis généré automatiquement le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}`,
            color: 0x8B5A9F,
            fields: fields,
            timestamp: new Date().toISOString(),
            footer: {
                text: "Marlowe Vineyard • Système de gestion automatisé"
            }
        };
        
        // Payload final
        const payload = {
            content: "📋 **Nouveau devis créé !**\n*Le fichier PDF a été téléchargé automatiquement sur le poste de travail.*",
            embeds: [embed],
            username: "Marlowe Vineyard"
        };
        
        console.log('📤 Envoi vers Discord...');
        
        // Envoyer l'embed
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erreur Discord:', response.status, errorText);
            throw new Error(`Discord API error: ${response.status} - ${errorText}`);
        }
        
        console.log('✅ Embed envoyé avec succès sur Discord');
        return true;
        
    } catch (error) {
        console.error('❌ Erreur envoi Discord:', error);
        throw error;
    }
}

// === FONCTION TÉLÉCHARGEMENT PDF (INCHANGÉE) ===
async function downloadPDF(devisData) {
    try {
        console.log('📄 Génération PDF pour téléchargement...');
        
        const pdfDoc = await generateMarlowePDFFromTemplate(devisData);
        const pdfBytes = await pdfDoc.save();
        
        console.log('📄 PDF généré:', pdfBytes.length, 'bytes');
        
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        
        const clientName = devisData.client.nom
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 20);
        
        const filename = `Devis_${devisData.numeroDevis}_${clientName}.pdf`;
        
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        
        console.log('✅ PDF téléchargé:', filename);
        return filename;
        
    } catch (error) {
        console.error('❌ Erreur téléchargement PDF:', error);
        throw error;
    }
}

// === FONCTION PRINCIPALE (INCHANGÉE) ===
async function generateDevisComplete() {
    console.log('🚀 Génération complète du devis...');
    
    if (!document.getElementById('client-nom').value.trim()) {
        notify.error('Formulaire incomplet', 'Le nom du client est requis.');
        return;
    }
    
    if (!document.getElementById('client-adresse').value.trim()) {
        notify.error('Formulaire incomplet', 'L\'adresse du client est requise.');
        return;
    }
    
    if (!templatePDF) {
        notify.error('Template manquant', 'Le template PDF n\'est pas chargé.');
        return;
    }
    
    let hasValidProducts = false;
    document.querySelectorAll('.product-line').forEach(line => {
        const id = line.dataset.id;
        const select = document.querySelector(`select[data-id="${id}"]`);
        if (select && select.value) hasValidProducts = true;
    });
    
    if (!hasValidProducts) {
        notify.error('Aucun produit', 'Veuillez sélectionner au moins un produit.');
        return;
    }
    
    collectDevisData();
    console.log('📊 Données du devis:', devisData);
    
    try {
        notify.info('Traitement en cours...', 'Génération du PDF...');
        
        const filename = await downloadPDF(devisData);
        console.log('✅ PDF téléchargé:', filename);
        
        notify.info('Notification Discord...', 'Envoi en cours...');
        
        await sendEmbedToDiscord(devisData);
        console.log('✅ Discord notifié');
        
        notify.success(
            'Devis créé avec succès !', 
            `• PDF téléchargé: ${filename}\n• Notification Discord envoyée\n• Devis ${devisData.numeroDevis} finalisé`
        );
        
        setTimeout(() => closeDevisModal(), 3000);
        
    } catch (error) {
        console.error('❌ Erreur complète:', error);
        
        if (error.message.includes('Discord')) {
            notify.error('Erreur Discord', 'Le PDF a été téléchargé mais l\'envoi Discord a échoué. Vérifiez la console.');
        } else {
            notify.error('Erreur de génération', error.message);
        }
    }
}
