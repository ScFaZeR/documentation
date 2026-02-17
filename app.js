const CONFIG_DATA = {
    vscript_cinema: {
        title: "Vscript Cinema (v3)",
        desc: "Système de cinématiques d'introduction et de vidéos immersives gérées par exports.",
        dependencies: ["qb-core / Qbox / ESX", "illenium-appearance (Recommandé)"],
        configTemplate: `Config = {}

Config.Framework = '{{FW}}' -- 'qb-core' or 'esx'
Config.Language = 'fr' -- 'fr' or 'en'
Config.Debug = false

Config.AdminGroups = {
    qbcore = {'god', 'admin'},
    esx = {'superadmin', 'admin'}
}

Config.Intro = {
    Enabled = true,
    Video = 'Lien YouTube',
    Volume = 40,
    WaitTime = 5000 -- ms
}`,
        frameworks: {
            qbcore: { export: "exports['vscript_cinv3']:PlayIntro()" },
            esx: { export: "exports['vscript_cinv3']:PlayIntro()" }
        },
        settings: [
            { label: "Intégration", value: "Le script détecte automatiquement la fin de création de perso sur illenium-appearance." }
        ],
        details: {
            features: [
                "Détection automatique de création de personnage",
                "Gestion multicaméra pour les intros",
                "Système d'admin pour déclencher des vidéos",
                "Introduction sonore synchronisée"
            ],
            commands: [
                { name: "/playvideo [url]", desc: "Déclenche une vidéo pour soi-même (Admin)" }
            ]
        },
        configExplanations: [
            { key: "Config.Framework", type: "string", desc: "Définit le framework (qb-core ou esx). Autogéré par le sélecteur." },
            { key: "Config.Language", type: "string", desc: "Langue de l'interface (fr ou en)." },
            { key: "Config.Debug", type: "boolean", desc: "Active les logs console pour le développement." },
            { key: "Config.AdminGroups", type: "table", desc: "Groupes autorisés à utiliser les commandes admin." },
            { key: "Config.Intro.Enabled", type: "boolean", desc: "Active la vidéo à la première connexion." },
            { key: "Config.Intro.Video", type: "string", desc: "URL YouTube ou fichier local du dossier NUI." },
            { key: "Config.Intro.Volume", type: "number", desc: "Volume sonore de la vidéo (0-100)." },
            { key: "Config.Intro.WaitTime", type: "number", desc: "Temps d'attente (ms) avant le lancement (pour chargement)." }
        ],
        bridges: [
            { name: "Framework Discovery", type: "system", desc: "Détection automatique d'ESX ou QBCore pour les exports." },
            { name: "UI Bridge", type: "ui", desc: "Utilise ox_lib pour les menus, les inputs et les barres de progression." }
        ],
        bridgeCode: {
            server: `-- Initialisation framework\nCreateThread(function()\n    if Config.Framework == 'esx' then\n        while ESX == nil do\n            ESX = exports['es_extended']:getSharedObject()\n            Wait(100)\n        end\n    elseif Config.Framework == 'qb-core' then\n        while QBCore == nil do\n            QBCore = exports['qb-core']:GetCoreObject()\n            Wait(100)\n        end\n    end\nend)\n\n-- Vérifier admin\nlocal function IsPlayerAdmin(source)\n    if adminCache[source] ~= nil then\n        return adminCache[source]\n    end\n    \n    local isAdmin = false\n    \n    if Config.Framework == 'esx' and ESX then\n        local xPlayer = ESX.GetPlayerFromId(source)\n        if xPlayer then\n            local playerGroup = xPlayer.getGroup()\n            for _, group in ipairs(Config.AdminGroups.esx) do\n                if playerGroup == group then\n                    isAdmin = true\n                    break\n                end\n            end\n        end\n    elseif Config.Framework == 'qb-core' and QBCore then\n        local player = QBCore.Functions.GetPlayer(source)\n        if player then\n            for _, group in ipairs(Config.AdminGroups.qbcore) do\n                if QBCore.Functions.HasPermission(source, group) then\n                    isAdmin = true\n                    break\n                end\n            end\n        end\n    end\n    \n    adminCache[source] = isAdmin\n    return isAdmin\nend\n\n-- Export\nfunction PlayVideo(url, targetType, value, volume, source)\n    local videoId = ExtractYouTubeID(url)\n    if not videoId then return false end\n\n    local src = source or 0 \n    local targets = ParseTargets(targetType, value, src)\n    \n    if #targets == 0 then return false end\n    \n    -- Arrêter toute vidéo précédente pour ces cibles\n    for _, playerId in ipairs(targets) do\n        TriggerClientEvent('youtube-cinema:stopVideo', playerId)\n    end\n    \n    Wait(200)\n    \n    activeVideo = videoId\n    activeTargets = targets\n    \n    for _, playerId in ipairs(targets) do\n        TriggerClientEvent('youtube-cinema:playVideo', playerId, videoId, volume or 80)\n    end\n    \n    return true\nend\n\nexports('PlayVideo', PlayVideo)`
        }
    },
    vscript_marker: {
        title: "Vscript Marker",
        desc: "Gestion de points d'intérêt (POI) dynamiques sur la carte avec blips et types personnalisés.",
        dependencies: ["qb-core / Qbox / ESX"],
        configTemplate: `Config = {}

Config.Framework = '{{FW}}' -- 'QBCore' or 'ESX'
Config.Language = 'fr' 
Config.MaxMarkers = 15
Config.Debug = false

Config.Blip = {
    Sprite = 1,
    Scale = 0.8,
    Color = 1,
    Display = 4,
    ShortRange = true
}

Config.MarkerTypes = {
    ['type_refuge'] = 40,
    ['type_danger'] = 443,
    ['type_medical'] = 153,
    -- ... (voir liste complète en bas)
}`,
        frameworks: {
            qbcore: { config: "" },
            esx: { config: "" }
        },
        settings: [
            { label: "Capacité", value: "Config.MaxMarkers = 15 (Limite de marqueurs par joueur)" }
        ],
        details: {
            types: [
                "type_refuge (40)", "type_danger (443)", "type_medical (153)", "type_loot (478)",
                "type_ambush (459)", "type_vehicle (225)", "type_repair (446)", "type_shopping (52)",
                "type_weapon (110)", "type_meetup (280)"
            ]
        },
        configExplanations: [
            { key: "Config.Framework", type: "string", desc: "Framework cible (QBCore ou ESX)." },
            { key: "Config.Language", type: "string", desc: "Langue du script." },
            { key: "Config.MaxMarkers", type: "number", desc: "Nombre maximum de marqueurs qu'un joueur peut poser." },
            { key: "Config.Blip", type: "table", desc: "Configuration visuelle du point sur la carte (sprite, couleur, échelle)." },
            { key: "Config.MarkerTypes", type: "table", desc: "Associe des noms personnalisés à des IDs de blips GTA." }
        ],
        bridges: [
            { name: "Standalone Storage", type: "system", desc: "Utilise SetResourceKvp pour sauvegarder les données côté serveur sans base SQL." },
            { name: "Universal Identifier", type: "system", desc: "Basé sur la licence Rockstar pour une compatibilité tous frameworks." }
        ],
        bridgeCode: {
            server: `-- Get player identifier\nlocal function GetPlayerIdentifier(source)\n    for _, id in ipairs(GetPlayerIdentifiers(source)) do\n        if string.find(id, "license:") then\n            return id\n        end\n    end\n    return nil\nend\n\n-- KVP Key for a player\nlocal function GetKVPKey(identifier)\n    return "vscript_markers_" .. identifier:gsub(":", "_")\nend\n\n-- Load markers for a player\nlocal function LoadPlayerMarkers(identifier)\n    local key = GetKVPKey(identifier)\n    local data = GetResourceKvpString(key)\n    \n    if data and data ~= "" then\n        local markers = json.decode(data)\n        if markers then\n            return markers\n        end\n    end\n    \n    return {}\nend\n\n-- Save markers for a player\nlocal function SavePlayerMarkers(identifier, markers)\n    local key = GetKVPKey(identifier)\n    local data = json.encode(markers)\n    SetResourceKvp(key, data)\nend`
        }
    },
    vscript_doc: {
        title: "Vscript Document",
        desc: "Système avancé de documents In-Game utilisant les métadonnées de l'inventaire.",
        dependencies: ["ox_inventory", "ox_lib", "Qbox / ESX"],
        configTemplate: `Config = {}

Config.Framework = '{{FW}}' -- 'Qbox' or 'ESX'
Config.CoreName = '{{CORENAME}}'
Config.Language = 'fr'
Config.Inventory = '{{INV}}' -- 'ox', 'qb', 'qs', 'esx'
Config.Debug = false

Config.Items = {
    document_vierge = 'document_vierge'
}

Config.MaxDocLength = 1000
Config.CleanHTML = true`,
        frameworks: {
            qbcore: { config: "" },
            esx: { config: "" }
        },
        settings: [
            { label: "Item requis", value: "document_vierge" },
            { label: "Limites", value: "Config.MaxDocLength = 1000 (Caractères max)\nConfig.CleanHTML = true" }
        ],
        details: {
            system: [
                "Utilise ox_inventory:usedItem pour la synchro parfaite",
                "Les documents sont stockés en métadonnées d'item",
                "Interface de lecture/écriture custom",
                "Nettoyage automatique des balises HTML parasites"
            ]
        },
        items: [
            { name: "document_vierge", label: "Document Vierge", weight: 10, description: "Un papier blanc pour écrire.", unique: true }
        ],
        configExplanations: [
            { key: "Config.Framework", type: "string", desc: "Framework utilisé (Qbox ou ESX)." },
            { key: "Config.CoreName", type: "string", desc: "Nom du dossier de votre core (ex: qbx_core)." },
            { key: "Config.Inventory", type: "string", desc: "Système d'inventaire pour la détection d'item." },
            { key: "Config.Items", type: "table", desc: "Mappe le nom de l'item en jeu à la logique interne." },
            { key: "Config.MaxDocLength", type: "number", desc: "Limite de caractères pour éviter les abus de stockage." },
            { key: "Config.CleanHTML", type: "boolean", desc: "Nettoie le texte des scripts malicieux avant sauvegarde." }
        ],
        bridges: [
            { name: "Bridge Framework (Server)", type: "system", desc: "Initialisation multi-FW et gestion des métadonnées." },
            { name: "Bridge Framework (Client)", type: "system", desc: "Initialisation Client et système de notification." }
        ],
        bridgeCode: {
            server: `-- [[ INITIALISATION DU FRAMEWORK ]]\nif Config.Framework == 'QBCore' then\n    Bridge.Framework = exports[Config.CoreName or 'qb-core']:GetCoreObject()\nelseif Config.Framework == 'Qbox' then\n    Bridge.Framework = exports[Config.CoreName or 'qbx_core']\nelseif Config.Framework == 'ESX' then\n    Bridge.Framework = exports[Config.ExtendedName or 'es_extended']:getSharedObject()\nend\n\n-- [[ SYSTÈME DE NOTIFICATION ]]\nfunction Bridge.Notify(src, msg, type)\n    TriggerClientEvent('vscript_doc:client:notification', src, msg, type)\nend\n\n-- [[ GESTION DES MÉTADONNÉES / INFO ]]\nfunction Bridge.GetItemMetadata(item)\n    if not item then return {} end\n    return item.info or item.metadata or {}\nend\n\nfunction Bridge.SetItemMetadata(src, slot, metadata)\n    slot = tonumber(slot)\n    if not slot then return false end\n\n    if Config.Inventory == "ox" then\n        exports.ox_inventory:SetMetadata(src, slot, metadata)\n        return true\n    elseif Config.Inventory == "qs" then\n        exports['qs-inventory']:SetItemMetadata(src, slot, metadata)\n        return true\n    elseif Config.Inventory == "qb" or Config.Framework == 'QBCore' or Config.Framework == 'Qbox' then\n        local Player = Bridge.GetPlayer(src)\n        if Player then\n            if Config.Framework == 'Qbox' or not Player.Functions then\n                if Player.PlayerData and Player.PlayerData.items then\n                    Player.PlayerData.items[slot].info = metadata\n                    return true\n                \tend\n            else\n                local item = Player.Functions.GetItemBySlot(slot)\n                if item then\n                    item.info = metadata\n                    Player.Functions.SetInventory(Player.PlayerData.items)\n                    return true\n                end\n            end\n        end\n    end\n    return false\nend`,
            client: `-- [[ INITIALISATION DU FRAMEWORK ]]\nif Config.Framework == 'QBCore' then\n    Bridge.Framework = exports[Config.CoreName or 'qb-core']:GetCoreObject()\nelseif Config.Framework == 'Qbox' then\n    Bridge.Framework = exports[Config.CoreName or 'qbx_core']\nelseif Config.Framework == 'ESX' then\n    Bridge.Framework = exports[Config.ExtendedName or 'es_extended']:getSharedObject()\nend\n\nfunction Bridge.Notify(msg, type)\n    if Config.Framework == 'QBCore' or Config.Framework == 'Qbox' then\n        if Config.Framework == 'Qbox' or not Bridge.Framework.Functions then\n            Bridge.Framework:Notify(msg, type)\n        else\n            Bridge.Framework.Functions.Notify(msg, type)\n        end\n    elseif Config.Framework == 'ESX' then\n        Bridge.Framework.ShowNotification(msg, type)\n    else\n        BeginTextCommandThefeedPost("STRING")\n        AddTextComponentString(msg)\n        EndTextCommandThefeedPostTicker(false, true)\n    end\nend`
        }
    },
    vscript_mood: {
        title: "Vscript Mood",
        desc: "Système d'humeurs, expressions faciales et animations de personnalité.",
        dependencies: ["Aucune (Standalone)"],
        configTemplate: `Config = {}

Config.Language = 'fr'
Config.DefaultKey = 'F5'
Config.DefaultMood = 'neutral'
Config.AnimationChance = 100

Config.Moods = {
    ['neutral'] = { label = 'Neutre', icon = 'face-meh', move = 'move_m@casual@d' },
    ['happy'] = { label = 'Joyeux', icon = 'face-laugh-beam', move = 'move_m@confident' },
    -- ... (config exhaustive disponible dans le script)
}`,
        frameworks: {
            qbcore: { config: "Indépendant" },
            esx: { config: "Indépendant" }
        },
        settings: [
            { label: "Probabilité", value: "100%" },
            { label: "Contrôles", value: "F5 (par défaut)" },
            { label: "Défaut", value: "Config.DefaultMood = 'neutral'" }
        ],
        details: {
            moodList: [
                { label: "Neutre", icon: "face-meh", move: "move_m@casual@d" },
                { label: "Joyeux", icon: "face-laugh-beam", move: "move_m@confident" },
                { label: "Triste", icon: "face-sad-tear", move: "move_m@sad@a" },
                { label: "Énervé", icon: "face-angry", move: "move_m@gangster@var_i" },
                { label: "Stressé", icon: "face-grimace", move: "move_m@hurry@a" }
            ],
            features: [
                "Dizaines d'animations par humeur",
                "Changement de démarche dynamique",
                "Expressions faciales persistantes",
                "Animations automatiques lors de la parole (Proximité)"
            ]
        },
        configExplanations: [
            { key: "Config.Language", type: "string", desc: "Langue du menu NUI." },
            { key: "Config.DefaultKey", type: "string", desc: "Touche d'ouverture rapide (F1-F12, etc.)." },
            { key: "Config.DefaultMood", type: "string", desc: "Humeur appliquée automatiquement au respawn." },
            { key: "Config.AnimationChance", type: "number", desc: "Chance de jouer une petite animation d'humeur en marchant." },
            { key: "Config.Moods", type: "table", desc: "Définit les labels, icônes et démarche (walkstyle) par humeur." }
        ],
        bridges: [
            { name: "Hybrid Standalone", type: "system", desc: "Cœur indépendant, utilise le framework uniquement pour les notifications." },
            { name: "Animation Engine", type: "ui", desc: "Lecture native des expressions et styles de marche GTA V." }
        ],
        bridgeCode: {
            server: `function Bridge.SetMood(source, mood)\n    TriggerClientEvent('vscript_mood:applyPlayerMood', -1, source, mood)\nend`
        }
    },
    vscript_tableau: {
        title: "Vscript Tableau",
        desc: "Tableaux interactifs plaçables pour le RP (notes, photos, indices).",
        dependencies: ["ox_lib", "ox_target", "ox_inventory"],
        configTemplate: `Config = {}

Config.Framework = '{{FW}}'
Config.Language = 'fr'
Config.Inventory = '{{INV}}'
Config.TargetMethod = 'model' -- 'model' or 'local'
Config.Debug = false

Config.Items = {
    AddPhoto = 'photo',
    AddNote = 'stylo'
}

Config.PlacementSpeed = {
    Rotation = 1.0,
    Movement = 0.01
}

Config.OnlyOwnerCanPickup = true
Config.RenderDistance = 15.0`,
        frameworks: {
            qbcore: { config: "" },
            esx: { config: "" }
        },
        settings: [
            { label: "Items", value: "photo, stylo" },
            { label: "Placement", value: "Config.PlacementSpeed.Rotation = 1.0\nConfig.PlacementSpeed.Movement = 0.01" },
            { label: "Limites", value: "Config.OnlyOwnerCanPickup = true\nConfig.RenderDistance = 15.0" }
        ],
        details: {
            controls: [
                "Flèches / ZQSD : Déplacer le tableau",
                "Molette : Rotation",
                "Shift : Vitesse x5",
                "E / Enter : Valider le placement"
            ],
            features: [
                "Contenu synchronisé entre tous les joueurs",
                "Support des URLs directes pour les photos",
                "Notes textuelles persistantes",
                "Interaction par ciblage (ox_target)"
            ]
        },
        items: [
            { name: "item_tableau", label: "Tableau d'enquête", weight: 1000, description: "Un tableau en liège pour vos enquêtes.", unique: true },
            { name: "photo", label: "Photo", weight: 10, description: "Une photo imprimée.", unique: true },
            { name: "stylo", label: "Stylo", weight: 50, description: "Pour écrire des notes.", unique: false }
        ],
        configExplanations: [
            { key: "Config.Framework", type: "string", desc: "Framework de synchronisation." },
            { key: "Config.Inventory", type: "string", desc: "Inventaire utilisé (Ox recommandé)." },
            { key: "Config.TargetMethod", type: "string", desc: "'model' (plus stable) ou 'local' pour ox_target." },
            { key: "Config.Items", type: "table", desc: "Noms des items pour ajouter du contenu via l'inventaire." },
            { key: "Config.PlacementSpeed", type: "table", desc: "Sensibilité des contrôles lors de la pose." },
            { key: "Config.OnlyOwnerCanPickup", type: "boolean", desc: "Si vrai, seul le poseur peut reprendre le tableau." },
            { key: "Config.RenderDistance", type: "number", desc: "Distance d'affichage des photos et du texte." }
        ],
        bridges: [
            { name: "Target Bridge", type: "interaction", desc: "Compatibilité native avec ox_target pour les zones interactives." },
            { name: "Framework Bridge", type: "system", desc: "Compatible Qbox, QBCore et ESX via un bridge unifié." }
        ],
        bridgeCode: {
            server: `local Bridge = {}\nif GetResourceState('es_extended') == 'started' then\n    Bridge.Framework = 'esx'\n    Bridge.ESX = exports['es_extended']:getSharedObject()\nelseif GetResourceState('qb-core') == 'started' then\n    Bridge.Framework = 'qb'\n    Bridge.QBCore = exports['qb-core']:GetCoreObject()\nend`
        }
    },
    vscript_go_fast: {
        title: "Vscript Go-Fast",
        desc: "Missions de livraison rapide de mallettes de drogue sous pression policière.",
        dependencies: ["ox_lib", "ox_target", "vscript_dispatch", "InteractSound"],
        configTemplate: `Config = {}

Config.Framework = '{{FW}}'
Config.Language = 'fr'
Config.Inventory = '{{INV}}'
Config.Dispatch = {
    system = '{{DISPATCH}}' -- 'vscript_dispatch', 'ps-dispatch', etc.
}

Config.MinimumPolice = 1
Config.Cooldown = 300

Config.Pay = {
    moneyType = 'cash',
    baseAmount = 1500,
    bonusAmount = 200,
    bonusTimeLimit = 180 -- sec
}`,
        frameworks: {
            qbcore: { config: "" },
            esx: { config: "" }
        },
        settings: [
            { label: "Prébais", value: "Config.Cooldown = 300 (secondes)\nConfig.MinimumPolice = 1 flic" },
            { label: "Paiement", value: "Base: 1500 / Bonus: 200" },
            { label: "Temps Bonus", value: "Config.Pay.bonusTimeLimit = 180 (sec)" }
        ],
        details: {
            phases: [
                "Appel Jacky Grosbiz (60s d'appel immersif)",
                "Rencontre avec le contact (Récupération mallette)",
                "Récupération du véhicule (Sentinel, Sultan, Kuruma...)",
                "Course contre la montre (Blip livraison distant)",
                "Paiement et Cooldown"
            ],
            sounds: ["jacky_call", "jacky_contact", "contact"],
            features: [
                "Timer de bonus affiché à l'écran",
                "Alerte police automatique après récupération",
                "Annulation automatique si véhicule perdu",
                "Sons interactifs synchronisés"
            ]
        },
        configExplanations: [
            { key: "Config.Framework", type: "string", desc: "Framework de gestion (QB/ESX)." },
            { key: "Config.Inventory", type: "string", desc: "Gestion des items mallettes." },
            { key: "Config.Dispatch", type: "table", desc: "Nom de la ressource de dispatch pour les alertes." },
            { key: "Config.MinimumPolice", type: "number", desc: "Nombre de flics en service pour lancer la mission." },
            { key: "Config.Cooldown", type: "number", desc: "Attente en secondes entre deux missions." },
            { key: "Config.Pay", type: "table", desc: "Réglages de la paie, bonus de temps et type de monnaie." }
        ],
        bridges: [
            { name: "Bridge Framework (Server)", type: "system", desc: "Logic de détection du framework et calcul DutyCount." },
            { name: "Bridge Inventory (Customization)", type: "inventory", desc: "Hooks d'ajout d'items pour Ox, QS, QB, ESX." },
            { name: "Bridge Dispatch (Customization)", type: "system", desc: "Intégration multi-systèmes (PS, QS, Vscript, etc.)." }
        ],
        bridgeCode: {
            framework: `local Bridge = {}\nBridge.Framework = nil\n\n-- Detect Framework\nif GetResourceState('es_extended') == 'started' then\n    Bridge.Framework = 'esx'\n    Bridge.ESX = exports['es_extended']:getSharedObject()\n    print('^2[vscript_gofast] Framework detected: ESX^7')\nelseif GetResourceState('qb-core') == 'started' then\n    Bridge.Framework = 'qb'\n    Bridge.QBCore = exports['qb-core']:GetCoreObject()\n    print('^2[vscript_gofast] Framework detected: QBCore^7')\nelseif GetResourceState('qbx_core') == 'started' then\n    Bridge.Framework = 'qbox'\n    Bridge.QBCore = exports['qbx_core']\n    print('^2[vscript_gofast] Framework detected: Qbox^7')\nelse\n    Bridge.Framework = 'standalone'\n    print('^3[vscript_gofast] No supported framework detected, running in Standalone mode^7')\nend\n\nfunction Bridge.GetDutyCount(jobs)\n    local count = 0\n    if type(jobs) == 'string' then jobs = { jobs } end\n\n    if Bridge.Framework == 'qb' or Bridge.Framework == 'qbox' then\n        if Bridge.Framework == 'qbox' or not Bridge.QBCore.Functions then\n            for _, job in ipairs(jobs) do\n                count = count + Bridge.QBCore:GetDutyCount(job)\n            end\n        elseif Bridge.QBCore.Functions.GetDutyCount then\n            for _, job in ipairs(jobs) do\n                count = count + Bridge.QBCore.Functions.GetDutyCount(job)\n            end\n        else\n            for _, src in pairs(Bridge.QBCore.Functions.GetPlayers()) do\n                local Player = Bridge.QBCore.Functions.GetPlayer(src)\n                if Player and Player.PlayerData.job.onduty then\n                    for _, job in ipairs(jobs) do\n                        if Player.PlayerData.job.name == job then\n                            count = count + 1\n                            break\n                        end\n                    end\n                end\n            end\n        end\n    elseif Bridge.Framework == 'esx' then\n        local xPlayers = Bridge.ESX.GetPlayers()\n        for i = 1, #xPlayers, 1 do\n            local xPlayer = Bridge.ESX.GetPlayerFromId(xPlayers[i])\n            if xPlayer then\n                for _, job in ipairs(jobs) do\n                    if xPlayer.job.name == job then\n                        count = count + 1\n                        break\n                    end\n                end\n            end\n        end\n    end\n    return count\nend\n\n_G.Bridge = Bridge`,
            inventory: `if not IsDuplicityVersion() then return end\n\n-- ==========================================\n-- INVENTORY DETECTION\n-- ==========================================\nBridge.Inventory = nil\n\nif GetResourceState('ox_inventory') == 'started' then\n    Bridge.Inventory = 'ox'\nelseif GetResourceState('qs-inventory') == 'started' then\n    Bridge.Inventory = 'qs'\nelseif Bridge.Framework == 'qb' or Bridge.Framework == 'qbox' then\n    Bridge.Inventory = 'qb'\nelseif Bridge.Framework == 'esx' then\n    Bridge.Inventory = 'esx'\nend\n\nfunction Bridge.AddItem(source, item, count)\n    if Bridge.Inventory == 'ox' then\n        return exports.ox_inventory:AddItem(source, item, count)\n    elseif Bridge.Inventory == 'qs' then\n        return exports['qs-inventory']:AddItem(source, item, count)\n    elseif Bridge.Inventory == 'qb' then\n        local Player = Bridge.QBCore.Functions.GetPlayer(source)\n        return Player.Functions.AddItem(item, count)\n    elseif Bridge.Inventory == 'esx' then\n        local xPlayer = Bridge.ESX.GetPlayerFromId(source)\n        xPlayer.addInventoryItem(item, count)\n        return true\n    end\n    return false\nend`,
            dispatch: `if not IsDuplicityVersion() then return end\n\n-- ==========================================\n-- DISPATCH — Multi-système\n-- ==========================================\n\nfunction Bridge.SendDispatchAlert(source, coords, streetName, plate, model)\n    local system = Config.Dispatch.system\n    local dispatch = Config.Dispatch\n\n    if not dispatch.enabled then return end\n\n    local msg = dispatch.message .. ' (Véhicule: ' .. (model or 'Inconnu') .. ' - Plaque: ' .. (plate or '...') .. ')'\n\n    if system == 'ps-dispatch' then\n        local data = {\n            message = msg,\n            codeName = 'gofast',\n            code = '10-31',\n            icon = 'fas fa-car',\n            priority = 2,\n            coords = coords,\n            street = streetName,\n            jobs = { 'police', 'sheriff' }\n        }\n        TriggerEvent('dispatch:server:notify', data)\n    elseif system == 'qs-dispatch' then\n        local data = {\n            job = 'police',\n            callLocation = coords,\n            callCode = { code = '10-31', snippet = 'Go-Fast' },\n            message = msg,\n            flashes = true,\n            image = nil,\n            blip = {\n                sprite = 161,\n                scale = 1.2,\n                colour = 1,\n                flashes = true,\n                text = 'Go-Fast',\n                time = (5 * 60 * 1000),\n            }\n        }\n        TriggerEvent('qs-dispatch:server:CreateDispatchCall', data)\n    elseif system == 'vscript_dispatch' then\n        exports['vscript_dispatch']:SendDispatch('gofast', coords, msg, -1, { plate = plate, model = model })\n    end\nend`
        }
    },
    vscript_carjack: {
        title: "Vscript CarJack",
        desc: "Système complet de vol de véhicules sur commande avec garage de piratage.",
        dependencies: ["ox_lib", "ox_target", "vscript_dispatch", "InteractSound"],
        configTemplate: `Config = {}

Config.Framework = '{{FW}}'
Config.Language = 'fr'
Config.Inventory = '{{INV}}'
Config.Dispatch = {
    system = '{{DISPATCH}}'
}

Config.MinimumPolice = 1

Config.Settings = {
    missionCooldown = 300,
    searchRadius = 250.0,
    hackWaitTime = 10000 -- ms
}

Config.TargetVehicles = {
    { model = 'sentinel', label = 'Sentinel', price = 5000 },
    { model = 'sultan', label = 'Sultan', price = 7000 },
}`,
        frameworks: {
            qbcore: { config: "" },
            esx: { config: "" }
        },
        settings: [
            { label: "Cooldown", value: "Config.Settings.missionCooldown = 300 (sec)" },
            { label: "Police", value: "Config.MinimumPolice = 1 flic requis" },
            { label: "Zone", value: "250m de rayon" },
            { label: "Garage Hack", value: "Désactivation du traqueur requise avant livraison" }
        ],
        details: {
            phases: [
                "Appel au commanditaire (Caméras cinématiques)",
                "Localisation de la zone de recherche (Cercle blip)",
                "Filature/Vol du véhicule (Le PNJ se promène)",
                "Alerte Police / Traqueur (Le GPS bip)",
                "Passage au Garage de Hack (Mini-jeu NUI)",
                "Livraison au client clandestin"
            ],
            mechanics: [
                "Zone de recherche dynamique (rétrécit avec le temps)",
                "Traqueur GPS sonore (InteractSound)",
                "Bonus si état du véhicule parfait (100%)",
                "PNJ conducteur qui prend la fuite",
                "Détection intelligente du modèle et de la plaque"
            ],
            sounds: ["carjack_call", "carjack_tracker", "carjack_hack", "carjack_good", "carjack_bad"]
        },
        configExplanations: [
            { key: "Config.Framework", type: "string", desc: "Framework supporté (QB/ESX)." },
            { key: "Config.Dispatch", type: "table", desc: "Système d'alertes policières lors du vol." },
            { key: "Config.MinimumPolice", type: "number", desc: "Flics requis pour l'interaction avec le PNJ." },
            { key: "Config.Settings.missionCooldown", type: "number", desc: "Délai avant un nouvel appel du commanditaire." }
        ],
        bridges: [
            { name: "Bridge Framework (Server)", type: "system", desc: "Logic de détection multi-FW et calcul DutyCount." },
            { name: "Bridge Inventory (Customization)", type: "inventory", desc: "Hooks de gestion d'items compatibles multi-inventaires." },
            { name: "Bridge Dispatch (Customization)", type: "system", desc: "Système d'alertes policières pour le vol de véhicules." }
        ],
        bridgeCode: {
            framework: `local Bridge = {}\nBridge.Framework = nil\n\n-- Detect Framework\nif GetResourceState('es_extended') == 'started' then\n    Bridge.Framework = 'esx'\n    Bridge.ESX = exports['es_extended']:getSharedObject()\n    print('^2[vscript_carjack] Framework detected: ESX^7')\nelseif GetResourceState('qb-core') == 'started' then\n    Bridge.Framework = 'qb'\n    Bridge.QBCore = exports['qb-core']:GetCoreObject()\n    print('^2[vscript_carjack] Framework detected: QBCore^7')\nelseif GetResourceState('qbx_core') == 'started' then\n    Bridge.Framework = 'qbox'\n    print('^2[vscript_carjack] Framework detected: Qbox^7')\nelse\n    Bridge.Framework = 'standalone'\n    print('^3[vscript_carjack] No supported framework detected, running in Standalone mode^7')\nend\n\nfunction Bridge.GetDutyCount(jobs)\n    local count = 0\n    if type(jobs) == 'string' then jobs = { jobs } end\n\n    if Bridge.Framework == 'qb' or Bridge.Framework == 'qbox' then\n        if Bridge.QBCore and Bridge.QBCore.Functions.GetDutyCount then\n            for _, job in ipairs(jobs) do\n                count = count + Bridge.QBCore.Functions.GetDutyCount(job)\n            end\n        else\n            local players = {}\n            if Bridge.Framework == 'qbox' then\n                players = exports.qbx_core:GetPlayerIds()\n            else\n                players = Bridge.QBCore.Functions.GetPlayers()\n            end\n\n            for _, src in pairs(players) do\n                local Player = (Bridge.Framework == 'qbox') and exports.qbx_core:GetPlayer(src) or\n                Bridge.QBCore.Functions.GetPlayer(src)\n                if Player and Player.PlayerData.job.onduty then\n                    for _, job in ipairs(jobs) do\n                        if Player.PlayerData.job.name == job then\n                            count = count + 1\n                            break\n                        end\n                    end\n                end\n            end\n        end\n    elseif Bridge.Framework == 'esx' then\n        local xPlayers = Bridge.ESX.GetPlayers()\n        for i = 1, #xPlayers, 1 do\n            local xPlayer = Bridge.ESX.GetPlayerFromId(xPlayers[i])\n            if xPlayer then\n                for _, job in ipairs(jobs) do\n                    if xPlayer.job.name == job then\n                        count = count + 1\n                        break\n                    end\n                end\n            end\n        end\n    end\n    return count\nend\n\n_G.Bridge = Bridge`,
            inventory: `if not IsDuplicityVersion() then return end\n\nfunction AddItem(source, item, count)\n    if Bridge.Framework == 'qbox' then\n        return exports.ox_inventory:AddItem(source, item, count)\n    elseif Bridge.Framework == 'qb' then\n        local Player = Bridge.QBCore.Functions.GetPlayer(source)\n        return Player.Functions.AddItem(item, count)\n    end\nend`,
            dispatch: `if not IsDuplicityVersion() then return end\n\nfunction TriggerDispatch(coords, message)\n    if not Config.Dispatch.enabled then return end\n    if Config.Dispatch.system == 'ps-dispatch' then\n        exports['ps-dispatch']:SuspiciousActivity(coords, message)\n    elseif Config.Dispatch.system == 'vscript_dispatch' then\n        exports['vscript_dispatch']:SendDispatch('carjack', coords, message, -1)\n    end\nend`
        }
    },
    vscript_dispatch: {
        title: "Vscript Dispatch",
        desc: "Système de dispatch immersif avec gestion d'antennes radio et alertes sonores séquencées.",
        dependencies: ["qb-core / Qbox / ESX", "InteractSound", "ox_lib"],
        configTemplate: `Config = {}\nConfig.Jobs = { ['police'] = true, ['sheriff'] = true }\nConfig.AudioMode = 'InteractSound'\nConfig.Antennas = { ... }`,
        frameworks: { qbcore: { config: "" }, esx: { config: "" } },
        settings: [{ label: "Audio", value: "InteractSound / AWC / NUI" }],
        details: { features: ["Brouillage radio par zone", "Historique des appels (Touche K)", "Sons de district personnalisés"] },
        configExplanations: [{ key: "Config.Jobs", type: "table", desc: "Métiers recevant les alertes." }],
        bridges: [
            { name: "Bridge Framework (Server)", type: "system", desc: "Initialisation Serveur et helpers de données joueurs." },
            { name: "Bridge Framework (Client)", type: "system", desc: "Initialisation Client et notifications natives." }
        ],
        bridgeCode: {
            server: `local Bridge = {}\nBridge.Framework = nil\n\nif GetResourceState('es_extended') == 'started' then\n    Bridge.Framework = 'esx'\n    Bridge.ESX = exports['es_extended']:getSharedObject()\n    print('^2[vscript_dispatch] Framework detected: ESX^7')\nelseif GetResourceState('qb-core') == 'started' then\n    Bridge.Framework = 'qb'\n    Bridge.QBCore = exports['qb-core']:GetCoreObject()\n    print('^2[vscript_dispatch] Framework detected: QBCore^7')\nelseif GetResourceState('qbx_core') == 'started' then\n    Bridge.Framework = 'qbox'\n    print('^2[vscript_dispatch] Framework detected: Qbox^7')\nelse\n    Bridge.Framework = 'standalone'\n    print('^3[vscript_dispatch] No supported framework detected, running in Standalone mode^7')\nend\n\nfunction Bridge.GetPlayer(source)\n    if Bridge.Framework == 'qb' or Bridge.Framework == 'qbox' then\n        return Bridge.QBCore.Functions.GetPlayer(source)\n    elseif Bridge.Framework == 'esx' then\n        local xPlayer = Bridge.ESX.GetPlayerFromId(source)\n        if xPlayer then\n            return {\n                source = source,\n                PlayerData = {\n                    source = source,\n                    job = {\n                        name = xPlayer.job.name,\n                        label = xPlayer.job.label,\n                        onduty = true\n                    },\n                    charinfo = {\n                        firstname = xPlayer.get('firstName') or 'John',\n                        lastname = xPlayer.get('lastName') or 'Doe'\n                    }\n                }\n            }\n        end\n    end\n    return nil\nend\n\nfunction Bridge.NotifyClient(source, msg, type)\n    if Bridge.Framework == 'qb' or Bridge.Framework == 'qbox' then\n        TriggerClientEvent('QBCore:Notify', source, msg, type)\n    elseif Bridge.Framework == 'esx' then\n        TriggerClientEvent('esx:showNotification', source, msg)\n    end\nend\n\n_G.Bridge = Bridge`,
            client: `local Bridge = {}\nBridge.Framework = nil\n\nif GetResourceState('es_extended') == 'started' then\n    Bridge.Framework = 'esx'\n    Bridge.ESX = exports['es_extended']:getSharedObject()\n    print('^2[vscript_dispatch] Client Framework detected: ESX^7')\nelseif GetResourceState('qb-core') == 'started' then\n    Bridge.Framework = 'qb'\n    Bridge.QBCore = exports['qb-core']:GetCoreObject()\n    print('^2[vscript_dispatch] Client Framework detected: QBCore^7')\nelseif GetResourceState('qbx_core') == 'started' then\n    Bridge.Framework = 'qbox'\n    print('^2[vscript_dispatch] Client Framework detected: Qbox^7')\nelse\n    Bridge.Framework = 'standalone'\nend\n\nfunction Bridge.GetPlayerData()\n    if Bridge.Framework == 'qb' or Bridge.Framework == 'qbox' then\n        return Bridge.QBCore.Functions.GetPlayerData()\n    elseif Bridge.Framework == 'esx' then\n        return Bridge.ESX.GetPlayerData()\n    end\n    return {}\nend\n\nfunction Bridge.Notify(msg, type)\n    if Bridge.Framework == 'qb' or Bridge.Framework == 'qbox' then\n        Bridge.QBCore.Functions.Notify(msg, type)\n    elseif Bridge.Framework == 'esx' then\n        Bridge.ESX.ShowNotification(msg)\n    end\nend\n\n_G.Bridge = Bridge`
        }
    },
    vscript_forensic: {
        title: "Vscript Forensic",
        desc: "Système complet de police scientifique : relevés d'empreintes, analyses ADN et gestion de preuves.",
        dependencies: ["qb-core / Qbox / ESX", "ox_inventory / qb-inventory", "ox_lib"],
        configTemplate: `Config = {}\nConfig.AllowedJobs = { 'police', 'sheriff' }\nConfig.Items = { kit_forensic = 'kit_forensic', ... }`,
        frameworks: { qbcore: { config: "" }, esx: { config: "" } },
        settings: [{ label: "Jobs", value: "Police, Sheriff" }],
        details: { features: ["Mini-jeu de balayage NUI", "Points d'analyse labo", "Rapports persistants"] },
        configExplanations: [{ key: "Config.Items", type: "table", desc: "Mapping des items de preuve." }],
        items: [
            { name: "kit_forensic", label: "Kit de Forensic", weight: 500, description: "Kit complet pour collecter des indices.", unique: false },
            { name: "forensic_report", label: "Rapport ADN/Empreintes", weight: 10, description: "Rapport d'analyse détaillé.", unique: true }
        ],
        bridges: [
            { name: "Bridge Framework (Server)", type: "system", desc: "Gestion des callbacks serveurs et identifiants joueurs." },
            { name: "Bridge Framework (Client)", type: "system", desc: "Gestion des menus, inputs et zones ox_target." },
            { name: "Bridge Dispatch (Customization)", type: "system", desc: "Déclenchement d'alertes policières sur scènes de crime." },
            { name: "Bridge Inventory (Customization)", type: "inventory", desc: "Création de preuves avec métadonnées uniques (Ox, QB, QS)." }
        ],
        bridgeCode: {
            server: `local Bridge = {}\nBridge.Framework = nil\n\n-- Detect Framework\nif GetResourceState('es_extended') == 'started' then\n    Bridge.Framework = 'esx'\n    Bridge.ESX = exports['es_extended']:getSharedObject()\n    print('^2[vscript_forensic] Framework detected: ESX^7')\nelseif GetResourceState('qb-core') == 'started' then\n    Bridge.Framework = 'qb'\n    Bridge.QBCore = exports['qb-core']:GetCoreObject()\n    print('^2[vscript_forensic] Framework detected: QBCore^7')\nelseif GetResourceState('qbx_core') == 'started' then\n    Bridge.Framework = 'qbox'\n    Bridge.QBCore = exports.qbx_core\n    print('^2[vscript_forensic] Framework detected: Qbox^7')\nelse\n    Bridge.Framework = 'standalone'\n    print('^3[vscript_forensic] No supported framework detected, running in Standalone mode^7')\nend\n\nfunction Bridge.GetIdentifier(src)\n    if Bridge.Framework == 'esx' then\n        local xPlayer = Bridge.ESX.GetPlayerFromId(src)\n        return xPlayer and xPlayer.getIdentifier()\n    elseif Bridge.Framework == 'qb' or Bridge.Framework == 'qbox' then\n        local Player = Bridge.QBCore.Functions.GetPlayer(src)\n        return Player and Player.PlayerData and Player.PlayerData.citizenid\n    end\n    return nil\nend\n\nfunction Bridge.RegisterCallback(name, cb)\n    if Bridge.Framework == 'esx' then\n        Bridge.ESX.RegisterServerCallback(name, cb)\n    elseif Bridge.Framework == 'qb' or Bridge.Framework == 'qbox' then\n        Bridge.QBCore.Functions.CreateCallback(name, cb)\n    end\nend\n\n_G.Bridge = Bridge`,
            client: `local Bridge = {}\nBridge.Framework = nil\n\n-- Detect Framework\nCitizen.CreateThread(function()\n    if GetResourceState('es_extended') == 'started' then\n        Bridge.Framework = 'esx'\n        Bridge.ESX = exports['es_extended']:getSharedObject()\n    elseif GetResourceState('qb-core') == 'started' then\n        Bridge.Framework = 'qb'\n        Bridge.QBCore = exports['qb-core']:GetCoreObject()\n    elseif GetResourceState('qbx_core') == 'started' then\n        Bridge.Framework = 'qbox'\n        Bridge.QBCore = exports.qbx_core\n    else\n        Bridge.Framework = 'standalone'\n    end\nend)\n\nfunction Bridge.TriggerCallback(name, cb, ...)\n    if Bridge.Framework == 'esx' then\n        Bridge.ESX.TriggerServerCallback(name, cb, ...)\n    elseif Bridge.Framework == 'qb' or Bridge.Framework == 'qbox' then\n        Bridge.QBCore.Functions.TriggerCallback(name, cb, ...)\n    end\nend\n\n_G.Bridge = Bridge`,
            dispatch: `if not IsDuplicityVersion() then return end\n\nfunction Bridge.SendDispatchAlert(source, coords, streetName)\n    local system = Config.Dispatch.system\n    local dispatch = Config.Dispatch\n\n    if not dispatch.enabled then return end\n\n    local alertMessage = dispatch.message .. ' — Rue: ' .. (streetName or 'Inconnue')\n\n    if system == 'ps-dispatch' then\n        local dispatchData = {\n            message = alertMessage,\n            codeName = 'forensic_scene',\n            code = dispatch.code,\n            icon = 'fas fa-search',\n            priority = 1,\n            coords = coords,\n            street = streetName,\n            jobs = { dispatch.job }\n        }\n        TriggerEvent('ps-dispatch:server:notify', dispatchData)\n    elseif system == 'vscript_dispatch' then\n        exports['vscript_dispatch']:SendDispatch('forensic', coords, alertMessage, -1, {\n            code = dispatch.code,\n        })\n    end\nend`,
            inventory: `if not IsDuplicityVersion() then return end\n\nBridge.Inventory = nil\n\nfunction Bridge.AddItem(source, itemName, count, metadata)\n    count = count or 1\n    if Bridge.Inventory == 'ox' then\n        return exports.ox_inventory:AddItem(source, itemName, count, metadata)\n    elseif Bridge.Inventory == 'qb' or Bridge.Inventory == 'qbox' then\n        local Player = Bridge.GetPlayer(source)\n        if Player then\n            return Player.Functions.AddItem(itemName, count, nil, metadata)\n        end\n    elseif Bridge.Inventory == 'esx' then\n        local xPlayer = Bridge.ESX.GetPlayerFromId(source)\n        xPlayer.addInventoryItem(itemName, count)\n        return true\n    end\n    return false\nend`
        }
    },
    vscript_infiltration: {
        title: "Vscript Infiltration",
        desc: "Missions d'infiltration tactique avec objectifs de piratage et zones sécurisées.",
        dependencies: ["qb-core / Qbox / ESX", "vscript_dispatch", "ox_lib"],
        configTemplate: `Config = {}\nConfig.MinimumPolice = 2\nConfig.Hacking = { duration = 30000 }`,
        frameworks: { qbcore: { config: "" }, esx: { config: "" } },
        settings: [{ label: "Justice", value: "2 flics minimum" }],
        details: { features: ["Zones de hack circulaires", "Intégration dispatch native", "Cooldown global"] },
        configExplanations: [{ key: "Config.MinimumPolice", type: "number", desc: "Effectifs requis." }],
        bridges: [
            { name: "Bridge Framework (Server)", type: "system", desc: "Détection du core et calcul DutyCount pour le braquage." },
            { name: "Bridge Inventory (Customization)", type: "inventory", desc: "Gestion des objets de hack avec Ox et QB Inventory." },
            { name: "Bridge Dispatch (Customization)", type: "system", desc: "Alerte silencieuse PS-Dispatch ou Vscript Dispatch." }
        ],
        bridgeCode: {
            framework: `local Bridge = {}\nBridge.Framework = nil\n\n-- Detect Framework\nif GetResourceState('es_extended') == 'started' then\n    Bridge.Framework = 'esx'\n    Bridge.ESX = exports['es_extended']:getSharedObject()\n    print('^2[vscript_infiltration] Framework detected: ESX^7')\nelseif GetResourceState('qb-core') == 'started' then\n    Bridge.Framework = 'qb'\n    Bridge.QBCore = exports['qb-core']:GetCoreObject()\n    print('^2[vscript_infiltration] Framework detected: QBCore^7')\nelseif GetResourceState('qbx_core') == 'started' then\n    Bridge.Framework = 'qbox'\n    print('^2[vscript_infiltration] Framework detected: Qbox^7')\nelse\n    Bridge.Framework = 'standalone'\n    print('^3[vscript_infiltration] No supported framework detected, running in Standalone mode^7')\nend\n\nfunction Bridge.GetDutyCount(jobs)\n    local count = 0\n    if type(jobs) == 'string' then jobs = { jobs } end\n\n    if Bridge.Framework == 'qb' or Bridge.Framework == 'qbox' then\n        if Bridge.QBCore and Bridge.QBCore.Functions.GetDutyCount then\n            for _, job in ipairs(jobs) do\n                count = count + Bridge.QBCore.Functions.GetDutyCount(job)\n            end\n        else\n            local players = exports.qbx_core:GetPlayerIds()\n            for _, src in pairs(players) do\n                local Player = exports.qbx_core:GetPlayer(src)\n                if Player and Player.PlayerData.job.onduty then\n                    for _, job in ipairs(jobs) do\n                        if Player.PlayerData.job.name == job then\n                            count = count + 1\n                            break\n                        end\n                    end\n                end\n            end\n        end\n    elseif Bridge.Framework == 'esx' then\n        local xPlayers = Bridge.ESX.GetPlayers()\n        for i = 1, #xPlayers, 1 do\n            local xPlayer = Bridge.ESX.GetPlayerFromId(xPlayers[i])\n            if xPlayer then\n                for _, job in ipairs(jobs) do\n                    if xPlayer.job.name == job then\n                        count = count + 1\n                        break\n                    end\n                end\n            end\n        end\n    end\n    return count\nend\n\n_G.Bridge = Bridge`,
            inventory: `if not IsDuplicityVersion() then return end\n\nfunction AddItem(source, item, count)\n    if Bridge.Framework == 'qbox' then\n        return exports.ox_inventory:AddItem(source, item, count)\n    elseif Bridge.Framework == 'qb' then\n        local Player = Bridge.QBCore.Functions.GetPlayer(source)\n        return Player.Functions.AddItem(item, count)\n    end\nend\n\nfunction RemoveItem(source, item, count)\n    if Bridge.Framework == 'qbox' then\n        return exports.ox_inventory:RemoveItem(source, item, count)\n    elseif Bridge.Framework == 'qb' then\n        local Player = Bridge.QBCore.Functions.GetPlayer(source)\n        return Player.Functions.RemoveItem(item, count)\n    end\nend`,
            dispatch: `if not IsDuplicityVersion() then return end\n\nfunction TriggerDispatch(coords, message)\n    if not Config.Dispatch.enabled then return end\n    if Config.Dispatch.system == 'ps-dispatch' then\n        exports['ps-dispatch']:SuspiciousActivity(coords, message)\n    elseif Config.Dispatch.system == 'vscript_dispatch' then\n        exports['vscript_dispatch']:SendDispatch('infiltration', coords, message, -1)\n    end\nend`
        }
    },
    vscript_items: {
        title: "Vscript Items",
        desc: "Pack d'items utilisables avec animations et effets variés (nourriture, outils, drogues).",
        dependencies: ["qb-core / Qbox / ESX", "ox_inventory / qb-inventory"],
        configTemplate: `Config = {}\nConfig.Framework = '{{FW}}'\nConfig.Items = {\n    ['sandwich'] = { animation = 'eat', status = { hunger = 20 } },\n    ['water'] = { animation = 'drink', status = { thirst = 20 } }\n}`,
        frameworks: { qbcore: { config: "" }, esx: { config: "" } },
        settings: [{ label: "Items", value: "Complètement configurable" }],
        details: { features: ["Animations synchronisées", "Consommation progressive", "Effets visuels (drogues)"] },
        configExplanations: [{ key: "Config.Items", type: "table", desc: "Liste des items et leurs effets." }],
        bridges: [
            { name: "Bridge Framework (Server)", type: "system", desc: "Intégration multi-inventaires et logs des mouvements d'items." }
        ],
        bridgeCode: {
            server: `local function IsPlayerAllowed(src)\n    if not Config or not Config.AllowedIds then return false end\n    local identifiers = GetPlayerIdentifiers(src)\n    for _, allowedId in ipairs(Config.AllowedIds) do\n        for _, playerId in ipairs(identifiers) do\n            if string.lower(playerId) == string.lower(allowedId) then\n                return true\n            end\n        end\n    end\n    return false\nend\n\nQBCore.Functions.CreateCallback('fg-staffmenu:server:getPlayerInventory', function(source, cb, targetId)\n    if not IsPlayerAllowed(source) then return cb(nil) end\n    if not targetId then return cb(nil) end\n\n    local Target = QBCore.Functions.GetPlayer(targetId)\n    if not Target then return cb(nil) end\n\n    local items = {}\n\n    if Config.InventoryType == 'ox' and GetResourceState('ox_inventory') == 'started' then\n        local oxItems = exports['ox_inventory']:GetInventoryItems(targetId)\n        for _, item in pairs(oxItems) do\n            if item then\n                table.insert(items, {\n                    name = item.name,\n                    label = item.label,\n                    amount = item.count or item.amount,\n                    image = item.name .. ".png"\n                })\n            end\n        end\n    elseif Config.InventoryType == 'qs' and GetResourceState('qs-inventory') == 'started' then\n        items = exports['qs-inventory']:GetUserInventory(targetId)\n    else\n        items = Target.PlayerData.items\n    end\n\n    cb(items)\nend)`
        }
    },
    vscript_joint: {
        title: "Vscript Joint",
        desc: "Système de consommation de cannabis avec effets de caméra et animations réalistes.",
        dependencies: ["qb-core / Qbox / ESX", "ox_lib"],
        configTemplate: `Config = {}\nConfig.JointItem = 'joint'\nConfig.Duration = 10000\nConfig.VisualEffect = 'DrugsMichaelAliens-01'`,
        frameworks: { qbcore: { config: "" }, esx: { config: "" } },
        settings: [{ label: "Durée", value: "10 secondes (Config.Duration = 10000)" }],
        details: { features: ["Effets de particules (fumée)", "Screen shaders (hallucinations)", "Animation de tenue du joint"] },
        configExplanations: [{ key: "Config.JointItem", type: "string", desc: "Nom de l'item joint." }],
        bridges: [
            { name: "Bridge Interaction (Server)", type: "system", desc: "Logic de fin d'animation et notifications." }
        ],
        bridgeCode: {
            server: `RegisterNetEvent('vscript_joint:finish', function(data)\n    local src = source\n    -- Logic to give joint item\n    -- If using Qbox/ox_inventory:\n    -- exports.ox_inventory:AddItem(src, 'joint', 1)\n    \n    print(string.format("Player %s finished rolling a joint with %s filter. Tobacco: %s", src, data.filter, tostring(data.tobacco)))\n    \n    TriggerClientEvent('ox_lib:notify', src, {\n        title = 'Rolling Complete',\n        description = 'You successfully rolled a joint!',\n        type = 'success'\n    })\nend)`
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('content');
    const navItems = document.querySelectorAll('.nav-item');
    const fwSelector = document.getElementById('fw-selector');
    const invSelector = document.getElementById('inv-selector');
    const dispatchSelector = document.getElementById('dispatch-selector');
    const searchInput = document.getElementById('doc-search');

    let currentDoc = 'welcome';

    const updateView = () => renderContent(currentDoc);

    fwSelector.addEventListener('change', updateView);
    invSelector.addEventListener('change', updateView);
    dispatchSelector.addEventListener('change', updateView);

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            currentDoc = item.dataset.id;
            renderContent(currentDoc);
        });
    });

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        // Optionnel : filtrage sidebar
    });

    function extractConfigLine(template, key) {
        if (!template) return "-- Code non trouvé";
        const lines = template.split('\n');
        // On cherche une ligne qui contient la clé (souvent au début après espaces ou points)
        const line = lines.find(l => l.includes(key));
        return line ? line.trim() : `-- ${key} non trouvée dans le template`;
    }

    function generateFullConfig(template) {
        if (!template) return "";
        let fw = fwSelector.value === 'qbcore' ? 'qb-core' : 'esx';

        // Special mapping for QBCore/Qbox in specific scripts
        if (currentDoc === 'vscript_doc' || currentDoc === 'vscript_tableau') {
            fw = fwSelector.value === 'qbcore' ? 'Qbox' : 'ESX';
        }

        let res = template
            .replace(/{{FW}}/g, fw)
            .replace(/{{INV}}/g, invSelector.value)
            .replace(/{{DISPATCH}}/g, dispatchSelector.value)
            .replace(/{{CORENAME}}/g, fwSelector.value === 'qbcore' ? 'qbx_core' : 'es_extended');

        return res;
    }

    function formatItemConfig(item, format) {
        if (format === 'ox') {
            return `['${item.name}'] = {
    label = '${item.label}',
    weight = ${item.weight},
    stack = ${item.unique ? 'false' : 'true'},
    close = true,
    description = '${item.description}'
},`;
        } else if (format === 'qb') {
            return `['${item.name}'] = {
    ['name'] = '${item.name}',
    ['label'] = '${item.label}',
    ['weight'] = ${item.weight},
    ['type'] = 'item',
    ['image'] = '${item.name}.png',
    ['unique'] = ${item.unique ? 'true' : 'false'},
    ['useable'] = true,
    ['shouldClose'] = true,
    ['combinable'] = nil,
    ['description'] = '${item.description}'
},`;
        } else if (format === 'esx') {
            return `INSERT INTO \`items\` (\`name\`, \`label\`, \`weight\`, \`rare\`, \`can_remove\`) VALUES
('${item.name}', '${item.label}', ${item.weight}, 0, 1);`;
        }
        return '';
    }

    function renderContent(id) {
        if (id === 'welcome') {
            contentArea.innerHTML = `
                <div class="doc-header">
                    <h1>Bienvenue sur Vscripts Support</h1>
                    <p>Votre guide complet pour l'installation, la configuration et le support des scripts de la collection Vscripts.</p>
                </div>
                <div class="doc-section anim-fade-in">
                    <h2><i class="fas fa-rocket"></i> Démarrage Rapide</h2>
                    <p>Sélectionnez un script dans la barre latérale. Utilisez les sélecteurs en haut à droite pour adapter instantanément le code <code>config.lua</code> à votre serveur.</p>
                </div>
            `;
            return;
        }

        if (id === 'setup') {
            contentArea.innerHTML = `
                <div class="doc-header">
                    <h1>Installation Générale</h1>
                    <p>Procédure standard pour l'installation des ressources.</p>
                </div>
                <div class="doc-section anim-fade-in">
                    <ul class="step-list">
                        <li class="step-item">
                            <div class="step-number">1</div>
                            <div class="step-content">
                                <h4>Téléchargement</h4>
                                <p>Extrayez le script dans <code>resources/[vscripts]</code>.</p>
                            </div>
                        </li>
                        <li class="step-item">
                            <div class="step-number">2</div>
                            <div class="step-content">
                                <h4>Configuration</h4>
                                <p>Adaptez le <code>config.lua</code> (généré dynamiquement sur ce site).</p>
                            </div>
                        </li>
                        <li class="step-item">
                            <div class="step-number">3</div>
                            <div class="step-content">
                                <h4>Démarrage</h4>
                                <p>Ajoutez <code>ensure script_name</code> dans votre <code>server.cfg</code>.</p>
                            </div>
                        </li>
                    </ul>
                </div>
            `;
            return;
        }

        if (id === 'interact-sound') {
            contentArea.innerHTML = `
                <div class="doc-header">
                    <h1>Configuration InteractSound</h1>
                    <p>Ajouter des sons personnalisés pour Go-Fast et CarJack.</p>
                </div>
                <div class="doc-section anim-fade-in">
                    <div class="config-card-body">
                        <p style="margin-bottom: 20px;">Certains scripts (CarJack, Go-Fast) utilisent <code>InteractSound</code> pour des alertes audio. Voici comment les intégrer :</p>
                        <ul class="step-list">
                            <li class="step-item">
                                <div class="step-number">1</div>
                                <div class="step-content"><h4>Copier les fichiers .ogg dans InteractSound/client/html/sounds</h4></div>
                            </li>
                            <li class="step-item">
                                <div class="step-number">2</div>
                                <div class="step-content"><h4>Ajouter les chemins dans le fxmanifest.lua de InteractSound</h4></div>
                            </li>
                        </ul>
                    </div>
                </div>
            `;
            return;
        }

        const data = CONFIG_DATA[id];
        if (!data) return;

        const fullConfig = generateFullConfig(data.configTemplate);
        let detailsHtml = '';

        if (data.details) {
            if (data.details.features) {
                detailsHtml += `
                    <div class="doc-section">
                        <h2><i class="fas fa-star"></i> Fonctionnalités</h2>
                        <ul class="feature-list">
                            ${data.details.features.map(f => `<li><i class="fas fa-check-circle"></i> ${f}</li>`).join('')}
                        </ul>
                    </div>`;
            }
            if (data.details.commands) {
                detailsHtml += `
                    <div class="doc-section">
                        <h2><i class="fas fa-terminal"></i> Commandes</h2>
                        <div class="config-card-body">
                            ${data.details.commands.map(c => `
                                <div class="config-item">
                                    <span class="config-label">${c.name}</span>
                                    <p class="config-desc">${c.desc}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
            if (data.details.phases) {
                detailsHtml += `
                    <div class="doc-section">
                        <h2><i class="fas fa-project-diagram"></i> Déroulement</h2>
                        <ul class="step-list">
                            ${data.details.phases.map((p, i) => `
                                <li class="step-item">
                                    <div class="step-number">${i + 1}</div>
                                    <div class="step-content"><h4>${p}</h4></div>
                                </li>`).join('')}
                        </ul>
                    </div>`;
            }
            if (data.details.mechanics || data.details.system) {
                const list = data.details.mechanics || data.details.system;
                detailsHtml += `
                    <div class="doc-section">
                        <h2><i class="fas fa-microchip"></i> Mécaniques Avancées</h2>
                        <ul class="feature-list">
                            ${list.map(m => `<li><i class="fas fa-cog"></i> ${m}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }
            if (data.details.moodList) {
                detailsHtml += `
                    <div class="doc-section">
                        <h2><i class="fas fa-masks-theater"></i> Humeurs</h2>
                        <div class="mood-grid">
                            ${data.details.moodList.map(m => `
                                <div class="mood-card">
                                    <i class="fas fa-${m.icon}"></i>
                                    <span>${m.label}</span>
                                </div>`).join('')}
                        </div>
                    </div>`;
            }
            if (data.details.types) {
                detailsHtml += `
                    <div class="doc-section">
                        <h2><i class="fas fa-map-signs"></i> Types de Marqueurs</h2>
                        <div class="type-grid">
                            ${data.details.types.map(t => `<div class="type-badge">${t}</div>`).join('')}
                        </div>
                    </div>
                `;
            }
            if (data.details.controls) {
                detailsHtml += `
                    <div class="doc-section">
                        <h2><i class="fas fa-gamepad"></i> Contrôles</h2>
                        <ul class="feature-list">
                            ${data.details.controls.map(c => `<li><i class="fas fa-keyboard"></i> ${c}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }
            if (data.details.sounds) {
                detailsHtml += `
                    <div class="doc-section">
                        <h2><i class="fas fa-volume-up"></i> Sons InteractSound</h2>
                        <div class="type-grid">
                            ${data.details.sounds.map(s => `<div class="type-badge">${s}</div>`).join('')}
                        </div>
                    </div>
                `;
            }
        }

        let itemsHtml = '';
        if (data.items) {
            const format = invSelector.value === 'ox' ? 'ox' : (fwSelector.value === 'qbcore' ? 'qb' : 'esx');
            const formatTitle = format === 'ox' ? 'ox_inventory' : (format === 'qb' ? 'qb-core' : 'ESX (SQL)');

            itemsHtml = `
                <div class="doc-section">
                    <h2><i class="fas fa-boxes"></i> Configuration des Items (${formatTitle})</h2>
                    <div class="config-card-body">
                        <p style="margin-bottom: 15px; font-size: 13px; color: var(--text-secondary);">
                            Copiez ces items dans votre fichier de configuration d'inventaire ou exécutez le SQL.
                        </p>
                        ${data.items.map(item => `
                            <div class="item-config-block">
                                <div class="item-info">
                                    <strong>${item.label}</strong> <code>${item.name}</code>
                                    <button class="btn-copy-small" onclick="copyItem('${item.name}', '${format}')" title="Copier le code">
                                        <i class="fas fa-copy"></i>
                                    </button>
                                </div>
                                <pre><code id="item-code-${item.name}">${formatItemConfig(item, format)}</code></pre>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        let configDetailsHtml = '';
        if (data.configExplanations) {
            configDetailsHtml = `
                <div class="doc-section anim-fade-in">
                    <h2><i class="fas fa-list-check"></i> Détail du Config.lua</h2>
                    <div class="config-details-vertical">
                        ${data.configExplanations.map((exp, idx) => {
                const configLine = extractConfigLine(data.configTemplate, exp.key);
                const uniqueId = `exp-${id}-${idx}`;
                return `
                                <div class="config-card collapsed" id="${uniqueId}">
                                    <div class="config-card-header" onclick="toggleConfigDetail('${uniqueId}')">
                                        <h3><code style="color: var(--accent-primary); font-size: 13px;">${exp.key}</code></h3>
                                        <div class="header-actions">
                                            <span class="type-badge type-${exp.type}">${exp.type}</span>
                                            <button class="btn-copy" onclick="copyText('${exp.key}', event)" title="Copier la clé">
                                                <i class="fas fa-copy"></i>
                                            </button>
                                            <i class="fas fa-chevron-down"></i>
                                        </div>
                                    </div>
                                    <div class="config-card-body">
                                        <p class="config-desc" style="margin-bottom: 12px; font-size: 14px;">${exp.desc}</p>
                                        <div class="config-code-snippet">
                                            <div class="bridge-code-header" style="opacity: 0.6; margin-bottom: 5px;">Exemple de valeur :</div>
                                            <pre style="background: rgba(0,0,0,0.2) !important;"><code>${configLine}</code></pre>
                                        </div>
                                    </div>
                                </div>
                            `;
            }).join('')}
                    </div>
                </div>
            `;
        }

        let bridgesHtml = '';
        if (data.bridges) {
            const codes = data.bridgeCode || {};
            const codeArray = typeof codes === 'string' ? [{ key: 'server', code: codes }] : Object.keys(codes).map(k => ({ key: k, code: codes[k] }));

            bridgesHtml = `
                <div class="doc-section anim-fade-in">
                    <h2><i class="fas fa-network-wired"></i> Ponts & Compatibilité</h2>
                    <p style="margin-bottom: 24px; font-size: 14px; color: var(--text-secondary); opacity: 0.8;">
                        <i class="fas fa-info-circle"></i> Chaque pont est une implémentation technique. Cliquez pour voir le code source.
                    </p>
                    <div class="config-details-vertical">
                        ${data.bridges.map((b, idx) => {
                const relatedCode = codeArray[idx] || codeArray[0] || { key: 'bridge', code: '-- Code non disponible' };
                const bridgeId = `bridge-${id}-${idx}`;
                return `
                                <div class="config-card collapsed" id="${bridgeId}">
                                    <div class="config-card-header" onclick="toggleConfigDetail('${bridgeId}')">
                                        <h3><i class="fas fa-code-branch" style="color: var(--accent-primary); font-size: 14px;"></i> ${b.name}</h3>
                                        <div class="header-actions">
                                            <span class="type-badge type-${b.type}">${b.type}</span>
                                            <i class="fas fa-chevron-down bridge-chevron"></i>
                                        </div>
                                    </div>
                                    <div class="config-card-body">
                                        <p class="config-desc" style="margin-bottom: 12px; font-size: 14px;">${b.desc}</p>
                                        <div class="bridge-code-reveal">
                                            <div class="bridge-code-header">
                                                <i class="fas fa-file-code"></i> bridge/${relatedCode.key}.lua
                                            </div>
                                            <pre style="background: rgba(0,0,0,0.2) !important;"><code>${relatedCode.code}</code></pre>
                                        </div>
                                    </div>
                                </div>
                            `;
            }).join('')}
                    </div>
                </div>
            `;
        }

        contentArea.innerHTML = `
            <div class="doc-header">
                <div class="badges">
                    ${data.dependencies.map(dep => `<span class="badge badge-blue">${dep}</span>`).join('')}
                </div>
                <h1 style="margin-top: 15px;">${data.title}</h1>
                <p>${data.desc}</p>
            </div>

            <div class="doc-section anim-fade-in">
                <h2><i class="fas fa-file-code"></i> Configuration complète</h2>
                <div class="config-card collapsed" id="config-card">
                    <div class="config-card-header" onclick="toggleConfig(event)">
                        <h3><i class="fas fa-terminal"></i> config.lua</h3>
                        <div class="header-actions">
                            <button class="btn-copy" onclick="copyConfig(event)" title="Copier le code">
                                <i class="fas fa-copy"></i>
                            </button>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                    </div>
                    <div class="config-card-body">
                        <pre><code id="config-code">${fullConfig}</code></pre>
                    </div>
                </div>
            </div>

            <div class="doc-section">
                <h2><i class="fas fa-sliders-h"></i> Paramètres Importants</h2>
                <div class="config-card-body">
                    ${data.settings.map(s => `
                        <div class="config-item">
                            <span class="config-label">${s.label}</span>
                            <span class="config-value">${s.value}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            ${itemsHtml}

            ${configDetailsHtml}

            ${bridgesHtml}

            ${detailsHtml}

            ${data.frameworks[fwSelector.value] && data.frameworks[fwSelector.value].export ? `
            <div class="doc-section">
                <h2><i class="fas fa-code"></i> Exports</h2>
                <pre><code>${data.frameworks[fwSelector.value].export}</code></pre>
            </div>` : ''
            }
            `;
    }

    // Global listeners and window functions
    window.toggleConfig = (e) => {
        // Don't toggle if we clicked a button in the header
        if (e.target.closest('.btn-copy')) return;

        const card = document.getElementById('config-card');
        card.classList.toggle('collapsed');
    };

    window.copyConfig = (e) => {
        e.stopPropagation();
        const code = document.getElementById('config-code').innerText;
        navigator.clipboard.writeText(code).then(() => {
            const btn = e.target.closest('.btn-copy');
            const icon = btn.querySelector('i');
            icon.classList.replace('fa-copy', 'fa-check');
            btn.style.color = '#4ade80';
            setTimeout(() => {
                icon.classList.replace('fa-check', 'fa-copy');
                btn.style.color = '';
            }, 2000);
        });
    };

    window.copyItem = (name, format) => {
        const code = document.getElementById(`item-code-${name}`).innerText;
        navigator.clipboard.writeText(code).then(() => {
            const btn = document.querySelector(`button[onclick="copyItem('${name}', '${format}')"]`);
            const icon = btn.querySelector('i');
            icon.classList.replace('fa-copy', 'fa-check');
            btn.style.color = '#4ade80';
            setTimeout(() => {
                icon.classList.replace('fa-check', 'fa-copy');
                btn.style.color = '';
            }, 2000);
        });
    };

    window.toggleConfigDetail = (id) => {
        const card = document.getElementById(id);
        if (card) card.classList.toggle('collapsed');
    };

    window.copyText = (text, e) => {
        if (e) e.stopPropagation();
        navigator.clipboard.writeText(text).then(() => {
            const btn = e.target.closest('.btn-copy');
            if (!btn) return;
            const icon = btn.querySelector('i');
            icon.classList.replace('fa-copy', 'fa-check');
            btn.style.color = '#4ade80';
            setTimeout(() => {
                icon.classList.replace('fa-check', 'fa-copy');
                btn.style.color = '';
            }, 2000);
        });
    };

    window.toggleBridgeCard = (card) => {
        const reveal = card.querySelector('.bridge-code-reveal');
        const chevron = card.querySelector('.bridge-chevron');

        if (!reveal) return;

        const isCollapsed = reveal.classList.toggle('collapsed');
        if (chevron) {
            chevron.style.transform = isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)';
        }
    };

    renderContent('welcome');
});
