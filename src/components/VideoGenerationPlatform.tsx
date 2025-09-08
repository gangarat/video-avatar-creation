import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Languages, Video, CheckCircle, Play, FileText, PenTool } from 'lucide-react';
import heroAvatar from '@/assets/hero-avatar.jpg';
import TextWritingArea from './TextWritingArea';
import { supabase } from '@/integrations/supabase/client';

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
  const [baseScriptText, setBaseScriptText] = useState<string>('');

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedScript(file);
      setScriptFromWriter(null);
      setShowTextWriter(false);
      try {
        const text = await file.text();
        setBaseScriptText(text);
      } catch (e) {
        console.error('Failed to read file text', e);
      }
      setCurrentStep(2);
      console.log('File uploaded, moving to step 2');
    }
  };

  const handleScriptFromWriter = (script: any) => {
    setScriptFromWriter(script);
    setUploadedScript(null);
    setBaseScriptText(script?.content || '');
    setCurrentStep(2);
    console.log('Script from writer, moving to step 2');
  };

  const proceedToTranslation = async () => {
    if (selectedLanguages.length > 0) {
      setIsProcessing(true);
      try {
        const text = baseScriptText || scriptFromWriter?.content || '';
        const { data, error } = await supabase.functions.invoke('sarvam-translate', {
          body: { text, target_langs: selectedLanguages },
        });
        if (error) throw error;
        setTranslatedScripts(data?.translations || {});
        setIsProcessing(false);
      } catch (e) {
        console.error('Translation failed', e);
        setIsProcessing(false);
      }
    }
  };

  const proceedToAudioGeneration = async () => {
    setCurrentStep(3);
    setIsProcessing(true);
    try {
      const audioResults = await Promise.all(
        selectedLanguages.map(async (code) => {
          const t = translatedScripts[code] || baseScriptText || scriptFromWriter?.content || '';
          const { data: ttsData, error: ttsError } = await supabase.functions.invoke('sarvam-tts', {
            body: { text: t, lang: code },
          });
          if (ttsError) throw ttsError;
          const uri = `data:${ttsData?.contentType || 'audio/wav'};base64,${ttsData?.audioBase64}`;
          return [code, uri] as const;
        })
      );
      const audioMap: Record<string, string> = {};
      audioResults.forEach(([code, uri]) => { audioMap[code] = uri; });
      setAudioFiles(audioMap);

      setTimeout(() => {
        setCurrentStep(4);
        setIsProcessing(false);
      }, 1000);
    } catch (e) {
      console.error('Audio generation failed', e);
      setIsProcessing(false);
    }
  };

  const downloadVideo = (langCode: string, langName: string) => {
    // Placeholder until HeyGen integration is fully wired with public audio URLs
    alert('Video download requires HeyGen integration with public audio URLs. Coming next!');
  };

  const downloadTranslation = (langCode: string, langName: string) => {
    const text = translatedScripts[langCode] || baseScriptText || '';
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translation-${langCode}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAudio = (langCode: string, langName: string) => {
    const uri = audioFiles[langCode];
    if (!uri) return;
    const a = document.createElement('a');
    a.href = uri;
    a.download = `audio-${langCode}-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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

            {/* Step 2: Language Selection & Translation */}
            {currentStep === 2 && (
              <Card className="p-8 bg-glass-bg backdrop-blur-glass border-glass-border">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4">
                      <Languages className="w-8 h-8 text-accent" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Select Languages & Translate</h3>
                    <p className="text-muted-foreground">
                      Choose the languages for translation and download translated scripts
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {languages.map((lang) => (
                      <div
                        key={lang.code}
                        className={`p-4 rounded-lg border transition-all duration-200 ${
                          selectedLanguages.includes(lang.code)
                            ? 'border-accent bg-accent/20 text-accent'
                            : 'border-glass-border bg-glass-bg text-white'
                        }`}
                      >
                        <button
                          onClick={() => toggleLanguage(lang.code)}
                          className="w-full text-left"
                        >
                          <div className="text-2xl mb-2">{lang.flag}</div>
                          <div className="text-sm font-medium">{lang.name}</div>
                        </button>
                        {selectedLanguages.includes(lang.code) && translatedScripts[lang.code] && (
                          <div className="mt-3">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => downloadTranslation(lang.code, lang.name)}
                            >
                              Download Translation
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {selectedLanguages.length > 0 && Object.keys(translatedScripts).length === 0 && (
                    <div className="text-center">
                      <Button variant="accent" size="lg" onClick={proceedToTranslation}>
                        Start Translation ({selectedLanguages.length} languages)
                      </Button>
                    </div>
                  )}
                  {Object.keys(translatedScripts).length > 0 && (
                    <div className="text-center">
                      <Button variant="accent" size="lg" onClick={() => setCurrentStep(3)}>
                        Continue to Audio Generation
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Step 3: Audio Generation */}
            {currentStep === 3 && (
              <Card className="p-8 bg-glass-bg backdrop-blur-glass border-glass-border">
                <div className="text-center space-y-6">
                  <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
                    <Languages className="w-8 h-8 text-accent animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Generating Audio</h3>
                    <p className="text-muted-foreground">
                      Creating audio files from translated scripts for {selectedLanguages.length} languages...
                    </p>
                  </div>
                  {!isProcessing && Object.keys(audioFiles).length === 0 && (
                    <Button variant="accent" size="lg" onClick={proceedToAudioGeneration}>
                      Start Audio Generation
                    </Button>
                  )}
                  <div className="space-y-4">
                    {languages
                      .filter(lang => selectedLanguages.includes(lang.code))
                      .map((lang, index) => (
                        <div key={lang.code} className="bg-secondary/50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white flex items-center gap-2">
                              <span className="text-xl">{lang.flag}</span>
                              {lang.name} - Audio Generation
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
                           {audioFiles[lang.code] && (
                             <div className="mt-3">
                               <Button 
                                 variant="outline" 
                                 size="sm" 
                                 className="w-full"
                                 onClick={() => downloadAudio(lang.code, lang.name)}
                               >
                                 Download Audio
                               </Button>
                             </div>
                           )}
                         </div>
                       ))}
                   </div>
                   {Object.keys(audioFiles).length > 0 && Object.keys(audioFiles).length === selectedLanguages.length && (
                     <div className="text-center">
                       <Button variant="accent" size="lg" onClick={() => setCurrentStep(4)}>
                         Continue to Avatar Sync
                       </Button>
                     </div>
                   )}
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
                              <p className="text-white font-medium">{lang.name}</p>
                              <p className="text-sm text-muted-foreground">Translations and audio ready</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-accent/50 text-accent hover:bg-accent/20"
                              onClick={() => downloadTranslation(lang.code, lang.name)}
                            >
                              Download Translation
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-accent/50 text-accent hover:bg-accent/20"
                              onClick={() => downloadAudio(lang.code, lang.name)}
                              disabled={!audioFiles[lang.code]}
                            >
                              Download Audio
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-primary/50 text-primary hover:bg-primary/20"
                              onClick={() => downloadVideo(lang.code, lang.name)}
                            >
                              Download Video
                            </Button>
                          </div>
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