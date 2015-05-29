-- MySQL dump 10.13  Distrib 5.6.19, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: crawler_book
-- ------------------------------------------------------
-- Server version	5.6.19-0ubuntu0.14.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `book`
--

DROP TABLE IF EXISTS `book`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `book` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `kuaidu_id` varchar(45) DEFAULT NULL,
  `name` varchar(500) DEFAULT NULL,
  `author` varchar(500) DEFAULT NULL,
  `cate` varchar(255) DEFAULT NULL,
  `cate_code` varchar(45) DEFAULT NULL,
  `status` int(11) DEFAULT NULL COMMENT '0连载中，1完结',
  `kuaidu_img` int(11) DEFAULT NULL COMMENT '0无封面，1有封面',
  `description` varchar(5000) DEFAULT NULL,
  `catalog_t` varchar(45) DEFAULT NULL COMMENT 'catalog的id',
  `chapter_c` varchar(45) DEFAULT NULL COMMENT 'catalog的总数',
  `chapter_i` varchar(45) DEFAULT NULL COMMENT 'catalog的最大id',
  `chapter_n` varchar(45) DEFAULT NULL COMMENT '最新章节',
  `word` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `kuaidu_id` (`kuaidu_id`),
  KEY `kuaidu_name` (`name`(255))
) ENGINE=InnoDB AUTO_INCREMENT=22840 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `book_catalog`
--

DROP TABLE IF EXISTS `book_catalog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `book_catalog` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `kuaidu_id` varchar(45) DEFAULT NULL,
  `name` varchar(500) DEFAULT NULL,
  `catalog_t` varchar(45) DEFAULT NULL,
  `cid_i` int(11) DEFAULT NULL,
  `cid_n` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `kuaidu_id` (`kuaidu_id`),
  KEY `kuaidu_name` (`name`(255))
) ENGINE=InnoDB AUTO_INCREMENT=1935410 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `book_chapter`
--

DROP TABLE IF EXISTS `book_chapter`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `book_chapter` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `book_id` int(11) DEFAULT NULL,
  `chapter_name` varchar(255) DEFAULT NULL,
  `order` int(11) DEFAULT NULL,
  `crawler_url` varchar(500) DEFAULT NULL,
  `couch_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cate_code` varchar(45) DEFAULT NULL,
  `description` varchar(5000) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-05-29 10:34:06
