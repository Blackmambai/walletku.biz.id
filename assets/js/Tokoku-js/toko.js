
document.addEventListener('DOMContentLoaded', () => {
    // Form Selectors
    const formPengaturanToko = document.getElementById('formPengaturanToko');
    const formPengaturanStruk = document.getElementById('formPengaturanStruk');
    const formKeamanan = document.getElementById('formKeamanan');
    const formPajakDiskon = document.getElementById('formPajakDiskon');
    const btnSimpanPengaturan = document.getElementById('btnSimpanPengaturan');
    const logoToko = document.getElementById('logoToko');
    const previewLogo = document.getElementById('previewLogo');

    // Logo Preview
    logoToko.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                previewLogo.src = event.target.result;
                previewLogo.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    // Muat Pengaturan Saat Halaman Dimuat
    function muatPengaturan() {
        const pengaturan = JSON.parse(localStorage.getItem('pengaturanToko') || '{}');

        // Informasi Toko
        document.getElementById('namaToko').value = pengaturan.namaToko || '';
        document.getElementById('emailToko').value = pengaturan.emailToko || '';
        document.getElementById('nomorWAToko').value = pengaturan.nomorWAToko || '';
        document.getElementById('npwpToko').value = pengaturan.npwpToko || '';
        document.getElementById('alamatToko').value = pengaturan.alamatToko || '';
        document.getElementById('deskripsiToko').value = pengaturan.deskripsiToko || '';

        // Pengaturan Struk
        document.getElementById('catatanKakiStruk').value = pengaturan.catatanKakiStruk || '';
        document.getElementById('metodeTunai').checked = pengaturan.metodeTunai || false;
        document.getElementById('metodeTransfer').checked = pengaturan.metodeTransfer || false;
        document.getElementById('metodeQRIS').checked = pengaturan.metodeQRIS || false;
        document.getElementById('metodeShopee').checked = pengaturan.metodeShopee || false;

        // Logo
        if (pengaturan.logoToko) {
            previewLogo.src = pengaturan.logoToko;
            previewLogo.style.display = 'block';
        }

        // Keamanan
        document.getElementById('usernameAdmin').value = pengaturan.usernameAdmin || '';

        // Pajak & Diskon
        document.getElementById('persentasePajak').value = pengaturan.persentasePajak || 0;
        document.getElementById('persentaseDiskon').value = pengaturan.persentaseDiskon || 0;
        document.getElementById('aktifkanDiskon').checked = pengaturan.aktifkanDiskon || false;
    }

    // Validasi Form
    function validasiForm() {
        const namaToko = document.getElementById('namaToko').value.trim();
        const passwordAdmin = document.getElementById('passwordAdmin').value;
        const konfirmasiPassword = document.getElementById('konfirmasiPassword').value;

        if (namaToko === '') {
            alert('Nama Toko tidak boleh kosong');
            return false;
        }

        if (passwordAdmin !== konfirmasiPassword) {
            alert('Konfirmasi password tidak cocok');
            return false;
        }

        return true;
    }

    // Simpan Pengaturan
    btnSimpanPengaturan.addEventListener('click', () => {
        if (!validasiForm()) return;

        const pengaturan = {
            // Informasi Toko
            namaToko: document.getElementById('namaToko').value,
            emailToko: document.getElementById('emailToko').value,
            nomorWAToko: document.getElementById('nomorWAToko').value,
            npwpToko: document.getElementById('npwpToko').value,
            alamatToko: document.getElementById('alamatToko').value,
            deskripsiToko: document.getElementById('deskripsiToko').value,

            // Pengaturan Struk
            catatanKakiStruk: document.getElementById('catatanKakiStruk').value,
            metodeTunai: document.getElementById('metodeTunai').checked,
            metodeTransfer: document.getElementById('metodeTransfer').checked,
            metodeQRIS: document.getElementById('metodeQRIS').checked,
            metodeShopee: document.getElementById('metodeShopee').checked,
            logoToko: previewLogo.src || '',

            // Keamanan
            usernameAdmin: document.getElementById('usernameAdmin').value,
            
            // Password (hanya diupdate jika diisi)
            passwordAdmin: document.getElementById('passwordAdmin').value || 
                           JSON.parse(localStorage.getItem('pengaturanToko') || '{}').passwordAdmin,

            // Pajak & Diskon
            persentasePajak: parseFloat(document.getElementById('persentasePajak').value),
            persentaseDiskon: parseFloat(document.getElementById('persentaseDiskon').value),
            aktifkanDiskon: document.getElementById('aktifkanDiskon').checked
        };

        // Simpan ke Local Storage
        localStorage.setItem('pengaturanToko', JSON.stringify(pengaturan));

        // Notifikasi Berhasil
        alert('Pengaturan berhasil disimpan!');
    });

    // Muat Pengaturan Saat Halaman Dimuat
    muatPengaturan();

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
