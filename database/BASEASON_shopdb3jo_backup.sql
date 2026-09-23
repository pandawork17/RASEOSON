-- --------------------------------------------------------
-- 호스트:                          127.0.0.1
-- 서버 버전:                        8.4.11 - MySQL Community Server - GPL
-- 서버 OS:                        Win64
-- HeidiSQL 버전:                  12.21.0.7344
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- 테이블 shopdb3jo.ai_providers 구조 내보내기
CREATE TABLE IF NOT EXISTS `ai_providers` (
  `provider_id` bigint NOT NULL AUTO_INCREMENT COMMENT 'AI 제공자 식별자',
  `provider_code` varchar(50) NOT NULL COMMENT 'AI 제공자 코드',
  `provider_name` varchar(100) NOT NULL COMMENT 'AI 제공자명',
  `provider_type` enum('CLOUD','LOCAL') NOT NULL COMMENT 'AI 제공 방식',
  `base_url` varchar(1000) DEFAULT NULL COMMENT '기본 URL',
  `chat_model` varchar(200) DEFAULT NULL COMMENT '채팅 모델명',
  `embedding_model` varchar(200) DEFAULT NULL COMMENT '임베딩 모델명',
  `active_yn` char(1) DEFAULT 'Y' COMMENT '사용 여부(Y/N)',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '등록 일시',
  PRIMARY KEY (`provider_id`),
  UNIQUE KEY `provider_code` (`provider_code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.ai_providers:~3 rows (대략적) 내보내기
DELETE FROM `ai_providers`;
INSERT INTO `ai_providers` (`provider_id`, `provider_code`, `provider_name`, `provider_type`, `base_url`, `chat_model`, `embedding_model`, `active_yn`, `created_at`) VALUES
	(1, 'OPENAI', 'OpenAI API', 'CLOUD', 'https://api.openai.com', 'OPENAI_CHAT_MODEL', 'text-embedding-3-small', 'Y', '2026-09-09 16:22:31'),
	(2, 'GEMINI', 'Google Gemini API', 'CLOUD', 'https://generativelanguage.googleapis.com', 'GEMINI_CHAT_MODEL', 'GEMINI_EMBEDDING_MODEL', 'Y', '2026-09-09 16:22:31'),
	(3, 'OLLAMA', 'Local Ollama', 'LOCAL', 'http://localhost:11434', 'LOCAL_LLM', 'nomic-embed-text', 'Y', '2026-09-09 16:22:31');

-- 테이블 shopdb3jo.branch_notifications 구조 내보내기
CREATE TABLE IF NOT EXISTS `branch_notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `org_id` varchar(50) NOT NULL,
  `type` varchar(20) NOT NULL,
  `title` varchar(255) NOT NULL,
  `target_tab` varchar(50) NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.branch_notifications:~9 rows (대략적) 내보내기
DELETE FROM `branch_notifications`;
INSERT INTO `branch_notifications` (`id`, `org_id`, `type`, `title`, `target_tab`, `is_read`, `created_at`) VALUES
	(1, '전주지사', '주문', '신규 고객 주문이 3건 들어왔습니다.', 'orders', 0, '2026-09-22 16:59:56'),
	(2, '전주지사', '문의', '새로운 고객 문의가 등록되었습니다.', 'inquiries', 0, '2026-09-22 16:59:56'),
	(3, '부산지사', '재고', '스마트 후드티 재고가 안전재고 미만입니다.', 'inventory', 0, '2026-09-22 16:59:56'),
	(4, '2', '주문', '[구매자김] 고객님의 신규 주문이 접수되었습니다.', 'orders', 1, '2026-09-22 17:23:58'),
	(5, '2', '주문', '[구매자김] 고객님의 신규 주문이 접수되었습니다.', 'orders', 1, '2026-09-22 17:27:27');

-- 테이블 shopdb3jo.branch_purchase_order_items 구조 내보내기
CREATE TABLE IF NOT EXISTS `branch_purchase_order_items` (
  `branch_order_item_id` bigint NOT NULL AUTO_INCREMENT COMMENT '지사 발주 상세 식별자',
  `org_id` bigint NOT NULL COMMENT '조직 식별자',
  `branch_order_id` bigint NOT NULL COMMENT '지사 발주 식별자',
  `product_id` bigint NOT NULL COMMENT '상품 식별자',
  `variant_id` bigint NOT NULL COMMENT '상품 옵션 식별자',
  `order_quantity` int NOT NULL COMMENT '발주 수량',
  `approved_quantity` int DEFAULT NULL COMMENT '승인 수량',
  `received_quantity` int NOT NULL DEFAULT '0' COMMENT '입고 수량',
  `unit_price` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT '단가',
  `item_amount` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT '항목 금액',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록 일시',
  PRIMARY KEY (`branch_order_item_id`),
  KEY `idx_branch_po_items_order` (`branch_order_id`),
  KEY `idx_branch_po_items_product_variant` (`product_id`,`variant_id`),
  KEY `fk_branch_po_item_org` (`org_id`),
  KEY `fk_branch_po_item_variant` (`variant_id`),
  CONSTRAINT `fk_branch_po_item_order` FOREIGN KEY (`branch_order_id`) REFERENCES `branch_purchase_orders` (`branch_order_id`),
  CONSTRAINT `fk_branch_po_item_org` FOREIGN KEY (`org_id`) REFERENCES `org_units` (`org_id`),
  CONSTRAINT `fk_branch_po_item_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  CONSTRAINT `fk_branch_po_item_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`),
  CONSTRAINT `ck_branch_po_item_qty` CHECK ((`order_quantity` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.branch_purchase_order_items:~4 rows (대략적) 내보내기
DELETE FROM `branch_purchase_order_items`;
INSERT INTO `branch_purchase_order_items` (`branch_order_item_id`, `org_id`, `branch_order_id`, `product_id`, `variant_id`, `order_quantity`, `approved_quantity`, `received_quantity`, `unit_price`, `item_amount`, `created_at`) VALUES
	(1, 2, 1, 1, 1, 10, NULL, 0, 800800.00, 8008000.00, '2026-09-16 09:00:00'),
	(2, 2, 1, 1, 2, 15, NULL, 0, 800800.00, 12012000.00, '2026-09-16 09:00:00'),
	(3, 3, 2, 13, 49, 20, 20, 0, 89000.00, 1780000.00, '2026-09-16 11:30:00'),
	(4, 3, 2, 5, 17, 30, 30, 0, 59000.00, 1770000.00, '2026-09-16 11:30:00');

-- 테이블 shopdb3jo.branch_purchase_orders 구조 내보내기
CREATE TABLE IF NOT EXISTS `branch_purchase_orders` (
  `branch_order_id` bigint NOT NULL AUTO_INCREMENT COMMENT '지사 발주 식별자',
  `branch_order_no` varchar(50) NOT NULL COMMENT '지사 발주 번호',
  `org_id` bigint NOT NULL COMMENT '조직 식별자',
  `head_org_id` bigint NOT NULL DEFAULT '1' COMMENT '본사 조직 식별자',
  `requested_by_user_id` bigint DEFAULT NULL COMMENT '발주 요청 사용자 식별자',
  `approved_by_user_id` bigint DEFAULT NULL COMMENT '발주 승인 사용자 식별자',
  `order_status` enum('WAITING_APPROVAL','SHIPPING','RECEIVED') NOT NULL DEFAULT 'WAITING_APPROVAL' COMMENT '주문 상태',
  `request_note` varchar(500) DEFAULT NULL COMMENT '발주 요청 메모',
  `requested_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '요청 일시',
  `approved_at` datetime DEFAULT NULL COMMENT '승인 일시',
  `shipped_at` datetime DEFAULT NULL COMMENT '출고 일시',
  `received_at` datetime DEFAULT NULL COMMENT '입고 완료 일시',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',
  PRIMARY KEY (`branch_order_id`),
  UNIQUE KEY `uk_branch_purchase_order_no` (`branch_order_no`),
  KEY `idx_branch_purchase_orders_org_status` (`org_id`,`order_status`),
  KEY `fk_branch_po_head_org` (`head_org_id`),
  KEY `fk_branch_po_requested_user` (`requested_by_user_id`),
  KEY `fk_branch_po_approved_user` (`approved_by_user_id`),
  CONSTRAINT `fk_branch_po_approved_user` FOREIGN KEY (`approved_by_user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fk_branch_po_branch_org` FOREIGN KEY (`org_id`) REFERENCES `org_units` (`org_id`),
  CONSTRAINT `fk_branch_po_head_org` FOREIGN KEY (`head_org_id`) REFERENCES `org_units` (`org_id`),
  CONSTRAINT `fk_branch_po_requested_user` FOREIGN KEY (`requested_by_user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.branch_purchase_orders:~2 rows (대략적) 내보내기
DELETE FROM `branch_purchase_orders`;
INSERT INTO `branch_purchase_orders` (`branch_order_id`, `branch_order_no`, `org_id`, `head_org_id`, `requested_by_user_id`, `approved_by_user_id`, `order_status`, `request_note`, `requested_at`, `approved_at`, `shipped_at`, `received_at`, `updated_at`) VALUES
	(1, 'BPO-20260916-0001', 2, 1, 2, 1, 'WAITING_APPROVAL', '전주지사 2025 F/W 아우터 초도 발주 요청', '2026-09-16 09:00:00', NULL, NULL, NULL, '2026-09-16 10:00:00'),
	(2, 'BPO-20260916-0002', 3, 1, 3, 1, 'SHIPPING', '부산지사 팬츠 및 니트 추가 보충 발주', '2026-09-16 11:30:00', '2026-09-16 14:00:00', '2026-09-17 09:00:00', NULL, '2026-09-17 09:00:00');

-- 테이블 shopdb3jo.buyer_inquiries 구조 내보내기
CREATE TABLE IF NOT EXISTS `buyer_inquiries` (
  `inquiry_id` bigint NOT NULL AUTO_INCREMENT COMMENT '문의 식별자',
  `user_id` bigint NOT NULL COMMENT '사용자 식별자',
  `org_id` bigint DEFAULT NULL COMMENT '조직 식별자',
  `category_code` varchar(50) NOT NULL COMMENT '카테고리 코드',
  `title` varchar(200) NOT NULL COMMENT '제목',
  `content` text NOT NULL COMMENT '내용',
  `inquiry_status` varchar(30) NOT NULL COMMENT '문의 처리 상태',
  `secret_yn` varchar(1) NOT NULL COMMENT '비밀글 여부(Y/N)',
  `answer_content` text COMMENT '답변 내용',
  `answered_by_user_id` bigint DEFAULT NULL COMMENT '답변 담당 사용자 식별자',
  `created_at` datetime DEFAULT (now()) COMMENT '등록 일시',
  `updated_at` datetime DEFAULT (now()) COMMENT '수정 일시',
  `answered_at` datetime DEFAULT NULL COMMENT '답변 일시',
  PRIMARY KEY (`inquiry_id`),
  KEY `user_id` (`user_id`),
  KEY `org_id` (`org_id`),
  KEY `answered_by_user_id` (`answered_by_user_id`),
  CONSTRAINT `buyer_inquiries_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `buyer_inquiries_ibfk_2` FOREIGN KEY (`org_id`) REFERENCES `org_units` (`org_id`),
  CONSTRAINT `buyer_inquiries_ibfk_3` FOREIGN KEY (`answered_by_user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.buyer_inquiries:~5 rows (대략적) 내보내기
DELETE FROM `buyer_inquiries`;
INSERT INTO `buyer_inquiries` (`inquiry_id`, `user_id`, `org_id`, `category_code`, `title`, `content`, `inquiry_status`, `secret_yn`, `answer_content`, `answered_by_user_id`, `created_at`, `updated_at`, `answered_at`) VALUES
	(1, 4, 1, '1)상품문의', '미니멀 싱글 코트 105사이즈 재입고 문의드립니다.', '안녕하세요, 브라운 L (105) 사이즈 구매하고 싶은데 혹시 재입고 일정이 어떻게 될까요?', 'ANSWERED', 'N', '안녕하세요 고객님, 베이스시즌입니다.\r\n문의주신 미니멀 싱글 코트 브라운 105사이즈는 현재 추가 생산 중이며, 다음 주 화요일(9월 29일) 오후 2시에 재입고 예정입니다. 많은 관심 감사드립니다.', 1, '2026-09-19 10:20:00', '2026-09-19 11:00:00', '2026-09-19 11:00:00'),
	(2, 4, 1, '2)주문및결제', '주문 취소 및 배송지 변경 가능한가요?', '오늘 오전에 주문했는데 아직 배송전 상태입니다. 수령 주소지를 변경하거나 취소 후 재주문하고 싶습니다.', 'ANSWERED', 'N', '안녕하세요 고객님, 베이스시즌 고객센터입니다.\r\n배송 시작 전(1)결제완료, 2)배송전) 단계에서는 마이페이지 > 주문상세에서 직접 취소 요청이 가능하며, 주소지 변경은 고객센터 1:1 채팅 또는 전화로 즉시 수정 지원해 드립니다.', 1, '2026-09-19 14:15:00', '2026-09-19 14:40:00', '2026-09-19 14:40:00'),
	(3, 5, 1, '1)상품문의', '와이드 슬랙스 기장 수선 및 원단 두께감 문의', '키 178cm에 평소 30인치 입는데 M사이즈 기장이 신발을 살짝 덮는 정도인지, 겨울에도 입을 수 있는 두께인지 궁금합니다.', 'ANSWERED', 'N', '안녕하세요 고객님, 베이스시즌입니다.\r\n해당 슬랙스는 총장 105cm로 178cm 고객님 착용 시 신발등을 자연스럽게 덮는 예쁜 세미와이드 핏이 연출됩니다. 4계절 착용 가능한 탄탄한 폴리 레이온 혼방 원단입니다.', 1, '2026-09-20 09:30:00', '2026-09-20 10:05:00', '2026-09-20 10:05:00'),
	(4, 6, 1, '3)배송', '배송 출발 알림 후 송장 조회가 안 됩니다.', '어제 저녁에 출고 카톡을 받았는데 아직 대한통운 앱에서 조회가 안 되네요. 언제부터 추적되나요?', 'ANSWERED', 'N', '안녕하세요 고객님!\r\n택배사 집하(스캔) 작업이 당일 늦은 밤 또는 익일 오전에 진행되므로, 보통 출고 다음 날 오전 10시 이후부터 정확한 배송 추적이 가능합니다. 양해 부탁드립니다.', 1, '2026-09-21 11:10:00', '2026-09-21 11:35:00', '2026-09-21 11:35:00'),
	(5, 7, 1, '4)교환반품', '단순 변심 반품 시 택배비 차감 안내 문의', '니트 상품 수령했는데 색상이 저랑 안 어울려서 반품하고 싶습니다. 반품 신청하면 기사님이 방문하시나요?', 'ANSWERED', 'N', '안녕하세요 고객님, 베이스시즌입니다.\r\n마이페이지에서 반품 신청을 접수해 주시면 저희 측에서 CJ대한통운 수거 기사님을 자동으로 배정해 드립니다. 반품 배송비 3,000원은 결제 취소 금액에서 자동 차감됩니다.', 1, '2026-09-22 09:00:00', '2026-09-22 09:25:00', '2026-09-22 09:25:00');

-- 테이블 shopdb3jo.categories 구조 내보내기
CREATE TABLE IF NOT EXISTS `categories` (
  `category_id` bigint NOT NULL AUTO_INCREMENT COMMENT '카테고리 식별자',
  `parent_category_id` bigint DEFAULT NULL COMMENT '상위 카테고리 식별자',
  `category_name` varchar(100) NOT NULL COMMENT '카테고리명',
  `category_level` int DEFAULT '1' COMMENT '카테고리 단계',
  `display_order` int DEFAULT '0' COMMENT '표시 순서',
  `active_yn` char(1) DEFAULT 'Y' COMMENT '사용 여부(Y/N)',
  PRIMARY KEY (`category_id`),
  KEY `fk_category_parent` (`parent_category_id`),
  CONSTRAINT `fk_category_parent` FOREIGN KEY (`parent_category_id`) REFERENCES `categories` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.categories:~6 rows (대략적) 내보내기
DELETE FROM `categories`;
INSERT INTO `categories` (`category_id`, `parent_category_id`, `category_name`, `category_level`, `display_order`, `active_yn`) VALUES
	(1, NULL, 'OUTER', 1, 1, 'Y'),
	(2, NULL, 'TOP', 1, 2, 'Y'),
	(3, NULL, 'SHIRTS', 1, 3, 'Y'),
	(4, NULL, 'PANTS', 1, 4, 'Y'),
	(5, 2, 'KNIT', 2, 1, 'Y'),
	(6, 2, 'MAN TO MAN', 2, 2, 'Y');

-- 테이블 shopdb3jo.company_policies 구조 내보내기
CREATE TABLE IF NOT EXISTS `company_policies` (
  `policy_id` bigint NOT NULL AUTO_INCREMENT COMMENT '정책 식별자',
  `org_id` bigint DEFAULT NULL COMMENT '조직 식별자',
  `policy_code` varchar(50) NOT NULL COMMENT '정책 코드',
  `policy_name` varchar(200) NOT NULL COMMENT '정책명',
  `policy_version` varchar(30) NOT NULL COMMENT '정책 버전',
  `policy_type` varchar(50) DEFAULT NULL COMMENT '정책 유형',
  `policy_content` longtext COMMENT '정책 내용',
  `effective_from` date NOT NULL COMMENT '적용 시작일',
  `effective_to` date DEFAULT NULL COMMENT '적용 종료일',
  `active_yn` char(1) DEFAULT 'Y' COMMENT '사용 여부(Y/N)',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '등록 일시',
  PRIMARY KEY (`policy_id`),
  UNIQUE KEY `uk_policy_version` (`policy_code`,`policy_version`),
  KEY `fk_company_policy_org` (`org_id`),
  CONSTRAINT `fk_company_policy_org` FOREIGN KEY (`org_id`) REFERENCES `org_units` (`org_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.company_policies:~3 rows (대략적) 내보내기
DELETE FROM `company_policies`;
INSERT INTO `company_policies` (`policy_id`, `org_id`, `policy_code`, `policy_name`, `policy_version`, `policy_type`, `policy_content`, `effective_from`, `effective_to`, `active_yn`, `created_at`) VALUES
	(1, 1, 'TERMS', '쇼핑몰 이용약관', '2024.1', 'TERMS', '2024년 스마트쇼핑 이용약관입니다.', '2024-01-01', '2024-12-31', 'Y', '2026-09-09 16:22:31'),
	(2, 1, 'TERMS', '쇼핑몰 이용약관', '2025.1', 'TERMS', '2025년 스마트쇼핑 이용약관입니다.', '2025-01-01', '2025-12-31', 'Y', '2026-09-09 16:22:31'),
	(3, 1, 'TERMS', '쇼핑몰 이용약관', '2026.1', 'TERMS', '2026년 스마트쇼핑 이용약관입니다.', '2026-01-01', NULL, 'Y', '2026-09-09 16:22:31');

-- 테이블 shopdb3jo.customer_shipments 구조 내보내기
CREATE TABLE IF NOT EXISTS `customer_shipments` (
  `shipment_id` bigint NOT NULL AUTO_INCREMENT COMMENT '고객 배송 식별자',
  `org_id` bigint NOT NULL COMMENT '조직 식별자',
  `order_id` bigint NOT NULL COMMENT '주문 식별자',
  `shipment_no` varchar(50) NOT NULL COMMENT '배송 번호',
  `shipment_status` enum('PREPARING_SHIPMENT','SHIPPING','DELIVERED') NOT NULL DEFAULT 'PREPARING_SHIPMENT' COMMENT '배송 상태',
  `carrier_name` varchar(100) DEFAULT NULL COMMENT '택배사명',
  `tracking_number` varchar(100) DEFAULT NULL COMMENT '운송장 번호',
  `receiver_name` varchar(100) NOT NULL COMMENT '수령인명',
  `receiver_phone` varchar(30) DEFAULT NULL COMMENT '수령인 전화번호',
  `zipcode` varchar(20) DEFAULT NULL COMMENT '우편번호',
  `shipping_address1` varchar(300) NOT NULL COMMENT '배송 기본 주소',
  `shipping_address2` varchar(300) DEFAULT NULL COMMENT '배송 상세 주소',
  `prepared_at` datetime DEFAULT NULL COMMENT '배송 준비 일시',
  `shipped_at` datetime DEFAULT NULL COMMENT '출고 일시',
  `delivered_at` datetime DEFAULT NULL COMMENT '배송 완료 일시',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록 일시',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',
  PRIMARY KEY (`shipment_id`),
  UNIQUE KEY `uk_customer_shipment_no` (`shipment_no`),
  KEY `idx_customer_shipments_org_status` (`org_id`,`shipment_status`),
  KEY `idx_customer_shipments_order` (`order_id`),
  CONSTRAINT `fk_customer_shipment_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  CONSTRAINT `fk_customer_shipment_org` FOREIGN KEY (`org_id`) REFERENCES `org_units` (`org_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.customer_shipments:~10 rows (대략적) 내보내기
DELETE FROM `customer_shipments`;
INSERT INTO `customer_shipments` (`shipment_id`, `org_id`, `order_id`, `shipment_no`, `shipment_status`, `carrier_name`, `tracking_number`, `receiver_name`, `receiver_phone`, `zipcode`, `shipping_address1`, `shipping_address2`, `prepared_at`, `shipped_at`, `delivered_at`, `created_at`, `updated_at`) VALUES
	(1, 2, 2, 'SHP-20260918-0002', 'PREPARING_SHIPMENT', NULL, NULL, '구매자김', '010-4444-4444', '54999', '전북특별자치도 전주시 완산구 홍산로 123', '101동 1001호', '2026-09-18 11:10:00', NULL, NULL, '2026-09-18 11:10:00', '2026-09-18 11:10:00'),
	(2, 2, 6, 'SHP-20260918-0006', 'SHIPPING', 'CJ대한통운', '6891-2345-0006', '구매자김', '010-4444-4444', '54999', '전북특별자치도 전주시 완산구 홍산로 123', '101동 1001호', '2026-09-18 14:10:00', '2026-09-18 14:30:00', NULL, '2026-09-18 14:10:00', '2026-09-18 14:30:00'),
	(3, 2, 7, 'SHP-20260918-0007', 'SHIPPING', 'CJ대한통운', '6891-2345-0007', '구매자김', '010-4444-4444', '54999', '전북특별자치도 전주시 완산구 홍산로 123', '101동 1001호', '2026-09-18 15:10:00', '2026-09-18 15:30:00', NULL, '2026-09-18 15:10:00', '2026-09-18 15:30:00'),
	(4, 2, 8, 'SHP-20260918-0008', 'DELIVERED', 'CJ대한통운', '6891-2345-0008', '구매자김', '010-4444-4444', '54999', '전북특별자치도 전주시 완산구 홍산로 123', '101동 1001호', '2026-09-18 16:10:00', '2026-09-18 16:30:00', '2026-09-19 14:00:00', '2026-09-18 16:10:00', '2026-09-19 14:00:00'),
	(5, 2, 9, 'SHP-20260918-0009', 'DELIVERED', 'CJ대한통운', '6891-2345-0009', '구매자김', '010-4444-4444', '54999', '전북특별자치도 전주시 완산구 홍산로 123', '101동 1001호', '2026-09-18 17:10:00', '2026-09-18 17:30:00', '2026-09-19 15:00:00', '2026-09-18 17:10:00', '2026-09-19 15:00:00'),
	(6, 2, 10, 'SHP-20260918-0010', 'DELIVERED', 'CJ대한통운', '6891-2345-0010', '구매자김', '010-4444-4444', '54999', '전북특별자치도 전주시 완산구 홍산로 123', '101동 1001호', '2026-09-18 18:10:00', '2026-09-18 18:30:00', '2026-09-19 16:00:00', '2026-09-18 18:10:00', '2026-09-19 16:00:00'),
	(7, 2, 11, 'SHP-20260918-0011', 'DELIVERED', 'CJ대한통운', '6891-2345-0011', '구매자김', '010-4444-4444', '54999', '전북특별자치도 전주시 완산구 홍산로 123', '101동 1001호', '2026-09-18 19:10:00', '2026-09-18 19:30:00', '2026-09-19 17:00:00', '2026-09-18 19:10:00', '2026-09-19 17:00:00'),
	(8, 2, 12, 'SHP-20260918-0012', 'DELIVERED', 'CJ대한통운', '6891-2345-0012', '구매자김', '010-4444-4444', '54999', '전북특별자치도 전주시 완산구 홍산로 123', '101동 1001호', '2026-09-18 20:10:00', '2026-09-18 20:30:00', '2026-09-19 18:00:00', '2026-09-18 20:10:00', '2026-09-19 18:00:00'),
	(9, 2, 13, 'SHP-20260918-0013', 'DELIVERED', 'CJ대한통운', '6891-2345-0013', '구매자김', '010-4444-4444', '54999', '전북특별자치도 전주시 완산구 홍산로 123', '101동 1001호', '2026-09-18 21:10:00', '2026-09-18 21:30:00', '2026-09-19 19:00:00', '2026-09-18 21:10:00', '2026-09-19 19:00:00'),
	(10, 2, 14, 'SHP-20260918-0014', 'DELIVERED', 'CJ대한통운', '6891-2345-0014', '구매자김', '010-4444-4444', '54999', '전북특별자치도 전주시 완산구 홍산로 123', '101동 1001호', '2026-09-18 22:10:00', '2026-09-18 22:30:00', '2026-09-20 11:00:00', '2026-09-18 22:10:00', '2026-09-20 11:00:00');

-- 테이블 shopdb3jo.file_assets 구조 내보내기
CREATE TABLE IF NOT EXISTS `file_assets` (
  `file_id` bigint NOT NULL AUTO_INCREMENT COMMENT '파일 식별자',
  `org_id` bigint DEFAULT NULL COMMENT '조직 식별자',
  `file_type` enum('IMAGE','PDF','DOCUMENT','VIDEO','AUDIO','ETC') NOT NULL COMMENT '파일 유형',
  `storage_type` enum('LOCAL','S3','GCS','NAS','URL') NOT NULL COMMENT '파일 저장소 유형',
  `original_file_name` varchar(500) DEFAULT NULL COMMENT '원본 파일명',
  `stored_file_name` varchar(500) DEFAULT NULL COMMENT '저장된 파일명',
  `file_extension` varchar(30) DEFAULT NULL COMMENT '파일 확장자',
  `mime_type` varchar(100) DEFAULT NULL COMMENT 'MIME 파일 유형',
  `file_size` bigint DEFAULT '0' COMMENT '파일 크기',
  `storage_path` varchar(1000) DEFAULT NULL COMMENT '파일 저장 경로',
  `public_url` varchar(2000) DEFAULT NULL COMMENT '외부 공개 URL',
  `thumbnail_url` varchar(2000) DEFAULT NULL COMMENT 'thumbnail_url 컬럼',
  `checksum_sha256` varchar(64) DEFAULT NULL COMMENT 'SHA-256 체크섬',
  `active_yn` char(1) DEFAULT 'Y' COMMENT '사용 여부(Y/N)',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '등록 일시',
  PRIMARY KEY (`file_id`),
  KEY `fk_file_org` (`org_id`),
  KEY `idx_file_public_url` (`public_url`(255)),
  CONSTRAINT `fk_file_org` FOREIGN KEY (`org_id`) REFERENCES `org_units` (`org_id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.file_assets:~24 rows (대략적) 내보내기
DELETE FROM `file_assets`;
INSERT INTO `file_assets` (`file_id`, `org_id`, `file_type`, `storage_type`, `original_file_name`, `stored_file_name`, `file_extension`, `mime_type`, `file_size`, `storage_path`, `public_url`, `thumbnail_url`, `checksum_sha256`, `active_yn`, `created_at`) VALUES
	(1, 1, 'IMAGE', 'LOCAL', 'main.png', 'outer-1-main.png', 'png', 'image/png', 102400, '/images/products/outer/outer-1/main.png', '/images/products/outer/outer-1/main.png', '/images/products/outer/outer-1/main.png', NULL, 'Y', '2026-09-01 10:00:00'),
	(2, 1, 'IMAGE', 'LOCAL', 'main.png', 'outer-2-main.png', 'png', 'image/png', 102400, '/images/products/outer/outer-2/main.png', '/images/products/outer/outer-2/main.png', '/images/products/outer/outer-2/main.png', NULL, 'Y', '2026-09-01 10:00:00'),
	(3, 1, 'IMAGE', 'LOCAL', 'main.png', 'outer-3-main.png', 'png', 'image/png', 102400, '/images/products/outer/outer-3/main.png', '/images/products/outer/outer-3/main.png', '/images/products/outer/outer-3/main.png', NULL, 'Y', '2026-09-01 10:00:00'),
	(4, 1, 'IMAGE', 'LOCAL', 'main.png', 'outer-4-main.png', 'png', 'image/png', 102400, '/images/products/outer/outer-4/main.png', '/images/products/outer/outer-4/main.png', '/images/products/outer/outer-4/main.png', NULL, 'Y', '2026-09-01 10:00:00'),
	(5, 1, 'IMAGE', 'LOCAL', 'main.png', 'top-1-main.png', 'png', 'image/png', 102400, '/images/products/top/top-1/main.png', '/images/products/top/top-1/main.png', '/images/products/top/top-1/main.png', NULL, 'Y', '2026-09-01 10:00:00'),
	(6, 1, 'IMAGE', 'LOCAL', 'main.png', 'top-2-main.png', 'png', 'image/png', 102400, '/images/products/top/top-2/main.png', '/images/products/top/top-2/main.png', '/images/products/top/top-2/main.png', NULL, 'Y', '2026-09-01 10:00:00'),
	(7, 1, 'IMAGE', 'LOCAL', 'main.png', 'top-3-main.png', 'png', 'image/png', 102400, '/images/products/top/top-3/main.png', '/images/products/top/top-3/main.png', '/images/products/top/top-3/main.png', NULL, 'Y', '2026-09-01 10:00:00'),
	(8, 1, 'IMAGE', 'LOCAL', 'main.png', 'top-4-main.png', 'png', 'image/png', 102400, '/images/products/top/top-4/main.png', '/images/products/top/top-4/main.png', '/images/products/top/top-4/main.png', NULL, 'Y', '2026-09-01 10:00:00'),
	(9, 1, 'IMAGE', 'LOCAL', 'main.png', 'shirts-1-main.png', 'png', 'image/png', 102400, '/images/products/shirts/shirts-1/main.png', '/images/products/shirts/shirts-1/main.png', '/images/products/shirts/shirts-1/main.png', NULL, 'Y', '2026-09-01 10:00:00'),
	(10, 1, 'IMAGE', 'LOCAL', 'main.png', 'shirts-2-main.png', 'png', 'image/png', 102400, '/images/products/shirts/shirts-2/main.png', '/images/products/shirts/shirts-2/main.png', '/images/products/shirts/shirts-2/main.png', NULL, 'Y', '2026-09-01 10:00:00'),
	(11, 1, 'IMAGE', 'LOCAL', 'main.png', 'shirts-3-main.png', 'png', 'image/png', 102400, '/images/products/shirts/shirts-3/main.png', '/images/products/shirts/shirts-3/main.png', '/images/products/shirts/shirts-3/main.png', NULL, 'Y', '2026-09-01 10:00:00'),
	(12, 1, 'IMAGE', 'LOCAL', 'main.png', 'shirts-4-main.png', 'png', 'image/png', 102400, '/images/products/shirts/shirts-4/main.png', '/images/products/shirts/shirts-4/main.png', '/images/products/shirts/shirts-4/main.png', NULL, 'Y', '2026-09-01 10:00:00'),
	(13, 1, 'IMAGE', 'LOCAL', 'main.png', 'pants-1-main.png', 'png', 'image/png', 102400, '/images/products/pants/pants-1/main.png', '/images/products/pants/pants-1/main.png', '/images/products/pants/pants-1/main.png', NULL, 'Y', '2026-09-01 10:00:00'),
	(14, 1, 'IMAGE', 'LOCAL', 'main.png', 'pants-2-main.png', 'png', 'image/png', 102400, '/images/products/pants/pants-2/main.png', '/images/products/pants/pants-2/main.png', '/images/products/pants/pants-2/main.png', NULL, 'Y', '2026-09-01 10:00:00'),
	(15, 1, 'IMAGE', 'LOCAL', 'main.png', 'pants-3-main.png', 'png', 'image/png', 102400, '/images/products/pants/pants-3/main.png', '/images/products/pants/pants-3/main.png', '/images/products/pants/pants-3/main.png', NULL, 'Y', '2026-09-01 10:00:00'),
	(16, 1, 'IMAGE', 'LOCAL', 'main.png', 'pants-4-main.png', 'png', 'image/png', 102400, '/images/products/pants/pants-4/main.png', '/images/products/pants/pants-4/main.png', '/images/products/pants/pants-4/main.png', NULL, 'Y', '2026-09-01 10:00:00'),
	(17, 1, 'IMAGE', 'LOCAL', 'detail-1.png', 'outer-1-detail-1.png', 'png', 'image/png', 153600, '/images/products/outer/outer-1/detail/detail-1.png', '/images/products/outer/outer-1/detail/detail-1.png', '/images/products/outer/outer-1/detail/detail-1.png', NULL, 'Y', '2026-09-01 10:00:00'),
	(18, 1, 'IMAGE', 'LOCAL', 'detail-2.png', 'outer-1-detail-2.png', 'png', 'image/png', 153600, '/images/products/outer/outer-1/detail/detail-2.png', '/images/products/outer/outer-1/detail/detail-2.png', '/images/products/outer/outer-1/detail/detail-2.png', NULL, 'Y', '2026-09-01 10:00:00'),
	(19, 1, 'IMAGE', 'LOCAL', 'detail-3.png', 'outer-1-detail-3.png', 'png', 'image/png', 153600, '/images/products/outer/outer-1/detail/detail-3.png', '/images/products/outer/outer-1/detail/detail-3.png', '/images/products/outer/outer-1/detail/detail-3.png', NULL, 'Y', '2026-09-01 10:00:00'),
	(20, 1, 'IMAGE', 'LOCAL', 'detail-4.png', 'outer-1-detail-4.png', 'png', 'image/png', 153600, '/images/products/outer/outer-1/detail/detail-4.png', '/images/products/outer/outer-1/detail/detail-4.png', '/images/products/outer/outer-1/detail/detail-4.png', NULL, 'Y', '2026-09-01 10:00:00'),
	(21, 1, 'IMAGE', 'LOCAL', 'detail-5.png', 'outer-1-detail-5.png', 'png', 'image/png', 153600, '/images/products/outer/outer-1/detail/detail-5.png', '/images/products/outer/outer-1/detail/detail-5.png', '/images/products/outer/outer-1/detail/detail-5.png', NULL, 'Y', '2026-09-01 10:00:00'),
	(22, 1, 'IMAGE', 'LOCAL', 'brown.png', 'outer-1-opt-brown.png', 'png', 'image/png', 51200, '/images/products/outer/outer-1/options/brown.png', '/images/products/outer/outer-1/options/brown.png', '/images/products/outer/outer-1/options/brown.png', NULL, 'Y', '2026-09-01 10:00:00'),
	(23, 1, 'IMAGE', 'LOCAL', 'black.png', 'outer-1-opt-black.png', 'png', 'image/png', 51200, '/images/products/outer/outer-1/options/black.png', '/images/products/outer/outer-1/options/black.png', '/images/products/outer/outer-1/options/black.png', NULL, 'Y', '2026-09-01 10:00:00'),
	(24, 1, 'IMAGE', 'LOCAL', 'charcoal.png', 'outer-1-opt-charcoal.png', 'png', 'image/png', 51200, '/images/products/outer/outer-1/options/charcoal.png', '/images/products/outer/outer-1/options/charcoal.png', '/images/products/outer/outer-1/options/charcoal.png', NULL, 'Y', '2026-09-01 10:00:00');

-- 테이블 shopdb3jo.hg_inventory 구조 내보내기
CREATE TABLE IF NOT EXISTS `hg_inventory` (
  `hg_inventory_id` bigint NOT NULL AUTO_INCREMENT COMMENT '본사 재고 식별자',
  `org_id` bigint NOT NULL COMMENT '조직 식별자',
  `product_id` bigint NOT NULL COMMENT '상품 식별자',
  `variant_id` bigint NOT NULL COMMENT '상품 옵션 식별자',
  `stock_quantity` int NOT NULL DEFAULT '0' COMMENT '현재 재고 수량',
  `reserved_quantity` int NOT NULL DEFAULT '0' COMMENT '예약 재고 수량',
  `safety_stock` int NOT NULL DEFAULT '0' COMMENT '안전 재고 수량',
  `available_quantity` int GENERATED ALWAYS AS ((`stock_quantity` - `reserved_quantity`)) STORED COMMENT '가용 재고 수량',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',
  PRIMARY KEY (`hg_inventory_id`),
  UNIQUE KEY `uk_hg_inventory_org_variant` (`org_id`,`variant_id`),
  KEY `idx_hg_inventory_product` (`product_id`),
  KEY `idx_hg_inventory_variant` (`variant_id`),
  CONSTRAINT `fk_hg_inventory_org` FOREIGN KEY (`org_id`) REFERENCES `org_units` (`org_id`),
  CONSTRAINT `fk_hg_inventory_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  CONSTRAINT `fk_hg_inventory_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.hg_inventory:~64 rows (대략적) 내보내기
DELETE FROM `hg_inventory`;
INSERT INTO `hg_inventory` (`hg_inventory_id`, `org_id`, `product_id`, `variant_id`, `stock_quantity`, `reserved_quantity`, `safety_stock`, `updated_at`) VALUES
	(1, 1, 1, 1, 100, 5, 20, '2026-09-01 10:00:00'),
	(2, 1, 1, 2, 100, 5, 20, '2026-09-01 10:00:00'),
	(3, 1, 1, 3, 100, 5, 20, '2026-09-01 10:00:00'),
	(4, 1, 1, 4, 100, 5, 20, '2026-09-01 10:00:00'),
	(5, 1, 2, 5, 100, 5, 20, '2026-09-01 10:00:00'),
	(6, 1, 2, 6, 100, 5, 20, '2026-09-01 10:00:00'),
	(7, 1, 2, 7, 100, 5, 20, '2026-09-01 10:00:00'),
	(8, 1, 2, 8, 100, 5, 20, '2026-09-01 10:00:00'),
	(9, 1, 3, 9, 100, 5, 20, '2026-09-01 10:00:00'),
	(10, 1, 3, 10, 100, 5, 20, '2026-09-01 10:00:00'),
	(11, 1, 3, 11, 100, 5, 20, '2026-09-01 10:00:00'),
	(12, 1, 3, 12, 100, 5, 20, '2026-09-01 10:00:00'),
	(13, 1, 4, 13, 100, 5, 20, '2026-09-01 10:00:00'),
	(14, 1, 4, 14, 100, 5, 20, '2026-09-01 10:00:00'),
	(15, 1, 4, 15, 100, 5, 20, '2026-09-01 10:00:00'),
	(16, 1, 4, 16, 100, 5, 20, '2026-09-01 10:00:00'),
	(17, 1, 5, 17, 100, 5, 20, '2026-09-01 10:00:00'),
	(18, 1, 5, 18, 100, 5, 20, '2026-09-01 10:00:00'),
	(19, 1, 5, 19, 100, 5, 20, '2026-09-01 10:00:00'),
	(20, 1, 5, 20, 100, 5, 20, '2026-09-01 10:00:00'),
	(21, 1, 6, 21, 100, 5, 20, '2026-09-01 10:00:00'),
	(22, 1, 6, 22, 100, 5, 20, '2026-09-01 10:00:00'),
	(23, 1, 6, 23, 100, 5, 20, '2026-09-01 10:00:00'),
	(24, 1, 6, 24, 100, 5, 20, '2026-09-01 10:00:00'),
	(25, 1, 7, 25, 100, 5, 20, '2026-09-01 10:00:00'),
	(26, 1, 7, 26, 100, 5, 20, '2026-09-01 10:00:00'),
	(27, 1, 7, 27, 100, 5, 20, '2026-09-01 10:00:00'),
	(28, 1, 7, 28, 100, 5, 20, '2026-09-01 10:00:00'),
	(29, 1, 8, 29, 100, 5, 20, '2026-09-01 10:00:00'),
	(30, 1, 8, 30, 100, 5, 20, '2026-09-01 10:00:00'),
	(31, 1, 8, 31, 100, 5, 20, '2026-09-01 10:00:00'),
	(32, 1, 8, 32, 100, 5, 20, '2026-09-01 10:00:00'),
	(33, 1, 9, 33, 100, 5, 20, '2026-09-01 10:00:00'),
	(34, 1, 9, 34, 100, 5, 20, '2026-09-01 10:00:00'),
	(35, 1, 9, 35, 100, 5, 20, '2026-09-01 10:00:00'),
	(36, 1, 9, 36, 100, 5, 20, '2026-09-01 10:00:00'),
	(37, 1, 10, 37, 100, 5, 20, '2026-09-01 10:00:00'),
	(38, 1, 10, 38, 100, 5, 20, '2026-09-01 10:00:00'),
	(39, 1, 10, 39, 100, 5, 20, '2026-09-01 10:00:00'),
	(40, 1, 10, 40, 100, 5, 20, '2026-09-01 10:00:00'),
	(41, 1, 11, 41, 100, 5, 20, '2026-09-01 10:00:00'),
	(42, 1, 11, 42, 100, 5, 20, '2026-09-01 10:00:00'),
	(43, 1, 11, 43, 100, 5, 20, '2026-09-01 10:00:00'),
	(44, 1, 11, 44, 100, 5, 20, '2026-09-01 10:00:00'),
	(45, 1, 12, 45, 100, 5, 20, '2026-09-01 10:00:00'),
	(46, 1, 12, 46, 100, 5, 20, '2026-09-01 10:00:00'),
	(47, 1, 12, 47, 100, 5, 20, '2026-09-01 10:00:00'),
	(48, 1, 12, 48, 100, 5, 20, '2026-09-01 10:00:00'),
	(49, 1, 13, 49, 100, 5, 20, '2026-09-01 10:00:00'),
	(50, 1, 13, 50, 100, 5, 20, '2026-09-01 10:00:00'),
	(51, 1, 13, 51, 100, 5, 20, '2026-09-01 10:00:00'),
	(52, 1, 13, 52, 100, 5, 20, '2026-09-01 10:00:00'),
	(53, 1, 14, 53, 100, 5, 20, '2026-09-01 10:00:00'),
	(54, 1, 14, 54, 100, 5, 20, '2026-09-01 10:00:00'),
	(55, 1, 14, 55, 100, 5, 20, '2026-09-01 10:00:00'),
	(56, 1, 14, 56, 100, 5, 20, '2026-09-01 10:00:00'),
	(57, 1, 15, 57, 100, 5, 20, '2026-09-01 10:00:00'),
	(58, 1, 15, 58, 100, 5, 20, '2026-09-01 10:00:00'),
	(59, 1, 15, 59, 100, 5, 20, '2026-09-01 10:00:00'),
	(60, 1, 15, 60, 100, 5, 20, '2026-09-01 10:00:00'),
	(61, 1, 16, 61, 100, 5, 20, '2026-09-01 10:00:00'),
	(62, 1, 16, 62, 100, 5, 20, '2026-09-01 10:00:00'),
	(63, 1, 16, 63, 100, 5, 20, '2026-09-01 10:00:00'),
	(64, 1, 16, 64, 100, 5, 20, '2026-09-01 10:00:00');

-- 테이블 shopdb3jo.inquiry_files 구조 내보내기
CREATE TABLE IF NOT EXISTS `inquiry_files` (
  `inquiry_file_id` bigint NOT NULL AUTO_INCREMENT COMMENT '문의 첨부파일 식별자',
  `org_id` bigint NOT NULL,
  `inquiry_id` bigint NOT NULL COMMENT '문의 식별자',
  `file_id` bigint NOT NULL COMMENT '파일 식별자',
  `created_at` datetime DEFAULT (now()) COMMENT '등록 일시',
  PRIMARY KEY (`inquiry_file_id`),
  KEY `inquiry_id` (`inquiry_id`),
  KEY `file_id` (`file_id`),
  KEY `idx_inquiry_files_org` (`org_id`),
  CONSTRAINT `fk_inquiry_files_org` FOREIGN KEY (`org_id`) REFERENCES `org_units` (`org_id`),
  CONSTRAINT `inquiry_files_ibfk_1` FOREIGN KEY (`inquiry_id`) REFERENCES `buyer_inquiries` (`inquiry_id`),
  CONSTRAINT `inquiry_files_ibfk_2` FOREIGN KEY (`file_id`) REFERENCES `file_assets` (`file_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.inquiry_files:~5 rows (대략적) 내보내기
DELETE FROM `inquiry_files`;
INSERT INTO `inquiry_files` (`inquiry_file_id`, `org_id`, `inquiry_id`, `file_id`, `created_at`) VALUES
	(1, 2, 1, 6, '2026-09-01 10:01:00'),
	(2, 3, 2, 6, '2026-09-02 09:31:00'),
	(3, 1, 3, 7, '2026-09-03 14:01:00'),
	(4, 1, 4, 7, '2026-09-04 13:11:00'),
	(5, 1, 5, 6, '2026-09-05 15:21:00');

-- 테이블 shopdb3jo.inventories 구조 내보내기
CREATE TABLE IF NOT EXISTS `inventories` (
  `inventory_id` bigint NOT NULL AUTO_INCREMENT COMMENT '재고 식별자',
  `org_id` bigint NOT NULL COMMENT '조직 식별자',
  `variant_id` bigint NOT NULL COMMENT '상품 옵션 식별자',
  `stock_quantity` int NOT NULL DEFAULT '0' COMMENT '현재 재고 수량',
  `reserved_quantity` int NOT NULL DEFAULT '0' COMMENT '예약 재고 수량',
  `safety_stock` int NOT NULL DEFAULT '0' COMMENT '안전 재고 수량',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',
  PRIMARY KEY (`inventory_id`),
  UNIQUE KEY `uk_inventory_org_variant` (`org_id`,`variant_id`),
  KEY `fk_inventory_variant` (`variant_id`),
  CONSTRAINT `fk_inventory_org` FOREIGN KEY (`org_id`) REFERENCES `org_units` (`org_id`),
  CONSTRAINT `fk_inventory_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=193 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.inventories:~192 rows (대략적) 내보내기
DELETE FROM `inventories`;
INSERT INTO `inventories` (`inventory_id`, `org_id`, `variant_id`, `stock_quantity`, `reserved_quantity`, `safety_stock`, `updated_at`) VALUES
	(1, 1, 1, 50, 2, 10, '2026-09-01 10:00:00'),
	(2, 2, 1, 30, 1, 5, '2026-09-01 10:00:00'),
	(3, 3, 1, 20, 0, 5, '2026-09-01 10:00:00'),
	(4, 1, 2, 50, 2, 10, '2026-09-01 10:00:00'),
	(5, 2, 2, 30, 1, 5, '2026-09-01 10:00:00'),
	(6, 3, 2, 20, 0, 5, '2026-09-01 10:00:00'),
	(7, 1, 3, 50, 2, 10, '2026-09-01 10:00:00'),
	(8, 2, 3, 30, 1, 5, '2026-09-01 10:00:00'),
	(9, 3, 3, 20, 0, 5, '2026-09-01 10:00:00'),
	(10, 1, 4, 50, 2, 10, '2026-09-01 10:00:00'),
	(11, 2, 4, 30, 1, 5, '2026-09-01 10:00:00'),
	(12, 3, 4, 20, 0, 5, '2026-09-01 10:00:00'),
	(13, 1, 5, 50, 2, 10, '2026-09-01 10:00:00'),
	(14, 2, 5, 30, 1, 5, '2026-09-01 10:00:00'),
	(15, 3, 5, 20, 0, 5, '2026-09-01 10:00:00'),
	(16, 1, 6, 50, 2, 10, '2026-09-01 10:00:00'),
	(17, 2, 6, 30, 1, 5, '2026-09-01 10:00:00'),
	(18, 3, 6, 20, 0, 5, '2026-09-01 10:00:00'),
	(19, 1, 7, 50, 2, 10, '2026-09-01 10:00:00'),
	(20, 2, 7, 30, 1, 5, '2026-09-01 10:00:00'),
	(21, 3, 7, 20, 0, 5, '2026-09-01 10:00:00'),
	(22, 1, 8, 50, 2, 10, '2026-09-01 10:00:00'),
	(23, 2, 8, 30, 1, 5, '2026-09-01 10:00:00'),
	(24, 3, 8, 20, 0, 5, '2026-09-01 10:00:00'),
	(25, 1, 9, 50, 2, 10, '2026-09-01 10:00:00'),
	(26, 2, 9, 30, 1, 5, '2026-09-01 10:00:00'),
	(27, 3, 9, 20, 0, 5, '2026-09-01 10:00:00'),
	(28, 1, 10, 50, 2, 10, '2026-09-01 10:00:00'),
	(29, 2, 10, 30, 1, 5, '2026-09-01 10:00:00'),
	(30, 3, 10, 20, 0, 5, '2026-09-01 10:00:00'),
	(31, 1, 11, 50, 2, 10, '2026-09-01 10:00:00'),
	(32, 2, 11, 30, 1, 5, '2026-09-01 10:00:00'),
	(33, 3, 11, 20, 0, 5, '2026-09-01 10:00:00'),
	(34, 1, 12, 50, 2, 10, '2026-09-01 10:00:00'),
	(35, 2, 12, 30, 1, 5, '2026-09-01 10:00:00'),
	(36, 3, 12, 20, 0, 5, '2026-09-01 10:00:00'),
	(37, 1, 13, 50, 2, 10, '2026-09-01 10:00:00'),
	(38, 2, 13, 30, 1, 5, '2026-09-01 10:00:00'),
	(39, 3, 13, 20, 0, 5, '2026-09-01 10:00:00'),
	(40, 1, 14, 50, 2, 10, '2026-09-01 10:00:00'),
	(41, 2, 14, 30, 1, 5, '2026-09-01 10:00:00'),
	(42, 3, 14, 20, 0, 5, '2026-09-01 10:00:00'),
	(43, 1, 15, 50, 2, 10, '2026-09-01 10:00:00'),
	(44, 2, 15, 30, 1, 5, '2026-09-01 10:00:00'),
	(45, 3, 15, 20, 0, 5, '2026-09-01 10:00:00'),
	(46, 1, 16, 50, 2, 10, '2026-09-01 10:00:00'),
	(47, 2, 16, 30, 1, 5, '2026-09-01 10:00:00'),
	(48, 3, 16, 20, 0, 5, '2026-09-01 10:00:00'),
	(49, 1, 17, 50, 2, 10, '2026-09-01 10:00:00'),
	(50, 2, 17, 30, 1, 5, '2026-09-01 10:00:00'),
	(51, 3, 17, 20, 0, 5, '2026-09-01 10:00:00'),
	(52, 1, 18, 50, 2, 10, '2026-09-01 10:00:00'),
	(53, 2, 18, 30, 1, 5, '2026-09-01 10:00:00'),
	(54, 3, 18, 20, 0, 5, '2026-09-01 10:00:00'),
	(55, 1, 19, 50, 2, 10, '2026-09-01 10:00:00'),
	(56, 2, 19, 30, 1, 5, '2026-09-01 10:00:00'),
	(57, 3, 19, 20, 0, 5, '2026-09-01 10:00:00'),
	(58, 1, 20, 50, 2, 10, '2026-09-01 10:00:00'),
	(59, 2, 20, 30, 1, 5, '2026-09-01 10:00:00'),
	(60, 3, 20, 20, 0, 5, '2026-09-01 10:00:00'),
	(61, 1, 21, 50, 2, 10, '2026-09-01 10:00:00'),
	(62, 2, 21, 30, 1, 5, '2026-09-01 10:00:00'),
	(63, 3, 21, 20, 0, 5, '2026-09-01 10:00:00'),
	(64, 1, 22, 50, 2, 10, '2026-09-01 10:00:00'),
	(65, 2, 22, 30, 1, 5, '2026-09-01 10:00:00'),
	(66, 3, 22, 20, 0, 5, '2026-09-01 10:00:00'),
	(67, 1, 23, 50, 2, 10, '2026-09-01 10:00:00'),
	(68, 2, 23, 30, 1, 5, '2026-09-01 10:00:00'),
	(69, 3, 23, 20, 0, 5, '2026-09-01 10:00:00'),
	(70, 1, 24, 50, 2, 10, '2026-09-01 10:00:00'),
	(71, 2, 24, 30, 1, 5, '2026-09-01 10:00:00'),
	(72, 3, 24, 20, 0, 5, '2026-09-01 10:00:00'),
	(73, 1, 25, 50, 2, 10, '2026-09-01 10:00:00'),
	(74, 2, 25, 30, 1, 5, '2026-09-01 10:00:00'),
	(75, 3, 25, 20, 0, 5, '2026-09-01 10:00:00'),
	(76, 1, 26, 50, 2, 10, '2026-09-01 10:00:00'),
	(77, 2, 26, 30, 1, 5, '2026-09-01 10:00:00'),
	(78, 3, 26, 20, 0, 5, '2026-09-01 10:00:00'),
	(79, 1, 27, 50, 2, 10, '2026-09-01 10:00:00'),
	(80, 2, 27, 30, 1, 5, '2026-09-01 10:00:00'),
	(81, 3, 27, 20, 0, 5, '2026-09-01 10:00:00'),
	(82, 1, 28, 50, 2, 10, '2026-09-01 10:00:00'),
	(83, 2, 28, 30, 1, 5, '2026-09-01 10:00:00'),
	(84, 3, 28, 20, 0, 5, '2026-09-01 10:00:00'),
	(85, 1, 29, 50, 2, 10, '2026-09-01 10:00:00'),
	(86, 2, 29, 30, 1, 5, '2026-09-01 10:00:00'),
	(87, 3, 29, 20, 0, 5, '2026-09-01 10:00:00'),
	(88, 1, 30, 50, 2, 10, '2026-09-01 10:00:00'),
	(89, 2, 30, 30, 1, 5, '2026-09-01 10:00:00'),
	(90, 3, 30, 20, 0, 5, '2026-09-01 10:00:00'),
	(91, 1, 31, 50, 2, 10, '2026-09-01 10:00:00'),
	(92, 2, 31, 30, 1, 5, '2026-09-01 10:00:00'),
	(93, 3, 31, 20, 0, 5, '2026-09-01 10:00:00'),
	(94, 1, 32, 50, 2, 10, '2026-09-01 10:00:00'),
	(95, 2, 32, 30, 1, 5, '2026-09-01 10:00:00'),
	(96, 3, 32, 20, 0, 5, '2026-09-01 10:00:00'),
	(97, 1, 33, 50, 2, 10, '2026-09-01 10:00:00'),
	(98, 2, 33, 30, 1, 5, '2026-09-01 10:00:00'),
	(99, 3, 33, 20, 0, 5, '2026-09-01 10:00:00'),
	(100, 1, 34, 50, 2, 10, '2026-09-01 10:00:00'),
	(101, 2, 34, 30, 1, 5, '2026-09-01 10:00:00'),
	(102, 3, 34, 20, 0, 5, '2026-09-01 10:00:00'),
	(103, 1, 35, 50, 2, 10, '2026-09-01 10:00:00'),
	(104, 2, 35, 30, 1, 5, '2026-09-01 10:00:00'),
	(105, 3, 35, 20, 0, 5, '2026-09-01 10:00:00'),
	(106, 1, 36, 50, 2, 10, '2026-09-01 10:00:00'),
	(107, 2, 36, 30, 1, 5, '2026-09-01 10:00:00'),
	(108, 3, 36, 20, 0, 5, '2026-09-01 10:00:00'),
	(109, 1, 37, 50, 2, 10, '2026-09-01 10:00:00'),
	(110, 2, 37, 30, 1, 5, '2026-09-01 10:00:00'),
	(111, 3, 37, 20, 0, 5, '2026-09-01 10:00:00'),
	(112, 1, 38, 50, 2, 10, '2026-09-01 10:00:00'),
	(113, 2, 38, 30, 1, 5, '2026-09-01 10:00:00'),
	(114, 3, 38, 20, 0, 5, '2026-09-01 10:00:00'),
	(115, 1, 39, 50, 2, 10, '2026-09-01 10:00:00'),
	(116, 2, 39, 30, 1, 5, '2026-09-01 10:00:00'),
	(117, 3, 39, 20, 0, 5, '2026-09-01 10:00:00'),
	(118, 1, 40, 50, 2, 10, '2026-09-01 10:00:00'),
	(119, 2, 40, 30, 1, 5, '2026-09-01 10:00:00'),
	(120, 3, 40, 20, 0, 5, '2026-09-01 10:00:00'),
	(121, 1, 41, 50, 2, 10, '2026-09-01 10:00:00'),
	(122, 2, 41, 30, 1, 5, '2026-09-01 10:00:00'),
	(123, 3, 41, 20, 0, 5, '2026-09-01 10:00:00'),
	(124, 1, 42, 50, 2, 10, '2026-09-01 10:00:00'),
	(125, 2, 42, 30, 1, 5, '2026-09-01 10:00:00'),
	(126, 3, 42, 20, 0, 5, '2026-09-01 10:00:00'),
	(127, 1, 43, 50, 2, 10, '2026-09-01 10:00:00'),
	(128, 2, 43, 30, 1, 5, '2026-09-01 10:00:00'),
	(129, 3, 43, 20, 0, 5, '2026-09-01 10:00:00'),
	(130, 1, 44, 50, 2, 10, '2026-09-01 10:00:00'),
	(131, 2, 44, 30, 1, 5, '2026-09-01 10:00:00'),
	(132, 3, 44, 20, 0, 5, '2026-09-01 10:00:00'),
	(133, 1, 45, 50, 2, 10, '2026-09-01 10:00:00'),
	(134, 2, 45, 30, 1, 5, '2026-09-01 10:00:00'),
	(135, 3, 45, 20, 0, 5, '2026-09-01 10:00:00'),
	(136, 1, 46, 50, 2, 10, '2026-09-01 10:00:00'),
	(137, 2, 46, 30, 1, 5, '2026-09-01 10:00:00'),
	(138, 3, 46, 20, 0, 5, '2026-09-01 10:00:00'),
	(139, 1, 47, 50, 2, 10, '2026-09-01 10:00:00'),
	(140, 2, 47, 30, 1, 5, '2026-09-01 10:00:00'),
	(141, 3, 47, 20, 0, 5, '2026-09-01 10:00:00'),
	(142, 1, 48, 50, 2, 10, '2026-09-01 10:00:00'),
	(143, 2, 48, 30, 1, 5, '2026-09-01 10:00:00'),
	(144, 3, 48, 20, 0, 5, '2026-09-01 10:00:00'),
	(145, 1, 49, 50, 2, 10, '2026-09-01 10:00:00'),
	(146, 2, 49, 30, 1, 5, '2026-09-01 10:00:00'),
	(147, 3, 49, 20, 0, 5, '2026-09-01 10:00:00'),
	(148, 1, 50, 50, 2, 10, '2026-09-01 10:00:00'),
	(149, 2, 50, 30, 1, 5, '2026-09-01 10:00:00'),
	(150, 3, 50, 20, 0, 5, '2026-09-01 10:00:00'),
	(151, 1, 51, 50, 2, 10, '2026-09-01 10:00:00'),
	(152, 2, 51, 30, 1, 5, '2026-09-01 10:00:00'),
	(153, 3, 51, 20, 0, 5, '2026-09-01 10:00:00'),
	(154, 1, 52, 50, 2, 10, '2026-09-01 10:00:00'),
	(155, 2, 52, 30, 1, 5, '2026-09-01 10:00:00'),
	(156, 3, 52, 20, 0, 5, '2026-09-01 10:00:00'),
	(157, 1, 53, 50, 2, 10, '2026-09-01 10:00:00'),
	(158, 2, 53, 30, 1, 5, '2026-09-01 10:00:00'),
	(159, 3, 53, 20, 0, 5, '2026-09-01 10:00:00'),
	(160, 1, 54, 50, 2, 10, '2026-09-01 10:00:00'),
	(161, 2, 54, 30, 1, 5, '2026-09-01 10:00:00'),
	(162, 3, 54, 20, 0, 5, '2026-09-01 10:00:00'),
	(163, 1, 55, 50, 2, 10, '2026-09-01 10:00:00'),
	(164, 2, 55, 30, 1, 5, '2026-09-01 10:00:00'),
	(165, 3, 55, 20, 0, 5, '2026-09-01 10:00:00'),
	(166, 1, 56, 50, 2, 10, '2026-09-01 10:00:00'),
	(167, 2, 56, 30, 1, 5, '2026-09-01 10:00:00'),
	(168, 3, 56, 20, 0, 5, '2026-09-01 10:00:00'),
	(169, 1, 57, 50, 2, 10, '2026-09-01 10:00:00'),
	(170, 2, 57, 30, 1, 5, '2026-09-01 10:00:00'),
	(171, 3, 57, 20, 0, 5, '2026-09-01 10:00:00'),
	(172, 1, 58, 50, 2, 10, '2026-09-01 10:00:00'),
	(173, 2, 58, 30, 1, 5, '2026-09-01 10:00:00'),
	(174, 3, 58, 20, 0, 5, '2026-09-01 10:00:00'),
	(175, 1, 59, 50, 2, 10, '2026-09-01 10:00:00'),
	(176, 2, 59, 30, 1, 5, '2026-09-01 10:00:00'),
	(177, 3, 59, 20, 0, 5, '2026-09-01 10:00:00'),
	(178, 1, 60, 50, 2, 10, '2026-09-01 10:00:00'),
	(179, 2, 60, 30, 1, 5, '2026-09-01 10:00:00'),
	(180, 3, 60, 20, 0, 5, '2026-09-01 10:00:00'),
	(181, 1, 61, 50, 2, 10, '2026-09-01 10:00:00'),
	(182, 2, 61, 30, 1, 5, '2026-09-01 10:00:00'),
	(183, 3, 61, 20, 0, 5, '2026-09-01 10:00:00'),
	(184, 1, 62, 50, 2, 10, '2026-09-01 10:00:00'),
	(185, 2, 62, 30, 1, 5, '2026-09-01 10:00:00'),
	(186, 3, 62, 20, 0, 5, '2026-09-01 10:00:00'),
	(187, 1, 63, 50, 2, 10, '2026-09-01 10:00:00'),
	(188, 2, 63, 30, 1, 5, '2026-09-01 10:00:00'),
	(189, 3, 63, 20, 0, 5, '2026-09-01 10:00:00'),
	(190, 1, 64, 50, 2, 10, '2026-09-01 10:00:00'),
	(191, 2, 64, 30, 1, 5, '2026-09-01 10:00:00'),
	(192, 3, 64, 20, 0, 5, '2026-09-01 10:00:00');

-- 테이블 shopdb3jo.notices 구조 내보내기
CREATE TABLE IF NOT EXISTS `notices` (
  `notice_id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `content` text NOT NULL,
  `author_id` bigint NOT NULL,
  `org_id` bigint NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `view_count` int NOT NULL DEFAULT '0',
  `is_pinned` char(1) NOT NULL DEFAULT 'N',
  `image` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`notice_id`),
  KEY `fk_notices_author` (`author_id`),
  KEY `fk_notices_org` (`org_id`),
  CONSTRAINT `fk_notices_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fk_notices_org` FOREIGN KEY (`org_id`) REFERENCES `org_units` (`org_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.notices:~5 rows (대략적) 내보내기
DELETE FROM `notices`;
INSERT INTO `notices` (`notice_id`, `title`, `content`, `author_id`, `org_id`, `created_at`, `updated_at`, `view_count`, `is_pinned`, `image`) VALUES
	(1, '[공지] 2025 F/W 베이스시즌 신규 컬렉션 론칭 안내', '안녕하세요, 베이스시즌(BASEASON)입니다.\r\n\r\n2025 F/W 시즌을 맞아 감각적인 미니멀리즘과 하이엔드 울 블렌드 소재의 신규 컬렉션이 오픈되었습니다.\r\n고객 여러분의 많은 사랑 부탁드립니다.', 1, 1, '2026-09-01 09:00:00', '2026-09-01 09:00:00', 342, 'Y', NULL),
	(2, '[공지] 추석 연휴 배송 및 고객센터 운영 일정 안내', '추석 연휴 기간 배송 마감 및 CS 상담 운영 일정을 안내해 드립니다.\r\n- 택배 마감: 9월 28일 오후 2시 주문건까지 당일 출고\r\n- 고객센터 휴무: 9월 29일 ~ 10월 3일\r\n연휴 기간 접수된 주문은 10월 4일부터 순차 배송됩니다.', 1, 1, '2026-09-10 10:00:00', '2026-09-10 10:00:00', 215, 'Y', NULL),
	(3, '신규 회원 가입 웰컴 10% 쿠폰팩 지급 안내', '베이스시즌 공식 홈페이지에 가입해 주신 모든 회원분들께 첫 구매 10% 할인 쿠폰을 즉시 지급해 드립니다. 마이페이지 > 쿠폰함에서 확인하실 수 있습니다.', 1, 1, '2026-09-12 11:00:00', '2026-09-12 11:00:00', 180, 'N', NULL),
	(4, '교환 및 반품 절차 안내 (무료 반품 혜택)', '사이즈나 핏이 고민되시나요? 상품 수령 후 7일 이내 마이페이지에서 간편하게 반품/교환을 신청하실 수 있습니다. 단순 변심 반품의 경우 반품 배송비 3,000원이 차감 후 환불됩니다.', 1, 1, '2026-09-15 14:00:00', '2026-09-15 14:00:00', 145, 'N', NULL),
	(5, '고객센터 상담 운영 시간 안내', '베이스시즌 고객만족센터 운영 시간 안내입니다.\r\n- 평일: 10:00 ~ 18:00 (점심시간 12:30 ~ 13:30)\r\n- 주말 및 공휴일: 휴무\r\n1:1 문의 게시판을 이용해 주시면 상담 시간 내 순차적으로 신속히 답변드리겠습니다.', 1, 1, '2026-09-16 09:30:00', '2026-09-16 09:30:00', 98, 'N', NULL);

-- 테이블 shopdb3jo.order_items 구조 내보내기
CREATE TABLE IF NOT EXISTS `order_items` (
  `order_item_id` bigint NOT NULL AUTO_INCREMENT COMMENT '주문상품 식별자',
  `org_id` bigint NOT NULL,
  `order_id` bigint NOT NULL COMMENT '주문 식별자',
  `product_id` bigint NOT NULL COMMENT '상품 식별자',
  `variant_id` bigint DEFAULT NULL COMMENT '상품 옵션 식별자',
  `product_name_snapshot` varchar(200) NOT NULL COMMENT '주문 시점 상품명',
  `sku_snapshot` varchar(100) DEFAULT NULL COMMENT '주문 시점 SKU 코드',
  `quantity` int NOT NULL COMMENT '수량',
  `unit_price` decimal(15,2) NOT NULL COMMENT '단가',
  `item_amount` decimal(15,2) NOT NULL COMMENT '항목 금액',
  `item_status` varchar(30) DEFAULT 'ORDERED' COMMENT '주문상품 상태',
  PRIMARY KEY (`order_item_id`),
  KEY `fk_order_item_order` (`order_id`),
  KEY `fk_order_item_product` (`product_id`),
  KEY `fk_order_item_variant` (`variant_id`),
  KEY `idx_order_items_org` (`org_id`),
  CONSTRAINT `fk_order_item_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  CONSTRAINT `fk_order_item_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  CONSTRAINT `fk_order_item_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`),
  CONSTRAINT `fk_order_items_org` FOREIGN KEY (`org_id`) REFERENCES `org_units` (`org_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.order_items:~14 rows (대략적) 내보내기
DELETE FROM `order_items`;
INSERT INTO `order_items` (`order_item_id`, `org_id`, `order_id`, `product_id`, `variant_id`, `product_name_snapshot`, `sku_snapshot`, `quantity`, `unit_price`, `item_amount`, `item_status`) VALUES
	(1, 2, 1, 1, 2, '미니멀 싱글 코트 _ 브라운 (사이즈: M (100))', 'KS0917-M', 1, 800800.00, 800800.00, '1) 결제완료'),
	(2, 2, 2, 5, 18, '베이직 라운드 니트 _ 블랙 (사이즈: M (100))', 'KT1001-M', 1, 59000.00, 59000.00, '2) 배송전'),
	(3, 2, 3, 9, 34, '클래식 코튼 셔츠 _ 화이트 (사이즈: M (100))', 'KS1101-M', 1, 69000.00, 69000.00, '3) 배송전환불요청'),
	(4, 2, 4, 13, 50, '와이드 슬랙스 _ 블랙 (사이즈: M (30))', 'KP1201-M', 1, 89000.00, 89000.00, '4) 배송전환불대기'),
	(5, 2, 5, 6, 22, '베이직 라운드 니트 _ 브라운 (사이즈: M (100))', 'KT1002-M', 1, 59000.00, 59000.00, '5) 배송전환불완료'),
	(6, 2, 6, 2, 6, '미니멀 더블 울 코트 _ 블랙 (사이즈: M (100))', 'KS0918-M', 1, 179000.00, 179000.00, '6) 배송시작 (주문완료)'),
	(7, 2, 7, 3, 10, '울 블렌드 코트 _ 차콜 (사이즈: M (100))', 'KS0919-M', 1, 169000.00, 169000.00, '7) 배송중'),
	(8, 2, 8, 4, 14, '클래식 더블 코트 _ 아이보리 (사이즈: M (100))', 'KS0920-M', 1, 169000.00, 169000.00, '8) 배송완료'),
	(9, 2, 9, 10, 38, '클래식 코튼 셔츠 _ 블루 (사이즈: M (100))', 'KS1102-M', 1, 69000.00, 69000.00, '9) 반품환불요청'),
	(10, 2, 10, 11, 42, '오버핏 셔츠 _ 네이비 (사이즈: M (100))', 'KS1103-M', 1, 79000.00, 79000.00, '10) 반품환불대기'),
	(11, 2, 11, 12, 46, '라이트 셔츠 _ 그레이 (사이즈: M (100))', 'KS1104-M', 1, 69000.00, 69000.00, '11) 반품환불완료'),
	(12, 2, 12, 14, 54, '와이드 슬랙스 _ 차콜 (사이즈: M (30))', 'KP1202-M', 1, 89000.00, 89000.00, '12) 교환요청'),
	(13, 2, 13, 15, 58, '데님 와이드 팬츠 _ 블루 (사이즈: M (30))', 'KP1203-M', 1, 79000.00, 79000.00, '13) 교환처리중'),
	(14, 2, 14, 16, 62, '와이드 팬츠 _ 아이보리 (사이즈: M (30))', 'KP1204-M', 1, 89000.00, 89000.00, '14) 교환완료');

-- 테이블 shopdb3jo.orders 구조 내보내기
CREATE TABLE IF NOT EXISTS `orders` (
  `order_id` bigint NOT NULL AUTO_INCREMENT COMMENT '주문 식별자',
  `order_no` varchar(64) NOT NULL COMMENT '주문 번호',
  `buyer_user_id` bigint NOT NULL COMMENT '구매자 사용자 식별자',
  `org_id` bigint NOT NULL COMMENT '조직 식별자',
  `order_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '주문 상태',
  `process_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `product_amount` decimal(15,2) NOT NULL COMMENT '상품 총금액',
  `discount_amount` decimal(15,2) DEFAULT '0.00' COMMENT '할인 금액',
  `shipping_amount` decimal(15,2) DEFAULT '0.00' COMMENT '배송비',
  `total_amount` decimal(15,2) NOT NULL COMMENT '최종 결제 금액',
  `receiver_name` varchar(100) DEFAULT NULL COMMENT '수령인명',
  `receiver_phone` varchar(30) DEFAULT NULL COMMENT '수령인 전화번호',
  `zipcode` varchar(20) DEFAULT NULL COMMENT '우편번호',
  `shipping_address1` varchar(300) DEFAULT NULL COMMENT '배송 기본 주소',
  `shipping_address2` varchar(300) DEFAULT NULL COMMENT '배송 상세 주소',
  `ordered_at` datetime DEFAULT (now()) COMMENT '주문 일시',
  `updated_at` datetime DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `order_no` (`order_no`),
  KEY `idx_orders_date` (`ordered_at`),
  KEY `idx_orders_user` (`buyer_user_id`),
  KEY `idx_orders_org` (`org_id`),
  CONSTRAINT `fk_orders_buyer` FOREIGN KEY (`buyer_user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fk_orders_org` FOREIGN KEY (`org_id`) REFERENCES `org_units` (`org_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.orders:~14 rows (대략적) 내보내기
DELETE FROM `orders`;
INSERT INTO `orders` (`order_id`, `order_no`, `buyer_user_id`, `org_id`, `order_status`, `process_status`, `product_amount`, `discount_amount`, `shipping_amount`, `total_amount`, `receiver_name`, `receiver_phone`, `zipcode`, `shipping_address1`, `shipping_address2`, `ordered_at`, `updated_at`) VALUES
	(1, 'ORD-20260918-0001', 4, 2, '1) 결제완료', '1) 결제완료', 800800.00, 0.00, 3000.00, 803800.00, '구매자김', '010-4444-4444', '54999', '전북특별자치도 전주시 완산구 홍산로 123', '101동 1001호', '2026-09-18 10:15:00', '2026-09-18 10:15:30'),
	(2, 'ORD-20260918-0002', 4, 2, '1) 결제완료', '2) 배송전', 59000.00, 0.00, 3000.00, 62000.00, '구매자김', '010-4444-4444', '54999', '전북특별자치도 전주시 완산구 홍산로 123', '101동 1001호', '2026-09-18 11:00:00', '2026-09-18 11:00:25'),
	(3, 'ORD-20260918-0003', 4, 2, '2) 배송전결제취소', '3) 배송전환불요청', 69000.00, 0.00, 3000.00, 72000.00, '구매자김', '010-4444-4444', '54999', '전북특별자치도 전주시 완산구 홍산로 123', '101동 1001호', '2026-09-18 11:30:00', '2026-09-18 11:30:20'),
	(4, 'ORD-20260918-0004', 4, 2, '2) 배송전결제취소', '4) 배송전환불대기', 89000.00, 0.00, 3000.00, 92000.00, '구매자김', '010-4444-4444', '54999', '전북특별자치도 전주시 완산구 홍산로 123', '101동 1001호', '2026-09-18 12:00:00', '2026-09-18 12:00:30'),
	(5, 'ORD-20260918-0005', 4, 2, '2) 배송전결제취소', '5) 배송전환불완료', 59000.00, 0.00, 3000.00, 62000.00, '구매자김', '010-4444-4444', '54999', '전북특별자치도 전주시 완산구 홍산로 123', '101동 1001호', '2026-09-18 13:00:00', '2026-09-18 13:00:22'),
	(6, 'ORD-20260918-0006', 4, 2, '3) 주문완료(배송시작)', '6) 배송시작 (주문완료)', 179000.00, 0.00, 3000.00, 182000.00, '구매자김', '010-4444-4444', '54999', '전북특별자치도 전주시 완산구 홍산로 123', '101동 1001호', '2026-09-18 14:00:00', '2026-09-18 14:00:15'),
	(7, 'ORD-20260918-0007', 4, 2, '3) 주문완료(배송시작)', '7) 배송중', 169000.00, 0.00, 3000.00, 172000.00, '구매자김', '010-4444-4444', '54999', '전북특별자치도 전주시 완산구 홍산로 123', '101동 1001호', '2026-09-18 15:00:00', '2026-09-18 15:00:45'),
	(8, 'ORD-20260918-0008', 4, 2, '3) 주문완료(배송시작)', '8) 배송완료', 169000.00, 0.00, 3000.00, 172000.00, '구매자김', '010-4444-4444', '54999', '전북특별자치도 전주시 완산구 홍산로 123', '101동 1001호', '2026-09-18 16:00:00', '2026-09-18 16:00:30'),
	(9, 'ORD-20260918-0009', 4, 2, '4) 결제완료후결제취소', '9) 반품환불요청', 69000.00, 0.00, 3000.00, 72000.00, '구매자김', '010-4444-4444', '54999', '전북특별자치도 전주시 완산구 홍산로 123', '101동 1001호', '2026-09-18 17:00:00', '2026-09-18 17:00:10'),
	(10, 'ORD-20260918-0010', 4, 2, '4) 결제완료후결제취소', '10) 반품환불대기', 79000.00, 0.00, 3000.00, 82000.00, '구매자김', '010-4444-4444', '54999', '전북특별자치도 전주시 완산구 홍산로 123', '101동 1001호', '2026-09-18 18:00:00', '2026-09-18 18:00:40'),
	(11, 'ORD-20260918-0011', 4, 2, '4) 결제완료후결제취소', '11) 반품환불완료', 69000.00, 0.00, 3000.00, 72000.00, '구매자김', '010-4444-4444', '54999', '전북특별자치도 전주시 완산구 홍산로 123', '101동 1001호', '2026-09-18 19:00:00', '2026-09-18 19:00:15'),
	(12, 'ORD-20260918-0012', 4, 2, '4) 결제완료후결제취소', '12) 교환요청', 89000.00, 0.00, 3000.00, 92000.00, '구매자김', '010-4444-4444', '54999', '전북특별자치도 전주시 완산구 홍산로 123', '101동 1001호', '2026-09-18 20:00:00', '2026-09-18 20:00:50'),
	(13, 'ORD-20260918-0013', 4, 2, '4) 결제완료후결제취소', '13) 교환처리중', 79000.00, 0.00, 3000.00, 82000.00, '구매자김', '010-4444-4444', '54999', '전북특별자치도 전주시 완산구 홍산로 123', '101동 1001호', '2026-09-18 21:00:00', '2026-09-18 21:00:35'),
	(14, 'ORD-20260918-0014', 4, 2, '4) 결제완료후결제취소', '14) 교환완료', 89000.00, 0.00, 3000.00, 92000.00, '구매자김', '010-4444-4444', '54999', '전북특별자치도 전주시 완산구 홍산로 123', '101동 1001호', '2026-09-18 22:00:00', '2026-09-18 22:00:20');

-- 테이블 shopdb3jo.org_units 구조 내보내기
CREATE TABLE IF NOT EXISTS `org_units` (
  `org_id` bigint NOT NULL AUTO_INCREMENT COMMENT '조직 식별자',
  `parent_org_id` bigint DEFAULT NULL COMMENT '상위 조직 식별자',
  `org_code` varchar(50) NOT NULL COMMENT '조직 코드',
  `org_name` varchar(150) NOT NULL COMMENT '조직명',
  `org_type` enum('HEADQUARTER','BRANCH','STORE','WAREHOUSE') NOT NULL COMMENT '조직 유형',
  `business_number` varchar(30) DEFAULT NULL COMMENT '사업자등록번호',
  `representative_name` varchar(100) DEFAULT NULL COMMENT '대표자명',
  `phone` varchar(30) DEFAULT NULL COMMENT '전화번호',
  `email` varchar(255) DEFAULT NULL COMMENT '이메일 주소',
  `zipcode` varchar(20) DEFAULT NULL COMMENT '우편번호',
  `address1` varchar(300) DEFAULT NULL COMMENT '기본 주소',
  `address2` varchar(300) DEFAULT NULL COMMENT '상세 주소',
  `active_yn` char(1) DEFAULT 'Y' COMMENT '사용 여부(Y/N)',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '등록 일시',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',
  PRIMARY KEY (`org_id`),
  UNIQUE KEY `org_code` (`org_code`),
  KEY `fk_org_parent` (`parent_org_id`),
  CONSTRAINT `fk_org_parent` FOREIGN KEY (`parent_org_id`) REFERENCES `org_units` (`org_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.org_units:~4 rows (대략적) 내보내기
DELETE FROM `org_units`;
INSERT INTO `org_units` (`org_id`, `parent_org_id`, `org_code`, `org_name`, `org_type`, `business_number`, `representative_name`, `phone`, `email`, `zipcode`, `address1`, `address2`, `active_yn`, `created_at`, `updated_at`) VALUES
	(1, NULL, 'HQ001', '베이스시즌 본사', 'HEADQUARTER', '101-81-00001', '안소민', '010-2776-0401', 'contact@baseason.co.kr', '06000', '서울특별시 강남구 테헤란로 123', '베이스빌딩 10층', 'Y', '2024-01-01 09:00:00', '2026-09-22 10:00:00'),
	(2, 1, 'BR001', '베이스시즌 전주지사', 'BRANCH', '201-85-00002', '이전주', '063-111-1111', 'jeonju@baseason.co.kr', '54999', '전북특별자치도 전주시 완산구 홍산로 456', '전주지사 2층', 'Y', '2024-01-02 09:00:00', '2026-09-22 10:00:00'),
	(3, 1, 'BR002', '베이스시즌 부산지사', 'BRANCH', '301-82-00003', '박부산', '051-111-1111', 'busan@baseason.co.kr', '48000', '부산광역시 해운대구 센텀중앙로 78', '센텀타워 5층', 'Y', '2024-01-03 09:00:00', '2026-09-22 10:00:00'),
	(4, 1, 'BR005', '베이스시즌 대구지사', 'BRANCH', '501-83-00005', '최대구', '010-8868-4457', 'daegu@baseason.co.kr', '41900', '대구광역시 중구 달구벌대로 200', '대구타워 4층', 'Y', '2024-01-05 09:00:00', '2026-09-23 09:15:17');

-- 테이블 shopdb3jo.payment_transactions 구조 내보내기
CREATE TABLE IF NOT EXISTS `payment_transactions` (
  `transaction_id` bigint NOT NULL AUTO_INCREMENT COMMENT '결제 거래 식별자',
  `org_id` bigint NOT NULL,
  `payment_id` bigint NOT NULL COMMENT '결제 식별자',
  `transaction_key` varchar(255) DEFAULT NULL COMMENT '거래 고유 키',
  `transaction_type` enum('REQUEST','APPROVE','CANCEL','PARTIAL_CANCEL','REFUND') NOT NULL COMMENT '결제 거래 유형',
  `transaction_status` varchar(50) DEFAULT NULL COMMENT '거래 처리 상태',
  `transaction_amount` decimal(15,2) NOT NULL COMMENT '거래 금액',
  `pg_transaction_id` varchar(255) DEFAULT NULL COMMENT 'pg_transaction_id 컬럼',
  `idempotency_key` varchar(255) DEFAULT NULL COMMENT 'idempotency_key 컬럼',
  `cancel_reason` varchar(500) DEFAULT NULL COMMENT '취소 사유',
  `request_json` json DEFAULT NULL COMMENT '요청 데이터 JSON',
  `response_json` json DEFAULT NULL COMMENT '응답 데이터 JSON',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '등록 일시',
  PRIMARY KEY (`transaction_id`),
  KEY `fk_transaction_payment` (`payment_id`),
  KEY `idx_payment_transactions_org` (`org_id`),
  CONSTRAINT `fk_payment_transactions_org` FOREIGN KEY (`org_id`) REFERENCES `org_units` (`org_id`),
  CONSTRAINT `fk_transaction_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`payment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.payment_transactions:~14 rows (대략적) 내보내기
DELETE FROM `payment_transactions`;
INSERT INTO `payment_transactions` (`transaction_id`, `org_id`, `payment_id`, `transaction_key`, `transaction_type`, `transaction_status`, `transaction_amount`, `pg_transaction_id`, `idempotency_key`, `cancel_reason`, `request_json`, `response_json`, `created_at`) VALUES
	(1, 2, 1, 'TXKEY-2026-0001', 'APPROVE', 'SUCCESS', 803800.00, 'TOSS-TX-2026-0001', 'IDEMP-2026-0001', NULL, '{"amount": 803800, "orderId": "ORD-20260918-0001", "paymentKey": "toss_payment_2026_0001"}', '{"status": "DONE"}', '2026-09-18 10:15:30'),
	(2, 2, 2, 'TXKEY-2026-0002', 'APPROVE', 'SUCCESS', 62000.00, 'TOSS-TX-2026-0002', 'IDEMP-2026-0002', NULL, '{"amount": 62000, "orderId": "ORD-20260918-0002", "paymentKey": "toss_payment_2026_0002"}', '{"status": "DONE"}', '2026-09-18 11:00:25'),
	(3, 2, 3, 'TXKEY-2026-0003', 'APPROVE', 'SUCCESS', 72000.00, 'TOSS-TX-2026-0003', 'IDEMP-2026-0003', NULL, '{"amount": 72000, "orderId": "ORD-20260918-0003", "paymentKey": "toss_payment_2026_0003"}', '{"status": "DONE"}', '2026-09-18 11:30:20'),
	(4, 2, 4, 'TXKEY-2026-0004', 'APPROVE', 'SUCCESS', 92000.00, 'TOSS-TX-2026-0004', 'IDEMP-2026-0004', NULL, '{"amount": 92000, "orderId": "ORD-20260918-0004", "paymentKey": "toss_payment_2026_0004"}', '{"status": "DONE"}', '2026-09-18 12:00:30'),
	(5, 2, 5, 'TXKEY-2026-0005', 'APPROVE', 'SUCCESS', 62000.00, 'TOSS-TX-2026-0005', 'IDEMP-2026-0005', NULL, '{"amount": 62000, "orderId": "ORD-20260918-0005", "paymentKey": "toss_payment_2026_0005"}', '{"status": "DONE"}', '2026-09-18 13:00:22'),
	(6, 2, 6, 'TXKEY-2026-0006', 'APPROVE', 'SUCCESS', 182000.00, 'TOSS-TX-2026-0006', 'IDEMP-2026-0006', NULL, '{"amount": 182000, "orderId": "ORD-20260918-0006", "paymentKey": "toss_payment_2026_0006"}', '{"status": "DONE"}', '2026-09-18 14:00:15'),
	(7, 2, 7, 'TXKEY-2026-0007', 'APPROVE', 'SUCCESS', 172000.00, 'TOSS-TX-2026-0007', 'IDEMP-2026-0007', NULL, '{"amount": 172000, "orderId": "ORD-20260918-0007", "paymentKey": "toss_payment_2026_0007"}', '{"status": "DONE"}', '2026-09-18 15:00:45'),
	(8, 2, 8, 'TXKEY-2026-0008', 'APPROVE', 'SUCCESS', 172000.00, 'TOSS-TX-2026-0008', 'IDEMP-2026-0008', NULL, '{"amount": 172000, "orderId": "ORD-20260918-0008", "paymentKey": "toss_payment_2026_0008"}', '{"status": "DONE"}', '2026-09-18 16:00:30'),
	(9, 2, 9, 'TXKEY-2026-0009', 'APPROVE', 'SUCCESS', 72000.00, 'TOSS-TX-2026-0009', 'IDEMP-2026-0009', NULL, '{"amount": 72000, "orderId": "ORD-20260918-0009", "paymentKey": "toss_payment_2026_0009"}', '{"status": "DONE"}', '2026-09-18 17:00:10'),
	(10, 2, 10, 'TXKEY-2026-0010', 'APPROVE', 'SUCCESS', 82000.00, 'TOSS-TX-2026-0010', 'IDEMP-2026-0010', NULL, '{"amount": 82000, "orderId": "ORD-20260918-0010", "paymentKey": "toss_payment_2026_0010"}', '{"status": "DONE"}', '2026-09-18 18:00:40'),
	(11, 2, 11, 'TXKEY-2026-0011', 'APPROVE', 'SUCCESS', 72000.00, 'TOSS-TX-2026-0011', 'IDEMP-2026-0011', NULL, '{"amount": 72000, "orderId": "ORD-20260918-0011", "paymentKey": "toss_payment_2026_0011"}', '{"status": "DONE"}', '2026-09-18 19:00:15'),
	(12, 2, 12, 'TXKEY-2026-0012', 'APPROVE', 'SUCCESS', 92000.00, 'TOSS-TX-2026-0012', 'IDEMP-2026-0012', NULL, '{"amount": 92000, "orderId": "ORD-20260918-0012", "paymentKey": "toss_payment_2026_0012"}', '{"status": "DONE"}', '2026-09-18 20:00:50'),
	(13, 2, 13, 'TXKEY-2026-0013', 'APPROVE', 'SUCCESS', 82000.00, 'TOSS-TX-2026-0013', 'IDEMP-2026-0013', NULL, '{"amount": 82000, "orderId": "ORD-20260918-0013", "paymentKey": "toss_payment_2026_0013"}', '{"status": "DONE"}', '2026-09-18 21:00:35'),
	(14, 2, 14, 'TXKEY-2026-0014', 'APPROVE', 'SUCCESS', 92000.00, 'TOSS-TX-2026-0014', 'IDEMP-2026-0014', NULL, '{"amount": 92000, "orderId": "ORD-20260918-0014", "paymentKey": "toss_payment_2026_0014"}', '{"status": "DONE"}', '2026-09-18 22:00:20');

-- 테이블 shopdb3jo.payment_webhook_events 구조 내보내기
CREATE TABLE IF NOT EXISTS `payment_webhook_events` (
  `webhook_id` bigint NOT NULL AUTO_INCREMENT COMMENT '결제 웹훅 식별자',
  `org_id` bigint NOT NULL,
  `payment_id` bigint DEFAULT NULL COMMENT '결제 식별자',
  `pg_provider` varchar(50) DEFAULT NULL COMMENT '결제대행사(PG)',
  `event_type` varchar(100) DEFAULT NULL COMMENT '이벤트 유형',
  `event_id` varchar(255) DEFAULT NULL COMMENT '이벤트 식별자',
  `payload_json` json DEFAULT NULL COMMENT '수신 데이터 JSON',
  `processed_yn` char(1) DEFAULT 'N' COMMENT '처리 여부(Y/N)',
  `error_message` text COMMENT '오류 메시지',
  `received_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '입고 완료 일시',
  `processed_at` datetime DEFAULT NULL COMMENT '처리 일시',
  PRIMARY KEY (`webhook_id`),
  KEY `fk_webhook_payment` (`payment_id`),
  KEY `idx_payment_webhook_org` (`org_id`),
  CONSTRAINT `fk_payment_webhook_org` FOREIGN KEY (`org_id`) REFERENCES `org_units` (`org_id`),
  CONSTRAINT `fk_webhook_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`payment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.payment_webhook_events:~2 rows (대략적) 내보내기
DELETE FROM `payment_webhook_events`;
INSERT INTO `payment_webhook_events` (`webhook_id`, `org_id`, `payment_id`, `pg_provider`, `event_type`, `event_id`, `payload_json`, `processed_yn`, `error_message`, `received_at`, `processed_at`) VALUES
	(1, 1, 1, 'TOSS', 'PAYMENT_STATUS_CHANGED', 'WEBHOOK-2024-001', '{"status": "DONE", "paymentKey": "toss_payment_2024_001"}', 'Y', NULL, '2024-03-15 10:12:10', '2024-03-15 10:12:11'),
	(2, 1, 5, 'TOSS', 'PAYMENT_STATUS_CHANGED', 'WEBHOOK-2026-001', '{"status": "DONE", "paymentKey": "toss_payment_2026_001"}', 'Y', NULL, '2026-01-20 09:32:10', '2026-01-20 09:32:11');

-- 테이블 shopdb3jo.payments 구조 내보내기
CREATE TABLE IF NOT EXISTS `payments` (
  `payment_id` bigint NOT NULL AUTO_INCREMENT COMMENT '결제 식별자',
  `org_id` bigint NOT NULL,
  `order_id` bigint NOT NULL COMMENT '주문 식별자',
  `pg_provider` varchar(50) NOT NULL COMMENT '결제대행사(PG)',
  `payment_key` varchar(255) DEFAULT NULL COMMENT 'PG 결제 키',
  `pg_order_id` varchar(255) DEFAULT NULL COMMENT 'PG 주문 식별자',
  `customer_key` varchar(255) DEFAULT NULL COMMENT 'customer_key 컬럼',
  `payment_type` varchar(50) DEFAULT NULL COMMENT 'payment_type 컬럼',
  `payment_method` varchar(100) DEFAULT NULL COMMENT '결제 수단',
  `payment_status` varchar(50) DEFAULT NULL COMMENT '결제 상태',
  `requested_amount` decimal(15,2) NOT NULL COMMENT '요청 금액',
  `approved_amount` decimal(15,2) DEFAULT '0.00' COMMENT '승인 금액',
  `cancelled_amount` decimal(15,2) DEFAULT '0.00' COMMENT '취소 누적 금액',
  `balance_amount` decimal(15,2) DEFAULT '0.00' COMMENT '결제 잔액',
  `currency` varchar(10) DEFAULT 'KRW' COMMENT 'currency 컬럼',
  `receipt_url` varchar(2000) DEFAULT NULL COMMENT '결제 영수증 URL',
  `requested_at` datetime DEFAULT NULL COMMENT '요청 일시',
  `approved_at` datetime DEFAULT NULL COMMENT '승인 일시',
  `cancelled_at` datetime DEFAULT NULL COMMENT '취소 일시',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '등록 일시',
  PRIMARY KEY (`payment_id`),
  UNIQUE KEY `uk_payment_key` (`payment_key`),
  KEY `idx_payments_order` (`order_id`),
  KEY `idx_payment_provider` (`pg_provider`),
  KEY `idx_payments_org` (`org_id`),
  CONSTRAINT `fk_payment_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  CONSTRAINT `fk_payments_org` FOREIGN KEY (`org_id`) REFERENCES `org_units` (`org_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.payments:~14 rows (대략적) 내보내기
DELETE FROM `payments`;
INSERT INTO `payments` (`payment_id`, `org_id`, `order_id`, `pg_provider`, `payment_key`, `pg_order_id`, `customer_key`, `payment_type`, `payment_method`, `payment_status`, `requested_amount`, `approved_amount`, `cancelled_amount`, `balance_amount`, `currency`, `receipt_url`, `requested_at`, `approved_at`, `cancelled_at`, `created_at`) VALUES
	(1, 2, 1, 'TOSS', 'toss_payment_2026_0001', 'ORD-20260918-0001', 'CUSTOMER-2026-0004', 'NORMAL', 'CARD', 'DONE', 803800.00, 803800.00, 0.00, 803800.00, 'KRW', NULL, '2026-09-18 10:15:00', '2026-09-18 10:15:30', NULL, '2026-09-18 10:15:00'),
	(2, 2, 2, 'TOSS', 'toss_payment_2026_0002', 'ORD-20260918-0002', 'CUSTOMER-2026-0004', 'NORMAL', 'CARD', 'DONE', 62000.00, 62000.00, 0.00, 62000.00, 'KRW', NULL, '2026-09-18 11:00:00', '2026-09-18 11:00:25', NULL, '2026-09-18 11:00:00'),
	(3, 2, 3, 'TOSS', 'toss_payment_2026_0003', 'ORD-20260918-0003', 'CUSTOMER-2026-0004', 'NORMAL', 'CARD', 'DONE', 72000.00, 72000.00, 0.00, 72000.00, 'KRW', NULL, '2026-09-18 11:30:00', '2026-09-18 11:30:20', NULL, '2026-09-18 11:30:00'),
	(4, 2, 4, 'TOSS', 'toss_payment_2026_0004', 'ORD-20260918-0004', 'CUSTOMER-2026-0004', 'NORMAL', 'CARD', 'DONE', 92000.00, 92000.00, 0.00, 92000.00, 'KRW', NULL, '2026-09-18 12:00:00', '2026-09-18 12:00:30', NULL, '2026-09-18 12:00:00'),
	(5, 2, 5, 'TOSS', 'toss_payment_2026_0005', 'ORD-20260918-0005', 'CUSTOMER-2026-0004', 'NORMAL', 'CARD', 'DONE', 62000.00, 62000.00, 0.00, 62000.00, 'KRW', NULL, '2026-09-18 13:00:00', '2026-09-18 13:00:22', NULL, '2026-09-18 13:00:00'),
	(6, 2, 6, 'TOSS', 'toss_payment_2026_0006', 'ORD-20260918-0006', 'CUSTOMER-2026-0004', 'NORMAL', 'CARD', 'DONE', 182000.00, 182000.00, 0.00, 182000.00, 'KRW', NULL, '2026-09-18 14:00:00', '2026-09-18 14:00:15', NULL, '2026-09-18 14:00:00'),
	(7, 2, 7, 'TOSS', 'toss_payment_2026_0007', 'ORD-20260918-0007', 'CUSTOMER-2026-0004', 'NORMAL', 'CARD', 'DONE', 172000.00, 172000.00, 0.00, 172000.00, 'KRW', NULL, '2026-09-18 15:00:00', '2026-09-18 15:00:45', NULL, '2026-09-18 15:00:00'),
	(8, 2, 8, 'TOSS', 'toss_payment_2026_0008', 'ORD-20260918-0008', 'CUSTOMER-2026-0004', 'NORMAL', 'CARD', 'DONE', 172000.00, 172000.00, 0.00, 172000.00, 'KRW', NULL, '2026-09-18 16:00:00', '2026-09-18 16:00:30', NULL, '2026-09-18 16:00:00'),
	(9, 2, 9, 'TOSS', 'toss_payment_2026_0009', 'ORD-20260918-0009', 'CUSTOMER-2026-0004', 'NORMAL', 'CARD', 'DONE', 72000.00, 72000.00, 0.00, 72000.00, 'KRW', NULL, '2026-09-18 17:00:00', '2026-09-18 17:00:10', NULL, '2026-09-18 17:00:00'),
	(10, 2, 10, 'TOSS', 'toss_payment_2026_0010', 'ORD-20260918-0010', 'CUSTOMER-2026-0004', 'NORMAL', 'CARD', 'DONE', 82000.00, 82000.00, 0.00, 82000.00, 'KRW', NULL, '2026-09-18 18:00:00', '2026-09-18 18:00:40', NULL, '2026-09-18 18:00:00'),
	(11, 2, 11, 'TOSS', 'toss_payment_2026_0011', 'ORD-20260918-0011', 'CUSTOMER-2026-0004', 'NORMAL', 'CARD', 'DONE', 72000.00, 72000.00, 0.00, 72000.00, 'KRW', NULL, '2026-09-18 19:00:00', '2026-09-18 19:00:15', NULL, '2026-09-18 19:00:00'),
	(12, 2, 12, 'TOSS', 'toss_payment_2026_0012', 'ORD-20260918-0012', 'CUSTOMER-2026-0004', 'NORMAL', 'CARD', 'DONE', 92000.00, 92000.00, 0.00, 92000.00, 'KRW', NULL, '2026-09-18 20:00:00', '2026-09-18 20:00:50', NULL, '2026-09-18 20:00:00'),
	(13, 2, 13, 'TOSS', 'toss_payment_2026_0013', 'ORD-20260918-0013', 'CUSTOMER-2026-0004', 'NORMAL', 'CARD', 'DONE', 82000.00, 82000.00, 0.00, 82000.00, 'KRW', NULL, '2026-09-18 21:00:00', '2026-09-18 21:00:35', NULL, '2026-09-18 21:00:00'),
	(14, 2, 14, 'TOSS', 'toss_payment_2026_0014', 'ORD-20260918-0014', 'CUSTOMER-2026-0004', 'NORMAL', 'CARD', 'DONE', 92000.00, 92000.00, 0.00, 92000.00, 'KRW', NULL, '2026-09-18 22:00:00', '2026-09-18 22:00:20', NULL, '2026-09-18 22:00:00');

-- 테이블 shopdb3jo.policy_files 구조 내보내기
CREATE TABLE IF NOT EXISTS `policy_files` (
  `policy_file_id` bigint NOT NULL AUTO_INCREMENT COMMENT '정책 첨부파일 식별자',
  `org_id` bigint NOT NULL,
  `policy_id` bigint NOT NULL COMMENT '정책 식별자',
  `file_id` bigint NOT NULL COMMENT '파일 식별자',
  `display_order` int DEFAULT '0' COMMENT '표시 순서',
  PRIMARY KEY (`policy_file_id`),
  KEY `fk_policy_file_policy` (`policy_id`),
  KEY `fk_policy_file_asset` (`file_id`),
  KEY `idx_policy_files_org` (`org_id`),
  CONSTRAINT `fk_policy_file_asset` FOREIGN KEY (`file_id`) REFERENCES `file_assets` (`file_id`),
  CONSTRAINT `fk_policy_file_policy` FOREIGN KEY (`policy_id`) REFERENCES `company_policies` (`policy_id`),
  CONSTRAINT `fk_policy_files_org` FOREIGN KEY (`org_id`) REFERENCES `org_units` (`org_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.policy_files:~5 rows (대략적) 내보내기
DELETE FROM `policy_files`;
INSERT INTO `policy_files` (`policy_file_id`, `org_id`, `policy_id`, `file_id`, `display_order`) VALUES
	(1, 1, 1, 6, 1),
	(2, 1, 1, 7, 2),
	(3, 1, 2, 6, 1),
	(4, 1, 2, 7, 2),
	(5, 1, 3, 7, 1);

-- 테이블 shopdb3jo.product_files 구조 내보내기
CREATE TABLE IF NOT EXISTS `product_files` (
  `product_file_id` bigint NOT NULL AUTO_INCREMENT COMMENT '상품 파일 식별자',
  `org_id` bigint NOT NULL,
  `product_id` bigint NOT NULL COMMENT '상품 식별자',
  `file_id` bigint NOT NULL COMMENT '파일 식별자',
  `file_category` varchar(50) DEFAULT NULL COMMENT '파일 분류',
  `file_description` varchar(500) DEFAULT NULL COMMENT '파일 설명',
  `display_order` int DEFAULT '0' COMMENT '표시 순서',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '등록 일시',
  PRIMARY KEY (`product_file_id`),
  KEY `fk_product_file_product` (`product_id`),
  KEY `fk_product_file_asset` (`file_id`),
  KEY `idx_product_files_org` (`org_id`),
  CONSTRAINT `fk_product_file_asset` FOREIGN KEY (`file_id`) REFERENCES `file_assets` (`file_id`),
  CONSTRAINT `fk_product_file_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  CONSTRAINT `fk_product_files_org` FOREIGN KEY (`org_id`) REFERENCES `org_units` (`org_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.product_files:~3 rows (대략적) 내보내기
DELETE FROM `product_files`;
INSERT INTO `product_files` (`product_file_id`, `org_id`, `product_id`, `file_id`, `file_category`, `file_description`, `display_order`, `created_at`) VALUES
	(1, 1, 1, 6, 'MANUAL', 'AI 개발용 노트북 사용자 매뉴얼', 0, '2026-09-09 16:22:31'),
	(2, 1, 5, 7, 'MANUAL', 'AI Workstation Laptop 사용자 매뉴얼', 0, '2026-09-09 16:22:31'),
	(3, 2, 6, 9, 'DETAIL', '01_상의_언더아머.png', 1, '2026-09-14 14:18:04');

-- 테이블 shopdb3jo.product_images 구조 내보내기
CREATE TABLE IF NOT EXISTS `product_images` (
  `product_image_id` bigint NOT NULL AUTO_INCREMENT COMMENT '상품 이미지 식별자',
  `org_id` bigint NOT NULL,
  `product_id` bigint NOT NULL COMMENT '상품 식별자',
  `file_id` bigint NOT NULL COMMENT '파일 식별자',
  `image_type` enum('MAIN','DETAIL','THUMBNAIL','OPTION') DEFAULT 'DETAIL' COMMENT '상품 이미지 유형',
  `alt_text` varchar(500) DEFAULT NULL COMMENT '이미지 대체 텍스트',
  `display_order` int DEFAULT '0' COMMENT '표시 순서',
  `active_yn` char(1) DEFAULT 'Y' COMMENT '사용 여부(Y/N)',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '등록 일시',
  PRIMARY KEY (`product_image_id`),
  KEY `fk_product_images_product` (`product_id`),
  KEY `fk_product_images_file` (`file_id`),
  KEY `idx_product_images_org` (`org_id`),
  CONSTRAINT `fk_product_images_file` FOREIGN KEY (`file_id`) REFERENCES `file_assets` (`file_id`),
  CONSTRAINT `fk_product_images_org` FOREIGN KEY (`org_id`) REFERENCES `org_units` (`org_id`),
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.product_images:~21 rows (대략적) 내보내기
DELETE FROM `product_images`;
INSERT INTO `product_images` (`product_image_id`, `org_id`, `product_id`, `file_id`, `image_type`, `alt_text`, `display_order`, `active_yn`, `created_at`) VALUES
	(1, 1, 1, 1, 'MAIN', '미니멀 싱글 코트 _ 브라운 대표 이미지', 1, 'Y', '2026-09-01 10:00:00'),
	(2, 1, 1, 17, '', '미니멀 싱글 코트 _ 브라운 상세 1', 2, 'Y', '2026-09-01 10:00:00'),
	(3, 1, 1, 18, '', '미니멀 싱글 코트 _ 브라운 상세 2', 3, 'Y', '2026-09-01 10:00:00'),
	(4, 1, 1, 19, '', '미니멀 싱글 코트 _ 브라운 상세 3', 4, 'Y', '2026-09-01 10:00:00'),
	(5, 1, 1, 20, '', '미니멀 싱글 코트 _ 브라운 상세 4', 5, 'Y', '2026-09-01 10:00:00'),
	(6, 1, 1, 21, '', '미니멀 싱글 코트 _ 브라운 상세 5', 6, 'Y', '2026-09-01 10:00:00'),
	(7, 1, 2, 2, 'MAIN', '미니멀 더블 울 코트 _ 블랙 대표 이미지', 1, 'Y', '2026-09-01 10:00:00'),
	(8, 1, 3, 3, 'MAIN', '울 블렌드 코트 _ 차콜 대표 이미지', 1, 'Y', '2026-09-01 10:00:00'),
	(9, 1, 4, 4, 'MAIN', '클래식 더블 코트 _ 아이보리 대표 이미지', 1, 'Y', '2026-09-01 10:00:00'),
	(10, 1, 5, 5, 'MAIN', '베이직 라운드 니트 _ 블랙 대표 이미지', 1, 'Y', '2026-09-01 10:00:00'),
	(11, 1, 6, 6, 'MAIN', '베이직 라운드 니트 _ 브라운 대표 이미지', 1, 'Y', '2026-09-01 10:00:00'),
	(12, 1, 7, 7, 'MAIN', '울 라운드 니트 _ 그레이 대표 이미지', 1, 'Y', '2026-09-01 10:00:00'),
	(13, 1, 8, 8, 'MAIN', '소프트 라운드 니트 _ 아이보리 대표 이미지', 1, 'Y', '2026-09-01 10:00:00'),
	(14, 1, 9, 9, 'MAIN', '클래식 코튼 셔츠 _ 화이트 대표 이미지', 1, 'Y', '2026-09-01 10:00:00'),
	(15, 1, 10, 10, 'MAIN', '클래식 코튼 셔츠 _ 블루 대표 이미지', 1, 'Y', '2026-09-01 10:00:00'),
	(16, 1, 11, 11, 'MAIN', '오버핏 셔츠 _ 네이비 대표 이미지', 1, 'Y', '2026-09-01 10:00:00'),
	(17, 1, 12, 12, 'MAIN', '라이트 셔츠 _ 그레이 대표 이미지', 1, 'Y', '2026-09-01 10:00:00'),
	(18, 1, 13, 13, 'MAIN', '와이드 슬랙스 _ 블랙 대표 이미지', 1, 'Y', '2026-09-01 10:00:00'),
	(19, 1, 14, 14, 'MAIN', '와이드 슬랙스 _ 차콜 대표 이미지', 1, 'Y', '2026-09-01 10:00:00'),
	(20, 1, 15, 15, 'MAIN', '데님 와이드 팬츠 _ 블루 대표 이미지', 1, 'Y', '2026-09-01 10:00:00'),
	(21, 1, 16, 16, 'MAIN', '와이드 팬츠 _ 아이보리 대표 이미지', 1, 'Y', '2026-09-01 10:00:00');

-- 테이블 shopdb3jo.product_variants 구조 내보내기
CREATE TABLE IF NOT EXISTS `product_variants` (
  `variant_id` bigint NOT NULL AUTO_INCREMENT COMMENT '상품 옵션 식별자',
  `org_id` bigint NOT NULL,
  `product_id` bigint NOT NULL COMMENT '상품 식별자',
  `sku_code` varchar(100) NOT NULL COMMENT '재고관리단위(SKU) 코드',
  `option_name1` varchar(100) DEFAULT NULL COMMENT '상품 옵션명 1',
  `option_value1` varchar(100) DEFAULT NULL COMMENT '상품 옵션값 1',
  `option_name2` varchar(100) DEFAULT NULL COMMENT '상품 옵션명 2',
  `option_value2` varchar(100) DEFAULT NULL COMMENT '상품 옵션값 2',
  `additional_price` decimal(15,2) DEFAULT '0.00' COMMENT '옵션 추가 금액',
  `active_yn` char(1) DEFAULT 'Y' COMMENT '사용 여부(Y/N)',
  PRIMARY KEY (`variant_id`),
  UNIQUE KEY `sku_code` (`sku_code`),
  KEY `fk_variant_product` (`product_id`),
  KEY `idx_product_variants_org` (`org_id`),
  CONSTRAINT `fk_product_variants_org` FOREIGN KEY (`org_id`) REFERENCES `org_units` (`org_id`),
  CONSTRAINT `fk_variant_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.product_variants:~64 rows (대략적) 내보내기
DELETE FROM `product_variants`;
INSERT INTO `product_variants` (`variant_id`, `org_id`, `product_id`, `sku_code`, `option_name1`, `option_value1`, `option_name2`, `option_value2`, `additional_price`, `active_yn`) VALUES
	(1, 1, 1, 'KS0917-S', '사이즈', 'S (95)', NULL, NULL, 0.00, 'Y'),
	(2, 1, 1, 'KS0917-M', '사이즈', 'M (100)', NULL, NULL, 0.00, 'Y'),
	(3, 1, 1, 'KS0917-L', '사이즈', 'L (105)', NULL, NULL, 0.00, 'Y'),
	(4, 1, 1, 'KS0917-XL', '사이즈', 'XL (110)', NULL, NULL, 0.00, 'Y'),
	(5, 1, 2, 'KS0918-S', '사이즈', 'S (95)', NULL, NULL, 0.00, 'Y'),
	(6, 1, 2, 'KS0918-M', '사이즈', 'M (100)', NULL, NULL, 0.00, 'Y'),
	(7, 1, 2, 'KS0918-L', '사이즈', 'L (105)', NULL, NULL, 0.00, 'Y'),
	(8, 1, 2, 'KS0918-XL', '사이즈', 'XL (110)', NULL, NULL, 0.00, 'Y'),
	(9, 1, 3, 'KS0919-S', '사이즈', 'S (95)', NULL, NULL, 0.00, 'Y'),
	(10, 1, 3, 'KS0919-M', '사이즈', 'M (100)', NULL, NULL, 0.00, 'Y'),
	(11, 1, 3, 'KS0919-L', '사이즈', 'L (105)', NULL, NULL, 0.00, 'Y'),
	(12, 1, 3, 'KS0919-XL', '사이즈', 'XL (110)', NULL, NULL, 0.00, 'Y'),
	(13, 1, 4, 'KS0920-S', '사이즈', 'S (95)', NULL, NULL, 0.00, 'Y'),
	(14, 1, 4, 'KS0920-M', '사이즈', 'M (100)', NULL, NULL, 0.00, 'Y'),
	(15, 1, 4, 'KS0920-L', '사이즈', 'L (105)', NULL, NULL, 0.00, 'Y'),
	(16, 1, 4, 'KS0920-XL', '사이즈', 'XL (110)', NULL, NULL, 0.00, 'Y'),
	(17, 1, 5, 'KT1001-S', '사이즈', 'S (95)', NULL, NULL, 0.00, 'Y'),
	(18, 1, 5, 'KT1001-M', '사이즈', 'M (100)', NULL, NULL, 0.00, 'Y'),
	(19, 1, 5, 'KT1001-L', '사이즈', 'L (105)', NULL, NULL, 0.00, 'Y'),
	(20, 1, 5, 'KT1001-XL', '사이즈', 'XL (110)', NULL, NULL, 0.00, 'Y'),
	(21, 1, 6, 'KT1002-S', '사이즈', 'S (95)', NULL, NULL, 0.00, 'Y'),
	(22, 1, 6, 'KT1002-M', '사이즈', 'M (100)', NULL, NULL, 0.00, 'Y'),
	(23, 1, 6, 'KT1002-L', '사이즈', 'L (105)', NULL, NULL, 0.00, 'Y'),
	(24, 1, 6, 'KT1002-XL', '사이즈', 'XL (110)', NULL, NULL, 0.00, 'Y'),
	(25, 1, 7, 'KT1003-S', '사이즈', 'S (95)', NULL, NULL, 0.00, 'Y'),
	(26, 1, 7, 'KT1003-M', '사이즈', 'M (100)', NULL, NULL, 0.00, 'Y'),
	(27, 1, 7, 'KT1003-L', '사이즈', 'L (105)', NULL, NULL, 0.00, 'Y'),
	(28, 1, 7, 'KT1003-XL', '사이즈', 'XL (110)', NULL, NULL, 0.00, 'Y'),
	(29, 1, 8, 'KT1004-S', '사이즈', 'S (95)', NULL, NULL, 0.00, 'Y'),
	(30, 1, 8, 'KT1004-M', '사이즈', 'M (100)', NULL, NULL, 0.00, 'Y'),
	(31, 1, 8, 'KT1004-L', '사이즈', 'L (105)', NULL, NULL, 0.00, 'Y'),
	(32, 1, 8, 'KT1004-XL', '사이즈', 'XL (110)', NULL, NULL, 0.00, 'Y'),
	(33, 1, 9, 'KS1101-S', '사이즈', 'S (95)', NULL, NULL, 0.00, 'Y'),
	(34, 1, 9, 'KS1101-M', '사이즈', 'M (100)', NULL, NULL, 0.00, 'Y'),
	(35, 1, 9, 'KS1101-L', '사이즈', 'L (105)', NULL, NULL, 0.00, 'Y'),
	(36, 1, 9, 'KS1101-XL', '사이즈', 'XL (110)', NULL, NULL, 0.00, 'Y'),
	(37, 1, 10, 'KS1102-S', '사이즈', 'S (95)', NULL, NULL, 0.00, 'Y'),
	(38, 1, 10, 'KS1102-M', '사이즈', 'M (100)', NULL, NULL, 0.00, 'Y'),
	(39, 1, 10, 'KS1102-L', '사이즈', 'L (105)', NULL, NULL, 0.00, 'Y'),
	(40, 1, 10, 'KS1102-XL', '사이즈', 'XL (110)', NULL, NULL, 0.00, 'Y'),
	(41, 1, 11, 'KS1103-S', '사이즈', 'S (95)', NULL, NULL, 0.00, 'Y'),
	(42, 1, 11, 'KS1103-M', '사이즈', 'M (100)', NULL, NULL, 0.00, 'Y'),
	(43, 1, 11, 'KS1103-L', '사이즈', 'L (105)', NULL, NULL, 0.00, 'Y'),
	(44, 1, 11, 'KS1103-XL', '사이즈', 'XL (110)', NULL, NULL, 0.00, 'Y'),
	(45, 1, 12, 'KS1104-S', '사이즈', 'S (95)', NULL, NULL, 0.00, 'Y'),
	(46, 1, 12, 'KS1104-M', '사이즈', 'M (100)', NULL, NULL, 0.00, 'Y'),
	(47, 1, 12, 'KS1104-L', '사이즈', 'L (105)', NULL, NULL, 0.00, 'Y'),
	(48, 1, 12, 'KS1104-XL', '사이즈', 'XL (110)', NULL, NULL, 0.00, 'Y'),
	(49, 1, 13, 'KP1201-S', '사이즈', 'S (28)', NULL, NULL, 0.00, 'Y'),
	(50, 1, 13, 'KP1201-M', '사이즈', 'M (30)', NULL, NULL, 0.00, 'Y'),
	(51, 1, 13, 'KP1201-L', '사이즈', 'L (32)', NULL, NULL, 0.00, 'Y'),
	(52, 1, 13, 'KP1201-XL', '사이즈', 'XL (34)', NULL, NULL, 0.00, 'Y'),
	(53, 1, 14, 'KP1202-S', '사이즈', 'S (28)', NULL, NULL, 0.00, 'Y'),
	(54, 1, 14, 'KP1202-M', '사이즈', 'M (30)', NULL, NULL, 0.00, 'Y'),
	(55, 1, 14, 'KP1202-L', '사이즈', 'L (32)', NULL, NULL, 0.00, 'Y'),
	(56, 1, 14, 'KP1202-XL', '사이즈', 'XL (34)', NULL, NULL, 0.00, 'Y'),
	(57, 1, 15, 'KP1203-S', '사이즈', 'S (28)', NULL, NULL, 0.00, 'Y'),
	(58, 1, 15, 'KP1203-M', '사이즈', 'M (30)', NULL, NULL, 0.00, 'Y'),
	(59, 1, 15, 'KP1203-L', '사이즈', 'L (32)', NULL, NULL, 0.00, 'Y'),
	(60, 1, 15, 'KP1203-XL', '사이즈', 'XL (34)', NULL, NULL, 0.00, 'Y'),
	(61, 1, 16, 'KP1204-S', '사이즈', 'S (28)', NULL, NULL, 0.00, 'Y'),
	(62, 1, 16, 'KP1204-M', '사이즈', 'M (30)', NULL, NULL, 0.00, 'Y'),
	(63, 1, 16, 'KP1204-L', '사이즈', 'L (32)', NULL, NULL, 0.00, 'Y'),
	(64, 1, 16, 'KP1204-XL', '사이즈', 'XL (34)', NULL, NULL, 0.00, 'Y');

-- 테이블 shopdb3jo.products 구조 내보내기
CREATE TABLE IF NOT EXISTS `products` (
  `product_id` bigint NOT NULL AUTO_INCREMENT COMMENT '상품 식별자',
  `org_id` bigint NOT NULL,
  `seller_user_id` bigint NOT NULL COMMENT '판매자 사용자 식별자',
  `category_id` bigint NOT NULL COMMENT '카테고리 식별자',
  `product_code` varchar(50) NOT NULL COMMENT '상품 코드',
  `product_name` varchar(200) NOT NULL COMMENT '상품명',
  `short_description` varchar(1000) DEFAULT NULL COMMENT '상품 요약 설명',
  `description` longtext COMMENT '상품 상세 설명',
  `regular_price` decimal(15,2) NOT NULL COMMENT '정상 판매가',
  `sale_price` decimal(15,2) NOT NULL COMMENT '할인 판매가',
  `product_status` enum('READY','SALE','SOLD_OUT','STOPPED','DELETED') DEFAULT 'READY' COMMENT '상품 판매 상태',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '등록 일시',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `product_code` (`product_code`),
  KEY `idx_products_name` (`product_name`),
  KEY `idx_products_category` (`category_id`),
  KEY `idx_products_seller` (`seller_user_id`),
  KEY `idx_products_org` (`org_id`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`),
  CONSTRAINT `fk_products_org` FOREIGN KEY (`org_id`) REFERENCES `org_units` (`org_id`),
  CONSTRAINT `fk_products_seller` FOREIGN KEY (`seller_user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.products:~16 rows (대략적) 내보내기
DELETE FROM `products`;
INSERT INTO `products` (`product_id`, `org_id`, `seller_user_id`, `category_id`, `product_code`, `product_name`, `short_description`, `description`, `regular_price`, `sale_price`, `product_status`, `created_at`, `updated_at`) VALUES
	(1, 1, 2, 1, 'KS0917', '미니멀 싱글 코트 _ 브라운', '[유니섹스] 미니멀 싱글 코트 _ 브라운', '클래식한 실루엣과 고급 울 혼방 소재로 제작된 미니멀 싱글 코트입니다.', 1000000.00, 800800.00, 'SALE', '2026-09-01 10:00:00', '2026-09-22 10:00:00'),
	(2, 1, 2, 1, 'KS0918', '미니멀 더블 울 코트 _ 블랙', '[유니섹스] 미니멀 더블 울 코트 _ 블랙', '세련된 더블 브레스티드 디자인과 뛰어난 보온성의 울 코트입니다.', 179000.00, 179000.00, 'SALE', '2026-09-01 10:00:00', '2026-09-22 10:00:00'),
	(3, 1, 2, 1, 'KS0919', '울 블렌드 코트 _ 차콜', '울 블렌드 코트 _ 차콜', '은은한 멜란지 텍스처와 여유로운 핏감의 데일리 울 코트입니다.', 169000.00, 169000.00, 'SALE', '2026-09-01 10:00:00', '2026-09-22 10:00:00'),
	(4, 1, 2, 1, 'KS0920', '클래식 더블 코트 _ 아이보리', '클래식 더블 코트 _ 아이보리', '화사한 아이보리 컬러감의 우아한 클래식 더블 코트입니다.', 169000.00, 169000.00, 'SALE', '2026-09-01 10:00:00', '2026-09-22 10:00:00'),
	(5, 1, 2, 2, 'KT1001', '베이직 라운드 니트 _ 블랙', '베이직 라운드 니트 _ 블랙', '매일 착용하기 좋은 탄탄한 게이지의 베이직 라운드 니트입니다.', 59000.00, 59000.00, 'SALE', '2026-09-01 10:00:00', '2026-09-22 10:00:00'),
	(6, 1, 2, 2, 'KT1002', '베이직 라운드 니트 _ 브라운', '베이직 라운드 니트 _ 브라운', '따뜻한 브라운 톤과 부드러운 터치감을 자랑하는 베이직 라운드 니트입니다.', 59000.00, 59000.00, 'SALE', '2026-09-01 10:00:00', '2026-09-22 10:00:00'),
	(7, 1, 2, 2, 'KT1003', '울 라운드 니트 _ 그레이', '울 라운드 니트 _ 그레이', '고급 울 소재로 제작되어 가볍고 보온성이 뛰어난 라운드 니트입니다.', 69000.00, 69000.00, 'SALE', '2026-09-01 10:00:00', '2026-09-22 10:00:00'),
	(8, 1, 2, 2, 'KT1004', '소프트 라운드 니트 _ 아이보리', '소프트 라운드 니트 _ 아이보리', '크리미한 아이보리 컬러와 포근한 감촉의 소프트 니트웨어입니다.', 69000.00, 69000.00, 'SALE', '2026-09-01 10:00:00', '2026-09-22 10:00:00'),
	(9, 1, 2, 3, 'KS1101', '클래식 코튼 셔츠 _ 화이트', '클래식 코튼 셔츠 _ 화이트', '사계절 내내 단정하게 연출할 수 있는 순면 클래식 셔츠입니다.', 69000.00, 69000.00, 'SALE', '2026-09-01 10:00:00', '2026-09-22 10:00:00'),
	(10, 1, 2, 3, 'KS1102', '클래식 코튼 셔츠 _ 블루', '클래식 코튼 셔츠 _ 블루', '맑은 스카이블루 컬러로 포인트 주기 좋은 클래식 코튼 셔츠입니다.', 69000.00, 69000.00, 'SALE', '2026-09-01 10:00:00', '2026-09-22 10:00:00'),
	(11, 1, 2, 3, 'KS1103', '오버핏 셔츠 _ 네이비', '오버핏 셔츠 _ 네이비', '트렌디한 오버핏 실루엣과 차분한 네이비 컬러의 셔츠입니다.', 79000.00, 79000.00, 'SALE', '2026-09-01 10:00:00', '2026-09-22 10:00:00'),
	(12, 1, 2, 3, 'KS1104', '라이트 셔츠 _ 그레이', '라이트 셔츠 _ 그레이', '가볍고 통기성이 좋은 라이트 그레이 톤의 모던 셔츠입니다.', 69000.00, 69000.00, 'SALE', '2026-09-01 10:00:00', '2026-09-22 10:00:00'),
	(13, 1, 2, 4, 'KP1201', '와이드 슬랙스 _ 블랙', '와이드 슬랙스 _ 블랙', '매끄러운 드레이프성과 핀턱 디테일이 돋보이는 와이드 슬랙스입니다.', 89000.00, 89000.00, 'SALE', '2026-09-01 10:00:00', '2026-09-22 10:00:00'),
	(14, 1, 2, 4, 'KP1202', '와이드 슬랙스 _ 차콜', '와이드 슬랙스 _ 차콜', '포멀하면서도 캐주얼한 무드를 동시에 잡은 차콜 와이드 슬랙스입니다.', 89000.00, 89000.00, 'SALE', '2026-09-01 10:00:00', '2026-09-22 10:00:00'),
	(15, 1, 2, 4, 'KP1203', '데님 와이드 팬츠 _ 블루', '데님 와이드 팬츠 _ 블루', '자연스러운 워싱과 여유로운 핏감의 데일리 와이드 데님 팬츠입니다.', 79000.00, 79000.00, 'SALE', '2026-09-01 10:00:00', '2026-09-22 10:00:00'),
	(16, 1, 2, 4, 'KP1204', '와이드 팬츠 _ 아이보리', '와이드 팬츠 _ 아이보리', '깔끔한 핏과 화사한 아이보리 톤의 코튼 와이드 팬츠입니다.', 89000.00, 89000.00, 'SALE', '2026-09-01 10:00:00', '2026-09-22 10:00:00');

-- 테이블 shopdb3jo.rag_chunks 구조 내보내기
CREATE TABLE IF NOT EXISTS `rag_chunks` (
  `chunk_id` bigint NOT NULL AUTO_INCREMENT COMMENT '청크 식별자',
  `org_id` bigint NOT NULL,
  `document_id` bigint NOT NULL COMMENT '문서 식별자',
  `chunk_no` int NOT NULL COMMENT '청크 순번',
  `chunk_text` longtext NOT NULL COMMENT '청크 텍스트',
  `token_count` int DEFAULT NULL COMMENT '토큰 수',
  `metadata_json` json DEFAULT NULL COMMENT '메타데이터 JSON',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '등록 일시',
  PRIMARY KEY (`chunk_id`),
  UNIQUE KEY `uk_document_chunk` (`document_id`,`chunk_no`),
  KEY `idx_rag_chunks_org` (`org_id`),
  CONSTRAINT `fk_chunk_document` FOREIGN KEY (`document_id`) REFERENCES `rag_documents` (`document_id`),
  CONSTRAINT `fk_rag_chunks_org` FOREIGN KEY (`org_id`) REFERENCES `org_units` (`org_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.rag_chunks:~3 rows (대략적) 내보내기
DELETE FROM `rag_chunks`;
INSERT INTO `rag_chunks` (`chunk_id`, `org_id`, `document_id`, `chunk_no`, `chunk_text`, `token_count`, `metadata_json`, `created_at`) VALUES
	(1, 1, 1, 1, '2024년 환불정책은 상품 수령 후 7일 이내 미개봉 상품의 환불을 허용합니다.', 30, '{"type": "refund", "year": 2024}', '2026-09-09 16:22:32'),
	(2, 1, 2, 1, '스마트 후드티는 오버핏 패션 상품이며 판매가격은 69,000원입니다.', 30, '{"type": "product", "year": 2025}', '2026-09-09 16:22:32'),
	(3, 1, 3, 1, '2026년 환불정책은 상품 수령 후 14일 이내 미개봉 상품의 환불을 허용합니다.', 30, '{"type": "refund", "year": 2026}', '2026-09-09 16:22:32');

-- 테이블 shopdb3jo.rag_document_files 구조 내보내기
CREATE TABLE IF NOT EXISTS `rag_document_files` (
  `rag_document_file_id` bigint NOT NULL AUTO_INCREMENT COMMENT 'RAG 문서 파일 연결 식별자',
  `org_id` bigint NOT NULL,
  `document_id` bigint NOT NULL COMMENT '문서 식별자',
  `file_id` bigint NOT NULL COMMENT '파일 식별자',
  PRIMARY KEY (`rag_document_file_id`),
  KEY `fk_rag_document_file_document` (`document_id`),
  KEY `fk_rag_document_file_asset` (`file_id`),
  KEY `idx_rag_document_files_org` (`org_id`),
  CONSTRAINT `fk_rag_document_file_asset` FOREIGN KEY (`file_id`) REFERENCES `file_assets` (`file_id`),
  CONSTRAINT `fk_rag_document_file_document` FOREIGN KEY (`document_id`) REFERENCES `rag_documents` (`document_id`),
  CONSTRAINT `fk_rag_document_files_org` FOREIGN KEY (`org_id`) REFERENCES `org_units` (`org_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.rag_document_files:~5 rows (대략적) 내보내기
DELETE FROM `rag_document_files`;
INSERT INTO `rag_document_files` (`rag_document_file_id`, `org_id`, `document_id`, `file_id`) VALUES
	(1, 1, 1, 6),
	(2, 1, 1, 7),
	(3, 1, 2, 6),
	(4, 1, 2, 7),
	(5, 1, 3, 7);

-- 테이블 shopdb3jo.rag_documents 구조 내보내기
CREATE TABLE IF NOT EXISTS `rag_documents` (
  `document_id` bigint NOT NULL AUTO_INCREMENT COMMENT '문서 식별자',
  `provider_id` bigint DEFAULT NULL COMMENT 'AI 제공자 식별자',
  `org_id` bigint DEFAULT NULL COMMENT '조직 식별자',
  `document_type` varchar(50) DEFAULT NULL COMMENT '문서 유형',
  `document_name` varchar(255) NOT NULL COMMENT '문서명',
  `source_type` enum('DATABASE','FILE','URL','API','MANUAL') DEFAULT NULL COMMENT '원본 소스 유형',
  `source_uri` varchar(2000) DEFAULT NULL COMMENT '원본 문서 URI',
  `content_text` longtext COMMENT '문서 본문 텍스트',
  `version` varchar(50) DEFAULT NULL COMMENT 'version 컬럼',
  `document_status` enum('READY','PROCESSING','INDEXED','ERROR') DEFAULT 'READY' COMMENT '문서 처리 상태',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '등록 일시',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',
  PRIMARY KEY (`document_id`),
  KEY `fk_rag_provider` (`provider_id`),
  KEY `fk_rag_org` (`org_id`),
  KEY `idx_rag_document_type` (`document_type`),
  CONSTRAINT `fk_rag_org` FOREIGN KEY (`org_id`) REFERENCES `org_units` (`org_id`),
  CONSTRAINT `fk_rag_provider` FOREIGN KEY (`provider_id`) REFERENCES `ai_providers` (`provider_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.rag_documents:~3 rows (대략적) 내보내기
DELETE FROM `rag_documents`;
INSERT INTO `rag_documents` (`document_id`, `provider_id`, `org_id`, `document_type`, `document_name`, `source_type`, `source_uri`, `content_text`, `version`, `document_status`, `created_at`, `updated_at`) VALUES
	(1, 1, 1, 'REFUND_POLICY', '2024 환불정책', 'DATABASE', 'refund_policy:1', '상품 수령 후 7일 이내 미개봉 상품은 환불 가능합니다.', '2024.1', 'INDEXED', '2024-01-01 09:00:00', '2026-09-09 16:22:31'),
	(2, 1, 1, 'PRODUCT_GUIDE', '2025 상품안내', 'DATABASE', 'products', '스마트 후드티 및 스마트 러닝화 상품 안내입니다.', '2025.1', 'INDEXED', '2025-01-10 09:00:00', '2026-09-09 16:22:31'),
	(3, 1, 1, 'REFUND_POLICY', '2026 환불정책', 'DATABASE', 'refund_policy:3', '상품 수령 후 14일 이내 미개봉 상품은 환불 가능합니다.', '2026.1', 'INDEXED', '2026-01-01 09:00:00', '2026-09-09 16:22:31');

-- 테이블 shopdb3jo.rag_embeddings 구조 내보내기
CREATE TABLE IF NOT EXISTS `rag_embeddings` (
  `embedding_id` bigint NOT NULL AUTO_INCREMENT COMMENT '임베딩 식별자',
  `org_id` bigint NOT NULL,
  `chunk_id` bigint NOT NULL COMMENT '청크 식별자',
  `embedding_provider` varchar(50) DEFAULT NULL COMMENT '임베딩 제공자',
  `embedding_model` varchar(200) DEFAULT NULL COMMENT '임베딩 모델명',
  `embedding_dimension` int DEFAULT NULL COMMENT '임베딩 차원 수',
  `embedding_json` json DEFAULT NULL COMMENT '임베딩 벡터 JSON',
  `vector_db_type` varchar(50) DEFAULT NULL COMMENT 'VectorDB 유형',
  `vector_collection` varchar(200) DEFAULT NULL COMMENT 'VectorDB 컬렉션명',
  `vector_external_id` varchar(500) DEFAULT NULL COMMENT 'VectorDB 외부 식별자',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '등록 일시',
  PRIMARY KEY (`embedding_id`),
  KEY `fk_embedding_chunk` (`chunk_id`),
  KEY `idx_rag_embeddings_org` (`org_id`),
  CONSTRAINT `fk_embedding_chunk` FOREIGN KEY (`chunk_id`) REFERENCES `rag_chunks` (`chunk_id`),
  CONSTRAINT `fk_rag_embeddings_org` FOREIGN KEY (`org_id`) REFERENCES `org_units` (`org_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.rag_embeddings:~3 rows (대략적) 내보내기
DELETE FROM `rag_embeddings`;
INSERT INTO `rag_embeddings` (`embedding_id`, `org_id`, `chunk_id`, `embedding_provider`, `embedding_model`, `embedding_dimension`, `embedding_json`, `vector_db_type`, `vector_collection`, `vector_external_id`, `created_at`) VALUES
	(1, 1, 1, 'OPENAI', 'text-embedding-3-small', 1536, NULL, 'QDRANT', 'shop_policy', 'refund-2024-001', '2026-09-09 16:22:32'),
	(2, 1, 2, 'OPENAI', 'text-embedding-3-small', 1536, NULL, 'QDRANT', 'shop_product', 'product-2025-001', '2026-09-09 16:22:32'),
	(3, 1, 3, 'OPENAI', 'text-embedding-3-small', 1536, NULL, 'QDRANT', 'shop_policy', 'refund-2026-001', '2026-09-09 16:22:32');

-- 테이블 shopdb3jo.rag_query_logs 구조 내보내기
CREATE TABLE IF NOT EXISTS `rag_query_logs` (
  `query_log_id` bigint NOT NULL AUTO_INCREMENT COMMENT 'RAG 질의 로그 식별자',
  `org_id` bigint NOT NULL,
  `user_id` bigint DEFAULT NULL COMMENT '사용자 식별자',
  `provider_id` bigint DEFAULT NULL COMMENT 'AI 제공자 식별자',
  `question_text` text COMMENT '질문 내용',
  `response_text` longtext COMMENT 'AI 응답 내용',
  `retrieved_chunk_ids` json DEFAULT NULL COMMENT '검색된 청크 식별자 목록',
  `prompt_tokens` int DEFAULT '0' COMMENT '요청 토큰 수',
  `completion_tokens` int DEFAULT '0' COMMENT '응답 토큰 수',
  `response_time_ms` int DEFAULT NULL COMMENT '응답 소요시간(ms)',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '등록 일시',
  PRIMARY KEY (`query_log_id`),
  KEY `fk_query_user` (`user_id`),
  KEY `fk_query_provider` (`provider_id`),
  KEY `idx_rag_query_logs_org` (`org_id`),
  CONSTRAINT `fk_query_provider` FOREIGN KEY (`provider_id`) REFERENCES `ai_providers` (`provider_id`),
  CONSTRAINT `fk_query_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fk_rag_query_logs_org` FOREIGN KEY (`org_id`) REFERENCES `org_units` (`org_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.rag_query_logs:~5 rows (대략적) 내보내기
DELETE FROM `rag_query_logs`;
INSERT INTO `rag_query_logs` (`query_log_id`, `org_id`, `user_id`, `provider_id`, `question_text`, `response_text`, `retrieved_chunk_ids`, `prompt_tokens`, `completion_tokens`, `response_time_ms`, `created_at`) VALUES
	(1, 2, 4, 1, '2024년 환불 가능 기간을 알려주세요.', '2024년 환불정책에서는 상품 수령 후 7일 이내 미개봉 상품의 환불이 가능합니다.', '[1]', 120, 55, 820, '2026-09-06 10:00:00'),
	(2, 3, 5, 1, '스마트 후드티 상품 정보를 알려주세요.', '스마트 후드티는 오버핏 패션 상품이며 판매가격은 69,000원입니다.', '[2]', 130, 60, 760, '2026-09-06 10:10:00'),
	(3, 1, 6, 2, '2026년 환불 기간은 어떻게 되나요?', '2026년에는 미개봉 상품에 대해 수령 후 14일 이내 환불을 신청할 수 있습니다.', '[3]', 145, 65, 910, '2026-09-06 10:20:00'),
	(4, 1, 7, 3, '2024년과 2026년 환불 정책의 차이를 알려주세요.', '2024년은 7일, 2026년은 14일 이내 미개봉 상품 환불이 가능합니다.', '[1, 3]', 180, 80, 430, '2026-09-06 10:30:00'),
	(5, 1, 8, 1, '상품 정보와 환불 정책을 함께 알려주세요.', '상품 정보와 환불 정책 관련 문서를 함께 검색하여 답변했습니다.', '[1, 2, 3]', 210, 95, 1050, '2026-09-06 10:40:00');

-- 테이블 shopdb3jo.refund_items 구조 내보내기
CREATE TABLE IF NOT EXISTS `refund_items` (
  `refund_item_id` bigint NOT NULL AUTO_INCREMENT COMMENT '환불상품 식별자',
  `org_id` bigint NOT NULL,
  `refund_request_id` bigint NOT NULL COMMENT '환불요청 식별자',
  `order_item_id` bigint NOT NULL COMMENT '주문상품 식별자',
  `refund_quantity` int NOT NULL COMMENT '환불 수량',
  `refund_amount` decimal(15,2) NOT NULL COMMENT '환불 금액',
  PRIMARY KEY (`refund_item_id`),
  KEY `fk_refund_item_request` (`refund_request_id`),
  KEY `fk_refund_item_order_item` (`order_item_id`),
  KEY `idx_refund_items_org` (`org_id`),
  CONSTRAINT `fk_refund_item_order_item` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`order_item_id`),
  CONSTRAINT `fk_refund_item_request` FOREIGN KEY (`refund_request_id`) REFERENCES `refund_requests` (`refund_request_id`),
  CONSTRAINT `fk_refund_items_org` FOREIGN KEY (`org_id`) REFERENCES `org_units` (`org_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.refund_items:~6 rows (대략적) 내보내기
DELETE FROM `refund_items`;
INSERT INTO `refund_items` (`refund_item_id`, `org_id`, `refund_request_id`, `order_item_id`, `refund_quantity`, `refund_amount`) VALUES
	(1, 2, 1, 3, 1, 69000.00),
	(2, 2, 2, 4, 1, 89000.00),
	(3, 2, 3, 5, 1, 59000.00),
	(4, 2, 4, 9, 1, 69000.00),
	(5, 2, 5, 10, 1, 79000.00),
	(6, 2, 6, 11, 1, 69000.00);

-- 테이블 shopdb3jo.refund_policies 구조 내보내기
CREATE TABLE IF NOT EXISTS `refund_policies` (
  `refund_policy_id` bigint NOT NULL AUTO_INCREMENT COMMENT '환불정책 식별자',
  `org_id` bigint DEFAULT NULL COMMENT '조직 식별자',
  `policy_name` varchar(200) NOT NULL COMMENT '정책명',
  `allowed_days` int NOT NULL COMMENT 'allowed_days 컬럼',
  `unopened_refund_yn` char(1) DEFAULT 'Y' COMMENT 'unopened_refund_yn 컬럼',
  `opened_refund_yn` char(1) DEFAULT 'N' COMMENT 'opened_refund_yn 컬럼',
  `defective_refund_yn` char(1) DEFAULT 'Y' COMMENT 'defective_refund_yn 컬럼',
  `shipping_fee_payer` enum('BUYER','SELLER','COMPANY') DEFAULT 'BUYER' COMMENT 'shipping_fee_payer 컬럼',
  `refund_policy_text` longtext COMMENT '주문 시점 환불정책',
  `policy_json` json DEFAULT NULL COMMENT '정책 조건 JSON',
  `effective_from` date NOT NULL COMMENT '적용 시작일',
  `effective_to` date DEFAULT NULL COMMENT '적용 종료일',
  `active_yn` char(1) DEFAULT 'Y' COMMENT '사용 여부(Y/N)',
  PRIMARY KEY (`refund_policy_id`),
  KEY `fk_refund_policy_org` (`org_id`),
  CONSTRAINT `fk_refund_policy_org` FOREIGN KEY (`org_id`) REFERENCES `org_units` (`org_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.refund_policies:~3 rows (대략적) 내보내기
DELETE FROM `refund_policies`;
INSERT INTO `refund_policies` (`refund_policy_id`, `org_id`, `policy_name`, `allowed_days`, `unopened_refund_yn`, `opened_refund_yn`, `defective_refund_yn`, `shipping_fee_payer`, `refund_policy_text`, `policy_json`, `effective_from`, `effective_to`, `active_yn`) VALUES
	(1, 1, '2024 기본 환불정책', 7, 'Y', 'N', 'Y', 'BUYER', '상품 수령 후 7일 이내 미개봉 상품은 환불 가능합니다.', '{"year": 2024, "allowedDays": 7}', '2024-01-01', '2024-12-31', 'Y'),
	(2, 1, '2025 기본 환불정책', 7, 'Y', 'N', 'Y', 'BUYER', '상품 수령 후 7일 이내 환불 가능합니다.', '{"year": 2025, "allowedDays": 7}', '2025-01-01', '2025-12-31', 'Y'),
	(3, 1, '2026 기본 환불정책', 14, 'Y', 'N', 'Y', 'BUYER', '상품 수령 후 14일 이내 미개봉 상품은 환불 가능합니다.', '{"year": 2026, "allowedDays": 14}', '2026-01-01', NULL, 'Y');

-- 테이블 shopdb3jo.refund_requests 구조 내보내기
CREATE TABLE IF NOT EXISTS `refund_requests` (
  `refund_request_id` bigint NOT NULL AUTO_INCREMENT COMMENT '환불요청 식별자',
  `org_id` bigint NOT NULL,
  `order_id` bigint NOT NULL COMMENT '주문 식별자',
  `buyer_user_id` bigint NOT NULL COMMENT '구매자 사용자 식별자',
  `refund_policy_id` bigint DEFAULT NULL COMMENT '환불정책 식별자',
  `refund_reason` varchar(500) DEFAULT NULL COMMENT '환불 사유',
  `requested_amount` decimal(15,2) DEFAULT NULL COMMENT '요청 금액',
  `approved_amount` decimal(15,2) DEFAULT NULL COMMENT '승인 금액',
  `refund_status` enum('REQUESTED','REVIEWING','APPROVED','REJECTED','COMPLETED') DEFAULT 'REQUESTED' COMMENT '환불 처리 상태',
  `requested_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '요청 일시',
  `approved_at` datetime DEFAULT NULL COMMENT '승인 일시',
  `completed_at` datetime DEFAULT NULL COMMENT '완료 일시',
  PRIMARY KEY (`refund_request_id`),
  KEY `fk_refund_order` (`order_id`),
  KEY `fk_refund_user` (`buyer_user_id`),
  KEY `fk_refund_policy` (`refund_policy_id`),
  KEY `idx_refund_requests_org` (`org_id`),
  CONSTRAINT `fk_refund_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  CONSTRAINT `fk_refund_policy` FOREIGN KEY (`refund_policy_id`) REFERENCES `refund_policies` (`refund_policy_id`),
  CONSTRAINT `fk_refund_requests_org` FOREIGN KEY (`org_id`) REFERENCES `org_units` (`org_id`),
  CONSTRAINT `fk_refund_user` FOREIGN KEY (`buyer_user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.refund_requests:~6 rows (대략적) 내보내기
DELETE FROM `refund_requests`;
INSERT INTO `refund_requests` (`refund_request_id`, `org_id`, `order_id`, `buyer_user_id`, `refund_policy_id`, `refund_reason`, `requested_amount`, `approved_amount`, `refund_status`, `requested_at`, `approved_at`, `completed_at`) VALUES
	(1, 2, 3, 4, 1, '배송 전 단순 변심으로 결제 취소 요청합니다.', 72000.00, NULL, 'REQUESTED', '2026-09-18 11:40:00', NULL, NULL),
	(2, 2, 4, 4, 1, '사이즈 재주문을 위해 취소 환불 접수합니다.', 92000.00, 92000.00, 'REVIEWING', '2026-09-18 12:10:00', '2026-09-18 12:20:00', NULL),
	(3, 2, 5, 4, 1, '색상 변경 취소 환불 완료건입니다.', 62000.00, 62000.00, 'COMPLETED', '2026-09-18 13:10:00', '2026-09-18 13:20:00', '2026-09-18 13:30:00'),
	(4, 2, 9, 4, 1, '수령 후 착용해보니 생각했던 핏과 달라 반품 환불 요청합니다.', 72000.00, NULL, 'REQUESTED', '2026-09-19 16:00:00', NULL, NULL),
	(5, 2, 10, 4, 1, '반품 택배 기사님께 전달 완료하였으며 입고 검수 대기중입니다.', 82000.00, 82000.00, 'REVIEWING', '2026-09-19 17:00:00', '2026-09-19 17:30:00', NULL),
	(6, 2, 11, 4, 1, '반품 입고 검수 완료 후 카드 결제 취소 완료되었습니다.', 72000.00, 72000.00, 'COMPLETED', '2026-09-19 18:00:00', '2026-09-19 18:30:00', '2026-09-20 10:00:00');

-- 테이블 shopdb3jo.roles 구조 내보내기
CREATE TABLE IF NOT EXISTS `roles` (
  `role_id` bigint NOT NULL AUTO_INCREMENT COMMENT '권한 식별자',
  `role_code` varchar(30) NOT NULL COMMENT '권한 코드',
  `role_name` varchar(100) NOT NULL COMMENT '권한명',
  `description` varchar(500) DEFAULT NULL COMMENT '상품 상세 설명',
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_code` (`role_code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.roles:~3 rows (대략적) 내보내기
DELETE FROM `roles`;
INSERT INTO `roles` (`role_id`, `role_code`, `role_name`, `description`) VALUES
	(1, 'BUYER', '구매자', '상품 구매 및 주문 조회'),
	(2, 'SELLER', '판매자', '상품 등록 및 주문 관리'),
	(3, 'ADMIN', '관리자', '쇼핑몰 전체 관리');

-- 테이블 shopdb3jo.seller_profiles 구조 내보내기
CREATE TABLE IF NOT EXISTS `seller_profiles` (
  `seller_id` bigint NOT NULL AUTO_INCREMENT COMMENT '판매자 프로필 식별자',
  `org_id` bigint NOT NULL,
  `user_id` bigint NOT NULL COMMENT '사용자 식별자',
  `company_name` varchar(200) NOT NULL COMMENT '회사명',
  `business_number` varchar(30) DEFAULT NULL COMMENT '사업자등록번호',
  `representative_name` varchar(100) DEFAULT NULL COMMENT '대표자명',
  `settlement_bank` varchar(100) DEFAULT NULL COMMENT '정산 은행명',
  `settlement_account` varchar(100) DEFAULT NULL COMMENT '정산 계좌번호',
  `seller_status` varchar(30) DEFAULT 'ACTIVE' COMMENT '판매자 상태',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '등록 일시',
  PRIMARY KEY (`seller_id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_seller_profiles_org` (`org_id`),
  CONSTRAINT `fk_seller_profiles_org` FOREIGN KEY (`org_id`) REFERENCES `org_units` (`org_id`),
  CONSTRAINT `fk_seller_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.seller_profiles:~2 rows (대략적) 내보내기
DELETE FROM `seller_profiles`;
INSERT INTO `seller_profiles` (`seller_id`, `org_id`, `user_id`, `company_name`, `business_number`, `representative_name`, `settlement_bank`, `settlement_account`, `seller_status`, `created_at`) VALUES
	(1, 1, 2, '베이스시즌 전주지사', '201-85-00002', '이전주', '신한은행', '110-123-456789', 'ACTIVE', '2026-09-09 16:22:31'),
	(2, 2, 3, '베이스시즌 부산지사', '301-82-00003', '박부산', '국민은행', '220-456-789012', 'ACTIVE', '2026-09-09 16:22:31');

-- 테이블 shopdb3jo.user_addresses 구조 내보내기
CREATE TABLE IF NOT EXISTS `user_addresses` (
  `address_id` bigint NOT NULL AUTO_INCREMENT COMMENT '주소 식별자',
  `org_id` bigint NOT NULL,
  `user_id` bigint NOT NULL COMMENT '사용자 식별자',
  `address_name` varchar(100) DEFAULT NULL COMMENT '주소명',
  `receiver_name` varchar(100) DEFAULT NULL COMMENT '수령인명',
  `receiver_phone` varchar(30) DEFAULT NULL COMMENT '수령인 전화번호',
  `zipcode` varchar(20) DEFAULT NULL COMMENT '우편번호',
  `address1` varchar(300) DEFAULT NULL COMMENT '기본 주소',
  `address2` varchar(300) DEFAULT NULL COMMENT '상세 주소',
  `default_yn` char(1) DEFAULT 'N' COMMENT '기본값 여부(Y/N)',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '등록 일시',
  PRIMARY KEY (`address_id`),
  KEY `fk_address_user` (`user_id`),
  KEY `idx_user_addresses_org` (`org_id`),
  CONSTRAINT `fk_address_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fk_user_addresses_org` FOREIGN KEY (`org_id`) REFERENCES `org_units` (`org_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.user_addresses:~6 rows (대략적) 내보내기
DELETE FROM `user_addresses`;
INSERT INTO `user_addresses` (`address_id`, `org_id`, `user_id`, `address_name`, `receiver_name`, `receiver_phone`, `zipcode`, `address1`, `address2`, `default_yn`, `created_at`) VALUES
	(1, 1, 4, '기본 배송지', '구매자김', '010-4444-4444', '54999', '전북특별자치도 전주시 완산구 홍산로 123', '101동 1001호', 'Y', '2026-09-10 10:00:00'),
	(2, 1, 4, '회사', '구매자김', '010-4444-4444', '06236', '서울특별시 강남구 테헤란로 200', '베이스빌딩 5층', 'N', '2026-09-10 10:00:00'),
	(3, 1, 5, '자택', '이영희', '010-5555-5555', '48000', '부산광역시 해운대구 센텀중앙로 78', '센텀타워 1204호', 'Y', '2026-09-10 10:00:00'),
	(4, 1, 7, 'Default Address', 'Buyer 96', '010-9696-9696', '06236', '서울특별시 강남구 테헤란로 123', '901호', 'Y', '2026-09-09 17:40:14'),
	(5, 1, 8, '기본 배송지', '홍길동', '010-5555-5555', '06000', '서울특별시 서초구 반포대로 10', '102동 502호', 'Y', '2026-09-09 17:41:35'),
	(6, 1, 10, '자택', '테스터', '010-0000-0001', '06000', '서울특별시 강남구 테헤란로 100', '101호', 'Y', '2026-09-17 08:22:16');

-- 테이블 shopdb3jo.user_roles 구조 내보내기
CREATE TABLE IF NOT EXISTS `user_roles` (
  `user_id` bigint NOT NULL COMMENT '사용자 식별자',
  `org_id` bigint NOT NULL,
  `role_id` bigint NOT NULL COMMENT '권한 식별자',
  `assigned_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '권한 할당 일시',
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `fk_user_roles_role` (`role_id`),
  KEY `idx_user_roles_org` (`org_id`),
  CONSTRAINT `fk_user_roles_org` FOREIGN KEY (`org_id`) REFERENCES `org_units` (`org_id`),
  CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`),
  CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.user_roles:~12 rows (대략적) 내보내기
DELETE FROM `user_roles`;
INSERT INTO `user_roles` (`user_id`, `org_id`, `role_id`, `assigned_at`) VALUES
	(1, 1, 3, '2026-09-09 16:22:31'),
	(2, 1, 1, '2026-09-09 16:22:31'),
	(2, 1, 2, '2026-09-09 16:22:31'),
	(3, 2, 1, '2026-09-09 16:22:31'),
	(3, 2, 2, '2026-09-09 16:22:31'),
	(4, 2, 1, '2026-09-09 16:22:31'),
	(5, 3, 1, '2026-09-09 16:22:31'),
	(6, 1, 1, '2026-09-09 16:22:31'),
	(7, 1, 1, '2026-09-09 17:40:14'),
	(8, 1, 1, '2026-09-09 17:41:35'),
	(10, 1, 1, '2026-09-17 17:22:15'),
	(15, 1, 1, '2026-09-19 16:57:00');

-- 테이블 shopdb3jo.users 구조 내보내기
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` bigint NOT NULL AUTO_INCREMENT COMMENT '사용자 식별자',
  `org_id` bigint DEFAULT NULL COMMENT '조직 식별자',
  `login_id` varchar(100) NOT NULL COMMENT '로그인 아이디',
  `password_hash` varchar(255) NOT NULL COMMENT '암호화된 비밀번호',
  `user_name` varchar(100) NOT NULL COMMENT '사용자명',
  `email` varchar(255) NOT NULL COMMENT '이메일 주소',
  `phone` varchar(30) DEFAULT NULL COMMENT '전화번호',
  `user_status` enum('ACTIVE','INACTIVE','SUSPENDED','WITHDRAWN') DEFAULT 'ACTIVE' COMMENT '사용자 계정 상태',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '등록 일시',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `login_id` (`login_id`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_users_org` (`org_id`),
  CONSTRAINT `fk_users_org` FOREIGN KEY (`org_id`) REFERENCES `org_units` (`org_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 테이블 데이터 shopdb3jo.users:~10 rows (대략적) 내보내기
DELETE FROM `users`;
INSERT INTO `users` (`user_id`, `org_id`, `login_id`, `password_hash`, `user_name`, `email`, `phone`, `user_status`, `created_at`, `updated_at`) VALUES
	(1, 1, 'admin01', '$pbkdf2-sha256$29000$s9Z6j9HamxOCMOYco3TOeQ$wkwu56Hb8oSActS/Z2IPDQfV1sRKATUw3i73M.8bLMo', '최고관리자', 'admin@baseason.co.kr', '010-1111-1111', 'ACTIVE', '2024-01-05 10:00:00', '2026-09-22 10:00:00'),
	(2, 1, 'seller01', '$pbkdf2-sha256$29000$s9Z6j9HamxOCMOYco3TOeQ$wkwu56Hb8oSActS/Z2IPDQfV1sRKATUw3i73M.8bLMo', '전주지사관리자', 'seller01@baseason.co.kr', '010-2222-2222', 'ACTIVE', '2024-02-01 10:00:00', '2026-09-22 10:00:00'),
	(3, 2, 'seller02', '$pbkdf2-sha256$29000$s9Z6j9HamxOCMOYco3TOeQ$wkwu56Hb8oSActS/Z2IPDQfV1sRKATUw3i73M.8bLMo', '부산지사관리자', 'seller02@baseason.co.kr', '010-3333-3333', 'ACTIVE', '2025-01-10 10:00:00', '2026-09-22 10:00:00'),
	(4, 2, 'buyer01', '$pbkdf2-sha256$29000$cW4NIYTwHmMsBSDkXGuNcQ$tc9ggrAxK.INErqBag1rqS.KgrkfBszsyym844k8eMQ', '구매자김', 'buyer01@gmail.com', '010-4444-4444', 'ACTIVE', '2024-03-01 10:00:00', '2026-09-22 10:00:00'),
	(5, 3, 'buyer02', '$pbkdf2-sha256$29000$cW4NIYTwHmMsBSDkXGuNcQ$tc9ggrAxK.INErqBag1rqS.KgrkfBszsyym844k8eMQ', '이영희', 'buyer02@gmail.com', '010-5555-5555', 'ACTIVE', '2025-05-01 10:00:00', '2026-09-22 10:00:00'),
	(6, 1, 'buyer03', '$pbkdf2-sha256$29000$cW4NIYTwHmMsBSDkXGuNcQ$tc9ggrAxK.INErqBag1rqS.KgrkfBszsyym844k8eMQ', '박민수', 'buyer03@gmail.com', '010-6666-6666', 'ACTIVE', '2026-01-10 10:00:00', '2026-09-22 10:00:00'),
	(7, 1, 'buyer96', '$pbkdf2-sha256$29000$cW4NIYTwHmMsBSDkXGuNcQ$tc9ggrAxK.INErqBag1rqS.KgrkfBszsyym844k8eMQ', 'Buyer 96', 'buyer96@test.com', '010-9696-9696', 'ACTIVE', '2026-09-09 08:40:15', '2026-09-22 10:00:00'),
	(8, 1, 'buyer5', '$pbkdf2-sha256$29000$cW4NIYTwHmMsBSDkXGuNcQ$tc9ggrAxK.INErqBag1rqS.KgrkfBszsyym844k8eMQ', '홍길동', 'test5@test.com', '010-5555-5555', 'ACTIVE', '2026-09-09 08:41:35', '2026-09-22 10:00:00'),
	(10, 1, 'tester01', '$pbkdf2-sha256$29000$cW4NIYTwHmMsBSDkXGuNcQ$tc9ggrAxK.INErqBag1rqS.KgrkfBszsyym844k8eMQ', '테스터', 'tester01@example.com', '010-0000-0001', 'ACTIVE', '2026-09-17 08:22:16', '2026-09-22 10:00:00'),
	(15, 1, 'some', '$pbkdf2-sha256$29000$cW4NIYTwHmMsBSDkXGuNcQ$tc9ggrAxK.INErqBag1rqS.KgrkfBszsyym844k8eMQ', '송준가', 'wnsrtdj@naver.com', '010-9999-9999', 'ACTIVE', '2026-09-19 07:57:00', '2026-09-22 10:00:00');

-- 뷰 shopdb3jo.v_branch_purchase_order_status 구조 내보내기
-- VIEW 종속성 오류를 극복하기 위해 임시 테이블을 생성합니다.
CREATE TABLE `v_branch_purchase_order_status` (
	`branch_order_id` BIGINT NOT NULL COMMENT '지사 발주 식별자',
	`branch_order_no` VARCHAR(1) NOT NULL COMMENT '지사 발주 번호' COLLATE 'utf8mb4_0900_ai_ci',
	`branch_org_id` BIGINT NOT NULL COMMENT '조직 식별자',
	`branch_name` VARCHAR(1) NOT NULL COMMENT '조직명' COLLATE 'utf8mb4_0900_ai_ci',
	`head_org_id` BIGINT NOT NULL COMMENT '본사 조직 식별자',
	`head_name` VARCHAR(1) NOT NULL COMMENT '조직명' COLLATE 'utf8mb4_0900_ai_ci',
	`order_status` ENUM('WAITING_APPROVAL','SHIPPING','RECEIVED') NOT NULL COMMENT '주문 상태' COLLATE 'utf8mb4_0900_ai_ci',
	`order_status_name` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`product_id` BIGINT NOT NULL COMMENT '상품 식별자',
	`product_name` VARCHAR(1) NOT NULL COMMENT '상품명' COLLATE 'utf8mb4_0900_ai_ci',
	`variant_id` BIGINT NOT NULL COMMENT '상품 옵션 식별자',
	`sku_code` VARCHAR(1) NOT NULL COMMENT '재고관리단위(SKU) 코드' COLLATE 'utf8mb4_0900_ai_ci',
	`order_quantity` INT NOT NULL COMMENT '발주 수량',
	`approved_quantity` INT NULL COMMENT '승인 수량',
	`received_quantity` INT NOT NULL COMMENT '입고 수량',
	`unit_price` DECIMAL(15,2) NOT NULL COMMENT '단가',
	`item_amount` DECIMAL(15,2) NOT NULL COMMENT '항목 금액',
	`requested_at` DATETIME NOT NULL COMMENT '요청 일시',
	`approved_at` DATETIME NULL COMMENT '승인 일시',
	`shipped_at` DATETIME NULL COMMENT '출고 일시',
	`received_at` DATETIME NULL COMMENT '입고 완료 일시'
);

-- 뷰 shopdb3jo.v_customer_delivery_status 구조 내보내기
-- VIEW 종속성 오류를 극복하기 위해 임시 테이블을 생성합니다.
CREATE TABLE `v_customer_delivery_status` (
	`order_id` BIGINT NOT NULL COMMENT '주문 식별자',
	`order_no` VARCHAR(1) NOT NULL COMMENT '주문 번호' COLLATE 'utf8mb4_0900_ai_ci',
	`org_id` BIGINT NOT NULL COMMENT '조직 식별자',
	`org_name` VARCHAR(1) NOT NULL COMMENT '조직명' COLLATE 'utf8mb4_0900_ai_ci',
	`buyer_user_id` BIGINT NOT NULL COMMENT '구매자 사용자 식별자',
	`buyer_name` VARCHAR(1) NOT NULL COMMENT '사용자명' COLLATE 'utf8mb4_0900_ai_ci',
	`order_status` VARCHAR(1) NULL COMMENT '주문 상태' COLLATE 'utf8mb4_0900_ai_ci',
	`process_status` VARCHAR(1) NULL COLLATE 'utf8mb4_0900_ai_ci',
	`process_status_name` VARCHAR(1) NULL COLLATE 'utf8mb4_0900_ai_ci',
	`shipment_no` VARCHAR(1) NULL COMMENT '배송 번호' COLLATE 'utf8mb4_0900_ai_ci',
	`shipment_status` ENUM('PREPARING_SHIPMENT','SHIPPING','DELIVERED') NULL COMMENT '배송 상태' COLLATE 'utf8mb4_0900_ai_ci',
	`carrier_name` VARCHAR(1) NULL COMMENT '택배사명' COLLATE 'utf8mb4_0900_ai_ci',
	`tracking_number` VARCHAR(1) NULL COMMENT '운송장 번호' COLLATE 'utf8mb4_0900_ai_ci',
	`total_amount` DECIMAL(15,2) NOT NULL COMMENT '최종 결제 금액',
	`ordered_at` DATETIME NULL COMMENT '주문 일시',
	`shipped_at` DATETIME NULL COMMENT '출고 일시',
	`delivered_at` DATETIME NULL COMMENT '배송 완료 일시'
);

-- 뷰 shopdb3jo.v_hq_inventory_status 구조 내보내기
-- VIEW 종속성 오류를 극복하기 위해 임시 테이블을 생성합니다.
CREATE TABLE `v_hq_inventory_status` (
	`hg_inventory_id` BIGINT NOT NULL COMMENT '본사 재고 식별자',
	`org_id` BIGINT NOT NULL COMMENT '조직 식별자',
	`org_name` VARCHAR(1) NOT NULL COMMENT '조직명' COLLATE 'utf8mb4_0900_ai_ci',
	`product_id` BIGINT NOT NULL COMMENT '상품 식별자',
	`product_code` VARCHAR(1) NOT NULL COMMENT '상품 코드' COLLATE 'utf8mb4_0900_ai_ci',
	`product_name` VARCHAR(1) NOT NULL COMMENT '상품명' COLLATE 'utf8mb4_0900_ai_ci',
	`variant_id` BIGINT NOT NULL COMMENT '상품 옵션 식별자',
	`sku_code` VARCHAR(1) NOT NULL COMMENT '재고관리단위(SKU) 코드' COLLATE 'utf8mb4_0900_ai_ci',
	`option_name1` VARCHAR(1) NULL COMMENT '상품 옵션명 1' COLLATE 'utf8mb4_0900_ai_ci',
	`option_value1` VARCHAR(1) NULL COMMENT '상품 옵션값 1' COLLATE 'utf8mb4_0900_ai_ci',
	`option_name2` VARCHAR(1) NULL COMMENT '상품 옵션명 2' COLLATE 'utf8mb4_0900_ai_ci',
	`option_value2` VARCHAR(1) NULL COMMENT '상품 옵션값 2' COLLATE 'utf8mb4_0900_ai_ci',
	`stock_quantity` INT NOT NULL COMMENT '현재 재고 수량',
	`reserved_quantity` INT NOT NULL COMMENT '예약 재고 수량',
	`safety_stock` INT NOT NULL COMMENT '안전 재고 수량',
	`available_quantity` BIGINT NOT NULL,
	`updated_at` DATETIME NOT NULL COMMENT '수정 일시'
);

-- 임시 테이블을 제거하고 최종 VIEW 구조를 생성
DROP TABLE IF EXISTS `v_branch_purchase_order_status`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `v_branch_purchase_order_status` AS select `bpo`.`branch_order_id` AS `branch_order_id`,`bpo`.`branch_order_no` AS `branch_order_no`,`bpo`.`org_id` AS `branch_org_id`,`branch`.`org_name` AS `branch_name`,`bpo`.`head_org_id` AS `head_org_id`,`head`.`org_name` AS `head_name`,`bpo`.`order_status` AS `order_status`,(case `bpo`.`order_status` when 'WAITING_APPROVAL' then '지사승인대기' when 'SHIPPING' then '배송중' when 'RECEIVED' then '입고완료' else `bpo`.`order_status` end) AS `order_status_name`,`bpoi`.`product_id` AS `product_id`,`p`.`product_name` AS `product_name`,`bpoi`.`variant_id` AS `variant_id`,`pv`.`sku_code` AS `sku_code`,`bpoi`.`order_quantity` AS `order_quantity`,`bpoi`.`approved_quantity` AS `approved_quantity`,`bpoi`.`received_quantity` AS `received_quantity`,`bpoi`.`unit_price` AS `unit_price`,`bpoi`.`item_amount` AS `item_amount`,`bpo`.`requested_at` AS `requested_at`,`bpo`.`approved_at` AS `approved_at`,`bpo`.`shipped_at` AS `shipped_at`,`bpo`.`received_at` AS `received_at` from (((((`branch_purchase_orders` `bpo` join `org_units` `branch` on((`bpo`.`org_id` = `branch`.`org_id`))) join `org_units` `head` on((`bpo`.`head_org_id` = `head`.`org_id`))) join `branch_purchase_order_items` `bpoi` on((`bpo`.`branch_order_id` = `bpoi`.`branch_order_id`))) join `products` `p` on((`bpoi`.`product_id` = `p`.`product_id`))) join `product_variants` `pv` on((`bpoi`.`variant_id` = `pv`.`variant_id`)))
;

-- 임시 테이블을 제거하고 최종 VIEW 구조를 생성
DROP TABLE IF EXISTS `v_customer_delivery_status`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `v_customer_delivery_status` AS select `o`.`order_id` AS `order_id`,`o`.`order_no` AS `order_no`,`o`.`org_id` AS `org_id`,`ou`.`org_name` AS `org_name`,`o`.`buyer_user_id` AS `buyer_user_id`,`u`.`user_name` AS `buyer_name`,`o`.`order_status` AS `order_status`,`o`.`process_status` AS `process_status`,(case when (`o`.`process_status` = 'PAYMENT_COMPLETED') then '결제완료' when (`o`.`process_status` = 'PREPARING_SHIPMENT') then '배송준비' when (`o`.`process_status` = 'SHIPPING') then '배송중' when (`o`.`process_status` = 'DELIVERED') then '배송완료' when (`o`.`process_status` = 'REFUND_WAITING') then '환불대기' when (`o`.`process_status` = 'REFUND_PROCESSING') then '환불처리중' when (`o`.`process_status` = 'REFUND_COMPLETED') then '환불처리완료' else `o`.`process_status` end) AS `process_status_name`,`cs`.`shipment_no` AS `shipment_no`,`cs`.`shipment_status` AS `shipment_status`,`cs`.`carrier_name` AS `carrier_name`,`cs`.`tracking_number` AS `tracking_number`,`o`.`total_amount` AS `total_amount`,`o`.`ordered_at` AS `ordered_at`,`cs`.`shipped_at` AS `shipped_at`,`cs`.`delivered_at` AS `delivered_at` from (((`orders` `o` join `org_units` `ou` on((`o`.`org_id` = `ou`.`org_id`))) join `users` `u` on((`o`.`buyer_user_id` = `u`.`user_id`))) left join `customer_shipments` `cs` on((`o`.`order_id` = `cs`.`order_id`)))
;

-- 임시 테이블을 제거하고 최종 VIEW 구조를 생성
DROP TABLE IF EXISTS `v_hq_inventory_status`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `v_hq_inventory_status` AS select `hi`.`hg_inventory_id` AS `hg_inventory_id`,`hi`.`org_id` AS `org_id`,`ou`.`org_name` AS `org_name`,`p`.`product_id` AS `product_id`,`p`.`product_code` AS `product_code`,`p`.`product_name` AS `product_name`,`pv`.`variant_id` AS `variant_id`,`pv`.`sku_code` AS `sku_code`,`pv`.`option_name1` AS `option_name1`,`pv`.`option_value1` AS `option_value1`,`pv`.`option_name2` AS `option_name2`,`pv`.`option_value2` AS `option_value2`,`hi`.`stock_quantity` AS `stock_quantity`,`hi`.`reserved_quantity` AS `reserved_quantity`,`hi`.`safety_stock` AS `safety_stock`,(`hi`.`stock_quantity` - `hi`.`reserved_quantity`) AS `available_quantity`,`hi`.`updated_at` AS `updated_at` from (((`hg_inventory` `hi` join `org_units` `ou` on((`hi`.`org_id` = `ou`.`org_id`))) join `products` `p` on((`hi`.`product_id` = `p`.`product_id`))) join `product_variants` `pv` on((`hi`.`variant_id` = `pv`.`variant_id`)))
;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
