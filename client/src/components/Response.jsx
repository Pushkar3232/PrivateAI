import React from 'react';

// Function to convert markdown-like syntax into HTML with copy button support
const convertMarkdownToHTML = (text) => {
  let formattedText = text;

  // 1. Convert `\n` to `<br />` (skip if inside code blocks)
  formattedText = formattedText.replace(/\n(?![\s\S]*?```)/g, '<br />');

  // 2. Convert **text** to <strong>text</strong>
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // 3. Convert *text* to <em>text</em>
  formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // 4. Convert * item to <ul><li>item</li></ul>
  formattedText = formattedText.replace(/^\* (.+)$/gm, '<ul><li>$1</li></ul>');

  // 5. Convert numbered lists (e.g., 1. item) to <ol><li>item</li></ol>
  formattedText = formattedText.replace(/^(\d+)\. (.+)$/gm, '<ol><li>$2</li></ol>');

  // 6. Convert code blocks (triple backticks) to HTML pre and code tags with a copy button
  formattedText = formattedText.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const languageClass = lang ? `language-${lang}` : ''; // Use language class if provided
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const uniqueId = `code-${Math.random().toString(36).substring(2, 10)}`; // Generate a unique ID

    return `
      <br />
      <div class="relative group">
        <button class="absolute top-2 right-2 text-sm px-3 py-1 bg-blue-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity" data-copy-target="${uniqueId}">
          Copy
        </button>
        <pre id="${uniqueId}" class="bg-gray-800 text-white p-4 rounded"><code class="${languageClass}">${escapedCode.trim()}</code></pre>
      </div>
      <br />
    `;
  });

  return formattedText;
};

const Response = (props) => {
  // Convert markdown-like text to HTML
  const convertedContent = convertMarkdownToHTML(props.data);

  // Function to handle the copy button click
  const handleCopy = (event) => {
    const button = event.target;
    const targetId = button.getAttribute('data-copy-target');
    const codeBlock = document.getElementById(targetId);

    if (codeBlock) {
      // Copy code content to clipboard
      navigator.clipboard.writeText(codeBlock.textContent).then(() => {
        button.textContent = 'Copied!'; // Change button text
        setTimeout(() => {
          button.textContent = 'Copy'; // Revert button text after 2 seconds
        }, 2000);
      });
    }
  };

  // Attach event listener for copy buttons after rendering
  React.useEffect(() => {
    const copyButtons = document.querySelectorAll('[data-copy-target]');
    copyButtons.forEach((button) => {
      button.addEventListener('click', handleCopy);
    });

    // Cleanup event listeners on component unmount
    return () => {
      copyButtons.forEach((button) => {
        button.removeEventListener('click', handleCopy);
      });
    };
  }, []);

  return (
    <div
      className={`bg-slate-900 w-6/12 mx-2 my-3 mb-14 text-white py-6 px-8 rounded-lg ${
        props.type === 'query' ? 'ml-auto text-left' : 'mr-auto text-left'
      }`}
      dangerouslySetInnerHTML={{ __html: convertedContent }} // Use dangerouslySetInnerHTML to inject HTML
    />
  );
};

export default Response;
