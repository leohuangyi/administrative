CREATE TABLE IF NOT EXISTS `administrative` (
  `id` CHAR(16) NOT NULL,
  `name` VARCHAR(32) NULL,
  `fullname` VARCHAR(32) NULL,
  `pinyin` VARCHAR(64) NULL,
  `rank` TINYINT(1) NULL,
  `parent` CHAR(16) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC))
ENGINE = MyISAM ;