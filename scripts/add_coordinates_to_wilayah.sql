-- Migration: Add latitude and longitude to table `wilayah` in db_adatnusa
-- File: scripts/add_coordinates_to_wilayah.sql

USE `db_adatnusa`;

-- 1. Add latitude and longitude columns if they don't already exist
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'wilayah'
      AND COLUMN_NAME = 'latitude'
);

SET @stmt = IF(@col_exists = 0,
    'ALTER TABLE `wilayah` ADD COLUMN `latitude` DECIMAL(10, 8) NULL DEFAULT NULL AFTER `deskripsi`, ADD COLUMN `longitude` DECIMAL(11, 8) NULL DEFAULT NULL AFTER `latitude`',
    'SELECT "Columns latitude and longitude already exist" AS notice'
);

PREPARE add_cols FROM @stmt;
EXECUTE add_cols;
DEALLOCATE PREPARE add_cols;

-- 2. Populate Bali Province
UPDATE `wilayah`
SET `latitude` = -8.40951800, `longitude` = 115.18891600
WHERE `id_wilayah` = 17 AND `nama_wilayah` = 'Bali';

-- 3. Populate Bali Regency / City Coordinates (All 9 Wilayah in Bali)
-- Kabupaten Bangli (-8.4543, 115.3549)
UPDATE `wilayah`
SET `latitude` = -8.45430000, `longitude` = 115.35490000
WHERE `id_wilayah` = 317 OR (`parent_id` = 17 AND `nama_wilayah` = 'Kabupaten Bangli');

-- Kabupaten Tabanan (-8.5411, 115.1252)
UPDATE `wilayah`
SET `latitude` = -8.54110000, `longitude` = 115.12520000
WHERE `id_wilayah` = 313 OR (`parent_id` = 17 AND `nama_wilayah` = 'Kabupaten Tabanan');

-- Kabupaten Buleleng (-8.1120, 115.0882)
UPDATE `wilayah`
SET `latitude` = -8.11200000, `longitude` = 115.08820000
WHERE `id_wilayah` = 319 OR (`parent_id` = 17 AND `nama_wilayah` = 'Kabupaten Buleleng');

-- Kabupaten Karangasem (-8.4475, 115.6141)
UPDATE `wilayah`
SET `latitude` = -8.44750000, `longitude` = 115.61410000
WHERE `id_wilayah` = 318 OR (`parent_id` = 17 AND `nama_wilayah` = 'Kabupaten Karangasem');

-- Kabupaten Badung (-8.5819, 115.1771)
UPDATE `wilayah`
SET `latitude` = -8.58190000, `longitude` = 115.17710000
WHERE `id_wilayah` = 314 OR (`parent_id` = 17 AND `nama_wilayah` = 'Kabupaten Badung');

-- Kabupaten Gianyar (-8.5445, 115.3256)
UPDATE `wilayah`
SET `latitude` = -8.54450000, `longitude` = 115.32560000
WHERE `id_wilayah` = 315 OR (`parent_id` = 17 AND `nama_wilayah` = 'Kabupaten Gianyar');

-- Kota Denpasar (-8.6705, 115.2126)
UPDATE `wilayah`
SET `latitude` = -8.67050000, `longitude` = 115.21260000
WHERE `id_wilayah` = 320 OR (`parent_id` = 17 AND `nama_wilayah` = 'Kota Denpasar');

-- Kabupaten Jembrana (-8.3585, 114.6444)
UPDATE `wilayah`
SET `latitude` = -8.35850000, `longitude` = 114.64440000
WHERE `id_wilayah` = 312 OR (`parent_id` = 17 AND `nama_wilayah` = 'Kabupaten Jembrana');

-- Kabupaten Klungkung (-8.5366, 115.4050)
UPDATE `wilayah`
SET `latitude` = -8.53660000, `longitude` = 115.40500000
WHERE `id_wilayah` = 316 OR (`parent_id` = 17 AND `nama_wilayah` = 'Kabupaten Klungkung');
