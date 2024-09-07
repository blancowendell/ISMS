-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: isms
-- ------------------------------------------------------
-- Server version	8.0.36

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
-- Table structure for table `master_courses`
--

DROP TABLE IF EXISTS `master_courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `master_courses` (
  `mc_course_id` int NOT NULL AUTO_INCREMENT,
  `mc_name_code` varchar(50) DEFAULT NULL,
  `mc_description` text,
  `mc_institutionsid` int NOT NULL,
  `mc_type` varchar(50) DEFAULT NULL,
  `mc_term` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`mc_course_id`),
  KEY `mc_institutionsid` (`mc_institutionsid`),
  CONSTRAINT `master_courses_ibfk_1` FOREIGN KEY (`mc_institutionsid`) REFERENCES `master_institutions` (`mi_institutionsid`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `master_courses`
--

LOCK TABLES `master_courses` WRITE;
/*!40000 ALTER TABLE `master_courses` DISABLE KEYS */;
INSERT INTO `master_courses` VALUES (1,'BSIT','Bachelor of Science in Information Technology',1,'Bachelors Degree','4 Years'),(2,'Pschology',NULL,3,NULL,NULL),(3,'Criminology',NULL,4,NULL,NULL),(4,'BSMT',NULL,5,NULL,NULL);
/*!40000 ALTER TABLE `master_courses` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-09-07 11:26:32
