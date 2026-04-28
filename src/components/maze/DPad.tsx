import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface DPadProps {
  onMove: (dir: 'up' | 'down' | 'left' | 'right') => void;
}

export default function DPad({ onMove }: DPadProps) {
  const btnStyle = {
    background: '#1B263B',
    color: '#7A9BBF',
    border: '1px solid #2A4A6B',
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      <div />
      <button
        onClick={() => onMove('up')}
        className="w-14 h-14 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
        style={btnStyle}
        aria-label="Cima"
      >
        <ChevronUp size={32} />
      </button>
      <div />

      <button
        onClick={() => onMove('left')}
        className="w-14 h-14 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
        style={btnStyle}
        aria-label="Esquerda"
      >
        <ChevronLeft size={32} />
      </button>
      <button
        className="w-14 h-14 rounded-full flex items-center justify-center opacity-20"
        style={{ ...btnStyle, background: 'transparent' }}
        disabled
      >
        <div className="w-4 h-4 bg-current rounded-full" />
      </button>
      <button
        onClick={() => onMove('right')}
        className="w-14 h-14 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
        style={btnStyle}
        aria-label="Direita"
      >
        <ChevronRight size={32} />
      </button>

      <div />
      <button
        onClick={() => onMove('down')}
        className="w-14 h-14 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
        style={btnStyle}
        aria-label="Baixo"
      >
        <ChevronDown size={32} />
      </button>
      <div />
    </div>
  );
}
