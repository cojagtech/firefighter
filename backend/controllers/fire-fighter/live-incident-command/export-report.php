<?php
require_once __DIR__ . "/../../../config/db.php";

$incidentId = isset($_GET['incidentId']) ? trim($_GET['incidentId']) : '';

// Correct JOIN (IMPORTANT FIX APPLIED)
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
            d.pilot_email,
            d.pilot_phone,

            i.id AS incident_id,
            i.name AS incident_name,
            i.location AS incident_location,
            i.latitude,
            i.longitude,
            i.timeReported,
            i.status AS incident_status

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
    $sql = "
        SELECT 
            dm.start_time,
            dm.end_time,
            dm.status AS mission_status,

            d.drone_name,
            d.drone_code,
            d.station,
            d.pilot_name,
            d.pilot_email,
            d.pilot_phone,

            i.id AS incident_id,
            i.name AS incident_name,
            i.location AS incident_location,
            i.latitude,
            i.longitude,
            i.timeReported,
            i.status AS incident_status

        FROM drone_missions dm
        LEFT JOIN drones d ON dm.drone_id = d.id
        LEFT JOIN incidents i ON dm.incident_id = i.id
    ";
    $result = $conn->query($sql);
}
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Drone Mission Report</title>
<style>
body { font-family: Arial; margin: 30px; color: #333; }
h1 { text-align: center; }
.section { border: 1px solid #888; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
.section h3 { background: #2196F3; color: white; padding: 8px; margin: -15px -15px 15px -15px; }
.field { display: flex; margin-bottom: 6px; }
.field label { width: 180px; font-weight: bold; }
.status { padding: 3px 8px; border-radius: 4px; color: #fff; }
.status-completed { background: #4CAF50; }
.status-ongoing { background: #FFC107; }
.status-failed { background: #F44336; }
button { margin-bottom: 20px; }
@media print { button { display:none; } }
body.hidden { display:none; }
</style>
</head>
<body class="hidden">

<h1>🚁 Drone Mission Report</h1>

<button onclick="window.print()">🖨️ Download PDF</button>

<?php
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {

        $start = strtotime($row['start_time']);
        $end = $row['end_time'] ? strtotime($row['end_time']) : time();
        $duration = gmdate("H:i:s", $end - $start);

        $statusClass = 'status-ongoing';
        if (strtolower($row['mission_status']) === 'completed') $statusClass = 'status-completed';
        elseif (strtolower($row['mission_status']) === 'failed') $statusClass = 'status-failed';
?>

<!-- 🔵 INCIDENT SECTION -->
<div class="section">
    <h3>📍 Incident Information</h3>
    <div class="field"><label>Incident Name:</label> <div><?php echo $row['incident_name']; ?></div></div>
    <div class="field"><label>Location:</label> <div><?php echo $row['incident_location']; ?></div></div>
    <div class="field"><label>Coordinates:</label> <div><?php echo $row['latitude']; ?>, <?php echo $row['longitude']; ?></div></div>
    <div class="field"><label>Reported Time:</label> <div><?php echo $row['timeReported']; ?></div></div>
    <div class="field"><label>Status:</label> <div><?php echo $row['incident_status']; ?></div></div>
</div>

<!-- 🟢 DRONE + PILOT SECTION -->
<div class="section">
    <h3>🚁 Drone & Pilot Information</h3>
    <div class="field"><label>Drone:</label> 
        <div>
            <?php echo $row['drone_name'] 
                ? $row['drone_name']." (".$row['drone_code'].")" 
                : "Unassigned Drone"; ?>
        </div>
    </div>
    <div class="field"><label>Station:</label> <div><?php echo $row['station'] ?: 'N/A'; ?></div></div>

    <div class="field"><label>Pilot Name:</label> <div><?php echo $row['pilot_name'] ?: 'N/A'; ?></div></div>
</div>

<!-- 🟠 MISSION SECTION -->
<div class="section">
    <h3>🛰️ Mission Details</h3>
    <div class="field"><label>Start Time:</label> <div><?php echo $row['start_time']; ?></div></div>
    <div class="field"><label>End Time:</label> <div><?php echo $row['end_time'] ?: '-'; ?></div></div>
    <div class="field"><label>Status:</label> 
        <div class="status <?php echo $statusClass; ?>">
            <?php echo ucfirst($row['mission_status']); ?>
        </div>
    </div>
    <div class="field"><label>Duration:</label> <div><?php echo $duration; ?></div></div>
</div>

<?php
    }
} else {
    echo "<p>No missions found</p>";
}
$conn->close();
?>

<script>
window.addEventListener('DOMContentLoaded', () => {
    document.body.classList.remove('hidden');
    window.print();
});
</script>

</body>
</html>