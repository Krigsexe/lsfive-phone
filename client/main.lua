--[[
    LSFive Phone - Client Script
    Gère l'interface utilisateur et la communication avec le serveur
]]

-- =============================================================================
-- VARIABLES LOCALES
-- =============================================================================

local isPhoneVisible = false
local isPhoneReady = false
local currentCallData = nil
local PlayerData = nil
local Framework = nil

-- =============================================================================
-- INITIALISATION DU FRAMEWORK
-- =============================================================================

CreateThread(function()
    Wait(500) -- Attendre que les ressources soient chargées

    if Config.Framework == 'esx' then
        Framework = exports['es_extended']:getSharedObject()

        RegisterNetEvent('esx:playerLoaded', function(xPlayer)
            PlayerData = xPlayer
            LSPhone.Debug('ESX Player loaded:', xPlayer.identifier)
        end)

        RegisterNetEvent('esx:setJob', function(job)
            if PlayerData then
                PlayerData.job = job
            end
        end)

        -- Récupérer les données du joueur si déjà connecté
        while Framework.GetPlayerData().job == nil do
            Wait(100)
        end
        PlayerData = Framework.GetPlayerData()

    elseif Config.Framework == 'qb-core' then
        Framework = exports['qb-core']:GetCoreObject()

        RegisterNetEvent('QBCore:Client:OnPlayerLoaded', function()
            PlayerData = Framework.Functions.GetPlayerData()
            LSPhone.Debug('QBCore Player loaded:', PlayerData.citizenid)
        end)

        RegisterNetEvent('QBCore:Client:OnJobUpdate', function(job)
            if PlayerData then
                PlayerData.job = job
            end
        end)

        -- Récupérer les données du joueur si déjà connecté
        PlayerData = Framework.Functions.GetPlayerData()

    else
        -- Standalone
        Framework = nil
        PlayerData = {
            identifier = GetPlayerServerId(PlayerId()),
            job = { name = 'unemployed', grade = 0 }
        }
    end

    isPhoneReady = true
    LSPhone.Debug('Client initialized with framework:', Config.Framework)
end)

-- =============================================================================
-- FONCTIONS UTILITAIRES
-- =============================================================================

---Affiche ou cache le téléphone
---@param visible boolean
local function SetPhoneVisible(visible)
    if isPhoneVisible == visible then return end
    if visible and not isPhoneReady then return end

    isPhoneVisible = visible
    SetNuiFocus(visible, visible)
    SendNUIMessage({
        type = 'setVisible',
        payload = visible
    })

    if visible then
        -- Demander les données du serveur
        TriggerServerEvent('phone:server:requestData')
    end

    LSPhone.Debug('Phone visibility:', visible)
end

---Affiche une notification
---@param title string
---@param message string
---@param type string 'success' | 'error' | 'info'
local function ShowNotification(title, message, type)
    if Config.UseOxLibNotifications and GetResourceState('ox_lib') == 'started' then
        lib.notify({
            title = title,
            description = message,
            type = type or 'info',
            duration = Config.NotificationDuration
        })
    else
        -- Notification FiveM basique
        SetNotificationTextEntry('STRING')
        AddTextComponentString(message)
        DrawNotification(false, false)
    end
end

---Vérifie si le joueur a un métier spécifique
---@param jobs table Liste des métiers autorisés
---@return boolean
local function HasJob(jobs)
    if not PlayerData or not PlayerData.job then return false end

    local playerJob = PlayerData.job.name
    for _, job in ipairs(jobs) do
        if playerJob == job then
            return true
        end
    end
    return false
end

-- =============================================================================
-- COMMANDE ET KEYBIND
-- =============================================================================

if Config.Command then
    RegisterCommand(Config.Command, function()
        SetPhoneVisible(not isPhoneVisible)
    end, false)

    RegisterKeyMapping(Config.Command, Config.KeybindDescription, 'keyboard', Config.Keybind)
end

-- =============================================================================
-- CALLBACKS NUI - GÉNÉRAUX
-- =============================================================================

-- Fermer le téléphone
RegisterNUICallback('close', function(_, cb)
    SetPhoneVisible(false)
    cb({})
end)

-- Demander les données
RegisterNUICallback('phone:server:requestData', function(_, cb)
    TriggerServerEvent('phone:server:requestData')
    cb({})
end)

-- =============================================================================
-- CALLBACKS NUI - PARAMÈTRES
-- =============================================================================

RegisterNUICallback('updateWallpaper', function(data, cb)
    TriggerServerEvent('phone:server:updateWallpaper', data.wallpaperUrl)
    cb({})
end)

RegisterNUICallback('updateLanguage', function(data, cb)
    TriggerServerEvent('phone:server:updateLanguage', data.lang)
    cb({})
end)

RegisterNUICallback('updateInstalledApps', function(data, cb)
    TriggerServerEvent('phone:server:updateInstalledApps', data.apps)
    cb({})
end)

RegisterNUICallback('updateDockOrder', function(data, cb)
    TriggerServerEvent('phone:server:updateDockOrder', data.dock_order)
    cb({})
end)

RegisterNUICallback('phone:updateSettings', function(data, cb)
    TriggerServerEvent('phone:server:updateSettings', data.settings)
    cb({})
end)

RegisterNUICallback('phone:backupData', function(data, cb)
    TriggerServerEvent('phone:server:backupData', data)
    ShowNotification('Sauvegarde', 'Données sauvegardées avec succès', 'success')
    cb({})
end)

-- =============================================================================
-- CALLBACKS NUI - APPELS
-- =============================================================================

RegisterNUICallback('call:start', function(data, cb)
    local phoneNumber = data.phoneNumber
    if not LSPhone.IsValidPhoneNumber(phoneNumber) then
        cb({ success = false, error = 'Numéro invalide' })
        return
    end

    TriggerServerEvent('phone:server:startCall', phoneNumber)
    cb({ success = true })
end)

RegisterNUICallback('call:accept', function(data, cb)
    if currentCallData then
        TriggerServerEvent('phone:server:acceptCall', currentCallData.callId)

        -- Activer le voice chat si configuré
        if Config.EnableVoiceCalls then
            StartVoiceCall(currentCallData.callerNumber)
        end
    end
    cb({})
end)

RegisterNUICallback('call:decline', function(data, cb)
    if currentCallData then
        TriggerServerEvent('phone:server:declineCall', currentCallData.callId)
        EndVoiceCall()
    end
    currentCallData = nil
    cb({})
end)

RegisterNUICallback('call:end', function(_, cb)
    if currentCallData then
        TriggerServerEvent('phone:server:endCall', currentCallData.callId)
        EndVoiceCall()
    end
    currentCallData = nil
    cb({})
end)

RegisterNUICallback('phone:clearMissedCalls', function(_, cb)
    TriggerServerEvent('phone:server:clearMissedCalls')
    cb({})
end)

-- =============================================================================
-- CALLBACKS NUI - MESSAGES
-- =============================================================================

RegisterNUICallback('messages:send', function(data, cb)
    TriggerServerEvent('phone:server:sendMessage', data.phoneNumber, data.content)
    cb({})
end)

RegisterNUICallback('messages:markRead', function(data, cb)
    TriggerServerEvent('phone:server:markMessageRead', data.phoneNumber)
    cb({})
end)

RegisterNUICallback('phone:clearUnreadMessages', function(_, cb)
    TriggerServerEvent('phone:server:clearUnreadMessages')
    cb({})
end)

-- =============================================================================
-- CALLBACKS NUI - CONTACTS
-- =============================================================================

RegisterNUICallback('contacts:add', function(data, cb)
    TriggerServerEvent('phone:server:addContact', data.name, data.phoneNumber, data.avatarUrl)
    cb({})
end)

RegisterNUICallback('contacts:update', function(data, cb)
    TriggerServerEvent('phone:server:updateContact', data.id, data.name, data.phoneNumber, data.avatarUrl)
    cb({})
end)

RegisterNUICallback('contacts:delete', function(data, cb)
    TriggerServerEvent('phone:server:deleteContact', data.id)
    cb({})
end)

-- =============================================================================
-- CALLBACKS NUI - BANQUE
-- =============================================================================

RegisterNUICallback('bank:transfer', function(data, cb)
    local valid, errorMsg = LSPhone.ValidateTransferAmount(data.amount)
    if not valid then
        cb({ success = false, message = errorMsg })
        return
    end

    if not LSPhone.IsValidPhoneNumber(data.recipient) then
        cb({ success = false, message = 'Numéro de destinataire invalide' })
        return
    end

    -- Envoyer au serveur et attendre la réponse
    local callbackReceived = false
    local result = nil

    TriggerServerEvent('phone:server:bankTransfer', data.recipient, tonumber(data.amount))

    -- Écouter la réponse
    RegisterNetEvent('phone:client:bankTransferResult', function(success, message)
        result = { success = success, message = message }
        callbackReceived = true
    end)

    -- Timeout
    local timeout = 5000
    while not callbackReceived and timeout > 0 do
        Wait(100)
        timeout = timeout - 100
    end

    cb(result or { success = false, message = 'Timeout' })
end)

-- =============================================================================
-- CALLBACKS NUI - GARAGE
-- =============================================================================

RegisterNUICallback('garage:requestVehicle', function(data, cb)
    if not Config.EnableGarageSpawn then
        cb({ success = false, message = 'Fonction désactivée' })
        return
    end

    TriggerServerEvent('phone:server:requestVehicle', data.vehicleId, data.plate)
    cb({ success = true })
end)

-- =============================================================================
-- CALLBACKS NUI - DISPATCH
-- =============================================================================

RegisterNUICallback('dispatch:createAlert', function(data, cb)
    local playerCoords = GetEntityCoords(PlayerPedId())
    local streetName, crossingRoad = GetStreetNameAtCoord(playerCoords.x, playerCoords.y, playerCoords.z)
    local streetLabel = GetStreetNameFromHashKey(streetName)

    if crossingRoad ~= 0 then
        streetLabel = streetLabel .. ' / ' .. GetStreetNameFromHashKey(crossingRoad)
    end

    TriggerServerEvent('phone:server:createDispatchAlert', {
        department = data.department,
        title = data.title,
        details = data.details,
        location = streetLabel,
        coords = { x = playerCoords.x, y = playerCoords.y, z = playerCoords.z }
    })

    ShowNotification('Dispatch', 'Alerte envoyée aux services d\'urgence', 'success')
    cb({})
end)

-- =============================================================================
-- CALLBACKS NUI - MAIL
-- =============================================================================

RegisterNUICallback('mail:send', function(data, cb)
    TriggerServerEvent('phone:server:sendMail', data.to, data.subject, data.body)
    cb({})
end)

RegisterNUICallback('mail:delete', function(data, cb)
    TriggerServerEvent('phone:server:deleteMail', data.id)
    cb({})
end)

RegisterNUICallback('mail:markRead', function(data, cb)
    TriggerServerEvent('phone:server:markMailRead', data.id)
    cb({})
end)

-- =============================================================================
-- CALLBACKS NUI - MUSIQUE
-- =============================================================================

RegisterNUICallback('updateSongs', function(data, cb)
    TriggerServerEvent('phone:server:updateSongs', data.songs)
    cb({})
end)

-- =============================================================================
-- CALLBACKS NUI - SOCIAL
-- =============================================================================

RegisterNUICallback('social:createPost', function(data, cb)
    TriggerServerEvent('phone:server:createSocialPost', data.imageUrl, data.caption)
    cb({})
end)

RegisterNUICallback('social:likePost', function(data, cb)
    TriggerServerEvent('phone:server:likeSocialPost', data.postId, data.isLiked)
    cb({})
end)

-- =============================================================================
-- CALLBACKS NUI - GPS / WAYPOINT
-- =============================================================================

RegisterNUICallback('business:setWaypoint', function(data, cb)
    if data and data.location then
        SetNewWaypoint(data.location.x, data.location.y)
        ShowNotification('GPS', 'Itinéraire calculé', 'info')
    end
    cb({})
end)

RegisterNUICallback('dispatch:setWaypoint', function(data, cb)
    if data and data.coords then
        SetNewWaypoint(data.coords.x, data.coords.y)
        ShowNotification('GPS', 'Itinéraire vers l\'alerte', 'info')
    end
    cb({})
end)

-- =============================================================================
-- ÉVÉNEMENTS SERVEUR -> CLIENT
-- =============================================================================

-- Réception des données du téléphone
RegisterNetEvent('phone:client:loadData', function(data)
    if not isPhoneVisible then return end

    SendNUIMessage({
        type = 'loadData',
        payload = data
    })

    LSPhone.Debug('Phone data loaded')
end)

-- Appel entrant
RegisterNetEvent('phone:client:incomingCall', function(data)
    currentCallData = data

    SendNUIMessage({
        type = 'incomingCall',
        payload = {
            callId = data.callId,
            callerNumber = data.callerNumber,
            callerName = data.callerName
        }
    })

    -- Ouvrir le téléphone automatiquement
    SetPhoneVisible(true)

    -- Jouer un son de sonnerie (optionnel)
    PlaySound(-1, "Phone_Generic_Key", "Phone_Generic", 0, 0, 1)
end)

-- Appel accepté (pour le caller)
RegisterNetEvent('phone:client:callAccepted', function(data)
    currentCallData = data

    SendNUIMessage({
        type = 'callAccepted',
        payload = data
    })

    if Config.EnableVoiceCalls then
        StartVoiceCall(data.receiverNumber)
    end
end)

-- Appel refusé
RegisterNetEvent('phone:client:callDeclined', function()
    SendNUIMessage({
        type = 'callDeclined',
        payload = {}
    })

    currentCallData = nil
    EndVoiceCall()
end)

-- Appel terminé
RegisterNetEvent('phone:client:callEnded', function()
    SendNUIMessage({
        type = 'callEnded',
        payload = {}
    })

    currentCallData = nil
    EndVoiceCall()
end)

-- Nouveau message reçu
RegisterNetEvent('phone:client:newMessage', function(data)
    SendNUIMessage({
        type = 'newMessage',
        payload = data
    })

    ShowNotification(data.senderName or data.senderNumber, data.content, 'info')
end)

-- Nouvelle alerte dispatch
RegisterNetEvent('phone:client:dispatchAlert', function(data)
    SendNUIMessage({
        type = 'dispatchAlert',
        payload = data
    })

    ShowNotification('Dispatch', data.title, 'info')

    -- Ouvrir le téléphone si l'utilisateur est un service d'urgence
    if HasJob({'police', 'sheriff', 'ambulance', 'fire', 'ems'}) then
        SetPhoneVisible(true)
    end
end)

-- Nouveau mail reçu
RegisterNetEvent('phone:client:newMail', function(data)
    SendNUIMessage({
        type = 'newMail',
        payload = data
    })

    ShowNotification('Mail', 'Nouveau mail de ' .. data.sender, 'info')
end)

-- Mise à jour des données bancaires
RegisterNetEvent('phone:client:updateBankData', function(data)
    SendNUIMessage({
        type = 'updateBankData',
        payload = data
    })
end)

-- Spawn de véhicule
RegisterNetEvent('phone:client:spawnVehicle', function(vehicleData)
    local model = vehicleData.model
    local plate = vehicleData.plate
    local coords = vehicleData.coords or GetEntityCoords(PlayerPedId())
    local heading = vehicleData.heading or GetEntityHeading(PlayerPedId())

    -- Charger le modèle
    local modelHash = GetHashKey(model)
    RequestModel(modelHash)

    local timeout = 5000
    while not HasModelLoaded(modelHash) and timeout > 0 do
        Wait(100)
        timeout = timeout - 100
    end

    if HasModelLoaded(modelHash) then
        local vehicle = CreateVehicle(modelHash, coords.x, coords.y, coords.z, heading, true, false)
        SetVehicleNumberPlateText(vehicle, plate)
        SetPedIntoVehicle(PlayerPedId(), vehicle, -1)
        SetVehicleEngineOn(vehicle, true, true, false)
        SetModelAsNoLongerNeeded(modelHash)

        ShowNotification('Garage', 'Véhicule sorti avec succès', 'success')
    else
        ShowNotification('Garage', 'Erreur lors du spawn du véhicule', 'error')
    end
end)

-- =============================================================================
-- VOICE CALL (pma-voice / mumble-voip)
-- =============================================================================

local inVoiceCall = false

function StartVoiceCall(targetNumber)
    if not Config.EnableVoiceCalls then return end

    inVoiceCall = true

    -- pma-voice
    if GetResourceState('pma-voice') == 'started' then
        exports['pma-voice']:addPlayerToCall(Config.VoiceCallChannel)
        LSPhone.Debug('Voice call started (pma-voice)')
    end

    -- mumble-voip (alternative)
    if GetResourceState('mumble-voip') == 'started' then
        exports['mumble-voip']:SetCallChannel(1)
        LSPhone.Debug('Voice call started (mumble-voip)')
    end
end

function EndVoiceCall()
    if not inVoiceCall then return end

    inVoiceCall = false

    -- pma-voice
    if GetResourceState('pma-voice') == 'started' then
        exports['pma-voice']:removePlayerFromCall()
        LSPhone.Debug('Voice call ended (pma-voice)')
    end

    -- mumble-voip
    if GetResourceState('mumble-voip') == 'started' then
        exports['mumble-voip']:SetCallChannel(0)
        LSPhone.Debug('Voice call ended (mumble-voip)')
    end
end

-- =============================================================================
-- EXPORTS
-- =============================================================================

exports('GetPlayerPhoneNumber', function()
    if PlayerData then
        return PlayerData.phoneNumber
    end
    return nil
end)

exports('SendNotification', function(title, message, type)
    ShowNotification(title, message, type)
end)

exports('IsPhoneOpen', function()
    return isPhoneVisible
end)

exports('OpenPhone', function()
    SetPhoneVisible(true)
end)

exports('ClosePhone', function()
    SetPhoneVisible(false)
end)

-- =============================================================================
-- CLEANUP
-- =============================================================================

AddEventHandler('onResourceStop', function(resourceName)
    if GetCurrentResourceName() == resourceName then
        SetNuiFocus(false, false)
        EndVoiceCall()
    end
end)

-- =============================================================================
-- DEBUG
-- =============================================================================

if Config.Debug then
    RegisterCommand('phonetest', function()
        SetPhoneVisible(not isPhoneVisible)
    end, false)

    RegisterCommand('phonecall', function(_, args)
        if args[1] then
            TriggerServerEvent('phone:server:startCall', args[1])
        end
    end, false)
end

print('[LSFive Phone] Client script loaded')
