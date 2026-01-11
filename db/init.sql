-- 创建数据库
CREATE DATABASE IF NOT EXISTS alive_miniprogram CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE alive_miniprogram;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openid VARCHAR(100) UNIQUE NOT NULL,
  nickname VARCHAR(100),
  emergency_email VARCHAR(255),
  last_checkin_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_last_checkin (last_checkin_date),
  INDEX idx_emergency_email (emergency_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 签到记录表
CREATE TABLE IF NOT EXISTS checkin_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  checkin_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_checkin (user_id, checkin_date),
  INDEX idx_checkin_date (checkin_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
