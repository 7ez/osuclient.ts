enum PacketID {
  OSU_CHANGE_ACTION = 0,
  OSU_SEND_PUBLIC_MESSAGE = 1,
  OSU_LOGOUT = 2,
  OSU_REQUEST_STATUS_UPDATE = 3,
  OSU_HEARTBEAT = 4,
  SRV_LOGIN_REPLY = 5,
  SRV_SEND_MESSAGE = 7,
  SRV_HEARTBEAT = 8,
  SRV_USER_STATS = 11,
  SRV_USER_LOGOUT = 12,
  SRV_SPECTATOR_JOINED = 13,
  SRV_SPECTATOR_LEFT = 14,
  SRV_SPECTATE_FRAMES = 15,
  OSU_START_SPECTATING = 16,
  OSU_STOP_SPECTATING = 17,
  OSU_SPECTATE_FRAMES = 18,
  SRV_VERSION_UPDATE = 19,
  OSU_ERROR_REPORT = 20,
  OSU_CANT_SPECTATE = 21,
  SRV_SPECTATOR_CANT_SPECTATE = 22,
  SRV_GET_ATTENTION = 23,
  SRV_NOTIFICATION = 24,
  OSU_SEND_PRIVATE_MESSAGE = 25,
  SRV_UPDATE_MATCH = 26,
  SRV_NEW_MATCH = 27,
  SRV_DISPOSE_MATCH = 28,
  OSU_PART_LOBBY = 29,
  OSU_JOIN_LOBBY = 30,
  OSU_CREATE_MATCH = 31,
  OSU_JOIN_MATCH = 32,
  OSU_PART_MATCH = 33,
  SRV_TOGGLE_BLOCK_NON_FRIEND_DMS = 34,
  SRV_MATCH_JOIN_SUCCESS = 36,
  SRV_MATCH_JOIN_FAIL = 37,
  OSU_MATCH_CHANGE_SLOT = 38,
  OSU_MATCH_READY = 39,
  OSU_MATCH_LOCK = 40,
  OSU_MATCH_CHANGE_SETTINGS = 41,
  SRV_FELLOW_SPECTATOR_JOINED = 42,
  SRV_FELLOW_SPECTATOR_LEFT = 43,
  OSU_MATCH_START = 44,
  SRV_ALL_PLAYERS_LOADED = 45,
  SRV_MATCH_START = 46,
  OSU_MATCH_SCORE_UPDATE = 47,
  SRV_MATCH_SCORE_UPDATE = 48,
  OSU_MATCH_COMPLETE = 49,
  SRV_MATCH_TRANSFER_HOST = 50,
  OSU_MATCH_CHANGE_MODS = 51,
  OSU_MATCH_LOAD_COMPLETE = 52,
  SRV_MATCH_ALL_PLAYERS_LOADED = 53,
  OSU_MATCH_NO_BEATMAP = 54,
  OSU_MATCH_UNREADY = 55,
  OSU_MATCH_FAILED = 56,
  SRV_MATCH_PLAYER_FAILED = 57,
  SRV_MATCH_COMPLETE = 58,
  OSU_MATCH_HAS_BEATMAP = 59,
  OSU_MATCH_SKIP_REQUEST = 60,
  SRV_MATCH_SKIP = 61,
  OSU_CHANNEL_JOIN = 63,
  SRV_CHANNEL_JOIN_SUCCESS = 64,
  SRV_CHANNEL_INFO = 65,
  SRV_CHANNEL_KICK = 66,
  SRV_CHANNEL_AUTO_JOIN = 67,
  OSU_BEATMAP_INFO_REQUEST = 68,
  SRV_BEATMAP_INFO_REPLY = 69,
  OSU_MATCH_TRANSFER_HOST = 70,
  SRV_PRIVILEGES = 71,
  SRV_FRIENDS_LIST = 72,
  OSU_FRIEND_ADD = 73,
  OSU_FRIEND_REMOVE = 74,
  SRV_PROTOCOL_VERSION = 75,
  SRV_MAIN_MENU_ICON = 76,
  OSU_MATCH_CHANGE_TEAM = 77,
  OSU_CHANNEL_PART = 78,
  OSU_RECEIVE_UPDATES = 79,
  SRV_MATCH_PLAYER_SKIPPED = 81,
  OSU_SET_AWAY_MESSAGE = 82,
  SRV_USER_PRESENCE = 83,
  OSU_USER_STATS_REQUEST = 85,
  SRV_RESTART = 86,
  OSU_MATCH_INVITE = 87,
  SRV_MATCH_INVITE = 88,
  SRV_CHANNEL_INFO_END = 89,
  OSU_MATCH_CHANGE_PASSWORD = 90,
  SRV_MATCH_CHANGE_PASSWORD = 91,
  SRV_SILENCE_END = 92,
  OSU_TOURNAMENT_MATCH_INFO_REQUEST = 93,
  SRV_USER_SILENCED = 94,
  SRV_USER_PRESENCE_SINGLE = 95,
  SRV_USER_PRESENCE_BUNDLE = 96,
  OSU_USER_PRESENCE_REQUEST = 97,
  OSU_USER_PRESENCE_REQUEST_ALL = 98,
  OSU_TOGGLE_BLOCK_NON_FRIEND_DMS = 99,
  SRV_USER_DM_BLOCKED = 100,
  SRV_TARGET_IS_SILENCED = 101,
  SRV_VERSION_UPDATE_FORCED = 102,
  SRV_SWITCH_SERVER = 103,
  SRV_ACCOUNT_RESTRICTED = 104,
  SRV_MATCH_ABORT = 106,
  SRV_SWITCH_TOURNAMENT_SERVER = 107,
  OSU_TOURNAMENT_JOIN_MATCH_CHANNEL = 108,
  OSU_TOURNAMENT_LEAVE_MATCH_CHANNEL = 109,
}

export { PacketID }
