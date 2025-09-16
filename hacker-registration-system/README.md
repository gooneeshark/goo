# 🚀 Hacker Registration System

ระบบลงทะเบียนสไตล์แฮกเกอร์สำหรับแล็บ Pentesting พร้อม Easter Eggs และฟีเจอร์การศึกษา

## 📋 สิ่งที่ต้องติดตั้งก่อน

### 1. Node.js และ npm
```bash
# ตรวจสอบว่าติดตั้งแล้วหรือยัง
node --version  # ควรเป็น v18 หรือสูงกว่า
npm --version   # ควรเป็น v8 หรือสูงกว่า
```

### 2. Git (สำหรับ version control)
```bash
git --version
```

## 🛠️ การติดตั้งโปรเจกต์

### 1. Clone โปรเจกต์ (ถ้ามี)
```bash
git clone <repository-url>
cd hacker-registration-system
```

### 2. ติดตั้ง Dependencies
```bash
npm install
```

### 3. ตั้งค่า Environment Variables
```bash
# คัดลอกไฟล์ตัวอย่าง
copy .env.example .env

# แก้ไขไฟล์ .env ด้วย text editor
notepad .env
```

### 4. รันโปรเจกต์
```bash
# รัน development server
npm run dev

# เปิดเบราว์เซอร์ไปที่ http://localhost:5173
```

## 🎯 คำสั่งที่สำคัญ

### Development
```bash
npm run dev          # รัน development server
npm run build        # สร้าง production build
npm run preview      # ดู production build ในเครื่อง
```

### Code Quality
```bash
npm run lint         # ตรวจสอบ code quality
npm run lint:fix     # แก้ไข lint errors อัตโนมัติ
npm run format       # จัดรูปแบบโค้ด
npm run format:check # ตรวจสอบรูปแบบโค้ด
```

### Testing (เมื่อเพิ่ม tests)
```bash
npm test             # รัน tests
npm run test:watch   # รัน tests แบบ watch mode
npm run test:coverage # ดู test coverage
```

## 📁 โครงสร้างโปรเจกต์

```
hacker-registration-system/
├── public/                 # ไฟล์ static
├── src/
│   ├── components/         # React components
│   │   ├── auth/          # Authentication components
│   │   ├── ui/            # UI components ทั่วไป
│   │   ├── hacker/        # Hacker theme components
│   │   └── easter-eggs/   # Easter eggs components
│   ├── contexts/          # React contexts (state management)
│   ├── services/          # Services (API calls, utilities)
│   ├── utils/             # Utility functions
│   ├── lib/               # Third-party library configs
│   ├── App.tsx            # Main App component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── .vscode/               # VS Code settings
├── .env.example           # Environment variables template
├── package.json           # Dependencies และ scripts
├── tailwind.config.js     # Tailwind CSS config
├── tsconfig.json          # TypeScript config
└── vite.config.ts         # Vite config
```

## 🎨 เทคโนโลยีที่ใช้

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool และ dev server
- **Tailwind CSS** - CSS framework
- **Framer Motion** - Animations

### Backend
- **Supabase** - Backend-as-a-Service
  - Authentication
  - PostgreSQL database
  - Real-time subscriptions

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks

## 🔧 การตั้งค่า Supabase

### Quick Setup
```bash
# ตรวจสอบสถานะ Supabase
npm run setup:supabase
```

### 1. สร้างโปรเจกต์ Supabase
1. ไปที่ [supabase.com](https://supabase.com)
2. สร้างบัญชีและโปรเจกต์ใหม่
3. คัดลอก URL และ API Key จาก Settings → API

### 2. อัปเดต Environment Variables
```bash
# ใน .env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. รันการ Migration ฐานข้อมูล

#### วิธีที่ 1: ใช้ Supabase Dashboard (แนะนำ)
1. เข้า Supabase project dashboard
2. ไปที่ **SQL Editor**
3. Copy และ paste ไฟล์ `supabase/migrations/001_initial_schema.sql`
4. คลิก **Run**
5. Copy และ paste ไฟล์ `supabase/migrations/002_rls_policies.sql`
6. คลิก **Run**

#### วิธีที่ 2: ใช้ Supabase CLI
```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-ref
supabase db push
```

### 4. ตรวจสอบการตั้งค่า
```bash
# รัน setup script อีกครั้ง
npm run setup:supabase

# รัน development server
npm run dev

# ตรวจสอบ Supabase Status widget ที่มุมล่างขวา
# คลิก "Test DB" เพื่อทดสอบการเชื่อมต่อ
```

### 5. ตั้งค่า Authentication
1. ไปที่ **Authentication** → **Settings**
2. ตั้งค่า **Site URL**: `http://localhost:5173`
3. เพิ่ม **Redirect URLs**: `http://localhost:5173/**`

📖 **คู่มือละเอียด**: ดูไฟล์ `supabase/setup-instructions.md`

## 🎮 Easter Eggs และฟีเจอร์พิเศษ

### Konami Code
กด: ↑↑↓↓←→←→BA เพื่อเปิด secret developer console

### Hidden Admin Panel
เข้าถึงผ่าน URL พิเศษ: `/admin-secret-panel`

### SQL Injection Detection
ลองใส่ SQL injection patterns ในฟอร์ม เพื่อดูการตอบสนอง

### Matrix Rain Effect
พื้นหลังแบบ Matrix digital rain พร้อม Thai/English characters

## 🐛 การแก้ไขปัญหาที่พบบ่อย

### 1. Port 5173 ถูกใช้งานแล้ว
```bash
# หา process ที่ใช้ port
netstat -ano | findstr :5173

# หยุด process (Windows)
taskkill /PID <process-id> /F

# หรือใช้ port อื่น
npm run dev -- --port 3000
```

### 2. Node modules ผิดพลาด
```bash
# ลบ node_modules และติดตั้งใหม่
rmdir /s node_modules
del package-lock.json
npm install
```

### 3. TypeScript errors
```bash
# ตรวจสอบ TypeScript
npx tsc --noEmit

# รีสตาร์ท TypeScript server ใน VS Code
Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

### 4. Tailwind CSS ไม่ทำงาน
```bash
# ตรวจสอบ Tailwind config
npx tailwindcss -i ./src/index.css -o ./dist/output.css --watch
```

## 📚 การเรียนรู้เพิ่มเติม

### React + TypeScript
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Tailwind CSS
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com)

### Supabase
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase React Tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-react)

## 🤝 การมีส่วนร่วม

### Git Workflow
```bash
# สร้าง branch ใหม่
git checkout -b feature/new-feature

# Commit changes
git add .
git commit -m "Add new feature"

# Push to remote
git push origin feature/new-feature
```

### Code Style
- ใช้ Prettier สำหรับ formatting
- ใช้ ESLint สำหรับ code quality
- เขียน commit messages ที่ชัดเจน
- เพิ่ม comments สำหรับโค้ดที่ซับซ้อน

## 📞 การขอความช่วยเหลือ

### ปัญหาเกี่ยวกับโค้ด
1. ตรวจสอบ console ใน browser (F12)
2. ดู error messages ใน terminal
3. ค้นหาใน documentation
4. ถามใน community forums

### ปัญหาเกี่ยวกับ Supabase
1. ตรวจสอบ Supabase dashboard
2. ดู network requests ใน browser
3. ตรวจสอบ API keys และ permissions

## 🎉 เริ่มต้นใช้งาน

1. ติดตั้งตามขั้นตอนข้างต้น
2. รัน `npm run dev`
3. เปิด http://localhost:5173
4. เริ่มสำรวจ Easter Eggs!
5. ลองใช้ Konami Code: ↑↑↓↓←→←→BA

---

**Happy Hacking! 🚀**