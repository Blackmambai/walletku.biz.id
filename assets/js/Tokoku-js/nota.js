
document.addEventListener('DOMContentLoaded', () => {
    const daftarNota = document.getElementById('daftarNota');
    const btnExportNota = document.getElementById('btnExportNota');
    const btnTerapkanFilter = document.getElementById('btnTerapkanFilter');
    const modalDetailNota = new bootstrap.Modal(document.getElementById('modalDetailNota'));
    const detailNotaContent = document.getElementById('detailNotaContent');
    const btnCetakNota = document.getElementById('btnCetakNota');

    let notaList = [];
    let notaDetail = null;

    // Fungsi Muat Nota
    function muatNota(filter = {}) {
        notaList = JSON.parse(localStorage.getItem('nota') || '[]');

        // Filter berdasarkan rentang tanggal
        if (filter.tanggalMulai && filter.tanggalSelesai) {
            notaList = notaList.filter(nota => 
                nota.tanggal >= filter.tanggalMulai && 
                nota.tanggal <= filter.tanggalSelesai
            );
        }

        // Filter berdasarkan metode pembayaran
        if (filter.metodePembayaran) {
            notaList = notaList.filter(nota => 
                nota.metodePembayaran === filter.metodePembayaran
            );
        }

        // Urutkan nota dari yang terbaru
        notaList.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

        // Tampilkan nota
        daftarNota.innerHTML = notaList.map((nota, index) => `
            <tr>
                <td>${nota.tanggal}</td>
                <td>${nota.namaPelanggan}</td>
                <td>Rp ${nota.totalHarga.toLocaleString()}</td>
                <td>${nota.metodePembayaran}</td>
                <td>
                    <button class="btn btn-sm btn-info detail-nota premium" style="border-radius: 16px;font-family: Nunito, sans-serif;box-shadow: 0px 6px 14px rgba(67,97,238,0.56);width: auto;" data-index="${index}">
                        <i class="fas fa-eye"></i> Detail
                    </button>
                    <button class="btn btn-sm btn-danger hapus-nota" style="border-radius: 16px;font-family: Nunito, sans-serif;box-shadow: 0px 6px 14px rgba(67,97,238,0.56);width: auto;" data-index="${index}">
                        <i class="fas fa-trash"></i> Hapus
                    </button>
                </td>
            </tr>
        `).join('');

        // Tambahkan event listener untuk tombol detail dan hapus
        document.querySelectorAll('.detail-nota').forEach(btn => {
            btn.addEventListener('click', tampilkanDetailNota);
        });

        document.querySelectorAll('.hapus-nota').forEach(btn => {
            btn.addEventListener('click', hapusNota);
        });
    }

    // Fungsi Tampilkan Detail Nota
    function tampilkanDetailNota(e) {
        const index = e.currentTarget.dataset.index;
        notaDetail = notaList[index];

        detailNotaContent.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h5>Informasi Nota</h5>
                    <p><strong>Tanggal:</strong> ${notaDetail.tanggal}</p>
                    <p><strong>Nama Pelanggan:</strong> ${notaDetail.namaPelanggan}</p>
                    <p><strong>Metode Pembayaran:</strong> ${notaDetail.metodePembayaran}</p>
                </div>
                <div class="col-md-6 text-end">
                    <h5>Ringkasan Transaksi</h5>
                    <p><strong>Total Penjualan:</strong> Rp ${notaDetail.totalHarga.toLocaleString()}</p>
                    <p><strong>Uang Diterima:</strong> Rp ${notaDetail.uangDiterima.toLocaleString()}</p>
                    <p><strong>Kembalian:</strong> Rp ${notaDetail.kembalian.toLocaleString()}</p>
                </div>
            </div>
            <hr>
            <h5>Daftar Produk</h5>
            <table class="table">
                <thead>
                    <tr>
                        <th>Produk</th>
                        <th>Harga</th>
                        <th>Jumlah</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${notaDetail.produk.map(produk => `
                        <tr>
                            <td>${produk.nama}</td>
                            <td>Rp ${produk.harga.toLocaleString()}</td>
                            <td>${produk.jumlah}</td>
                            <td>Rp ${(produk.harga * produk.jumlah).toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        modalDetailNota.show();
    }

    // Fungsi Hapus Nota
    function hapusNota(e) {
        const index = e.currentTarget.dataset.index;
        
        if (confirm('Apakah Anda yakin ingin menghapus nota ini?')) {
            notaList.splice(index, 1);
            localStorage.setItem('nota', JSON.stringify(notaList));
            muatNota();
        }
    }

    // Export Nota ke Excel
    btnExportNota.addEventListener('click', () => {
        // Konversi nota ke format CSV
        const csvContent = [
            ['Tanggal', 'Nama Pelanggan', 'Total Penjualan', 'Metode Pembayaran'],
            ...notaList.map(nota => [
                nota.tanggal,
                nota.namaPelanggan,
                nota.totalHarga,
                nota.metodePembayaran
            ])
        ].map(e => e.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `nota_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Terapkan Filter
    btnTerapkanFilter.addEventListener('click', () => {
        const tanggalMulai = document.getElementById('tanggalMulai').value;
        const tanggalSelesai = document.getElementById('tanggalSelesai').value;
        const metodePembayaran = document.getElementById('metodePembayaran').value;

        muatNota({
            tanggalMulai,
            tanggalSelesai,
            metodePembayaran
        });

        bootstrap.Modal.getInstance(document.getElementById('modalFilterNota')).hide();
    });

    // Cetak Nota
    btnCetakNota.addEventListener('click', () => {
        if (notaDetail) {
            const printContent = document.createElement('div');
            printContent.innerHTML = detailNotaContent.innerHTML;
            
            const originalContents = document.body.innerHTML;
            document.body.innerHTML = printContent.innerHTML;
            window.print();
            document.body.innerHTML = originalContents;
        }
    });

    // Muat nota saat halaman pertama kali dimuat
    muatNota();

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
