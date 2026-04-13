    <?php
    session_start();

    require_once realpath(__DIR__ . "/../../config/db.php");
    require_once realpath(__DIR__ . "/../../helpers/logActivity.php");

    // =====================
    // INPUT VALIDATION
    // =====================
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data || empty($data['drone_code'])) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid input"
        ]);
        exit;
    }

    $droneCode = $data['drone_code'];
    $station = $_SESSION['user']['station'] ?? null;
    $completedBy = $_SESSION['user']['fullName'] ?? "Unknown";

    if (!$station) {
        echo json_encode([
            "success" => false,
            "message" => "Session missing"
        ]);
        exit;
    }

    try {

        // =====================
        // START TRANSACTION
        // =====================
        $conn->begin_transaction();

        // =====================
        // GET MAINTENANCE DETAILS
        // =====================
        $stmtFetch = $conn->prepare("
            SELECT drone_name, issue_description, scheduled_date
            FROM maintenance_requests
            WHERE drone_code = ? AND station = ?
            ORDER BY created_at DESC
            LIMIT 1
        ");
        $stmtFetch->bind_param("ss", $droneCode, $station);
        $stmtFetch->execute();
        $result = $stmtFetch->get_result();
        $row = $result->fetch_assoc();

        // =====================
        // UPDATE MAINTENANCE STATUS
        // =====================
        $stmt1 = $conn->prepare("
            UPDATE maintenance_requests
            SET status = 'completed'
            WHERE drone_code = ? AND station = ? AND status = 'scheduled'
        ");
        $stmt1->bind_param("ss", $droneCode, $station);
        $stmt1->execute();

        // =====================
        // UPDATE DRONE STATUS → ACTIVE
        // =====================
        $stmt2 = $conn->prepare("
            UPDATE drones
            SET status = 'Active'
            WHERE drone_code = ? AND station = ?
        ");
        $stmt2->bind_param("ss", $droneCode, $station);
        $stmt2->execute();

        // =====================
        // CREATE NOTIFICATION (WITH DATA JSON)
        // =====================
        $details = json_encode([
            "drone_code" => $droneCode,
            "drone_name" => $row['drone_name'] ?? null,
            "station" => $station,
            "reported_by" => $completedBy,
            "issue_description" => $row['issue_description'] ?? null,
            "scheduled_date" => $row['scheduled_date'] ?? null,
            "status" => "completed"
        ]);

        $msg = "Maintenance completed for {$row['drone_name']} ({$droneCode}) at {$station}";

        $stmt3 = $conn->prepare("
            INSERT INTO notifications (type, message, created_by, data)
            VALUES ('maintenance', ?, ?, ?)
        ");
        $stmt3->bind_param("sss", $msg, $completedBy, $details);
        $stmt3->execute();

        // =====================
        // LOG ACTIVITY
        // =====================
        logActivity(
            $conn,
            $_SESSION['user'],
            "MAINTENANCE_COMPLETED",
            "MAINTENANCE",
            "Maintenance completed for {$row['drone_name']} ({$droneCode}) at {$station} on ".date('d-m-Y'),
            null
        );

        // =====================
        // COMMIT
        // =====================
        $conn->commit();

        echo json_encode([
            "success" => true,
            "message" => "Maintenance completed successfully"
        ]);

    } catch (Exception $e) {

        // ROLLBACK
        $conn->rollback();

        echo json_encode([
            "success" => false,
            "message" => $e->getMessage() // debug
        ]);
    }