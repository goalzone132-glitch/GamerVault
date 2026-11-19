import React, { useMemo, useState } from 'react';
import { Check, Copy, Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { copyToClipboard } from '../utils/storage';
import { trackEvent } from '../utils/analytics';

interface PWAInstallButtonProps {
  onToast?: (msg: string, isWarning?: boolean) => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
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
        onToast?.('GamerVault installed! Check your Home Screen for the App Icon.');
        return;
      }
    }
    setShowGuide(true);
  };

  const handleCopyUrl = async () => {
    const ok = await copyToClipboard(window.location.href);
    if (ok) {
      setCopiedLink(true);
      trackEvent('app_link_copied');
      onToast?.('Link copied! Open in Chrome or Safari to install App Icon.');
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
        <span>Install App</span>
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
                  Install GamerVault App Icon
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
                browser. Tap the top-right menu (<strong>⋮</strong>) &rarr;{' '}
                <strong>Open in Chrome</strong> or <strong>Safari</strong> to
                install the App Icon on your phone.
              </div>
            )}

            <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-2.5">
              <div className="text-xs font-semibold text-cyan-300">
                {isIOS
                  ? 'Add GamerVault Icon on iPhone / iPad'
                  : 'Install GamerVault App Icon (Android / PC)'}
              </div>
              {isIOS ? (
                <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>
                    Open this link in <strong>Safari</strong>.
                  </li>
                  <li>
                    Tap the <strong>Share</strong> icon in the toolbar.
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
                    <strong>Add to Home screen</strong> &rarr;{' '}
                    <strong>Install</strong>.
                  </li>
                </ol>
              )}
              <p className="text-[11px] text-slate-400 pt-1">
                This installs GamerVault directly on your Home Screen with its
                App Icon — no HTML file download needed.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleCopyUrl}
                className="flex-1 inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs sm:text-sm font-semibold cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Link for Chrome / Safari</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="min-h-[44px] px-4 py-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs sm:text-sm font-medium text-slate-300 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
