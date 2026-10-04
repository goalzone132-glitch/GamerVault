import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { copyToClipboard } from '../utils/storage';

interface CopyButtonProps {
  getValue: () => string;
  label: string;
  onToast: (message: string, isWarning?: boolean) => void;
  variant?: 'icon' | 'button' | 'compact';
  buttonText?: string;
  className?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  getValue,
  label,
  onToast,
  variant = 'icon',
  buttonText,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const raw = getValue().trim();
    if (!raw) {
      onToast(`No ${label.toLowerCase()} entered yet`, true);
      return;
    }

    const ok = await copyToClipboard(raw);
    if (!ok) {
      onToast('Clipboard access blocked. Please select and copy manually.', true);
      return;
    }

    setCopied(true);
    onToast(`${label} copied!`);
    window.setTimeout(() => {
      setCopied(false);
    }, 1100);
  };

  if (variant === 'button' || variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copy ${label}`}
        className={`inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 rounded-lg font-medium transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400 ${
          variant === 'compact'
            ? 'min-h-[40px] px-3 py-1.5 text-xs'
            : 'min-h-[44px] px-4 py-2 text-sm'
        } ${
          copied
            ? 'bg-cyan-400 text-slate-950 font-semibold'
            : 'bg-slate-800/90 hover:bg-slate-800 text-slate-100 border border-slate-700/80 hover:border-cyan-400/60'
        } ${className}`}
      >
        {copied ? (
          <Check className="w-4 h-4 shrink-0" />
        ) : (
          <Copy className="w-4 h-4 shrink-0 text-cyan-400" />
        )}
        <span>{copied ? 'Copied!' : buttonText || `Copy ${label}`}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`Copy ${label}`}
      aria-label={`Copy ${label}`}
      className={`min-w-[44px] min-h-[44px] shrink-0 rounded-lg border flex items-center justify-center transition-colors duration-150 cursor-pointer active:scale-95 focus-visible:outline-2 focus-visible:outline-cyan-400 ${
        copied
          ? 'bg-cyan-400 border-cyan-300 text-slate-950'
          : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400'
      } ${className}`}
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </button>
  );
};
