import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, ChevronRight, ChevronDown, FunctionSquare as Function, Variable, Hash, FileText, Search, Map, Layers, Code2, Braces, Archive, BookOpen, Target, Compass, Route, MapPin, Eye, EyeOff, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Settings, RefreshCw, Maximize2, Minimize2, Info, HelpCircle, Zap, Filter, SortAsc, SortDesc, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Home, ListEnd as End, ImageUp as PageUp, ImageDown as PageDown } from 'lucide-react';

interface NavigationHelperProps {
  code: string;
  language: string;
  navigationMode: 'keyboard' | 'voice' | 'gesture';
  highContrast: boolean;
}

interface CodeElement {
  id: string;
  type: 'function' | 'class' | 'variable' | 'comment' | 'import' | 'export' | 'loop' | 'conditional';
  name: string;
  line: number;
  column: number;
  endLine: number;
  endColumn: number;
  scope: string;
  params?: string[];
  returnType?: string;
  visibility?: 'public' | 'private' | 'protected';
  isStatic?: boolean;
  isAsync?: boolean;
  description?: string;
  complexity?: number;
  children?: CodeElement[];
}

interface NavigationHistory {
  element: CodeElement;
  timestamp: number;
  action: 'navigate' | 'search' | 'jump';
}

interface SearchResult {
  element: CodeElement;
  matches: number;
  score: number;
  context: string;
}

interface NavigationSettings {
  showLineNumbers: boolean;
  showScope: boolean;
  showComplexity: boolean;
  groupByType: boolean;
  sortBy: 'name' | 'line' | 'complexity' | 'type';
  sortOrder: 'asc' | 'desc';
  filterTypes: string[];
  maxDepth: number;
  enableAudioFeedback: boolean;
  enableHapticFeedback: boolean;
  autoFocus: boolean;
  persistState: boolean;
}

const NavigationHelper: React.FC<NavigationHelperProps> = ({
  code,
  language,
  navigationMode,
  highContrast
}) => {
  const [codeElements, setCodeElements] = useState<CodeElement[]>([]);
  const [filteredElements, setFilteredElements] = useState<CodeElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<CodeElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [navigationHistory, setNavigationHistory] = useState<NavigationHistory[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [expandedElements, setExpandedElements] = useState<Set<string>>(new Set());
  const [settings, setSettings] = useState<NavigationSettings>({
    showLineNumbers: true,
    showScope: true,
    showComplexity: false,
    groupByType: false,
    sortBy: 'line',
    sortOrder: 'asc',
    filterTypes: [],
    maxDepth: 5,
    enableAudioFeedback: true,
    enableHapticFeedback: false,
    autoFocus: true,
    persistState: true
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [voiceRecognition, setVoiceRecognition] = useState<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [gestureHandler, setGestureHandler] = useState<any>(null);
  const [currentFocus, setCurrentFocus] = useState(0);
  const [keyboardShortcuts, setKeyboardShortcuts] = useState<{ [key: string]: string }>({});
  const [breadcrumbs, setBreadcrumbs] = useState<CodeElement[]>([]);
  const [miniMap, setMiniMap] = useState<boolean>(false);
  const [liveRegion, setLiveRegion] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const elementListRef = useRef<HTMLDivElement>(null);

  const elementTypes = [
    { type: 'function', icon: Function, color: 'text-blue-500', label: 'Functions' },
    { type: 'class', icon: Archive, color: 'text-purple-500', label: 'Classes' },
    { type: 'variable', icon: Variable, color: 'text-green-500', label: 'Variables' },
    { type: 'comment', icon: FileText, color: 'text-gray-500', label: 'Comments' },
    { type: 'import', icon: ArrowDown, color: 'text-orange-500', label: 'Imports' },
    { type: 'export', icon: ArrowUp, color: 'text-red-500', label: 'Exports' },
    { type: 'loop', icon: RefreshCw, color: 'text-yellow-500', label: 'Loops' },
    { type: 'conditional', icon: Route, color: 'text-cyan-500', label: 'Conditionals' }
  ];

  // Parse code to extract elements
  const parseCode = (sourceCode: string): CodeElement[] => {
    const elements: CodeElement[] = [];
    const lines = sourceCode.split('\n');
    let currentScope = 'global';
    let elementId = 0;

    lines.forEach((line, lineIndex) => {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('/*')) {
        if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*')) {
          elements.push({
            id: `comment-${elementId++}`,
            type: 'comment',
            name: trimmedLine.replace(/^\/\/\s*|\*\/|\*\s*/g, '').substring(0, 50) + (trimmedLine.length > 50 ? '...' : ''),
            line: lineIndex + 1,
            column: line.indexOf(trimmedLine) + 1,
            endLine: lineIndex + 1,
            endColumn: line.length,
            scope: currentScope,
            description: 'Code comment'
          });
        }
        return;
      }

      // Function detection
      const functionMatch = trimmedLine.match(/^(async\s+)?(function\s+|const\s+|let\s+|var\s+)?(\w+)\s*[=:]?\s*(async\s+)?\(([^)]*)\)\s*[{:]?/);
      if (functionMatch) {
        const isAsync = !!(functionMatch[1] || functionMatch[4]);
        const functionName = functionMatch[3];
        const params = functionMatch[5] ? functionMatch[5].split(',').map(p => p.trim().split(/[:=]/)[0].trim()) : [];
        
        elements.push({
          id: `function-${elementId++}`,
          type: 'function',
          name: functionName,
          line: lineIndex + 1,
          column: line.indexOf(functionName) + 1,
          endLine: lineIndex + 1,
          endColumn: line.length,
          scope: currentScope,
          params,
          isAsync,
          description: `Function with ${params.length} parameter${params.length !== 1 ? 's' : ''}`,
          complexity: calculateComplexity(trimmedLine)
        });
        currentScope = functionName;
      }

      // Class detection
      const classMatch = trimmedLine.match(/^(export\s+)?(abstract\s+)?class\s+(\w+)(\s+extends\s+\w+)?(\s+implements\s+[\w,\s]+)?/);
      if (classMatch) {
        const className = classMatch[3];
        const extendsClass = classMatch[4] ? classMatch[4].replace(/\s+extends\s+/, '') : undefined;
        
        elements.push({
          id: `class-${elementId++}`,
          type: 'class',
          name: className,
          line: lineIndex + 1,
          column: line.indexOf(className) + 1,
          endLine: lineIndex + 1,
          endColumn: line.length,
          scope: currentScope,
          description: `Class${extendsClass ? ` extending ${extendsClass}` : ''}`,
          complexity: calculateComplexity(trimmedLine),
          children: []
        });
        currentScope = className;
      }

      // Variable detection
      const variableMatch = trimmedLine.match(/^(const|let|var)\s+(\w+)(\s*[:=]\s*(.+))?/);
      if (variableMatch) {
        const variableName = variableMatch[2];
        const variableType = variableMatch[1];
        const initialValue = variableMatch[4];
        
        elements.push({
          id: `variable-${elementId++}`,
          type: 'variable',
          name: variableName,
          line: lineIndex + 1,
          column: line.indexOf(variableName) + 1,
          endLine: lineIndex + 1,
          endColumn: line.length,
          scope: currentScope,
          description: `${variableType} variable${initialValue ? ` initialized with ${initialValue.substring(0, 20)}${initialValue.length > 20 ? '...' : ''}` : ''}`,
          complexity: 1
        });
      }

      // Import detection
      const importMatch = trimmedLine.match(/^import\s+(.+)\s+from\s+['"](.+)['"]/);
      if (importMatch) {
        const importedItems = importMatch[1];
        const fromModule = importMatch[2];
        
        elements.push({
          id: `import-${elementId++}`,
          type: 'import',
          name: importedItems.length > 30 ? importedItems.substring(0, 30) + '...' : importedItems,
          line: lineIndex + 1,
          column: 1,
          endLine: lineIndex + 1,
          endColumn: line.length,
          scope: 'global',
          description: `Import from ${fromModule}`,
          complexity: 1
        });
      }

      // Export detection
      const exportMatch = trimmedLine.match(/^export\s+(default\s+)?(.+)/);
      if (exportMatch) {
        const isDefault = !!exportMatch[1];
        const exportedItem = exportMatch[2];
        
        elements.push({
          id: `export-${elementId++}`,
          type: 'export',
          name: exportedItem.length > 30 ? exportedItem.substring(0, 30) + '...' : exportedItem,
          line: lineIndex + 1,
          column: 1,
          endLine: lineIndex + 1,
          endColumn: line.length,
          scope: currentScope,
          description: `${isDefault ? 'Default ' : ''}export`,
          complexity: 1
        });
      }

      // Loop detection
      const loopMatch = trimmedLine.match(/^(for|while|do)\s*\(/);
      if (loopMatch) {
        const loopType = loopMatch[1];
        
        elements.push({
          id: `loop-${elementId++}`,
          type: 'loop',
          name: `${loopType} loop`,
          line: lineIndex + 1,
          column: 1,
          endLine: lineIndex + 1,
          endColumn: line.length,
          scope: currentScope,
          description: `${loopType.charAt(0).toUpperCase() + loopType.slice(1)} loop statement`,
          complexity: calculateComplexity(trimmedLine)
        });
      }

      // Conditional detection
      const conditionalMatch = trimmedLine.match(/^(if|else\s+if|else|switch|case)\s*[\(\{]?/);
      if (conditionalMatch) {
        const conditionalType = conditionalMatch[1];
        
        elements.push({
          id: `conditional-${elementId++}`,
          type: 'conditional',
          name: `${conditionalType} statement`,
          line: lineIndex + 1,
          column: 1,
          endLine: lineIndex + 1,
          endColumn: line.length,
          scope: currentScope,
          description: `${conditionalType.charAt(0).toUpperCase() + conditionalType.slice(1)} conditional`,
          complexity: calculateComplexity(trimmedLine)
        });
      }
    });

    return elements.sort((a, b) => a.line - b.line);
  };

  // Calculate cyclomatic complexity (simplified)
  const calculateComplexity = (line: string): number => {
    let complexity = 1;
    const complexityKeywords = ['if', 'else', 'while', 'for', 'switch', 'case', 'catch', '&&', '||', '?'];
    
    complexityKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = line.match(regex);
      if (matches) {
        complexity += matches.length;
      }
    });
    
    return complexity;
  };

  // Filter and sort elements based on settings
  const filterAndSortElements = (elements: CodeElement[]): CodeElement[] => {
    let filtered = elements;

    // Apply type filters
    if (settings.filterTypes.length > 0) {
      filtered = filtered.filter(element => settings.filterTypes.includes(element.type));
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(element => 
        element.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        element.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort elements
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (settings.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'line':
          comparison = a.line - b.line;
          break;
        case 'complexity':
          comparison = (a.complexity || 0) - (b.complexity || 0);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      
      return settings.sortOrder === 'desc' ? -comparison : comparison;
    });

    // Group by type if enabled
    if (settings.groupByType) {
      const grouped: { [key: string]: CodeElement[] } = {};
      filtered.forEach(element => {
        if (!grouped[element.type]) {
          grouped[element.type] = [];
        }
        grouped[element.type].push(element);
      });

      const result: CodeElement[] = [];
      Object.entries(grouped).forEach(([type, elements]) => {
        result.push({
          id: `group-${type}`,
          type: type as any,
          name: `${type.charAt(0).toUpperCase() + type.slice(1)}s (${elements.length})`,
          line: 0,
          column: 0,
          endLine: 0,
          endColumn: 0,
          scope: 'group',
          children: elements,
          description: `Group of ${elements.length} ${type}s`
        });
      });
      
      return result;
    }

    return filtered;
  };

  // Search functionality
  const performSearch = (query: string): SearchResult[] => {
    if (!query.trim()) return [];

    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    codeElements.forEach(element => {
      let score = 0;
      let matches = 0;
      let context = '';

      // Name match (highest score)
      if (element.name.toLowerCase().includes(lowerQuery)) {
        const nameScore = element.name.toLowerCase() === lowerQuery ? 100 : 50;
        score += nameScore;
        matches++;
        context = element.name;
      }

      // Description match
      if (element.description && element.description.toLowerCase().includes(lowerQuery)) {
        score += 25;
        matches++;
        context = context || element.description;
      }

      // Scope match
      if (element.scope.toLowerCase().includes(lowerQuery)) {
        score += 15;
        matches++;
        context = context || `In ${element.scope}`;
      }

      // Parameter match (for functions)
      if (element.params) {
        element.params.forEach(param => {
          if (param.toLowerCase().includes(lowerQuery)) {
            score += 10;
            matches++;
            context = context || `Parameter: ${param}`;
          }
        });
      }

      // Boost score based on element type relevance
      const typeBoosts: { [key: string]: number } = {
        function: 20,
        class: 15,
        variable: 10,
        import: 5,
        export: 5
      };
      score += typeBoosts[element.type] || 0;

      if (score > 0) {
        results.push({
          element,
          matches,
          score,
          context: context || element.name
        });
      }
    });

    return results.sort((a, b) => b.score - a.score).slice(0, 20);
  };

  // Navigation functions
  const navigateToElement = (element: CodeElement, action: 'navigate' | 'search' | 'jump' = 'navigate') => {
    setSelectedElement(element);
    
    // Add to history
    const historyEntry: NavigationHistory = {
      element,
      timestamp: Date.now(),
      action
    };
    
    setNavigationHistory(prev => [...prev.slice(0, currentHistoryIndex + 1), historyEntry]);
    setCurrentHistoryIndex(prev => prev + 1);

    // Update breadcrumbs
    const newBreadcrumbs: CodeElement[] = [];
    if (element.scope !== 'global' && element.scope !== 'group') {
      const scopeElement = codeElements.find(e => e.name === element.scope);
      if (scopeElement) {
        newBreadcrumbs.push(scopeElement);
      }
    }
    newBreadcrumbs.push(element);
    setBreadcrumbs(newBreadcrumbs);

    // Audio feedback
    if (settings.enableAudioFeedback && navigationMode === 'keyboard') {
      const message = `Navigated to ${element.type} ${element.name} on line ${element.line}`;
      setLiveRegion(message);
      
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
      }
    }

    // Haptic feedback
    if (settings.enableHapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate([50, 100, 50]);
    }

    // Focus management
    if (settings.autoFocus) {
      setTimeout(() => {
        const elementButton = document.querySelector(`[data-element-id="${element.id}"]`) as HTMLElement;
        if (elementButton) {
          elementButton.focus();
        }
      }, 100);
    }
  };

  const navigateHistory = (direction: 'back' | 'forward') => {
    const newIndex = direction === 'back' 
      ? Math.max(0, currentHistoryIndex - 1)
      : Math.min(navigationHistory.length - 1, currentHistoryIndex + 1);
    
    if (newIndex !== currentHistoryIndex && navigationHistory[newIndex]) {
      setCurrentHistoryIndex(newIndex);
      setSelectedElement(navigationHistory[newIndex].element);
    }
  };

  const jumpToLine = (lineNumber: number) => {
    const element = codeElements.find(e => e.line === lineNumber);
    if (element) {
      navigateToElement(element, 'jump');
    }
  };

  const jumpToType = (type: string) => {
    const elements = codeElements.filter(e => e.type === type);
    if (elements.length > 0) {
      navigateToElement(elements[0], 'jump');
    }
  };

  // Keyboard navigation
  const handleKeyboardNavigation = (event: KeyboardEvent) => {
    if (!filteredElements.length) return;

    const currentIndex = selectedElement 
      ? filteredElements.findIndex(e => e.id === selectedElement.id)
      : -1;

    switch (event.key) {
      case 'ArrowDown':
      case 'j':
        event.preventDefault();
        const nextIndex = Math.min(currentIndex + 1, filteredElements.length - 1);
        if (nextIndex >= 0) {
          navigateToElement(filteredElements[nextIndex]);
        }
        break;
      
      case 'ArrowUp':
      case 'k':
        event.preventDefault();
        const prevIndex = Math.max(currentIndex - 1, 0);
        if (prevIndex < filteredElements.length) {
          navigateToElement(filteredElements[prevIndex]);
        }
        break;
      
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (selectedElement) {
          // Trigger navigation to the selected element
          navigateToElement(selectedElement, 'navigate');
        }
        break;
      
      case 'Home':
        event.preventDefault();
        if (filteredElements.length > 0) {
          navigateToElement(filteredElements[0]);
        }
        break;
      
      case 'End':
        event.preventDefault();
        if (filteredElements.length > 0) {
          navigateToElement(filteredElements[filteredElements.length - 1]);
        }
        break;
      
      case 'f':
        if (event.ctrlKey) {
          event.preventDefault();
          searchInputRef.current?.focus();
        }
        break;
      
      case 'Escape':
        setSearchQuery('');
        setSearchResults([]);
        break;
    }
  };

  // Voice recognition setup
  useEffect(() => {
    if (navigationMode === 'voice' && 'webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        
        // Voice commands
        if (transcript.includes('navigate to function')) {
          const functionName = transcript.replace('navigate to function', '').trim();
          const func = codeElements.find(e => e.type === 'function' && e.name.toLowerCase().includes(functionName));
          if (func) navigateToElement(func, 'navigate');
        } else if (transcript.includes('navigate to class')) {
          const className = transcript.replace('navigate to class', '').trim();
          const cls = codeElements.find(e => e.type === 'class' && e.name.toLowerCase().includes(className));
          if (cls) navigateToElement(cls, 'navigate');
        } else if (transcript.includes('search for')) {
          const searchTerm = transcript.replace('search for', '').trim();
          setSearchQuery(searchTerm);
        } else if (transcript === 'go back') {
          navigateHistory('back');
        } else if (transcript === 'go forward') {
          navigateHistory('forward');
        } else if (transcript.includes('jump to line')) {
          const lineMatch = transcript.match(/jump to line (\d+)/);
          if (lineMatch) {
            jumpToLine(parseInt(lineMatch[1]));
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setVoiceRecognition(recognition);
    }
  }, [navigationMode, codeElements]);

  // Code parsing effect
  useEffect(() => {
    if (code) {
      setIsAnalyzing(true);
      setAnalysisProgress(0);
      
      // Simulate analysis progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 50);

      setTimeout(() => {
        const elements = parseCode(code);
        setCodeElements(elements);
        setAnalysisProgress(100);
        
        setTimeout(() => {
          setIsAnalyzing(false);
          setAnalysisProgress(0);
        }, 500);
      }, 500);
    }
  }, [code]);

  // Filter elements when settings or search query changes
  useEffect(() => {
    const filtered = filterAndSortElements(codeElements);
    setFilteredElements(filtered);
  }, [codeElements, settings, searchQuery]);

  // Search results effect
  useEffect(() => {
    if (searchQuery) {
      const results = performSearch(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, codeElements]);

  // Keyboard event listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (navigationMode === 'keyboard') {
        handleKeyboardNavigation(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigationMode, filteredElements, selectedElement]);

  // Toggle voice recognition
  const toggleVoiceRecognition = () => {
    if (!voiceRecognition) return;

    if (isListening) {
      voiceRecognition.stop();
      setIsListening(false);
    } else {
      voiceRecognition.start();
      setIsListening(true);
    }
  };

  // Toggle element expansion
  const toggleElementExpansion = (elementId: string) => {
    setExpandedElements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(elementId)) {
        newSet.delete(elementId);
      } else {
        newSet.add(elementId);
      }
      return newSet;
    });
  };

  // Render element icon
  const renderElementIcon = (element: CodeElement) => {
    const elementType = elementTypes.find(et => et.type === element.type);
    if (!elementType) return <Code2 className="w-4 h-4 text-gray-400" />;
    
    const IconComponent = elementType.icon;
    return <IconComponent className={`w-4 h-4 ${elementType.color}`} />;
  };

  // Render element item
  const renderElementItem = (element: CodeElement, depth: number = 0) => {
    const isSelected = selectedElement?.id === element.id;
    const isExpanded = expandedElements.has(element.id);
    const hasChildren = element.children && element.children.length > 0;

    return (
      <div key={element.id} className="w-full">
        <button
          data-element-id={element.id}
          onClick={() => navigateToElement(element)}
          onDoubleClick={() => hasChildren && toggleElementExpansion(element.id)}
          className={`w-full flex items-center gap-2 p-2 text-left text-sm rounded-lg transition-colors ${
            isSelected
              ? highContrast ? 'bg-white text-black' : 'bg-blue-100 text-blue-900 border border-blue-300'
              : highContrast
              ? 'text-white hover:bg-gray-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleElementExpansion(element.id);
              }}
              className="p-0.5 rounded hover:bg-gray-200 transition-colors"
            >
              {isExpanded ? 
                <ChevronDown className="w-3 h-3" /> : 
                <ChevronRight className="w-3 h-3" />
              }
            </button>
          )}
          
          {renderElementIcon(element)}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`font-medium truncate ${isSelected ? 'text-blue-900' : ''}`}>
                {element.name}
              </span>
              
              {element.isAsync && (
                <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                  async
                </span>
              )}
              
              {element.isStatic && (
                <span className="px-1.5 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">
                  static
                </span>
              )}
              
              {settings.showComplexity && element.complexity && element.complexity > 1 && (
                <span className={`px-1.5 py-0.5 text-xs rounded ${
                  element.complexity > 10 ? 'bg-red-100 text-red-800' :
                  element.complexity > 5 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {element.complexity}
                </span>
              )}
            </div>
            
            {settings.showLineNumbers && (
              <div className={`text-xs ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                Line {element.line}
                {settings.showScope && element.scope !== 'global' && (
                  <span> • {element.scope}</span>
                )}
              </div>
            )}
            
            {element.description && (
              <div className={`text-xs ${isSelected ? 'text-blue-600' : 'text-gray-500'} truncate`}>
                {element.description}
              </div>
            )}
          </div>
        </button>
        
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {element.children!.map(child => renderElementItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${highContrast ? 'bg-black' : 'bg-gray-50'} rounded-lg overflow-hidden flex flex-col`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${
        highContrast ? 'border-white' : 'border-gray-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500 rounded-lg">
            <Navigation className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`font-semibold ${highContrast ? 'text-white' : 'text-gray-900'}`}>
              Code Navigation
            </h3>
            <p className={`text-sm ${highContrast ? 'text-gray-300' : 'text-gray-500'}`}>
              {filteredElements.length} elements • {navigationMode} mode
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {navigationMode === 'voice' && (
            <button
              onClick={toggleVoiceRecognition}
              className={`p-2 rounded-lg transition-colors ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : highContrast ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'
              }`}
              aria-label={isListening ? 'Stop listening' : 'Start listening'}
            >
              <Mic className="w-4 h-4" />
            </button>
          )}
          
          {navigationHistory.length > 1 && (
            <>
              <button
                onClick={() => navigateHistory('back')}
                disabled={currentHistoryIndex <= 0}
                className={`p-2 rounded-lg transition-colors ${
                  currentHistoryIndex <= 0
                    
                    ? 'opacity-50 cursor-not-allowed'
                    : highContrast ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                aria-label="Go back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => navigateHistory('forward')}
                disabled={currentHistoryIndex >= navigationHistory.length - 1}
                className={`p-2 rounded-lg transition-colors ${
                  currentHistoryIndex >= navigationHistory.length - 1
                    ? 'opacity-50 cursor-not-allowed'
                    : highContrast ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                aria-label="Go forward"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-lg transition-colors ${
              highContrast ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'
            } hover:bg-opacity-80`}
            aria-label={isExpanded ? 'Minimize' : 'Maximize'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${
              showSettings 
                ? 'bg-indigo-500 text-white' 
                : highContrast ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'
            }`}
            aria-label="Toggle settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div className={`px-4 py-2 border-b ${highContrast ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2 text-sm">
            <Home className={`w-3 h-3 ${highContrast ? 'text-gray-400' : 'text-gray-500'}`} />
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.id}>
                <ChevronRight className={`w-3 h-3 ${highContrast ? 'text-gray-400' : 'text-gray-500'}`} />
                <button
                  onClick={() => navigateToElement(crumb)}
                  className={`${highContrast ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} hover:underline`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
            highContrast ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search code elements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
              highContrast
                ? 'bg-black text-white border-white placeholder-gray-400'
                : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
          />
        </div>
      </div>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <div className="px-4 pb-4">
          <div className={`text-sm mb-2 ${highContrast ? 'text-gray-300' : 'text-gray-600'}`}>
            Analyzing code structure... {analysisProgress}%
          </div>
          <div className={`w-full bg-gray-200 rounded-full h-2 ${highContrast ? 'bg-gray-700' : ''}`}>
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${analysisProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Type Filters */}
      <div className="px-4 pb-4">
        <div className="flex flex-wrap gap-2">
          {elementTypes.map((type) => {
            const count = codeElements.filter(e => e.type === type.type).length;
            const isActive = settings.filterTypes.includes(type.type);
            
            return (
              <button
                key={type.type}
                onClick={() => {
                  setSettings(prev => ({
                    ...prev,
                    filterTypes: isActive
                      ? prev.filterTypes.filter(t => t !== type.type)
                      : [...prev.filterTypes, type.type]
                  }));
                }}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full transition-colors ${
                  isActive
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                    : highContrast
                    ? 'bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                }`}
                disabled={count === 0}
              >
                <type.icon className="w-3 h-3" />
                <span>{type.label}</span>
                <span className={`ml-1 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {searchResults.length > 0 ? (
          /* Search Results */
          <div className="h-full overflow-y-auto px-4">
            <div className={`text-sm font-medium mb-3 ${highContrast ? 'text-gray-300' : 'text-gray-600'}`}>
              Search Results ({searchResults.length})
            </div>
            <div className="space-y-1">
              {searchResults.map((result) => (
                <div
                  key={result.element.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    selectedElement?.id === result.element.id
                      ? highContrast ? 'bg-white text-black border-white' : 'bg-blue-50 border-blue-200'
                      : highContrast ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <button
                    onClick={() => navigateToElement(result.element, 'search')}
                    className="w-full text-left"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {renderElementIcon(result.element)}
                      <span className={`font-medium ${
                        selectedElement?.id === result.element.id ? 'text-blue-900' : highContrast ? 'text-white' : 'text-gray-900'
                      }`}>
                        {result.element.name}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        highContrast ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {result.element.type}
                      </span>
                    </div>
                    <div className={`text-sm ${
                      selectedElement?.id === result.element.id ? 'text-blue-700' : highContrast ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Line {result.element.line} • {result.context}
                    </div>
                    <div className={`text-xs mt-1 ${
                      selectedElement?.id === result.element.id ? 'text-blue-600' : highContrast ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Score: {result.score} • {result.matches} match{result.matches !== 1 ? 'es' : ''}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Element List */
          <div ref={elementListRef} className="h-full overflow-y-auto px-4">
            {filteredElements.length > 0 ? (
              <div className="space-y-1 pb-4">
                {filteredElements.map((element) => renderElementItem(element))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Code2 className={`w-12 h-12 mx-auto mb-4 ${highContrast ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-sm ${highContrast ? 'text-gray-400' : 'text-gray-500'}`}>
                  {codeElements.length === 0 
                    ? 'No code elements found. Start typing in the editor.'
                    : 'No elements match your current filters.'
                  }
                </p>
                {settings.filterTypes.length > 0 && (
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, filterTypes: [] }))}
                    className="mt-2 text-sm text-indigo-500 hover:text-indigo-600 underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
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
            className={`border-t ${highContrast ? 'border-white bg-gray-900' : 'border-gray-200 bg-white'} overflow-hidden`}
          >
            <div className="p-4 space-y-4">
              <h4 className={`font-medium ${highContrast ? 'text-white' : 'text-gray-900'}`}>
                Navigation Settings
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className={`text-sm ${highContrast ? 'text-gray-300' : 'text-gray-600'}`}>
                      Show Line Numbers
                    </label>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, showLineNumbers: !prev.showLineNumbers }))}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        settings.showLineNumbers ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings.showLineNumbers ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className={`text-sm ${highContrast ? 'text-gray-300' : 'text-gray-600'}`}>
                      Show Scope
                    </label>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, showScope: !prev.showScope }))}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        settings.showScope ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings.showScope ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className={`text-sm ${highContrast ? 'text-gray-300' : 'text-gray-600'}`}>
                      Show Complexity
                    </label>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, showComplexity: !prev.showComplexity }))}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        settings.showComplexity ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings.showComplexity ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className={`text-sm ${highContrast ? 'text-gray-300' : 'text-gray-600'}`}>
                      Group by Type
                    </label>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, groupByType: !prev.groupByType }))}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        settings.groupByType ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings.groupByType ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className={`text-sm ${highContrast ? 'text-gray-300' : 'text-gray-600'}`}>
                      Audio Feedback
                    </label>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, enableAudioFeedback: !prev.enableAudioFeedback }))}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        settings.enableAudioFeedback ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings.enableAudioFeedback ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className={`text-sm ${highContrast ? 'text-gray-300' : 'text-gray-600'}`}>
                      Auto Focus
                    </label>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, autoFocus: !prev.autoFocus }))}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        settings.autoFocus ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings.autoFocus ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm ${highContrast ? 'text-gray-300' : 'text-gray-600'} block mb-1`}>
                    Sort By
                  </label>
                  <select
                    value={settings.sortBy}
                    onChange={(e) => setSettings(prev => ({ ...prev, sortBy: e.target.value as any }))}
                    className={`w-full p-2 border rounded ${
                      highContrast
                        ? 'bg-black text-white border-white'
                        : 'bg-white text-gray-900 border-gray-300'
                    }`}
                  >
                    <option value="line">Line Number</option>
                    <option value="name">Name</option>
                    <option value="type">Type</option>
                    <option value="complexity">Complexity</option>
                  </select>
                </div>
                
                <div>
                  <label className={`text-sm ${highContrast ? 'text-gray-300' : 'text-gray-600'} block mb-1`}>
                    Sort Order
                  </label>
                  <select
                    value={settings.sortOrder}
                    onChange={(e) => setSettings(prev => ({ ...prev, sortOrder: e.target.value as any }))}
                    className={`w-full p-2 border rounded ${
                      highContrast
                        ? 'bg-black text-white border-white'
                        : 'bg-white text-gray-900 border-gray-300'
                    }`}
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Bar */}
      <div className={`flex items-center justify-between px-4 py-2 text-xs border-t ${
        highContrast ? 'bg-black border-white text-white' : 'bg-gray-50 border-gray-200 text-gray-500'
      }`}>
        <div className="flex items-center gap-4">
          <span>
            {filteredElements.length} of {codeElements.length} elements
          </span>
          {selectedElement && (
            <span>
              Selected: {selectedElement.name} (Line {selectedElement.line})
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {navigationMode === 'voice' && (
            <div className="flex items-center gap-1">
              <Mic className={`w-3 h-3 ${isListening ? 'text-red-500' : 'text-gray-400'}`} />
              <span>{isListening ? 'Listening' : 'Voice Ready'}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Navigation className="w-3 h-3" />
            <span>{navigationMode}</span>
          </div>
        </div>
      </div>

      {/* Live Region for Screen Readers */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveRegion}
      </div>
    </div>
  );
};

export default NavigationHelper;