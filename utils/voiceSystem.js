class VoiceSystem {
  constructor(callbacks = {}) {
    this.callbacks = callbacks;
    this.recognition = null;
    this.synthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isListening = false;
    this.isSpeaking = false;
    
    // Only initialize if we're in the browser
    if (typeof window !== 'undefined') {
      this.initializeSpeechRecognition();
    }
  }

  initializeSpeechRecognition() {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      
      this.recognition.onstart = () => {
        this.isListening = true;
        this.callbacks.onListeningStart?.();
      };
      
      this.recognition.onend = () => {
        this.isListening = false;
        this.callbacks.onListeningEnd?.();
      };
      
      this.recognition.onresult = (event) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          this.callbacks.onTranscript?.(finalTranscript);
        }
      };
      
      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        this.isListening = false;
        this.callbacks.onListeningEnd?.();
      };
    }
  }

  async speak(text, options = {}) {
    return new Promise((resolve) => {
      if (!this.synthesis) {
        resolve();
        return;
      }

      // Stop any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure voice settings
      utterance.rate = options.rate || 0.9;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;
      
      // Try to use a more natural voice
      const voices = this.synthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Microsoft') ||
        voice.name.includes('Alex') ||
        voice.name.includes('Samantha')
      ) || voices.find(voice => voice.lang.startsWith('en'));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.callbacks.onSpeechStart?.();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.callbacks.onSpeechEnd?.();
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        this.isSpeaking = false;
        this.callbacks.onSpeechEnd?.();
        resolve();
      };

      this.synthesis.speak(utterance);
    });
  }

  startListening() {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
      this.callbacks.onSpeechEnd?.();
    }
  }

  cleanup() {
    this.stopListening();
    this.stopSpeaking();
  }

  // Check if speech recognition is supported
  static isSupported() {
    return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }

  // Check if speech synthesis is supported
  static isSynthesisSupported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }
}

export default VoiceSystem;