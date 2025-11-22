import React, { useState } from 'react';
import { GeneratedContent, Platform, Language } from '../types';
import { Copy, Download, RefreshCw, Loader2, Twitter, Linkedin, Instagram, Image as ImageIcon } from 'lucide-react';

interface PlatformCardProps {
  content: GeneratedContent;
  onRegenerateImage: (platform: Platform) => void;
  language: Language;
}

const getPlatformIcon = (platform: Platform) => {
  switch (platform) {
    case Platform.LINKEDIN: return <Linkedin size={20} className="text-[#0a66c2]" />;
    case Platform.TWITTER: return <Twitter size={20} className="text-white" />;
    case Platform.INSTAGRAM: return <Instagram size={20} className="text-[#E1306C]" />;
  }
};

const getPlatformColor = (platform: Platform) => {
    switch (platform) {
        case Platform.LINKEDIN: return "border-b-[#0a66c2]";
        case Platform.TWITTER: return "border-b-gray-400";
        case Platform.INSTAGRAM: return "border-b-[#E1306C]";
    }
}

export const PlatformCard: React.FC<PlatformCardProps> = ({ content, onRegenerateImage, language }) => {
  const [copied, setCopied] = useState(false);

  const t = {
    [Language.ENGLISH]: {
      copy: "Copy Text",
      copied: "Copied!",
      generating: "Generating High-Res Image...",
      failed: "Image generation failed",
      download: "Download Image",
      regenerate: "Regenerate Image",
      prompt: "Prompt"
    },
    [Language.TURKISH]: {
      copy: "Metni Kopyala",
      copied: "Kopyalandı!",
      generating: "Yüksek Çözünürlüklü Görsel Oluşturuluyor...",
      failed: "Görsel oluşturulamadı",
      download: "Görseli İndir",
      regenerate: "Görseli Yenile",
      prompt: "İstem"
    }
  };

  const strings = t[language];

  const handleCopy = () => {
    navigator.clipboard.writeText(content.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!content.imageUrl) return;
    const link = document.createElement('a');
    link.href = content.imageUrl;
    link.download = `${content.platform.toLowerCase().replace('/', '-')}-post.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700 flex flex-col h-full group hover:border-slate-600 transition-all duration-300">
      {/* Header */}
      <div className={`p-4 bg-slate-900/50 border-b border-slate-700 flex justify-between items-center ${getPlatformColor(content.platform)} border-b-2`}>
        <div className="flex items-center gap-2 font-semibold text-slate-200">
          {getPlatformIcon(content.platform)}
          <span>{content.platform}</span>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded-md transition-colors text-slate-300"
        >
          {copied ? strings.copied : <><Copy size={14} /> {strings.copy}</>}
        </button>
      </div>

      {/* Content Body */}
      <div className="p-4 flex-grow flex flex-col gap-4">
        {/* Text Area */}
        <div className="bg-slate-900/30 p-3 rounded-lg border border-slate-700/50 flex-grow min-h-[120px]">
          <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
            {content.text}
          </p>
        </div>

        {/* Image Area */}
        <div className="relative rounded-lg overflow-hidden bg-slate-900 aspect-video flex items-center justify-center border border-slate-700/50 group-hover:border-slate-600/80 transition-colors">
          {content.isImageLoading ? (
            <div className="flex flex-col items-center gap-2 text-indigo-400 animate-pulse">
              <Loader2 size={32} className="animate-spin" />
              <span className="text-xs font-medium text-center px-4">{strings.generating}</span>
            </div>
          ) : content.imageUrl ? (
            <div className="relative w-full h-full group/image">
              <img 
                src={content.imageUrl} 
                alt={`${content.platform} Generated`} 
                className="w-full h-full object-cover"
              />
              {/* Image Actions Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                 <button 
                    onClick={handleDownload}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all transform hover:scale-110"
                    title={strings.download}
                 >
                    <Download size={20} />
                 </button>
              </div>
            </div>
          ) : (
             <div className="flex flex-col items-center text-slate-500 gap-2">
                <ImageIcon size={32} />
                <span className="text-xs">{strings.failed}</span>
             </div>
          )}

          {/* Regenerate Image Button (Always visible if not loading) */}
          {!content.isImageLoading && (
             <button
               onClick={() => onRegenerateImage(content.platform)}
               className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-indigo-600 text-white rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
               title={strings.regenerate}
             >
               <RefreshCw size={14} />
             </button>
          )}
        </div>
        
        <div className="text-[10px] text-slate-500 truncate">
            {strings.prompt}: {content.imagePrompt}
        </div>
      </div>
    </div>
  );
};