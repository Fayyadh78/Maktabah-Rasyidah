// ==============================================
// KONFIGURASI UTAMA
// ==============================================

// Key untuk penyimpanan LocalStorage
const STORAGE_KEY = 'maktabah_agama_downloads';
const GLOBAL_STATS_KEY = 'maktabah_rasyida_global_stats';

// Data Artikel dari Konfigurasi HTML
const configElement = document.getElementById('articles-config');
const config = configElement ? JSON.parse(configElement.textContent) : {
    articles: [],
    categories: {},
    website: {},
    social: {}
};

// Fungsi untuk mengonversi URL Google Drive ke URL preview PDF
function convertGoogleDriveUrl(url) {
    if (url.includes('drive.google.com/file/d/')) {
        const fileId = url.match(/\/d\/(.+?)\//)[1];
        return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    return url;
}

// Fungsi untuk mengonversi URL Google Drive ke URL download langsung
function convertGoogleDriveToDirectDownload(url) {
    if (url.includes('drive.google.com/file/d/')) {
        const fileId = url.match(/\/d\/(.+?)\//)[1];
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
    return url;
}

// Data Artikel Agama dari konfigurasi
let agamaArticles = config.articles || [];

// State Management
const appState = {
    currentFilter: 'all',
    totalDownloads: 0,
    currentPreviewArticle: null
};

// DOM Elements
const DOM = {
    navbarContainer: document.getElementById('navbar-container'),
    articlesGrid: document.getElementById('articlesGrid'),
    filterTags: document.querySelectorAll('.filter-tag'),
    filterCount: document.querySelector('.filter-count'),
    totalArticles: document.getElementById('totalArticles'),
    totalAuthors: document.getElementById('totalAuthors'),
    totalPages: document.getElementById('totalPages'),
    totalDownloads: document.getElementById('totalDownloads'),
    footerFilterLinks: document.querySelectorAll('.footer-links a[data-filter]'),
    searchInput: document.getElementById('searchInput'),
    searchResults: document.getElementById('searchResults'),
    loadingScreen: document.getElementById('loadingScreen')
};

// ==============================================
// NAVBAR MANAGER - FIXED VERSION
// ==============================================

class NavbarManagerFixed {
    constructor() {
        this.initialized = false;
        this.init();
    }
    
    init() {
        if (this.initialized) return;
        
        const navbar = document.querySelector('.navbar-module');
        const hamburgerBtn = document.getElementById('hamburgerBtnModule');
        const navMenu = document.getElementById('navMenuModule');
        
        if (!navbar || !hamburgerBtn || !navMenu) {
            console.log('Navbar elements not found, waiting...');
            setTimeout(() => this.init(), 100);
            return;
        }
        
        console.log('Initializing navbar...');
        
        // Scroll effect
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });
        
        // Hamburger toggle - FIXED EVENT LISTENER
        hamburgerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Hamburger clicked');
            hamburgerBtn.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto';
        });
        
        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active')) {
                if (!hamburgerBtn.contains(e.target) && !navMenu.contains(e.target)) {
                    hamburgerBtn.classList.remove('active');
                    navMenu.classList.remove('active');
                    document.body.style.overflow = 'auto';
                    
                    // Close all dropdowns
                    document.querySelectorAll('.nav-item-module').forEach(item => {
                        item.classList.remove('active');
                    });
                }
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                hamburgerBtn.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
        
        // Mobile dropdown accordion
        document.querySelectorAll('.nav-link-module').forEach(link => {
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 992) {
                    const parent = link.closest('.nav-item-module');
                    const dropdown = parent.querySelector('.dropdown-menu-module');
                    
                    if (dropdown) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Close other dropdowns
                        document.querySelectorAll('.nav-item-module').forEach(item => {
                            if (item !== parent && item.classList.contains('active')) {
                                item.classList.remove('active');
                            }
                        });
                        
                        // Toggle current dropdown
                        parent.classList.toggle('active');
                    }
                }
            });
        });
        
        // Desktop hover dropdown
        if (window.innerWidth > 992) {
            document.querySelectorAll('.nav-item-module').forEach(item => {
                const dropdown = item.querySelector('.dropdown-menu-module');
                
                if (dropdown) {
                    item.addEventListener('mouseenter', () => {
                        dropdown.style.opacity = '1';
                        dropdown.style.visibility = 'visible';
                        dropdown.style.transform = 'translateY(0)';
                    });
                    
                    item.addEventListener('mouseleave', () => {
                        dropdown.style.opacity = '0';
                        dropdown.style.visibility = 'hidden';
                        dropdown.style.transform = 'translateY(10px)';
                    });
                }
            });
        }
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 992) {
                // Reset mobile menu if resized to desktop
                hamburgerBtn.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
                document.querySelectorAll('.nav-item-module').forEach(item => {
                    item.classList.remove('active');
                });
            }
        });
        
        this.initialized = true;
        console.log('Navbar initialized successfully');
    }
}

// ==============================================
// HELPER FUNCTIONS
// ==============================================

const Helper = {
    calculateUniqueAuthors: () => {
        const authors = agamaArticles.map(article => article.author);
        const uniqueAuthors = [...new Set(authors)];
        return uniqueAuthors.length;
    },

    calculateTotalPages: () => {
        return agamaArticles.reduce((total, article) => total + article.pages, 0);
    },

    calculateTotalDownloads: () => {
        return agamaArticles.reduce((total, article) => total + article.downloadCount, 0);
    },

    searchArticles: (query) => {
        if (!query.trim()) return [];
        
        const searchTerm = query.toLowerCase();
        return agamaArticles.filter(article => {
            return (
                article.title.toLowerCase().includes(searchTerm) ||
                article.author.toLowerCase().includes(searchTerm) ||
                article.description.toLowerCase().includes(searchTerm) ||
                article.category.toLowerCase().includes(searchTerm)
            );
        });
    },

    animateCounter: (element, target) => {
        const current = parseInt(element.textContent) || 0;
        if (target === 0) {
           element.textContent = 0;
           return;
        }
        
        const increment = Math.ceil((target - current) / 30);
        let currentValue = current;

        const timer = setInterval(() => {
            currentValue += increment;
            if ((increment > 0 && currentValue >= target) || (increment < 0 && currentValue <= target)) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = currentValue;
            }
        }, 50);
    },

    loadDownloadsFromStorage: () => {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                agamaArticles.forEach(article => {
                    if (parsedData[article.id] !== undefined) {
                        article.downloadCount = parsedData[article.id];
                    }
                });
            } catch (e) {
                console.error("Gagal memuat data unduhan:", e);
            }
        }
    },

    saveDownloadsToStorage: () => {
        const dataToSave = {};
        agamaArticles.forEach(article => {
            if (article.downloadCount > 0) {
                dataToSave[article.id] = article.downloadCount;
            }
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    },

    createPdfPreviewModal: (article) => {
        const previewUrl = convertGoogleDriveUrl(article.pdfUrl);
        const directDownloadUrl = convertGoogleDriveToDirectDownload(article.pdfUrl);
        
        const modalHTML = `
            <div class="preview-modal" id="previewModal-${article.id}">
                <div class="modal-content-pdf">
                    <div class="modal-header-pdf">
                        <h3 class="modal-title-pdf">
                            <i class="${article.icon}"></i> ${article.title}
                        </h3>
                        <div class="modal-actions">
                            <button class="modal-btn btn-open-drive" data-url="${article.pdfUrl}">
                                <i class="fab fa-google-drive"></i> Buka di Drive
                            </button>
                            <button class="modal-btn btn-download-pdf" data-id="${article.id}">
                                <i class="fas fa-download"></i> Download PDF
                            </button>
                            <button class="close-modal-pdf" data-id="${article.id}">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <div class="modal-body-pdf">
                        <div class="pdf-frame-container">
                            <div class="pdf-loading" id="pdfLoading-${article.id}">
                                <div class="loading-spinner"></div>
                                <div class="loading-text">Memuat PDF...</div>
                            </div>
                            <iframe 
                                class="pdf-frame" 
                                id="pdfFrame-${article.id}"
                                src="${previewUrl}" 
                                frameborder="0"
                                onload="document.getElementById('pdfLoading-${article.id}').style.display = 'none'"
                                onerror="this.onerror=null; document.getElementById('pdfLoading-${article.id}').innerHTML = '<div style=\"text-align: center; padding: 2rem;\"><i class=\"fas fa-exclamation-triangle\" style=\"font-size: 2rem; color: var(--accent-color); margin-bottom: 1rem;\"></i><p style=\"color: var(--text-secondary);\">Tidak dapat memuat preview. Silakan buka di Google Drive.</p><button onclick=\"window.open(\'${article.pdfUrl}\', \'_blank\')\" style=\"margin-top: 1rem; padding: 0.8rem 1.5rem; background: linear-gradient(135deg, var(--primary-color), var(--accent-color)); border: none; border-radius: 6px; color: white; cursor: pointer;\"><i class=\"fab fa-google-drive\"></i> Buka di Google Drive</button></div>'"
                            >
                            </iframe>
                        </div>
                    </div>
                    <div class="modal-footer-pdf">
                        <div class="pdf-info">
                            <div class="pdf-info-item">
                                <i class="fas fa-user"></i>
                                <span>${article.author}</span>
                            </div>
                            <div class="pdf-info-item">
                                <i class="fas fa-calendar"></i>
                                <span>${article.year}</span>
                            </div>
                            <div class="pdf-info-item">
                                <i class="fas fa-file-alt"></i>
                                <span>${article.pages} halaman</span>
                            </div>
                            <div class="pdf-info-item">
                                <i class="fas fa-download"></i>
                                <span>${article.downloadCount} kali diunduh</span>
                            </div>
                        </div>
                        <div style="color: var(--accent-color); font-size: 0.85rem;">
                            <i class="fas fa-info-circle"></i> Preview mungkin tidak tersedia untuk beberapa file
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return modalHTML;
    }
};

// ==============================================
// KELAS UTAMA APLIKASI
// ==============================================

class AgamaArticlesApp {
    constructor() {
        this.navbarManager = null;
        this.init();
    }

    async init() {
        // Muat navbar terlebih dahulu
        await this.loadNavbar();
        
        this.initLoadingScreen();
        
        Helper.loadDownloadsFromStorage();
        
        this.updateStatistics();
        this.generateArticles();
        
        this.initEventListeners();
        
        // Inisialisasi navbar manager setelah navbar dimuat
        setTimeout(() => {
            this.navbarManager = new NavbarManagerFixed();
        }, 200);
    }

    // Fungsi untuk memuat navbar menggunakan fetch - FIXED VERSION
    async loadNavbar() {
        try {
            console.log('Memuat navbar...');
            
            // Coba beberapa path yang mungkin
            const possiblePaths = [
                '/navbar/navbar.html',
                './navbar/navbar.html',
                '../navbar/navbar.html',
                'navbar/navbar.html'
            ];
            
            let navbarHTML = '';
            let success = false;
            
            for (const path of possiblePaths) {
                try {
                    const response = await fetch(path);
                    if (response.ok) {
                        navbarHTML = await response.text();
                        success = true;
                        console.log('Navbar ditemukan di:', path);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
            
            if (!success) {
                throw new Error('Navbar tidak ditemukan di lokasi manapun');
            }
            
            // Clean HTML sebelum dimasukkan
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = navbarHTML;
            
            // Hapus script tags dari navbar (kita akan handle sendiri)
            const scripts = tempDiv.querySelectorAll('script');
            scripts.forEach(script => script.remove());
            
            // Masukkan navbar ke container
            DOM.navbarContainer.innerHTML = tempDiv.innerHTML;
            
            // Tambahkan CSS inline untuk memastikan navbar tampil
            const navbarElement = DOM.navbarContainer.querySelector('.navbar-module');
            if (navbarElement) {
                navbarElement.style.display = 'block';
                navbarElement.style.visibility = 'visible';
            }
            
            console.log('Navbar berhasil dimuat');
            
        } catch (error) {
            console.error('Error loading navbar:', error);
            // Fallback navbar sederhana
            DOM.navbarContainer.innerHTML = this.createFallbackNavbar();
            
            // Inisialisasi fallback navbar
            this.initFallbackNavbar();
        }
    }
    
    // Fallback navbar jika fetch gagal
    createFallbackNavbar() {
        return `
            <nav class="navbar-module" id="navbarModule" style="position:fixed; top:0; width:100%; background:rgba(253, 251, 247, 0.95); backdrop-filter:blur(12px); border-bottom:1px solid rgba(197, 160, 89, 0.3); z-index:1000; padding:0 1rem;">
                <div class="nav-container-module" style="max-width:1400px; margin:0 auto; display:flex; justify-content:space-between; align-items:center; height:70px;">
                    <a href="/" class="logo-module" style="text-decoration:none;">
                        <div class="logo-text-module">
                            <span class="logo-main-module" style="font-family:'Cinzel',serif; font-size:1.8rem; color:#1a4d2e;">Maktabah</span>
                            <span class="logo-sub-module" style="font-size:0.8rem; color:#c5a059; letter-spacing:3px;">Rasyidah</span>
                        </div>
                    </a>
                    
                    <div class="hamburger-module" id="hamburgerBtnModule" style="display:flex; flex-direction:column; gap:6px; cursor:pointer; padding:10px;">
                        <span style="display:block; width:25px; height:3px; background-color:#1a4d2e;"></span>
                        <span style="display:block; width:25px; height:3px; background-color:#1a4d2e;"></span>
                        <span style="display:block; width:25px; height:3px; background-color:#1a4d2e;"></span>
                    </div>
                    
                    <div class="nav-menu-module" id="navMenuModule" style="position:fixed; top:0; right:-100%; width:80%; max-width:300px; height:100vh; background:#f9f7f2; flex-direction:column; padding:6rem 2rem 2rem; transition:0.4s; z-index:999;">
                        <div class="nav-item-module" style="width:100%; margin-bottom:1rem;">
                            <a href="/navbar/artikel/artikel-agama/artikel-agama.html" class="nav-link-module" style="display:flex; align-items:center; gap:0.5rem; padding:1rem 0; color:#5d4037; text-decoration:none; border-bottom:1px solid rgba(0,0,0,0.05);">
                                <i class="fas fa-newspaper"></i> Artikel Agama
                            </a>
                        </div>
                        <div class="nav-item-module" style="width:100%; margin-bottom:1rem;">
                            <a href="/" class="nav-link-module" style="display:flex; align-items:center; gap:0.5rem; padding:1rem 0; color:#5d4037; text-decoration:none; border-bottom:1px solid rgba(0,0,0,0.05);">
                                <i class="fas fa-home"></i> Beranda
                            </a>
                        </div>
                    </div>
                </div>
            </nav>
        `;
    }
    
    initFallbackNavbar() {
        const hamburgerBtn = document.getElementById('hamburgerBtnModule');
        const navMenu = document.getElementById('navMenuModule');
        
        if (hamburgerBtn && navMenu) {
            hamburgerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                hamburgerBtn.classList.toggle('active');
                navMenu.classList.toggle('active');
                
                if (hamburgerBtn.classList.contains('active')) {
                    navMenu.style.right = '0';
                    document.body.style.overflow = 'hidden';
                } else {
                    navMenu.style.right = '-100%';
                    document.body.style.overflow = 'auto';
                }
            });
            
            // Close on outside click
            document.addEventListener('click', (e) => {
                if (navMenu.classList.contains('active')) {
                    if (!hamburgerBtn.contains(e.target) && !navMenu.contains(e.target)) {
                        hamburgerBtn.classList.remove('active');
                        navMenu.classList.remove('active');
                        navMenu.style.right = '-100%';
                        document.body.style.overflow = 'auto';
                    }
                }
            });
        }
    }

    initLoadingScreen() {
        setTimeout(() => {
            if (DOM.loadingScreen) {
                DOM.loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    DOM.loadingScreen.style.display = 'none';
                }, 600);
            }
        }, 1500);
    }

    initEventListeners() {
        // Filter tags
        DOM.filterTags.forEach(tag => {
            tag.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.filterArticles(filter);
                
                DOM.filterTags.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Footer filter links
        DOM.footerFilterLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = link.dataset.filter;
                this.filterArticles(filter);
                
                DOM.filterTags.forEach(t => {
                    t.classList.remove('active');
                    if (t.dataset.filter === filter) {
                        t.classList.add('active');
                    }
                });
            });
        });

        // Search input
        if (DOM.searchInput) {
            DOM.searchInput.addEventListener('input', (e) => {
                this.performSearch(e.target.value);
            });
            
            DOM.searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(e.target.value);
                }
            });
        }

        // Global event listeners
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.preview-modal.active');
                if (activeModal) {
                    const articleId = activeModal.id.split('-')[1];
                    this.closePdfPreview(articleId);
                }
            }
        });
    }

    generateArticles() {
        if (!DOM.articlesGrid) return;
        
        DOM.articlesGrid.innerHTML = '';
        
        const articlesHTML = agamaArticles.map(article => `
            <div class="article-card" data-category="${article.category}" data-id="${article.id}">
                <div class="article-header">
                    <div class="article-icon">
                        <i class="${article.icon}"></i>
                    </div>
                    <h3 class="article-title">${article.title}</h3>
                    <div class="article-meta">
                        <span class="article-author">${article.author}</span>
                        <span class="article-year">${article.year}</span>
                    </div>
                </div>
                <div class="article-content">
                    <p class="article-description">${article.description}</p>
                    <div class="article-stats">
                        <div class="stat-item">
                            <i class="fas fa-file-alt"></i>
                            <span>${article.pages} halaman</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-download"></i>
                            <span>${article.downloadCount} kali diunduh</span>
                        </div>
                    </div>
                    <div class="article-actions">
                        <button class="btn btn-preview" data-id="${article.id}">
                            <i class="fas fa-eye"></i> Preview PDF
                        </button>
                        <button class="btn btn-download" data-id="${article.id}">
                            <i class="fas fa-download"></i> Download
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        DOM.articlesGrid.innerHTML = articlesHTML;
        this.initArticleButtons();
    }

    initArticleButtons() {
        // Preview buttons
        document.querySelectorAll('.btn-preview').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const articleId = parseInt(button.dataset.id);
                const article = agamaArticles.find(a => a.id === articleId);
                if (article) {
                    this.previewPdfArticle(article);
                }
            });
        });

        // Download buttons
        document.querySelectorAll('.btn-download').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const articleId = parseInt(button.dataset.id);
                const article = agamaArticles.find(a => a.id === articleId);
                if (article) {
                    this.downloadArticle(article);
                }
            });
        });

        // Card click
        document.querySelectorAll('.article-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.btn-preview') && !e.target.closest('.btn-download')) {
                    const articleId = parseInt(card.dataset.id);
                    const article = agamaArticles.find(a => a.id === articleId);
                    if (article) {
                        this.previewPdfArticle(article);
                    }
                }
            });
        });
    }

    filterArticles(filter) {
        appState.currentFilter = filter;
        const articles = document.querySelectorAll('.article-card');
        let visibleCount = 0;

        articles.forEach((article, index) => {
            const category = article.dataset.category;
            
            if (filter === 'all' || category === filter) {
                article.style.display = 'block';
                visibleCount++;
                
                article.style.animation = 'fadeInUp 0.6s ease forwards';
                article.style.animationDelay = `${index * 0.03}s`;
                article.style.opacity = '0';
                article.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    article.style.opacity = '1';
                    article.style.transform = 'translateY(0)';
                }, 100);
            } else {
                article.style.opacity = '0';
                article.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    article.style.display = 'none';
                }, 300);
            }
        });

        if (DOM.filterCount) {
            DOM.filterCount.textContent = `${visibleCount} Artikel`;
        }
        
        // Scroll ke grid
        setTimeout(() => {
            DOM.articlesGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }

    previewPdfArticle(article) {
        // Cek jika modal sudah ada
        const existingModal = document.getElementById(`previewModal-${article.id}`);
        if (existingModal) {
            existingModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            this.bindModalEvents(article.id);
            return;
        }

        // Buat modal baru
        const modalHTML = Helper.createPdfPreviewModal(article);
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Tambahkan class active setelah delay kecil
        setTimeout(() => {
            const modal = document.getElementById(`previewModal-${article.id}`);
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
                this.bindModalEvents(article.id);
            }
        }, 10);
    }
    
    bindModalEvents(articleId) {
        const modal = document.getElementById(`previewModal-${articleId}`);
        if (!modal) return;
        
        // Open in Drive button
        const openDriveBtn = modal.querySelector('.btn-open-drive');
        if (openDriveBtn) {
            openDriveBtn.addEventListener('click', (e) => {
                const article = agamaArticles.find(a => a.id === articleId);
                if (article) {
                    window.open(article.pdfUrl, '_blank');
                }
            });
        }
        
        // Download button
        const downloadBtn = modal.querySelector('.btn-download-pdf');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', (e) => {
                this.downloadArticleFromModal(articleId);
            });
        }
        
        // Close button
        const closeBtn = modal.querySelector('.close-modal-pdf');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                this.closePdfPreview(articleId);
            });
        }
        
        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closePdfPreview(articleId);
            }
        });
    }

    closePdfPreview(articleId) {
        const modal = document.getElementById(`previewModal-${articleId}`);
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.remove();
                }
                document.body.style.overflow = 'auto';
            }, 300);
        }
    }

    downloadArticleFromModal(articleId) {
        const article = agamaArticles.find(a => a.id === articleId);
        if (article) {
            this.downloadArticle(article);
        }
    }

    downloadArticle(article) {
        // Increment download count
        article.downloadCount++;
        
        // Save to storage
        Helper.saveDownloadsToStorage();
        
        // Update statistics
        this.updateStatistics();
        
        // Update article card
        this.updateArticleCard(article.id);
        
        // Show notification
        this.showNotification(`Mengunduh: ${article.title}`, 'success');
        
        // Trigger download after delay
        setTimeout(() => {
            const directDownloadUrl = convertGoogleDriveToDirectDownload(article.pdfUrl);
            const link = document.createElement('a');
            link.href = directDownloadUrl;
            link.download = `${article.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
            link.target = '_blank';
            
            if (link.download !== undefined) {
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                window.open(article.pdfUrl, '_blank');
            }
        }, 500);
    }

    updateArticleCard(articleId) {
        const article = agamaArticles.find(a => a.id === articleId);
        if (!article) return;

        const articleCard = document.querySelector(`.article-card[data-id="${articleId}"]`);
        if (articleCard) {
            const downloadStat = articleCard.querySelector('.stat-item:nth-child(2) span');
            if (downloadStat) {
                downloadStat.textContent = `${article.downloadCount} kali diunduh`;
            }
        }
    }

    updateStatistics() {
        const totalArticles = agamaArticles.length;
        const totalAuthors = Helper.calculateUniqueAuthors();
        const totalPages = Helper.calculateTotalPages();
        const totalDownloads = Helper.calculateTotalDownloads();

        if (DOM.totalArticles) Helper.animateCounter(DOM.totalArticles, totalArticles);
        if (DOM.totalAuthors) Helper.animateCounter(DOM.totalAuthors, totalAuthors);
        if (DOM.totalPages) Helper.animateCounter(DOM.totalPages, totalPages);
        if (DOM.totalDownloads) Helper.animateCounter(DOM.totalDownloads, totalDownloads);
    }

    performSearch(query) {
        const results = Helper.searchArticles(query);
        
        if (query.trim() === '') {
            DOM.searchResults.innerHTML = '<div class="no-results">Mulai mengetik untuk mencari artikel...</div>';
            return;
        }
        
        if (results.length === 0) {
            DOM.searchResults.innerHTML = '<div class="no-results">Tidak ada artikel yang ditemukan. Coba kata kunci lain.</div>';
            return;
        }
        
        const resultsHTML = results.map(article => `
            <div class="search-result-item" data-id="${article.id}">
                <div class="result-title">${article.title}</div>
                <div class="result-author">${article.author}</div>
                <span class="result-category">${this.getCategoryName(article.category)}</span>
            </div>
        `).join('');
        
        DOM.searchResults.innerHTML = resultsHTML;
        
        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const articleId = parseInt(item.dataset.id);
                this.openArticleFromSearch(articleId);
            });
        });
    }

    getCategoryName(category) {
        return config.categories[category] || category;
    }

    openArticleFromSearch(articleId) {
        const article = agamaArticles.find(a => a.id === articleId);
        if (article) {
            this.filterArticles(article.category);
            
            DOM.filterTags.forEach(t => {
                t.classList.remove('active');
                if (t.dataset.filter === article.category) {
                    t.classList.add('active');
                }
            });
            
            setTimeout(() => {
                const articleCard = document.querySelector(`.article-card[data-id="${articleId}"]`);
                if (articleCard) {
                    articleCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    articleCard.style.boxShadow = '0 0 0 3px var(--accent-color)';
                    setTimeout(() => {
                        articleCard.style.boxShadow = '';
                    }, 2000);
                }
            }, 500);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: ${type === 'success' ? 'linear-gradient(135deg, var(--primary-color), var(--accent-color))' : 'rgba(197, 160, 89, 0.9)'};
            color: ${type === 'success' ? 'var(--bg-paper)' : 'var(--text-primary)'};
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 99999;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
            animation: slideInRight 0.3s ease;
            border: 1px solid rgba(197, 160, 89, 0.3);
            max-width: 90%;
            word-break: break-word;
            font-family: 'Lato', sans-serif;
        `;

        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }
}

// ==============================================
// INISIALISASI APLIKASI
// ==============================================

document.addEventListener('DOMContentLoaded', () => {
    window.app = new AgamaArticlesApp();
    
    // Tambahkan CSS untuk animasi
    if (!document.querySelector('#animation-styles')) {
        const style = document.createElement('style');
        style.id = 'animation-styles';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
});
