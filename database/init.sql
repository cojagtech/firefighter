-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 26, 2026 at 12:55 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `fire-fighter`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `user_name` varchar(100) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `action` varchar(100) DEFAULT NULL,
  `module` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `user_name`, `role`, `action`, `module`, `description`, `entity_id`, `ip_address`, `created_at`) VALUES
(1, 1, 'Rahul Sharma', 'Admin', 'ASSIGN_PILOT', 'DRONE', 'Assigned pilot (Amit Verma) to drone DRN-002', 2, '::1', '2026-02-28 05:20:13'),
(2, 2, 'Amit Verma', 'Pilot', 'REMOVE_PILOT', 'DRONE', 'Removed pilot (Amit Verma) from drone DRN-002', 2, '::1', '2026-02-28 05:28:29'),
(3, 2, 'Amit Verma', 'Pilot', 'ASSIGN_PILOT', 'DRONE', 'Assigned pilot (Amit Verma) to drone DRN-002', 2, '::1', '2026-02-28 05:28:36'),
(4, 1, 'Rahul Sharma', 'Admin', 'ADD_DRONE', 'DRONE', 'Added new drone PhantomX (DRN-010) at station Katraj Fire Station', NULL, '::1', '2026-03-04 08:53:02'),
(5, 1, 'Rahul Sharma', 'Admin', 'UPDATE_DRONE', 'DRONE', 'Updated drone DRN-001 (flight_hours: 20 → 21, health_status: Optimal → Requires Service, firmware_version: v1.0.0 → V3.4.6, status: Maintenance → active_mission)', NULL, '::1', '2026-03-04 08:54:02'),
(6, 1, 'Rahul Sharma', 'Admin', 'UPDATE_DRONE', 'DRONE', 'Updated drone DRN-001 (flight_hours: 21 → 20, health_status: Requires Service → Optimal, firmware_version: V3.4.6 → V3.4.5, status:  → active_mission)', NULL, '::1', '2026-03-04 08:56:12'),
(7, 1, 'Rahul Sharma', 'Admin', 'UPDATE_DRONE', 'DRONE', 'Updated drone DRN-001 (health_status: Optimal → Requires Service, status:  → standby)', NULL, '::1', '2026-03-04 08:57:37'),
(8, 1, 'Rahul Sharma', 'Admin', 'UPDATE_DRONE', 'DRONE', 'Updated drone DRN-001 (status: StandBy → standby)', NULL, '::1', '2026-03-04 09:00:41'),
(9, 1, 'Rahul Sharma', 'Admin', 'UPDATE_DRONE', 'DRONE', 'Updated drone DRN-001 (status: StandBy → standby)', NULL, '::1', '2026-03-04 09:01:05'),
(10, 1, 'Rahul Sharma', 'Admin', 'UPDATE_DRONE', 'DRONE', 'Updated drone DRN-001 (status: StandBy → patrolling)', NULL, '::1', '2026-03-04 09:01:13'),
(11, 1, 'Rahul Sharma', 'Admin', 'UPDATE_DRONE', 'DRONE', 'Updated drone DRN-001 (status:  → active_mission)', NULL, '::1', '2026-03-04 09:03:35'),
(12, 1, 'Rahul Sharma', 'Admin', 'UPDATE_DRONE', 'DRONE', 'Updated drone DRN-001 (status:  → standby)', NULL, '::1', '2026-03-04 09:03:59'),
(13, 1, 'Rahul Sharma', 'Admin', 'UPDATE_DRONE', 'DRONE', 'Updated drone DRN-001', NULL, '::1', '2026-03-04 09:11:29'),
(14, 1, 'Rahul Sharma', 'Admin', 'UPDATE_DRONE', 'DRONE', 'Updated drone DRN-001 (status: StandBy → Active)', NULL, '::1', '2026-03-04 09:12:52'),
(15, 1, 'Rahul Sharma', 'Admin', 'UPDATE_DRONE', 'DRONE', 'Updated drone DRN-001 (status: Active → Maintenance)', NULL, '::1', '2026-03-04 09:13:03'),
(16, 1, 'Rahul Sharma', 'Admin', 'UPDATE_DRONE', 'DRONE', 'Updated drone DRN-001 (status: Maintenance → StandBy)', NULL, '::1', '2026-03-04 09:13:14'),
(17, 1, 'Rahul Sharma', 'Admin', 'UPDATE_DRONE', 'DRONE', 'Updated drone DRN-001 (status: StandBy → Active)', NULL, '::1', '2026-03-04 09:13:20'),
(18, 1, 'Rahul Sharma', 'Admin', 'UPDATE_DRONE', 'DRONE', 'Updated drone DRN-001 (health_status: Requires Service → Optimal)', NULL, '::1', '2026-03-04 09:13:33'),
(19, 1, 'Rahul Sharma', 'Admin', 'UPDATE_DRONE', 'DRONE', 'Updated drone DRN-001 (health_status: Optimal → Degraded)', NULL, '::1', '2026-03-04 09:13:41'),
(20, 1, 'Rahul Sharma', 'Admin', 'UPDATE_DRONE', 'DRONE', 'Updated drone DRN-001 (health_status: Degraded → Optimal)', NULL, '::1', '2026-03-04 09:13:49');

-- --------------------------------------------------------

--
-- Table structure for table `drones`
--

CREATE TABLE `drones` (
  `id` int(10) UNSIGNED NOT NULL,
  `drone_code` varchar(50) NOT NULL,
  `drone_name` varchar(150) NOT NULL,
  `ward` varchar(50) DEFAULT NULL,
  `status` enum('Active','StandBy','Maintenance') NOT NULL,
  `battery` int(11) DEFAULT NULL,
  `flight_hours` float DEFAULT 0,
  `health_status` varchar(50) DEFAULT 'Optimal',
  `firmware_version` varchar(20) DEFAULT 'v1.0.0',
  `is_ready` tinyint(1) NOT NULL DEFAULT 0,
  `station` varchar(50) NOT NULL,
  `pilot_id` int(11) DEFAULT NULL,
  `pilot_name` varchar(100) DEFAULT NULL,
  `pilot_email` varchar(150) DEFAULT NULL,
  `pilot_phone` varchar(20) DEFAULT NULL,
  `pilot_role` varchar(100) DEFAULT NULL,
  `pilot_status` enum('available','assigned') DEFAULT 'available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `drones`
--

INSERT INTO `drones` (`id`, `drone_code`, `drone_name`, `ward`, `status`, `battery`, `flight_hours`, `health_status`, `firmware_version`, `is_ready`, `station`, `pilot_id`, `pilot_name`, `pilot_email`, `pilot_phone`, `pilot_role`, `pilot_status`) VALUES
(1, 'DRN-001', 'DJI Mini 2', '', 'Active', 100, 20, 'Optimal', 'V3.4.5', 1, 'Katraj Fire Station', NULL, NULL, NULL, NULL, NULL, 'available'),
(2, 'DRN-002', 'AeroGuard S3', '', 'Maintenance', 100, 13, 'Optimal', 'v1.0.0', 1, 'Katraj Fire Station', NULL, NULL, NULL, NULL, NULL, 'available'),
(3, 'DRN-003', 'FireScout', '', 'StandBy', 100, 37, 'Optimal', 'v3.6.3', 1, 'Warje Fire Station', NULL, NULL, NULL, NULL, NULL, 'available'),
(4, 'DRN-004', 'Falcon X2', '', 'StandBy', 100, 10, 'Optimal', 'v4.2.3', 1, 'Warje Fire Station', NULL, NULL, NULL, NULL, NULL, 'available'),
(5, 'DRN-005', 'air2s', '', 'Active', 100, 5, 'Optimal', 'v2.0.0', 1, 'Yerwada Fire Station', NULL, NULL, NULL, NULL, NULL, 'available'),
(6, 'DRN-006', 'phantomX', '', 'StandBy', 100, 0, 'Optimal', 'V.2.3.4', 1, 'Yerwada Fire Station', NULL, NULL, NULL, NULL, NULL, 'available'),
(7, 'DRN-007', 'DJI FPV', '', 'StandBy', 100, 2, 'Optimal', 'V.1.2.6', 1, 'Baner Fire Station', NULL, NULL, NULL, NULL, NULL, 'available'),
(8, 'DRN-008', 'Parrot Anafi', '', 'Active', 100, 18, 'Optimal', 'V.1.2.6', 1, 'Baner Fire Station', NULL, NULL, NULL, NULL, NULL, 'available'),
(9, 'DRN-009', 'Autel Robotics EVO Lite+', '', 'StandBy', 100, 15, 'Optimal', 'V.1.4.7', 1, 'Kothrud Station', NULL, NULL, NULL, NULL, NULL, 'available');

-- --------------------------------------------------------

--
-- Table structure for table `drone_gps_logs`
--

CREATE TABLE `drone_gps_logs` (
  `id` int(10) UNSIGNED NOT NULL,
  `drone_code` varchar(50) NOT NULL,
  `latitude` double NOT NULL,
  `longitude` double NOT NULL,
  `speed` double NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `drone_gps_logs`
--

INSERT INTO `drone_gps_logs` (`id`, `drone_code`, `latitude`, `longitude`, `speed`, `timestamp`) VALUES
(1, 'DRN-001', 18.454593, 73.855582, 42, '2025-12-02 07:10:03'),
(2, 'DRN-002', 18.4591, 73.8555, 45.5, '2026-02-18 06:59:57'),
(3, 'DRN-005', 18.4545, 73.8603, 52.3, '2026-02-18 06:59:57'),
(4, 'DRN-007', 18.4501, 73.851, 38.9, '2026-02-18 06:59:57');

-- --------------------------------------------------------

--
-- Table structure for table `fire_detections`
--

CREATE TABLE `fire_detections` (
  `id` int(11) NOT NULL,
  `event_timestamp` bigint(20) DEFAULT NULL,
  `alert_type` varchar(50) DEFAULT NULL,
  `confidence` float DEFAULT NULL,
  `fire_count` int(11) DEFAULT NULL,
  `intensity_level` varchar(50) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `fire_detections`
--

INSERT INTO `fire_detections` (`id`, `event_timestamp`, `alert_type`, `confidence`, `fire_count`, `intensity_level`, `location`, `created_at`) VALUES
(1, 1741785600000, 'fire_detection', 0.87, 4, '🔥🔥🔥 CRITICAL', 'AWS_RTMP_Stream', '2026-03-12 06:45:45'),
(2, 1741785600000, 'fire_detection', 0.87, 4, '🔥🔥🔥 CRITICAL', 'AWS_RTMP_Stream', '2026-03-13 12:08:42'),
(3, 1741785600000, 'fire_detection', 0.87, 4, '🔥🔥🔥 CRITICAL', 'AWS_RTMP_Stream', '2026-03-13 12:15:59'),
(4, 1741785600000, 'fire_detection', 0.87, 4, '🔥🔥🔥 CRITICAL', 'AWS_RTMP_Stream', '2026-03-13 12:16:58'),
(5, 1741785600000, 'fire_detection', 0.87, 4, '🔥🔥🔥 CRITICAL', 'AWS_RTMP_Stream', '2026-03-13 12:20:23'),
(6, 1741785600000, 'fire_detection', 0.87, 4, '🔥🔥🔥 CRITICAL', 'AWS_RTMP_Stream', '2026-03-13 12:24:41'),
(7, 1741785600000, 'fire_detection', 0.97, 4, '🔥🔥🔥 CRITICAL', 'AWS_RTMP_Stream', '2026-03-13 12:25:10'),
(8, 1741785600000, 'fire_detection', 0.97, 4, '🔥🔥🔥 CRITICAL', 'AWS_RTMP_Stream', '2026-03-13 12:28:49'),
(9, 1741785600000, 'fire_detection', 0.97, 4, '🔥🔥🔥 CRITICAL', 'AWS_RTMP_Stream', '2026-03-13 12:29:50'),
(10, 1741785600000, 'fire_detection', 0.97, 4, '🔥🔥🔥 CRITICAL', 'AWS_RTMP_Stream', '2026-03-13 12:30:02'),
(11, 1741785600000, 'fire_detection', 0.97, 4, '🔥🔥🔥 CRITICAL', 'AWS_RTMP_Stream', '2026-03-13 12:30:08'),
(12, 1741785600000, 'fire_detection', 0.97, 4, '🔥🔥🔥 CRITICAL', 'AWS_RTMP_Stream', '2026-03-13 12:30:13'),
(13, 1741785600000, 'fire_detection', 0.97, 4, '🔥🔥🔥 CRITICAL', 'AWS_RTMP_Stream', '2026-03-13 12:30:46'),
(14, 1741785600000, 'fire_detection', 0.97, 4, '🔥🔥🔥 CRITICAL', 'AWS_RTMP_Stream', '2026-03-13 12:30:56'),
(15, 1741785600000, 'fire_detection', 0.97, 4, '🔥🔥🔥 CRITICAL', 'AWS_RTMP_Stream', '2026-03-13 12:31:03'),
(16, 1741785600000, 'fire_detection', 0.97, 4, '🔥🔥🔥 CRITICAL', 'AWS_RTMP_Stream', '2026-03-13 12:33:37'),
(17, 1741785600000, 'fire_detection', 0.97, 4, '🔥🔥🔥 CRITICAL', 'AWS_RTMP_Stream', '2026-03-13 12:33:41'),
(26, 1710000000000, 'fire_detection', 0.91, 3, 'HIGH', 'RTMP_TEST', '2026-03-20 06:07:08'),
(27, 1710000000000, 'fire_detection', 0.91, 3, 'HIGH', 'RTMP_TEST', '2026-03-20 06:25:54');

-- --------------------------------------------------------

--
-- Table structure for table `fire_station`
--

CREATE TABLE `fire_station` (
  `id` int(11) NOT NULL,
  `station_name` varchar(150) NOT NULL,
  `station_code` varchar(50) NOT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `fire_station`
--

INSERT INTO `fire_station` (`id`, `station_name`, `station_code`, `latitude`, `longitude`, `created_at`) VALUES
(2, 'Warje Fire Station', 'STN-002', 18.4834350, 73.8024832, '2026-02-03 07:28:11'),
(3, 'Yerwada Fire Station', 'STN-003', 18.5064749, 73.8684440, '2026-02-03 10:10:52'),
(19, 'Katraj Fire Station', 'STN-001', 18.4549192, 73.8569108, '2026-03-26 11:30:58'),
(20, 'Baner Fire Station', 'STN-004', 18.5603810, 73.7769030, '2026-03-26 11:31:49');

-- --------------------------------------------------------

--
-- Table structure for table `incidents`
--

CREATE TABLE `incidents` (
  `id` varchar(30) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `stationName` varchar(100) DEFAULT NULL,
  `timeReported` datetime DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `isNewAlert` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `incidents`
--

INSERT INTO `incidents` (`id`, `name`, `location`, `latitude`, `longitude`, `stationName`, `timeReported`, `status`, `isNewAlert`) VALUES
('INC-20251122-001', 'Vehicle Accident & Fire', 'Paud Road, Near Signal, Kothrud', 18.5074, 73.8077, 'Baner Fire Station', '2025-11-22 15:25:00', 'new', 1),
('INC-20251122-002', 'Warehouse Fire - Industrial Zone', 'Plot No. 45, Industrial Area, Katraj', 18.4445, 73.8521, 'Yerwada Fire Station', '2026-01-02 14:10:00', 'new', 1),
('INC-20260115-003', 'Residential Building Fire', 'Near Katraj Bus Depot, Pune', 18.45445378969955, 73.85859890802172, 'Katraj Fire Station', '2026-01-15 18:40:00', 'new', 1);

-- --------------------------------------------------------

--
-- Table structure for table `maintenance_requests`
--

CREATE TABLE `maintenance_requests` (
  `id` int(11) NOT NULL,
  `drone_code` varchar(50) NOT NULL,
  `drone_name` varchar(150) NOT NULL,
  `station` varchar(150) NOT NULL,
  `issue_description` text NOT NULL,
  `scheduled_date` date NOT NULL,
  `reported_by` varchar(150) NOT NULL,
  `status` varchar(50) DEFAULT 'scheduled',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `maintenance_requests`
--

INSERT INTO `maintenance_requests` (`id`, `drone_code`, `drone_name`, `station`, `issue_description`, `scheduled_date`, `reported_by`, `status`, `created_at`) VALUES
(4, 'DRN-002', 'AeroGuard S3', 'Katraj Fire Station', 'Battery Issue', '2026-03-06', 'Amit Verma', 'scheduled', '2026-03-05 11:11:48');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `fullName` varchar(100) NOT NULL,
  `address` varchar(255) NOT NULL,
  `email` varchar(120) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `designation` varchar(100) NOT NULL,
  `role` varchar(100) NOT NULL,
  `station` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `deactivation_reason` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `fullName`, `address`, `email`, `phone`, `designation`, `role`, `station`, `created_at`, `status`, `deactivation_reason`) VALUES
(1, 'Rahul Sharma', 'Delhi, India', 'rahul.sharma@example.com', '9876543210', 'Admin', 'Admin', '-', '2025-12-06 05:04:12', 1, NULL),
(2, 'Amit Verma', 'Mumbai, Maharashtra', 'amit.verma@example.com', '9876501234', 'Pilot', 'Pilot', 'Katraj Fire Station', '2025-12-06 05:20:41', 1, NULL),
(3, 'Rohit Kumar', 'Patna, Bihar', 'rohit.kumar@example.com', '9988776655', 'Vehicle Driver ', 'Vehicle Driver', 'Katraj Fire Station', '2025-12-08 06:56:01', 1, NULL),
(4, 'Suresh Yadav', 'Jaipur, Rajasthan', 'suresh.yadav@example.com', '9090909090', 'Fire Station Command Control', 'Fire Station Command Control', 'Katraj Fire Station', '2025-12-10 07:10:42', 1, NULL),
(5, 'Vikas Gupta', 'Chandigarh', 'vikas.gupta@example.com', '7766554433', 'Pilot', 'Pilot', 'Baner Fire Station', '2025-12-16 09:01:03', 1, NULL),
(6, 'Manoj Joshi', 'Bhopal, MP', 'manoj.joshi@example.com', '9988001122', 'Vehicle Driver ', 'Vehicle Driver ', 'Baner Fire Station', '2025-12-16 12:03:45', 1, NULL),
(7, 'Arjun Singh', 'Kanpur, UP', 'arjun.singh@example.com', '9123456701', 'Fire Station Command Control', 'Fire Station Command Control', 'Baner Fire Station', '2025-12-16 12:07:07', 1, NULL),
(8, 'Deepak Mishra', 'Prayagraj, UP', 'deepak.mishra@example.com', '9345612789', 'Pilot', 'Pilot', 'Warje Fire Station', '2025-12-17 05:47:12', 1, NULL),
(9, 'Nitin Agarwal', 'Agra, UP', 'nitin.agarwal@example.com', '9011223344', 'Vehicle Driver ', 'Vehicle Driver', 'Warje Fire Station', '2025-12-17 11:40:44', 1, NULL),
(10, 'Sanjay Patel', 'Vadodara, Gujarat', 'sanjay.patel@example.com', '8899001122', 'Fire Station Command Control', 'Fire Station Command Control', 'Warje Fire Station', '2025-12-17 11:41:31', 1, NULL),
(11, 'Rakesh Malhotra', 'Gurgaon, Haryana', 'rakesh.malhotra@example.com', '9811122233', 'Pilot', 'Pilot', 'Yerwada Fire Station', '2026-02-18 06:46:24', 1, NULL),
(12, 'Pankaj Tiwari', 'Rewa, MP', 'pankaj.tiwari@example.com', '9425012345', 'Vehicle Driver ', 'Vehicle Driver ', 'Yerwada Fire Station', '2026-02-18 06:46:24', 1, NULL),
(13, 'Ashok Choudhary', 'Bikaner, Rajasthan', 'ashok.choudhary@example.com', '9798989898', 'Fire Station Command Control', 'Fire Station Command Control', 'Yerwada Fire Station', '2026-02-18 06:46:24', 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  `registration` varchar(50) DEFAULT NULL,
  `device_id` varchar(50) DEFAULT NULL,
  `location` varchar(150) DEFAULT NULL,
  `status` varchar(30) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `station` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`id`, `name`, `type`, `registration`, `device_id`, `location`, `status`, `created_at`, `station`) VALUES
(1, 'Rescue Van', 'Hydraulic Rescue Vehicle', 'MH-12-KJ-1001', 'VTS-HRV-001', 'Katraj Fire Station', 'maintenance', '2025-12-05 09:47:34', 'Katraj Fire Station'),
(2, 'Water Tender', 'Bulk Water Carrier', 'MH-12-KJ-1002', 'VTS-BWC-002', 'Katraj Fire Station', 'available', '2025-12-05 09:47:34', 'Katraj Fire Station'),
(3, 'Quick Response Vehicle', 'Fire QRV', 'MH-12-KJ-1003', '0453aa40-80a0-11f0-902d-59ff54eea995', 'Katraj Fire Station', 'available', '2025-12-05 09:47:34', 'Katraj Fire Station'),
(4, 'Rescue Van', 'Hydraulic Rescue Vehicle', 'MH-12-BN-2341', 'VTS-HRV-101', 'Baner Fire Station', 'available', '2025-12-05 09:47:34', 'Baner Fire Station'),
(5, 'Water Tender', 'Bulk Water Carrier', 'MH-12-BN-2342', 'VTS-BWC-102', 'Baner Fire Station', 'available', '2025-12-05 09:47:34', 'Baner Fire Station'),
(6, 'Quick Response Vehicle', 'Fire QRV', 'MH-12-BN-2343', 'VTS-QRV-103', 'Baner Fire Station', 'available', '2025-12-05 09:47:34', 'Baner Fire Station'),
(7, 'Rescue Van', 'Hydraulic Rescue Vehicle', 'MH-14-WJ-4511', 'VTS-HRV-201', 'Warje Fire Station', 'available', '2025-12-05 09:47:34', 'Warje Fire Station'),
(8, 'Water Tender', 'Bulk Water Carrier', 'MH-14-WJ-4512', 'VTS-BWC-202', 'Warje Fire Station', 'available', '2025-12-05 09:47:34', 'Warje Fire Station'),
(9, 'Quick Response Vehicle', 'Fire QRV', 'MH-14-WJ-4513', 'VTS-QRV-203', 'Warje Fire Station', 'available', '2025-12-05 09:47:34', 'Warje Fire Station'),
(10, 'Rescue Van', 'Hydraulic Rescue Vehicle', 'MH-12-YD-7781', 'VTS-HRV-301', 'Yerwada Fire Station', 'available', '2025-12-05 09:47:34', 'Yerwada Fire Station'),
(11, 'Water Tender', 'Bulk Water Carrier', 'MH-12-YD-7782', 'VTS-BWC-302', 'Yerwada Fire Station', 'available', '2025-12-05 09:47:34', 'Yerwada Fire Station'),
(12, 'Quick Response Vehicle', 'Fire QRV', 'MH-12-YD-7783', 'VTS-QRV-303', 'Yerwada Fire Station', 'available', '2025-12-05 09:47:34', 'Yerwada Fire Station');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `drones`
--
ALTER TABLE `drones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `drone_code` (`drone_code`);

--
-- Indexes for table `drone_gps_logs`
--
ALTER TABLE `drone_gps_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `drone_code` (`drone_code`);

--
-- Indexes for table `fire_detections`
--
ALTER TABLE `fire_detections`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `fire_station`
--
ALTER TABLE `fire_station`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_station_code` (`station_code`);

--
-- Indexes for table `incidents`
--
ALTER TABLE `incidents`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `maintenance_requests`
--
ALTER TABLE `maintenance_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_drone_code` (`drone_code`),
  ADD KEY `idx_station` (`station`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `drones`
--
ALTER TABLE `drones`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

--
-- AUTO_INCREMENT for table `drone_gps_logs`
--
ALTER TABLE `drone_gps_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `fire_detections`
--
ALTER TABLE `fire_detections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `fire_station`
--
ALTER TABLE `fire_station`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `maintenance_requests`
--
ALTER TABLE `maintenance_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=373;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
