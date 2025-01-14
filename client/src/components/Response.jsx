import React from 'react';

// Function to convert markdown-like syntax into HTML
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

  // 6. Convert code blocks (triple backticks) to HTML pre and code tags
  formattedText = formattedText.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const languageClass = lang ? `language-${lang}` : ''; // Use language class if provided
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<pre class="bg-gray-800 text-white p-4 rounded"><code class="${languageClass}">${escapedCode.trim()}</code></pre>`;
  });

  return formattedText;
};

const Response = (props) => {
  // Convert markdown-like text to HTML
  const convertedContent = convertMarkdownToHTML(props.data);

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
