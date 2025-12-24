--[[
    LSFive Phone - Configuration
    Modifiez ces paramètres selon vos besoins
]]

Config = {}

-- =============================================================================
-- PARAMÈTRES GÉNÉRAUX
-- =============================================================================

-- Commande pour ouvrir le téléphone (mettre à false pour désactiver)
Config.Command = 'phone'

-- Touche pour ouvrir le téléphone (F1, F2, etc.)
Config.Keybind = 'F1'

-- Description de la touche (affichée dans les paramètres FiveM)
Config.KeybindDescription = 'Ouvrir le téléphone'

-- =============================================================================
-- DÉTECTION AUTOMATIQUE DU FRAMEWORK
-- =============================================================================
-- Options: 'auto', 'esx', 'qb-core', 'standalone'
-- 'auto' détectera automatiquement le framework au démarrage
Config.Framework = 'auto'

-- =============================================================================
-- PARAMÈTRES PAR DÉFAUT
-- =============================================================================

-- Langue par défaut ('en' ou 'fr')
Config.DefaultLanguage = 'fr'

-- Fond d'écran par défaut pour les nouveaux utilisateurs
Config.DefaultWallpaper = 'https://i.pinimg.com/originals/8c/f4/98/8cf498ef295f66b4f987405af2d810c3.jpg'

-- Thème par défaut ('dark' ou 'light')
Config.DefaultTheme = 'dark'

-- Email par défaut
Config.DefaultEmail = 'me@ls.mail'

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================

-- Utiliser les notifications ox_lib (true) ou les notifications FiveM basiques (false)
Config.UseOxLibNotifications = true

-- Durée des notifications (en millisecondes)
Config.NotificationDuration = 5000

-- =============================================================================
-- NUMÉROS DE TÉLÉPHONE
-- =============================================================================

-- Format du numéro de téléphone (# sera remplacé par un chiffre aléatoire)
-- Exemples: '555-####', '06########', '###-###-####'
Config.PhoneNumberFormat = '555-####'

-- =============================================================================
-- APPLICATIONS
-- =============================================================================

-- Applications installées par défaut (IDs)
Config.DefaultInstalledApps = {
    'phone',
    'messages',
    'settings',
    'browser',
    'bank',
    'marketplace',
    'camera',
    'garage',
    'dispatch',
    'businesses',
    'social',
    'music',
    'mail',
    'weather'
}

-- Applications du dock par défaut (max 4)
Config.DefaultDockApps = {
    'phone',
    'browser',
    'messages',
    'settings'
}

-- =============================================================================
-- APPLICATIONS MÉTIER (JOB-SPECIFIC)
-- =============================================================================

-- Applications spécifiques aux métiers
-- Format: { appId = { 'job1', 'job2' } }
Config.JobApps = {
    ['mdt'] = { 'police', 'sheriff', 'fbi', 'doj' },
    ['meditab'] = { 'ambulance', 'doctor', 'ems' },
    ['mechatab'] = { 'mechanic', 'bennys', 'tuner' }
}

-- =============================================================================
-- BANQUE
-- =============================================================================

-- Nom du compte utilisé pour les virements ('bank', 'money', etc.)
-- Dépend de votre framework
Config.BankAccountName = 'bank'

-- Activer les virements hors-ligne (vers des joueurs déconnectés)
Config.AllowOfflineTransfers = true

-- Frais de virement (en pourcentage, 0 = pas de frais)
Config.TransferFee = 0

-- =============================================================================
-- GARAGE
-- =============================================================================

-- Activer la sortie de véhicule depuis le téléphone
Config.EnableGarageSpawn = true

-- Distance maximale pour faire apparaître un véhicule (en mètres)
Config.GarageSpawnDistance = 10.0

-- =============================================================================
-- DISPATCH (Services d'urgence)
-- =============================================================================

-- Métiers autorisés à voir les alertes dispatch
Config.DispatchJobs = {
    police = true,
    sheriff = true,
    ambulance = true,
    fire = true,
    ems = true
}

-- Durée de vie des alertes dispatch (en secondes, 0 = permanent)
Config.DispatchAlertLifetime = 300

-- =============================================================================
-- SOCIAL (Réseau social)
-- =============================================================================

-- Nombre maximum de posts affichés
Config.MaxSocialPosts = 50

-- Autoriser les posts anonymes
Config.AllowAnonymousPosts = false

-- =============================================================================
-- MUSIQUE
-- =============================================================================

-- Autoriser les URLs YouTube
Config.AllowYouTube = true

-- Autoriser les URLs audio directes
Config.AllowDirectAudio = true

-- =============================================================================
-- MÉTÉO
-- =============================================================================

-- Ville par défaut pour la météo (utilisé avec wttr.in)
Config.WeatherCity = 'Los Angeles'

-- Utiliser Celsius (true) ou Fahrenheit (false)
Config.UseCelsius = true

-- =============================================================================
-- APPELS VOCAUX
-- =============================================================================

-- Activer les appels vocaux (nécessite pma-voice ou mumble-voip)
Config.EnableVoiceCalls = true

-- Canal vocal pour les appels (pma-voice)
Config.VoiceCallChannel = 'phone'

-- =============================================================================
-- MESSAGES
-- =============================================================================

-- Nombre maximum de messages par conversation
Config.MaxMessagesPerConversation = 100

-- Activer les accusés de lecture
Config.EnableReadReceipts = true

-- =============================================================================
-- SÉCURITÉ
-- =============================================================================

-- Activer les logs des transactions bancaires
Config.LogBankTransactions = true

-- Activer les logs des messages
Config.LogMessages = false

-- Webhook Discord pour les logs (laisser vide pour désactiver)
Config.DiscordWebhook = ''

-- =============================================================================
-- DEBUG
-- =============================================================================

-- Mode debug (affiche des informations dans la console)
Config.Debug = false

-- =============================================================================
-- NE PAS MODIFIER CI-DESSOUS (sauf si vous savez ce que vous faites)
-- =============================================================================

-- Version de la configuration
Config.Version = '2.0.0'

-- Détection automatique du framework (exécutée au démarrage)
if Config.Framework == 'auto' then
    CreateThread(function()
        Wait(100)
        if GetResourceState('es_extended') == 'started' then
            Config.Framework = 'esx'
            if Config.Debug then print('[LSFive Phone] Framework détecté: ESX') end
        elseif GetResourceState('qb-core') == 'started' then
            Config.Framework = 'qb-core'
            if Config.Debug then print('[LSFive Phone] Framework détecté: QBCore') end
        else
            Config.Framework = 'standalone'
            if Config.Debug then print('[LSFive Phone] Framework détecté: Standalone') end
        end
    end)
end
