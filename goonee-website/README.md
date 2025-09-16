# Goonee Security Widget Integration

## ภาพรวม

Widget นี้สามารถฝังลงในเว็บไซต์ใดก็ได้โดยไม่ต้องให้ผู้ใช้สมัครสมาชิก Widget จะลอยอยู่บนหน้าเว็บและให้ข้อมูลเกี่ยวกับ Goonee Security

## การติดตั้ง

### วิธีที่ 1: การใช้งานแบบง่าย

เพิ่มโค้ดนี้ก่อน closing tag `</body>` ในหน้า HTML:

```html
<!-- Load Goonee Widget -->
<script src="https://your-domain.com/member-widget.js"></script>
```

Widget จะเริ่มทำงานอัตโนมัติและปรากฏหลังจาก 3 วินาที

### วิธีที่ 2: การตั้งค่าแบบกำหนดเอง

```html
<!-- Load Goonee Widget -->
<script src="https://your-domain.com/member-widget.js"></script>

<script>
// ตั้งค่าเพิ่มเติม
GooneeWidget.init({
    position: 'bottom-left',        // ตำแหน่ง: 'bottom-right', 'bottom-left'
    apiUrl: 'https://your-app.com', // URL ของระบบหลัก
    autoInit: false                 // ปิดการเริ่มต้นอัตโนมัติ
});
</script>
```

## ตัวเลือกการตั้งค่า

| ตัวเลือก | ค่าเริ่มต้น | คำอธิบาย |
|---------|------------|----------|
| `position` | `'bottom-right'` | ตำแหน่งของ widget |
| `apiUrl` | `'http://localhost:5173'` | URL ของระบบหลัก |
| `theme` | `'hacker'` | ธีมของ widget |
| `autoInit` | `true` | เริ่มต้นอัตโนมัติ |

## API Methods

### การควบคุม Widget

```javascript
// แสดง widget
GooneeWidget.show();

// ซ่อน widget
GooneeWidget.hide();

// ขยาย widget
GooneeWidget.expand();

// ย่อ widget
GooneeWidget.collapse();

// เปิดเว็บไซต์หลัก
GooneeWidget.openWebsite();

// เปิดหน้าเกี่ยวกับเรา
GooneeWidget.openAbout();

// ทำลาย widget
GooneeWidget.destroy();
```

### การตั้งค่าใหม่

```javascript
// ตั้งค่าใหม่
GooneeWidget.init({
    position: 'bottom-left',
    apiUrl: 'https://new-domain.com'
});
```

## ตัวอย่างการใช้งาน

### 1. เว็บไซต์ธุรกิจ

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Business Website</title>
</head>
<body>
    <!-- เนื้อหาเว็บไซต์ของคุณ -->
    <h1>Welcome to My Business</h1>
    <p>Your content here...</p>
    
    <!-- Goonee Widget -->
    <script src="member-widget.js"></script>
</body>
</html>
```

### 2. บล็อกส่วนตัว

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Blog</title>
</head>
<body>
    <!-- เนื้อหาบล็อก -->
    <article>
        <h1>My Blog Post</h1>
        <p>Blog content...</p>
    </article>
    
    <!-- Goonee Widget ตำแหน่งซ้าย -->
    <script src="member-widget.js"></script>
    <script>
        GooneeWidget.init({
            position: 'bottom-left'
        });
    </script>
</body>
</html>
```

### 3. การควบคุมด้วย JavaScript

```html
<script src="member-widget.js"></script>
<script>
// ปิดการเริ่มต้นอัตโนมัติ
GooneeWidget.init({
    autoInit: false
});

// แสดง widget เมื่อผู้ใช้เลื่อนหน้าลง 50%
window.addEventListener('scroll', function() {
    const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    
    if (scrollPercent > 50) {
        GooneeWidget.show();
    }
});

// ซ่อน widget เมื่อผู้ใช้อยู่ในหน้าติดต่อ
if (window.location.pathname === '/contact') {
    GooneeWidget.hide();
}
</script>
```

## การปรับแต่ง CSS

หากต้องการปรับแต่งลักษณะของ widget:

```css
/* Override widget styles */
.goonee-widget {
    /* ปรับแต่งตำแหน่ง */
    bottom: 10px !important;
    right: 10px !important;
    
    /* ปรับแต่งสี */
    border-color: #ff0000 !important;
}

.goonee-widget .widget-title {
    color: #ff0000 !important;
}
```

## ความเข้ากันได้

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers
- ✅ ทำงานกับ frameworks ทั้งหมด (React, Vue, Angular, etc.)

## การแก้ไขปัญหา

### Widget ไม่ปรากฏ

1. ตรวจสอบว่าไฟล์ `member-widget.js` โหลดสำเร็จ
2. เปิด Developer Console ดู error messages
3. ตรวจสอบว่า JavaScript ไม่ถูก block

```javascript
// ตรวจสอบสถานะ widget
console.log('Widget loaded:', typeof GooneeWidget !== 'undefined');
```

### Widget ทับกับเนื้อหา

```css
/* เพิ่ม margin ให้เนื้อหา */
body {
    margin-bottom: 80px; /* สำหรับ widget ที่อยู่ด้านล่าง */
}
```

### ปรับแต่งตำแหน่งเฉพาะหน้า

```javascript
// ตำแหน่งต่างกันในแต่ละหน้า
const position = window.location.pathname === '/home' ? 'bottom-right' : 'bottom-left';

GooneeWidget.init({
    position: position
});
```

## Performance

- ขนาดไฟล์: ~15KB (minified)
- ไม่มี dependencies
- โหลดแบบ asynchronous
- ไม่กระทบต่อ page load speed

## Security

- ไม่เก็บข้อมูลส่วนตัว
- ไม่ใช้ cookies
- ไม่ track ผู้ใช้
- เปิด external links ใน tab ใหม่

## การอัปเดต

Widget จะอัปเดตอัตโนมัติเมื่อมีเวอร์ชันใหม่ หากต้องการใช้เวอร์ชันเฉพาะ:

```html
<script src="member-widget-v1.0.0.js"></script>
```

## การสนับสนุน

- 📧 Email: support@goonee.security
- 💬 Discord: Goonee Community
- 📚 Documentation: https://docs.goonee.security

---

**หมายเหตุ:** Widget นี้สร้างขึ้นเพื่อการศึกษาและการสร้างความตระหนักด้านความปลอดภัยไซเบอร์