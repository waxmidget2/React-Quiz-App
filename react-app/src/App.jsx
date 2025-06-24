import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const AnimatedGradientBg = () => (
  <div
    className="fixed inset-0 -z-20 animate-gradient-move"
    style={{
      background: "linear-gradient(120deg, #0f172a 0%, #1e293b 50%, #2563eb 100%)",
      opacity: 0.85,
    }}
  />
);

const FallingCharsBackground = ({ collisionBox, language }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationFrameId;
        
        const getCharsForLanguage = () => {
            switch(language.name) {
                case 'Python': return ['{', '}', ':', '#', '[', ']'];
                case 'JavaScript': return ['(', ')', ';', '=', '>', '<'];
                case 'Java': return ['.', ';', '{', '}', '(', ')'];
              case 'Misc': return ['0', '1', '/', '*', '=', '>', '<', '?'];
                case 'C++':
                default:
                    return ['c', '+', ';', '{', '}'];
            }
        };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const createParticles = () => {
            particles = [];
            const particleCount = Math.floor(window.innerWidth / 35);
            const chars = getCharsForLanguage();
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * -canvas.height,
                    char: chars[Math.floor(Math.random() * chars.length)],
                    speed: 1 + Math.random() * 2,
                    isStopped: false,
                });
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = language.colorLight; 
            ctx.font = '20px monospace';

            particles.forEach(p => {
                if (!p.isStopped) {
                    p.y += p.speed;

                    // Reset particle
                    if (p.y > canvas.height) {
                        p.y = Math.random() * -100;
                        p.x = Math.random() * canvas.width;
                        p.speed = 1 + Math.random() * 2;
                        p.isStopped = false;
                    }
                }
                ctx.fillText(p.char, p.x, p.y);
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        resizeCanvas();
        createParticles();
        animate();

        window.addEventListener('resize', () => {
            resizeCanvas();
            createParticles();
        });

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [collisionBox, language]);

    return <canvas ref={canvasRef} className="fixed top-0 left-0 -z-10 bg-slate-900" />;
};


// --- Global Styles & Animations ---
const GlobalStyles = () => (
    <style>{`
        @keyframes blob1 {
        4%, 85% { transform: translateY(0) scale(1.2); }
        20% { transform: translateY(-30px) scale(1.0); }
        }
        @keyframes blob2 {
        0%, 90% { transform: translateX(0) scale(1); }
        50% { transform: translateX(40px) scale(1.05); }
        }
        @keyframes blob3 {
        0%, 95% { transform: translateY(0) scale(1.2); }
        100% { transform: translateY(25px) scale(1.08); }
        }
        .animate-blob1 { animation: blob1 7s ease-in-out infinite; }
        .animate-blob2 { animation: blob2 7s ease-in-out infinite; }
        .animate-blob3 { animation: blob3 7s ease-in-out infinite; }
        @keyframes gradient-move {
            0% { background-position: 0% 40%; }
            50% { background-position: 90% 50%; }
            100% { background-position: 9% 50%; }
            }
            .animate-gradient-move {
            background-size: 100% 100%;
            animation: gradient-move 8s ease-in-out infinite;
        }
        @keyframes fadeInScaleUp {
            from { opacity: 0; transform: scale(0.35); }
            to { opacity: 1; transform: scale(2); }
        }
        .animate-fade-in-scale {
            animation: fadeInScaleUp 1s ease-out forwards;
        }
        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(147, 197, 253, 0.5);
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(147, 197, 253, 0.7);
        }
    `}</style>
);


import PythonLogo from './assets/python.svg?react';
import JavaScriptLogo from './assets/javascript.svg?react';
import JavaLogo from './assets/java.svg?react';
import CppLogo from './assets/cpp.svg?react';

const MiscLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
    </svg>
);


const ICONS = {
  Python: PythonLogo,
  JavaScript: JavaScriptLogo,
  Java: JavaLogo,
  'C++': CppLogo,
  Misc: MiscLogo,
};

const LanguageIcon = ({ language }) => {
  const Icon = ICONS[language.name];
  if (!Icon) return null;

  return (
    <div
      className={`
        flex items-center justify-center
        w-20 h-20
        rounded-2xl
        bg-white/10
        backdrop-blur-md
        shadow-xl
        border border-white/20
        transition-all duration-300
        hover:scale-105 hover:bg-white/20
      `}
      style={{
        boxShadow: `0 4px 32px 0 ${language.shadowColor}`,
      }}
    >
      <Icon
        width={56}
        height={56}
        className="drop-shadow-lg"
        style={{ color: language.color, filter: `drop-shadow(0 0 12px ${language.colorLight})` }}
      />
    </div>
  );
};

const Loader = ({text}) => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="relative">
      <div className="absolute inset-0 rounded-full bg-blue-400/20 blur-lg"></div>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 border-t-2 border-blue-200"></div>
    </div>
    <p className="text-lg text-gray-300">{text}</p>
  </div>
);

const ExplanationModal = ({ title, explanation, isLoading, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in-scale">
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-8 border border-white/20 w-full max-w-2xl relative">
            <h2 className="text-2xl font-bold text-blue-300 mb-4">{title}</h2>
            <div className="max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                {isLoading ? (
                    <div className="min-h-[150px] flex items-center justify-center">
                        <Loader text="Generating Explanation..." />
                    </div>
                ) : (
                   explanation?.originalContext && (
                       <div>
                           <div className="mb-4 pb-4 border-b border-white/10">
                               <p className="text-sm text-gray-400 mb-2">Regarding:</p>
                               <CodeRenderer content={explanation.originalContext} isForButton={true} />
                           </div>
                           <p className="text-lg text-gray-200 leading-relaxed whitespace-pre-wrap">{explanation.explanationText}</p>
                       </div>
                   )
                )}
            </div>
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>
    </div>
);

const CodeRenderer = ({ content = '', isForButton = false }) => {
    const parts = content.split(/(```[\s\S]*?```)/g).filter(Boolean);
    const baseTextClass = isForButton ? 'text-lg' : 'text-xl md:text-2xl';
    const codeTextClass = isForButton ? 'text-xs' : 'text-sm';

    return (
        <div className={`${baseTextClass} font-semibold text-left leading-relaxed flex flex-col`}>
            {parts.map((part, index) => {
                if (part.startsWith('```')) {
                    const codeContent = part.replace(/```(cpp|python|javascript|java)?\n?/, '').replace(/```$/, '');
                    return (
                        <pre key={index} className="bg-black/30 p-2 my-1 rounded-md border border-white/10 whitespace-pre-wrap">
                            <code className={`font-mono ${codeTextClass} text-blue-200 break-words`}>{codeContent}</code>
                        </pre>
                    );
                } else {
                    return <span key={index}>{part}</span>;
                }
            })}
        </div>
    );
};


// --- Main App Component ---
const LANGUAGES = {
    'C++': { name: 'C++', color: '#93c5fd', colorLight: 'rgba(147, 197, 253, 0.4)', shadowColor: 'rgba(147,197,253,0.6)' },
    'Python': { name: 'Python', color: '#fde047', colorLight: 'rgba(253, 224, 71, 0.4)', shadowColor: 'rgba(253,224,71,0.6)' },
    'JavaScript': { name: 'JavaScript', color: '#facc15', colorLight: 'rgba(250, 204, 21, 0.4)', shadowColor: 'rgba(250,204,21,0.6)' },
    'Java': { name: 'Java', color: '#fca5a5', colorLight: 'rgba(252, 165, 165, 0.4)', shadowColor: 'rgba(252,165,165,0.6)' },
    'Misc': { name: 'Misc', color: '#a5b4fc', colorLight: 'rgba(165, 180, 252, 0.4)', shadowColor: 'rgba(165, 180, 252, 0.6)' },
};

export default function App() {
  // --- Refs & State for Collision ---
  const quizWindowRef = useRef(null);
  const [collisionBox, setCollisionBox] = useState(null);
  const fetchControllerRef = useRef(null);
  const answerTimeoutRef = useRef(null); // Ref for the answer timeout

  // --- Firebase State ---
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // --- Game State ---
  const [gameState, setGameState] = useState('start'); // 'start', 'quiz', 'end'
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES['C++']);
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState({});
  const [questionHistory, setQuestionHistory] = useState([]);
  const [customTopic, setCustomTopic] = useState('');

  // --- Quiz State ---
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [lastQuestion, setLastQuestion] = useState(null);
  const [isFetchingQuestion, setIsFetchingQuestion] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // --- Gemini API Feature State ---
  const [hint, setHint] = useState(null);
  const [isFetchingHint, setIsFetchingHint] = useState(false);
  const [explanation, setExplanation] = useState({title: '', data: null, isLoading: false});
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  
  const currentHighScore = highScores[selectedLanguage.name] || 0;

  // --- Collision Box Measurement ---
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
        for (let entry of entries) {
            setCollisionBox(entry.target.getBoundingClientRect());
        }
    });

    if (quizWindowRef.current) {
        observer.observe(quizWindowRef.current);
    }
    
    return () => {
        if (quizWindowRef.current) {
            observer.unobserve(quizWindowRef.current);
        }
    };
}, []);
  useEffect(() => {
        // This function will be returned and will run ONLY when the App component unmounts
        return () => {
            // Abort any pending API calls
            if (fetchControllerRef.current) {
                fetchControllerRef.current.abort();
            }
            // Clear any scheduled timeouts
            if (answerTimeoutRef.current) {
                clearTimeout(answerTimeoutRef.current);
            }
        };
  }, []);

  // --- Firebase Initialization ---
  useEffect(() => {
    try {
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
      };
      const app = initializeApp(firebaseConfig);
      const firestoreDb = getFirestore(app);
      const firebaseAuth = getAuth(app);
      setDb(firestoreDb);
      setAuth(firebaseAuth);

      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
             if(typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
               // do later
             } else {
                await signInAnonymously(firebaseAuth);
             }
        }
        setIsAuthReady(true);
      });

      return () => unsubscribe();
    } catch (e) {
      console.error("Firebase initialization error:", e);
      setError("Could not connect to services. Please refresh.");
    }
  }, []);

  // --- High Score Management ---
  const fetchHighScore = useCallback(async (languageName) => {
    if (!isAuthReady || !db || !userId) return;
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const docRef = doc(db, `artifacts/${appId}/users/${userId}/quizData/highScore_${languageName}`);
    try {
      const docSnap = await getDoc(docRef);
      const score = (docSnap.exists() && typeof docSnap.data().score === 'number') ? docSnap.data().score : 0;
      setHighScores(prev => ({ ...prev, [languageName]: score }));
    } catch (e) {
      console.error("Error fetching high score:", e);
      setHighScores(prev => ({ ...prev, [languageName]: 0 }));
    }
  }, [isAuthReady, db, userId]);

  const updateHighScoreInDb = useCallback(async (newScore, languageName) => {
    if (!isAuthReady || !db || !userId || newScore <= (highScores[languageName] || 0)) return;
    setHighScores(prev => ({ ...prev, [languageName]: newScore }));
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const docRef = doc(db, `artifacts/${appId}/users/${userId}/quizData/highScore_${languageName}`);
    try {
      await setDoc(docRef, { score: newScore });
    } catch (e) {
      console.error("Error updating high score in DB:", e);
    }
  }, [isAuthReady, db, userId, highScores]);

  useEffect(() => {
    if (isAuthReady) {
        fetchHighScore(selectedLanguage.name);
    }
  }, [isAuthReady, selectedLanguage, fetchHighScore]);
  
  useEffect(() => {
      if (gameState === 'quiz' && score > currentHighScore) {
          setHighScores(prev => ({...prev, [selectedLanguage.name]: score}));
      }
  }, [score, currentHighScore, selectedLanguage.name, gameState]);


  // --- Gemini API Calls ---

  const callGemini = useCallback(async (prompt, signal, responseSchema = null) => {
    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };
    if (responseSchema) {
      payload.generationConfig = {
        responseMimeType: "application/json",
        responseSchema,
      };
    }

    const apiUrl = '/api/callGemini';

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), // Send the payload to serverless function
        signal,
    });
    
    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }
    const result = await response.json();

    if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
        return result.candidates[0].content.parts[0].text;
    } else {
        console.error("Invalid response structure from API:", result);
        throw new Error("Invalid response structure from API.");
    }
  }, []);


  const fetchQuestion = useCallback(async (language, topic = '', similarToQuestion = null) => {
    if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
    }
    const controller = new AbortController();
    fetchControllerRef.current = controller;

    setIsFetchingQuestion(true);
    setError(null);

    const rand = Math.random();
    let difficulty;
    if (rand < 0.3) {
        difficulty = 'Easy';
    } else if ( .3 <= rand < 0.65) {
        difficulty = 'Medium';
    } else if (.65 <= rand < 0.9) {
        difficulty = 'Hard';
    } else {
        difficulty = 'Extreme';
    }
    
    let historyPrompt = '';
    setQuestionHistory(prevHistory => {
        if (prevHistory.length > 0) {
            const recentQuestions = prevHistory.map((q, i) => `${i + 1}. ${q}`).join('\n');
            historyPrompt = `\nPlease ensure the new question is conceptually different from the following recently asked questions:\n${recentQuestions}`;
        }
        return prevHistory; 
    });
    
    let contextPrompt = '';
    const languageContext = language.name === 'Misc' 
        ? 'general programming or computer science' 
        : `${language.name} programming`;

    if (similarToQuestion) {
        contextPrompt = `The user incorrectly answered the question "${similarToQuestion.question}". Generate a new, conceptually similar question to test the same topic, but word it differently and use different code examples if applicable.`;
    } else if (topic) {
        contextPrompt = `The user wants to be quizzed specifically on the topic of "${topic}". The question, options, and answer must relate to this topic.`;
    }

    const prompt = `Generate a ${difficulty} difficulty multiple-choice question about ${languageContext}. ${contextPrompt} The question should be short and concise. If the question or any answer options include a code snippet, strictly follow one of these formats:
1. [Question Text] followed by a newline and then a code block. Example: "What is the output of this code?\n\`\`\`\n[code]\n\`\`\`"
2. A code block followed by a newline and then the [Question Text]. Example: "\`\`\`\n[code]\n\`\`\`\nWhat does this code do?"
3. Only [Question Text] if no code is needed.
Provide the response as a valid JSON object. The JSON object must have keys: "question" (string), "options" (array of 4 unique strings, also using markdown for code), and "answer" (a string that is an exact match to one of the values in the "options" array). Do not include any text outside of the JSON object.${historyPrompt}`;
    
    const schema = {
        type: "OBJECT",
        properties: {
            question: { type: "STRING" },
            options: { type: "ARRAY", items: { type: "STRING" } },
            answer: { type: "STRING" },
        },
        required: ["question", "options", "answer"],
    };

    try {
        const text = await callGemini(prompt, controller.signal, schema);
        if (controller.signal.aborted) return;
        const questionData = JSON.parse(text);
        questionData.options.sort(() => Math.random() - 0.5);
        
        setQuestionHistory(prev => [questionData.question, ...prev].slice(0, 3));
        
        setCurrentQuestion(questionData);
    } catch (e) {
        if (e.name !== 'AbortError') {
            console.error('Gemini API call for question failed:', e);
            setError("Failed to generate a question. Please check your API key and try again.");
        }
    } finally {
        if (!controller.signal.aborted) {
            setIsFetchingQuestion(false);
        }
    }
  }, [callGemini]);
  
  const fetchHint = useCallback(async () => {
      if (!currentQuestion || isFetchingHint) return;
      setIsFetchingHint(true);
      const prompt = `You are a programming tutor. For the following multiple-choice question, provide a concise, one-sentence hint that guides the user toward the correct answer without explicitly revealing it. Question: "${currentQuestion.question}". Options: ${currentQuestion.options.join(', ')}.`;
      try {
          const hintText = await callGemini(prompt, new AbortController().signal);
          setHint(hintText);
      } catch (e) {
          console.error('Gemini API call for hint failed:', e);
          setHint("Sorry, couldn't get a hint this time.");
      } finally {
          setIsFetchingHint(false);
      }
  }, [currentQuestion, isFetchingHint, callGemini]);

  const fetchExplanation = useCallback(async ({ title, prompt }) => {
    setExplanation({ title, data: null, isLoading: true });
    setShowExplanationModal(true);
    const schema = {
        type: "OBJECT",
        properties: {
            originalContext: { type: "STRING" },
            explanationText: { type: "STRING" },
        },
        required: ["originalContext", "explanationText"],
    };
    try {
        const jsonText = await callGemini(prompt, new AbortController().signal, schema);
        const parsedData = JSON.parse(jsonText);
        setExplanation({ title, data: parsedData, isLoading: false });
    } catch (e) {
        if (e.name !== 'AbortError') {
            console.error('Gemini API call for explanation failed:', e);
            setExplanation({ title, data: { explanationText: "Sorry, couldn't generate an explanation right now." }, isLoading: false });
        }
    }
}, [callGemini]);


const handleExplainCorrect = () => {
    if (!lastQuestion) return;
    const prompt = `You are a programming tutor.
    A user was asked the question:
---
${lastQuestion.question}
---
The correct answer is: "${lastQuestion.answer}". The user answered incorrectly.

Please provide a JSON object with two keys:
1. "originalContext": A string containing the original question verbatim, including its markdown.
2. "explanationText": A string containing a clear, concise explanation of why the correct answer is correct. If the explanation is longer than 120 words, break it into smaller paragraphs separated by a newline for readability.

Do not add any text outside of this JSON object.`;
    fetchExplanation({ title: 'Explanation', prompt });
};

  const handleTrySimilar = useCallback(async () => {
    if (!lastQuestion) return;

    // Reset state for the new question, but keep score
    if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
    }
    setSelectedAnswer(null);
    setIsAnswered(false);
    setHint(null);
    setCurrentQuestion(null);
    setShowExplanationModal(false);
    setGameState('quiz'); // Ensure we are on the quiz screen

    // Fetch a new question that is similar to the last one
    await fetchQuestion(selectedLanguage, '', lastQuestion);
}, [lastQuestion, selectedLanguage, fetchQuestion]);


  // --- Game Flow Handlers ---
  const resetQuizState = () => {
        if (fetchControllerRef.current) {
            fetchControllerRef.current.abort();
        }
        if (answerTimeoutRef.current) {
            clearTimeout(answerTimeoutRef.current);
        }
        setCurrentQuestion(null);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setHint(null);
        setExplanation({ title: '', data: null, isLoading: false });
        setShowExplanationModal(false);
        setQuestionHistory([]);
        setScore(0);
        setIsFetchingQuestion(false);
        setError(null);
    }

  const handleStartGame = (language) => {
    resetQuizState();
    setSelectedLanguage(language);
    setGameState('quiz');
  };

  const goBackToStart = () => {
    if (score > currentHighScore) {
        updateHighScoreInDb(score, selectedLanguage.name);
    }
    setGameState('start');
  };
  
  const handleAnswer = (option) => {
        if (isAnswered) return;

        setSelectedAnswer(option);
        setIsAnswered(true);
        setLastQuestion(currentQuestion);

        const isCorrect = option === currentQuestion.answer;

        answerTimeoutRef.current = setTimeout(() => {
            if (isCorrect) {
                setScore(prev => prev + 1);
                setSelectedAnswer(null);
                setIsAnswered(false);
                setCurrentQuestion(null);
                setHint(null);
            } else {
                if (score > currentHighScore) {
                    updateHighScoreInDb(score, selectedLanguage.name);
                }
                setGameState('end');
            }
        }, 2000);
    };

  useEffect(() => {
    if (gameState === 'quiz' && !currentQuestion && !isAnswered && !isFetchingQuestion) {
        fetchQuestion(selectedLanguage, customTopic, null);
    }
  }, [gameState, score, currentQuestion, isAnswered, isFetchingQuestion, selectedLanguage, customTopic, fetchQuestion]);
  

  useEffect(() => {
    if (gameState === 'start') {
      resetQuizState();
    }
  }, [gameState]);


  // --- UI Rendering ---
  const getAnswerButtonClass = (option) => {
    let classes = 'p-4 rounded-lg text-left font-medium transition-all duration-300 bg-white/5 border border-transparent backdrop-blur-sm relative';
    
    if (!isAnswered) {
        classes += ' cursor-pointer hover:bg-white/10 hover:border-white/20';
    } else {
        classes += ' cursor-not-allowed';
        if (option === currentQuestion.answer) {
            classes += ' bg-green-500/20 border-green-500 shadow-[0_0_15px_rgba(74,222,128,0.5)]';
        } else if (option === selectedAnswer) {
            classes += ' bg-red-500/20 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]';
        } else {
            classes += ' opacity-50';
        }
    }
    return classes;
  };

  const renderContent = () => {
    let content;
    switch(gameState) {
        case 'start':
            content = (
                <div className="text-center animate-fade-in-scale">
                    <LanguageIcon language={selectedLanguage} />
                    <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-300">{selectedLanguage.name} Quiz</h1>
                    <p className="text-gray-300 mb-6">Select a category and enter a topic to begin.</p>
                    
                    <div className="flex justify-center gap-2 mb-6 flex-wrap">
                        {Object.values(LANGUAGES).map(lang => (
                            <button key={lang.name} onClick={() => setSelectedLanguage(lang)} className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-300 border ${selectedLanguage.name === lang.name ? 'bg-white/20 border-white/30' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                                {lang.name}
                            </button>
                        ))}
                    </div>

                  <div className="mb-6 max-w-lg mx-auto">
                      <label htmlFor="custom-topic" className="block text-sm font-medium text-gray-300 mb-2">
                          What topic do you want to be quizzed on?
                      </label>
                      <textarea
                          id="custom-topic"
                          rows="2"
                          value={customTopic}
                          onChange={(e) => setCustomTopic(e.target.value)}
                          placeholder={`e.g., "Data Structures", "Big O Notation", "REST APIs"`}
                          className="w-full bg-black/30 border border-white/20 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 custom-scrollbar"
                      />
                  </div>

                    <button
                        onClick={() => handleStartGame(selectedLanguage)}
                          disabled={!customTopic.trim()}
                        className="relative bg-blue-500/20 border border-blue-400 text-blue-200 font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-500/30 hover:shadow-[0_0_20px_rgba(96,165,250,0.4)] transition-all duration-300 transform hover:scale-105 overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500/20 disabled:hover:shadow-none disabled:scale-100"
                    >
                        <span className="absolute inset-0 rounded-lg pointer-events-none group-hover:ring-4 group-hover:ring-blue-400/30 transition-all duration-300"></span>
                        <span className="relative z-10">Start Quiz</span>
                    </button>
                    <p className="text-sm text-gray-400 mt-8">Your {selectedLanguage.name} High Score: {currentHighScore}</p>
                </div>
            );
            break;
        case 'end':
            content = (
                <>
                {showExplanationModal && <ExplanationModal title={explanation.title} explanation={explanation.data} isLoading={explanation.isLoading} onClose={() => setShowExplanationModal(false)} />}
                <div className="text-center animate-fade-in-scale">
                    <h1 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-red-400">Game Over</h1>
                    <p className="text-gray-300 text-xl mb-6">You were wrong!</p>
                    <div className="bg-black/20 rounded-lg p-6 mb-8">
                        <p className="text-gray-300 text-lg">Your Final Score</p>
                        <p className="text-6xl font-bold text-blue-300 my-2">{score}</p>
                        <p className="text-gray-300 text-lg">{selectedLanguage.name} High Score: {currentHighScore}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                        <button onClick={() => handleStartGame(selectedLanguage)} className="w-full sm:w-auto bg-blue-500/20 border border-blue-400 text-blue-200 font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-500/30 hover:shadow-[0_0_20px_rgba(96,165,250,0.4)] transition-all duration-300 transform hover:scale-105">
                            Play Again
                        </button>
                        <button onClick={handleExplainCorrect} disabled={explanation.isLoading || !lastQuestion} className="w-full sm:w-auto bg-purple-500/20 border border-purple-400 text-purple-200 font-bold py-3 px-8 rounded-lg text-lg hover:bg-purple-500/30 hover:shadow-[0_0_20px_rgba(192,132,252,0.4)] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                            Explain Why
                        </button>
                         <button onClick={handleTrySimilar} disabled={explanation.isLoading || !lastQuestion} className="w-full sm:w-auto bg-green-500/20 border border-green-400 text-green-200 font-bold py-3 px-8 rounded-lg text-lg hover:bg-green-500/30 hover:shadow-[0_0_20px_rgba(74,222,128,0.4)] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                            Try a Similar Question
                        </button>
                    </div>
                </div>
                </>
            );
            break;
        case 'quiz':
            content = (
                <div className="animate-fade-in-scale">
                    <div className="flex justify-between items-center mb-6">
                        <button onClick={goBackToStart} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10">
                           <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                           <span>Back</span>
                        </button>
                        <div className="text-right">
                           <h2 className="text-2xl font-bold text-blue-300">Score: {score}</h2>
                           <h2 className="text-lg font-semibold text-gray-300">{selectedLanguage.name} High Score: {currentHighScore}</h2>
                        </div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-6 min-h-[450px] flex flex-col justify-between">
                        {isFetchingQuestion && <div className="flex-grow flex items-center justify-center"><Loader text={`Generating ${selectedLanguage.name} Question...`} /></div>}
                        {error && <p className="text-red-400 text-center">{error}</p>}
                        {currentQuestion && !isFetchingQuestion && (
                        <div className="w-full">
                            <CodeRenderer content={currentQuestion.question} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                            {currentQuestion.options.map((option, index) => (
                                <button
                                key={index}

                                onClick={() => handleAnswer(option)}
                                disabled={isAnswered}
                                className={getAnswerButtonClass(option)}
                                >
                                <div className="flex-grow">
                                    <CodeRenderer content={option} isForButton={true} />
                                </div>
                                 
                                </button>
                            ))}
                            </div>
                            <div className="mt-6 text-center h-12">
                                {hint && <p className="text-teal-300 mt-4 p-3 bg-black/20 rounded-lg animate-fade-in-scale"><strong>Hint:</strong> {hint}</p>}
                                {!hint && !isAnswered && (
                                    <button onClick={fetchHint} disabled={isFetchingHint} className="bg-teal-500/10 border border-teal-400 text-teal-300 font-semibold py-2 px-6 rounded-lg text-sm hover:bg-teal-500/20 hover:shadow-[0_0_20px_rgba(45,212,191,0.3)] transition-all duration-300 disabled:opacity-50">
                                        {isFetchingHint ? 'Thinking...' : 'Get a Hint'}
                                    </button> 
                                )}
                            </div>
                        </div>
                        )}
                    </div>
                </div>
            );
            break;
        default:
            content = null;
    }

    return content;
  };

    return (
    <>
        <AnimatedGradientBg />
    
        {/* Decorative blurred blobs for depth and color */}
        <div className="pointer-events-none -z-10">
        {/* Blue blob, top right */}
        <div className="fixed top-[-20%] right-[-10%] w-[2000px] h-[0px] bg-gradient-to-br from-blue-400/30 via-blue-500/20 to-green-400/20 rounded-full blur-3xl animate-blob1"></div>
        {/* Pink blob, bottom left */}
        <div className="fixed bottom-[-15%] left-[-10%] w-[2000px] h-[0px] bg-gradient-to-tr from-pink-400/30 via-fuchsia-400/20 to-white-400/20 rounded-full blur-3xl animate-blob2"></div>
        
        </div>
        <FallingCharsBackground collisionBox={collisionBox} language={selectedLanguage} />
        <GlobalStyles />
        <div className="text-white min-h-screen flex items-center justify-center p-4 font-sans">
        {showExplanationModal && (
            <ExplanationModal
            title={explanation.title}
            explanation={explanation.data}
            isLoading={explanation.isLoading}
            onClose={() => setShowExplanationModal(false)}
            />
        )}
        <div
            ref={quizWindowRef}
            className="w-full max-w-3xl bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-10 border border-white/20 ring-2 ring-blue-400/10"
            style={{
            boxShadow: "0 8px 40px 0 rgba(30,64,175,0.18), 0 1.5px 8px 0 rgba(0,0,0,0.10)",
            }}
        >
            {renderContent()}
        </div>
        </div>
    </>
    );
}