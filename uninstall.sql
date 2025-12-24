-- =============================================================================
-- LSFive Phone - Desinstallation SQL
-- Version 2.0.0 | Decembre 2025
--
-- ATTENTION: Ce script SUPPRIME DEFINITIVEMENT toutes les donnees du telephone!
-- Faites une sauvegarde avant d'executer ce script.
-- =============================================================================

-- Desactiver les verifications de cles etrangeres temporairement
SET FOREIGN_KEY_CHECKS = 0;

-- Suppression des tables dans l'ordre inverse de creation
DROP TABLE IF EXISTS `phone_notes`;
DROP TABLE IF EXISTS `phone_photos`;
DROP TABLE IF EXISTS `phone_businesses`;
DROP TABLE IF EXISTS `phone_bank_transactions`;
DROP TABLE IF EXISTS `phone_dispatch_alerts`;
DROP TABLE IF EXISTS `phone_social_likes`;
DROP TABLE IF EXISTS `phone_social_posts`;
DROP TABLE IF EXISTS `phone_mails`;
DROP TABLE IF EXISTS `phone_songs`;
DROP TABLE IF EXISTS `phone_calls`;
DROP TABLE IF EXISTS `phone_messages`;
DROP TABLE IF EXISTS `phone_contacts`;
DROP TABLE IF EXISTS `phone_users`;

-- Reactiver les verifications de cles etrangeres
SET FOREIGN_KEY_CHECKS = 1;

-- Suppression de la procedure de nettoyage si elle existe
DROP PROCEDURE IF EXISTS `CleanupOldPhoneData`;

-- =============================================================================
-- TERMINE
-- =============================================================================
SELECT 'LSFive Phone - Desinstallation terminee. Toutes les tables ont ete supprimees.' AS status;
