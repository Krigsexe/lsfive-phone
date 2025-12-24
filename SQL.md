# LSFive Phone - Script d'Installation de la Base de Données

Ce fichier contient le script SQL complet nécessaire pour créer toutes les tables et structures requises pour le fonctionnement de la ressource `lsfive-phone`.

## Instructions

1. Ouvrez votre outil de gestion de base de données (par exemple, HeidiSQL, DBeaver, phpMyAdmin).
2. Sélectionnez la base de données de votre serveur FiveM.
3. Copiez et exécutez l'intégralité du script ci-dessous.

Cela créera les tables suivantes :
- `phone_users` - Données des utilisateurs du téléphone
- `phone_contacts` - Contacts des joueurs
- `phone_messages` - Messages SMS
- `phone_calls` - Historique des appels
- `phone_songs` - Bibliothèque musicale
- `phone_mails` - Emails
- `phone_social_posts` - Posts du réseau social
- `phone_dispatch_alerts` - Alertes dispatch (services d'urgence)
- `phone_bank_transactions` - Historique des transactions bancaires
- `phone_businesses` - Annuaire des entreprises

---

```sql
-- =============================================================================
-- LSFive Phone - Script SQL Complet
-- Version 2.0.0
-- Compatible: MySQL 5.7+, MariaDB 10.2+
-- =============================================================================

-- Table principale des utilisateurs du téléphone
CREATE TABLE IF NOT EXISTS `phone_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `identifier` varchar(60) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `email` varchar(255) DEFAULT 'me@ls.mail',
  `wallpaper` text DEFAULT NULL,
  `language` varchar(5) DEFAULT 'fr',
  `installed_apps` text DEFAULT '["phone","messages","settings","browser","bank","marketplace","camera","garage","dispatch","businesses","social","music","mail","weather"]',
  `dock_order` text DEFAULT '["phone","browser","messages","settings"]',
  `settings` text DEFAULT '{"theme":"dark","airplaneMode":false}',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `identifier` (`identifier`),
  UNIQUE KEY `phone_number` (`phone_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des contacts
CREATE TABLE IF NOT EXISTS `phone_contacts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `owner_identifier` varchar(60) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `avatar_url` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `owner_identifier` (`owner_identifier`),
  KEY `phone_number` (`phone_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des messages SMS
CREATE TABLE IF NOT EXISTS `phone_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_number` varchar(20) NOT NULL,
  `receiver_number` varchar(20) NOT NULL,
  `content` text NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `sender_number` (`sender_number`),
  KEY `receiver_number` (`receiver_number`),
  KEY `timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table de l'historique des appels
CREATE TABLE IF NOT EXISTS `phone_calls` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `caller_number` varchar(20) NOT NULL,
  `receiver_number` varchar(20) NOT NULL,
  `direction` enum('incoming','outgoing','missed') NOT NULL,
  `duration` int(11) DEFAULT 0,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_new` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `caller_number` (`caller_number`),
  KEY `receiver_number` (`receiver_number`),
  KEY `timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table de la bibliothèque musicale
CREATE TABLE IF NOT EXISTS `phone_songs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `owner_identifier` varchar(60) NOT NULL,
  `title` varchar(255) NOT NULL,
  `artist` varchar(255) NOT NULL,
  `url` text NOT NULL,
  `artwork` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `owner_identifier` (`owner_identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des emails
CREATE TABLE IF NOT EXISTS `phone_mails` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `owner_identifier` varchar(60) NOT NULL,
  `sender` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `owner_identifier` (`owner_identifier`),
  KEY `timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des posts du réseau social
CREATE TABLE IF NOT EXISTS `phone_social_posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `author_identifier` varchar(60) NOT NULL,
  `image_url` text NOT NULL,
  `caption` text,
  `likes` int(11) NOT NULL DEFAULT 0,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `author_identifier` (`author_identifier`),
  KEY `timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des likes sur les posts (pour éviter les doubles likes)
CREATE TABLE IF NOT EXISTS `phone_social_likes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `post_id` int(11) NOT NULL,
  `user_identifier` varchar(60) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_like` (`post_id`, `user_identifier`),
  KEY `post_id` (`post_id`),
  FOREIGN KEY (`post_id`) REFERENCES `phone_social_posts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des alertes dispatch (services d'urgence)
CREATE TABLE IF NOT EXISTS `phone_dispatch_alerts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `department` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `details` text NOT NULL,
  `location` varchar(255) NOT NULL,
  `coords_x` float DEFAULT NULL,
  `coords_y` float DEFAULT NULL,
  `coords_z` float DEFAULT NULL,
  `created_by` varchar(60) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `department` (`department`),
  KEY `timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des transactions bancaires (historique)
CREATE TABLE IF NOT EXISTS `phone_bank_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `identifier` varchar(60) NOT NULL,
  `amount` int(11) NOT NULL,
  `description` varchar(255) NOT NULL,
  `type` enum('credit','debit','transfer') DEFAULT 'transfer',
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `identifier` (`identifier`),
  KEY `timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des entreprises (annuaire)
CREATE TABLE IF NOT EXISTS `phone_businesses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` varchar(100) DEFAULT 'business',
  `owner` varchar(255) DEFAULT 'Unknown',
  `description` text,
  `logo_url` text,
  `phone_number` varchar(20) DEFAULT NULL,
  `location` text DEFAULT '{"x":0,"y":0,"z":0}',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `type` (`type`),
  KEY `is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des photos (galerie)
CREATE TABLE IF NOT EXISTS `phone_photos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `owner_identifier` varchar(60) NOT NULL,
  `url` text NOT NULL,
  `caption` varchar(255) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `owner_identifier` (`owner_identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des notes
CREATE TABLE IF NOT EXISTS `phone_notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `owner_identifier` varchar(60) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text,
  `color` varchar(20) DEFAULT 'yellow',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `owner_identifier` (`owner_identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- DONNÉES PAR DÉFAUT (Optionnel)
-- =============================================================================

-- Entreprises par défaut (exemples)
INSERT IGNORE INTO `phone_businesses` (`name`, `type`, `owner`, `description`, `location`) VALUES
('Los Santos Police Department', 'government', 'State', 'Services de police de Los Santos', '{"x":441.0,"y":-982.0,"z":30.7}'),
('Pillbox Medical Center', 'medical', 'State', 'Hôpital principal de Los Santos', '{"x":307.0,"y":-592.0,"z":43.3}'),
('Benny''s Original Motorworks', 'mechanic', 'Benny', 'Garage de customisation automobile', '{"x":-205.0,"y":-1311.0,"z":31.3}'),
('Digital Den', 'electronics', 'Unknown', 'Magasin d''électronique', '{"x":132.0,"y":-1089.0,"z":29.2}'),
('Vanilla Unicorn', 'entertainment', 'Unknown', 'Club de divertissement', '{"x":127.0,"y":-1278.0,"z":29.3}'),
('Burger Shot', 'restaurant', 'Franchise', 'Restaurant de fast-food', '{"x":-1196.0,"y":-891.0,"z":14.0}'),
('Tequi-la-la', 'bar', 'Unknown', 'Bar et boîte de nuit', '{"x":-565.0,"y":276.0,"z":83.1}'),
('Bank of Liberty', 'bank', 'State', 'Banque centrale de Los Santos', '{"x":150.0,"y":-1040.0,"z":29.4}');

-- =============================================================================
-- INDEX POUR OPTIMISATION (Recommandé pour gros serveurs)
-- =============================================================================

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS `idx_messages_conversation` ON `phone_messages` (`sender_number`, `receiver_number`);
CREATE INDEX IF NOT EXISTS `idx_calls_user` ON `phone_calls` (`caller_number`, `receiver_number`, `timestamp`);
CREATE INDEX IF NOT EXISTS `idx_users_phone` ON `phone_users` (`phone_number`);

-- =============================================================================
-- PROCÉDURE DE NETTOYAGE (Optionnel)
-- Exécutez cette procédure périodiquement pour nettoyer les anciennes données
-- =============================================================================

DELIMITER //

CREATE PROCEDURE IF NOT EXISTS `CleanupOldPhoneData`()
BEGIN
    -- Supprimer les alertes dispatch de plus de 7 jours
    DELETE FROM `phone_dispatch_alerts` WHERE `timestamp` < DATE_SUB(NOW(), INTERVAL 7 DAY);

    -- Supprimer les messages de plus de 30 jours
    DELETE FROM `phone_messages` WHERE `timestamp` < DATE_SUB(NOW(), INTERVAL 30 DAY);

    -- Supprimer les appels de plus de 30 jours
    DELETE FROM `phone_calls` WHERE `timestamp` < DATE_SUB(NOW(), INTERVAL 30 DAY);

    -- Supprimer les transactions bancaires de plus de 90 jours
    DELETE FROM `phone_bank_transactions` WHERE `timestamp` < DATE_SUB(NOW(), INTERVAL 90 DAY);
END //

DELIMITER ;

-- Pour exécuter le nettoyage manuellement: CALL CleanupOldPhoneData();
```

---

## Notes Importantes

### Compatibilité Framework

- **ESX**: La table `phone_users.identifier` correspond à `users.identifier`
- **QBCore**: La table `phone_users.identifier` correspond à `players.citizenid`
- **Standalone**: Utilise le license identifier du joueur

### Migration depuis une ancienne version

Si vous migrez depuis une ancienne version du téléphone, vous devrez peut-être exécuter des scripts de migration pour adapter vos données existantes.

### Sauvegarde

Avant d'exécuter ce script, **faites une sauvegarde de votre base de données** au cas où quelque chose se passerait mal.

### Performance

Pour les serveurs avec beaucoup de joueurs, pensez à:
1. Exécuter régulièrement la procédure `CleanupOldPhoneData()`
2. Augmenter les valeurs de configuration MySQL pour le buffer pool
3. Considérer la réplication pour les lectures

---

*Script généré pour LSFive Phone v2.0.0*
