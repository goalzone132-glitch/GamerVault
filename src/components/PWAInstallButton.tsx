import React, { useMemo, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Smartphone,
  X,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Squad } from '../types';
import { copyToClipboard } from '../utils/storage';
import { generateStandaloneHtml } from '../utils/standaloneHtml';
import { trackEvent } from '../utils/analytics';

interface PWAInstallButtonProps {
  squads: Squad[];
  onToast?: (msg: string, isWarning?: boolean) => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  squads,
  onToast,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isInAppBrowser = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    return /FBAN|FBAV|Instagram|Messenger|WhatsApp|Line|MicroMessenger|wv/i.test(
      ua
    );
  }, []);

  if (isInstalled) {
    return null;
  }

  const handlePrimaryClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        onToast?.('GamerVault installed on your device!');
        return;
      }
    }
    setShowGuide(true);
  };

  const handleDownloadOfflineHtml = () => {
    try {
      const html = generateStandaloneHtml(squads);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'GamerVault.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.setTimeout(() => URL.revokeObjectURL(url), 4000);
      trackEvent('html_downloaded', { squad_count: squads.length });
      onToast?.('Downloading GamerVault.html (includes your saved squads)!');
      setShowGuide(false);
    } catch {
      onToast?.('Download blocked by browser. Try opening in Chrome.', true);
    }
  };

  const handleCopyUrl = async () => {
    const ok = await copyToClipboard(window.location.href);
    if (ok) {
      setCopiedLink(true);
      trackEvent('app_link_copied');
      onToast?.('Link copied! Paste in Chrome or Safari to install.');
      window.setTimeout(() => setCopiedLink(false), 1500);
    } else {
      onToast?.('Could not copy link', true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handlePrimaryClick}
        className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-lg border border-cyan-500/40 bg-cyan-500/15 hover:bg-cyan-500/25 text-xs font-semibold text-cyan-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
      >
        <Download className="w-3.5 h-3.5 text-cyan-300" />
        <span>Install / Download</span>
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowGuide(false);
          }}
        >
          <div className="w-full max-w-md bg-[#101626] border border-slate-800 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-slate-100">
                  Get GamerVault on Device
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="Close modal"
                className="min-w-[40px] min-h-[40px] rounded-lg text-slate-400 hover:text-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isInAppBrowser && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 leading-relaxed">
                You opened this link inside Messenger / WhatsApp / Facebook
                browser. Tap the top-right menu (<strong>⋮</strong>) and choose{' '}
                <strong>Open in Chrome</strong> or <strong>Safari</strong> to
                install directly.
              </div>
            )}

            {/* Option 1: Browser Home Screen Install */}
            <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-cyan-300">
                Option 1: Install as Mobile / PC App (No Play Store needed)
              </div>
              {isIOS ? (
                <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>
                    Open this link in <strong>Safari</strong>.
                  </li>
                  <li>
                    Tap the <strong>Share</strong> icon at the bottom/top bar.
                  </li>
                  <li>
                    Tap <strong>Add to Home Screen</strong> &rarr;{' '}
                    <strong>Add</strong>.
                  </li>
                </ol>
              ) : (
                <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>
                    Open this link in <strong>Google Chrome</strong> or{' '}
                    <strong>Edge</strong>.
                  </li>
                  <li>
                    Tap the top-right browser menu (<strong>⋮</strong>).
                  </li>
                  <li>
                    Tap <strong>Install app</strong> or{' '}
                    <strong>Add to Home screen</strong>.
                  </li>
                </ol>
              )}
              <button
                type="button"
                onClick={handleCopyUrl}
                className="mt-2 w-full inline-flex items-center justify-center gap-2 min-h-[40px] px-3 py-2 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-xs font-medium text-slate-200 cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Copy App Link to Open in Chrome</span>
                  </>
                )}
              </button>
            </div>

            {/* Option 2: Direct Single-File Download */}
            <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-2.5">
              <div className="text-xs font-semibold text-cyan-300">
                Option 2: Direct Offline File Download
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Download a single offline{' '}
                <span className="font-mono text-slate-200">GamerVault.html</span>{' '}
                file (with all your squads inside) to open anytime from your
                phone&apos;s Downloads folder.
              </p>
              <button
                type="button"
                onClick={handleDownloadOfflineHtml}
                className="w-full inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs sm:text-sm font-bold cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download GamerVault.html</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
