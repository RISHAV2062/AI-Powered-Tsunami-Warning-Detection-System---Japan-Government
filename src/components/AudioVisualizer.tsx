import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import * as Tone from 'tone';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Settings, 
  Waves, 
  BarChart3,
  Radio,
  Headphones,
  Speaker,
  Mic
} from 'lucide-react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  volume: number;
  language: string;
  highContrast: boolean;
}

interface FrequencyData {
  frequency: number;
  amplitude: number;
  type: string;
  timestamp: number;
}

interface AudioProfile {
  name: string;
  frequencies: { [key: string]: number };
  waveform: 'sine' | 'square' | 'triangle' | 'sawtooth';
  effects: {
    reverb: number;
    delay: number;
    distortion: number;
    filter: number;
  };
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  volume,
  language,
  highContrast
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const synthRef = useRef<Tone.Synth | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const [visualizationType, setVisualizationType] = useState<'waveform' | 'frequency' | 'circular'>('frequency');
  const [audioData, setAudioData] = useState<Float32Array>(new Float32Array(256));
  const [frequencyData, setFrequencyData] = useState<FrequencyData[]>([]);
  const [currentProfile, setCurrentProfile] = useState<AudioProfile | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [spatialMode, setSpatialMode] = useState(false);
  const [reverbLevel, setReverbLevel] = useState(0.3);
  const [delayTime, setDelayTime] = useState(0.2);
  const [filterFrequency, setFilterFrequency] = useState(1000);
  const [bassBoost, setBassBoost] = useState(0);
  const [trebleBoost, setTrebleBoost] = useState(0);
  const [compression, setCompression] = useState(0.5);
  const [noiseGate, setNoiseGate] = useState(-40);
  const [audioQuality, setAudioQuality] = useState<'low' | 'medium' | 'high'>('high');
  const [realTimeProcessing, setRealTimeProcessing] = useState(true);
  const [adaptiveVolume, setAdaptiveVolume] = useState(false);
  const [binaural, setBinaural] = useState(false);
  const [psychoacoustic, setPsychoacoustic] = useState(false);
  const [dynamicRange, setDynamicRange] = useState(0.8);
  const [harmonics, setHarmonics] = useState(true);
  const [temperament, setTemperament] = useState<'equal' | 'just' | 'pythagorean'>('equal');
  const [microtonal, setMicrotonal] = useState(false);
  const [gamelan, setGamelan] = useState(false);

  // Audio profiles for different programming languages
  const audioProfiles: { [key: string]: AudioProfile } = {
    javascript: {
      name: 'JavaScript',
      frequencies: {
        function: 440,
        variable: 330,
        class: 550,
        loop: 220,
        conditional: 660,
        comment: 110,
        string: 880,
        number: 1100,
        operator: 770,
        keyword: 294
      },
      waveform: 'sine',
      effects: {
        reverb: 0.2,
        delay: 0.1,
        distortion: 0.0,
        filter: 0.3
      }
    },
    python: {
      name: 'Python',
      frequencies: {
        function: 523,
        variable: 392,
        class: 659,
        loop: 262,
        conditional: 784,
        comment: 131,
        string: 1047,
        number: 1319,
        operator: 698,
        keyword: 349
      },
      waveform: 'triangle',
      effects: {
        reverb: 0.3,
        delay: 0.15,
        distortion: 0.1,
        filter: 0.4
      }
    },
    typescript: {
      name: 'TypeScript',
      frequencies: {
        function: 466,
        variable: 350,
        class: 587,
        loop: 233,
        conditional: 700,
        comment: 117,
        string: 932,
        number: 1175,
        operator: 825,
        keyword: 311
      },
      waveform: 'square',
      effects: {
        reverb: 0.25,
        delay: 0.12,
        distortion: 0.05,
        filter: 0.35
      }
    },
    java: {
      name: 'Java',
      frequencies: {
        function: 494,
        variable: 370,
        class: 622,
        loop: 247,
        conditional: 740,
        comment: 123,
        string: 988,
        number: 1235,
        operator: 871,
        keyword: 329
      },
      waveform: 'sawtooth',
      effects: {
        reverb: 0.4,
        delay: 0.18,
        distortion: 0.2,
        filter: 0.5
      }
    },
    cpp: {
      name: 'C++',
      frequencies: {
        function: 415,
        variable: 311,
        class: 523,
        loop: 208,
        conditional: 622,
        comment: 104,
        string: 831,
        number: 1047,
        operator: 739,
        keyword: 277
      },
      waveform: 'square',
      effects: {
        reverb: 0.1,
        delay: 0.08,
        distortion: 0.3,
        filter: 0.2
      }
    },
    rust: {
      name: 'Rust',
      frequencies: {
        function: 369,
        variable: 277,
        class: 466,
        loop: 185,
        conditional: 554,
        comment: 92,
        string: 740,
        number: 932,
        operator: 658,
        keyword: 246
      },
      waveform: 'triangle',
      effects: {
        reverb: 0.15,
        delay: 0.1,
        distortion: 0.4,
        filter: 0.25
      }
    }
  };

  // Initialize audio context and analyser
  useEffect(() => {
    const initAudio = async () => {
      try {
        await Tone.start();
        
        // Create audio context if not exists
        if (!audioContextRef.current) {
          audioContextRef.current = Tone.context.rawContext as AudioContext;
        }
        
        // Create analyser node
        if (!analyserRef.current && audioContextRef.current) {
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 512;
          analyserRef.current.smoothingTimeConstant = 0.8;
        }
        
        // Create synth with enhanced features
        if (!synthRef.current) {
          synthRef.current = new Tone.Synth({
            oscillator: {
              type: currentProfile?.waveform || 'sine',
              harmonicity: harmonics ? 2 : 1,
              modulationType: microtonal ? 'fm' : 'am'
            },
            envelope: {
              attack: 0.1,
              decay: 0.2,
              sustain: 0.7,
              release: 0.3,
              attackCurve: 'exponential',
              decayCurve: 'exponential',
              releaseCurve: 'exponential'
            },
            filter: {
              frequency: filterFrequency,
              type: 'lowpass',
              rolloff: -24,
              Q: 1
            },
            filterEnvelope: {
              attack: 0.05,
              decay: 0.1,
              sustain: 0.8,
              release: 0.2,
              baseFrequency: filterFrequency,
              octaves: 3
            }
          });
          
          // Add effects chain
          const reverb = new Tone.Reverb({
            decay: reverbLevel * 4,
            preDelay: 0.01,
            wet: reverbLevel
          });
          
          const delay = new Tone.FeedbackDelay({
            delayTime: delayTime,
            feedback: 0.3,
            wet: 0.2
          });
          
          const compressor = new Tone.Compressor({
            threshold: -24,
            ratio: 4,
            attack: 0.003,
            release: 0.1
          });
          
          const limiter = new Tone.Limiter(-6);
          
          // Connect effects chain
          synthRef.current.chain(
            compressor,
            delay,
            reverb,
            limiter,
            Tone.Destination
          );
          
          // Add spatial audio if enabled
          if (spatialMode) {
            const panner = new Tone.Panner3D({
              panningModel: 'HRTF',
              distanceModel: 'inverse',
              refDistance: 1,
              maxDistance: 10000,
              rolloffFactor: 1,
              coneInnerAngle: 360,
              coneOuterAngle: 0,
              coneOuterGain: 0
            });
            
            synthRef.current.connect(panner);
            panner.toDestination();
          }
          
          // Connect to analyser
          if (analyserRef.current) {
            synthRef.current.connect(analyserRef.current);
          }
        }
        
        // Set volume
        if (synthRef.current) {
          synthRef.current.volume.value = Tone.gainToDb(volume * dynamicRange);
        }
        
        // Set current profile
        setCurrentProfile(audioProfiles[language] || audioProfiles.javascript);
        
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };

    initAudio();

    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
        synthRef.current = null;
      }
    };
  }, [language, volume, spatialMode, reverbLevel, delayTime, filterFrequency, dynamicRange, harmonics, microtonal]);

  // Animation loop for visualization
  useEffect(() => {
    if (!isPlaying || !canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      const bufferLength = analyserRef.current!.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const frequencyArray = new Float32Array(bufferLength);
      
      analyserRef.current!.getByteFrequencyData(dataArray);
      analyserRef.current!.getFloatFrequencyData(frequencyArray);
      
      setAudioData(frequencyArray);
      
      // Clear canvas
      ctx.fillStyle = highContrast ? '#000000' : '#1f2937';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw visualization based on type
      switch (visualizationType) {
        case 'frequency':
          drawFrequencyBars(ctx, dataArray, canvas.width, canvas.height);
          break;
        case 'waveform':
          drawWaveform(ctx, dataArray, canvas.width, canvas.height);
          break;
        case 'circular':
          drawCircularVisualization(ctx, dataArray, canvas.width, canvas.height);
          break;
      }
      
      // Update frequency data for analysis
      const newFrequencyData: FrequencyData[] = [];
      for (let i = 0; i < dataArray.length; i += 4) {
        if (dataArray[i] > 50) { // Threshold for significant frequencies
          newFrequencyData.push({
            frequency: (i / bufferLength) * (audioContextRef.current?.sampleRate || 44100) / 2,
            amplitude: dataArray[i] / 255,
            type: determineFrequencyType(i, bufferLength),
            timestamp: Date.now()
          });
        }
      }
      setFrequencyData(newFrequencyData);
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, visualizationType, highContrast]);

  // Draw frequency bars visualization
  const drawFrequencyBars = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    const barWidth = width / dataArray.length * 2.5;
    let barHeight;
    let x = 0;
    
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, highContrast ? '#ffffff' : '#3b82f6');
    gradient.addColorStop(0.3, highContrast ? '#cccccc' : '#8b5cf6');
    gradient.addColorStop(0.6, highContrast ? '#999999' : '#f59e0b');
    gradient.addColorStop(1, highContrast ? '#666666' : '#ef4444');
    
    for (let i = 0; i < dataArray.length; i++) {
      barHeight = (dataArray[i] / 255) * height * 0.8;
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      
      // Add glow effect if not high contrast
      if (!highContrast) {
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
      
      x += barWidth + 1;
    }
    
    // Reset shadow
    ctx.shadowBlur = 0;
  };

  // Draw waveform visualization
  const drawWaveform = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    ctx.lineWidth = 2;
    ctx.strokeStyle = highContrast ? '#ffffff' : '#3b82f6';
    ctx.beginPath();
    
    const sliceWidth = width / dataArray.length;
    let x = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 128.0;
      const y = v * height / 2;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      x += sliceWidth;
    }
    
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    // Add glow effect
    if (!highContrast) {
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 5;
      ctx.strokeStyle = '#93c5fd';
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  };

  // Draw circular visualization
  const drawCircularVisualization = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 4;
    
    ctx.translate(centerX, centerY);
    
    const angleStep = (Math.PI * 2) / dataArray.length;
    
    for (let i = 0; i < dataArray.length; i++) {
      const amplitude = dataArray[i] / 255;
      const angle = angleStep * i;
      
      const x1 = Math.cos(angle) * radius;
      const y1 = Math.sin(angle) * radius;
      const x2 = Math.cos(angle) * (radius + amplitude * radius);
      const y2 = Math.sin(angle) * (radius + amplitude * radius);
      
      const hue = (i / dataArray.length) * 360;
      ctx.strokeStyle = highContrast ? 
        `rgba(255, 255, 255, ${amplitude})` : 
        `hsla(${hue}, 70%, 60%, ${amplitude})`;
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      
      // Add particle effect
      if (amplitude > 0.5) {
        ctx.fillStyle = ctx.strokeStyle;
        ctx.beginPath();
        ctx.arc(x2, y2, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    ctx.resetTransform();
  };

  // Determine frequency type based on position
  const determineFrequencyType = (index: number, bufferLength: number): string => {
    const ratio = index / bufferLength;
    if (ratio < 0.1) return 'bass';
    if (ratio < 0.3) return 'low-mid';
    if (ratio < 0.6) return 'mid';
    if (ratio < 0.8) return 'high-mid';
    return 'treble';
  };

  // Play demonstration tone
  const playDemoTone = async (type: string) => {
    if (!synthRef.current || !currentProfile) return;
    
    try {
      await Tone.start();
      const frequency = currentProfile.frequencies[type] || 440;
      synthRef.current.triggerAttackRelease(frequency, '8n');
    } catch (error) {
      console.error('Failed to play demo tone:', error);
    }
  };

  // Generate test pattern
  const generateTestPattern = async () => {
    if (!synthRef.current || !currentProfile) return;
    
    try {
      await Tone.start();
      const sequence = new Tone.Sequence((time, note) => {
        synthRef.current!.triggerAttackRelease(note, '16n', time);
      }, Object.values(currentProfile.frequencies), '8n');
      
      sequence.start(0);
      sequence.stop('+4');
    } catch (error) {
      console.error('Failed to generate test pattern:', error);
    }
  };

  return (
    <div className={`w-full h-full ${highContrast ? 'bg-black' : 'bg-gray-900'} rounded-lg overflow-hidden`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${
        highContrast ? 'border-white' : 'border-gray-700'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isPlaying ? 'bg-green-500' : 'bg-gray-600'}`}>
            <Waves className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`font-semibold ${highContrast ? 'text-white' : 'text-gray-100'}`}>
              Audio Visualizer
            </h3>
            <p className={`text-sm ${highContrast ? 'text-gray-300' : 'text-gray-400'}`}>
              {currentProfile?.name || 'No Profile'} • {visualizationType}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVisualizationType(
              visualizationType === 'frequency' ? 'waveform' : 
              visualizationType === 'waveform' ? 'circular' : 'frequency'
            )}
            className={`p-2 rounded-lg transition-colors ${
              highContrast ? 'bg-gray-800 text-white' : 'bg-gray-700 text-gray-300'
            } hover:bg-opacity-80`}
            aria-label="Change visualization type"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${
              showSettings 
                ? 'bg-blue-500 text-white' 
                : highContrast ? 'bg-gray-800 text-white' : 'bg-gray-700 text-gray-300'
            }`}
            aria-label="Toggle settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Visualization */}
      <div className="relative h-48">
        <canvas
          ref={canvasRef}
          width={400}
          height={192}
          className="w-full h-full"
          aria-label="Audio frequency visualization"
        />
        
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Play className={`w-12 h-12 mx-auto mb-2 ${
                highContrast ? 'text-white' : 'text-gray-400'
              }`} />
              <p className={`text-sm ${highContrast ? 'text-gray-300' : 'text-gray-500'}`}>
                Start audio to see visualization
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Frequency Analysis */}
      {frequencyData.length > 0 && (
        <div className={`p-4 border-t ${highContrast ? 'border-white' : 'border-gray-700'}`}>
          <h4 className={`text-sm font-medium mb-2 ${highContrast ? 'text-white' : 'text-gray-200'}`}>
            Active Frequencies
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {frequencyData.slice(0, 4).map((freq, index) => (
              <div
                key={index}
                className={`p-2 rounded text-xs ${
                  highContrast ? 'bg-gray-800 text-white' : 'bg-gray-800 text-gray-300'
                }`}
              >
                <div className="font-medium">{freq.type}</div>
                <div className="text-xs opacity-75">
                  {Math.round(freq.frequency)}Hz • {Math.round(freq.amplitude * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audio Profile Info */}
      {currentProfile && (
        <div className={`p-4 border-t ${highContrast ? 'border-white' : 'border-gray-700'}`}>
          <h4 className={`text-sm font-medium mb-3 ${highContrast ? 'text-white' : 'text-gray-200'}`}>
            Audio Profile: {currentProfile.name}
          </h4>
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            {Object.entries(currentProfile.frequencies).slice(0, 6).map(([type, freq]) => (
              <button
                key={type}
                onClick={() => playDemoTone(type)}
                className={`p-2 rounded text-xs text-left transition-colors ${
                  highContrast 
                    ? 'bg-gray-800 text-white hover:bg-gray-700' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <div className="font-medium capitalize">{type.replace('_', ' ')}</div>
                <div className="text-xs opacity-75">{freq}Hz</div>
              </button>
            ))}
          </div>
          
          <button
            onClick={generateTestPattern}
            className="w-full p-2 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            Play Test Pattern
          </button>
        </div>
      )}

      {/* Advanced Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className={`border-t ${highContrast ? 'border-white' : 'border-gray-700'} overflow-hidden`}
        >
          <div className="p-4 space-y-4">
            <h4 className={`text-sm font-medium ${highContrast ? 'text-white' : 'text-gray-200'}`}>
              Advanced Audio Settings
            </h4>
            
            {/* Audio Effects */}
            <div className="space-y-3">
              <div>
                <label className={`text-xs ${highContrast ? 'text-gray-300' : 'text-gray-400'}`}>
                  Reverb: {Math.round(reverbLevel * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={reverbLevel}
                  onChange={(e) => setReverbLevel(parseFloat(e.target.value))}
                  className="w-full mt-1"
                />
              </div>
              
              <div>
                <label className={`text-xs ${highContrast ? 'text-gray-300' : 'text-gray-400'}`}>
                  Delay: {Math.round(delayTime * 1000)}ms
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={delayTime}
                  onChange={(e) => setDelayTime(parseFloat(e.target.value))}
                  className="w-full mt-1"
                />
              </div>
              
              <div>
                <label className={`text-xs ${highContrast ? 'text-gray-300' : 'text-gray-400'}`}>
                  Filter: {filterFrequency}Hz
                </label>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={filterFrequency}
                  onChange={(e) => setFilterFrequency(parseInt(e.target.value))}
                  className="w-full mt-1"
                />
              </div>
              
              <div>
                <label className={`text-xs ${highContrast ? 'text-gray-300' : 'text-gray-400'}`}>
                  Dynamic Range: {Math.round(dynamicRange * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={dynamicRange}
                  onChange={(e) => setDynamicRange(parseFloat(e.target.value))}
                  className="w-full mt-1"
                />
              </div>
            </div>
            
            {/* Audio Features */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="spatial-mode"
                  checked={spatialMode}
                  onChange={(e) => setSpatialMode(e.target.checked)}
                />
                <label htmlFor="spatial-mode" className={`text-xs ${highContrast ? 'text-gray-300' : 'text-gray-400'}`}>
                  Spatial Audio (3D Positioning)
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="adaptive-volume"
                  checked={adaptiveVolume}
                  onChange={(e) => setAdaptiveVolume(e.target.checked)}
                />
                <label htmlFor="adaptive-volume" className={`text-xs ${highContrast ? 'text-gray-300' : 'text-gray-400'}`}>
                  Adaptive Volume Control
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="binaural"
                  checked={binaural}
                  onChange={(e) => setBinaural(e.target.checked)}
                />
                <label htmlFor="binaural" className={`text-xs ${highContrast ? 'text-gray-300' : 'text-gray-400'}`}>
                  Binaural Beats
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="harmonics"
                  checked={harmonics}
                  onChange={(e) => setHarmonics(e.target.checked)}
                />
                <label htmlFor="harmonics" className={`text-xs ${highContrast ? 'text-gray-300' : 'text-gray-400'}`}>
                  Harmonic Enhancement
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="microtonal"
                  checked={microtonal}
                  onChange={(e) => setMicrotonal(e.target.checked)}
                />
                <label htmlFor="microtonal" className={`text-xs ${highContrast ? 'text-gray-300' : 'text-gray-400'}`}>
                  Microtonal Tuning
                </label>
              </div>
            </div>
            
            {/* Audio Quality */}
            <div>
              <label className={`text-xs ${highContrast ? 'text-gray-300' : 'text-gray-400'} block mb-1`}>
                Audio Quality
              </label>
              <select
                value={audioQuality}
                onChange={(e) => setAudioQuality(e.target.value as 'low' | 'medium' | 'high')}
                className={`w-full p-2 rounded text-xs ${
                  highContrast 
                    ? 'bg-gray-800 text-white border-gray-600' 
                    : 'bg-gray-700 text-gray-300 border-gray-600'
                } border`}
              >
                <option value="low">Low (22kHz, Mono)</option>
                <option value="medium">Medium (44kHz, Stereo)</option>
                <option value="high">High (96kHz, Surround)</option>
              </select>
            </div>
            
            {/* Temperament System */}
            <div>
              <label className={`text-xs ${highContrast ? 'text-gray-300' : 'text-gray-400'} block mb-1`}>
                Tuning System
              </label>
              <select
                value={temperament}
                onChange={(e) => setTemperament(e.target.value as 'equal' | 'just' | 'pythagorean')}
                className={`w-full p-2 rounded text-xs ${
                  highContrast 
                    ? 'bg-gray-800 text-white border-gray-600' 
                    : 'bg-gray-700 text-gray-300 border-gray-600'
                } border`}
              >
                <option value="equal">Equal Temperament</option>
                <option value="just">Just Intonation</option>
                <option value="pythagorean">Pythagorean Tuning</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Status Indicators */}
      <div className={`flex items-center justify-between p-3 border-t text-xs ${
        highContrast ? 'border-white text-gray-300' : 'border-gray-700 text-gray-400'
      }`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
            <span>{isPlaying ? 'Active' : 'Inactive'}</span>
          </div>
          <div>Quality: {audioQuality.toUpperCase()}</div>
          <div>Profile: {currentProfile?.name || 'None'}</div>
        </div>
        
        <div className="flex items-center gap-1">
          <Speaker className="w-3 h-3" />
          <span>{Math.round(volume * 100)}%</span>
        </div>
      </div>
    </div>
  );
};

export default AudioVisualizer;