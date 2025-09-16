import React, { useState, useEffect, useRef } from 'react';

interface TypingGameProps {
  onComplete?: (wpm: number, accuracy: number) => void;
}

const codeSnippets = [
  {
    id: 1,
    title: 'JavaScript Function',
    code: `function hackTheMatrix(password) {
  const encrypted = btoa(password);
  return encrypted.split('').reverse().join('');
}`
  },
  {
    id: 2,
    title: 'SQL Injection Prevention',
    code: `const query = 'SELECT * FROM users WHERE id = ?';
db.prepare(query).get(userId);`
  },
  {
    id: 3,
    title: 'React Component',
    code: `const HackerComponent = ({ data }) => {
  const [state, setState] = useState(null);
  return <div>{data}</div>;
};`
  },
  {
    id: 4,
    title: 'Security Headers',
    code: `app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});`
  },
  {
    id: 5,
    title: 'Encryption Function',
    code: `import crypto from 'crypto';
const hash = crypto.createHash('sha256');
hash.update(data);
return hash.digest('hex');`
  }
];

export const HackerTypingGame: React.FC<TypingGameProps> = ({ onComplete }) => {
  const [currentSnippet, setCurrentSnippet] = useState(codeSnippets[0]);
  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [errors, setErrors] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const targetText = currentSnippet.code;

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameStarted]);

  const startGame = () => {
    setGameStarted(true);
    setStartTime(new Date());
    setUserInput('');
    setCurrentIndex(0);
    setErrors(0);
    setIsCompleted(false);
    setEndTime(null);
  };

  const resetGame = () => {
    setGameStarted(false);
    setUserInput('');
    setCurrentIndex(0);
    setErrors(0);
    setIsCompleted(false);
    setStartTime(null);
    setEndTime(null);
  };

  const nextSnippet = () => {
    const nextIndex = (codeSnippets.indexOf(currentSnippet) + 1) % codeSnippets.length;
    setCurrentSnippet(codeSnippets[nextIndex]);
    resetGame();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!gameStarted || isCompleted) return;

    const value = e.target.value;
    setUserInput(value);

    // Count errors
    let errorCount = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== targetText[i]) {
        errorCount++;
      }
    }
    setErrors(errorCount);
    setCurrentIndex(value.length);

    // Check if completed
    if (value === targetText) {
      const endTime = new Date();
      setEndTime(endTime);
      setIsCompleted(true);

      if (startTime) {
        const timeInMinutes = (endTime.getTime() - startTime.getTime()) / 60000;
        const wordsTyped = targetText.split(' ').length;
        const wpm = Math.round(wordsTyped / timeInMinutes);
        const accuracy = Math.round(((targetText.length - errors) / targetText.length) * 100);
        
        if (onComplete) {
          onComplete(wpm, accuracy);
        }
      }
    }
  };

  const getCharacterClass = (index: number) => {
    if (index < userInput.length) {
      return userInput[index] === targetText[index] 
        ? 'text-green-400 bg-green-900 bg-opacity-30' 
        : 'text-red-400 bg-red-900 bg-opacity-30';
    } else if (index === currentIndex) {
      return 'bg-green-500 text-black animate-pulse';
    }
    return 'text-gray-400';
  };

  const calculateWPM = () => {
    if (!startTime || !endTime) return 0;
    const timeInMinutes = (endTime.getTime() - startTime.getTime()) / 60000;
    const wordsTyped = targetText.split(' ').length;
    return Math.round(wordsTyped / timeInMinutes);
  };

  const calculateAccuracy = () => {
    if (userInput.length === 0) return 100;
    return Math.round(((userInput.length - errors) / userInput.length) * 100);
  };

  return (
    <div className="bg-gray-900 border border-green-500 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-green-400">
          ⌨️ Hacker Typing Challenge
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={nextSnippet}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          >
            Next Code
          </button>
          <button
            onClick={resetGame}
            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-green-300 mb-2">
          📝 {currentSnippet.title}
        </h3>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-black p-3 rounded border border-gray-600">
            <div className="text-xs text-gray-400">WPM</div>
            <div className="text-lg font-bold text-green-400">
              {isCompleted ? calculateWPM() : 0}
            </div>
          </div>
          <div className="bg-black p-3 rounded border border-gray-600">
            <div className="text-xs text-gray-400">Accuracy</div>
            <div className="text-lg font-bold text-green-400">
              {calculateAccuracy()}%
            </div>
          </div>
          <div className="bg-black p-3 rounded border border-gray-600">
            <div className="text-xs text-gray-400">Errors</div>
            <div className="text-lg font-bold text-red-400">
              {errors}
            </div>
          </div>
          <div className="bg-black p-3 rounded border border-gray-600">
            <div className="text-xs text-gray-400">Progress</div>
            <div className="text-lg font-bold text-blue-400">
              {Math.round((currentIndex / targetText.length) * 100)}%
            </div>
          </div>
        </div>

        {/* Code Display */}
        <div className="bg-black border border-gray-600 rounded p-4 mb-4">
          <div className="bg-gray-800 px-3 py-1 border-b border-gray-600 mb-3">
            <span className="text-xs text-gray-400">Target Code:</span>
          </div>
          <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {targetText.split('').map((char, index) => (
              <span key={index} className={getCharacterClass(index)}>
                {char}
              </span>
            ))}
          </pre>
        </div>

        {/* Input Area */}
        {!gameStarted ? (
          <div className="text-center">
            <button
              onClick={startGame}
              className="px-6 py-3 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition-colors"
            >
              🚀 Start Typing Challenge
            </button>
          </div>
        ) : (
          <div>
            <div className="bg-black border border-gray-600 rounded">
              <div className="bg-gray-800 px-3 py-1 border-b border-gray-600">
                <span className="text-xs text-gray-400">Your Code:</span>
              </div>
              <textarea
                ref={inputRef}
                value={userInput}
                onChange={handleInputChange}
                className="w-full h-32 bg-black text-green-400 font-mono text-sm p-4 resize-none focus:outline-none"
                placeholder="Start typing the code above..."
                disabled={isCompleted}
              />
            </div>
            
            {isCompleted && (
              <div className="mt-4 p-4 bg-green-900 border border-green-500 rounded">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-green-400 mb-2">
                    🎉 Challenge Completed!
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Words Per Minute:</span>
                      <span className="ml-2 font-bold text-green-400">{calculateWPM()}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Accuracy:</span>
                      <span className="ml-2 font-bold text-green-400">{calculateAccuracy()}%</span>
                    </div>
                  </div>
                  <button
                    onClick={nextSnippet}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Try Next Challenge
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-600">
        <h4 className="text-sm font-semibold text-green-400 mb-2">💡 Tips:</h4>
        <ul className="text-xs text-gray-300 space-y-1">
          <li>• Focus on accuracy first, speed will come naturally</li>
          <li>• Use proper finger positioning for better typing</li>
          <li>• Practice regularly to improve muscle memory</li>
          <li>• Don't look at the keyboard while typing</li>
        </ul>
      </div>
    </div>
  );
};