<?php
/**
 * API Endpoint: Get Wilayah with Aturan Count
 * Returns list of regions (kabupaten level in Bali) with their aturan count and coordinates from db_adatnusa
 *
 * GET /baliguide-api/wilayah-aturan.php
 */

require_once 'config.php';

$conn = getDBConnection();

// Query all Bali kabupaten (parent_id = 17) joined with rules count and coordinates from table wilayah
$sql = "
    SELECT
        kab.id_wilayah,
        kab.nama_wilayah AS kabupaten,
        'Bali' AS provinsi,
        kab.latitude,
        kab.longitude,
        COUNT(DISTINCT aa.id_aturan) AS jumlah_aturan,
        GROUP_CONCAT(DISTINCT kec.nama_wilayah ORDER BY kec.nama_wilayah SEPARATOR ', ') AS kecamatan_list
    FROM wilayah kab
    LEFT JOIN wilayah kec ON kec.parent_id = kab.id_wilayah AND kec.jenis_wilayah = 'KECAMATAN'
    LEFT JOIN komunitas_wilayah kw ON kw.id_wilayah = kec.id_wilayah
    LEFT JOIN aturan_adat aa ON aa.id_komunitas = kw.id_komunitas
    WHERE kab.parent_id = 17 AND kab.jenis_wilayah = 'KABUPATEN_KOTA'
    GROUP BY kab.id_wilayah, kab.nama_wilayah, kab.latitude, kab.longitude
    ORDER BY jumlah_aturan DESC, kab.nama_wilayah ASC
";

$result = $conn->query($sql);

if (!$result) {
    sendError('Failed to execute query: ' . $conn->error, 500);
}

// Fallback coordinate mapping in case DB values are not yet set
$default_coords = [
    'Kabupaten Bangli' => ['lat' => -8.4543, 'lng' => 115.3549],
    'Kabupaten Buleleng' => ['lat' => -8.1120, 'lng' => 115.0882],
    'Kabupaten Gianyar' => ['lat' => -8.5445, 'lng' => 115.3256],
    'Kabupaten Jembrana' => ['lat' => -8.3585, 'lng' => 114.6444],
    'Kabupaten Karangasem' => ['lat' => -8.4475, 'lng' => 115.6141],
    'Kabupaten Klungkung' => ['lat' => -8.5366, 'lng' => 115.4050],
    'Kabupaten Tabanan' => ['lat' => -8.5411, 'lng' => 115.1252],
    'Kabupaten Badung' => ['lat' => -8.5819, 'lng' => 115.1771],
    'Kota Denpasar' => ['lat' => -8.6705, 'lng' => 115.2126],
];

$wilayah_list = [];
while ($row = $result->fetch_assoc()) {
    $kabupaten = $row['kabupaten'];

    $lat = $row['latitude'] !== null ? floatval($row['latitude']) : ($default_coords[$kabupaten]['lat'] ?? -8.4095);
    $lng = $row['longitude'] !== null ? floatval($row['longitude']) : ($default_coords[$kabupaten]['lng'] ?? 115.1889);

    $wilayah_list[] = [
        'id' => intval($row['id_wilayah']),
        'kabupaten' => $kabupaten,
        'provinsi' => $row['provinsi'],
        'latitude' => $lat,
        'longitude' => $lng,
        'jumlah_aturan' => intval($row['jumlah_aturan']),
        'kecamatan' => !empty($row['kecamatan_list']) ? explode(', ', $row['kecamatan_list']) : [],
        'coordinates' => [
            'lat' => $lat,
            'lng' => $lng,
        ],
    ];
}

$conn->close();

sendJSON([
    'success' => true,
    'data' => $wilayah_list,
    'count' => count($wilayah_list),
]);
