"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  FileText, 
  Code, 
  Database, 
  Globe, 
  Server, 
  Cpu, 
  Volume2, 
  VolumeX,
  Clock,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Target,
  BookOpen,
  Mic,
  MicOff,
  AlertTriangle,
  Camera,
  CameraOff,
  Video,
  Loader2,
  Send,
  Award,
  TrendingUp
} from 'lucide-react'
import SoundWaveAnimation from './SoundWaveAnimation'
import { fallbackInterviewData, getAIStatus } from '../utils/fallbackData'
import { chatSession } from '@/utils/GeminiAIModal'
import { db } from '@/utils/db'
import { UserAnswer } from '@/utils/schema'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import moment from 'moment'

const technicalQuestions = {
  general: [
    {
      id: 1,
      category: "System Design",
      question: "How would you design a scalable URL shortener like bit.ly?",
      followUps: [
        "How would you handle millions of requests per second?",
        "What database would you choose and why?",
        "How would you implement analytics and click tracking?"
      ],
      keyPoints: ["Load balancing", "Database design", "Caching strategy", "Analytics"]
    },
    {
      id: 2,
      category: "Architecture",
      question: "Explain the difference between monolithic and microservices architecture.",
      followUps: [
        "When would you choose microservices over monolithic?",
        "How do you handle data consistency in microservices?",
        "What are the challenges in microservices communication?"
      ],
      keyPoints: ["Scalability", "Deployment", "Data management", "Communication patterns"]
    }
  ],
  frontend: [
    {
      id: 3,
      category: "React/Frontend",
      question: "Explain the React component lifecycle and hooks.",
      followUps: [
        "When would you use useEffect vs useLayoutEffect?",
        "How would you optimize a React application's performance?",
        "Explain virtual DOM and its benefits."
      ],
      keyPoints: ["Component lifecycle", "Hooks", "Performance optimization", "Virtual DOM"]
    },
    {
      id: 4,
      category: "JavaScript",
      question: "Explain closures and provide a practical example.",
      followUps: [
        "What are the potential memory implications of closures?",
        "How do closures work with async operations?",
        "Can you implement a module pattern using closures?"
      ],
      keyPoints: ["Scope chain", "Memory management", "Practical applications", "Module patterns"]
    }
  ],
  backend: [
    {
      id: 5,
      category: "Database Design",
      question: "Design a database schema for a social media platform.",
      followUps: [
        "How would you handle friend relationships?",
        "What indexing strategies would you use?",
        "How would you implement the news feed algorithm?"
      ],
      keyPoints: ["Relational design", "Indexing", "Query optimization", "Scalability"]
    },
    {
      id: 6,
      category: "API Design",
      question: "Design a RESTful API for an e-commerce platform.",
      followUps: [
        "How would you handle authentication and authorization?",
        "What HTTP status codes would you use for different scenarios?",
        "How would you implement rate limiting?"
      ],
      keyPoints: ["REST principles", "Authentication", "Rate limiting", "Error handling"]
    }
  ]
}

export default function TechnicalInterviewInterface({ interviewId, userProfile, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedCategories, setSelectedCategories] = useState(['general'])
  const [allQuestions, setAllQuestions] = useState([])
  const [answer, setAnswer] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isStarted, setIsStarted] = useState(false)
  const [showFollowUps, setShowFollowUps] = useState(false)
  const [currentFollowUp, setCurrentFollowUp] = useState(0)
  const [questionStartTime, setQuestionStartTime] = useState(0)
  const [completedQuestions, setCompletedQuestions] = useState([])
  const [interviewPhase, setInterviewPhase] = useState('greeting') // greeting, questions, complete, submission, feedback
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [mediaStream, setMediaStream] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [userAnswers, setUserAnswers] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackResults, setFeedbackResults] = useState(null)
  
  const { user } = useUser()
  const router = useRouter()
  const voiceSystem = useRef(null)
  const timerRef = useRef(null)
  const answerRef = useRef(null)
  const videoRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const recordedChunksRef = useRef([])

  // Initialize camera and microphone
  const initializeMedia = async () => {
    try {
      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });
      
      console.log('Camera stream obtained:', stream);
      console.log('Video tracks:', stream.getVideoTracks());
      
      setMediaStream(stream);
      setCameraEnabled(true);
      
      // Wait a moment for state to update
      setTimeout(() => {
        if (videoRef.current) {
          console.log('Setting video source...');
          videoRef.current.srcObject = stream;
          
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded');
            videoRef.current.play()
              .then(() => console.log('Video playing successfully'))
              .catch(e => console.error('Play failed:', e));
          };
        }
      }, 100);
      
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Please allow camera and microphone access for the interview.');
    }
  };

  // Start recording answer
  const startRecording = () => {
    if (mediaStream && !isRecording) {
      recordedChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(mediaStream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Initialize VoiceSystem only in the browser
  useEffect(() => {
    const initializeVoiceSystem = async () => {
      if (typeof window !== 'undefined') {
        try {
          const VoiceSystem = (await import('../utils/voiceSystem')).default;
          voiceSystem.current = new VoiceSystem()
          
          const voiceSystemInstance = voiceSystem.current
          
          voiceSystemInstance.onStart = () => setIsListening(true)
          voiceSystemInstance.onEnd = () => setIsListening(false)
          voiceSystemInstance.onResult = (transcript) => {
            setAnswer(prev => prev + ' ' + transcript)
          }
          voiceSystemInstance.onSpeakStart = () => setIsSpeaking(true)
          voiceSystemInstance.onSpeakEnd = () => setIsSpeaking(false)
        } catch (error) {
          console.error('Failed to initialize VoiceSystem:', error);
        }
      }
    };

    initializeVoiceSystem();

    return () => {
      if (voiceSystem.current) {
        voiceSystem.current.cleanup()
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    }
  }, [])

  // Initialize questions based on selected categories
  useEffect(() => {
    const aiStatus = getAIStatus();
    
    if (!aiStatus.isAvailable) {
      // Use fallback questions when AI is not available
      setAllQuestions(fallbackInterviewData.technical.questions);
      console.warn("Using fallback questions - AI service unavailable");
    } else {
      const questions = []
      selectedCategories.forEach(category => {
        if (technicalQuestions[category]) {
          questions.push(...technicalQuestions[category])
        }
      })
      setAllQuestions(questions)
    }
  }, [selectedCategories])

  useEffect(() => {
    if (isStarted && timerRef.current === null) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1)
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isStarted])

  // Ensure video stream is assigned when interview phase changes
  useEffect(() => {
    if (interviewPhase === 'questions' && mediaStream && videoRef.current) {
      console.log('Reassigning video stream for questions phase');
      setTimeout(() => {
        if (videoRef.current && mediaStream) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play()
            .then(() => console.log('Questions phase video playing'))
            .catch(e => console.error('Questions phase video error:', e));
        }
      }, 500); // Small delay to ensure DOM is ready
    }
  }, [interviewPhase, mediaStream])

  const handleStart = async () => {
    if (!cameraEnabled) {
      alert('Please enable camera access first');
      return;
    }
    
    setIsStarted(true)
    setQuestionStartTime(Date.now())
    
    // Ensure video stream is properly set up for interview phase
    if (mediaStream && videoRef.current) {
      console.log('Setting up video for interview phase...');
      videoRef.current.srcObject = mediaStream;
      try {
        await videoRef.current.play();
        console.log('Video playing in interview phase');
      } catch (e) {
        console.error('Failed to play video in interview phase:', e);
      }
    }
    
    const aiStatus = getAIStatus();
    let greeting = `Hello! Welcome to your technical interview. I'll be asking you questions about your technical background and experience.`;
    
    if (!aiStatus.isAvailable) {
      greeting += ` Please note: AI services are currently unavailable, so we're using pre-defined questions for this session.`;
    }
    
    greeting += ` Let's start with our first question.`;
    
    if (voiceEnabled && voiceSystem.current) {
      await voiceSystem.current.speak(greeting)
      
      setTimeout(async () => {
        setInterviewPhase('questions')
        // Re-assign video stream after phase change
        if (mediaStream && videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(e => console.log('Interview phase video play error:', e));
        }
        if (allQuestions.length > 0 && voiceSystem.current) {
          await voiceSystem.current.speak(allQuestions[0].question)
        }
      }, 3000) // Increased timeout for longer greeting
    } else {
      setInterviewPhase('questions')
      // Re-assign video stream after phase change
      if (mediaStream && videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(e => console.log('Interview phase video play error:', e));
      }
    }
  }

  const handleNextQuestion = async () => {
    const questionTime = Math.floor((Date.now() - questionStartTime) / 1000)
    
    // Save current answer
    const currentAnswer = {
      question: allQuestions[currentQuestion].question,
      userAnswer: answer,
      category: allQuestions[currentQuestion].category,
      difficulty: allQuestions[currentQuestion].difficulty,
      timeSpent: questionTime,
      followUpsAsked: showFollowUps ? currentFollowUp + 1 : 0
    }
    
    setUserAnswers(prev => [...prev, currentAnswer])
    setCompletedQuestions(prev => [...prev, {
      ...allQuestions[currentQuestion],
      answer,
      timeSpent: questionTime,
      followUpsAsked: showFollowUps ? currentFollowUp + 1 : 0
    }])

    if (currentQuestion < allQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
      setAnswer('')
      setShowFollowUps(false)
      setCurrentFollowUp(0)
      setQuestionStartTime(Date.now())
      
      if (voiceEnabled && voiceSystem.current) {
        await voiceSystem.current.speak("Great! Let's move to the next question.")
        setTimeout(async () => {
          if (voiceSystem.current) {
            await voiceSystem.current.speak(allQuestions[currentQuestion + 1].question)
          }
        }, 1500)
      }
    } else {
      // Save final answer and proceed to submission
      setInterviewPhase('submission')
      if (voiceEnabled && voiceSystem.current) {
        await voiceSystem.current.speak("Excellent! You have completed all questions. Let's analyze your performance.")
      }
    }
  }

  const handleFollowUp = async () => {
    if (!showFollowUps) {
      setShowFollowUps(true)
      setCurrentFollowUp(0)
    } else if (currentFollowUp < allQuestions[currentQuestion].followUps.length - 1) {
      setCurrentFollowUp(prev => prev + 1)
    }

    const followUpQuestion = allQuestions[currentQuestion].followUps[currentFollowUp]
    
    if (voiceEnabled && followUpQuestion && voiceSystem.current) {
      await voiceSystem.current.speak(`Follow up question: ${followUpQuestion}`)
    }
  }

  // Generate feedback using AI
  const generateFeedback = async () => {
    try {
      setIsSubmitting(true)
      
      const feedbackPrompt = `
        Analyze this technical interview performance:
        
        Selected Categories: ${selectedCategories.join(', ')}
        Total Questions: ${userAnswers.length}
        
        Questions and Answers:
        ${userAnswers.map((qa, index) => `
        Question ${index + 1} (${qa.category} - ${qa.difficulty}):
        Q: ${qa.question}
        A: ${qa.userAnswer}
        Time Spent: ${qa.timeSpent} seconds
        Follow-ups Asked: ${qa.followUpsAsked}
        `).join('\n')}
        
        Provide comprehensive feedback in JSON format:
        {
          "overallScore": 85,
          "categoryScores": {
            "algorithms": 80,
            "systemDesign": 90,
            "database": 75
          },
          "detailedFeedback": {
            "strengths": ["Clear explanations", "Good problem-solving approach", "Strong fundamentals"],
            "improvements": ["More optimization focus", "Better time complexity analysis", "Deeper system design"],
            "technicalDepth": "Demonstrates solid understanding with room for advanced concepts",
            "communicationSkills": "Clear and structured responses"
          },
          "questionAnalysis": [
            {
              "questionIndex": 0,
              "score": 8,
              "feedback": "Good solution but could discuss optimization",
              "strengths": ["Correct approach", "Clear logic"],
              "improvements": ["Time complexity", "Edge cases"]
            }
          ],
          "recommendations": ["Practice system design problems", "Focus on optimization", "Study advanced algorithms"],
          "verdict": "Strong technical candidate with good problem-solving skills"
        }
      `

      const result = await chatSession.sendMessage(feedbackPrompt)
      const response = result.response.text()
      
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const feedback = JSON.parse(jsonMatch[0])
        setFeedbackResults(feedback)
        
        // Save to database
        await saveFeedbackToDatabase(feedback)
        
        setInterviewPhase('feedback')
      }
    } catch (error) {
      console.error('Error generating feedback:', error)
      
      // Fallback feedback
      const fallbackFeedback = {
        overallScore: 75,
        categoryScores: Object.fromEntries(selectedCategories.map(cat => [cat, 75])),
        detailedFeedback: {
          strengths: ['Completed all questions', 'Demonstrated technical knowledge', 'Good communication'],
          improvements: ['More detailed explanations', 'Better optimization focus', 'Deeper technical analysis'],
          technicalDepth: 'Shows understanding of core concepts with potential for growth',
          communicationSkills: 'Clear responses with room for more structured answers'
        },
        recommendations: ['Practice more technical problems', 'Focus on optimization techniques', 'Improve explanation clarity'],
        verdict: 'Solid technical foundation with growth potential'
      }
      
      setFeedbackResults(fallbackFeedback)
      await saveFeedbackToDatabase(fallbackFeedback)
      setInterviewPhase('feedback')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Save feedback to database
  const saveFeedbackToDatabase = async (feedback) => {
    try {
      if (!user?.primaryEmailAddress?.emailAddress || !interviewId) return

      for (let i = 0; i < userAnswers.length; i++) {
        const qa = userAnswers[i]
        const questionFeedback = feedback.questionAnalysis?.[i] || {
          score: Math.round(feedback.overallScore / 10),
          feedback: 'Good technical response',
          strengths: ['Technical knowledge'],
          improvements: ['More details needed']
        }

        await db.insert(UserAnswer).values({
          mockIdRef: interviewId,
          question: qa.question,
          correctAns: `Expected: Strong technical explanation covering ${qa.category} concepts with optimization considerations.`,
          userAns: qa.userAnswer,
          feedback: questionFeedback.feedback + '\nStrengths: ' + questionFeedback.strengths?.join(', ') + '\nImprovements: ' + questionFeedback.improvements?.join(', '),
          rating: questionFeedback.score.toString(),
          userEmail: user.primaryEmailAddress.emailAddress,
          createdAt: moment().format('DD-MM-yyyy')
        })
      }
    } catch (error) {
      console.error('Error saving to database:', error)
    }
  }

  const toggleVoiceRecording = () => {
    if (voiceSystem.current) {
      if (isListening) {
        voiceSystem.current.stopListening()
      } else {
        voiceSystem.current.startListening()
      }
    }
  }

  const speakCurrentQuestion = async () => {
    if (allQuestions[currentQuestion] && voiceSystem.current) {
      await voiceSystem.current.speak(allQuestions[currentQuestion].question)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault()
      handleNextQuestion()
    } else if (e.key === 'Tab' && e.ctrlKey) {
      e.preventDefault()
      handleFollowUp()
    }
  }

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white"
        >
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-center mb-8"
          >
            <User className="w-20 h-20 mx-auto mb-4 text-blue-300" />
            <h1 className="text-4xl font-bold mb-4">Technical Interview</h1>
            <p className="text-xl text-gray-300 mb-6">
              Deep dive into your technical expertise and problem-solving skills
            </p>
          </motion.div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Select Interview Focus Areas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(technicalQuestions).map(([category, questions]) => (
                <motion.div
                  key={category}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedCategories.includes(category)
                      ? 'border-blue-400 bg-blue-900/30'
                      : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
                  }`}
                  onClick={() => {
                    if (selectedCategories.includes(category)) {
                      setSelectedCategories(prev => prev.filter(c => c !== category))
                    } else {
                      setSelectedCategories(prev => [...prev, category])
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold capitalize">{category}</h3>
                    {category === 'general' && <Globe className="w-5 h-5" />}
                    {category === 'frontend' && <Code className="w-5 h-5" />}
                    {category === 'backend' && <Server className="w-5 h-5" />}
                  </div>
                  <p className="text-sm text-gray-400">{questions.length} questions</p>
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-1">
                      {questions.slice(0, 2).map((q, idx) => (
                        <span key={idx} className="text-xs bg-gray-700 px-2 py-1 rounded">
                          {q.category}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <h3 className="font-semibold">Questions Selected</h3>
              <p className="text-2xl font-bold">
                {selectedCategories.reduce((total, cat) => total + (technicalQuestions[cat]?.length || 0), 0)}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-orange-400" />
              <h3 className="font-semibold">Estimated Time</h3>
              <p className="text-sm">~{Math.ceil(selectedCategories.length * 15)} minutes</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <Lightbulb className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <h3 className="font-semibold">Follow-ups</h3>
              <p className="text-sm">Interactive Q&A</p>
            </div>
          </div>

          {/* AI Service Status */}
          {!getAIStatus().isAvailable && (
            <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
                <span className="text-yellow-400 font-semibold">AI Service Unavailable</span>
              </div>
              <p className="text-gray-300 text-sm">
                Using pre-defined questions for this session. All other features remain functional.
              </p>
            </div>
          )}

          {/* Camera Setup */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Camera Setup</h2>
            <div className="bg-gray-900 rounded-lg aspect-video mb-4 relative overflow-hidden">
              {cameraEnabled && mediaStream ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    controls={false}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      transform: 'scaleX(-1)',
                      backgroundColor: '#1f2937'
                    }}
                    className="absolute inset-0 rounded-lg"
                    onLoadedMetadata={(e) => {
                      console.log('Video element loaded metadata');
                      console.log('Video dimensions:', e.target.videoWidth, 'x', e.target.videoHeight);
                      e.target.play().catch(err => console.error('Play error:', err));
                    }}
                    onError={(e) => {
                      console.error('Video error:', e);
                    }}
                    onPlaying={() => console.log('Video is playing')}
                    onWaiting={() => console.log('Video is waiting')}
                  />
                  {/* Debug overlay */}
                  <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs p-2 rounded">
                    Stream: {mediaStream ? 'Active' : 'None'}<br/>
                    Tracks: {mediaStream ? mediaStream.getVideoTracks().length : 0}
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-center">
                  <div>
                    <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-400">Camera not enabled</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Stream: {mediaStream ? 'Available' : 'None'} | 
                      Camera: {cameraEnabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={initializeMedia}
                disabled={cameraEnabled}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  cameraEnabled 
                    ? 'bg-green-600 text-white cursor-default' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {cameraEnabled ? (
                  <>
                    <Camera className="w-5 h-5 inline mr-2" />
                    Camera Ready
                  </>
                ) : (
                  <>
                    <CameraOff className="w-5 h-5 inline mr-2" />
                    Enable Camera
                  </>
                )}
              </button>
              
              {cameraEnabled && (
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      console.log('Manual play attempt');
                      videoRef.current.play()
                        .then(() => console.log('Manual play success'))
                        .catch(e => console.error('Manual play failed:', e));
                    }
                  }}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm"
                >
                  Test Video Play
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center mb-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={voiceEnabled}
                onChange={(e) => setVoiceEnabled(e.target.checked)}
                className="rounded"
              />
              <span>Enable voice interactions</span>
            </label>
          </div>

          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              disabled={selectedCategories.length === 0 || !cameraEnabled}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Technical Interview
            </motion.button>
            {!cameraEnabled && (
              <p className="text-sm text-gray-400 mt-2">Please enable camera to start the interview</p>
            )}
          </div>
        </motion.div>
      </div>
    )
  }

  // Submission Phase
  if (interviewPhase === 'submission') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center text-white"
        >
          <Send className="w-20 h-20 mx-auto mb-4 text-blue-400" />
          <h1 className="text-4xl font-bold mb-4">Interview Complete!</h1>
          <p className="text-xl text-gray-300 mb-6">
            Ready to analyze your performance and generate feedback
          </p>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold">Total Time</h3>
              <p className="text-2xl font-bold">{formatTime(timeElapsed)}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold">Questions</h3>
              <p className="text-2xl font-bold">{userAnswers.length}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold">Categories</h3>
              <p className="text-2xl font-bold">{selectedCategories.length}</p>
            </div>
          </div>

          <button
            onClick={generateFeedback}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center mx-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin w-5 h-5 mr-2" />
                Analyzing Performance...
              </>
            ) : (
              <>
                <TrendingUp className="w-5 h-5 mr-2" />
                Generate Feedback & Score
              </>
            )}
          </button>
        </motion.div>
      </div>
    )
  }

  // Feedback Phase
  if (interviewPhase === 'feedback' && feedbackResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white"
        >
          <div className="text-center mb-8">
            <Award className="w-20 h-20 mx-auto mb-4 text-yellow-400" />
            <h1 className="text-4xl font-bold mb-2">Interview Results</h1>
            <p className="text-xl text-gray-300">Here's your detailed technical interview feedback</p>
          </div>

          {/* Overall Score */}
          <div className="bg-white/20 rounded-xl p-6 mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Overall Score</h2>
            <div className="text-6xl font-bold mb-2" style={{color: feedbackResults.overallScore >= 80 ? '#10B981' : feedbackResults.overallScore >= 60 ? '#F59E0B' : '#EF4444'}}>
              {feedbackResults.overallScore}/100
            </div>
            <p className="text-lg text-gray-300">{feedbackResults.verdict}</p>
          </div>

          {/* Category Scores */}
          {feedbackResults.categoryScores && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {Object.entries(feedbackResults.categoryScores).map(([category, score]) => (
                <div key={category} className="bg-white/10 rounded-lg p-4 text-center">
                  <h3 className="font-semibold capitalize mb-2">{category}</h3>
                  <div className="text-2xl font-bold" style={{color: score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444'}}>
                    {score}/100
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Detailed Feedback */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Strengths
              </h3>
              <ul className="space-y-2">
                {feedbackResults.detailedFeedback.strengths?.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
              <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2" />
                Areas for Improvement
              </h3>
              <ul className="space-y-2">
                {feedbackResults.detailedFeedback.improvements?.map((improvement, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-yellow-400 mr-2">•</span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Recommendations
            </h3>
            <ul className="space-y-2">
              {feedbackResults.recommendations?.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.push(`/dashboard/interview/${interviewId}/feedback`)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              View Detailed Report
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  const currentQuestionData = allQuestions[currentQuestion]

  return (
    <div className="min-h-screen bg-gray-900 text-white" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Technical Interview</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeElapsed)}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span className="text-sm">{currentQuestion + 1}/{allQuestions.length}</span>
            </div>
            
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {currentQuestionData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Question Panel */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-800 rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 bg-blue-900 text-blue-300 rounded-full text-sm">
                      {currentQuestionData.category}
                    </span>
                    <button
                      onClick={speakCurrentQuestion}
                      className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                      title="Repeat question"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-400">
                    Question {currentQuestion + 1} of {allQuestions.length}
                  </div>
                </div>

                <h2 className="text-xl font-semibold mb-4 text-gray-100">
                  {currentQuestionData.question}
                </h2>

                {/* Key Points */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Key Areas to Cover:</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentQuestionData.keyPoints.map((point, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-sm"
                      >
                        {point}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Follow-up Questions */}
                {showFollowUps && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4 mb-4"
                  >
                    <h3 className="font-semibold text-yellow-400 mb-2">Follow-up Question:</h3>
                    <p className="text-gray-200">{currentQuestionData.followUps[currentFollowUp]}</p>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleFollowUp}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm transition-colors"
                  >
                    {showFollowUps ? 'Next Follow-up' : 'Ask Follow-up'} (Ctrl+Tab)
                  </button>
                  
                  <button
                    onClick={handleNextQuestion}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-colors flex items-center space-x-2"
                  >
                    <span>Next Question (Ctrl+Enter)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>

              {/* Answer Area */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Your Response</h3>
                  
                  <div className="flex items-center space-x-2">
                    {voiceEnabled && (
                      <button
                        onClick={toggleVoiceRecording}
                        className={`p-3 rounded-lg transition-colors ${
                          isListening 
                            ? 'bg-red-600 hover:bg-red-700' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </button>
                    )}
                  </div>
                </div>
                
                <textarea
                  ref={answerRef}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Share your thoughts and experience..."
                  className="w-full h-64 bg-gray-700 border border-gray-600 rounded-lg p-4 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <div className="mt-4 text-sm text-gray-400">
                  <p>💡 Tip: Be specific about your experience and provide examples</p>
                </div>
              </div>
            </div>

            {/* Progress Panel */}
            <div className="space-y-4">
              {/* Video Recording Panel */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold mb-4">Video Recording</h3>
                <div className="bg-gray-900 rounded-lg aspect-video mb-4 relative overflow-hidden">
                  {mediaStream ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        controls={false}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          transform: 'scaleX(-1)',
                          backgroundColor: '#1f2937'
                        }}
                        className="absolute inset-0 rounded-lg"
                        onLoadedMetadata={(e) => {
                          console.log('Interview video loaded metadata');
                          console.log('Video dimensions:', e.target.videoWidth, 'x', e.target.videoHeight);
                          e.target.play().catch(err => console.error('Play error:', err));
                        }}
                        onPlaying={() => console.log('Interview video is playing')}
                        onError={(e) => console.error('Interview video error:', e)}
                      />
                      {/* Debug overlay for interview video */}
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs p-1 rounded">
                        {isRecording ? '🔴 REC' : '⚪ READY'}
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs p-1 rounded">
                        Tracks: {mediaStream ? mediaStream.getVideoTracks().length : 0}
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-center">
                      <div className="text-gray-400">
                        <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No camera stream</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center gap-2">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isRecording 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <Video className="w-4 h-4 inline mr-1" />
                        Recording...
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4 inline mr-1" />
                        Start Recording
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      if (videoRef.current && mediaStream) {
                        console.log('Manually fixing video stream...');
                        videoRef.current.srcObject = mediaStream;
                        videoRef.current.play()
                          .then(() => console.log('Manual video fix successful'))
                          .catch(e => console.error('Manual video fix failed:', e));
                      } else {
                        console.log('No stream or video ref available');
                      }
                    }}
                    className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs"
                  >
                    Fix Video
                  </button>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold mb-4">Interview Progress</h3>
                <div className="space-y-2">
                  {allQuestions.map((q, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded text-sm ${
                        index === currentQuestion
                          ? 'bg-blue-900 text-blue-300 border border-blue-600'
                          : index < currentQuestion
                          ? 'bg-green-900 text-green-300'
                          : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{q.category}</span>
                        {index < currentQuestion && <CheckCircle className="w-4 h-4" />}
                        {index === currentQuestion && <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Time per Question</h3>
                <div className="text-sm text-gray-400">
                  Current: {formatTime(Math.floor((Date.now() - questionStartTime) / 1000))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Keyboard Shortcuts</h3>
                <div className="space-y-1 text-sm text-gray-400">
                  <div>Ctrl + Enter: Next Question</div>
                  <div>Ctrl + Tab: Follow-up</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sound Wave Animation */}
      <AnimatePresence>
        {(isListening || isSpeaking) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-4 right-4"
          >
            <SoundWaveAnimation isActive={isListening || isSpeaking} isUser={isListening} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}