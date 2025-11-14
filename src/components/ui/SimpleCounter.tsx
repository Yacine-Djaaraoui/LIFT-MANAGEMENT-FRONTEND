// SimpleCounter.tsx
import React from "react";
import useStore from "@/zustand/store";

export const SimpleCounter: React.FC = () => {
  const { count, increment, decrement } = useStore();

  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
};
