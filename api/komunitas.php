<?php
/**
 * API Endpoint: Get Komunitas Adat (Communities)
 * Returns list of adat communities
 *
 * GET /baliguide-api/komunitas.php
 */

require_once 'config.php';

$conn = getDBConnection();

$sql = "
    SELECT
        k.id_komunitas,
        k.kode_komunitas,
        k.nama_komunitas,
        k.deskripsi,
        k.created_at,
        w.id_wilayah,
        w.nama_wilayah,
        w.jenis_wilayah,
        COUNT(a.id_aturan) as jumlah_aturan
    FROM komunitas_adat k
    LEFT JOIN komunitas_wilayah kw ON kw.id_komunitas = k.id_komunitas
    LEFT JOIN wilayah w ON kw.id_wilayah = w.id_wilayah
    LEFT JOIN aturan_adat a ON k.id_komunitas = a.id_komunitas
    GROUP BY k.id_komunitas, w.id_wilayah, w.nama_wilayah, w.jenis_wilayah
    ORDER BY k.nama_komunitas ASC
";

$result = $conn->query($sql);

if (!$result) {
    sendError('Failed to execute query: ' . $conn->error, 500);
}

$komunitas_list = [];
while ($row = $result->fetch_assoc()) {
    $komunitas_list[] = [
        'id' => $row['id_komunitas'],
        'kode' => $row['kode_komunitas'],
        'nama' => $row['nama_komunitas'],
        'deskripsi' => $row['deskripsi'],
        'created_at' => $row['created_at'],
        'wilayah' => [
            'id' => $row['id_wilayah'],
            'nama' => $row['nama_wilayah'],
            'jenis' => $row['jenis_wilayah'],
        ],
        'jumlah_aturan' => intval($row['jumlah_aturan']),
    ];
}

$conn->close();

sendJSON([
    'success' => true,
    'data' => $komunitas_list,
    'count' => count($komunitas_list),
]);
