<?php
/**
 * API Endpoint: Wilayah Management
 * - GET: List all wilayah (Bali kabupaten or specific parent/type)
 * - POST / PUT: Update coordinates of a wilayah
 *
 * GET /baliguide-api/wilayah.php
 * POST /baliguide-api/wilayah.php
 */

require_once 'config.php';

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Handle GET request
if ($method === 'GET') {
    $parent_id = isset($_GET['parent_id']) ? intval($_GET['parent_id']) : 17; // Default to Bali (17)
    $jenis = isset($_GET['jenis']) ? $conn->real_escape_string($_GET['jenis']) : 'KABUPATEN_KOTA';

    $sql = "
        SELECT
            w.id_wilayah AS id,
            w.parent_id,
            w.kode_wilayah,
            w.nama_wilayah AS nama,
            w.jenis_wilayah AS jenis,
            w.deskripsi,
            w.latitude,
            w.longitude,
            COUNT(DISTINCT aa.id_aturan) AS aturan_count
        FROM wilayah w
        LEFT JOIN wilayah kec ON kec.parent_id = w.id_wilayah AND kec.jenis_wilayah = 'KECAMATAN'
        LEFT JOIN komunitas_wilayah kw ON kw.id_wilayah = kec.id_wilayah
        LEFT JOIN aturan_adat aa ON aa.id_komunitas = kw.id_komunitas
        WHERE (w.parent_id = {$parent_id} OR w.id_wilayah = {$parent_id})
    ";

    if (!empty($jenis)) {
        $sql .= " AND (w.jenis_wilayah = '{$jenis}' OR w.id_wilayah = {$parent_id})";
    }

    $sql .= " GROUP BY w.id_wilayah, w.parent_id, w.kode_wilayah, w.nama_wilayah, w.jenis_wilayah, w.deskripsi, w.latitude, w.longitude ORDER BY w.id_wilayah ASC";

    $result = $conn->query($sql);
    if (!$result) {
        sendError('Failed to fetch wilayah: ' . $conn->error, 500);
    }

    $list = [];
    while ($row = $result->fetch_assoc()) {
        $lat = $row['latitude'] !== null ? floatval($row['latitude']) : null;
        $lng = $row['longitude'] !== null ? floatval($row['longitude']) : null;
        $list[] = [
            'id' => intval($row['id']),
            'parent_id' => $row['parent_id'] !== null ? intval($row['parent_id']) : null,
            'kode' => $row['kode_wilayah'],
            'nama' => $row['nama'],
            'jenis' => $row['jenis'],
            'deskripsi' => $row['deskripsi'],
            'latitude' => $lat,
            'longitude' => $lng,
            'aturan_count' => intval($row['aturan_count']),
            'coordinates' => ($lat !== null && $lng !== null) ? ['lat' => $lat, 'lng' => $lng] : null,
        ];
    }

    $conn->close();
    sendJSON([
        'success' => true,
        'data' => $list,
        'count' => count($list),
    ]);
}

// Handle POST/PUT update coordinates
if ($method === 'POST' || $method === 'PUT') {
    $inputJSON = file_get_contents('php://input');
    $data = json_decode($inputJSON, true);

    if (!$data) {
        $data = $_POST;
    }

    $id_wilayah = isset($data['id']) ? intval($data['id']) : (isset($data['id_wilayah']) ? intval($data['id_wilayah']) : 0);
    $lat = isset($data['latitude']) ? floatval($data['latitude']) : (isset($data['lat']) ? floatval($data['lat']) : null);
    $lng = isset($data['longitude']) ? floatval($data['longitude']) : (isset($data['lng']) ? floatval($data['lng']) : null);

    if ($id_wilayah <= 0) {
        sendError('Invalid or missing wilayah ID (id is required).', 400);
    }

    if ($lat === null || $lng === null || !is_numeric($lat) || !is_numeric($lng)) {
        sendError('Invalid latitude or longitude.', 400);
    }

    $stmt = $conn->prepare("UPDATE wilayah SET latitude = ?, longitude = ? WHERE id_wilayah = ?");
    if (!$stmt) {
        sendError('Prepare statement failed: ' . $conn->error, 500);
    }

    $stmt->bind_param("ddi", $lat, $lng, $id_wilayah);
    $success = $stmt->execute();

    if (!$success) {
        sendError('Failed to update coordinates: ' . $stmt->error, 500);
    }

    // Fetch updated row
    $selectStmt = $conn->prepare("SELECT id_wilayah AS id, nama_wilayah AS nama, jenis_wilayah AS jenis, latitude, longitude FROM wilayah WHERE id_wilayah = ?");
    $selectStmt->bind_param("i", $id_wilayah);
    $selectStmt->execute();
    $row = $selectStmt->get_result()->fetch_assoc();

    $stmt->close();
    $selectStmt->close();
    $conn->close();

    sendJSON([
        'success' => true,
        'message' => 'Coordinates updated successfully',
        'data' => [
            'id' => intval($row['id']),
            'nama' => $row['nama'],
            'jenis' => $row['jenis'],
            'latitude' => floatval($row['latitude']),
            'longitude' => floatval($row['longitude']),
            'coordinates' => [
                'lat' => floatval($row['latitude']),
                'lng' => floatval($row['longitude']),
            ]
        ],
    ]);
}

sendError('Method not allowed', 405);
