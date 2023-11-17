'use client';

import { useEffect, useState } from 'react';

export const OtherOnClient = ({ initialVal }: { initialVal?: number }) => {
  const [s, setS] = useState(initialVal ?? Math.random());

  useEffect(() => {
    const interval = setInterval(() => {
      setS((prev) => prev + 1);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return <div>Other on client: {s}</div>;
};
