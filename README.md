# Goonee Security - Complete Widget Ecosystem

ระบบวิดเจตครบชุดสำหรับการจัดการสมาชิกและการให้บริการด้านความปลอดภัยไซเบอร์

## 🎯 ภาพรวมโปรเจกต์

Goonee Security เป็นระบบที่ประกอบด้วยวิดเจตหลายประเภทที่ทำงานร่วมกันเพื่อให้บริการด้านการศึกษาความปลอดภัยไซเบอร์และการจัดการสมาชิก

### ระบบที่มีอยู่

1. **Hacker Registration System** - ระบบลงทะเบียนหลัก (React + Supabase)
2. **Member Widget** - วิดเจตสำหรับสมาชิกที่ลงทะเบียนแล้ว
3. **Goonee Website Widget** - วิดเจตสำหรับเว็บไซต์ทั่วไป (ไม่ต้องสมัครสมาชิก)

## 🚀 การติดตั้งแบบเร็ว

### สำหรับเว็บไซต์ที่มีสมาชิก

```html
<!-- Member Widget -->
<div id="member-widget"></div>
<script src="https://cdn.goonee.security/member-widget.min.js"></script>
<script>
MemberWidget.init({
    containerId: 'member-widget',
    apiUrl: 'https://api.goonee.security',
    theme: 'hacker'
});
</script>
```

### สำหรับเว็บไซต์ทั่วไป

```html
<!-- Goonee Widget -->
<script src="https://cdn.goonee.security/goonee-widget.min.js"></script>
<!-- Widget เริ่มทำงานอัตโนมัติ -->
```

## 📁 โครงสร้างโปรเจกต์

```
goonee-security/
├── hacker-registration-system/    # ระบบลงทะเบียนหลัก
│   ├── src/
│   ├── supabase/
│   └── README.md
├── member-widget/                 # Widget สำหรับสมาชิก
│   ├── src/
│   ├── docs/
│   └── README.md
├── goonee-website/               # Widget สำหรับเว็บไซต์ทั่วไป
│   ├── public/
│   └── README.md
├── WIDGET_ECOSYSTEM_GUIDE.md     # คู่มือระบบวิดเจต
├── DEPLOYMENT_INTEGRATION_GUIDE.md # คู่มือการ Deploy
├── QUICK_REFERENCE_GUIDE.md      # คู่มืออ้างอิงแบบเร็ว
└── README.md                     # ไฟล์นี้
```

## 🎮 ฟีเจอร์หลัก

### Hacker Registration System
- ✅ ระบบสมัครสมาชิกและเข้าสู่ระบบ
- ✅ ยืนยันตัวตนผ่านอีเมล
- ✅ จัดการโปรไฟล์ผู้ใช้
- ✅ ระบบ admin และการส่งข้อความ
- ✅ ธีม hacker terminal

### Member Widget
- ✅ เข้า/ออกระบบ
- ✅ แสดงข้อมูลโปรไฟล์
- ✅ จัดการ wallet และคะแนน
- ✅ กล่องข้อความ
- ✅ ประวัติธุรกรรม
- ✅ Responsive design

### Goonee Website Widget
- ✅ แสดงข้อมูลบริษัท
- ✅ ลิงก์ไปยังเว็บไซต์หลัก
- ✅ ข้อมูลการติดต่อ
- ✅ เริ่มทำงานอัตโนมัติ
- ✅ ขนาดเล็กและเบา

## 🔧 การตั้งค่า

### 1. Hacker Registration System

```bash
cd hacker-registration-system
npm install
cp .env.example .env.local
# แก้ไข .env.local ด้วย Supabase credentials
npm run dev
```

### 2. Member Widget

```bash
cd member-widget
# Build widget
cat src/core/MemberWidget.js src/components/*.js > build/member-widget-complete.js
```

### 3. Goonee Website Widget

```bash
cd goonee-website
# Widget พร้อมใช้งานใน public/member-widget.js
```

## 📚 เอกสารประกอบ

### คู่มือหลัก
- **[Widget Ecosystem Guide](WIDGET_ECOSYSTEM_GUIDE.md)** - คู่มือระบบวิดเจตครบชุด
- **[Deployment Integration Guide](DEPLOYMENT_INTEGRATION_GUIDE.md)** - คู่มือการ Deploy และ Integration
- **[Quick Reference Guide](QUICK_REFERENCE_GUIDE.md)** - คู่มืออ้างอิงแบบเร็ว

### คู่มือแต่ละระบบ
- **[Hacker Registration System](hacker-registration-system/README.md)** - ระบบลงทะเบียนหลัก
- **[Member Widget](member-widget/README.md)** - วิดเจตสำหรับสมาชิก
- **[Goonee Website Widget](goonee-website/README.md)** - วิดเจตสำหรับเว็บไซต์ทั่วไป

### เอกสารเทคนิค
- **[Widget Installation Guide](member-widget/docs/WIDGET_INSTALLATION_GUIDE.md)** - คู่มือการติดตั้งวิดเจต
- **[API Documentation](member-widget/docs/API_DOCUMENTATION.md)** - เอกสาร API
- **[Database Schema](member-widget/docs/DATABASE_SCHEMA.md)** - โครงสร้างฐานข้อมูล
- **[Security Fixes](member-widget/docs/SECURITY_FIXES.md)** - การแก้ไขด้านความปลอดภัย

## 🌐 URLs และ Endpoints

### Production URLs
- **Main Website**: https://goonee.security
- **Registration System**: https://register.goonee.security
- **API**: https://api.goonee.security
- **CDN**: https://cdn.goonee.security

### Development URLs
- **Registration System**: http://localhost:5173
- **API**: http://localhost:3000
- **Widgets**: http://localhost:3000/widgets/

## 🎨 ธีมและการปรับแต่ง

### ธีมที่มีให้เลือก
- **Hacker Theme** - สีเขียว terminal style (default)
- **Dark Theme** - สีเทาเข้ม สไตล์สมัยใหม่
- **Light Theme** - สีขาว เหมาะกับเว็บไซต์สีสว่าง
- **Custom Theme** - กำหนดสีเอง

### การปรับแต่ง CSS
```css
:root {
    --goonee-primary: #00ff00;
    --goonee-secondary: #008800;
    --goonee-background: #000000;
    --goonee-text: #ffffff;
}
```

## 🔒 ความปลอดภัย

### มาตรการความปลอดภัย
- **Data Encryption** - เข้ารหัสข้อมูลทั้งหมด
- **Secure Authentication** - ระบบยืนยันตัวตนที่ปลอดภัย
- **Input Validation** - ตรวจสอบข้อมูลนำเข้าอย่างครบถ้วน
- **Rate Limiting** - ป้องกันการโจมตี brute force
- **CORS Protection** - ควบคุมการเข้าถึงข้าม domain

### Environment Variables
```bash
# Hacker Registration System
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Widget Configuration
VITE_API_URL=https://api.goonee.security
VITE_WIDGET_CDN=https://cdn.goonee.security
```

## 🚀 การ Deploy

### Hacker Registration System
```bash
# Vercel
npm run build
vercel --prod

# Netlify
npm run build
netlify deploy --prod --dir=dist
```

### Widgets
```bash
# Build และ upload ไปยัง CDN
npm run build:widgets
aws s3 cp build/ s3://cdn-bucket/widgets/ --recursive
```

## 🧪 การทดสอบ

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### Widget Testing
```javascript
// ใน browser console
new WidgetTester().runAllTests();
```

## 📊 การ Monitor

### Error Tracking
- JavaScript errors ใน widgets
- API response monitoring
- User behavior analytics

### Performance Monitoring
- Widget load times
- API response times
- User engagement metrics

## 🤝 การมีส่วนร่วม

### Development Workflow
1. Fork repository
2. สร้าง feature branch
3. ทำการเปลี่ยนแปลง
4. เพิ่ม tests (ถ้าจำเป็น)
5. Submit pull request

### Coding Standards
- ใช้ ESLint และ Prettier
- เขียน tests สำหรับ features ใหม่
- ปฏิบัติตาม security best practices
- เขียน documentation ที่ชัดเจน

## 🆘 การสนับสนุน

### Quick Help
- **Widget ไม่ทำงาน**: ดู [Troubleshooting Guide](QUICK_REFERENCE_GUIDE.md#-troubleshooting)
- **API Issues**: ตรวจสอบ [API Documentation](member-widget/docs/API_DOCUMENTATION.md)
- **Deployment Problems**: ดู [Deployment Guide](DEPLOYMENT_INTEGRATION_GUIDE.md)

### ช่องทางการติดต่อ
- **Email**: support@goonee.security
- **Discord**: Goonee Security Community
- **GitHub Issues**: [Report Issues](https://github.com/goonee-security/issues)
- **Documentation**: https://docs.goonee.security

## 📄 License

โปรเจกต์นี้อยู่ภายใต้ MIT License - ดูรายละเอียดใน [LICENSE](LICENSE) file

## 🙏 กิตติกรรมประกาศ

- **Supabase** - Backend infrastructure
- **React** - Frontend framework
- **Tailwind CSS** - Styling system
- **Community Contributors** - ผู้มีส่วนร่วมทุกท่าน

---

**⚠️ วัตถุประสงค์การศึกษา**: ระบบนี้พัฒนาขึ้นเพื่อการศึกษาด้านความปลอดภัยไซเบอร์และส่งเสริมการ ethical hacking เท่านั้น ควรขออนุญาตก่อนทดสอบระบบความปลอดภัยใดๆ

**🚀 เริ่มต้นใช้งาน**: อ่าน [Quick Reference Guide](QUICK_REFERENCE_GUIDE.md) เพื่อเริ่มต้นใช้งานแบบเร็ว