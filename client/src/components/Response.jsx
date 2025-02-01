import React, { useState, useEffect } from 'react';
import AudioIcon from '../assets/Audio.png'; // Path to the Speak icon
import CopyIcon from '../assets/copy.png'; // Path to the Copy icon

// Function to convert markdown-like syntax into HTML
const convertMarkdownToHTML = (text) => {
  let formattedText = text;

  // Convert `\n` to `<br />` (skip inside code blocks)
  formattedText = formattedText.replace(/\n(?![\s\S]*?```)/g, '<br />');

  // Convert **text** to <strong>text</strong>
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Convert *text* to <em>text</em>
  formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Convert * item to <ul><li>item</li></ul>
  formattedText = formattedText.replace(/^\* (.+)$/gm, '<ul><li>$1</li></ul>');

  // Convert numbered lists (e.g., 1. item) to <ol><li>item</li></ol>
  formattedText = formattedText.replace(/^(\d+)\. (.+)$/gm, '<ol><li>$2</li></ol>');

  // Convert code blocks (triple backticks) to HTML pre and code tags
  formattedText = formattedText.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const languageClass = lang ? `language-${lang}` : '';
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `
      <br />
      <div class="relative group">
        <pre class="bg-gray-800 text-white p-4 rounded overflow-auto break-words"><code class="${languageClass}">${escapedCode.trim()}</code></pre>
        <img 
          src="${CopyIcon}" 
          alt="Copy" 
          class="absolute top-2 right-2 w-6 h-6 cursor-pointer hidden group-hover:block copy-code-button" 
        />
      </div>
      <br />
    `;
  });

  return formattedText;
};

// Thinking Component for the animated dots
const Thinking = () => {
  return (
    <div className="flex items-center space-x-1">
      <span>Thinking</span>
      <div className="flex space-x-1">
        <div className="w-1 h-1 bg-white rounded-full animate-bounce delay-100"></div>
        <div className="w-1 h-1 bg-white rounded-full animate-bounce delay-200"></div>
        <div className="w-1 h-1 bg-white rounded-full animate-bounce delay-300"></div>
      </div>
    </div>
  );
};

const Response = (props) => {
  const [showResponse, setShowResponse] = useState(false); // To control whether the response is shown
  const [finalData, setFinalData] = useState(""); // Holds the final cleaned response
  const [thinkData, setThinkData] = useState(""); // Holds the extracted <think> content

  useEffect(() => {
    // Extract <think> content
    const thinkContent = props.data.match(/<think>([\s\S]*?)<\/think>/g) || [];
    const thinkText = thinkContent.map(tag => tag.replace(/<\/?think>/g, '')).join('<br />');
    setThinkData(convertMarkdownToHTML(thinkText)); // Apply formatting to <think> content

    // Clean the input data and remove <think>...</think> before showing the final response
    const cleanedData = props.data.replace(/<think>[\s\S]*?<\/think>/g, '');  // Removing the <think> content
    setFinalData(cleanedData);

    // Simulate a delay for "thinking"
    if (cleanedData) {
      setTimeout(() => {
        setShowResponse(true); // Show response after "thinking"
      }, 2000); // Adjust the delay as needed
    }
  }, [props.data]);

  // Function to handle the "Copy" button for entire response
  const handleCopyResponse = () => {
    navigator.clipboard.writeText(finalData).then(() => {
      alert('Response copied to clipboard!');
    });
  };

  // Function to handle the "Speak" button click
  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(finalData);
    speechSynthesis.speak(utterance);
  };

  // Function to handle the "Copy" button for code blocks
  const handleCopyCode = (e) => {
    const codeContent = e.target.parentElement.querySelector('code').innerText;
    navigator.clipboard.writeText(codeContent).then(() => {
      alert('Code snippet copied to clipboard!');
    });
  };

  // Add event listener for dynamically added copy buttons
  useEffect(() => {
    const copyButtons = document.querySelectorAll('.copy-code-button');
    copyButtons.forEach((button) => {
      button.addEventListener('click', handleCopyCode);
    });

    return () => {
      copyButtons.forEach((button) => {
        button.removeEventListener('click', handleCopyCode);
      });
    };
  }, [finalData]);

  return (
    <div
      className={`bg-slate-900 w-6/12 mx-2 my-3 mb-14 text-white py-6 px-8 rounded-lg ${props.type === 'query' ? 'ml-auto text-left' : 'mr-auto text-left'} overflow-auto break-words`}
    >
      {/* Render the <think> content with formatting */}
      {thinkData && (
        <div className="bg-slate-800 p-4 rounded-lg mb-4">
          <strong>Thinking:</strong>
          <div dangerouslySetInnerHTML={{ __html: thinkData }}></div>
        </div>
      )}

      {/* Render the converted content only when showResponse is true */}
      {showResponse ? (
        <div dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(finalData) }}></div>
      ) : (
        <Thinking /> // Display the "Thinking..." animation
      )}

      {/* Only show Speak/Copy icons if the type is NOT 'query' */}
      {props.type !== 'query' && showResponse && (
        <div className="flex justify-end mt-4 space-x-4">
          <img
            src={AudioIcon}
            alt="Speak"
            onClick={handleSpeak}
            className="w-4 h-4 cursor-pointer hover:opacity-80"
          />
          <img
            src={CopyIcon}
            alt="Copy"
            onClick={handleCopyResponse}
            className="w-4 h-4 cursor-pointer hover:opacity-80"
          />
        </div>
      )}
    </div>
  );
};

export default Response;