// ==============================================
// KONFIGURASI UTAMA
// ==============================================

// Key untuk penyimpanan LocalStorage
const STORAGE_KEY = 'maktabah_health_downloads';
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
    // Konversi URL Google Drive ke URL preview PDF
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

// Data Artikel Kesehatan dari konfigurasi
let healthArticles = config.articles || [];

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
// SISTEM STATISTIK GLOBAL INTEGRASI
// ==============================================

class GlobalStatsManager {
    constructor() {
        this.key = GLOBAL_STATS_KEY;
        this.initializeGlobalStats();
    }
    
    initializeGlobalStats() {
        let stats = localStorage.getItem(this.key);
        if (!stats) {
            const initialStats = {
                collections: {
                    kesehatan: 0,
                    kehutanan: 0,
                    pendidikan: 0,
                    teknologi: 0,
                    agama: 0,
                    novel: 0,
                    cerita: 0,
                    skripsi: 0,
                    tesis: 0,
                    disertasi: 0
                },
                totalVisitors: 0,
                totalDownloads: 0,
                lastVisitorTime: 0,
                visitorSessions: []
            };
            localStorage.setItem(this.key, JSON.stringify(initialStats));
        }
    }
    
    getStats() {
        const stats = localStorage.getItem(this.key);
        return stats ? JSON.parse(stats) : null;
    }
    
    saveStats(stats) {
        localStorage.setItem(this.key, JSON.stringify(stats));
    }
    
    reportCollectionCount(pageId, count) {
        let stats = this.getStats();
        if (stats) {
            stats.collections[pageId] = count;
            this.saveStats(stats);
            return true;
        }
        return false;
    }
    
    reportDownload(count = 1) {
        let stats = this.getStats();
        if (stats) {
            stats.totalDownloads += count;
            this.saveStats(stats);
            return true;
        }
        return false;
    }
}

// ==============================================
// HELPER FUNCTIONS
// ==============================================

const Helper = {
    calculateUniqueAuthors: () => {
        const authors = healthArticles.map(article => article.author);
        const uniqueAuthors = [...new Set(authors)];
        return uniqueAuthors.length;
    },

    calculateTotalPages: () => {
        return healthArticles.reduce((total, article) => total + article.pages, 0);
    },

    calculateTotalDownloads: () => {
        return healthArticles.reduce((total, article) => total + article.downloadCount, 0);
    },

    searchArticles: (query) => {
        if (!query.trim()) return [];
        
        const searchTerm = query.toLowerCase();
        return healthArticles.filter(article => {
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
                healthArticles.forEach(article => {
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
        healthArticles.forEach(article => {
            if (article.downloadCount > 0) {
                dataToSave[article.id] = article.downloadCount;
            }
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    },

    // Fungsi untuk membuat modal preview PDF
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
                            <button class="modal-btn btn-open-drive" onclick="window.open('${article.pdfUrl}', '_blank')">
                                <i class="fab fa-google-drive"></i> Buka di Drive
                            </button>
                            <button class="modal-btn btn-download-pdf" onclick="app.downloadArticleFromModal(${article.id})">
                                <i class="fas fa-download"></i> Download PDF
                            </button>
                            <button class="close-modal-pdf" onclick="app.closePdfPreview(${article.id})">
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
                                onerror="document.getElementById('pdfLoading-${article.id}').innerHTML = '<div style=\"text-align: center; padding: 2rem;\"><i class=\"fas fa-exclamation-triangle\" style=\"font-size: 2rem; color: var(--accent-color); margin-bottom: 1rem;\"></i><p style=\"color: var(--text-secondary);\">Tidak dapat memuat preview. Silakan buka di Google Drive.</p><button onclick=\"window.open(\\'${article.pdfUrl}\\', \\'_blank\\')\" style=\"margin-top: 1rem; padding: 0.8rem 1.5rem; background: linear-gradient(135deg, var(--primary-color), var(--accent-color)); border: none; border-radius: 6px; color: white; cursor: pointer;\"><i class=\"fab fa-google-drive\"></i> Buka di Google Drive</button></div>'"
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

class HealthArticlesApp {
    constructor() {
        this.globalStats = new GlobalStatsManager();
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
        this.reportToGlobalStats();
    }

    // Fungsi untuk memuat navbar menggunakan fetch
    async loadNavbar() {
        try {
            const response = await fetch('/navbar/navbar.html');
            if (!response.ok) {
                throw new Error('Navbar tidak ditemukan');
            }
            const navbarHTML = await response.text();
            DOM.navbarContainer.innerHTML = navbarHTML;
            
            // Inisialisasi navbar setelah dimuat
            this.initNavbar();
        } catch (error) {
            console.error('Error loading navbar:', error);
            DOM.navbarContainer.innerHTML = '<div style="color: red; padding: 20px; text-align: center;">Error loading navbar. Please check navbar.html file.</div>';
        }
    }

    // Inisialisasi navbar setelah dimuat
    initNavbar() {
        const navbar = document.querySelector('.navbar');
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const navMenu = document.getElementById('navMenu');
        const spotlightBtn = document.getElementById('spotlightBtn');
        const closeSpotlight = document.getElementById('closeSpotlight');
        
        if (!navbar) return;

        // Event listener untuk scroll
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Event listener untuk hamburger menu (mobile)
        if (hamburgerBtn && navMenu) {
            hamburgerBtn.addEventListener('click', () => {
                hamburgerBtn.classList.toggle('active');
                navMenu.classList.toggle('active');
            });

            document.addEventListener('click', (e) => {
                if (!navMenu.contains(e.target) && !hamburgerBtn.contains(e.target) && navMenu.classList.contains('active')) {
                    hamburgerBtn.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            });

            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    if (window.innerWidth <= 768) {
                        const parent = link.parentElement;
                        const dropdown = parent.querySelector('.dropdown-menu');
                        
                        if (dropdown) {
                            e.preventDefault();
                            parent.classList.toggle('active');
                        }
                    }
                });
            });
        }

        // Event listener untuk spotlight search
        if (spotlightBtn) {
            spotlightBtn.addEventListener('click', () => {
                this.openSpotlight();
            });
        }

        if (closeSpotlight) {
            closeSpotlight.addEventListener('click', () => {
                this.closeSpotlight();
            });
        }

        // Dropdown untuk desktop
        if (window.innerWidth > 768) {
            document.querySelectorAll('.nav-item').forEach(item => {
                const dropdown = item.querySelector('.dropdown-menu');

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
    }

    initLoadingScreen() {
        setTimeout(() => {
            if (DOM.loadingScreen) {
                DOM.loadingScreen.style.opacity = '0';
                DOM.loadingScreen.style.visibility = 'hidden';
            }
        }, 1500);
    }

    initEventListeners() {
        DOM.filterTags.forEach(tag => {
            tag.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.filterArticles(filter);
                
                DOM.filterTags.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

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

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('spotlightModal')?.classList.contains('active')) {
                this.closeSpotlight();
            }
            
            if (e.key === 'Escape' && document.querySelector('.preview-modal.active')) {
                const activeModal = document.querySelector('.preview-modal.active');
                const articleId = activeModal.id.split('-')[1];
                this.closePdfPreview(articleId);
            }
        });
    }

    generateArticles() {
        if (!DOM.articlesGrid) return;
        
        DOM.articlesGrid.innerHTML = '';
        
        const articlesHTML = healthArticles.map(article => `
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
        document.querySelectorAll('.btn-preview').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const articleId = parseInt(button.dataset.id);
                const article = healthArticles.find(a => a.id === articleId);
                if (article) {
                    this.previewPdfArticle(article);
                }
            });
        });

        document.querySelectorAll('.btn-download').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const articleId = parseInt(button.dataset.id);
                const article = healthArticles.find(a => a.id === articleId);
                if (article) {
                    this.downloadArticle(article);
                }
            });
        });

        document.querySelectorAll('.article-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.btn-preview') && !e.target.closest('.btn-download')) {
                    const articleId = parseInt(card.dataset.id);
                    const article = healthArticles.find(a => a.id === articleId);
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

        articles.forEach(article => {
            const category = article.dataset.category;
            
            if (filter === 'all' || category === filter) {
                article.style.display = 'block';
                visibleCount++;
                
                article.style.animation = 'fadeInUp 0.6s ease forwards';
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
        DOM.articlesGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Fungsi baru untuk preview PDF
    previewPdfArticle(article) {
        // Cek jika modal sudah ada
        const existingModal = document.getElementById(`previewModal-${article.id}`);
        if (existingModal) {
            existingModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            return;
        }

        // Buat modal baru
        const modalHTML = Helper.createPdfPreviewModal(article);
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        
        // Tambahkan class active setelah delay kecil untuk animasi
        setTimeout(() => {
            const modal = document.getElementById(`previewModal-${article.id}`);
            modal.classList.add('active');
        }, 10);
    }

    closePdfPreview(articleId) {
        const modal = document.getElementById(`previewModal-${articleId}`);
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = 'auto';
            }, 300);
        }
    }

    downloadArticleFromModal(articleId) {
        const article = healthArticles.find(a => a.id === articleId);
        if (article) {
            this.downloadArticle(article);
        }
    }

    downloadArticle(article) {
        article.downloadCount++;
        
        Helper.saveDownloadsToStorage();
        
        this.updateStatistics();
        
        this.updateArticleCard(article.id);
        
        this.reportDownloadToGlobal();
        
        this.showNotification(`Mengunduh: ${article.title}`, 'success');
        
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
        const article = healthArticles.find(a => a.id === articleId);
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
        const totalArticles = healthArticles.length;
        const totalAuthors = Helper.calculateUniqueAuthors();
        const totalPages = Helper.calculateTotalPages();
        const totalDownloads = Helper.calculateTotalDownloads();

        if (DOM.totalArticles) Helper.animateCounter(DOM.totalArticles, totalArticles);
        if (DOM.totalAuthors) Helper.animateCounter(DOM.totalAuthors, totalAuthors);
        if (DOM.totalPages) Helper.animateCounter(DOM.totalPages, totalPages);
        if (DOM.totalDownloads) Helper.animateCounter(DOM.totalDownloads, totalDownloads);
    }

    openSpotlight() {
        const spotlightModal = document.getElementById('spotlightModal');
        if (spotlightModal) {
            spotlightModal.classList.add('active');
            DOM.searchInput.focus();
            document.body.style.overflow = 'hidden';
        }
    }

    closeSpotlight() {
        const spotlightModal = document.getElementById('spotlightModal');
        if (spotlightModal) {
            spotlightModal.classList.remove('active');
            DOM.searchInput.value = '';
            DOM.searchResults.innerHTML = '<div class="no-results">Mulai mengetik untuk mencari artikel...</div>';
            document.body.style.overflow = 'auto';
        }
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
        this.closeSpotlight();
        
        const article = healthArticles.find(a => a.id === articleId);
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
        `;

        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        if (!document.querySelector('#notification-style')) {
            const style = document.createElement('style');
            style.id = 'notification-style';
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
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    reportToGlobalStats() {
        this.globalStats.reportCollectionCount('kesehatan', healthArticles.length);
    }
    
    reportDownloadToGlobal() {
        this.globalStats.reportDownload(1);
    }
}

// ==============================================
// INISIALISASI APLIKASI
// ==============================================

document.addEventListener('DOMContentLoaded', () => {
    window.app = new HealthArticlesApp();
    
    window.healthArticlesManager = {
        addArticle: (article) => {
            article.id = healthArticles.length > 0 ? Math.max(...healthArticles.map(a => a.id)) + 1 : 1;
            article.downloadCount = article.downloadCount || 0;
            healthArticles.push(article);
            app.generateArticles();
            app.updateStatistics();
            app.reportToGlobalStats();
            app.showNotification(`Artikel "${article.title}" berhasil ditambahkan!`, 'success');
        },
        
        removeArticle: (articleId) => {
            const index = healthArticles.findIndex(a => a.id === articleId);
            if (index !== -1) {
                const removedArticle = healthArticles[index];
                healthArticles.splice(index, 1);
                app.generateArticles();
                app.updateStatistics();
                Helper.saveDownloadsToStorage();
                app.reportToGlobalStats();
                app.showNotification(`Artikel "${removedArticle.title}" berhasil dihapus!`, 'success');
            }
        },
        
        getAllArticles: () => {
            return [...healthArticles];
        },
        
        getStatistics: () => {
            return {
                totalArticles: healthArticles.length,
                totalAuthors: Helper.calculateUniqueAuthors(),
                totalPages: Helper.calculateTotalPages(),
                totalDownloads: Helper.calculateTotalDownloads()
            };
        }
    };
});