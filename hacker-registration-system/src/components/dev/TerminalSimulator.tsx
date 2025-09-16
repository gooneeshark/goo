import React, { useState, useRef, useEffect } from 'react';

interface Command {
  command: string;
  output: string;
  timestamp: Date;
}

interface TerminalSimulatorProps {
  initialCommands?: Command[];
  prompt?: string;
  onCommand?: (command: string) => string | Promise<string>;
}

const defaultCommands = {
  help: `Available commands:
  help          - Show this help message
  clear         - Clear terminal
  whoami        - Show current user
  ls            - List files
  pwd           - Show current directory
  date          - Show current date
  echo [text]   - Echo text
  hack          - Start hacking simulation
  matrix        - Matrix rain effect
  skills        - Show programming skills
  projects      - List current projects`,
  
  whoami: 'goonee_hacker',
  
  ls: `total 8
drwxr-xr-x  2 goonee goonee 4096 Dec 15 10:30 projects/
drwxr-xr-x  2 goonee goonee 4096 Dec 15 10:30 tools/
-rw-r--r--  1 goonee goonee  256 Dec 15 10:30 README.md
-rw-r--r--  1 goonee goonee  512 Dec 15 10:30 secrets.txt`,
  
  pwd: '/home/goonee/security',
  
  date: () => new Date().toString(),
  
  hack: `Initializing hacking sequence...
[████████████████████████████████████████] 100%
Access granted to mainframe.
Welcome to the matrix, Neo.`,
  
  matrix: `Wake up, Neo...
The Matrix has you...
Follow the white rabbit.
Knock, knock, Neo.`,
  
  skills: `Programming Skills:
┌─────────────────┬──────────┐
│ Language        │ Level    │
├─────────────────┼──────────┤
│ JavaScript      │ ████████ │
│ TypeScript      │ ███████  │
│ React           │ ████████ │
│ Node.js         │ ██████   │
│ Python          │ █████    │
│ CSS/HTML        │ ████████ │
│ Security        │ ██████   │
└─────────────────┴──────────┘`,
  
  projects: `Current Projects:
1. Goonee Security Platform
2. Member Widget System
3. Hacker Registration Portal
4. Dev Playground
5. Terminal Simulator

Status: All systems operational 🟢`
};

export const TerminalSimulator: React.FC<TerminalSimulatorProps> = ({
  initialCommands = [],
  prompt = 'goonee@security:~$',
  onCommand
}) => {
  const [commands, setCommands] = useState<Command[]>(initialCommands);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isMatrixMode, setIsMatrixMode] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commands]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const executeCommand = async (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    let output = '';

    if (onCommand) {
      output = await onCommand(cmd);
    } else {
      // Built-in commands
      if (trimmedCmd === 'clear') {
        setCommands([]);
        return;
      } else if (trimmedCmd.startsWith('echo ')) {
        output = cmd.substring(5);
      } else if (trimmedCmd === 'matrix') {
        setIsMatrixMode(true);
        setTimeout(() => setIsMatrixMode(false), 5000);
        output = defaultCommands.matrix;
      } else if (defaultCommands[trimmedCmd as keyof typeof defaultCommands]) {
        const result = defaultCommands[trimmedCmd as keyof typeof defaultCommands];
        output = typeof result === 'function' ? result() : result;
      } else if (trimmedCmd === '') {
        output = '';
      } else {
        output = `Command not found: ${cmd}. Type 'help' for available commands.`;
      }
    }

    const newCommand: Command = {
      command: cmd,
      output,
      timestamp: new Date()
    };

    setCommands(prev => [...prev, newCommand]);
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(currentInput);
      setCurrentInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentInput('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex]);
        }
      }
    }
  };

  const MatrixRain = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const [matrixChars, setMatrixChars] = useState<string[]>([]);

    useEffect(() => {
      const interval = setInterval(() => {
        setMatrixChars(prev => {
          const newChars = [...prev];
          for (let i = 0; i < 5; i++) {
            newChars.push(chars[Math.floor(Math.random() * chars.length)]);
          }
          return newChars.slice(-100); // Keep only last 100 chars
        });
      }, 100);

      return () => clearInterval(interval);
    }, []);

    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {matrixChars.map((char, index) => (
          <span
            key={index}
            className="absolute text-green-400 font-mono animate-pulse matrix-char"
            data-left={Math.random() * 100}
            data-top={Math.random() * 100}
            data-delay={Math.random() * 2}
          >
            {char}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="relative bg-black text-green-400 font-mono text-sm h-96 border border-green-500 rounded-lg overflow-hidden">
      {isMatrixMode && <MatrixRain />}
      
      <div className="bg-gray-800 px-4 py-2 border-b border-green-500 flex items-center justify-between">
        <span className="text-green-400">Terminal Simulator</span>
        <div className="flex space-x-2">
          <button
            onClick={() => setCommands([])}
            className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
          >
            Clear
          </button>
          <button
            onClick={() => executeCommand('help')}
            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
          >
            Help
          </button>
        </div>
      </div>

      <div
        ref={terminalRef}
        className="p-4 h-full overflow-y-auto"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Welcome Message */}
        {commands.length === 0 && (
          <div className="mb-4">
            <div className="text-green-500">
              Welcome to Goonee Security Terminal Simulator
            </div>
            <div className="text-green-300 text-xs mt-1">
              Type 'help' to see available commands
            </div>
          </div>
        )}

        {/* Command History */}
        {commands.map((cmd, index) => (
          <div key={index} className="mb-2">
            <div className="flex items-center">
              <span className="text-green-500">{prompt}</span>
              <span className="ml-2">{cmd.command}</span>
            </div>
            {cmd.output && (
              <div className="mt-1 whitespace-pre-wrap text-green-300">
                {cmd.output}
              </div>
            )}
          </div>
        ))}

        {/* Current Input */}
        <div className="flex items-center">
          <span className="text-green-500">{prompt}</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="ml-2 bg-transparent border-none outline-none flex-1 text-green-400 terminal-input"
            autoComplete="off"
            aria-label="Terminal command input"
            title="Enter terminal command"
            placeholder="Type command..."
          />
          <span className="animate-pulse">█</span>
        </div>
      </div>
    </div>
  );
};