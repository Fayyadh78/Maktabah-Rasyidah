// DOM Elements
const DOM = {
    adPopup: document.getElementById('adPopup'), 
    closeAdBtn: document.getElementById('closeAdBtn'),
    whatsappFloat: document.getElementById('whatsappFloat'),
    whatsappPopup: document.getElementById('whatsappPopup'), 
    closeWhatsapp: document.getElementById('closeWhatsapp'),
    loadingScreen: document.getElementById('loadingScreen'),
    carouselPrev: document.getElementById('carouselPrev'),
    carouselNext: document.getElementById('carouselNext'), 
    trendingCarousel: document.getElementById('trendingCarousel')
};

// --- MANAJEMEN DATA REAL-TIME (LOCAL STORAGE) ---
const StatsManager = {
    getKey: () => 'maktabah_stats',
    
    // Inisialisasi atau Ambil Data
    getData: () => {
        const data = localStorage.getItem(StatsManager.getKey());
        if (data) return JSON.parse(data);
        
        // Struktur awal jika belum ada data sama sekali
        return {
            collections: {}, // Menyimpan jumlah file per kategori/halaman (objek)
            visitors: 0,     // Total pengunjung
            downloads: 0     // Total download
        };
    },

    saveData: (data) => {
        localStorage.setItem(StatsManager.getKey(), JSON.stringify(data));
    },

    // Rekam Kunjungan Baru
    incrementVisitor: () => {
        // Mengecek sesi browser (sessionStorage) agar refresh halaman tidak menambah count
        if (!sessionStorage.getItem('visited_session')) {
            const data = StatsManager.getData();
            data.visitors += 1;
            StatsManager.saveData(data);
            sessionStorage.setItem('visited_session', 'true');
        }
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
        
        // UPDATE: Menggunakan Data Real dari StatsManager
        StatsManager.incrementVisitor(); // Hitung pengunjung saat ini
    }
    
    loadNavbar() {
        fetch('/navbar/navbar.html')
            .then(response => response.text())
            .then(html => {
                document.getElementById('navbar-container').innerHTML = html;
                
                // Jalankan script dari navbar
                const scripts = document.getElementById('navbar-container').getElementsByTagName('script');
                for (let script of scripts) {
                    eval(script.textContent);
                }
            })
            .catch(error => {
                console.error('Error loading navbar:', error);
                // Fallback jika navbar gagal dimuat
                document.getElementById('navbar-container').innerHTML = `
                    <nav style="position:fixed; top:0; width:100%; background:#fff; padding:1rem; z-index:1000; border-bottom:1px solid #ddd;">
                        <a href="index.html" style="font-weight:bold; color:#1a4d2e; text-decoration:none;">Maktabah Rasyida</a>
                    </nav>`;
            });
    }
    
    initEventListeners() {
        DOM.closeAdBtn.addEventListener('click', () => DOM.adPopup.style.display = 'none');
        DOM.whatsappFloat.addEventListener('click', () => DOM.whatsappPopup.classList.toggle('active'));
        DOM.closeWhatsapp.addEventListener('click', () => DOM.whatsappPopup.classList.remove('active'));
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
        setTimeout(() => { 
            DOM.loadingScreen.style.opacity = '0'; 
            DOM.loadingScreen.style.visibility = 'hidden'; 
            if(!localStorage.getItem('adShown')) { 
                setTimeout(() => { 
                    DOM.adPopup.style.display = 'flex'; 
                    localStorage.setItem('adShown', 'true'); 
                }, 500); 
            } 
        }, 2000);
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