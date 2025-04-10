// backup.js
document.addEventListener('DOMContentLoaded', () => {
    const btnBackup = document.getElementById('btnBackup');
    const btnImport = document.getElementById('btnImport');
    const btnReset = document.getElementById('btnReset');
    const fileImport = document.getElementById('fileImport');

    // Backup Data
    btnBackup.addEventListener('click', () => {
        const data = {
            produk: JSON.parse(localStorage.getItem('produk') || '[]'),
            nota: JSON.parse(localStorage.getItem('nota') || '[]'),
            pengaturanToko: JSON.parse(localStorage.getItem('pengaturanToko') || '{}')
        };
        
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const today = new Date();
        const formattedDate = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
        a.download = `backup_${formattedDate}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Import Data
    btnImport.addEventListener('click', () => {
        fileImport.click();
    });

    fileImport.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                localStorage.setItem('produk', JSON.stringify(data.produk));
                localStorage.setItem('nota', JSON.stringify(data.nota));
                localStorage.setItem('pengaturanToko', JSON.stringify(data.pengaturanToko));
                alert('Data berhasil diimpor! Silakan refresh halaman.');
            } catch (error) {
                alert('Format file tidak valid!');
            }
        };
        reader.readAsText(file);
    });

    // Reset Data
    btnReset.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin mereset semua data? Semua data akan dihapus permanen!')) {
            localStorage.clear();
            alert('Data berhasil direset. Halaman akan direfresh.');
            setTimeout(() => {
                location.reload();
            }, 1000);
        }
    });
});