// Inisialisasi Google Client
let googleClientInitialized = false;

async function initGoogleClient() {
  if (googleClientInitialized) return;
  
  await new Promise((resolve) => gapi.load('client:auth2', resolve));
  
  await gapi.client.init({
    clientId: '274038578804-3u4tcdmrn7a92skv1i91u28slt69u581.apps.googleusercontent.com',
    scope: 'https://www.googleapis.com/auth/drive.file',
  });
  
  googleClientInitialized = true;
}

// Backup ke Google Drive
async function backupToDrive() {
  try {
    await initGoogleClient();
    const auth = gapi.auth2.getAuthInstance();
    
    if (!auth.isSignedIn.get()) {
      await auth.signIn();
    }

    const data = {
      produk: JSON.parse(localStorage.getItem('produk') || '[]'),
      nota: JSON.parse(localStorage.getItem('nota') || '[]'),
      pengaturanToko: JSON.parse(localStorage.getItem('pengaturanToko') || '{}')
    };

    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const filename = `backup_${new Date().toISOString().split('T')[0]}.json`;

    const response = await gapi.client.drive.files.create({
      resource: {
        name: filename,
        mimeType: 'application/json',
        parents: ['root']
      },
      media: {
        mimeType: 'application/json',
        body: blob
      }
    });

    console.log('Backup berhasil:', response.result);
    alert('Backup ke Google Drive berhasil!');
  } catch (error) {
    console.error('Error backup:', error);
    alert('Gagal backup: ' + error.message);
  }
}

// Auto backup setiap 24 jam
setInterval(async () => {
  if (gapi.auth2 && gapi.auth2.getAuthInstance().isSignedIn.get()) {
    await backupToDrive();
  }
}, 86400000); // 24 jam

// Update tombol backup
document.getElementById('btnBackup').addEventListener('click', backupToDrive);

// Fungsi yang sudah ada untuk import data tetap sama