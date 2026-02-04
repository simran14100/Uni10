export const RunningText = () => {
  const messages = [
    "UNI10 - is Live Now",
    "For the First 50 Unique Personalities ....",
    "UNI10 - The Ultimate Shopping Experience",
  ];

  // Create extended message array with spacing for seamless loop
  const extendedMessages = [...messages, ...messages];

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-black border-b border-gray-800 overflow-hidden h-10">
      <div className="relative flex items-center h-full w-full">
        <div className="flex animate-marquee whitespace-nowrap">
          {extendedMessages.map((message, index) => (
            <span key={index} className="mx-12 text-sm font-semibold text-white">
              {message}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
