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
-- Table structure for table `master_students_request`
--

DROP TABLE IF EXISTS `master_students_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `master_students_request` (
  `msr_requestid` int NOT NULL AUTO_INCREMENT,
  `msr_studentid` varchar(12) DEFAULT NULL,
  `msr_image` longtext,
  `msr_first_name` varchar(100) DEFAULT NULL,
  `msr_middle_name` varchar(50) DEFAULT NULL,
  `msr_last_name` varchar(100) DEFAULT NULL,
  `msr_preffix` varchar(10) DEFAULT NULL,
  `msr_date_of_birth` date DEFAULT NULL,
  `msr_email` varchar(100) DEFAULT NULL,
  `msr_gender` varchar(50) DEFAULT NULL,
  `msr_phone` varchar(15) DEFAULT NULL,
  `msr_city` text,
  `msr_baranggay` text,
  `msr_village` text,
  `msr_street` text,
  `msr_house_no` text,
  `msr_status` varchar(50) DEFAULT NULL,
  `msr_institutionid` varchar(300) DEFAULT NULL,
  `msr_courseid` varchar(300) DEFAULT NULL,
  `msr_academic_status` varchar(50) DEFAULT NULL,
  `msr_yearlevel` varchar(50) DEFAULT NULL,
  `msr_birthplace` varchar(100) DEFAULT NULL,
  `msr_age` int DEFAULT NULL,
  `msr_fathers_name` varchar(50) DEFAULT NULL,
  `msr_fathers_occupation` varchar(50) DEFAULT NULL,
  `msr_fathers_salary` varchar(50) DEFAULT NULL,
  `msr_mothers_name` varchar(50) DEFAULT NULL,
  `msr_mothers_occupation` varchar(50) DEFAULT NULL,
  `msr_mothers_salary` varchar(50) DEFAULT NULL,
  `msr_registerdate` datetime DEFAULT NULL,
  `msr_otp` varchar(6) DEFAULT NULL,
  `msr_grade_copy` longtext,
  `msr_registration_form` longtext,
  `msr_certificate_residency` longtext,
  `msr_itr` longtext,
  `msr_nfi` longtext,
  `msr_scholarshipid` int NOT NULL,
  `msr_first_sem_grade` varchar(50) DEFAULT NULL,
  `msr_second_sem_grade` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`msr_requestid`),
  KEY `msr_studentid` (`msr_studentid`),
  KEY `fk_request_scholarship` (`msr_scholarshipid`),
  CONSTRAINT `fk_request_scholarship` FOREIGN KEY (`msr_scholarshipid`) REFERENCES `scholarship` (`s_scholarship_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `master_students_request`
--

LOCK TABLES `master_students_request` WRITE;
/*!40000 ALTER TABLE `master_students_request` DISABLE KEYS */;
/*!40000 ALTER TABLE `master_students_request` ENABLE KEYS */;
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
