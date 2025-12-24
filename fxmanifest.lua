--[[
    LSFive Phone - Universal FiveM Phone Resource
    Compatible with: ESX, QBCore, Standalone
    Author: Krigs & Community
    Version: 2.0.0
]]

fx_version 'cerulean'
game 'gta5'

author 'Krigs & Community'
description 'LSFive Phone - A modern, universal FiveM phone resource'
version '2.0.0'
repository 'https://github.com/Krigsexe/lsfive-phone'

lua54 'yes'

-- Decommenter la ligne suivante pour utiliser Node.js 22 (optionnel)
-- Requiert un serveur FiveM recent (2024+)
-- node_version '22'

ui_page 'html/index.html'

shared_scripts {
    '@ox_lib/init.lua',
    'config.lua',
    'shared/*.lua'
}

client_scripts {
    'client/*.lua'
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/*.lua'
}

files {
    'html/index.html',
    'html/**/*.js',
    'html/**/*.css',
    'html/**/*.json',
    'html/**/*.png',
    'html/**/*.jpg',
    'html/**/*.svg',
    'html/**/*.woff',
    'html/**/*.woff2',
    'html/assets/**/*',
    'locales/*.json'
}

dependencies {
    'ox_lib',
    'oxmysql'
}

-- Exports pour l'integration avec d'autres ressources
exports {
    'GetPlayerPhoneNumber',
    'SendNotification',
    'IsPhoneOpen',
    'OpenPhone',
    'ClosePhone'
}

server_exports {
    'GetPlayerPhoneNumber',
    'SendSMS',
    'SendMail',
    'CreateDispatchAlert'
}
