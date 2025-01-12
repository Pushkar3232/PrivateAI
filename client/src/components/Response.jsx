import React from 'react'

// Function to convert the text with markdown-like syntax into HTML
const convertMarkdownToHTML = (text) => {
  // Convert \n to <br />
  let formattedText = text.replace(/\n/g, '<br />');

  // Convert **text** to <strong>text</strong>
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert *text* to <em>text</em>
  formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Convert * item to <ul><li>item</li></ul>
  formattedText = formattedText.replace(/^(\* .+)$/gm, '<ul><li>$1</li></ul>');
  
  // Convert 1. item to <ol><li>item</li></ol>
  formattedText = formattedText.replace(/^(\d+\..+)$/gm, '<ol><li>$1</li></ol>');
  
  // Convert code blocks (triple backticks)
  formattedText = formattedText.replace(/```(.*?)\n([\s\S]+?)```/g, (match, lang, code) => {
    // lang is the optional language provided (e.g., python, js)
    return `<pre class="bg-gray-800 text-white p-4 rounded"><code class="language-${lang}">${code}</code></pre>`;
  });

  return formattedText;
}

const Response = (props) => {
  // Convert the markdown-like text to HTML
  const convertedContent = convertMarkdownToHTML(props.data);

  return (
    <div
      className={`bg-slate-900 w-6/12 mx-2 my-3 mb-14 text-white py-6 px-8 rounded-lg ${props.type === 'query' ? 'ml-auto text-left' : 'mr-auto text-left'}`}
      dangerouslySetInnerHTML={{ __html: convertedContent }} // Use dangerouslySetInnerHTML to inject HTML
    >
    </div>
  )
}

export default Response;
