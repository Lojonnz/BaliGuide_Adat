<?php
/**
 * API Endpoint: Get Aturan Adat
 * Returns list of traditional rules from v_aturan_adat_lengkap view
 *
 * GET /baliguide-api/aturan.php
 * Query params:
 *   - kategori_id: Filter by kategori (optional)
 *   - limit: Limit results (default: 50, max: 100)
 *   - offset: Offset for pagination (default: 0)
 */

require_once 'config.php';

// Get query parameters
$kategori_id = isset($_GET['kategori_id']) ? intval($_GET['kategori_id']) : null;
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 50;
$offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;

// Validate limit (max 100)
$limit = min($limit, 100);

$conn = getDBConnection();

// Use the pre-built view that already has all JOINs
$sql = "
    SELECT
        id_aturan,
        id_komunitas,
        id_kategori,
        nama_aturan,
        slug,
        ringkasan,
        isi_aturan,
        tujuan,
        penerapan,
        konsekuensi,
        status_berlaku,
        status_verifikasi,
        nama_komunitas,
        nama_kategori,
        kecamatan,
        kabupaten,
        provinsi,
        id_sumber,
        judul_sumber,
        jenis_sumber,
        tahun_terbit,
        url,
        created_at,
        updated_at
    FROM v_aturan_adat_lengkap
    WHERE 1=1
";

// Add filters
$params = [];
$types = '';

if ($kategori_id !== null) {
    $sql .= " AND id_kategori = ?";
    $params[] = $kategori_id;
    $types .= 'i';
}

// Add ordering and pagination
$sql .= " ORDER BY updated_at DESC, created_at DESC LIMIT ? OFFSET ?";
$params[] = $limit;
$params[] = $offset;
$types .= 'ii';

// Prepare and execute
$stmt = $conn->prepare($sql);

if (!$stmt) {
    sendError('Failed to prepare query: ' . $conn->error, 500);
}

if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

// Fetch all results
$aturan_list = [];
while ($row = $result->fetch_assoc()) {
    $aturan_list[] = [
        'id' => $row['id_aturan'],
        'nama' => $row['nama_aturan'],
        'slug' => $row['slug'],
        'ringkasan' => $row['ringkasan'],
        'isi' => $row['isi_aturan'],
        'tujuan' => $row['tujuan'],
        'penerapan' => $row['penerapan'],
        'konsekuensi' => $row['konsekuensi'],
        'status_berlaku' => $row['status_berlaku'],
        'status_verifikasi' => $row['status_verifikasi'],
        'created_at' => $row['created_at'],
        'updated_at' => $row['updated_at'],
        'komunitas' => [
            'id' => $row['id_komunitas'],
            'nama' => $row['nama_komunitas'],
        ],
        'kategori' => [
            'id' => $row['id_kategori'],
            'nama' => $row['nama_kategori'],
        ],
        'wilayah' => [
            'kecamatan' => $row['kecamatan'],
            'kabupaten' => $row['kabupaten'],
            'provinsi' => $row['provinsi'],
        ],
        'sumber' => [
            'id' => $row['id_sumber'],
            'judul' => $row['judul_sumber'],
            'jenis' => $row['jenis_sumber'],
            'tahun' => $row['tahun_terbit'],
            'url' => $row['url'],
        ],
    ];
}

// Get total count for pagination
$count_sql = "SELECT COUNT(*) as total FROM v_aturan_adat_lengkap WHERE 1=1";
$count_params = [];
$count_types = '';

if ($kategori_id !== null) {
    $count_sql .= " AND id_kategori = ?";
    $count_params[] = $kategori_id;
    $count_types .= 'i';
}

$count_stmt = $conn->prepare($count_sql);
if (!empty($count_params)) {
    $count_stmt->bind_param($count_types, ...$count_params);
}
$count_stmt->execute();
$count_result = $count_stmt->get_result();
$total = $count_result->fetch_assoc()['total'];

// Close connections
$stmt->close();
$count_stmt->close();
$conn->close();

// Send response
sendJSON([
    'success' => true,
    'data' => $aturan_list,
    'pagination' => [
        'total' => intval($total),
        'limit' => $limit,
        'offset' => $offset,
        'count' => count($aturan_list),
    ],
]);
