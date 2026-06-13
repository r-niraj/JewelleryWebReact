CREATE TABLE IF NOT EXISTS `admins` (
  `admin_id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `role` VARCHAR(20) DEFAULT 'admin',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`admin_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `customers` (
  `customer_id` INT NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(15) NOT NULL,
  `email` VARCHAR(100),
  `address` TEXT,
  `city` VARCHAR(50),
  `state` VARCHAR(50),
  `pincode` VARCHAR(10),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`customer_id`),
  INDEX (`phone`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `products` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(200) NOT NULL UNIQUE,
  `short_description` TEXT,
  `full_description` TEXT,
  `price` DECIMAL(10,2) NOT NULL,
  `original_price` DECIMAL(10,2) NOT NULL,
  `discount_percentage` INT,
  `sku` VARCHAR(100),
  `stock_quantity` INT DEFAULT 0,
  `status` ENUM('AVAILABLE','OUT_OF_STOCK','TEMPORARILY_UNAVAILABLE','DISCONTINUED') NOT NULL DEFAULT 'AVAILABLE',
  `availability_updated_at` DATETIME NULL,
  `expected_restock_date` DATE NULL,
  `unavailable_reason` VARCHAR(500) NULL,
  `category` VARCHAR(100),
  `details_materials` TEXT,
  `shipping_returns` TEXT,
  `care_instructions` TEXT,
  `is_active` BOOLEAN DEFAULT TRUE,
  `is_featured` BOOLEAN DEFAULT FALSE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX (`is_active`),
  INDEX (`is_featured`),
  INDEX (`category`),
  INDEX (`status`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `product_images` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `product_id` INT NOT NULL,
  `image_url` TEXT NOT NULL,
  `alt_text` VARCHAR(500) DEFAULT '',
  `display_order` INT DEFAULT 0,
  `is_primary` BOOLEAN DEFAULT FALSE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX (`product_id`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `product_videos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `product_id` INT NOT NULL,
  `video_url` TEXT NOT NULL,
  `display_order` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX (`product_id`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `orders` (
  `order_id` INT NOT NULL AUTO_INCREMENT,
  `order_number` VARCHAR(30) NOT NULL UNIQUE,
  `customer_id` INT NOT NULL,
  `product_id` INT,
  `product_name` VARCHAR(200) DEFAULT 'Premium Crystal Necklace',
  `quantity` INT DEFAULT 1,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `payment_method` VARCHAR(30) DEFAULT 'COD',
  `status` VARCHAR(30) DEFAULT 'Pending',
  `tracking_number` VARCHAR(100),
  `notes` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  INDEX (`order_number`),
  INDEX (`status`),
  INDEX (`created_at`),
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`customer_id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `order_id` INT NOT NULL,
  `product_id` INT,
  `product_name` VARCHAR(200) NOT NULL,
  `product_image` TEXT,
  `quantity` INT DEFAULT 1,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `total_price` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX (`order_id`),
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `order_status_history` (
  `history_id` INT NOT NULL AUTO_INCREMENT,
  `order_id` INT NOT NULL,
  `old_status` VARCHAR(30),
  `new_status` VARCHAR(30) NOT NULL,
  `changed_by` VARCHAR(50) DEFAULT 'system',
  `changed_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `remarks` TEXT,
  PRIMARY KEY (`history_id`),
  INDEX (`order_id`),
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `settings` (
  `setting_id` INT NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(100) NOT NULL UNIQUE,
  `value` TEXT NOT NULL,
  PRIMARY KEY (`setting_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `hero_content` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` TEXT NOT NULL,
  `subtitle` TEXT NOT NULL,
  `button_text` VARCHAR(100) DEFAULT 'ORDER NOW',
  `badge_text` VARCHAR(200) DEFAULT 'Premium Crystal',
  `price` DECIMAL(10,2) NOT NULL,
  `discount_price` DECIMAL(10,2) NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `product_features` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `icon` VARCHAR(50) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `section` VARCHAR(50) DEFAULT 'why_love',
  `sort_order` INT DEFAULT 0,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `gallery_images` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `image_url` TEXT NOT NULL,
  `caption` VARCHAR(200) NOT NULL,
  `section_type` VARCHAR(50) DEFAULT 'gallery',
  `sort_order` INT DEFAULT 0,
  `span_class` VARCHAR(50),
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `luxury_benefits` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `image_url` TEXT NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `sort_order` INT DEFAULT 0,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `cta_sections` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `section_key` VARCHAR(50) NOT NULL UNIQUE,
  `button_text` VARCHAR(100) DEFAULT 'ORDER NOW',
  `headline` TEXT,
  `subheadline` TEXT,
  `is_visible` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `media_library` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `file_name` VARCHAR(255) NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `file_url` TEXT NOT NULL,
  `file_size` INT NOT NULL,
  `mime_type` VARCHAR(50) NOT NULL,
  `width` INT,
  `height` INT,
  `alt_text` VARCHAR(500) DEFAULT '',
  `section_name` VARCHAR(50) DEFAULT 'general',
  `display_order` INT DEFAULT 0,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX (`section_name`),
  INDEX (`is_active`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `hero_media` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `media_id` INT NOT NULL,
  `media_type` VARCHAR(20) DEFAULT 'image',
  `display_order` INT DEFAULT 0,
  `is_primary` BOOLEAN DEFAULT FALSE,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX (`is_active`),
  INDEX (`is_primary`),
  FOREIGN KEY (`media_id`) REFERENCES `media_library`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `section_images` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `section_key` VARCHAR(50) NOT NULL,
  `media_id` INT NOT NULL,
  `display_order` INT DEFAULT 0,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX (`section_key`),
  INDEX (`is_active`),
  FOREIGN KEY (`media_id`) REFERENCES `media_library`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT IGNORE INTO `admins` (`email`, `password`, `name`, `role`) VALUES
('admin@shopsastamart.com', '$2a$10$dummy', 'Admin', 'admin');
