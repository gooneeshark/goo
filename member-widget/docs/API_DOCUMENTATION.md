# API Documentation - Member Widget System

## ภาพรวม

เอกสารนี้อธิบาย REST API endpoints ทั้งหมดสำหรับระบบ Member Widget รวมถึงการจัดการสมาชิก, ระบบ Wallet, ระบบคะแนน, และการยืนยันตัวตน

## Base URL

```
Production: https://api.memberwidget.com/v1
Development: http://localhost:3000/api/v1
```

## Authentication

ระบบใช้ JWT tokens สำหรับการยืนยันตัวตน

### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## API Endpoints

### 1. Authentication Endpoints

#### POST /auth/login
เข้าสู่ระบบด้วยอีเมลและรหัสผ่าน

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "profile": {
        "first_name": "John",
        "last_name": "Doe",
        "verification_level": 2
      }
    },
    "token": "jwt_token_here",
    "expires_in": 3600
  }
}
```

#### POST /auth/register
สมัครสมาชิกใหม่

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe"
}
```

#### POST /auth/logout
ออกจากระบบ

**Headers:** `Authorization: Bearer <token>`

#### GET /auth/profile
ดึงข้อมูลโปรไฟล์ผู้ใช้ปัจจุบัน

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "profile": {
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+66812345678",
      "verification_level": 2,
      "kyc_status": "approved"
    },
    "wallet": {
      "balance": 1500.00,
      "currency": "THB"
    },
    "points": {
      "total_points": 2500,
      "available_points": 2500
    }
  }
}
```

### 2. Member Management Endpoints

#### GET /members
ดึงรายชื่อสมาชิกทั้งหมด (Admin only)

**Query Parameters:**
- `page`: หน้าที่ต้องการ (default: 1)
- `limit`: จำนวนรายการต่อหน้า (default: 20)
- `search`: ค้นหาด้วยอีเมลหรือชื่อ
- `verification_level`: กรองตามระดับการยืนยัน

**Response (200):**
```json
{
  "success": true,
  "data": {
    "members": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "profile": {
          "first_name": "John",
          "last_name": "Doe",
          "verification_level": 2
        },
        "created_at": "2024-01-01T00:00:00Z",
        "last_login": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 100,
      "items_per_page": 20
    }
  }
}
```

#### POST /members
สร้างสมาชิกใหม่ (Admin only)

#### PUT /members/:id
อัปเดตข้อมูลสมาชิก

#### DELETE /members/:id
ลบสมาชิก (Admin only)

### 3. Wallet System Endpoints

#### GET /wallet/:userId
ดึงข้อมูล wallet ของผู้ใช้

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "balance": 1500.00,
    "currency": "THB",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### POST /wallet/transaction
สร้างธุรกรรมใหม่

**Request Body:**
```json
{
  "wallet_id": "uuid",
  "type": "deposit",
  "amount": 500.00,
  "description": "Top up via credit card",
  "reference_id": "TXN123456"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "wallet_id": "uuid",
    "type": "deposit",
    "amount": 500.00,
    "description": "Top up via credit card",
    "reference_id": "TXN123456",
    "status": "completed",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /wallet/history/:userId
ดึงประวัติธุรกรรม

**Query Parameters:**
- `page`: หน้าที่ต้องการ
- `limit`: จำนวนรายการต่อหน้า
- `type`: ประเภทธุรกรรม (deposit, withdraw, transfer, reward)
- `from_date`: วันที่เริ่มต้น
- `to_date`: วันที่สิ้นสุด

### 4. Point System Endpoints

#### GET /points/:userId
ดึงข้อมูลคะแนนของผู้ใช้

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "total_points": 2500,
    "available_points": 2500,
    "lifetime_earned": 5000,
    "recent_transactions": [
      {
        "id": "uuid",
        "type": "earn",
        "points": 100,
        "source": "purchase",
        "description": "Purchase reward",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### POST /points/earn
เพิ่มคะแนนให้ผู้ใช้

**Request Body:**
```json
{
  "user_id": "uuid",
  "points": 100,
  "source": "purchase",
  "description": "Purchase reward",
  "expires_at": "2025-01-15T10:30:00Z"
}
```

#### POST /points/redeem
แลกคะแนน

**Request Body:**
```json
{
  "user_id": "uuid",
  "points": 500,
  "description": "Redeem for discount coupon"
}
```

### 5. User Verification Endpoints

#### POST /verification/document
อัปโหลดเอกสารสำหรับการยืนยันตัวตน

**Request Body (multipart/form-data):**
```
document_type: "id_card"
document_file: <file>
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "document_type": "id_card",
    "document_url": "https://storage.example.com/documents/uuid.jpg",
    "verification_status": "pending",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /verification/status/:userId
ดึงสถานะการยืนยันตัวตน

#### PUT /verification/approve/:documentId
อนุมัติการยืนยันเอกสาร (Admin only)

### 6. Widget Configuration Endpoints

#### GET /widget/config
ดึงการตั้งค่า widget

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Default Widget",
    "theme": "hacker",
    "position": "bottom-right",
    "colors": {
      "primary": "#00ff00",
      "background": "#000000",
      "text": "#ffffff"
    },
    "size": "medium",
    "features": {
      "wallet_display": true,
      "points_display": true,
      "profile_edit": true
    },
    "domains": ["example.com", "*.example.com"]
  }
}
```

#### PUT /widget/config
อัปเดตการตั้งค่า widget (Admin only)

### 7. Session Tracking Endpoints

#### GET /sessions/:userId
ดึงประวัติ session ของผู้ใช้

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "uuid",
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0...",
        "country": "TH",
        "city": "Bangkok",
        "device_type": "desktop",
        "browser": "Chrome",
        "os": "Windows",
        "login_at": "2024-01-15T10:30:00Z",
        "logout_at": null,
        "is_active": true
      }
    ]
  }
}
```

## Error Responses

### Error Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": ["Email is required"],
      "password": ["Password must be at least 8 characters"]
    }
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` (400): ข้อมูลไม่ถูกต้อง
- `UNAUTHORIZED` (401): ไม่ได้รับอนุญาต
- `FORBIDDEN` (403): ไม่มีสิทธิ์เข้าถึง
- `NOT_FOUND` (404): ไม่พบข้อมูล
- `CONFLICT` (409): ข้อมูลซ้ำ
- `INTERNAL_ERROR` (500): ข้อผิดพลาดภายในระบบ

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute per IP
- **General API**: 100 requests per minute per user
- **File upload**: 10 requests per minute per user

## Webhook Events

### User Events
- `user.registered`: เมื่อมีผู้ใช้สมัครสมาชิกใหม่
- `user.verified`: เมื่อผู้ใช้ผ่านการยืนยันตัวตน
- `user.login`: เมื่อผู้ใช้เข้าสู่ระบบ

### Wallet Events
- `wallet.transaction.created`: เมื่อมีธุรกรรมใหม่
- `wallet.balance.updated`: เมื่อยอดเงินเปลี่ยนแปลง

### Point Events
- `points.earned`: เมื่อผู้ใช้ได้รับคะแนน
- `points.redeemed`: เมื่อผู้ใช้แลกคะแนน

## SDK และ Libraries

### JavaScript SDK
```javascript
import MemberWidgetAPI from '@memberwidget/js-sdk';

const api = new MemberWidgetAPI({
  apiUrl: 'https://api.memberwidget.com/v1',
  apiKey: 'your-api-key'
});

// Login
const result = await api.auth.login('user@example.com', 'password');
```

### Widget Integration
```html
<script src="https://cdn.memberwidget.com/widget/v1/member-widget.js"></script>
<script>
  MemberWidget.init({
    containerId: 'member-widget',
    apiUrl: 'https://api.memberwidget.com/v1',
    theme: 'hacker',
    position: 'bottom-right'
  });
</script>
```