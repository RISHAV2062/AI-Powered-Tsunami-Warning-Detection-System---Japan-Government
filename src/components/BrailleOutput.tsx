import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain as Braille, Copy, Download, Settings, RefreshCw, Volume2, Eye, Maximize2, Minimize2, RotateCcw, Save, Upload, Printer, Share, BookOpen, Type, Grid3X3, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface BrailleOutputProps {
  code: string;
  language: string;
  highContrast: boolean;
}

interface BrailleCharacter {
  unicode: string;
  dots: number[];
  ascii: string;
  description: string;
}

interface BrailleSettings {
  grade: 'grade1' | 'grade2';
  cellsPerLine: number;
  lineSpacing: number;
  fontSize: number;
  showDotNumbers: boolean;
  showAsciiEquivalent: boolean;
  contractionsEnabled: boolean;
  mathNotation: boolean;
  computerBraille: boolean;
  unicode8Dot: boolean;
  tactileFeedback: boolean;
  audioFeedback: boolean;
  autoRefresh: boolean;
  preserveFormatting: boolean;
  showLineNumbers: boolean;
  compactMode: boolean;
}

interface BrailleContext {
  line: number;
  column: number;
  indentLevel: number;
  inString: boolean;
  inComment: boolean;
  inFunction: boolean;
  inClass: boolean;
  parenthesesLevel: number;
  bracketsLevel: number;
  bracesLevel: number;
}

const BrailleOutput: React.FC<BrailleOutputProps> = ({
  code,
  language,
  highContrast
}) => {
  const [brailleText, setBrailleText] = useState<string>('');
  const [brailleLines, setBrailleLines] = useState<string[]>([]);
  const [settings, setSettings] = useState<BrailleSettings>({
    grade: 'grade2',
    cellsPerLine: 40,
    lineSpacing: 1.5,
    fontSize: 24,
    showDotNumbers: false,
    showAsciiEquivalent: false,
    contractionsEnabled: true,
    mathNotation: true,
    computerBraille: true,
    unicode8Dot: false,
    tactileFeedback: false,
    audioFeedback: true,
    autoRefresh: true,
    preserveFormatting: true,
    showLineNumbers: true,
    compactMode: false
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPosition, setCurrentPosition] = useState({ line: 0, cell: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [conversionStats, setConversionStats] = useState({
    totalCharacters: 0,
    brailleCells: 0,
    contractions: 0,
    accuracy: 0,
    compressionRatio: 0
  });
  const [brailleHistory, setBrailleHistory] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [replacementText, setReplacementText] = useState('');
  const [customContractions, setCustomContractions] = useState<{ [key: string]: string }>({});
  const [virtualDisplay, setVirtualDisplay] = useState<BrailleCharacter[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const outputRef = useRef<HTMLDivElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);

  // Enhanced Braille character mappings
  const brailleMappings: { [key: string]: BrailleCharacter } = {
    // Basic Latin alphabet
    'a': { unicode: '⠁', dots: [1], ascii: 'a', description: 'Letter A' },
    'b': { unicode: '⠃', dots: [1, 2], ascii: 'b', description: 'Letter B' },
    'c': { unicode: '⠉', dots: [1, 4], ascii: 'c', description: 'Letter C' },
    'd': { unicode: '⠙', dots: [1, 4, 5], ascii: 'd', description: 'Letter D' },
    'e': { unicode: '⠑', dots: [1, 5], ascii: 'e', description: 'Letter E' },
    'f': { unicode: '⠋', dots: [1, 2, 4], ascii: 'f', description: 'Letter F' },
    'g': { unicode: '⠛', dots: [1, 2, 4, 5], ascii: 'g', description: 'Letter G' },
    'h': { unicode: '⠓', dots: [1, 2, 5], ascii: 'h', description: 'Letter H' },
    'i': { unicode: '⠊', dots: [2, 4], ascii: 'i', description: 'Letter I' },
    'j': { unicode: '⠚', dots: [2, 4, 5], ascii: 'j', description: 'Letter J' },
    'k': { unicode: '⠅', dots: [1, 3], ascii: 'k', description: 'Letter K' },
    'l': { unicode: '⠇', dots: [1, 2, 3], ascii: 'l', description: 'Letter L' },
    'm': { unicode: '⠍', dots: [1, 3, 4], ascii: 'm', description: 'Letter M' },
    'n': { unicode: '⠝', dots: [1, 3, 4, 5], ascii: 'n', description: 'Letter N' },
    'o': { unicode: '⠕', dots: [1, 3, 5], ascii: 'o', description: 'Letter O' },
    'p': { unicode: '⠏', dots: [1, 2, 3, 4], ascii: 'p', description: 'Letter P' },
    'q': { unicode: '⠟', dots: [1, 2, 3, 4, 5], ascii: 'q', description: 'Letter Q' },
    'r': { unicode: '⠗', dots: [1, 2, 3, 5], ascii: 'r', description: 'Letter R' },
    's': { unicode: '⠎', dots: [2, 3, 4], ascii: 's', description: 'Letter S' },
    't': { unicode: '⠞', dots: [2, 3, 4, 5], ascii: 't', description: 'Letter T' },
    'u': { unicode: '⠥', dots: [1, 3, 6], ascii: 'u', description: 'Letter U' },
    'v': { unicode: '⠧', dots: [1, 2, 3, 6], ascii: 'v', description: 'Letter V' },
    'w': { unicode: '⠺', dots: [2, 4, 5, 6], ascii: 'w', description: 'Letter W' },
    'x': { unicode: '⠭', dots: [1, 3, 4, 6], ascii: 'x', description: 'Letter X' },
    'y': { unicode: '⠽', dots: [1, 3, 4, 5, 6], ascii: 'y', description: 'Letter Y' },
    'z': { unicode: '⠵', dots: [1, 3, 5, 6], ascii: 'z', description: 'Letter Z' },

    // Numbers (with number prefix ⠼)
    '1': { unicode: '⠁', dots: [1], ascii: '1', description: 'Number 1' },
    '2': { unicode: '⠃', dots: [1, 2], ascii: '2', description: 'Number 2' },
    '3': { unicode: '⠉', dots: [1, 4], ascii: '3', description: 'Number 3' },
    '4': { unicode: '⠙', dots: [1, 4, 5], ascii: '4', description: 'Number 4' },
    '5': { unicode: '⠑', dots: [1, 5], ascii: '5', description: 'Number 5' },
    '6': { unicode: '⠋', dots: [1, 2, 4], ascii: '6', description: 'Number 6' },
    '7': { unicode: '⠛', dots: [1, 2, 4, 5], ascii: '7', description: 'Number 7' },
    '8': { unicode: '⠓', dots: [1, 2, 5], ascii: '8', description: 'Number 8' },
    '9': { unicode: '⠊', dots: [2, 4], ascii: '9', description: 'Number 9' },
    '0': { unicode: '⠚', dots: [2, 4, 5], ascii: '0', description: 'Number 0' },

    // Programming symbols
    '(': { unicode: '⠷', dots: [1, 2, 3, 5, 6], ascii: '(', description: 'Left parenthesis' },
    ')': { unicode: '⠾', dots: [2, 3, 4, 5, 6], ascii: ')', description: 'Right parenthesis' },
    '[': { unicode: '⠨⠷', dots: [4, 6, 1, 2, 3, 5, 6], ascii: '[', description: 'Left bracket' },
    ']': { unicode: '⠨⠾', dots: [4, 6, 2, 3, 4, 5, 6], ascii: ']', description: 'Right bracket' },
    '{': { unicode: '⠸⠷', dots: [4, 5, 6, 1, 2, 3, 5, 6], ascii: '{', description: 'Left brace' },
    '}': { unicode: '⠸⠾', dots: [4, 5, 6, 2, 3, 4, 5, 6], ascii: '}', description: 'Right brace' },
    '=': { unicode: '⠨⠅', dots: [4, 6, 1, 3], ascii: '=', description: 'Equals sign' },
    '+': { unicode: '⠬', dots: [3, 4, 6], ascii: '+', description: 'Plus sign' },
    '-': { unicode: '⠤', dots: [3, 6], ascii: '-', description: 'Minus sign' },
    '*': { unicode: '⠔', dots: [3, 5], ascii: '*', description: 'Asterisk' },
    '/': { unicode: '⠌', dots: [3, 4], ascii: '/', description: 'Forward slash' },
    '\\': { unicode: '⠳', dots: [1, 2, 4, 5, 6], ascii: '\\', description: 'Backslash' },
    '<': { unicode: '⠈⠣', dots: [4, 2, 6], ascii: '<', description: 'Less than' },
    '>': { unicode: '⠈⠜', dots: [4, 1, 3, 5], ascii: '>', description: 'Greater than' },
    '&': { unicode: '⠯', dots: [1, 2, 3, 4, 6], ascii: '&', description: 'Ampersand' },
    '|': { unicode: '⠳', dots: [1, 2, 4, 5, 6], ascii: '|', description: 'Vertical bar' },
    '^': { unicode: '⠘', dots: [4, 5], ascii: '^', description: 'Caret' },
    '~': { unicode: '⠠⠤', dots: [6, 3, 6], ascii: '~', description: 'Tilde' },
    '!': { unicode: '⠖', dots: [2, 3, 5], ascii: '!', description: 'Exclamation mark' },
    '@': { unicode: '⠈⠁', dots: [4, 1], ascii: '@', description: 'At symbol' },
    '#': { unicode: '⠼', dots: [3, 4, 5, 6], ascii: '#', description: 'Hash/Number sign' },
    '$': { unicode: '⠫', dots: [1, 2, 4, 6], ascii: '$', description: 'Dollar sign' },
    '%': { unicode: '⠩', dots: [1, 4, 6], ascii: '%', description: 'Percent sign' },
    '"': { unicode: '⠦', dots: [2, 3, 6], ascii: '"', description: 'Quotation mark' },
    "'": { unicode: '⠄', dots: [3], ascii: "'", description: 'Apostrophe' },
    ':': { unicode: '⠒', dots: [2, 5], ascii: ':', description: 'Colon' },
    ';': { unicode: '⠆', dots: [2, 3], ascii: ';', description: 'Semicolon' },
    ',': { unicode: '⠂', dots: [2], ascii: ',', description: 'Comma' },
    '.': { unicode: '⠲', dots: [2, 5, 6], ascii: '.', description: 'Period' },
    '?': { unicode: '⠦', dots: [2, 3, 6], ascii: '?', description: 'Question mark' },
    ' ': { unicode: ' ', dots: [], ascii: ' ', description: 'Space' },
    '\t': { unicode: '⠀⠀', dots: [], ascii: '\t', description: 'Tab (2 spaces)' },
    '\n': { unicode: '\n', dots: [], ascii: '\n', description: 'New line' }
  };

  // Programming-specific contractions for Grade 2 Braille
  const programmingContractions: { [key: string]: string } = {
    'function': '⠋⠝',
    'return': '⠗⠞',
    'class': '⠉⠇',
    'public': '⠏⠃',
    'private': '⠏⠧',
    'protected': '⠏⠞',
    'static': '⠎⠞',
    'const': '⠉⠎',
    'let': '⠇⠞',
    'var': '⠧⠗',
    'if': '⠊⠋',
    'else': '⠑⠇',
    'for': '⠋⠗',
    'while': '⠺⠓',
    'do': '⠙⠕',
    'switch': '⠎⠺',
    'case': '⠉⠁',
    'break': '⠃⠅',
    'continue': '⠉⠞',
    'try': '⠞⠗',
    'catch': '⠉⠓',
    'finally': '⠋⠇',
    'throw': '⠞⠓',
    'new': '⠝⠺',
    'delete': '⠙⠇',
    'this': '⠞⠓',
    'super': '⠎⠏',
    'extends': '⠑⠭',
    'implements': '⠊⠍',
    'interface': '⠊⠞',
    'enum': '⠑⠝',
    'import': '⠊⠍',
    'export': '⠑⠭',
    'from': '⠋⠍',
    'as': '⠁⠎',
    'default': '⠙⠋',
    'async': '⠁⠎',
    'await': '⠁⠺',
    'promise': '⠏⠍',
    'undefined': '⠥⠝',
    'null': '⠝⠇',
    'true': '⠞⠗',
    'false': '⠋⠇',
    'boolean': '⠃⠇',
    'string': '⠎⠞',
    'number': '⠝⠍',
    'object': '⠕⠃',
    'array': '⠁⠗',
    'length': '⠇⠛',
    'push': '⠏⠎',
    'pop': '⠏⠕',
    'shift': '⠎⠓',
    'unshift': '⠥⠎',
    'slice': '⠎⠇',
    'splice': '⠎⠏',
    'indexOf': '⠊⠙',
    'forEach': '⠋⠑',
    'map': '⠍⠁',
    'filter': '⠋⠇',
    'reduce': '⠗⠙',
    'find': '⠋⠙',
    'console': '⠉⠕',
    'log': '⠇⠛',
    'error': '⠑⠗',
    'warn': '⠺⠗',
    'debug': '⠙⠃',
    'document': '⠙⠉',
    'window': '⠺⠙',
    'element': '⠑⠇',
    'addEventListener': '⠁⠇',
    'removeEventListener': '⠗⠇',
    'getElementById': '⠛⠊',
    'querySelector': '⠟⠎',
    'createElement': '⠉⠑',
    'appendChild': '⠁⠉',
    'removeChild': '⠗⠉',
    'innerHTML': '⠊⠓',
    'textContent': '⠞⠉',
    'setAttribute': '⠎⠁',
    'getAttribute': '⠛⠁',
    'classList': '⠉⠇',
    'style': '⠎⠞',
    'setTimeout': '⠎⠞',
    'setInterval': '⠎⠊',
    'clearTimeout': '⠉⠞',
    'clearInterval': '⠉⠊'
  };

  // Advanced Braille conversion with context awareness
  const convertToBraille = (text: string): string => {
    if (!text) return '';

    let result = '';
    let context: BrailleContext = {
      line: 1,
      column: 1,
      indentLevel: 0,
      inString: false,
      inComment: false,
      inFunction: false,
      inClass: false,
      parenthesesLevel: 0,
      bracketsLevel: 0,
      bracesLevel: 0
    };

    const lines = text.split('\n');
    const convertedLines: string[] = [];

    lines.forEach((line, lineIndex) => {
      context.line = lineIndex + 1;
      context.column = 1;
      
      // Calculate indentation
      const indent = line.match(/^\s*/)?.[0] || '';
      context.indentLevel = Math.floor(indent.length / 2);
      
      let convertedLine = '';
      let i = 0;
      
      // Add line number if enabled
      if (settings.showLineNumbers && !settings.compactMode) {
        const lineNum = (lineIndex + 1).toString().padStart(3, '0');
        convertedLine += convertNumbersToBraille(lineNum) + '⠒ ';
      }
      
      // Add indentation markers
      if (context.indentLevel > 0 && settings.preserveFormatting) {
        convertedLine += '⠀'.repeat(context.indentLevel);
      }
      
      while (i < line.length) {
        const char = line[i];
        const remaining = line.slice(i);
        
        // Update context based on character
        updateContext(context, char);
        
        // Handle multi-character tokens
        if (settings.contractionsEnabled && settings.grade === 'grade2') {
          const contraction = findLongestContraction(remaining);
          if (contraction) {
            convertedLine += contraction.braille;
            i += contraction.length;
            continue;
          }
        }
        
        // Handle programming symbols and keywords
        if (settings.computerBraille) {
          const programmingSymbol = handleProgrammingSymbol(remaining, context);
          if (programmingSymbol) {
            convertedLine += programmingSymbol.braille;
            i += programmingSymbol.length;
            continue;
          }
        }
        
        // Handle numbers
        if (char >= '0' && char <= '9') {
          const numberSequence = extractNumberSequence(remaining);
          if (numberSequence) {
            convertedLine += '⠼' + convertNumbersToBraille(numberSequence); // Number prefix
            i += numberSequence.length;
            continue;
          }
        }
        
        // Handle regular characters
        const brailleChar = brailleMappings[char.toLowerCase()];
        if (brailleChar) {
          // Handle capitalization
          if (char !== char.toLowerCase() && char.match(/[A-Z]/)) {
            convertedLine += '⠠'; // Capital indicator
          }
          convertedLine += brailleChar.unicode;
        } else {
          // Fallback for unmapped characters
          convertedLine += '⠿'; // Replacement character
        }
        
        i++;
        context.column++;
      }
      
      convertedLines.push(convertedLine);
    });

    return convertedLines.join('\n');
  };

  // Update parsing context
  const updateContext = (context: BrailleContext, char: string) => {
    switch (char) {
      case '"':
      case "'":
        if (!context.inComment) {
          context.inString = !context.inString;
        }
        break;
      case '/':
        // Simple comment detection (could be enhanced)
        context.inComment = true;
        break;
      case '\n':
        context.inComment = false;
        break;
      case '(':
        context.parenthesesLevel++;
        break;
      case ')':
        context.parenthesesLevel--;
        break;
      case '[':
        context.bracketsLevel++;
        break;
      case ']':
        context.bracketsLevel--;
        break;
      case '{':
        context.bracesLevel++;
        break;
      case '}':
        context.bracesLevel--;
        break;
    }
  };

  // Find longest matching contraction
  const findLongestContraction = (text: string): { braille: string; length: number } | null => {
    const lowerText = text.toLowerCase();
    let longestMatch = null;
    let maxLength = 0;

    // Check programming contractions first
    for (const [word, braille] of Object.entries(programmingContractions)) {
      if (lowerText.startsWith(word) && word.length > maxLength) {
        // Ensure it's a complete word
        const nextChar = text[word.length];
        if (!nextChar || !nextChar.match(/[a-zA-Z0-9_]/)) {
          longestMatch = { braille, length: word.length };
          maxLength = word.length;
        }
      }
    }

    // Check custom contractions
    for (const [word, braille] of Object.entries(customContractions)) {
      if (lowerText.startsWith(word) && word.length > maxLength) {
        const nextChar = text[word.length];
        if (!nextChar || !nextChar.match(/[a-zA-Z0-9_]/)) {
          longestMatch = { braille, length: word.length };
          maxLength = word.length;
        }
      }
    }

    return longestMatch;
  };

  // Handle programming-specific symbols
  const handleProgrammingSymbol = (text: string, context: BrailleContext): { braille: string; length: number } | null => {
    // Multi-character operators
    if (text.startsWith('==')) return { braille: '⠨⠅⠨⠅', length: 2 };
    if (text.startsWith('!=')) return { braille: '⠌⠨⠅', length: 2 };
    if (text.startsWith('<=')) return { braille: '⠈⠣⠨⠅', length: 2 };
    if (text.startsWith('>=')) return { braille: '⠈⠜⠨⠅', length: 2 };
    if (text.startsWith('++')) return { braille: '⠬⠬', length: 2 };
    if (text.startsWith('--')) return { braille: '⠤⠤', length: 2 };
    if (text.startsWith('&&')) return { braille: '⠯⠯', length: 2 };
    if (text.startsWith('||')) return { braille: '⠳⠳', length: 2 };
    if (text.startsWith('::')) return { braille: '⠒⠒', length: 2 };
    if (text.startsWith('->')) return { braille: '⠤⠈⠜', length: 2 };
    if (text.startsWith('=>')) return { braille: '⠨⠅⠈⠜', length: 2 };
    if (text.startsWith('//')) return { braille: '⠌⠌', length: 2 };
    if (text.startsWith('/*')) return { braille: '⠌⠔', length: 2 };
    if (text.startsWith('*/')) return { braille: '⠔⠌', length: 2 };

    return null;
  };

  // Extract complete number sequence
  const extractNumberSequence = (text: string): string | null => {
    const match = text.match(/^[\d.]+/);
    return match ? match[0] : null;
  };

  // Convert numbers to Braille
  const convertNumbersToBraille = (numbers: string): string => {
    return numbers.split('').map(char => {
      if (char === '.') return '⠨'; // Decimal point
      return brailleMappings[char]?.unicode || '⠿';
    }).join('');
  };

  // Generate virtual Braille display
  const generateVirtualDisplay = (text: string): BrailleCharacter[] => {
    const display: BrailleCharacter[] = [];
    const maxCells = settings.cellsPerLine * 10; // 10 lines max for display
    
    for (let i = 0; i < text.length && display.length < maxCells; i++) {
      const char = text[i];
      if (char === '\n') continue;
      
      const brailleChar = Object.values(brailleMappings).find(
        b => b.unicode === char
      ) || {
        unicode: char,
        dots: [],
        ascii: char,
        description: 'Unknown character'
      };
      
      display.push(brailleChar);
    }
    
    return display;
  };

  // Calculate conversion statistics
  const calculateStats = (originalText: string, brailleText: string) => {
    const totalChars = originalText.length;
    const brailleCells = brailleText.replace(/\s/g, '').length;
    const contractions = (originalText.match(/\b(function|return|class|const|let|var)\b/g) || []).length;
    const accuracy = Math.min(100, Math.max(0, 100 - (Math.abs(totalChars - brailleCells) / totalChars) * 100));
    const compressionRatio = totalChars > 0 ? (brailleCells / totalChars) * 100 : 0;
    
    setConversionStats({
      totalCharacters: totalChars,
      brailleCells,
      contractions,
      accuracy: Math.round(accuracy * 10) / 10,
      compressionRatio: Math.round(compressionRatio * 100) / 100
    });
  };

  // Effect to convert code to Braille
  useEffect(() => {
    if (code && settings.autoRefresh) {
      const converted = convertToBraille(code);
      setBrailleText(converted);
      setBrailleLines(converted.split('\n'));
      setVirtualDisplay(generateVirtualDisplay(converted));
      calculateStats(code, converted);
      
      // Add to history
      setBrailleHistory(prev => [converted, ...prev.slice(0, 9)]);
    }
  }, [code, settings, refreshKey]);

  // Copy Braille text to clipboard
  const copyBrailleText = async () => {
    try {
      await navigator.clipboard.writeText(brailleText);
      toast.success('Braille text copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy Braille text');
    }
  };

  // Export Braille as file
  const exportBraille = () => {
    const blob = new Blob([brailleText], { type: 'text/plain; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `braille-${language}-${Date.now()}.brf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Braille file exported');
  };

  // Search and replace in Braille text
  const searchAndReplace = () => {
    if (!searchQuery) return;
    
    const regex = new RegExp(searchQuery, 'gi');
    const replaced = brailleText.replace(regex, replacementText);
    setBrailleText(replaced);
    setBrailleLines(replaced.split('\n'));
    toast.success(`Replaced ${(brailleText.match(regex) || []).length} occurrences`);
  };

  // Manual refresh
  const manualRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.success('Braille output refreshed');
  };

  // Save settings to localStorage
  const saveSettings = () => {
    try {
      localStorage.setItem('braille-settings', JSON.stringify(settings));
      toast.success('Settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  // Load settings from localStorage
  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('braille-settings');
      if (saved) {
        setSettings(JSON.parse(saved));
        toast.success('Settings loaded');
      }
    } catch (error) {
      toast.error('Failed to load settings');
    }
  };

  return (
    <div className={`w-full h-full ${highContrast ? 'bg-black' : 'bg-gray-900'} rounded-lg overflow-hidden`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${
        highContrast ? 'border-white' : 'border-gray-700'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500 rounded-lg">
            <Braille className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`font-semibold ${highContrast ? 'text-white' : 'text-gray-100'}`}>
              Braille Output
            </h3>
            <p className={`text-sm ${highContrast ? 'text-gray-300' : 'text-gray-400'}`}>
              {settings.grade === 'grade2' ? 'Grade 2' : 'Grade 1'} • {settings.cellsPerLine} cells/line
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-lg transition-colors ${
              highContrast ? 'bg-gray-800 text-white' : 'bg-gray-700 text-gray-300'
            } hover:bg-opacity-80`}
            aria-label={isExpanded ? 'Minimize' : 'Maximize'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          
          <button
            onClick={manualRefresh}
            className={`p-2 rounded-lg transition-colors ${
              highContrast ? 'bg-gray-800 text-white' : 'bg-gray-700 text-gray-300'
            } hover:bg-opacity-80`}
            aria-label="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${
              showSettings 
                ? 'bg-purple-500 text-white' 
                : highContrast ? 'bg-gray-800 text-white' : 'bg-gray-700 text-gray-300'
            }`}
            aria-label="Toggle settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex ${isExpanded ? 'h-96' : 'h-48'}`}>
        {/* Braille Text Display */}
        <div className="flex-1 overflow-auto">
          <div
            ref={outputRef}
            className={`p-4 font-mono leading-relaxed ${
              highContrast ? 'text-white' : 'text-gray-100'
            }`}
            style={{
              fontSize: `${settings.fontSize}px`,
              lineHeight: settings.lineSpacing,
              letterSpacing: '0.1em'
            }}
          >
            {brailleLines.length > 0 ? (
              <div className="space-y-1">
                {brailleLines.map((line, index) => (
                  <div
                    key={index}
                    className={`${
                      currentPosition.line === index 
                        ? highContrast ? 'bg-white text-black' : 'bg-blue-900 bg-opacity-30' 
                        : ''
                    } ${settings.compactMode ? 'py-0' : 'py-1'} px-2 rounded`}
                    onClick={() => setCurrentPosition({ line: index, cell: 0 })}
                  >
                    {line || '⠀'} {/* Empty line placeholder */}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 mt-8">
                <Braille className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No code to convert to Braille</p>
                <p className="text-sm mt-2">Start typing in the editor</p>
              </div>
            )}
          </div>
        </div>

        {/* Virtual Braille Display */}
        {virtualDisplay.length > 0 && (
          <div className={`w-80 border-l ${highContrast ? 'border-white bg-gray-900' : 'border-gray-700 bg-gray-800'} p-4`}>
            <h4 className={`text-sm font-medium mb-3 ${highContrast ? 'text-white' : 'text-gray-200'}`}>
              Virtual Braille Display
            </h4>
            
            <div
              ref={displayRef}
              className="grid grid-cols-8 gap-1 p-3 bg-gray-900 rounded-lg border border-gray-600"
              style={{ fontFamily: 'monospace' }}
            >
              {virtualDisplay.slice(0, settings.cellsPerLine).map((char, index) => (
                <div
                  key={index}
                  className={`relative w-8 h-10 rounded border-2 ${
                    currentPosition.cell === index 
                      ? 'border-blue-400 bg-blue-900 bg-opacity-30' 
                      : 'border-gray-600 bg-gray-800'
                  } flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors`}
                  onClick={() => setCurrentPosition(prev => ({ ...prev, cell: index }))}
                  title={`${char.description} (${char.ascii})`}
                >
                  <span className="text-lg text-white select-none">
                    {char.unicode}
                  </span>
                  
                  {settings.showDotNumbers && char.dots.length > 0 && (
                    <div className="absolute -bottom-6 left-0 right-0 text-xs text-gray-400 text-center">
                      {char.dots.join('')}
                    </div>
                  )}
                  
                  {settings.showAsciiEquivalent && (
                    <div className="absolute -top-6 left-0 right-0 text-xs text-gray-400 text-center">
                      {char.ascii}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Display Controls */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={copyBrailleText}
                  className="flex-1 p-2 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
                
                <button
                  onClick={exportBraille}
                  className="flex-1 p-2 bg-green-500 text-white rounded text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
              
              {/* Search and Replace */}
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Search in Braille..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full p-2 rounded text-sm ${
                    highContrast 
                      ? 'bg-black text-white border-white' 
                      : 'bg-gray-700 text-gray-300 border-gray-600'
                  } border`}
                />
                
                <input
                  type="text"
                  placeholder="Replace with..."
                  value={replacementText}
                  onChange={(e) => setReplacementText(e.target.value)}
                  className={`w-full p-2 rounded text-sm ${
                    highContrast 
                      ? 'bg-black text-white border-white' 
                      : 'bg-gray-700 text-gray-300 border-gray-600'
                  } border`}
                />
                
                <button
                  onClick={searchAndReplace}
                  disabled={!searchQuery}
                  className="w-full p-2 bg-orange-500 text-white rounded text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Replace All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`border-t ${highContrast ? 'border-white' : 'border-gray-700'} overflow-hidden`}
          >
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Basic Settings */}
                <div>
                  <h4 className={`text-sm font-medium mb-3 ${highContrast ? 'text-white' : 'text-gray-200'}`}>
                    Basic Settings
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className={`text-xs ${highContrast ? 'text-gray-300' : 'text-gray-400'} block mb-1`}>
                        Braille Grade
                      </label>
                      <select
                        value={settings.grade}
                        onChange={(e) => setSettings(prev => ({ ...prev, grade: e.target.value as 'grade1' | 'grade2' }))}
                        className={`w-full p-2 rounded text-sm ${
                          highContrast 
                            ? 'bg-black text-white border-white' 
                            : 'bg-gray-700 text-gray-300 border-gray-600'
                        } border`}
                      >
                        <option value="grade1">Grade 1 (Uncontracted)</option>
                        <option value="grade2">Grade 2 (Contracted)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className={`text-xs ${highContrast ? 'text-gray-300' : 'text-gray-400'}`}>
                        Cells per Line: {settings.cellsPerLine}
                      </label>
                      <input
                        type="range"
                        min="20"
                        max="80"
                        value={settings.cellsPerLine}
                        onChange={(e) => setSettings(prev => ({ ...prev, cellsPerLine: parseInt(e.target.value) }))}
                        className="w-full mt-1"
                      />
                    </div>
                    
                    <div>
                      <label className={`text-xs ${highContrast ? 'text-gray-300' : 'text-gray-400'}`}>
                        Font Size: {settings.fontSize}px
                      </label>
                      <input
                        type="range"
                        min="12"
                        max="36"
                        value={settings.fontSize}
                        onChange={(e) => setSettings(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                        className="w-full mt-1"
                      />
                    </div>
                    
                    <div>
                      <label className={`text-xs ${highContrast ? 'text-gray-300' : 'text-gray-400'}`}>
                        Line Spacing: {settings.lineSpacing}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.1"
                        value={settings.lineSpacing}
                        onChange={(e) => setSettings(prev => ({ ...prev, lineSpacing: parseFloat(e.target.value) }))}
                        className="w-full mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Display Options */}
                <div>
                  <h4 className={`text-sm font-medium mb-3 ${highContrast ? 'text-white' : 'text-gray-200'}`}>
                    Display Options
                  </h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="show-dot-numbers"
                        checked={settings.showDotNumbers}
                        onChange={(e) => setSettings(prev => ({ ...prev, showDotNumbers: e.target.checked }))}
                      />
                      <label htmlFor="show-dot-numbers" className={`text-xs ${highContrast ? 'text-gray-300' : 'text-gray-400'}`}>
                        Show Dot Numbers
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="show-ascii"
                        checked={settings.showAsciiEquivalent}
                        onChange={(e) => setSettings(prev => ({ ...prev, showAsciiEquivalent: e.target.checked }))}
                      />
                      <label htmlFor="show-ascii" className={`text-xs ${highContrast ? 'text-gray-300' : 'text-gray-400'}`}>
                        Show ASCII Equivalent
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="show-line-numbers"
                        checked={settings.showLineNumbers}
                        onChange={(e) => setSettings(prev => ({ ...prev, showLineNumbers: e.target.checked }))}
                      />
                      <label htmlFor="show-line-numbers" className={`text-xs ${highContrast ? 'text-gray-300' : 'text-gray-400'}`}>
                        Show Line Numbers
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="preserve-formatting"
                        checked={settings.preserveFormatting}
                        onChange={(e) => setSettings(prev => ({ ...prev, preserveFormatting: e.target.checked }))}
                      />
                      <label htmlFor="preserve-formatting" className={`text-xs ${highContrast ? 'text-gray-300' : 'text-gray-400'}`}>
                        Preserve Code Formatting
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="compact-mode"
                        checked={settings.compactMode}
                        onChange={(e) => setSettings(prev => ({ ...prev, compactMode: e.target.checked }))}
                      />
                      <label htmlFor="compact-mode" className={`text-xs ${highContrast ? 'text-gray-300' : 'text-gray-400'}`}>
                        Compact Mode
                      </label>
                    </div>
                  </div>
                </div>

                {/* Advanced Features */}
                <div>
                  <h4 className={`text-sm font-medium mb-3 ${highContrast ? 'text-white' : 'text-gray-200'}`}>
                    Advanced Features
                  </h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="contractions"
                        checked={settings.contractionsEnabled}
                        onChange={(e) => setSettings(prev => ({ ...prev, contractionsEnabled: e.target.checked }))}
                      />
                      <label htmlFor="contractions" className={`text-xs ${highContrast ? 'text-gray-300' : 'text-gray-400'}`}>
                        Programming Contractions
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="math-notation"
                        checked={settings.mathNotation}
                        onChange={(e) => setSettings(prev => ({ ...prev, mathNotation: e.target.checked }))}
                      />
                      <label htmlFor="math-notation" className={`text-xs ${highContrast ? 'text-gray-300' : 'text-gray-400'}`}>
                        Math Notation
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="computer-braille"
                        checked={settings.computerBraille}
                        onChange={(e) => setSettings(prev => ({ ...prev, computerBraille: e.target.checked }))}
                      />
                      <label htmlFor="computer-braille" className={`text-xs ${highContrast ? 'text-gray-300' : 'text-gray-400'}`}>
                        Computer Braille
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="unicode-8dot"
                        checked={settings.unicode8Dot}
                        onChange={(e) => setSettings(prev => ({ ...prev, unicode8Dot: e.target.checked }))}
                      />
                      <label htmlFor="unicode-8dot" className={`text-xs ${highContrast ? 'text-gray-300' : 'text-gray-400'}`}>
                        8-Dot Unicode Braille
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="auto-refresh"
                        checked={settings.autoRefresh}
                        onChange={(e) => setSettings(prev => ({ ...prev, autoRefresh: e.target.checked }))}
                      />
                      <label htmlFor="auto-refresh" className={`text-xs ${highContrast ? 'text-gray-300' : 'text-gray-400'}`}>
                        Auto Refresh
                      </label>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={saveSettings}
                      className="w-full p-2 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Settings
                    </button>
                    
                    <button
                      onClick={loadSettings}
                      className="w-full p-2 bg-green-500 text-white rounded text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Load Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statistics Bar */}
      <div className={`flex items-center justify-between px-4 py-2 text-xs border-t ${
        highContrast ? 'bg-black border-white text-white' : 'bg-gray-800 border-gray-700 text-gray-400'
      }`}>
        <div className="flex items-center gap-4">
          <span>
            {conversionStats.totalCharacters} chars → {conversionStats.brailleCells} cells
          </span>
          <span>
            {conversionStats.contractions} contractions
          </span>
          <span>
            {conversionStats.compressionRatio}% compression
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <span>
            Accuracy: {conversionStats.accuracy}%
          </span>
          <div className="flex items-center gap-1">
            <Braille className="w-3 h-3" />
            <span>{settings.grade === 'grade2' ? 'Grade 2' : 'Grade 1'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrailleOutput;