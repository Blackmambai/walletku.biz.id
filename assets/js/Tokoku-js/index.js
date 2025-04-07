document.addEventListener('DOMContentLoaded', () => {
    const btnBackup = document.getElementById('btnBackup');
    const fileImport = document.getElementById('fileImport');
    const btnImport = document.getElementById('btnImport');
    const aktifitasTerakhir = document.getElementById('aktifitasTerakhir');

    // Fungsi Backup Data
    btnBackup.addEventListener('click', () => {
        const dataToBackup = {
            nota: JSON.parse(localStorage.getItem('nota') || '[]'),
            produk: JSON.parse(localStorage.getItem('produk') || '[]'),
            toko: JSON.parse(localStorage.getItem('toko') || '{}')
        };

        const blob = new Blob([JSON.stringify(dataToBackup)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_toko_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    });

    // Fungsi Import Data
    btnImport.addEventListener('click', () => {
        const file = fileImport.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    localStorage.setItem('nota', JSON.stringify(importedData.nota));
                    localStorage.setItem('produk', JSON.stringify(importedData.produk));
                    localStorage.setItem('toko', JSON.stringify(importedData.toko));
                    alert('Data berhasil diimpor');
                    location.reload();
                } catch (error) {
                    alert('Format file tidak valid');
                }
            };
            reader.readAsText(file);
        }
    });

    // Fungsi Update Dashboard
    function updateDashboard() {
        const nota = JSON.parse(localStorage.getItem('nota') || '[]');
        const produk = JSON.parse(localStorage.getItem('produk') || '[]');
        const today = new Date().toISOString().split('T')[0];

        // Total Nota Hari Ini
        const totalNotaHariIni = nota.filter(n => n.tanggal === today).length;
        document.getElementById('totalNotaHariIni').textContent = totalNotaHariIni;

        // Total Penjualan
        const totalPenjualan = nota.reduce((total, n) => total + n.totalHarga, 0);
        document.getElementById('totalPenjualan').textContent = `Rp ${totalPenjualan.toLocaleString()}`;

        // Total Stok Produk
        const totalStokProduk = produk.reduce((total, p) => total + p.stokProduk, 0);
        document.getElementById('totalStokProduk').textContent = totalStokProduk;

        // Aktivitas Terakhir
        const aktivitasTerakhirList = nota
            .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
            .slice(0, 5)
            .map(n => `
                <li class="list-group-item d-flex justify-content-between align-items-start">
                    <div class="ms-2 me-auto">
                        <div class="fw-bold">${n.namaPelanggan}</div>
                        Transaksi pada ${n.tanggal}
                    </div>
                    <span class="badge bg-primary rounded-pill">
                        Rp ${n.totalHarga.toLocaleString()}
                    </span>
                </li>
            `).join('');
        aktifitasTerakhir.innerHTML = aktivitasTerakhirList;

        // Grafik Penjualan
        buatGrafikPenjualan(nota);
    }

    // Fungsi Buat Grafik Penjualan
    function buatGrafikPenjualan(nota) {
        const ctx = document.getElementById('grafikPenjualan').getContext('2d');
        
        // Kelompokkan penjualan per hari
        const penjualanPerHari = nota.reduce((acc, n) => {
            acc[n.tanggal] = (acc[n.tanggal] || 0) + n.totalHarga;
            return acc;
        }, {});

        // Ambil 7 hari terakhir
        const hari = Object.keys(penjualanPerHari)
            .sort((a, b) => new Date(b) - new Date(a))
            .slice(0, 7)
            .reverse();

        const nilaiPenjualan = hari.map(h => penjualanPerHari[h] || 0);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: hari,
                datasets: [{
                    label: 'Penjualan',
                    data: nilaiPenjualan,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    updateDashboard();

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

    // Perbaikan 3: Import data dengan pemanggilan fungsi yang benar
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
                muatProduk(); // Diubah dari muatNota() ke muatProduk()
            } catch (error) {
                alert('Silahkan Refresh!');
            }
        };
        reader.readAsText(file);
    });
});