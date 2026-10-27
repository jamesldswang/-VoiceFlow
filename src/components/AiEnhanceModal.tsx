import React, { useState } from 'react';
import { X, Sparkles, Copy, Check, Wand2, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface AiEnhanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawText: string;
  onApplyText: (newText: string) => void;
}

export const AiEnhanceModal: React.FC<AiEnhanceModalProps> = ({
  isOpen,
  onClose,
  rawText,
  onApplyText,
}) => {
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState('');
  const [activeTab, setActiveTab] = useState<'polish' | 'summary' | 'translate'>('polish');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunAi = async (action: 'polish' | 'summary' | 'translate') => {
    setActiveTab(action);
    setLoading(true);
    setErrorMsg(null);
    setResultText('');

    try {
      const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process as any).env?.GEMINI_API_KEY || '';
      const ai = new GoogleGenAI(apiKey ? { apiKey } : {});

      let systemPrompt = '';
      if (action === 'polish') {
        systemPrompt = '你是一個專業的語音文字編輯專家。請將以下由錄音辨識出來的逐字稿進行智慧排版：補齊合適的標點符號、去除口語贅字（如「那個」、「然後然後」）、修正錯別字，並保持說話者的原始原意與語氣。直接輸出整理後的文字即可，不需要額外說明。';
      } else if (action === 'summary') {
        systemPrompt = '請將以下語音逐字稿整理為精準的條列式重點摘要（Key Takeaways）與行動項目（Action Items）。直接輸出重點項目即可。';
      } else {
        systemPrompt = '請將以下內容翻譯成流暢自然的英文（English），保持語氣專業。直接輸出翻譯結果即可。';
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${systemPrompt}\n\n逐字稿內容：\n${rawText}`,
      });

      const output = response.text || '';
      setResultText(output.trim());
    } catch (err: any) {
      console.error('AI enhance error:', err);
      // Fallback local smart punctuation if API is unavailable or offline
      if (action === 'polish') {
        const fallback = rawText
          .replace(/\s+/g, '，')
          .replace(/(，)+/g, '，')
          .replace(/[，、]$/, '。');
        setResultText(fallback);
      } else {
        setErrorMsg('無法連接 AI 服務，已切換至本地基礎模式。');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (!resultText) return;
    onApplyText(resultText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl bg-zinc-900 p-6 text-white shadow-2xl ring-1 ring-zinc-800">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-100">AI 智慧潤飾與整理</h3>
            <p className="text-xs text-zinc-400">一鍵補全標點、口語贅字清理、重點條列</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex rounded-xl bg-zinc-950/60 p-1 border border-zinc-800/80 mb-4">
          <button
            onClick={() => handleRunAi('polish')}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
              activeTab === 'polish' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Wand2 className="h-3.5 w-3.5" />
            <span>標點潤飾與除贅字</span>
          </button>
          <button
            onClick={() => handleRunAi('summary')}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
              activeTab === 'summary' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>條列式重點</span>
          </button>
          <button
            onClick={() => handleRunAi('translate')}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
              activeTab === 'translate' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>英譯</span>
          </button>
        </div>

        {/* Raw Preview vs AI Result */}
        <div className="flex-1 overflow-y-auto space-y-3">
          <div className="rounded-xl bg-zinc-950/40 p-3 text-xs text-zinc-400 border border-zinc-800/60">
            <span className="font-semibold text-zinc-300">原始語音字稿：</span>
            <p className="mt-1 line-clamp-3 italic text-zinc-300">{rawText}</p>
          </div>

          <div className="min-h-[140px] rounded-xl bg-zinc-950/80 p-4 border border-indigo-900/40">
            {loading ? (
              <div className="flex h-32 flex-col items-center justify-center gap-2 text-xs text-indigo-300">
                <RefreshCw className="h-5 w-5 animate-spin text-indigo-400" />
                <span>Gemini 2.5 正在處理您的語音文字...</span>
              </div>
            ) : resultText ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-indigo-300">
                  <span className="font-medium">AI 潤飾結果：</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-zinc-400 hover:text-white transition"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">已複製</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>複製</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-sm leading-relaxed text-zinc-100 whitespace-pre-wrap select-text">
                  {resultText}
                </p>
              </div>
            ) : (
              <div className="flex h-32 flex-col items-center justify-center text-center text-xs text-zinc-500">
                點擊上方任一按鈕即可開始 AI 潤飾處理
              </div>
            )}
          </div>

          {errorMsg && <p className="text-xs text-rose-400">{errorMsg}</p>}
        </div>

        {/* Footer Actions */}
        <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-3 gap-2">
          <button
            onClick={() => handleRunAi(activeTab)}
            disabled={loading}
            className="flex items-center gap-1 rounded-xl bg-zinc-800 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-700 transition"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            <span>重新產生</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition"
            >
              取消
            </button>
            <button
              onClick={handleApply}
              disabled={!resultText}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition disabled:opacity-40"
            >
              套用至編輯器
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
