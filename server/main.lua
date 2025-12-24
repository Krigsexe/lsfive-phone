--[[
    LSFive Phone - Server Script
    Gère toute la logique serveur et l'intégration avec les frameworks
]]

-- =============================================================================
-- VARIABLES LOCALES
-- =============================================================================

local Framework = nil
local ActiveCalls = {} -- Stocke les appels en cours { [callId] = { caller, receiver, startTime } }
local CallIdCounter = 0

-- =============================================================================
-- INITIALISATION DU FRAMEWORK
-- =============================================================================

CreateThread(function()
    Wait(1000) -- Attendre que les ressources soient chargées

    if Config.Framework == 'esx' then
        Framework = exports['es_extended']:getSharedObject()
        LSPhone.Debug('Server initialized with ESX')

    elseif Config.Framework == 'qb-core' then
        Framework = exports['qb-core']:GetCoreObject()
        LSPhone.Debug('Server initialized with QBCore')

    else
        Framework = nil
        LSPhone.Debug('Server initialized in standalone mode')
    end

    -- Initialiser la base de données
    InitializeDatabase()
end)

-- =============================================================================
-- FONCTIONS D'AIDE FRAMEWORK
-- =============================================================================

---Récupère l'objet joueur du framework
---@param source number
---@return table|nil
local function GetPlayer(source)
    if Config.Framework == 'esx' then
        return Framework.GetPlayerFromId(source)
    elseif Config.Framework == 'qb-core' then
        return Framework.Functions.GetPlayer(source)
    else
        -- Standalone
        return {
            source = source,
            identifier = GetPlayerIdentifierByType(source, 'license') or ('player:' .. source),
            name = GetPlayerName(source) or 'Unknown'
        }
    end
end

---Récupère l'identifiant unique du joueur
---@param player table
---@return string
local function GetPlayerIdentifier(player)
    if Config.Framework == 'esx' then
        return player.identifier
    elseif Config.Framework == 'qb-core' then
        return player.PlayerData.citizenid
    else
        return player.identifier
    end
end

---Récupère le nom du joueur
---@param player table
---@return string
local function GetPlayerName(player)
    if Config.Framework == 'esx' then
        return player.getName and player.getName() or 'Unknown'
    elseif Config.Framework == 'qb-core' then
        local charInfo = player.PlayerData.charinfo
        return (charInfo.firstname or '') .. ' ' .. (charInfo.lastname or '')
    else
        return player.name or 'Unknown'
    end
end

---Récupère le job du joueur
---@param player table
---@return table { name: string, grade: number }
local function GetPlayerJob(player)
    if Config.Framework == 'esx' then
        return player.job or { name = 'unemployed', grade = 0 }
    elseif Config.Framework == 'qb-core' then
        return player.PlayerData.job or { name = 'unemployed', grade = { level = 0 } }
    else
        return { name = 'unemployed', grade = 0 }
    end
end

---Récupère le solde bancaire du joueur
---@param player table
---@return number
local function GetPlayerBankBalance(player)
    if Config.Framework == 'esx' then
        local account = player.getAccount('bank')
        return account and account.money or 0
    elseif Config.Framework == 'qb-core' then
        return player.PlayerData.money['bank'] or 0
    else
        return 0
    end
end

---Retire de l'argent du compte bancaire
---@param player table
---@param amount number
---@return boolean
local function RemovePlayerBankMoney(player, amount)
    if Config.Framework == 'esx' then
        if player.getAccount('bank').money >= amount then
            player.removeAccountMoney('bank', amount, 'Phone transfer')
            return true
        end
    elseif Config.Framework == 'qb-core' then
        if player.PlayerData.money['bank'] >= amount then
            player.Functions.RemoveMoney('bank', amount, 'Phone transfer')
            return true
        end
    end
    return false
end

---Ajoute de l'argent au compte bancaire
---@param player table
---@param amount number
local function AddPlayerBankMoney(player, amount)
    if Config.Framework == 'esx' then
        player.addAccountMoney('bank', amount, 'Phone transfer received')
    elseif Config.Framework == 'qb-core' then
        player.Functions.AddMoney('bank', amount, 'Phone transfer received')
    end
end

---Récupère la liste des véhicules du joueur
---@param identifier string
---@return table
local function GetPlayerVehicles(identifier)
    local vehicles = {}

    if Config.Framework == 'esx' then
        local result = MySQL.query.await('SELECT * FROM owned_vehicles WHERE owner = ?', { identifier })
        if result then
            for _, v in ipairs(result) do
                local props = json.decode(v.vehicle) or {}
                table.insert(vehicles, {
                    id = tostring(v.id or v.plate),
                    name = props.model or 'Unknown',
                    plate = v.plate,
                    status = v.stored and 'garaged' or 'out',
                    model = props.model
                })
            end
        end
    elseif Config.Framework == 'qb-core' then
        local result = MySQL.query.await('SELECT * FROM player_vehicles WHERE citizenid = ?', { identifier })
        if result then
            for _, v in ipairs(result) do
                table.insert(vehicles, {
                    id = tostring(v.id or v.plate),
                    name = v.vehicle or 'Unknown',
                    plate = v.plate,
                    status = v.state == 1 and 'garaged' or (v.state == 0 and 'out' or 'impounded'),
                    model = v.vehicle
                })
            end
        end
    end

    return vehicles
end

-- =============================================================================
-- INITIALISATION BASE DE DONNÉES
-- =============================================================================

function InitializeDatabase()
    -- Vérifier que les tables existent
    MySQL.query.await([[
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
            PRIMARY KEY (`id`),
            UNIQUE KEY `identifier` (`identifier`),
            UNIQUE KEY `phone_number` (`phone_number`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]])

    LSPhone.Debug('Database initialized')
end

-- =============================================================================
-- GESTION DES CONNEXIONS JOUEURS
-- =============================================================================

-- ESX
if Config.Framework == 'esx' then
    AddEventHandler('esx:playerLoaded', function(playerId, xPlayer)
        InitializePlayerPhone(playerId, xPlayer.identifier)
    end)
end

-- QBCore
if Config.Framework == 'qb-core' then
    RegisterNetEvent('QBCore:Server:OnPlayerLoaded', function()
        local source = source
        local player = Framework.Functions.GetPlayer(source)
        if player then
            InitializePlayerPhone(source, player.PlayerData.citizenid)
        end
    end)
end

-- Standalone / Fallback
AddEventHandler('playerConnecting', function(name, setKickReason, deferrals)
    local source = source
    Wait(1000)
    local identifier = GetPlayerIdentifierByType(source, 'license')
    if identifier then
        InitializePlayerPhone(source, identifier)
    end
end)

---Initialise le téléphone d'un joueur (crée le numéro si nécessaire)
---@param source number
---@param identifier string
function InitializePlayerPhone(source, identifier)
    local user = MySQL.single.await('SELECT * FROM phone_users WHERE identifier = ?', { identifier })

    if not user then
        -- Générer un nouveau numéro de téléphone unique
        local phoneNumber
        local attempts = 0

        repeat
            phoneNumber = LSPhone.GeneratePhoneNumber()
            local exists = MySQL.single.await('SELECT id FROM phone_users WHERE phone_number = ?', { phoneNumber })
            attempts = attempts + 1
        until not exists or attempts > 100

        if attempts > 100 then
            LSPhone.Error('Failed to generate unique phone number for', identifier)
            return
        end

        -- Créer l'entrée utilisateur
        MySQL.insert.await([[
            INSERT INTO phone_users (identifier, phone_number, wallpaper, language, installed_apps, dock_order, settings)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ]], {
            identifier,
            phoneNumber,
            Config.DefaultWallpaper,
            Config.DefaultLanguage,
            json.encode(Config.DefaultInstalledApps),
            json.encode(Config.DefaultDockApps),
            json.encode({ theme = Config.DefaultTheme, airplaneMode = false })
        })

        LSPhone.Debug('Created phone number', phoneNumber, 'for', identifier)
    end
end

-- =============================================================================
-- RÉCUPÉRATION DES DONNÉES
-- =============================================================================

RegisterNetEvent('phone:server:requestData', function()
    local source = source
    local player = GetPlayer(source)
    if not player then return end

    local identifier = GetPlayerIdentifier(player)

    -- Récupérer les données utilisateur
    local userData = MySQL.single.await('SELECT * FROM phone_users WHERE identifier = ?', { identifier })
    if not userData then
        LSPhone.Error('No phone data found for', identifier)
        return
    end

    -- Récupérer les contacts
    local contacts = MySQL.query.await('SELECT * FROM phone_contacts WHERE owner_identifier = ?', { identifier }) or {}

    -- Récupérer les messages (groupés par conversation)
    local messages = MySQL.query.await([[
        SELECT * FROM phone_messages
        WHERE sender_number = ? OR receiver_number = ?
        ORDER BY timestamp DESC
        LIMIT 500
    ]], { userData.phone_number, userData.phone_number }) or {}

    -- Récupérer l'historique des appels
    local calls = MySQL.query.await([[
        SELECT * FROM phone_calls
        WHERE caller_number = ? OR receiver_number = ?
        ORDER BY timestamp DESC
        LIMIT 100
    ]], { userData.phone_number, userData.phone_number }) or {}

    -- Récupérer les véhicules
    local vehicles = GetPlayerVehicles(identifier)

    -- Récupérer les données bancaires
    local bankBalance = GetPlayerBankBalance(player)
    local transactions = MySQL.query.await([[
        SELECT * FROM phone_bank_transactions
        WHERE identifier = ?
        ORDER BY timestamp DESC
        LIMIT 50
    ]], { identifier }) or {}

    -- Récupérer les mails
    local mails = MySQL.query.await([[
        SELECT * FROM phone_mails
        WHERE owner_identifier = ?
        ORDER BY timestamp DESC
        LIMIT 100
    ]], { identifier }) or {}

    -- Récupérer les chansons
    local songs = MySQL.query.await('SELECT * FROM phone_songs WHERE owner_identifier = ?', { identifier }) or {}

    -- Récupérer les posts sociaux
    local socialPosts = MySQL.query.await([[
        SELECT p.*, u.phone_number as author_phone
        FROM phone_social_posts p
        LEFT JOIN phone_users u ON p.author_identifier = u.identifier
        ORDER BY p.timestamp DESC
        LIMIT ?
    ]], { Config.MaxSocialPosts or 50 }) or {}

    -- Récupérer les alertes dispatch récentes
    local alerts = {}
    local job = GetPlayerJob(player)
    if Config.DispatchJobs[job.name] then
        alerts = MySQL.query.await([[
            SELECT * FROM phone_dispatch_alerts
            WHERE timestamp > DATE_SUB(NOW(), INTERVAL ? SECOND)
            ORDER BY timestamp DESC
        ]], { Config.DispatchAlertLifetime or 300 }) or {}
    end

    -- Récupérer les entreprises (exemple statique, à adapter)
    local businesses = MySQL.query.await('SELECT * FROM phone_businesses') or {}

    -- Construire l'objet de réponse
    local response = {
        userData = {
            phoneNumber = userData.phone_number,
            email = userData.email or Config.DefaultEmail,
            wallpaper = userData.wallpaper or Config.DefaultWallpaper,
            language = userData.language or Config.DefaultLanguage,
            installedApps = LSPhone.SafeJSONDecode(userData.installed_apps) or Config.DefaultInstalledApps,
            dockOrder = LSPhone.SafeJSONDecode(userData.dock_order) or Config.DefaultDockApps,
            settings = LSPhone.SafeJSONDecode(userData.settings) or { theme = Config.DefaultTheme, airplaneMode = false }
        },
        playerName = GetPlayerName(player),
        playerJob = job,
        contacts = FormatContacts(contacts),
        conversations = FormatConversations(messages, userData.phone_number, contacts),
        calls = FormatCalls(calls, userData.phone_number, contacts),
        vehicles = vehicles,
        bank = {
            balance = bankBalance,
            transactions = FormatTransactions(transactions)
        },
        mails = FormatMails(mails),
        songs = FormatSongs(songs),
        socialPosts = FormatSocialPosts(socialPosts, identifier),
        alerts = FormatAlerts(alerts),
        businesses = FormatBusinesses(businesses)
    }

    TriggerClientEvent('phone:client:loadData', source, response)
end)

-- =============================================================================
-- FONCTIONS DE FORMATAGE
-- =============================================================================

function FormatContacts(contacts)
    local formatted = {}
    for _, c in ipairs(contacts) do
        table.insert(formatted, {
            id = tostring(c.id),
            name = c.name,
            phoneNumber = c.phone_number,
            avatarUrl = c.avatar_url
        })
    end
    return formatted
end

function FormatConversations(messages, myNumber, contacts)
    local conversations = {}
    local convMap = {}

    -- Créer un map des contacts par numéro
    local contactMap = {}
    for _, c in ipairs(contacts) do
        contactMap[c.phone_number] = c.name
    end

    for _, m in ipairs(messages) do
        local otherNumber = m.sender_number == myNumber and m.receiver_number or m.sender_number
        local isSender = m.sender_number == myNumber

        if not convMap[otherNumber] then
            convMap[otherNumber] = {
                contactName = contactMap[otherNumber] or otherNumber,
                phoneNumber = otherNumber,
                messages = {},
                lastMessage = '',
                timestamp = '',
                unread = 0
            }
        end

        table.insert(convMap[otherNumber].messages, {
            id = m.id,
            content = m.content,
            timestamp = LSPhone.FormatTimestamp(m.timestamp),
            isSender = isSender
        })

        -- Mise à jour du dernier message
        if convMap[otherNumber].lastMessage == '' then
            convMap[otherNumber].lastMessage = m.content
            convMap[otherNumber].timestamp = LSPhone.FormatRelativeTime(m.timestamp)
        end

        -- Comptage des non-lus
        if not isSender and m.is_read == 0 then
            convMap[otherNumber].unread = convMap[otherNumber].unread + 1
        end
    end

    for _, conv in pairs(convMap) do
        -- Inverser les messages pour avoir le plus ancien en premier
        local reversed = {}
        for i = #conv.messages, 1, -1 do
            table.insert(reversed, conv.messages[i])
        end
        conv.messages = reversed
        table.insert(conversations, conv)
    end

    return conversations
end

function FormatCalls(calls, myNumber, contacts)
    local formatted = {}

    -- Créer un map des contacts par numéro
    local contactMap = {}
    for _, c in ipairs(contacts) do
        contactMap[c.phone_number] = { name = c.name, avatarUrl = c.avatar_url }
    end

    for _, c in ipairs(calls) do
        local otherNumber = c.caller_number == myNumber and c.receiver_number or c.caller_number
        local contact = contactMap[otherNumber] or { name = otherNumber, avatarUrl = nil }

        table.insert(formatted, {
            id = c.id,
            contact = {
                id = otherNumber,
                name = contact.name,
                phoneNumber = otherNumber,
                avatarUrl = contact.avatarUrl
            },
            direction = c.direction,
            timestamp = LSPhone.FormatRelativeTime(c.timestamp),
            isNew = c.is_new == 1
        })
    end

    return formatted
end

function FormatTransactions(transactions)
    local formatted = {}
    for _, t in ipairs(transactions) do
        table.insert(formatted, {
            id = tostring(t.id),
            date = LSPhone.FormatTimestamp(t.timestamp),
            description = t.description,
            amount = t.amount,
            type = t.amount >= 0 and 'credit' or 'debit'
        })
    end
    return formatted
end

function FormatMails(mails)
    local formatted = {}
    for _, m in ipairs(mails) do
        table.insert(formatted, {
            id = tostring(m.id),
            from = m.sender,
            subject = m.subject,
            body = m.body,
            timestamp = LSPhone.FormatRelativeTime(m.timestamp),
            isRead = m.is_read == 1
        })
    end
    return formatted
end

function FormatSongs(songs)
    local formatted = {}
    for _, s in ipairs(songs) do
        table.insert(formatted, {
            id = tostring(s.id),
            title = s.title,
            artist = s.artist,
            url = s.url
        })
    end
    return formatted
end

function FormatSocialPosts(posts, myIdentifier)
    local formatted = {}
    for _, p in ipairs(posts) do
        table.insert(formatted, {
            id = tostring(p.id),
            authorName = p.author_phone or 'Anonymous',
            authorAvatarUrl = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' .. (p.author_identifier or 'anon'),
            imageUrl = p.image_url,
            caption = p.caption,
            likes = p.likes or 0,
            isLiked = false, -- TODO: Implémenter le suivi des likes par utilisateur
            timestamp = LSPhone.FormatRelativeTime(p.timestamp)
        })
    end
    return formatted
end

function FormatAlerts(alerts)
    local formatted = {}
    for _, a in ipairs(alerts) do
        table.insert(formatted, {
            id = a.id,
            department = a.department,
            title = a.title,
            details = a.details,
            location = a.location,
            timestamp = LSPhone.FormatRelativeTime(a.timestamp)
        })
    end
    return formatted
end

function FormatBusinesses(businesses)
    local formatted = {}
    for _, b in ipairs(businesses) do
        local location = LSPhone.SafeJSONDecode(b.location) or { x = 0, y = 0, z = 0 }
        table.insert(formatted, {
            id = tostring(b.id),
            name = b.name,
            type = b.type or 'business',
            owner = b.owner or 'Unknown',
            logoUrl = b.logo_url or 'https://api.dicebear.com/7.x/identicon/svg?seed=' .. b.name,
            description = b.description or '',
            location = location
        })
    end
    return formatted
end

-- =============================================================================
-- GESTION DES PARAMÈTRES
-- =============================================================================

RegisterNetEvent('phone:server:updateWallpaper', function(wallpaperUrl)
    local source = source
    local player = GetPlayer(source)
    if not player then return end

    MySQL.update('UPDATE phone_users SET wallpaper = ? WHERE identifier = ?', {
        wallpaperUrl, GetPlayerIdentifier(player)
    })
end)

RegisterNetEvent('phone:server:updateLanguage', function(lang)
    local source = source
    local player = GetPlayer(source)
    if not player then return end

    MySQL.update('UPDATE phone_users SET language = ? WHERE identifier = ?', {
        lang, GetPlayerIdentifier(player)
    })
end)

RegisterNetEvent('phone:server:updateInstalledApps', function(apps)
    local source = source
    local player = GetPlayer(source)
    if not player then return end

    MySQL.update('UPDATE phone_users SET installed_apps = ? WHERE identifier = ?', {
        json.encode(apps), GetPlayerIdentifier(player)
    })
end)

RegisterNetEvent('phone:server:updateDockOrder', function(dockOrder)
    local source = source
    local player = GetPlayer(source)
    if not player then return end

    MySQL.update('UPDATE phone_users SET dock_order = ? WHERE identifier = ?', {
        json.encode(dockOrder), GetPlayerIdentifier(player)
    })
end)

RegisterNetEvent('phone:server:updateSettings', function(settings)
    local source = source
    local player = GetPlayer(source)
    if not player then return end

    MySQL.update('UPDATE phone_users SET settings = ? WHERE identifier = ?', {
        json.encode(settings), GetPlayerIdentifier(player)
    })
end)

-- =============================================================================
-- GESTION DES APPELS
-- =============================================================================

RegisterNetEvent('phone:server:startCall', function(targetNumber)
    local source = source
    local player = GetPlayer(source)
    if not player then return end

    local identifier = GetPlayerIdentifier(player)
    local userData = MySQL.single.await('SELECT phone_number FROM phone_users WHERE identifier = ?', { identifier })
    if not userData then return end

    local callerNumber = userData.phone_number
    local callerName = GetPlayerName(player)

    -- Trouver le destinataire
    local targetUser = MySQL.single.await('SELECT identifier FROM phone_users WHERE phone_number = ?', { targetNumber })
    if not targetUser then
        TriggerClientEvent('phone:client:callDeclined', source)
        return
    end

    -- Trouver le joueur en ligne avec cet identifier
    local targetSource = nil
    if Config.Framework == 'esx' then
        local xPlayers = Framework.GetPlayers()
        for _, playerId in ipairs(xPlayers) do
            local xPlayer = Framework.GetPlayerFromId(playerId)
            if xPlayer and xPlayer.identifier == targetUser.identifier then
                targetSource = playerId
                break
            end
        end
    elseif Config.Framework == 'qb-core' then
        local players = Framework.Functions.GetPlayers()
        for _, playerId in ipairs(players) do
            local qPlayer = Framework.Functions.GetPlayer(playerId)
            if qPlayer and qPlayer.PlayerData.citizenid == targetUser.identifier then
                targetSource = playerId
                break
            end
        end
    else
        -- Standalone: parcourir tous les joueurs
        for _, playerId in ipairs(GetPlayers()) do
            local pid = tonumber(playerId)
            local license = GetPlayerIdentifierByType(pid, 'license')
            if license == targetUser.identifier then
                targetSource = pid
                break
            end
        end
    end

    if not targetSource then
        -- Joueur hors ligne - appel manqué
        MySQL.insert('INSERT INTO phone_calls (caller_number, receiver_number, direction, is_new) VALUES (?, ?, ?, ?)', {
            callerNumber, targetNumber, 'missed', 1
        })
        TriggerClientEvent('phone:client:callDeclined', source)
        return
    end

    -- Créer l'appel
    CallIdCounter = CallIdCounter + 1
    local callId = CallIdCounter

    ActiveCalls[callId] = {
        caller = source,
        callerNumber = callerNumber,
        callerName = callerName,
        receiver = targetSource,
        receiverNumber = targetNumber,
        startTime = os.time()
    }

    -- Notifier le destinataire
    TriggerClientEvent('phone:client:incomingCall', targetSource, {
        callId = callId,
        callerNumber = callerNumber,
        callerName = callerName
    })
end)

RegisterNetEvent('phone:server:acceptCall', function(callId)
    local source = source
    local call = ActiveCalls[callId]
    if not call or call.receiver ~= source then return end

    -- Enregistrer l'appel
    MySQL.insert('INSERT INTO phone_calls (caller_number, receiver_number, direction, is_new) VALUES (?, ?, ?, ?)', {
        call.callerNumber, call.receiverNumber, 'incoming', 0
    })
    MySQL.insert('INSERT INTO phone_calls (caller_number, receiver_number, direction, is_new) VALUES (?, ?, ?, ?)', {
        call.callerNumber, call.receiverNumber, 'outgoing', 0
    })

    -- Notifier l'appelant
    TriggerClientEvent('phone:client:callAccepted', call.caller, {
        callId = callId,
        receiverNumber = call.receiverNumber
    })
end)

RegisterNetEvent('phone:server:declineCall', function(callId)
    local call = ActiveCalls[callId]
    if not call then return end

    -- Enregistrer comme appel manqué
    MySQL.insert('INSERT INTO phone_calls (caller_number, receiver_number, direction, is_new) VALUES (?, ?, ?, ?)', {
        call.callerNumber, call.receiverNumber, 'missed', 1
    })

    TriggerClientEvent('phone:client:callDeclined', call.caller)
    ActiveCalls[callId] = nil
end)

RegisterNetEvent('phone:server:endCall', function(callId)
    local call = ActiveCalls[callId]
    if not call then return end

    TriggerClientEvent('phone:client:callEnded', call.caller)
    TriggerClientEvent('phone:client:callEnded', call.receiver)

    ActiveCalls[callId] = nil
end)

RegisterNetEvent('phone:server:clearMissedCalls', function()
    local source = source
    local player = GetPlayer(source)
    if not player then return end

    local userData = MySQL.single.await('SELECT phone_number FROM phone_users WHERE identifier = ?', { GetPlayerIdentifier(player) })
    if userData then
        MySQL.update('UPDATE phone_calls SET is_new = 0 WHERE receiver_number = ? AND direction = ?', {
            userData.phone_number, 'missed'
        })
    end
end)

-- =============================================================================
-- GESTION DES MESSAGES
-- =============================================================================

RegisterNetEvent('phone:server:sendMessage', function(targetNumber, content)
    local source = source
    local player = GetPlayer(source)
    if not player then return end

    local identifier = GetPlayerIdentifier(player)
    local userData = MySQL.single.await('SELECT phone_number FROM phone_users WHERE identifier = ?', { identifier })
    if not userData then return end

    local senderNumber = userData.phone_number
    local senderName = GetPlayerName(player)

    -- Enregistrer le message
    MySQL.insert('INSERT INTO phone_messages (sender_number, receiver_number, content, is_read) VALUES (?, ?, ?, ?)', {
        senderNumber, targetNumber, content, 0
    })

    -- Trouver le destinataire en ligne et lui envoyer le message
    local targetUser = MySQL.single.await('SELECT identifier FROM phone_users WHERE phone_number = ?', { targetNumber })
    if targetUser then
        local targetSource = FindPlayerByIdentifier(targetUser.identifier)
        if targetSource then
            TriggerClientEvent('phone:client:newMessage', targetSource, {
                senderNumber = senderNumber,
                senderName = senderName,
                content = content
            })
        end
    end
end)

RegisterNetEvent('phone:server:markMessageRead', function(phoneNumber)
    local source = source
    local player = GetPlayer(source)
    if not player then return end

    local userData = MySQL.single.await('SELECT phone_number FROM phone_users WHERE identifier = ?', { GetPlayerIdentifier(player) })
    if userData then
        MySQL.update('UPDATE phone_messages SET is_read = 1 WHERE sender_number = ? AND receiver_number = ?', {
            phoneNumber, userData.phone_number
        })
    end
end)

-- =============================================================================
-- GESTION DES CONTACTS
-- =============================================================================

RegisterNetEvent('phone:server:addContact', function(name, phoneNumber, avatarUrl)
    local source = source
    local player = GetPlayer(source)
    if not player then return end

    MySQL.insert('INSERT INTO phone_contacts (owner_identifier, name, phone_number, avatar_url) VALUES (?, ?, ?, ?)', {
        GetPlayerIdentifier(player), name, phoneNumber, avatarUrl
    })
end)

RegisterNetEvent('phone:server:updateContact', function(id, name, phoneNumber, avatarUrl)
    local source = source
    local player = GetPlayer(source)
    if not player then return end

    MySQL.update('UPDATE phone_contacts SET name = ?, phone_number = ?, avatar_url = ? WHERE id = ? AND owner_identifier = ?', {
        name, phoneNumber, avatarUrl, id, GetPlayerIdentifier(player)
    })
end)

RegisterNetEvent('phone:server:deleteContact', function(id)
    local source = source
    local player = GetPlayer(source)
    if not player then return end

    MySQL.query('DELETE FROM phone_contacts WHERE id = ? AND owner_identifier = ?', {
        id, GetPlayerIdentifier(player)
    })
end)

-- =============================================================================
-- GESTION BANCAIRE
-- =============================================================================

RegisterNetEvent('phone:server:bankTransfer', function(recipientNumber, amount)
    local source = source
    local player = GetPlayer(source)
    if not player then return end

    local identifier = GetPlayerIdentifier(player)
    local userData = MySQL.single.await('SELECT phone_number FROM phone_users WHERE identifier = ?', { identifier })

    -- Vérifications
    if not userData then
        TriggerClientEvent('phone:client:bankTransferResult', source, false, 'Erreur utilisateur')
        return
    end

    if recipientNumber == userData.phone_number then
        TriggerClientEvent('phone:client:bankTransferResult', source, false, 'Vous ne pouvez pas vous envoyer de l\'argent')
        return
    end

    -- Vérifier le solde
    local balance = GetPlayerBankBalance(player)
    local totalAmount = amount
    if Config.TransferFee > 0 then
        totalAmount = amount + math.floor(amount * Config.TransferFee / 100)
    end

    if balance < totalAmount then
        TriggerClientEvent('phone:client:bankTransferResult', source, false, 'Fonds insuffisants')
        return
    end

    -- Trouver le destinataire
    local recipientUser = MySQL.single.await('SELECT identifier FROM phone_users WHERE phone_number = ?', { recipientNumber })
    if not recipientUser then
        TriggerClientEvent('phone:client:bankTransferResult', source, false, 'Destinataire introuvable')
        return
    end

    -- Retirer l'argent de l'expéditeur
    if not RemovePlayerBankMoney(player, totalAmount) then
        TriggerClientEvent('phone:client:bankTransferResult', source, false, 'Erreur lors du retrait')
        return
    end

    -- Ajouter au destinataire (en ligne ou hors ligne)
    local recipientSource = FindPlayerByIdentifier(recipientUser.identifier)
    if recipientSource then
        local recipientPlayer = GetPlayer(recipientSource)
        if recipientPlayer then
            AddPlayerBankMoney(recipientPlayer, amount)
        end
    elseif Config.AllowOfflineTransfers then
        -- Virement hors-ligne (à adapter selon votre système)
        if Config.Framework == 'esx' then
            MySQL.update('UPDATE users SET bank = bank + ? WHERE identifier = ?', { amount, recipientUser.identifier })
        elseif Config.Framework == 'qb-core' then
            MySQL.update('UPDATE players SET money = JSON_SET(money, "$.bank", JSON_EXTRACT(money, "$.bank") + ?) WHERE citizenid = ?', { amount, recipientUser.identifier })
        end
    else
        -- Remboursement si hors-ligne non autorisé
        AddPlayerBankMoney(player, totalAmount)
        TriggerClientEvent('phone:client:bankTransferResult', source, false, 'Le destinataire doit être en ligne')
        return
    end

    -- Log la transaction si configuré
    if Config.LogBankTransactions then
        MySQL.insert([[
            INSERT INTO phone_bank_transactions (identifier, amount, description, timestamp)
            VALUES (?, ?, ?, NOW()), (?, ?, ?, NOW())
        ]], {
            identifier, -totalAmount, 'Virement vers ' .. recipientNumber,
            recipientUser.identifier, amount, 'Virement de ' .. userData.phone_number
        })
    end

    TriggerClientEvent('phone:client:bankTransferResult', source, true, 'Virement effectué avec succès')

    -- Mettre à jour les données bancaires du client
    TriggerClientEvent('phone:client:updateBankData', source, {
        balance = GetPlayerBankBalance(player)
    })
end)

-- =============================================================================
-- GESTION DU GARAGE
-- =============================================================================

RegisterNetEvent('phone:server:requestVehicle', function(vehicleId, plate)
    local source = source
    local player = GetPlayer(source)
    if not player then return end

    local identifier = GetPlayerIdentifier(player)

    -- Vérifier que le véhicule appartient au joueur
    local vehicle
    if Config.Framework == 'esx' then
        vehicle = MySQL.single.await('SELECT * FROM owned_vehicles WHERE owner = ? AND plate = ?', { identifier, plate })
    elseif Config.Framework == 'qb-core' then
        vehicle = MySQL.single.await('SELECT * FROM player_vehicles WHERE citizenid = ? AND plate = ?', { identifier, plate })
    end

    if not vehicle then
        return
    end

    -- Récupérer les coordonnées de spawn (devant le joueur)
    local ped = GetPlayerPed(source)
    local coords = GetEntityCoords(ped)

    -- Envoyer au client pour spawn
    local vehicleProps = LSPhone.SafeJSONDecode(vehicle.vehicle) or {}
    TriggerClientEvent('phone:client:spawnVehicle', source, {
        model = vehicleProps.model or vehicle.vehicle or 'sultan',
        plate = plate,
        coords = { x = coords.x + 2, y = coords.y + 2, z = coords.z },
        heading = GetEntityHeading(ped)
    })

    -- Mettre à jour le statut du véhicule
    if Config.Framework == 'esx' then
        MySQL.update('UPDATE owned_vehicles SET stored = 0 WHERE plate = ?', { plate })
    elseif Config.Framework == 'qb-core' then
        MySQL.update('UPDATE player_vehicles SET state = 0 WHERE plate = ?', { plate })
    end
end)

-- =============================================================================
-- GESTION DU DISPATCH
-- =============================================================================

RegisterNetEvent('phone:server:createDispatchAlert', function(data)
    local source = source
    local player = GetPlayer(source)
    if not player then return end

    -- Enregistrer l'alerte
    local alertId = MySQL.insert.await([[
        INSERT INTO phone_dispatch_alerts (department, title, details, location)
        VALUES (?, ?, ?, ?)
    ]], { data.department, data.title, data.details, data.location })

    local alert = {
        id = alertId,
        department = data.department,
        title = data.title,
        details = data.details,
        location = data.location,
        coords = data.coords,
        timestamp = LSPhone.FormatRelativeTime(os.time())
    }

    -- Envoyer aux joueurs concernés
    local players = GetPlayers()
    for _, playerId in ipairs(players) do
        local targetPlayer = GetPlayer(tonumber(playerId))
        if targetPlayer then
            local job = GetPlayerJob(targetPlayer)
            if Config.DispatchJobs[job.name] or data.department == 'citizen' then
                TriggerClientEvent('phone:client:dispatchAlert', tonumber(playerId), alert)
            end
        end
    end
end)

-- =============================================================================
-- GESTION DES MAILS
-- =============================================================================

RegisterNetEvent('phone:server:sendMail', function(to, subject, body)
    local source = source
    local player = GetPlayer(source)
    if not player then return end

    local identifier = GetPlayerIdentifier(player)
    local userData = MySQL.single.await('SELECT email FROM phone_users WHERE identifier = ?', { identifier })
    local senderEmail = userData and userData.email or Config.DefaultEmail

    -- Trouver le destinataire par email
    local recipient = MySQL.single.await('SELECT identifier FROM phone_users WHERE email = ?', { to })
    if recipient then
        MySQL.insert('INSERT INTO phone_mails (owner_identifier, sender, subject, body, is_read) VALUES (?, ?, ?, ?, ?)', {
            recipient.identifier, senderEmail, subject, body, 0
        })

        -- Notifier si en ligne
        local recipientSource = FindPlayerByIdentifier(recipient.identifier)
        if recipientSource then
            TriggerClientEvent('phone:client:newMail', recipientSource, {
                sender = senderEmail,
                subject = subject,
                body = body
            })
        end
    end
end)

RegisterNetEvent('phone:server:deleteMail', function(mailId)
    local source = source
    local player = GetPlayer(source)
    if not player then return end

    MySQL.query('DELETE FROM phone_mails WHERE id = ? AND owner_identifier = ?', {
        mailId, GetPlayerIdentifier(player)
    })
end)

RegisterNetEvent('phone:server:markMailRead', function(mailId)
    local source = source
    local player = GetPlayer(source)
    if not player then return end

    MySQL.update('UPDATE phone_mails SET is_read = 1 WHERE id = ? AND owner_identifier = ?', {
        mailId, GetPlayerIdentifier(player)
    })
end)

-- =============================================================================
-- GESTION DE LA MUSIQUE
-- =============================================================================

RegisterNetEvent('phone:server:updateSongs', function(songs)
    local source = source
    local player = GetPlayer(source)
    if not player then return end

    local identifier = GetPlayerIdentifier(player)

    -- Supprimer les anciennes chansons
    MySQL.query('DELETE FROM phone_songs WHERE owner_identifier = ?', { identifier })

    -- Insérer les nouvelles
    for _, song in ipairs(songs) do
        MySQL.insert('INSERT INTO phone_songs (owner_identifier, title, artist, url) VALUES (?, ?, ?, ?)', {
            identifier, song.title, song.artist, song.url
        })
    end
end)

-- =============================================================================
-- GESTION DU RÉSEAU SOCIAL
-- =============================================================================

RegisterNetEvent('phone:server:createSocialPost', function(imageUrl, caption)
    local source = source
    local player = GetPlayer(source)
    if not player then return end

    MySQL.insert('INSERT INTO phone_social_posts (author_identifier, image_url, caption, likes) VALUES (?, ?, ?, ?)', {
        GetPlayerIdentifier(player), imageUrl, caption, 0
    })
end)

RegisterNetEvent('phone:server:likeSocialPost', function(postId, isLiked)
    local delta = isLiked and 1 or -1
    MySQL.update('UPDATE phone_social_posts SET likes = GREATEST(0, likes + ?) WHERE id = ?', { delta, postId })
end)

-- =============================================================================
-- FONCTIONS UTILITAIRES SERVEUR
-- =============================================================================

---Trouve un joueur par son identifier
---@param identifier string
---@return number|nil source
function FindPlayerByIdentifier(identifier)
    if Config.Framework == 'esx' then
        local xPlayers = Framework.GetPlayers()
        for _, playerId in ipairs(xPlayers) do
            local xPlayer = Framework.GetPlayerFromId(playerId)
            if xPlayer and xPlayer.identifier == identifier then
                return playerId
            end
        end
    elseif Config.Framework == 'qb-core' then
        local players = Framework.Functions.GetPlayers()
        for _, playerId in ipairs(players) do
            local qPlayer = Framework.Functions.GetPlayer(playerId)
            if qPlayer and qPlayer.PlayerData.citizenid == identifier then
                return playerId
            end
        end
    else
        for _, playerId in ipairs(GetPlayers()) do
            local pid = tonumber(playerId)
            local license = GetPlayerIdentifierByType(pid, 'license')
            if license == identifier then
                return pid
            end
        end
    end
    return nil
end

-- =============================================================================
-- EXPORTS SERVEUR
-- =============================================================================

exports('GetPlayerPhoneNumber', function(source)
    local player = GetPlayer(source)
    if not player then return nil end

    local userData = MySQL.single.await('SELECT phone_number FROM phone_users WHERE identifier = ?', { GetPlayerIdentifier(player) })
    return userData and userData.phone_number or nil
end)

exports('SendSMS', function(senderNumber, targetNumber, content)
    MySQL.insert('INSERT INTO phone_messages (sender_number, receiver_number, content, is_read) VALUES (?, ?, ?, ?)', {
        senderNumber, targetNumber, content, 0
    })

    local targetUser = MySQL.single.await('SELECT identifier FROM phone_users WHERE phone_number = ?', { targetNumber })
    if targetUser then
        local targetSource = FindPlayerByIdentifier(targetUser.identifier)
        if targetSource then
            TriggerClientEvent('phone:client:newMessage', targetSource, {
                senderNumber = senderNumber,
                content = content
            })
        end
    end
end)

exports('SendMail', function(senderEmail, targetEmail, subject, body)
    local recipient = MySQL.single.await('SELECT identifier FROM phone_users WHERE email = ?', { targetEmail })
    if recipient then
        MySQL.insert('INSERT INTO phone_mails (owner_identifier, sender, subject, body, is_read) VALUES (?, ?, ?, ?, ?)', {
            recipient.identifier, senderEmail, subject, body, 0
        })

        local recipientSource = FindPlayerByIdentifier(recipient.identifier)
        if recipientSource then
            TriggerClientEvent('phone:client:newMail', recipientSource, {
                sender = senderEmail,
                subject = subject
            })
        end
    end
end)

exports('CreateDispatchAlert', function(department, title, details, location, coords)
    local alertId = MySQL.insert.await([[
        INSERT INTO phone_dispatch_alerts (department, title, details, location)
        VALUES (?, ?, ?, ?)
    ]], { department, title, details, location })

    local alert = {
        id = alertId,
        department = department,
        title = title,
        details = details,
        location = location,
        coords = coords,
        timestamp = LSPhone.FormatRelativeTime(os.time())
    }

    local players = GetPlayers()
    for _, playerId in ipairs(players) do
        local player = GetPlayer(tonumber(playerId))
        if player then
            local job = GetPlayerJob(player)
            if Config.DispatchJobs[job.name] then
                TriggerClientEvent('phone:client:dispatchAlert', tonumber(playerId), alert)
            end
        end
    end

    return alertId
end)

-- =============================================================================
-- INITIALISATION
-- =============================================================================

print('[LSFive Phone] Server script loaded')
