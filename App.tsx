import React, { useState, useEffect, useCallback } from 'react';
import { 
  Tone, 
  ImageSize, 
  AspectRatio, 
  Platform, 
  GenerationResult,
  Language 
} from './types';
import { generateSocialText, generateSocialImage, checkApiKey, requestApiKey } from './services/geminiService';
import { PlatformCard } from './components/PlatformCard';
import { SettingsPanel } from './components/SettingsPanel';
import { Sparkles, Wand2, Settings as SettingsIcon, AlertCircle, Layers, Zap, Globe } from 'lucide-react';

export default function App() {
  // -- State --
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState<Tone>(Tone.PROFESSIONAL);
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [apiKeyValid, setApiKeyValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [imageSize, setImageSize] = useState<ImageSize>(ImageSize.SIZE_1K);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.AUTO);

  // Results State
  const [results, setResults] = useState<GenerationResult | null>(null);

  // -- Translations --
  const translations = {
    [Language.ENGLISH]: {
      heroTitle: "What do you want to post about?",
      heroSubtitle: "We'll craft optimized content for every platform instantly.",
      placeholder: "e.g., Just launched a new feature that uses AI to organize photos...",
      generate: "Generate",
      drafting: "Drafting...",
      ready: "Ready to create content",
      connectApi: "Connect Gemini API",
      apiActive: "Gemini Pro Active",
      errorTopic: "Please enter a topic for your posts.",
      errorGen: "An error occurred during generation.",
      tones: {
          [Tone.PROFESSIONAL]: 'Professional',
          [Tone.WITTY]: 'Witty',
          [Tone.URGENT]: 'Urgent',
          [Tone.INSPIRATIONAL]: 'Inspirational',
          [Tone.CASUAL]: 'Casual'
      }
    },
    [Language.TURKISH]: {
      heroTitle: "Ne hakkında paylaşım yapmak istersiniz?",
      heroSubtitle: "Tüm platformlar için anında optimize edilmiş içerik oluşturacağız.",
      placeholder: "Örn. Fotoğrafları düzenlemek için yapay zeka kullanan yeni bir özellik yayınladık...",
      generate: "Oluştur",
      drafting: "Hazırlanıyor...",
      ready: "İçerik oluşturmaya hazır",
      connectApi: "Gemini API Bağla",
      apiActive: "Gemini Pro Aktif",
      errorTopic: "Lütfen gönderileriniz için bir konu girin.",
      errorGen: "Oluşturma sırasında bir hata oluştu.",
      tones: {
          [Tone.PROFESSIONAL]: 'Profesyonel',
          [Tone.WITTY]: 'Esprili',
          [Tone.URGENT]: 'Acil',
          [Tone.INSPIRATIONAL]: 'İlham Verici',
          [Tone.CASUAL]: 'Günlük'
      }
    }
  };

  const t = translations[language];

  // -- Effects --
  useEffect(() => {
    const initKey = async () => {
      const valid = await checkApiKey();
      setApiKeyValid(valid);
    };
    initKey();
  }, []);

  // -- Handlers --
  
  const handleApiKeySelect = async () => {
    try {
      await requestApiKey();
      setApiKeyValid(true); 
      setError(null);
    } catch (e) {
      console.error(e);
      setError("Failed to select API Key. Please try again.");
    }
  };

  const handleGenerate = async () => {
    if (!apiKeyValid) {
        await handleApiKeySelect();
    }

    if (!topic.trim()) {
      setError(t.errorTopic);
      return;
    }

    setIsLoadingText(true);
    setError(null);
    setResults(null);

    try {
      // 1. Generate Text
      const textResponse = await generateSocialText(topic, tone, language);
      
      // 2. Set initial state with text and loading images
      const initialResults: GenerationResult = {
        linkedin: {
          platform: Platform.LINKEDIN,
          text: textResponse.linkedin.content,
          imagePrompt: textResponse.linkedin.imagePrompt,
          isImageLoading: true
        },
        twitter: {
          platform: Platform.TWITTER,
          text: textResponse.twitter.content,
          imagePrompt: textResponse.twitter.imagePrompt,
          isImageLoading: true
        },
        instagram: {
          platform: Platform.INSTAGRAM,
          text: textResponse.instagram.content,
          imagePrompt: textResponse.instagram.imagePrompt,
          isImageLoading: true
        }
      };

      setResults(initialResults);
      setIsLoadingText(false);

      // 3. Trigger Image Generation (Parallel)
      generateImageForPlatform(Platform.LINKEDIN, textResponse.linkedin.imagePrompt, initialResults);
      generateImageForPlatform(Platform.TWITTER, textResponse.twitter.imagePrompt, initialResults);
      generateImageForPlatform(Platform.INSTAGRAM, textResponse.instagram.imagePrompt, initialResults);

    } catch (e: any) {
      console.error(e);
      setError(t.errorGen);
      setIsLoadingText(false);
    }
  };

  const generateImageForPlatform = async (
    platform: Platform, 
    prompt: string, 
    currentResults: GenerationResult
  ) => {
    try {
      const imageUrl = await generateSocialImage(prompt, platform, imageSize, aspectRatio);
      
      setResults(prev => {
        if (!prev) return null;
        const key = platform === Platform.LINKEDIN ? 'linkedin' : 
                    platform === Platform.TWITTER ? 'twitter' : 'instagram';
        
        return {
          ...prev,
          [key]: {
            ...prev[key],
            imageUrl,
            isImageLoading: false
          }
        };
      });
    } catch (e) {
      console.error(`Image gen failed for ${platform}`, e);
      setResults(prev => {
        if (!prev) return null;
        const key = platform === Platform.LINKEDIN ? 'linkedin' : 
                    platform === Platform.TWITTER ? 'twitter' : 'instagram';
        return {
          ...prev,
          [key]: {
            ...prev[key],
            isImageLoading: false // Stop loading even if failed
          }
        };
      });
    }
  };

  const handleRegenerateImage = (platform: Platform) => {
    if (!results) return;
    
    // Set loading state
    const key = platform === Platform.LINKEDIN ? 'linkedin' : 
                platform === Platform.TWITTER ? 'twitter' : 'instagram';
    
    const prompt = results[key].imagePrompt;
    
    setResults(prev => {
       if (!prev) return null;
       return {
         ...prev,
         [key]: { ...prev[key], isImageLoading: true }
       };
    });

    // Retrigger generation
    generateImageForPlatform(platform, prompt, results);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400">
            <Sparkles size={24} className="text-indigo-500" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              SocialGenius AI
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {!apiKeyValid && (
               <button 
                 onClick={handleApiKeySelect}
                 className="text-xs bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-full hover:bg-amber-500/20 transition-colors flex items-center gap-2"
               >
                 <AlertCircle size={14} />
                 {t.connectApi}
               </button>
            )}
            {apiKeyValid && (
               <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full flex items-center gap-2">
                 <Zap size={14} fill="currentColor" />
                 {t.apiActive}
               </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8 space-y-8">
        
        {/* Hero / Input Section */}
        <section className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2 mb-8">
             <h2 className="text-3xl md:text-4xl font-bold text-white">{t.heroTitle}</h2>
             <p className="text-slate-400">{t.heroSubtitle}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1 shadow-xl">
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t.placeholder}
              className="w-full bg-transparent text-lg p-6 text-white placeholder-slate-500 focus:outline-none resize-none min-h-[120px]"
            />
            <div className="px-4 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-slate-800 pt-4">
              {/* Controls Left */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
                   {Object.values(Tone).map((toneValue) => (
                     <button
                       key={toneValue}
                       onClick={() => setTone(toneValue)}
                       className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                         tone === toneValue 
                           ? 'bg-indigo-600 text-white shadow-md' 
                           : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                       }`}
                     >
                       {t.tones[toneValue]}
                     </button>
                   ))}
                </div>

                <div className="w-px h-6 bg-slate-700 mx-1 hidden md:block"></div>

                {/* Language Selector */}
                <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
                   {Object.values(Language).map((l) => (
                     <button
                       key={l}
                       onClick={() => setLanguage(l)}
                       className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                         language === l 
                           ? 'bg-indigo-600 text-white shadow-md' 
                           : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                       }`}
                     >
                        {l === Language.ENGLISH ? (
                            <><span>🇺🇸</span> EN</>
                        ) : (
                            <><span>🇹🇷</span> TR</>
                        )}
                     </button>
                   ))}
                </div>
              </div>

              {/* Controls Right */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors relative group"
                  title={t.settingsTitle || "Settings"}
                >
                  <SettingsIcon size={20} />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                  </span>
                </button>

                <button
                  onClick={handleGenerate}
                  disabled={isLoadingText || !topic.trim()}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white shadow-lg shadow-indigo-900/20 transition-all transform hover:scale-105 active:scale-95 ${
                    isLoadingText 
                      ? 'bg-slate-700 cursor-not-allowed opacity-70' 
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'
                  }`}
                >
                  {isLoadingText ? (
                    <>
                      <Layers className="animate-spin" size={18} />
                      {t.drafting}
                    </>
                  ) : (
                    <>
                      <Wand2 size={18} />
                      {t.generate}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </section>

        {/* Settings Modal */}
        <SettingsPanel 
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          imageSize={imageSize}
          setImageSize={setImageSize}
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
          language={language}
        />

        {/* Results Grid */}
        {results && (
           <section className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
             <PlatformCard 
                content={results.linkedin} 
                onRegenerateImage={handleRegenerateImage} 
                language={language}
             />
             <PlatformCard 
                content={results.twitter} 
                onRegenerateImage={handleRegenerateImage} 
                language={language}
             />
             <PlatformCard 
                content={results.instagram} 
                onRegenerateImage={handleRegenerateImage} 
                language={language}
             />
           </section>
        )}
        
        {/* Empty State / Placeholder */}
        {!results && !isLoadingText && (
           <div className="text-center py-20 opacity-20 select-none">
              <Layers size={64} className="mx-auto mb-4" />
              <p className="text-xl font-medium">
                  {t.ready}
              </p>
           </div>
        )}

      </main>
    </div>
  );
}