// Simple voice client using Web Speech API (built into browser - FREE!)
let speechSynthesis = null;
let speechRecognition = null;

// Initialize browser's built-in speech synthesis
export function initializeVoice() {
  if (typeof window !== 'undefined') {
    speechSynthesis = window.speechSynthesis;
    
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      speechRecognition = new SpeechRecognition();
      speechRecognition.continuous = false;
      speechRecognition.interimResults = false;
      speechRecognition.lang = 'en-US';
    }
  }
  
  return {
    canSpeak: !!speechSynthesis,
    canListen: !!speechRecognition,
  };
}

// Speak text using browser's text-to-speech
export function speak(text, onEnd) {
  if (!speechSynthesis) {
    console.error('Speech synthesis not available');
    return;
  }

  // Cancel any ongoing speech
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9; // Slightly slower for clarity
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  if (onEnd) {
    utterance.onend = onEnd;
  }

  speechSynthesis.speak(utterance);
}

// Start listening for voice input
export function startListening(onResult, onError) {
  if (!speechRecognition) {
    console.error('Speech recognition not available');
    onError && onError(new Error('Speech recognition not supported'));
    return null;
  }

  speechRecognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    onResult && onResult(transcript);
  };

  speechRecognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    onError && onError(event);
  };

  speechRecognition.start();
  return speechRecognition;
}

// Stop listening
export function stopListening() {
  if (speechRecognition) {
    try {
      speechRecognition.stop();
    } catch (err) {
      // Already stopped
    }
  }
}

// Stop speaking
export function stopSpeaking() {
  if (speechSynthesis) {
    speechSynthesis.cancel();
  }
}

