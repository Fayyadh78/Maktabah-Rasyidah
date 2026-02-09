// ==============================================
// EDITOR ADMIN ARTIKEL SOSIAL
// ==============================================

const ARTICLES_STORAGE_KEY = 'maktabah_sosial_articles_admin';
const CONFIG_STORAGE_KEY = 'maktabah_sosial_config';

const CATEGORY_LABELS = {
    'psikologi-sosial': 'Psikologi Sosial',
    'komunikasi': 'Komunikasi',
    'kebudayaan': 'Kebudayaan',
    'masyarakat': 'Masyarakat',
    'etika-sosial': 'Etika Sosial',
    'perubahan-sosial': 'Perubahan Sosial'
};

const SITE_META = {
    name: 'Maktabah Rasyidah',
    description: 'Perpustakaan digital dengan nuansa klasik yang menyajikan koleksi pengetahuan untuk hidup yang lebih sehat.',
    year: 2026
};

const DOM = {
    navbarContainer: document.getElementById('navbar-container'),
    form: document.getElementById('articleForm'),
    formMode: document.getElementById('formMode'),
    formMessage: document.getElementById('formMessage'),
    articleId: document.getElementById('articleId'),
    articleTitle: document.getElementById('articleTitle'),
    articleAuthor: document.getElementById('articleAuthor'),
    articleYear: document.getElementById('articleYear'),
    articleCategory: document.getElementById('articleCategory'),
    articleDescription: document.getElementById('articleDescription'),
    articlePages: document.getElementById('articlePages'),
    articleSize: document.getElementById('articleSize'),
    articleIcon: document.getElementById('articleIcon'),
    articlePdfUrl: document.getElementById('articlePdfUrl'),
    iconPicker: document.getElementById('iconPicker'),
    btnNewArticle: document.getElementById('btnNewArticle'),
    btnCancel: document.getElementById('btnCancel'),
    btnImportMain: document.getElementById('btnImportMain'),
    btnExportJson: document.getElementById('btnExportJson'),
    btnResetData: document.getElementById('btnResetData'),
    searchInput: document.getElementById('searchInput'),
    filterCategory: document.getElementById('filterCategory'),
    articlesList: document.getElementById('articlesList'),
    emptyState: document.getElementById('emptyState'),
    statTotalArticles: document.getElementById('statTotalArticles'),
    statTotalAuthors: document.getElementById('statTotalAuthors'),
    statTotalPages: document.getElementById('statTotalPages'),
    statLastSaved: document.getElementById('statLastSaved'),
    toolbarSubtitle: document.getElementById('toolbarSubtitle'),
    confirmModal: document.getElementById('confirmModal'),
    confirmMessage: document.getElementById('confirmMessage'),
    btnCancelDelete: document.getElementById('btnCancelDelete'),
    btnConfirmDelete: document.getElementById('btnConfirmDelete')
};

let articlesData = [];
let deleteTargetId = null;

function safeParseJSON(value, fallback) {
    if (!value) return fallback;
    try {
        return JSON.parse(value);
    } catch (e) {
        return fallback;
    }
}

async function init() {
    DOM.articleYear.value = new Date().getFullYear();
    await loadNavbar();
    await loadInitialArticles();
    setupEventListeners();
    renderArticles();
    updateStats();
}

async function loadNavbar() {
    try {
        const response = await fetch('/navbar/navbar.html');
        if (response.ok) {
            const html = await response.text();
            DOM.navbarContainer.innerHTML = html;
            return;
        }
    } catch (e) {
        // ignore and fallback
    }

    DOM.navbarContainer.innerHTML = `
        <nav class="navbar-module" style="position:fixed; top:0; width:100%; background:rgba(253, 251, 247, 0.95); backdrop-filter:blur(12px); border-bottom:1px solid rgba(197, 160, 89, 0.3); z-index:1000; padding:0 1rem;">
            <div class="nav-container-module" style="max-width:1400px; margin:0 auto; display:flex; justify-content:space-between; align-items:center; height:70px;">
                <a href="/" class="logo-module" style="text-decoration:none;">
                    <div class="logo-text-module">
                        <span class="logo-main-module" style="font-family:'Cinzel',serif; font-size:1.8rem; color:#1a4d2e;">Maktabah</span>
                        <span class="logo-sub-module" style="font-size:0.8rem; color:#c5a059; letter-spacing:3px;">Rasyidah</span>
                    </div>
                </a>
                <div class="nav-links" style="display:flex; gap:1rem;">
                    <a href="artikel-sosial.html" class="nav-link" style="color:#1a4d2e; text-decoration:none; font-weight:500;">
                        <i class="fas fa-arrow-left"></i> Kembali ke Artikel
                    </a>
                </div>
            </div>
        </nav>
    `;
}

async function loadInitialArticles() {
    const stored = safeParseJSON(localStorage.getItem(ARTICLES_STORAGE_KEY), null);
    if (Array.isArray(stored)) {
        articlesData = stored;
        return;
    }

    const storedConfig = safeParseJSON(localStorage.getItem(CONFIG_STORAGE_KEY), null);
    if (storedConfig && Array.isArray(storedConfig.articles)) {
        articlesData = storedConfig.articles;
        return;
    }

    const fetched = await fetchArticlesFromMain();
    if (Array.isArray(fetched)) {
        articlesData = fetched;
        persistData();
        return;
    }

    articlesData = [
        {
            "id": 1,
            "title": "Dinamika Komunikasi dalam Masyarakat Digital",
            "author": "Dr. Ahmad Surya",
            "year": 2025,
            "category": "komunikasi",
            "description": "Analisis mendalam tentang perubahan pola komunikasi di era digital dan dampaknya terhadap hubungan sosial.",
            "pages": 45,
            "size": "6.2 MB",
            "icon": "fas fa-comments",
            "pdfUrl": "https://drive.google.com/file/d/1sampel-view?usp=sharing",
            "downloadCount": 0
        },
        {
            "id": 2,
            "title": "Psikologi Konformitas Sosial",
            "author": "Prof. Maya Dewi",
            "year": 2024,
            "category": "psikologi-sosial",
            "description": "Studi tentang pengaruh kelompok terhadap perilaku individu dalam berbagai konteks sosial.",
            "pages": 32,
            "size": "4.5 MB",
            "icon": "fas fa-users",
            "pdfUrl": "https://drive.google.com/file/d/1sampel-view?usp=sharing",
            "downloadCount": 0
        }
    ];
    persistData();
}

async function fetchArticlesFromMain() {
    try {
        const response = await fetch('artikel-sosial.html');
        if (!response.ok) return null;
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const configScript = doc.getElementById('articles-config');
        if (!configScript) return null;
        const config = JSON.parse(configScript.textContent);
        return Array.isArray(config.articles) ? config.articles : [];
    } catch (e) {
        return null;
    }
}

function setupEventListeners() {
    DOM.form.addEventListener('submit', handleSubmit);
    DOM.btnNewArticle.addEventListener('click', handleNewArticle);
    DOM.btnCancel.addEventListener('click', resetForm);
    DOM.btnImportMain.addEventListener('click', handleImportFromMain);
    DOM.btnExportJson.addEventListener('click', handleExportJson);
    DOM.btnResetData.addEventListener('click', handleResetData);
    DOM.searchInput.addEventListener('input', renderArticles);
    DOM.filterCategory.addEventListener('change', renderArticles);
    DOM.articlesList.addEventListener('click', handleListClick);
    DOM.iconPicker.addEventListener('click', handleIconPick);

    DOM.btnCancelDelete.addEventListener('click', closeDeleteModal);
    DOM.btnConfirmDelete.addEventListener('click', confirmDelete);
    DOM.confirmModal.addEventListener('click', (event) => {
        if (event.target === DOM.confirmModal) {
            closeDeleteModal();
        }
    });
}

function handleIconPick(event) {
    const button = event.target.closest('.icon-option');
    if (!button) return;

    const icon = button.dataset.icon;
    DOM.articleIcon.value = icon;

    document.querySelectorAll('.icon-option').forEach(option => {
        option.classList.toggle('selected', option.dataset.icon === icon);
    });
}

function handleNewArticle() {
    resetForm();
    DOM.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function handleImportFromMain() {
    const fetched = await fetchArticlesFromMain();
    if (!Array.isArray(fetched)) {
        showMessage('Gagal memuat dari artikel utama. Pastikan file artikel-sosial.html tersedia.', 'error');
        return;
    }
    articlesData = fetched;
    persistData();
    renderArticles();
    updateStats();
    showMessage('Berhasil memuat data dari artikel utama.', 'success');
}

function handleExportJson() {
    const payload = {
        articles: articlesData,
        categories: CATEGORY_LABELS,
        website: SITE_META
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'artikel-sosial-config.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

async function handleResetData() {
    const shouldReset = window.confirm('Reset akan mengembalikan data ke default. Lanjutkan?');
    if (!shouldReset) return;

    const fetched = await fetchArticlesFromMain();
    if (Array.isArray(fetched)) {
        articlesData = fetched;
        persistData();
        renderArticles();
        updateStats();
        showMessage('Data berhasil direset ke default.', 'success');
        return;
    }

    // Reset ke data awal
    articlesData = [
        {
            "id": 1,
            "title": "Dinamika Komunikasi dalam Masyarakat Digital",
            "author": "Dr. Ahmad Surya",
            "year": 2025,
            "category": "komunikasi",
            "description": "Analisis mendalam tentang perubahan pola komunikasi di era digital dan dampaknya terhadap hubungan sosial.",
            "pages": 45,
            "size": "6.2 MB",
            "icon": "fas fa-comments",
            "pdfUrl": "https://drive.google.com/file/d/1sampel-view?usp=sharing",
            "downloadCount": 0
        },
        {
            "id": 2,
            "title": "Psikologi Konformitas Sosial",
            "author": "Prof. Maya Dewi",
            "year": 2024,
            "category": "psikologi-sosial",
            "description": "Studi tentang pengaruh kelompok terhadap perilaku individu dalam berbagai konteks sosial.",
            "pages": 32,
            "size": "4.5 MB",
            "icon": "fas fa-users",
            "pdfUrl": "https://drive.google.com/file/d/1sampel-view?usp=sharing",
            "downloadCount": 0
        }
    ];
    persistData();
    renderArticles();
    updateStats();
    showMessage('Data berhasil direset ke konfigurasi awal.', 'success');
}

function handleSubmit(event) {
    event.preventDefault();

    const validation = validateForm();
    if (!validation.valid) {
        showMessage(validation.message, 'error');
        return;
    }

    const payload = getFormPayload();
    const existingId = DOM.articleId.value ? parseInt(DOM.articleId.value, 10) : null;

    if (existingId) {
        const index = articlesData.findIndex(article => article.id === existingId);
        if (index !== -1) {
            payload.id = existingId;
            payload.downloadCount = articlesData[index].downloadCount || 0;
            articlesData[index] = payload;
            showMessage('Artikel berhasil diperbarui.', 'success');
        }
    } else {
        payload.id = generateNewId();
        payload.downloadCount = 0;
        articlesData.unshift(payload);
        showMessage('Artikel baru berhasil ditambahkan.', 'success');
    }

    persistData();
    renderArticles();
    updateStats();
    resetForm();
}

function validateForm() {
    if (!DOM.articleTitle.value.trim()) return { valid: false, message: 'Judul artikel wajib diisi.' };
    if (!DOM.articleAuthor.value.trim()) return { valid: false, message: 'Nama penulis wajib diisi.' };
    if (!DOM.articleYear.value.trim()) return { valid: false, message: 'Tahun wajib diisi.' };
    if (!DOM.articleCategory.value.trim()) return { valid: false, message: 'Kategori wajib dipilih.' };
    if (!DOM.articleDescription.value.trim()) return { valid: false, message: 'Deskripsi wajib diisi.' };
    if (!DOM.articlePages.value.trim()) return { valid: false, message: 'Jumlah halaman wajib diisi.' };
    if (!DOM.articleIcon.value.trim()) return { valid: false, message: 'Icon wajib diisi.' };
    if (!DOM.articlePdfUrl.value.trim()) return { valid: false, message: 'URL PDF wajib diisi.' };

    if (!DOM.articlePdfUrl.value.includes('drive.google.com')) {
        return { valid: false, message: 'URL PDF harus berupa link Google Drive.' };
    }

    return { valid: true };
}

function getFormPayload() {
    return {
        title: DOM.articleTitle.value.trim(),
        author: DOM.articleAuthor.value.trim(),
        year: parseInt(DOM.articleYear.value, 10),
        category: DOM.articleCategory.value.trim(),
        description: DOM.articleDescription.value.trim(),
        pages: parseInt(DOM.articlePages.value, 10),
        size: DOM.articleSize.value.trim() || '0 MB',
        icon: DOM.articleIcon.value.trim(),
        pdfUrl: DOM.articlePdfUrl.value.trim()
    };
}

function generateNewId() {
    if (articlesData.length === 0) return 1;
    const maxId = Math.max(...articlesData.map(article => article.id || 0));
    return maxId + 1;
}

function renderArticles() {
    const searchTerm = DOM.searchInput.value.trim().toLowerCase();
    const categoryFilter = DOM.filterCategory.value;

    const filtered = articlesData.filter(article => {
        const matchesSearch = !searchTerm ||
            article.title.toLowerCase().includes(searchTerm) ||
            article.author.toLowerCase().includes(searchTerm) ||
            article.description.toLowerCase().includes(searchTerm) ||
            article.category.toLowerCase().includes(searchTerm);

        const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    if (filtered.length === 0) {
        DOM.articlesList.innerHTML = '';
        DOM.emptyState.style.display = 'block';
        DOM.emptyState.textContent = articlesData.length === 0
            ? 'Belum ada artikel. Tambahkan artikel pertama Anda.'
            : 'Tidak ada artikel yang sesuai dengan filter.';
        return;
    }

    DOM.emptyState.style.display = 'none';

    DOM.articlesList.innerHTML = filtered.map(article => {
        const iconClass = article.icon || 'fas fa-book';
        return `
            <article class="admin-item" data-id="${article.id}">
                <div class="admin-item-header">
                    <div class="admin-item-title">
                        <span class="admin-item-icon"><i class="${iconClass}"></i></span>
                        <div>
                            <h4>${article.title}</h4>
                            <p>${article.author} • ${article.year}</p>
                        </div>
                    </div>
                    <span class="admin-badge">${CATEGORY_LABELS[article.category] || article.category}</span>
                </div>
                <p class="admin-item-description">${article.description}</p>
                <div class="admin-item-meta">
                    <span><i class="fas fa-file-alt"></i> ${article.pages} halaman</span>
                    <span><i class="fas fa-download"></i> ${article.downloadCount || 0} download</span>
                    <span><i class="fas fa-link"></i> ${article.pdfUrl.includes('drive.google.com') ? 'Google Drive' : 'Link PDF'}</span>
                </div>
                <div class="admin-item-actions">
                    <button class="btn btn-outline btn-small" data-action="edit"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn-danger btn-small" data-action="delete"><i class="fas fa-trash"></i> Hapus</button>
                </div>
            </article>
        `;
    }).join('');
}

function handleListClick(event) {
    const actionButton = event.target.closest('button[data-action]');
    if (!actionButton) return;

    const articleElement = event.target.closest('.admin-item');
    if (!articleElement) return;

    const articleId = parseInt(articleElement.dataset.id, 10);
    if (actionButton.dataset.action === 'edit') {
        populateForm(articleId);
    }

    if (actionButton.dataset.action === 'delete') {
        openDeleteModal(articleId);
    }
}

function populateForm(articleId) {
    const article = articlesData.find(item => item.id === articleId);
    if (!article) return;

    DOM.articleId.value = article.id;
    DOM.articleTitle.value = article.title;
    DOM.articleAuthor.value = article.author;
    DOM.articleYear.value = article.year;
    DOM.articleCategory.value = article.category;
    DOM.articleDescription.value = article.description;
    DOM.articlePages.value = article.pages;
    DOM.articleSize.value = article.size || '';
    DOM.articleIcon.value = article.icon || '';
    DOM.articlePdfUrl.value = article.pdfUrl;

    DOM.formMode.textContent = 'Mode Edit';
    DOM.toolbarSubtitle.textContent = 'Anda sedang mengedit artikel. Simpan untuk memperbarui.';

    document.querySelectorAll('.icon-option').forEach(option => {
        option.classList.toggle('selected', option.dataset.icon === article.icon);
    });

    DOM.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetForm() {
    DOM.form.reset();
    DOM.articleId.value = '';
    DOM.articleYear.value = new Date().getFullYear();
    DOM.formMode.textContent = 'Mode Tambah';
    DOM.toolbarSubtitle.textContent = 'Gunakan form di kiri untuk menambah atau mengedit artikel.';
    DOM.formMessage.style.display = 'none';

    document.querySelectorAll('.icon-option').forEach(option => option.classList.remove('selected'));
}

function openDeleteModal(articleId) {
    deleteTargetId = articleId;
    const article = articlesData.find(item => item.id === articleId);
    DOM.confirmMessage.textContent = article
        ? `Apakah Anda yakin ingin menghapus artikel "${article.title}"?`
        : 'Apakah Anda yakin ingin menghapus artikel ini?';
    DOM.confirmModal.classList.add('active');
}

function closeDeleteModal() {
    deleteTargetId = null;
    DOM.confirmModal.classList.remove('active');
}

function confirmDelete() {
    if (!deleteTargetId) return;
    articlesData = articlesData.filter(article => article.id !== deleteTargetId);
    persistData();
    renderArticles();
    updateStats();
    closeDeleteModal();
    showMessage('Artikel berhasil dihapus.', 'success');
}

function persistData() {
    try {
        localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(articlesData));
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify({
            articles: articlesData,
            categories: CATEGORY_LABELS,
            website: SITE_META
        }));
        DOM.statLastSaved.textContent = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        showMessage('Gagal menyimpan data. Periksa penyimpanan browser.', 'error');
    }
}

function updateStats() {
    DOM.statTotalArticles.textContent = articlesData.length;

    const authors = new Set(articlesData.map(article => article.author));
    DOM.statTotalAuthors.textContent = authors.size;

    const totalPages = articlesData.reduce((sum, article) => sum + (article.pages || 0), 0);
    DOM.statTotalPages.textContent = totalPages;
}

function showMessage(message, type) {
    DOM.formMessage.textContent = message;
    DOM.formMessage.classList.remove('success', 'error');
    DOM.formMessage.classList.add(type);
    DOM.formMessage.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', init);