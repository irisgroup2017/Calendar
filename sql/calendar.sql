/*
Navicat MySQL Data Transfer

Source Server         : localhost
Source Server Version : 50621
Source Host           : localhost:3306
Source Database       : calendar

Target Server Type    : MYSQL
Target Server Version : 50621
File Encoding         : 65001

Date: 2020-05-14 10:35:59
*/

SET FOREIGN_KEY_CHECKS=0;
-- ----------------------------
-- Table structure for `company_data`
-- ----------------------------
DROP TABLE IF EXISTS `company_data`;
CREATE TABLE `company_data` (
  `company_id` tinyint(1) NOT NULL DEFAULT '0',
  `company_name` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for `contact_data`
-- ----------------------------
DROP TABLE IF EXISTS `contact_data`;
CREATE TABLE `contact_data` (
  `dataid` bigint(1) NOT NULL,
  `emid` int(1) NOT NULL,
  `level` int(1) NOT NULL,
  `line` int(1) NOT NULL,
  `name` varchar(70) NOT NULL,
  `job` varchar(255) NOT NULL,
  `nickname` varchar(15) NOT NULL,
  `ext` varchar(4) NOT NULL,
  `private` varchar(12) NOT NULL,
  `work` varchar(12) NOT NULL,
  `email` varchar(40) NOT NULL,
  PRIMARY KEY (`dataid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for `depart_row`
-- ----------------------------
DROP TABLE IF EXISTS `depart_row`;
CREATE TABLE `depart_row` (
  `ID` int(1) NOT NULL,
  `depart` varchar(150) NOT NULL,
  `row` int(1) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for `easypass_data`
-- ----------------------------
DROP TABLE IF EXISTS `easypass_data`;
CREATE TABLE `easypass_data` (
  `unixid` varchar(10) NOT NULL,
  `amount` varchar(8) NOT NULL,
  `updated` bigint(1) NOT NULL,
  PRIMARY KEY (`unixid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for `lar_data`
-- ----------------------------
DROP TABLE IF EXISTS `lar_data`;
CREATE TABLE `lar_data` (
  `dataid` bigint(1) NOT NULL,
  `id` bigint(1) NOT NULL,
  `title` varchar(200) NOT NULL,
  `start` bigint(1) NOT NULL,
  `end` bigint(1) DEFAULT NULL,
  `swapDate` bigint(1) DEFAULT NULL,
  `allDay` tinyint(1) DEFAULT NULL,
  `className` varchar(30) NOT NULL,
  `userName` varchar(60) NOT NULL,
  `mailGroup` varchar(50) NOT NULL,
  `boss` tinyint(1) NOT NULL,
  `approve` tinyint(1) DEFAULT NULL,
  `cTime` bigint(1) NOT NULL,
  `delreq` tinyint(1) DEFAULT NULL,
  `deldate` bigint(1) DEFAULT NULL,
  `approver` varchar(60) DEFAULT NULL,
  `approvedate` bigint(1) DEFAULT NULL,
  `hrapprover` varchar(60) DEFAULT NULL,
  `hrapprovedate` bigint(1) DEFAULT NULL,
  `fname` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`dataid`,`id`)
) ENGINE=MyISAM AUTO_INCREMENT=34 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for `licenseplate_data`
-- ----------------------------
DROP TABLE IF EXISTS `licenseplate_data`;
CREATE TABLE `licenseplate_data` (
  `id` varchar(19) NOT NULL,
  `unixid` varchar(10) NOT NULL,
  `license` varchar(10) NOT NULL,
  `province` varchar(20) NOT NULL,
  `remark` varchar(20) DEFAULT NULL,
  `top` int(1) DEFAULT NULL,
  PRIMARY KEY (`unixid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for `privacy_data`
-- ----------------------------
DROP TABLE IF EXISTS `privacy_data`;
CREATE TABLE `privacy_data` (
  `dataid` bigint(10) NOT NULL,
  `cdate` bigint(1) DEFAULT NULL,
  `emid` bigint(1) NOT NULL,
  `userName` varchar(50) DEFAULT NULL,
  `mailGroup` varchar(50) DEFAULT NULL,
  `boss` tinyint(1) DEFAULT NULL,
  `operator` tinyint(1) DEFAULT NULL,
  `swtime` time DEFAULT NULL,
  `ewtime` time DEFAULT NULL,
  `wplace` tinyint(1) DEFAULT NULL,
  `company_id` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`dataid`)
) ENGINE=MyISAM AUTO_INCREMENT=59111117 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Table structure for `reserve_data`
-- ----------------------------
DROP TABLE IF EXISTS `reserve_data`;
CREATE TABLE `reserve_data` (
  `id` bigint(30) NOT NULL,
  `title` varchar(200) NOT NULL,
  `start` bigint(30) NOT NULL,
  `end` bigint(30) DEFAULT NULL,
  `allDay` tinyint(1) DEFAULT NULL,
  `className` varchar(30) NOT NULL,
  `userName` varchar(60) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for `user_data`
-- ----------------------------
DROP TABLE IF EXISTS `user_data`;
CREATE TABLE `user_data` (
  `dataid` bigint(10) NOT NULL,
  `emid` int(7) NOT NULL,
  `name` varchar(20) NOT NULL,
  `lastName` varchar(50) NOT NULL,
  `mail` varchar(40) NOT NULL,
  `jobPos` varchar(50) NOT NULL,
  `depart` varchar(40) NOT NULL,
  `mailGroup` varchar(50) NOT NULL,
  `userName` varchar(50) DEFAULT NULL,
  `password` varchar(50) DEFAULT NULL,
  `status` int(11) DEFAULT '1' COMMENT '0=ลาออก,1=ทำงาน',
  PRIMARY KEY (`emid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for `vacation_list`
-- ----------------------------
DROP TABLE IF EXISTS `vacation_list`;
CREATE TABLE `vacation_list` (
  `no` bigint(1) NOT NULL AUTO_INCREMENT,
  `year` smallint(1) DEFAULT NULL,
  `dtitle` varchar(255) DEFAULT NULL,
  `doffice` bigint(1) NOT NULL,
  `dsite` bigint(1) DEFAULT NULL,
  PRIMARY KEY (`no`)
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8;
