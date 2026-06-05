import { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Settings, 
  RotateCcw, 
  Info, 
  ArrowDown, 
  Share2, 
  Smartphone,
  Sparkles,
  Lightbulb,
  SquareArrowUp
} from 'lucide-react';

export default function App() {
  // Config States
  const [isPressed, setIsPressed] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [troubleCounter, setTroubleCounter] = useState<number>(() => {
    const saved = localStorage.getItem('komari_total_counter');
    return saved ? parseInt(saved, 10) : 0;
  });
  
  const [speechPhrase, setSpeechPhrase] = useState('それ、こまります、こまります');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(0);
  const [speechRate, setSpeechRate] = useState<number>(1.1);
  const [speechPitch, setSpeechPitch] = useState<number>(1.2);
  const [history, setHistory] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showPwaGuide, setShowPwaGuide] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const timerSafetyRef = useRef<NodeJS.Timeout | null>(null);

  // Load and watch for device SpeechSynthesis voices
  useEffect(() => {
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        const allVoices = window.speechSynthesis.getVoices();
        // Extract Japanese voices if possible, otherwise use all available
        const ja = allVoices.filter(v => 
          v.lang.toLowerCase().startsWith('ja') || 
          v.lang.toLowerCase().includes('jp')
        );
        setVoices(ja.length > 0 ? ja : allVoices);
      }
    };
    
    loadVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => {
      if (timerSafetyRef.current) clearTimeout(timerSafetyRef.current);
    };
  }, []);

  // Save trouble count to local storage
  const incrementCounter = () => {
    const nextVal = troubleCounter + 1;
    setTroubleCounter(nextVal);
    localStorage.setItem('komari_total_counter', nextVal.toString());
    
    // Add current time back into history
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setHistory(prev => [timeStr, ...prev.slice(0, 4)]);
  };

  const resetCounter = () => {
    if (window.confirm('累計こまり回数をリセットしますか？')) {
      setTroubleCounter(0);
      localStorage.setItem('komari_total_counter', '0');
      setHistory([]);
    }
  };

  const handleButtonPress = () => {
    if (isActive) return; // Prevent double pressing while currently speaking
    
    setHasUserInteracted(true);
    setIsPressed(true);

    // Smooth mechanical physical spring back effect
    setTimeout(() => {
      setIsPressed(false);
    }, 150);

    setIsActive(true);
    incrementCounter();

    if ('speechSynthesis' in window) {
      // Cancel previous to avoid long queued speaking threads
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(speechPhrase);
      
      // Load current chosen voice
      if (voices.length > 0 && selectedVoiceIndex < voices.length) {
        utterance.voice = voices[selectedVoiceIndex];
      }

      utterance.rate = speechRate;
      utterance.pitch = speechPitch;

      utterance.onend = () => {
        setIsActive(false);
      };

      utterance.onerror = (e) => {
        console.error('SpeechSynthesis error:', e);
        setIsActive(false);
      };

      // Speak directly and immediately on the click context to guarantee full audio session volume activation on Safari/Chrome
      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback if speechSynthesis is absent
      setTimeout(() => {
        setIsActive(false);
      }, 2000);
    }

    // Safety timeout fallback: if synthesis fails to trigger onend callback, 
    // we ensure the button does not stay locked in the active glowing state.
    if (timerSafetyRef.current) clearTimeout(timerSafetyRef.current);
    timerSafetyRef.current = setTimeout(() => {
      setIsActive(false);
    }, 6000); 
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('アプリのURLをコピーしました！友達に送るか、お気に入りに追加して「こまりますボタン」を披露してください。');
  };

  // Safe diagnosis speech test to bypass silent volume conditions
  const runSelfDiagnosis = () => {
    alert(
      '【音声が聞こえない時のチェック】\n' +
      '① 端末のマナーモード（物理的な消音スイッチ）がオンになっていませんか？（iOS、iPadOSでは特に必須です）\n' +
      '② メディア音量がゼロになっていませんか？\n' +
      '③ ブラウザの読み上げ権限を許可していますか？'
    );
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance('テスト音声。こまりますボタンの準備は完了です。');
      if (voices.length > 0) speech.voice = voices[0];
      window.speechSynthesis.speak(speech);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col items-center justify-between p-4 overflow-x-hidden font-sans select-none">
      
      {/* Top Header - Authentic Bus Board Signage style */}
      <header className="w-full max-w-md mx-auto pt-4 pb-2 px-1 text-center">
        <div className="bg-neutral-950 border-2 border-amber-500 rounded-lg p-2.5 shadow-2xl relative overflow-hidden">
          {/* Neon side blinkers */}
          <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
          <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
          
          <div className="text-xs uppercase font-space tracking-widest text-amber-500 opacity-60 mb-0.5">
            Local Stop Button Simulator
          </div>
          <h1 className="text-xl md:text-2xl font-black text-amber-400 font-rounded-jp tracking-wider">
            「それ、こまります！」ボタン
          </h1>
          <p className="text-[10px] text-neutral-400 mt-1 font-rounded-jp">
            乗合バス降車ボタン風・超低遅延ボイスアプリ
          </p>
        </div>
      </header>

      {/* Main Bus Stop Pole and Skeuomorphic Button Interface */}
      <main className="flex-1 w-full max-w-md flex flex-col items-center justify-center py-6 relative">
        


        {/* The Skeuomorphic Bus Stop Button Block */}
        <div 
          className="z-10 relative flex flex-col items-center transition-all duration-300"
          style={{ transform: isPressed ? 'scale(0.96) translateY(2px)' : 'scale(1)' }}
        >
          {/* Casing Backdrop Shadow */}
          <div className="absolute -inset-1 bg-black/60 rounded-3xl blur-md"></div>

          {/* Solid Golden-Yellow Outer Casing */}
          <div className="relative w-48 h-72 rounded-[2rem] bg-gradient-to-b from-amber-400 via-amber-400 to-amber-500 border-4 border-amber-300 p-3.5 shadow-[inset_0_4px_6px_rgba(255,255,255,0.7),_0_10px_20px_rgba(0,0,0,0.6)] flex flex-col justify-between items-center overflow-hidden">
            
            {/* Top Security Banner Decal (Authentic Retro bus label) */}
            <div className="w-full bg-neutral-900 border border-neutral-800 rounded px-1.5 py-1 text-center shadow-inner select-none pointer-events-none">
              <span className="text-[9px] text-neutral-400 font-rounded-jp block mt-0.5 uppercase tracking-wide font-bold">
                KOMARIMASU BUTTON
              </span>
            </div>

            {/* Inner Dark Bezel Bracket */}
            <div className="flex-1 w-full my-3 rounded-2xl bg-gradient-to-b from-neutral-800 to-neutral-950 p-2.5 border border-neutral-700 shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)] flex items-center justify-center">
              
              {/* The Glowing Translucent Red Button Surface */}
              <button
                id="komarimasu-primary-button"
                onClick={handleButtonPress}
                disabled={isActive && !hasUserInteracted}
                className={`w-full h-full rounded-xl transition-all duration-150 select-none cursor-pointer flex flex-col items-center justify-between py-4 px-2 relative overflow-hidden focus:outline-none
                  ${isActive 
                    ? 'animate-bus-glowing' 
                    : 'bg-gradient-to-b from-red-950 to-red-900 border-t-2 border-red-800 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.8),_0_2px_4px_rgba(0,0,0,0.5)] text-red-500 hover:brightness-110 active:brightness-90 hover:shadow-[0_0_15px_rgba(185,28,28,0.3)]'
                  }
                `}
                style={{
                  transform: isPressed ? 'translateY(3px) scale(0.97)' : 'translateY(0) scale(1)',
                  boxShadow: isPressed ? 'inset 0 4px 10px rgba(0,0,0,0.9), 0 1px 1px rgba(255,255,255,0.1)' : ''
                }}
              >
                {/* 3D Inner reflection sheen */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>

                {/* Classic vertical character labels */}
                {/* When glowing: turns bright white. When idle: dark transparent amber-red */}
                <div className={`font-rounded-jp font-black text-3xl flex flex-col leading-[1.05] tracking-widest text-center select-none pointer-events-none transition-colors duration-100 ${
                  isActive ? 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]' : 'text-red-700/80'
                }`}>
                  <span>こ</span>
                  <span>ま</span>
                  <span>り</span>
                  <span>ま</span>
                  <span>す</span>
                </div>

                {/* Sub-label under text: STOP or KOMARIMASU */}
                <div className={`font-space font-extrabold text-sm tracking-widest uppercase transition-colors duration-100 mt-2 select-none pointer-events-none ${
                  isActive ? 'text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]' : 'text-red-800'
                }`}>
                  STOP
                </div>
              </button>
            </div>

            {/* Bottom Caution Text Sign (Authentic bus text: 「次とまります」) */}
            <div className="w-full text-center py-0.5 select-none pointer-events-none">
              <p className="text-[8px] font-rounded-jp text-neutral-900 font-bold tracking-tight">
                走行中の不要不急なこまり移動はご遠慮ください
              </p>
            </div>
          </div>
        </div>

        {/* Small warning banner to encourage clicking if speakers seem muted */}
        {!hasUserInteracted && (
          <div className="mt-5 w-72 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 text-center z-10 backdrop-blur-sm animate-bounce">
            <p className="text-[11px] font-rounded-jp text-amber-300 font-medium leading-normal flex items-center justify-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              ボタンを押して「こまります」を発声！
            </p>
          </div>
        )}
      </main>

      {/* Auxiliary Dashboard (Statistics and Controller Knobs) */}
      <footer className="w-full max-w-md mx-auto mt-2">
        
        {/* Retro Counter/Odometer HUD Box */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 shadow-inner mb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-rounded-jp flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              累計「こまり」宣言回数
            </span>
            <div className="flex items-center gap-2">
              {/* Odometer styled number panels */}
              <div className="bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 text-sm font-mono tracking-widest text-emerald-400 font-bold shadow-inner">
                {String(troubleCounter).padStart(5, '0')}
              </div>
              <button
                id="reset-counter-button"
                onClick={resetCounter}
                title="カウンターをリセット"
                className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-500 hover:text-red-400 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          {/* Small running tickers / recent timestamps */}
          {history.length > 0 && (
            <div className="mt-2 pt-2 border-t border-neutral-900 flex items-center gap-2 text-[9px] text-neutral-500 font-mono">
              <span className="font-rounded-jp">直近のこまり時刻:</span>
              <div className="flex gap-1 overflow-hidden">
                {history.map((h, i) => (
                  <span key={i} className="bg-neutral-900 py-0.5 px-1 rounded border border-neutral-850 text-neutral-400">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Controller and Utility Options Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            id="toggle-settings-button"
            onClick={() => {
              setShowSettings(!showSettings);
              if (showPwaGuide) setShowPwaGuide(false);
            }}
            className={`py-2 px-3 rounded-lg border text-xs font-rounded-jp font-semibold flex items-center justify-center gap-1.5 transition-all
              ${showSettings 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-md' 
                : 'bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border-neutral-800'
              }
            `}
          >
            <Settings className="w-3.5 h-3.5" />
            ボイスカスタマイズ
          </button>
          
          <button
            id="toggle-pwa-button"
            onClick={() => {
              setShowPwaGuide(!showPwaGuide);
              if (showSettings) setShowSettings(false);
            }}
            className={`py-2 px-3 rounded-lg border text-xs font-rounded-jp font-semibold flex items-center justify-center gap-1.5 transition-all
              ${showPwaGuide 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-md' 
                : 'bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border-neutral-800'
              }
            `}
          >
            <Smartphone className="w-3.5 h-3.5" />
            スマホのホーム追加
          </button>
        </div>

        {/* Dynamic Drawer 1: Sound Settings Engine */}
        {showSettings && (
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 mb-4 shadow-xl text-neutral-300 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
              <h2 className="text-sm font-bold text-amber-400 font-rounded-jp flex items-center gap-1">
                カスタマイズ設定
              </h2>
              <button 
                onClick={runSelfDiagnosis}
                className="text-[10px] text-amber-400/80 hover:text-amber-300 underline font-rounded-jp cursor-pointer"
              >
                🔊 音が鳴らない場合
              </button>
            </div>

            {/* Input target string */}
            <div className="space-y-1">
              <label className="text-[11px] text-neutral-400 font-rounded-jp block">発声させるセリフ</label>
              <input
                id="settings-phrase-input"
                type="text"
                value={speechPhrase}
                onChange={(e) => setSpeechPhrase(e.target.value)}
                maxLength={45}
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                placeholder="それ、こまります、こまります"
              />
            </div>

            {/* Sliders for Speech Rate and Pitch */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-neutral-400 font-rounded-jp">
                  <span>話すスピード</span>
                  <span className="text-amber-400 font-mono">{speechRate.toFixed(1)}x</span>
                </div>
                <input
                  id="settings-rate-slider"
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-900 rounded"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-neutral-400 font-rounded-jp">
                  <span>声の高さ（音程）</span>
                  <span className="text-amber-400 font-mono">{speechPitch.toFixed(1)}x</span>
                </div>
                <input
                  id="settings-pitch-slider"
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={speechPitch}
                  onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-900 rounded"
                />
              </div>
            </div>

            {/* Voice Select Dropdown (Optional on system voices availability) */}
            {voices.length > 0 && (
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400 font-rounded-jp block">システム音声の選択 (日本語推奨)</label>
                <select
                  id="settings-voice-select"
                  value={selectedVoiceIndex}
                  onChange={(e) => setSelectedVoiceIndex(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                >
                  {voices.map((voice, idx) => (
                    <option key={idx} value={idx}>
                      {voice.name} {voice.lang.startsWith('ja') ? ' (日本語)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <p className="text-[9px] text-neutral-500 leading-normal font-rounded-jp">
              ※ 本音声調整はWeb Speech Synthesis APIに依存しています。お使いのスマホ（AndroidのSpeech Services by Google や iOSのSiri音声）に応じて声質が変化します。
            </p>
          </div>
        )}

        {/* Dynamic Drawer 2: PWA Install Guidance (ホーム追加案内) */}
        {showPwaGuide && (
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 mb-4 shadow-xl text-neutral-300 space-y-3 animate-fadeIn">
            <h2 className="text-sm font-bold text-amber-400 font-rounded-jp flex items-center gap-1.5 border-b border-neutral-900 pb-2">
              <Smartphone className="w-4 h-4 text-amber-400" />
              アプリをスマホのホーム画面に保存
            </h2>
            <p className="text-xs font-rounded-jp text-neutral-400 leading-relaxed">
              ブラウザのフチやアドレスバーを非表示にして、本物のバスの「こまりますボタン」のように画面いっぱいで遊ぶことができます。
            </p>

            <div className="space-y-2 text-xs font-rounded-jp bg-neutral-900/50 p-2.5 rounded border border-neutral-850">
              <div className="flex items-start gap-2">
                <span className="bg-amber-500 text-neutral-950 rounded-full w-4 h-4 text-center text-[10px] font-bold shrink-0 mt-0.5 flex items-center justify-center">i</span>
                <div>
                  <h3 className="font-semibold text-neutral-200">iPhone / iPad (Safari / Chrome など)</h3>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                    1. 画面端にある、四角と上矢印の<strong>「共有ボタン」</strong> <SquareArrowUp className="inline w-4 h-4 text-sky-450 align-text-bottom" /> をタップします（Safariは下部、Chromeはアドレスバーの右側など）。<br />
                    2. メニューから<strong>「ホーム画面に追加」</strong>をタップします。
                  </p>
                </div>
              </div>

              <div className="border-t border-neutral-850/50 my-2"></div>

              <div className="flex items-start gap-2">
                <span className="bg-amber-500 text-neutral-950 rounded-full w-4 h-4 text-center text-[10px] font-bold shrink-0 mt-0.5 flex items-center justify-center">a</span>
                <div>
                  <h3 className="font-semibold text-neutral-200">Android (Chrome)</h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    1. アドレスバー右側の「3点リーダー」アイコンをタップします。<br />
                    2. 「アプリをインストール」または「ホーム画面に追加」を選択して完了です。
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                id="pwa-share-action-btn"
                onClick={copyShareLink}
                className="text-xs bg-amber-500 hover:bg-amber-400 text-neutral-950 font-rounded-jp font-bold py-1.5 px-3 rounded flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                お友達に共有・共有URLコピー
              </button>
            </div>
          </div>
        )}

        {/* Bus Safety Sticker Accents (Decorative details) */}
        <div className="flex justify-between items-center px-1.5 mb-2 select-none pointer-events-none opacity-55">
          <div className="bg-amber-500 text-[8px] text-neutral-950 px-2 py-0.5 font-rounded-jp font-extrabold rounded-sm uppercase tracking-tight">
            注意: 走行中移動切迫
          </div>
          <div className="text-[8px] text-neutral-400 font-rounded-jp text-right">
            安全運転に「こまり」宣言でご協力ください。
          </div>
        </div>

      </footer>
    </div>
  );
}
