# ระบบกล่องจดหมายสมาชิก (Member Messaging System)

## ภาพรวม

ระบบกล่องจดหมายสมาชิกเป็นฟีเจอร์ที่ช่วยให้ผู้ดูแลระบบสามารถส่งข้อความ ประกาศ และการแจ้งเตือนให้กับสมาชิกได้โดยตรง ข้อความจะแสดงใน widget และสมาชิกสามารถอ่านได้ทันที

## คุณสมบัติหลัก

### 📧 **ระบบข้อความ**
- ส่งข้อความแบบส่วนตัวให้สมาชิกแต่ละคน
- ส่งข้อความแบบ broadcast ให้หลายคนพร้อมกัน
- รองรับข้อความหลายประเภท (info, warning, error, success, announcement)
- ระดับความสำคัญ (low, normal, high, urgent)
- หมวดหมู่ข้อความ (general, system, promotion, security, update)

### 🎯 **การจัดการข้อความ**
- Template ข้อความสำเร็จรูป
- กำหนดเวลาส่งข้อความ (scheduling)
- กำหนดวันหมดอายุข้อความ
- ติดตามสถานะการอ่าน
- ระบบแจ้งเตือนข้อความใหม่

### 👥 **การเลือกผู้รับ**
- เลือกสมาชิกแต่ละคน
- เลือกตามเกณฑ์ (level, วันที่สมัคร, etc.)
- ส่งให้สมาชิกทั้งหมด
- ประวัติการส่งข้อความ

## การติดตั้งและตั้งค่า

### 1. Database Migration

รันไฟล์ migration เพื่อสร้างตารางที่จำเป็น:

```sql
-- รันไฟล์ hacker-registration-system/supabase/migrations/004_messaging_system.sql
```

ตารางที่จะถูกสร้าง:
- `messages` - ข้อความหลัก
- `message_templates` - template ข้อความ
- `broadcast_messages` - ข้อความ broadcast
- `message_attachments` - ไฟล์แนบ
- `user_notification_preferences` - การตั้งค่าการแจ้งเตือน

### 2. Widget Integration

เพิ่ม MessageInbox component ใน widget:

```html
<script src="member-widget/src/components/MessageInbox.js"></script>
```

### 3. Admin Interface

เพิ่ม MessageCenter component ในระบบ admin:

```tsx
import MessageCenter from './components/admin/MessageCenter';

// ใช้งานใน admin dashboard
<MessageCenter />
```

## การใช้งาน Admin

### 1. การส่งข้อความ

```typescript
// ส่งข้อความให้สมาชิกคนเดียว
const { data, error } = await supabase.rpc('send_message_to_user', {
  p_recipient_id: 'user-uuid',
  p_title: 'ยินดีต้อนรับ!',
  p_content: 'ขอบคุณที่เข้าร่วมระบบ',
  p_message_type: 'success',
  p_priority: 'normal',
  p_category: 'general',
  p_sender_name: 'Admin'
});
```

### 2. การใช้ Template

```typescript
// ใช้ template ที่มีอยู่
const template = await supabase
  .from('message_templates')
  .select('*')
  .eq('name', 'Welcome Message')
  .single();

// แทนที่ตัวแปรใน template
const personalizedTitle = template.title_template
  .replace('{{user_name}}', user.display_name);
  
const personalizedContent = template.content_template
  .replace('{{user_name}}', user.display_name)
  .replace('{{user_id}}', user.id);
```

### 3. การส่งข้อความ Broadcast

```typescript
// สร้าง broadcast message
const { data: broadcast } = await supabase
  .from('broadcast_messages')
  .insert({
    title: 'ประกาศสำคัญ',
    content: 'ระบบจะปิดปรับปรุงในวันที่ 20 มกราคม',
    message_type: 'announcement',
    priority: 'high',
    target_criteria: { hacker_level: { gte: 5 } }
  })
  .select()
  .single();

// ส่งให้สมาชิกที่ตรงเกณฑ์
const users = await supabase
  .from('profiles')
  .select('id')
  .gte('hacker_level', 5);

for (const user of users.data) {
  await supabase.rpc('send_message_to_user', {
    p_recipient_id: user.id,
    p_title: broadcast.title,
    p_content: broadcast.content,
    p_message_type: broadcast.message_type,
    p_priority: broadcast.priority
  });
}
```

## การใช้งาน Widget

### 1. การแสดงข้อความ

Widget จะแสดงจำนวนข้อความที่ยังไม่ได้อ่านในปุ่ม Messages:

```javascript
// ตรวจสอบข้อความใหม่
const unreadCount = await supabase.rpc('get_unread_message_count');

// แสดงใน UI
if (unreadCount > 0) {
  button.textContent = `📧 Messages (${unreadCount})`;
  button.classList.add('has-notification');
}
```

### 2. การอ่านข้อความ

```javascript
// โหลดข้อความ
const { data: messages } = await supabase
  .from('messages')
  .select('*')
  .eq('recipient_id', user.id)
  .order('created_at', { ascending: false });

// มาร์คเป็นอ่านแล้ว
await supabase.rpc('mark_message_as_read', {
  message_id: messageId
});
```

### 3. Event Listeners

```javascript
// ฟังการเปลี่ยนแปลงข้อความใหม่
document.addEventListener('memberWidget:unreadCountChanged', (event) => {
  const count = event.detail.count;
  updateNotificationBadge(count);
});
```

## Message Types และ Styling

### ประเภทข้อความ

```javascript
const messageTypes = {
  'info': {
    icon: 'ℹ️',
    color: '#0099ff',
    description: 'ข้อมูลทั่วไป'
  },
  'warning': {
    icon: '⚠️',
    color: '#ffaa00',
    description: 'คำเตือน'
  },
  'error': {
    icon: '❌',
    color: '#ff4444',
    description: 'ข้อผิดพลาด'
  },
  'success': {
    icon: '✅',
    color: '#00ff00',
    description: 'สำเร็จ'
  },
  'announcement': {
    icon: '📢',
    color: '#ff6b35',
    description: 'ประกาศ'
  }
};
```

### ระดับความสำคัญ

```javascript
const priorities = {
  'low': {
    color: '#888888',
    description: 'ความสำคัญต่ำ'
  },
  'normal': {
    color: '#ffffff',
    description: 'ความสำคัญปกติ'
  },
  'high': {
    color: '#ffaa00',
    description: 'ความสำคัญสูง'
  },
  'urgent': {
    color: '#ff4444',
    description: 'เร่งด่วน',
    effects: ['glow', 'pulse']
  }
};
```

## Templates ที่มีให้

### 1. Welcome Message
```
Title: Welcome to the System, {{user_name}}!
Content: Hello {{user_name}},

Welcome to our hacker registration system! Your account has been successfully created.

Your user ID: {{user_id}}
Registration date: {{registration_date}}

Get started by exploring the system and discovering hidden features.

Happy hacking!

The System
```

### 2. Security Alert
```
Title: Security Alert: {{alert_type}}
Content: SECURITY ALERT

Alert Type: {{alert_type}}
Detected at: {{detection_time}}
User: {{user_name}}
IP Address: {{ip_address}}

Details:
{{alert_details}}

If this was not you, please change your password immediately and contact support.

Stay secure!
Security Team
```

### 3. System Maintenance
```
Title: Scheduled Maintenance: {{maintenance_date}}
Content: SYSTEM MAINTENANCE NOTICE

Scheduled maintenance will occur on {{maintenance_date}} from {{start_time}} to {{end_time}}.

During this time:
- The system will be temporarily unavailable
- All sessions will be terminated
- Data will be safely preserved

Maintenance details:
{{maintenance_details}}

We apologize for any inconvenience.

System Administration
```

## API Functions

### Database Functions

```sql
-- ส่งข้อความให้ผู้ใช้
SELECT send_message_to_user(
  p_recipient_id := 'user-uuid',
  p_title := 'หัวข้อข้อความ',
  p_content := 'เนื้อหาข้อความ',
  p_message_type := 'info',
  p_priority := 'normal',
  p_category := 'general'
);

-- ตรวจสอบจำนวนข้อความที่ยังไม่ได้อ่าน
SELECT get_unread_message_count('user-uuid');

-- มาร์คข้อความเป็นอ่านแล้ว
SELECT mark_message_as_read('message-uuid');

-- ทำความสะอาดข้อความที่หมดอายุ
SELECT cleanup_expired_messages();
```

### Widget API

```javascript
// เข้าถึง MessageInbox component
const messageInbox = widget.messageInbox;

// โหลดข้อความ
await messageInbox.loadMessages();

// รีเฟรชข้อความ
await messageInbox.refreshMessages();

// มาร์คทั้งหมดเป็นอ่านแล้ว
await messageInbox.markAllAsRead();

// เปิดข้อความ
messageInbox.openMessage('message-id');
```

## การปรับแต่ง UI

### Custom CSS

```css
/* ปรับสีของข้อความตามประเภท */
.message-item.type-urgent {
  border-color: #ff4444;
  background: rgba(255, 68, 68, 0.1);
  animation: urgent-pulse 1s infinite;
}

.message-item.type-success {
  border-color: #00ff00;
  background: rgba(0, 255, 0, 0.1);
}

/* ปรับแต่งปุ่มข้อความ */
.action-btn.has-notification {
  position: relative;
}

.action-btn.has-notification::after {
  content: '';
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background: #ff4444;
  border-radius: 50%;
  animation: pulse 2s infinite;
}
```

### การปรับแต่ง Modal

```css
/* ปรับแต่ง message modal */
.message-modal {
  max-width: 800px;
  background: linear-gradient(45deg, #000000, #001100);
}

.message-modal .modal-header {
  background: linear-gradient(45deg, #001100, #002200);
  border-bottom: 2px solid #00ff00;
}

.message-modal .message-text {
  font-size: 14px;
  line-height: 1.8;
  color: #ffffff;
}
```

## Security และ Best Practices

### 1. การป้องกัน XSS

```javascript
// Escape HTML content
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ใช้เมื่อแสดงเนื้อหาข้อความ
messageElement.innerHTML = escapeHtml(message.content);
```

### 2. Rate Limiting

```sql
-- จำกัดการส่งข้อความ
CREATE OR REPLACE FUNCTION check_message_rate_limit(sender_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  message_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO message_count
  FROM messages 
  WHERE sender_id = sender_id 
  AND created_at > NOW() - INTERVAL '1 hour';
  
  RETURN message_count < 100; -- จำกัด 100 ข้อความต่อชั่วโมง
END;
$$ LANGUAGE plpgsql;
```

### 3. Content Validation

```javascript
// ตรวจสอบเนื้อหาข้อความ
function validateMessage(title, content) {
  const errors = [];
  
  if (!title || title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (title && title.length > 255) {
    errors.push('Title too long (max 255 characters)');
  }
  
  if (!content || content.trim().length === 0) {
    errors.push('Content is required');
  }
  
  if (content && content.length > 10000) {
    errors.push('Content too long (max 10000 characters)');
  }
  
  return errors;
}
```

## การ Monitor และ Analytics

### 1. Message Statistics

```sql
-- สถิติข้อความ
SELECT 
  message_type,
  priority,
  COUNT(*) as total_messages,
  COUNT(*) FILTER (WHERE is_read = true) as read_messages,
  COUNT(*) FILTER (WHERE is_read = false) as unread_messages,
  AVG(EXTRACT(EPOCH FROM (read_at - created_at))/60) as avg_read_time_minutes
FROM messages 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY message_type, priority
ORDER BY total_messages DESC;
```

### 2. User Engagement

```sql
-- การมีส่วนร่วมของผู้ใช้
SELECT 
  u.email,
  p.display_name,
  ms.total_messages,
  ms.unread_messages,
  ms.last_message_at,
  CASE 
    WHEN ms.unread_messages = 0 THEN 'Active Reader'
    WHEN ms.unread_messages <= 5 THEN 'Occasional Reader'
    ELSE 'Inactive Reader'
  END as engagement_level
FROM auth.users u
JOIN profiles p ON u.id = p.id
LEFT JOIN message_statistics ms ON u.id = ms.recipient_id
ORDER BY ms.total_messages DESC;
```

## Troubleshooting

### ปัญหาที่พบบ่อย

#### 1. ข้อความไม่แสดงใน Widget
```javascript
// ตรวจสอบการเชื่อมต่อ Supabase
console.log('Supabase client:', widget.supabaseClient);
console.log('Current user:', widget.user);

// ตรวจสอบ RLS policies
const { data, error } = await supabase
  .from('messages')
  .select('*')
  .eq('recipient_id', user.id);
  
console.log('Messages query result:', { data, error });
```

#### 2. การแจ้งเตือนไม่ทำงาน
```javascript
// ตรวจสอบ event listeners
document.addEventListener('memberWidget:unreadCountChanged', (event) => {
  console.log('Unread count changed:', event.detail.count);
});

// ตรวจสอบการอัปเดต unread count
await messageInbox.updateUnreadCount();
```

#### 3. Template Variables ไม่ทำงาน
```javascript
// ตรวจสอบการแทนที่ตัวแปร
function replaceTemplateVariables(template, variables) {
  let result = template;
  
  Object.keys(variables).forEach(key => {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), variables[key]);
  });
  
  console.log('Template result:', result);
  return result;
}
```

## การขยายระบบ

### 1. เพิ่ม Message Types ใหม่

```sql
-- เพิ่มประเภทข้อความใหม่
ALTER TABLE messages 
DROP CONSTRAINT valid_message_type;

ALTER TABLE messages 
ADD CONSTRAINT valid_message_type 
CHECK (message_type IN ('info', 'warning', 'error', 'success', 'announcement', 'promotion', 'reminder'));
```

### 2. เพิ่ม Rich Text Support

```javascript
// รองรับ Markdown
import { marked } from 'marked';

function renderMessageContent(content, format = 'text') {
  if (format === 'markdown') {
    return marked(content);
  }
  return escapeHtml(content);
}
```

### 3. เพิ่ม Push Notifications

```javascript
// Service Worker สำหรับ push notifications
self.addEventListener('push', function(event) {
  const data = event.data.json();
  
  const options = {
    body: data.content,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'member-message',
    data: {
      messageId: data.messageId,
      url: '/messages'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
```

ระบบกล่องจดหมายนี้จะช่วยให้คุณสามารถสื่อสารกับสมาชิกได้อย่างมีประสิทธิภาพ และสมาชิกสามารถรับข้อมูลสำคัญได้ทันทีผ่าน widget!