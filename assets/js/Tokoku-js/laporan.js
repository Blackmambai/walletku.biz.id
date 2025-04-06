
document.addEventListener('DOMContentLoaded', () => {
    const totalPenjualan = document.getElementById('totalPenjualan');
    const totalLaba = document.getElementById('totalLaba');
    const produkTerjual = document.getElementById('produkTerjual');
    const detailPenjualan = document.getElementById('detailPenjualan');
    const produkTerlaris = document.getElementById('produkTerlaris');
    const btnHarian = document.getElementById('btnHarian');
    const btnBulanan = document.getElementById('btnBulanan');
    const btnExportLaporan = document.getElementById('btnExportLaporan');
    const btnTerapkanFilter = document.getElementById('btnTerapkanFilter');
    const filterProduk = document.getElementById('filterProduk');
    const tanggalMulai = document.getElementById('tanggalMulai');
    const tanggalSelesai = document.getElementById('tanggalSelesai');

    let nota = [];
    let produk = [];
    let grafikPenjualan = null;

    // Fungsi Buat Struk untuk Cetak Nota
    function buatStruk(nota) {
        const pengaturanToko = JSON.parse(localStorage.getItem('pengaturanToko') || '{}');
        
        return `
            <div id="strukCetak" style="
    max-width: 600px;
    width: 100%px
    margin: 0 auto;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    padding: 12px;
    border: 2px solid #4a90e2;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(74, 144, 226, 0.2);
    background: linear-gradient(135deg, #f8f9fa 0%, #e9f5ff 100%);
    position: relative;
    overflow: hidden;
">
    <!-- Watermark -->
    <div style="
        position: absolute;
        opacity: 0.1;
        font-size: 80px;
        font-weight: bold;
        color: #4a90e2;
        transform: rotate(-30deg);
        top: 30%;
        left: 10%;
        z-index: 0;
        pointer-events: none;
    ">
        ${pengaturanToko.namaToko || 'TOKO SAYA'}
    </div>

    <!-- Konten Struk -->
    <div style="position: relative; z-index: 1;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 10px;">
            ${pengaturanToko.logoToko ? 
                `<img src="${pengaturanToko.logoToko}" 
                   style="max-height: 70px; margin-bottom: 5px;">` 
                : ''
            }
            <h3 style="margin: 0; color: #2c3e50; font-size: 1.2rem; font-weight: bold;">
                ${pengaturanToko.namaToko || 'TOKO SAYA'}
            </h3>
            <p style="margin: 3px 0; font-size: 0.7rem; color: #6c757d;">
                <i class="fas fa-map-marker-alt"></i> ${pengaturanToko.alamatToko || 'Alamat Tidak Tersedia'}
            </p>
            <p style="margin: 3px 0; font-size: 0.7rem; color: #6c757d;">
                <i class="fab fa-whatsapp"></i> ${pengaturanToko.nomorWAToko || '-'}
            </p>
            <hr style="border-top: 1px dashed #4a90e2; margin: 8px 0; opacity: 0.7;">
        </div>

        <!-- Info Pelanggan -->
        <div style="margin-bottom: 10px; font-size: 0.8rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span style="color: #6c757d;">Nama:</span>
                <span style="font-weight: 500;">${nota.namaPelanggan || 'Pelanggan Umum'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span style="color: #6c757d;">Tanggal:</span>
                <span style="font-weight: 500;">${nota.tanggal}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span style="color: #6c757d;">Metode:</span>
                <span style="background-color: #4a90e2; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem;">
                    ${nota.metodePembayaran}
                </span>
            </div>
            <hr style="border-top: 1px dashed #4a90e2; margin: 8px 0; opacity: 0.7;">
        </div>

        <!-- Daftar Produk -->
        <table style="width: 100%; font-size: 0.8rem; margin-bottom: 10px;">
            <thead>
                <tr style="border-bottom: 1px solid #e9f5ff;">
                    <th style="text-align: left; padding-bottom: 5px;">Produk</th>
                    <th style="text-align: right; padding-bottom: 5px;">Jumlah</th>
                    <th style="text-align: right; padding-bottom: 5px;">Total</th>
                </tr>
            </thead>
            <tbody>
                ${nota.produk.map(item => `
                    <tr>
                        <td>${item.nama}</td>
                        <td style="text-align: right;">${item.jumlah} × ${item.harga.toLocaleString()}</td>
                        <td style="text-align: right; font-weight: 500;">${(item.harga * item.jumlah).toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <hr style="border-top: 1px dashed #4a90e2; margin: 8px 0; opacity: 0.7;">

        <!-- Ringkasan Pembayaran -->
        <div style="font-size: 0.8rem; margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span style="color: #6c757d;">Total:</span>
                <span style="font-weight: bold; color: #2c3e50;">Rp ${nota.totalHarga.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span style="color: #6c757d;">Bayar:</span>
                <span style="font-weight: bold; color: #28a745;">Rp ${nota.uangDiterima.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span style="color: #6c757d;">Kembali:</span>
                <span style="font-weight: bold; color: #dc3545;">Rp ${nota.kembalian.toLocaleString()}</span>
            </div>
        </div>

        <hr style="border-top: 1px dashed #4a90e2; margin: 8px 0; opacity: 0.7;">

        <!-- Footer -->
        <div style="text-align: center;">
            <p style="font-size: 0.7rem; color: #6c757d; margin-bottom: 5px;">
                ${pengaturanToko.catatanKakiStruk || 'Terima Kasih'}
            </p>
            
            <div class="premium2">
            <p class="small mb-0 premium2" style="color: #4a90e2; font-weight: 500; font-size: 0.7rem;">
                    <i class="fas fa-lock"></i> by: walletku.biz.id
                </p>
            </div>
            <div class="premium2">
                <p style="font-size: 0.7rem; color: #4a90e2; font-weight: 500; margin: 0;"  class="premium2">
                <i class="fas fa-lock" ></i> WalletKu.biz.id | Upgrade Premium
                </p>
            </div>

        </div>
    </div>
</div>
        `;
    }

    // Fungsi Cetak Nota Universal
    function cetakNota(nota) {
        const jendelaCetak = window.open('', '_blank', 'width=600,height=600');
        
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
                                max-width: 600px !important; 
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

    // Fungsi Muat Data
    function muatData() {
        nota = JSON.parse(localStorage.getItem('nota') || '[]');
        produk = JSON.parse(localStorage.getItem('produk') || '[]');

        // Isi filter produk
        filterProduk.innerHTML = produk.map(p => `
            <option value="${p.namaProduk}">${p.namaProduk}</option>
        `).join('');

        // Hitung statistik
        hitungStatistik(nota);

        // Buat grafik default (harian)
        buatGrafikPenjualan('harian');

        // Tampilkan detail penjualan
        tampilkanDetailPenjualan(nota);

        // Tampilkan produk terlaris
        tampilkanProdukTerlaris();
    }

    // Fungsi Hitung Statistik
    function hitungStatistik(dataNota) {
        const totalPenjualanValue = dataNota.reduce((total, n) => total + n.totalHarga, 0);
        const totalLabaValue = dataNota.reduce((total, n) => {
            const labaTransaksi = n.produk.reduce((subTotal, p) => {
                const produkDetail = produk.find(pr => pr.namaProduk === p.nama);
                return subTotal + ((p.harga - produkDetail.hargaModal) * p.jumlah);
            }, 0);
            return total + labaTransaksi;
        }, 0);
        const produkTerjualValue = dataNota.reduce((total, n) => 
            total + n.produk.reduce((subTotal, p) => subTotal + p.jumlah, 0)
        , 0);

        totalPenjualan.textContent = `Rp ${totalPenjualanValue.toLocaleString()}`;
        totalLaba.textContent = `Rp ${totalLabaValue.toLocaleString()}`;
        produkTerjual.textContent = produkTerjualValue;
    }

    // Fungsi Buat Grafik Penjualan
    function buatGrafikPenjualan(tipe) {
        const ctx = document.getElementById('grafikPenjualan').getContext('2d');
        
        // Hapus grafik sebelumnya
        if (grafikPenjualan) {
            grafikPenjualan.destroy();
        }

        let dataGrafik;
        if (tipe === 'harian') {
            // Grafik penjualan harian
            const penjualanHarian = nota.reduce((acc, n) => {
                acc[n.tanggal] = (acc[n.tanggal] || 0) + n.totalHarga;
                return acc;
            }, {});

            dataGrafik = {
                labels: Object.keys(penjualanHarian),
                datasets: [{
                    label: 'Penjualan Harian',
                    data: Object.values(penjualanHarian),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    tension: 0.4
                }]
            };
        } else {
            // Grafik penjualan bulanan
            const penjualanBulanan = nota.reduce((acc, n) => {
                const bulan = n.tanggal.slice(0, 7); // YYYY-MM
                acc[bulan] = (acc[bulan] || 0) + n.totalHarga;
                return acc;
            }, {});

            dataGrafik = {
                labels: Object.keys(penjualanBulanan),
                datasets: [{
                    label: 'Penjualan Bulanan',
                    data: Object.values(penjualanBulanan),
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    tension: 0.4
                }]
            };
        }

        grafikPenjualan = new Chart(ctx, {
            type: 'line',
            data: dataGrafik,
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'Rp ' + value.toLocaleString();
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Rp ' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    // Fungsi Tampilkan Detail Penjualan
    function tampilkanDetailPenjualan(dataNota) {
        const detailPenjualanData = dataNota.flatMap(nota => 
            nota.produk.map(produk => ({
                tanggal: nota.tanggal,
                namaProduk: produk.nama,
                jumlah: produk.jumlah,
                hargaSatuan: produk.harga,
                total: produk.harga * produk.jumlah,
                laba: hitungLaba(produk),
                aksi: nota
            }))
        );

        detailPenjualan.innerHTML = detailPenjualanData.map((detail, index) => `
            <tr>
                <td>${detail.tanggal}</td>
                <td>${detail.namaProduk}</td>
                <td>${detail.jumlah}</td>
                <td>Rp ${detail.hargaSatuan.toLocaleString()}</td>
                <td>Rp ${detail.total.toLocaleString()}</td>
                <td>Rp ${detail.laba.toLocaleString()}</td>
                <td>
                    <button class="btn btn-sm btn-info cetak-nota" data-index="${index}">
                        <i class="fas fa-print"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Tambahkan event listener untuk cetak nota
        document.querySelectorAll('.cetak-nota').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.currentTarget.dataset.index;
                const notaCetak = detailPenjualanData[index].aksi;
                cetakNota(notaCetak);
            });
        });
    }

    // Fungsi Hitung Laba
    function hitungLaba(produkNota) {
        const produkDetail = produk.find(p => p.namaProduk === produkNota.nama);
        return (produkNota.harga - produkDetail.hargaModal) * produkNota.jumlah;
    }

    // Fungsi Tampilkan Produk Terlaris
    function tampilkanProdukTerlaris() {
        const penjualanProduk = nota.flatMap(n => n.produk).reduce((acc, produk) => {
            acc[produk.nama] = (acc[produk.nama] || 0) + produk.jumlah;
            return acc;
        }, {});

        const produkTerlarisList = Object.entries(penjualanProduk)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([nama, jumlah]) => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${nama}
                    <span class="badge bg-primary rounded-pill">${jumlah}</span>
                </li>
            `).join('');

        produkTerlaris.innerHTML = produkTerlarisList;
    }

    // Event Listener Grafik
    btnHarian.addEventListener('click', () => {
        buatGrafikPenjualan('harian');
        btnHarian.classList.add('active');
        btnBulanan.classList.remove('active');
    });

    btnBulanan.addEventListener('click', () => {
        buatGrafikPenjualan('bulanan');
        btnBulanan.classList.add('active');
        btnHarian.classList.remove('active');
    });

    // Export Laporan
    btnExportLaporan.addEventListener('click', () => {
        const detailPenjualanData = nota.flatMap(nota => 
            nota.produk.map(produk => ({
                tanggal: nota.tanggal,
                namaPelanggan: nota.namaPelanggan,
                namaProduk: produk.nama,
                jumlah: produk.jumlah,
                hargaSatuan: produk.harga,
                total: produk.harga * produk.jumlah,
                laba: hitungLaba(produk)
            }))
        );

        const csvContent = [
            ['Tanggal', 'Nama Pelanggan', 'Nama Produk', 'Jumlah', 'Harga Satuan', 'Total', 'Laba'],
            ...detailPenjualanData.map(detail => [
                detail.tanggal,
                detail.namaPelanggan,
                detail.namaProduk,
                detail.jumlah,
                detail.hargaSatuan,
                detail.total,
                detail.laba
            ])
        ].map(e => e.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `laporan_penjualan_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Filter Laporan
    btnTerapkanFilter.addEventListener('click', () => {
        const produkDipilih = Array.from(filterProduk.selectedOptions).map(option => option.value);
        const filterTanggal = {
            mulai: tanggalMulai.value,
            selesai: tanggalSelesai.value
        };

        // Filter nota berdasarkan tanggal dan produk
        const notaFiltered = nota.filter(n => {
            const tanggalSesuai = (!filterTanggal.mulai || n.tanggal >= filterTanggal.mulai) &&
                                  (!filterTanggal.selesai || n.tanggal <= filterTanggal.selesai);
            
            const produkSesuai = produkDipilih.length === 0 || 
                n.produk.some(p => produkDipilih.includes(p.nama));

            return tanggalSesuai && produkSesuai;
        });

        // Perbarui tampilan dengan data filter
        hitungStatistik(notaFiltered);
        tampilkanDetailPenjualan(notaFiltered);
        buatGrafikPenjualan('harian');
        tampilkanProdukTerlaris();

        // Tutup modal filter
        bootstrap.Modal.getInstance(document.getElementById('modalFilter')).hide();
    });

    // Muat data saat halaman pertama kali dimuat
    muatData();

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
