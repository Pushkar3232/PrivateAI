import React, { useState, useEffect, useCallback } from 'react';
import { FiCopy, FiVolume2, FiCheck } from 'react-icons/fi';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';

const CodeBlock = ({ code, language, onCopy }) => {
  const [copied, setCopied] = useState(false);
  const codeRef = React.useRef(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  }, [code, onCopy]);

  const handlePreview = useCallback(() => {
    if (language === 'html') {
      const previewWindow = window.open();
      previewWindow.document.write(code);
      previewWindow.document.close();
    }
  }, [code, language]);

  return (
    <div className="relative my-4 group">
      <pre className="!bg-slate-800/50 !rounded-xl p-4 !text-sm border border-slate-700/50 backdrop-blur-sm overflow-auto whitespace-pre font-mono">
        <code ref={codeRef} className={`language-${language}`}>
          {code}
        </code>
      </pre>
      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {language === 'html' && (
          <button
            onClick={handlePreview}
            className="px-2 py-1 text-xs font-medium rounded-lg bg-slate-700/50 hover:bg-green-500/20 border border-slate-700/50 transition-colors text-green-300"
            aria-label="Preview HTML"
          >
            Preview
          </button>
        )}
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-purple-500/20 border border-slate-700/50 transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <FiCheck className="w-4 h-4 text-green-400" />
          ) : (
            <FiCopy className="w-4 h-4 text-slate-300" />
          )}
        </button>
      </div>
    </div>
  );
};

const MarkdownRenderer = ({ content }) => {
  const processInlineMarkdown = useCallback((text) => {
    return text.split(/(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*|`.*?`)/g).map((part, index) => {
      if (part.match(/^\*\*\*(.*?)\*\*\*$/)) {
        return <strong key={`strongem-${index}`} className="font-semibold italic">{part.slice(3, -3)}</strong>;
      }
      if (part.match(/^\*\*(.*?)\*\*$/)) {
        return <strong key={`strong-${index}`} className="font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.match(/^\*(.*?)\*$/)) {
        return <em key={`em-${index}`} className="italic">{part.slice(1, -1)}</em>;
      }
      if (part.match(/^`(.*?)`$/)) {
        return <code key={`code-${index}`} className="font-mono bg-gray-700 px-1.5 py-0.5 rounded text-sm">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  }, []);

  const renderContent = useCallback((text) => {
    const blocks = text.split(/(```[\s\S]*?```)/g);

    return (
      <div className="max-w-2xl mx-auto px-4">
        {blocks.map((block, blockIndex) => {
          if (block.startsWith('```')) {
            const match = block.match(/```(\w*)\n([\s\S]*?)```/s);
            if (match) {
              return <CodeBlock key={`code-${blockIndex}`} code={match[2].trim()} language={match[1]} />;
            }
          }

          let currentList = null;
          let listItems = [];
          const elements = [];

          const flushList = () => {
            if (listItems.length > 0) {
              elements.push(
                currentList === 'ol' 
                  ? <ol key={`list-${elements.length}`} className="list-decimal pl-8 my-4 space-y-2">{listItems}</ol>
                  : <ul key={`list-${elements.length}`} className="list-disc pl-8 my-4 space-y-2">{listItems}</ul>
              );
              listItems = [];
              currentList = null;
            }
          };

          block.split('\n').forEach((line, lineIndex) => {
            const trimmedLine = line.trim();
            
            // Form Field Detection
            // if (trimmedLine.toLowerCase().includes('input field')) {
            //   flushList();
            //   elements.push(
            //     <div key={`input-${lineIndex}`} className="my-4">
            //       <input
            //         type={trimmedLine.includes('password') ? 'password' : 'text'}
            //         className="w-full bg-gray-800 rounded-lg px-4 py-3 text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            //         placeholder={trimmedLine.replace(/.*for\s+/i, '')}
            //       />
            //     </div>
            //   );
            // }
            // // Button Detection
            // else if (trimmedLine.toLowerCase().includes('sign in button')) {
            //   flushList();
            //   elements.push(
            //     <button
            //       key={`btn-${lineIndex}`}
            //       className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-medium transition-colors my-4"
            //     >
            //       Sign In
            //     </button>
            //   );
            // }
            // Social Media Detection
            if (trimmedLine.toLowerCase().includes('social media links')) {
              flushList();
              elements.push(
                <div key={`social-${lineIndex}`} className="flex gap-4 justify-center my-6">
                  <button className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
                    <svg className="w-6 h-6 text-current" viewBox="0 0 24 24">
                      {/* Google Icon SVG */}
                    </svg>
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
                    <svg className="w-6 h-6 text-current" viewBox="0 0 24 24">
                      {/* Facebook Icon SVG */}
                    </svg>
                  </button>
                </div>
              );
            }
            // Error Message Detection
            // else if (trimmedLine.toLowerCase().includes('error message')) {
            //   flushList();
            //   elements.push(
            //     <div key={`error-${lineIndex}`} className="mt-4 p-3 bg-red-900/30 text-red-400 rounded-lg">
            //       {trimmedLine.replace(/error message:/i, '')}
            //     </div>
            //   );
            // }
            // Headers
            else if (trimmedLine.startsWith('### ')) {
              flushList();
              elements.push(<h3 key={`h3-${lineIndex}`} className="text-xl font-semibold mt-6 mb-3">{processInlineMarkdown(trimmedLine.slice(4))}</h3>);
            } else if (trimmedLine.startsWith('## ')) {
              flushList();
              elements.push(<h2 key={`h2-${lineIndex}`} className="text-2xl font-bold mt-6 mb-4">{processInlineMarkdown(trimmedLine.slice(3))}</h2>);
            } else if (trimmedLine.startsWith('# ')) {
              flushList();
              elements.push(<h1 key={`h1-${lineIndex}`} className="text-3xl font-bold mt-6 mb-5">{processInlineMarkdown(trimmedLine.slice(2))}</h1>);
            }
            // Lists
            else if (/^\d+\.\s/.test(trimmedLine)) {
              if (currentList !== 'ol') flushList();
              currentList = 'ol';
              listItems.push(
                <li key={`ol-${lineIndex}`} className="text-gray-100/90">
                  {processInlineMarkdown(trimmedLine.replace(/^\d+\.\s/, ''))}
                </li>
              );
            } else if (/^-\s/.test(trimmedLine)) {
              if (currentList !== 'ul') flushList();
              currentList = 'ul';
              listItems.push(
                <li key={`ul-${lineIndex}`} className="text-gray-100/90">
                  {processInlineMarkdown(trimmedLine.replace(/^-\s/, ''))}
                </li>
              );
            }
            // Paragraphs
            else if (trimmedLine) {
              flushList();
              elements.push(
                <p key={`p-${lineIndex}`} className="text-gray-100 mb-4 leading-relaxed">
                  {processInlineMarkdown(trimmedLine)}
                </p>
              );
            } else {
              flushList();
              if (elements.length > 0) {
                elements.push(<br key={`br-${lineIndex}`} className="my-2" />);
              }
            }
          });

          flushList();
          return <div key={`block-${blockIndex}`} className="mb-6">{elements}</div>;
        })}
      </div>
    );
  }, [processInlineMarkdown]);

  return (
    <div className="prose prose-invert max-w-none">
      <div className="flex flex-col gap-6 py-8">
        {renderContent(content)}
      </div>
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

    setThinkData(thinkContent);
    setFinalData(cleanedData);
    setShowResponse(Boolean(cleanedData));
  }, [data]);

  const handleCopy = useCallback(async (text) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleSpeak = useCallback(() => {
    const utterance = new SpeechSynthesisUtterance(finalData);
    speechSynthesis.speak(utterance);
  }, [finalData]);

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
              <MarkdownRenderer content={thinkData || 'Analyzing request...'} />
            </div>
          )}

          <div className="prose prose-invert max-w-none">
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
                className="p-2 rounded-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:bg-purple-500/20 transition-colors"
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