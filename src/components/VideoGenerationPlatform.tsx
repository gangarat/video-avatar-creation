import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Languages, Video, CheckCircle, Play, FileText, PenTool } from 'lucide-react';
import heroAvatar from '@/assets/hero-avatar.jpg';
import TextWritingArea from './TextWritingArea';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'active' | 'completed';
}

const VideoGenerationPlatform = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedScript, setUploadedScript] = useState<File | null>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [showTextWriter, setShowTextWriter] = useState(false);
  const [scriptFromWriter, setScriptFromWriter] = useState<any>(null);
  const [translatedScripts, setTranslatedScripts] = useState<Record<string, string>>({});
  const [audioFiles, setAudioFiles] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const steps: Step[] = [
    {
      id: 1,
      title: "Upload Script",
      description: "Upload your script or write text",
      icon: <FileText className="w-6 h-6" />,
      status: currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : 'pending'
    },
    {
      id: 2,
      title: "Select Languages",
      description: "Choose languages for translation",
      icon: <Languages className="w-6 h-6" />,
      status: currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : 'pending'
    },
    {
      id: 3,
      title: "Translate & Generate Audio",
      description: "Script translation and audio generation",
      icon: <Languages className="w-6 h-6" />,
      status: currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : 'pending'
    },
    {
      id: 4,
      title: "Avatar Sync",
      description: "Sync avatar with generated audio",
      icon: <Video className="w-6 h-6" />,
      status: currentStep === 4 ? 'active' : currentStep > 4 ? 'completed' : 'pending'
    },
    {
      id: 5,
      title: "Final Output",
      description: "Download your completed videos",
      icon: <CheckCircle className="w-6 h-6" />,
      status: currentStep === 5 ? 'active' : 'pending'
    }
  ];

  const languages = [
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu', flag: '🇮🇳' },
    { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
    { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
    { code: 'bn', name: 'Bengali', flag: '🇮🇳' },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedScript(file);
      setScriptFromWriter(null); // Clear text writer script
      setShowTextWriter(false); // Hide text writer
      setCurrentStep(2); // Move to language selection
      console.log('File uploaded, moving to step 2');
    }
  };

  const handleScriptFromWriter = (script: any) => {
    setScriptFromWriter(script);
    setUploadedScript(null); // Clear uploaded file
    setCurrentStep(2); // Move to language selection
    console.log('Script from writer, moving to step 2');
  };

  const proceedToTranslation = () => {
    if (selectedLanguages.length > 0) {
      setCurrentStep(3);
      setIsProcessing(true);
      console.log('Starting translation for languages:', selectedLanguages);
      // Simulate translation and audio generation
      setTimeout(() => {
        setCurrentStep(4);
        setTimeout(() => {
          setCurrentStep(5);
          setIsProcessing(false);
        }, 3000);
      }, 2000);
    }
  };

  const downloadVideo = (langCode: string, langName: string) => {
    // Create a mock video file blob
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create a simple video frame
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#16213e';
      ctx.fillRect(50, 50, canvas.width - 100, canvas.height - 100);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${langName} Avatar Video`, canvas.width / 2, canvas.height / 2 - 50);
      ctx.fillText(`Script: ${uploadedScript?.name || scriptFromWriter?.title || 'Generated Script'}`, canvas.width / 2, canvas.height / 2 + 50);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `avatar-video-${langCode}-${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    }
    
    console.log(`Downloaded video for ${langName} (${langCode})`);
  };

  const toggleLanguage = (langCode: string) => {
    setSelectedLanguages(prev => 
      prev.includes(langCode) 
        ? prev.filter(code => code !== langCode)
        : [...prev, langCode]
    );
  };


  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                  AI Video Generation
                  <span className="block bg-gradient-accent bg-clip-text text-transparent">
                    Platform
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Create localized avatar content automatically. Upload scripts, generate multi-language audio, 
                  and produce perfectly synchronized videos with HeyGen avatars.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button variant="hero" size="lg">
                  Get Started
                  <Play className="w-5 h-5 ml-2" />
                </Button>
                <Button variant="glass" size="lg">
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  HeyGen Integration
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  Sarvam AI Translation
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  Perfect Sync
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10">
                <img 
                  src={heroAvatar} 
                  alt="AI Avatar Technology" 
                  className="w-full h-auto rounded-2xl shadow-glow-primary animate-float"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-primary opacity-20 rounded-2xl blur-xl transform scale-110"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Three Simple Steps
            </h2>
            <p className="text-xl text-muted-foreground">
              From script to multilingual avatar videos in minutes
            </p>
          </div>

          {/* Debug indicator */}
          <div className="text-center mb-4">
            <span className="text-sm text-muted-foreground">Current Step: {currentStep}</span>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                    step.status === 'completed' 
                      ? 'bg-accent border-accent text-accent-foreground shadow-glow-accent' 
                      : step.status === 'active'
                      ? 'bg-primary border-primary text-primary-foreground shadow-glow-primary animate-pulse-glow'
                      : 'border-muted text-muted-foreground'
                  }`}>
                    {step.status === 'completed' ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-24 h-0.5 transition-all duration-300 ${
                      step.status === 'completed' ? 'bg-accent' : 'bg-muted'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="grid lg:grid-cols-1 gap-8">
            {/* Step 1: Script Upload */}
            {currentStep === 1 && (
              <Card className="p-8 bg-glass-bg backdrop-blur-glass border-glass-border">
                <div className="text-center space-y-6">
                  <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Upload Your Script</h3>
                    <p className="text-muted-foreground">
                      Upload your script file to sync with HeyGen Avatar ID: 73fde05ce8be49dcb37e1b532abd351a
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 hover:border-primary/50 transition-colors">
                      <input
                        type="file"
                        accept=".txt,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="script-upload"
                      />
                      <label htmlFor="script-upload" className="cursor-pointer">
                        <div className="space-y-4">
                          <Upload className="w-12 h-12 text-primary mx-auto" />
                          <div>
                            <p className="text-white font-medium">Click to upload script</p>
                            <p className="text-muted-foreground text-sm">Supports .txt, .doc, .docx files</p>
                          </div>
                        </div>
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-px bg-glass-border"></div>
                      <span className="text-muted-foreground text-sm">OR</span>
                      <div className="flex-1 h-px bg-glass-border"></div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full border-accent/50 text-accent hover:bg-accent/20"
                      onClick={() => setShowTextWriter(!showTextWriter)}
                    >
                      <PenTool className="w-4 h-4 mr-2" />
                      {showTextWriter ? 'Hide Text Writer' : 'Write Script Directly'}
                    </Button>
                  </div>
                  {(uploadedScript || scriptFromWriter) && (
                    <div className="bg-accent/20 border border-accent/50 rounded-lg p-4 mt-4">
                      <p className="text-accent font-medium">
                        ✓ {uploadedScript ? uploadedScript.name : scriptFromWriter?.title} ready for processing
                      </p>
                      <Button 
                        variant="accent" 
                        className="w-full mt-3"
                        onClick={() => setCurrentStep(2)}
                      >
                        Continue to Language Selection
                      </Button>
                    </div>
                  )}
                  
                  {showTextWriter && (
                    <div className="mt-6">
                      <TextWritingArea onScriptUpload={handleScriptFromWriter} />
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Step 2: Language Selection */}
            {currentStep === 2 && (
              <Card className="p-8 bg-glass-bg backdrop-blur-glass border-glass-border">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4">
                      <Languages className="w-8 h-8 text-accent" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Select Languages</h3>
                    <p className="text-muted-foreground">
                      Choose the languages for audio generation and translation
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => toggleLanguage(lang.code)}
                        className={`p-4 rounded-lg border transition-all duration-200 ${
                          selectedLanguages.includes(lang.code)
                            ? 'border-accent bg-accent/20 text-accent'
                            : 'border-glass-border bg-glass-bg text-white hover:border-accent/50'
                        }`}
                      >
                        <div className="text-2xl mb-2">{lang.flag}</div>
                        <div className="text-sm font-medium">{lang.name}</div>
                      </button>
                    ))}
                  </div>
                  {selectedLanguages.length > 0 && (
                    <div className="text-center">
                      <Button variant="accent" size="lg" onClick={proceedToTranslation}>
                        Start Translation & Audio Generation ({selectedLanguages.length} languages)
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Step 3: Translation & Audio Generation */}
            {currentStep === 3 && (
              <Card className="p-8 bg-glass-bg backdrop-blur-glass border-glass-border">
                <div className="text-center space-y-6">
                  <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
                    <Languages className="w-8 h-8 text-accent animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Translating Script & Generating Audio</h3>
                    <p className="text-muted-foreground">
                      Processing script translation and audio generation for {selectedLanguages.length} languages...
                    </p>
                  </div>
                  <div className="space-y-4">
                    {languages
                      .filter(lang => selectedLanguages.includes(lang.code))
                      .map((lang, index) => (
                        <div key={lang.code} className="bg-secondary/50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white flex items-center gap-2">
                              <span className="text-xl">{lang.flag}</span>
                              {lang.name} - Translation & Audio
                            </span>
                            <span className="text-accent">
                              {isProcessing ? `${Math.min(100, (index + 1) * 25)}%` : '100%'}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-accent h-2 rounded-full transition-all duration-500" 
                              style={{ width: isProcessing ? `${Math.min(100, (index + 1) * 25)}%` : '100%' }}
                            ></div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Step 4: Avatar Sync */}
            {currentStep === 4 && (
              <Card className="p-8 bg-glass-bg backdrop-blur-glass border-glass-border">
                <div className="text-center space-y-6">
                  <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                    <Video className="w-8 h-8 text-primary animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Syncing Avatar with Audio</h3>
                    <p className="text-muted-foreground">
                      Synchronizing HeyGen avatar with generated audio files...
                    </p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white">Avatar Synchronization</span>
                      <span className="text-primary">Processing...</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full w-[75%] animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Step 5: Final Output */}
            {currentStep === 5 && (
              <Card className="p-8 bg-glass-bg backdrop-blur-glass border-glass-border">
                <div className="text-center space-y-6">
                  <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Videos Ready!</h3>
                    <p className="text-muted-foreground">
                      Your multilingual avatar videos have been generated successfully.
                    </p>
                  </div>
                  <div className="grid gap-4">
                    {languages
                      .filter(lang => selectedLanguages.includes(lang.code))
                      .map((lang) => (
                        <div key={lang.code} className="bg-secondary/50 rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{lang.flag}</span>
                            <div className="text-left">
                              <p className="text-white font-medium">{lang.name} Video</p>
                              <p className="text-sm text-muted-foreground">Ready for download</p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-accent/50 text-accent hover:bg-accent/20"
                            onClick={() => downloadVideo(lang.code, lang.name)}
                          >
                            Download
                          </Button>
                        </div>
                      ))}
                  </div>
                  <Button variant="accent" size="lg" onClick={() => setCurrentStep(1)}>
                    Create New Video
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default VideoGenerationPlatform;