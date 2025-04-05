import React, { useState, useEffect } from 'react';
import { FiCopy, FiVolume2, FiCheck } from 'react-icons/fi';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup'; // for HTML


const convertMarkdownToHTML = (text) => {
  const segments = text.split(/(```[\s\S]*?(?:```|$))/g);
  let formattedText = '';

  segments.forEach((segment) => {
    if (segment.startsWith('```')) {
      const codeMatch = segment.match(/```(\w+)?\n([\s\S]*?)(?:```|$)/);
      if (codeMatch) {
        const lang = codeMatch[1] || '';
        const code = codeMatch[2];
        const languageClass = lang ? `language-${lang}` : '';

        const formattedCode = code
          .split('\n')
          .map(line => line.trimEnd())
          .join('\n')
          .trim();

        const highlightedCode = Prism.highlight(
          formattedCode,
          Prism.languages[lang] || Prism.languages.markup,
          lang
        );

        formattedText += `
          <div class="relative my-4 group">
            <pre class="!bg-slate-800/50 !rounded-xl p-4 !text-sm border border-slate-700/50 backdrop-blur-sm overflow-auto whitespace-pre font-mono">
              <code class="${languageClass}">${highlightedCode}</code>
            </pre>
            <button class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-slate-700/50 hover:bg-purple-500/20 border border-slate-700/50">
              <FiCopy class="w-4 h-4 text-slate-300" />
            </button>
          </div>
        `;
      } else {
        formattedText += segment;
      }
    } else {
      let processedSegment = segment
        .replace(/^### (.*)$/gm, '<h3 class="text-xl font-semibold mb-3">$1</h3>')
        .replace(/^## (.*)$/gm, '<h2 class="text-2xl font-bold mb-4">$1</h2>')
        .replace(/^# (.*)$/gm, '<h1 class="text-3xl font-bold mb-6">$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        .replace(/^\* (.+)$/gm, '<ul class="list-disc pl-6 my-3"><li>$1</li></ul>')
        .replace(/^\d+\. (.+)$/gm, '<ol class="list-decimal pl-6 my-3"><li>$1</li></ol>')
        .replace(/\n/g, '<br />');

      formattedText += processedSegment;
    }
  });

  return formattedText;
};

const Response = ({ data, type }) => {
  const [showResponse, setShowResponse] = useState(false);
  const [finalData, setFinalData] = useState('');
  const [thinkData, setThinkData] = useState('');
  const [copied, setCopied] = useState(false);

  // 1️⃣ Extract <think> blocks and set finalData
  useEffect(() => {
    let thinkContent = '';
    let cleanedData = data;

    const thinkStart = data.indexOf('<think>');
    if (thinkStart !== -1) {
      const thinkEnd = data.indexOf('</think>');
      thinkContent = thinkEnd !== -1
        ? data.slice(thinkStart + 7, thinkEnd)
        : data.slice(thinkStart + 7);
      cleanedData = thinkEnd !== -1
        ? data.slice(0, thinkStart) + data.slice(thinkEnd + 8)
        : data.slice(0, thinkStart);
    }

    setThinkData(convertMarkdownToHTML(thinkContent));
    setFinalData(cleanedData);
    setShowResponse(Boolean(cleanedData));
  }, [data]);

  // 2️⃣ Highlight with Prism
  useEffect(() => {
    if (showResponse) {
      Prism.highlightAll();
    }
  }, [showResponse, finalData]);

  // 3️⃣ Inject “Preview” buttons for HTML blocks
  useEffect(() => {
    if (!showResponse) return;

    document.querySelectorAll('pre code.language-html').forEach(codeBlock => {
      const wrapper = codeBlock.parentElement;
      if (wrapper.querySelector('.preview-btn')) return;

      const btn = document.createElement('button');
      btn.textContent = 'Preview';
      btn.className = `
        preview-btn
        absolute top-3 left-3
        bg-green-600/30 hover:bg-green-600/50
        text-xs text-white font-medium
        px-2 py-1 rounded
        transition
      `;
      btn.onclick = () => {
        const html = codeBlock.textContent;
        const previewWindow = window.open();
        previewWindow.document.open();
        previewWindow.document.write(html);
        previewWindow.document.close();
      };

      wrapper.style.position = 'relative';
      wrapper.appendChild(btn);
    });
  }, [showResponse, finalData]);

  const handleCopy = async (text) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(finalData);
    speechSynthesis.speak(utterance);
  };

  return (
    <div className={`relative ${type === 'query' ? 'text-right' : 'text-left'}`}>
      {type === 'query' ? (
        <div className="inline-block bg-slate-800/50 backdrop-blur-sm px-5 py-3 rounded-2xl border border-slate-700/50 shadow-lg">
          <div className="text-slate-200 text-base font-medium tracking-wide">
            {data}
          </div>
        </div>
      ) : (
        <>
          {(thinkData || data.includes('<think>')) && (
            <div className="mb-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
              <div className="text-sm text-purple-400/80 font-medium mb-2 flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                <span>Thinking Process</span>
              </div>
              <div
                className="text-slate-300/80 text-sm leading-relaxed prose prose-invert"
                dangerouslySetInnerHTML={{ __html: thinkData || 'Analyzing request...' }}
              />
            </div>
          )}

          <div className="prose prose-invert max-w-none">
            {showResponse ? (
              <div
                className="text-slate-200 leading-relaxed tracking-wide"
                dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(finalData) }}
              />
            ) : (
              !data.includes('<think>') && (
                <div className="flex items-center space-x-3 text-slate-400">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200" />
                  </div>
                  <span className="text-sm font-medium">Analyzing request...</span>
                </div>
              )
            )}
          </div>

          {type !== 'query' && showResponse && (
            <div className="absolute -right-8 top-0 flex flex-col gap-2 opacity-0 hover:opacity-100 transition-opacity">
              <button
                onClick={handleSpeak}
                className="p-2 rounded-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:bg-purple-500/20 transition-colors"
                aria-label="Read aloud"
              >
                <FiVolume2 className="w-4 h-4 text-slate-300" />
              </button>
              <button
                onClick={() => handleCopy(finalData)}
                className="p-2 rounded-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:bg-purple-500/20 transition-colors relative"
                aria-label="Copy text"
              >
                {copied ? (
                  <FiCheck className="w-4 h-4 text-green-400" />
                ) : (
                  <FiCopy className="w-4 h-4 text-slate-300" />
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Response;