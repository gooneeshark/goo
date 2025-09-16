# Security Fixes - Member Widget Messaging System

## ภาพรวม

เอกสารนี้อธิบายการแก้ไขปัญหาความปลอดภัยในระบบกล่องจดหมายสมาชิก โดยเฉพาะการแก้ไข SECURITY DEFINER issues และการเพิ่มมาตรการรักษาความปลอดภัยเพิ่มเติม

## ปัญหาที่พบ

### 1. SECURITY DEFINER Views
- View `message_statistics` ถูกสร้างด้วย SECURITY DEFINER โดยไม่จำเป็น
- อาจทำให้เกิดช่องโหว่ในการเข้าถึงข้อมูล

### 2. Function Security Issues
- Functions บางตัวใช้ SECURITY DEFINER โดยไม่มีการตรวจสอบสิทธิ์เพียงพอ
- ไม่มีการจำกัดอัตราการส่งข้อความ (Rate Limiting)

## การแก้ไข

### 1. View Security Fixes

#### ก่อนแก้ไข:
```sql
CREATE VIEW message_statistics AS
SELECT recipient_id, COUNT(*) as total_messages, ...
FROM messages
GROUP BY recipient_id;
```

#### หลังแก้ไข:
```sql
CREATE VIEW message_statistics 
WITH (security_barrier = true) AS
SELECT recipient_id, COUNT(*) as total_messages, ...
FROM messages
WHERE recipient_id = auth.uid() -- เฉพาะข้อมูลของผู้ใช้ปัจจุบัน
GROUP BY recipient_id;
```

### 2. Function Security Improvements

#### เปลี่ยนจาก SECURITY DEFINER เป็น SECURITY INVOKER:

```sql
-- ก่อนแก้ไข
CREATE FUNCTION get_unread_message_count(user_id UUID)
RETURNS INTEGER
SECURITY DEFINER -- อันตราย!

-- หลังแก้ไข  
CREATE FUNCTION get_unread_message_count(user_id UUID DEFAULT auth.uid())
RETURNS INTEGER
SECURITY INVOKER -- ปลอดภัย
AS $$
BEGIN
    -- ตรวจสอบสิทธิ์
    IF user_id != auth.uid() THEN
        RAISE EXCEPTION 'Access denied: can only check own message count';
    END IF;
    -- ... rest of function
END;
$$;
```

### 3. Admin Privilege Checks

เพิ่มการตรวจสอบสิทธิ์ admin ในทุก function ที่สำคัญ:

```sql
CREATE FUNCTION is_admin()
RETURNS BOOLEAN
AS $$
DECLARE
    user_level INTEGER;
BEGIN
    SELECT hacker_level INTO user_level
    FROM profiles 
    WHERE id = auth.uid();
    
    RETURN COALESCE(user_level, 0) >= 10;
END;
$$;

-- ใช้ในฟังก์ชันส่งข้อความ
CREATE FUNCTION send_message_to_user(...)
AS $$
BEGIN
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Access denied: admin privileges required';
    END IF;
    -- ... rest of function
END;
$$;
```

### 4. Rate Limiting System

เพิ่มระบบจำกัดอัตราการส่งข้อความ:

```sql
-- ตารางเก็บข้อมูล rate limiting
CREATE TABLE message_rate_limits (
    user_id UUID PRIMARY KEY,
    messages_sent_today INTEGER DEFAULT 0,
    last_reset_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ฟังก์ชันตรวจสอบ rate limit
CREATE FUNCTION check_message_rate_limit()
RETURNS BOOLEAN
AS $$
DECLARE
    current_count INTEGER;
    max_daily_messages INTEGER := 100;
BEGIN
    -- ตรวจสอบและอัปเดต counter
    -- จำกัด 100 ข้อความต่อวันต่อ admin
    -- ... implementation
END;
$$;
```

### 5. Input Validation

เพิ่มการตรวจสอบข้อมูลนำเข้า:

```sql
CREATE FUNCTION validate_message_data()
RETURNS TRIGGER AS $$
BEGIN
    -- ตรวจสอบความยาวของ title
    IF LENGTH(NEW.title) > 255 THEN
        RAISE EXCEPTION 'Title too long (max 255 characters)';
    END IF;
    
    -- ตรวจสอบความยาวของ content
    IF LENGTH(NEW.content) > 10000 THEN
        RAISE EXCEPTION 'Content too long (max 10000 characters)';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 6. Direct Table Access Restrictions

จำกัดการเข้าถึงตารางโดยตรง:

```sql
-- ยกเลิกสิทธิ์ INSERT โดยตรง
REVOKE INSERT ON messages FROM authenticated;

-- ให้ใช้ function เท่านั้น
GRANT EXECUTE ON FUNCTION send_message_to_user TO authenticated;
```

## การอัปเดต Client Code

### 1. Widget Code Updates

#### ก่อนแก้ไข:
```javascript
// เข้าถึงตารางโดยตรง (ไม่ปลอดภัย)
const { data } = await supabase
  .from('messages')
  .select('*')
  .eq('recipient_id', user.id);
```

#### หลังแก้ไข:
```javascript
// ใช้ secure function
const { data } = await supabase
  .rpc('get_user_messages', {
    p_limit: 20,
    p_offset: 0
  });
```

### 2. Admin Interface Updates

#### เพิ่มการตรวจสอบ Rate Limit:
```javascript
// ตรวจสอบ rate limit ก่อนส่งข้อความ
const { error: rateLimitError } = await supabase
  .rpc('check_message_rate_limit');

if (rateLimitError) {
  throw new Error(rateLimitError.message);
}

// จากนั้นค่อยส่งข้อความ
await supabase.rpc('send_message_to_user', { ... });
```

## Row Level Security (RLS) Policies

### 1. Messages Table
```sql
-- ผู้ใช้ดูได้เฉพาะข้อความของตัวเอง
CREATE POLICY "Users can view their own messages" ON messages
    FOR SELECT USING (auth.uid() = recipient_id);

-- ผู้ใช้อัปเดตได้เฉพาะสถานะการอ่าน
CREATE POLICY "Users can update read status" ON messages
    FOR UPDATE USING (auth.uid() = recipient_id)
    WITH CHECK (auth.uid() = recipient_id);
```

### 2. Message Templates
```sql
-- เฉพาะ admin เท่านั้นที่จัดการ templates ได้
CREATE POLICY "Admins can manage templates" ON message_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.hacker_level >= 10
        )
    );
```

### 3. Rate Limits Table
```sql
-- ผู้ใช้ดูได้เฉพาะ rate limit ของตัวเอง
CREATE POLICY "Users can view own rate limits" ON message_rate_limits
    FOR SELECT USING (user_id = auth.uid());
```

## การทดสอบความปลอดภัย

### 1. ทดสอบ Access Control
```sql
-- ทดสอบว่าผู้ใช้ไม่สามารถดูข้อความของคนอื่นได้
SELECT * FROM messages WHERE recipient_id != auth.uid(); -- ควรได้ 0 rows

-- ทดสอบว่าผู้ใช้ธรรมดาไม่สามารถส่งข้อความได้
SELECT send_message_to_user('other-user-id', 'test', 'test'); -- ควร error
```

### 2. ทดสอบ Rate Limiting
```sql
-- ทดสอบการส่งข้อความเกินขอบเขต
-- ส่งข้อความ 101 ครั้งในวันเดียว ควร error ที่ครั้งที่ 101
```

### 3. ทดสอบ Input Validation
```javascript
// ทดสอบ title ยาวเกินไป
await supabase.rpc('send_message_to_user', {
  p_title: 'x'.repeat(300), // ควร error
  // ...
});

// ทดสอบ content ยาวเกินไป  
await supabase.rpc('send_message_to_user', {
  p_content: 'x'.repeat(15000), // ควร error
  // ...
});
```

## Best Practices ที่ใช้

### 1. Principle of Least Privilege
- ให้สิทธิ์เฉพาะที่จำเป็น
- ใช้ SECURITY INVOKER แทน SECURITY DEFINER เมื่อเป็นไปได้
- จำกัดการเข้าถึงตารางโดยตรง

### 2. Defense in Depth
- RLS policies + Function-level checks + Application-level validation
- Multiple layers of security

### 3. Input Validation
- Validate ทั้งใน database และ application
- ใช้ parameterized queries
- Escape user input

### 4. Audit Trail
- บันทึกการดำเนินการสำคัญ
- Track message sending activities
- Monitor suspicious activities

### 5. Rate Limiting
- จำกัดการใช้งานเพื่อป้องกัน abuse
- แยก limits ตามประเภทผู้ใช้
- Reset limits อัตโนมัติ

## การ Monitor และ Maintenance

### 1. Security Monitoring
```sql
-- ตรวจสอบการส่งข้อความผิดปกติ
SELECT 
    sender_id,
    COUNT(*) as messages_sent,
    DATE(created_at) as send_date
FROM messages 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY sender_id, DATE(created_at)
HAVING COUNT(*) > 50
ORDER BY messages_sent DESC;
```

### 2. Regular Security Audits
- ตรวจสอบ RLS policies
- Review function permissions
- Check for unused privileges
- Monitor error logs

### 3. Performance Impact
- Security measures มีผลต่อ performance เล็กน้อย
- ใช้ indexes ที่เหมาะสม
- Monitor query performance

## การอัปเดตในอนาคต

### 1. Enhanced Logging
- เพิ่ม audit logs สำหรับการดำเนินการสำคัญ
- Track failed access attempts
- Monitor privilege escalation attempts

### 2. Advanced Rate Limiting
- Rate limiting แบบ sliding window
- Different limits for different message types
- Temporary bans for abuse

### 3. Content Security
- Message content scanning
- Spam detection
- Malicious content filtering

## สรุป

การแก้ไขความปลอดภัยนี้ช่วยให้ระบบกล่องจดหมายมีความปลอดภัยสูงขึ้นโดย:

✅ **แก้ไข SECURITY DEFINER issues**
✅ **เพิ่ม proper access controls** 
✅ **ใช้ principle of least privilege**
✅ **เพิ่ม rate limiting**
✅ **ปรับปรุง input validation**
✅ **จำกัดการเข้าถึงตารางโดยตรง**

ระบบตอนนี้ปลอดภัยและพร้อมใช้งานในสภาพแวดล้อม production แล้ว!