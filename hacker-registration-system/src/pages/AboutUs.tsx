import React from 'react';

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-green-400">
            [เกี่ยวกับเรา]
          </h1>
          <div className="w-32 h-1 bg-green-400 mx-auto"></div>
        </div>

        {/* Mission Statement */}
        <div className="bg-gray-900 border border-green-400 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-green-400">
            ⚠️ คำชี้แจงสำคัญ
          </h2>
          <div className="space-y-4 text-lg">
            <p className="text-white">
              <span className="text-red-400 font-bold">เราไม่ได้สอนแฮกเพื่อให้ไปเจาะระบบ</span> 
              แต่เป็นการปลูกฝังให้คนรู้สำนึกถูกผิดและวิธีป้องกัน
            </p>
            <p className="text-green-300">
              การศึกษาความปลอดภัยไซเบอร์ของเราเน้นการสร้างผู้เชี่ยวชาญด้านการป้องกัน 
              ไม่ใช่การสร้างผู้ทำลาย
            </p>
          </div>
        </div>

        {/* Philosophy */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gray-900 border border-green-400 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-green-400">
              🛡️ ถ้าอยากเรียนแฮก คุณจะได้วิธีป้องกัน
            </h3>
            <p className="text-white">
              เราสอนเทคนิคการโจมตีเพื่อให้เข้าใจวิธีการป้องกัน 
              ทุกบทเรียนจะมาพร้อมกับวิธีการแก้ไขและป้องกันที่ชัดเจน
            </p>
          </div>

          <div className="bg-gray-900 border border-green-400 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-green-400">
              💻 ถ้าคุณเรียนเขียนโปรแกรม นั่นคือที่ที่จะสร้างคุณให้เป็นแฮกเกอร์ได้จริง
            </h3>
            <p className="text-white">
              การเขียนโปรแกรมคือพื้นฐานที่แท้จริงของการเป็นแฮกเกอร์ 
              เมื่อคุณเข้าใจระบบจากภายใน คุณจะรู้จุดอ่อนและวิธีเสริมความแข็งแกร่ง
            </p>
          </div>
        </div>

        {/* Our Story */}
        <div className="bg-gray-900 border border-green-400 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-green-400">
            📖 เรื่องราวของเรา
          </h2>
          <div className="space-y-6 text-white">
            <p>
              ผู้ก่อตั้งของเราเคยเป็นส่วนหนึ่งของโลกใต้ดิน มีประสบการณ์ตรงจากการทำงานในสภาพแวดล้อมที่ท้าทาย 
              และได้เห็นทั้งด้านมืดและด้านสว่างของโลกไซเบอร์
            </p>
            <p>
              <span className="text-green-400 font-bold">การเปลี่ยนแปลง:</span> 
              จากประสบการณ์ที่ผ่านมา เราตัดสินใจหันมาใช้ความรู้ในทางที่สร้างสรรค์ 
              เพื่อสร้างชุมชนนักความปลอดภัยที่มีจริยธรรม
            </p>
            <p>
              <span className="text-yellow-400 font-bold">มุมมองที่แตกต่าง:</span> 
              เราไม่พึ่งพาเครื่องมือสำเร็จรูปที่ใช้กันทั่วไป แต่เน้นการเข้าใจหลักการและการคิดเชิงระบบ 
              ทำให้สามารถค้นพบช่องโหว่ที่ทีมพัฒนามักมองข้าม
            </p>
          </div>
        </div>

        {/* Our Approach */}
        <div className="bg-gray-900 border border-green-400 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-green-400">
            🎯 แนวทางของเรา
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-bold mb-3 text-green-400">
                ✅ สิ่งที่เราสอน
              </h4>
              <ul className="space-y-2 text-white">
                <li>• การเขียนโค้ดที่ปลอดภัย</li>
                <li>• การออกแบบระบบที่แข็งแกร่ง</li>
                <li>• การตรวจสอบช่องโหว่อย่างมีจริยธรรม</li>
                <li>• การตอบสนองต่อเหตุการณ์ความปลอดภัย</li>
                <li>• หลักการ Responsible Disclosure</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-3 text-red-400">
                ❌ สิ่งที่เราไม่สอน
              </h4>
              <ul className="space-y-2 text-white">
                <li>• การโจมตีระบบจริงโดยไม่ได้รับอนุญาต</li>
                <li>• การใช้ช่องโหว่เพื่อผลประโยชน์ส่วนตัว</li>
                <li>• การทำลายหรือขโมยข้อมูล</li>
                <li>• การหลีกเลี่ยงกฎหมาย</li>
                <li>• เทคนิคที่ไม่มีจุดประสงค์เชิงป้องกัน</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Unique Perspective */}
        <div className="bg-gray-900 border border-green-400 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-green-400">
            🔍 มุมมองที่แตกต่าง
          </h2>
          <div className="space-y-4 text-white">
            <p>
              <span className="text-green-400 font-bold">แฮกเกอร์ ≠ เก่งเสมอไป</span><br/>
              ในมุมมองของเรา แฮกเกอร์หลายคนเป็นเพียง "ฟลุ้ค" - โชคดีที่บังเอิญเจอจุดที่ทีมพัฒนามองข้าม
            </p>
            <p>
              <span className="text-yellow-400 font-bold">การทดสอบที่แท้จริง:</span><br/>
              เราไม่ส่งรายงานว่า "พบช่องโหว่" หากไม่สามารถแสดงผลกระทบที่เป็นรูปธรรมได้ 
              ทุกการค้นพบต้องมาพร้อมกับหลักฐานการใช้งานจริง
            </p>
            <p>
              <span className="text-red-400 font-bold">ตัวอย่าง:</span><br/>
              หากระบบยอมให้แก้ไข BonusID ฝั่ง client และได้รับ HTTP 200 แต่ไม่มีรางวัลจริง 
              เราไม่นับว่าเป็นช่องโหว่ จนกว่าจะสามารถปลอมรางวัลและรับของจริงได้
            </p>
          </div>
        </div>

        {/* Real World Experience */}
        <div className="bg-gray-900 border border-green-400 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-green-400">
            🌍 ประสบการณ์จากโลกจริง
          </h2>
          <div className="space-y-4 text-white">
            <p>
              เราเคยพบเว็บไซต์ที่ผ่านการทดสอบมานับครั้งไม่ถ้วน แต่ยังมีช่องโหว่ง่ายๆ 
              เช่น การลบ attribute "disabled" ออกจากปุ่มที่ 2 แล้วรับรางวัลได้ทั้งหมด
            </p>
            <p>
              <span className="text-green-400 font-bold">ทำไมถึงพลาด?</span><br/>
              ทีมพัฒนาทดสอบแค่ปุ่มแรก เมื่อไม่เคยผ่านเงื่อนไข มันปลอมไม่ได้ ปลอดภัยจริง<br/>
              แต่เมื่อเคยผ่านแล้ว ระบบจำเงื่อนไขไว้ ครั้งต่อไปรอแค่ logic ฝั่ง client เปิดปุ่ม
            </p>
            <p className="text-yellow-400">
              <strong>คำถาม:</strong> Pentester ที่คุณเคยเจอ มานั่งแกะ HTML หรือไม่?
            </p>
          </div>
        </div>

        {/* Our Mission */}
        <div className="bg-gray-900 border border-green-400 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-green-400">
            🎯 พันธกิจของเรา
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-4">🛡️</div>
              <h4 className="text-lg font-bold mb-2 text-green-400">ป้องกัน</h4>
              <p className="text-white text-sm">
                สร้างผู้เชี่ยวชาญด้านการป้องกันที่เข้าใจการโจมตีอย่างลึกซึ้ง
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-4">🎓</div>
              <h4 className="text-lg font-bold mb-2 text-green-400">ศึกษา</h4>
              <p className="text-white text-sm">
                ให้ความรู้ที่ถูกต้องและมีจริยธรรมในการใช้เทคโนโลยี
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-4">🤝</div>
              <h4 className="text-lg font-bold mb-2 text-green-400">ชุมชน</h4>
              <p className="text-white text-sm">
                สร้างชุมชนนักความปลอดภัยที่มีความรับผิดชอบ
              </p>
            </div>
          </div>
        </div>

        {/* Ethics & Legal */}
        <div className="bg-red-900 border border-red-400 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-red-400">
            ⚖️ จริยธรรมและกฎหมาย
          </h2>
          <div className="space-y-4 text-white">
            <p className="text-red-200">
              <strong>คำเตือนสำคัญ:</strong> การใช้ความรู้ด้านความปลอดภัยในทางที่ผิด 
              อาจมีผลกระทบทางกฎหมายและจริยธรรมอย่างร้ายแรง
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-bold mb-3 text-green-400">✅ การใช้งานที่ถูกต้อง</h4>
                <ul className="space-y-1 text-sm">
                  <li>• ทดสอบระบบของตัวเองหรือที่ได้รับอนุญาต</li>
                  <li>• เข้าร่วม Bug Bounty Programs</li>
                  <li>• การศึกษาในสภาพแวดล้อมที่ควบคุม</li>
                  <li>• Responsible Disclosure</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-bold mb-3 text-red-400">❌ การใช้งานที่ผิด</h4>
                <ul className="space-y-1 text-sm">
                  <li>• เจาะระบบโดยไม่ได้รับอนุญาต</li>
                  <li>• ขโมยหรือทำลายข้อมูล</li>
                  <li>• ใช้เพื่อผลประโยชน์ส่วนตัว</li>
                  <li>• แพร่กระจายมัลแวร์</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Community */}
        <div className="bg-gray-900 border border-green-400 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-green-400">
            🌐 เข้าร่วมชุมชน
          </h2>
          <div className="text-center">
            <p className="text-white mb-6">
              เข้าร่วมกับเราในการสร้างโลกไซเบอร์ที่ปลอดภัยและมีจริยธรรม
            </p>
            <div className="space-y-2 text-green-400">
              <p>📧 Email: security@hackerlab.th</p>
              <p>💬 Discord: HackerLab Community</p>
              <p>📚 GitHub: github.com/hackerlab-th</p>
            </div>
            <div className="mt-6 text-sm text-gray-400">
              <p>
                "ความรู้คือพลัง แต่ความรับผิดชอบคือสิ่งที่ทำให้พลังนั้นมีค่า"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;