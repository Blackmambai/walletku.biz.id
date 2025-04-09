document.addEventListener('DOMContentLoaded', () => {
    const btnBackup = document.getElementById('btnBackup');
    const fileImport = document.getElementById('fileImport');
    const btnImport = document.getElementById('btnImport');
    const aktifitasTerakhir = document.getElementById('aktifitasTerakhir');
    let grafikPenjualan = null;

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
                updateDashboard();
            } catch (error) {
                alert('Silahkan Refresh!');
            }
        };
        reader.readAsText(file);
    });

    // Fungsi Update Dashboard
    function updateDashboard() {
        const nota = JSON.parse(localStorage.getItem('nota') || '[]');
        const produk = JSON.parse(localStorage.getItem('produk') || '[]');

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
                        <div class="fw-bold">${n.namaPelanggan || 'Pelanggan Umum'}</div>
                        ${n.tanggal}
                    </div>
                    <span class="badge bg-primary rounded-pill">
                        Rp ${n.totalHarga.toLocaleString()}
                    </span>
                </li>
            `).join('');
        aktifitasTerakhir.innerHTML = aktivitasTerakhirList;

        // Produk Terlaris
        const penjualanProduk = nota.flatMap(n => n.produk).reduce((acc, p) => {
            acc[p.nama] = (acc[p.nama] || 0) + p.jumlah;
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

        document.getElementById('produkTerlaris').innerHTML = produkTerlarisList;

        // Update Grafik
        if (grafikPenjualan) grafikPenjualan.destroy();
        buatGrafikPenjualan(nota);
    }

    // Fungsi Grafik Penjualan (Dimodifikasi)
    function buatGrafikPenjualan(nota) {
        const ctx = document.getElementById('grafikPenjualan').getContext('2d');

        const penjualanPerHari = nota.reduce((acc, n) => {
            const tanggal = n.tanggal.split(' ')[0];
            acc[tanggal] = (acc[tanggal] || 0) + n.totalHarga;
            return acc;
        }, {});

        const hari = Object.keys(penjualanPerHari)
            .sort((a, b) => new Date(b) - new Date(a))
            .slice(0, 7)
            .reverse();

        const nilaiPenjualan = hari.map(h => penjualanPerHari[h] || 0);

        // Konfigurasi Grafik Baru
        const options = {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => 'Rp ' + value.toLocaleString(),
                        color: '#6c757d'
                    },
                    grid: { display: false },
                    border: { display: false }
                },
                x: {
                    display: false // Sembunyikan seluruh sumbu X
                }
            },
            plugins: {
                legend: { display: false }
            }
        };

        grafikPenjualan = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: hari,
                datasets: [{
                    label: 'Penjualan',
                    data: nilaiPenjualan,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderWidth: 0,
                    borderRadius: 4,
                    barThickness: 20
                }]
            },
            options: options
        });
    }

    // Jalankan pertama kali
    updateDashboard();
});