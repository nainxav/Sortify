-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.30 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for cloudtubes
CREATE DATABASE IF NOT EXISTS `cloudtubes` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `cloudtubes`;

-- Dumping structure for table cloudtubes.pickup
CREATE TABLE IF NOT EXISTS `pickup` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` datetime DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `berat_organik` float DEFAULT NULL,
  `berat_anorganik` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `pickup_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table cloudtubes.pickup: ~3 rows (approximately)
INSERT INTO `pickup` (`id`, `user_id`, `status`, `created_at`, `completed_at`, `photo`, `berat_organik`, `berat_anorganik`) VALUES
	(1, 1, 'Done', '2025-06-17 09:13:13', '2025-08-17 16:13:15', NULL, 20, 10),
	(2, 18, 'Cancelled', '2025-06-17 09:13:55', '2025-06-17 21:13:57', NULL, NULL, NULL),
	(3, 8, 'Pending', '2025-06-17 09:45:56', '2025-06-19 16:45:52', NULL, NULL, NULL);

-- Dumping structure for table cloudtubes.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `is_admin` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT (now()),
  `updated_at` datetime DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `longitude` float DEFAULT NULL,
  `latitude` float DEFAULT NULL,
  `alamat` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table cloudtubes.users: ~5 rows (approximately)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `is_admin`, `created_at`, `updated_at`, `photo`, `longitude`, `latitude`, `alamat`) VALUES
	(1, 'zufar', 'zufar@gmail.com', '$2a$14$LmaXt2HXnlGnLAgKq/OGkOXpSmlUTWJg0Ah4Io0Tl2Dr.Rkxaneqq', 0, '2025-06-05 08:13:22', NULL, NULL, 0, NULL, NULL),
	(8, 'zufarshafira', 'asdf@gmail.com', '$2a$14$Q1TjQ0Y7tlFZzwm44IoBJO9A1h6rD1wBrpB/pf1vNsC4MDTRpK9a.', 0, '2025-06-07 12:12:24', NULL, NULL, 0, NULL, NULL),
	(10, 'zufarshafira', 'asdf2@gmail.com', '$2a$14$3XeCSHRKcjDry6bMzvLil.gHl/q/OIWvv2ORdyPwfPtDgeBAOVSmu', 0, '2025-06-07 12:15:05', NULL, NULL, 0, NULL, NULL),
	(11, 'admin', 'admin@gmail.com', '$2a$14$WckvUrKxr0ivasSQHXwvnugmnQSCOalP04bmYIuRcViHzPrOoFL.u', 1, '2025-06-13 06:30:11', NULL, NULL, NULL, NULL, NULL),
	(18, 'shafira', 'shafira@gmail.com', '$2a$14$OpxUkxzsS7aOW7Somlmea.6Ex0Wmzu4/D35JT/.i3hZsak2eAebRO', 0, '2025-06-17 16:01:08', NULL, NULL, NULL, NULL, NULL);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
