export const RunningText = () => {
  const messages = [
    "UNI10 - is Live Now",
    "For the First 50 Unique Personalities, Get a 50% off........... Hurry Up!",
    "UNI10 - The Ultimate Shopping Experience",
  ];

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-black border-b border-gray-800 overflow-hidden h-10">
      <div className="relative flex items-center h-full w-full">
        <div className="flex animate-marquee whitespace-nowrap">
          {messages.map((message, index) => (
            <span key={index} className="mx-8 text-sm font-semibold text-white">
              {message}
            </span>
          ))}
        </div>
        <div className="flex animate-marquee whitespace-nowrap absolute left-full" aria-hidden="true">
          {messages.map((message, index) => (
            <span key={index} className="mx-8 text-sm font-semibold text-white">
              {message}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
