import React, { useState, useEffect, useRef } from 'react';
import { FiCopy, FiVolume2, FiCheck, FiEye } from 'react-icons/fi';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';

const CodeBlock = ({ language, code, index }) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePreview = () => {
    if (language === 'html') {
      const previewWindow = window.open();
      previewWindow.document.write(code);
      previewWindow.document.close();
    }
  };

  useEffect(() => {
    Prism.highlightElement(codeRef.current);
  }, [code]);

  return (
    <div className="relative my-4 group">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-400 font-mono">{language || 'code'}</span>
        <div className="flex gap-2">
          {language === 'html' && (
            <button
              onClick={handlePreview}
              className="flex items-center gap-1 px-2 py-1 text-xs text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
            >
              <FiEye className="w-3.5 h-3.5" />
              Preview
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-xs text-slate-300 hover:bg-purple-500/10 rounded-lg transition-colors"
          >
            {copied ? (
              <FiCheck className="w-3.5 h-3.5 text-green-400" />
            ) : (
              <FiCopy className="w-3.5 h-3.5" />
            )}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      <pre className="!bg-slate-800/50 !rounded-lg p-4 !text-sm border border-slate-700/50 backdrop-blur-sm overflow-auto">
        <code ref={codeRef} className={`language-${language}`}>
          {code}
        </code>
      </pre>
    </div>
  );
};

const MarkdownRenderer = ({ content }) => {
  const processContent = (text) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const segments = [];
    let lastIndex = 0;
    let match;
    let index = 0;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const [fullMatch, lang, code] = match;
      const textBefore = text.slice(lastIndex, match.index);

      if (textBefore) {
        segments.push({
          type: 'text',
          content: textBefore,
          key: `text-${lastIndex}`
        });
      }

      segments.push({
        type: 'code',
        language: lang || 'plaintext',
        code: code.trim(),
        key: `code-${index++}`
      });

      lastIndex = match.index + fullMatch.length;
    }

    const remainingText = text.slice(lastIndex);
    if (remainingText) {
      segments.push({
        type: 'text',
        content: remainingText,
        key: `text-${lastIndex}`
      });
    }

    return segments;
  };

  const renderMarkdownText = (text) => {
    return text
      .replace(/### (.*)/g, '<h3 class="text-xl font-semibold mb-3">$1</h3>')
      .replace(/## (.*)/g, '<h2 class="text-2xl font-bold mb-4">$1</h2>')
      .replace(/# (.*)/g, '<h1 class="text-3xl font-bold mb-6">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-slate-700/50 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className="prose prose-invert max-w-none">
      {processContent(content).map((segment) => {
        if (segment.type === 'code') {
          return <CodeBlock key={segment.key} {...segment} />;
        }
        return (
          <div
            key={segment.key}
            className="text-slate-200 leading-relaxed tracking-wide"
            dangerouslySetInnerHTML={{ __html: renderMarkdownText(segment.content) }}
          />
        );
      })}
    </div>
  );
};

const Response = ({ data, type }) => {
  const [showResponse, setShowResponse] = useState(false);
  const [finalData, setFinalData] = useState('');
  const [thinkData, setThinkData] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let thinkContent = '';
    let cleanedData = data;
    const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
    const matches = [...data.matchAll(thinkRegex)];

    if (matches.length > 0) {
      thinkContent = matches.map(match => match[1]).join('\n');
      cleanedData = data.replace(thinkRegex, '');
    }

    setThinkData(thinkContent);
    setFinalData(cleanedData);
    setShowResponse(Boolean(cleanedData));
  }, [data]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(finalData);
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
          {thinkData && (
            <div className="mb-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
              <div className="text-sm text-purple-400/80 font-medium mb-2 flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                <span>Thinking Process</span>
              </div>
              <MarkdownRenderer content={thinkData} />
            </div>
          )}

          {showResponse ? (
            <MarkdownRenderer content={finalData} />
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

          {type !== 'query' && showResponse && (
            <div className="absolute -right-8 top-0 flex flex-col gap-2 opacity-0 hover:opacity-100 transition-opacity">
              <button
                onClick={handleSpeak}
                className="p-2 rounded-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:bg-purple-500/20 transition-colors"
              >
                <FiVolume2 className="w-4 h-4 text-slate-300" />
              </button>
              <button
                onClick={handleCopy}
                className="p-2 rounded-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:bg-purple-500/20 transition-colors relative"
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