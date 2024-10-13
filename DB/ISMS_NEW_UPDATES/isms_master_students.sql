-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: isms
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `master_students`
--

DROP TABLE IF EXISTS `master_students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `master_students` (
  `ms_studentid` varchar(12) NOT NULL,
  `ms_image` longtext,
  `ms_first_name` varchar(100) DEFAULT NULL,
  `ms_middle_name` varchar(50) DEFAULT NULL,
  `ms_last_name` varchar(100) DEFAULT NULL,
  `ms_preffix` varchar(10) DEFAULT NULL,
  `ms_date_of_birth` date DEFAULT NULL,
  `ms_email` varchar(100) DEFAULT NULL,
  `ms_gender` varchar(50) DEFAULT NULL,
  `ms_phone` varchar(15) DEFAULT NULL,
  `ms_city` text,
  `ms_baranggay` text,
  `ms_village` text,
  `ms_street` text,
  `ms_house_no` text,
  `ms_status` varchar(50) DEFAULT NULL,
  `ms_institutionid` varchar(300) NOT NULL,
  `ms_courseid` varchar(300) NOT NULL,
  `ms_academic_status` varchar(50) DEFAULT NULL,
  `ms_yearlevel` varchar(50) DEFAULT NULL,
  `ms_birthplace` varchar(100) DEFAULT NULL,
  `ms_age` int DEFAULT NULL,
  `ms_fathers_name` varchar(50) DEFAULT NULL,
  `ms_fathers_occupation` varchar(50) DEFAULT NULL,
  `ms_fathers_salary` varchar(50) DEFAULT NULL,
  `ms_mothers_name` varchar(50) DEFAULT NULL,
  `ms_mothers_occupation` varchar(50) DEFAULT NULL,
  `ms_mothers_salary` varchar(50) DEFAULT NULL,
  `ms_registerdate` datetime DEFAULT NULL,
  `ms_otp` varchar(6) DEFAULT NULL,
  `ms_grade_copy` longtext,
  `ms_registration_form` longtext,
  `ms_certificate_residency` longtext,
  `ms_itr` longtext,
  `ms_nfi` longtext,
  `ms_scholarshipid` int NOT NULL,
  `ms_first_sem_grade` varchar(50) DEFAULT NULL,
  `ms_second_sem_grade` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`ms_studentid`),
  UNIQUE KEY `ms_email` (`ms_email`),
  KEY `ms_institutionid` (`ms_institutionid`),
  KEY `fk_ms_courseid` (`ms_courseid`),
  KEY `fk_scholarship` (`ms_scholarshipid`),
  CONSTRAINT `fk_scholarship` FOREIGN KEY (`ms_scholarshipid`) REFERENCES `scholarship` (`s_scholarship_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `master_students`
--

LOCK TABLES `master_students` WRITE;
/*!40000 ALTER TABLE `master_students` DISABLE KEYS */;
/*!40000 ALTER TABLE `master_students` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-10-13 13:52:23
