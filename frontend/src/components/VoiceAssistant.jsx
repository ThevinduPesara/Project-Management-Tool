import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, MessageSquare, Volume2, Loader2, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

const VoiceAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);

    // Web Speech API references
    const recognitionRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);

    useEffect(() => {
        // Initialize Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event) => {
                const current = event.resultIndex;
                const transcriptText = event.results[current][0].transcript;
                setTranscript(transcriptText);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                setIsListening(false);
                if (event.error === 'not-allowed') {
                    setResponse("Microphone access blocked. Please allow it in browser settings.");
                    speak("Please allow microphone access.");
                } else if (event.error === 'no-speech') {
                    // Do nothing, just stop listening
                } else {
                    setResponse("I couldn't hear you clearly. Please try again.");
                }
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
                if (transcript.trim()) {
                    handleAskAI(transcript);
                }
            };
        }

        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
            synthRef.current.cancel();
        };
    }, [transcript]); // Dependency on transcript to ensure latest value is used

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setTranscript('');
            setResponse('');
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    const handleAskAI = async (question) => {
        setLoading(true);
        try {
            const res = await api.post('/ai/ask', { question });
            const answer = res.data.answer;
            setResponse(answer);
            speak(answer);
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.msg || err.response?.data?.message || "Sorry, I couldn't reach the server.";
            setResponse(errorMsg);
            speak(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const speak = (text) => {
        if (synthRef.current.speaking) synthRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        synthRef.current.speak(utterance);
    };

    return (
        <>
            {/* Floating Action Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    border: 'none',
                    cursor: 'pointer'
                }}
            >
                {isOpen ? <X color="white" size={24} /> : <Bot color="white" size={28} />}
            </motion.button>

            {/* Assistant Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        style={{
                            position: 'fixed',
                            bottom: '7rem',
                            right: '2rem',
                            width: '350px',
                            background: 'rgba(15, 23, 42, 0.95)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '24px',
                            padding: '1.5rem',
                            zIndex: 1000,
                            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                            color: 'white'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '0.5rem', borderRadius: '12px' }}>
                                <Bot size={20} color="#8b5cf6" />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>AI Assistant</h3>
                        </div>

                        {/* Transcript / Response Area */}
                        <div style={{ minHeight: '120px', marginBottom: '1.5rem' }}>
                            {isListening ? (
                                <div style={{ color: '#a5b4fc', fontStyle: 'italic' }}>
                                    Listening... <br />
                                    <span style={{ color: 'white' }}>{transcript}</span>
                                </div>
                            ) : loading ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8' }}>
                                    <Loader2 className="animate-spin" size={16} /> Thinking...
                                </div>
                            ) : response ? (
                                <div>
                                    <p style={{ lineHeight: 1.5, fontSize: '0.95rem' }}>{response}</p>
                                </div>
                            ) : (
                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                    Try asking: <br />
                                    "What tasks do I have?" <br />
                                    "Who completed work today?"
                                </p>
                            )}
                        </div>

                        {/* Controls */}
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button
                                onClick={toggleListening}
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    background: isListening ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                                    border: isListening ? '4px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Mic size={24} color="white" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default VoiceAssistant;
