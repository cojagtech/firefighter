-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 10, 2026 at 09:32 AM
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
(3, 2, 'Amit Verma', 'Pilot', 'ASSIGN_PILOT', 'DRONE', 'Assigned pilot (Amit Verma) to drone DRN-002', 2, '::1', '2026-02-28 05:28:36'),
(4, 1, 'Rahul Sharma', 'Admin', 'ADD_DRONE', 'DRONE', 'Added new drone PhantomX (DRN-010) at station Katraj Fire Station', NULL, '::1', '2026-03-04 08:53:02'),
(5, 1, 'Rahul Sharma', 'Admin', 'UPDATE_DRONE', 'DRONE', 'Updated drone DRN-001 (flight_hours: 20 → 21, health_status: Optimal → Requires Service, firmware_version: v1.0.0 → V3.4.6, status: Maintenance → active_mission)', NULL, '::1', '2026-03-04 08:54:02'),
(21, 1, 'Rahul Sharma', 'Admin', 'UPDATE_VEHICLE', 'VEHICLE', 'Updated vehicle (MH-12-YD-7783): name: \'Quick Response Vehicle\' → \'Quick Response Vehicles\'', 12, '::1', '2026-03-31 07:06:49'),
(22, 2, 'Amit Verma', 'Pilot', 'SCHEDULE_MAINTENANCE', 'MAINTENANCE', 'Scheduled maintenance for drone SkyGuard-01 (DRN-001) at station Katraj Fire Station on 2026-04-04. Issue: battery replacement', NULL, '::1', '2026-04-03 09:55:24'),
(23, 2, 'Amit Verma', 'Pilot', 'SCHEDULE_MAINTENANCE', 'MAINTENANCE', 'Scheduled maintenance for drone SkyGuard-01 (DRN-001) at station Katraj Fire Station on 2026-04-11. Issue: battery futali', NULL, '::1', '2026-04-03 10:07:15'),
(24, 2, 'Amit Verma', 'Pilot', 'SCHEDULE_MAINTENANCE', 'MAINTENANCE', 'Scheduled maintenance for drone SkyGuard-01 (DRN-001) at station Katraj Fire Station on 2026-04-11. Issue: battery replacement', NULL, '::1', '2026-04-04 05:43:05'),
(25, 2, 'Amit Verma', 'Pilot', 'SCHEDULE_MAINTENANCE', 'MAINTENANCE', 'Scheduled maintenance for drone SkyGuard-01 (DRN-001) at station Katraj Fire Station on 2026-04-10. Issue: battery replacement', NULL, '::1', '2026-04-04 05:54:43'),
(26, 2, 'Amit Verma', 'Pilot', 'SCHEDULE_MAINTENANCE', 'MAINTENANCE', 'Scheduled maintenance for drone SkyGuard-01 (DRN-001) at station Katraj Fire Station on 2026-04-04. Issue: battery replacement', NULL, '::1', '2026-04-04 05:58:14'),
(27, 2, 'Amit Verma', 'Pilot', 'SCHEDULE_MAINTENANCE', 'MAINTENANCE', 'Scheduled maintenance for drone SkyGuard-01 (DRN-001) at station Katraj Fire Station on 2026-04-08. Issue: battery replacement', NULL, '::1', '2026-04-04 06:05:52'),
(28, 1, 'Rahul Sharma', 'Admin', 'DELETE_VEHICLE', 'VEHICLE', 'Deleted vehicle Rescue Van (MH-14-WJ-4511) from station Warje Fire Station', NULL, '::1', '2026-04-04 10:42:40'),
(29, 1, 'Rahul Sharma', 'Admin', 'DELETE_VEHICLE', 'VEHICLE', 'Deleted vehicle Rescue Van (MH-12-BN-2341) from station Baner Fire Station', NULL, '::1', '2026-04-04 10:43:12'),
(30, NULL, 'SYSTEM', 'SYSTEM', 'DELETE_USER', 'USER', 'Deleted user Manoj Joshi (Role: Vehicle Driver ) from station Baner Fire Station', NULL, '::1', '2026-04-04 13:03:14'),
(31, 1, 'Rahul Sharma', 'Admin', 'DELETE_STATION', 'STATION', 'Deleted station Kasba Peth Fire Station (STN-007)', NULL, '::1', '2026-04-04 13:04:51'),
(32, 1, 'Rahul Sharma', 'Admin', 'DELETE_STATION', 'STATION', 'Deleted station Camp Fire Station (Moledina Rd) (STN-005)', NULL, '::1', '2026-04-04 13:08:23'),
(33, 1, 'Rahul Sharma', 'Admin', 'DELETE_VEHICLE', 'VEHICLE', 'Deleted vehicle Rescue Van (MH-12-YD-7781) from station Yerwada Fire Station', NULL, '::1', '2026-04-04 13:08:50'),
(34, 1, 'Rahul Sharma', 'Admin', 'ASSIGN_PILOT', 'DRONE', 'Assigned pilot (Amit Verma) to drone DRN-001', 2, '::1', '2026-04-08 17:37:38');

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
(1, 'DRN-001', 'SkyGuard-01', '', 'Active', 100, 20, 'Optimal', 'V3.4.5', 1, 'Katraj Fire Station', 2, 'Amit Verma', 'amit.verma@example.com', '9876501234', 'Pilot', 'assigned'),
(2, 'DRN-002', 'SkyGuard-02', '', 'Active', 100, 13, 'Optimal', 'v1.0.0', 1, 'Katraj Fire Station', NULL, NULL, NULL, NULL, NULL, 'available'),
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
  `incident_id` varchar(50) DEFAULT NULL,
  `latitude` double NOT NULL,
  `longitude` double NOT NULL,
  `speed` double NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `drone_gps_logs`
--

INSERT INTO `drone_gps_logs` (`id`, `drone_code`, `incident_id`, `latitude`, `longitude`, `speed`, `timestamp`) VALUES
(1, 'DRN-001', NULL, 18.454593, 73.855582, 42, '2025-12-02 07:10:03'),
(2, 'DRN-002', NULL, 18.493859, 73.835045, 45.5, '2026-02-18 06:59:57'),
(3, 'DRN-005', NULL, 18.4545, 73.8603, 52.3, '2026-02-18 06:59:57'),
(4, 'DRN-007', NULL, 18.4501, 73.851, 38.9, '2026-02-18 06:59:57'),
(13, 'DRN-001', 'INC-20260115-003', 18.5204, 73.8567, 45.5, '2026-04-09 10:36:52'),
(14, 'DRN-001', 'INC-20260115-003', 18.5204, 73.8567, 45.5, '2026-04-09 10:36:52'),
(15, 'DRN-001', 'INC-20260115-003', 18.521, 73.857, 46, '2026-04-09 10:37:10'),
(16, 'DRN-001', 'INC-20260115-003', 18.522, 73.8585, 44.8, '2026-04-09 10:37:30'),
(17, 'DRN-001', 'INC-20260115-003', 18.5235, 73.86, 45.2, '2026-04-09 10:37:50'),
(18, 'DRN-001', 'INC-20260115-003', 18.525, 73.8615, 45, '2026-04-09 10:38:10'),
(19, 'DRN-001', 'INC-20260115-003', 18.526, 73.8625, 45.3, '2026-04-09 10:38:30');

-- --------------------------------------------------------

--
-- Table structure for table `drone_missions`
--

CREATE TABLE `drone_missions` (
  `id` int(11) NOT NULL,
  `drone_id` int(10) UNSIGNED NOT NULL,
  `incident_id` varchar(30) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `status` varchar(50) DEFAULT 'started',
  `path_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`path_data`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `drone_missions`
--

INSERT INTO `drone_missions` (`id`, `drone_id`, `incident_id`, `start_time`, `end_time`, `status`, `path_data`, `created_at`) VALUES
(20, 1, 'INC-20260115-003', '2026-04-10 12:57:07', '2026-04-10 12:58:08', 'completed', NULL, '2026-04-10 07:27:07');

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
  `intensity_score` float DEFAULT NULL,
  `intensity_level` varchar(50) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(21, 'Central Fire Brigade (Lohiya Nagar)', 'STN-001', 18.5065396, 73.8656903, '2026-04-04 10:53:28'),
(22, 'Aundh Fire Station', 'STN-002', 18.5606921, 73.8142792, '2026-04-04 10:53:28'),
(23, 'Kothrud Fire Station', 'STN-003', 18.4990632, 73.8134913, '2026-04-04 10:53:28'),
(24, 'Yerwada Fire Station', 'STN-004', 18.5502944, 73.8791084, '2026-04-04 10:53:28'),
(26, 'Dayaram Rajguru Fire Station', 'STN-006', 18.5299150, 73.8706020, '2026-04-04 10:53:28'),
(28, 'Dandekar Pool Fire Station', 'STN-008', 18.4996141, 73.8478724, '2026-04-04 10:53:28'),
(29, 'Pashan Fire Station', 'STN-009', 18.5403089, 73.8027597, '2026-04-04 10:53:28'),
(30, 'Sinhgad Road Fire Station', 'STN-010', 18.4755075, 73.8156184, '2026-04-04 10:53:28'),
(31, 'Katraj Fire Station', 'STN-011', 18.4549341, 73.8570094, '2026-04-04 10:53:28'),
(32, 'Amanora Fire Station (Hadapsar)', 'STN-012', 18.5147822, 73.9453898, '2026-04-04 10:53:28'),
(33, 'Nanded City Fire Station', 'STN-013', 18.4602641, 73.7966310, '2026-04-04 10:53:28');

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
('INC-20251122-001', 'Vehicle Accident & Fire', 'Paud Road, Near Signal, Kothrud', 18.5074, 73.8077, 'Baner Fire Station', '2026-04-09 15:25:00', 'new', 1),
('INC-20251122-002', 'Warehouse Fire - Industrial Zone', 'Plot No. 45, Industrial Area, Katraj', 18.4445, 73.8521, 'Katraj Fire Station', '2026-04-09 14:10:00', 'completed', 0),
('INC-20260115-003', 'Residential Building Fire', 'Near Katraj Bus Depot, Pune', 18.45445378969955, 73.85859890802172, 'Katraj Fire Station', '2026-04-10 18:40:00', 'new', 1);

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
(9, 'DRN-001', 'SkyGuard-01', 'Katraj Fire Station', 'battery replacement', '2026-04-04', 'Amit Verma', 'scheduled', '2026-04-04 05:58:14'),
(10, 'DRN-001', 'SkyGuard-01', 'Katraj Fire Station', 'battery replacement', '2026-04-08', 'Amit Verma', 'scheduled', '2026-04-04 06:05:52');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `type`, `message`, `created_by`, `is_read`, `created_at`, `data`) VALUES
(16, 'maintenance', 'Maintenance scheduled for SkyGuard-01 (DRN-001) on 2026-04-08', 'Amit Verma', 1, '2026-04-04 06:05:52', '{\"drone_code\":\"DRN-001\",\"drone_name\":\"SkyGuard-01\",\"station\":\"Katraj Fire Station\",\"reported_by\":\"Amit Verma\",\"issue_description\":\"battery replacement\",\"scheduled_date\":\"2026-04-08\",\"status\":\"scheduled\"}');

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
(3, 'Quick Response Vehicle', 'Fire QRV', 'MH-12-KJ-1003', '0453aa40-80a0-11f0-902d-59ff54eea995', 'Katraj Fire Station', 'available', '2025-12-05 09:47:34', 'Katraj Fire Station'),
(6, 'Quick Response Vehicle', 'Fire QRV', 'MH-12-BN-2343', 'VTS-QRV-103', 'Baner Fire Station', 'available', '2025-12-05 09:47:34', 'Baner Fire Station'),
(9, 'Quick Response Vehicle', 'Fire QRV', 'MH-14-WJ-4513', 'VTS-QRV-203', 'Warje Fire Station', 'available', '2025-12-05 09:47:34', 'Warje Fire Station'),
(12, 'Quick Response Vehicles', 'Fire QRV', 'MH-12-YD-7783', 'VTS-QRV-303', 'Yerwada Fire Station', 'available', '2025-12-05 09:47:34', 'Yerwada Fire Station');

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
-- Indexes for table `drone_missions`
--
ALTER TABLE `drone_missions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `drone_id` (`drone_id`),
  ADD KEY `incident_id` (`incident_id`);

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
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `drones`
--
ALTER TABLE `drones`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

--
-- AUTO_INCREMENT for table `drone_gps_logs`
--
ALTER TABLE `drone_gps_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `drone_missions`
--
ALTER TABLE `drone_missions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `fire_detections`
--
ALTER TABLE `fire_detections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `fire_station`
--
ALTER TABLE `fire_station`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `maintenance_requests`
--
ALTER TABLE `maintenance_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

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

--
-- Constraints for dumped tables
--

--
-- Constraints for table `drone_missions`
--
ALTER TABLE `drone_missions`
  ADD CONSTRAINT `drone_missions_ibfk_1` FOREIGN KEY (`drone_id`) REFERENCES `drones` (`id`),
  ADD CONSTRAINT `drone_missions_ibfk_2` FOREIGN KEY (`incident_id`) REFERENCES `incidents` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
