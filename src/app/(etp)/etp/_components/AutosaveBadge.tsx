import React, { useState, useEffect } from 'react';
export default function AutosaveBadge() {
  const [text, setText] = useState('');
  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      setText('Salvo às ' + d.toLocaleTimeString());
    }, 5000);
    return () => clearInterval(id);
  }, []);
  return <span className="text-xs text-gray-500">{text}</span>;
}
