import React, { useState, useRef, useEffect } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: 'javascript' | 'typescript' | 'css' | 'html';
  theme?: 'dark' | 'hacker';
  readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = 'javascript',
  theme = 'hacker',
  readOnly = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lineNumbers, setLineNumbers] = useState<number[]>([]);

  useEffect(() => {
    const lines = value.split('\n').length;
    setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1));
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const getLanguageIcon = () => {
    switch (language) {
      case 'javascript': return '🟨';
      case 'typescript': return '🔷';
      case 'css': return '🎨';
      case 'html': return '🌐';
      default: return '💻';
    }
  };

  const themeClasses = theme === 'hacker' 
    ? 'bg-black text-green-400 border-green-500'
    : 'bg-gray-900 text-gray-100 border-gray-600';

  return (
    <div className={`border rounded-lg overflow-hidden ${themeClasses}`}>
      {/* Header */}
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-600 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm">{getLanguageIcon()}</span>
          <span className="text-sm text-gray-400">
            {language}.{language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex">
        {/* Line Numbers */}
        <div className="bg-gray-800 px-3 py-4 text-right text-sm text-gray-500 font-mono select-none">
          {lineNumbers.map((num) => (
            <div key={num} className="leading-6">
              {num}
            </div>
          ))}
        </div>

        {/* Code Area */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-full h-64 p-4 font-mono text-sm resize-none focus:outline-none leading-6 tab-size-2 ${
              theme === 'hacker' ? 'bg-black text-green-400' : 'bg-gray-900 text-gray-100'
            }`}
            spellCheck={false}
            readOnly={readOnly}
            aria-label="Code editor textarea"
            title="Write your code here"
          />
        </div>
      </div>
    </div>
  );
};