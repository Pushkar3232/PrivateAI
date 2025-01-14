import React from 'react';
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

const Response = (props) => {
  const convertedContent = convertMarkdownToHTML(props.data);

  // Function to handle the "Copy" button for entire response
  const handleCopyResponse = () => {
    navigator.clipboard.writeText(props.data).then(() => {
      alert('Response copied to clipboard!');
    });
  };

  // Function to handle the "Speak" button click
  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(props.data);
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
  React.useEffect(() => {
    const copyButtons = document.querySelectorAll('.copy-code-button');
    copyButtons.forEach((button) => {
      button.addEventListener('click', handleCopyCode);
    });
    return () => {
      copyButtons.forEach((button) => {
        button.removeEventListener('click', handleCopyCode);
      });
    };
  }, [props.data]);

  return (
    <div
      className={`bg-slate-900 w-6/12 mx-2 my-3 mb-14 text-white py-6 px-8 rounded-lg ${
        props.type === 'query' ? 'ml-auto text-left' : 'mr-auto text-left'
      } overflow-auto break-words`}
    >
      {/* Render the converted content */}
      <div dangerouslySetInnerHTML={{ __html: convertedContent }}></div>

      {/* Only show Speak/Copy icons if the type is NOT 'query' */}
      {props.type !== 'query' && (
        <div className="flex justify-end mt-4 space-x-4">
          <img
            src={AudioIcon}
            alt="Speak"
            onClick={handleSpeak}
            className="w-6 h-6 cursor-pointer hover:opacity-80"
          />
          <img
            src={CopyIcon}
            alt="Copy"
            onClick={handleCopyResponse}
            className="w-6 h-6 cursor-pointer hover:opacity-80"
          />
        </div>
      )}
    </div>
  );
};

export default Response;
