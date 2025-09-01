import { useEffect, useState } from "react";
import hfMiniLogo from '/hf-mini.png';
const SplashScreen = ({ onFinish }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onFinish) onFinish();
    }, 1800); // 1.8s splash duration
    return () => clearTimeout(timer);
  }, [onFinish]);

  return visible ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <img
        src={hfMiniLogo}
        alt="Logo"
        className="w-5 h-5 animate-splash"
        style={{ filter: 'drop-shadow(0 0 32px orange)' }}
      />
    </div>
  ) : null;
};

export default SplashScreen;
