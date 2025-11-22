import React from 'react';
import { AspectRatio, ImageSize, Language } from '../types';
import { Settings, X } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  imageSize: ImageSize;
  setImageSize: (size: ImageSize) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  language: Language;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  imageSize,
  setImageSize,
  aspectRatio,
  setAspectRatio,
  language
}) => {
  if (!isOpen) return null;

  const t = {
    [Language.ENGLISH]: {
        title: "Generation Settings",
        resolution: "Image Resolution (Gemini 3 Pro)",
        resolutionDesc: "Higher resolutions may take longer to generate.",
        ratio: "Aspect Ratio Preference",
        ratioDesc: "\"Auto\" selects the optimal ratio for each platform automatically.",
        done: "Done"
    },
    [Language.TURKISH]: {
        title: "Oluşturma Ayarları",
        resolution: "Görsel Çözünürlüğü (Gemini 3 Pro)",
        resolutionDesc: "Yüksek çözünürlüklerin oluşturulması daha uzun sürebilir.",
        ratio: "En Boy Oranı Tercihi",
        ratioDesc: "\"Otomatik\" her platform için en uygun oranı otomatik olarak seçer.",
        done: "Tamam"
    }
  };

  const strings = t[language];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-indigo-400">
            <Settings size={20} />
            <h2 className="text-xl font-bold text-white">{strings.title}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Image Size */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              {strings.resolution}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(ImageSize).map((size) => (
                <button
                  key={size}
                  onClick={() => setImageSize(size)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    imageSize === size
                      ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-400/50'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {strings.resolutionDesc}
            </p>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              {strings.ratio}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(AspectRatio).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-2 py-2 rounded-lg text-xs font-semibold transition-all truncate ${
                    aspectRatio === ratio
                      ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400/50'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {ratio === AspectRatio.AUTO && language === Language.TURKISH ? 'Otomatik' : ratio}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {strings.ratioDesc}
            </p>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
          >
            {strings.done}
          </button>
        </div>
      </div>
    </div>
  );
};