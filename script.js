/* === SCRIPT.JS - MARLOWE VINEYARD COMPLET === */

// === SYSTÈME DE SESSION ===
class SessionManager {
    static SESSION_KEY = 'marlowe_user_session';
    static SESSION_TIMEOUT = 60 * 60 * 1000; // 1 heure

    static saveSession(userData) {
        const sessionData = {
            user: userData,
            loginTime: Date.now(),
            expiresAt: Date.now() + this.SESSION_TIMEOUT
        };
        
        try {
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
            console.log('✅ Session sauvegardée:', userData.username);
            return true;
        } catch (error) {
            console.error('❌ Erreur sauvegarde session:', error);
            return false;
        }
    }

    static getSession() {
        try {
            const sessionData = localStorage.getItem(this.SESSION_KEY);
            if (!sessionData) return null;

            const parsed = JSON.parse(sessionData);
            
            if (Date.now() > parsed.expiresAt) {
                console.log('⏰ Session expirée');
                this.clearSession();
                return null;
            }

            return parsed.user;
        } catch (error) {
            console.error('❌ Erreur récupération session:', error);
            return null;
        }
    }

    static clearSession() {
        try {
            localStorage.removeItem(this.SESSION_KEY);
            console.log('🗑️ Session supprimée');
            return true;
        } catch (error) {
            console.error('❌ Erreur suppression session:', error);
            return false;
        }
    }

    static isLoggedIn() {
        return this.getSession() !== null;
    }

    static renewSession() {
        const currentSession = this.getSession();
        if (currentSession) {
            this.saveSession(currentSession);
        }
    }
}

// === SYSTÈME DE NOTIFICATIONS ===
class NotificationSystem {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
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

        this.container.appendChild(notification);

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.remove(notification);
        });

        setTimeout(() => {
            this.remove(notification);
        }, duration);

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

// === DATABASE MANAGER ===
class DatabaseManager {
    constructor() {
        this.DB_VERSION = '1.0';
        this.INVENTORY_KEY = 'marlowe_inventory';
        this.data = {};
        this.isReady = false;
        
        this.init();
    }

    async init() {
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
    }

    async loadFromJSON() {
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
    }

    initInventory() {
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
    }

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

    updateGlobalConfig() {
        if (this.data.configuration) {
            window.globalConfig = this.data.configuration;
            console.log('⚙️ Configuration globale mise à jour depuis la DB');
        }
    }

    async waitForReady() {
        while (!this.isReady) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return true;
    }

    // === GESTION DES UTILISATEURS ===
    getUsers() {
        return this.data.users || {};
    }

    getUser(username) {
        return this.data.users?.[username] || null;
    }

    // === GESTION DE L'INVENTAIRE ===
    getInventory() {
        return this.data.inventory || { matieres: {}, bouteilles: {} };
    }

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

    // === GESTION DU SYSTÈME ET GRADES ===
    getGrades() {
        return this.data.system?.grades || {
            employe: { label: "Employé", color: "#1976d2", background: "#e3f2fd" },
            manager: { label: "Manager", color: "#f57c00", background: "#fff3e0" },
            cfo: { label: "CFO", color: "#7b1fa2", background: "#f3e5f5" },
            ceo: { label: "CEO", color: "#c62828", background: "#ffebee", border: "2px solid #c62828" }
        };
    }

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

    getGradeInfo(grade) {
        const grades = this.getGrades();
        return grades[grade] || { label: grade.toUpperCase(), color: "#666", background: "#f0f0f0" };
    }

    getPermissionInfo(permission) {
        const permissions = this.getPermissions();
        return permissions[permission] || { label: permission, icon: "🔧" };
    }

    getConfiguration() {
        return this.data.configuration || {
            thresholds: { matieres: { critical: 50, warning: 100 }, bouteilles: { critical: 30, warning: 75 } },
            notifications: { duration: 4, soundEnabled: true },
            system: { sessionTimeout: 60, theme: 'light' }
        };
    }

    getStatistics() {
        return this.data.statistics || {
            sales: { monthly: 0, bottlesSold: 0, growth: 0 },
            documents: { devis: 0, factures: 0, livraisons: 0, rapports: 0 }
        };
    }

    getDatabaseInfo() {
        return {
            version: this.DB_VERSION,
            lastUpdate: this.data.lastUpdate,
            usersCount: Object.keys(this.data.users || {}).length,
            dataSize: JSON.stringify(this.data).length
        };
    }
}

// === GESTIONNAIRE DE PAGES ===
class PageManager {
    constructor() {
        this.currentPage = this.detectCurrentPage();
        this.initializePage();
    }

    detectCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().replace('.html', '');
        
        if (filename === '' || filename === 'index') return 'home';
        return filename;
    }

    async initializePage() {
        console.log(`🔄 Initialisation de la page: ${this.currentPage}`);
        
        // Attendre que le DOM soit prêt
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupPage());
        } else {
            this.setupPage();
        }
    }

    async setupPage() {
        // Initialiser les fonctionnalités communes
        this.initCommonFeatures();
        
        // Initialiser les fonctionnalités spécifiques à la page
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
    }

    initCommonFeatures() {
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

        // Info cards animations
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

        document.querySelectorAll('.info-card').forEach(card => {
            observer.observe(card);
            
            // Hover effects
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
        particles.forEach((particle, index) => {
            particle.style.animationDuration = (6 + Math.random() * 6) + 's';
            particle.style.animationDelay = (Math.random() * 3) + 's';
        });
    }

    // === PAGES SPÉCIFIQUES ===
    
    async initLoginPage() {
        console.log('🔐 Initialisation page Login');
        
        // Vérifier si déjà connecté
        if (SessionManager.isLoggedIn()) {
            console.log('👤 Utilisateur déjà connecté, redirection...');
            if (window.notify) {
                window.notify.info('Déjà connecté', 'Redirection vers l\'intranet...');
            }
            setTimeout(() => {
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

        const attemptLogin = async () => {
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
                        setTimeout(() => {
                            window.location.href = '../intranet/dashboard.html';
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
                        setTimeout(() => {
                            loginForm.style.animation = '';
                        }, 500);
                    } else {
                        // Timeout
                        isTimedOut = true;
                        window.notify.warning('Trop de tentatives', 'Veuillez patienter 60 secondes avant de réessayer.');
                        
                        setTimeout(() => {
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
    }

    async initDashboardPage() {
        console.log('📊 Initialisation page Dashboard');
        
        // Gestion de la déconnexion
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                const confirmNotification = window.notify.info(
                    'Confirmation de déconnexion', 
                    'Êtes-vous sûr de vouloir vous déconnecter ?', 
                    10000
                );
                
                window.addConfirmationButtons(confirmNotification, () => {
                    window.notify.info('Déconnexion en cours', 'Redirection vers l\'accueil...');
                    SessionManager.clearSession();
                    setTimeout(() => {
                        window.location.href = '../index.html';
                    }, 1000);
                }, 'Déconnexion');
            });
        }

        // Animation d'entrée pour les widgets
        const widgets = document.querySelectorAll('.info-card');
        widgets.forEach((widget, index) => {
            widget.style.opacity = '0';
            widget.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                widget.style.transition = 'all 0.6s ease';
                widget.style.opacity = '1';
                widget.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    async initInventairePage() {
        console.log('📦 Initialisation page Inventaire');
        
        await window.dbManager.waitForReady();
        
        let currentCategory = '';
        let inventoryData = {};

        const loadInventory = () => {
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

        const updateInventoryTables = () => {
            updateTable('matieres');
            updateTable('bouteilles');
        };

        const updateTable = (category) => {
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

            Object.entries(data).forEach(([productId, product]) => {
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
                        <td>$${product.price.toLocaleString()}</td>
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

        // Fonctions de gestion des modals
        const openAddProductModal = () => {
            const modal = document.getElementById('addProductModal');
            const priceGroup = document.getElementById('priceGroup');
            
            if (currentCategory === 'bouteilles') {
                priceGroup.style.display = 'block';
                document.getElementById('productPrice').required = true;
            } else {
                priceGroup.style.display = 'none';
                document.getElementById('productPrice').required = false;
            }
            
            modal.style.display = 'flex';
        };

        const openStockModal = () => {
            const modal = document.getElementById('stockModal');
            const productSelect = document.getElementById('productSelect');
            
            productSelect.innerHTML = '<option value="">Sélectionnez un produit</option>';
            
            Object.entries(inventoryData[currentCategory] || {}).forEach(([productId, product]) => {
                const option = document.createElement('option');
                option.value = productId;
                option.textContent = product.name;
                productSelect.appendChild(option);
            });
            
            modal.style.display = 'flex';
        };

        const closeModals = () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
            
            const addForm = document.getElementById('addProductForm');
            const stockForm = document.getElementById('stockForm');
            if (addForm) addForm.reset();
            if (stockForm) stockForm.reset();
            
            const currentStock = document.getElementById('currentStock');
            const stockNote = document.getElementById('stockNote');
            if (currentStock) currentStock.textContent = '0';
            if (stockNote) stockNote.value = '';
        };

        // Event listeners
        document.querySelectorAll('.inventory-action-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                currentCategory = this.dataset.category;
                const action = this.dataset.action;
                
                if (action === 'add') {
                    openAddProductModal();
                } else if (action === 'modify') {
                    openStockModal();
                }
            });
        });

        // Gestion suppression par délégation d'événements
        document.addEventListener('click', function(e) {
            const deleteBtn = e.target.closest('.delete-product-btn');
            if (deleteBtn) {
                e.preventDefault();
                e.stopPropagation();
                
                const category = deleteBtn.dataset.category;
                const productId = deleteBtn.dataset.productId;
                
                if (category && productId && inventoryData[category] && inventoryData[category][productId]) {
                    const product = inventoryData[category][productId];
                    
                    const confirmNotification = window.notify.warning(
                        'Supprimer le produit', 
                        `Voulez-vous vraiment supprimer "${product.name}" ?`, 
                        10000
                    );
                    
                    window.addConfirmationButtons(confirmNotification, () => {
                        const success = window.dbManager.removeProduct(category, productId);
                        if (success) {
                            loadInventory();
                            window.notify.success('Produit supprimé', `${product.name} a été supprimé de l'inventaire.`);
                        } else {
                            window.notify.error('Erreur', 'Impossible de supprimer le produit.');
                        }
                    }, 'Supprimer');
                }
            }
        });

        // Modals close
        document.querySelectorAll('.modal-close, .cancel-btn').forEach(btn => {
            btn.addEventListener('click', closeModals);
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeModals();
                }
            });
        });

        // Formulaire ajout produit
        const addProductForm = document.getElementById('addProductForm');
        if (addProductForm) {
            addProductForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const name = document.getElementById('productName').value.trim();
                const stock = parseInt(document.getElementById('initialStock').value);
                const price = parseFloat(document.getElementById('productPrice').value) || 0;
                
                if (!name || stock < 0) {
                    window.notify.error('Erreur', 'Veuillez remplir correctement tous les champs.');
                    return;
                }

                const productId = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                
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
                    loadInventory();
                    closeModals();
                    window.notify.success('Produit ajouté', `${name} a été ajouté à l'inventaire.`);
                } else {
                    window.notify.error('Erreur', 'Impossible d\'ajouter le produit.');
                }
            });
        }

        // Formulaire stock
        const stockForm = document.getElementById('stockForm');
        if (stockForm) {
            stockForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const productId = document.getElementById('productSelect').value;
                const newStock = parseInt(document.getElementById('newStock').value);
                const note = document.getElementById('stockNote').value.trim();
                
                if (!productId || newStock < 0) {
                    window.notify.error('Erreur', 'Veuillez sélectionner un produit et entrer un stock valide.');
                    return;
                }

                const success = window.dbManager.updateStock(currentCategory, productId, newStock);
                
                if (success) {
                    loadInventory();
                    closeModals();
                    
                    const productName = inventoryData[currentCategory][productId].name;
                    const message = note ? 
                        `Stock de ${productName} mis à jour: ${newStock.toLocaleString()} (${note})` :
                        `Stock de ${productName} mis à jour: ${newStock.toLocaleString()}`;
                    
                    window.notify.success('Stock mis à jour', message);
                } else {
                    window.notify.error('Erreur', 'Impossible de mettre à jour le stock.');
                }
            });
        }

        // Changement de sélection produit
        const productSelect = document.getElementById('productSelect');
        if (productSelect) {
            productSelect.addEventListener('change', function() {
                const productId = this.value;
                if (productId && inventoryData[currentCategory][productId]) {
                    document.getElementById('currentStock').textContent = 
                        inventoryData[currentCategory][productId].stock.toLocaleString();
                    document.getElementById('newStock').value = inventoryData[currentCategory][productId].stock;
                }
            });
        }

        // Déconnexion
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                const confirmNotification = window.notify.info(
                    'Confirmation de déconnexion', 
                    'Êtes-vous sûr de vouloir vous déconnecter ?', 
                    10000
                );
                
                window.addConfirmationButtons(confirmNotification, () => {
                    window.notify.info('Déconnexion en cours', 'Redirection vers l\'accueil...');
                    SessionManager.clearSession();
                    setTimeout(() => {
                        window.location.href = '../index.html';
                    }, 1000);
                }, 'Déconnexion');
            });
        }

        // Charger l'inventaire
        loadInventory();
    }

    async initCommandesPage() {
        console.log('🛒 Initialisation page Commandes');
        
        // Variables pour les commandes
        const DISCORD_WEBHOOK_COMMANDES = 'https://l.webhook.party/hook/%2FM4rBgChCMU4C0h64KaEOZnDRAtwERxORTQ26Ys6%2BsiMGlLBJo3FQUJehclFhqZRoK51sIMpwIPlVGtQgawTjjH8udxL8Z%2Bpqh57S6pZtkybo8l5420APyeP%2FnhOj0fwOpF6hStUvNUY%2BzSIDjBsQ6lW4JFweXO5jxuhxAOK845Yw6tWXN5nnbpmzeT7DkejC%2FEIycugAJWINo%2B3zGkptzJGO%2FjoFAvF5kmoCCnO%2FP6Zfz54tRzfuHMckUvQUxGUicFd9zlGKytPaJ6cr5Ll%2F4TNerWzV1g7Ow6JASwAG1q23CwWU1RkH1NEY81A942QBtaZsy4NSodqA9EpDwFhLdmBMOMTbXyqgJuaoQ4X%2B74gqwXJvO3D2tV%2BctcrG%2FUSataMw9VjUpQ%3D/pPrmw%2FZCVchUkDLD';
        
        const produits = {
            'marlowe-rouge': { nom: 'Marlowe Rouge Reserve', prix: 450 },
            'marlowe-blanc': { nom: 'Marlowe Blanc Premium', prix: 380 },
            'marlowe-prestige': { nom: 'Marlowe Prestige', prix: 850 },
            'marlowe-rose': { nom: 'Marlowe Rose', prix: 320 },
            'marlowe-vintage': { nom: 'Marlowe Vintage', prix: 1200 },
            'coffret-degustation': { nom: 'Coffret Degustation', prix: 1800 }
        };

        let commandes = [];
        let commandeProductCounter = 0;
        let commandeData = { client: {}, livraison: {}, produits: [], totaux: { sousTotal: 0, tva: 0, total: 0 } };
        let currentPreparation = null;
        let deliveryCheckInterval = null;

        // Fonctions utilitaires
        const generateCommandeNumber = () => {
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            return `CMD${year}${month}${day}-${random}`;
        };

        const saveCommandes = () => {
            try {
                localStorage.setItem('marlowe_commandes', JSON.stringify(commandes));
                console.log('💾 Commandes sauvegardées:', commandes.length);
            } catch (error) {
                console.error('❌ Erreur sauvegarde commandes:', error);
            }
        };

        const loadCommandes = () => {
            try {
                const stored = localStorage.getItem('marlowe_commandes');
                if (stored) {
                    commandes = JSON.parse(stored);
                    console.log('📂 Commandes chargées:', commandes.length);
                } else {
                    commandes = [];
                }
            } catch (error) {
                console.error('❌ Erreur chargement commandes:', error);
                commandes = [];
            }
        };

        // Charger les commandes
        loadCommandes();

        // Event listeners pour les modals
        const nouvelleCommandeBtn = document.getElementById('nouvelleCommandeBtn');
        if (nouvelleCommandeBtn) {
            nouvelleCommandeBtn.onclick = () => {
                document.getElementById('commandeModal').style.display = 'flex';
                // Reset form et initialisation
                commandeProductCounter = 0;
                document.getElementById('commande-products-container').innerHTML = '';
                addCommandeProductLine();
            };
        }

        // Autres event listeners...
        const closeCommandeModal = document.getElementById('closeCommandeModal');
        if (closeCommandeModal) {
            closeCommandeModal.onclick = () => {
                document.getElementById('commandeModal').style.display = 'none';
            };
        }

        // Déconnexion
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                const confirmNotification = window.notify.info(
                    'Confirmation de déconnexion', 
                    'Êtes-vous sûr de vouloir vous déconnecter ?', 
                    10000
                );
                
                window.addConfirmationButtons(confirmNotification, () => {
                    window.notify.info('Déconnexion en cours', 'Redirection vers l\'accueil...');
                    SessionManager.clearSession();
                    setTimeout(() => {
                        window.location.href = '../index.html';
                    }, 1000);
                }, 'Déconnexion');
            });
        }

        // Fonction pour ajouter une ligne de produit
        const addCommandeProductLine = () => {
            commandeProductCounter++;
            const container = document.getElementById('commande-products-container');
            
            const productLine = document.createElement('div');
            productLine.className = 'product-line';
            productLine.dataset.id = commandeProductCounter;
            
            let optionsHTML = '<option value="">Sélectionnez un produit</option>';
            Object.entries(produits).forEach(([key, prod]) => {
                optionsHTML += `<option value="${key}">${prod.nom} - ${prod.prix}</option>`;
            });
            
            productLine.innerHTML = `
                <div class="product-line-header">
                    <span class="product-number">Produit ${commandeProductCounter}</span>
                    ${commandeProductCounter > 1 ? `<button type="button" class="btn-remove-product"><i class="fas fa-trash"></i></button>` : ''}
                </div>
                <div class="form-row">
                    <div class="form-group flex-2">
                        <label class="form-label">Produit</label>
                        <select class="form-select product-select" data-id="${commandeProductCounter}">
                            ${optionsHTML}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Prix unitaire</label>
                        <input type="text" class="form-input product-price" data-id="${commandeProductCounter}" readonly>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Quantité</label>
                        <input type="number" class="form-input product-quantity" data-id="${commandeProductCounter}" min="1" value="1">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Total HT</label>
                        <input type="text" class="form-input product-total" data-id="${commandeProductCounter}" readonly>
                    </div>
                </div>
            `;
            
            container.appendChild(productLine);
        };

        // Event listener pour ajouter un produit
        const addCommandeProductBtn = document.getElementById('addCommandeProductBtn');
        if (addCommandeProductBtn) {
            addCommandeProductBtn.onclick = addCommandeProductLine;
        }

        // Simple affichage des commandes
        const displayCommandes = () => {
            const container = document.getElementById('commandesContainer');
            if (!container) return;
            
            if (commandes.length === 0) {
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
            
            commandes.forEach(commande => {
                const commandeCard = document.createElement('div');
                commandeCard.className = 'commande-card';
                
                commandeCard.innerHTML = `
                    <div class="commande-header">
                        <div class="commande-numero">${commande.id}</div>
                        <div class="commande-date">Créée le ${new Date(commande.dateCreation).toLocaleDateString('fr-FR')}</div>
                    </div>
                    <div class="commande-client">
                        <h4><i class="fas fa-user"></i> ${commande.client.nom}</h4>
                    </div>
                    <div class="commande-total">
                        Total: ${commande.totaux.total.toLocaleString('en-US', {minimumFractionDigits: 2})} TTC
                    </div>
                `;
                
                container.appendChild(commandeCard);
            });
        };

        // Afficher les commandes
        displayCommandes();
    }

    async initDocumentsPage() {
        console.log('📄 Initialisation page Documents');
        
        // Vérification des permissions
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

        // Gestion des boutons documents
        document.querySelectorAll('.document-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const documentType = this.dataset.document;
                
                if (documentType === 'devis' || documentType === 'facture') {
                    window.notify.info('Fonctionnalité', 'Génération de documents en développement');
                } else {
                    window.notify.info('En préparation', 'Cette fonctionnalité sera bientôt disponible !');
                }
            });
        });

        // Déconnexion
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                const confirmNotification = window.notify.info(
                    'Confirmation de déconnexion', 
                    'Êtes-vous sûr de vouloir vous déconnecter ?', 
                    10000
                );
                
                window.addConfirmationButtons(confirmNotification, () => {
                    window.notify.info('Déconnexion en cours', 'Redirection vers l\'accueil...');
                    SessionManager.clearSession();
                    setTimeout(() => {
                        window.location.href = '../index.html';
                    }, 1000);
                }, 'Déconnexion');
            });
        }
    }

    async initConfigurationPage() {
        console.log('⚙️ Initialisation page Configuration');
        
        await window.dbManager.waitForReady();
        
        let currentUsers = {};
        let currentConfig = {};

        const updateUsersTable = () => {
            const tbody = document.getElementById('usersTableBody');
            if (!tbody) return;
            
            tbody.innerHTML = '';

            if (Object.keys(currentUsers).length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="loading-message">Aucun utilisateur trouvé</td></tr>';
                return;
            }

            Object.entries(currentUsers).forEach(([username, user]) => {
                const gradeInfo = window.dbManager.getGradeInfo(user.grade);
                
                const permissionBadges = (user.permissions || []).map(perm => {
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

        const loadConfiguration = () => {
            currentConfig = window.dbManager.getConfiguration();
            
            const elements = {
                'critical-matieres': currentConfig.thresholds.matieres?.critical || 50,
                'warning-matieres': currentConfig.thresholds.matieres?.warning || 100,
                'critical-bouteilles': currentConfig.thresholds.bouteilles?.critical || 30,
                'warning-bouteilles': currentConfig.thresholds.bouteilles?.warning || 75
            };

            Object.entries(elements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) element.value = value;
            });

            updateThresholdInfo();
        };

        const updateThresholdInfo = () => {
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

        // Charger les données
        currentUsers = window.dbManager.getUsers();
        updateUsersTable();
        loadConfiguration();

        // Recherche utilisateurs
        const searchUsers = document.getElementById('searchUsers');
        if (searchUsers) {
            searchUsers.addEventListener('input', function() {
                const query = this.value.toLowerCase();
                document.querySelectorAll('#usersTableBody tr').forEach(row => {
                    if (row.querySelector('.loading-message')) return;
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(query) ? '' : 'none';
                });
            });
        }

        // Sauvegarde seuils
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

        // Reset seuils
        const resetThresholds = document.getElementById('resetThresholds');
        if (resetThresholds) {
            resetThresholds.addEventListener('click', function() {
                const confirmNotification = window.notify.warning('Réinitialiser les seuils', 'Remettre les valeurs par défaut ?', 10000);
                window.addConfirmationButtons(confirmNotification, () => {
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

        // Mise à jour info en temps réel
        ['warning-matieres', 'warning-bouteilles'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', updateThresholdInfo);
            }
        });

        // Déconnexion
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                const confirmNotification = window.notify.info(
                    'Confirmation de déconnexion', 
                    'Êtes-vous sûr de vouloir vous déconnecter ?', 
                    10000
                );
                
                window.addConfirmationButtons(confirmNotification, () => {
                    window.notify.info('Déconnexion en cours', 'Redirection vers l\'accueil...');
                    SessionManager.clearSession();
                    setTimeout(() => window.location.href = '../index.html', 1000);
                }, 'Déconnexion');
            });
        }
    }

    initHomePage() {
        console.log('🏠 Initialisation page d\'accueil');
        // Page d'accueil déjà gérée par les fonctionnalités communes
    }
}

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

window.updateGlobalConfig = function(newConfig) {
    Object.keys(newConfig).forEach(section => {
        if (window.globalConfig) {
            window.globalConfig[section] = { ...window.globalConfig[section], ...newConfig[section] };
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
    
    confirmBtn.addEventListener('click', () => {
        window.notify.remove(notification);
        onConfirm();
    });
    
    cancelBtn.addEventListener('click', () => {
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
window.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initialisation Marlowe Vineyard...');
    
    // Exposer les services globalement
    window.SessionManager = SessionManager;
    window.notify = new NotificationSystem();
    window.dbManager = new DatabaseManager();
    
    // Initialiser le gestionnaire de pages
    window.pageManager = new PageManager();
    
    console.log('✅ Marlowe Vineyard initialisé avec succès!');
});

// === BON DE VENTE - À ajouter dans initDocumentsPage() dans script.js ===

// URL du webhook Discord pour les bons de vente
const DISCORD_WEBHOOK_BON_VENTE = 'https://discord.com/api/webhooks/TON_WEBHOOK_URL_ICI';

// Produits disponibles avec leurs prix
const produitsBonVente = {
    'marlowe-rouge': { nom: 'Marlowe Rouge Reserve', prix: 450 },
    'marlowe-blanc': { nom: 'Marlowe Blanc Premium', prix: 380 },
    'marlowe-prestige': { nom: 'Marlowe Prestige', prix: 850 },
    'marlowe-rose': { nom: 'Marlowe Rosé', prix: 320 },
    'marlowe-vintage': { nom: 'Marlowe Vintage', prix: 1200 },
    'coffret-degustation': { nom: 'Coffret Dégustation', prix: 1800 }
};

// Dans la gestion des boutons documents, ajouter le cas pour bon-vente
document.querySelectorAll('.document-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const documentType = this.dataset.document;
        
        if (documentType === 'bon-vente') {
            openBonVenteModal();
        } else if (documentType === 'devis' || documentType === 'facture') {
            window.notify.info('Fonctionnalité', 'Génération de documents en développement');
        } else {
            window.notify.info('En préparation', 'Cette fonctionnalité sera bientôt disponible !');
        }
    });
});

// Fonction pour ouvrir le modal bon de vente
function openBonVenteModal() {
    const modal = document.getElementById('bonVenteModal');
    const currentUser = SessionManager.getSession();
    
    if (!currentUser) {
        window.notify.error('Erreur', 'Vous devez être connecté pour créer un bon de vente');
        return;
    }
    
    // Pré-remplir le nom de l'employé
    document.getElementById('employeNom').value = currentUser.fullname || currentUser.username;
    
    // Reset du formulaire
    document.getElementById('bonVenteForm').reset();
    document.getElementById('employeNom').value = currentUser.fullname || currentUser.username;
    document.getElementById('totalVente').value = '';
    
    modal.style.display = 'flex';
}

// Fonction pour fermer le modal
function closeBonVenteModal() {
    document.getElementById('bonVenteModal').style.display = 'none';
    document.getElementById('bonVenteForm').reset();
}

// Event listeners pour le modal
document.getElementById('closeBonVenteModal').onclick = closeBonVenteModal;
document.getElementById('cancelBonVente').onclick = closeBonVenteModal;

// Fermer le modal en cliquant à l'extérieur
document.getElementById('bonVenteModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeBonVenteModal();
    }
});

// Calcul automatique du total
document.getElementById('produitVendu').addEventListener('change', calculateTotal);
document.getElementById('quantiteVendue').addEventListener('input', calculateTotal);

function calculateTotal() {
    const produitSelect = document.getElementById('produitVendu');
    const quantiteInput = document.getElementById('quantiteVendue');
    const totalInput = document.getElementById('totalVente');
    
    const produitId = produitSelect.value;
    const quantite = parseInt(quantiteInput.value) || 0;
    
    if (produitId && quantite > 0) {
        const prix = produitsBonVente[produitId].prix;
        const total = prix * quantite;
        totalInput.value = `${total.toLocaleString()}$`;
    } else {
        totalInput.value = '';
    }
}

// Soumission du formulaire
document.getElementById('bonVenteForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const employeNom = document.getElementById('employeNom').value;
    const produitId = document.getElementById('produitVendu').value;
    const quantite = parseInt(document.getElementById('quantiteVendue').value);
    
    if (!produitId || !quantite || quantite <= 0) {
        window.notify.error('Erreur', 'Veuillez remplir tous les champs correctement');
        return;
    }
    
    const produit = produitsBonVente[produitId];
    const total = produit.prix * quantite;
    
    // Préparer les données pour Discord
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
                    value: `${produit.prix.toLocaleString()}$`,
                    inline: true
                },
                {
                    name: "💵 Total",
                    value: `${total.toLocaleString()}$`,
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
        // Envoi vers Discord
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
            closeBonVenteModal();
            
            // Optionnel: sauvegarder localement pour les statistiques
            saveBonVenteLocally({
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
});

// Fonction pour sauvegarder localement (optionnel)
function saveBonVenteLocally(bonVente) {
    try {
        const bonsVente = JSON.parse(localStorage.getItem('marlowe_bons_vente') || '[]');
        bonsVente.push(bonVente);
        
        // Garder seulement les 100 derniers
        if (bonsVente.length > 100) {
            bonsVente.splice(0, bonsVente.length - 100);
        }
        
        localStorage.setItem('marlowe_bons_vente', JSON.stringify(bonsVente));
        console.log('✅ Bon de vente sauvegardé localement');
    } catch (error) {
        console.error('❌ Erreur sauvegarde locale:', error);
    }
}
