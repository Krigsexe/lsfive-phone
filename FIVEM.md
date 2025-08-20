# LSFive Phone - Guide d'Installation Complet

## 1. Introduction

LSFive Phone est une ressource de téléphone moderne, riche en fonctionnalités et axée sur la performance pour FiveM, construite avec React et TypeScript. Ce guide a été conçu pour rendre son installation "plug-and-play" sur n'importe quel serveur, à condition de suivre attentivement les étapes d'intégration au framework.

### Fonctionnalités Principales
- **Interface Utilisateur Moderne :** Inspirée d'iOS, réactive et intuitive.
- **Applications Essentielles :** Téléphone, Messages, Réglages, Navigateur, Appareil Photo.
- **Applications Fonctionnelles :** Banque, Garage, Entreprises, Services d'urgence (Dispatch), Mail, Social, Musique, Météo.
- **Personnalisation Complète :** Thèmes (sombre/clair), fonds d'écran personnalisés, installation/désinstallation d'applications, et réorganisation de l'écran d'accueil par glisser-déposer.
- **Localisation :** Support natif pour le Français et l'Anglais.

---

## 2. Dépendances Requises

Ce téléphone ne fonctionnera pas sans les deux ressources suivantes. Assurez-vous de les avoir installées et démarrées **avant** `lsfive-phone`.

1.  **[ox_lib](https://github.com/overextended/ox_lib)**: Utilisé pour ses bibliothèques partagées et son système de notifications.
2.  **[oxmysql](https://github.com/overextended/oxmysql)**: Indispensable pour toutes les interactions avec la base de données.

---

## 3. Guide d'Installation

Suivez ces étapes dans l'ordre pour une installation réussie.

### Étape 1: Télécharger et Placer la Ressource

1.  Téléchargez ou clonez le dossier de cette ressource.
2.  Renommez le dossier en `lsfive-phone` (si ce n'est pas déjà le cas).
3.  Placez le dossier `lsfive-phone` dans le dossier `resources` de votre serveur FiveM.

### Étape 2: Configurer la Base de Données

Vous devez importer le script SQL qui crée toutes les tables nécessaires. Utilisez un outil comme HeidiSQL ou DBeaver pour exécuter le script.

**Le script complet se trouve dans le fichier `SQL.md` à la racine de la ressource.**

### Étape 3: Modifier le `config.lua`

Ouvrez le fichier `config.lua` et ajustez les paramètres. **Le plus important est `Config.Framework`**.

```lua
Config = {}

-- [[ PARAMÈTREs GÉNÉRAUX ]]
Config.Command = 'phone' -- Commande pour ouvrir le téléphone. Mettre à `false` pour désactiver.
Config.Keybind = 'F1' -- Touche pour ouvrir le téléphone.
Config.Framework = 'esx' -- 'esx', 'qb-core', ou 'standalone'. **RÉGLAGE CRUCIAL !**
Config.DefaultLanguage = 'fr' -- Langue par défaut ('en' ou 'fr').
Config.DefaultWallpaper = 'https://i.pinimg.com/originals/8c/f4/98/8cf498ef295f66b4f987405af2d810c3.jpg' -- Fond d'écran par défaut.
Config.UseOxLibNotifications = true -- `true` pour utiliser les notifications ox_lib.
```

### Étape 4: Démarrer la Ressource

Ajoutez la ligne suivante à votre `server.cfg`. L'ordre est **très important**.

```cfg
ensure ox_lib
ensure oxmysql
ensure lsfive-phone
```

---

## 4. Intégration au Framework (Étape cruciale)

Pour que des applications comme la Banque ou le Garage fonctionnent, vous devez indiquer au script comment interagir avec votre framework. **Vous devez modifier le fichier `server/main.lua`**.

Le fichier est déjà préparé avec des fonctions vides. Remplacez-les par les extraits correspondant à votre framework.

### Pour ESX (v1-final et ESX Legacy)

<details>
<summary><strong>Cliquez pour voir le code d'intégration ESX</strong></summary>

```lua
-- Dans server/main.lua, remplacez les fonctions existantes par celles-ci.

ESX = exports.esx:getSharedObject()

function GetPlayerFromSource(source)
    return ESX.GetPlayerFromId(source)
end

AddEventHandler('esx:playerLoaded', function(source, xPlayer)
    -- Ce code s'assure que chaque joueur a un numéro de téléphone à sa connexion.
    local user = exports.oxmysql:fetchSync('SELECT phone_number FROM phone_users WHERE identifier = ?', { xPlayer.identifier })
    if not user then
        local phoneNumber = ESX.GetRandomPhoneNumber()
        exports.oxmysql:executeSync('INSERT INTO phone_users (identifier, phone_number, wallpaper, language) VALUES (?, ?, ?, ?)', {
            xPlayer.identifier, phoneNumber, Config.DefaultWallpaper, Config.DefaultLanguage
        })
        xPlayer.set('phone_number', phoneNumber)
    else
        xPlayer.set('phone_number', user.phone_number)
    end
end)

-- Intégration pour l'application Banque
RegisterNuiHandler('bank:transfer', function(xPlayer, data, cb)
    local amount = tonumber(data.amount)
    if amount and amount > 0 then
        local recipientPlayer = ESX.GetPlayerFromIdentifier(data.recipient) -- Ceci est un exemple, adaptez la recherche du destinataire
        if xPlayer.getAccount('bank').money >= amount then
            xPlayer.removeAccountMoney('bank', amount)
            if recipientPlayer then
                recipientPlayer.addAccountMoney('bank', amount)
            else
                -- Logique pour virement hors ligne si nécessaire
            end
            cb({ success = true })
        else
            cb({ success = false, message = "Fonds insuffisants" })
        end
    else
        cb({ success = false, message = "Montant invalide" })
    end
end)

-- Intégration pour l'application Garage
RegisterNuiHandler('garage:requestVehicle', function(xPlayer, data, cb)
    -- Implémentez ici votre logique pour faire sortir un véhicule du garage
    -- Exemple : exports['esx_vehicleshop']:SpawnVehicle(data.vehicleId)
    cb({ success = true })
end)

```
</details>

### Pour QBCore

<details>
<summary><strong>Cliquez pour voir le code d'intégration QBCore</strong></summary>

```lua
-- Dans server/main.lua, remplacez les fonctions existantes par celles-ci.

QBCore = exports['qb-core']:GetCoreObject()

function GetPlayerFromSource(source)
    return QBCore.Functions.GetPlayer(source)
end

AddEventHandler('QBCore:Server:PlayerLoaded', function(Player)
    -- Ce code s'assure que chaque joueur a un numéro de téléphone à sa connexion.
    local user = exports.oxmysql:fetchSync('SELECT phone_number FROM phone_users WHERE identifier = ?', { Player.PlayerData.citizenid })
    if not user then
        local phoneNumber = string.format("%s-%s", math.random(111, 999), math.random(1111, 9999)) -- Exemple de numéro
        exports.oxmysql:executeSync('INSERT INTO phone_users (identifier, phone_number, wallpaper, language) VALUES (?, ?, ?, ?)', {
            Player.PlayerData.citizenid, phoneNumber, Config.DefaultWallpaper, Config.DefaultLanguage
        })
        Player.Functions.SetPlayerData('charinfo', { phone = phoneNumber })
    else
        Player.Functions.SetPlayerData('charinfo', { phone = user.phone_number })
    end
end)

-- Intégration pour l'application Banque
RegisterNuiHandler('bank:transfer', function(Player, data, cb)
    local amount = tonumber(data.amount)
    if amount and amount > 0 then
        local recipientPlayer = QBCore.Functions.GetPlayerByCitizenId(data.recipient)
        if Player.PlayerData.money.bank >= amount then
            Player.Functions.RemoveMoney('bank', amount)
            if recipientPlayer then
                recipientPlayer.Functions.AddMoney('bank', amount)
            else
                -- Logique pour virement hors ligne si nécessaire
            end
            cb({ success = true })
        else
            cb({ success = false, message = "Fonds insuffisants" })
        end
    else
        cb({ success = false, message = "Montant invalide" })
    end
end)

-- Intégration pour l'application Garage
RegisterNuiHandler('garage:requestVehicle', function(Player, data, cb)
    -- Implémentez ici votre logique pour faire sortir un véhicule du garage
    -- Exemple : exports['qb-garage']:SpawnVehicle(Player, data.vehicleId, ...)
    cb({ success = true })
end)

```
</details>

---

## 5. Contenu des Fichiers de la Ressource

Pour votre commodité, voici le contenu complet des fichiers Lua que vous devriez avoir dans votre ressource.

<details>
<summary><strong>`fxmanifest.lua`</strong></summary>

```lua
fx_version 'cerulean'
game 'gta5'

author 'Krigs & Gemini'
description 'LSFive - A modern FiveM phone resource'
version '2.0.0-phone'

ui_page 'html/index.html'

shared_scripts {
    '@ox_lib/init.lua',
    'config.lua'
}

client_scripts {
    'client/main.lua'
}

server_scripts {
    'server/main.lua'
}

files {
    'html/index.html',
    'html/**/*',
}

dependencies {
    'ox_lib',
    'oxmysql'
}

lua54 'yes'
```
</details>

<details>
<summary><strong>`client/main.lua`</strong></summary>
```lua
local isPhoneVisible = false

-- Function to set phone visibility and send data
local function setPhoneVisible(visible)
    if isPhoneVisible == visible then return end
    isPhoneVisible = visible
    SetNuiFocus(visible, visible)
    SendNUIMessage({ type = "setVisible", payload = visible })
end

-- Keybind and Command
RegisterKeyMapping(Config.Command, 'Ouvrir le téléphone', 'keyboard', Config.Keybind)
RegisterCommand(Config.Command, function() setPhoneVisible(not isPhoneVisible) end, false)
RegisterNUICallback('close', function(_, cb) setPhoneVisible(false); cb({}) end)

-- Data and Event Handling
RegisterNetEvent('phone:client:loadData', function(data)
    if not isPhoneVisible then return end
    SendNUIMessage({ type = "loadData", payload = data })
end)

RegisterNetEvent('phone:client:incomingCall', function(data)
    SendNUIMessage({ type = "incomingCall", payload = data })
    setPhoneVisible(true)
end)

-- Generic NUI handler to pass events to the server
local nuiEventsToServer = {
    'phone:server:requestData',
    'call:accept', 'call:decline', 'call:end', 'call:start',
    'phone:updateSettings', 'updateWallpaper', 'updateLanguage', 'updateInstalledApps', 'updateDockOrder', 'phone:backupData',
    'bank:transfer', 'garage:requestVehicle', 'dispatch:createAlert',
    'mail:send', 'mail:delete', 'updateSongs', 'updateWallpapers',
    'social:createPost', 'social:likePost',
    'phone:clearMissedCalls', 'phone:clearUnreadMessages'
}

for _, eventName in ipairs(nuiEventsToServer) do
    RegisterNUICallback(eventName, function(data, cb)
        TriggerServerEvent('phone:nui:' .. eventName, data, function(result)
            cb(result or {})
        end)
    end)
end

-- Waypoint setter
RegisterNUICallback('business:setWaypoint', function(data, cb)
    if data and data.location then
        SetNewWaypoint(data.location.x, data.location.y)
    end
    cb({})
end)
```
</details>

<details>
<summary><strong>`server/main.lua` (Version modèle à modifier)</strong></summary>
```lua
-- ============================================================================
-- FRAMEWORK INTEGRATION - À MODIFIER
-- ============================================================================
-- Remplacez ces fonctions par celles de votre framework (voir section 4).
local ESX = nil -- ou QBCore = nil
-- require 'framework_specific_file' -- Alternative

-- Cette fonction DOIT retourner l'objet joueur de votre framework.
function GetPlayerFromSource(source)
    -- EXEMPLE POUR STANDALONE
    return {
        source = source,
        identifier = GetPlayerIdentifier(source, 0),
        -- Ajoutez d'autres fonctions nécessaires comme getName, getMoney, etc.
    }
end

-- Cet événement est appelé quand un joueur se connecte.
-- Il est VITAL pour créer le numéro du joueur s'il n'en a pas.
AddEventHandler('playerJoining', function(source)
    -- Adaptez ceci à l'événement de votre framework (ex: 'esx:playerLoaded')
    Wait(1000) -- Attendre que le joueur soit chargé
    local player = GetPlayerFromSource(source)
    
    local user = exports.oxmysql:fetchSync('SELECT phone_number FROM phone_users WHERE identifier = ?', { player.identifier })
    if not user then
        local newPhoneNumber = "555-" .. math.random(1000, 9999) -- Génération simple, à adapter
        exports.oxmysql:executeSync('INSERT INTO phone_users (identifier, phone_number, wallpaper, language) VALUES (?, ?, ?, ?)', {
            player.identifier, newPhoneNumber, Config.DefaultWallpaper, Config.DefaultLanguage
        })
    end
end)

-- ============================================================================
-- NUI EVENT HANDLER
-- ============================================================================
local function RegisterNuiHandler(eventName, handler)
    RegisterNetEvent('phone:nui:' .. eventName, function(data, cb)
        local player = GetPlayerFromSource(source)
        if not player then return cb({}) end
        handler(player, data, cb)
    end)
end

-- ============================================================================
-- CALLBACKS NUI (Logique des applications)
-- ============================================================================

-- Demande de données initiales
RegisterNuiHandler('phone:server:requestData', function(player, data, cb)
    -- Cette fonction doit récupérer TOUTES les données du joueur pour le téléphone
    local userData = exports.oxmysql:fetchSync('SELECT * FROM phone_users WHERE identifier = ?', {player.identifier})[1]
    
    -- !! EXEMPLES DE DONNÉES À RÉCUPÉRER - À ADAPTER À VOTRE SERVEUR !!
    local response = {
        userData = userData,
        contacts = {},
        calls = {},
        messages = {},
        vehicles = {},
        bank = { balance = 0, transactions = {} },
        businesses = {},
        mails = {},
        songs = {},
        alerts = {},
        social_posts = {}
    }
    TriggerClientEvent('phone:client:loadData', player.source, response)
    cb({})
end)

-- Gestion des paramètres
RegisterNuiHandler('updateInstalledApps', function(player, data, cb)
    exports.oxmysql:execute('UPDATE phone_users SET installed_apps = ? WHERE identifier = ?', { data.apps, player.identifier })
    cb({})
end)
RegisterNuiHandler('updateDockOrder', function(player, data, cb)
    exports.oxmysql:execute('UPDATE phone_users SET dock_order = ? WHERE identifier = ?', { data.dock_order, player.identifier })
    cb({})
end)
RegisterNuiHandler('phone:updateSettings', function(player, data, cb)
    exports.oxmysql:execute('UPDATE phone_users SET settings = ? WHERE identifier = ?', { data.settings, player.identifier })
    cb({})
end)
RegisterNuiHandler('updateWallpaper', function(player, data, cb)
    exports.oxmysql:execute('UPDATE phone_users SET wallpaper = ? WHERE identifier = ?', { data.wallpaperUrl, player.identifier })
    cb({})
end)
RegisterNuiHandler('updateLanguage', function(player, data, cb)
    exports.oxmysql:execute('UPDATE phone_users SET language = ? WHERE identifier = ?', { data.lang, player.identifier })
    cb({})
end)

-- Application Banque (Exemple à compléter)
RegisterNuiHandler('bank:transfer', function(player, data, cb)
    print("Tentative de virement de " .. data.amount .. " par " .. player.identifier)
    -- !! LOGIQUE DE VIREMENT À IMPLÉMENTER ICI !!
    -- 1. Vérifier si le joueur a assez d'argent.
    -- 2. Trouver l'identifiant du destinataire.
    -- 3. Retirer l'argent du joueur.
    -- 4. Ajouter l'argent au destinataire.
    -- 5. Envoyer une notification.
    cb({ success = false, message = "Fonction non implémentée." })
end)

-- Application Garage (Exemple à compléter)
RegisterNuiHandler('garage:requestVehicle', function(player, data, cb)
    print("Demande de véhicule " .. data.vehicleId .. " par " .. player.identifier)
    -- !! LOGIQUE DE SPAWN VÉHICULE À IMPLÉMENTER ICI !!
    cb({ success = false, message = "Fonction non implémentée." })
end)


print("[Phone] LSFive Phone Server Script Loaded")

```
</details>

---

*Ce guide a été généré après un audit du codebase pour garantir une installation et une utilisation optimales. Développé par Krigs & Gemini.*
