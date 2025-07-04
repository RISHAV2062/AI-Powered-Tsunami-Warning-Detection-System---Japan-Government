import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { 
  Volume2, 
  Braille, 
  Code, 
  Settings, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  Eye,
  EyeOff,
  Headphones,
  Keyboard,
  Accessibility,
  Zap,
  Heart,
  Trophy,
  Users,
  BookOpen,
  Lightbulb,
  Target,
  CheckCircle,
  ArrowRight,
  Github,
  Download,
  Star,
  Coffee,
  Mic,
  Speaker,
  Monitor,
  Smartphone
} from 'lucide-react';
import CodeEditor from './components/CodeEditor';
import AudioVisualizer from './components/AudioVisualizer';
import BrailleOutput from './components/BrailleOutput';
import SettingsPanel from './components/SettingsPanel';
import NavigationHelper from './components/NavigationHelper';
import AccessibilityDashboard from './components/AccessibilityDashboard';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'editor' | 'dashboard' | 'settings'>('home');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [brailleEnabled, setBrailleEnabled] = useState(true);
  const [currentCode, setCurrentCode] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.7);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [navigationMode, setNavigationMode] = useState<'keyboard' | 'voice' | 'gesture'>('keyboard');
  const [activeUsers, setActiveUsers] = useState(338);
  const [bootcampCount] = useState(7);
  const [accuracyRate] = useState(98.8);
  const [timeReduction] = useState(48);

  const languages = [
    'javascript', 'typescript', 'python', 'java', 'cpp', 'csharp', 
    'go', 'rust', 'php', 'ruby', 'swift', 'kotlin'
  ];

  const features = [
    {
      icon: Volume2,
      title: 'Real-time Audio Conversion',
      description: 'Convert code syntax into distinct audio tones and patterns for immediate auditory feedback',
      color: 'bg-blue-500',
      stats: '98.8% accuracy'
    },
    {
      icon: Braille,
      title: 'Braille Output System',
      description: 'Dynamic Braille conversion with Grade 2 support and programming-specific contractions',
      color: 'bg-purple-500',
      stats: 'Multi-language support'
    },
    {
      icon: Code,
      title: 'AST Analysis Engine',
      description: 'Advanced syntax tree parsing for intelligent code structure recognition and navigation',
      color: 'bg-green-500',
      stats: '48% faster navigation'
    },
    {
      icon: Keyboard,
      title: 'Smart Navigation',
      description: 'Intuitive keyboard shortcuts and voice commands optimized for screen reader compatibility',
      color: 'bg-orange-500',
      stats: '100+ shortcuts'
    }
  ];

  const achievements = [
    {
      icon: Trophy,
      title: '1st Place Global Good Hackathon',
      description: 'Recognized for innovation in accessibility technology',
      color: 'text-yellow-500'
    },
    {
      icon: Users,
      title: '338 Developers Empowered',
      description: 'Actively used by visually impaired developers worldwide',
      color: 'text-blue-500'
    },
    {
      icon: BookOpen,
      title: '7 Bootcamps Integrated',
      description: 'Successfully implemented across coding education programs',
      color: 'text-green-500'
    },
    {
      icon: Target,
      title: '98.8% Accuracy Rate',
      description: 'Precision in code syntax recognition and conversion',
      color: 'text-purple-500'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Full-Stack Developer',
      quote: 'This toolkit transformed my coding experience. The audio feedback is incredibly intuitive and has made me 50% more productive.',
      rating: 5
    },
    {
      name: 'Marcus Johnson',
      role: 'Software Engineering Student',
      quote: 'Finally, a tool that understands accessibility needs. The Braille output is seamless and the keyboard navigation is brilliant.',
      rating: 5
    },
    {
      name: 'Dr. Elena Rodriguez',
      role: 'Computer Science Professor',
      quote: 'We integrated this into our curriculum and saw immediate improvements in student engagement and code comprehension.',
      rating: 5
    }
  ];

  const codeExamples = {
    javascript: `// Welcome to Accessibility Toolkit Demo
function calculateAccessibility(features) {
  const audioFeedback = features.audio || true;
  const brailleOutput = features.braille || true;
  const voiceNavigation = features.voice || false;
  
  if (audioFeedback && brailleOutput) {
    return {
      score: 98.8,
      effectiveness: 'excellent',
      userSatisfaction: 'high',
      adoptionRate: 'growing'
    };
  }
  
  return enhanceAccessibility(features);
}

// AST Analysis for Code Structure
class CodeAnalyzer {
  constructor(language = 'javascript') {
    this.language = language;
    this.patterns = new Map();
    this.audioMappings = new AudioMappingEngine();
    this.brailleConverter = new BrailleConverter();
  }
  
  parseCode(sourceCode) {
    try {
      const ast = this.generateAST(sourceCode);
      const audioSignals = this.convertToAudio(ast);
      const brailleOutput = this.convertToBraille(ast);
      
      return {
        success: true,
        audio: audioSignals,
        braille: brailleOutput,
        navigation: this.generateNavigation(ast)
      };
    } catch (error) {
      return this.handleParsingError(error);
    }
  }
}`,
    python: `# Python Accessibility Enhancement Demo
import ast
import asyncio
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class AccessibilityConfig:
    audio_enabled: bool = True
    braille_enabled: bool = True
    voice_navigation: bool = False
    contrast_mode: bool = False
    audio_volume: float = 0.7

class PythonCodeAnalyzer:
    def __init__(self, config: AccessibilityConfig):
        self.config = config
        self.ast_parser = ast
        self.audio_engine = AudioEngine()
        self.braille_converter = BrailleConverter()
        self.accuracy_rate = 98.8
        
    async def analyze_code(self, source_code: str) -> Dict:
        """Analyze Python code and generate accessibility outputs"""
        try:
            parsed_ast = self.ast_parser.parse(source_code)
            
            # Generate audio patterns
            audio_patterns = await self.generate_audio_patterns(parsed_ast)
            
            # Convert to Braille
            braille_output = self.convert_to_braille(parsed_ast)
            
            # Create navigation map
            navigation_map = self.create_navigation_map(parsed_ast)
            
            return {
                'status': 'success',
                'audio': audio_patterns,
                'braille': braille_output,
                'navigation': navigation_map,
                'accuracy': self.accuracy_rate
            }
        except SyntaxError as e:
            return self.handle_syntax_error(e)
            
    def generate_audio_patterns(self, ast_node):
        """Convert AST nodes to audio patterns"""
        patterns = []
        
        for node in ast.walk(ast_node):
            if isinstance(node, ast.FunctionDef):
                patterns.append(self.create_function_tone(node.name))
            elif isinstance(node, ast.ClassDef):
                patterns.append(self.create_class_chord(node.name))
            elif isinstance(node, ast.For):
                patterns.append(self.create_loop_rhythm())
            elif isinstance(node, ast.If):
                patterns.append(self.create_conditional_melody())
                
        return patterns`
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case '1':
            event.preventDefault();
            setCurrentView('home');
            break;
          case '2':
            event.preventDefault();
            setCurrentView('editor');
            break;
          case '3':
            event.preventDefault();
            setCurrentView('dashboard');
            break;
          case '4':
            event.preventDefault();
            setCurrentView('settings');
            break;
          case ' ':
            event.preventDefault();
            setIsPlaying(!isPlaying);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const HomePage = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`min-h-screen ${highContrastMode ? 'bg-black text-white' : 'bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50'}`}
    >
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div variants={itemVariants} className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-8"
            >
              <Accessibility className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className={`text-6xl font-bold mb-6 ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
              Accessibility
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Development </span>
              Toolkit
            </h1>
            
            <p className={`text-xl mb-8 max-w-3xl mx-auto leading-relaxed ${highContrastMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Award-winning toolkit that transforms coding for visually impaired developers through 
              real-time audio conversion, Braille output, and intelligent navigation. Winner of 1st Place 
              at Global Good Hackathon, empowering 338 developers across 7 bootcamps.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentView('editor')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Play className="w-5 h-5" />
                Try Live Demo
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentView('dashboard')}
                className={`px-8 py-4 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 ${
                  highContrastMode 
                    ? 'bg-white text-black border-2 border-white' 
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <Zap className="w-5 h-5" />
                View Dashboard
              </motion.button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <motion.div variants={itemVariants} className={`text-center p-4 rounded-xl ${highContrastMode ? 'bg-gray-800' : 'bg-white/70 backdrop-blur-sm'} shadow-lg`}>
                <div className="text-3xl font-bold text-blue-600">{accuracyRate}%</div>
                <div className={`text-sm ${highContrastMode ? 'text-gray-300' : 'text-gray-600'}`}>Code Accuracy</div>
              </motion.div>
              <motion.div variants={itemVariants} className={`text-center p-4 rounded-xl ${highContrastMode ? 'bg-gray-800' : 'bg-white/70 backdrop-blur-sm'} shadow-lg`}>
                <div className="text-3xl font-bold text-green-600">{timeReduction}%</div>
                <div className={`text-sm ${highContrastMode ? 'text-gray-300' : 'text-gray-600'}`}>Time Reduction</div>
              </motion.div>
              <motion.div variants={itemVariants} className={`text-center p-4 rounded-xl ${highContrastMode ? 'bg-gray-800' : 'bg-white/70 backdrop-blur-sm'} shadow-lg`}>
                <div className="text-3xl font-bold text-purple-600">{activeUsers}</div>
                <div className={`text-sm ${highContrastMode ? 'text-gray-300' : 'text-gray-600'}`}>Active Users</div>
              </motion.div>
              <motion.div variants={itemVariants} className={`text-center p-4 rounded-xl ${highContrastMode ? 'bg-gray-800' : 'bg-white/70 backdrop-blur-sm'} shadow-lg`}>
                <div className="text-3xl font-bold text-orange-600">{bootcampCount}</div>
                <div className={`text-sm ${highContrastMode ? 'text-gray-300' : 'text-gray-600'}`}>Bootcamps</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className={`py-20 ${highContrastMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
              Revolutionary Features
            </h2>
            <p className={`text-xl ${highContrastMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
              Cutting-edge accessibility technology that transforms the development experience 
              through innovative audio-visual conversion and intelligent code navigation.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                  highContrastMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'
                }`}
              >
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-xl font-semibold mb-3 ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                  {feature.title}
                </h3>
                <p className={`${highContrastMode ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
                  {feature.description}
                </p>
                <div className="text-sm font-medium text-blue-600">
                  {feature.stats}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className={`py-20 ${highContrastMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
              Recognition & Impact
            </h2>
            <p className={`text-xl ${highContrastMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
              Our commitment to accessibility has been recognized globally and continues to make 
              a meaningful impact in the developer community.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className={`text-center p-6 rounded-2xl shadow-lg ${
                  highContrastMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'
                }`}
              >
                <achievement.icon className={`w-12 h-12 mx-auto mb-4 ${achievement.color}`} />
                <h3 className={`text-lg font-semibold mb-2 ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                  {achievement.title}
                </h3>
                <p className={`text-sm ${highContrastMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {achievement.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className={`py-20 ${highContrastMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
              Developer Testimonials
            </h2>
            <p className={`text-xl ${highContrastMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Hear from developers who have transformed their coding experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`p-6 rounded-2xl shadow-lg ${
                  highContrastMode ? 'bg-gray-800 border border-gray-700' : 'bg-gradient-to-br from-blue-50 to-purple-50'
                }`}
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className={`mb-4 italic ${highContrastMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  "{testimonial.quote}"
                </p>
                <div>
                  <div className={`font-semibold ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                    {testimonial.name}
                  </div>
                  <div className={`text-sm ${highContrastMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {testimonial.role}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const EditorView = () => (
    <div className={`min-h-screen ${highContrastMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex h-screen">
        {/* Left Panel - Code Editor */}
        <div className="flex-1 flex flex-col">
          <div className={`p-4 border-b ${highContrastMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className={`px-3 py-2 rounded-lg border ${
                    highContrastMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>
                
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
                        : highContrastMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-600'
                    }`}
                    aria-label={audioEnabled ? 'Disable audio' : 'Enable audio'}
                  >
                    {audioEnabled ? <Volume2 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  
                  <button
                    onClick={() => setBrailleEnabled(!brailleEnabled)}
                    className={`p-2 rounded-lg transition-colors ${
                      brailleEnabled 
                        ? 'bg-purple-500 text-white' 
                        : highContrastMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-600'
                    }`}
                    aria-label={brailleEnabled ? 'Disable Braille' : 'Enable Braille'}
                  >
                    <Braille className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`text-sm ${highContrastMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Accuracy: {accuracyRate}%
                </span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <CodeEditor
              language={selectedLanguage}
              value={codeExamples[selectedLanguage as keyof typeof codeExamples] || codeExamples.javascript}
              onChange={setCurrentCode}
              audioEnabled={audioEnabled}
              brailleEnabled={brailleEnabled}
              highContrast={highContrastMode}
            />
          </div>
        </div>

        {/* Right Panel - Accessibility Features */}
        <div className={`w-96 border-l ${highContrastMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} flex flex-col`}>
          {/* Audio Visualizer */}
          {audioEnabled && (
            <div className="p-4 border-b border-gray-200">
              <h3 className={`text-lg font-semibold mb-3 ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                Audio Feedback
              </h3>
              <AudioVisualizer
                isPlaying={isPlaying}
                volume={audioVolume}
                language={selectedLanguage}
                highContrast={highContrastMode}
              />
            </div>
          )}

          {/* Braille Output */}
          {brailleEnabled && (
            <div className="p-4 border-b border-gray-200">
              <h3 className={`text-lg font-semibold mb-3 ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                Braille Output
              </h3>
              <BrailleOutput
                code={currentCode}
                language={selectedLanguage}
                highContrast={highContrastMode}
              />
            </div>
          )}

          {/* Navigation Helper */}
          <div className="flex-1 p-4">
            <h3 className={`text-lg font-semibold mb-3 ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
              Navigation
            </h3>
            <NavigationHelper
              code={currentCode}
              language={selectedLanguage}
              navigationMode={navigationMode}
              highContrast={highContrastMode}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`${highContrastMode ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
      <Toaster position="top-right" />
      
      {/* Navigation Bar */}
      <nav className={`sticky top-0 z-50 border-b ${
        highContrastMode 
          ? 'bg-gray-900 border-gray-700' 
          : 'bg-white/90 backdrop-blur-sm border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Accessibility className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold">AccessibilityDev</span>
              </div>
              
              <div className="hidden md:flex items-center gap-6">
                <button
                  onClick={() => setCurrentView('home')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    currentView === 'home' 
                      ? 'bg-blue-100 text-blue-700' 
                      : highContrastMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  Home
                </button>
                
                <button
                  onClick={() => setCurrentView('editor')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    currentView === 'editor' 
                      ? 'bg-blue-100 text-blue-700' 
                      : highContrastMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Code className="w-4 h-4" />
                  Editor
                </button>
                
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    currentView === 'dashboard' 
                      ? 'bg-blue-100 text-blue-700' 
                      : highContrastMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  Dashboard
                </button>
                
                <button
                  onClick={() => setCurrentView('settings')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    currentView === 'settings' 
                      ? 'bg-blue-100 text-blue-700' 
                      : highContrastMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setHighContrastMode(!highContrastMode)}
                className={`p-2 rounded-lg transition-colors ${
                  highContrastMode 
                    ? 'bg-white text-black' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-label="Toggle high contrast mode"
              >
                {highContrastMode ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
              
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">{activeUsers} active</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {currentView === 'home' && <HomePage />}
        {currentView === 'editor' && <EditorView />}
        {currentView === 'dashboard' && (
          <AccessibilityDashboard
            activeUsers={activeUsers}
            accuracyRate={accuracyRate}
            timeReduction={timeReduction}
            bootcampCount={bootcampCount}
            highContrast={highContrastMode}
          />
        )}
        {currentView === 'settings' && (
          <SettingsPanel
            audioEnabled={audioEnabled}
            setAudioEnabled={setAudioEnabled}
            brailleEnabled={brailleEnabled}
            setBrailleEnabled={setBrailleEnabled}
            voiceEnabled={voiceEnabled}
            setVoiceEnabled={setVoiceEnabled}
            highContrastMode={highContrastMode}
            setHighContrastMode={setHighContrastMode}
            audioVolume={audioVolume}
            setAudioVolume={setAudioVolume}
            navigationMode={navigationMode}
            setNavigationMode={setNavigationMode}
          />
        )}
      </main>

      {/* Keyboard Shortcuts Help */}
      <div className={`fixed bottom-4 right-4 p-3 rounded-lg shadow-lg ${
        highContrastMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <div className="text-xs space-y-1">
          <div>Ctrl+1: Home</div>
          <div>Ctrl+2: Editor</div>
          <div>Ctrl+3: Dashboard</div>
          <div>Ctrl+4: Settings</div>
          <div>Ctrl+Space: Play/Pause</div>
        </div>
      </div>
    </div>
  );
};

export default App;