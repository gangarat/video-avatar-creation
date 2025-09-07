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

  const steps: Step[] = [
    {
      id: 1,
      title: "Upload Script",
      description: "Upload your script to sync with HeyGen Avatar",
      icon: <FileText className="w-6 h-6" />,
      status: currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : 'pending'
    },
    {
      id: 2,
      title: "Generate Audio",
      description: "Audio generated across all selected languages",
      icon: <Languages className="w-6 h-6" />,
      status: currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : 'pending'
    },
    {
      id: 3,
      title: "Final Output",
      description: "Video and audio sync generation complete",
      icon: <Video className="w-6 h-6" />,
      status: currentStep === 3 ? 'active' : 'pending'
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
      setCurrentStep(2);
    }
  };

  const handleScriptFromWriter = (script: any) => {
    setScriptFromWriter(script);
    setCurrentStep(2);
  };

  const toggleLanguage = (langCode: string) => {
    setSelectedLanguages(prev => 
      prev.includes(langCode) 
        ? prev.filter(code => code !== langCode)
        : [...prev, langCode]
    );
  };

  const startGeneration = () => {
    if (selectedLanguages.length > 0) {
      setCurrentStep(3);
      // Here you would integrate with HeyGen and Sarvam APIs
    }
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
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <p className="text-white">
                        ✓ {uploadedScript ? uploadedScript.name : scriptFromWriter?.title} ready for processing
                      </p>
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
                      <Button variant="accent" size="lg" onClick={startGeneration}>
                        Generate Videos ({selectedLanguages.length} languages)
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Step 3: Generation Progress */}
            {currentStep === 3 && (
              <Card className="p-8 bg-glass-bg backdrop-blur-glass border-glass-border">
                <div className="text-center space-y-6">
                  <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
                    <Video className="w-8 h-8 text-accent animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Generating Videos</h3>
                    <p className="text-muted-foreground">
                      Creating synchronized avatar videos in {selectedLanguages.length} languages...
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white">Audio Translation</span>
                        <span className="text-accent">100%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-accent h-2 rounded-full w-full"></div>
                      </div>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white">Avatar Sync</span>
                        <span className="text-accent">85%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-accent h-2 rounded-full w-[85%]"></div>
                      </div>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white">Video Rendering</span>
                        <span className="text-primary">60%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full w-[60%]"></div>
                      </div>
                    </div>
                  </div>
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