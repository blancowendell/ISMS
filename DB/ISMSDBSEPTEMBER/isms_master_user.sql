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
-- Table structure for table `master_user`
--

DROP TABLE IF EXISTS `master_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `master_user` (
  `mu_userid` int NOT NULL AUTO_INCREMENT,
  `mu_studentid` varchar(9) DEFAULT NULL,
  `mu_accesstypeid` int DEFAULT NULL,
  `mu_username` varchar(300) DEFAULT NULL,
  `mu_password` text,
  `mu_createby` varchar(20) DEFAULT NULL,
  `mu_createdate` varchar(20) DEFAULT NULL,
  `mu_status` varchar(20) DEFAULT NULL,
  `mu_reset_token` varchar(255) DEFAULT NULL,
  `mu_reset_token_expiry` datetime DEFAULT NULL,
  `mu_email` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`mu_userid`),
  KEY `mu_studentid` (`mu_studentid`),
  KEY `fk_mu_accesstypeid` (`mu_accesstypeid`),
  CONSTRAINT `fk_mu_accesstypeid` FOREIGN KEY (`mu_accesstypeid`) REFERENCES `master_access` (`ma_accessid`),
  CONSTRAINT `master_user_ibfk_2` FOREIGN KEY (`mu_studentid`) REFERENCES `master_students` (`ms_studentid`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `master_user`
--

LOCK TABLES `master_user` WRITE;
/*!40000 ALTER TABLE `master_user` DISABLE KEYS */;
INSERT INTO `master_user` VALUES (15,'240901',2,'johndoe','b4aed424cd9a72e754f8b9051ea112d6',NULL,'2024-09-02 14:14','Active',NULL,NULL,'blanco.wendell15@gmail.com');
/*!40000 ALTER TABLE `master_user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-09-02 16:27:33
