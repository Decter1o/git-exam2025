-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: test
-- ------------------------------------------------------
-- Server version	9.2.0

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
-- Table structure for table `admin_users`
--

DROP TABLE IF EXISTS `admin_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_users` (
  `ID` varchar(36) NOT NULL,
  `login` varchar(256) DEFAULT NULL,
  `password` varchar(256) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `password` (`password`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_users`
--

LOCK TABLES `admin_users` WRITE;
/*!40000 ALTER TABLE `admin_users` DISABLE KEYS */;
INSERT INTO `admin_users` VALUES ('550e8400-e29b-41d4-a716-446655440030','admin','adminpass');
/*!40000 ALTER TABLE `admin_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gym_memberships`
--

DROP TABLE IF EXISTS `gym_memberships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gym_memberships` (
  `id` varchar(36) NOT NULL,
  `membership_type` enum('нет абонемента','дневной','стандарт','безлимит') DEFAULT NULL,
  `duration` enum('нет абонемента','разовый','1 месяц','3 месяца','6 месяцев','1 год') DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `special_group` enum('нет абонемента','стандарт','золотой возраст') DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gym_memberships`
--

LOCK TABLES `gym_memberships` WRITE;
/*!40000 ALTER TABLE `gym_memberships` DISABLE KEYS */;
INSERT INTO `gym_memberships` VALUES ('13b3e12f-d329-4945-ae8b-06cddde96366','стандарт','3 месяца',36000.00,'стандарт'),('1730e531-c02b-4f78-9131-1eac5f19a1ef','дневной','3 месяца',26000.00,'стандарт'),('31128d78-1fc0-4ad8-93e6-392e43a7aa6a','дневной','1 месяц',8000.00,'золотой возраст'),('32cc8cec-c4f9-4917-bb01-0204395e1804','стандарт','6 месяцев',63000.00,'стандарт'),('342dec7f-540e-4ea4-970a-388965f61149','безлимит','1 месяц',21000.00,'стандарт'),('4674310c-ed70-4d3c-a0e7-a96a72bf6233','стандарт','1 месяц',15000.00,'стандарт'),('5b287a0f-75c4-4775-8aa5-e3f87029144c','дневной','6 месяцев',46000.00,'стандарт'),('5e0418c2-a44d-4a3d-87e4-60bb2af11c21','стандарт','1 месяц',11000.00,'золотой возраст'),('6823116d-ae8b-4944-acbe-9384a3c544d4','дневной','1 месяц',11000.00,'стандарт'),('6a44fac4-e2b2-4387-a394-11f0a0c801bc','стандарт','1 год',108000.00,'стандарт'),('77be041a-191a-11f0-adc7-04922657b53c','нет абонемента','нет абонемента',0.00,'нет абонемента'),('78fca3d5-6ef5-4d5c-b0b1-8afd8048b69e','дневной','разовый',3000.00,'стандарт'),('d039e0f4-b7ac-4cbc-8ae4-486f20723a70','дневной','1 год',79000.00,'стандарт'),('f5659af7-12ba-41dc-bee4-b60b8ccbf5bc','стандарт','разовый',4000.00,'стандарт');
/*!40000 ALTER TABLE `gym_memberships` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedule`
--

DROP TABLE IF EXISTS `schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedule` (
  `id` varchar(36) NOT NULL,
  `day_of_week` enum('Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `training_type_id` varchar(36) NOT NULL,
  `room_name` varchar(50) NOT NULL,
  `trainer` varchar(36) DEFAULT NULL,
  `category` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `training_type_id` (`training_type_id`),
  CONSTRAINT `schedule_ibfk_1` FOREIGN KEY (`training_type_id`) REFERENCES `training_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule`
--

LOCK TABLES `schedule` WRITE;
/*!40000 ALTER TABLE `schedule` DISABLE KEYS */;
/*!40000 ALTER TABLE `schedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trainer_photos`
--

DROP TABLE IF EXISTS `trainer_photos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trainer_photos` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `photo_url` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trainer_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trainer_photos`
--

LOCK TABLES `trainer_photos` WRITE;
/*!40000 ALTER TABLE `trainer_photos` DISABLE KEYS */;
INSERT INTO `trainer_photos` VALUES ('0f2bbfc8-244f-11f0-9181-04922657b53c','D:\\OSPanel\\domains\\localhost/img/b982ff81-31a7-4bd8-8149-0025ef5a0dd0_0.png','b982ff81-31a7-4bd8-8149-0025ef5a0dd0'),('0f34223f-244f-11f0-9181-04922657b53c','D:\\OSPanel\\domains\\localhost/img/b982ff81-31a7-4bd8-8149-0025ef5a0dd0_1.png','b982ff81-31a7-4bd8-8149-0025ef5a0dd0'),('0f3b6029-244f-11f0-9181-04922657b53c','D:\\OSPanel\\domains\\localhost/img/b982ff81-31a7-4bd8-8149-0025ef5a0dd0_2.png','b982ff81-31a7-4bd8-8149-0025ef5a0dd0');
/*!40000 ALTER TABLE `trainer_photos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trainers`
--

DROP TABLE IF EXISTS `trainers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trainers` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `surname` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `training_type` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone_number` varchar(11) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `instagram` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telegram` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `whatsapp` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trainers`
--

LOCK TABLES `trainers` WRITE;
/*!40000 ALTER TABLE `trainers` DISABLE KEYS */;
INSERT INTO `trainers` VALUES ('b982ff81-31a7-4bd8-8149-0025ef5a0dd0','Иван','Иванов','550e8400-e29b-41d4-a716-446655440004','78649523698','insta','telega','wp','qweqeqweqweqwe');
/*!40000 ALTER TABLE `trainers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `training_types`
--

DROP TABLE IF EXISTS `training_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `training_types` (
  `id` varchar(36) NOT NULL,
  `training_name` varchar(100) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `training_types`
--

LOCK TABLES `training_types` WRITE;
/*!40000 ALTER TABLE `training_types` DISABLE KEYS */;
INSERT INTO `training_types` VALUES ('289348d8-0eb4-44c9-ab22-0ae765f1fd94','Fitness Intensive','Интенсивная тренировка для всех уровней подготовки.'),('550e8400-e29b-41d4-a716-446655440003','Женская самооборона','Тренировка по самообороне для женщин.'),('550e8400-e29b-41d4-a716-446655440004','Йога','Занятие йогой для всех уровней.'),('550e8400-e29b-41d4-a716-446655440005','Primary Girl','Тренировка для девочек от 13 до 15 лет.'),('550e8400-e29b-41d4-a716-446655440006','Подростковый фитнес','Фитнес тренировка для подростков от 10 до 15 лет.');
/*!40000 ALTER TABLE `training_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visitor_memberships`
--

DROP TABLE IF EXISTS `visitor_memberships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visitor_memberships` (
  `id` varchar(36) NOT NULL,
  `visitor_id` varchar(36) NOT NULL,
  `membership_id` varchar(36) NOT NULL,
  `visits_left` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `visitor_id` (`visitor_id`),
  KEY `membership_id` (`membership_id`),
  CONSTRAINT `visitor_memberships_ibfk_1` FOREIGN KEY (`visitor_id`) REFERENCES `visitor_users` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `visitor_memberships_ibfk_2` FOREIGN KEY (`membership_id`) REFERENCES `gym_memberships` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visitor_memberships`
--

LOCK TABLES `visitor_memberships` WRITE;
/*!40000 ALTER TABLE `visitor_memberships` DISABLE KEYS */;
INSERT INTO `visitor_memberships` VALUES ('0a59ef8c-8049-4dec-b9f8-3a8aea5256ee','d9965b4a-4a0c-4bbd-8589-2c2e8bf48940','13b3e12f-d329-4945-ae8b-06cddde96366',36),('7f2e0b55-1e01-421e-814b-bd81b3b9330d','3046d579-45b1-433f-af64-05a18c099bd4','342dec7f-540e-4ea4-970a-388965f61149',12),('a814a4ca-f875-4615-b9e0-8ec67b068fce','933bdb50-b3da-4a96-a3d5-18e2d2546b64','6823116d-ae8b-4944-acbe-9384a3c544d4',12),('be7b32db-56d6-47dc-b1a8-af888fc50620','8b0a1c85-d3be-43b5-9419-f395499ce2a5','1730e531-c02b-4f78-9131-1eac5f19a1ef',36);
/*!40000 ALTER TABLE `visitor_memberships` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visitor_otp`
--

DROP TABLE IF EXISTS `visitor_otp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visitor_otp` (
  `ID` varchar(36) NOT NULL,
  `phone_number` varchar(11) NOT NULL,
  `otp` varchar(6) NOT NULL,
  `expires_at` timestamp NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `phone_number` (`phone_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visitor_otp`
--

LOCK TABLES `visitor_otp` WRITE;
/*!40000 ALTER TABLE `visitor_otp` DISABLE KEYS */;
INSERT INTO `visitor_otp` VALUES ('e9b1a39a-107c-11f0-af9d-e0d0455981ba','77478267536','QNKSIM','2025-04-03 12:12:10');
/*!40000 ALTER TABLE `visitor_otp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visitor_users`
--

DROP TABLE IF EXISTS `visitor_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visitor_users` (
  `ID` varchar(36) NOT NULL,
  `username` varchar(256) NOT NULL,
  `usersurname` varchar(256) NOT NULL,
  `phone_number` varchar(11) NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`ID`),
  UNIQUE KEY `phone_number` (`phone_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visitor_users`
--

LOCK TABLES `visitor_users` WRITE;
/*!40000 ALTER TABLE `visitor_users` DISABLE KEYS */;
INSERT INTO `visitor_users` VALUES ('3046d579-45b1-433f-af64-05a18c099bd4','Кирилл','Трищ','78649523698','1'),('8b0a1c85-d3be-43b5-9419-f395499ce2a5','Константин','Петренко','77478267536','1'),('933bdb50-b3da-4a96-a3d5-18e2d2546b64','Алмаз','Нуржанов','77715411411','1'),('d9965b4a-4a0c-4bbd-8589-2c2e8bf48940','Иван','Иванов','22222222223','1');
/*!40000 ALTER TABLE `visitor_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'test'
--

--
-- Dumping routines for database 'test'
--
/*!50003 DROP PROCEDURE IF EXISTS `CreateVisitor` */;
ALTER DATABASE `test` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `CreateVisitor`(
	IN v_id varchar(36),
    IN v_name VARCHAR(256),
    IN v_surname VARCHAR(256),
    IN v_phone_number VARCHAR(11),
    IN vm_membership_id VARCHAR(36),
    IN vm_id varchar (36),
    OUT p_status INT
)
BEGIN
    DECLARE m_duration VARCHAR(36);

    -- Получаем тип абонемента
    SELECT duration INTO m_duration 
    FROM gym_memberships 
    WHERE id = vm_membership_id;

    -- Вставляем нового пользователя
    INSERT INTO visitor_users (id, username, usersurname, phone_number) 
    VALUES (v_id, v_name, v_surname, v_phone_number);

    -- Вставляем информацию об абонементе
    INSERT INTO visitor_memberships (id, visitor_id, membership_id, visits_left) 
    VALUES (
        vm_id, 
        v_id, 
        vm_membership_id,
        CASE
            WHEN m_duration = 'разовый' THEN 1
            WHEN m_duration = '1 месяц' THEN 12
            WHEN m_duration = '3 месяца' THEN 36
            WHEN m_duration = '6 месяцев' THEN 72
            WHEN m_duration = '1 год' THEN 144
            ELSE 0
        END
    );

    -- Возвращаем статус 1 — успех
    SET p_status = 1;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
ALTER DATABASE `test` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ;
/*!50003 DROP PROCEDURE IF EXISTS `DeleteVisitor` */;
ALTER DATABASE `test` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `DeleteVisitor`(
    IN v_id VARCHAR(36),
    OUT p_status INT
)
BEGIN
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
    END;

    START TRANSACTION;
    
    DELETE FROM visitor_memberships WHERE visitor_id = v_id;
    DELETE FROM visitor_users WHERE ID = v_id;
    
    COMMIT;

    -- Возвращаем статус 1 — успех
    SET p_status = 1;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
ALTER DATABASE `test` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ;
/*!50003 DROP PROCEDURE IF EXISTS `InsertOTP` */;
ALTER DATABASE `test` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `InsertOTP`( 
    IN p_phone VARCHAR(11),
    IN p_otp VARCHAR(6),
    OUT p_status INT
)
BEGIN
    -- Вставка или обновление OTP
    INSERT INTO visitor_otp (ID, phone_number, otp, expires_at) 
    VALUES (UUID(), p_phone, p_otp, NOW() + INTERVAL 5 MINUTE)
    ON DUPLICATE KEY UPDATE 
        OTP = p_otp,
        expires_at = NOW() + INTERVAL 5 MINUTE;

    -- Проверяем, было ли изменение
    IF ROW_COUNT() > 0 THEN
        SET p_status = 1;  -- Успех
    ELSE
        SET p_status = 0;  -- Ошибка
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
ALTER DATABASE `test` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ;
/*!50003 DROP PROCEDURE IF EXISTS `UpdateVisitor` */;
ALTER DATABASE `test` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `UpdateVisitor`(
    IN v_id VARCHAR(36),
    IN v_name VARCHAR(256),
    IN v_surname VARCHAR(256),
    IN v_phone_number VARCHAR(11),
    IN vm_membership_id VARCHAR(36),
    IN vm_id VARCHAR(36),
    OUT p_status INT
)
BEGIN
    DECLARE m_duration VARCHAR(36);

    -- Получаем тип абонемента
    SELECT duration INTO m_duration 
    FROM gym_memberships 
    WHERE id = vm_membership_id;

    -- Обновляем данные пользователя
    UPDATE visitor_users
    SET 
        username = v_name,
        usersurname = v_surname,
        phone_number = v_phone_number
    WHERE id = v_id;

    -- Обновляем информацию об абонементе
    UPDATE visitor_memberships
    SET 
        membership_id = vm_membership_id,
        visits_left = CASE
            WHEN m_duration = 'разовый' THEN 1
            WHEN m_duration = '1 месяц' THEN 12
            WHEN m_duration = '3 месяца' THEN 36
            WHEN m_duration = '6 месяцев' THEN 72
            WHEN m_duration = '1 год' THEN 144
            ELSE 0
        END
    WHERE id = vm_id AND visitor_id = v_id;

    -- Возвращаем статус 1 — успех
    SET p_status = 1;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
ALTER DATABASE `test` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-28 22:44:57
