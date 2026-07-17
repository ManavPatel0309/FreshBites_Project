-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: freshbites
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'Manav Admin','mp0720853@gmail.com','Mr.Manav3925@#','2026-06-26 18:41:09');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `foods`
--

DROP TABLE IF EXISTS `foods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `foods` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `image` text,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `foods`
--

LOCK TABLES `foods` WRITE;
/*!40000 ALTER TABLE `foods` DISABLE KEYS */;
INSERT INTO `foods` VALUES (2,'CoCa-CoLa',1.00,'Drink','https://images.pexels.com/photos/7429792/pexels-photo-7429792.jpeg?cs=srgb&dl=pexels-hadis-7429792.jpg&fm=jpg','','2026-06-26 17:06:00');
/*!40000 ALTER TABLE `foods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `food_id` varchar(100) DEFAULT NULL,
  `title` varchar(150) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `image` text,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,'1','Chicken Burger',24.00,1,'https://react-food-project-five.vercel.app/static/media/product_01.6be97a612b580d595585.jpg'),(2,1,'backend-2','CoCa-CoLa',40.00,1,'https://images.pexels.com/photos/7429792/pexels-photo-7429792.jpeg?cs=srgb&dl=pexels-hadis-7429792.jpg&fm=jpg'),(3,2,'1','Chicken Burger',24.00,1,'https://react-food-project-five.vercel.app/static/media/product_01.6be97a612b580d595585.jpg'),(4,3,'1','Chicken Burger',24.00,1,'https://react-food-project-five.vercel.app/static/media/product_01.6be97a612b580d595585.jpg'),(5,4,'1','Chicken Burger',24.00,1,'https://react-food-project-five.vercel.app/static/media/product_01.6be97a612b580d595585.jpg'),(6,5,'1','Chicken Burger',24.00,1,'https://react-food-project-five.vercel.app/static/media/product_01.6be97a612b580d595585.jpg'),(7,6,'1','Chicken Burger',24.00,1,'https://react-food-project-five.vercel.app/static/media/product_01.6be97a612b580d595585.jpg'),(8,7,'1','Chicken Burger',24.00,1,'https://react-food-project-five.vercel.app/static/media/product_01.6be97a612b580d595585.jpg'),(9,8,'1','Chicken Burger',24.00,1,'https://react-food-project-five.vercel.app/static/media/product_01.6be97a612b580d595585.jpg'),(10,9,'1','Chicken Burger',24.00,1,'https://react-food-project-five.vercel.app/static/media/product_01.6be97a612b580d595585.jpg'),(11,10,'1','Chicken Burger',24.00,1,'https://react-food-project-five.vercel.app/static/media/product_01.6be97a612b580d595585.jpg'),(12,11,'backend-2','CoCa-CoLa',1.00,1,'https://images.pexels.com/photos/7429792/pexels-photo-7429792.jpeg?cs=srgb&dl=pexels-hadis-7429792.jpg&fm=jpg'),(13,12,'1','Chicken Burger',24.00,1,'https://react-food-project-five.vercel.app/static/media/product_01.6be97a612b580d595585.jpg'),(14,13,'2','Vegetarian Pizza',115.00,2,'https://react-food-project-five.vercel.app/static/media/product_2.1.f15385546f60c8d0f0d9.jpg');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `user_email` varchar(150) DEFAULT NULL,
  `customer_name` varchar(150) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pin_code` varchar(20) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `gst` decimal(10,2) DEFAULT NULL,
  `delivery_fee` decimal(10,2) DEFAULT NULL,
  `discount` decimal(10,2) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `status` varchar(100) DEFAULT 'Preparing ?',
  `is_active` tinyint(1) DEFAULT '1',
  `order_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `rider_id` int DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,6,'smpicgls22manav0309@gmail.com','Manav Patel','09979329978','Mahakali Mandir Road','Himatanagar','Gujarat','383001','cod',64.00,3.20,30.00,0.00,97.20,'Cancelled ?',0,'2026-06-26 18:42:31',1,NULL,'2026-07-04 22:20:10'),(2,2,'mp0720853@gmail.com','Manav Patel','09979329978','Mahakali Mandir Road','Himatanagar','Gujarat','383001','cod',24.00,1.20,30.00,0.00,55.20,'Cancelled ?',0,'2026-07-04 16:40:48',NULL,NULL,'2026-07-04 22:20:10'),(3,2,'mp0720853@gmail.com','Manav Patel','09979329978','Mahakali Mandir Road','Himatanagar','Gujarat','383001','cod',24.00,1.20,30.00,0.00,55.20,'Cancelled ❌',0,'2026-07-04 16:59:15',1,NULL,'2026-07-14 23:30:55'),(4,2,'mp0720853@gmail.com','Manav Patel','09979329978','Mahakali Mandir Road','Himatanagar','Gujarat','383001','cod',24.00,1.20,30.00,0.00,55.20,'Cancelled ❌',0,'2026-07-04 17:04:45',1,NULL,'2026-07-04 22:43:43'),(5,2,'mp0720853@gmail.com','Manav Patel','09979329978','Mahakali Mandir Road','Himatanagar','Gujarat','383001','cod',24.00,1.20,30.00,0.00,55.20,'Cancelled ❌',0,'2026-07-04 17:14:59',NULL,NULL,'2026-07-04 22:45:08'),(6,2,'mp0720853@gmail.com','Manav Patel','09979329978','Mahakali Mandir Road','Himatanagar','Gujarat','383001','cod',24.00,1.20,30.00,0.00,55.20,'Delivered ✅',0,'2026-07-04 17:16:08',NULL,'2026-07-04 22:47:18',NULL),(7,2,'mp0720853@gmail.com','Manav Patel','09979329978','Mahakali Mandir Road','Himatanagar','Gujarat','383001','cod',24.00,1.20,30.00,0.00,55.20,'Cancelled ❌',0,'2026-07-04 17:27:04',1,NULL,'2026-07-04 22:57:27'),(8,2,'mp0720853@gmail.com','Manav Patel','09979329978','Mahakali Mandir Road','Himatanagar','Gujarat','383001','cod',24.00,1.20,30.00,0.00,55.20,'Cancelled ❌',0,'2026-07-09 13:45:52',1,NULL,'2026-07-09 19:17:40'),(9,2,'mp0720853@gmail.com','Manav Patel','09979329978','Mahakali Mandir Road','Himatanagar','Gujarat','383001','cod',24.00,1.20,30.00,0.00,55.20,'Cancelled ❌',0,'2026-07-09 13:47:55',1,NULL,'2026-07-09 19:18:11'),(10,2,'mp0720853@gmail.com','Manav Patel','09979329978','Mahakali Mandir Road','Himatanagar','Gujarat','383001','wallet',24.00,1.20,30.00,0.00,55.20,'Cancelled ❌',0,'2026-07-09 16:28:40',1,NULL,'2026-07-09 21:58:48'),(11,2,'mp0720853@gmail.com','Manav Patel','09979329978','Mahakali Mandir Road','Himatanagar','Gujarat','383001','upi',1.00,0.05,30.00,0.00,31.05,'Cancelled ❌',0,'2026-07-14 17:43:39',1,NULL,'2026-07-14 23:13:48'),(12,2,'mp0720853@gmail.com','Manav Patel','09979329978','Mahakali Mandir Road','Himatanagar','Gujarat','383001','upi',24.00,1.20,30.00,0.00,55.20,'Cancelled ❌',0,'2026-07-14 18:00:21',1,NULL,'2026-07-14 23:30:29'),(13,2,'mp0720853@gmail.com','Manav PatelManav Patel','09979329978','Mahakali Mandir Road','Himatanagar','Gujarat','383001','cod',230.00,11.50,30.00,0.00,271.50,'Cancelled ❌',0,'2026-07-15 11:33:19',1,NULL,'2026-07-15 17:03:28');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_orders`
--

DROP TABLE IF EXISTS `payment_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `receipt` varchar(100) DEFAULT NULL,
  `razorpay_order_id` varchar(100) DEFAULT NULL,
  `razorpay_payment_id` varchar(100) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `currency` varchar(10) DEFAULT 'INR',
  `status` varchar(50) DEFAULT 'created',
  `pending_order_json` longtext,
  `freshbites_order_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `paid_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `razorpay_order_id` (`razorpay_order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_orders`
--

LOCK TABLES `payment_orders` WRITE;
/*!40000 ALTER TABLE `payment_orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `riders`
--

DROP TABLE IF EXISTS `riders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `riders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Available',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `vehicle` varchar(100) DEFAULT '',
  `location` varchar(255) DEFAULT '',
  `assigned_order_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `riders`
--

LOCK TABLES `riders` WRITE;
/*!40000 ALTER TABLE `riders` DISABLE KEYS */;
INSERT INTO `riders` VALUES (1,'Manoj Rider','9173236125','Available','2026-06-26 18:22:03','GJ-09-MH-5736','Ahmedabad',NULL),(2,'suresh rider','9979329978','Available','2026-07-09 13:46:44','GJ09MH9253','Ahemdabad',NULL);
/*!40000 ALTER TABLE `riders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `alt_phone` varchar(20) DEFAULT NULL,
  `age` int DEFAULT NULL,
  `profile_photo` longtext,
  `wallet_balance` decimal(10,2) DEFAULT '0.00',
  `dob` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'Manav Patel','mp0720853@gmail.com','$2b$10$f5YxQ20/XKDP0GX8qn0CrOlIjIJq3a6FdzvkBxFDsRl.cpd4dOpPi','2026-06-17 09:59:32','9979329978','Mahakali Mandir Road','9979329978',21,NULL,100.80,NULL),(3,'Bhargav Makasana','bhargavmakasana@gmail.com','$2b$10$68ZnQFczYccX7av5Z3N7GuX3yvxhKge3vKR6/0ikoiFB2p39i3UwS','2026-06-19 17:03:24','','','',NULL,NULL,19000.00,NULL),(4,'Shrey','shreybluebox@gmail.com','$2b$10$NK9Wf/mOHxAfAn/i.9KKsOMay7TWGYHm8wNQazGowP5o8ch25LLoq','2026-06-20 17:15:06','8160706899',NULL,NULL,NULL,NULL,0.00,NULL),(5,'lucifer','lucifer03092005@gmail.com','$2b$10$0o04oBPiHfYqHjyOLXfGk.1SmzEGFxM/VOo7s3SR72fM9tORa1k2O','2026-06-20 17:25:02','9979329978','Mahakali Mandir Road','09979329978',NULL,'',0.00,NULL),(6,'Manav Patel','smpicgls22manav0309@gmail.com','$2b$10$smXPJUgau/E8HKCdxs/wl.c3BX3hO18FK8FpXw8vWzT0A.a4YGtmS','2026-06-26 17:56:25','',NULL,NULL,NULL,NULL,0.00,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wallet_transactions`
--

DROP TABLE IF EXISTS `wallet_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wallet_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `old_balance` decimal(10,2) DEFAULT '0.00',
  `new_balance` decimal(10,2) DEFAULT '0.00',
  `note` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wallet_transactions`
--

LOCK TABLES `wallet_transactions` WRITE;
/*!40000 ALTER TABLE `wallet_transactions` DISABLE KEYS */;
INSERT INTO `wallet_transactions` VALUES (1,2,100.00,'add','admin','2026-07-09 16:28:13',0.00,100.00,'Admin added wallet money'),(2,2,55.20,'deduct','wallet','2026-07-09 16:28:40',100.00,44.80,'Order payment'),(3,2,100.00,'add','admin','2026-07-13 17:48:25',44.80,144.80,'Admin added wallet money'),(4,2,44.00,'deduct','admin','2026-07-15 11:20:54',144.80,100.80,'Admin deducted wallet money');
/*!40000 ALTER TABLE `wallet_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'freshbites'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-17 15:42:05
