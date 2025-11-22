import React from 'react';
import { AspectRatio, ImageSize } from '../types';
import { Settings, X } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  imageSize: ImageSize;
  setImageSize: (size: ImageSize) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  imageSize,
  setImageSize,
  aspectRatio,
  setAspectRatio
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-indigo-400">
            <Settings size={20} />
            <h2 className="text-xl font-bold text-white">Generation Settings</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Image Size */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Image Resolution (Gemini 3 Pro)
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
              Higher resolutions may take longer to generate.
            </p>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Aspect Ratio Preference
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
                  {ratio}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              "Auto" selects the optimal ratio for each platform automatically.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
