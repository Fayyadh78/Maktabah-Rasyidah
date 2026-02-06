Halo yadh.





1. CARA UBAH TAMPILAN DI LOADING (index.html)
   <div class="loading-screen" id="loadingScreen">
        <div class="loading-content">
            <div class="loading-logo">
                <center><div class="logo-text">Maktabah Rasyida</div></center>("Maktabah Rasyidah" KAMU BISA UBAH DISINI UNTUK MENGUBAH NAMA DI LOADING SCREEN)
            </div>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <div class="loading-text" style="color: var(--text-secondary); text-align: center;">Memuat khazanah ilmu...</div>
        </div>
    </div>

    
2. CARA UBAH TAMPILAN DAN FITUR WHATSAPP DI POJOK KANAN ATAS (index.html)
   !--WA dibagian kanan bawah-->
    <!-- Cari bagian WhatsApp popup dan ubah menjadi: -->
<div class="whatsapp-popup" id="whatsappPopup">
    <div class="whatsapp-options">
        <div class="whatsapp-header">
            <button class="close-whatsapp" id="closeWhatsapp" style="border:none; background:none; cursor:pointer; position: absolute; top: 15px; right: 15px; font-size: 1.2rem; color: var(--text-secondary);"><i class="fas fa-times"></i></button>
            <h3><i class="fab fa-whatsapp"></i> WhatsApp</h3>
        </div>
        <div class="whatsapp-list">
            <a href="https://wa.me/6281219189448?text=Assalamualaikum Wr Wb. Saya ingin menanyakan tentang" target="_blank" class="whatsapp-item"> (kamu bisa ganti nomor hpnya dan bisa ganti isi pesan otomatis di baris ini)
                <i class="fas fa-question-circle" style="color:#25D366"></i><div><h4>Tanya Jawab</h4><p>Seputar koleksi kitab</p></div> (kamu bisa ganti teks saat kamu pencet logo wa di kanan bawah di baris ini)
            </a>
            <a href="https://wa.me/6281219189448?text=Assalamualaikum Wr Wb. Perkenalkan saya/kami dari .... ingin ......" target="_blank" class="whatsapp-item"> (kamu bisa ganti nomor hpnya dan bisa ganti isi pesan otomatis di baris ini)
                <i class="fas fa-handshake" style="color:#25D366"></i><div><h4>Kerja Sama</h4><p>Wakaf buku & kemitraan</p></div> (kamu bisa ganti teks saat kamu pencet logo wa di kanan bawah di baris ini)
            </a>
            </a>
        </div>
    </div>
</div>


3. CARA GANTI TAMPILAN UTAMA BERANDA (index.html)
   <!--Bagian utama-->
    <main class="main-content">
        <section class="hero-section">
            <div class="hero-background"><div class="hero-bg-ornament"></div></div>
            <div class="hero-container">
                <div class="hero-content">
                    <h1 class="hero-title">Selami Samudra <br><span class="highlight">Ilmu Pengetahuan</span></h1> (ubah isi baris ini dengan apa yang kamu mau)
                    <p class="hero-subtitle">Perpustakaan digital dengan nuansa klasik yang menyajikan ribuan koleksi manuskrip, kitab, artikel, novel, karya ilmiah, dan cerita rakyat dalam satu genggaman.</p>(ubah isi baris ini dengan deskripsi yang kamu mau)
                </div>
                <div class="hero-image">
                    <div class="floating-book">
                        <div class="book-cover">
                            <div class="book-title">Maktabah<br>Rasyida</div> (ubah disini untuk merubah nama buku yang logonya 3d)
                            <div style="color:var(--accent-color); font-size:1.5rem;"><i class="fas fa-book-open"></i></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

4. UBAH BUKU TRENDING (index.html)
   <div class="book-card" data-content-id="atomic-habits"> (ganti isi data-content-id= dengan judul buku dengan format "kata1-kata2-kata3-kata4" kala judul bukunya cuma 3 kata ya masukkan sampai kata ke3 dengan penulisan huruf kecil semua dan di setiap katanya ada tanpa strip (-)
                        <div class="trending-badge"><i class="fas fa-fire"></i> TRENDING</div>
                        <img src="asset/rakbuku.jpg" class="book-image" alt="Atomic Habits"> (ubah "asset/rakbuku.jpg", kamu harus simpan foto buku di folder asset dan foto buku itu namanya harus tidak ada spasi. contoh kamu punya foto buku namanya "bukukucing.jpg" ganti dengan hasil jadi "asset/bukukucing.jpg". Dan ubah alt="Atomic Habits"> dengan nama judul bukunya
                        <div class="book-content">
                            <h3 class="book-title">Atomic Habits</h3> (ubah isi baris ini untul mengganti judul bulu. ini harus sama dengan fungsi alt="Atomic habits" yang di atas pas. jadi kalau judul bukumu "Buku Kucing", kamu ganti jadi alt="Buku Kucing"
                            <div class="book-author">James Clear</div> (ubah isi baris ini untuk ganti nama 
                            <span class="book-category">Buku / Non-Fiksi</span> (ganti baris ini. seumpama kalau div ini kamu ganti dengan jurnal-bahasa, kamu bisa ganti jadi "Jurnal / Jurnal-Bahasa"
                            <button class="read-btn left-align">Baca Disini</button>
                        </div>
                    </div> (kamu bisa duplikat ini untuk menggandakan atau memperbanyak Buku Trending



   5. UBAH REKOMENDASI PEMBACA (index.html)
      <div class="recommendations-grid" id="recommendationsGrid">
                <!-- Rekomendasi dengan tombol "Baca Disini" -->
                <div class="recommendation-card" data-content-id="rekomendasi1">
                    <img src="asset/rakbuku.jpg" class="recommendation-image" alt="Rekomendasi Buku 1">
                    <div class="recommendation-content">
                        <h3>Rekomendasi Buku 1</h3>
                        <p style="font-size:0.8rem; color:#666">Deskripsi karya 1 - Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                        <div style="margin-top:5px; font-size:0.8rem; color:var(--accent-color)">Kategori: Ganti Kategori 1</div><br><br>
                        <button class="read-btn left-align">Baca Disini</button>
                    </div>
                </div>


                div ini sama seperti mengubah BUKU TRENDING yang ada di nomor 4


      6. GANTI FOOTER SOSIAL MEDIA (index.html)
         <div class="footer-section">
                <div class="footer-logo">Maktabah Rasyidah</div>
                <p class="footer-description">Perpustakaan digital dengan nuansa klasik yang menyajikan koleksi pengetahuan untuk hidup yang lebih sehat.</p>
                <div class="footer-social">
                    <a href="#" class="social-icon"><i class="fab fa-facebook-f"></i></a> (kamu bisa ganti tagar "#" dengan link sosial mediamu yadh. dan kamu bisa ganti fab fa-facebook-f dengan icon yang lain. kalau kamu bingung, kamu tanya AI gini aja "kalau fab fa-facebook-f iconnya facebook, kalau telegram kodenya apa?"
                    <a href="#" class="social-icon"><i class="fab fa-twitter"></i></a> (kamu bisa ganti tagar "#" dengan link sosial mediamu yadh. dan kamu bisa ganti fab fa-facebook-f dengan icon yang lain. kalau kamu bingung, kamu tanya AI gini aja "kalau fab fa-facebook-f iconnya facebook, kalau telegram kodenya apa?"
                    <a href="#" class="social-icon"><i class="fab fa-instagram"></i></a> (kamu bisa ganti tagar "#" dengan link sosial mediamu yadh. dan kamu bisa ganti fab fa-facebook-f dengan icon yang lain. kalau kamu bingung, kamu tanya AI gini aja "kalau fab fa-facebook-f iconnya facebook, kalau telegram kodenya apa?"
                </div>
            </div>



      7. Tambahan (opsi developer kelas atas) (index.html)
         <div class="footer-section">
                <h3>Bantuan</h3>
                <ul class="footer-links">
                    <li><a href="#">Pusat Bantuan</a></li> (kamu bisa ganti tagar "#" dengan link yang kamu mau, (ini adalah opsi developer saja)
                    <li><a href="#">FAQ</a></li> (kamu bisa ganti tagar "#" dengan link yang kamu mau, (ini adalah opsi developer saja)
                    <li><a href="#">Kontak Kami</a></li> (kamu bisa ganti tagar "#" dengan link yang kamu mau, (ini adalah opsi developer saja)
                    <li><a href="#">Kebijakan Privasi</a></li> (kamu bisa ganti tagar "#" dengan link yang kamu mau, (ini adalah opsi developer saja)
                    <li><a href="#">Syarat Layanan</a></li> (kamu bisa ganti tagar "#" dengan link yang kamu mau, (ini adalah opsi developer saja)
                </ul>
            </div>


      8. MENAMBAHKAN KONTEN DI HALAMAN UTAMA (index.html)
         "atomic-habits": {     (sama kan dengan data-content-id="atomic-habits" yang ada di atas)
                "title": "Atomic Habits", (ganti judul)
                "author": "James Clear", (ganti nama penulis)
                "category": "Buku / Non-Fiksi", (ganti kategori)
                "pdfUrl": "https://drive.google.com/file/d/137ZVL623uMv3MMuBVnoKybHH40_w7vTs/view?usp=sharing", (ganti link dengan g-drive yang sudah kamu share dengan everyone)
                "downloadCount": 0
            }, (kalau ini terakhir, hapus kan koma (,) jadinya hanya (}) saja. kalau ini bukan terakhir, jangan hapus tanda koma (,)

         
        
