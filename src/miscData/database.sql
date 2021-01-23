CREATE TABLE `stream_chat` (
  `unid` char(128) NOT NULL ,
  `twitch_username` char(24),
  `twitch_oauth` char(36),
  `tts_mode` int NOT NULL DEFAULT 0,
  `tts_voice` tinytext,
  `tts_filters_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `tts_filters` longtext,
  `aws_region` tinytext,
  `aws_identity_pool` tinytext,
  `stt_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `stt_listeners` longtext,
  `alteredDate` datetime NOT NULL DEFAULT current_timestamp(),
  FOREIGN KEY (unid) REFERENCES users(unid)
)