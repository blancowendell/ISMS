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
-- Table structure for table `student_qrcode`
--

DROP TABLE IF EXISTS `student_qrcode`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_qrcode` (
  `sq_id` int NOT NULL AUTO_INCREMENT,
  `sq_studentid` varchar(12) NOT NULL,
  `sq_image` longtext NOT NULL,
  `sq_createdate` datetime NOT NULL,
  `sq_createby` varchar(50) NOT NULL,
  `sq_status` varchar(10) NOT NULL,
  PRIMARY KEY (`sq_id`),
  KEY `sq_studentid` (`sq_studentid`),
  CONSTRAINT `student_qrcode_ibfk_1` FOREIGN KEY (`sq_studentid`) REFERENCES `master_students` (`ms_studentid`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_qrcode`
--

LOCK TABLES `student_qrcode` WRITE;
/*!40000 ALTER TABLE `student_qrcode` DISABLE KEYS */;
INSERT INTO `student_qrcode` VALUES (7,'240901','data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAAKrSURBVO3BQW7sWAwEwSxC979yjpdcPUCQusfmZ0T8wRqjWKMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYoFw8l4ZtUuiQ8oXKShG9SeaJYoxRrlGKNcvEylTcl4USlS8KJyhMqb0rCm4o1SrFGKdYoFx+WhDtU7kjCiUqXhE7liSTcofJJxRqlWKMUa5SLP07lJAn/kmKNUqxRijXKxTBJOFHpktCp/GXFGqVYoxRrlIsPU/mkJDyh8oTKb1KsUYo1SrFGuXhZEv5PKl0STpLQqZwk4Tcr1ijFGqVYo8QfDJaEE5VJijVKsUYp1igXDyWhU+mS0KnckYQTlS4JdyShUzlJQqdykoROpUtCp/JEsUYp1ijFGuXiZUnoVLokdCpdEjqVO1S6JHQqb0pCp9KpfFOxRinWKMUa5eIhlZMk3KHSJaFT+aQkdCp3JOFEpVN5U7FGKdYoxRrl4qEknKh0SThJQqfyhMpJEjqVLgmdyhNJ6FTeVKxRijVKsUaJP3hREjqVO5Jwh0qXhBOVkyR0Kk8koVPpktCpPFGsUYo1SrFGiT/4w5JwotIloVO5Iwmdym9SrFGKNUqxRrl4KAnfpPKmJNyh0iXhRKVLQqfypmKNUqxRijXKxctU3pSEE5UuCXeoPKFyh0qXhE7liWKNUqxRijXKxYcl4Q6VJ1S6JJwk4ZtUPqlYoxRrlGKNcjFMEk5UfhOVNxVrlGKNUqxRLv64JHQqTyThROUkCU+oPFGsUYo1SrFGufgwlU9S6ZJwotIloVM5SUKncqJykoQ3FWuUYo1SrFEuXpaEb0pCp3KHSpeEJ1ROkvBJxRqlWKMUa5T4gzVGsUYp1ijFGqVYoxRrlGKNUqxRijVKsUYp1ijFGqVYoxRrlGKNUqxR/gOCEwroRCOrWgAAAABJRU5ErkJggg==','2024-09-02 16:22:50','system','Active');
/*!40000 ALTER TABLE `student_qrcode` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-09-02 16:27:32
