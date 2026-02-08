// File ini bisa digunakan untuk mengupdate artikel-umum.html secara otomatis
// Simpan di: https://maktabah-rasyidah.web.id/update-artikel-umum.js

function updateArtikelUmumWebsite() {
    // Ambil data dari localStorage admin
    const articlesData = localStorage.getItem('maktabah_umum_articles');
    
    if (!articlesData) {
        alert('Tidak ada data artikel yang tersedia di CMS!');
        return;
    }
    
    const articles = JSON.parse(articlesData);
    
    // Format data untuk website
    const configData = {
        articles: articles,
        categories: {
            kategori1: "kategori 1",
            kategori2: "kategori 2", 
            kategori3: "kategori 3",
            kategori4: "kategori 4",
            kategori5: "kategori 5",
            kategori6: "kategori 6"
        },
        website: {
            name: "Maktabah Rasyidah",
            description: "Perpustakaan digital dengan nuansa klasik yang menyajikan koleksi pengetahuan untuk hidup yang lebih sehat.",
            year: new Date().getFullYear()
        },
        social: {
            facebook: "#",
            twitter: "#",
            instagram: "#"
        }
    };
    
    // Konversi ke string JSON
    const jsonString = JSON.stringify(configData, null, 2);
    
    // Buat blob untuk download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Buat link download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'articles-config-updated.json';
    a.textContent = 'Download Config Baru';
    
    // Tambahkan ke body dan klik
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Beri instruksi
    alert('File config berhasil dibuat! Ganti konten di artikel-umum.html pada bagian <script id="articles-config"> dengan konten file yang baru didownload.');
}
