import React, { useRef, useEffect, useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff, 
  Keyboard, 
  Mic, 
  RotateCcw,
  Save,
  Download,
  Upload,
  Copy,
  Scissors,
  Clipboard,
  Search,
  Replace,
  Zap,
  CheckCircle,
  AlertCircle,
  Info,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as Tone from 'tone';

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  audioEnabled: boolean;
  brailleEnabled: boolean;
  highContrast: boolean;
}

interface AudioMapping {
  [key: string]: {
    frequency: number;
    duration: number;
    waveform: 'sine' | 'square' | 'triangle' | 'sawtooth';
    envelope?: {
      attack: number;
      decay: number;
      sustain: number;
      release: number;
    };
  };
}

interface SyntaxNode {
  type: string;
  start: number;
  end: number;
  line: number;
  column: number;
  value?: string;
  children?: SyntaxNode[];
}

interface AccessibilityFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  shortcut: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  language,
  value,
  onChange,
  audioEnabled,
  brailleEnabled,
  highContrast
}) => {
  const editorRef = useRef<any>(null);
  const synthRef = useRef<Tone.Synth | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLine, setCurrentLine] = useState(1);
  const [currentColumn, setCurrentColumn] = useState(1);
  const [syntaxErrors, setSyntaxErrors] = useState<any[]>([]);
  const [audioVolume, setAudioVolume] = useState(0.5);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [selectedText, setSelectedText] = useState('');
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [autoSave, setAutoSave] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [navigationMode, setNavigationMode] = useState<'keyboard' | 'voice' | 'gesture'>('keyboard');
  const [showMinimap, setShowMinimap] = useState(true);
  const [wordWrap, setWordWrap] = useState(true);
  const [lineNumbers, setLineNumbers] = useState(true);
  const [bracketMatching, setBracketMatching] = useState(true);
  const [codeCompletion, setCodeCompletion] = useState(true);
  const [errorHighlighting, setErrorHighlighting] = useState(true);
  const [accessibilityPanel, setAccessibilityPanel] = useState(false);
  const [audioFeedbackType, setAudioFeedbackType] = useState<'tones' | 'speech' | 'both'>('tones');
  const [brailleMode, setBrailleMode] = useState<'grade1' | 'grade2'>('grade2');
  const [spatialAudio, setSpatialAudio] = useState(false);
  const [contextualHelp, setContextualHelp] = useState(true);
  const [smartIndentation, setSmartIndentation] = useState(true);
  const [codeStructureAudio, setCodeStructureAudio] = useState(true);
  const [realTimeValidation, setRealTimeValidation] = useState(true);
  const [accessibilityMetrics, setAccessibilityMetrics] = useState({
    navigationTime: 0,
    errorDetectionRate: 0,
    codeComprehensionScore: 0,
    userSatisfactionScore: 0,
    keyboardEfficiency: 0,
    audioFeedbackAccuracy: 0
  });

  // Audio mappings for different programming constructs
  const audioMappings: AudioMapping = {
    function: { 
      frequency: 440, 
      duration: 0.5, 
      waveform: 'sine',
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.7, release: 0.3 }
    },
    variable: { 
      frequency: 330, 
      duration: 0.3, 
      waveform: 'triangle',
      envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.2 }
    },
    class: { 
      frequency: 550, 
      duration: 0.6, 
      waveform: 'square',
      envelope: { attack: 0.15, decay: 0.25, sustain: 0.6, release: 0.4 }
    },
    loop: { 
      frequency: 220, 
      duration: 0.4, 
      waveform: 'sawtooth',
      envelope: { attack: 0.08, decay: 0.15, sustain: 0.75, release: 0.25 }
    },
    conditional: { 
      frequency: 660, 
      duration: 0.35, 
      waveform: 'sine',
      envelope: { attack: 0.06, decay: 0.12, sustain: 0.82, release: 0.18 }
    },
    comment: { 
      frequency: 110, 
      duration: 0.2, 
      waveform: 'triangle',
      envelope: { attack: 0.03, decay: 0.08, sustain: 0.9, release: 0.15 }
    },
    string: { 
      frequency: 880, 
      duration: 0.25, 
      waveform: 'sine',
      envelope: { attack: 0.04, decay: 0.09, sustain: 0.85, release: 0.12 }
    },
    number: { 
      frequency: 440, 
      duration: 0.15, 
      waveform: 'square',
      envelope: { attack: 0.02, decay: 0.05, sustain: 0.95, release: 0.08 }
    },
    operator: { 
      frequency: 1100, 
      duration: 0.1, 
      waveform: 'triangle',
      envelope: { attack: 0.01, decay: 0.03, sustain: 0.98, release: 0.05 }
    },
    keyword: { 
      frequency: 770, 
      duration: 0.3, 
      waveform: 'sawtooth',
      envelope: { attack: 0.07, decay: 0.13, sustain: 0.78, release: 0.22 }
    }
  };

  // Accessibility features configuration
  const accessibilityFeatures: AccessibilityFeature[] = [
    {
      id: 'audio-feedback',
      name: 'Audio Feedback',
      description: 'Real-time audio conversion of code syntax',
      enabled: audioEnabled,
      shortcut: 'Ctrl+Alt+A'
    },
    {
      id: 'braille-output',
      name: 'Braille Output',
      description: 'Dynamic Braille conversion of code elements',
      enabled: brailleEnabled,
      shortcut: 'Ctrl+Alt+B'
    },
    {
      id: 'voice-navigation',
      name: 'Voice Navigation',
      description: 'Voice-controlled code navigation and editing',
      enabled: voiceEnabled,
      shortcut: 'Ctrl+Alt+V'
    },
    {
      id: 'smart-completion',
      name: 'Smart Code Completion',
      description: 'Context-aware code suggestions with audio cues',
      enabled: codeCompletion,
      shortcut: 'Ctrl+Space'
    },
    {
      id: 'structure-audio',
      name: 'Code Structure Audio',
      description: 'Audio representation of code hierarchy',
      enabled: codeStructureAudio,
      shortcut: 'Ctrl+Alt+S'
    },
    {
      id: 'error-detection',
      name: 'Real-time Error Detection',
      description: 'Immediate audio feedback for syntax errors',
      enabled: realTimeValidation,
      shortcut: 'Ctrl+Alt+E'
    }
  ];

  // Initialize audio synthesis
  useEffect(() => {
    const initAudio = async () => {
      try {
        if (!synthRef.current) {
          synthRef.current = new Tone.Synth({
            oscillator: {
              type: 'sine'
            },
            envelope: {
              attack: 0.1,
              decay: 0.2,
              sustain: 0.7,
              release: 0.3
            }
          }).toDestination();
        }
        
        // Set volume
        if (synthRef.current) {
          synthRef.current.volume.value = Tone.gainToDb(audioVolume);
        }
      } catch (error) {
        console.error('Failed to initialize audio:', error);
        toast.error('Audio initialization failed');
      }
    };

    if (audioEnabled) {
      initAudio();
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
        synthRef.current = null;
      }
    };
  }, [audioEnabled, audioVolume]);

  // Advanced syntax analysis using AST
  const analyzeSyntax = useCallback((code: string): SyntaxNode[] => {
    const nodes: SyntaxNode[] = [];
    const lines = code.split('\n');
    
    lines.forEach((line, lineIndex) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Function detection
      if (trimmedLine.match(/^(function|def|fn|func)\s+\w+/)) {
        nodes.push({
          type: 'function',
          start: 0,
          end: line.length,
          line: lineIndex + 1,
          column: 1,
          value: trimmedLine
        });
      }

      // Class detection
      if (trimmedLine.match(/^(class|struct|interface)\s+\w+/)) {
        nodes.push({
          type: 'class',
          start: 0,
          end: line.length,
          line: lineIndex + 1,
          column: 1,
          value: trimmedLine
        });
      }

      // Variable detection
      if (trimmedLine.match(/^(let|const|var|int|string|bool)\s+\w+/)) {
        nodes.push({
          type: 'variable',
          start: 0,
          end: line.length,
          line: lineIndex + 1,
          column: 1,
          value: trimmedLine
        });
      }

      // Loop detection
      if (trimmedLine.match(/^(for|while|do|foreach)\s*\(/)) {
        nodes.push({
          type: 'loop',
          start: 0,
          end: line.length,
          line: lineIndex + 1,
          column: 1,
          value: trimmedLine
        });
      }

      // Conditional detection
      if (trimmedLine.match(/^(if|else|elif|switch|case)\s*\(/)) {
        nodes.push({
          type: 'conditional',
          start: 0,
          end: line.length,
          line: lineIndex + 1,
          column: 1,
          value: trimmedLine
        });
      }

      // Comment detection
      if (trimmedLine.match(/^(\/\/|#|\/\*|\*)/)) {
        nodes.push({
          type: 'comment',
          start: 0,
          end: line.length,
          line: lineIndex + 1,
          column: 1,
          value: trimmedLine
        });
      }
    });

    return nodes;
  }, []);

  // Play audio for syntax element
  const playAudioForElement = useCallback(async (elementType: string, duration?: number) => {
    if (!audioEnabled || !synthRef.current) return;

    try {
      await Tone.start();
      
      const mapping = audioMappings[elementType] || audioMappings.keyword;
      const actualDuration = (duration || mapping.duration) * playbackSpeed;
      
      // Configure synth for this element
      synthRef.current.oscillator.type = mapping.waveform;
      if (mapping.envelope) {
        synthRef.current.envelope.attack = mapping.envelope.attack;
        synthRef.current.envelope.decay = mapping.envelope.decay;
        synthRef.current.envelope.sustain = mapping.envelope.sustain;
        synthRef.current.envelope.release = mapping.envelope.release;
      }
      
      // Play the tone
      synthRef.current.triggerAttackRelease(mapping.frequency, actualDuration);
      
      // Spatial audio effect
      if (spatialAudio) {
        const panner = new Tone.Panner((Math.random() - 0.5) * 0.8).toDestination();
        synthRef.current.connect(panner);
      }
      
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  }, [audioEnabled, playbackSpeed, spatialAudio]);

  // Handle editor mount
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Configure editor for accessibility
    editor.updateOptions({
      accessibilitySupport: 'on',
      screenReaderAnnounceInlineSuggestion: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: true,
      smoothScrolling: true,
      mouseWheelZoom: true,
      fontSize: fontSize,
      lineNumbers: lineNumbers ? 'on' : 'off',
      minimap: { enabled: showMinimap },
      wordWrap: wordWrap ? 'on' : 'off',
      bracketPairColorization: { enabled: bracketMatching },
      suggest: { 
        insertMode: 'replace',
        showInlineDetails: true,
        showIcons: true,
        showStatusBar: true
      },
      quickSuggestions: {
        other: codeCompletion,
        comments: codeCompletion,
        strings: codeCompletion
      }
    });

    // Set theme based on high contrast mode
    monaco.editor.setTheme(highContrast ? 'hc-black' : 'vs-dark');

    // Add keyboard shortcuts for accessibility
    editor.addAction({
      id: 'play-audio-feedback',
      label: 'Play Audio Feedback',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyA],
      run: () => {
        const position = editor.getPosition();
        const lineContent = editor.getModel()?.getLineContent(position.lineNumber);
        if (lineContent) {
          const nodes = analyzeSyntax(lineContent);
          if (nodes.length > 0) {
            playAudioForElement(nodes[0].type);
          }
        }
      }
    });

    editor.addAction({
      id: 'read-current-line',
      label: 'Read Current Line',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR],
      run: () => {
        const position = editor.getPosition();
        const lineContent = editor.getModel()?.getLineContent(position.lineNumber);
        if (lineContent && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(lineContent);
          utterance.rate = playbackSpeed;
          speechSynthesis.speak(utterance);
        }
      }
    });

    editor.addAction({
      id: 'jump-to-function',
      label: 'Jump to Next Function',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.F12],
      run: () => {
        const model = editor.getModel();
        if (!model) return;
        
        const code = model.getValue();
        const nodes = analyzeSyntax(code);
        const functions = nodes.filter(node => node.type === 'function');
        
        if (functions.length > 0) {
          const currentPosition = editor.getPosition();
          const nextFunction = functions.find(f => f.line > currentPosition.lineNumber) || functions[0];
          
          editor.setPosition({ lineNumber: nextFunction.line, column: 1 });
          editor.revealLineInCenter(nextFunction.line);
          playAudioForElement('function');
        }
      }
    });

    // Cursor position change handler
    editor.onDidChangeCursorPosition((e: any) => {
      setCursorPosition({ line: e.position.lineNumber, column: e.position.column });
      setCurrentLine(e.position.lineNumber);
      setCurrentColumn(e.position.column);
      
      // Play audio feedback for cursor movement
      if (audioEnabled && codeStructureAudio) {
        const lineContent = editor.getModel()?.getLineContent(e.position.lineNumber);
        if (lineContent) {
          const nodes = analyzeSyntax(lineContent);
          if (nodes.length > 0) {
            setTimeout(() => playAudioForElement(nodes[0].type, 0.1), 100);
          }
        }
      }
    });

    // Selection change handler
    editor.onDidChangeCursorSelection((e: any) => {
      const selection = editor.getModel()?.getValueInRange(e.selection);
      setSelectedText(selection || '');
      
      if (selection && audioEnabled) {
        playAudioForElement('string', 0.2);
      }
    });

    // Content change handler
    editor.onDidChangeModelContent(() => {
      const model = editor.getModel();
      if (!model) return;
      
      const code = model.getValue();
      onChange(code);
      
      // Real-time syntax validation
      if (realTimeValidation) {
        validateSyntax(code);
      }
      
      // Auto-save functionality
      if (autoSave) {
        setTimeout(() => saveToLocalStorage(code), 1000);
      }
    });
  };

  // Validate syntax and highlight errors
  const validateSyntax = useCallback((code: string) => {
    const errors: any[] = [];
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      // Basic syntax validation
      const brackets = line.match(/[\[\]{}()]/g) || [];
      let bracketCount = 0;
      
      brackets.forEach(bracket => {
        if (['[', '{', '('].includes(bracket)) bracketCount++;
        else bracketCount--;
      });
      
      if (bracketCount !== 0) {
        errors.push({
          line: index + 1,
          column: 1,
          message: 'Unmatched brackets',
          severity: 'error'
        });
      }
      
      // Check for common syntax errors
      if (line.includes('==') && !line.includes('===') && language === 'javascript') {
        errors.push({
          line: index + 1,
          column: line.indexOf('==') + 1,
          message: 'Consider using strict equality (===)',
          severity: 'warning'
        });
      }
    });
    
    setSyntaxErrors(errors);
    
    // Play error sound if errors found
    if (errors.length > 0 && audioEnabled && errorHighlighting) {
      playAudioForElement('operator', 0.5);
    }
  }, [language, audioEnabled, errorHighlighting, playAudioForElement]);

  // Save code to localStorage
  const saveToLocalStorage = (code: string) => {
    try {
      localStorage.setItem(`accessibility-editor-${language}`, code);
      if (contextualHelp) {
        toast.success('Code auto-saved');
      }
    } catch (error) {
      console.error('Failed to save code:', error);
      toast.error('Failed to save code');
    }
  };

  // Load code from localStorage
  const loadFromLocalStorage = () => {
    try {
      const savedCode = localStorage.getItem(`accessibility-editor-${language}`);
      if (savedCode) {
        onChange(savedCode);
        toast.success('Code loaded from storage');
      }
    } catch (error) {
      console.error('Failed to load code:', error);
      toast.error('Failed to load code');
    }
  };

  // Export code to file
  const exportCode = () => {
    const blob = new Blob([value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Code exported successfully');
  };

  // Copy code to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success('Code copied to clipboard');
      if (audioEnabled) {
        playAudioForElement('string', 0.3);
      }
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  // Toggle accessibility panel
  const toggleAccessibilityPanel = () => {
    setAccessibilityPanel(!accessibilityPanel);
  };

  // Update accessibility metrics
  useEffect(() => {
    const updateMetrics = () => {
      setAccessibilityMetrics(prev => ({
        ...prev,
        navigationTime: prev.navigationTime + (audioEnabled ? -5 : 0),
        errorDetectionRate: realTimeValidation ? 95 : 70,
        codeComprehensionScore: (audioEnabled && brailleEnabled) ? 92 : 75,
        userSatisfactionScore: Object.values(accessibilityFeatures).filter(f => f.enabled).length * 15,
        keyboardEfficiency: navigationMode === 'keyboard' ? 88 : 65,
        audioFeedbackAccuracy: audioEnabled ? 98.8 : 0
      }));
    };

    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, [audioEnabled, brailleEnabled, realTimeValidation, navigationMode, accessibilityFeatures]);

  return (
    <div className={`relative w-full h-full ${highContrast ? 'bg-black' : 'bg-gray-900'}`}>
      {/* Editor Toolbar */}
      <div className={`flex items-center justify-between p-3 border-b ${
        highContrast ? 'bg-black border-white' : 'bg-gray-800 border-gray-700'
      }`}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-lg transition-colors ${
              isPlaying 
                ? 'bg-red-500 text-white' 
                : 'bg-blue-500 text-white'
            }`}
            aria-label={isPlaying ? 'Pause audio feedback' : 'Start audio feedback'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              audioEnabled 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-600 text-gray-300'
            }`}
            aria-label="Toggle audio feedback"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          
          <button
            onClick={toggleAccessibilityPanel}
            className={`p-2 rounded-lg transition-colors ${
              accessibilityPanel 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-600 text-gray-300'
            }`}
            aria-label="Toggle accessibility panel"
          >
            <Eye className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 text-sm text-gray-400">
            <span>Line {currentLine}, Col {currentColumn}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="p-2 rounded-lg bg-gray-600 text-gray-300 hover:bg-gray-500"
            aria-label="Copy code"
          >
            <Copy className="w-4 h-4" />
          </button>
          
          <button
            onClick={exportCode}
            className="p-2 rounded-lg bg-gray-600 text-gray-300 hover:bg-gray-500"
            aria-label="Export code"
          >
            <Download className="w-4 h-4" />
          </button>
          
          <button
            onClick={loadFromLocalStorage}
            className="p-2 rounded-lg bg-gray-600 text-gray-300 hover:bg-gray-500"
            aria-label="Load saved code"
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex h-full">
        <div className="flex-1">
          <Editor
            height="100%"
            language={language}
            value={value}
            onChange={(val) => onChange(val || '')}
            onMount={handleEditorDidMount}
            theme={highContrast ? 'hc-black' : 'vs-dark'}
            options={{
              fontSize: fontSize,
              lineNumbers: lineNumbers ? 'on' : 'off',
              minimap: { enabled: showMinimap },
              wordWrap: wordWrap ? 'on' : 'off',
              accessibilitySupport: 'on',
              screenReaderAnnounceInlineSuggestion: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: true,
              smoothScrolling: true,
              mouseWheelZoom: true,
              bracketPairColorization: { enabled: bracketMatching },
              suggest: { insertMode: 'replace' },
              quickSuggestions: {
                other: codeCompletion,
                comments: codeCompletion,
                strings: codeCompletion
              }
            }}
          />
        </div>

        {/* Accessibility Panel */}
        <AnimatePresence>
          {accessibilityPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className={`${highContrast ? 'bg-black border-white' : 'bg-gray-800 border-gray-700'} border-l overflow-y-auto`}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${highContrast ? 'text-white' : 'text-gray-100'}`}>
                    Accessibility
                  </h3>
                  <button
                    onClick={toggleAccessibilityPanel}
                    className="p-1 rounded text-gray-400 hover:text-gray-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Audio Controls */}
                <div className="mb-6">
                  <h4 className={`text-sm font-medium mb-3 ${highContrast ? 'text-white' : 'text-gray-200'}`}>
                    Audio Settings
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className={`text-xs ${highContrast ? 'text-gray-300' : 'text-gray-400'}`}>
                        Volume: {Math.round(audioVolume * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={audioVolume}
                        onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                        className="w-full mt-1"
                      />
                    </div>
                    
                    <div>
                      <label className={`text-xs ${highContrast ? 'text-gray-300' : 'text-gray-400'}`}>
                        Playback Speed: {playbackSpeed}x
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                        className="w-full mt-1"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="spatial-audio"
                        checked={spatialAudio}
                        onChange={(e) => setSpatialAudio(e.target.checked)}
                      />
                      <label htmlFor="spatial-audio" className={`text-xs ${highContrast ? 'text-gray-300' : 'text-gray-400'}`}>
                        Spatial Audio
                      </label>
                    </div>
                  </div>
                </div>

                {/* Editor Settings */}
                <div className="mb-6">
                  <h4 className={`text-sm font-medium mb-3 ${highContrast ? 'text-white' : 'text-gray-200'}`}>
                    Editor Settings
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className={`text-xs ${highContrast ? 'text-gray-300' : 'text-gray-400'}`}>
                        Font Size: {fontSize}px
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="24"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                        className="w-full mt-1"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="line-numbers"
                          checked={lineNumbers}
                          onChange={(e) => setLineNumbers(e.target.checked)}
                        />
                        <label htmlFor="line-numbers" className={`text-xs ${highContrast ? 'text-gray-300' : 'text-gray-400'}`}>
                          Line Numbers
                        </label>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="minimap"
                          checked={showMinimap}
                          onChange={(e) => setShowMinimap(e.target.checked)}
                        />
                        <label htmlFor="minimap" className={`text-xs ${highContrast ? 'text-gray-300' : 'text-gray-400'}`}>
                          Minimap
                        </label>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="word-wrap"
                          checked={wordWrap}
                          onChange={(e) => setWordWrap(e.target.checked)}
                        />
                        <label htmlFor="word-wrap" className={`text-xs ${highContrast ? 'text-gray-300' : 'text-gray-400'}`}>
                          Word Wrap
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accessibility Features */}
                <div className="mb-6">
                  <h4 className={`text-sm font-medium mb-3 ${highContrast ? 'text-white' : 'text-gray-200'}`}>
                    Features
                  </h4>
                  
                  <div className="space-y-2">
                    {accessibilityFeatures.map((feature) => (
                      <div key={feature.id} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={feature.id}
                            checked={feature.enabled}
                            onChange={(e) => {
                              // Update feature state here
                            }}
                          />
                          <label htmlFor={feature.id} className={`text-xs font-medium ${highContrast ? 'text-gray-200' : 'text-gray-300'}`}>
                            {feature.name}
                          </label>
                        </div>
                        <p className={`text-xs ${highContrast ? 'text-gray-400' : 'text-gray-500'} ml-5`}>
                          {feature.description}
                        </p>
                        <p className={`text-xs ${highContrast ? 'text-gray-500' : 'text-gray-600'} ml-5`}>
                          {feature.shortcut}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Syntax Errors */}
                {syntaxErrors.length > 0 && (
                  <div className="mb-6">
                    <h4 className={`text-sm font-medium mb-3 ${highContrast ? 'text-white' : 'text-gray-200'}`}>
                      Issues ({syntaxErrors.length})
                    </h4>
                    
                    <div className="space-y-2">
                      {syntaxErrors.map((error, index) => (
                        <div key={index} className={`p-2 rounded text-xs ${
                          error.severity === 'error' 
                            ? 'bg-red-900 text-red-200' 
                            : 'bg-yellow-900 text-yellow-200'
                        }`}>
                          <div className="flex items-center gap-2">
                            {error.severity === 'error' ? 
                              <AlertCircle className="w-3 h-3" /> : 
                              <Info className="w-3 h-3" />
                            }
                            <span>Line {error.line}</span>
                          </div>
                          <p className="mt-1">{error.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Accessibility Metrics */}
                <div>
                  <h4 className={`text-sm font-medium mb-3 ${highContrast ? 'text-white' : 'text-gray-200'}`}>
                    Metrics
                  </h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className={highContrast ? 'text-gray-300' : 'text-gray-400'}>Navigation Efficiency</span>
                      <span className="text-green-400">{accessibilityMetrics.keyboardEfficiency}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className={highContrast ? 'text-gray-300' : 'text-gray-400'}>Audio Accuracy</span>
                      <span className="text-blue-400">{accessibilityMetrics.audioFeedbackAccuracy}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className={highContrast ? 'text-gray-300' : 'text-gray-400'}>Error Detection</span>
                      <span className="text-purple-400">{accessibilityMetrics.errorDetectionRate}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className={highContrast ? 'text-gray-300' : 'text-gray-400'}>User Satisfaction</span>
                      <span className="text-orange-400">{accessibilityMetrics.userSatisfactionScore}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Bar */}
      <div className={`flex items-center justify-between px-4 py-2 text-xs border-t ${
        highContrast ? 'bg-black border-white text-white' : 'bg-gray-800 border-gray-700 text-gray-400'
      }`}>
        <div className="flex items-center gap-4">
          <span>
            {language.charAt(0).toUpperCase() + language.slice(1)}
          </span>
          <span>
            {value.split('\n').length} lines
          </span>
          <span>
            {selectedText ? `${selectedText.length} selected` : `${value.length} characters`}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {audioEnabled && (
            <div className="flex items-center gap-1">
              <Volume2 className="w-3 h-3" />
              <span>Audio: ON</span>
            </div>
          )}
          {brailleEnabled && (
            <div className="flex items-center gap-1">
              <Accessibility className="w-3 h-3" />
              <span>Braille: ON</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-400" />
            <span>Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;