// Konfigurasi
const GOOGLE_CLIENT_ID = '428814807215-d0fd7qsjrqigukppun4nlvptoh1pm6k4.apps.googleusercontent.com';
const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

// Inisialisasi Google Auth
let googleAuth;

function initGoogleAuth() {
    gapi.load('auth2', () => {
        googleAuth = gapi.auth2.init({
            client_id: GOOGLE_CLIENT_ID,
            scope: GOOGLE_SCOPE
        });
    });
}

// Backup ke Google Drive
document.getElementById('btnGoogleBackup').addEventListener('click', async () => {
    try {
        // Autentikasi
        const user = await googleAuth.signIn();
        
        // Ambil data dari localStorage
        const backupData = {
            produk: JSON.parse(localStorage.getItem('produk') || [],
            nota: JSON.parse(localStorage.getItem('nota') || []),
            pengaturanToko: JSON.parse(localStorage.getItem('pengaturanToko') || {})
        };

        // Buat file metadata
        const metadata = {
            name: `backup_${Date.now()}.json`,
            mimeType: 'application/json',
            description: 'Backup data aplikasi'
        };

        // Buat form data
        const formData = new FormData();
        formData.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
        formData.append('file', new Blob([JSON.stringify(backupData)], {type: 'application/json'}));

        // Upload ke Google Drive
        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${user.getAuthResponse().access_token}`
            },
            body: formData
        });

        if (response.ok) {
            alert('Backup ke Google Drive berhasil!');
        }
    } catch (error) {
        console.error('Error backup:', error);
        alert('Gagal melakukan backup ke Google Drive');
    }
});

// Import dari Google Drive
document.getElementById('btnGoogleImport').addEventListener('click', async () => {
    try {
        // Autentikasi
        const user = await googleAuth.signIn();
        
        // Dapatkan list file backup
        const response = await gapi.client.drive.files.list({
            q: "name contains 'backup_' and mimeType='application/json'",
            fields: 'files(id,name,createdTime)',
            orderBy: 'createdTime desc'
        });

        const files = response.result.files;
        if (files.length === 0) {
            alert('Tidak ada file backup ditemukan');
            return;
        }

        // Ambil file terbaru (bisa modifikasi untuk pilihan user)
        const latestFile = files[0];
        
        // Download file
        const downloadResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${latestFile.id}?alt=media`, {
            headers: {
                'Authorization': `Bearer ${user.getAuthResponse().access_token}`
            }
        });
        
        const data = await downloadResponse.json();
        
        // Simpan ke localStorage
        localStorage.setItem('produk', JSON.stringify(data.produk));
        localStorage.setItem('nota', JSON.stringify(data.nota));
        localStorage.setItem('pengaturanToko', JSON.stringify(data.pengaturanToko));
        
        alert('Import dari Google Drive berhasil!');
        muatNota(); // Refresh data
    } catch (error) {
        console.error('Error import:', error);
        alert('Gagal melakukan import dari Google Drive');
    }
});

// Inisialisasi saat halaman dimuat
window.onload = initGoogleAuth;