-- ============================================
-- CMS Database Schema (MySQL / MariaDB)
-- Cách dùng với HeidiSQL:
--   1. Mở HeidiSQL → kết nối MySQL
--   2. Tạo database: cms_db
--   3. Chọn cms_db → Tools → Import SQL file
--   4. Chọn file này → Execute
-- ============================================

CREATE DATABASE IF NOT EXISTS cms_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE cms_db;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id           CHAR(36)       PRIMARY KEY,
  email        VARCHAR(255)   UNIQUE NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  name         VARCHAR(255)   NOT NULL,
  role         ENUM('admin','editor','viewer') DEFAULT 'editor',
  avatar_url   TEXT,
  created_at   DATETIME       DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Posts
CREATE TABLE IF NOT EXISTS posts (
  id           CHAR(36)       PRIMARY KEY,
  title        VARCHAR(500)   NOT NULL,
  slug         VARCHAR(500)   NOT NULL,
  content      LONGTEXT,
  excerpt      TEXT,
  status       ENUM('draft','published','archived') DEFAULT 'draft',
  author_id    CHAR(36),
  content_type VARCHAR(100)   DEFAULT 'post',
  meta         JSON,
  published_at DATETIME,
  created_at   DATETIME       DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE  KEY  uq_slug   (slug),
  INDEX        idx_status (status),
  INDEX        idx_author (author_id),
  INDEX        idx_created (created_at),
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Media
CREATE TABLE IF NOT EXISTS media (
  id            CHAR(36)     PRIMARY KEY,
  filename      VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type     VARCHAR(100) NOT NULL,
  size          INT          NOT NULL,
  url           TEXT         NOT NULL,
  alt_text      TEXT,
  uploaded_by   CHAR(36),
  created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tags
CREATE TABLE IF NOT EXISTS tags (
  id   CHAR(36)    PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  UNIQUE KEY uq_tag_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Post-Tag
CREATE TABLE IF NOT EXISTS post_tags (
  post_id CHAR(36) NOT NULL,
  tag_id  CHAR(36) NOT NULL,
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES posts(id)  ON DELETE CASCADE,
  FOREIGN KEY (tag_id)  REFERENCES tags(id)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Plugin settings
CREATE TABLE IF NOT EXISTS plugin_settings (
  plugin_name VARCHAR(100) PRIMARY KEY,
  settings    JSON,
  enabled     TINYINT(1)   DEFAULT 1,
  updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed admin (password: admin123)
INSERT IGNORE INTO users (id, email, password_hash, name, role)
VALUES (
  'aaaaaaaa-0000-0000-0000-000000000001',
  'admin@cms.local',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Admin',
  'admin'
);
