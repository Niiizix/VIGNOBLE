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
        throw new Error('Webhook Discord non configuré dans le code');
    }
    
    try {
        console.log('📤 Envoi embed Discord...');
        console.log('📊 Données reçues:', devisData);
        
        // Nettoyer et valider les données
        const clientNom = String(devisData.client.nom || 'Client').substring(0, 256);
        const numeroDevis = String(devisData.numeroDevis || 'N/A').substring(0, 50);
        const totalAmount = parseFloat(devisData.totaux.total) || 0;
        
        // Créer les fields de manière sécurisée
        const fields = [];
        
        // Field 1: Numéro
        fields.push({
            name: "📋 Numéro",
            value: numeroDevis,
            inline: true
        });
        
        // Field 2: Client  
        fields.push({
            name: "👤 Client",
            value: clientNom,
            inline: true
        });
        
        // Field 3: Total
        fields.push({
            name: "💰 Total",
            value: `$${totalAmount.toFixed(2)}`,
            inline: true
        });
        
        // Field 4: Détails client (si disponible)
        let clientDetails = '';
        if (devisData.client.email) {
            clientDetails += `📧 ${String(devisData.client.email).substring(0, 100)}\n`;
        }
        if (devisData.client.telephone) {
            clientDetails += `📞 ${String(devisData.client.telephone).substring(0, 50)}\n`;
        }
        if (devisData.client.adresse) {
            const adresse = String(devisData.client.adresse).replace(/\n/g, ', ').substring(0, 200);
            clientDetails += `📍 ${adresse}`;
        }
        
        if (clientDetails) {
            fields.push({
                name: "📇 Contact",
                value: clientDetails,
                inline: false
            });
        }
        
        // Field 5: Produits (limité et sécurisé)
        if (devisData.produits && Array.isArray(devisData.produits) && devisData.produits.length > 0) {
            let produitsText = '';
            const maxProduits = Math.min(devisData.produits.length, 5); // Max 5 produits
            
            for (let i = 0; i < maxProduits; i++) {
                const produit = devisData.produits[i];
                const nom = String(produit.nom || 'Produit').substring(0, 30);
                const qty = parseInt(produit.quantite) || 1;
                const prix = parseFloat(produit.prix) || 0;
                const total = parseFloat(produit.total) || 0;
                
                produitsText += `• ${nom} (${qty}x) - $${total.toFixed(2)}\n`;
            }
            
            if (devisData.produits.length > 5) {
                produitsText += `... et ${devisData.produits.length - 5} autres produits`;
            }
            
            // Vérifier que le texte n'est pas trop long
            if (produitsText.length > 1024) {
                produitsText = produitsText.substring(0, 1000) + '...';
            }
            
            fields.push({
                name: `🛒 Produits (${devisData.produits.length})`,
                value: produitsText,
                inline: false
            });
        }
        
        // Field 6: Totaux détaillés
        const sousTotal = parseFloat(devisData.totaux.sousTotal) || 0;
        const tva = parseFloat(devisData.totaux.tva) || 0;
        
        fields.push({
            name: "🧮 Détail",
            value: `HT: $${sousTotal.toFixed(2)}\nTVA: $${tva.toFixed(2)}\n**Total: $${totalAmount.toFixed(2)}**`,
            inline: false
        });
        
        // Créer l'embed avec limites strictes de Discord
        const embed = {
            title: "🍷 Nouveau Devis Marlowe Vineyard",
            description: `Devis généré le ${new Date().toLocaleDateString('fr-FR')}`,
            color: 0x8B5A9F,
            fields: fields,
            timestamp: new Date().toISOString(),
            footer: {
                text: "Marlowe Vineyard - Système automatisé"
            }
        };
        
        // Vérifier les limites Discord
        if (embed.title.length > 256) embed.title = embed.title.substring(0, 253) + '...';
        if (embed.description.length > 4096) embed.description = embed.description.substring(0, 4093) + '...';
        
        // Payload final
        const payload = {
            content: "📋 **Nouveau devis créé !**",
            embeds: [embed],
            username: "Marlowe Vineyard"
        };
        
        console.log('📤 Payload à envoyer:', JSON.stringify(payload, null, 2));
        
        // Envoyer avec headers corrects
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        console.log('📥 Statut réponse:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Détails erreur Discord:', errorText);
            throw new Error(`Discord API error: ${response.status} - ${errorText}`);
        }
        
        const responseData = await response.text();
        console.log('✅ Réponse Discord:', responseData);
        
        return true;
        
    } catch (error) {
        console.error('❌ Erreur complète envoi Discord:', error);
        throw error;
    }
}

// === FONCTION TÉLÉCHARGEMENT PDF LOCAL ===
async function downloadPDF(devisData) {
    try {
        console.log('📄 Génération PDF pour téléchargement...');
        
        // Générer le PDF
        const pdfDoc = await generateMarlowePDFFromTemplate(devisData);
        const pdfBytes = await pdfDoc.save();
        
        console.log('📄 PDF généré:', pdfBytes.length, 'bytes');
        
        // Créer le blob
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        
        // Nom de fichier propre
        const clientName = devisData.client.nom
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 20);
        
        const filename = `Devis_${devisData.numeroDevis}_${clientName}.pdf`;
        
        // Téléchargement automatique
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Nettoyer l'URL
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        
        console.log('✅ PDF téléchargé:', filename);
        return filename;
        
    } catch (error) {
        console.error('❌ Erreur téléchargement PDF:', error);
        throw error;
    }
}

// === FONCTION PRINCIPALE SIMPLIFIÉE ===
async function generateDevisComplete() {
    console.log('🚀 Génération complète du devis...');
    
    // Vérifications de base
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
    
    // Vérifier les produits
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
    
    // Collecter les données
    collectDevisData();
    console.log('📊 Données du devis collectées:', devisData);
    
    try {
        notify.info('Traitement en cours...', 'Génération du PDF...');
        
        // 1. Télécharger le PDF d'abord
        const filename = await downloadPDF(devisData);
        console.log('✅ PDF téléchargé:', filename);
        
        notify.info('Envoi Discord...', 'Notification en cours...');
        
        // 2. Envoyer l'embed sur Discord
        await sendEmbedToDiscord(devisData);
        console.log('✅ Discord notifié');
        
        // 3. Notification de succès
        notify.success(
            'Devis créé avec succès !', 
            `PDF téléchargé: ${filename}\nNotification Discord envoyée\nDevis ${devisData.numeroDevis} finalisé`
        );
        
        // 4. Fermer le modal après un délai
        setTimeout(() => {
            closeDevisModal();
        }, 3000);
        
    } catch (error) {
        console.error('❌ Erreur complète:', error);
        
        // Notification d'erreur détaillée
        if (error.message.includes('Discord')) {
            notify.error('Erreur Discord', 'Le PDF a été téléchargé mais la notification Discord a échoué.');
        } else {
            notify.error('Erreur de génération', error.message);
        }
    }
}
