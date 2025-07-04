const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// In-memory storage for demo purposes
let users = new Map();
let sessions = new Map();
let codeAnalytics = new Map();
let accessibilityMetrics = {
  totalUsers: 338,
  activeUsers: 0,
  audioFeedbackUsage: 89.2,
  brailleOutputUsage: 67.4,
  voiceNavigationUsage: 45.8,
  accuracyRate: 98.8,
  timeReduction: 48,
  errorDetectionRate: 94.6,
  userSatisfactionScore: 4.7,
  bootcampIntegrations: 7
};

let userFeedback = [
  {
    id: '1',
    userId: 'user1',
    rating: 5,
    comment: 'The audio feedback has completely transformed my coding experience. I can now navigate complex codebases with confidence.',
    feature: 'Audio Feedback',
    timestamp: new Date().toISOString(),
    verified: true
  },
  {
    id: '2',
    userId: 'user2',
    rating: 5,
    comment: 'Braille output is incredibly accurate and fast. The Grade 2 contractions save so much time.',
    feature: 'Braille Output',
    timestamp: new Date().toISOString(),
    verified: true
  },
  {
    id: '3',
    userId: 'user3',
    rating: 4,
    comment: 'Voice navigation works well, though it could use some improvement in noisy environments.',
    feature: 'Voice Navigation',
    timestamp: new Date().toISOString(),
    verified: true
  }
];

let codeTemplates = {
  javascript: {
    function: `function ${1:functionName}(${2:parameters}) {
  ${3:// Function body}
  return ${4:result};
}`,
    class: `class ${1:ClassName} {
  constructor(${2:parameters}) {
    ${3:// Constructor body}
  }
  
  ${4:methodName}() {
    ${5:// Method body}
  }
}`,
    asyncFunction: `async function ${1:functionName}(${2:parameters}) {
  try {
    ${3:// Async operation}
    const result = await ${4:asyncOperation};
    return result;
  } catch (error) {
    ${5:// Error handling}
    console.error('Error:', error);
    throw error;
  }
}`,
    component: `import React, { useState, useEffect } from 'react';

const ${1:ComponentName} = ({ ${2:props} }) => {
  const [${3:state}, set${3:State}] = useState(${4:initialValue});
  
  useEffect(() => {
    ${5:// Effect logic}
  }, [${6:dependencies}]);
  
  return (
    <div>
      ${7:// Component JSX}
    </div>
  );
};

export default ${1:ComponentName};`
  },
  python: {
    function: `def ${1:function_name}(${2:parameters}):
    """
    ${3:Function description}
    
    Args:
        ${4:parameter_description}
    
    Returns:
        ${5:return_description}
    """
    ${6:# Function body}
    return ${7:result}`,
    class: `class ${1:ClassName}:
    """${2:Class description}"""
    
    def __init__(self, ${3:parameters}):
        """Initialize the class instance."""
        ${4:# Constructor body}
    
    def ${5:method_name}(self, ${6:parameters}):
        """${7:Method description}"""
        ${8:# Method body}
        return ${9:result}`,
    asyncFunction: `import asyncio

async def ${1:async_function}(${2:parameters}):
    """
    ${3:Async function description}
    """
    try:
        ${4:# Async operation}
        result = await ${5:async_operation}
        return result
    except Exception as error:
        ${6:# Error handling}
        print(f"Error: {error}")
        raise`,
    dataClass: `from dataclasses import dataclass
from typing import Optional, List

@dataclass
class ${1:DataClassName}:
    """${2:Data class description}"""
    ${3:field_name}: ${4:field_type}
    ${5:optional_field}: Optional[${6:type}] = None
    
    def ${7:method_name}(self) -> ${8:return_type}:
        """${9:Method description}"""
        ${10:# Method implementation}
        return ${11:result}`
  },
  typescript: {
    interface: `interface ${1:InterfaceName} {
  ${2:property}: ${3:type};
  ${4:optionalProperty}?: ${5:type};
  ${6:method}(${7:parameters}): ${8:returnType};
}`,
    type: `type ${1:TypeName} = {
  ${2:property}: ${3:type};
  ${4:optionalProperty}?: ${5:type};
} | ${6:UnionType};`,
    genericFunction: `function ${1:functionName}<T extends ${2:constraint}>(
  ${3:parameter}: T
): ${4:returnType}<T> {
  ${5:// Function body}
  return ${6:result};
}`,
    reactComponent: `import React, { FC, useState, useEffect } from 'react';

interface ${1:ComponentName}Props {
  ${2:prop}: ${3:type};
  ${4:optionalProp}?: ${5:type};
}

const ${1:ComponentName}: FC<${1:ComponentName}Props> = ({ 
  ${2:prop}, 
  ${4:optionalProp} 
}) => {
  const [${6:state}, set${6:State}] = useState<${7:stateType}>(${8:initialValue});
  
  useEffect(() => {
    ${9:// Effect logic}
  }, [${10:dependencies}]);
  
  return (
    <div>
      ${11:// Component JSX}
    </div>
  );
};

export default ${1:ComponentName};`
  }
};

// Audio synthesis patterns for different code elements
const audioPatterns = {
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
    frequency: 1100,
    duration: 0.15,
    waveform: 'square',
    envelope: { attack: 0.02, decay: 0.05, sustain: 0.95, release: 0.08 }
  },
  operator: {
    frequency: 770,
    duration: 0.1,
    waveform: 'triangle',
    envelope: { attack: 0.01, decay: 0.03, sustain: 0.98, release: 0.05 }
  },
  keyword: {
    frequency: 294,
    duration: 0.3,
    waveform: 'sawtooth',
    envelope: { attack: 0.07, decay: 0.13, sustain: 0.78, release: 0.22 }
  }
};

// Braille character mappings
const brailleMappings = {
  'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑', 'f': '⠋', 'g': '⠛', 'h': '⠓',
  'i': '⠊', 'j': '⠚', 'k': '⠅', 'l': '⠇', 'm': '⠍', 'n': '⠝', 'o': '⠕', 'p': '⠏',
  'q': '⠟', 'r': '⠗', 's': '⠎', 't': '⠞', 'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭',
  'y': '⠽', 'z': '⠵', '1': '⠁', '2': '⠃', '3': '⠉', '4': '⠙', '5': '⠑', '6': '⠋',
  '7': '⠛', '8': '⠓', '9': '⠊', '0': '⠚', ' ': ' ', '\n': '\n', '\t': '⠀⠀',
  '(': '⠷', ')': '⠾', '[': '⠨⠷', ']': '⠨⠾', '{': '⠸⠷', '}': '⠸⠾',
  '=': '⠨⠅', '+': '⠬', '-': '⠤', '*': '⠔', '/': '⠌', '\\': '⠳',
  '<': '⠈⠣', '>': '⠈⠜', '&': '⠯', '|': '⠳', '^': '⠘', '~': '⠠⠤',
  '!': '⠖', '@': '⠈⠁', '#': '⠼', '$': '⠫', '%': '⠩', '"': '⠦',
  "'": '⠄', ':': '⠒', ';': '⠆', ',': '⠂', '.': '⠲', '?': '⠦'
};

// Programming-specific Braille contractions
const programmingContractions = {
  'function': '⠋⠝', 'return': '⠗⠞', 'class': '⠉⠇', 'public': '⠏⠃',
  'private': '⠏⠧', 'protected': '⠏⠞', 'static': '⠎⠞', 'const': '⠉⠎',
  'let': '⠇⠞', 'var': '⠧⠗', 'if': '⠊⠋', 'else': '⠑⠇', 'for': '⠋⠗',
  'while': '⠺⠓', 'do': '⠙⠕', 'switch': '⠎⠺', 'case': '⠉⠁',
  'break': '⠃⠅', 'continue': '⠉⠞', 'try': '⠞⠗', 'catch': '⠉⠓',
  'finally': '⠋⠇', 'throw': '⠞⠓', 'new': '⠝⠺', 'delete': '⠙⠇',
  'this': '⠞⠓', 'super': '⠎⠏', 'extends': '⠑⠭', 'implements': '⠊⠍',
  'interface': '⠊⠞', 'enum': '⠑⠝', 'import': '⠊⠍', 'export': '⠑⠭',
  'from': '⠋⠍', 'as': '⠁⠎', 'default': '⠙⠋', 'async': '⠁⠎',
  'await': '⠁⠺', 'promise': '⠏⠍', 'undefined': '⠥⠝', 'null': '⠝⠇',
  'true': '⠞⠗', 'false': '⠋⠇', 'boolean': '⠃⠇', 'string': '⠎⠞',
  'number': '⠝⠍', 'object': '⠕⠃', 'array': '⠁⠗'
};

// Utility functions
const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const analyzeCodeComplexity = (code) => {
  const lines = code.split('\n').filter(line => line.trim().length > 0);
  const functions = (code.match(/function\s+\w+|=>\s*{|class\s+\w+/g) || []).length;
  const conditionals = (code.match(/if\s*\(|else|switch|case/g) || []).length;
  const loops = (code.match(/for\s*\(|while\s*\(|do\s*{/g) || []).length;
  const variables = (code.match(/const\s+\w+|let\s+\w+|var\s+\w+/g) || []).length;
  
  const complexity = Math.min(10, Math.max(1, 
    (functions * 2) + (conditionals * 1.5) + (loops * 2) + (variables * 0.5)
  ));
  
  return {
    lines: lines.length,
    functions,
    conditionals,
    loops,
    variables,
    complexity: Math.round(complexity * 10) / 10,
    maintainabilityIndex: Math.max(0, Math.min(100, 100 - complexity * 5))
  };
};

const convertToBraille = (text, useContractions = true) => {
  let result = '';
  let i = 0;
  
  while (i < text.length) {
    let matched = false;
    
    // Check for programming contractions first
    if (useContractions) {
      for (const [word, braille] of Object.entries(programmingContractions)) {
        if (text.substring(i, i + word.length).toLowerCase() === word) {
          // Ensure it's a complete word
          const nextChar = text[i + word.length];
          if (!nextChar || !nextChar.match(/[a-zA-Z0-9_]/)) {
            result += braille;
            i += word.length;
            matched = true;
            break;
          }
        }
      }
    }
    
    if (!matched) {
      const char = text[i].toLowerCase();
      result += brailleMappings[char] || '⠿'; // Replacement character for unmapped
      i++;
    }
  }
  
  return result;
};

const parseCodeStructure = (code, language = 'javascript') => {
  const elements = [];
  const lines = code.split('\n');
  let elementId = 0;
  
  lines.forEach((line, lineIndex) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;
    
    // Function detection
    const functionMatch = trimmedLine.match(/^(async\s+)?(function\s+|const\s+|let\s+|var\s+)?(\w+)\s*[=:]?\s*(async\s+)?\(([^)]*)\)/);
    if (functionMatch) {
      elements.push({
        id: `function-${elementId++}`,
        type: 'function',
        name: functionMatch[3],
        line: lineIndex + 1,
        column: line.indexOf(functionMatch[3]) + 1,
        params: functionMatch[5] ? functionMatch[5].split(',').map(p => p.trim()) : [],
        isAsync: !!(functionMatch[1] || functionMatch[4]),
        complexity: analyzeCodeComplexity(trimmedLine).complexity
      });
    }
    
    // Class detection
    const classMatch = trimmedLine.match(/^(export\s+)?(abstract\s+)?class\s+(\w+)/);
    if (classMatch) {
      elements.push({
        id: `class-${elementId++}`,
        type: 'class',
        name: classMatch[3],
        line: lineIndex + 1,
        column: line.indexOf(classMatch[3]) + 1,
        isExported: !!classMatch[1],
        isAbstract: !!classMatch[2]
      });
    }
    
    // Variable detection
    const variableMatch = trimmedLine.match(/^(const|let|var)\s+(\w+)/);
    if (variableMatch) {
      elements.push({
        id: `variable-${elementId++}`,
        type: 'variable',
        name: variableMatch[2],
        line: lineIndex + 1,
        column: line.indexOf(variableMatch[2]) + 1,
        declarationType: variableMatch[1]
      });
    }
    
    // Comment detection
    if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*')) {
      elements.push({
        id: `comment-${elementId++}`,
        type: 'comment',
        name: trimmedLine.substring(0, 50) + (trimmedLine.length > 50 ? '...' : ''),
        line: lineIndex + 1,
        column: 1,
        content: trimmedLine
      });
    }
  });
  
  return elements;
};

const generateAccessibilityReport = (sessionId) => {
  const session = sessions.get(sessionId);
  if (!session) return null;
  
  const analytics = codeAnalytics.get(sessionId) || {
    linesOfCode: 0,
    functionsCreated: 0,
    errorsDetected: 0,
    timeSpent: 0,
    audioFeedbackUsed: false,
    brailleOutputUsed: false,
    voiceNavigationUsed: false,
    keyboardShortcutsUsed: 0,
    codeCompletionAccepted: 0
  };
  
  const efficiency = Math.min(100, Math.max(0, 
    (analytics.functionsCreated * 10) + 
    (analytics.codeCompletionAccepted * 5) - 
    (analytics.errorsDetected * 2)
  ));
  
  const accessibilityScore = 
    (analytics.audioFeedbackUsed ? 25 : 0) +
    (analytics.brailleOutputUsed ? 25 : 0) +
    (analytics.voiceNavigationUsed ? 20 : 0) +
    (analytics.keyboardShortcutsUsed > 5 ? 30 : analytics.keyboardShortcutsUsed * 6);
  
  return {
    sessionId,
    userId: session.userId,
    duration: analytics.timeSpent,
    linesOfCode: analytics.linesOfCode,
    functionsCreated: analytics.functionsCreated,
    errorsDetected: analytics.errorsDetected,
    efficiency: Math.round(efficiency),
    accessibilityScore: Math.round(accessibilityScore),
    featuresUsed: {
      audioFeedback: analytics.audioFeedbackUsed,
      brailleOutput: analytics.brailleOutputUsed,
      voiceNavigation: analytics.voiceNavigationUsed,
      keyboardShortcuts: analytics.keyboardShortcutsUsed,
      codeCompletion: analytics.codeCompletionAccepted
    },
    recommendations: generateRecommendations(analytics, accessibilityScore),
    timestamp: new Date().toISOString()
  };
};

const generateRecommendations = (analytics, accessibilityScore) => {
  const recommendations = [];
  
  if (!analytics.audioFeedbackUsed) {
    recommendations.push({
      type: 'feature',
      priority: 'high',
      title: 'Enable Audio Feedback',
      description: 'Audio feedback can significantly improve your coding efficiency by providing real-time auditory cues for different code elements.',
      action: 'Enable audio feedback in settings'
    });
  }
  
  if (!analytics.brailleOutputUsed && analytics.audioFeedbackUsed) {
    recommendations.push({
      type: 'feature',
      priority: 'medium',
      title: 'Try Braille Output',
      description: 'Braille output complements audio feedback and can provide detailed code structure information.',
      action: 'Enable Braille output in accessibility settings'
    });
  }
  
  if (analytics.keyboardShortcutsUsed < 5) {
    recommendations.push({
      type: 'efficiency',
      priority: 'medium',
      title: 'Learn Keyboard Shortcuts',
      description: 'Keyboard shortcuts can dramatically speed up your navigation and coding workflow.',
      action: 'Review the keyboard shortcuts guide'
    });
  }
  
  if (analytics.errorsDetected > analytics.functionsCreated) {
    recommendations.push({
      type: 'quality',
      priority: 'high',
      title: 'Focus on Code Quality',
      description: 'Consider using more code completion and error detection features to reduce syntax errors.',
      action: 'Enable real-time error detection'
    });
  }
  
  if (accessibilityScore < 50) {
    recommendations.push({
      type: 'accessibility',
      priority: 'high',
      title: 'Improve Accessibility Usage',
      description: 'You\'re not taking full advantage of the accessibility features available. Try enabling more features.',
      action: 'Explore accessibility dashboard for feature overview'
    });
  }
  
  return recommendations;
};

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: {
      audioFeedback: true,
      brailleOutput: true,
      voiceNavigation: true,
      codeAnalysis: true,
      realTimeSync: true
    }
  });
});

// User session management
app.post('/api/session/create', (req, res) => {
  const { userId, preferences = {} } = req.body;
  const sessionId = generateSessionId();
  
  const session = {
    sessionId,
    userId: userId || `anonymous-${Date.now()}`,
    preferences: {
      audioEnabled: true,
      brailleEnabled: false,
      voiceEnabled: false,
      highContrast: false,
      fontSize: 14,
      audioVolume: 0.7,
      navigationMode: 'keyboard',
      ...preferences
    },
    startTime: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    isActive: true
  };
  
  sessions.set(sessionId, session);
  users.set(session.userId, { ...users.get(session.userId), lastSession: sessionId });
  
  // Initialize analytics for this session
  codeAnalytics.set(sessionId, {
    linesOfCode: 0,
    functionsCreated: 0,
    errorsDetected: 0,
    timeSpent: 0,
    audioFeedbackUsed: session.preferences.audioEnabled,
    brailleOutputUsed: session.preferences.brailleEnabled,
    voiceNavigationUsed: session.preferences.voiceEnabled,
    keyboardShortcutsUsed: 0,
    codeCompletionAccepted: 0,
    codeChanges: [],
    navigationEvents: [],
    errorEvents: []
  });
  
  accessibilityMetrics.activeUsers = sessions.size;
  
  res.json({ 
    success: true, 
    sessionId, 
    session: {
      ...session,
      analytics: codeAnalytics.get(sessionId)
    }
  });
});

// Get session info
app.get('/api/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  const analytics = codeAnalytics.get(sessionId);
  
  res.json({
    success: true,
    session: {
      ...session,
      analytics
    }
  });
});

// Update session preferences
app.put('/api/session/:sessionId/preferences', (req, res) => {
  const { sessionId } = req.params;
  const { preferences } = req.body;
  
  const session = sessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  session.preferences = { ...session.preferences, ...preferences };
  session.lastActivity = new Date().toISOString();
  sessions.set(sessionId, session);
  
  // Update analytics based on preference changes
  const analytics = codeAnalytics.get(sessionId);
  if (analytics) {
    analytics.audioFeedbackUsed = analytics.audioFeedbackUsed || preferences.audioEnabled;
    analytics.brailleOutputUsed = analytics.brailleOutputUsed || preferences.brailleEnabled;
    analytics.voiceNavigationUsed = analytics.voiceNavigationUsed || preferences.voiceEnabled;
    codeAnalytics.set(sessionId, analytics);
  }
  
  res.json({ success: true, preferences: session.preferences });
});

// Code analysis endpoint
app.post('/api/code/analyze', (req, res) => {
  const { code, language = 'javascript', sessionId } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }
  
  try {
    const structure = parseCodeStructure(code, language);
    const complexity = analyzeCodeComplexity(code);
    const brailleOutput = convertToBraille(code, true);
    
    // Update analytics if session provided
    if (sessionId && sessions.has(sessionId)) {
      const analytics = codeAnalytics.get(sessionId) || {};
      analytics.linesOfCode = complexity.lines;
      analytics.functionsCreated = complexity.functions;
      analytics.codeChanges = analytics.codeChanges || [];
      analytics.codeChanges.push({
        timestamp: new Date().toISOString(),
        linesChanged: complexity.lines,
        complexity: complexity.complexity
      });
      
      // Keep only last 100 changes
      if (analytics.codeChanges.length > 100) {
        analytics.codeChanges = analytics.codeChanges.slice(-100);
      }
      
      codeAnalytics.set(sessionId, analytics);
      
      // Update session activity
      const session = sessions.get(sessionId);
      session.lastActivity = new Date().toISOString();
      sessions.set(sessionId, session);
    }
    
    res.json({
      success: true,
      analysis: {
        structure,
        complexity,
        brailleOutput,
        audioPatterns: structure.map(element => ({
          ...element,
          audioPattern: audioPatterns[element.type] || audioPatterns.keyword
        })),
        suggestions: generateCodeSuggestions(structure, complexity),
        accessibility: {
          readabilityScore: Math.max(0, 100 - complexity.complexity * 10),
          navigationComplexity: Math.min(10, structure.length / 5),
          audioFriendliness: calculateAudioFriendliness(structure)
        }
      }
    });
  } catch (error) {
    console.error('Code analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze code' });
  }
});

// Generate code suggestions
const generateCodeSuggestions = (structure, complexity) => {
  const suggestions = [];
  
  if (complexity.complexity > 7) {
    suggestions.push({
      type: 'refactor',
      priority: 'high',
      message: 'Consider breaking down complex functions into smaller, more manageable pieces',
      line: structure.find(s => s.type === 'function')?.line || 1
    });
  }
  
  if (complexity.functions === 0 && complexity.lines > 10) {
    suggestions.push({
      type: 'structure',
      priority: 'medium',
      message: 'Consider organizing code into functions for better modularity',
      line: 1
    });
  }
  
  const uncommentedFunctions = structure.filter(s => s.type === 'function').length;
  const comments = structure.filter(s => s.type === 'comment').length;
  
  if (uncommentedFunctions > 2 && comments === 0) {
    suggestions.push({
      type: 'documentation',
      priority: 'medium',
      message: 'Add comments to improve code accessibility and maintainability',
      line: structure.find(s => s.type === 'function')?.line || 1
    });
  }
  
  return suggestions;
};

// Calculate audio friendliness score
const calculateAudioFriendliness = (structure) => {
  let score = 100;
  
  // Penalize deeply nested structures
  const maxNesting = Math.max(...structure.map(s => s.column || 1));
  if (maxNesting > 20) score -= (maxNesting - 20) * 2;
  
  // Reward good function-to-line ratio
  const functions = structure.filter(s => s.type === 'function').length;
  const totalElements = structure.length;
  
  if (functions > 0 && totalElements / functions < 10) {
    score += 10;
  }
  
  // Reward comments
  const comments = structure.filter(s => s.type === 'comment').length;
  score += Math.min(20, comments * 5);
  
  return Math.max(0, Math.min(100, score));
};

// Audio pattern generation
app.post('/api/audio/generate-pattern', (req, res) => {
  const { elementType, customSettings = {} } = req.body;
  
  const basePattern = audioPatterns[elementType] || audioPatterns.keyword;
  const pattern = { ...basePattern, ...customSettings };
  
  res.json({
    success: true,
    pattern,
    instructions: {
      frequency: `${pattern.frequency}Hz`,
      duration: `${pattern.duration}s`,
      waveform: pattern.waveform,
      envelope: pattern.envelope
    }
  });
});

// Braille conversion endpoint
app.post('/api/braille/convert', (req, res) => {
  const { text, useContractions = true, grade = 'grade2' } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }
  
  try {
    const brailleOutput = convertToBraille(text, useContractions && grade === 'grade2');
    const stats = {
      originalLength: text.length,
      brailleLength: brailleOutput.length,
      compressionRatio: text.length > 0 ? (brailleOutput.length / text.length) * 100 : 0,
      contractionsUsed: useContractions && grade === 'grade2' ? 
        Object.keys(programmingContractions).filter(word => 
          text.toLowerCase().includes(word)
        ).length : 0
    };
    
    res.json({
      success: true,
      braille: brailleOutput,
      stats,
      settings: {
        grade,
        useContractions
      }
    });
  } catch (error) {
    console.error('Braille conversion error:', error);
    res.status(500).json({ error: 'Failed to convert to Braille' });
  }
});

// Code templates endpoint
app.get('/api/templates/:language', (req, res) => {
  const { language } = req.params;
  const templates = codeTemplates[language];
  
  if (!templates) {
    return res.status(404).json({ error: 'Language not supported' });
  }
  
  res.json({
    success: true,
    language,
    templates
  });
});

// Get all supported languages
app.get('/api/templates', (req, res) => {
  res.json({
    success: true,
    languages: Object.keys(codeTemplates),
    totalTemplates: Object.values(codeTemplates).reduce((sum, templates) => sum + Object.keys(templates).length, 0)
  });
});

// Analytics endpoints
app.get('/api/analytics/metrics', (req, res) => {
  const { timeRange = '7d' } = req.query;
  
  // Generate sample data based on time range
  const generateMetrics = (days) => {
    const metrics = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      metrics.push({
        date: date.toISOString().split('T')[0],
        activeUsers: Math.floor(Math.random() * 50) + 280,
        audioFeedbackUsage: Math.random() * 10 + 85,
        brailleOutputUsage: Math.random() * 15 + 60,
        voiceNavigationUsage: Math.random() * 20 + 35,
        errorDetectionRate: Math.random() * 5 + 90,
        codeCompletionUsage: Math.random() * 12 + 70,
        averageSessionDuration: Math.random() * 30 + 45,
        userSatisfactionScore: Math.random() * 0.5 + 4.2
      });
    }
    
    return metrics;
  };
  
  const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const metrics = generateMetrics(days);
  
  res.json({
    success: true,
    timeRange,
    metrics,
    summary: {
      totalSessions: sessions.size,
      activeUsers: accessibilityMetrics.activeUsers,
      averageAccuracy: accessibilityMetrics.accuracyRate,
      totalFeedback: userFeedback.length
    }
  });
});

// User feedback endpoints
app.get('/api/feedback', (req, res) => {
  const { limit = 10, offset = 0, feature } = req.query;
  
  let filteredFeedback = userFeedback;
  if (feature) {
    filteredFeedback = userFeedback.filter(f => f.feature.toLowerCase().includes(feature.toLowerCase()));
  }
  
  const paginatedFeedback = filteredFeedback
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(parseInt(offset), parseInt(offset) + parseInt(limit));
  
  res.json({
    success: true,
    feedback: paginatedFeedback,
    total: filteredFeedback.length,
    pagination: {
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: parseInt(offset) + parseInt(limit) < filteredFeedback.length
    }
  });
});

app.post('/api/feedback', (req, res) => {
  const { userId, rating, comment, feature, sessionId } = req.body;
  
  if (!rating || !comment || !feature) {
    return res.status(400).json({ error: 'Rating, comment, and feature are required' });
  }
  
  const feedback = {
    id: `feedback-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    userId: userId || 'anonymous',
    rating: Math.max(1, Math.min(5, parseInt(rating))),
    comment: comment.trim(),
    feature,
    sessionId,
    timestamp: new Date().toISOString(),
    verified: false // Would be verified through email or other means
  };
  
  userFeedback.push(feedback);
  
  // Update metrics
  const totalRating = userFeedback.reduce((sum, f) => sum + f.rating, 0);
  accessibilityMetrics.userSatisfactionScore = totalRating / userFeedback.length;
  
  res.json({
    success: true,
    feedback,
    message: 'Thank you for your feedback!'
  });
});

// Error reporting endpoint
app.post('/api/errors/report', (req, res) => {
  const { sessionId, error, context, severity = 'medium' } = req.body;
  
  const errorReport = {
    id: `error-${Date.now()}`,
    sessionId,
    error: {
      message: error.message,
      stack: error.stack,
      type: error.type || 'unknown'
    },
    context,
    severity,
    timestamp: new Date().toISOString(),
    userAgent: req.headers['user-agent'],
    resolved: false
  };
  
  // In a real application, this would be stored in a database
  console.error('Error reported:', errorReport);
  
  // Update analytics
  if (sessionId && codeAnalytics.has(sessionId)) {
    const analytics = codeAnalytics.get(sessionId);
    analytics.errorsDetected = (analytics.errorsDetected || 0) + 1;
    analytics.errorEvents = analytics.errorEvents || [];
    analytics.errorEvents.push({
      timestamp: new Date().toISOString(),
      error: error.message,
      severity
    });
    codeAnalytics.set(sessionId, analytics);
  }
  
  res.json({
    success: true,
    errorId: errorReport.id,
    message: 'Error report received'
  });
});

// Navigation tracking
app.post('/api/navigation/track', (req, res) => {
  const { sessionId, action, element, timestamp } = req.body;
  
  if (!sessionId || !action) {
    return res.status(400).json({ error: 'Session ID and action are required' });
  }
  
  if (codeAnalytics.has(sessionId)) {
    const analytics = codeAnalytics.get(sessionId);
    analytics.navigationEvents = analytics.navigationEvents || [];
    analytics.navigationEvents.push({
      action,
      element,
      timestamp: timestamp || new Date().toISOString()
    });
    
    // Track keyboard shortcut usage
    if (action === 'keyboard-shortcut') {
      analytics.keyboardShortcutsUsed = (analytics.keyboardShortcutsUsed || 0) + 1;
    }
    
    // Keep only last 200 navigation events
    if (analytics.navigationEvents.length > 200) {
      analytics.navigationEvents = analytics.navigationEvents.slice(-200);
    }
    
    codeAnalytics.set(sessionId, analytics);
  }
  
  res.json({ success: true });
});

// Code completion tracking
app.post('/api/completion/track', (req, res) => {
  const { sessionId, accepted, suggestion, context } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }
  
  if (codeAnalytics.has(sessionId)) {
    const analytics = codeAnalytics.get(sessionId);
    
    if (accepted) {
      analytics.codeCompletionAccepted = (analytics.codeCompletionAccepted || 0) + 1;
    }
    
    codeAnalytics.set(sessionId, analytics);
  }
  
  res.json({ success: true });
});

// Accessibility report generation
app.get('/api/accessibility/report/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const report = generateAccessibilityReport(sessionId);
  
  if (!report) {
    return res.status(404).json({ error: 'Session not found or no data available' });
  }
  
  res.json({
    success: true,
    report
  });
});

// Global accessibility metrics
app.get('/api/accessibility/global-metrics', (req, res) => {
  res.json({
    success: true,
    metrics: {
      ...accessibilityMetrics,
      lastUpdated: new Date().toISOString(),
      totalSessions: sessions.size,
      totalFeedback: userFeedback.length,
      averageRating: userFeedback.length > 0 ? 
        userFeedback.reduce((sum, f) => sum + f.rating, 0) / userFeedback.length : 0
    }
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-session', (sessionId) => {
    socket.join(sessionId);
    console.log(`Socket ${socket.id} joined session ${sessionId}`);
    
    // Send current session data
    const session = sessions.get(sessionId);
    if (session) {
      socket.emit('session-data', {
        session,
        analytics: codeAnalytics.get(sessionId)
      });
    }
  });
  
  socket.on('code-change', (data) => {
    const { sessionId, code, language } = data;
    
    // Broadcast to other clients in the same session
    socket.to(sessionId).emit('code-updated', { code, language });
    
    // Update analytics
    if (codeAnalytics.has(sessionId)) {
      const analytics = codeAnalytics.get(sessionId);
      analytics.linesOfCode = code.split('\n').filter(line => line.trim().length > 0).length;
      analytics.lastCodeChange = new Date().toISOString();
      codeAnalytics.set(sessionId, analytics);
      
      // Emit analytics update
      io.to(sessionId).emit('analytics-updated', analytics);
    }
  });
  
  socket.on('audio-feedback', (data) => {
    const { sessionId, elementType, settings } = data;
    
    // Generate audio pattern
    const pattern = { ...audioPatterns[elementType] || audioPatterns.keyword, ...settings };
    
    // Broadcast to session
    socket.to(sessionId).emit('play-audio', { pattern, elementType });
  });
  
  socket.on('navigation-event', (data) => {
    const { sessionId, action, element } = data;
    
    // Track navigation
    if (codeAnalytics.has(sessionId)) {
      const analytics = codeAnalytics.get(sessionId);
      analytics.navigationEvents = analytics.navigationEvents || [];
      analytics.navigationEvents.push({
        action,
        element,
        timestamp: new Date().toISOString()
      });
      codeAnalytics.set(sessionId, analytics);
    }
    
    // Broadcast to session
    socket.to(sessionId).emit('navigation-update', { action, element });
  });
  
  socket.on('voice-command', (data) => {
    const { sessionId, command, transcript } = data;
    
    // Process voice command
    const response = processVoiceCommand(command, transcript);
    
    // Send response back to client
    socket.emit('voice-response', response);
    
    // Track voice usage
    if (codeAnalytics.has(sessionId)) {
      const analytics = codeAnalytics.get(sessionId);
      analytics.voiceNavigationUsed = true;
      codeAnalytics.set(sessionId, analytics);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Voice command processing
const processVoiceCommand = (command, transcript) => {
  const lowerCommand = command.toLowerCase();
  const lowerTranscript = transcript.toLowerCase();
  
  if (lowerTranscript.includes('navigate to function')) {
    const functionName = lowerTranscript.replace('navigate to function', '').trim();
    return {
      action: 'navigate',
      target: 'function',
      value: functionName,
      message: `Navigating to function ${functionName}`
    };
  }
  
  if (lowerTranscript.includes('navigate to class')) {
    const className = lowerTranscript.replace('navigate to class', '').trim();
    return {
      action: 'navigate',
      target: 'class',
      value: className,
      message: `Navigating to class ${className}`
    };
  }
  
  if (lowerTranscript.includes('search for')) {
    const searchTerm = lowerTranscript.replace('search for', '').trim();
    return {
      action: 'search',
      value: searchTerm,
      message: `Searching for ${searchTerm}`
    };
  }
  
  if (lowerTranscript.includes('jump to line')) {
    const lineMatch = lowerTranscript.match(/jump to line (\d+)/);
    if (lineMatch) {
      return {
        action: 'jump',
        target: 'line',
        value: parseInt(lineMatch[1]),
        message: `Jumping to line ${lineMatch[1]}`
      };
    }
  }
  
  if (lowerTranscript === 'go back') {
    return {
      action: 'navigate',
      target: 'back',
      message: 'Going back'
    };
  }
  
  if (lowerTranscript === 'go forward') {
    return {
      action: 'navigate',
      target: 'forward',
      message: 'Going forward'
    };
  }
  
  if (lowerTranscript.includes('toggle audio')) {
    return {
      action: 'toggle',
      target: 'audio',
      message: 'Toggling audio feedback'
    };
  }
  
  if (lowerTranscript.includes('toggle braille')) {
    return {
      action: 'toggle',
      target: 'braille',
      message: 'Toggling Braille output'
    };
  }
  
  return {
    action: 'unknown',
    message: `Command not recognized: ${transcript}`,
    suggestions: [
      'Try "navigate to function [name]"',
      'Try "search for [term]"',
      'Try "jump to line [number]"',
      'Try "toggle audio" or "toggle braille"'
    ]
  };
};

// Cleanup inactive sessions
setInterval(() => {
  const now = new Date();
  const inactiveThreshold = 30 * 60 * 1000; // 30 minutes
  
  for (const [sessionId, session] of sessions.entries()) {
    const lastActivity = new Date(session.lastActivity);
    if (now - lastActivity > inactiveThreshold) {
      sessions.delete(sessionId);
      codeAnalytics.delete(sessionId);
      console.log(`Cleaned up inactive session: ${sessionId}`);
    }
  }
  
  accessibilityMetrics.activeUsers = sessions.size;
}, 5 * 60 * 1000); // Check every 5 minutes

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Accessibility Development Toolkit Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔌 WebSocket server ready for real-time communication`);
  console.log(`♿ Accessibility features: Audio feedback, Braille output, Voice navigation`);
  console.log(`📈 Analytics tracking: Code complexity, user behavior, accessibility metrics`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };