# Repository Summary

สรุปภาพรวมของ repository และตำแหน่งไฟล์สำคัญ (ยกเว้นโฟลเดอร์ `ai` และ `scan` ตามคำขอ)

## โครงสร้างหลัก
- `goonee-website/` : ไซต์ตัวอย่างและ assets สำหรับ widget (ไม่รวม `scan/` และ `ai/` ในสรุปนี้)
- `hacker-registration-system/` : ระบบลงทะเบียนหลัก (React + Supabase)
- `member-widget/` : โค้ดและ build ของ widget สำหรับสมาชิก
- `registration-system/` : ระบบที่เกี่ยวข้องกับการลงทะเบียน (เพิ่มรายละเอียดในโฟลเดอร์)

## ไฟล์สำคัญและตำแหน่ง
- `README.md` : คู่มือหลักของรีโป — ภาพรวมการติดตั้งและการใช้งาน
- `WIDGET_ECOSYSTEM_GUIDE.md` : คู่มือระบบ widget ทั้งหมด
- `DEPLOYMENT_INTEGRATION_GUIDE.md` : คำแนะนำการ deploy และ integration
- `QUICK_REFERENCE_GUIDE.md` : คำแนะนำแบบสั้นสำหรับการใช้งานด่วน

## โปรเจกต์ย่อย (สรุป)
- `hacker-registration-system/`
  - `package.json` : บอก dependencies และสคริปต์
  - `src/` : โค้ด frontend
  - `supabase/` : schema, migrations, config

- `member-widget/`
  - `src/` : แหล่งที่มา widget
  - `build/` : ผลลัพธ์ build (เช่น `member-widget-complete.js`)
  - `docs/` : เอกสารประกอบการติดตั้งและ API

- `goonee-website/`
  - `public/` : ไฟล์สาธารณะและ widget ที่พร้อมใช้
  - `index.html`, `options.html`, `welcome.html` : หน้าเว็บตัวอย่าง

## การใช้งานทั่วไป
- ติดตั้ง dependencies โปรเจกต์ย่อย:
  - `cd hacker-registration-system && npm install`

- สร้าง widget:
  - `cd member-widget && npm run build` (หรือสคริปต์ที่ระบุใน README ของ `member-widget`)

## หมายเหตุความปลอดภัยและการ ignore
- โฟลเดอร์ `goonee-website/scan/` ถูกตั้งค่าให้ ignore ทั้งหมด ยกเว้น `scan.html` และ `Intro.mp4` โดย `.gitignore` (เพื่อให้ไฟล์อื่น ๆ ใน `scan/` ไม่ถูกเปิดเผยโดยไม่มีลิงก์ตรง)

## จุดที่ควรตรวจสอบเพิ่มเติม
- ถ้าต้องการเก็บ `Intro.mp4` และ `scan.html` ใน repo ให้ commit ไฟล์เหล่านั้น (`git add goonee-website/scan/scan.html goonee-website/scan/Intro.mp4`) — ขณะนี้ทั้งสองไฟล์ยังไม่ถูก tracked

---

ถ้าต้องการผมสามารถ:
- เพิ่มตัวอย่างคำสั่ง `git add` และ commit สำหรับ `scan.html` และ `Intro.mp4`
- สร้าง `docs/` เพิ่มเติมที่อธิบายการทำงานของสคริปต์ใน `goonee-website/scan` (เช่น `generate_combined_styles.js`, `optimize_web.js`)
