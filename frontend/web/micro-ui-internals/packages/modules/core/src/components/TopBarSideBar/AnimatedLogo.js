import React, { useState, useEffect } from "react";

const AnimatedLogo = ({ withoutContentText = false }) => {
  // Typewriter animation states
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const titles = [
    { text: "E-PERMIS", lang: "Français" },
    { text: "Ruqsad", lang: "Somali" },
    { text: "Ruksat", lang: "Afar" },
    { text: "رخصة", lang: "العربية" },
  ];
  const period = 2000;
  const [delta, setDelta] = useState(100);

  // Typewriter effect
  useEffect(() => {
    let ticker = setInterval(() => {
      tick();
    }, delta);

    return () => clearInterval(ticker);
  }, [displayText, isDeleting, loopNum]);

  const tick = () => {
    let i = loopNum % titles.length;
    let fullText = titles[i].text;
    let updatedText = isDeleting ? fullText.substring(0, displayText.length - 1) : fullText.substring(0, displayText.length + 1);

    setDisplayText(updatedText);

    if (isDeleting) {
      setDelta((prevDelta) => prevDelta / 2);
    }

    if (!isDeleting && updatedText === fullText) {
      setIsDeleting(true);
      setDelta(period);
    } else if (isDeleting && updatedText === "") {
      setIsDeleting(false);
      setLoopNum(loopNum + 1);
      setDelta(100);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative h-8 min-w-[148px] flex items-center">
        <img src="https://demo-epermit.site/map-logo.png" alt="Logo" className="w-10 h-10 mr-2" />
        <h1 className="text-xl font-bold">
          <span
            style={{
              background: "linear-gradient(to right, #22a4d9, #52ac47)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {displayText}
            <span className="animate-pulse">|</span>
          </span>
        </h1>
      </div>
      {!withoutContentText && (
        <div className="hidden sm:flex flex-col">
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-600">République de Djibouti</span>
          </div>
          <span className="text-xs text-gray-400 italic text-center">Unité - Égalité - Paix</span>
        </div>
      )}
    </div>
  );
};

export default AnimatedLogo;
