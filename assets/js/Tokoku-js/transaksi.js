
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

    let keranjangItems = [];
    let produkList = [];

    // Fungsi Buat Struk dengan Fitur Cetak yang Diperbaiki
    function buatStruk(nota) {
        const pengaturanToko = JSON.parse(localStorage.getItem('pengaturanToko') || '{}');
        
        return `
            <div id="strukCetak" style="
                max-width: 300px; 
                margin: 0 auto; 
                font-family: 'Courier New', monospace; 
                padding: 10px; 
                border: 1px dashed #000;
            ">
                <div style="text-align: center;">
                    ${pengaturanToko.logoToko ? 
                        `<img src="${pengaturanToko.logoToko}" 
                               style="max-width: 100px; max-height: 100px; margin-bottom: 10px;">` 
                        : ''
                    }
                    <h3 style="margin: 0;">${pengaturanToko.namaToko || 'TOKO SAYA'}</h3>
                    <p style="margin: 5px 0; font-size: 0.8em;">
                        ${pengaturanToko.alamatToko || 'Alamat Tidak Tersedia'}
                    </p>
                    <p style="margin: 5px 0; font-size: 0.8em;">
                        WA: ${pengaturanToko.nomorWAToko || '-'}
                    </p>
                    <hr style="border-top: 1px dashed #000;">
                </div>
                
                <div>
                    <p style="margin: 5px 0;">Nama: ${nota.namaPelanggan || 'Pelanggan Umum'}</p>
                    <p style="margin: 5px 0;">Tanggal: ${nota.tanggal}</p>
                    <p style="margin: 5px 0;">Metode: ${nota.metodePembayaran}</p>
                    <hr style="border-top: 1px dashed #000;">
                    
                    <table style="width: 100%; font-size: 0.9em;">
                        <thead>
                            <tr>
                                <th style="text-align: left;">Produk</th>
                                <th style="text-align: right;">Jumlah</th>
                                <th style="text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${nota.produk.map(item => `
                                <tr>
                                    <td>${item.nama}</td>
                                    <td style="text-align: right;">${item.jumlah} x ${item.harga.toLocaleString()}</td>
                                    <td style="text-align: right;">${(item.harga * item.jumlah).toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <hr style="border-top: 1px dashed #000;">
                    
                    <div style="display: flex; justify-content: space-between; font-size: 0.9em;">
                        <strong>Total:</strong>
                        <span>Rp ${nota.totalHarga.toLocaleString()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.9em;">
                        <strong>Bayar:</strong>
                        <span>Rp ${nota.uangDiterima.toLocaleString()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.9em;">
                        <strong>Kembali:</strong>
                        <span>Rp ${nota.kembalian.toLocaleString()}</span>
                    </div>
                    
                    <hr style="border-top: 1px dashed #000;">
                    
                    <p style="text-align: center; font-size: 0.8em;">
                        ${pengaturanToko.catatanKakiStruk || 'Terima Kasih'}
                    </p>
                </div>
            </div>
        `;
    }

    // Fungsi Cetak Nota Universal
    function cetakNota(nota) {
        // Buat jendela cetak baru
        const jendelaCetak = window.open('', '_blank', 'width=400,height=600');
        
        // Pastikan nota valid
        if (!nota) {
            alert('Nota tidak valid');
            return;
        }

        // Tulis konten struk ke jendela cetak
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
        const produkTersedia = produkList.filter(p => 
            p.stokProduk > 0 && 
            p.namaProduk.toLowerCase().includes(filter.toLowerCase())
        );

        daftarProduk.innerHTML = produkTersedia.map(produk => `
            <div class="col-md-4" style="padding: 5px;margin-bottom: 16px;">
    <div class="card summary-card paddingAll produk01" style="padding: 10px;">
        <div class="card-body" style="padding: 0px;">
            <img src="${produk.fotoProduk || 'https://walletku.biz.id/assets/img/notfound.png'}" 
             class="card-img-top" 
             alt="${produk.namaProduk}"
             style="border-radius: 16px 16px 0 0; object-fit: cover;height: 200px;margin-bottom: 16px;>
            <h5 class="card-title" style="font-family: Nunito, sans-serif;font-size: 20px;color: rgb(43,43,44);font-weight: bold;">${produk.namaProduk}</h5>
            <p class="card-text" style="font-family: Nunito, sans-serif;font-size: 16px;color: rgb(43,43,44);font-weight: bold;"> Harga: Rp ${produk.hargaJual.toLocaleString()}<br /> Stok: ${produk.stokProduk} </p><button class="btn btn-primary text-nowrap text-start d-flex d-xxl-flex justify-content-center align-items-center tambah-produk btnproduk1" data-nama="${produk.namaProduk}" data-harga="${produk.hargaJual}" data-stok="${produk.stokProduk}"><i class="fas fa-plus-circle" style="margin-right: 10px;"></i> Tambah </button>
        </div>
    </div>
</div>
        `).join('');

        // Tambahkan event listener untuk tombol tambah
        document.querySelectorAll('.tambah-produk').forEach(btn => {
            btn.addEventListener('click', tambahKeKeranjang);
        });
    }

    // Tambah ke Keranjang
    function tambahKeKeranjang(e) {
        const nama = e.currentTarget.dataset.nama;
        const harga = parseFloat(e.currentTarget.dataset.harga);
        const stok = parseInt(e.currentTarget.dataset.stok);

        const itemExist = keranjangItems.find(item => item.nama === nama);

        if (itemExist) {
            if (itemExist.jumlah < stok) {
                itemExist.jumlah++;
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
        }

        updateKeranjang();
    }

    // Update Keranjang
    function updateKeranjang() {
        keranjang.innerHTML = keranjangItems.map((item, index) => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <strong>${item.nama}</strong>
                    <small class="d-block">Rp ${item.harga.toLocaleString()} x ${item.jumlah}</small>
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-danger me-2 kurang-item" data-index="${index}">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger hapus-item" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </li>
        `).join('');

        // Hitung total harga
        const total = keranjangItems.reduce((sum, item) => sum + (item.harga * item.jumlah), 0);
        totalHarga.textContent = `Rp ${total.toLocaleString()}`;

        // Event listener kurang dan hapus item
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
        if (keranjangItems[index].jumlah > 1) {
            keranjangItems[index].jumlah--;
        } else {
            keranjangItems.splice(index, 1);
        }
        updateKeranjang();
    }

    // Hapus Item
    function hapusItem(e) {
        const index = e.currentTarget.dataset.index;
        keranjangItems.splice(index, 1);
        updateKeranjang();
    }

    // Tambah Produk Cepat
    formTambahProdukCepat.addEventListener('submit', (e) => {
        e.preventDefault();
        const produk = {
            namaProduk: document.getElementById('namaProdukBaru').value,
            hargaJual: parseFloat(document.getElementById('hargaProdukBaru').value),
            stokProduk: parseInt(document.getElementById('stokProdukBaru').value)
        };

        const produkList = JSON.parse(localStorage.getItem('produk') || '[]');
        produkList.push(produk);
        localStorage.setItem('produk', JSON.stringify(produkList));

        // Reset form dan tutup modal
        formTambahProdukCepat.reset();
        bootstrap.Modal.getInstance(document.getElementById('modalTambahProduk')).hide();
        
        // Muat ulang produk
        muatProduk();
    });

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

        // Kurangi stok produk
        const produkList = JSON.parse(localStorage.getItem('produk') || '[]');
        keranjangItems.forEach(item => {
            const produkIndex = produkList.findIndex(p => p.namaProduk === item.nama);
            if (produkIndex !== -1) {
                produkList[produkIndex].stokProduk -= item.jumlah;
            }
        });
        localStorage.setItem('produk', JSON.stringify(produkList));

        // Simpan nota
        const nota = JSON.parse(localStorage.getItem('nota') || '[]');
        const notaBaru = {
            tanggal: new Date().toISOString().split('T')[0],
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

        // Tambahkan event listener untuk cetak
        btnCetakNota.onclick = () => {
            cetakNota(notaBaru);
        };

        // Reset keranjang dan form
        keranjangItems = [];
        updateKeranjang();
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

    // Muat produk saat halaman pertama kali dimuat
    muatProduk();

    // Pencarian Produk
    cariProduk.addEventListener('input', (e) => {
        muatProduk(e.target.value);
    });

    // Backup Data
    document.getElementById('btnBackup').addEventListener('click', () => {
        const data = {
            produk: JSON.parse(localStorage.getItem('produk') || '[]'),
            nota: JSON.parse(localStorage.getItem('nota') || '[]'),
            pengaturanToko: JSON.parse(localStorage.getItem('pengaturanToko') || '{}')
        };
        
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Import Data
    document.getElementById('btnImport').addEventListener('click', () => {
        document.getElementById('fileImport').click();
    });

    document.getElementById('fileImport').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                localStorage.setItem('produk', JSON.stringify(data.produk));
                localStorage.setItem('nota', JSON.stringify(data.nota));
                localStorage.setItem('pengaturanToko', JSON.stringify(data.pengaturanToko));
                alert('Data berhasil diimpor!');
                muatNota();
            } catch (error) {
                alert('file anda telah di backup dengan aman! silahkan refresh halaman');
            }
        };
        reader.readAsText(file);
    });
});
