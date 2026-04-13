<?php
require_once __DIR__ . "/../../../config/db.php";

$incidentId = isset($_GET['incidentId']) ? trim($_GET['incidentId']) : '';

if ($incidentId) {
    $sql = "
        SELECT 
            dm.start_time,
            dm.end_time,
            dm.status AS mission_status,
            d.drone_name,
            d.drone_code,
            d.station,
            d.pilot_name,
            i.id AS incident_id,
            i.name AS incident_name,
            i.location AS incident_location
        FROM drone_missions dm
        LEFT JOIN drones d ON dm.drone_id = d.id
        LEFT JOIN incidents i ON dm.incident_id = i.id
        WHERE dm.incident_id = ?
    ";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $incidentId);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    $result = $conn->query("
        SELECT 
            dm.start_time,
            dm.end_time,
            dm.status AS mission_status,
            d.drone_name,
            d.drone_code,
            d.station,
            d.pilot_name,
            i.id AS incident_id,
            i.name AS incident_name,
            i.location AS incident_location
        FROM drone_missions dm
        LEFT JOIN drones d ON dm.drone_id = d.id
        LEFT JOIN incidents i ON dm.incident_id = i.id
    ");
}
?>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Drone Mission Report</title>

<link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>

<style>

@page {
    size: A4;
    margin: 10mm;
}

body {
    font-family: Arial;
    margin: 0 auto;
    width: 210mm;
}

h1 {
    text-align: center;
    font-size: 18px;
    margin-bottom: 20px;
}

.section {
    margin-top: 20px;
    margin-bottom: 20px;
    page-break-inside: avoid;
}

.section-title {
    font-weight: bold;
    border-bottom: 1px solid #000;
    padding-bottom: 5px;
    margin-bottom: 10px;
}

.row {
    display: flex;
    font-size: 13px;
    margin-bottom: 5px;
}

.label {
    width: 180px;
    font-weight: bold;
}

.value {
    flex: 1;
}

/* ✅ MAP FIX */
.map-box {
    width: 100%;
    height: 260px;
    border: 1px solid #000;
    overflow: hidden;
}

.leaflet-container {
    width: 100% !important;
}

/* ✅ PRINT FIX */
@media print {

    body {
        margin: 0;
        zoom: 0.9;
    }

    button {
        display: none;
    }

    .map-box {
        height: 240px !important;
    }
}

</style>
</head>

<body>

<h1>DRONE MISSION REPORT</h1>

<button onclick="window.print()">Print / Save PDF</button>

<?php
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {

        $gpsLogs = [];
        $gpsSql = "SELECT latitude, longitude FROM drone_gps_logs WHERE incident_id = ? ORDER BY timestamp ASC";

        $gpsStmt = $conn->prepare($gpsSql);
        $gpsStmt->bind_param("s", $row['incident_id']);
        $gpsStmt->execute();
        $gpsResult = $gpsStmt->get_result();

        while ($g = $gpsResult->fetch_assoc()) {
            $gpsLogs[] = [(float)$g['latitude'], (float)$g['longitude']];
        }
        $gpsStmt->close();
?>

<!-- INCIDENT -->
<div class="section">
    <div class="section-title">Incident Details</div>
    <div class="row"><div class="label">Name</div><div class="value"><?= $row['incident_name']; ?></div></div>
    <div class="row"><div class="label">Location</div><div class="value"><?= $row['incident_location']; ?></div></div>
</div>

<!-- DRONE -->
<div class="section">
    <div class="section-title">Drone & Pilot</div>
    <div class="row"><div class="label">Drone</div><div class="value"><?= $row['drone_name']." (".$row['drone_code'].")"; ?></div></div>
    <div class="row"><div class="label">Pilot</div><div class="value"><?= $row['pilot_name']; ?></div></div>
</div>

<!-- MISSION -->
<div class="section">
    <div class="section-title">Mission Details</div>
    <div class="row"><div class="label">Start Time</div><div class="value"><?= $row['start_time']; ?></div></div>
    <div class="row"><div class="label">End Time</div><div class="value"><?= $row['end_time']; ?></div></div>
    <div class="row"><div class="label">Status</div><div class="value"><?= $row['mission_status']; ?></div></div>
</div>

<!-- MAP -->
<?php if (!empty($gpsLogs)) { ?>
<div class="section">
    <div class="section-title">Flight Path</div>
    <div id="map-<?= $row['incident_id']; ?>" class="map-box"></div>
</div>

<script>
(function () {

    const path = <?= json_encode($gpsLogs); ?>;
    const mapId = "map-<?= $row['incident_id']; ?>";

    const map = L.map(mapId);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    L.polyline(path, { color: "black", weight: 4 }).addTo(map);

    // Start marker
    L.marker(path[0]).addTo(map);

    // Fit properly
    map.fitBounds(path, { padding: [30, 30] });

    function fixMap() {
        setTimeout(() => {
            map.invalidateSize();
            map.fitBounds(path, { padding: [30, 30] });
        }, 800);
    }

    fixMap();

    window.addEventListener('beforeprint', fixMap);
    window.addEventListener('afterprint', fixMap);

})();
</script>
<?php } ?>

<?php } } ?>

</body>
</html>