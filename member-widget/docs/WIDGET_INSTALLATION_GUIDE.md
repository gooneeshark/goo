# คู่มือการติดตั้งและใช้งาน Member Widget

## ภาพรวม

Member Widget เป็น JavaScript component ที่สามารถฝังลงในหน้า HTML static ใดก็ได้ โดยมีธีม hacker terminal และรองรับการทำงานแบบ responsive

## การติดตั้งแบบง่าย (Quick Start)

### 1. เพิ่ม Script Tag

เพิ่มโค้ดนี้ก่อน closing tag `</body>` ในหน้า HTML ของคุณ:

```html
<!-- Member Widget CSS -->
<link rel="stylesheet" href="https://cdn.memberwidget.com/widget/v1/member-widget.css">

<!-- Member Widget JavaScript -->
<script src="https://cdn.memberwidget.com/widget/v1/member-widget.js"></script>

<!-- Widget Container -->
<div id="member-widget"></div>

<!-- Initialize Widget -->
<script>
  MemberWidget.init({
    containerId: 'member-widget',
    apiUrl: 'https://api.memberwidget.com/v1',
    theme: 'hacker',
    position: 'bottom-right'
  });
</script>
```

### 2. ตัวอย่างหน้า HTML สมบูรณ์

```html
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website with Member Widget</title>
    
    <!-- Member Widget CSS -->
    <link rel="stylesheet" href="https://cdn.memberwidget.com/widget/v1/member-widget.css">
</head>
<body>
    <header>
        <h1>Welcome to My Website</h1>
    </header>
    
    <main>
        <p>Your website content here...</p>
    </main>
    
    <!-- Member Widget Container -->
    <div id="member-widget"></div>
    
    <!-- Member Widget JavaScript -->
    <script src="https://cdn.memberwidget.com/widget/v1/member-widget.js"></script>
    <script>
        MemberWidget.init({
            containerId: 'member-widget',
            apiUrl: 'https://api.memberwidget.com/v1',
            theme: 'hacker',
            position: 'bottom-right'
        });
    </script>
</body>
</html>
```

## การตั้งค่าขั้นสูง

### ตัวเลือกการตั้งค่า (Configuration Options)

```javascript
MemberWidget.init({
    // Required
    containerId: 'member-widget',           // ID ของ div container
    apiUrl: 'https://api.memberwidget.com/v1', // URL ของ API
    
    // Optional
    theme: 'hacker',                        // ธีม: 'hacker', 'dark', 'light'
    position: 'bottom-right',               // ตำแหน่ง: 'bottom-right', 'bottom-left', 'top-right', 'top-left', 'inline'
    size: 'medium',                         // ขนาด: 'small', 'medium', 'large'
    collapsed: true,                        // เริ่มต้นแบบย่อ: true/false
    
    // Colors (สำหรับ custom theme)
    colors: {
        primary: '#00ff00',                 // สีหลัก
        secondary: '#008800',               // สีรอง
        background: '#000000',              // สีพื้นหลัง
        text: '#ffffff',                    // สีข้อความ
        border: '#00ff00'                   // สีขอบ
    },
    
    // Features
    features: {
        walletDisplay: true,                // แสดง wallet
        pointsDisplay: true,                // แสดงคะแนน
        profileEdit: true,                  // แก้ไขโปรไฟล์
        transactionHistory: true            // ประวัติธุรกรรม
    },
    
    // Callbacks
    onLogin: function(user) {
        console.log('User logged in:', user);
    },
    onLogout: function() {
        console.log('User logged out');
    },
    onError: function(error) {
        console.error('Widget error:', error);
    }
});
```

### การใช้งานผ่าน Data Attributes

สำหรับการตั้งค่าแบบง่าย สามารถใช้ data attributes ได้:

```html
<div id="member-widget" 
     data-api-url="https://api.memberwidget.com/v1"
     data-theme="hacker"
     data-position="bottom-right"
     data-size="medium">
</div>

<script src="https://cdn.memberwidget.com/widget/v1/member-widget.js"></script>
<script>
    MemberWidget.autoInit(); // จะหา elements ที่มี data attributes อัตโนมัติ
</script>
```

## ธีมและการปรับแต่ง

### ธีมที่มีให้เลือก

#### 1. Hacker Theme (default)
```javascript
theme: 'hacker'
```
- สีเขียวสไตล์ terminal
- ฟอนต์ monospace
- เอฟเฟกต์ glitch และ scan lines

#### 2. Dark Theme
```javascript
theme: 'dark'
```
- สีเทาเข้ม
- ดีไซน์สะอาดตา
- เหมาะกับเว็บไซต์สมัยใหม่

#### 3. Light Theme
```javascript
theme: 'light'
```
- สีขาวและเทาอ่อน
- เหมาะกับเว็บไซต์สีสว่าง

#### 4. Custom Theme
```javascript
theme: 'custom',
colors: {
    primary: '#ff6b35',
    secondary: '#f7931e',
    background: '#2c3e50',
    text: '#ecf0f1',
    border: '#ff6b35'
}
```

### การปรับแต่ง CSS

สามารถ override CSS ได้โดยเพิ่ม CSS ของคุณเอง:

```css
/* Override widget styles */
.member-widget {
    --widget-primary-color: #ff0000;
    --widget-background-color: #1a1a1a;
    --widget-text-color: #ffffff;
    --widget-border-radius: 10px;
    --widget-shadow: 0 4px 20px rgba(0, 255, 0, 0.3);
}

/* Custom animation */
.member-widget.expanding {
    animation: customExpand 0.3s ease-out;
}

@keyframes customExpand {
    from { transform: scale(0.8); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}
```

## ตำแหน่งการวาง Widget

### Fixed Positions
- `bottom-right`: มุมขวาล่าง (default)
- `bottom-left`: มุมซ้ายล่าง
- `top-right`: มุมขวาบน
- `top-left`: มุมซ้ายบน

### Inline Position
```javascript
position: 'inline'
```
Widget จะแสดงในตำแหน่งที่วาง div container

### Custom Position
```css
.member-widget {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
```

## การทำงานกับ Multiple Widgets

สามารถมี widget หลายตัวในหน้าเดียวได้:

```html
<!-- Widget 1: สำหรับสมาชิก -->
<div id="member-widget-1"></div>

<!-- Widget 2: สำหรับแขก -->
<div id="guest-widget"></div>

<script>
    // Widget สำหรับสมาชิก
    MemberWidget.init({
        containerId: 'member-widget-1',
        apiUrl: 'https://api.memberwidget.com/v1',
        theme: 'hacker',
        position: 'bottom-right',
        features: {
            walletDisplay: true,
            pointsDisplay: true
        }
    });
    
    // Widget สำหรับแขก
    MemberWidget.init({
        containerId: 'guest-widget',
        apiUrl: 'https://api.memberwidget.com/v1',
        theme: 'light',
        position: 'bottom-left',
        features: {
            walletDisplay: false,
            pointsDisplay: false
        }
    });
</script>
```

## การจัดการ Events

### Event Listeners

```javascript
// Listen for widget events
document.addEventListener('memberWidget:login', function(event) {
    const user = event.detail.user;
    console.log('User logged in:', user);
    
    // Update your website based on login
    updateUserInterface(user);
});

document.addEventListener('memberWidget:logout', function(event) {
    console.log('User logged out');
    
    // Reset your website interface
    resetUserInterface();
});

document.addEventListener('memberWidget:walletUpdate', function(event) {
    const wallet = event.detail.wallet;
    console.log('Wallet updated:', wallet);
    
    // Update wallet display on your site
    updateWalletDisplay(wallet.balance);
});
```

### Widget API Methods

```javascript
// Get widget instance
const widget = MemberWidget.getInstance('member-widget');

// Control widget programmatically
widget.expand();        // ขยาย widget
widget.collapse();      // ย่อ widget
widget.toggle();        // สลับสถานะ
widget.refresh();       // รีเฟรชข้อมูล
widget.destroy();       // ทำลาย widget

// Get user data
const user = widget.getCurrentUser();
const wallet = widget.getWalletData();
const points = widget.getPointsData();
```

## การทำงานบน Mobile

Widget รองรับการทำงานบน mobile โดยอัตโนมัติ:

### Responsive Breakpoints
- **Desktop**: > 1024px - แสดงแบบเต็ม
- **Tablet**: 768px - 1024px - ปรับขนาดเล็กลง
- **Mobile**: < 768px - แสดงแบบ fullscreen เมื่อขยาย

### Mobile-specific Options
```javascript
MemberWidget.init({
    containerId: 'member-widget',
    apiUrl: 'https://api.memberwidget.com/v1',
    
    // Mobile settings
    mobile: {
        fullscreen: true,           // แสดงแบบเต็มจอบน mobile
        swipeToClose: true,         // ปัดเพื่อปิด
        position: 'bottom-center'   // ตำแหน่งบน mobile
    }
});
```

## การแก้ไขปัญหา (Troubleshooting)

### ปัญหาที่พบบ่อย

#### 1. Widget ไม่แสดง
```javascript
// ตรวจสอบว่า container มีอยู่
if (!document.getElementById('member-widget')) {
    console.error('Widget container not found');
}

// ตรวจสอบ console สำหรับ errors
console.log('Widget status:', MemberWidget.getStatus());
```

#### 2. API Connection Failed
```javascript
// ตรวจสอบ CORS settings
// ตรวจสอบ API URL
// ตรวจสอบ network connectivity

MemberWidget.init({
    containerId: 'member-widget',
    apiUrl: 'https://api.memberwidget.com/v1',
    debug: true,  // เปิด debug mode
    onError: function(error) {
        console.error('API Error:', error);
    }
});
```

#### 3. Styling Issues
```css
/* Force widget to appear above other elements */
.member-widget {
    z-index: 999999 !important;
}

/* Fix positioning issues */
.member-widget {
    position: fixed !important;
}
```

### Debug Mode

```javascript
MemberWidget.init({
    containerId: 'member-widget',
    apiUrl: 'https://api.memberwidget.com/v1',
    debug: true,  // เปิด debug mode
    
    // Debug callbacks
    onDebug: function(message) {
        console.log('[Widget Debug]:', message);
    }
});
```

## Performance Optimization

### Lazy Loading
```javascript
// โหลด widget เมื่อผู้ใช้ scroll ใกล้ๆ
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            MemberWidget.init({
                containerId: 'member-widget',
                apiUrl: 'https://api.memberwidget.com/v1'
            });
            observer.disconnect();
        }
    });
});

observer.observe(document.getElementById('member-widget'));
```

### Preload Resources
```html
<!-- Preload widget resources -->
<link rel="preload" href="https://cdn.memberwidget.com/widget/v1/member-widget.js" as="script">
<link rel="preload" href="https://cdn.memberwidget.com/widget/v1/member-widget.css" as="style">
```

## Security Considerations

### Domain Restrictions
Widget จะทำงานเฉพาะใน domains ที่อนุญาต:

```javascript
// กำหนดใน widget configuration
domains: ['example.com', '*.example.com', 'localhost']
```

### Content Security Policy
เพิ่ม CSP headers:

```html
<meta http-equiv="Content-Security-Policy" 
      content="script-src 'self' https://cdn.memberwidget.com; 
               style-src 'self' https://cdn.memberwidget.com 'unsafe-inline';
               connect-src 'self' https://api.memberwidget.com;">
```

## การอัปเดต Widget

### Auto Update
Widget จะอัปเดตอัตโนมัติเมื่อมีเวอร์ชันใหม่

### Manual Update
```javascript
// ตรวจสอบเวอร์ชัน
console.log('Widget version:', MemberWidget.version);

// Force update
MemberWidget.update();
```

### Version Pinning
```html
<!-- ใช้เวอร์ชันเฉพาะ -->
<script src="https://cdn.memberwidget.com/widget/v1.2.3/member-widget.js"></script>
```

## ตัวอย่างการใช้งานจริง

### E-commerce Site
```javascript
MemberWidget.init({
    containerId: 'member-widget',
    apiUrl: 'https://api.memberwidget.com/v1',
    theme: 'hacker',
    position: 'bottom-right',
    features: {
        walletDisplay: true,
        pointsDisplay: true,
        transactionHistory: true
    },
    onLogin: function(user) {
        // แสดงส่วนลดสำหรับสมาชิก
        showMemberDiscount(user.level);
    }
});
```

### Blog Site
```javascript
MemberWidget.init({
    containerId: 'member-widget',
    apiUrl: 'https://api.memberwidget.com/v1',
    theme: 'light',
    position: 'inline',
    features: {
        walletDisplay: false,
        pointsDisplay: true,
        profileEdit: true
    }
});
```

## การสนับสนุนและช่วยเหลือ

- **Documentation**: https://docs.memberwidget.com
- **API Reference**: https://api.memberwidget.com/docs
- **GitHub Issues**: https://github.com/memberwidget/widget/issues
- **Email Support**: support@memberwidget.com