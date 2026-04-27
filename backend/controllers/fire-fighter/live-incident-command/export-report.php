<?php
header("Content-Type: text/html");
header("Content-Disposition: inline; filename=report.pdf");

require_once __DIR__ . "/../../../config/db.php";

$incidentId = isset($_GET['incidentId']) ? trim($_GET['incidentId']) : '';

if ($incidentId) {
    $sql = "
        SELECT
            dm.start_time, dm.end_time, dm.status AS mission_status,
            d.drone_name, d.drone_code, d.station, d.pilot_name,
            i.id AS incident_id, i.name AS incident_name, i.location AS incident_location,
            i.stationName AS incident_station_name
        FROM drone_missions dm
        LEFT JOIN drones d     ON dm.drone_id    = d.id
        LEFT JOIN incidents i  ON dm.incident_id = i.id
        WHERE dm.incident_id = ?
    ";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $incidentId);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    $result = $conn->query("
        SELECT
            dm.start_time, dm.end_time, dm.status AS mission_status,
            d.drone_name, d.drone_code, d.station, d.pilot_name,
            i.id AS incident_id, i.name AS incident_name, i.location AS incident_location,
            i.stationName AS incident_station_name
        FROM drone_missions dm
        LEFT JOIN drones d     ON dm.drone_id    = d.id
        LEFT JOIN incidents i  ON dm.incident_id = i.id
    ");
}

function calcDuration($start, $end) {
    if (!$start || !$end) return '&mdash;';
    $s = new DateTime($start);
    $e = new DateTime($end);
    $d = $s->diff($e);
    return sprintf('%02d h %02d min', $d->h + $d->days * 24, $d->i);
}

function statusStyle($status) {
    switch (strtolower(trim($status))) {
        case 'completed': return 'background:#d1fae5;color:#065f46;';
        case 'active':    return 'background:#dbeafe;color:#1e3a8a;';
        case 'aborted':   return 'background:#fee2e2;color:#7f1d1d;';
        default:          return 'background:#fef3c7;color:#78350f;';
    }
}

function statusColor($status) {
    switch (strtolower(trim($status))) {
        case 'completed': return '#065f46';
        case 'active':    return '#1e3a8a';
        case 'aborted':   return '#7f1d1d';
        default:          return '#78350f';
    }
}

$docRef = 'MH/UAS/' . date('Y') . '/' . strtoupper(substr(md5(date('Y-m-d')), 0, 6));
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>UAS Drone Mission Report &mdash; Govt. of Maharashtra</title>
<link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
<style>

@page { size: A4; margin: 16mm 8mm ; }
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
    font-family: Arial, Helvetica, sans-serif;
    background: #dde1e8;
    color: #111827;
    font-size: 12px;
}

.paper {
    width: 250mm;
    min-height: auto;
    height: auto;
    margin: 0 auto;
    background: #ffffff;
    border: 2px solid #003366;
    outline: 1.5px solid #FF6200;
    outline-offset: -5px;
}

.print-bar {
    display: flex;
    justify-content: flex-end;
    padding: 8px 14px 6px;
}
.print-btn {
    background: #003366;
    color: #ffffff;
    border: none;
    font-family: Arial, sans-serif;
    font-size: 11px;
    font-weight: bold;
    letter-spacing: 1px;
    padding: 7px 18px;
    cursor: pointer;
    text-transform: uppercase;
}
.print-btn:hover { background: #FF6200; }

.gov-header { background: #001A33; padding: 10px 14mm 9px; }
.gov-header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}
.gov-dept {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 15px;
    font-weight: bold;
    color: #ffffff;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    text-align: center;
    line-height: 1.2;
}
.gov-sub {
    font-family: 'Courier New', Courier, monospace;
    font-size: 9px;
    color: #ffffff;
    letter-spacing: 1.5px;
    text-align: center;
    margin-top: 3px;
}

.tc-bar { display: flex; height: 6px; }
.tc-s { flex: 1; background: #FF6200; }
.tc-w { flex: 1; background: #ffffff; }
.tc-g { flex: 1; background: #138808; }

.meta-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 14mm;
    border-bottom: 1px solid #CBD5E1;
    background: #F0F4F8;
}
.meta-ref { font-family: 'Courier New', Courier, monospace; font-size: 8.5px; color: #003366; }
.meta-title { font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: bold; color: #003366; letter-spacing: 2px; text-transform: uppercase; }
.meta-class { background: #FF6200; color: #ffffff; font-family: Arial, sans-serif; font-size: 7.5px; font-weight: bold; padding: 3px 9px; text-transform: uppercase; letter-spacing: 1px; }

.missions-wrap { padding: 10px 14mm 0; }

.mission-block { border: 1px solid #CBD5E1; margin-bottom: 16px; page-break-inside: avoid; }

.mission-title-bar {
    background: #001A33;
    padding: 6px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}
.m-ref { font-family: 'Courier New', Courier, monospace; font-size: 10px; color: #d1fae5; white-space: nowrap; }
.m-name { font-family: Arial, Helvetica, sans-serif; font-size: 12px; font-weight: bold; color: #ffffff; letter-spacing: 1.5px; text-transform: uppercase; flex: 1; text-align: center; }
.status-badge { font-family: Arial, sans-serif; font-size: 8px; font-weight: bold; letter-spacing: 0.8px; padding: 3px 9px; text-transform: uppercase; white-space: nowrap; border-radius: 2px; }

.sec-hdr { background: #003366; color: #ffffff; font-family: Arial, Helvetica, sans-serif; font-size: 9.5px; font-weight: bold; letter-spacing: 1.8px; text-transform: uppercase; padding: 4px 10px; }

.info-tbl { width: 100%; border-collapse: collapse; border-left: 1px solid #CBD5E1; border-top: 1px solid #CBD5E1; table-layout: fixed; }
.info-tbl td { border-right: 1px solid #CBD5E1; border-bottom: 1px solid #CBD5E1; vertical-align: top; padding: 0; }

.lbl { display: block; background: #F0F4F8; font-family: 'Courier New', Courier, monospace; font-size: 8.5px; font-weight: 900; color: #003366; letter-spacing: 1.2px; text-transform: uppercase; padding: 3px 8px 2px; border-bottom: 1px solid #CBD5E1; }
.val { display: block; font-family: Arial, Helvetica, sans-serif; font-size: 12px; font-weight: bold; color: #111827; padding: 3px 8px 5px; line-height: 1.3; }
.val.mono { font-family: 'Courier New', Courier, monospace; font-size: 10.5px; color: #003366; }
.val.accent { color: #FF6200; }

.info-tbl td .val,
.info-tbl td .val.mono {
    word-break: break-word;
    overflow-wrap: break-word;
    white-space: normal;
}

/* Firefighter list */
.ff-list { padding: 5px 8px 7px; font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #111827; line-height: 1.8; }
.ff-item { display: inline-block; margin-right: 20px; }
.ff-name { font-weight: bold; }
.ff-desig { color: #6B7280; font-size: 10px; }

/* Map */
.map-wrap { position: relative; border: 1px solid #CBD5E1; overflow: hidden; }
.map-lbl {
    position: absolute; top: 8px; left: 8px; z-index: 999;
    background: rgba(0,26,51,0.85); color: #ffffff;
    font-family: 'Courier New', Courier, monospace; font-size: 8px;
    letter-spacing: 1.2px; padding: 3px 9px; text-transform: uppercase; pointer-events: none;
}
.map-box { width: 100%; height: 240px; }

.map-legend {
    display: flex; gap: 16px; padding: 6px 10px;
    background: #F0F4F8; border-top: 1px solid #CBD5E1;
    font-family: 'Courier New', Courier, monospace; font-size: 8px; color: #003366; letter-spacing: 0.8px;
}
.legend-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 3px rgba(0,0,0,0.4); vertical-align: middle; margin-right: 5px; }

/* Footer */
.gov-footer { background: #001A33; padding: 6px 14mm; display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
.gov-footer span { font-family: 'Courier New', Courier, monospace; font-size: 7.5px; color: #FFD580; letter-spacing: 0.8px; }
.gov-footer .fc { color: #A8C4E0; font-size: 7px; flex: 1; text-align: center; }

.no-data { text-align: center; padding: 40px; font-family: 'Courier New', Courier, monospace; color: #6B7280; letter-spacing: 2px; font-size: 11px; }
.no-gps { padding: 14px 10px; font-family: 'Courier New', monospace; font-size: 9px; color: #6B7280; letter-spacing: 1px; border-top: 1px solid #CBD5E1; }

@media print {
    body { background: #ffffff; }
    .print-bar { display: none !important; }
    .paper { border: none; outline: none; margin: 0; width: 100%; }
    .map-box { height: 200px !important; }
    .mission-block { page-break-inside: auto; break-inside: auto; }
    .gov-header, .gov-footer, .mission-title-bar, .sec-hdr,
    .lbl, .meta-bar, .tc-bar, .tc-s, .tc-w, .tc-g,
    .status-badge, .meta-class, .map-legend {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
    },
    .mission-title-bar,
    .sec-hdr {
        page-break-after: avoid;
    }
}
</style>
</head>
<body>
<div class="paper">

    <div class="print-bar">
        <button class="print-btn" onclick="window.print()">Print / Export PDF</button>
    </div>

    <!-- HEADER -->
    <div class="gov-header">
        <div class="gov-header-inner">
            <div style="flex-shrink:0;width:44px;height:44px;">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
                    <circle cx="50" cy="50" r="46" fill="none" stroke="#ffffff" stroke-width="4"/>
                    <circle cx="50" cy="50" r="9" fill="#ffffff"/>
                    <?php for ($i = 0; $i < 24; $i++):
                        $a  = deg2rad($i * 15);
                        $x1 = round(50 + 11 * cos($a), 2); $y1 = round(50 + 11 * sin($a), 2);
                        $x2 = round(50 + 44 * cos($a), 2); $y2 = round(50 + 44 * sin($a), 2);
                    ?>
                    <line x1="<?= $x1 ?>" y1="<?= $y1 ?>" x2="<?= $x2 ?>" y2="<?= $y2 ?>" stroke="#ffffff" stroke-width="1.6"/>
                    <?php endfor; ?>
                </svg>
            </div>

            <div style="flex:1;">
                <div class="gov-dept">Unmanned Aerial Systems Division</div>
                <div class="gov-sub">AGNI SURAKSHA VIBHAG &nbsp;|&nbsp; Pune DISTRICT &nbsp;|&nbsp; OFFICIAL OPERATIONAL REPORT</div>
            </div>

            <div style="flex-shrink:0;display:flex;align-items:center;justify-content:center;">
                <div style="background:#ffffff;border-radius:6px;padding:3px 6px;display:flex;align-items:center;">
                    <img src="/innoverlogo.png" alt="Logo" style="height:24px;width:auto;"/>
                </div>
            </div>
        </div>
    </div>

    <div class="tc-bar"><div class="tc-s"></div><div class="tc-w"></div><div class="tc-g"></div></div>

    <div class="meta-bar">
        <span class="meta-ref">DOC REF: <?= htmlspecialchars($docRef) ?></span>
        <span class="meta-title">Drone Mission Report</span>
        <span class="meta-class">Official Record</span>
    </div>

    <!-- MISSIONS -->
    <div class="missions-wrap">
    <?php
    $missionIdx = 0;
    if ($result && $result->num_rows > 0):
        while ($row = $result->fetch_assoc()):
            $missionIdx++;

                    $actionLogs = [];

        $logStmt = $conn->prepare("
            SELECT timestamp, ip, action, response
            FROM drone_action_logs
            WHERE incident_id = ?
            ORDER BY timestamp ASC
        ");

        $logStmt->bind_param("s", $row['incident_id']);
        $logStmt->execute();
        $logResult = $logStmt->get_result();

        while ($log = $logResult->fetch_assoc()) {
            $actionLogs[] = $log;
        }

        $logStmt->close();

            $duration    = calcDuration($row['start_time'], $row['end_time']);
            $statusUpper = strtoupper($row['mission_status'] ?? 'UNKNOWN');
            $sBadge      = statusStyle($row['mission_status']);
            $sColor      = statusColor($row['mission_status']);

            // ── GPS track from drone_gps_logs (this drone + this incident) ──
            $gpsLogs = [];
            $gpsStmt = $conn->prepare(
                "SELECT latitude, longitude
                 FROM drone_gps_logs
                 WHERE incident_id = ? AND drone_code = ?
                 ORDER BY timestamp ASC"
            );
            $gpsStmt->bind_param("ss", $row['incident_id'], $row['drone_code']);
            $gpsStmt->execute();
            $gpsResult = $gpsStmt->get_result();
            while ($g = $gpsResult->fetch_assoc()) {
                $gpsLogs[] = [(float)$g['latitude'], (float)$g['longitude']];
            }
            $gpsStmt->close();

         // ── Fire Images (NEW) ──
            $fireImages = [];

            $imgStmt = $conn->prepare("
                SELECT image_url, confidence, timestamp
                FROM fire_images
                WHERE incident_id = ?
                ORDER BY confidence DESC
                LIMIT 6
            ");

            $imgStmt->bind_param("s", $row['incident_id']);
            $imgStmt->execute();
            $imgResult = $imgStmt->get_result();

            while ($img = $imgResult->fetch_assoc()) {
                $fireImages[] = $img;
            }

            $imgStmt->close();

            // ── Firefighters: same station, role = Fire Station Command Control ──
            $firefighters = [];
            if (!empty($row['incident_station_name'])) {
                $ffStmt = $conn->prepare(
                    "SELECT fullName, designation
                     FROM users
                     WHERE station = ? AND role = 'Fire Station Command Control' AND status = 1"
                );
                $ffStmt->bind_param("s", $row['incident_station_name']);
                $ffStmt->execute();
                $ffResult = $ffStmt->get_result();
                while ($ff = $ffResult->fetch_assoc()) {
                    $firefighters[] = $ff;
                }
                $ffStmt->close();
            }
    ?>

    <div class="mission-block">

        <!-- Title bar -->
        <div class="mission-title-bar">
            <span class="m-ref">MISSION #<?= str_pad($missionIdx, 3, '0', STR_PAD_LEFT) ?> &nbsp;/&nbsp; <?= htmlspecialchars($row['incident_id']) ?></span>
            <span class="m-name"><?= htmlspecialchars($row['incident_name']) ?></span>
            <span class="status-badge" style="<?= $sBadge ?>"><?= $statusUpper ?></span>
        </div>

        <!-- A. Incident & Asset Details -->
        <div class="sec-hdr">A. &nbsp; Incident &amp; Asset Details</div>
        <table class="info-tbl">
            <tr>
                <td style="width:34%"><span class="lbl">Incident Name</span><span class="val"><?= htmlspecialchars($row['incident_name']) ?></span></td>
                <td style="width:33%"><span class="lbl">Location</span><span class="val"><?= htmlspecialchars($row['incident_location']) ?></span></td>
                <td style="width:33%"><span class="lbl">Incident ID</span><span class="val mono"><?= htmlspecialchars($row['incident_id']) ?></span></td>
            </tr>
            <tr>
                <td><span class="lbl">Drone Name</span><span class="val"><?= htmlspecialchars($row['drone_name']) ?></span></td>
                <td><span class="lbl">Drone Code</span><span class="val mono"><?= htmlspecialchars($row['drone_code']) ?></span></td>
                <td><span class="lbl">Home Station</span><span class="val"><?= htmlspecialchars($row['station']) ?></span></td>
            </tr>
        </table>

        <!-- B. Pilot & Mission Summary -->
        <div class="sec-hdr">B. &nbsp; Pilot &amp; Mission Summary</div>
        <table class="info-tbl">
            <tr>
                <td style="width:50%"><span class="lbl">Pilot / Remote Pilot in Command</span><span class="val"><?= htmlspecialchars($row['pilot_name']) ?></span></td>
                <td style="width:50%"><span class="lbl">Mission Status</span><span class="val" style="color:<?= $sColor ?>"><?= $statusUpper ?></span></td>
            </tr>
        </table>

        <!-- C. Firefighters on Duty -->
        <?php if (!empty($firefighters)): ?>
        <div class="sec-hdr">C. &nbsp; Firefighters on Duty &mdash; <?= htmlspecialchars($row['incident_station_name'] ?? '') ?></div>
        <table class="info-tbl">
            <tr>
                <td>
                    <span class="lbl">Fire Station Command Control Personnel</span>
                    <div class="ff-list">
                        <?php foreach ($firefighters as $idx => $ff): ?>
                        <span class="ff-item">
                            <?= ($idx + 1) ?>. <span class="ff-name"><?= htmlspecialchars($ff['fullName']) ?></span>
                            <?php if (!empty($ff['designation'])): ?>
                                <span class="ff-desig">&nbsp;(<?= htmlspecialchars($ff['designation']) ?>)</span>
                            <?php endif; ?>
                        </span>
                        <?php endforeach; ?>
                    </div>
                </td>
            </tr>
        </table>
        <?php endif; ?>

        <!-- D. Operational Timeline -->
        <div class="sec-hdr">D. &nbsp; Operational Timeline</div>
        <table class="info-tbl">
            <tr>
                <td style="width:34%">
                    <span class="lbl">Departure / Start Time</span>
                    <span class="val mono"><?= $row['start_time'] ? date('d M Y', strtotime($row['start_time'])) : '&mdash;' ?></span>
                    <span class="val mono accent" style="padding-top:0;"><?= $row['start_time'] ? date('H:i:s', strtotime($row['start_time'])) . ' hrs' : '' ?></span>
                </td>
                <td style="width:33%">
                    <span class="lbl">Return / End Time</span>
                    <span class="val mono"><?= $row['end_time'] ? date('d M Y', strtotime($row['end_time'])) : '&mdash;' ?></span>
                    <span class="val mono accent" style="padding-top:0;"><?= $row['end_time'] ? date('H:i:s', strtotime($row['end_time'])) . ' hrs' : '' ?></span>
                </td>
                <td style="width:33%">
                    <span class="lbl">Total Mission Duration</span>
                    <span class="val mono accent" style="font-size:14px;"><?= $duration ?></span>
                </td>
            </tr>
        </table>

        <!-- E. Flight Path — Actual GPS Track -->
        <div class="sec-hdr">E. &nbsp; Flight Path &mdash; Actual GPS Track<?= !empty($gpsLogs) ? ' (' . count($gpsLogs) . ' points)' : '' ?></div>
        <?php if (!empty($gpsLogs)): ?>
        <div class="map-wrap">
            <div class="map-lbl">LIVE GPS TRACK &nbsp;&bull;&nbsp; <?= count($gpsLogs) ?> PTS &nbsp;&bull;&nbsp; <?= htmlspecialchars($row['drone_code']) ?></div>
            <div id="map-<?= $row['incident_id'] ?>" class="map-box"></div>
        </div>
        <div class="map-legend">
            <span><span class="legend-dot" style="background:#003366;"></span>START POINT</span>
            <span><span class="legend-dot" style="background:#FF6200;"></span>LAST KNOWN POSITION</span>
            <span style="margin-left:auto">DRONE: <?= htmlspecialchars($row['drone_code']) ?></span>
        </div>
        <script>
        (function () {
            var path  = <?= json_encode($gpsLogs) ?>;
            var mapId = "map-<?= $row['incident_id'] ?>";

            var map = L.map(mapId, { zoomControl: true, attributionControl: false });
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);

            var line = L.polyline(path, { color: '#003366', weight: 3, opacity: 0.9 }).addTo(map);

            // Start — blue dot
            L.marker(path[0], { icon: L.divIcon({
                className: '',
                html: '<div style="width:13px;height:13px;background:#003366;border:2px solid #fff;border-radius:50%;box-shadow:0 0 5px rgba(0,0,0,.5)"></div>',
                iconAnchor: [6, 6]
            })}).addTo(map).bindTooltip('Start', { permanent: true, direction: 'top', offset: [0, -10] });

            // Last position — orange dot
            if (path.length > 1) {
                L.marker(path[path.length - 1], { icon: L.divIcon({
                    className: '',
                    html: '<div style="width:13px;height:13px;background:#FF6200;border:2px solid #fff;border-radius:50%;box-shadow:0 0 5px rgba(0,0,0,.5)"></div>',
                    iconAnchor: [6, 6]
                })}).addTo(map).bindTooltip('Last Position', { permanent: true, direction: 'top', offset: [0, -10] });
            }

            function fit() {
                setTimeout(function () {
                    map.invalidateSize();
                    map.fitBounds(line.getBounds(), { padding: [50, 50] });
                }, 600);
            }
            fit();
            window.addEventListener('beforeprint', fit);
            window.addEventListener('afterprint', fit);
        })();
        </script>
        <?php else: ?>
        <div class="no-gps">NO GPS DATA LOGGED FOR THIS MISSION YET</div>
        <?php endif; ?>

<!-- F. Drone Action Logs -->
<div class="sec-hdr">F. &nbsp; Drone Action Logs</div>

<?php if (!empty($actionLogs)): ?>
<table class="info-tbl" style="table-layout:fixed; width:100%;">
    <colgroup>
        <col style="width:20%">
        <col style="width:15%">
        <col style="width:20%">
        <col style="width:45%">
    </colgroup>
    <tr>
        <td><span class="lbl">Time</span></td>
        <td><span class="lbl">IP</span></td>
        <td><span class="lbl">Action</span></td>
        <td><span class="lbl">Response</span></td>
    </tr>
    <?php foreach ($actionLogs as $log): ?>
    <tr>
        <td><span class="val mono" style="word-break:break-all;"><?= htmlspecialchars($log['timestamp']) ?></span></td>
        <td><span class="val mono" style="word-break:break-all;"><?= htmlspecialchars($log['ip']) ?></span></td>
        <td><span class="val" style="word-break:break-word;"><?= htmlspecialchars($log['action']) ?></span></td>
        <td><span class="val" style="word-break:break-word; overflow-wrap:break-word;"><?= htmlspecialchars($log['response']) ?></span></td>
    </tr>
    <?php endforeach; ?>
</table>
<?php else: ?>
<div class="no-gps">NO ACTION LOGS FOUND</div>
<?php endif; ?>

    </div><!-- /mission-block -->

    <?php endwhile;
    else: ?>
    <div class="no-data">NO MISSION RECORDS FOUND</div>
    <?php endif; ?>
    
    <!-- G. Fire Detection Images -->
<div class="sec-hdr">G. &nbsp; Fire Detection Images</div>

<?php if (!empty($fireImages)): ?>

<style>
.fire-img-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.fire-img-box {
    width: 48%;
}

.fire-img-box img {
    width: 100%;
    height: 180px;
    object-fit: cover;
    border: 1px solid #CBD5E1;
}

.fire-img-meta {
    font-size: 9px;
    font-family: Courier;
    margin-top: 4px;
}
</style>

<div class="fire-img-grid">

    <?php foreach ($fireImages as $img): ?>
        <div class="fire-img-box">

            <img src="<?= htmlspecialchars($img['image_url']) ?>">

            <div class="fire-img-meta">
                <strong>Confidence:</strong> <?= round($img['confidence'] * 100, 2) ?>%<br>
                <strong>Time:</strong> <?= date('d M Y H:i:s', $img['timestamp']/1000) ?>
            </div>

        </div>
    <?php endforeach; ?>

</div>

<?php else: ?>
<div class="no-gps">NO FIRE IMAGES FOUND</div>
<?php endif; ?>
    </div><!-- /missions-wrap -->
        
    <!-- FOOTER -->
    <div class="gov-footer">
        <span>Total Missions: <?= $missionIdx ?> &nbsp;|&nbsp; <?= htmlspecialchars($docRef) ?></span>
        <span class="fc">CONFIDENTIAL &mdash; FOR OFFICIAL USE ONLY &mdash; GOVT. OF MAHARASHTRA</span>
        <span>UAS DIVISION &nbsp;&bull;&nbsp; <?= date('Y') ?></span>
    </div>

</div><!-- /paper -->
</body>
</html>