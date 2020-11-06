/*
Navicat MySQL Data Transfer

Source Server         : localhost_3306
Source Server Version : 50505
Source Host           : localhost:3306
Source Database       : calendar

Target Server Type    : MYSQL
Target Server Version : 50505
File Encoding         : 65001

Date: 2020-11-06 13:30:21
*/

SET FOREIGN_KEY_CHECKS=0;
-- ----------------------------
-- Table structure for `memo_count`
-- ----------------------------
DROP TABLE IF EXISTS `memo_count`;
CREATE TABLE `memo_count` (
  `depart` smallint(1) NOT NULL,
  `year` smallint(1) NOT NULL,
  `count` smallint(1) NOT NULL,
  PRIMARY KEY (`depart`,`year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of memo_count
-- ----------------------------
INSERT INTO memo_count VALUES ('3', '2020', '0');
INSERT INTO memo_count VALUES ('4', '2019', '0');
INSERT INTO memo_count VALUES ('4', '2020', '1');
