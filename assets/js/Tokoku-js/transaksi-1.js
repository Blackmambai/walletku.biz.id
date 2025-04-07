document.addEventListener('DOMContentLoaded', () => {
    const cariProduk = document.getElementById('cariProduk');
    const daftarProduk = document.getElementById('daftarProduk');
    const keranjang = document.getElementById('keranjang');
    const totalHarga = document.getElementById('totalHarga');
    const btnProsesPembayaran = document.getElementById('btnProsesPembayaran');
    const formTambahProdukCepat = document.getElementById('formTambahProdukCepat');
    const formPembayaran = document.getElementById('formPembayaran');
    const strukPembayaran = document.getElementById('strukPembayaran');
    const btnCetakNota = document.getElementById('btnCetakNota');

    // Load keranjang dari localStorage jika ada, atau inisialisasi baru
    let keranjangItems = JSON.parse(localStorage.getItem('keranjangSementara') || '[]');
    let produkList = [];

    // Fungsi untuk menyimpan keranjang ke localStorage
    function simpanKeranjang() {
        localStorage.setItem('keranjangSementara', JSON.stringify(keranjangItems));
    }

    // Fungsi Buat Struk
    function buatStruk(nota) {
        const pengaturanToko = JSON.parse(localStorage.getItem('pengaturanToko') || '{}');
        
        return `
            <div id="strukCetak" class="container-fluid p-3" style="
                max-width: 400px; 
                margin: 0 auto; 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                border: 2px solid #4a90e2;
                border-radius: 10px;
                box-shadow: 0 0 15px rgba(74, 144, 226, 0.3);
                position: relative;
                overflow: hidden;
                background: linear-gradient(135deg, #f8f9fa 0%, #e9f5ff 100%);
            ">
                <!-- Watermark dan konten struk lainnya -->
                <!-- ... (sama seperti sebelumnya) ... -->
            </div>
        `;
    }

    // Fungsi Cetak Nota
    function cetakNota(nota) {
        const jendelaCetak = window.open('', '_blank', 'width=800,height=600');
        
        if (!nota) {
            alert('Nota tidak valid');
            return;
        }

        jendelaCetak.document.open();
        jendelaCetak.document.write(`
            <html>
                <head>
                    <title>Cetak Nota</title>
                    <style>
                        @media print {
                            body { 
                                display: flex; 
                                justify-content: center; 
                                align-items: center; 
                                margin: 0;
                                padding: 0;
                            }
                            #strukCetak { 
                                max-width: 300px !important; 
                                margin: 0 auto !important;
                            }
                        }
                        body { 
                            font-family: 'Courier New', monospace; 
                            display: flex; 
                            justify-content: center; 
                            align-items: center; 
                            height: 100vh; 
                            margin: 0; 
                        }
                    </style>
                </head>
                <body>
                    ${buatStruk(nota)}
                    <script>
                        window.onload = function() {
                            window.print();
                            window.close();
                        }
                    <\/script>
                </body>
            </html>
        `);
        jendelaCetak.document.close();
    }

    // Muat Produk
    function muatProduk(filter = '') {
        produkList = JSON.parse(localStorage.getItem('produk') || '[]');
        
        // Hitung total item di keranjang untuk setiap produk
        const produkDiKeranjang = {};
        keranjangItems.forEach(item => {
            produkDiKeranjang[item.nama] = item.jumlah;
        });

        const produkTersedia = produkList.filter(p => 
            (p.stokProduk > 0 || produkDiKeranjang[p.namaProduk]) && 
            p.namaProduk.toLowerCase().includes(filter.toLowerCase())
        );

        daftarProduk.innerHTML = produkTersedia.map(produk => {
            const stokTersedia = produk.stokProduk - (produkDiKeranjang[produk.namaProduk] || 0);
            const disabled = stokTersedia <= 0 ? 'disabled' : '';
            
            return `
                <div class="col-md-4" style="padding: 5px;margin-bottom: 16px;">
                    <div class="card summary-card paddingAll produk01" style="padding: 10px;">
                        <div class="card-body" style="padding: 0px;">
                            <img src="${produk.fotoProduk || 'https://walletku.biz.id/assets/img/notfound.webp'}" 
                             class="card-img-top" 
                             alt="${produk.namaProduk}"
                             style="border-radius: 16px 16px 0 0; object-fit: cover;height: 200px;margin-bottom: 16px;">
                            <h5 class="card-title" style="font-family: Nunito, sans-serif;font-size: 20px;font-weight: bold;">${produk.namaProduk}</h5>
                            <p class="card-text" style="font-family: Nunito, sans-serif;font-size: 16px;color: rgb(43,43,44);font-weight: bold;"> 
                                Harga: Rp ${produk.hargaJual.toLocaleString()}<br /> 
                                Stok: ${produk.stokProduk} 
                                ${produkDiKeranjang[produk.namaProduk] ? `(Dalam keranjang: ${produkDiKeranjang[produk.namaProduk]})` : ''}
                            </p>
                            <button class="btn btn-primary text-nowrap text-start d-flex d-xxl-flex justify-content-center align-items-center tambah-produk btnproduk1" 
                                data-nama="${produk.namaProduk}" 
                                data-harga="${produk.hargaJual}" 
                                data-stok="${produk.stokProduk}"
                                ${disabled}>
                                <i class="fas fa-plus-circle" style="margin-right: 10px;"></i> Tambah 
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        document.querySelectorAll('.tambah-produk').forEach(btn => {
            btn.addEventListener('click', tambahKeKeranjang);
        });
    }

    // Update Stok Produk
    function updateProductStock(productName, changeAmount) {
        const produkList = JSON.parse(localStorage.getItem('produk') || '[]');
        const productIndex = produkList.findIndex(p => p.namaProduk === productName);
        
        if (productIndex !== -1) {
            produkList[productIndex].stokProduk += changeAmount;
            localStorage.setItem('produk', JSON.stringify(produkList));
            muatProduk(cariProduk.value);
        }
    }

    // Tambah ke Keranjang
    function tambahKeKeranjang(e) {
        const nama = e.currentTarget.dataset.nama;
        const harga = parseFloat(e.currentTarget.dataset.harga);
        const stok = parseInt(e.currentTarget.dataset.stok);

        const itemExist = keranjangItems.find(item => item.nama === nama);

        if (itemExist) {
            const produkList = JSON.parse(localStorage.getItem('produk') || '[]');
            const produk = produkList.find(p => p.namaProduk === nama);
            
            if (itemExist.jumlah < produk.stokProduk) {
                itemExist.jumlah++;
                updateProductStock(nama, -1);
            } else {
                alert('Stok produk tidak mencukupi');
                return;
            }
        } else {
            keranjangItems.push({
                nama,
                harga,
                jumlah: 1
            });
            updateProductStock(nama, -1);
        }

        simpanKeranjang();
        updateKeranjang();
    }

    // Update Keranjang
    function updateKeranjang() {
        if (keranjangItems.length === 0) {
            keranjang.innerHTML = '<li class="list-group-item text-center text-muted">Keranjang kosong</li>';
            totalHarga.textContent = 'Rp 0';
            return;
        }

        keranjang.innerHTML = keranjangItems.map((item, index) => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <strong>${item.nama}</strong>
                    <small class="d-block">Rp ${item.harga.toLocaleString()} x ${item.jumlah}</small>
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-danger me-2 kurang-item" data-index="${index}" data-nama="${item.nama}">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger hapus-item" data-index="${index}" data-nama="${item.nama}" data-jumlah="${item.jumlah}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </li>
        `).join('');

        const total = keranjangItems.reduce((sum, item) => sum + (item.harga * item.jumlah), 0);
        totalHarga.textContent = `Rp ${total.toLocaleString()}`;

        document.querySelectorAll('.kurang-item').forEach(btn => {
            btn.addEventListener('click', kurangItem);
        });

        document.querySelectorAll('.hapus-item').forEach(btn => {
            btn.addEventListener('click', hapusItem);
        });
    }

    // Kurang Item
    function kurangItem(e) {
        const index = e.currentTarget.dataset.index;
        const productName = e.currentTarget.dataset.nama;
        
        if (keranjangItems[index].jumlah > 1) {
            keranjangItems[index].jumlah--;
            updateProductStock(productName, 1);
        } else {
            const jumlahItem = keranjangItems[index].jumlah;
            keranjangItems.splice(index, 1);
            updateProductStock(productName, jumlahItem);
        }
        
        simpanKeranjang();
        updateKeranjang();
    }

    // Hapus Item
    function hapusItem(e) {
        const index = e.currentTarget.dataset.index;
        const productName = e.currentTarget.dataset.nama;
        const jumlahItem = keranjangItems[index].jumlah;
        
        keranjangItems.splice(index, 1);
        updateProductStock(productName, jumlahItem);
        
        simpanKeranjang();
        updateKeranjang();
    }

    // Proses Pembayaran
    btnProsesPembayaran.addEventListener('click', () => {
        if (keranjangItems.length === 0) {
            alert('Keranjang masih kosong');
            return;
        }

        const total = keranjangItems.reduce((sum, item) => sum + (item.harga * item.jumlah), 0);
        document.getElementById('totalPembayaran').value = `Rp ${total.toLocaleString()}`;
        
        new bootstrap.Modal(document.getElementById('modalPembayaran')).show();
    });

    // Submit Pembayaran
    formPembayaran.addEventListener('submit', (e) => {
        e.preventDefault();
        const total = keranjangItems.reduce((sum, item) => sum + (item.harga * item.jumlah), 0);
        const uangDiterima = parseFloat(document.getElementById('uangDiterima').value);
        const namaPelanggan = document.getElementById('namaPelanggan').value;
        const metodePembayaran = document.getElementById('metodePembayaran').value;

        if (uangDiterima < total) {
            alert('Uang yang diterima kurang');
            return;
        }

        // Simpan nota
        const nota = JSON.parse(localStorage.getItem('nota') || '[]');
        const notaBaru = {
            tanggal: new Date().toLocaleDateString('id-ID', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            namaPelanggan,
            metodePembayaran,
            produk: keranjangItems,
            totalHarga: total,
            uangDiterima,
            kembalian: uangDiterima - total
        };
        nota.push(notaBaru);
        localStorage.setItem('nota', JSON.stringify(nota));

        // Tampilkan struk
        strukPembayaran.innerHTML = buatStruk(notaBaru);
        const modalStruk = new bootstrap.Modal(document.getElementById('modalStruk'));
        modalStruk.show();

        btnCetakNota.onclick = () => {
            cetakNota(notaBaru);
            // Kosongkan keranjang setelah cetak
            keranjangItems = [];
            localStorage.removeItem('keranjangSementara');
            updateKeranjang();
            muatProduk();
        };

        // Reset form
        formPembayaran.reset();
        bootstrap.Modal.getInstance(document.getElementById('modalPembayaran')).hide();
    });

    // Hitung Kembalian
    document.getElementById('uangDiterima').addEventListener('input', (e) => {
        const total = keranjangItems.reduce((sum, item) => sum + (item.harga * item.jumlah), 0);
        const uangDiterima = parseFloat(e.target.value);
        const kembalian = uangDiterima - total;
        document.getElementById('kembalian').value = `Rp ${kembalian.toLocaleString()}`;
    });

    // Inisialisasi
    muatProduk();
    updateKeranjang(); // Pastikan keranjang ditampilkan saat pertama load
});