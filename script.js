// =====================================================================
// API CONFIGURATION
// =====================================================================
const JSONBIN_API_KEY = "$2a$10$sZDo3Y8ECzT3IV9Wscd0y.Zay7lus4MQrvu30Fqw9lDKl3UCXZ5RS";
const JSONBIN_BIN_ID = "68d8e967ae596e708ffe6b33"; // <-- ID BIN ANDA
const JSONBIN_API_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

// =====================================================================
// GLOBAL VARIABLES & ELEMENT FINDING
// =====================================================================
let lodgingAppData = [];
let activePropertyId = null;
let currentUserRole = null; // 'admin' atau 'karyawan'

// Variabel State untuk Sorting
let sortPemasukan = { column: 'tglMasuk', direction: 'desc' };
let sortPengeluaran = { column: 'tanggal', direction: 'desc' };


// Halaman
const semuaHalaman = document.querySelectorAll('.page');
const halamanDaftarPenginapan = document.getElementById('halaman-daftar-penginapan');
const halamanMenu = document.getElementById('halaman-menu');
const halamanKamar = document.getElementById('halaman-kamar');
const halamanCashflow = document.getElementById('halaman-cashflow');
const halamanPemasukan = document.getElementById('halaman-pemasukan');
const halamanPengeluaran = document.getElementById('halaman-pengeluaran');

// Elemen Halaman Daftar Penginapan
const containerDaftarPenginapan = document.getElementById('container-daftar-penginapan');
const tombolTambahPenginapanBaru = document.getElementById('tombol-tambah-penginapan-baru');

// Elemen Halaman Menu
const kembaliKeDaftarPenginapan = document.getElementById('kembali-ke-daftar-penginapan');
const displayNamaPenginapanMenu = document.getElementById('display-nama-penginapan-menu');
const menuTotalCashflow = document.getElementById('menu-total-cashflow');
const menuPemasukanKamar = document.getElementById('menu-pemasukan-kamar');
const menuPengeluaran = document.getElementById('menu-pengeluaran');
const menuKamar = document.getElementById('menu-kamar');

// Elemen Halaman Kamar
const kembaliKeMenuDariKamar = document.getElementById('kembali-ke-menu-dari-kamar');
const displayNamaPenginapanKamar = document.getElementById('display-nama-penginapan-kamar');
const inputNamaKamarBaru = document.getElementById('input-nama-kamar-baru');
const tombolTambahKamar = document.getElementById('tombol-tambah-kamar');
const containerDaftarKamar = document.getElementById('container-daftar-kamar');
const filterTanggalTersedia = document.getElementById('filter-tanggal-tersedia');
const tombolCekTersedia = document.getElementById('tombol-cek-tersedia');
const containerHasilTersedia = document.getElementById('container-hasil-tersedia');


// Elemen Halaman Cashflow
const kembaliKeMenuDariCashflow = document.getElementById('kembali-ke-menu-dari-cashflow');
const displayNamaPenginapanCashflow = document.getElementById('display-nama-penginapan-cashflow');
const containerTabelCashflow = document.getElementById('container-tabel-cashflow');
const filterBulanCashflow = document.getElementById('filter-bulan-cashflow');

// Elemen Halaman Pemasukan
const kembaliKeMenuDariPemasukan = document.getElementById('kembali-ke-menu-dari-pemasukan');
const displayNamaPenginapanPemasukan = document.getElementById('display-nama-penginapan-pemasukan');
const tombolTambahPemasukanBaru = document.getElementById('tombol-tambah-pemasukan-baru');
const containerTabelPemasukan = document.getElementById('container-tabel-pemasukan');
const filterBulanPemasukan = document.getElementById('filter-bulan-pemasukan');

// Elemen Halaman Pengeluaran
const kembaliKeMenuDariPengeluaran = document.getElementById('kembali-ke-menu-dari-pengeluaran');
const displayNamaPenginapanPengeluaran = document.getElementById('display-nama-penginapan-pengeluaran');
const tombolTambahPengeluaranBaru = document.getElementById('tombol-tambah-pengeluaran-baru');
const containerTabelPengeluaran = document.getElementById('container-tabel-pengeluaran');
const filterBulanPengeluaran = document.getElementById('filter-bulan-pengeluaran');

// Elemen Modal Pemasukan
const modalPemasukan = document.getElementById('modal-pemasukan');
const formPemasukan = document.getElementById('form-pemasukan');
const modalJudulPemasukan = document.getElementById('modal-judul-pemasukan');
const tombolBatalModalPemasukan = document.getElementById('tombol-batal-modal-pemasukan');
const editIdPemasukan = document.getElementById('edit-id-pemasukan');
const inputNamaKamarSelect = document.getElementById('input-nama-kamar');

// Elemen Modal Pengeluaran
const modalPengeluaran = document.getElementById('modal-pengeluaran');
const formPengeluaran = document.getElementById('form-pengeluaran');
const modalJudulPengeluaran = document.getElementById('modal-judul-pengeluaran');
const tombolBatalModalPengeluaran = document.getElementById('tombol-batal-modal-pengeluaran');
const editIdPengeluaran = document.getElementById('edit-id-pengeluaran');

// =====================================================================
// FUNGSI API & MANAJEMEN DATA
// =====================================================================
async function saveData(data) {
    const headers = { 'Content-Type': 'application/json', 'X-Master-Key': JSONBIN_API_KEY };
    try {
        const response = await fetch(JSONBIN_API_URL, { method: 'PUT', headers: headers, body: JSON.stringify(data) });
        if (!response.ok) throw new Error(`Gagal menyimpan data: ${response.status}`);
    } catch (error) {
        console.error("Kesalahan Simpan:", error);
        alert("Error: Tidak dapat menyimpan data ke server.");
    }
}

async function loadData() {
    const headers = { 'X-Master-Key': JSONBIN_API_KEY };
    try {
        const response = await fetch(`${JSONBIN_API_URL}/latest`, { headers: headers, cache: 'no-store' });
        if (!response.ok) {
            if (response.status === 404) {
                await saveData({ properties: [] });
                return { properties: [] };
            }
            throw new Error(`Gagal memuat data: ${response.status}`);
        }
        const data = await response.json();
        return data.record;
    } catch (error) {
        console.error("Kesalahan Muat:", error);
        alert("Error: Tidak dapat memuat data dari server. Silakan periksa koneksi Anda dan segarkan halaman.");
        return { properties: [] };
    }
}

async function saveState() {
    await saveData({ properties: lodgingAppData });
}

async function initializeApp() {
    try {
        const data = await loadData();
        lodgingAppData = data.properties || [];
        renderPropertyList();
        tampilkanHalaman('halaman-daftar-penginapan');
        setupEventListeners();
    } catch (error) {
        console.error("Error saat inisialisasi aplikasi:", error);
    }
}

// =====================================================================
// FUNGSI UI & PEMBANTU
// =====================================================================
function tampilkanHalaman(idHalaman) {
    semuaHalaman.forEach(h => h.classList.add('hidden'));
    document.getElementById(idHalaman).classList.remove('hidden');

    if (idHalaman === 'halaman-menu') {
        // Atur visibilitas menu berdasarkan peran
        if (currentUserRole === 'karyawan') {
            menuTotalCashflow.style.display = 'none';
        } else {
            menuTotalCashflow.style.display = 'block';
        }
    }
}

function getActiveProperty() {
    const prop = lodgingAppData.find(p => p.id === activePropertyId);
    if (prop && !prop.rooms) prop.rooms = []; // Inisialisasi jika belum ada
    return prop;
}

function getUniqueValues(fieldName, transactionType) {
    const property = getActiveProperty();
    if (!property || !property.transactions) return [];
    const values = property.transactions
        .filter(t => t.type === transactionType)
        .map(t => (t[fieldName] || '').toLowerCase());
    return [...new Set(values)].filter(Boolean);
}

function populateMonthFilter(selectElement, transactions, callback) {
    const currentVal = selectElement.value;
    const getDate = t => t.type === 'pemasukan' ? t.tglMasuk : t.tanggal;
    const months = [...new Set(transactions.map(t => getDate(t) ? getDate(t).substring(0, 7) : null).filter(Boolean))]; // "YYYY-MM"
    months.sort().reverse();
    
    selectElement.innerHTML = '<option value="semua">Semua Bulan</option>';
    months.forEach(month => {
        const date = new Date(month + "-02"); // Use day 2 to avoid timezone issues
        const monthName = date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
        const option = document.createElement('option');
        option.value = month;
        option.textContent = monthName;
        selectElement.appendChild(option);
    });
    
    selectElement.value = currentVal;
    selectElement.onchange = callback;
}

function formatTampilan(str) {
    if (!str) return '';
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

function getCleanNumberValue(id) {
    const value = document.getElementById(id).value;
    return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
}


// =====================================================================
// EVENT LISTENERS UTAMA
// =====================================================================
function setupEventListeners() {
    // Tombol Kembali
    kembaliKeDaftarPenginapan.addEventListener('click', () => {
        currentUserRole = null; // Reset peran saat kembali
        tampilkanHalaman('halaman-daftar-penginapan');
    });
    kembaliKeMenuDariCashflow.addEventListener('click', () => tampilkanHalaman('halaman-menu'));
    kembaliKeMenuDariPemasukan.addEventListener('click', () => tampilkanHalaman('halaman-menu'));
    kembaliKeMenuDariPengeluaran.addEventListener('click', () => tampilkanHalaman('halaman-menu'));
    kembaliKeMenuDariKamar.addEventListener('click', () => tampilkanHalaman('halaman-menu'));


    // Navigasi Menu
    menuTotalCashflow.addEventListener('click', tampilkanHalamanCashflow);
    menuPemasukanKamar.addEventListener('click', tampilkanHalamanPemasukan);
    menuPengeluaran.addEventListener('click', tampilkanHalamanPengeluaran);
    menuKamar.addEventListener('click', tampilkanHalamanKamar);

    // Listener Halaman Kamar
    tombolTambahKamar.addEventListener('click', handleTambahKamar);
    tombolCekTersedia.addEventListener('click', handleCekKetersediaan);

    // Modal Listeners
    tombolTambahPemasukanBaru.addEventListener('click', () => showPemasukanModal());
    tombolBatalModalPemasukan.addEventListener('click', hidePemasukanModal);
    formPemasukan.addEventListener('submit', handleFormPemasukanSubmit);

    tombolTambahPengeluaranBaru.addEventListener('click', () => showPengeluaranModal());
    tombolBatalModalPengeluaran.addEventListener('click', hidePengeluaranModal);
    formPengeluaran.addEventListener('submit', handleFormPengeluaranSubmit);
}

// =====================================================================
// MANAJEMEN PENGINAPAN (PROPERTY)
// =====================================================================
function renderPropertyList() {
    containerDaftarPenginapan.innerHTML = '';
    if (lodgingAppData && lodgingAppData.length > 0) {
        lodgingAppData.forEach(property => {
            const itemContainer = document.createElement('div');
            itemContainer.className = 'perusahaan-item-container';
            itemContainer.onclick = (event) => {
                if (!event.target.closest('.tombol-pengaturan-perusahaan, .menu-aksi-perusahaan')) {
                    muatPenginapan(property.id);
                }
            };

            const namaSpan = document.createElement('span');
            namaSpan.className = 'nama-perusahaan-item';
            namaSpan.textContent = property.name;

            const tombolPengaturan = document.createElement('button');
            tombolPengaturan.className = 'tombol-pengaturan-perusahaan';
            tombolPengaturan.innerHTML = '&#9881;';
            tombolPengaturan.onclick = (event) => toggleMenuAksi(event, property.id);
            
            const menuAksi = document.createElement('div');
            menuAksi.className = 'menu-aksi-perusahaan';
            menuAksi.id = `menu-aksi-${property.id}`;
            menuAksi.innerHTML = `
                <a href="#" onclick="renamePenginapan(${property.id}, event)">Ganti Nama</a>
                <a href="#" onclick="editPasswords(${property.id}, event)">Ubah Kata Sandi</a>
                <a href="#" onclick="hapusPenginapan(${property.id}, event)" class="menu-aksi-hapus">Hapus</a>
            `;
            itemContainer.appendChild(namaSpan);
            itemContainer.appendChild(tombolPengaturan);
            itemContainer.appendChild(menuAksi);
            containerDaftarPenginapan.appendChild(itemContainer);
        });
    } else {
        containerDaftarPenginapan.innerHTML = '<p>Belum ada properti penginapan. Buat satu untuk memulai.</p>';
    }
}

function toggleMenuAksi(event, propertyId) {
    event.stopPropagation();
    const currentMenu = document.getElementById(`menu-aksi-${propertyId}`);
    document.querySelectorAll('.menu-aksi-perusahaan').forEach(menu => {
        if (menu.id !== `menu-aksi-${propertyId}`) menu.style.display = 'none';
    });
    currentMenu.style.display = (currentMenu.style.display === 'block') ? 'none' : 'block';
}

tombolTambahPenginapanBaru.addEventListener('click', async () => {
    const propertyName = prompt("Masukkan nama penginapan baru (contoh: Kost Melati):");
    if (!propertyName || propertyName.trim() === '') return;
    
    const adminPassword = prompt(`(LANGKAH 1/2) Masukkan kata sandi untuk ADMIN:`);
    if (adminPassword === null || adminPassword === "") {
        alert("Password Admin tidak boleh kosong.");
        return;
    }

    const employeePassword = prompt(`(LANGKAH 2/2) Masukkan kata sandi untuk KARYAWAN:`);
    if (employeePassword === null || employeePassword === "") {
         alert("Password Karyawan tidak boleh kosong.");
        return;
    }

    if (adminPassword === employeePassword) {
        alert("Password Admin dan Karyawan tidak boleh sama!");
        return;
    }
    
    lodgingAppData.push({
        id: Date.now(),
        name: propertyName.trim(),
        adminPassword: adminPassword,
        employeePassword: employeePassword,
        rooms: [],
        transactions: []
    });
    renderPropertyList();
    await saveState();
});

function renamePenginapan(propertyId, event) {
    event.stopPropagation();
    const property = lodgingAppData.find(p => p.id === propertyId);
    if (!property) return;
    const password = prompt(`Untuk mengubah nama, masukkan kata sandi ADMIN:`);
    if (password === property.adminPassword) {
        const newName = prompt("Masukkan nama penginapan baru:", property.name);
        if (newName && newName.trim() !== '') {
            property.name = newName.trim();
            renderPropertyList();
            saveState();
        }
    } else if (password !== null) {
        alert('Kata sandi salah atau Anda bukan Admin!');
    }
}

async function editPasswords(propertyId, event) {
    event.stopPropagation();
    const property = lodgingAppData.find(p => p.id === propertyId);
    if (!property) return;

    const currentAdminPass = prompt("Untuk keamanan, masukkan kata sandi ADMIN Anda saat ini:");
    if (currentAdminPass !== property.adminPassword) {
        if(currentAdminPass !== null) alert("Kata sandi Admin saat ini salah.");
        return;
    }

    const newAdminPass = prompt("(LANGKAH 1/2) Masukkan kata sandi BARU untuk ADMIN:");
    if (newAdminPass === null || newAdminPass === "") {
        alert("Password baru Admin tidak boleh kosong.");
        return;
    }

    const newEmpPass = prompt("(LANGKAH 2/2) Masukkan kata sandi BARU untuk KARYAWAN:");
    if (newEmpPass === null || newEmpPass === "") {
        alert("Password baru Karyawan tidak boleh kosong.");
        return;
    }
    
    if (newAdminPass === newEmpPass) {
        alert("Password Admin dan Karyawan tidak boleh sama!");
        return;
    }

    property.adminPassword = newAdminPass;
    property.employeePassword = newEmpPass;
    await saveState();
    alert("Kata sandi berhasil diperbarui!");
    document.querySelectorAll('.menu-aksi-perusahaan').forEach(menu => menu.style.display = 'none');
}


function hapusPenginapan(propertyId, event) {
    event.stopPropagation();
    const property = lodgingAppData.find(p => p.id === propertyId);
    if (!property) return;
    const password = prompt(`Untuk menghapus, masukkan kata sandi ADMIN:`);
    if (password === property.adminPassword) {
        if (confirm('Yakin ingin menghapus penginapan ini dan semua catatannya secara permanen?')) {
            lodgingAppData = lodgingAppData.filter(p => p.id !== propertyId);
            renderPropertyList();
            saveState();
        }
    } else if (password !== null) {
        alert('Kata sandi salah atau Anda bukan Admin!');
    }
}

async function muatPenginapan(propertyId) {
    const property = lodgingAppData.find(p => p.id === propertyId);
    if (!property) return;

    // MIGRASI OTOMATIS UNTUK DATA LAMA (YANG HANYA PUNYA 'password' atau 'bossPassword')
    if ((property.password && !property.adminPassword) || (property.bossPassword && !property.adminPassword)) {
        const oldPasswordKey = property.password ? 'password' : 'bossPassword';
        const oldPasswordValue = property[oldPasswordKey];
        
        const enteredOldPassword = prompt(`Verifikasi password LAMA untuk properti "${property.name}":`);
        if (enteredOldPassword !== oldPasswordValue) {
            if(enteredOldPassword !== null) alert("Password lama salah. Update dibatalkan.");
            return;
        }

        alert(`Password lama terverifikasi. Sekarang, atur password baru.`);
        const newAdminPass = prompt(`(UPDATE 1/2) Masukkan kata sandi BARU untuk ADMIN:`);
        if (newAdminPass === null || newAdminPass === "") {
            alert("Update dibatalkan. Password Admin tidak boleh kosong.");
            return;
        }
        const newEmpPass = prompt(`(UPDATE 2/2) Masukkan kata sandi BARU untuk KARYAWAN:`);
        if (newEmpPass === null || newEmpPass === "") {
            alert("Update dibatalkan. Password Karyawan tidak boleh kosong.");
            return;
        }

        if (newAdminPass === newEmpPass) {
            alert("Update gagal. Password Admin dan Karyawan tidak boleh sama!");
            return;
        }

        property.adminPassword = newAdminPass;
        property.employeePassword = newEmpPass;
        delete property.password;
        delete property.bossPassword;
        await saveState();
        alert("Kata sandi berhasil diperbarui. Silakan masuk kembali dengan password baru.");
        return;
    }


    const enteredPassword = prompt(`Masukkan kata sandi untuk "${property.name}":`);
    if (enteredPassword === null) return;

    if (enteredPassword === property.adminPassword) {
        currentUserRole = 'admin';
    } else if (enteredPassword === property.employeePassword) {
        currentUserRole = 'karyawan';
    } else {
        alert("Kata sandi salah!");
        currentUserRole = null;
        return;
    }

    activePropertyId = propertyId;
    displayNamaPenginapanMenu.textContent = property.name;
    tampilkanHalaman('halaman-menu');
}


// =====================================================================
// NAVIGASI & RENDER HALAMAN
// =====================================================================
function tampilkanHalamanCashflow() {
    const property = getActiveProperty();
    displayNamaPenginapanCashflow.textContent = property.name;
    populateMonthFilter(filterBulanCashflow, property.transactions, renderCashflowTable);
    renderCashflowTable();
    tampilkanHalaman('halaman-cashflow');
}

function tampilkanHalamanPemasukan() {
    const property = getActiveProperty();
    displayNamaPenginapanPemasukan.textContent = property.name;
    const pemasukanTrans = property.transactions.filter(t => t.type === 'pemasukan');
    populateMonthFilter(filterBulanPemasukan, pemasukanTrans, renderPemasukanTable);
    renderPemasukanTable();
    tampilkanHalaman('halaman-pemasukan');
}

function tampilkanHalamanPengeluaran() {
    const property = getActiveProperty();
    displayNamaPenginapanPengeluaran.textContent = property.name;
    const pengeluaranTrans = property.transactions.filter(t => t.type === 'pengeluaran');
    populateMonthFilter(filterBulanPengeluaran, pengeluaranTrans, renderPengeluaranTable);
    renderPengeluaranTable();
    tampilkanHalaman('halaman-pengeluaran');
}

function tampilkanHalamanKamar() {
    const property = getActiveProperty();
    displayNamaPenginapanKamar.textContent = property.name;
    renderRoomList();
    containerHasilTersedia.innerHTML = ''; // Kosongkan hasil cek sebelumnya
    tampilkanHalaman('halaman-kamar');
}

// =====================================================================
// FUNGSI SORTING
// =====================================================================
function sortTablePemasukan(column) {
    if (sortPemasukan.column === column) {
        sortPemasukan.direction = sortPemasukan.direction === 'asc' ? 'desc' : 'asc';
    } else {
        sortPemasukan.column = column;
        sortPemasukan.direction = 'desc'; // Default descending
    }
    renderPemasukanTable();
}

function sortTablePengeluaran(column) {
    if (sortPengeluaran.column === column) {
        sortPengeluaran.direction = sortPengeluaran.direction === 'asc' ? 'desc' : 'asc';
    } else {
        sortPengeluaran.column = column;
        sortPengeluaran.direction = 'desc'; // Default descending
    }
    renderPengeluaranTable();
}

// =====================================================================
// RENDER TABEL-TABEL
// =====================================================================
function renderPemasukanTable() {
    const property = getActiveProperty();
    const selectedMonth = filterBulanPemasukan.value;
    
    let filtered = property.transactions.filter(t => 
        t.type === 'pemasukan' && (selectedMonth === 'semua' || (t.tglMasuk && t.tglMasuk.startsWith(selectedMonth)))
    );

    // LOGIKA SORTING
    filtered.sort((a, b) => {
        let valA, valB;
        if (sortPemasukan.column === 'penghasilan') {
            const hariA = Math.ceil((new Date(a.tglKeluar) - new Date(a.tglMasuk)) / (1000 * 60 * 60 * 24)) || 1;
            valA = a.jenisSewa === 'harian' ? hariA * a.harga : a.harga;
            const hariB = Math.ceil((new Date(b.tglKeluar) - new Date(b.tglMasuk)) / (1000 * 60 * 60 * 24)) || 1;
            valB = b.jenisSewa === 'harian' ? hariB * b.harga : b.harga;
        } else { // Handles tglMasuk and tglKeluar
            valA = new Date(a[sortPemasukan.column]);
            valB = new Date(b[sortPemasukan.column]);
        }

        if (valA < valB) return sortPemasukan.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortPemasukan.direction === 'asc' ? 1 : -1;
        return 0;
    });

    if (filtered.length === 0) {
        containerTabelPemasukan.innerHTML = '<p>Tidak ada catatan pada bulan yang dipilih.</p>';
        return;
    }

    const headerConfig = [
        { key: 'tglMasuk', label: 'Tgl Masuk', sortable: true },
        { key: 'tglKeluar', label: 'Tgl Keluar', sortable: true },
        { key: 'jenisSewa', label: 'Jenis Sewa', sortable: false },
        { key: 'kamar', label: 'Kamar', sortable: false },
        { key: 'penyewa', label: 'Penyewa', sortable: false },
        { key: 'harga', label: 'Harga', sortable: false },
        { key: 'penghasilan', label: 'Penghasilan', sortable: true },
        { key: 'status', label: 'Status', sortable: false },
        { key: 'bukti', label: 'Bukti Transfer', sortable: false },
        { key: 'aksi', label: 'Aksi', sortable: false },
    ];

    let headerHTML = '<tr>';
    headerConfig.forEach(h => {
        if (h.sortable) {
            const sortIndicator = sortPemasukan.column === h.key 
                ? (sortPemasukan.direction === 'asc' ? ' &#9650;' : ' &#9660;') 
                : '';
            headerHTML += `<th style="cursor: pointer;" onclick="sortTablePemasukan('${h.key}')">${h.label}${sortIndicator}</th>`;
        } else {
            headerHTML += `<th>${h.label}</th>`;
        }
    });
    headerHTML += '</tr>';

    let bodyHTML = '';
    let totalPenghasilan = 0;

    filtered.forEach(t => {
        const penghasilan = t.jenisSewa === 'harian' 
            ? (Math.ceil((new Date(t.tglKeluar) - new Date(t.tglMasuk)) / (1000 * 60 * 60 * 24)) || 1) * t.harga 
            : t.harga;
        totalPenghasilan += penghasilan;
        
        const buktiDisplay = t.bukti 
            ? `<a href="${t.bukti}" target="_blank" class="link-bukti">Lihat Bukti</a>`
            : `<button class="tombol-upload-bukti" onclick="uploadBuktiPemasukan(${t.id})">Input Link Bukti</button>`;
        
        const room = property.rooms.find(r => r.id == t.roomId);
        const roomName = room ? room.name : 'N/A';

        const statusTransfer = t.statusTransfer || 'pending';
        const statusClass = `status-${statusTransfer}`;
        const statusDisplay = currentUserRole === 'admin'
            ? `<div class="status-box ${statusClass}" onclick="cycleTransferStatus(${t.id})">${formatTampilan(statusTransfer)}</div>`
            : `<div class="status-box non-clickable ${statusClass}">${formatTampilan(statusTransfer)}</div>`;

        bodyHTML += `
            <tr data-id="${t.id}">
                <td data-label="Tgl Masuk">${formatDate(t.tglMasuk)}</td>
                <td data-label="Tgl Keluar">${formatDate(t.tglKeluar)}</td>
                <td data-label="Jenis Sewa">${formatTampilan(t.jenisSewa)}</td>
                <td data-label="Kamar">${formatTampilan(roomName)}</td>
                <td data-label="Penyewa">${formatTampilan(t.namaPenyewa)}</td>
                <td data-label="Harga">${t.harga.toLocaleString('id-ID')}</td>
                <td data-label="Penghasilan"><strong>${penghasilan.toLocaleString('id-ID')}</strong></td>
                <td data-label="Status">${statusDisplay}</td>
                <td data-label="Bukti Transfer">${buktiDisplay}</td>
                <td data-label="Aksi" class="col-actions">
                    <button onclick="editPemasukan(${t.id})">&#9998;</button>
                    <button class="tombol-hapus-bongkaran" onclick="hapusTransaksi(${t.id}, 'pemasukan')">&times;</button>
                </td>
            </tr>`;
    });

    containerTabelPemasukan.innerHTML = `<table>
        <thead>${headerHTML}</thead>
        <tbody>${bodyHTML}</tbody>
        <tfoot>
            <tr>
                <td colspan="6"><strong>TOTAL</strong></td>
                <td><strong>${totalPenghasilan.toLocaleString('id-ID')}</strong></td>
                <td colspan="3"></td>
            </tr>
        </tfoot>
    </table>`;
}

function renderPengeluaranTable() {
    const property = getActiveProperty();
    const selectedMonth = filterBulanPengeluaran.value;

    let filtered = property.transactions.filter(t => 
        t.type === 'pengeluaran' && (selectedMonth === 'semua' || (t.tanggal && t.tanggal.startsWith(selectedMonth)))
    );

    // LOGIKA SORTING
    filtered.sort((a, b) => {
        const valA = sortPengeluaran.column === 'tanggal' ? new Date(a.tanggal) : a.biaya;
        const valB = sortPengeluaran.column === 'tanggal' ? new Date(b.tanggal) : b.biaya;

        if (valA < valB) return sortPengeluaran.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortPengeluaran.direction === 'asc' ? 1 : -1;
        return 0;
    });

    if (filtered.length === 0) {
        containerTabelPengeluaran.innerHTML = '<p>Tidak ada catatan pada bulan yang dipilih.</p>';
        return;
    }

    const headerConfig = [
        { key: 'tanggal', label: 'Tanggal', sortable: true },
        { key: 'nama', label: 'Nama Pengeluaran', sortable: false },
        { key: 'biaya', label: 'Biaya', sortable: true },
        { key: 'status', label: 'Status ACC', sortable: false },
        { key: 'bukti', label: 'Bukti', sortable: false },
        { key: 'aksi', label: 'Aksi', sortable: false },
    ];
    
    let headerHTML = '<tr>';
    headerConfig.forEach(h => {
        if (h.sortable) {
            const sortIndicator = sortPengeluaran.column === h.key 
                ? (sortPengeluaran.direction === 'asc' ? ' &#9650;' : ' &#9660;') 
                : '';
            headerHTML += `<th style="cursor: pointer;" onclick="sortTablePengeluaran('${h.key}')">${h.label}${sortIndicator}</th>`;
        } else {
            headerHTML += `<th>${h.label}</th>`;
        }
    });
    headerHTML += '</tr>';

    let bodyHTML = '';
    let totalBiaya = 0;

    filtered.forEach(t => {
        totalBiaya += t.biaya;
        
        const isApproved = t.isApproved || false;
        const statusText = isApproved ? 'Disetujui' : 'Pending';
        const statusClass = isApproved ? 'status-disetujui' : 'status-pending';
        const statusDisplay = currentUserRole === 'admin'
            ? `<div class="status-box ${statusClass}" onclick="cycleExpenseStatus(${t.id})">${statusText}</div>`
            : `<div class="status-box non-clickable ${statusClass}">${statusText}</div>`;


        const buktiDisplay = t.bukti 
            ? `<a href="${t.bukti}" target="_blank" class="link-bukti">Lihat Bukti</a>`
            : `<button class="tombol-upload-bukti" onclick="uploadBuktiPengeluaran(${t.id})">Input Link Bukti</button>`;

        bodyHTML += `
            <tr data-id="${t.id}">
                <td data-label="Tanggal">${formatDate(t.tanggal)}</td>
                <td data-label="Nama Pengeluaran">${formatTampilan(t.namaPengeluaran)}</td>
                <td data-label="Biaya"><strong>${t.biaya.toLocaleString('id-ID')}</strong></td>
                <td data-label="Status ACC">${statusDisplay}</td>
                <td data-label="Bukti">${buktiDisplay}</td>
                <td data-label="Aksi" class="col-actions">
                    <button onclick="editPengeluaran(${t.id})">&#9998;</button>
                    <button class="tombol-hapus-bongkaran" onclick="hapusTransaksi(${t.id}, 'pengeluaran')">&times;</button>
                </td>
            </tr>`;
    });

    containerTabelPengeluaran.innerHTML = `<table>
        <thead>${headerHTML}</thead>
        <tbody>${bodyHTML}</tbody>
        <tfoot>
            <tr>
                <td colspan="2"><strong>TOTAL</strong></td>
                <td><strong>${totalBiaya.toLocaleString('id-ID')}</strong></td>
                <td colspan="3"></td>
            </tr>
        </tfoot>
    </table>`;
}

function renderCashflowTable() {
    const property = getActiveProperty();
    const selectedMonth = filterBulanCashflow.value;
    
    const getDate = t => t.type === 'pemasukan' ? t.tglMasuk : t.tanggal;
    const filtered = property.transactions.filter(t =>
        selectedMonth === 'semua' || (getDate(t) && getDate(t).startsWith(selectedMonth))
    ).sort((a,b) => new Date(getDate(a)) - new Date(getDate(b)));

    if (filtered.length === 0) {
        containerTabelCashflow.innerHTML = '<p>Tidak ada transaksi pada bulan yang dipilih.</p>';
        return;
    }
    
    const headers = ['Tanggal', 'Keterangan', 'Pemasukan', 'Pengeluaran', 'Status'];
    let bodyHTML = '';
    let totalPemasukan = 0;
    let totalPengeluaran = 0;

    filtered.forEach(t => {
        let keterangan = '', pemasukan = 0, pengeluaran = 0, tanggal = '', status = '-';
        if (t.type === 'pemasukan') {
            const penghasilan = t.jenisSewa === 'harian' 
                ? (Math.ceil((new Date(t.tglKeluar) - new Date(t.tglMasuk)) / (1000 * 60 * 60 * 24)) || 1) * t.harga 
                : t.harga;
            pemasukan = penghasilan;
            totalPemasukan += pemasukan;
            const room = property.rooms.find(r => r.id == t.roomId);
            const roomName = room ? room.name : 'N/A';
            keterangan = `Sewa ${formatTampilan(t.namaPenyewa)} (${formatTampilan(roomName)})`;
            tanggal = formatDate(t.tglMasuk);
            status = formatTampilan(t.statusTransfer || 'pending');
        } else {
            pengeluaran = t.biaya;
            totalPengeluaran += pengeluaran;
            keterangan = formatTampilan(t.namaPengeluaran);
            tanggal = formatDate(t.tanggal);
            status = t.isApproved ? 'Disetujui' : 'Pending';
        }
        bodyHTML += `
            <tr data-id="${t.id}">
                <td data-label="Tanggal">${tanggal}</td>
                <td data-label="Keterangan">${keterangan}</td>
                <td data-label="Pemasukan">${pemasukan > 0 ? pemasukan.toLocaleString('id-ID') : '-'}</td>
                <td data-label="Pengeluaran">${pengeluaran > 0 ? pengeluaran.toLocaleString('id-ID') : '-'}</td>
                <td data-label="Status">${status}</td>
            </tr>`;
    });
    
    const cashflow = totalPemasukan - totalPengeluaran;
    containerTabelCashflow.innerHTML = `<table>
        <thead><tr><th>${headers.join('</th><th>')}</th></tr></thead>
        <tbody>${bodyHTML}</tbody>
        <tfoot>
            <tr>
                <td colspan="2"><strong>TOTAL PEMASUKAN</strong></td>
                <td><strong>${totalPemasukan.toLocaleString('id-ID')}</strong></td>
                <td colspan="2"></td>
            </tr>
            <tr>
                <td colspan="2"><strong>TOTAL PENGELUARAN</strong></td>
                <td></td>
                <td><strong>${totalPengeluaran.toLocaleString('id-ID')}</strong></td>
                <td></td>
            </tr>
             <tr>
                <td colspan="2"><strong>CASHFLOW</strong></td>
                <td colspan="3"><strong>${cashflow.toLocaleString('id-ID')}</strong></td>
            </tr>
        </tfoot>
    </table>`;
}

// =====================================================================
// FUNGSI MANAJEMEN KAMAR BARU
// =====================================================================
function renderRoomList() {
    const property = getActiveProperty();
    containerDaftarKamar.innerHTML = '';
    if (property.rooms && property.rooms.length > 0) {
        property.rooms.sort((a,b) => a.name.localeCompare(b.name)).forEach(room => {
            const roomDiv = document.createElement('div');
            roomDiv.className = 'item-kamar';
            roomDiv.innerHTML = `
                <span>${formatTampilan(room.name)}</span>
                <div class="item-kamar-actions">
                    <button onclick="handleEditKamar(${room.id})">&#9998;</button>
                    <button class="tombol-hapus-kamar" onclick="handleHapusKamar(${room.id})">&times;</button>
                </div>
            `;
            containerDaftarKamar.appendChild(roomDiv);
        });
    } else {
        containerDaftarKamar.innerHTML = '<p>Belum ada kamar yang ditambahkan.</p>';
    }
}

async function handleTambahKamar() {
    const property = getActiveProperty();
    const newName = inputNamaKamarBaru.value.trim();
    if (!newName) {
        alert('Nama kamar tidak boleh kosong!');
        return;
    }
    property.rooms.push({
        id: Date.now(),
        name: newName
    });
    await saveState();
    renderRoomList();
    inputNamaKamarBaru.value = '';
}

async function handleEditKamar(roomId) {
    const property = getActiveProperty();
    const room = property.rooms.find(r => r.id === roomId);
    if (!room) return;
    
    const newName = prompt('Masukkan nama kamar baru:', room.name);
    if (newName && newName.trim() !== '') {
        room.name = newName.trim();
        await saveState();
        renderRoomList();
    }
}

async function handleHapusKamar(roomId) {
    if (currentUserRole !== 'admin') {
        alert('Hanya Admin yang dapat menghapus kamar.');
        return;
    }
    if (!confirm('Apakah Anda yakin ingin menghapus kamar ini?')) return;
    const property = getActiveProperty();
    property.rooms = property.rooms.filter(r => r.id !== roomId);
    await saveState();
    renderRoomList();
}

function handleCekKetersediaan() {
    const property = getActiveProperty();
    const checkDateStr = filterTanggalTersedia.value;
    if (!checkDateStr) {
        alert('Silakan pilih tanggal terlebih dahulu.');
        return;
    }

    const checkDate = new Date(checkDateStr);
    
    const bookings = property.transactions.filter(t => t.type === 'pemasukan');
    const bookedRoomIds = new Set();

    bookings.forEach(book => {
        const startDate = new Date(book.tglMasuk);
        const endDate = new Date(book.tglKeluar);
        // Kamar dianggap terisi dari tgl masuk HINGGA SEBELUM tgl keluar
        if (checkDate >= startDate && checkDate < endDate) {
            bookedRoomIds.add(book.roomId);
        }
    });

    const availableRooms = property.rooms.filter(room => !bookedRoomIds.has(room.id));
    
    let resultHTML = `<h4>Kamar Tersedia pada ${formatDate(checkDateStr)}:</h4>`;
    if (availableRooms.length > 0) {
        resultHTML += '<ul>';
        availableRooms.sort((a,b) => a.name.localeCompare(b.name)).forEach(room => {
            resultHTML += `<li class="kamar-tersedia">${formatTampilan(room.name)}</li>`;
        });
        resultHTML += '</ul>';
    } else {
        resultHTML += '<p>Tidak ada kamar yang tersedia pada tanggal tersebut.</p>';
    }
    
    const bookedRooms = property.rooms.filter(room => bookedRoomIds.has(room.id));
    if(bookedRooms.length > 0) {
        resultHTML += `<h4 style="margin-top: 1.5rem;">Kamar Terisi:</h4>`;
        resultHTML += '<ul>';
        bookedRooms.sort((a,b) => a.name.localeCompare(b.name)).forEach(room => {
            resultHTML += `<li class="kamar-terisi">${formatTampilan(room.name)}</li>`;
        });
        resultHTML += '</ul>';
    }

    containerHasilTersedia.innerHTML = resultHTML;
}



// =====================================================================
// MODAL & FORM HANDLING (DENGAN PENYESUAIAN)
// =====================================================================

// --- Pemasukan ---
function showPemasukanModal(trx = null) {
    const property = getActiveProperty();
    
    // Populate dropdown kamar
    inputNamaKamarSelect.innerHTML = '';
    if (property.rooms && property.rooms.length > 0) {
        property.rooms.sort((a,b) => a.name.localeCompare(b.name)).forEach(room => {
            const option = document.createElement('option');
            option.value = room.id;
            option.textContent = formatTampilan(room.name);
            inputNamaKamarSelect.appendChild(option);
        });
    } else {
        inputNamaKamarSelect.innerHTML = '<option value="">-- Tambah kamar dulu --</option>';
    }

    formPemasukan.reset();
    if (trx) {
        modalJudulPemasukan.textContent = 'Ubah Pemasukan';
        editIdPemasukan.value = trx.id;
        document.getElementById('input-jenis-sewa').value = trx.jenisSewa;
        document.getElementById('input-listrik-status').value = trx.listrikStatus;
        document.getElementById('input-tgl-masuk').value = trx.tglMasuk;
        document.getElementById('input-tgl-keluar').value = trx.tglKeluar;
        inputNamaKamarSelect.value = trx.roomId;
        document.getElementById('input-nama-penyewa').value = formatTampilan(trx.namaPenyewa);
        document.getElementById('input-harga-kamar').value = String(trx.harga);
    } else {
        modalJudulPemasukan.textContent = 'Tambah Pemasukan Baru';
        editIdPemasukan.value = '';
    }
    setupAutocomplete('input-nama-penyewa', 'suggestions-penyewa', 'namaPenyewa', 'pemasukan');
    modalPemasukan.classList.remove('hidden');
}

function hidePemasukanModal() {
    modalPemasukan.classList.add('hidden');
}

async function handleFormPemasukanSubmit(event) {
    event.preventDefault();
    const property = getActiveProperty();
    if (inputNamaKamarSelect.value === '') {
        alert('Kamar tidak tersedia. Silakan tambah kamar terlebih dahulu di menu Kamar.');
        return;
    }

    const id = editIdPemasukan.value ? Number(editIdPemasukan.value) : Date.now();
    const existingTrx = editIdPemasukan.value ? property.transactions.find(t => t.id === id) : {};

    const data = {
        id: id,
        type: 'pemasukan',
        jenisSewa: document.getElementById('input-jenis-sewa').value,
        listrikStatus: document.getElementById('input-listrik-status').value,
        tglMasuk: document.getElementById('input-tgl-masuk').value,
        tglKeluar: document.getElementById('input-tgl-keluar').value,
        roomId: Number(inputNamaKamarSelect.value),
        namaPenyewa: document.getElementById('input-nama-penyewa').value.trim().toLowerCase(),
        harga: getCleanNumberValue('input-harga-kamar'),
        bukti: existingTrx.bukti || '',
        statusTransfer: existingTrx.statusTransfer || 'pending',
    };

    if (editIdPemasukan.value) {
        const index = property.transactions.findIndex(t => t.id === data.id);
        if (index > -1) property.transactions[index] = data;
    } else {
        property.transactions.push(data);
    }
    
    await saveState();
    renderPemasukanTable();
    hidePemasukanModal();
}

function editPemasukan(id) {
    const trx = getActiveProperty().transactions.find(t => t.id === id);
    if (trx) showPemasukanModal(trx);
}

// --- Pengeluaran ---
function showPengeluaranModal(trx = null) {
    formPengeluaran.reset();
    if (trx) {
        modalJudulPengeluaran.textContent = 'Ubah Pengeluaran';
        editIdPengeluaran.value = trx.id;
        document.getElementById('input-tgl-pengeluaran').value = trx.tanggal;
        document.getElementById('input-nama-pengeluaran').value = formatTampilan(trx.namaPengeluaran);
        document.getElementById('input-biaya-pengeluaran').value = String(trx.biaya);
    } else {
        modalJudulPengeluaran.textContent = 'Tambah Pengeluaran Baru';
        editIdPengeluaran.value = '';
    }
    setupAutocomplete('input-nama-pengeluaran', 'suggestions-pengeluaran', 'namaPengeluaran', 'pengeluaran');
    modalPengeluaran.classList.remove('hidden');
}

function hidePengeluaranModal() {
    modalPengeluaran.classList.add('hidden');
}

async function handleFormPengeluaranSubmit(event) {
    event.preventDefault();
    const property = getActiveProperty();
    const id = editIdPengeluaran.value ? Number(editIdPengeluaran.value) : Date.now();
    const existingTrx = editIdPengeluaran.value ? property.transactions.find(t => t.id === id) : {};
    
    const data = {
        id: id,
        type: 'pengeluaran',
        tanggal: document.getElementById('input-tgl-pengeluaran').value,
        namaPengeluaran: document.getElementById('input-nama-pengeluaran').value.trim().toLowerCase(),
        biaya: getCleanNumberValue('input-biaya-pengeluaran'),
        bukti: existingTrx.bukti || '',
        isApproved: existingTrx.isApproved || false,
    };

    if (editIdPengeluaran.value) {
        const index = property.transactions.findIndex(t => t.id === data.id);
        if (index > -1) property.transactions[index] = data;
    } else {
        property.transactions.push(data);
    }

    await saveState();
    renderPengeluaranTable();
    hidePengeluaranModal();
}

function editPengeluaran(id) {
    const trx = getActiveProperty().transactions.find(t => t.id === id);
    if (trx) showPengeluaranModal(trx);
}

// --- Hapus & Fitur Baru ---
async function hapusTransaksi(id, type) {
    if (currentUserRole !== 'admin') {
        alert('Hanya Admin yang dapat menghapus transaksi.');
        return;
    }
    if (!confirm('Yakin ingin menghapus catatan ini?')) return;
    const property = getActiveProperty();
    property.transactions = property.transactions.filter(t => t.id !== id);
    await saveState();
    if (type === 'pemasukan') renderPemasukanTable();
    else renderPengeluaranTable();
}

async function uploadBuktiPemasukan(id) {
    const link = prompt("Upload bukti transfer ke layanan online (seperti ImgBB), lalu tempel link gambar di sini:");
    if (link === null || link.trim() === '') return;

    const property = getActiveProperty();
    const trx = property.transactions.find(t => t.id === id && t.type === 'pemasukan');
    if (trx) {
        trx.bukti = link.trim();
        await saveState();
        renderPemasukanTable();
    }
}

async function uploadBuktiPengeluaran(id) {
    const link = prompt("Upload bukti pembayaran ke layanan online (seperti ImgBB), lalu tempel link gambar di sini:");
    if (link === null || link.trim() === '') return;

    const property = getActiveProperty();
    const trx = property.transactions.find(t => t.id === id && t.type === 'pengeluaran');
    if (trx) {
        trx.bukti = link.trim();
        await saveState();
        renderPengeluaranTable();
    }
}

async function cycleExpenseStatus(transactionId) {
    if (currentUserRole !== 'admin') return;

    const property = getActiveProperty();
    const trx = property.transactions.find(t => t.id === transactionId && t.type === 'pengeluaran');

    if (trx) {
        trx.isApproved = !trx.isApproved; // Toggle antara true dan false
        await saveState();
        renderPengeluaranTable();
    }
}

async function cycleTransferStatus(transactionId) {
    if (currentUserRole !== 'admin') return; 

    const statuses = ['pending', 'dp', 'lunas'];
    const property = getActiveProperty();
    const trx = property.transactions.find(t => t.id === transactionId && t.type === 'pemasukan');

    if (trx) {
        const currentStatus = trx.statusTransfer || 'pending';
        const currentIndex = statuses.indexOf(currentStatus);
        const nextIndex = (currentIndex + 1) % statuses.length;
        trx.statusTransfer = statuses[nextIndex];
        
        await saveState();
        renderPemasukanTable();
    }
}


function setupAutocomplete(inputId, suggestionsId, fieldName, transactionType) {
    const input = document.getElementById(inputId);
    const suggestionsContainer = document.getElementById(suggestionsId);
    
    input.addEventListener('input', () => {
        const allSuggestions = getUniqueValues(fieldName, transactionType);
        const query = input.value.toLowerCase();
        const filtered = allSuggestions.filter(item => String(item).toLowerCase().includes(query));
        showSuggestions(filtered);
    });

    const showSuggestions = (suggestions) => {
        suggestionsContainer.innerHTML = '';
        if (suggestions.length > 0) {
            suggestions.forEach(suggestion => {
                const div = document.createElement('div');
                div.textContent = formatTampilan(suggestion);
                div.onclick = () => {
                    input.value = formatTampilan(suggestion);
                    suggestionsContainer.style.display = 'none';
                };
                suggestionsContainer.appendChild(div);
            });
            suggestionsContainer.style.display = 'block';
        } else {
            suggestionsContainer.style.display = 'none';
        }
    };

    document.addEventListener('click', (e) => {
        if (e.target.id !== inputId) {
            suggestionsContainer.style.display = 'none';
        }
    });
}

// =====================================================================
// MEMULAI APLIKASI
// =====================================================================
initializeApp();