<?php
/**
 * API Endpoint: Get Kategori Adat (Categories)
 * Returns list of adat rule categories
 *
 * GET /baliguide-api/kategori.php
 */

require_once 'config.php';

$conn = getDBConnection();

$sql = "
    SELECT
        kat.id_kategori,
        kat.nama_kategori,
        kat.deskripsi,
        kat.created_at,
        COUNT(a.id_aturan) as jumlah_aturan
    FROM kategori_adat kat
    LEFT JOIN aturan_adat a ON kat.id_kategori = a.id_kategori
    GROUP BY kat.id_kategori
    ORDER BY kat.nama_kategori ASC
";

$result = $conn->query($sql);

if (!$result) {
    sendError('Failed to execute query: ' . $conn->error, 500);
}

$kategori_list = [];
while ($row = $result->fetch_assoc()) {
    $kategori_list[] = [
        'id' => $row['id_kategori'],
        'nama' => $row['nama_kategori'],
        'deskripsi' => $row['deskripsi'],
        'created_at' => $row['created_at'],
        'jumlah_aturan' => intval($row['jumlah_aturan']),
    ];
}

$conn->close();

sendJSON([
    'success' => true,
    'data' => $kategori_list,
    'count' => count($kategori_list),
]);
