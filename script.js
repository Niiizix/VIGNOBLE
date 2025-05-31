// === SETUP EVENT LISTENERS ===

PageManager.prototype.setupLogoutButton = function() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const confirmNotification = window.notify.info(
                'Confirmation de déconnexion', 
                'Êtes-vous sûr de vouloir vous déconnecter ?', 
                10000
            );
            
            window.addConfirmationButtons(confirmNotification, function() {
                window.notify.info('Déconnexion en cours', 'Redirection vers l\'accueil...');
                SessionManager.clearSession();
                setTimeout(function() {
                    window.location.href = '../public/login.html';
                }, 1000);
            }, 'Déconnexion');
        });
    }
};

PageManager.prototype.setupInventoryEventListeners = function(currentCategory, loadInventory) {
    document.querySelectorAll('.inventory-action-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            currentCategory = this.dataset.category;
            const action = this.dataset.action;
            
            console.log('🔧 Action:', action, 'Catégorie:', currentCategory); // Debug
            
            if (action === 'add') {
                // Utiliser la fonction globale
                if (window.openAddProductModal) {
                    window.openAddProductModal(currentCategory);
                } else {
                    console.error('❌ openAddProductModal non définie');
                    window.notify.error('Erreur', 'Fonction d\'ajout non disponible');
                }
            } else if (action === 'modify') {
                // Utiliser la fonction globale
                if (window.openStockModal) {
                    window.openStockModal(currentCategory);
                } else {
                    console.error('❌ openStockModal non définie');
                    window.notify.error('Erreur', 'Fonction de modification non disponible');
                }
            }
        });
    });
};

PageManager.prototype.setupCommandesEventListeners = function() {
    const nouvelleCommandeBtn = document.getElementById('nouvelleCommandeBtn');
    if (nouvelleCommandeBtn) {
        const self = this;
        nouvelleCommandeBtn.addEventListener('click', function() {
            const modal = document.getElementById('commandeModal');
            if (modal) {
                modal.style.display = 'flex';
                self.commandesManager.commandeProductCounter = 0;
                const container = document.getElementById('commande-products-container');
                if (container) {
                    container.innerHTML = '';
                    self.commandesManager.addCommandeProductLine();
                }
            }
        });
    }

    const closeCommandeModal = document.getElementById('closeCommandeModal');
    if (closeCommandeModal) {
        closeCommandeModal.addEventListener('click', function() {
            const modal = document.getElementById('commandeModal');
            if (modal) modal.style.display = 'none';
        });
    }

    const addCommandeProductBtn = document.getElementById('addCommandeProductBtn');
    if (addCommandeProductBtn) {
        const self = this;
        addCommandeProductBtn.addEventListener('click', function() {
            if (self.commandesManager) {
                self.commandesManager.addCommandeProductLine();
            }
        });
    }

    const createCommandeBtn = document.getElementById('createCommandeComplete');
    if (createCommandeBtn) {
        const self = this;
        createCommandeBtn.addEventListener('click', function() {
            if (self.commandesManager) {
                self.commandesManager.createCommande();
            }
        });
    }

    const cancelCommande = document.getElementById('cancelCommande');
    if (cancelCommande) {
        cancelCommande.addEventListener('click', function() {
            const modal = document.getElementById('commandeModal');
            if (modal) modal.style.display = 'none';
        });
    }
};

PageManager.prototype.setupDocumentsEventListeners = function() {
    const self = this;
    
    document.querySelectorAll('.document-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const documentType = this.dataset.document;
            
            if (documentType === 'devis') {
                self.documentsManager.openDevisForm();
            } else if (documentType === 'facture') {
                self.documentsManager.openFactureForm();
            } else if (documentType === 'bon-vente') {
                self.documentsManager.openBonVenteModal();
            } else if (documentType === 'bon-livraison') {
                self.documentsManager.openBonLivraisonModal();
            } else {
                window.notify.info('En préparation', 'Cette fonctionnalité sera bientôt disponible !');
            }
        });
    });

    // Event listeners pour les modals de devis
    const closeDevisModal = document.getElementById('closeDevisModal');
    if (closeDevisModal) {
        closeDevisModal.addEventListener('click', function() {
            self.documentsManager.closeDevisModal();
        });
    }

    const cancelDevis = document.getElementById('cancelDevis');
    if (cancelDevis) {
        cancelDevis.addEventListener('click', function() {
            self.documentsManager.closeDevisModal();
        });
    }

    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function() {
            self.documentsManager.addProductLine();
        });
    }

    const generateDevisComplete = document.getElementById('generateDevisComplete');
    if (generateDevisComplete) {
        generateDevisComplete.addEventListener('click', function() {
            self.documentsManager.generateDevisComplete();
        });
    }

    // Event listeners pour les modals de facture
    const closeFactureModal = document.getElementById('closeFactureModal');
    if (closeFactureModal) {
        closeFactureModal.addEventListener('click', function() {
            self.documentsManager.closeFactureModal();
        });
    }

    const cancelFacture = document.getElementById('cancelFacture');
    if (cancelFacture) {
        cancelFacture.addEventListener('click', function() {
            self.documentsManager.closeFactureModal();
        });
    }

    const addFactureProductBtn = document.getElementById('addFactureProductBtn');
    if (addFactureProductBtn) {
        addFactureProductBtn.addEventListener('click', function() {
            self.documentsManager.addFactureProductLine();
        });
    }

    const generateFactureComplete = document.getElementById('generateFactureComplete');
    if (generateFactureComplete) {
        generateFactureComplete.addEventListener('click', function() {
            console.log('🔧 Bouton facture cliqué !'); // Debug
            self.documentsManager.generateFactureComplete();
        });
    }

    // Event listeners pour le modal bon de vente
    const closeBonVenteModal = document.getElementById('closeBonVenteModal');
    if (closeBonVenteModal) {
        closeBonVenteModal.addEventListener('click', function() {
            self.documentsManager.closeBonVenteModal();
        });
    }

    const cancelBonVente = document.getElementById('cancelBonVente');
    if (cancelBonVente) {
        cancelBonVente.addEventListener('click', function() {
            self.documentsManager.closeBonVenteModal();
        });
    }

    // Calcul automatique du total pour bon de vente
    const produitVendu = document.getElementById('produitVendu');
    const quantiteVendue = document.getElementById('quantiteVendue');
    
    if (produitVendu) {
        produitVendu.addEventListener('change', function() {
            self.documentsManager.calculateBonVenteTotal();
        });
    }
    
    if (quantiteVendue) {
        quantiteVendue.addEventListener('input', function() {
            self.documentsManager.calculateBonVenteTotal();
        });
    }

    // Soumission du formulaire bon de vente
    const bonVenteForm = document.getElementById('bonVenteForm');
    if (bonVenteForm) {
        bonVenteForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(bonVenteForm);
            await self.documentsManager.submitBonVente(formData);
        });
    }

    // Event listeners pour le modal bon de livraison
    const closeBonLivraisonModal = document.getElementById('closeBonLivraisonModal');
    if (closeBonLivraisonModal) {
        closeBonLivraisonModal.addEventListener('click', function() {
            self.documentsManager.closeBonLivraisonModal();
        });
    }

    const cancelBonLivraison = document.getElementById('cancelBonLivraison');
    if (cancelBonLivraison) {
        cancelBonLivraison.addEventListener('click', function() {
            self.documentsManager.closeBonLivraisonModal();
        });
    }

    const addProduitLivraisonBtn = document.getElementById('addProduitLivraisonBtn');
    if (addProduitLivraisonBtn) {
        addProduitLivraisonBtn.addEventListener('click', function() {
            self.documentsManager.addProduitLivraisonLine();
        });
    }

    // Soumission du formulaire bon de livraison
    const bonLivraisonForm = document.getElementById('bonLivraisonForm');
    if (bonLivraisonForm) {
        bonLivraisonForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(bonLivraisonForm);
            await self.documentsManager.submitBonLivraison(formData);
        });
    }
};

PageManager.prototype.setupConfigurationEventListeners = function(currentUsers, currentConfig, updateUsersTable) {
    const searchUsers = document.getElementById('searchUsers');
    if (searchUsers) {
        searchUsers.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            document.querySelectorAll('#usersTableBody tr').forEach(function(row) {
                if (row.querySelector('.loading-message')) return;
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(query) ? '' : 'none';
            });
        });
    }

    const loadConfiguration = function() {
        currentConfig = window.dbManager.getConfiguration();
        
        const elements = {
            'critical-matieres': currentConfig.thresholds.matieres?.critical || 50,
            'warning-matieres': currentConfig.thresholds.matieres?.warning || 100,
            'critical-bouteilles': currentConfig.thresholds.bouteilles?.critical || 30,
            'warning-bouteilles': currentConfig.thresholds.bouteilles?.warning || 75
        };

        Object.entries(elements).forEach(function([id, value]) {
            const element = document.getElementById(id);
            if (element) element.value = value;
        });

        updateThresholdInfo();
    };

    const updateThresholdInfo = function() {
        const warningMatieres = document.getElementById('warning-matieres');
        const warningBouteilles = document.getElementById('warning-bouteilles');
        
        if (!warningMatieres || !warningBouteilles) return;

        const matieresInfo = document.querySelector('.config-item:nth-child(1) .threshold-info span');
        const bouteillesInfo = document.querySelector('.config-item:nth-child(2) .threshold-info span');

        if (matieresInfo) {
            matieresInfo.innerHTML = `Au-dessus de ${warningMatieres.value} unités = <strong>Bon Stock</strong>`;
        }
        if (bouteillesInfo) {
            bouteillesInfo.innerHTML = `Au-dessus de ${warningBouteilles.value} bouteilles = <strong>Bon Stock</strong>`;
        }
    };

    loadConfiguration();

    const saveThresholds = document.getElementById('saveThresholds');
    if (saveThresholds) {
        saveThresholds.addEventListener('click', function() {
            const newThresholds = {
                matieres: {
                    critical: parseInt(document.getElementById('critical-matieres')?.value || 50),
                    warning: parseInt(document.getElementById('warning-matieres')?.value || 100)
                },
                bouteilles: {
                    critical: parseInt(document.getElementById('critical-bouteilles')?.value || 30),
                    warning: parseInt(document.getElementById('warning-bouteilles')?.value || 75)
                }
            };

            if (newThresholds.matieres.critical >= newThresholds.matieres.warning || 
                newThresholds.bouteilles.critical >= newThresholds.bouteilles.warning) {
                window.notify.error('Erreur', 'Le seuil critique doit être inférieur au seuil de stock faible.');
                return;
            }

            currentConfig.thresholds = newThresholds;
            if (window.globalConfig) {
                window.globalConfig.thresholds = newThresholds;
            }
            
            updateThresholdInfo();
            window.notify.success('Configuration mise à jour', 'Nouveaux seuils appliqués pour cette session.');
        });
    }

    const resetThresholds = document.getElementById('resetThresholds');
    if (resetThresholds) {
        resetThresholds.addEventListener('click', function() {
            const confirmNotification = window.notify.warning('Réinitialiser les seuils', 'Remettre les valeurs par défaut ?', 10000);
            window.addConfirmationButtons(confirmNotification, function() {
                const defaultThresholds = {
                    matieres: { critical: 50, warning: 100 },
                    bouteilles: { critical: 30, warning: 75 }
                };
                
                currentConfig.thresholds = defaultThresholds;
                if (window.globalConfig) {
                    window.globalConfig.thresholds = defaultThresholds;
                }
                loadConfiguration();
                window.notify.info('Seuils réinitialisés', 'Valeurs par défaut restaurées.');
            });
        });
    }

    ['warning-matieres', 'warning-bouteilles'].forEach(function(id) {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', updateThresholdInfo);
        }
    });
};

// === FONCTIONS GLOBALES ===
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

window.getStockThresholds = function() {
    if (window.dbManager && window.dbManager.isReady) {
        return window.dbManager.getConfiguration().thresholds;
    }
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

// === INITIALISATION DES PRODUITS ===
window.initializeProducts = async function() {
    if (!window.dbManager || !window.dbManager.isReady) {
        setTimeout(window.initializeProducts, 100);
        return;
    }
    
    // Remplir tous les sélecteurs de produits
    const productSelects = document.querySelectorAll('#produitVendu, .produit-livraison-select');
    const optionsHTML = window.dbManager.getProductsAsOptions();
    
    productSelects.forEach(function(select) {
        select.innerHTML = optionsHTML;
    });
    
    // Mettre à jour la variable globale
    const products = window.dbManager.getProducts();
    if (typeof produitsBonVente !== 'undefined') {
        Object.entries(products).forEach(function([key, product]) {
            produitsBonVente[key] = {
                nom: product.name,
                prix: product.price
            };
        });
    }
};

window.updateGlobalConfig = function(newConfig) {
    Object.keys(newConfig).forEach(function(section) {
        if (window.globalConfig) {
            window.globalConfig[section] = Object.assign({}, window.globalConfig[section], newConfig[section]);
        }
    });
    console.log('⚙️ Configuration mise à jour pour cette session:', newConfig);
    return true;
};

window.addConfirmationButtons = function(notification, onConfirm, confirmText = 'Confirmer') {
    const notificationContent = notification.querySelector('.notification-content');
    const buttonsDiv = document.createElement('div');
    buttonsDiv.style.marginTop = '1rem';
    buttonsDiv.style.display = 'flex';
    buttonsDiv.style.gap = '0.5rem';
    
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'cta-button btn-warning';
    confirmBtn.style.fontSize = '0.8rem';
    confirmBtn.style.padding = '0.5rem 1rem';
    confirmBtn.textContent = confirmText;
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cta-button btn-secondary';
    cancelBtn.style.fontSize = '0.8rem';
    cancelBtn.style.padding = '0.5rem 1rem';
    cancelBtn.textContent = 'Annuler';
    
    buttonsDiv.appendChild(cancelBtn);
    buttonsDiv.appendChild(confirmBtn);
    notificationContent.appendChild(buttonsDiv);
    
    confirmBtn.addEventListener('click', function() {
        window.notify.remove(notification);
        onConfirm();
    });
    
    cancelBtn.addEventListener('click', function() {
        window.notify.remove(notification);
    });
};

// === FONCTION UTILITAIRE POUR REMPLACER CONFIRM() ===
window.confirmAction = function(title, message, onConfirm, confirmText = 'Confirmer') {
    const confirmNotification = window.notify.warning(title, message, 10000);
    window.addConfirmationButtons(confirmNotification, onConfirm, confirmText);
};

// === FONCTION UTILITAIRE POUR REMPLACER ALERT() ===
window.alertInfo = function(title, message) {
    window.notify.info(title, message);
};

window.alertSuccess = function(title, message) {
    window.notify.success(title, message);
};

window.alertError = function(title, message) {
    window.notify.error(title, message);
};

// === INITIALISATION GLOBALE ===
window.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Initialisation Marlowe Vineyard...');
    
    // VÉRIFICATION SÉCURITÉ EN PREMIER
    if (!SecurityManager.checkIntranetAccess()) {
        return; // Stop l'initialisation si redirection
    }
    
    window.SessionManager = SessionManager;
    window.notify = new NotificationSystem();
    window.dbManager = new DatabaseManager();
    
    window.pageManager = new PageManager();

    // Attendre que la DB soit prête avant d'initialiser les produits
    if (window.dbManager) {
        await window.dbManager.waitForReady();
    }
    
    setTimeout(window.initializeProducts, 500);
    
    console.log('✅ Marlowe Vineyard initialisé avec succès!');
});
// === EVENT LISTENERS ADDITIONNELS ===
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-close') || e.target.classList.contains('cancel-btn')) {
        const modal = e.target.closest('.modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
    
    const deleteBtn = e.target.closest('.delete-product-btn');
    if (deleteBtn) {
        e.preventDefault();
        e.stopPropagation();
        
        const category = deleteBtn.dataset.category;
        const productId = deleteBtn.dataset.productId;
        
        if (category && productId && window.dbManager) {
            const inventoryData = window.dbManager.getInventory();
            if (inventoryData[category] && inventoryData[category][productId]) {
                const product = inventoryData[category][productId];
                
                const confirmNotification = window.notify.warning(
                    'Supprimer le produit', 
                    `Voulez-vous vraiment supprimer "${product.name}" ?`, 
                    10000
                );
                
                window.addConfirmationButtons(confirmNotification, function() {
                    const success = window.dbManager.removeProduct(category, productId);
                    if (success) {
                        if (window.pageManager && window.pageManager.currentPage === 'inventaire') {
                            location.reload();
                        }
                        window.notify.success('Produit supprimé', `${product.name} a été supprimé de l'inventaire.`);
                    } else {
                        window.notify.error('Erreur', 'Impossible de supprimer le produit.');
                    }
                }, 'Supprimer');
            }
        }
    }
});

document.addEventListener('submit', function(e) {
    if (e.target.id === 'addProductForm') {
        e.preventDefault();
        
        const name = document.getElementById('productName').value.trim();
        const stock = parseInt(document.getElementById('initialStock').value);
        const price = parseFloat(document.getElementById('productPrice').value) || 0;
        
        if (!name || stock < 0) {
            window.notify.error('Erreur', 'Veuillez remplir correctement tous les champs.');
            return;
        }

        const priceGroup = document.getElementById('priceGroup');
        const currentCategory = priceGroup.style.display === 'block' ? 'bouteilles' : 'matieres';

        const productId = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        
        const inventoryData = window.dbManager.getInventory();
        if (inventoryData[currentCategory] && inventoryData[currentCategory][productId]) {
            window.notify.error('Erreur', 'Un produit avec ce nom existe déjà.');
            return;
        }

        const productData = { name: name, stock: stock };
        if (currentCategory === 'bouteilles') {
            productData.price = price;
        }

        const success = window.dbManager.addProduct(currentCategory, productId, productData);
        
        if (success) {
            document.getElementById('addProductModal').style.display = 'none';
            e.target.reset();
            location.reload();
            window.notify.success('Produit ajouté', `${name} a été ajouté à l'inventaire.`);
        } else {
            window.notify.error('Erreur', 'Impossible d\'ajouter le produit.');
        }
    }
    
    if (e.target.id === 'stockForm') {
        e.preventDefault();
        
        const productId = document.getElementById('productSelect').value;
        const newStock = parseInt(document.getElementById('newStock').value);
        const note = document.getElementById('stockNote').value.trim();
        
        if (!productId || newStock < 0) {
            window.notify.error('Erreur', 'Veuillez sélectionner un produit et entrer un stock valide.');
            return;
        }

        let currentCategory = null;
        const inventoryData = window.dbManager.getInventory();
        
        if (inventoryData.matieres && inventoryData.matieres[productId]) {
            currentCategory = 'matieres';
        } else if (inventoryData.bouteilles && inventoryData.bouteilles[productId]) {
            currentCategory = 'bouteilles';
        }

        if (!currentCategory) {
            window.notify.error('Erreur', 'Produit introuvable.');
            return;
        }

        const success = window.dbManager.updateStock(currentCategory, productId, newStock);
        
        if (success) {
            document.getElementById('stockModal').style.display = 'none';
            e.target.reset();
            location.reload();
            
            const productName = inventoryData[currentCategory][productId].name;
            const message = note ? 
                `Stock de ${productName} mis à jour: ${newStock.toLocaleString()} (${note})` :
                `Stock de ${productName} mis à jour: ${newStock.toLocaleString()}`;
            
            window.notify.success('Stock mis à jour', message);
        } else {
            window.notify.error('Erreur', 'Impossible de mettre à jour le stock.');
        }
    }
});

document.addEventListener('change', function(e) {
    if (e.target.id === 'productSelect') {
        const productId = e.target.value;
        const inventoryData = window.dbManager.getInventory();
        
        let product = null;
        if (inventoryData.matieres && inventoryData.matieres[productId]) {
            product = inventoryData.matieres[productId];
        } else if (inventoryData.bouteilles && inventoryData.bouteilles[productId]) {
            product = inventoryData.bouteilles[productId];
        }
        
        if (product) {
            const currentStockElement = document.getElementById('currentStock');
            const newStockElement = document.getElementById('newStock');
            
            if (currentStockElement) {
                currentStockElement.textContent = product.stock.toLocaleString();
            }
            if (newStockElement) {
                newStockElement.value = product.stock;
            }
        }
    }
});
/* === SCRIPT.JS - MARLOWE VINEYARD COMPLET === */

// === INITIALISATION SÉCURISÉE DES VARIABLES GLOBALES ===
if (typeof produitsBonVente === 'undefined') {
    var produitsBonVente = {};
}

// === SYSTÈME DE SESSION ===
var SESSION_KEY = 'marlowe_user_session';
var SESSION_TIMEOUT = 60 * 60 * 1000; // 1 heure

// === SYSTÈME DE SÉCURITÉ INTRANET ===
var SecurityManager = {
    checkIntranetAccess: function() {
        const currentPath = window.location.pathname;
        const isInIntranet = currentPath.includes('/intranet/');
        
        if (isInIntranet) {
            const session = SessionManager.getSession();
            
            if (!session) {
                console.log('🚫 Accès refusé : Aucune session active');
                this.redirectToLogin();
                return false;
            }
            
            console.log('✅ Accès autorisé : Session valide pour', session.username);
            return true;
        }
        
        return true; // Pages publiques = accès libre
    },
    
    redirectToLogin: function() {
        const currentPath = window.location.pathname;
        const isInIntranet = currentPath.includes('/intranet/');
        
        if (isInIntranet) {
            window.location.href = '../public/login.html';
        } else {
            window.location.href = './public/login.html';
        }
    }
};

var SessionManager = {
    saveSession: function(userData) {
        const sessionData = {
            user: userData,
            loginTime: Date.now(),
            expiresAt: Date.now() + SESSION_TIMEOUT
        };
        
        try {
            localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
            console.log('✅ Session sauvegardée:', userData.username);
            return true;
        } catch (error) {
            console.error('❌ Erreur sauvegarde session:', error);
            return false;
        }
    },

    getSession: function() {
        try {
            const sessionData = localStorage.getItem(SESSION_KEY);
            if (!sessionData) return null;

            const parsed = JSON.parse(sessionData);
            
            if (Date.now() > parsed.expiresAt) {
                console.log('⏰ Session expirée');
                this.clearSession();
                
                // Rediriger si on est dans l'intranet
                const currentPath = window.location.pathname;
                if (currentPath.includes('/intranet/')) {
                    setTimeout(function() {
                        window.location.href = '../public/login.html';
                    }, 100);
                }
                
                return null;
            }

            return parsed.user;
        } catch (error) {
            console.error('❌ Erreur récupération session:', error);
            return null;
        }
    },

    clearSession: function() {
        try {
            localStorage.removeItem(SESSION_KEY);
            console.log('🗑️ Session supprimée');
            return true;
        } catch (error) {
            console.error('❌ Erreur suppression session:', error);
            return false;
        }
    },

    isLoggedIn: function() {
        return this.getSession() !== null;
    },

    renewSession: function() {
        const currentSession = this.getSession();
        if (currentSession) {
            this.saveSession(currentSession);
        }
    }
};

// === SYSTÈME DE NOTIFICATIONS ===
function NotificationSystem() {
    this.container = null;
    this.init();
}

NotificationSystem.prototype.init = function() {
    if (!document.querySelector('.notifications-container')) {
        this.container = document.createElement('div');
        this.container.className = 'notifications-container';
        document.body.appendChild(this.container);
    } else {
        this.container = document.querySelector('.notifications-container');
    }
};

NotificationSystem.prototype.show = function(type, title, message, duration = 4000) {
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

    this.container.appendChild(notification);

    const closeBtn = notification.querySelector('.notification-close');
    const self = this;
    closeBtn.addEventListener('click', function() {
        self.remove(notification);
    });

    setTimeout(function() {
        self.remove(notification);
    }, duration);

    return notification;
};

NotificationSystem.prototype.remove = function(notification) {
    notification.classList.add('removing');
    setTimeout(function() {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
};

NotificationSystem.prototype.success = function(title, message, duration) {
    return this.show('success', title, message, duration);
};

NotificationSystem.prototype.error = function(title, message, duration) {
    return this.show('error', title, message, duration);
};

NotificationSystem.prototype.warning = function(title, message, duration) {
    return this.show('warning', title, message, duration);
};

NotificationSystem.prototype.info = function(title, message, duration) {
    return this.show('info', title, message, duration);
};

// === DATABASE MANAGER ===
function DatabaseManager() {
    this.DB_VERSION = '1.0';
    this.INVENTORY_KEY = 'marlowe_inventory';
    this.data = {};
    this.isReady = false;
    
    this.init();
}

DatabaseManager.prototype.init = async function() {
    try {
        await this.loadFromJSON();
        this.initInventory();
        
        this.isReady = true;
        console.log('✅ Database Manager initialisé avec succès');
        console.log('📊 Données chargées:', this.data);
        console.log('📦 Inventaire localStorage prêt');
        
        this.updateGlobalConfig();
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation de la DB:', error);
        this.isReady = false;
    }
};

DatabaseManager.prototype.loadFromJSON = async function() {
    try {
        const currentPath = window.location.pathname;
        const isInIntranet = currentPath.includes('/intranet/');
        const isInPublic = currentPath.includes('/public/');
        
        let dbPath;
        if (isInIntranet) {
            dbPath = '../DB.json';
        } else if (isInPublic) {
            dbPath = '../DB.json';
        } else {
            dbPath = './DB.json';
        }
        
        console.log('🔍 Chemin détecté:', currentPath);
        console.log('🔍 Tentative de chargement DB depuis:', dbPath);
        
        const response = await fetch(dbPath);
        if (response.ok) {
            this.data = await response.json();
            delete this.data.inventory;
            console.log('📄 DB.json chargé avec succès depuis:', dbPath, '(sans inventaire)');
        } else {
            throw new Error(`Impossible de charger DB.json depuis ${dbPath} (HTTP ${response.status})`);
        }
    } catch (error) {
        console.error('⚠️ Erreur lors du chargement de DB.json:', error);
        throw error;
    }
};

DatabaseManager.prototype.initInventory = function() {
    try {
        const storedInventory = localStorage.getItem(this.INVENTORY_KEY);
        if (!storedInventory) {
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
};

DatabaseManager.prototype.saveInventoryToStorage = function() {
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
};

DatabaseManager.prototype.updateGlobalConfig = function() {
    if (this.data.configuration) {
        window.globalConfig = this.data.configuration;
        console.log('⚙️ Configuration globale mise à jour depuis la DB');
    }
};

DatabaseManager.prototype.waitForReady = async function() {
    while (!this.isReady) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return true;
};

// === GESTION DES UTILISATEURS ===
DatabaseManager.prototype.getUsers = function() {
    return this.data.users || {};
};

DatabaseManager.prototype.getUser = function(username) {
    return this.data.users?.[username] || null;
};

// === GESTION DE L'INVENTAIRE ===
DatabaseManager.prototype.getInventory = function() {
    return this.data.inventory || { matieres: {}, bouteilles: {} };
};

DatabaseManager.prototype.updateStock = function(category, productId, newStock) {
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
};

DatabaseManager.prototype.addProduct = function(category, productId, productData) {
    if (!this.data.inventory) this.data.inventory = { matieres: {}, bouteilles: {} };
    if (!this.data.inventory[category]) this.data.inventory[category] = {};

    this.data.inventory[category][productId] = productData;
    const saved = this.saveInventoryToStorage();
    if (saved) {
        console.log(`📦 Produit ajouté: ${productId}`, productData);
    }
    return saved;
};

DatabaseManager.prototype.removeProduct = function(category, productId) {
    if (this.data.inventory?.[category]?.[productId]) {
        delete this.data.inventory[category][productId];
        const saved = this.saveInventoryToStorage();
        if (saved) {
            console.log(`📦 Produit supprimé: ${productId}`);
        }
        return saved;
    }
    return false;
};

DatabaseManager.prototype.getGrades = function() {
    return this.data.system?.grades || {
        employe: { label: "Employé", color: "#1976d2", background: "#e3f2fd" },
        manager: { label: "Manager", color: "#f57c00", background: "#fff3e0" },
        cfo: { label: "CFO", color: "#7b1fa2", background: "#f3e5f5" },
        ceo: { label: "CEO", color: "#c62828", background: "#ffebee", border: "2px solid #c62828" }
    };
};

DatabaseManager.prototype.getPermissions = function() {
    return this.data.system?.permissions || {
        dashboard: { label: "Dashboard", icon: "📊" },
        inventory: { label: "Inventaire", icon: "📦" },
        documents: { label: "Documents", icon: "📄" },
        config: { label: "Configuration", icon: "⚙️" },
        reports: { label: "Rapports", icon: "📈" },
        users: { label: "Gestion utilisateurs", icon: "👥" }
    };
};

DatabaseManager.prototype.getGradeInfo = function(grade) {
    const grades = this.getGrades();
    return grades[grade] || { label: grade.toUpperCase(), color: "#666", background: "#f0f0f0" };
};

DatabaseManager.prototype.getPermissionInfo = function(permission) {
    const permissions = this.getPermissions();
    return permissions[permission] || { label: permission, icon: "🔧" };
};

DatabaseManager.prototype.getConfiguration = function() {
    return this.data.configuration || {
        thresholds: { matieres: { critical: 50, warning: 100 }, bouteilles: { critical: 30, warning: 75 } },
        notifications: { duration: 4, soundEnabled: true },
        system: { sessionTimeout: 60, theme: 'light' }
    };
};

// === GESTION DES PRODUITS ===
DatabaseManager.prototype.getAllProducts = function() {
    const products = this.data.products || {};
    const allProducts = {};
    
    // Fusionner tous les produits des différentes catégories
    Object.values(products).forEach(function(category) {
        Object.assign(allProducts, category);
    });
    
    return allProducts;
};

DatabaseManager.prototype.getProducts = function() {
    return this.getAllProducts();
};

DatabaseManager.prototype.getProductsByCategory = function(categoryName) {
    return this.data.products?.[categoryName] || {};
};

DatabaseManager.prototype.getProduct = function(productId) {
    const products = this.getProducts();
    return products[productId] || null;
};

DatabaseManager.prototype.getProductsAsOptions = function() {
    const products = this.getProducts();
    let options = '<option value="">Sélectionnez un produit</option>';
    
    Object.entries(products).forEach(function([key, product]) {
        options += `<option value="${key}">${product.name} - ${product.price}$</option>`;
    });
    
    return options;
};

// === GESTIONNAIRE DE COMMANDES ===
function CommandesManager() {
    this.DISCORD_WEBHOOK = 'https://l.webhook.party/hook/%2FM4rBgChCMU4C0h64KaEOZnDRAtwERxORTQ26Ys6%2BsiMGlLBJo3FQUJehclFhqZRoK51sIMpwIPlVGtQgawTjjH8udxL8Z%2Bpqh57S6pZtkybo8l5420APyeP%2FnhOj0fwOpF6hStUvNUY%2BzSIDjBsQ6lW4JFweXO5jxuhxAOK845Yw6tWXN5nnbpmzeT7DkejC%2FEIycugAJWINo%2B3zGkptzJGO%2FjoFAvF5kmoCCnO%2FP6Zfz54tRzfuHMckUvQUxGUicFd9zlGKytPaJ6cr5Ll%2F4TNerWzV1g7Ow6JASwAG1q23CwWU1RkH1NEY81A942QBtaZsy4NSodqA9EpDwFhLdmBMOMTbXyqgJuaoQ4X%2B74gqwXJvO3D2tV%2BctcrG%2FUSataMw9VjUpQ%3D/pPrmw%2FZCVchUkDLD';
    
    this.produits = {};
    
    // Ne pas appeler loadProducts() ici, le faire après
    const self = this;
    setTimeout(function() {
        self.loadProducts();
    }, 100);
    
    this.commandes = [];
    this.commandeProductCounter = 0;
    this.commandeData = { 
        client: {}, 
        livraison: {}, 
        produits: [], 
        totaux: { sousTotal: 0, tva: 0, total: 0 } 
    };
    this.currentPreparation = null;
    this.loadCommandes();
}

CommandesManager.prototype.loadProducts = async function() {
    if (window.dbManager && window.dbManager.isReady) {
        await window.dbManager.waitForReady();
        const products = window.dbManager.getProducts();
        const self = this;
        Object.entries(products).forEach(function([key, product]) {
            self.produits[key] = {
                nom: product.name,
                prix: product.price
            };
        });
    }
};

CommandesManager.prototype.generateCommandeNumber = function() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CMD${year}${month}${day}-${random}`;
};

CommandesManager.prototype.saveCommandes = function() {
    try {
        localStorage.setItem('marlowe_commandes', JSON.stringify(this.commandes));
        console.log('💾 Commandes sauvegardées:', this.commandes.length);
    } catch (error) {
        console.error('❌ Erreur sauvegarde commandes:', error);
    }
};

CommandesManager.prototype.loadCommandes = function() {
    try {
        const stored = localStorage.getItem('marlowe_commandes');
        if (stored) {
            this.commandes = JSON.parse(stored);
            console.log('📂 Commandes chargées:', this.commandes.length);
        } else {
            this.commandes = [];
        }
    } catch (error) {
        console.error('❌ Erreur chargement commandes:', error);
        this.commandes = [];
    }
};

CommandesManager.prototype.addCommandeProductLine = function() {
    this.commandeProductCounter++;
    const container = document.getElementById('commande-products-container');
    
    const productLine = document.createElement('div');
    productLine.className = 'product-line';
    productLine.dataset.id = this.commandeProductCounter;
    
    let optionsHTML = window.dbManager ? window.dbManager.getProductsAsOptions() : '<option value="">Chargement...</option>';
    
    productLine.innerHTML = `
        <div class="product-line-header">
            <span class="product-number">Produit ${this.commandeProductCounter}</span>
            ${this.commandeProductCounter > 1 ? `<button type="button" class="btn-remove-product"><i class="fas fa-trash"></i></button>` : ''}
        </div>
        <div class="form-row">
            <div class="form-group flex-2">
                <label class="form-label">Produit</label>
                <select class="form-select product-select" data-id="${this.commandeProductCounter}">
                    ${optionsHTML}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Prix unitaire</label>
                <input type="text" class="form-input product-price" data-id="${this.commandeProductCounter}" readonly>
            </div>
            <div class="form-group">
                <label class="form-label">Quantité</label>
                <input type="number" class="form-input product-quantity" data-id="${this.commandeProductCounter}" min="1" value="1">
            </div>
            <div class="form-group">
                <label class="form-label">Total HT</label>
                <input type="text" class="form-input product-total" data-id="${this.commandeProductCounter}" readonly>
            </div>
        </div>
    `;
    
    container.appendChild(productLine);
    this.setupProductLineEvents(productLine);
};

CommandesManager.prototype.setupProductLineEvents = function(productLine) {
    const select = productLine.querySelector('.product-select');
    const priceInput = productLine.querySelector('.product-price');
    const quantityInput = productLine.querySelector('.product-quantity');
    const totalInput = productLine.querySelector('.product-total');
    const removeBtn = productLine.querySelector('.btn-remove-product');
    const self = this;

    if (select) {
        select.addEventListener('change', function() {
            const productKey = this.value;
            if (productKey && self.produits[productKey]) {
                const prix = self.produits[productKey].prix;
                priceInput.value = `${prix}$`;
                self.calculateProductTotal(productLine);
            } else {
                priceInput.value = '';
                totalInput.value = '';
            }
            self.calculateCommandeTotals();
        });
    }

    if (quantityInput) {
        quantityInput.addEventListener('input', function() {
            self.calculateProductTotal(productLine);
            self.calculateCommandeTotals();
        });
    }

    if (removeBtn) {
        removeBtn.addEventListener('click', function() {
            productLine.remove();
            self.calculateCommandeTotals();
        });
    }
};

CommandesManager.prototype.calculateProductTotal = function(productLine) {
    const select = productLine.querySelector('.product-select');
    const quantityInput = productLine.querySelector('.product-quantity');
    const totalInput = productLine.querySelector('.product-total');
    
    const productKey = select.value;
    const quantity = parseInt(quantityInput.value) || 0;
    
    if (productKey && this.produits[productKey] && quantity > 0) {
        const prix = this.produits[productKey].prix;
        const total = prix * quantity;
        totalInput.value = `${total.toLocaleString()}$`;
    } else {
        totalInput.value = '';
    }
};

CommandesManager.prototype.calculateCommandeTotals = function() {
    let sousTotal = 0;
    const self = this;
    
    document.querySelectorAll('.product-line').forEach(function(line) {
        const select = line.querySelector('.product-select');
        const quantityInput = line.querySelector('.product-quantity');
        
        const productKey = select.value;
        const quantity = parseInt(quantityInput.value) || 0;
        
        if (productKey && self.produits[productKey] && quantity > 0) {
            sousTotal += self.produits[productKey].prix * quantity;
        }
    });
    
    const tva = sousTotal * 0.21;
    const total = sousTotal + tva;
    
    const sousToolElement = document.getElementById('commande-sous-total');
    const tvaElement = document.getElementById('commande-tva-montant');
    const totalElement = document.getElementById('commande-total-final');
    
    if (sousToolElement) sousToolElement.textContent = `${sousTotal.toLocaleString()}$`;
    if (tvaElement) tvaElement.textContent = `${tva.toLocaleString()}$`;
    if (totalElement) totalElement.textContent = `${total.toLocaleString()}$`;
};

CommandesManager.prototype.createCommande = async function() {
    const clientNom = document.getElementById('commande-client-nom')?.value?.trim();
    const clientEmail = document.getElementById('commande-client-email')?.value?.trim();
    const clientAdresse = document.getElementById('commande-client-adresse')?.value?.trim();
    const clientTelephone = document.getElementById('commande-client-telephone')?.value?.trim();
    
    const dateLivraison = document.getElementById('commande-date-livraison')?.value;
    const heureLivraison = document.getElementById('commande-heure-livraison')?.value;
    const adresseLivraison = document.getElementById('commande-adresse-livraison')?.value?.trim();

    if (!clientNom || !clientAdresse || !dateLivraison || !heureLivraison) {
        window.notify.error('Erreur', 'Veuillez remplir tous les champs obligatoires.');
        return;
    }

    const produits = [];
    let sousTotal = 0;
    const self = this;
    
    document.querySelectorAll('.product-line').forEach(function(line) {
        const select = line.querySelector('.product-select');
        const quantityInput = line.querySelector('.product-quantity');
        
        const productKey = select.value;
        const quantity = parseInt(quantityInput.value) || 0;
        
        if (productKey && self.produits[productKey] && quantity > 0) {
            const produit = self.produits[productKey];
            const total = produit.prix * quantity;
            
            produits.push({
                key: productKey,
                nom: produit.nom,
                prix: produit.prix,
                quantite: quantity,
                total: total
            });
            
            sousTotal += total;
        }
    });

    if (produits.length === 0) {
        window.notify.error('Erreur', 'Veuillez ajouter au moins un produit à la commande.');
        return;
    }

    const tva = sousTotal * 0.21;
    const total = sousTotal + tva;
    
    const commande = {
        id: this.generateCommandeNumber(),
        dateCreation: new Date().toISOString(),
        client: {
            nom: clientNom,
            email: clientEmail,
            adresse: clientAdresse,
            telephone: clientTelephone
        },
        livraison: {
            date: dateLivraison,
            heure: heureLivraison,
            adresse: adresseLivraison || clientAdresse
        },
        produits: produits,
        totaux: {
            sousTotal: sousTotal,
            tva: tva,
            total: total
        },
        statut: 'en_cours'
    };

    try {
        const discordData = {
            embeds: [{
                title: "🛍️ Nouvelle Commande",
                color: 0x28a745,
                fields: [
                    {
                        name: "📋 Numéro de commande",
                        value: commande.id,
                        inline: true
                    },
                    {
                        name: "👤 Client",
                        value: clientNom,
                        inline: true
                    },
                    {
                        name: "📧 Email",
                        value: clientEmail || "Non fourni",
                        inline: true
                    },
                    {
                        name: "📍 Adresse client",
                        value: clientAdresse,
                        inline: false
                    },
                    {
                        name: "🚚 Livraison prévue",
                        value: `${dateLivraison} à ${heureLivraison}`,
                        inline: true
                    },
                    {
                        name: "💰 Total TTC",
                        value: `${total.toLocaleString()}$`,
                        inline: true
                    },
                    {
                        name: "🍷 Produits commandés",
                        value: produits.map(p => `• ${p.quantite}x ${p.nom} (${p.prix}$ x ${p.quantite} = ${p.total}$)`).join('\n'),
                        inline: false
                    }
                ],
                footer: {
                    text: "Marlowe Vineyard - Système de Commandes"
                },
                timestamp: new Date().toISOString()
            }]
        };

        const response = await fetch(this.DISCORD_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(discordData)
        });

        if (response.ok) {
            this.commandes.push(commande);
            this.saveCommandes();
            
            window.notify.success(
                'Commande créée !', 
                `Commande ${commande.id} enregistrée et notification envoyée`
            );
            
            document.getElementById('commandeModal').style.display = 'none';
            this.resetCommandeForm();
            this.displayCommandes();
            
        } else {
            throw new Error('Erreur lors de l\'envoi vers Discord');
        }

    } catch (error) {
        console.error('Erreur création commande:', error);
        window.notify.error(
            'Erreur d\'envoi', 
            'La commande n\'a pas pu être envoyée sur Discord. Vérifiez votre connexion.'
        );
    }
};

CommandesManager.prototype.resetCommandeForm = function() {
    const inputs = [
        'commande-client-nom', 'commande-client-email', 
        'commande-client-adresse', 'commande-client-telephone',
        'commande-date-livraison', 'commande-heure-livraison', 
        'commande-adresse-livraison'
    ];
    
    inputs.forEach(function(id) {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });

    this.commandeProductCounter = 0;
    const container = document.getElementById('commande-products-container');
    if (container) {
        container.innerHTML = '';
        this.addCommandeProductLine();
    }

    this.calculateCommandeTotals();
};

CommandesManager.prototype.displayCommandes = function() {
    const container = document.getElementById('commandesContainer');
    if (!container) return;
    
    if (this.commandes.length === 0) {
        container.innerHTML = `
            <div class="no-commandes">
                <i class="fas fa-shopping-cart"></i>
                <h3>Aucune commande en cours</h3>
                <p>Cliquez sur "Nouvelle Commande" pour créer votre première commande.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    this.commandes.forEach(function(commande) {
        const commandeCard = document.createElement('div');
        commandeCard.className = 'commande-card';
        
        const produitsHTML = commande.produits.map(function(p) {
            return `<div class="produit-item">
                <div class="produit-details">
                    <div class="produit-nom">${p.nom}</div>
                    <div class="produit-prix">${p.prix}$ l'unité</div>
                </div>
                <div class="produit-quantite">${p.quantite}</div>
            </div>`;
        }).join('');
        
        commandeCard.innerHTML = `
            <div class="commande-header">
                <div class="commande-numero">${commande.id}</div>
                <div class="commande-date">Créée le ${new Date(commande.dateCreation).toLocaleDateString('fr-FR')}</div>
            </div>
            <div class="commande-client">
                <h4><i class="fas fa-user"></i> ${commande.client.nom}</h4>
                <div class="client-info">
                    <div><strong>Email:</strong> ${commande.client.email || 'Non fourni'}</div>
                    <div><strong>Téléphone:</strong> ${commande.client.telephone || 'Non fourni'}</div>
                </div>
            </div>
            <div class="commande-livraison">
                <h4><i class="fas fa-truck"></i> Livraison prévue</h4>
                <div class="livraison-info">
                    <strong>${commande.livraison.date} à ${commande.livraison.heure}</strong><br>
                    ${commande.livraison.adresse}
                </div>
            </div>
            <div class="commande-produits">
                <h4><i class="fas fa-wine-bottle"></i> Produits</h4>
                ${produitsHTML}
            </div>
            <div class="commande-total">
                Total: ${commande.totaux.total.toLocaleString()} TTC
            </div>
        `;
        
        container.appendChild(commandeCard);
    });
};

// === GESTIONNAIRE DE DOCUMENTS - VARIABLES GLOBALES ===
var DISCORD_WEBHOOK_BON_VENTE = 'https://l.webhook.party/hook/%2FM4rBgChCMU4C0h64KaEOZnDRAtwERxORTQ26Ys6%2BsiMGlLBJo3FQUJehclFhqZRoK51sIMpwIPlVGtQgawTjjH8udxL8Z%2Bpqh57S6pZtkybo8l5420APyeP%2FnhOj0fwOpF6hStUvNUY%2BzSIDjBsQ6lW4JFweXO5jxuhxAOK845Yw6tWXN5nnbpmzeT7DkejC%2FEIycugAJWINo%2B3zGkptzJGO%2FjoFAvF5kmoCCnO%2FP6Zfz54tRzfuHMckUvQUxGUicFd9zlGKytPaJ6cr5Ll%2F4TNerWzV1g7Ow6JASwAG1q23CwWU1RkH1NEY81A942QBtaZsy4NSodqA9EpDwFhLdmBMOMTbXyqgJuaoQ4X%2B74gqwXJvO3D2tV%2BctcrG%2FUSataMw9VjUpQ%3D/pPrmw%2FZCVchUkDLD';
var DISCORD_WEBHOOK_URL = 'https://l.webhook.party/hook/p8GEvGjZOXrEAnlh9Czg9Tc0iTQBwifuEMuxxUSXDviB6TigfRf2602NP8WKvfbOKbznpmCc84gFdsh3ReH%2BnwfMPy%2FQuxLaSOKoEhONeF2Sa%2BdlaQeZIF8HnyhTdm%2F139Gp1ZQNINg2u5wL4iv3Gnf4vhyNTH6f2v%2BeDX4gF2wk4Ggtz1JckA7wL2zzdEzp7kngu9sT97mMpEQ7hSGib3GfUgQ3XE4yHljVjprjK2vKD1WrJrbkCigxZhM5evlSs0rWFg4vxjo9ytsVdHnbv%2BXF%2FcNb%2BY9c%2Foyj0WNqRrV7WDawmXYGA7%2B1iwKAMhPxDJvGwfytR64FeOoSQdEEfHlk4wKErY6S4Cdvq3FHsDpfrF2Kr3vByaujn%2BhjOUxk51U%2Bf10knUI%3D/O39Ms6oV6RQnZDds';

var produitsBonVente = {};

// Variables PDF
var templatePDF = null;
var templateFacturePDF = null;
var productCounter = 0;
var factureProductCounter = 0;
var devisData = { client: {}, produits: [], totaux: { sousTotal: 0, tva: 0, total: 0 } };
var factureData = { client: {}, produits: [], totaux: { sousTotal: 0, tva: 0, total: 0 } };

// === FONCTIONS GLOBALES POUR L'INVENTAIRE (DÉPLACÉES) ===
window.openAddProductModal = function(category) {
    const modal = document.getElementById('addProductModal');
    const priceGroup = document.getElementById('priceGroup');
    
    if (modal) {
        modal.style.display = 'flex';
        
        // Afficher le champ prix seulement pour les bouteilles
        if (priceGroup) {
            priceGroup.style.display = category === 'bouteilles' ? 'block' : 'none';
        }
        
        // Reset du formulaire
        const form = document.getElementById('addProductForm');
        if (form) form.reset();
        
        // Focus sur le nom du produit
        const productNameInput = document.getElementById('productName');
        if (productNameInput) {
            setTimeout(function() { productNameInput.focus(); }, 100);
        }
    }
};

window.openStockModal = function(category) {
    const modal = document.getElementById('stockModal');
    const productSelect = document.getElementById('productSelect');
    
    if (modal && productSelect) {
        modal.style.display = 'flex';
        
        // Charger les produits de la catégorie
        const inventoryData = window.dbManager.getInventory();
        const products = inventoryData[category] || {};
        
        productSelect.innerHTML = '<option value="">Sélectionnez un produit</option>';
        
        Object.entries(products).forEach(function([productId, product]) {
            const option = document.createElement('option');
            option.value = productId;
            option.textContent = `${product.name} (Stock actuel: ${product.stock})`;
            productSelect.appendChild(option);
        });
        
        // Reset des autres champs
        const currentStockElement = document.getElementById('currentStock');
        const newStockElement = document.getElementById('newStock');
        const noteElement = document.getElementById('stockNote');
        
        if (currentStockElement) currentStockElement.textContent = '0';
        if (newStockElement) newStockElement.value = '';
        if (noteElement) noteElement.value = '';
    }
};

// === GESTIONNAIRE DE DOCUMENTS ===
function DocumentsManager() {
    this.loadTemplates();
}

DocumentsManager.prototype.loadTemplates = async function() {
    this.showTemplateStatus('🔄 Chargement des templates...', 'info');
    
    let templatesLoaded = 0;
    let totalTemplates = 2;
    
    try {
        await this.tryLoadDefaultTemplate();
        templatesLoaded++;
    } catch (error) {
        console.error('Erreur template devis:', error);
    }
    
    try {
        await this.tryLoadFactureTemplate();
        templatesLoaded++;
    } catch (error) {
        console.error('Erreur template facture:', error);
    }
    
    // Message final
    if (templatesLoaded === totalTemplates) {
        this.showTemplateStatus('✅ Templates chargés avec succès', 'success');
    } else if (templatesLoaded > 0) {
        this.showTemplateStatus(`⚠️ ${templatesLoaded}/${totalTemplates} templates chargés`, 'warning');
    } else {
        this.showTemplateStatus('❌ Aucun template chargé', 'error');
    }
};

DocumentsManager.prototype.tryLoadDefaultTemplate = async function() {
    try {
        const response = await fetch('../assets/template-devis.pdf');
        if (response.ok) {
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();
            templatePDF = await PDFLib.PDFDocument.load(arrayBuffer);
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
    }
};

DocumentsManager.prototype.tryLoadFactureTemplate = async function() {
    try {
        const response = await fetch('../assets/template-factures.pdf');
        if (response.ok) {
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();
            templateFacturePDF = await PDFLib.PDFDocument.load(arrayBuffer);
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
    }
};

DocumentsManager.prototype.showTemplateStatus = function(message, type) {
    const statusDiv = document.getElementById('templateStatus');
    if (!statusDiv) return;
    const colors = {
        success: '#d4edda; color: #155724',
        error: '#f8d7da; color: #721c24',
        info: '#cce7ff; color: #004085'
    };
    statusDiv.innerHTML = `<div style="background: ${colors[type]}; padding: 10px; border-radius: 5px; font-size: 14px;">${message}</div>`;
};

// === FONCTIONS DEVIS PDF ===
DocumentsManager.prototype.openDevisForm = function() {
    if (!templatePDF) {
        window.notify.warning('Template manquant', 'Le template PDF n\'est pas encore chargé.');
        return;
    }
    const devisModal = document.getElementById('devisModal');
    if (devisModal) {
        devisModal.style.display = 'flex';
        this.resetDevisForm();
        this.generateDevisNumber();
        this.addProductLine();
    } else {
        window.notify.warning('Modal introuvable', 'Le modal de devis n\'existe pas dans cette page.');
    }
};

DocumentsManager.prototype.closeDevisModal = function() {
    document.getElementById('devisModal').style.display = 'none';
};

DocumentsManager.prototype.generateDevisNumber = function() {
    const numeroDevisElement = document.getElementById('numero-devis');
    if (numeroDevisElement) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        numeroDevisElement.value = `DV${year}${month}${day}-${random}`;
    }
};

DocumentsManager.prototype.resetDevisForm = function() {
    const clientNom = document.getElementById('client-nom');
    const clientEmail = document.getElementById('client-email');
    const clientAdresse = document.getElementById('client-adresse');
    const clientTelephone = document.getElementById('client-telephone');
    const productsContainer = document.getElementById('products-container');
    
    if (clientNom) clientNom.value = '';
    if (clientEmail) clientEmail.value = '';
    if (clientAdresse) clientAdresse.value = '';
    if (clientTelephone) clientTelephone.value = '';
    if (productsContainer) productsContainer.innerHTML = '';
    
    productCounter = 0;
    this.updateTotals();
};

DocumentsManager.prototype.addProductLine = function() {
    const container = document.getElementById('products-container');
    if (!container) {
        console.log('Container products-container non trouvé');
        return;
    }
    
    productCounter++;
    const productLine = document.createElement('div');
    productLine.className = 'product-line';
    productLine.dataset.id = productCounter;

    let buttonHTML = '';
    if (productCounter > 1) {
        buttonHTML = `<button type="button" class="btn-remove-product" onclick="window.pageManager.documentsManager.removeProductLine(${productCounter})"><i class="fas fa-trash"></i></button>`;
    }

    let optionsHTML = window.dbManager ? window.dbManager.getProductsAsOptions() : '<option value="">Chargement...</option>';

    productLine.innerHTML = `
        <div class="product-line-header">
            <span class="product-number">Produit ${productCounter}</span>
            ${buttonHTML}
        </div>
        <div class="form-row">
            <div class="form-group flex-2">
                <label class="form-label">Produit</label>
                <select class="form-select product-select" data-id="${productCounter}" onchange="window.pageManager.documentsManager.updateProductPrice(${productCounter})">
                    ${optionsHTML}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Prix unitaire</label>
                <input type="text" class="form-input product-price" data-id="${productCounter}" readonly>
            </div>
            <div class="form-group">
                <label class="form-label">Quantité</label>
                <input type="number" class="form-input product-quantity" data-id="${productCounter}" min="1" value="1" onchange="window.pageManager.documentsManager.updateLineTotal(${productCounter})">
            </div>
            <div class="form-group">
                <label class="form-label">Total HT</label>
                <input type="text" class="form-input product-total" data-id="${productCounter}" readonly>
            </div>
        </div>
    `;
    container.appendChild(productLine);
};

DocumentsManager.prototype.removeProductLine = function(id) {
    const line = document.querySelector(`[data-id="${id}"]`);
    if (line) {
        line.remove();
        this.updateTotals();
    }
};

DocumentsManager.prototype.updateProductPrice = function(id) {
    const select = document.querySelector(`select[data-id="${id}"]`);
    const priceInput = document.querySelector(`input.product-price[data-id="${id}"]`);
    if (select.value) {
        const prix = produitsBonVente[select.value].prix;
        priceInput.value = `${prix}.00`;
        this.updateLineTotal(id);
    } else {
        priceInput.value = '';
        this.updateLineTotal(id);
    }
};

DocumentsManager.prototype.updateLineTotal = function(id) {
    const select = document.querySelector(`select[data-id="${id}"]`);
    const quantityInput = document.querySelector(`input.product-quantity[data-id="${id}"]`);
    const totalInput = document.querySelector(`input.product-total[data-id="${id}"]`);
    if (select.value && quantityInput.value) {
        const prix = produitsBonVente[select.value].prix;
        const quantity = parseInt(quantityInput.value) || 0;
        const total = prix * quantity;
        totalInput.value = `${total.toLocaleString('en-US')}.00`;
    } else {
        totalInput.value = '';
    }
    this.updateTotals();
};

DocumentsManager.prototype.updateTotals = function() {
    let sousTotal = 0;
    document.querySelectorAll('.product-line').forEach(function(line) {
        const id = line.dataset.id;
        const select = document.querySelector(`select[data-id="${id}"]`);
        const quantityInput = document.querySelector(`input.product-quantity[data-id="${id}"]`);
        if (select && select.value && quantityInput && quantityInput.value) {
            const prix = produitsBonVente[select.value].prix;
            const quantity = parseInt(quantityInput.value) || 0;
            sousTotal += prix * quantity;
        }
    });
    const tva = sousTotal * 0.21;
    const total = sousTotal + tva;
    
    const sousToolElement = document.getElementById('sous-total');
    const tvaElement = document.getElementById('tva-montant');
    const totalElement = document.getElementById('total-final');
    
    if (sousToolElement) sousToolElement.textContent = `${sousTotal.toLocaleString('en-US')}.00`;
    if (tvaElement) tvaElement.textContent = `${tva.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    if (totalElement) totalElement.textContent = `${total.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    
    devisData.totaux = { sousTotal, tva, total };
};

DocumentsManager.prototype.collectDevisData = function() {
    devisData.client = {
        nom: document.getElementById('client-nom').value,
        email: document.getElementById('client-email').value,
        adresse: document.getElementById('client-adresse').value,
        telephone: document.getElementById('client-telephone').value
    };
    devisData.numeroDevis = document.getElementById('numero-devis').value;
    devisData.produits = [];
    document.querySelectorAll('.product-line').forEach(function(line) {
        const id = line.dataset.id;
        const select = document.querySelector(`select[data-id="${id}"]`);
        const quantityInput = document.querySelector(`input.product-quantity[data-id="${id}"]`);
        if (select && select.value && quantityInput && quantityInput.value) {
            const produit = produitsBonVente[select.value];
            const quantity = parseInt(quantityInput.value);
            const total = produit.prix * quantity;
            devisData.produits.push({
                nom: produit.nom,
                prix: produit.prix,
                quantite: quantity,
                total: total
            });
        }
    });
};

DocumentsManager.prototype.cleanTextForPDF = function(text) {
    if (!text) return '';
    return String(text)
        .replace(/[àáâäã]/gi, 'a')
        .replace(/[èéêë]/gi, 'e')
        .replace(/[ìíîï]/gi, 'i')
        .replace(/[òóôöõ]/gi, 'o')
        .replace(/[ùúûü]/gi, 'u')
        .replace(/[ç]/gi, 'c')
        .replace(/[ñ]/gi, 'n')
        .replace(/[–—]/g, '-')
        .replace(/['']/g, "'")
        .replace(/[""]/g, '"')
        .replace(/[^\x20-\x7E\n\r\t]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

DocumentsManager.prototype.generateMarlowePDFFromTemplate = async function(devisData) {
    if (!templatePDF) {
        throw new Error('Template PDF non chargé');
    }
    try {
        const originalPdfBytes = await templatePDF.save();
        const pdfDoc = await PDFLib.PDFDocument.load(originalPdfBytes);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);

        const cleanNumero = this.cleanTextForPDF(devisData.numeroDevis);
        const cleanNom = this.cleanTextForPDF(devisData.client.nom);
        const cleanAdresse = this.cleanTextForPDF(devisData.client.adresse);
        const cleanEmail = this.cleanTextForPDF(devisData.client.email);
        const cleanTelephone = this.cleanTextForPDF(devisData.client.telephone);

        if (cleanNumero) {
            firstPage.drawText(`Devis N° ${cleanNumero}`, {
                x: 60, y: 743, size: 14, font: boldFont, color: PDFLib.rgb(1, 1, 1)
            });
        }

        if (cleanNom) {
            firstPage.drawText(cleanNom, {
                x: 60, y: 635, size: 11, font: boldFont, color: PDFLib.rgb(0, 0, 0)
            });
        }

        if (cleanAdresse) {
            try {
                const addressLines = cleanAdresse.split('\n').slice(0, 3);
                addressLines.forEach(function(line, index) {
                    if (line.trim()) {
                        firstPage.drawText(line.trim(), {
                            x: 60, y: 620 - (index * 15), size: 10, font: font, color: PDFLib.rgb(0, 0, 0)
                        });
                    }
                });
            } catch (e) {
                console.warn('⚠️ Erreur adresse:', e);
            }
        }

        let contactY = 605;
        if (cleanEmail) {
            try {
                firstPage.drawText(`Email: ${cleanEmail}`, {
                    x: 60, y: contactY, size: 10, font: font, color: PDFLib.rgb(0, 0, 0)
                });
                contactY -= 15;
            } catch (e) {
                console.warn('⚠️ Erreur email:', e);
            }
        }

        if (cleanTelephone) {
            try {
                firstPage.drawText(`Tel: ${cleanTelephone}`, {
                    x: 60, y: contactY, size: 10, font: font, color: PDFLib.rgb(0, 0, 0)
                });
            } catch (e) {
                console.warn('⚠️ Erreur téléphone:', e);
            }
        }

        let productY = 480;
        if (devisData.produits && Array.isArray(devisData.produits)) {
            devisData.produits.slice(0, 6).forEach(function(produit, index) {
                try {
                    const currentY = productY - (index * 22);
                    if (currentY > 250) {
                        const nomProduit = this.cleanTextForPDF(produit.nom);
                        const nomTronque = nomProduit.length > 30 ? nomProduit.substring(0, 27) + '...' : nomProduit;

                        firstPage.drawText(nomTronque, {
                            x: 77, y: currentY + 15, size: 10, font: font, color: PDFLib.rgb(0, 0, 0)
                        });
                        firstPage.drawText(`${produit.prix || 0}`, {
                            x: 257, y: currentY + 15, size: 10, font: font, color: PDFLib.rgb(0, 0, 0)
                        });
                        firstPage.drawText(`${produit.quantite || 1}`, {
                            x: 397, y: currentY + 15, size: 10, font: font, color: PDFLib.rgb(0, 0, 0)
                        });
                        firstPage.drawText(`${produit.total || 0}`, {
                            x: 467, y: currentY + 15, size: 10, font: font, color: PDFLib.rgb(0, 0, 0)
                        });
                    }
                } catch (e) {
                    console.warn('⚠️ Erreur produit', index, ':', e);
                }
            }.bind(this));
        }

        try {
            const totalsY = 335;
            const formatAmount = function(amount) {
                const num = parseFloat(amount) || 0;
                return Math.round(num * 100) / 100;
            };

            firstPage.drawText(`${formatAmount(devisData.totaux.sousTotal)}`, {
                x: 467, y: totalsY, size: 11, font: font, color: PDFLib.rgb(0, 0, 0)
            });
            firstPage.drawText(`${formatAmount(devisData.totaux.tva)}`, {
                x: 467, y: totalsY - 25, size: 11, font: font, color: PDFLib.rgb(0, 0, 0)
            });

            const totalText = `${formatAmount(devisData.totaux.total)}`;
            const totalTextWidth = boldFont.widthOfTextAtSize(totalText, 12);
            firstPage.drawText(totalText, {
                x: 520 - totalTextWidth - 10,
                y: totalsY - 70, 
                size: 12, 
                font: boldFont, 
                color: PDFLib.rgb(1, 1, 1)
            });
        } catch (e) {
            console.warn('⚠️ Erreur totaux:', e);
        }

        try {
            const today = new Date();
            const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
            firstPage.drawText(dateStr, {
                x: 335, y: 150, size: 10, font: font, color: PDFLib.rgb(0, 0, 0)
            });
        } catch (e) {
            console.warn('⚠️ Erreur date:', e);
        }

        console.log('✅ PDF généré avec succès');
        return pdfDoc;

    } catch (error) {
        console.error('❌ Erreur génération PDF:', error);
        throw new Error(`Erreur PDF: ${error.message}`);
    }
};

DocumentsManager.prototype.downloadPDF = async function(devisData) {
    try {
        const pdfDoc = await this.generateMarlowePDFFromTemplate(devisData);
        const pdfBytes = await pdfDoc.save();
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
        setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
        return filename;
    } catch (error) {
        console.error('❌ Erreur téléchargement PDF:', error);
        throw error;
    }
};

DocumentsManager.prototype.sendEmbedToDiscord = async function(devisData) {
    try {
        const safeData = {
            numero: String(devisData.numeroDevis || 'N/A'),
            client: String(devisData.client?.nom || 'Client'),
            email: String(devisData.client?.email || ''),
            telephone: String(devisData.client?.telephone || ''),
            adresse: String(devisData.client?.adresse || ''),
            total: parseFloat(devisData.totaux?.total || 0),
            sousTotal: parseFloat(devisData.totaux?.sousTotal || 0),
            tva: parseFloat(devisData.totaux?.tva || 0)
        };

        let produitsDescription = '';
        if (devisData.produits && Array.isArray(devisData.produits) && devisData.produits.length > 0) {
            devisData.produits.forEach(function(produit) {
                const nom = String(produit.nom || 'Produit');
                const qty = parseInt(produit.quantite) || 1;
                const prix = parseFloat(produit.prix) || 0;
                const total = parseFloat(produit.total) || 0;
                produitsDescription += `• **${nom}** (${qty}x) - ${prix.toFixed(2)} = ${total.toFixed(2)}\n`;
            });
        }

        let clientInfo = '';
        if (safeData.email) clientInfo += `📧 ${safeData.email}\n`;
        if (safeData.telephone) clientInfo += `📞 ${safeData.telephone}\n`;
        if (safeData.adresse) {
            const adresseFormatted = safeData.adresse.replace(/\n/g, ', ');
            clientInfo += `📍 ${adresseFormatted}`;
        }

        const embed = {
            title: "🍷 Nouveau Devis Marlowe Vineyard",
            description: `Devis généré automatiquement le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}`,
            color: 0x8B5A9F,
            fields: [
                {
                    name: "📋 Numéro de devis",
                    value: `\`${safeData.numero}\``,
                    inline: true
                },
                {
                    name: "👤 Client",
                    value: `**${safeData.client}**`,
                    inline: true
                },
                {
                    name: "💰 Montant total",
                    value: `**${safeData.total.toLocaleString('en-US', {minimumFractionDigits: 2})}**`,
                    inline: true
                }
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: "Marlowe Vineyard • Système de gestion",
                icon_url: null
            }
        };

        if (clientInfo.trim()) {
            embed.fields.push({
                name: "📇 Informations client",
                value: clientInfo.trim(),
                inline: false
            });
        }

        if (produitsDescription) {
            if (produitsDescription.length > 1000) {
                const lines = produitsDescription.split('\n');
                let truncated = '';
                for (let i = 0; i < lines.length && truncated.length < 900; i++) {
                    truncated += lines[i] + '\n';
                }
                if (lines.length > Math.floor(900 / 50)) {
                    truncated += `... et ${devisData.produits.length - Math.floor(900 / 50)} autres produits`;
                }
                produitsDescription = truncated;
            }

            embed.fields.push({
                name: `🛒 Produits commandés (${devisData.produits.length})`,
                value: produitsDescription,
                inline: false
            });
        }

        embed.fields.push({
            name: "🧮 Détail financier",
            value: `**Sous-total HT:** ${safeData.sousTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}\n` +
                    `**TVA (21%):** ${safeData.tva.toLocaleString('en-US', {minimumFractionDigits: 2})}\n` +
                    `**Total TTC:** ${safeData.total.toLocaleString('en-US', {minimumFractionDigits: 2})}`,
            inline: false
        });

        const payload = {
            content: "📋 **Nouveau devis créé !**\n> Un nouveau devis vient d'être généré et téléchargé automatiquement.",
            embeds: [embed],
            username: "Marlowe Vineyard",
            avatar_url: null
        };

        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erreur Discord:', response.status, errorText);
            throw new Error(`Discord error: ${response.status} - ${errorText}`);
        }

        console.log('✅ Embed détaillé envoyé avec succès sur Discord');
        return true;

    } catch (error) {
        console.error('❌ Erreur envoi Discord:', error);
        throw error;
    }
};

DocumentsManager.prototype.generateDevisComplete = async function() {
    if (!document.getElementById('client-nom').value.trim()) {
        window.notify.error('Formulaire incomplet', 'Le nom du client est requis.');
        return;
    }
    if (!document.getElementById('client-adresse').value.trim()) {
        window.notify.error('Formulaire incomplet', 'L\'adresse du client est requise.');
        return;
    }
    if (!templatePDF) {
        window.notify.error('Template manquant', 'Le template PDF n\'est pas chargé.');
        return;
    }

    let hasValidProducts = false;
    document.querySelectorAll('.product-line').forEach(function(line) {
        const id = line.dataset.id;
        const select = document.querySelector(`select[data-id="${id}"]`);
        if (select && select.value) hasValidProducts = true;
    });

    if (!hasValidProducts) {
        window.notify.error('Aucun produit', 'Veuillez sélectionner au moins un produit.');
        return;
    }

    this.collectDevisData();

    try {
        window.notify.info('Traitement en cours...', 'Génération du PDF...');
        const filename = await this.downloadPDF(devisData);
        window.notify.info('Notification Discord...', 'Envoi en cours...');
        await this.sendEmbedToDiscord(devisData);
        window.notify.success(
            'Devis créé avec succès !', 
            `• PDF téléchargé: ${filename}\n• Notification Discord envoyée\n• Devis ${devisData.numeroDevis} finalisé`
        );
        setTimeout(function() { 
            document.getElementById('devisModal').style.display = 'none';
        }, 3000);
    } catch (error) {
        console.error('❌ Erreur complète:', error);
        if (error.message.includes('Discord')) {
            window.notify.error('Erreur Discord', 'Le PDF a été téléchargé mais l\'envoi Discord a échoué.');
        } else {
            window.notify.error('Erreur de génération', error.message);
        }
    }
};

// ⭐ FONCTION PRINCIPALE POUR GÉNÉRER LES FACTURES ⭐
DocumentsManager.prototype.generateFactureComplete = async function() {
    console.log('🚀 Génération complète de la facture...');

    // Validations
    if (!document.getElementById('facture-client-nom')?.value?.trim()) {
        window.notify.error('Formulaire incomplet', 'Le nom du client est requis.');
        return;
    }

    if (!document.getElementById('facture-client-adresse')?.value?.trim()) {
        window.notify.error('Formulaire incomplet', 'L\'adresse du client est requise.');
        return;
    }

    if (!templateFacturePDF) {
        window.notify.error('Template manquant', 'Le template PDF facture n\'est pas chargé.');
        return;
    }

    // Vérification des produits
    let hasValidProducts = false;
    document.querySelectorAll('#facture-products-container .product-line').forEach(function(line) {
        const id = line.dataset.id;
        const select = document.querySelector(`#facture-products-container select[data-id="${id}"]`);
        if (select && select.value) hasValidProducts = true;
    });

    if (!hasValidProducts) {
        window.notify.error('Aucun produit', 'Veuillez sélectionner au moins un produit.');
        return;
    }

    // Collecte des données
    this.collectFactureData();
    console.log('📊 Données de la facture:', factureData);

    try {
        window.notify.info('Traitement en cours...', 'Génération du PDF facture...');

        const filename = await this.downloadFacturePDF(factureData);
        console.log('✅ PDF facture téléchargé:', filename);

        window.notify.info('Notification Discord...', 'Envoi en cours...');

        await this.sendFactureToDiscord(factureData);
        console.log('✅ Discord notifié pour la facture');

        window.notify.success(
            'Facture créée avec succès !', 
            `• PDF téléchargé: ${filename}\n• Notification Discord envoyée\n• Facture ${factureData.numeroFacture} émise`
        );

        setTimeout(() => this.closeFactureModal(), 3000);

    } catch (error) {
        console.error('❌ Erreur complète facture:', error);

        if (error.message.includes('Discord')) {
            window.notify.error('Erreur Discord', 'Le PDF a été téléchargé mais l\'envoi Discord a échoué.');
        } else {
            window.notify.error('Erreur de génération', error.message);
        }
    }
};

DocumentsManager.prototype.collectFactureData = function() {
    console.log('📊 Collecte des données facture...');
    
    factureData.client = {
        nom: document.getElementById('facture-client-nom')?.value || '',
        email: document.getElementById('facture-client-email')?.value || '',
        adresse: document.getElementById('facture-client-adresse')?.value || '',
        telephone: document.getElementById('facture-client-telephone')?.value || ''
    };
    
    factureData.numeroFacture = document.getElementById('numero-facture')?.value || '';
    factureData.produits = [];
    
    document.querySelectorAll('#facture-products-container .product-line').forEach(function(line) {
        const id = line.dataset.id;
        const select = document.querySelector(`#facture-products-container select[data-id="${id}"]`);
        const quantityInput = document.querySelector(`#facture-products-container input.product-quantity[data-id="${id}"]`);
        
        if (select && select.value && quantityInput && quantityInput.value) {
            const produit = produitsBonVente[select.value];
            const quantity = parseInt(quantityInput.value);
            const total = produit.prix * quantity;
            
            factureData.produits.push({
                nom: produit.nom,
                prix: produit.prix,
                quantite: quantity,
                total: total
            });
        }
    });
    
    console.log('✅ Données collectées:', factureData);
};

DocumentsManager.prototype.downloadFacturePDF = async function(factureData) {
    try {
        // Utilise le template FACTURE au lieu du template devis
        const pdfDoc = await this.generateFacturePDFFromTemplate(factureData);
        const pdfBytes = await pdfDoc.save();
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        
        const clientName = factureData.client.nom
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 20);
        
        const filename = `Facture_${factureData.numeroFacture}_${clientName}.pdf`;
        
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
        return filename;
        
    } catch (error) {
        console.error('❌ Erreur téléchargement PDF facture:', error);
        throw error;
    }
};

DocumentsManager.prototype.generateFacturePDFFromTemplate = async function(factureData) {
    if (!templateFacturePDF) {
        throw new Error('Template PDF facture non chargé');
    }

    try {
        console.log('📄 Début génération PDF facture...');

        const originalPdfBytes = await templateFacturePDF.save();
        const pdfDoc = await PDFLib.PDFDocument.load(originalPdfBytes);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);

        const cleanNom = this.cleanTextForPDF(factureData.client.nom);
        const cleanDate = new Date().toLocaleDateString('fr-FR');

        // 1. Numéro de facture (bulle de gauche sous FACTURE)
        const cleanNumero = this.cleanTextForPDF(factureData.numeroFacture);
        if (cleanNumero) {
            firstPage.drawText(cleanNumero, {
                x: 85, y: 695,
                size: 11, 
                font: boldFont, 
                color: PDFLib.rgb(0, 0, 0)
            });
        }

        // 2. Date (bulle de droite sous FACTURE)
        if (cleanDate) {
            firstPage.drawText(cleanDate, {
                x: 220, y: 695,
                size: 11, 
                font: font, 
                color: PDFLib.rgb(0, 0, 0)
            });
        }

        // 3. Informations client (coordonnées temporaires)
        if (cleanNom) {
            firstPage.drawText(cleanNom, {
                x: 425, y: 610,
                size: 11, font: boldFont, color: PDFLib.rgb(0, 0, 0)
            });
        }

        // Adresse client
        const cleanAdresse = this.cleanTextForPDF(factureData.client.adresse);
        if (cleanAdresse) {
            try {
                const addressLines = cleanAdresse.split('\n').slice(0, 3);
                const self = this;
                addressLines.forEach(function(line, index) {
                    if (line.trim()) {
                        firstPage.drawText(line.trim(), {
                            x: 425, y: 595 - (index * 15),
                            size: 10, font: font, color: PDFLib.rgb(0, 0, 0)
                        });
                    }
                });
            } catch (e) {
                console.warn('⚠️ Erreur adresse facture:', e);
            }
        }

        // Contact client
        const cleanEmail = this.cleanTextForPDF(factureData.client.email);
        const cleanTelephone = this.cleanTextForPDF(factureData.client.telephone);

        let contactY = 580;
        if (cleanEmail) {
            firstPage.drawText(`Email: ${cleanEmail}`, {
                x: 425, y: contactY,
                size: 10, font: font, color: PDFLib.rgb(0, 0, 0)
            });
            contactY -= 15;
        }

        if (cleanTelephone) {
            firstPage.drawText(`Tel: ${cleanTelephone}`, {
                x: 425, y: contactY,
                size: 10, font: font, color: PDFLib.rgb(0, 0, 0)
            });
        }

        // 4. Tableau des produits
        let productY = 492;
        if (factureData.produits && Array.isArray(factureData.produits)) {
            const self = this;
            factureData.produits.slice(0, 10).forEach(function(produit, index) {
                try {
                    const currentY = productY - (index * 34);

                    if (currentY > 150) {
                        const nomProduit = self.cleanTextForPDF(produit.nom);
                        const nomTronque = nomProduit.length > 35 ? nomProduit.substring(0, 32) + '...' : nomProduit;

                        // Description (colonne 1)
                        firstPage.drawText(nomTronque, {
                            x: 110, y: currentY,
                            size: 10, font: font, color: PDFLib.rgb(0, 0, 0)
                        });

                        // Prix (colonne 2)
                        firstPage.drawText(`$${produit.prix || 0}`, {
                            x: 285, y: currentY,
                            size: 10, font: font, color: PDFLib.rgb(0, 0, 0)
                        });

                        // Quantité (colonne 3)
                        firstPage.drawText(`${produit.quantite || 1}`, {
                            x: 388, y: currentY,
                            size: 10, font: font, color: PDFLib.rgb(0, 0, 0)
                        });

                        // Total (colonne 4)
                        firstPage.drawText(`$${produit.total || 0}`, {
                            x: 475, y: currentY,
                            size: 10, font: font, color: PDFLib.rgb(0, 0, 0)
                        });
                    }
                } catch (e) {
                    console.warn('⚠️ Erreur produit facture', index, ':', e);
                }
            });
        }

        // 5. Totaux
        try {
            const formatAmount = function(amount) {
                const num = parseFloat(amount) || 0;
                return Math.round(num * 100) / 100;
            };

            // Sous-total
            firstPage.drawText(`$${formatAmount(factureData.totaux.sousTotal)}`, {
                x: 480, y: 135,
                size: 11, font: font, color: PDFLib.rgb(0, 0, 0)
            });

            // TVA
            firstPage.drawText(`$${formatAmount(factureData.totaux.tva)}`, {
                x: 480, y: 110,
                size: 11, font: font, color: PDFLib.rgb(0, 0, 0)
            });

            // 5. Total final (dans la barre noire en bas)
            const totalText = `$${formatAmount(factureData.totaux.total)}`;
            const totalTextWidth = boldFont.widthOfTextAtSize(totalText, 14);
            firstPage.drawText(totalText, {
                x: 525 - totalTextWidth,
                y: 80,
                size: 14, 
                font: boldFont, 
                color: PDFLib.rgb(1, 1, 1)
            });

        } catch (e) {
            console.warn('⚠️ Erreur totaux facture:', e);
        }

        console.log('✅ PDF facture généré avec succès');
        return pdfDoc;

    } catch (error) {
        console.error('❌ Erreur génération PDF facture:', error);
        throw new Error(`Erreur PDF facture: ${error.message}`);
    }
};

DocumentsManager.prototype.sendFactureToDiscord = async function(factureData) {
    try {
        const safeData = {
            numero: String(factureData.numeroFacture || 'N/A'),
            client: String(factureData.client?.nom || 'Client'),
            email: String(factureData.client?.email || ''),
            telephone: String(factureData.client?.telephone || ''),
            adresse: String(factureData.client?.adresse || ''),
            total: parseFloat(factureData.totaux?.total || 0),
            sousTotal: parseFloat(factureData.totaux?.sousTotal || 0),
            tva: parseFloat(factureData.totaux?.tva || 0)
        };

        let produitsDescription = '';
        if (factureData.produits && Array.isArray(factureData.produits) && factureData.produits.length > 0) {
            factureData.produits.forEach(function(produit) {
                const nom = String(produit.nom || 'Produit');
                const qty = parseInt(produit.quantite) || 1;
                const prix = parseFloat(produit.prix) || 0;
                const total = parseFloat(produit.total) || 0;
                produitsDescription += `• **${nom}** (${qty}x) - ${prix.toFixed(2)}$ = ${total.toFixed(2)}$\n`;
            });
        }

        let clientInfo = '';
        if (safeData.email) clientInfo += `📧 ${safeData.email}\n`;
        if (safeData.telephone) clientInfo += `📞 ${safeData.telephone}\n`;
        if (safeData.adresse) {
            const adresseFormatted = safeData.adresse.replace(/\n/g, ', ');
            clientInfo += `📍 ${adresseFormatted}`;
        }

        const embed = {
            title: "🧾 Nouvelle Facture Marlowe Vineyard",
            description: `Facture générée automatiquement le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}`,
            color: 0x28a745, // Vert pour les factures (différent du violet des devis)
            fields: [
                {
                    name: "📋 Numéro de facture",
                    value: `\`${safeData.numero}\``,
                    inline: true
                },
                {
                    name: "👤 Client",
                    value: `**${safeData.client}**`,
                    inline: true
                },
                {
                    name: "💰 Montant total",
                    value: `**${safeData.total.toLocaleString('en-US', {minimumFractionDigits: 2})}$**`,
                    inline: true
                }
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: "Marlowe Vineyard • Système de facturation",
                icon_url: null
            }
        };

        if (clientInfo.trim()) {
            embed.fields.push({
                name: "📇 Informations client",
                value: clientInfo.trim(),
                inline: false
            });
        }

        if (produitsDescription) {
            if (produitsDescription.length > 1000) {
                const lines = produitsDescription.split('\n');
                let truncated = '';
                for (let i = 0; i < lines.length && truncated.length < 900; i++) {
                    truncated += lines[i] + '\n';
                }
                if (lines.length > Math.floor(900 / 50)) {
                    truncated += `... et ${factureData.produits.length - Math.floor(900 / 50)} autres produits`;
                }
                produitsDescription = truncated;
            }

            embed.fields.push({
                name: `🍷 Produits facturés (${factureData.produits.length})`,
                value: produitsDescription,
                inline: false
            });
        }

        embed.fields.push({
            name: "🧮 Détail financier",
            value: `**Sous-total HT:** ${safeData.sousTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}$\n` +
                    `**TVA (21%):** ${safeData.tva.toLocaleString('en-US', {minimumFractionDigits: 2})}$\n` +
                    `**Total TTC:** ${safeData.total.toLocaleString('en-US', {minimumFractionDigits: 2})}$`,
            inline: false
        });

        const payload = {
            content: "🧾 **Nouvelle facture émise !**\n> Une nouvelle facture vient d'être générée et téléchargée automatiquement.",
            embeds: [embed],
            username: "Marlowe Vineyard",
            avatar_url: null
        };

        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erreur Discord:', response.status, errorText);
            throw new Error(`Discord error: ${response.status} - ${errorText}`);
        }

        console.log('✅ Embed détaillé de facture envoyé avec succès sur Discord');
        return true;

    } catch (error) {
        console.error('❌ Erreur envoi Discord facture:', error);
        throw error;
    }
};

// === FONCTIONS FACTURE PDF ===
DocumentsManager.prototype.openFactureForm = function() {
    if (!templateFacturePDF) {
        window.notify.warning('Template manquant', 'Le template PDF facture n\'est pas encore chargé.');
        return;
    }
    const factureModal = document.getElementById('factureModal');
    if (factureModal) {
        factureModal.style.display = 'flex';
        this.resetFactureForm();
        this.generateFactureNumber();
        this.addFactureProductLine();
    } else {
        window.notify.warning('Modal introuvable', 'Le modal de facture n\'existe pas dans cette page.');
    }
};

DocumentsManager.prototype.closeFactureModal = function() {
    document.getElementById('factureModal').style.display = 'none';
};

DocumentsManager.prototype.generateFactureNumber = function() {
    const numeroFactureElement = document.getElementById('numero-facture');
    if (numeroFactureElement) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        numeroFactureElement.value = `FA${year}${month}${day}-${random}`;
    }
};

DocumentsManager.prototype.resetFactureForm = function() {
    const factureClientNom = document.getElementById('facture-client-nom');
    const factureClientEmail = document.getElementById('facture-client-email');
    const factureClientAdresse = document.getElementById('facture-client-adresse');
    const factureClientTelephone = document.getElementById('facture-client-telephone');
    const factureProductsContainer = document.getElementById('facture-products-container');
    
    if (factureClientNom) factureClientNom.value = '';
    if (factureClientEmail) factureClientEmail.value = '';
    if (factureClientAdresse) factureClientAdresse.value = '';
    if (factureClientTelephone) factureClientTelephone.value = '';
    if (factureProductsContainer) factureProductsContainer.innerHTML = '';
    
    factureProductCounter = 0;
    this.updateFactureTotals();
};

DocumentsManager.prototype.addFactureProductLine = function() {
    const container = document.getElementById('facture-products-container');
    if (!container) {
        console.log('Container facture-products-container non trouvé');
        return;
    }
    
    factureProductCounter++;
    const productLine = document.createElement('div');
    productLine.className = 'product-line';
    productLine.dataset.id = factureProductCounter;

    let buttonHTML = '';
    if (factureProductCounter > 1) {
        buttonHTML = `<button type="button" class="btn-remove-product" onclick="window.pageManager.documentsManager.removeFactureProductLine(${factureProductCounter})"><i class="fas fa-trash"></i></button>`;
    }

    let optionsHTML = window.dbManager ? window.dbManager.getProductsAsOptions() : '<option value="">Chargement...</option>';

    productLine.innerHTML = `
        <div class="product-line-header">
            <span class="product-number">Produit ${factureProductCounter}</span>
            ${buttonHTML}
        </div>
        <div class="form-row">
            <div class="form-group flex-2">
                <label class="form-label">Produit</label>
                <select class="form-select product-select" data-id="${factureProductCounter}" onchange="window.pageManager.documentsManager.updateFactureProductPrice(${factureProductCounter})">
                    ${optionsHTML}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Prix unitaire</label>
                <input type="text" class="form-input product-price" data-id="${factureProductCounter}" readonly>
            </div>
            <div class="form-group">
                <label class="form-label">Quantité</label>
                <input type="number" class="form-input product-quantity" data-id="${factureProductCounter}" min="1" value="1" onchange="window.pageManager.documentsManager.updateFactureLineTotal(${factureProductCounter})">
            </div>
            <div class="form-group">
                <label class="form-label">Total HT</label>
                <input type="text" class="form-input product-total" data-id="${factureProductCounter}" readonly>
            </div>
        </div>
    `;
    container.appendChild(productLine);
};

DocumentsManager.prototype.removeFactureProductLine = function(id) {
    const line = document.querySelector(`#facture-products-container [data-id="${id}"]`);
    if (line) {
        line.remove();
        this.updateFactureTotals();
    }
};

DocumentsManager.prototype.updateFactureProductPrice = function(id) {
    const select = document.querySelector(`#facture-products-container select[data-id="${id}"]`);
    const priceInput = document.querySelector(`#facture-products-container input.product-price[data-id="${id}"]`);
    if (select.value) {
        const prix = produitsBonVente[select.value].prix;
        priceInput.value = `${prix}.00`;
        this.updateFactureLineTotal(id);
    } else {
        priceInput.value = '';
        this.updateFactureLineTotal(id);
    }
};

DocumentsManager.prototype.updateFactureLineTotal = function(id) {
    const select = document.querySelector(`#facture-products-container select[data-id="${id}"]`);
    const quantityInput = document.querySelector(`#facture-products-container input.product-quantity[data-id="${id}"]`);
    const totalInput = document.querySelector(`#facture-products-container input.product-total[data-id="${id}"]`);
    if (select.value && quantityInput.value) {
        const prix = produitsBonVente[select.value].prix;
        const quantity = parseInt(quantityInput.value) || 0;
        const total = prix * quantity;
        totalInput.value = `${total.toLocaleString('en-US')}.00`;
    } else {
        totalInput.value = '';
    }
    this.updateFactureTotals();
};

DocumentsManager.prototype.updateFactureTotals = function() {
    let sousTotal = 0;
    document.querySelectorAll('#facture-products-container .product-line').forEach(function(line) {
        const id = line.dataset.id;
        const select = document.querySelector(`#facture-products-container select[data-id="${id}"]`);
        const quantityInput = document.querySelector(`#facture-products-container input.product-quantity[data-id="${id}"]`);
        if (select && select.value && quantityInput && quantityInput.value) {
            const prix = produitsBonVente[select.value].prix;
            const quantity = parseInt(quantityInput.value) || 0;
            sousTotal += prix * quantity;
        }
    });
    const tva = sousTotal * 0.21;
    const total = sousTotal + tva;
    
    const factureSousTotal = document.getElementById('facture-sous-total');
    const factureTvaMontant = document.getElementById('facture-tva-montant');
    const factureTotalFinal = document.getElementById('facture-total-final');
    
    if (factureSousTotal) factureSousTotal.textContent = `${sousTotal.toLocaleString('en-US')}.00`;
    if (factureTvaMontant) factureTvaMontant.textContent = `${tva.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    if (factureTotalFinal) factureTotalFinal.textContent = `${total.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    
    factureData.totaux = { sousTotal, tva, total };
};

// === GESTION BON DE VENTE ===
DocumentsManager.prototype.openBonVenteModal = function() {
    const modal = document.getElementById('bonVenteModal');
    const currentUser = SessionManager.getSession();
        
    if (!currentUser) {
        window.notify.error('Erreur', 'Vous devez être connecté pour créer un bon de vente');
        return;
    }
        
    const employeInput = document.getElementById('employeNom');
    if (employeInput) {
        employeInput.value = currentUser.fullname || currentUser.username;
    }
        
    const form = document.getElementById('bonVenteForm');
    if (form) form.reset();
        
    if (employeInput) {
        employeInput.value = currentUser.fullname || currentUser.username;
    }
        
    const totalInput = document.getElementById('totalVente');
    if (totalInput) totalInput.value = '';
        
    if (modal) modal.style.display = 'flex';
};

DocumentsManager.prototype.closeBonVenteModal = function() {
    const modal = document.getElementById('bonVenteModal');
    if (modal) {
        modal.style.display = 'none';
    }
        
    const form = document.getElementById('bonVenteForm');
    if (form) form.reset();
};

DocumentsManager.prototype.calculateBonVenteTotal = function() {
    const produitSelect = document.getElementById('produitVendu');
    const quantiteInput = document.getElementById('quantiteVendue');
    const totalInput = document.getElementById('totalVente');
        
    if (!produitSelect || !quantiteInput || !totalInput) return;
     
    const produitId = produitSelect.value;
    const quantite = parseInt(quantiteInput.value) || 0;
      
    if (produitId && quantite > 0) {
        const prix = produitsBonVente[produitId].prix;
        const total = prix * quantite;
        totalInput.value = `${total.toLocaleString()}`;
    } else {
        totalInput.value = '';
    }
};

DocumentsManager.prototype.submitBonVente = async function(formData) {
    const employeNom = formData.get('employeNom') || document.getElementById('employeNom')?.value;
    const produitId = formData.get('produitVendu') || document.getElementById('produitVendu')?.value;
    const quantite = parseInt(formData.get('quantiteVendue') || document.getElementById('quantiteVendue')?.value);
     
    if (!produitId || !quantite || quantite <= 0) {
        window.notify.error('Erreur', 'Veuillez remplir tous les champs correctement');
        return;
    }
    const produit = produitsBonVente[produitId];
    const total = produit.prix * quantite;
        
    const bonVenteData = {
        embeds: [{
            title: "🧾 Nouveau Bon de Vente",
            color: 0x8B5A9F,
            fields: [
                {
                    name: "👤 Employé",
                    value: employeNom,
                    inline: true
                },
                {
                    name: "🍷 Produit",
                    value: produit.nom,
                    inline: true
                },
                {
                    name: "📦 Quantité",
                    value: quantite.toString(),
                    inline: true
                },
                {
                    name: "💰 Prix unitaire",
                    value: `${produit.prix.toLocaleString()}`,
                    inline: true
                },
                {
                    name: "💵 Total",
                    value: `${total.toLocaleString()}`,
                    inline: true
                },
                {
                    name: "📅 Date",
                    value: new Date().toLocaleString('fr-FR'),
                    inline: true
                }
            ],
            footer: {
                text: "Marlowe Vineyard - Système de Vente"
            },
            timestamp: new Date().toISOString()
        }]
    };
        
    try {
        const response = await fetch(DISCORD_WEBHOOK_BON_VENTE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bonVenteData)
        });
            
        if (response.ok) {
            window.notify.success(
                'Bon de vente créé !', 
                `${quantite}x ${produit.nom} - Total: ${total.toLocaleString()}$ - Notification envoyée`
            );
            this.closeBonVenteModal();
                
            this.saveBonVenteLocally({
                id: `BV${Date.now()}`,
                employe: employeNom,
                produit: produit.nom,
                quantite: quantite,
                prixUnitaire: produit.prix,
                total: total,
                date: new Date().toISOString()
            });
                
        } else {
            throw new Error('Erreur lors de l\'envoi vers Discord');
        }
            
    } catch (error) {
        console.error('Erreur envoi Discord:', error);
        window.notify.error(
            'Erreur d\'envoi', 
            'Le bon de vente n\'a pas pu être envoyé sur Discord. Vérifiez votre connexion.'
        );
    }
};

DocumentsManager.prototype.saveBonVenteLocally = function(bonVente) {
    try {
        const bonsVente = JSON.parse(localStorage.getItem('marlowe_bons_vente') || '[]');
        bonsVente.push(bonVente);
        
        if (bonsVente.length > 100) {
            bonsVente.splice(0, bonsVente.length - 100);
        }
        
        localStorage.setItem('marlowe_bons_vente', JSON.stringify(bonsVente));
        console.log('✅ Bon de vente sauvegardé localement');
    } catch (error) {
        console.error('❌ Erreur sauvegarde locale:', error);
    }
};

// === GESTION BON DE LIVRAISON ===
DocumentsManager.prototype.openBonLivraisonModal = function() {
    const modal = document.getElementById('bonLivraisonModal');
    const currentUser = SessionManager.getSession();
        
    if (!currentUser) {
        window.notify.error('Erreur', 'Vous devez être connecté pour créer un bon de livraison');
        return;
    }
        
    const employeInput = document.getElementById('employeLivraison');
    if (employeInput) {
        employeInput.value = currentUser.fullname || currentUser.username;
    }
        
    const form = document.getElementById('bonLivraisonForm');
    if (form) form.reset();
        
    if (employeInput) {
        employeInput.value = currentUser.fullname || currentUser.username;
    }

    // Réinitialiser le conteneur de produits
    const container = document.getElementById('produits-livraison-container');
    if (container) {
        container.innerHTML = '';
        this.addProduitLivraisonLine(); // Ajouter une première ligne
    }
        
    if (modal) modal.style.display = 'flex';
};

DocumentsManager.prototype.closeBonLivraisonModal = function() {
    const modal = document.getElementById('bonLivraisonModal');
    if (modal) {
        modal.style.display = 'none';
    }
        
    const form = document.getElementById('bonLivraisonForm');
    if (form) form.reset();
};

DocumentsManager.prototype.addProduitLivraisonLine = function() {
    const container = document.getElementById('produits-livraison-container');
    if (!container) return;

    const lineId = Date.now(); // ID unique basé sur timestamp
    const line = document.createElement('div');
    line.className = 'produit-livraison-line';
    line.dataset.id = lineId;

    const optionsHTML = window.dbManager ? window.dbManager.getProductsAsOptions() : '<option value="">Chargement...</option>';

    line.innerHTML = `
        <div class="form-group">
            <label class="form-label">Produit</label>
            <select class="form-select produit-livraison-select" required>
                ${optionsHTML}
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">Quantité</label>
            <input type="number" class="form-input quantite-livraison" min="1" required placeholder="1">
        </div>
        <button type="button" class="btn-remove-produit" onclick="this.parentElement.remove()">
            <i class="fas fa-trash"></i>
        </button>
    `;

    container.appendChild(line);
};

DocumentsManager.prototype.submitBonLivraison = async function(formData) {
    const employeNom = document.getElementById('employeLivraison')?.value;
    const numeroCommande = document.getElementById('numeroCommande')?.value;
     
    if (!numeroCommande || !numeroCommande.trim()) {
        window.notify.error('Erreur', 'Veuillez renseigner le numéro de commande');
        return;
    }

    // Récupérer tous les produits
    const produits = [];
    const lines = document.querySelectorAll('.produit-livraison-line');
    
    lines.forEach(function(line) {
        const produitSelect = line.querySelector('.produit-livraison-select');
        const quantiteInput = line.querySelector('.quantite-livraison');
        
        if (produitSelect.value && quantiteInput.value && quantiteInput.value > 0) {
            produits.push({
                produit: produitSelect.options[produitSelect.selectedIndex].text,
                quantite: parseInt(quantiteInput.value)
            });
        }
    });

    if (produits.length === 0) {
        window.notify.error('Erreur', 'Veuillez ajouter au moins un produit');
        return;
    }

    // Créer la description des produits pour Discord
    let produitsDescription = '';
    produits.forEach(function(item) {
        produitsDescription += `• **${item.produit}** - Quantité: ${item.quantite}\n`;
    });
        
    const bonLivraisonData = {
        embeds: [{
            title: "🚚 Nouveau Bon de Livraison",
            color: 0x17a2b8,
            fields: [
                {
                    name: "👤 Employé",
                    value: employeNom,
                    inline: true
                },
                {
                    name: "📋 N° Commande",
                    value: numeroCommande,
                    inline: true
                },
                {
                    name: "📦 Produits livrés",
                    value: produitsDescription,
                    inline: false
                },
                {
                    name: "📅 Date de livraison",
                    value: new Date().toLocaleString('fr-FR'),
                    inline: true
                }
            ],
            footer: {
                text: "Marlowe Vineyard - Système de Livraison"
            },
            timestamp: new Date().toISOString()
        }]
    };
        
    try {
        // Utiliser le même webhook que les bons de vente
        const response = await fetch(DISCORD_WEBHOOK_BON_VENTE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bonLivraisonData)
        });
            
        if (response.ok) {
            window.notify.success(
                'Bon de livraison créé !', 
                `Commande ${numeroCommande} - ${produits.length} produit(s) - Notification envoyée`
            );
            this.closeBonLivraisonModal();
                
            this.saveBonLivraisonLocally({
                id: `BL${Date.now()}`,
                employe: employeNom,
                numeroCommande: numeroCommande,
                produits: produits,
                date: new Date().toISOString()
            });
                
        } else {
            throw new Error('Erreur lors de l\'envoi vers Discord');
        }
            
    } catch (error) {
        console.error('Erreur envoi Discord:', error);
        window.notify.error(
            'Erreur d\'envoi', 
            'Le bon de livraison n\'a pas pu être envoyé sur Discord. Vérifiez votre connexion.'
        );
    }
};

DocumentsManager.prototype.saveBonLivraisonLocally = function(bonLivraison) {
    try {
        const bonsLivraison = JSON.parse(localStorage.getItem('marlowe_bons_livraison') || '[]');
        bonsLivraison.push(bonLivraison);
        
        if (bonsLivraison.length > 100) {
            bonsLivraison.splice(0, bonsLivraison.length - 100);
        }
        
        localStorage.setItem('marlowe_bons_livraison', JSON.stringify(bonsLivraison));
        console.log('✅ Bon de livraison sauvegardé localement');
    } catch (error) {
        console.error('❌ Erreur sauvegarde locale:', error);
    }
};

// === GESTIONNAIRE DE PAGES ===
function PageManager() {
    this.currentPage = this.detectCurrentPage();
    this.commandesManager = null;
    this.documentsManager = null;
    this.initializePage();
}

PageManager.prototype.detectCurrentPage = function() {
    const path = window.location.pathname;
    const filename = path.split('/').pop().replace('.html', '');
    
    if (filename === '' || filename === 'index') return 'home';
    return filename;
};

PageManager.prototype.initializePage = async function() {
    console.log(`🔄 Initialisation de la page: ${this.currentPage}`);
    
    if (document.readyState === 'loading') {
        const self = this;
        document.addEventListener('DOMContentLoaded', function() {
            self.setupPage();
        });
    } else {
        this.setupPage();
    }
};

PageManager.prototype.setupPage = async function() {
    this.initCommonFeatures();
    
    switch (this.currentPage) {
        case 'login':
            await this.initLoginPage();
            break;
        case 'dashboard':
            await this.initDashboardPage();
            break;
        case 'inventaire':
            await this.initInventairePage();
            break;
        case 'commandes':
            await this.initCommandesPage();
            break;
        case 'documents':
            await this.initDocumentsPage();
            break;
        case 'configuration':
            await this.initConfigurationPage();
            break;
        default:
            this.initHomePage();
    }
};

PageManager.prototype.initCommonFeatures = function() {
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

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
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

    // Info cards animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.info-card').forEach(function(card) {
        observer.observe(card);
        
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.02)';
            this.style.background = '#ffffff';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.background = '#f8f9fa';
        });
    });

    // Particles animation
    const particles = document.querySelectorAll('.particle');
    particles.forEach(function(particle, index) {
        particle.style.animationDuration = (6 + Math.random() * 6) + 's';
        particle.style.animationDelay = (Math.random() * 3) + 's';
    });
};

PageManager.prototype.initLoginPage = async function() {
    console.log('🔐 Initialisation page Login');
    
    if (SessionManager.isLoggedIn()) {
        console.log('👤 Utilisateur déjà connecté, redirection...');
        if (window.notify) {
            window.notify.info('Déjà connecté', 'Redirection vers l\'intranet...');
        }
        setTimeout(function() {
            window.location.href = '../intranet/dashboard.html';
        }, 1000);
        return;
    }

    await window.dbManager.waitForReady();
    
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const accessCodeInput = document.getElementById('accessCode');
    
    let loginAttempts = 0;
    const maxAttempts = 3;
    let isTimedOut = false;

    const attemptLogin = async function() {
        if (isTimedOut) return;

        const username = usernameInput.value.trim().toLowerCase();
        const accessCode = accessCodeInput.value.trim();

        try {
            const users = window.dbManager.getUsers();
            const user = users[username];

            if (user && user.password === accessCode) {
                const sessionUserData = {
                    username: username,
                    fullname: user.fullname,
                    phone: user.phone,
                    grade: user.grade,
                    permissions: user.permissions || []
                };

                const sessionSaved = SessionManager.saveSession(sessionUserData);
                
                if (sessionSaved) {
                    window.notify.success('Connexion réussie !', 'Redirection vers l\'intranet...');
                    const loginButton = document.getElementById('loginButton');
                    if (loginButton) {
                        loginButton.innerHTML = '<i class="fas fa-check" style="margin-right: 0.5rem;"></i>Connexion réussie !';
                        loginButton.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
                    }
                    setTimeout(function() {
                        // Déterminer le bon chemin selon la localisation
                        const currentPath = window.location.pathname;
                        if (currentPath.includes('/public/')) {
                            window.location.href = '../intranet/dashboard.html';
                        } else {
                            window.location.href = './intranet/dashboard.html';
                        }
                    }, 1000);
                } else {
                    window.notify.error('Erreur de session', 'Impossible de sauvegarder la session.');
                }
            } else {
                loginAttempts++;
                const remainingAttempts = maxAttempts - loginAttempts;
                
                if (remainingAttempts > 0) {
                    window.notify.error('Identifiants incorrects', `${remainingAttempts} tentative(s) restante(s).`);
                    
                    const attemptsLeft = document.getElementById('attemptsLeft');
                    if (attemptsLeft) attemptsLeft.textContent = remainingAttempts;
                    
                    loginForm.style.animation = 'shake 0.5s ease-in-out';
                    setTimeout(function() {
                        loginForm.style.animation = '';
                    }, 500);
                } else {
                    isTimedOut = true;
                    window.notify.warning('Trop de tentatives', 'Veuillez patienter 60 secondes avant de réessayer.');
                    
                    setTimeout(function() {
                        isTimedOut = false;
                        loginAttempts = 0;
                        const attemptsLeft = document.getElementById('attemptsLeft');
                        if (attemptsLeft) attemptsLeft.textContent = maxAttempts;
                        window.notify.success('Timeout terminé', 'Vous pouvez maintenant vous reconnecter.');
                    }, 60000);
                }
                
                accessCodeInput.value = '';
                accessCodeInput.focus();
            }
        } catch (error) {
            console.error('❌ Erreur lors de la connexion:', error);
            window.notify.error('Erreur système', 'Veuillez réessayer.');
        }
    };

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            attemptLogin();
        });
    }

    if (usernameInput) {
        usernameInput.focus();
    }
};

PageManager.prototype.initDashboardPage = async function() {
    console.log('📊 Initialisation page Dashboard');
    
    this.setupLogoutButton();

    const widgets = document.querySelectorAll('.info-card');
    widgets.forEach(function(widget, index) {
        widget.style.opacity = '0';
        widget.style.transform = 'translateY(20px)';
        
        setTimeout(function() {
            widget.style.transition = 'all 0.6s ease';
            widget.style.opacity = '1';
            widget.style.transform = 'translateY(0)';
        }, index * 100);
    });
};

PageManager.prototype.initInventairePage = async function() {
    console.log('📦 Initialisation page Inventaire');
    
    await window.dbManager.waitForReady();
    
    let currentCategory = '';
    let inventoryData = {};

    const loadInventory = function() {
        try {
            inventoryData = window.dbManager.getInventory();
            updateInventoryTables();
        } catch (error) {
            console.error('❌ Erreur lors du chargement de l\'inventaire:', error);
            if (window.notify) {
                window.notify.error('Erreur', 'Impossible de charger l\'inventaire.');
            }
        }
    };

    const updateInventoryTables = function() {
        updateTable('matieres');
        updateTable('bouteilles');
    };

    const updateTable = function(category) {
        const tbody = document.getElementById(category + '-table');
        if (!tbody) return;
        
        const data = inventoryData[category] || {};
        tbody.innerHTML = '';
        
        if (Object.keys(data).length === 0) {
            const colspan = category === 'matieres' ? '4' : '5';
            tbody.innerHTML = `
                <tr>
                    <td colspan="${colspan}" style="text-align: center; padding: 2rem; color: #666;">
                        Aucun produit dans cette catégorie. Cliquez sur "Ajouter Produit" pour commencer.
                    </td>
                </tr>
            `;
            return;
        }

        Object.entries(data).forEach(function([productId, product]) {
            const row = document.createElement('tr');
            
            const thresholds = window.getStockThresholds ? window.getStockThresholds()[category] : {
                critical: category === 'matieres' ? 50 : 30,
                warning: category === 'matieres' ? 100 : 75
            };

            let statusClass = 'status-good';
            let statusText = 'Bon Stock';
            
            if (product.stock < thresholds.critical) {
                statusClass = 'status-critical';
                statusText = 'Stock Critique';
            } else if (product.stock < thresholds.warning) {
                statusClass = 'status-warning';
                statusText = 'Stock Faible';
            }

            if (category === 'matieres') {
                row.innerHTML = `
                    <td><strong>${product.name}</strong></td>
                    <td class="stock-value">${product.stock.toLocaleString()}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn-small btn-danger delete-product-btn" 
                                data-category="${category}" 
                                data-product-id="${productId}"
                                title="Supprimer ${product.name}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
            } else {
                row.innerHTML = `
                    <td><strong>${product.name}</strong></td>
                    <td class="stock-value">${product.stock.toLocaleString()}</td>
                    <td>${product.price.toLocaleString()}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn-small btn-danger delete-product-btn" 
                                data-category="${category}" 
                                data-product-id="${productId}"
                                title="Supprimer ${product.name}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
            }
            
            tbody.appendChild(row);
        });
    };

    this.setupInventoryEventListeners(currentCategory, loadInventory);
    this.setupLogoutButton();
    
    loadInventory();
};

PageManager.prototype.initCommandesPage = async function() {
    console.log('🛒 Initialisation page Commandes');
    
    this.commandesManager = new CommandesManager();
    
    this.setupCommandesEventListeners();
    this.setupLogoutButton();
    
    this.commandesManager.displayCommandes();
};

PageManager.prototype.initDocumentsPage = async function() {
    console.log('📄 Initialisation page Documents');
    
    this.documentsManager = new DocumentsManager();
    
    const currentUser = SessionManager.getSession();
    const hasInternalAccess = currentUser?.permissions?.includes('documents_internal') || false;
    
    const internalSection = document.getElementById('internal-documents-section');
    if (internalSection) {
        if (!hasInternalAccess) {
            internalSection.style.display = 'none';
            console.log('🚫 Accès refusé aux documents internes - Section cachée');
        } else {
            internalSection.style.display = 'block';
            console.log('✅ Accès autorisé aux documents internes - Section visible');
        }
    }

    this.setupDocumentsEventListeners();
    this.setupLogoutButton();
};

PageManager.prototype.initConfigurationPage = async function() {
    console.log('⚙️ Initialisation page Configuration');
    
    await window.dbManager.waitForReady();
    
    let currentUsers = {};
    let currentConfig = {};

    const updateUsersTable = function() {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        if (Object.keys(currentUsers).length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="loading-message">Aucun utilisateur trouvé</td></tr>';
            return;
        }

        Object.entries(currentUsers).forEach(function([username, user]) {
            const gradeInfo = window.dbManager.getGradeInfo(user.grade);
            
            const permissionBadges = (user.permissions || []).map(function(perm) {
                const permInfo = window.dbManager.getPermissionInfo(perm);
                return `<span class="permission-badge" title="${permInfo.description || ''}">${permInfo.icon} ${permInfo.label}</span>`;
            }).join('');

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${username}</strong></td>
                <td>${user.fullname || ''}</td>
                <td>${user.phone || ''}</td>
                <td>
                    <span class="grade-badge" style="
                        background: ${gradeInfo.background}; 
                        color: ${gradeInfo.color};
                        ${gradeInfo.border ? 'border: ' + gradeInfo.border + ';' : ''}
                    ">
                        ${gradeInfo.label}
                    </span>
                </td>
                <td>
                    <div class="permissions-list">
                        ${permissionBadges || '<span style="color: #999; font-style: italic;">Aucune permission</span>'}
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    };

    this.setupConfigurationEventListeners(currentUsers, currentConfig, updateUsersTable);
    this.setupLogoutButton();
    
    currentUsers = window.dbManager.getUsers();
    updateUsersTable();
};

PageManager.prototype.initHomePage = function() {
    console.log('🏠 Initialisation page d\'accueil');
};
