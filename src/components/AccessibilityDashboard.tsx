import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Clock, Target, Award, Activity, Zap, Volume2, Brain as Braille, Eye, Keyboard, Mic, Globe, BookOpen, Code, CheckCircle, AlertTriangle, Info, Star, Heart, Trophy, Lightbulb, Shield, Accessibility, Monitor, Smartphone, Headphones, Settings, Download, Share, RefreshCw, Calendar, MapPin, Filter, Search, Plus, Minus, ArrowUp, ArrowDown, ArrowRight, ExternalLink, FileText, Database, Wifi, WifiOff, Battery, Signal, Cpu, HardDrive, MemoryStick } from 'lucide-react';

interface AccessibilityDashboardProps {
  activeUsers: number;
  accuracyRate: number;
  timeReduction: number;
  bootcampCount: number;
  highContrast: boolean;
}

interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  trend: number[];
  target?: number;
  unit?: string;
}

interface UsageData {
  date: string;
  audioFeedback: number;
  brailleOutput: number;
  voiceNavigation: number;
  keyboardShortcuts: number;
  errorDetection: number;
  codeCompletion: number;
}

interface UserFeedback {
  id: string;
  user: string;
  rating: number;
  comment: string;
  feature: string;
  date: string;
  verified: boolean;
}

interface AccessibilityFeature {
  id: string;
  name: string;
  description: string;
  usage: number;
  satisfaction: number;
  impact: 'high' | 'medium' | 'low';
  category: 'audio' | 'visual' | 'motor' | 'cognitive';
  status: 'active' | 'beta' | 'planned';
}

interface SystemHealth {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
  audioLatency: number;
  brailleLatency: number;
  errorRate: number;
  uptime: number;
}

const AccessibilityDashboard: React.FC<AccessibilityDashboardProps> = ({
  activeUsers,
  accuracyRate,
  timeReduction,
  bootcampCount,
  highContrast
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [selectedMetric, setSelectedMetric] = useState<string>('overview');
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [userFeedback, setUserFeedback] = useState<UserFeedback[]>([]);
  const [accessibilityFeatures, setAccessibilityFeatures] = useState<AccessibilityFeature[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    cpu: 45,
    memory: 62,
    storage: 78,
    network: 95,
    audioLatency: 12,
    brailleLatency: 8,
    errorRate: 0.2,
    uptime: 99.8
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');

  // Main metrics
  const metrics: MetricCard[] = [
    {
      id: 'active-users',
      title: 'Active Users',
      value: activeUsers,
      change: 12.5,
      changeType: 'increase',
      icon: Users,
      color: 'text-blue-500',
      description: 'Visually impaired developers actively using the toolkit',
      trend: [280, 295, 310, 325, 338],
      target: 500,
      unit: 'users'
    },
    {
      id: 'accuracy-rate',
      title: 'Code Accuracy',
      value: accuracyRate,
      change: 2.1,
      changeType: 'increase',
      icon: Target,
      color: 'text-green-500',
      description: 'Accuracy in code syntax recognition and conversion',
      trend: [96.2, 97.1, 97.8, 98.3, 98.8],
      target: 99.5,
      unit: '%'
    },
    {
      id: 'time-reduction',
      title: 'Navigation Efficiency',
      value: timeReduction,
      change: 5.3,
      changeType: 'increase',
      icon: Clock,
      color: 'text-purple-500',
      description: 'Reduction in code navigation time compared to traditional methods',
      trend: [35, 40, 43, 46, 48],
      target: 60,
      unit: '%'
    },
    {
      id: 'bootcamp-adoption',
      title: 'Bootcamp Integration',
      value: bootcampCount,
      change: 16.7,
      changeType: 'increase',
      icon: BookOpen,
      color: 'text-orange-500',
      description: 'Coding bootcamps that have integrated the toolkit',
      trend: [4, 5, 6, 6, 7],
      target: 15,
      unit: 'bootcamps'
    },
    {
      id: 'audio-usage',
      title: 'Audio Feedback Usage',
      value: 89.2,
      change: 3.7,
      changeType: 'increase',
      icon: Volume2,
      color: 'text-cyan-500',
      description: 'Percentage of users actively using audio feedback features',
      trend: [82, 85, 87, 88, 89.2],
      target: 95,
      unit: '%'
    },
    {
      id: 'braille-adoption',
      title: 'Braille Output Adoption',
      value: 67.4,
      change: 8.9,
      changeType: 'increase',
      icon: Braille,
      color: 'text-indigo-500',
      description: 'Users utilizing Braille output functionality',
      trend: [55, 59, 62, 65, 67.4],
      target: 80,
      unit: '%'
    },
    {
      id: 'satisfaction-score',
      title: 'User Satisfaction',
      value: 4.7,
      change: 0.2,
      changeType: 'increase',
      icon: Star,
      color: 'text-yellow-500',
      description: 'Average user satisfaction rating out of 5',
      trend: [4.3, 4.4, 4.5, 4.6, 4.7],
      target: 4.8,
      unit: '/5'
    },
    {
      id: 'error-reduction',
      title: 'Error Detection',
      value: 94.6,
      change: 1.8,
      changeType: 'increase',
      icon: Shield,
      color: 'text-red-500',
      description: 'Effectiveness in detecting and preventing coding errors',
      trend: [90, 91.5, 92.8, 93.7, 94.6],
      target: 98,
      unit: '%'
    }
  ];

  // Accessibility features data
  const featuresData: AccessibilityFeature[] = [
    {
      id: 'audio-feedback',
      name: 'Real-time Audio Feedback',
      description: 'Convert code syntax into distinct audio tones and patterns',
      usage: 89.2,
      satisfaction: 4.8,
      impact: 'high',
      category: 'audio',
      status: 'active'
    },
    {
      id: 'braille-output',
      name: 'Braille Code Conversion',
      description: 'Dynamic Braille output with Grade 2 support',
      usage: 67.4,
      satisfaction: 4.6,
      impact: 'high',
      category: 'visual',
      status: 'active'
    },
    {
      id: 'voice-navigation',
      name: 'Voice Command Navigation',
      description: 'Control editor with voice commands',
      usage: 45.8,
      satisfaction: 4.3,
      impact: 'medium',
      category: 'motor',
      status: 'active'
    },
    {
      id: 'smart-completion',
      name: 'Context-Aware Code Completion',
      description: 'Intelligent code suggestions with audio cues',
      usage: 78.9,
      satisfaction: 4.5,
      impact: 'high',
      category: 'cognitive',
      status: 'active'
    },
    {
      id: 'error-detection',
      name: 'Real-time Error Detection',
      description: 'Immediate audio feedback for syntax errors',
      usage: 82.3,
      satisfaction: 4.7,
      impact: 'high',
      category: 'audio',
      status: 'active'
    },
    {
      id: 'spatial-audio',
      name: 'Spatial Audio Positioning',
      description: '3D audio representation of code structure',
      usage: 34.2,
      satisfaction: 4.1,
      impact: 'medium',
      category: 'audio',
      status: 'beta'
    },
    {
      id: 'haptic-feedback',
      name: 'Haptic Feedback Integration',
      description: 'Tactile feedback for mobile devices',
      usage: 0,
      satisfaction: 0,
      impact: 'medium',
      category: 'motor',
      status: 'planned'
    },
    {
      id: 'ai-assistant',
      name: 'AI-Powered Accessibility Assistant',
      description: 'Intelligent assistant for accessibility optimization',
      usage: 0,
      satisfaction: 0,
      impact: 'high',
      category: 'cognitive',
      status: 'planned'
    }
  ];

  // Sample usage data
  const sampleUsageData: UsageData[] = [
    { date: '2024-01-01', audioFeedback: 85, brailleOutput: 62, voiceNavigation: 38, keyboardShortcuts: 92, errorDetection: 78, codeCompletion: 71 },
    { date: '2024-01-02', audioFeedback: 87, brailleOutput: 64, voiceNavigation: 41, keyboardShortcuts: 94, errorDetection: 80, codeCompletion: 73 },
    { date: '2024-01-03', audioFeedback: 88, brailleOutput: 65, voiceNavigation: 43, keyboardShortcuts: 95, errorDetection: 81, codeCompletion: 75 },
    { date: '2024-01-04', audioFeedback: 89, brailleOutput: 66, voiceNavigation: 44, keyboardShortcuts: 96, errorDetection: 82, codeCompletion: 77 },
    { date: '2024-01-05', audioFeedback: 90, brailleOutput: 67, voiceNavigation: 46, keyboardShortcuts: 97, errorDetection: 83, codeCompletion: 79 },
    { date: '2024-01-06', audioFeedback: 89, brailleOutput: 68, voiceNavigation: 45, keyboardShortcuts: 98, errorDetection: 84, codeCompletion: 78 },
    { date: '2024-01-07', audioFeedback: 91, brailleOutput: 69, voiceNavigation: 47, keyboardShortcuts: 99, errorDetection: 85, codeCompletion: 80 }
  ];

  // Sample user feedback
  const sampleFeedback: UserFeedback[] = [
    {
      id: '1',
      user: 'Sarah Chen',
      rating: 5,
      comment: 'The audio feedback has completely transformed my coding experience. I can now navigate complex codebases with confidence.',
      feature: 'Audio Feedback',
      date: '2024-01-07',
      verified: true
    },
    {
      id: '2',
      user: 'Marcus Johnson',
      rating: 5,
      comment: 'Braille output is incredibly accurate and fast. The Grade 2 contractions save so much time.',
      feature: 'Braille Output',
      date: '2024-01-06',
      verified: true
    },
    {
      id: '3',
      user: 'Elena Rodriguez',
      rating: 4,
      comment: 'Voice navigation works well, though it could use some improvement in noisy environments.',
      feature: 'Voice Navigation',
      date: '2024-01-05',
      verified: true
    },
    {
      id: '4',
      user: 'David Kim',
      rating: 5,
      comment: 'The error detection is phenomenal. It catches mistakes I would have missed and explains them clearly.',
      feature: 'Error Detection',
      date: '2024-01-04',
      verified: true
    },
    {
      id: '5',
      user: 'Lisa Thompson',
      rating: 4,
      comment: 'Code completion suggestions are very helpful, especially with the audio descriptions.',
      feature: 'Code Completion',
      date: '2024-01-03',
      verified: false
    }
  ];

  // Initialize data
  useEffect(() => {
    setUsageData(sampleUsageData);
    setUserFeedback(sampleFeedback);
    setAccessibilityFeatures(featuresData);
  }, []);

  // Real-time updates simulation
  useEffect(() => {
    if (!realTimeUpdates) return;

    const interval = setInterval(() => {
      setLastUpdated(new Date());
      
      // Simulate small changes in system health
      setSystemHealth(prev => ({
        ...prev,
        cpu: Math.max(20, Math.min(80, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(30, Math.min(90, prev.memory + (Math.random() - 0.5) * 8)),
        network: Math.max(80, Math.min(100, prev.network + (Math.random() - 0.5) * 5)),
        audioLatency: Math.max(5, Math.min(25, prev.audioLatency + (Math.random() - 0.5) * 3)),
        brailleLatency: Math.max(3, Math.min(20, prev.brailleLatency + (Math.random() - 0.5) * 2))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [realTimeUpdates]);

  // Filter features based on category and search
  const filteredFeatures = accessibilityFeatures.filter(feature => {
    const matchesCategory = filterCategory === 'all' || feature.category === filterCategory;
    const matchesSearch = !searchQuery || 
      feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Export data function
  const exportData = () => {
    const data = {
      metrics,
      usageData,
      userFeedback,
      accessibilityFeatures,
      systemHealth,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accessibility-dashboard-${Date.now()}.${exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Refresh data function
  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsLoading(false);
    }, 1000);
  };

  // Render metric card
  const renderMetricCard = (metric: MetricCard) => (
    <motion.div
      key={metric.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${
        highContrast ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      } rounded-lg border p-6 hover:shadow-lg transition-shadow cursor-pointer`}
      onClick={() => setSelectedMetric(metric.id)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${
          highContrast ? 'bg-gray-800' : 'bg-gray-50'
        }`}>
          <metric.icon className={`w-6 h-6 ${metric.color}`} />
        </div>
        <div className={`flex items-center gap-1 text-sm ${
          metric.changeType === 'increase' ? 'text-green-500' :
          metric.changeType === 'decrease' ? 'text-red-500' : 'text-gray-500'
        }`}>
          {metric.changeType === 'increase' ? <ArrowUp className="w-4 h-4" /> :
           metric.changeType === 'decrease' ? <ArrowDown className="w-4 h-4" /> : null}
          {metric.change > 0 ? '+' : ''}{metric.change}%
        </div>
      </div>
      
      <div className="mb-2">
        <h3 className={`text-sm font-medium ${highContrast ? 'text-gray-300' : 'text-gray-600'}`}>
          {metric.title}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold ${highContrast ? 'text-white' : 'text-gray-900'}`}>
            {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
          </span>
          {metric.unit && (
            <span className={`text-sm ${highContrast ? 'text-gray-400' : 'text-gray-500'}`}>
              {metric.unit}
            </span>
          )}
        </div>
      </div>
      
      <p className={`text-xs ${highContrast ? 'text-gray-400' : 'text-gray-500'} mb-3`}>
        {metric.description}
      </p>
      
      {/* Progress bar for target */}
      {metric.target && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className={highContrast ? 'text-gray-400' : 'text-gray-500'}>
              Progress to target
            </span>
            <span className={highContrast ? 'text-gray-400' : 'text-gray-500'}>
              {Math.round((Number(metric.value) / metric.target) * 100)}%
            </span>
          </div>
          <div className={`w-full bg-gray-200 rounded-full h-2 ${highContrast ? 'bg-gray-700' : ''}`}>
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (Number(metric.value) / metric.target) * 100)}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Mini trend chart */}
      <div className="flex items-end gap-1 h-8">
        {metric.trend.map((value, index) => (
          <div
            key={index}
            className="bg-blue-500 rounded-sm flex-1 transition-all duration-300"
            style={{ 
              height: `${(value / Math.max(...metric.trend)) * 100}%`,
              opacity: 0.7 + (index / metric.trend.length) * 0.3
            }}
          />
        ))}
      </div>
    </motion.div>
  );

  // Render system health indicator
  const renderSystemHealth = () => (
    <div className={`${
      highContrast ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
    } rounded-lg border p-6`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-semibold ${highContrast ? 'text-white' : 'text-gray-900'}`}>
          System Health
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className={`text-sm ${highContrast ? 'text-gray-300' : 'text-gray-600'}`}>
            All systems operational
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className={`flex items-center gap-2 ${highContrast ? 'text-gray-300' : 'text-gray-600'}`}>
                <Cpu className="w-4 h-4" />
                CPU Usage
              </span>
              <span className={highContrast ? 'text-white' : 'text-gray-900'}>
                {systemHealth.cpu.toFixed(1)}%
              </span>
            </div>
            <div className={`w-full bg-gray-200 rounded-full h-2 ${highContrast ? 'bg-gray-700' : ''}`}>
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  systemHealth.cpu > 70 ? 'bg-red-500' :
                  systemHealth.cpu > 50 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${systemHealth.cpu}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className={`flex items-center gap-2 ${highContrast ? 'text-gray-300' : 'text-gray-600'}`}>
                <MemoryStick className="w-4 h-4" />
                Memory Usage
              </span>
              <span className={highContrast ? 'text-white' : 'text-gray-900'}>
                {systemHealth.memory.toFixed(1)}%
              </span>
            </div>
            <div className={`w-full bg-gray-200 rounded-full h-2 ${highContrast ? 'bg-gray-700' : ''}`}>
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  systemHealth.memory > 80 ? 'bg-red-500' :
                  systemHealth.memory > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${systemHealth.memory}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className={`flex items-center gap-2 ${highContrast ? 'text-gray-300' : 'text-gray-600'}`}>
                <HardDrive className="w-4 h-4" />
                Storage Usage
              </span>
              <span className={highContrast ? 'text-white' : 'text-gray-900'}>
                {systemHealth.storage.toFixed(1)}%
              </span>
            </div>
            <div className={`w-full bg-gray-200 rounded-full h-2 ${highContrast ? 'bg-gray-700' : ''}`}>
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  systemHealth.storage > 85 ? 'bg-red-500' :
                  systemHealth.storage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${systemHealth.storage}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className={`flex items-center gap-2 ${highContrast ? 'text-gray-300' : 'text-gray-600'}`}>
                <Wifi className="w-4 h-4" />
                Network Quality
              </span>
              <span className={highContrast ? 'text-white' : 'text-gray-900'}>
                {systemHealth.network.toFixed(1)}%
              </span>
            </div>
            <div className={`w-full bg-gray-200 rounded-full h-2 ${highContrast ? 'bg-gray-700' : ''}`}>
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${systemHealth.network}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className={`p-3 rounded-lg ${highContrast ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${highContrast ? 'text-gray-300' : 'text-gray-600'}`}>
                Audio Latency
              </span>
              <span className={`text-lg font-semibold ${highContrast ? 'text-white' : 'text-gray-900'}`}>
                {systemHealth.audioLatency}ms
              </span>
            </div>
            <div className={`text-xs ${
              systemHealth.audioLatency < 15 ? 'text-green-500' :
              systemHealth.audioLatency < 25 ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {systemHealth.audioLatency < 15 ? 'Excellent' :
               systemHealth.audioLatency < 25 ? 'Good' : 'Needs attention'}
            </div>
          </div>
          
          <div className={`p-3 rounded-lg ${highContrast ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${highContrast ? 'text-gray-300' : 'text-gray-600'}`}>
                Braille Latency
              </span>
              <span className={`text-lg font-semibold ${highContrast ? 'text-white' : 'text-gray-900'}`}>
                {systemHealth.brailleLatency}ms
              </span>
            </div>
            <div className={`text-xs ${
              systemHealth.brailleLatency < 10 ? 'text-green-500' :
              systemHealth.brailleLatency < 20 ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {systemHealth.brailleLatency < 10 ? 'Excellent' :
               systemHealth.brailleLatency < 20 ? 'Good' : 'Needs attention'}
            </div>
          </div>
          
          <div className={`p-3 rounded-lg ${highContrast ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${highContrast ? 'text-gray-300' : 'text-gray-600'}`}>
                Error Rate
              </span>
              <span className={`text-lg font-semibold ${highContrast ? 'text-white' : 'text-gray-900'}`}>
                {systemHealth.errorRate}%
              </span>
            </div>
            <div className="text-xs text-green-500">
              Within acceptable range
            </div>
          </div>
          
          <div className={`p-3 rounded-lg ${highContrast ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${highContrast ? 'text-gray-300' : 'text-gray-600'}`}>
                Uptime
              </span>
              <span className={`text-lg font-semibold ${highContrast ? 'text-white' : 'text-gray-900'}`}>
                {systemHealth.uptime}%
              </span>
            </div>
            <div className="text-xs text-green-500">
              Excellent reliability
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${highContrast ? 'bg-black' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${highContrast ? 'text-white' : 'text-gray-900'}`}>
                Accessibility Dashboard
              </h1>
              <p className={`text-lg ${highContrast ? 'text-gray-300' : 'text-gray-600'}`}>
                Real-time insights into accessibility toolkit performance and user engagement
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`text-sm ${highContrast ? 'text-gray-400' : 'text-gray-500'}`}>
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
                <button
                  onClick={refreshData}
                  disabled={isLoading}
                  className={`p-2 rounded-lg transition-colors ${
                    isLoading ? 'animate-spin' : ''
                  } ${
                    highContrast ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50'
                  } border ${highContrast ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                  className={`px-3 py-2 border rounded-lg ${
                    highContrast
                      ? 'bg-black text-white border-white'
                      : 'bg-white text-gray-900 border-gray-300'
                  }`}
                >
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
                
                <button
                  onClick={exportData}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.slice(0, 4).map(renderMetricCard)}
        </div>

        {/* Secondary Metrics */}
        {showAdvancedMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.slice(4).map(renderMetricCard)}
          </div>
        )}

        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              highContrast ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50'
            } border ${highContrast ? 'border-gray-700' : 'border-gray-200'}`}
          >
            {showAdvancedMetrics ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showAdvancedMetrics ? 'Hide' : 'Show'} Advanced Metrics
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Usage Trends Chart */}
          <div className={`lg:col-span-2 ${
            highContrast ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
          } rounded-lg border p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${highContrast ? 'text-white' : 'text-gray-900'}`}>
                Feature Usage Trends
              </h3>
              <div className="flex items-center gap-2">
                <BarChart3 className={`w-5 h-5 ${highContrast ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
            </div>
            
            {/* Simplified chart representation */}
            <div className="space-y-4">
              {['Audio Feedback', 'Braille Output', 'Voice Navigation', 'Error Detection'].map((feature, index) => {
                const values = [85, 67, 46, 82];
                const trends = [2.1, 8.9, 12.3, 1.8];
                
                return (
                  <div key={feature} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${highContrast ? 'text-gray-300' : 'text-gray-700'}`}>
                        {feature}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${highContrast ? 'text-white' : 'text-gray-900'}`}>
                          {values[index]}%
                        </span>
                        <span className={`text-xs flex items-center gap-1 ${
                          trends[index] > 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {trends[index] > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                          {trends[index]}%
                        </span>
                      </div>
                    </div>
                    <div className={`w-full bg-gray-200 rounded-full h-2 ${highContrast ? 'bg-gray-700' : ''}`}>
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${values[index]}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System Health */}
          {renderSystemHealth()}
        </div>

        {/* Features Overview */}
        <div className={`${
          highContrast ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
        } rounded-lg border p-6 mb-8`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${highContrast ? 'text-white' : 'text-gray-900'}`}>
              Accessibility Features
            </h3>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Search className={`w-4 h-4 ${highContrast ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Search features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`px-3 py-1 border rounded ${
                    highContrast
                      ? 'bg-black text-white border-gray-600 placeholder-gray-400'
                      : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
                  }`}
                />
              </div>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={`px-3 py-1 border rounded ${
                  highContrast
                    ? 'bg-black text-white border-gray-600'
                    : 'bg-white text-gray-900 border-gray-300'
                }`}
              >
                <option value="all">All Categories</option>
                <option value="audio">Audio</option>
                <option value="visual">Visual</option>
                <option value="motor">Motor</option>
                <option value="cognitive">Cognitive</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFeatures.map((feature) => (
              <div
                key={feature.id}
                className={`p-4 rounded-lg border transition-colors ${
                  highContrast ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`font-medium ${highContrast ? 'text-white' : 'text-gray-900'}`}>
                    {feature.name}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      feature.status === 'active' ? 'bg-green-100 text-green-800' :
                      feature.status === 'beta' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {feature.status}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      feature.impact === 'high' ? 'bg-red-100 text-red-800' :
                      feature.impact === 'medium' ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {feature.impact} impact
                    </span>
                  </div>
                </div>
                
                <p className={`text-sm mb-3 ${highContrast ? 'text-gray-300' : 'text-gray-600'}`}>
                  {feature.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={highContrast ? 'text-gray-400' : 'text-gray-500'}>Usage</span>
                    <span className={highContrast ? 'text-white' : 'text-gray-900'}>{feature.usage}%</span>
                  </div>
                  <div className={`w-full bg-gray-200 rounded-full h-1.5 ${highContrast ? 'bg-gray-700' : ''}`}>
                    <div
                      className="bg-blue-500 h-1.5 rounded-full"
                      style={{ width: `${feature.usage}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className={highContrast ? 'text-gray-400' : 'text-gray-500'}>Satisfaction</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className={highContrast ? 'text-white' : 'text-gray-900'}>{feature.satisfaction}/5</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Feedback */}
        <div className={`${
          highContrast ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
        } rounded-lg border p-6`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${highContrast ? 'text-white' : 'text-gray-900'}`}>
              Recent User Feedback
            </h3>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              <span className={`text-sm ${highContrast ? 'text-gray-300' : 'text-gray-600'}`}>
                {userFeedback.length} reviews
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            {userFeedback.slice(0, 3).map((feedback) => (
              <div
                key={feedback.id}
                className={`p-4 rounded-lg border ${
                  highContrast ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      highContrast ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <span className={`text-sm font-medium ${highContrast ? 'text-white' : 'text-gray-700'}`}>
                        {feedback.user.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${highContrast ? 'text-white' : 'text-gray-900'}`}>
                          {feedback.user}
                        </span>
                        {feedback.verified && (
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < feedback.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className={`text-xs ${highContrast ? 'text-gray-400' : 'text-gray-500'}`}>
                          {feedback.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    highContrast ? 'bg-gray-700 text-gray-300' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {feedback.feature}
                  </span>
                </div>
                
                <p className={`text-sm ${highContrast ? 'text-gray-300' : 'text-gray-700'}`}>
                  "{feedback.comment}"
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <button className={`px-4 py-2 rounded-lg transition-colors ${
              highContrast ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}>
              View All Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityDashboard;