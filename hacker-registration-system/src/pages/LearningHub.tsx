import React, { useState } from 'react';
import TerminalLayout from '../components/ui/TerminalLayout';
import { DevPlayground } from './DevPlayground';
import { TerminalSimulator } from '../components/dev/TerminalSimulator';
import { SkillTree } from '../components/dev/SkillTree';
import { CodeEditor } from '../components/dev/CodeEditor';
import { HackerTypingGame } from '../components/games/HackerTypingGame';
import { MemoryGame } from '../components/games/MemoryGame';
import ModernButton from '../components/ui/ModernButton';
import { PlayIcon, CodeIcon, TerminalIcon, GameIcon, PlusIcon, MinusIcon } from '../components/ui/Icons';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'javascript' | 'react' | 'security' | 'tools';
  duration: string;
  content: string;
  code?: string;
}

const tutorials: Tutorial[] = [
  {
    id: 'js-intro',
    title: 'JavaScript พื้นฐาน',
    description: 'เรียนรู้ JavaScript จากเริ่มต้น',
    difficulty: 'beginner',
    category: 'javascript',
    duration: '30 นาที',
    content: `# JavaScript พื้นฐาน

## ตัวแปร (Variables)
JavaScript มีการประกาศตัวแปร 3 แบบ:

### let - สำหรับตัวแปรที่เปลี่ยนแปลงได้
\`\`\`javascript
let name = "Goonee";
let age = 25;
name = "Neo"; // เปลี่ยนค่าได้
\`\`\`

### const - สำหรับค่าคงที่
\`\`\`javascript
const PI = 3.14159;
const siteName = "Goonee Security";
// PI = 3.14; // Error! ไม่สามารถเปลี่ยนค่าได้
\`\`\`

### var - แบบเก่า (ไม่แนะนำ)
\`\`\`javascript
var oldStyle = "ไม่ควรใช้";
\`\`\`

## ฟังก์ชัน (Functions)
\`\`\`javascript
// Function Declaration
function greet(name) {
    return "Hello, " + name + "!";
}

// Arrow Function (แนะนำ)
const greetArrow = (name) => {
    return \`Hello, \${name}!\`;
};

// Arrow Function แบบสั้น
const greetShort = name => \`Hello, \${name}!\`;
\`\`\`

## Arrays และ Objects
\`\`\`javascript
// Array
const fruits = ["apple", "banana", "orange"];
fruits.push("grape"); // เพิ่มสมาชิก
console.log(fruits[0]); // "apple"

// Object
const person = {
    name: "Neo",
    age: 30,
    skills: ["JavaScript", "React", "Hacking"]
};
console.log(person.name); // "Neo"
\`\`\``,
    code: `// ลองเขียน JavaScript พื้นฐาน
let hackerName = "Neo";
const mission = "Save Zion";

function introduceSelf(name, mission) {
    return \`I am \${name}, my mission is to \${mission}\`;
}

console.log(introduceSelf(hackerName, mission));

// Array methods
const skills = ["JavaScript", "React", "Node.js"];
skills.forEach(skill => {
    console.log(\`Skill: \${skill}\`);
});`
  },
  {
    id: 'react-basics',
    title: 'React Components',
    description: 'สร้าง React Components แรกของคุณ',
    difficulty: 'intermediate',
    category: 'react',
    duration: '45 นาที',
    content: `# React Components

## Component คืออะไร?
Component คือชิ้นส่วนของ UI ที่สามารถนำกลับมาใช้ได้

## Function Component
\`\`\`jsx
function Welcome(props) {
    return <h1>Hello, {props.name}!</h1>;
}

// Arrow Function Component
const Welcome = ({ name }) => {
    return <h1>Hello, {name}!</h1>;
};
\`\`\`

## State Hook
\`\`\`jsx
import React, { useState } from 'react';

function Counter() {
    const [count, setCount] = useState(0);
    
    return (
        <div>
            <p>Count: {count}</p>
            <ModernButton 
              onClick={() => setCount(count + 1)}
              variant="primary"
              size="sm"
              icon={<PlusIcon size={12} />}
            >
                +1
            </ModernButton>
        </div>
    );
}
\`\`\`

## Props
\`\`\`jsx
function UserCard({ name, email, avatar }) {
    return (
        <div className="user-card">
            <img src={avatar} alt={name} />
            <h3>{name}</h3>
            <p>{email}</p>
        </div>
    );
}

// การใช้งาน
<UserCard 
    name="Neo" 
    email="neo@matrix.com" 
    avatar="/neo.jpg" 
/>
\`\`\``,
    code: `import React, { useState } from 'react';

// สร้าง HackerProfile component
function HackerProfile({ name, level, skills }) {
    const [isOnline, setIsOnline] = useState(false);
    
    return (
        <div className="hacker-profile">
            <h2>{name}</h2>
            <p>Level: {level}</p>
            <p>Status: {isOnline ? 'Online' : 'Offline'}</p>
            
            <button onClick={() => setIsOnline(!isOnline)}>
                Toggle Status
            </button>
            
            <ul>
                {skills.map(skill => (
                    <li key={skill}>{skill}</li>
                ))}
            </ul>
        </div>
    );
}

// การใช้งาน
const App = () => {
    return (
        <HackerProfile 
            name="Neo"
            level={99}
            skills={['Matrix Navigation', 'Kung Fu', 'Flying']}
        />
    );
};`
  },
  {
    id: 'web-security',
    title: 'Web Security Basics',
    description: 'ความปลอดภัยเว็บไซต์เบื้องต้น',
    difficulty: 'intermediate',
    category: 'security',
    duration: '60 นาที',
    content: `# Web Security Basics

## XSS (Cross-Site Scripting)
การโจมตีที่ใส่ JavaScript ลงในเว็บไซต์

### ป้องกัน XSS:
\`\`\`javascript
// ❌ อันตราย - ไม่ควรทำ
element.innerHTML = userInput;

// ✅ ปลอดภัย
element.textContent = userInput;

// ✅ ใช้ library สำหรับ sanitize
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);
\`\`\`

## SQL Injection
การโจมตีฐานข้อมูลผ่าน input

### ป้องกัน SQL Injection:
\`\`\`javascript
// ❌ อันตราย
const query = \`SELECT * FROM users WHERE id = \${userId}\`;

// ✅ ปลอดภัย - ใช้ Prepared Statements
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);
\`\`\`

## Input Validation
\`\`\`javascript
function validateEmail(email) {
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return emailRegex.test(email);
}

function sanitizeInput(input) {
    return input
        .trim()
        .replace(/[<>]/g, '') // ลบ < >
        .substring(0, 100); // จำกัดความยาว
}
\`\`\`

## HTTPS และ Security Headers
\`\`\`javascript
// Express.js security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});
\`\`\``,
    code: `// Security Validation Functions
function validateInput(input, type = 'text') {
    const validations = {
        email: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/,
        password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$/,
        username: /^[a-zA-Z0-9_]{3,20}$/
    };
    
    if (type === 'text') {
        return input.length > 0 && input.length <= 100;
    }
    
    return validations[type] ? validations[type].test(input) : false;
}

// XSS Protection
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ทดสอบ
console.log(validateInput('test@example.com', 'email')); // true
console.log(escapeHtml('<script>alert("xss")</script>'));`
  }
];

export const LearningHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'playground' | 'tutorials' | 'terminal' | 'skills' | 'games'>('playground');
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial>(tutorials[0]);

  const tabs = [
    { id: 'playground', name: 'Code Playground', icon: '🚀' },
    { id: 'tutorials', name: 'Tutorials', icon: '📚' },
    { id: 'terminal', name: 'Terminal', icon: '💻' },
    { id: 'skills', name: 'Skill Tree', icon: '🌟' },
    { id: 'games', name: 'Games', icon: '🎮' }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-900';
      case 'intermediate': return 'text-yellow-400 bg-yellow-900';
      case 'advanced': return 'text-red-400 bg-red-900';
      default: return 'text-gray-400 bg-gray-900';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'javascript': return '🟨';
      case 'react': return '⚛️';
      case 'security': return '🔒';
      case 'tools': return '🛠️';
      default: return '💻';
    }
  };

  return (
    <TerminalLayout>
      <div className="min-h-screen bg-black text-green-400">
        {/* Header */}
        <div className="bg-gray-900 border-b border-green-500 p-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-green-500 mb-4">
              🎓 Learning Hub - Goonee Security Academy
            </h1>
            
            {/* Tabs */}
            <div className="flex gap-2">
              {tabs.map(tab => (
                <ModernButton
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  variant={activeTab === tab.id ? 'primary' : 'ghost'}
                  size="md"
                  className="rounded-t-lg rounded-b-none border-b-2"
                >
                  {tab.icon} {tab.name}
                </ModernButton>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto p-6">
          {activeTab === 'playground' && <DevPlayground />}
          
          {activeTab === 'tutorials' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tutorial List */}
              <div className="lg:col-span-1">
                <div className="bg-gray-900 border border-green-500 rounded-lg p-4">
                  <h2 className="text-xl font-bold mb-4 text-green-400">
                    📚 Available Tutorials
                  </h2>
                  <div className="space-y-3">
                    {tutorials.map(tutorial => (
                      <ModernButton
                        key={tutorial.id}
                        onClick={() => setSelectedTutorial(tutorial)}
                        variant={selectedTutorial.id === tutorial.id ? 'neon' : 'ghost'}
                        size="md"
                        fullWidth={true}
                        className="text-left justify-start"
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm">
                              {getCategoryIcon(tutorial.category)} {tutorial.title}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(tutorial.difficulty)}`}>
                              {tutorial.difficulty}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">
                            {tutorial.description}
                          </p>
                          <span className="text-xs text-green-300">
                            ⏱️ {tutorial.duration}
                          </span>
                        </div>
                      </ModernButton>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tutorial Content */}
              <div className="lg:col-span-2">
                <div className="bg-gray-900 border border-green-500 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-green-400">
                      {getCategoryIcon(selectedTutorial.category)} {selectedTutorial.title}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded text-sm ${getDifficultyColor(selectedTutorial.difficulty)}`}>
                        {selectedTutorial.difficulty}
                      </span>
                      <span className="text-sm text-gray-400">
                        ⏱️ {selectedTutorial.duration}
                      </span>
                    </div>
                  </div>

                  {/* Tutorial Content */}
                  <div className="prose prose-invert max-w-none mb-6">
                    <div 
                      className="text-gray-300 whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ 
                        __html: selectedTutorial.content
                          .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-black p-4 rounded border border-gray-600 text-green-400 font-mono text-sm overflow-x-auto"><code>$2</code></pre>')
                          .replace(/`([^`]+)`/g, '<code class="bg-gray-800 px-2 py-1 rounded text-green-400 font-mono text-sm">$1</code>')
                          .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-green-400 mt-4 mb-2">$1</h3>')
                          .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-green-500 mt-6 mb-3">$1</h2>')
                          .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-green-500 mb-4">$1</h1>')
                      }}
                    />
                  </div>

                  {/* Interactive Code */}
                  {selectedTutorial.code && (
                    <div>
                      <h3 className="text-lg font-bold text-green-400 mb-3">
                        💻 Try it yourself:
                      </h3>
                      <CodeEditor
                        value={selectedTutorial.code}
                        onChange={() => {}} // Read-only for tutorials
                        language="javascript"
                        readOnly={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'terminal' && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-green-500 mb-2">
                  💻 Terminal Simulator
                </h2>
                <p className="text-green-300">
                  ฝึกใช้ command line และเรียนรู้คำสั่งพื้นฐาน
                </p>
              </div>
              <TerminalSimulator />
            </div>
          )}
          
          {activeTab === 'skills' && <SkillTree />}
          
          {activeTab === 'games' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-green-500 mb-4">
                  🎮 Learning Games
                </h2>
                <p className="text-green-300 mb-6">
                  Improve your skills through interactive games and challenges
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-green-400 mb-4">
                    ⌨️ Typing Challenge
                  </h3>
                  <HackerTypingGame />
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-green-400 mb-4">
                    🧠 Memory Game
                  </h3>
                  <MemoryGame />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </TerminalLayout>
  );
};