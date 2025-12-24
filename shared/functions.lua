--[[
    LSFive Phone - Fonctions partagées (Client & Server)
]]

LSPhone = LSPhone or {}

-- =============================================================================
-- GÉNÉRATION DE NUMÉRO DE TÉLÉPHONE
-- =============================================================================

---Génère un numéro de téléphone basé sur le format configuré
---@return string phoneNumber Le numéro généré
function LSPhone.GeneratePhoneNumber()
    local format = Config.PhoneNumberFormat or '555-####'
    local number = ''

    for i = 1, #format do
        local char = format:sub(i, i)
        if char == '#' then
            number = number .. tostring(math.random(0, 9))
        else
            number = number .. char
        end
    end

    return number
end

-- =============================================================================
-- FORMATAGE
-- =============================================================================

---Formate un montant en devise
---@param amount number Le montant à formater
---@return string formatted Le montant formaté
function LSPhone.FormatMoney(amount)
    local formatted = tostring(math.floor(amount))
    local k
    while true do
        formatted, k = string.gsub(formatted, "^(-?%d+)(%d%d%d)", '%1,%2')
        if k == 0 then break end
    end
    return '$' .. formatted
end

---Formate un timestamp en date lisible
---@param timestamp number|string Le timestamp ou la date SQL
---@return string formatted La date formatée
function LSPhone.FormatTimestamp(timestamp)
    if type(timestamp) == 'string' then
        -- Format SQL: "2024-01-15 14:30:00"
        local pattern = "(%d+)-(%d+)-(%d+) (%d+):(%d+):(%d+)"
        local year, month, day, hour, min = timestamp:match(pattern)
        if year then
            return string.format("%02d/%02d %02d:%02d", day, month, hour, min)
        end
        return timestamp
    elseif type(timestamp) == 'number' then
        return os.date("%d/%m %H:%M", timestamp)
    end
    return "Unknown"
end

---Formate un timestamp relatif (il y a X minutes/heures)
---@param timestamp number|string Le timestamp
---@return string relative Le temps relatif
function LSPhone.FormatRelativeTime(timestamp)
    local now = os.time()
    local then_time

    if type(timestamp) == 'string' then
        local pattern = "(%d+)-(%d+)-(%d+) (%d+):(%d+):(%d+)"
        local year, month, day, hour, min, sec = timestamp:match(pattern)
        if year then
            then_time = os.time({
                year = tonumber(year),
                month = tonumber(month),
                day = tonumber(day),
                hour = tonumber(hour),
                min = tonumber(min),
                sec = tonumber(sec) or 0
            })
        else
            return timestamp
        end
    else
        then_time = timestamp
    end

    local diff = now - then_time

    if diff < 60 then
        return "À l'instant"
    elseif diff < 3600 then
        local mins = math.floor(diff / 60)
        return string.format("Il y a %dm", mins)
    elseif diff < 86400 then
        local hours = math.floor(diff / 3600)
        return string.format("Il y a %dh", hours)
    elseif diff < 604800 then
        local days = math.floor(diff / 86400)
        return string.format("Il y a %dj", days)
    else
        return LSPhone.FormatTimestamp(timestamp)
    end
end

-- =============================================================================
-- VALIDATION
-- =============================================================================

---Valide un numéro de téléphone
---@param phoneNumber string Le numéro à valider
---@return boolean isValid Si le numéro est valide
function LSPhone.IsValidPhoneNumber(phoneNumber)
    if not phoneNumber or type(phoneNumber) ~= 'string' then
        return false
    end

    -- Nettoyer le numéro (garder seulement les chiffres et tirets)
    local cleaned = phoneNumber:gsub("[^%d%-]", "")

    -- Vérifier la longueur minimale (au moins 7 chiffres)
    local digitsOnly = cleaned:gsub("%-", "")
    if #digitsOnly < 7 then
        return false
    end

    return true
end

---Valide un montant de transfert
---@param amount number|string Le montant
---@return boolean isValid, string? errorMessage
function LSPhone.ValidateTransferAmount(amount)
    local num = tonumber(amount)

    if not num then
        return false, "Montant invalide"
    end

    if num <= 0 then
        return false, "Le montant doit être positif"
    end

    if num ~= math.floor(num) then
        return false, "Le montant doit être un nombre entier"
    end

    if num > 999999999 then
        return false, "Montant trop élevé"
    end

    return true, nil
end

-- =============================================================================
-- UTILITAIRES
-- =============================================================================

---Nettoie un numéro de téléphone (garde seulement les chiffres et tirets)
---@param phoneNumber string Le numéro à nettoyer
---@return string cleaned Le numéro nettoyé
function LSPhone.CleanPhoneNumber(phoneNumber)
    if not phoneNumber then return '' end
    return phoneNumber:gsub("[^%d%-]", "")
end

---Vérifie si une chaîne est un JSON valide
---@param str string La chaîne à vérifier
---@return boolean isValid
function LSPhone.IsValidJSON(str)
    if not str or str == '' then return false end
    local success = pcall(function() json.decode(str) end)
    return success
end

---Encode une table en JSON sécurisé
---@param tbl table La table à encoder
---@return string json Le JSON encodé
function LSPhone.SafeJSONEncode(tbl)
    if not tbl then return '{}' end
    local success, result = pcall(json.encode, tbl)
    if success then
        return result
    end
    return '{}'
end

---Decode un JSON sécurisé
---@param str string Le JSON à décoder
---@return table|nil result La table décodée ou nil
function LSPhone.SafeJSONDecode(str)
    if not str or str == '' then return nil end
    local success, result = pcall(json.decode, str)
    if success then
        return result
    end
    return nil
end

-- =============================================================================
-- DEBUG
-- =============================================================================

---Log de debug (seulement si Config.Debug est activé)
---@param ... any Les éléments à logger
function LSPhone.Debug(...)
    if Config.Debug then
        local args = {...}
        local message = '[LSFive Phone]'
        for _, v in ipairs(args) do
            if type(v) == 'table' then
                message = message .. ' ' .. json.encode(v)
            else
                message = message .. ' ' .. tostring(v)
            end
        end
        print(message)
    end
end

---Log d'erreur (toujours affiché)
---@param ... any Les éléments à logger
function LSPhone.Error(...)
    local args = {...}
    local message = '[LSFive Phone] [ERROR]'
    for _, v in ipairs(args) do
        if type(v) == 'table' then
            message = message .. ' ' .. json.encode(v)
        else
            message = message .. ' ' .. tostring(v)
        end
    end
    print(message)
end

-- =============================================================================
-- EXPORTS LOCAUX
-- =============================================================================

-- Rendre les fonctions disponibles globalement
_G.LSPhone = LSPhone
