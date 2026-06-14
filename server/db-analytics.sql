CREATE TABLE IF NOT EXISTS visitors (
  visitor_id     BIGINT AUTO_INCREMENT PRIMARY KEY,
  anonymous_id   VARCHAR(36) NOT NULL,
  user_id        INT NULL,
  first_ip       VARCHAR(45) NULL,
  current_ip     VARCHAR(45) NULL,
  user_agent     TEXT NULL,
  device_type    VARCHAR(20) NULL,
  browser        VARCHAR(50) NULL,
  os             VARCHAR(50) NULL,
  screen_resolution VARCHAR(20) NULL,
  language       VARCHAR(10) NULL,
  timezone       VARCHAR(50) NULL,
  referrer_url   TEXT NULL,
  landing_page   TEXT NULL,
  first_visit_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_visit_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  visit_count    INT NOT NULL DEFAULT 1,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_anonymous (anonymous_id),
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS visitor_sessions (
  session_id    BIGINT AUTO_INCREMENT PRIMARY KEY,
  visitor_id    BIGINT NOT NULL,
  session_start DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  session_end   DATETIME NULL,
  ip_address    VARCHAR(45) NULL,
  user_agent    TEXT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_visitor (visitor_id),
  INDEX idx_active (is_active, session_start),
  FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS visitor_locations (
  location_id      BIGINT AUTO_INCREMENT PRIMARY KEY,
  visitor_id       BIGINT NOT NULL,
  session_id       BIGINT NOT NULL,
  ip_address       VARCHAR(45) NULL,
  country          VARCHAR(100) NULL,
  state            VARCHAR(100) NULL,
  city             VARCHAR(100) NULL,
  region           VARCHAR(100) NULL,
  latitude         DECIMAL(10,7) NULL,
  longitude        DECIMAL(10,7) NULL,
  isp              VARCHAR(200) NULL,
  network_provider VARCHAR(200) NULL,
  detected_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_visitor (visitor_id),
  FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES visitor_sessions(session_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS campaign_attributions (
  attribution_id  BIGINT AUTO_INCREMENT PRIMARY KEY,
  session_id      BIGINT NOT NULL,
  visitor_id      BIGINT NOT NULL,
  utm_source      VARCHAR(200) NULL,
  utm_medium      VARCHAR(200) NULL,
  utm_campaign    VARCHAR(200) NULL,
  utm_content     VARCHAR(200) NULL,
  utm_term        VARCHAR(200) NULL,
  referrer_url    TEXT NULL,
  landing_page    TEXT NULL,
  first_seen_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_session (session_id),
  INDEX idx_campaign (utm_source, utm_campaign),
  FOREIGN KEY (session_id) REFERENCES visitor_sessions(session_id) ON DELETE CASCADE,
  FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS page_views (
  page_view_id   BIGINT AUTO_INCREMENT PRIMARY KEY,
  session_id     BIGINT NOT NULL,
  visitor_id     BIGINT NOT NULL,
  page_url       TEXT NOT NULL,
  page_title     VARCHAR(255) NULL,
  route_name     VARCHAR(100) NULL,
  previous_url   TEXT NULL,
  referrer_url   TEXT NULL,
  time_on_page   INT NULL,
  view_start     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  view_end       DATETIME NULL,
  INDEX idx_session (session_id, view_start),
  INDEX idx_visitor (visitor_id),
  FOREIGN KEY (session_id) REFERENCES visitor_sessions(session_id) ON DELETE CASCADE,
  FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS visitor_events (
  event_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
  session_id     BIGINT NOT NULL,
  visitor_id     BIGINT NOT NULL,
  event_type     VARCHAR(50) NOT NULL,
  event_category VARCHAR(50) NULL,
  event_action   VARCHAR(100) NULL,
  event_label    VARCHAR(500) NULL,
  event_value    VARCHAR(500) NULL,
  page_url       TEXT NULL,
  metadata       JSON NULL,
  timestamp      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_type (event_type, timestamp),
  INDEX idx_visitor (visitor_id, timestamp),
  FOREIGN KEY (session_id) REFERENCES visitor_sessions(session_id) ON DELETE CASCADE,
  FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS product_interactions (
  interaction_id   BIGINT AUTO_INCREMENT PRIMARY KEY,
  session_id       BIGINT NOT NULL,
  visitor_id       BIGINT NOT NULL,
  product_id       INT NOT NULL,
  product_name     VARCHAR(200) NULL,
  product_category VARCHAR(100) NULL,
  interaction_type VARCHAR(50) NOT NULL,
  source_page      TEXT NULL,
  metadata         JSON NULL,
  timestamp        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_product (product_id, interaction_type, timestamp),
  INDEX idx_visitor (visitor_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES visitor_sessions(session_id) ON DELETE CASCADE,
  FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
