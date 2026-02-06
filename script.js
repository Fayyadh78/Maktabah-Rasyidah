// ==============================================
// KONFIGURASI UTAMA INDEX
// ==============================================

// Data Konten dari Konfigurasi HTML
const contentConfigElement = document.getElementById('content-config');
const contentConfig = contentConfigElement ? JSON.parse(contentConfigElement.textContent) : {
    contents: {},
    storageKey: 'maktabah_index_downloads'
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

// State Management
const appState = {
    currentPreviewContent: null,
    currentDownloads: {}
};

// DOM Elements
const DOM = {
    navbarContainer: document.getElementById('navbar-container'),
    loadingScreen: document.getElementById('loadingScreen'),
    carouselPrev: document.getElementById('carouselPrev'),
    carouselNext: document.getElementById('carouselNext'),
    trendingCarousel: document.getElementById('trendingCarousel'),
    categoryCards: document.querySelectorAll('.category-card'),
    footerLinks: document.querySelectorAll('.footer-links a[data-category]'),
    // Preview Modal Elements
    previewModal: document.getElementById('previewModal'),
    previewTitle: document.getElementById('previewTitle'),
    previewAuthor: document.getElementById('previewAuthor'),
    previewCategory: document.getElementById('previewCategory'),
    previewDownloads: document.getElementById('previewDownloads'),
    openDriveBtn: document.getElementById('openDriveBtn'),
    downloadPdfBtn: document.getElementById('downloadPdfBtn'),
    closePdfPreview: document.getElementById('closePdfPreview'),
    pdfFrame: document.getElementById('pdfFrame'),
    pdfLoading: document.getElementById('pdfLoading'),
    // Tambahkan ini (elemen yang ada di index.html)
    adPopup: document.getElementById('adPopup'),
    closeAdBtn: document.getElementById('closeAdBtn'),
    whatsappPopup: document.getElementById('whatsappPopup'),
    whatsappFloat: document.getElementById('whatsappFloat'),
    closeWhatsapp: document.getElementById('closeWhatsapp')
};

// Popup Elements
const PopupManager = {
    popups: {
        artikel: document.getElementById('articlePopup'),
        buku: document.getElementById('bukuPopup'),
        cerita: document.getElementById('ceritaPopup'),
        jurnal: document.getElementById('jurnalPopup'),
        berita: document.getElementById('beritaPopup'),
        kamus: document.getElementById('kamusPopup')
    },
    
    closeButtons: {
        artikel: document.getElementById('closeArticlePopup'),
        buku: document.getElementById('closeBukuPopup'),
        cerita: document.getElementById('closeCeritaPopup'),
        jurnal: document.getElementById('closeJurnalPopup'),
        berita: document.getElementById('closeBeritaPopup'),
        kamus: document.getElementById('closeKamusPopup')
    },
    
    // Fungsi untuk membuka popup berdasarkan kategori
    openPopup: (category) => {
        const popup = PopupManager.popups[category];
        if (popup) {
            popup.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    },
    
    // Fungsi untuk menutup popup berdasarkan kategori
    closePopup: (category) => {
        const popup = PopupManager.popups[category];
        if (popup) {
            popup.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    },
    
    // Fungsi untuk menutup semua popup
    closeAllPopups: () => {
        Object.values(PopupManager.popups).forEach(popup => {
            if (popup) {
                popup.style.display = 'none';
            }
        });
        document.body.style.overflow = 'auto';
    }
};

// --- MANAJEMEN DATA REAL-TIME (LOCAL STORAGE) ---
const StatsManager = {
    getKey: () => 'maktabah_stats',
    
    // Inisialisasi atau Ambil Data
    getData: () => {
        const data = localStorage.getItem(StatsManager.getKey());
        if (data) return JSON.parse(data);
        
        return {
            collections: {},
            visitors: 0,
            downloads: 0
        };
    },

    saveData: (data) => {
        localStorage.setItem(StatsManager.getKey(), JSON.stringify(data));
    },

    // Rekam Kunjungan Baru
    incrementVisitor: () => {
        if (!sessionStorage.getItem('visited_session')) {
            const data = StatsManager.getData();
            data.visitors += 1;
            StatsManager.saveData(data);
            sessionStorage.setItem('visited_session', 'true');
        }
    }
};

// Download Manager untuk Index
const DownloadManager = {
    // Load download counts from localStorage
    loadDownloads: () => {
        const stored = localStorage.getItem(contentConfig.storageKey);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                Object.keys(contentConfig.contents).forEach(contentId => {
                    if (parsed[contentId] !== undefined) {
                        contentConfig.contents[contentId].downloadCount = parsed[contentId];
                    }
                });
            } catch (e) {
                console.error("Gagal memuat data unduhan:", e);
            }
        }
    },
    
    // Save download counts to localStorage
    saveDownloads: () => {
        const dataToSave = {};
        Object.keys(contentConfig.contents).forEach(contentId => {
            if (contentConfig.contents[contentId].downloadCount > 0) {
                dataToSave[contentId] = contentConfig.contents[contentId].downloadCount;
            }
        });
        localStorage.setItem(contentConfig.storageKey, JSON.stringify(dataToSave));
    },
    
    // Increment download count
    incrementDownload: (contentId) => {
        if (contentConfig.contents[contentId]) {
            contentConfig.contents[contentId].downloadCount++;
            DownloadManager.saveDownloads();
            
            // Update global stats
            const stats = StatsManager.getData();
            stats.downloads++;
            StatsManager.saveData(stats);
            
            return contentConfig.contents[contentId].downloadCount;
        }
        return 0;
    }
};

// Main Application Class
class MaktabahApp {
    constructor() { 
        this.init(); 
    }
    
    init() {
        this.loadNavbar();
        this.initEventListeners();
        this.initLoadingScreen();
        this.initCarousel();
        this.initCustomCursor();
        this.initCategoryClick();
        this.initFooterNavigation();
        this.initPreviewModal();
        this.initReadButtons();
        
        // Load downloads data
        DownloadManager.loadDownloads();
        
        // Update stats
        StatsManager.incrementVisitor();
    }
    
    loadNavbar() {
        // Cek jika ada file navbar.html di folder navbar
        const navbarPath = document.querySelector('[href*="navbar.html"]') ? './navbar/navbar.html' : 'navbar/navbar.html';
        
        fetch(navbarPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Navbar not found');
                }
                return response.text();
            })
            .then(html => {
                if (DOM.navbarContainer) {
                    DOM.navbarContainer.innerHTML = html;
                    
                    // Jalankan script dari navbar
                    const scripts = DOM.navbarContainer.getElementsByTagName('script');
                    for (let script of scripts) {
                        try {
                            eval(script.textContent);
                        } catch (e) {
                            console.warn('Error executing navbar script:', e);
                        }
                    }
                }
            })
            .catch(error => {
                console.warn('Error loading navbar:', error);
                // Fallback jika navbar gagal dimuat
                if (DOM.navbarContainer) {
                    DOM.navbarContainer.innerHTML = `
                        <nav style="position:fixed; top:0; width:100%; background:#fff; padding:1rem; z-index:1000; border-bottom:1px solid #ddd;">
                            <a href="index.html" style="font-weight:bold; color:#1a4d2e; text-decoration:none;">Maktabah Rasyida</a>
                        </nav>`;
                }
            });
    }
    
    initEventListeners() {
        // Popup iklan
        if (DOM.closeAdBtn && DOM.adPopup) {
            DOM.closeAdBtn.addEventListener('click', () => {
                DOM.adPopup.style.display = 'none';
            });
        }
        
        // WhatsApp
        if (DOM.whatsappFloat && DOM.whatsappPopup) {
            DOM.whatsappFloat.addEventListener('click', () => {
                DOM.whatsappPopup.classList.toggle('active');
            });
        }
        
        if (DOM.closeWhatsapp && DOM.whatsappPopup) {
            DOM.closeWhatsapp.addEventListener('click', () => {
                DOM.whatsappPopup.classList.remove('active');
            });
        }
        
        // Setup close buttons untuk semua popup
        Object.entries(PopupManager.closeButtons).forEach(([category, closeBtn]) => {
            if (closeBtn) {
                closeBtn.addEventListener('click', () => PopupManager.closePopup(category));
            }
        });
        
        // Tutup popup saat klik di luar area popup
        Object.values(PopupManager.popups).forEach(popup => {
            if (popup) {
                popup.addEventListener('click', (e) => {
                    if (e.target === popup) {
                        PopupManager.closeAllPopups();
                    }
                });
            }
        });
        
        // Tutup popup dengan tombol ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                PopupManager.closeAllPopups();
                if (DOM.previewModal && DOM.previewModal.classList.contains('active')) {
                    this.closePreviewModal();
                }
            }
        });
    }
    
    initReadButtons() {
        // Event listener untuk tombol "Baca Disini" di semua bagian
        const readButtons = document.querySelectorAll('.read-btn');
        readButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                // Cari card parent untuk mendapatkan contentId
                const card = button.closest('.book-card, .recommendation-card');
                if (card && card.dataset.contentId) {
                    this.openPreviewModal(card.dataset.contentId);
                }
            });
        });
        
        // Event listener untuk klik pada card itu sendiri
        const contentCards = document.querySelectorAll('.book-card, .recommendation-card');
        contentCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.read-btn') && card.dataset.contentId) {
                    this.openPreviewModal(card.dataset.contentId);
                }
            });
        });
    }
    
    initPreviewModal() {
        // Close button
        if (DOM.closePdfPreview) {
            DOM.closePdfPreview.addEventListener('click', () => {
                this.closePreviewModal();
            });
        }
        
        // Open in Drive button
        if (DOM.openDriveBtn) {
            DOM.openDriveBtn.addEventListener('click', () => {
                if (appState.currentPreviewContent) {
                    window.open(appState.currentPreviewContent.pdfUrl, '_blank');
                }
            });
        }
        
        // Download button
        if (DOM.downloadPdfBtn) {
            DOM.downloadPdfBtn.addEventListener('click', () => {
                if (appState.currentPreviewContent) {
                    this.downloadContent(appState.currentPreviewContent.id);
                }
            });
        }
        
        // Close modal when clicking outside
        if (DOM.previewModal) {
            DOM.previewModal.addEventListener('click', (e) => {
                if (e.target === DOM.previewModal) {
                    this.closePreviewModal();
                }
            });
        }
    }
    
    openPreviewModal(contentId) {
        const content = contentConfig.contents[contentId];
        if (!content) return;
        
        // Set current content
        content.id = contentId;
        appState.currentPreviewContent = content;
        
        // Update modal content
        if (DOM.previewTitle) DOM.previewTitle.textContent = content.title;
        if (DOM.previewAuthor) DOM.previewAuthor.textContent = content.author;
        if (DOM.previewCategory) DOM.previewCategory.textContent = content.category;
        if (DOM.previewDownloads) DOM.previewDownloads.textContent = `${content.downloadCount} kali diunduh`;
        
        // Set button URLs
        if (DOM.openDriveBtn) DOM.openDriveBtn.setAttribute('data-url', content.pdfUrl);
        
        // Show loading
        if (DOM.pdfLoading) DOM.pdfLoading.style.display = 'flex';
        
        // Convert to preview URL and load
        const previewUrl = convertGoogleDriveUrl(content.pdfUrl);
        if (DOM.pdfFrame) DOM.pdfFrame.src = previewUrl;
        
        // Show modal
        if (DOM.previewModal) {
            DOM.previewModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    closePreviewModal() {
        if (DOM.previewModal) {
            DOM.previewModal.classList.remove('active');
        }
        document.body.style.overflow = 'auto';
        
        // Reset iframe source
        setTimeout(() => {
            if (DOM.pdfFrame) DOM.pdfFrame.src = '';
        }, 300);
    }
    
    downloadContent(contentId) {
        const content = contentConfig.contents[contentId];
        if (!content) return;
        
        // Increment download count
        const newCount = DownloadManager.incrementDownload(contentId);
        
        // Update display
        if (DOM.previewDownloads) DOM.previewDownloads.textContent = `${newCount} kali diunduh`;
        
        // Show notification
        this.showNotification(`Mengunduh: ${content.title}`, 'success');
        
        // Trigger download
        setTimeout(() => {
            const directDownloadUrl = convertGoogleDriveToDirectDownload(content.pdfUrl);
            const link = document.createElement('a');
            link.href = directDownloadUrl;
            link.download = `${content.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
            link.target = '_blank';
            
            if (link.download !== undefined) {
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                window.open(content.pdfUrl, '_blank');
            }
        }, 500);
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
    
    initCategoryClick() {
        // Event listener untuk kategori populer
        if (DOM.categoryCards) {
            DOM.categoryCards.forEach(card => {
                card.addEventListener('click', (e) => {
                    const category = card.getAttribute('data-category');
                    
                    // Buka popup sesuai kategori
                    if (PopupManager.popups[category]) {
                        e.preventDefault();
                        PopupManager.openPopup(category);
                    } else {
                        // Untuk kategori yang tidak memiliki popup khusus
                        switch(category) {
                            case 'skripsi':
                                window.location.href = '/jurnal/skripsi.html';
                                break;
                            case 'tesis':
                                window.location.href = '/jurnal/tesis.html';
                                break;
                            case 'disertasi':
                                window.location.href = '/jurnal/disertasi.html';
                                break;
                            case 'novel':
                                window.location.href = '/navbar/buku/buku-fiksi/buku-fiksi.html';
                                break;
                            default:
                                console.log('Kategori tidak dikenali:', category);
                        }
                    }
                });
            });
        }
    }
    
    initFooterNavigation() {
        // Event listener untuk navigasi di footer
        if (DOM.footerLinks) {
            DOM.footerLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const category = link.getAttribute('data-category');
                    
                    // Buka popup sesuai kategori
                    if (PopupManager.popups[category]) {
                        PopupManager.openPopup(category);
                    }
                });
            });
        }
    }

    initCustomCursor() {
        const c = document.querySelector('.cursor'), f = document.querySelector('.cursor-follower');
        if(window.innerWidth > 992) {
            document.addEventListener('mousemove', e => { 
                c.style.left = e.clientX+'px'; 
                c.style.top = e.clientY+'px'; 
                setTimeout(() => { 
                    f.style.left = e.clientX+'px'; 
                    f.style.top = e.clientY+'px'; 
                }, 80); 
            });
        }
    }

    initLoadingScreen() {
        if (DOM.loadingScreen) {
            setTimeout(() => { 
                DOM.loadingScreen.style.opacity = '0'; 
                DOM.loadingScreen.style.visibility = 'hidden'; 
                if(!localStorage.getItem('adShown')) { 
                    setTimeout(() => { 
                        if (DOM.adPopup) {
                            DOM.adPopup.style.display = 'flex'; 
                        }
                        localStorage.setItem('adShown', 'true'); 
                    }, 500); 
                } 
            }, 2000);
        }
    }

    initCarousel() {
        if (DOM.carouselPrev && DOM.carouselNext && DOM.trendingCarousel) {
            DOM.carouselPrev.addEventListener('click', () => DOM.trendingCarousel.scrollLeft -= 300);
            DOM.carouselNext.addEventListener('click', () => DOM.trendingCarousel.scrollLeft += 300);
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Start main application
    window.maktabahApp = new MaktabahApp();
});
