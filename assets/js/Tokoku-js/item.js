
document.addEventListener('DOMContentLoaded', () => {
    const daftarProduk = document.getElementById('daftarProduk');
    const formProduk = document.getElementById('formProduk');
    const btnExportProduk = document.getElementById('btnExportProduk');
    const fotoProduk = document.getElementById('fotoProduk');
    const pratinjauFoto = document.getElementById('pratinjauFoto');
    const modalTambahProduk = new bootstrap.Modal(document.getElementById('modalTambahProduk'));

    let produkList = [];
    let editIndex = -1;

    // Pratinjau Foto
    fotoProduk.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                pratinjauFoto.src = event.target.result;
                pratinjauFoto.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    // Fungsi Muat Produk
    function muatProduk() {
        produkList = JSON.parse(localStorage.getItem('produk') || '[]');

        daftarProduk.innerHTML = produkList.map((produk, index) => `
            <div class="col-md-4 col-lg-3 col-sm-6 col-12 mb-4">
    <div class="card card-produk border-0 shadow" style="border-radius: 16px;">
        <img src="${produk.fotoProduk || 'https://walletku.biz.id/assets/img/notfound.webp'}" 
             class="card-img-top" 
             alt="${produk.namaProduk}"
             style="border-radius: 16px 16px 0 0; object-fit: cover;height: 200px" loading="lazy">
        <div class="card-body">
            <h5 class="fw-bold text-bg-warning card-title" style="padding: 6px;padding-right: 12px;padding-left: 12px;border-radius: 16px;">${produk.namaProduk}</h5>
            <div class="card-text">
                <div class="d-flex flex-column gap-2">
                    <div>
                        <span class="fw-bold" style="margin-left: 12px" style="margin-left: 12px">Kategori:</span>
                        <span class="d-block" style="margin-left: 18px">${produk.kategoriProduk}</span>
                    </div>
                    <div>
                        <span class="fw-bold" style="margin-left: 12px">Harga Jual:</span>
                        <span class="d-block" style="margin-left: 18px">Rp ${produk.hargaJual.toLocaleString()}</span>
                    </div>
                    <div>
                        <span class="fw-bold" style="margin-left: 12px">Stok:</span>
                        <span class="d-block" style="margin-left: 18px">${produk.stokProduk}</span>
                    </div>
                </div>
            </div>
            <div class="d-flex justify-content-between mt-4 gap-2">
                <button class="btn btn-warning flex-grow-1 edit-produk" 
                        data-index="${index}"
                        style="border-radius: 16px;font-family: Nunito, sans-serif;box-shadow: 0px 6px 14px rgba(67,97,238,0.56);width: auto;border-width: 0px;padding-top: 8px;padding-right: 12px;padding-bottom: 8px;padding-left: 12px;">
                    <i class="bi bi-pencil"></i> Edit
                </button>
                <button class="btn btn-danger flex-grow-1 hapus-produk" 
                        data-index="${index}"
                        style="border-radius: 16px;font-family: Nunito, sans-serif;box-shadow: 0px 6px 14px rgba(67,97,238,0.56);width: auto;">
                    <i class="bi bi-trash"></i> Hapus
                </button>
            </div>
        </div>
    </div>
</div>
        `).join('');

        // Tambahkan event listener untuk tombol edit dan hapus
        document.querySelectorAll('.edit-produk').forEach(btn => {
            btn.addEventListener('click', editProduk);
        });

        document.querySelectorAll('.hapus-produk').forEach(btn => {
            btn.addEventListener('click', hapusProduk);
        });
    }

    // Fungsi Tambah/Edit Produk
    formProduk.addEventListener('submit', (e) => {
        e.preventDefault();

        const produkBaru = {
            namaProduk: document.getElementById('namaProduk').value,
            kategoriProduk: document.getElementById('kategoriProduk').value,
            hargaJual: parseFloat(document.getElementById('hargaJual').value),
            hargaModal: parseFloat(document.getElementById('hargaModal').value),
            stokProduk: parseInt(document.getElementById('stokProduk').value),
            barcodeProduk: document.getElementById('barcodeProduk').value,
            satuanProduk: document.getElementById('satuanProduk').value,
            catatanProduk: document.getElementById('catatanProduk').value
        };

        // Proses foto
        const file = fotoProduk.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                produkBaru.fotoProduk = reader.result;
                simpanProduk(produkBaru);
            };
            reader.readAsDataURL(file);
        } else {
            // Gunakan foto lama jika tidak ada foto baru
            if (editIndex !== -1) {
                produkBaru.fotoProduk = produkList[editIndex].fotoProduk;
            }
            simpanProduk(produkBaru);
        }
    });

    // Fungsi Simpan Produk
    function simpanProduk(produkBaru) {
        if (editIndex === -1) {
            // Tambah produk baru
            produkList.push(produkBaru);
        } else {
            // Update produk
            produkList[editIndex] = produkBaru;
            editIndex = -1;
        }

        localStorage.setItem('produk', JSON.stringify(produkList));
        muatProduk();
        
        // Reset form
        formProduk.reset();
        pratinjauFoto.src = '';
        pratinjauFoto.style.display = 'none';
        modalTambahProduk.hide();
    }

    // Fungsi Edit Produk
    function editProduk(e) {
        editIndex = parseInt(e.currentTarget.dataset.index);
        const produk = produkList[editIndex];

        // Isi form dengan data produk
        document.getElementById('namaProduk').value = produk.namaProduk;
        document.getElementById('kategoriProduk').value = produk.kategoriProduk;
        document.getElementById('hargaJual').value = produk.hargaJual;
        document.getElementById('hargaModal').value = produk.hargaModal;
        document.getElementById('stokProduk').value = produk.stokProduk;
        document.getElementById('barcodeProduk').value = produk.barcodeProduk || '';
        document.getElementById('satuanProduk').value = produk.satuanProduk || '';
        document.getElementById('catatanProduk').value = produk.catatanProduk || '';

        // Tampilkan foto jika ada
        if (produk.fotoProduk) {
            pratinjauFoto.src = produk.fotoProduk;
            pratinjauFoto.style.display = 'block';
        } else {
            pratinjauFoto.src = '';
            pratinjauFoto.style.display = 'none';
        }

        // Buka modal
        modalTambahProduk.show();
    }

    // Fungsi Hapus Produk
    function hapusProduk(e) {
        const index = parseInt(e.currentTarget.dataset.index);
        
        if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
            produkList.splice(index, 1);
            localStorage.setItem('produk', JSON.stringify(produkList));
            muatProduk();
        }
    }

    // Export Produk ke CSV
    btnExportProduk.addEventListener('click', () => {
        const csvContent = [
            ['Nama Produk', 'Kategori', 'Harga Jual', 'Harga Modal', 'Stok', 'Barcode', 'Satuan'],
            ...produkList.map(produk => [
                produk.namaProduk,
                produk.kategoriProduk,
                produk.hargaJual,
                produk.hargaModal,
                produk.stokProduk,
                produk.barcodeProduk || '',
                produk.satuanProduk || ''
            ])
        ].map(e => e.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `produk_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Muat produk saat halaman pertama kali dimuat
    muatProduk();

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
