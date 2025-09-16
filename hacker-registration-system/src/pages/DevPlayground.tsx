import React, { useState, useEffect } from 'react';
import TerminalLayout from '../components/ui/TerminalLayout';
import ModernButton from '../components/ui/ModernButton';
import { PlayIcon, CodeIcon, CheckIcon, ZapIcon, RocketIcon } from '../components/ui/Icons';

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  code: string;
  solution: string;
  hint: string;
  category: 'javascript' | 'react' | 'css' | 'security';
}

const challenges: Challenge[] = [
  {
    id: 'js-basics-1',
    title: 'Hello Hacker World',
    description: 'สร้างฟังก์ชันที่รับชื่อและส่งคืนข้อความทักทาย',
    difficulty: 'beginner',
    category: 'javascript',
    code: `// สร้างฟังก์ชัน greetHacker ที่รับ parameter name
// และ return "Hello, [name]! Welcome to Goonee Security"

function greetHacker(name) {
  // เขียนโค้ดที่นี่
}

// ทดสอบ
console.log(greetHacker("Neo"));`,
    solution: `function greetHacker(name) {
  return \`Hello, \${name}! Welcome to Goonee Security\`;
}`,
    hint: 'ใช้ template literals (``) และ ${} สำหรับ string interpolation',
  },
  {
    id: 'js-array-1',
    title: 'Hacker Tools Array',
    description: 'จัดการ array ของเครื่องมือ hacker',
    difficulty: 'beginner',
    category: 'javascript',
    code: `// มี array ของเครื่องมือ hacker
const hackerTools = ['nmap', 'wireshark', 'metasploit', 'burp suite'];

// 1. เพิ่ม 'kali linux' เข้าไปใน array
// 2. หาตำแหน่งของ 'wireshark'
// 3. สร้าง array ใหม่ที่มีเฉพาะเครื่องมือที่มีตัวอักษรมากกว่า 4 ตัว

// เขียนโค้ดที่นี่`,
    solution: `hackerTools.push('kali linux');
const wiresharkIndex = hackerTools.indexOf('wireshark');
const longNameTools = hackerTools.filter(tool => tool.length > 4);`,
    hint: 'ใช้ push(), indexOf(), และ filter() methods',
  },
  {
    id: 'react-state-1',
    title: 'Terminal Counter Component',
    description: 'สร้าง React component ที่มี counter แบบ terminal',
    difficulty: 'intermediate',
    category: 'react',
    code: `import React, { useState } from 'react';

// สร้าง TerminalCounter component ที่:
// 1. มี state สำหรับเก็บ count (เริ่มต้นที่ 0)
// 2. มีปุ่ม + และ - สำหรับเพิ่ม/ลด count
// 3. แสดงผลแบบ terminal style

function TerminalCounter() {
  // เขียนโค้ดที่นี่
  
  return (
    <div className="terminal-counter">
      {/* JSX ที่นี่ */}
    </div>
  );
}

export default TerminalCounter;`,
    solution: `function TerminalCounter() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="terminal-counter bg-black text-green-400 p-4 font-mono">
      <div className="mb-2">
        <span className="text-green-500">root@goonee:~$ </span>
        <span>count = {count}</span>
      </div>
      <div className="space-x-2">
        <button 
          onClick={() => setCount(count - 1)}
          className="bg-red-600 text-white px-2 py-1 rounded"
        >
          [-]
        </button>
        <button 
          onClick={() => setCount(count + 1)}
          className="bg-green-600 text-white px-2 py-1 rounded"
        >
          [+]
        </button>
      </div>
    </div>
  );
}`,
    hint: 'ใช้ useState hook และ onClick events',
  },
  {
    id: 'css-animation-1',
    title: 'Matrix Rain Effect',
    description: 'สร้าง CSS animation แบบ Matrix rain',
    difficulty: 'advanced',
    category: 'css',
    code: `/* สร้าง CSS animation สำหรับ Matrix rain effect
   ที่ทำให้ตัวอักษรตกลงมาจากด้านบน */

.matrix-rain {
  /* เขียน CSS ที่นี่ */
}

.matrix-char {
  /* เขียน CSS ที่นี่ */
}

@keyframes /* ชื่อ animation */ {
  /* เขียน keyframes ที่นี่ */
}`,
    solution: `.matrix-rain {
  position: relative;
  background: #000;
  overflow: hidden;
  height: 100vh;
}

.matrix-char {
  position: absolute;
  color: #00ff00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  animation: fall 3s linear infinite;
}

@keyframes fall {
  0% {
    transform: translateY(-100vh);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh);
    opacity: 0;
  }
}`,
    hint: 'ใช้ position: absolute, transform, และ @keyframes',
  },
  {
    id: 'security-1',
    title: 'Input Validation',
    description: 'สร้างฟังก์ชันตรวจสอบความปลอดภัยของ input',
    difficulty: 'intermediate',
    category: 'security',
    code: `// สร้างฟังก์ชัน validateInput ที่ตรวจสอบ:
// 1. ไม่มี script tags
// 2. ไม่มี SQL injection patterns
// 3. ความยาวไม่เกิน maxLength

function validateInput(input, maxLength = 100) {
  // เขียนโค้ดที่นี่
  // return { isValid: boolean, errors: string[] }
}

// ทดสอบ
console.log(validateInput("<script>alert('xss')</script>"));
console.log(validateInput("SELECT * FROM users"));`,
    solution: `function validateInput(input, maxLength = 100) {
  const errors = [];
  
  // ตรวจสอบ script tags
  if (/<script.*?>.*?</script>/gi.test(input)) {
    errors.push('Script tags are not allowed');
  }
  
  // ตรวจสอบ SQL injection patterns
  const sqlPatterns = /('|(\\-\\-)|(;)|(\\|)|(\\*)|(%))/gi;
  if (sqlPatterns.test(input)) {
    errors.push('Potentially dangerous SQL characters detected');
  }
  
  // ตรวจสอบความยาว
  if (input.length > maxLength) {
    errors.push(\`Input exceeds maximum length of \${maxLength}\`);
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}`,
    hint: 'ใช้ regular expressions และ array methods',
  },
];

export const DevPlayground: React.FC = () => {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge>(challenges[0]);
  const [userCode, setUserCode] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  useEffect(() => {
    setUserCode(selectedChallenge.code);
    setOutput('');
    setShowSolution(false);
    setShowHint(false);
  }, [selectedChallenge]);

  const runCode = () => {
    try {
      // สร้าง console.log mock
      const logs: string[] = [];
      const mockConsole = {
        log: (...args: unknown[]) => {
          logs.push(args.map(arg => String(arg)).join(' '));
        },
      };

      // รัน code ใน isolated context
      const func = new Function('console', userCode);
      func(mockConsole);

      setOutput(logs.join('\n') || 'Code executed successfully!');
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-400';
      case 'intermediate':
        return 'text-yellow-400';
      case 'advanced':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'javascript':
        return '🟨';
      case 'react':
        return '⚛️';
      case 'css':
        return '🎨';
      case 'security':
        return '🔒';
      default:
        return '💻';
    }
  };

  return (
    <TerminalLayout>
      <div className="min-h-screen bg-black text-green-400 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-green-500">
              🚀 Dev Playground - Goonee Security
            </h1>
            <p className="text-green-300">เรียนรู้การเขียนโปรแกรมผ่านการแก้ปัญหาแบบ interactive</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Challenge List */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900 border border-green-500 rounded-lg p-4">
                <h2 className="text-xl font-bold mb-4 text-green-400">📚 Challenges</h2>
                <div className="space-y-3">
                  {challenges.map(challenge => (
                    <ModernButton
                      key={challenge.id}
                      onClick={() => setSelectedChallenge(challenge)}
                      variant={selectedChallenge.id === challenge.id ? 'primary' : 'ghost'}
                      size="md"
                      fullWidth={true}
                      className="text-left justify-start"
                      icon={selectedChallenge.id === challenge.id ? <CheckIcon size={16} /> : undefined}
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">
                            {getCategoryIcon(challenge.category)} {challenge.title}
                          </span>
                          <span className={`text-xs ${getDifficultyColor(challenge.difficulty)}`}>
                            {challenge.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2">{challenge.description}</p>
                      </div>
                    </ModernButton>
                  ))}
                </div>
              </div>
            </div>

            {/* Code Editor */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900 border border-green-500 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-green-400">
                    {getCategoryIcon(selectedChallenge.category)} {selectedChallenge.title}
                  </h2>
                  <span
                    className={`px-2 py-1 rounded text-xs ${getDifficultyColor(selectedChallenge.difficulty)}`}
                  >
                    {selectedChallenge.difficulty}
                  </span>
                </div>

                <p className="text-green-300 mb-4">{selectedChallenge.description}</p>

                {/* Code Editor */}
                <div className="mb-4">
                  <div className="bg-black border border-gray-600 rounded">
                    <div className="bg-gray-800 px-3 py-2 border-b border-gray-600">
                      <span className="text-xs text-gray-400">editor.js</span>
                    </div>
                    <textarea
                      value={userCode}
                      onChange={e => setUserCode(e.target.value)}
                      className="w-full h-64 bg-black text-green-400 font-mono text-sm p-4 resize-none focus:outline-none"
                      spellCheck={false}
                      title="Code editor - Write your JavaScript code here"
                      placeholder="Write your code here..."
                    />
                  </div>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <ModernButton
                    onClick={runCode}
                    variant="primary"
                    size="md"
                    icon={<PlayIcon size={16} />}
                    glitch={true}
                  >
                    Run Code
                  </ModernButton>
                  <ModernButton
                    onClick={() => setShowHint(!showHint)}
                    variant="warning"
                    size="md"
                    icon={<ZapIcon size={16} />}
                  >
                    {showHint ? 'Hide' : 'Show'} Hint
                  </ModernButton>
                  <ModernButton
                    onClick={() => setShowSolution(!showSolution)}
                    variant="danger"
                    size="md"
                    icon={<CodeIcon size={16} />}
                  >
                    {showSolution ? 'Hide' : 'Show'} Solution
                  </ModernButton>
                  <ModernButton
                    onClick={() => setUserCode(selectedChallenge.code)}
                    variant="secondary"
                    size="md"
                    icon={<RocketIcon size={16} />}
                  >
                    Reset
                  </ModernButton>
                </div>

                {/* Hint */}
                {showHint && (
                  <div className="bg-yellow-900 border border-yellow-500 rounded p-3 mb-4">
                    <h4 className="font-semibold text-yellow-400 mb-2">💡 Hint:</h4>
                    <p className="text-yellow-200 text-sm">{selectedChallenge.hint}</p>
                  </div>
                )}

                {/* Solution */}
                {showSolution && (
                  <div className="bg-blue-900 border border-blue-500 rounded p-3 mb-4">
                    <h4 className="font-semibold text-blue-400 mb-2">🔍 Solution:</h4>
                    <pre className="text-blue-200 text-sm font-mono whitespace-pre-wrap">
                      {selectedChallenge.solution}
                    </pre>
                  </div>
                )}

                {/* Output */}
                <div className="bg-black border border-gray-600 rounded">
                  <div className="bg-gray-800 px-3 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400">console output</span>
                  </div>
                  <div className="p-4 min-h-[100px]">
                    <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">
                      {output || 'Click "Run Code" to see output...'}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Resources */}
          <div className="mt-8 bg-gray-900 border border-green-500 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-green-400">📖 Learning Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800 p-4 rounded border border-gray-600">
                <h3 className="font-semibold text-green-400 mb-2">🟨 JavaScript</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Variables & Functions</li>
                  <li>• Arrays & Objects</li>
                  <li>• Async/Await</li>
                  <li>• DOM Manipulation</li>
                </ul>
              </div>
              <div className="bg-gray-800 p-4 rounded border border-gray-600">
                <h3 className="font-semibold text-green-400 mb-2">⚛️ React</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Components & JSX</li>
                  <li>• State & Props</li>
                  <li>• Hooks</li>
                  <li>• Event Handling</li>
                </ul>
              </div>
              <div className="bg-gray-800 p-4 rounded border border-gray-600">
                <h3 className="font-semibold text-green-400 mb-2">🎨 CSS</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Flexbox & Grid</li>
                  <li>• Animations</li>
                  <li>• Responsive Design</li>
                  <li>• CSS Variables</li>
                </ul>
              </div>
              <div className="bg-gray-800 p-4 rounded border border-gray-600">
                <h3 className="font-semibold text-green-400 mb-2">🔒 Security</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Input Validation</li>
                  <li>• XSS Prevention</li>
                  <li>• SQL Injection</li>
                  <li>• Authentication</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TerminalLayout>
  );
};
