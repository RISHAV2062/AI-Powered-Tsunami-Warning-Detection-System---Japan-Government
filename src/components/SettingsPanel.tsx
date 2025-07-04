import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Volume2, VolumeX, Brain as Braille, Keyboard, Mic, Eye, EyeOff, Save, RotateCcw, Download, Upload, Palette, Accessibility, Monitor, Smartphone, Headphones, Speaker, Gamepad2, Zap, Shield, Globe, Clock, Bell, Moon, Sun, Contrast, Type, MousePointer, TouchpadIcon, MessageCircle, BookOpen, HelpCircle, Info, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SettingsPanelProps {
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
  brailleEnabled: boolean;
  setBrailleEnabled: (enabled: boolean) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  highContrastMode: boolean;
  setHighContrastMode: (enabled: boolean) => void;
  audioVolume: number;
  setAudioVolume: (volume: number) => void;
  navigationMode: 'keyboard' | 'voice' | 'gesture';
  setNavigationMode: (mode: 'keyboard' | 'voice' | 'gesture') => void;
}

interface AccessibilityProfile {
  id: string;
  name: string;
  description: string;
  settings: {
    audioEnabled: boolean;
    brailleEnabled: boolean;
    voiceEnabled: boolean;
    highContrast: boolean;
    audioVolume: number;
    navigationMode: 'keyboard' | 'voice' | 'gesture';
    fontSize: number;
    lineHeight: number;
    animationsEnabled: boolean;
    reduceMotion: boolean;
    screenReaderOptimized: boolean;
    colorBlindFriendly: boolean;
    dyslexiaFriendly: boolean;
    focusIndicator: boolean;
    skipLinks: boolean;
    keyboardTraps: boolean;
    autoSave: boolean;
    sessionTimeout: number;
  };
}

interface DeviceProfile {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet' | 'braille-display';
  capabilities: string[];
  recommendedSettings: Partial<AccessibilityProfile['settings']>;
}

interface KeyboardShortcut {
  id: string;
  action: string;
  keys: string;
  description: string;
  category: 'navigation' | 'audio' | 'editing' | 'accessibility';
  customizable: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  audioEnabled,
  setAudioEnabled,
  brailleEnabled,
  setBrailleEnabled,
  voiceEnabled,
  setVoiceEnabled,
  highContrastMode,
  setHighContrastMode,
  audioVolume,
  setAudioVolume,
  navigationMode,
  setNavigationMode
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'audio' | 'visual' | 'input' | 'advanced' | 'profiles' | 'help'>('general');
  const [fontSize, setFontSize] = useState(14);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [screenReaderOptimized, setScreenReaderOptimized] = useState(true);
  const [colorBlindFriendly, setColorBlindFriendly] = useState(false);
  const [dyslexiaFriendly, setDyslexiaFriendly] = useState(false);
  const [focusIndicator, setFocusIndicator] = useState(true);
  const [skipLinks, setSkipLinks] = useState(true);
  const [keyboardTraps, setKeyboardTraps] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [customShortcuts, setCustomShortcuts] = useState<{ [key: string]: string }>({});
  const [selectedProfile, setSelectedProfile] = useState<string>('default');
  const [customProfiles, setCustomProfiles] = useState<AccessibilityProfile[]>([]);
  const [deviceType, setDeviceType] = useState<'desktop' | 'mobile' | 'tablet' | 'braille-display'>('desktop');
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [vibrationFeedback, setVibrationFeedback] = useState(false);
  const [language, setLanguage] = useState('en');
  const [timeFormat, setTimeFormat] = useState('12h');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [theme, setTheme] = useState<'auto' | 'light' | 'dark' | 'high-contrast'>('auto');
  const [colorScheme, setColorScheme] = useState('blue');
  const [spatialAudio, setSpatialAudio] = useState(false);
  const [audioDescription, setAudioDescription] = useState(true);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [speechVolume, setSpeechVolume] = useState(1.0);
  const [preferredVoice, setPreferredVoice] = useState('');
  const [brailleGrade, setBrailleGrade] = useState<'grade1' | 'grade2'>('grade2');
  const [brailleCellsPerLine, setBrailleCellsPerLine] = useState(40);
  const [tactileFeedback, setTactileFeedback] = useState(false);
  const [mouseSensitivity, setMouseSensitivity] = useState(1.0);
  const [keyRepeatDelay, setKeyRepeatDelay] = useState(500);
  const [keyRepeatRate, setKeyRepeatRate] = useState(30);
  const [stickyKeys, setStickyKeys] = useState(false);
  const [filterKeys, setFilterKeys] = useState(false);
  const [mouseKeys, setMouseKeys] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Predefined accessibility profiles
  const accessibilityProfiles: AccessibilityProfile[] = [
    {
      id: 'default',
      name: 'Default',
      description: 'Standard accessibility settings for most users',
      settings: {
        audioEnabled: true,
        brailleEnabled: false,
        voiceEnabled: false,
        highContrast: false,
        audioVolume: 0.7,
        navigationMode: 'keyboard',
        fontSize: 14,
        lineHeight: 1.5,
        animationsEnabled: true,
        reduceMotion: false,
        screenReaderOptimized: true,
        colorBlindFriendly: false,
        dyslexiaFriendly: false,
        focusIndicator: true,
        skipLinks: true,
        keyboardTraps: false,
        autoSave: true,
        sessionTimeout: 30
      }
    },
    {
      id: 'blind-user',
      name: 'Blind User',
      description: 'Optimized for users who are blind with screen reader support',
      settings: {
        audioEnabled: true,
        brailleEnabled: true,
        voiceEnabled: true,
        highContrast: false,
        audioVolume: 0.9,
        navigationMode: 'keyboard',
        fontSize: 16,
        lineHeight: 1.6,
        animationsEnabled: false,
        reduceMotion: true,
        screenReaderOptimized: true,
        colorBlindFriendly: false,
        dyslexiaFriendly: false,
        focusIndicator: true,
        skipLinks: true,
        keyboardTraps: false,
        autoSave: true,
        sessionTimeout: 60
      }
    },
    {
      id: 'low-vision',
      name: 'Low Vision',
      description: 'Enhanced visual settings for users with low vision',
      settings: {
        audioEnabled: true,
        brailleEnabled: false,
        voiceEnabled: false,
        highContrast: true,
        audioVolume: 0.8,
        navigationMode: 'keyboard',
        fontSize: 20,
        lineHeight: 1.8,
        animationsEnabled: false,
        reduceMotion: true,
        screenReaderOptimized: true,
        colorBlindFriendly: true,
        dyslexiaFriendly: false,
        focusIndicator: true,
        skipLinks: true,
        keyboardTraps: false,
        autoSave: true,
        sessionTimeout: 45
      }
    },
    {
      id: 'motor-impaired',
      name: 'Motor Impaired',
      description: 'Settings for users with motor impairments',
      settings: {
        audioEnabled: true,
        brailleEnabled: false,
        voiceEnabled: true,
        highContrast: false,
        audioVolume: 0.7,
        navigationMode: 'voice',
        fontSize: 16,
        lineHeight: 1.6,
        animationsEnabled: false,
        reduceMotion: true,
        screenReaderOptimized: false,
        colorBlindFriendly: false,
        dyslexiaFriendly: false,
        focusIndicator: true,
        skipLinks: true,
        keyboardTraps: false,
        autoSave: true,
        sessionTimeout: 60
      }
    },
    {
      id: 'cognitive-support',
      name: 'Cognitive Support',
      description: 'Simplified interface for users with cognitive disabilities',
      settings: {
        audioEnabled: true,
        brailleEnabled: false,
        voiceEnabled: false,
        highContrast: false,
        audioVolume: 0.6,
        navigationMode: 'keyboard',
        fontSize: 18,
        lineHeight: 2.0,
        animationsEnabled: false,
        reduceMotion: true,
        screenReaderOptimized: false,
        colorBlindFriendly: false,
        dyslexiaFriendly: true,
        focusIndicator: true,
        skipLinks: true,
        keyboardTraps: false,
        autoSave: true,
        sessionTimeout: 15
      }
    }
  ];

  // Device profiles with recommendations
  const deviceProfiles: DeviceProfile[] = [
    {
      id: 'desktop',
      name: 'Desktop Computer',
      type: 'desktop',
      capabilities: ['keyboard', 'mouse', 'speakers', 'microphone', 'large-screen'],
      recommendedSettings: {
        fontSize: 14,
        navigationMode: 'keyboard',
        audioVolume: 0.7
      }
    },
    {
      id: 'laptop',
      name: 'Laptop',
      type: 'desktop',
      capabilities: ['keyboard', 'trackpad', 'speakers', 'microphone', 'medium-screen'],
      recommendedSettings: {
        fontSize: 14,
        navigationMode: 'keyboard',
        audioVolume: 0.6
      }
    },
    {
      id: 'tablet',
      name: 'Tablet',
      type: 'tablet',
      capabilities: ['touch', 'speakers', 'microphone', 'medium-screen', 'orientation'],
      recommendedSettings: {
        fontSize: 16,
        navigationMode: 'gesture',
        audioVolume: 0.8
      }
    },
    {
      id: 'smartphone',
      name: 'Smartphone',
      type: 'mobile',
      capabilities: ['touch', 'speakers', 'microphone', 'small-screen', 'orientation', 'vibration'],
      recommendedSettings: {
        fontSize: 18,
        navigationMode: 'gesture',
        audioVolume: 0.9
      }
    },
    {
      id: 'braille-display',
      name: 'Braille Display',
      type: 'braille-display',
      capabilities: ['braille-output', 'braille-input', 'tactile-feedback'],
      recommendedSettings: {
        brailleEnabled: true,
        tactileFeedback: true,
        screenReaderOptimized: true
      }
    }
  ];

  // Keyboard shortcuts configuration
  const keyboardShortcuts: KeyboardShortcut[] = [
    {
      id: 'toggle-audio',
      action: 'Toggle Audio Feedback',
      keys: 'Ctrl+Alt+A',
      description: 'Enable or disable audio feedback',
      category: 'audio',
      customizable: true
    },
    {
      id: 'toggle-braille',
      action: 'Toggle Braille Output',
      keys: 'Ctrl+Alt+B',
      description: 'Enable or disable Braille output',
      category: 'accessibility',
      customizable: true
    },
    {
      id: 'toggle-voice',
      action: 'Toggle Voice Navigation',
      keys: 'Ctrl+Alt+V',
      description: 'Enable or disable voice navigation',
      category: 'accessibility',
      customizable: true
    },
    {
      id: 'increase-volume',
      action: 'Increase Audio Volume',
      keys: 'Ctrl+Shift+Up',
      description: 'Increase the audio feedback volume',
      category: 'audio',
      customizable: true
    },
    {
      id: 'decrease-volume',
      action: 'Decrease Audio Volume',
      keys: 'Ctrl+Shift+Down',
      description: 'Decrease the audio feedback volume',
      category: 'audio',
      customizable: true
    },
    {
      id: 'read-line',
      action: 'Read Current Line',
      keys: 'Ctrl+R',
      description: 'Read the current line using text-to-speech',
      category: 'accessibility',
      customizable: true
    },
    {
      id: 'jump-function',
      action: 'Jump to Next Function',
      keys: 'Ctrl+F12',
      description: 'Navigate to the next function definition',
      category: 'navigation',
      customizable: true
    },
    {
      id: 'jump-error',
      action: 'Jump to Next Error',
      keys: 'F8',
      description: 'Navigate to the next syntax error',
      category: 'navigation',
      customizable: false
    },
    {
      id: 'toggle-settings',
      action: 'Toggle Settings Panel',
      keys: 'Ctrl+,',
      description: 'Open or close the settings panel',
      category: 'navigation',
      customizable: true
    },
    {
      id: 'save-code',
      action: 'Save Code',
      keys: 'Ctrl+S',
      description: 'Save the current code to local storage',
      category: 'editing',
      customizable: false
    }
  ];

  // Load settings from localStorage on component mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('accessibility-settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setFontSize(settings.fontSize || 14);
        setLineHeight(settings.lineHeight || 1.5);
        setAnimationsEnabled(settings.animationsEnabled ?? true);
        setReduceMotion(settings.reduceMotion ?? false);
        setScreenReaderOptimized(settings.screenReaderOptimized ?? true);
        setColorBlindFriendly(settings.colorBlindFriendly ?? false);
        setDyslexiaFriendly(settings.dyslexiaFriendly ?? false);
        setFocusIndicator(settings.focusIndicator ?? true);
        setSkipLinks(settings.skipLinks ?? true);
        setKeyboardTraps(settings.keyboardTraps ?? false);
        setAutoSave(settings.autoSave ?? true);
        setSessionTimeout(settings.sessionTimeout || 30);
        setSelectedProfile(settings.selectedProfile || 'default');
        setDeviceType(settings.deviceType || 'desktop');
        setTheme(settings.theme || 'auto');
        setColorScheme(settings.colorScheme || 'blue');
        setSpatialAudio(settings.spatialAudio ?? false);
        setAudioDescription(settings.audioDescription ?? true);
        setSpeechRate(settings.speechRate || 1.0);
        setSpeechPitch(settings.speechPitch || 1.0);
        setSpeechVolume(settings.speechVolume || 1.0);
        setBrailleGrade(settings.brailleGrade || 'grade2');
        setBrailleCellsPerLine(settings.brailleCellsPerLine || 40);
        setTactileFeedback(settings.tactileFeedback ?? false);
        setCustomShortcuts(settings.customShortcuts || {});
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    try {
      const settings = {
        audioEnabled,
        brailleEnabled,
        voiceEnabled,
        highContrastMode,
        audioVolume,
        navigationMode,
        fontSize,
        lineHeight,
        animationsEnabled,
        reduceMotion,
        screenReaderOptimized,
        colorBlindFriendly,
        dyslexiaFriendly,
        focusIndicator,
        skipLinks,
        keyboardTraps,
        autoSave,
        sessionTimeout,
        selectedProfile,
        deviceType,
        theme,
        colorScheme,
        spatialAudio,
        audioDescription,
        speechRate,
        speechPitch,
        speechVolume,
        brailleGrade,
        brailleCellsPerLine,
        tactileFeedback,
        customShortcuts
      };
      
      localStorage.setItem('accessibility-settings', JSON.stringify(settings));
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    }
  };

  // Reset settings to defaults
  const resetSettings = () => {
    setAudioEnabled(true);
    setBrailleEnabled(false);
    setVoiceEnabled(false);
    setHighContrastMode(false);
    setAudioVolume(0.7);
    setNavigationMode('keyboard');
    setFontSize(14);
    setLineHeight(1.5);
    setAnimationsEnabled(true);
    setReduceMotion(false);
    setScreenReaderOptimized(true);
    setColorBlindFriendly(false);
    setDyslexiaFriendly(false);
    setFocusIndicator(true);
    setSkipLinks(true);
    setKeyboardTraps(false);
    setAutoSave(true);
    setSessionTimeout(30);
    setSelectedProfile('default');
    setDeviceType('desktop');
    setTheme('auto');
    setColorScheme('blue');
    setSpatialAudio(false);
    setAudioDescription(true);
    setSpeechRate(1.0);
    setSpeechPitch(1.0);
    setSpeechVolume(1.0);
    setBrailleGrade('grade2');
    setBrailleCellsPerLine(40);
    setTactileFeedback(false);
    setCustomShortcuts({});
    
    localStorage.removeItem('accessibility-settings');
    toast.success('Settings reset to defaults');
  };

  // Apply accessibility profile
  const applyProfile = (profileId: string) => {
    const profile = accessibilityProfiles.find(p => p.id === profileId);
    if (!profile) return;

    const settings = profile.settings;
    setAudioEnabled(settings.audioEnabled);
    setBrailleEnabled(settings.brailleEnabled);
    setVoiceEnabled(settings.voiceEnabled);
    setHighContrastMode(settings.highContrast);
    setAudioVolume(settings.audioVolume);
    setNavigationMode(settings.navigationMode);
    setFontSize(settings.fontSize);
    setLineHeight(settings.lineHeight);
    setAnimationsEnabled(settings.animationsEnabled);
    setReduceMotion(settings.reduceMotion);
    setScreenReaderOptimized(settings.screenReaderOptimized);
    setColorBlindFriendly(settings.colorBlindFriendly);
    setDyslexiaFriendly(settings.dyslexiaFriendly);
    setFocusIndicator(settings.focusIndicator);
    setSkipLinks(settings.skipLinks);
    setKeyboardTraps(settings.keyboardTraps);
    setAutoSave(settings.autoSave);
    setSessionTimeout(settings.sessionTimeout);
    setSelectedProfile(profileId);

    toast.success(`Applied ${profile.name} profile`);
  };

  // Export settings
  const exportSettings = () => {
    const settings = {
      audioEnabled,
      brailleEnabled,
      voiceEnabled,
      highContrastMode,
      audioVolume,
      navigationMode,
      fontSize,
      lineHeight,
      animationsEnabled,
      reduceMotion,
      screenReaderOptimized,
      colorBlindFriendly,
      dyslexiaFriendly,
      focusIndicator,
      skipLinks,
      keyboardTraps,
      autoSave,
      sessionTimeout,
      selectedProfile,
      deviceType,
      theme,
      colorScheme,
      spatialAudio,
      audioDescription,
      speechRate,
      speechPitch,
      speechVolume,
      brailleGrade,
      brailleCellsPerLine,
      tactileFeedback,
      customShortcuts,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accessibility-settings-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Settings exported successfully');
  };

  // Import settings
  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string);
        
        // Apply imported settings with validation
        if (typeof settings.audioEnabled === 'boolean') setAudioEnabled(settings.audioEnabled);
        if (typeof settings.brailleEnabled === 'boolean') setBrailleEnabled(settings.brailleEnabled);
        if (typeof settings.voiceEnabled === 'boolean') setVoiceEnabled(settings.voiceEnabled);
        if (typeof settings.highContrastMode === 'boolean') setHighContrastMode(settings.highContrastMode);
        if (typeof settings.audioVolume === 'number') setAudioVolume(settings.audioVolume);
        if (['keyboard', 'voice', 'gesture'].includes(settings.navigationMode)) setNavigationMode(settings.navigationMode);
        if (typeof settings.fontSize === 'number') setFontSize(settings.fontSize);
        if (typeof settings.lineHeight === 'number') setLineHeight(settings.lineHeight);
        
        toast.success('Settings imported successfully');
      } catch (error) {
        console.error('Failed to import settings:', error);
        toast.error('Failed to import settings - invalid file format');
      }
    };
    reader.readAsText(file);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'audio', label: 'Audio', icon: Volume2 },
    { id: 'visual', label: 'Visual', icon: Eye },
    { id: 'input', label: 'Input', icon: Keyboard },
    { id: 'profiles', label: 'Profiles', icon: Accessibility },
    { id: 'advanced', label: 'Advanced', icon: Zap },
    { id: 'help', label: 'Help', icon: HelpCircle }
  ];

  return (
    <div className={`min-h-screen ${highContrastMode ? 'bg-black' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
            Accessibility Settings
          </h1>
          <p className={`text-lg ${highContrastMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Configure your accessibility preferences and optimize your development experience
          </p>
        </div>

        {/* Tab Navigation */}
        <div className={`border-b ${highContrastMode ? 'border-white' : 'border-gray-200'} mb-8`}>
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : highContrastMode
                    ? 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'general' && (
              <div className="space-y-8">
                {/* Core Accessibility Features */}
                <div className={`${highContrastMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
                  <h2 className={`text-xl font-semibold mb-4 ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                    Core Accessibility Features
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Volume2 className={`w-5 h-5 ${audioEnabled ? 'text-blue-500' : 'text-gray-400'}`} />
                          <div>
                            <label className={`text-sm font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                              Audio Feedback
                            </label>
                            <p className={`text-xs ${highContrastMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Real-time audio conversion of code syntax
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setAudioEnabled(!audioEnabled)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            audioEnabled ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              audioEnabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Braille className={`w-5 h-5 ${brailleEnabled ? 'text-purple-500' : 'text-gray-400'}`} />
                          <div>
                            <label className={`text-sm font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                              Braille Output
                            </label>
                            <p className={`text-xs ${highContrastMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Convert code to Braille format
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setBrailleEnabled(!brailleEnabled)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                            brailleEnabled ? 'bg-purple-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              brailleEnabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Mic className={`w-5 h-5 ${voiceEnabled ? 'text-green-500' : 'text-gray-400'}`} />
                          <div>
                            <label className={`text-sm font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                              Voice Navigation
                            </label>
                            <p className={`text-xs ${highContrastMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Control the editor with voice commands
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setVoiceEnabled(!voiceEnabled)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                            voiceEnabled ? 'bg-green-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              voiceEnabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Contrast className={`w-5 h-5 ${highContrastMode ? 'text-white' : 'text-gray-400'}`} />
                          <div>
                            <label className={`text-sm font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                              High Contrast Mode
                            </label>
                            <p className={`text-xs ${highContrastMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Enhanced contrast for better visibility
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setHighContrastMode(!highContrastMode)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${
                            highContrastMode ? 'bg-gray-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              highContrastMode ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className={`text-sm font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'} block mb-2`}>
                          Audio Volume: {Math.round(audioVolume * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={audioVolume}
                          onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                          className="w-full"
                          disabled={!audioEnabled}
                        />
                      </div>

                      <div>
                        <label className={`text-sm font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'} block mb-2`}>
                          Navigation Mode
                        </label>
                        <select
                          value={navigationMode}
                          onChange={(e) => setNavigationMode(e.target.value as 'keyboard' | 'voice' | 'gesture')}
                          className={`w-full p-2 border rounded-lg ${
                            highContrastMode
                              ? 'bg-black text-white border-white'
                              : 'bg-white text-gray-900 border-gray-300'
                          }`}
                        >
                          <option value="keyboard">Keyboard Navigation</option>
                          <option value="voice">Voice Commands</option>
                          <option value="gesture">Gesture Control</option>
                        </select>
                      </div>

                      <div>
                        <label className={`text-sm font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'} block mb-2`}>
                          Font Size: {fontSize}px
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="24"
                          value={fontSize}
                          onChange={(e) => setFontSize(parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className={`text-sm font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'} block mb-2`}>
                          Line Height: {lineHeight.toFixed(1)}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="3"
                          step="0.1"
                          value={lineHeight}
                          onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Device Profile */}
                <div className={`${highContrastMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
                  <h2 className={`text-xl font-semibold mb-4 ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                    Device Profile
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {deviceProfiles.map((device) => (
                      <button
                        key={device.id}
                        onClick={() => setDeviceType(device.type)}
                        className={`p-4 rounded-lg border-2 text-left transition-colors ${
                          deviceType === device.type
                            ? 'border-blue-500 bg-blue-50'
                            : highContrastMode
                            ? 'border-gray-600 bg-gray-800 hover:border-gray-500'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {device.type === 'desktop' && <Monitor className="w-5 h-5" />}
                          {device.type === 'mobile' && <Smartphone className="w-5 h-5" />}
                          {device.type === 'tablet' && <Monitor className="w-5 h-5" />}
                          {device.type === 'braille-display' && <Braille className="w-5 h-5" />}
                          <span className={`font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                            {device.name}
                          </span>
                        </div>
                        <div className="text-xs space-y-1">
                          {device.capabilities.slice(0, 3).map((capability) => (
                            <div key={capability} className={`${highContrastMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              • {capability.replace('-', ' ')}
                            </div>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="space-y-8">
                {/* Audio Settings */}
                <div className={`${highContrastMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
                  <h2 className={`text-xl font-semibold mb-6 ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                    Audio Configuration
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className={`text-sm font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'} block mb-2`}>
                          Master Volume: {Math.round(audioVolume * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={audioVolume}
                          onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className={`text-sm font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'} block mb-2`}>
                          Speech Rate: {speechRate.toFixed(1)}x
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="2.0"
                          step="0.1"
                          value={speechRate}
                          onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className={`text-sm font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'} block mb-2`}>
                          Speech Pitch: {speechPitch.toFixed(1)}
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="2.0"
                          step="0.1"
                          value={speechPitch}
                          onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className={`text-sm font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'} block mb-2`}>
                          Speech Volume: {Math.round(speechVolume * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={speechVolume}
                          onChange={(e) => setSpeechVolume(parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className={`text-sm font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                            Spatial Audio
                          </label>
                          <p className={`text-xs ${highContrastMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            3D positioning for code structure
                          </p>
                        </div>
                        <button
                          onClick={() => setSpatialAudio(!spatialAudio)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            spatialAudio ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              spatialAudio ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className={`text-sm font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                            Audio Description
                          </label>
                          <p className={`text-xs ${highContrastMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Detailed audio descriptions of UI elements
                          </p>
                        </div>
                        <button
                          onClick={() => setAudioDescription(!audioDescription)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            audioDescription ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              audioDescription ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className={`text-sm font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                            Sound Effects
                          </label>
                          <p className={`text-xs ${highContrastMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            UI interaction sound effects
                          </p>
                        </div>
                        <button
                          onClick={() => setSoundEffects(!soundEffects)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            soundEffects ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              soundEffects ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className={`text-sm font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                            Notifications
                          </label>
                          <p className={`text-xs ${highContrastMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Audio notifications for important events
                          </p>
                        </div>
                        <button
                          onClick={() => setNotifications(!notifications)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            notifications ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              notifications ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'visual' && (
              <div className="space-y-8">
                {/* Visual Settings */}
                <div className={`${highContrastMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
                  <h2 className={`text-xl font-semibold mb-6 ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                    Visual Accessibility
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className={`text-sm font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'} block mb-2`}>
                          Theme
                        </label>
                        <select
                          value={theme}
                          onChange={(e) => setTheme(e.target.value as any)}
                          className={`w-full p-2 border rounded-lg ${
                            highContrastMode
                              ? 'bg-black text-white border-white'
                              : 'bg-white text-gray-900 border-gray-300'
                          }`}
                        >
                          <option value="auto">Auto (System)</option>
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="high-contrast">High Contrast</option>
                        </select>
                      </div>

                      <div>
                        <label className={`text-sm font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'} block mb-2`}>
                          Color Scheme
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {['blue', 'green', 'purple', 'orange'].map((color) => (
                            <button
                              key={color}
                              onClick={() => setColorScheme(color)}
                              className={`p-3 rounded-lg border-2 ${
                                colorScheme === color
                                  ? `border-${color}-500 bg-${color}-50`
                                  : 'border-gray-200 bg-gray-50'
                              }`}
                            >
                              <div className={`w-6 h-6 rounded-full bg-${color}-500 mx-auto`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className={`text-sm font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'} block mb-2`}>
                          Font Size: {fontSize}px
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="32"
                          value={fontSize}
                          onChange={(e) => setFontSize(parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className={`text-sm font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'} block mb-2`}>
                          Line Height: {lineHeight.toFixed(1)}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="3"
                          step="0.1"
                          value={lineHeight}
                          onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className={`text-sm font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                            Color Blind Friendly
                          </label>
                          <p className={`text-xs ${highContrastMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Optimize colors for color blindness
                          </p>
                        </div>
                        <button
                          onClick={() => setColorBlindFriendly(!colorBlindFriendly)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            colorBlindFriendly ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              colorBlindFriendly ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className={`text-sm font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                            Dyslexia Friendly
                          </label>
                          <p className={`text-xs ${highContrastMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Font and spacing optimized for dyslexia
                          </p>
                        </div>
                        <button
                          onClick={() => setDyslexiaFriendly(!dyslexiaFriendly)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            dyslexiaFriendly ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              dyslexiaFriendly ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className={`text-sm font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                            Reduce Motion
                          </label>
                          <p className={`text-xs ${highContrastMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Minimize animations and transitions
                          </p>
                        </div>
                        <button
                          onClick={() => setReduceMotion(!reduceMotion)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            reduceMotion ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              reduceMotion ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className={`text-sm font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                            Focus Indicator
                          </label>
                          <p className={`text-xs ${highContrastMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Enhanced focus outline for keyboard navigation
                          </p>
                        </div>
                        <button
                          onClick={() => setFocusIndicator(!focusIndicator)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            focusIndicator ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              focusIndicator ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'input' && (
              <div className="space-y-8">
                {/* Input Settings */}
                <div className={`${highContrastMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
                  <h2 className={`text-xl font-semibold mb-6 ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                    Input & Navigation
                  </h2>
                  
                  <div className="space-y-8">
                    {/* Keyboard Settings */}
                    <div>
                      <h3 className={`text-lg font-medium mb-4 ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                        Keyboard Settings
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className={`text-sm font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'} block mb-2`}>
                              Key Repeat Delay: {keyRepeatDelay}ms
                            </label>
                            <input
                              type="range"
                              min="200"
                              max="1000"
                              step="50"
                              value={keyRepeatDelay}
                              onChange={(e) => setKeyRepeatDelay(parseInt(e.target.value))}
                              className="w-full"
                            />
                          </div>

                          <div>
                            <label className={`text-sm font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'} block mb-2`}>
                              Key Repeat Rate: {keyRepeatRate}/sec
                            </label>
                            <input
                              type="range"
                              min="5"
                              max="50"
                              value={keyRepeatRate}
                              onChange={(e) => setKeyRepeatRate(parseInt(e.target.value))}
                              className="w-full"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className={`text-sm font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                                Sticky Keys
                              </label>
                              <p className={`text-xs ${highContrastMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Press modifier keys one at a time
                              </p>
                            </div>
                            <button
                              onClick={() => setStickyKeys(!stickyKeys)}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                stickyKeys ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  stickyKeys ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <label className={`text-sm font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                                Filter Keys
                              </label>
                              <p className={`text-xs ${highContrastMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Ignore brief or repeated keystrokes
                              </p>
                            </div>
                            <button
                              onClick={() => setFilterKeys(!filterKeys)}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                filterKeys ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  filterKeys ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <label className={`text-sm font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                                Mouse Keys
                              </label>
                              <p className={`text-xs ${highContrastMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Control mouse pointer with numeric keypad
                              </p>
                            </div>
                            <button
                              onClick={() => setMouseKeys(!mouseKeys)}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                mouseKeys ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  mouseKeys ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Keyboard Shortcuts */}
                    <div>
                      <h3 className={`text-lg font-medium mb-4 ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                        Keyboard Shortcuts
                      </h3>
                      
                      <div className="space-y-2">
                        {keyboardShortcuts.map((shortcut) => (
                          <div
                            key={shortcut.id}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              highContrastMode ? 'bg-gray-800' : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex-1">
                              <div className={`font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                                {shortcut.action}
                              </div>
                              <div className={`text-xs ${highContrastMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {shortcut.description}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <kbd className={`px-2 py-1 text-xs font-mono rounded ${
                                highContrastMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'
                              }`}>
                                {customShortcuts[shortcut.id] || shortcut.keys}
                              </kbd>
                              {shortcut.customizable && (
                                <button
                                  onClick={() => {
                                    // Implementation for customizing shortcuts
                                    const newKey = prompt('Enter new shortcut:', shortcut.keys);
                                    if (newKey) {
                                      setCustomShortcuts(prev => ({
                                        ...prev,
                                        [shortcut.id]: newKey
                                      }));
                                    }
                                  }}
                                  className={`p-1 rounded ${
                                    highContrastMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                                  }`}
                                >
                                  <Settings className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profiles' && (
              <div className="space-y-8">
                {/* Accessibility Profiles */}
                <div className={`${highContrastMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
                  <h2 className={`text-xl font-semibold mb-6 ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                    Accessibility Profiles
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {accessibilityProfiles.map((profile) => (
                      <div
                        key={profile.id}
                        className={`p-6 rounded-lg border-2 transition-colors ${
                          selectedProfile === profile.id
                            ? 'border-blue-500 bg-blue-50'
                            : highContrastMode
                            ? 'border-gray-600 bg-gray-800'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className={`text-lg font-semibold ${
                            selectedProfile === profile.id ? 'text-blue-900' : highContrastMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {profile.name}
                          </h3>
                          {selectedProfile === profile.id && (
                            <CheckCircle className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                        
                        <p className={`text-sm mb-4 ${
                          selectedProfile === profile.id ? 'text-blue-700' : highContrastMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {profile.description}
                        </p>
                        
                        <div className="space-y-2 mb-6">
                          <div className="text-xs space-y-1">
                            {profile.settings.audioEnabled && (
                              <div className="flex items-center gap-2">
                                <Volume2 className="w-3 h-3 text-blue-500" />
                                <span>Audio Feedback</span>
                              </div>
                            )}
                            {profile.settings.brailleEnabled && (
                              <div className="flex items-center gap-2">
                                <Braille className="w-3 h-3 text-purple-500" />
                                <span>Braille Output</span>
                              </div>
                            )}
                            {profile.settings.voiceEnabled && (
                              <div className="flex items-center gap-2">
                                <Mic className="w-3 h-3 text-green-500" />
                                <span>Voice Navigation</span>
                              </div>
                            )}
                            {profile.settings.highContrast && (
                              <div className="flex items-center gap-2">
                                <Contrast className="w-3 h-3 text-gray-500" />
                                <span>High Contrast</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => applyProfile(profile.id)}
                          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                            selectedProfile === profile.id
                              ? 'bg-blue-500 text-white'
                              : highContrastMode
                              ? 'bg-gray-700 text-white hover:bg-gray-600'
                              : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                          }`}
                        >
                          {selectedProfile === profile.id ? 'Active' : 'Apply Profile'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="space-y-8">
                {/* Advanced Settings */}
                <div className={`${highContrastMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
                  <h2 className={`text-xl font-semibold mb-6 ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                    Advanced Configuration
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className={`text-sm font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                          Screen Reader Optimized
                        </label>
                        <p className={`text-xs ${highContrastMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Enhance compatibility with screen readers
                        </p>
                      </div>
                      <button
                        onClick={() => setScreenReaderOptimized(!screenReaderOptimized)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          screenReaderOptimized ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            screenReaderOptimized ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className={`text-sm font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                          Auto Save
                        </label>
                        <p className={`text-xs ${highContrastMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Automatically save settings and code
                        </p>
                      </div>
                      <button
                        onClick={() => setAutoSave(!autoSave)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          autoSave ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            autoSave ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div>
                      <label className={`text-sm font-medium ${highContrastMode ? 'text-white' : 'text-gray-900'} block mb-2`}>
                        Session Timeout: {sessionTimeout} minutes
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="120"
                        value={sessionTimeout}
                        onChange={(e) => setSessionTimeout(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div className="pt-6 border-t border-gray-200">
                      <h3 className={`text-lg font-medium mb-4 ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                        Data Management
                      </h3>
                      
                      <div className="flex flex-wrap gap-4">
                        <button
                          onClick={saveSettings}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          Save Settings
                        </button>
                        
                        <button
                          onClick={exportSettings}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Export Settings
                        </button>
                        
                        <label className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors cursor-pointer">
                          <Upload className="w-4 h-4" />
                          Import Settings
                          <input
                            type="file"
                            accept=".json"
                            onChange={importSettings}
                            className="hidden"
                          />
                        </label>
                        
                        <button
                          onClick={resetSettings}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Reset to Defaults
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'help' && (
              <div className="space-y-8">
                {/* Help Content */}
                <div className={`${highContrastMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
                  <h2 className={`text-xl font-semibold mb-6 ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                    Help & Documentation
                  </h2>
                  
                  <div className="space-y-6">
                    <div className={`p-4 rounded-lg ${highContrastMode ? 'bg-blue-900' : 'bg-blue-50'}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <Info className="w-5 h-5 text-blue-500" />
                        <h3 className={`font-semibold ${highContrastMode ? 'text-blue-200' : 'text-blue-900'}`}>
                          Getting Started
                        </h3>
                      </div>
                      <p className={`text-sm ${highContrastMode ? 'text-blue-300' : 'text-blue-800'}`}>
                        This accessibility toolkit is designed to make coding accessible for visually impaired developers. 
                        Start by selecting an accessibility profile that matches your needs, then customize individual settings as required.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className={`p-4 rounded-lg ${highContrastMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <h4 className={`font-semibold mb-2 ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                          Audio Feedback
                        </h4>
                        <p className={`text-sm ${highContrastMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                          Real-time audio conversion of code syntax into distinct tones and patterns.
                        </p>
                        <ul className={`text-xs space-y-1 ${highContrastMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <li>• Functions generate harmonic chord progressions</li>
                          <li>• Variables trigger ascending tone sequences</li>
                          <li>• Loops produce rhythmic patterns</li>
                          <li>• Errors create distinctive alert sounds</li>
                        </ul>
                      </div>

                      <div className={`p-4 rounded-lg ${highContrastMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <h4 className={`font-semibold mb-2 ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                          Braille Output
                        </h4>
                        <p className={`text-sm ${highContrastMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                          Dynamic Braille conversion with Grade 2 support and programming-specific contractions.
                        </p>
                        <ul className={`text-xs space-y-1 ${highContrastMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <li>• Grade 1 and Grade 2 Braille support</li>
                          <li>• Programming keyword contractions</li>
                          <li>• Spatial formatting preservation</li>
                          <li>• Virtual Braille display simulation</li>
                        </ul>
                      </div>

                      <div className={`p-4 rounded-lg ${highContrastMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <h4 className={`font-semibold mb-2 ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                          Voice Navigation
                        </h4>
                        <p className={`text-sm ${highContrastMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                          Control the editor using voice commands for hands-free operation.
                        </p>
                        <ul className={`text-xs space-y-1 ${highContrastMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <li>• Navigate between functions and classes</li>
                          <li>• Read current line or selection</li>
                          <li>• Insert common code patterns</li>
                          <li>• Control playback and settings</li>
                        </ul>
                      </div>

                      <div className={`p-4 rounded-lg ${highContrastMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <h4 className={`font-semibold mb-2 ${highContrastMode ? 'text-white' : 'text-gray-900'}`}>
                          Keyboard Shortcuts
                        </h4>
                        <p className={`text-sm ${highContrastMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                          Efficient keyboard navigation optimized for screen readers.
                        </p>
                        <ul className={`text-xs space-y-1 ${highContrastMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <li>• Ctrl+Alt+A: Toggle audio feedback</li>
                          <li>• Ctrl+Alt+B: Toggle Braille output</li>
                          <li>• Ctrl+R: Read current line</li>
                          <li>• F12: Jump to next function</li>
                        </ul>
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg border ${highContrastMode ? 'bg-yellow-900 border-yellow-700' : 'bg-yellow-50 border-yellow-200'}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        <h3 className={`font-semibold ${highContrastMode ? 'text-yellow-200' : 'text-yellow-900'}`}>
                          Troubleshooting
                        </h3>
                      </div>
                      <div className={`text-sm space-y-2 ${highContrastMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                        <p><strong>Audio not working:</strong> Check browser permissions and audio volume settings.</p>
                        <p><strong>Braille not displaying:</strong> Ensure your Braille display is connected and configured properly.</p>
                        <p><strong>Voice commands not responding:</strong> Check microphone permissions and try speaking more clearly.</p>
                        <p><strong>Performance issues:</strong> Try reducing audio quality or disabling advanced features.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SettingsPanel;