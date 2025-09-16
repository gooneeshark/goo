import React, { useState } from 'react';

interface Skill {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  category: 'frontend' | 'backend' | 'security' | 'tools';
  prerequisites: string[];
  unlocked: boolean;
  icon: string;
}

const initialSkills: Skill[] = [
  // Frontend Skills
  {
    id: 'html-css',
    name: 'HTML & CSS',
    description: 'พื้นฐานการสร้างเว็บไซต์',
    level: 3,
    maxLevel: 5,
    category: 'frontend',
    prerequisites: [],
    unlocked: true,
    icon: '🌐',
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    description: 'ภาษาโปรแกรมสำหรับเว็บ',
    level: 4,
    maxLevel: 5,
    category: 'frontend',
    prerequisites: ['html-css'],
    unlocked: true,
    icon: '🟨',
  },
  {
    id: 'react',
    name: 'React',
    description: 'Library สำหรับสร้าง UI',
    level: 3,
    maxLevel: 5,
    category: 'frontend',
    prerequisites: ['javascript'],
    unlocked: true,
    icon: '⚛️',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    description: 'JavaScript with types',
    level: 2,
    maxLevel: 5,
    category: 'frontend',
    prerequisites: ['javascript'],
    unlocked: true,
    icon: '🔷',
  },

  // Backend Skills
  {
    id: 'nodejs',
    name: 'Node.js',
    description: 'JavaScript runtime สำหรับ backend',
    level: 2,
    maxLevel: 5,
    category: 'backend',
    prerequisites: ['javascript'],
    unlocked: true,
    icon: '🟢',
  },
  {
    id: 'database',
    name: 'Database',
    description: 'การจัดการฐานข้อมูล',
    level: 2,
    maxLevel: 5,
    category: 'backend',
    prerequisites: [],
    unlocked: true,
    icon: '🗄️',
  },
  {
    id: 'api-design',
    name: 'API Design',
    description: 'การออกแบบ REST API',
    level: 1,
    maxLevel: 5,
    category: 'backend',
    prerequisites: ['nodejs', 'database'],
    unlocked: false,
    icon: '🔌',
  },

  // Security Skills
  {
    id: 'web-security',
    name: 'Web Security',
    description: 'ความปลอดภัยเว็บไซต์',
    level: 2,
    maxLevel: 5,
    category: 'security',
    prerequisites: ['javascript'],
    unlocked: true,
    icon: '🔒',
  },
  {
    id: 'penetration-testing',
    name: 'Penetration Testing',
    description: 'การทดสอบเจาะระบบ',
    level: 1,
    maxLevel: 5,
    category: 'security',
    prerequisites: ['web-security'],
    unlocked: false,
    icon: '🎯',
  },
  {
    id: 'cryptography',
    name: 'Cryptography',
    description: 'การเข้ารหัสและถอดรหัส',
    level: 0,
    maxLevel: 5,
    category: 'security',
    prerequisites: ['web-security'],
    unlocked: false,
    icon: '🔐',
  },

  // Tools
  {
    id: 'git',
    name: 'Git',
    description: 'Version control system',
    level: 3,
    maxLevel: 5,
    category: 'tools',
    prerequisites: [],
    unlocked: true,
    icon: '📝',
  },
  {
    id: 'docker',
    name: 'Docker',
    description: 'Containerization platform',
    level: 1,
    maxLevel: 5,
    category: 'tools',
    prerequisites: ['nodejs'],
    unlocked: false,
    icon: '🐳',
  },
  {
    id: 'linux',
    name: 'Linux',
    description: 'Operating system และ command line',
    level: 2,
    maxLevel: 5,
    category: 'tools',
    prerequisites: [],
    unlocked: true,
    icon: '🐧',
  },
];

export const SkillTree: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const categories = [
    { id: 'all', name: 'All Skills', icon: '💻' },
    { id: 'frontend', name: 'Frontend', icon: '🎨' },
    { id: 'backend', name: 'Backend', icon: '⚙️' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'tools', name: 'Tools', icon: '🛠️' },
  ];

  const filteredSkills =
    selectedCategory === 'all'
      ? skills
      : skills.filter(skill => skill.category === selectedCategory);

  const upgradeSkill = (skillId: string) => {
    setSkills(prev => {
      // First, upgrade the target skill
      const skillsWithUpgrade = prev.map(skill =>
        skill.id === skillId && skill.level < skill.maxLevel
          ? { ...skill, level: skill.level + 1 }
          : skill
      );

      // Then, check if this upgrade unlocks other skills
      return skillsWithUpgrade.map(skill => {
        if (skill.prerequisites.includes(skillId) && !skill.unlocked) {
          const allPrereqsMet = skill.prerequisites.every(prereq => {
            const prereqSkill = skillsWithUpgrade.find(s => s.id === prereq);
            return prereqSkill && prereqSkill.level > 0;
          });

          if (allPrereqsMet) {
            return { ...skill, unlocked: true };
          }
        }
        return skill;
      });
    });
  };

  const getSkillProgress = (skill: Skill) => {
    return (skill.level / skill.maxLevel) * 100;
  };

  const getTotalLevel = () => {
    return skills.reduce((total, skill) => total + skill.level, 0);
  };

  const getSkillColor = (category: string) => {
    switch (category) {
      case 'frontend':
        return 'border-blue-500 bg-blue-900';
      case 'backend':
        return 'border-green-500 bg-green-900';
      case 'security':
        return 'border-red-500 bg-red-900';
      case 'tools':
        return 'border-yellow-500 bg-yellow-900';
      default:
        return 'border-gray-500 bg-gray-900';
    }
  };

  return (
    <div className="bg-black text-green-400 p-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-green-500">
            🌟 Skill Tree - Programming Journey
          </h1>
          <div className="flex items-center space-x-4 text-sm">
            <span>
              Total Level: <span className="text-green-500 font-bold">{getTotalLevel()}</span>
            </span>
            <span>
              Skills Unlocked:{' '}
              <span className="text-green-500 font-bold">
                {skills.filter(s => s.unlocked).length}/{skills.length}
              </span>
            </span>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded border transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-green-600 border-green-500 text-white'
                    : 'bg-gray-800 border-gray-600 hover:border-green-500'
                }`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Skills Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSkills.map(skill => (
                <div
                  key={skill.id}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    skill.unlocked
                      ? getSkillColor(skill.category)
                      : 'border-gray-700 bg-gray-800 opacity-50'
                  } ${selectedSkill?.id === skill.id ? 'ring-2 ring-green-400' : ''}`}
                  onClick={() => setSelectedSkill(skill)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{skill.icon}</span>
                      <h3 className="font-bold text-white">{skill.name}</h3>
                    </div>
                    <span className="text-xs px-2 py-1 bg-gray-700 rounded">
                      {skill.level}/{skill.maxLevel}
                    </span>
                  </div>

                  <p className="text-sm text-gray-300 mb-3">{skill.description}</p>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all progress-bar"
                        data-progress={getSkillProgress(skill)}
                      ></div>
                    </div>
                  </div>

                  {/* Prerequisites */}
                  {skill.prerequisites.length > 0 && (
                    <div className="mb-3">
                      <span className="text-xs text-gray-400">Prerequisites:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {skill.prerequisites.map(prereq => {
                          const prereqSkill = skills.find(s => s.id === prereq);
                          return (
                            <span
                              key={prereq}
                              className={`text-xs px-2 py-1 rounded ${
                                prereqSkill && prereqSkill.level > 0
                                  ? 'bg-green-700 text-green-200'
                                  : 'bg-red-700 text-red-200'
                              }`}
                            >
                              {prereqSkill?.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Upgrade Button */}
                  {skill.unlocked && skill.level < skill.maxLevel && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        upgradeSkill(skill.id);
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded font-semibold transition-colors"
                    >
                      ⬆️ Upgrade ({skill.level + 1}/{skill.maxLevel})
                    </button>
                  )}

                  {skill.level === skill.maxLevel && (
                    <div className="w-full bg-yellow-600 text-white py-2 px-4 rounded text-center font-semibold">
                      ✨ Mastered!
                    </div>
                  )}

                  {!skill.unlocked && (
                    <div className="w-full bg-gray-600 text-gray-300 py-2 px-4 rounded text-center">
                      🔒 Locked
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Skill Details */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-green-500 rounded-lg p-4 sticky top-4">
              {selectedSkill ? (
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-3xl">{selectedSkill.icon}</span>
                    <div>
                      <h2 className="text-xl font-bold text-white">{selectedSkill.name}</h2>
                      <span className="text-sm text-gray-400 capitalize">
                        {selectedSkill.category}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-300 mb-4">{selectedSkill.description}</p>

                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-semibold">Progress:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex-1 bg-gray-700 rounded-full h-3">
                          <div
                            className="bg-green-500 h-3 rounded-full progress-bar"
                            data-progress={getSkillProgress(selectedSkill)}
                          ></div>
                        </div>
                        <span className="text-sm">
                          {selectedSkill.level}/{selectedSkill.maxLevel}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-sm font-semibold">Status:</span>
                      <div className="mt-1">
                        {selectedSkill.unlocked ? (
                          <span className="text-green-400">🔓 Unlocked</span>
                        ) : (
                          <span className="text-red-400">🔒 Locked</span>
                        )}
                      </div>
                    </div>

                    {selectedSkill.prerequisites.length > 0 && (
                      <div>
                        <span className="text-sm font-semibold">Prerequisites:</span>
                        <div className="mt-1 space-y-1">
                          {selectedSkill.prerequisites.map(prereq => {
                            const prereqSkill = skills.find(s => s.id === prereq);
                            return (
                              <div key={prereq} className="flex items-center space-x-2">
                                <span
                                  className={
                                    prereqSkill && prereqSkill.level > 0
                                      ? 'text-green-400'
                                      : 'text-red-400'
                                  }
                                >
                                  {prereqSkill && prereqSkill.level > 0 ? '✅' : '❌'}
                                </span>
                                <span className="text-sm">{prereqSkill?.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Learning Resources */}
                    <div>
                      <span className="text-sm font-semibold">Learning Resources:</span>
                      <div className="mt-1 space-y-1 text-sm text-blue-400">
                        <div>📚 Documentation</div>
                        <div>🎥 Video Tutorials</div>
                        <div>💻 Practice Projects</div>
                        <div>🧪 Code Challenges</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <div className="text-4xl mb-4">🎯</div>
                  <p>Select a skill to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Achievement Section */}
        <div className="mt-8 bg-gray-900 border border-green-500 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-green-400">🏆 Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`p-4 rounded border ${getTotalLevel() >= 10 ? 'border-yellow-500 bg-yellow-900' : 'border-gray-600 bg-gray-800'}`}
            >
              <div className="text-2xl mb-2">🥉</div>
              <h3 className="font-semibold">Beginner Coder</h3>
              <p className="text-sm text-gray-400">Reach level 10 total</p>
              <p className="text-xs mt-1">{getTotalLevel()}/10</p>
            </div>
            <div
              className={`p-4 rounded border ${getTotalLevel() >= 25 ? 'border-yellow-500 bg-yellow-900' : 'border-gray-600 bg-gray-800'}`}
            >
              <div className="text-2xl mb-2">🥈</div>
              <h3 className="font-semibold">Intermediate Developer</h3>
              <p className="text-sm text-gray-400">Reach level 25 total</p>
              <p className="text-xs mt-1">{getTotalLevel()}/25</p>
            </div>
            <div
              className={`p-4 rounded border ${getTotalLevel() >= 50 ? 'border-yellow-500 bg-yellow-900' : 'border-gray-600 bg-gray-800'}`}
            >
              <div className="text-2xl mb-2">🥇</div>
              <h3 className="font-semibold">Expert Hacker</h3>
              <p className="text-sm text-gray-400">Reach level 50 total</p>
              <p className="text-xs mt-1">{getTotalLevel()}/50</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
