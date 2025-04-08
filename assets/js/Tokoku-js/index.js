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

        const blob = new Blob([JSON.stringify(dataToBackup)], { type: 'application/json' });  
        const url = URL.createObjectURL(blob);  
        const a = document.createElement('a');  
        a.href = url;  
        a.download = `backup_toko_${new Date().toISOString().split('T')[0]}.json`;  
        a.click();  
        URL.revokeObjectURL(url);  
    });  

    // Fungsi Import Data  
    btnImport.addEventListener('click', () => {  
        fileImport.click();  
    });  

    // Event listener untuk file input  
    fileImport.addEventListener('change', function (e) {  
        const file = e.target.files[0];  
        if (!file) return;  

        const reader = new FileReader();  
        reader.onload = (event) => {  
            try {  
                const importedData = JSON.parse(event.target.result);  
                localStorage.setItem('nota', JSON.stringify(importedData.nota));  
                localStorage.setItem('produk', JSON.stringify(importedData.produk));  
                localStorage.setItem('toko', JSON.stringify(importedData.toko));  
                alert('Data berhasil diimpor');  
                updateDashboard();  
                location.reload();  
            } catch (error) {  
                alert('Format file tidak valid');  
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
                        <div class="fw-bold">${n.namaPelanggan}</div>  
                        Transaksi pada ${n.tanggal}  
                    </div>  
                    <span class="badge bg-primary rounded-pill">  
                        Rp ${n.totalHarga.toLocaleString()}  
                    </span>  
                </li>  
            `).join('');  
        aktifitasTerakhir.innerHTML = aktivitasTerakhirList;  

        // Produk Terlaris (Pengganti Total Nota Hari Ini)
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

        // Grafik Penjualan  
        buatGrafikPenjualan(nota);  
    }  

    // Fungsi Buat Grafik Penjualan  
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
});