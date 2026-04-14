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
    fs.latitude  AS station_lat,  fs.longitude  AS station_lng,
    i.id AS incident_id, i.name AS incident_name, i.location AS incident_location,
    i.latitude  AS incident_lat, i.longitude  AS incident_lng
FROM drone_missions dm
LEFT JOIN drones d       ON dm.drone_id    = d.id
LEFT JOIN fire_station fs ON fs.station_name = d.station
LEFT JOIN incidents i    ON dm.incident_id = i.id
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
            d.latitude  AS station_lat,  d.longitude  AS station_lng,
            i.id AS incident_id, i.name AS incident_name, i.location AS incident_location,
            i.latitude  AS incident_lat, i.longitude  AS incident_lng
        FROM drone_missions dm
        LEFT JOIN drones d    ON dm.drone_id    = d.id
        LEFT JOIN incidents i ON dm.incident_id = i.id
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

@page { size: A4; margin: 10mm 12mm; }

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
    font-family: Arial, Helvetica, sans-serif;
    background: #dde1e8;
    color: #111827;
    font-size: 12px;
}

.paper {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    background: #ffffff;
    border: 2px solid #003366;
    outline: 1.5px solid #FF6200;
    outline-offset: -5px;
}

/* --- Print button --- */
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

/* --- Govt header --- */
.gov-header {
    background: #001A33;
    padding: 10px 14mm 9px;
}
.gov-header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}
.gov-state-label {
    font-family: 'Courier New', Courier, monospace;
    font-size: 7.5px;
    color: #FFD580;
    letter-spacing: 2px;
    text-transform: uppercase;
    text-align: center;
    margin-bottom: 3px;
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
    font-size: 7.5px;
    color: #A8C4E0;
    letter-spacing: 1.5px;
    text-align: center;
    margin-top: 3px;
}

/* --- Tricolour --- */
.tc-bar { display: flex; height: 6px; }
.tc-s { flex: 1; background: #FF6200; }
.tc-w { flex: 1; background: #ffffff; }
.tc-g { flex: 1; background: #138808; }

/* --- Meta bar --- */
.meta-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 14mm;
    border-bottom: 1px solid #CBD5E1;
    background: #F0F4F8;
}
.meta-ref {
    font-family: 'Courier New', Courier, monospace;
    font-size: 8.5px;
    color: #003366;
}
.meta-title {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 14px;
    font-weight: bold;
    color: #003366;
    letter-spacing: 2px;
    text-transform: uppercase;
}
.meta-class {
    background: #FF6200;
    color: #ffffff;
    font-family: Arial, sans-serif;
    font-size: 7.5px;
    font-weight: bold;
    padding: 3px 9px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

/* --- Missions wrapper --- */
.missions-wrap { padding: 10px 14mm 0; }

/* --- Mission block --- */
.mission-block {
    border: 1px solid #CBD5E1;
    margin-bottom: 16px;
    page-break-inside: avoid;
}

/* --- Mission title bar --- */
.mission-title-bar {
    background: #001A33;
    padding: 6px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}
.m-ref {
    font-family: 'Courier New', Courier, monospace;
    font-size: 10px;
    color: #FFD580;
    white-space: nowrap;
}
.m-name {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 12px;
    font-weight: bold;
    color: #ffffff;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    flex: 1;
    text-align: center;
}
.status-badge {
    font-family: Arial, sans-serif;
    font-size: 8px;
    font-weight: bold;
    letter-spacing: 0.8px;
    padding: 3px 9px;
    text-transform: uppercase;
    white-space: nowrap;
    border-radius: 2px;
}

/* --- Section header --- */
.sec-hdr {
    background: #003366;
    color: #ffffff;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 8.5px;
    font-weight: bold;
    letter-spacing: 1.8px;
    text-transform: uppercase;
    padding: 4px 10px;
}

/* --- Info table --- */
.info-tbl {
    width: 100%;
    border-collapse: collapse;
    border-left: 1px solid #CBD5E1;
    border-top: 1px solid #CBD5E1;
    table-layout: fixed;
}
.info-tbl td {
    border-right: 1px solid #CBD5E1;
    border-bottom: 1px solid #CBD5E1;
    vertical-align: top;
    padding: 0;
}
.lbl {
    display: block;
    background: #F0F4F8;
    font-family: 'Courier New', Courier, monospace;
    font-size: 6.8px;
    color: #003366;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    padding: 3px 8px 2px;
    border-bottom: 1px solid #CBD5E1;
}
.val {
    display: block;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 12px;
    font-weight: bold;
    color: #111827;
    padding: 3px 8px 5px;
    line-height: 1.3;
}
.val.mono {
    font-family: 'Courier New', Courier, monospace;
    font-size: 10.5px;
    color: #003366;
}
.val.accent { color: #FF6200; }
.val.sm { font-size: 10px; font-weight: normal; }

/* --- Map --- */
.map-wrap { position: relative; border: 1px solid #CBD5E1; overflow: hidden; }
.map-lbl {
    position: absolute;
    top: 8px; left: 8px;
    z-index: 999;
    background: rgba(0,26,51,0.85);
    color: #ffffff;
    font-family: 'Courier New', Courier, monospace;
    font-size: 8px;
    letter-spacing: 1.2px;
    padding: 3px 9px;
    text-transform: uppercase;
    pointer-events: none;
}
.map-box { width: 100%; height: 240px; }

/* --- Map Legend --- */
.map-legend {
    display: flex;
    gap: 16px;
    padding: 6px 10px;
    background: #F0F4F8;
    border-top: 1px solid #CBD5E1;
    font-family: 'Courier New', Courier, monospace;
    font-size: 7.5px;
    color: #003366;
    letter-spacing: 0.8px;
}
.legend-dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid #fff;
    box-shadow: 0 0 3px rgba(0,0,0,0.4);
    vertical-align: middle;
    margin-right: 5px;
}

/* --- Footer --- */
.gov-footer {
    background: #001A33;
    padding: 6px 14mm;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
}
.gov-footer span {
    font-family: 'Courier New', Courier, monospace;
    font-size: 7.5px;
    color: #FFD580;
    letter-spacing: 0.8px;
}
.gov-footer .fc {
    color: #A8C4E0;
    font-size: 7px;
    flex: 1;
    text-align: center;
}

.no-data {
    text-align: center;
    padding: 40px;
    font-family: 'Courier New', Courier, monospace;
    color: #6B7280;
    letter-spacing: 2px;
    font-size: 11px;
}

/* --- Print --- */
@media print {
    body { background: #ffffff; }
    .print-bar { display: none !important; }
    .paper { border: none; outline: none; margin: 0; width: 100%; }
    .map-box { height: 200px !important; }
    .mission-block { page-break-inside: avoid; }

    .gov-header,
    .gov-footer,
    .mission-title-bar,
    .sec-hdr,
    .lbl,
    .meta-bar,
    .tc-bar,
    .tc-s, .tc-w, .tc-g,
    .status-badge,
    .meta-class,
    .map-legend {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
    }
}
</style>
</head>
<body>
<div class="paper">

    <!-- Print button -->
    <div class="print-bar">
        <button class="print-btn" onclick="window.print()">Print / Export PDF</button>
    </div>

    <!-- GOVERNMENT HEADER -->
    <div class="gov-header">
        <div class="gov-header-inner">

            <!-- Ashoka Chakra -->
            <div style="flex-shrink:0;width:44px;height:44px;">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
                    <circle cx="50" cy="50" r="46" fill="none" stroke="#ffffff" stroke-width="4"/>
                    <circle cx="50" cy="50" r="9"  fill="#ffffff"/>
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
                <!-- <div class="gov-state-label">Government of Maharashtra &nbsp;&bull;&nbsp; Maharashtra Shasan</div> -->
                <div class="gov-dept">Unmanned Aerial Systems Division</div>
                <div class="gov-sub">AGNI SURAKSHA VIBHAG &nbsp;|&nbsp; Pune DISTRICT &nbsp;|&nbsp; OFFICIAL OPERATIONAL REPORT</div>
            </div>

            <!-- Organization Logo -->
            <div style="flex-shrink:0;display:flex;align-items:center;justify-content:center;">
                <div style="background:#ffffff; border-radius:6px; padding:3px 6px; display:flex; align-items:center;">
                    <img
                        src="../../../public/innoverlogo.png"
                        alt="Logo"
                        style="height:24px; width:auto;"
                    />
                </div>
            </div>

        </div>
    </div>

    <!-- Tricolour stripe -->
    <div class="tc-bar">
        <div class="tc-s"></div>
        <div class="tc-w"></div>
        <div class="tc-g"></div>
    </div>

    <!-- Meta bar -->
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

            $duration    = calcDuration($row['start_time'], $row['end_time']);
            $statusUpper = strtoupper($row['mission_status'] ?? 'UNKNOWN');
            $sBadge      = statusStyle($row['mission_status']);
            $sColor      = statusColor($row['mission_status']);

            $hasStation  = isset($row['station_lat'])  && $row['station_lat']  !== '' && $row['station_lat']  !== null;
            $hasIncident = isset($row['incident_lat']) && $row['incident_lat'] !== '' && $row['incident_lat'] !== null;
    ?>

    <div class="mission-block">

        <!-- Title bar -->
        <div class="mission-title-bar">
            <span class="m-ref">MISSION #<?= str_pad($missionIdx, 3, '0', STR_PAD_LEFT) ?> &nbsp;/&nbsp; INC-<?= htmlspecialchars($row['incident_id']) ?></span>
            <span class="m-name"><?= htmlspecialchars($row['incident_name']) ?></span>
            <span class="status-badge" style="<?= $sBadge ?>"><?= $statusUpper ?></span>
        </div>

        <!-- A. Incident & Asset -->
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

        <!-- C. Operational Timeline -->
        <div class="sec-hdr">C. &nbsp; Operational Timeline</div>
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

        <!-- D. Flight Path Map — Station → Incident straight line -->
        <?php if ($hasStation && $hasIncident): ?>
        <div class="sec-hdr">D. &nbsp; Flight Path &mdash; Station &#8594; Incident</div>
        <div class="map-wrap">
            <div class="map-lbl">ESTIMATED FLIGHT PATH &nbsp;&bull;&nbsp; STRAIGHT LINE</div>
            <div id="map-<?= $row['incident_id'] ?>" class="map-box"></div>
        </div>

        <!-- Legend -->
        <div class="map-legend">
            <span>
                <span class="legend-dot" style="background:#003366;"></span>
                STATION: <?= htmlspecialchars($row['station']) ?>
            </span>
            <span>
                <span class="legend-dot" style="background:#FF6200;"></span>
                INCIDENT: <?= htmlspecialchars($row['incident_name']) ?>
            </span>
            <span style="margin-left:auto;">
                &mdash; &mdash; ESTIMATED PATH
            </span>
        </div>

        <script>
        (function () {
            var stationPt  = [<?= (float)$row['station_lat'] ?>, <?= (float)$row['station_lng'] ?>];
            var incidentPt = [<?= (float)$row['incident_lat'] ?>, <?= (float)$row['incident_lng'] ?>];
            var mapId      = "map-<?= $row['incident_id'] ?>";

            var map = L.map(mapId, { zoomControl: true, attributionControl: false });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);

            // Dashed straight line — station to incident
            var line = L.polyline([stationPt, incidentPt], {
                color: '#003366',
                weight: 2.5,
                opacity: 0.85,
                dashArray: '8, 6'
            }).addTo(map);

            // Station marker — blue dot
            L.marker(stationPt, {
                icon: L.divIcon({
                    className: '',
                    html: '<div style="width:13px;height:13px;background:#003366;border:2px solid #fff;border-radius:50%;box-shadow:0 0 5px rgba(0,0,0,.5)"></div>',
                    iconAnchor: [6, 6]
                })
            }).addTo(map).bindTooltip('<?= addslashes(htmlspecialchars($row['station'])) ?>', {
                permanent: true,
                direction: 'top',
                offset: [0, -10],
                className: ''
            });

            // Incident marker — orange dot
            L.marker(incidentPt, {
                icon: L.divIcon({
                    className: '',
                    html: '<div style="width:13px;height:13px;background:#FF6200;border:2px solid #fff;border-radius:50%;box-shadow:0 0 5px rgba(0,0,0,.5)"></div>',
                    iconAnchor: [6, 6]
                })
            }).addTo(map).bindTooltip('<?= addslashes(htmlspecialchars($row['incident_name'])) ?>', {
                permanent: true,
                direction: 'top',
                offset: [0, -10],
                className: ''
            });

            function fit() {
                setTimeout(function () {
                    map.invalidateSize();
                    map.fitBounds(line.getBounds(), { padding: [50, 50] });
                }, 600);
            }
            fit();
            window.addEventListener('beforeprint', fit);
            window.addEventListener('afterprint',  fit);
        })();
        </script>
        <?php endif; ?>

    </div><!-- /mission-block -->

    <?php endwhile;
    else: ?>
    <div class="no-data">NO MISSION RECORDS FOUND</div>
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