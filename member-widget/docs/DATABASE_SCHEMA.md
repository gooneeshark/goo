# Database Schema Documentation - Member Widget System

## ภาพรวม

เอกสารนี้อธิบาย database schema สำหรับระบบ Member Widget รวมถึงตารางสำหรับระบบ Wallet, Point System, และ User Verification

## Database Structure

### ER Diagram Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   auth.users    │    │  user_profiles  │    │    wallets      │
│                 │    │   _extended     │    │                 │
│ - id (PK)       │◄──►│                 │    │ - id (PK)       │
│ - email         │    │ - user_id (FK)  │    │ - user_id (FK)  │
│ - created_at    │    │ - first_name    │    │ - balance       │
└─────────────────┘    │ - last_name     │    │ - currency      │
                       │ - phone         │    └─────────────────┘
                       │ - verification  │             │
                       │   _level        │             │
                       └─────────────────┘             │
                                │                      │
                                │                      ▼
┌─────────────────┐            │            ┌─────────────────┐
│  user_sessions  │            │            │ wallet_trans    │
│                 │            │            │   actions       │
│ - id (PK)       │            │            │                 │
│ - user_id (FK)  │◄───────────┘            │ - id (PK)       │
│ - ip_address    │                         │ - wallet_id(FK) │
│ - user_agent    │                         │ - type          │
│ - device_type   │                         │ - amount        │
│ - browser       │                         │ - status        │
│ - login_at      │                         └─────────────────┘
└─────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  user_points    │    │ point_trans     │    │ widget_config   │
│                 │    │   actions       │    │   urations      │
│ - id (PK)       │    │                 │    │                 │
│ - user_id (FK)  │    │ - id (PK)       │    │ - id (PK)       │
│ - total_points  │◄──►│ - user_id (FK)  │    │ - name          │
│ - available     │    │ - type          │    │ - theme         │
│ - lifetime      │    │ - points        │    │ - position      │
└─────────────────┘    │ - source        │    │ - colors        │
                       │ - expires_at    │    │ - features      │
                       └─────────────────┘    └─────────────────┘
```

## Core Tables

### 1. auth.users (Supabase Built-in)

ตารางผู้ใช้หลักของ Supabase

```sql
-- ตารางนี้มาจาก Supabase โดยอัตโนมัติ
CREATE TABLE auth.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    encrypted_password VARCHAR(255),
    email_confirmed_at TIMESTAMP WITH TIME ZONE,
    invited_at TIMESTAMP WITH TIME ZONE,
    confirmation_token VARCHAR(255),
    confirmation_sent_at TIMESTAMP WITH TIME ZONE,
    recovery_token VARCHAR(255),
    recovery_sent_at TIMESTAMP WITH TIME ZONE,
    email_change_token_new VARCHAR(255),
    email_change VARCHAR(255),
    email_change_sent_at TIMESTAMP WITH TIME ZONE,
    last_sign_in_at TIMESTAMP WITH TIME ZONE,
    raw_app_meta_data JSONB,
    raw_user_meta_data JSONB,
    is_super_admin BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. user_profiles_extended

ข้อมูลโปรไฟล์ผู้ใช้เพิ่มเติม

```sql
CREATE TABLE user_profiles_extended (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(2) DEFAULT 'TH',
    postal_code VARCHAR(20),
    
    -- Verification levels
    verification_level INTEGER DEFAULT 0, -- 0: unverified, 1: email, 2: phone, 3: document
    kyc_status VARCHAR(20) DEFAULT 'none', -- 'none', 'pending', 'approved', 'rejected'
    
    -- User preferences
    preferences JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_verification_level CHECK (verification_level >= 0 AND verification_level <= 3),
    CONSTRAINT valid_kyc_status CHECK (kyc_status IN ('none', 'pending', 'approved', 'rejected')),
    CONSTRAINT valid_country CHECK (LENGTH(country) = 2)
);

-- Indexes
CREATE INDEX idx_user_profiles_extended_user_id ON user_profiles_extended(user_id);
CREATE INDEX idx_user_profiles_extended_verification_level ON user_profiles_extended(verification_level);
CREATE INDEX idx_user_profiles_extended_kyc_status ON user_profiles_extended(kyc_status);
```

## Wallet System Tables

### 3. wallets

ตาราง wallet หลักสำหรับเก็บยอดเงิน

```sql
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    balance DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'THB',
    
    -- Wallet status
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'suspended', 'closed'
    
    -- Limits
    daily_limit DECIMAL(15,2) DEFAULT 50000.00,
    monthly_limit DECIMAL(15,2) DEFAULT 500000.00,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT positive_balance CHECK (balance >= 0),
    CONSTRAINT valid_currency CHECK (LENGTH(currency) = 3),
    CONSTRAINT valid_status CHECK (status IN ('active', 'suspended', 'closed')),
    CONSTRAINT positive_limits CHECK (daily_limit >= 0 AND monthly_limit >= 0),
    
    -- Unique constraint
    UNIQUE(user_id, currency)
);

-- Indexes
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_status ON wallets(status);
CREATE INDEX idx_wallets_currency ON wallets(currency);
```

### 4. wallet_transactions

ตารางธุรกรรม wallet

```sql
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
    
    -- Transaction details
    type VARCHAR(20) NOT NULL, -- 'deposit', 'withdraw', 'transfer_in', 'transfer_out', 'reward', 'refund'
    amount DECIMAL(15,2) NOT NULL,
    fee DECIMAL(15,2) DEFAULT 0.00,
    net_amount DECIMAL(15,2) GENERATED ALWAYS AS (
        CASE 
            WHEN type IN ('deposit', 'transfer_in', 'reward', 'refund') THEN amount - fee
            ELSE -(amount + fee)
        END
    ) STORED,
    
    -- Reference information
    reference_id VARCHAR(100),
    description TEXT,
    external_transaction_id VARCHAR(255),
    
    -- Related wallet (for transfers)
    related_wallet_id UUID REFERENCES wallets(id),
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'cancelled'
    
    -- Balance tracking
    balance_before DECIMAL(15,2) NOT NULL,
    balance_after DECIMAL(15,2) NOT NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_transaction_type CHECK (type IN ('deposit', 'withdraw', 'transfer_in', 'transfer_out', 'reward', 'refund')),
    CONSTRAINT positive_amount CHECK (amount > 0),
    CONSTRAINT non_negative_fee CHECK (fee >= 0),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    CONSTRAINT positive_balances CHECK (balance_before >= 0 AND balance_after >= 0)
);

-- Indexes
CREATE INDEX idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_type ON wallet_transactions(type);
CREATE INDEX idx_wallet_transactions_status ON wallet_transactions(status);
CREATE INDEX idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);
CREATE INDEX idx_wallet_transactions_reference_id ON wallet_transactions(reference_id);
CREATE INDEX idx_wallet_transactions_external_id ON wallet_transactions(external_transaction_id);
```

## Point System Tables

### 5. user_points

ตารางคะแนนผู้ใช้

```sql
CREATE TABLE user_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Point balances
    total_points INTEGER DEFAULT 0,
    available_points INTEGER DEFAULT 0,
    pending_points INTEGER DEFAULT 0,
    lifetime_earned INTEGER DEFAULT 0,
    lifetime_redeemed INTEGER DEFAULT 0,
    
    -- Point tier/level
    tier_level INTEGER DEFAULT 1,
    tier_name VARCHAR(50) DEFAULT 'Bronze',
    
    -- Expiration tracking
    next_expiry_date TIMESTAMP WITH TIME ZONE,
    next_expiry_points INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT non_negative_points CHECK (
        total_points >= 0 AND 
        available_points >= 0 AND 
        pending_points >= 0 AND
        lifetime_earned >= 0 AND
        lifetime_redeemed >= 0
    ),
    CONSTRAINT valid_tier_level CHECK (tier_level >= 1),
    CONSTRAINT points_consistency CHECK (total_points = available_points + pending_points),
    
    -- Unique constraint
    UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_user_points_user_id ON user_points(user_id);
CREATE INDEX idx_user_points_tier_level ON user_points(tier_level);
CREATE INDEX idx_user_points_next_expiry ON user_points(next_expiry_date);
```

### 6. point_transactions

ตารางธุรกรรมคะแนน

```sql
CREATE TABLE point_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Transaction details
    type VARCHAR(20) NOT NULL, -- 'earn', 'redeem', 'expire', 'bonus', 'penalty', 'transfer_in', 'transfer_out'
    points INTEGER NOT NULL,
    
    -- Source/destination information
    source VARCHAR(50), -- 'registration', 'purchase', 'referral', 'bonus', 'admin', 'transfer'
    source_reference VARCHAR(255),
    description TEXT,
    
    -- Expiration
    expires_at TIMESTAMP WITH TIME ZONE,
    expired_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'completed', -- 'pending', 'completed', 'cancelled', 'expired'
    
    -- Balance tracking
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    
    -- Related transaction (for transfers)
    related_transaction_id UUID REFERENCES point_transactions(id),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_transaction_type CHECK (type IN ('earn', 'redeem', 'expire', 'bonus', 'penalty', 'transfer_in', 'transfer_out')),
    CONSTRAINT non_zero_points CHECK (points != 0),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'cancelled', 'expired')),
    CONSTRAINT non_negative_balances CHECK (balance_before >= 0 AND balance_after >= 0)
);

-- Indexes
CREATE INDEX idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX idx_point_transactions_type ON point_transactions(type);
CREATE INDEX idx_point_transactions_source ON point_transactions(source);
CREATE INDEX idx_point_transactions_status ON point_transactions(status);
CREATE INDEX idx_point_transactions_created_at ON point_transactions(created_at DESC);
CREATE INDEX idx_point_transactions_expires_at ON point_transactions(expires_at);
```

## User Verification Tables

### 7. user_sessions

ตารางติดตาม session และข้อมูลการเข้าถึง

```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Network information
    ip_address INET NOT NULL,
    user_agent TEXT,
    
    -- Location information (from IP)
    country VARCHAR(2),
    region VARCHAR(100),
    city VARCHAR(100),
    timezone VARCHAR(50),
    
    -- Device information (parsed from user agent)
    device_type VARCHAR(20), -- 'desktop', 'mobile', 'tablet', 'unknown'
    device_brand VARCHAR(50),
    device_model VARCHAR(100),
    browser VARCHAR(50),
    browser_version VARCHAR(20),
    os VARCHAR(50),
    os_version VARCHAR(20),
    
    -- Session tracking
    session_token VARCHAR(255),
    login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    logout_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    
    -- Security flags
    is_suspicious BOOLEAN DEFAULT false,
    risk_score INTEGER DEFAULT 0, -- 0-100
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_device_type CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'unknown')),
    CONSTRAINT valid_risk_score CHECK (risk_score >= 0 AND risk_score <= 100),
    CONSTRAINT valid_country CHECK (LENGTH(country) = 2 OR country IS NULL)
);

-- Indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_ip_address ON user_sessions(ip_address);
CREATE INDEX idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX idx_user_sessions_login_at ON user_sessions(login_at DESC);
CREATE INDEX idx_user_sessions_is_suspicious ON user_sessions(is_suspicious);
CREATE INDEX idx_user_sessions_device_type ON user_sessions(device_type);
```

### 8. user_verification_documents

ตารางเอกสารการยืนยันตัวตน

```sql
CREATE TABLE user_verification_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Document information
    document_type VARCHAR(50) NOT NULL, -- 'id_card', 'passport', 'driving_license', 'utility_bill', 'bank_statement'
    document_url TEXT NOT NULL,
    document_hash VARCHAR(64), -- SHA-256 hash for integrity
    file_size INTEGER,
    mime_type VARCHAR(100),
    
    -- OCR/extracted data
    extracted_data JSONB DEFAULT '{}',
    
    -- Verification status
    verification_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'expired'
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Expiration
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Security
    encryption_key_id VARCHAR(100), -- for encrypted storage
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_document_type CHECK (document_type IN ('id_card', 'passport', 'driving_license', 'utility_bill', 'bank_statement')),
    CONSTRAINT valid_verification_status CHECK (verification_status IN ('pending', 'approved', 'rejected', 'expired')),
    CONSTRAINT positive_file_size CHECK (file_size > 0)
);

-- Indexes
CREATE INDEX idx_user_verification_documents_user_id ON user_verification_documents(user_id);
CREATE INDEX idx_user_verification_documents_type ON user_verification_documents(document_type);
CREATE INDEX idx_user_verification_documents_status ON user_verification_documents(verification_status);
CREATE INDEX idx_user_verification_documents_verified_by ON user_verification_documents(verified_by);
CREATE INDEX idx_user_verification_documents_expires_at ON user_verification_documents(expires_at);
```

## Widget Configuration Tables

### 9. widget_configurations

ตารางการตั้งค่า widget

```sql
CREATE TABLE widget_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic configuration
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Appearance
    theme VARCHAR(50) DEFAULT 'hacker', -- 'hacker', 'dark', 'light', 'custom'
    position VARCHAR(20) DEFAULT 'bottom-right', -- 'bottom-right', 'bottom-left', 'top-right', 'top-left', 'inline'
    size VARCHAR(20) DEFAULT 'medium', -- 'small', 'medium', 'large'
    
    -- Colors (for custom theme)
    colors JSONB DEFAULT '{
        "primary": "#00ff00",
        "secondary": "#008800", 
        "background": "#000000",
        "text": "#ffffff",
        "border": "#00ff00"
    }',
    
    -- Features
    features JSONB DEFAULT '{
        "wallet_display": true,
        "points_display": true,
        "profile_edit": true,
        "transaction_history": true,
        "registration": true
    }',
    
    -- Security
    allowed_domains TEXT[] DEFAULT ARRAY['*'], -- ['example.com', '*.example.com']
    cors_origins TEXT[] DEFAULT ARRAY['*'],
    
    -- Behavior
    auto_collapse BOOLEAN DEFAULT true,
    collapse_timeout INTEGER DEFAULT 30, -- seconds
    
    -- API settings
    api_endpoints JSONB DEFAULT '{}',
    rate_limits JSONB DEFAULT '{
        "login": 5,
        "registration": 3,
        "api_calls": 100
    }',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    version VARCHAR(20) DEFAULT '1.0.0',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_theme CHECK (theme IN ('hacker', 'dark', 'light', 'custom')),
    CONSTRAINT valid_position CHECK (position IN ('bottom-right', 'bottom-left', 'top-right', 'top-left', 'inline')),
    CONSTRAINT valid_size CHECK (size IN ('small', 'medium', 'large')),
    CONSTRAINT positive_collapse_timeout CHECK (collapse_timeout > 0)
);

-- Indexes
CREATE INDEX idx_widget_configurations_name ON widget_configurations(name);
CREATE INDEX idx_widget_configurations_theme ON widget_configurations(theme);
CREATE INDEX idx_widget_configurations_is_active ON widget_configurations(is_active);
```

## Audit and Logging Tables

### 10. audit_logs

ตารางบันทึกการเปลี่ยนแปลงข้อมูลสำคัญ

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Target information
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    
    -- Action information
    action VARCHAR(20) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    
    -- User information
    user_id UUID REFERENCES auth.users(id),
    user_email VARCHAR(255),
    
    -- Session information
    session_id UUID,
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_action CHECK (action IN ('INSERT', 'UPDATE', 'DELETE'))
);

-- Indexes
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

## Views and Functions

### Useful Views

```sql
-- View: User summary with wallet and points
CREATE VIEW user_summary AS
SELECT 
    u.id,
    u.email,
    u.created_at as registered_at,
    u.last_sign_in_at,
    
    -- Profile information
    p.first_name,
    p.last_name,
    p.phone,
    p.verification_level,
    p.kyc_status,
    
    -- Wallet information
    w.balance as wallet_balance,
    w.currency,
    w.status as wallet_status,
    
    -- Points information
    pt.total_points,
    pt.available_points,
    pt.tier_level,
    pt.tier_name
    
FROM auth.users u
LEFT JOIN user_profiles_extended p ON u.id = p.user_id
LEFT JOIN wallets w ON u.id = w.user_id
LEFT JOIN user_points pt ON u.id = pt.user_id;

-- View: Recent transactions summary
CREATE VIEW recent_transactions AS
SELECT 
    'wallet' as transaction_type,
    wt.id,
    wt.wallet_id as reference_id,
    u.email as user_email,
    wt.type,
    wt.amount::text as amount,
    wt.status,
    wt.created_at
FROM wallet_transactions wt
JOIN wallets w ON wt.wallet_id = w.id
JOIN auth.users u ON w.user_id = u.id

UNION ALL

SELECT 
    'points' as transaction_type,
    pt.id,
    pt.user_id as reference_id,
    u.email as user_email,
    pt.type,
    pt.points::text as amount,
    pt.status,
    pt.created_at
FROM point_transactions pt
JOIN auth.users u ON pt.user_id = u.id

ORDER BY created_at DESC;
```

### Useful Functions

```sql
-- Function: Update wallet balance
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'completed' THEN
        UPDATE wallets 
        SET balance = NEW.balance_after,
            updated_at = NOW()
        WHERE id = NEW.wallet_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for wallet balance updates
CREATE TRIGGER trigger_update_wallet_balance
    AFTER INSERT ON wallet_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_wallet_balance();

-- Function: Update user points
CREATE OR REPLACE FUNCTION update_user_points()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'completed' THEN
        UPDATE user_points 
        SET total_points = NEW.balance_after,
            available_points = NEW.balance_after,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for points updates
CREATE TRIGGER trigger_update_user_points
    AFTER INSERT ON point_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_points();
```

## Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles_extended ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_verification_documents ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles_extended
CREATE POLICY "Users can view own profile" ON user_profiles_extended
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles_extended
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies for wallets
CREATE POLICY "Users can view own wallet" ON wallets
    FOR SELECT USING (auth.uid() = user_id);

-- Policies for wallet_transactions
CREATE POLICY "Users can view own wallet transactions" ON wallet_transactions
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM wallets WHERE id = wallet_id
        )
    );

-- Similar policies for other tables...
```

## Migration Scripts

### Initial Migration

```sql
-- File: 001_initial_schema.sql
-- Create all tables in correct order
-- Add indexes
-- Add constraints
-- Enable RLS
-- Create policies
```

### Sample Data Migration

```sql
-- File: 002_sample_data.sql
-- Insert sample widget configurations
-- Insert sample user data for testing
-- Insert sample transactions
```

## Backup and Maintenance

### Recommended Backup Strategy

1. **Daily backups** ของข้อมูลทั้งหมด
2. **Hourly backups** ของตาราง transactions
3. **Real-time replication** สำหรับ production

### Maintenance Tasks

```sql
-- Clean up expired sessions
DELETE FROM user_sessions 
WHERE logout_at IS NOT NULL 
AND logout_at < NOW() - INTERVAL '30 days';

-- Archive old audit logs
INSERT INTO audit_logs_archive 
SELECT * FROM audit_logs 
WHERE created_at < NOW() - INTERVAL '1 year';

-- Update point expiration
UPDATE point_transactions 
SET status = 'expired', expired_at = NOW()
WHERE expires_at < NOW() AND status = 'completed';
```

## Performance Considerations

### Indexing Strategy
- Primary keys และ foreign keys มี indexes อัตโนมัติ
- เพิ่ม composite indexes สำหรับ queries ที่ใช้บ่อย
- ใช้ partial indexes สำหรับ filtered queries

### Query Optimization
- ใช้ EXPLAIN ANALYZE เพื่อตรวจสอบ query performance
- พิจารณาใช้ materialized views สำหรับ complex reports
- ใช้ connection pooling

### Scaling Considerations
- พิจารณา table partitioning สำหรับตาราง transactions
- ใช้ read replicas สำหรับ reporting queries
- พิจารณา caching layer สำหรับข้อมูลที่ไม่เปลี่ยนแปลงบ่อย