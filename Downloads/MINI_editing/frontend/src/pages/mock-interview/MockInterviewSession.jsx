import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { startSession, saveTurn, requestFeedback } from '../../api/mockInterviewApi';
import { initializeVoice, speak, startListening, stopListening, stopSpeaking } from '../../lib/humeClient';
import api from '../../config/axios';

const MockInterviewSession = () => {
  const { id: interviewId } = useParams();
  const navigate = useNavigate();

  const recognitionRef = useRef(null);

  const [sessionLoading, setSessionLoading] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');

  // Get AI response with realistic interview behavior
  const getAIResponse = async (userMessage, isFirstMessage = false) => {
    try {
      // Build conversation history for context (don't include current message, backend will add it)
      const conversationHistory = messages.slice(-6).map(m => ({
        role: m.from === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      console.log('Sending to AI:', { userMessage, historyLength: conversationHistory.length });

      const systemPrompt = `You are Alex Chen, a Senior Software Engineer at a top tech company conducting a technical interview. You've been interviewing candidates for 5 years and have a warm but professional demeanor.

YOUR PERSONALITY:
- Friendly and encouraging, but maintain professionalism
- Show genuine interest in the candidate's experience
- React naturally to answers (e.g., "That's a great approach!", "Interesting choice", "I see what you mean")
- Ask follow-ups based on their specific answers
- Mix technical depth with conversational flow

YOUR INTERVIEW STYLE:
1. Start with background/experience questions
2. Dive into technical topics they mention (DSA, web dev, projects, etc.)
3. Ask a variety: conceptual questions, coding scenarios, system design, debugging, trade-offs
4. React authentically before asking the next question
5. NEVER repeat questions - track what you've asked
6. Keep responses conversational (2-3 sentences: reaction + question)

QUESTION PROGRESSION (${Math.floor(messages.length / 2) + 1} exchanges so far):
${messages.length < 2 ? '- Get their background and experience' : ''}
${messages.length >= 2 && messages.length < 8 ? '- Ask technical questions about topics they mentioned\n- Vary between: algorithms, data structures, frameworks, databases, APIs, debugging, optimization' : ''}
${messages.length >= 8 ? '- Start wrapping up, ask about challenges they faced or their proudest work' : ''}
${messages.length > 10 ? '- FINAL STAGE: Thank them warmly and ask if they have questions for you' : ''}

EXAMPLES of natural conversation flow:
Candidate: "I have experience with React and Node.js"
You: "That's a great stack! Can you walk me through how you'd handle state management in a large React application?"

Candidate: "I'm familiar with sorting algorithms"
You: "Nice! Let's dive into that. What's your approach to choosing between quicksort and mergesort in a real scenario?"

Now respond to the candidate naturally and ask a NEW technical question:`;

      const response = await api.post('/ai/chat', {
        message: userMessage,
        systemPrompt: systemPrompt,
        conversationHistory: conversationHistory,
        useHume: true  // Use Hume AI for more natural interview conversation
      });

      console.log('AI Response:', response.data.response);
      
      return response.data.response || "That's interesting. Can you tell me about a challenging project you've worked on?";
    } catch (err) {
      console.error('Failed to get AI response:', err);
      return "That's interesting. Can you tell me about a challenging project you've worked on?";
    }
  };

  // Ask initial question
  const startInterview = async () => {
    const greeting = "Hi there! I'm Alex, and I'll be conducting your interview today. Thanks for taking the time to meet with me. I'm really looking forward to learning more about your background and experience. So, let's start with the basics - tell me a bit about yourself, your current role or studies, and what kind of technical work you're most passionate about?";
    
    setMessages([{ from: 'ai', text: greeting }]);
    await saveTurn({ interviewId, speaker: 'ai', text: greeting }).catch(console.error);
    
    if (voiceEnabled) {
      setIsSpeaking(true);
      speak(greeting, () => {
        setIsSpeaking(false);
      });
    }
  };

  // Start voice input
  const startVoiceInput = () => {
    if (!voiceEnabled) return;
    
    setIsListening(true);
    recognitionRef.current = startListening(
      (transcript) => {
        // Got voice input
        setIsListening(false);
        if (transcript.trim()) {
          handleUserResponse(transcript);
        }
      },
      (error) => {
        setIsListening(false);
        console.error('Speech recognition error:', error);
      }
    );
  };

  // Handle user response (voice or text)
  const handleUserResponse = async (text) => {
    if (!text.trim() || sending) return;

    setError('');
    setMessages((prev) => [...prev, { from: 'user', text }]);
    setSending(true);

    try {
      // Save user's answer
      await saveTurn({ interviewId, speaker: 'user', text });
      
      // Add realistic delay - varies between 1-2 seconds (human-like thinking)
      const thinkingTime = 1000 + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, thinkingTime));
      
      // Get AI feedback/next question with natural flow
      const aiResponse = await getAIResponse(text, messages.length === 0);
      setMessages((prev) => [...prev, { from: 'ai', text: aiResponse }]);
      await saveTurn({ interviewId, speaker: 'ai', text: aiResponse });
      
      // Speak AI response with natural delay (feels more conversational)
      if (voiceEnabled) {
        setTimeout(() => {
          setIsSpeaking(true);
          speak(aiResponse, () => {
            setIsSpeaking(false);
          });
        }, 400 + Math.random() * 300);  // Random delay 400-700ms
      }
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (!interviewId) {
      setError('Missing interview id');
      setSessionLoading(false);
      return;
    }

    const setupSession = async () => {
      try {
        setSessionLoading(true);
        
        // Initialize voice capabilities (built into browser - always available!)
        const { canSpeak, canListen } = initializeVoice();
        setVoiceEnabled(canSpeak && canListen);
        // Start session
        await startSession({ interviewId });
        
        // Start interview after a short delay (feels more natural)
        setTimeout(() => {
          startInterview();
        }, 1500);
        
      } catch (err) {
        setError(err?.response?.data?.error || err.message || 'Failed to start session');
      } finally {
        setSessionLoading(false);
      }
    };

    setupSession();

    return () => {
      stopListening();
      stopSpeaking();
    };
  }, [interviewId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending || sessionLoading) return;

    const text = input.trim();
    setInput('');
    await handleUserResponse(text);
  };

  const handleFeedback = async () => {
    try {
      setError('');
      stopSpeaking();
      stopListening();
      await requestFeedback({ interviewId });
      navigate(`/mock-interview/feedback/${interviewId}`);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Failed to request feedback');
    }
  };

  // Skip to wrap up
  const skipToEnd = async () => {
    const wrapUp = "Well, we're getting close to the end of our time. I really appreciate you sharing all of that with me - you've clearly got solid experience. Before we wrap up, I'd love to hear: what's been your most challenging technical problem so far, and how did you approach solving it?";
    setMessages((prev) => [...prev, { from: 'ai', text: wrapUp }]);
    await saveTurn({ interviewId, speaker: 'ai', text: wrapUp }).catch(console.error);
    
    if (voiceEnabled) {
      setIsSpeaking(true);
      speak(wrapUp, () => {
        setIsSpeaking(false);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mock Interview with Alex Chen</h1>
            <p className="text-sm text-gray-600">Senior Software Engineer • {voiceEnabled ? '🎤 Voice & Text Enabled' : '⌨️ Text Only Mode'}</p>
          </div>
          <button
            onClick={handleFeedback}
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-indigo-600 text-white font-medium shadow-sm hover:bg-indigo-700"
            disabled={sessionLoading || sending}
          >
            End Interview &amp; Get Feedback
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Voice Interface */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Voice Interface</h2>
              <span className={`text-xs px-2 py-1 rounded ${voiceEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {voiceEnabled ? 'Ready' : 'Text Only'}
              </span>
            </div>
            
            <div className="w-full aspect-video rounded border border-dashed border-gray-300 bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-center p-6">
              {/* Voice Animation */}
              <div className={`mb-4 w-32 h-32 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : isSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-indigo-500'} flex items-center justify-center shadow-lg`}>
                <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 text-center">
                {isListening ? '🎤 Listening... Speak naturally' : isSpeaking ? '🗣️ Alex is speaking...' : sending ? '💭 Alex is thinking...' : voiceEnabled ? '✨ Ready for your response' : '📝 Type your answer below'}
              </p>
              
              {/* Voice Controls */}
              {voiceEnabled && (
                <div className="flex flex-col gap-2 w-full">
                  <button
                    onClick={startVoiceInput}
                    disabled={!voiceEnabled || isListening || isSpeaking || sending || messages.length === 0}
                    className={`w-full px-6 py-3 rounded-lg font-medium shadow-sm transition bg-indigo-600 hover:bg-indigo-700 text-white ${
                      !voiceEnabled || isListening || isSpeaking || sending || messages.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isListening ? '🎤 Listening...' : '🎙️ Answer with Voice'}
                  </button>
                  
                  {messages.length > 4 && (
                    <button
                      onClick={skipToEnd}
                      disabled={sending || sessionLoading}
                      className="w-full px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
                    >
                      Skip to Wrap-up
                    </button>
                  )}
                </div>
              )}
              
              {!voiceEnabled && messages.length === 0 && (
                <p className="text-xs text-yellow-600 mt-2">
                  ⚠️ Voice features unavailable. Use text input below.
                </p>
              )}
            </div>
          </div>

          {/* Conversation Panel */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Conversation</h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1" style={{ maxHeight: '60vh' }}>
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="animate-pulse text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                      <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">The interview will begin in a moment...</p>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div key={idx} className={`px-4 py-3 rounded-lg shadow-sm ${msg.from === 'user' ? 'bg-indigo-50 text-indigo-900 ml-8' : 'bg-white border border-gray-200 text-gray-800 mr-8'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{msg.from === 'user' ? '👤' : '👨‍💼'}</span>
                    <span className="text-xs font-semibold uppercase tracking-wide">{msg.from === 'user' ? 'You' : 'Alex Chen'}</span>
                  </div>
                  <p className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</p>
                </div>
              ))}
              {sending && (
                <div className="px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 mr-8 animate-pulse">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👨‍💼</span>
                    <span className="text-xs font-semibold">Alex is considering your answer...</span>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="mt-4 space-y-2">
              <textarea
                className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                placeholder="Type your answer here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={sessionLoading || sending || isListening}
              />
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={sessionLoading || sending || !input.trim() || isListening}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded bg-indigo-600 text-white font-medium shadow-sm transition ${
                    sessionLoading || sending || !input.trim() || isListening ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'
                  }`}
                >
                  {sending ? 'Sending...' : 'Send Answer'}
                </button>
                <span className="text-xs text-gray-500">Session: {interviewId}</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockInterviewSession;
