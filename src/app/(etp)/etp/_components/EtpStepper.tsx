import React from 'react';
export default function EtpStepper({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {Array.from({ length: total }).map((_, i) => {
        const n = i + 1;
        let state = 'bg-gray-300';
        if (n < current) state = 'bg-green-600';
        else if (n === current) state = 'bg-black';
        return React.createElement('span', { key: n, className: 'h-2 w-8 rounded ' + state });
      })}
      <span className="ml-2">Passo {current} de {total}</span>
    </div>
  );
}
