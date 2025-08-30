import React, { useState , useRef} from 'react';

export default function SearchBar({ onSearch }) {
  const [q, setQ] = useState('');
  const [pressed, setPressed] = useState(false);
  const timerRef = useRef(null);

  const submit = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    onSearch(q.trim());
  };

  const handleClickFeedback = () => {
    setPressed(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setPressed(false), 200); 
  };

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-xl mx-auto flex items-center bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden"
    >
      <input
        aria-label="ingredient"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Type an ingredient (e.g., paneer, tomato, potato)"
        className="flex-1 px-4 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button
        type="submit"
        onClick={handleClickFeedback}
        className={
          `px-6 py-3 font-medium transition-all duration-150 rounded-r-2xl focus:outline-none focus:ring-2 focus:ring-offset-1 ` +
          (pressed
            ? 'bg-green-500 text-white shadow-inner scale-95'
            : 'bg-primary text-white hover:bg-blue-600 shadow-md active:scale-95')
        }
      >
        Search
      </button>
    </form>
  );
}