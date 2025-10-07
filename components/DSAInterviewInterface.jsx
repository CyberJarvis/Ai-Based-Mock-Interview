"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Square, 
  Code, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  Volume2, 
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Target,
  Code2,
  Terminal,
  Eye,
  EyeOff
} from 'lucide-react'
import SoundWaveAnimation from './SoundWaveAnimation'
import VoiceSystem from '../utils/voiceSystem'

const dsaQuestions = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    category: "Array",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      }
    ],
    constraints: [
      "2 ≤ nums.length ≤ 10⁴",
      "-10⁹ ≤ nums[i] ≤ 10⁹",
      "-10⁹ ≤ target ≤ 10⁹",
      "Only one valid answer exists."
    ],
    initialCode: {
      javascript: `function twoSum(nums, target) {
    // Write your solution here
    
}`,
      python: `def two_sum(nums, target):
    # Write your solution here
    pass`,
      java: `public int[] twoSum(int[] nums, int target) {
    // Write your solution here
    
}`
    },
    expectedSolution: `function twoSum(nums, target) {
    const numMap = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (numMap.has(complement)) {
            return [numMap.get(complement), i];
        }
        
        numMap.set(nums[i], i);
    }
    
    return [];
}`,
    testCases: [
      { input: "[2,7,11,15], 9", expected: "[0,1]" },
      { input: "[3,2,4], 6", expected: "[1,2]" },
      { input: "[3,3], 6", expected: "[0,1]" }
    ]
  },
  {
    id: 2,
    title: "Valid Parentheses",
    difficulty: "Easy",
    category: "Stack",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    examples: [
      {
        input: 's = "()"',
        output: "true",
        explanation: "The string has valid parentheses."
      }
    ],
    constraints: [
      "1 ≤ s.length ≤ 10⁴",
      "s consists of parentheses only '()[]{}'."
    ],
    initialCode: {
      javascript: `function isValid(s) {
    // Write your solution here
    
}`,
      python: `def is_valid(s):
    # Write your solution here
    pass`,
      java: `public boolean isValid(String s) {
    // Write your solution here
    
}`
    },
    expectedSolution: `function isValid(s) {
    const stack = [];
    const pairs = {
        ')': '(',
        '}': '{',
        ']': '['
    };
    
    for (let char of s) {
        if (char === '(' || char === '{' || char === '[') {
            stack.push(char);
        } else if (char === ')' || char === '}' || char === ']') {
            if (stack.length === 0 || stack.pop() !== pairs[char]) {
                return false;
            }
        }
    }
    
    return stack.length === 0;
}`,
    testCases: [
      { input: '"()"', expected: "true" },
      { input: '"()[]{}"', expected: "true" },
      { input: '"(]"', expected: "false" }
    ]
  }
]

export default function DSAInterviewInterface({ interviewId, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState([])
  const [showSolution, setShowSolution] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isStarted, setIsStarted] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [completedQuestions, setCompletedQuestions] = useState([])
  
  const voiceSystem = useRef(null)
  const timerRef = useRef(null)
  const codeEditorRef = useRef(null)

  const question = dsaQuestions[currentQuestion]

  // Initialize VoiceSystem only in the browser
  useEffect(() => {
    if (typeof window !== 'undefined') {
      voiceSystem.current = new VoiceSystem()
      
      const voiceSystemInstance = voiceSystem.current
      
      voiceSystemInstance.onStart = () => setIsListening(true)
      voiceSystemInstance.onEnd = () => setIsListening(false)
      voiceSystemInstance.onSpeakStart = () => setIsSpeaking(true)
      voiceSystemInstance.onSpeakEnd = () => setIsSpeaking(false)

      return () => {
        if (voiceSystemInstance) {
          voiceSystemInstance.cleanup()
        }
      }
    }
  }, [])

  useEffect(() => {
    if (question && isStarted) {
      setCode(question.initialCode[language])
    }
  }, [currentQuestion, language, question, isStarted])

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

  const handleStart = async () => {
    setIsStarted(true)
    if (voiceEnabled && question && voiceSystem.current) {
      const greeting = `Welcome to the DSA interview section. We'll start with ${question.title}, a ${question.difficulty} level ${question.category} problem. Let me read the problem statement for you.`
      await voiceSystem.current.speak(greeting)
      
      setTimeout(async () => {
        if (voiceSystem.current) {
          await voiceSystem.current.speak(question.description)
        }
      }, 1000)
    }
  }

  const runCode = async () => {
    setIsRunning(true)
    setTestResults([])
    
    try {
      // Simulate code execution and testing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const results = question.testCases.map((testCase, index) => {
        // Simple simulation - in real implementation, you'd execute the actual code
        const passed = Math.random() > 0.3 // Simulate some passing tests
        return {
          id: index + 1,
          input: testCase.input,
          expected: testCase.expected,
          actual: passed ? testCase.expected : "undefined",
          passed
        }
      })
      
      setTestResults(results)
      
      if (voiceEnabled && voiceSystem.current) {
        const passedCount = results.filter(r => r.passed).length
        const message = `Test execution complete. ${passedCount} out of ${results.length} test cases passed.`
        await voiceSystem.current.speak(message)
      }
    } catch (error) {
      console.error('Code execution error:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const submitSolution = async () => {
    const allPassed = testResults.every(result => result.passed)
    
    if (allPassed) {
      setCompletedQuestions(prev => [...prev, question.id])
      
      if (voiceEnabled && voiceSystem.current) {
        await voiceSystem.current.speak("Excellent! All test cases passed. Moving to the next question.")
      }
      
      if (currentQuestion < dsaQuestions.length - 1) {
        setTimeout(() => {
          setCurrentQuestion(prev => prev + 1)
          setCode('')
          setTestResults([])
          setShowSolution(false)
          setShowHint(false)
        }, 2000)
      } else {
        if (voiceEnabled && voiceSystem.current) {
          await voiceSystem.current.speak("Congratulations! You have completed all DSA questions.")
        }
        onComplete?.()
      }
    } else {
      if (voiceEnabled && voiceSystem.current) {
        await voiceSystem.current.speak("Some test cases are failing. Please review your solution and try again.")
      }
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleKeyDown = (e) => {
    if (e.key === 'F9') {
      e.preventDefault()
      runCode()
    } else if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault()
      submitSolution()
    }
  }

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center text-white"
        >
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="mb-8"
          >
            <Code2 className="w-20 h-20 mx-auto mb-4 text-purple-300" />
            <h1 className="text-4xl font-bold mb-4">DSA Interview Challenge</h1>
            <p className="text-xl text-gray-300 mb-6">
              Solve coding problems with our interactive compiler
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/10 rounded-lg p-4">
              <Target className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <h3 className="font-semibold">Problems to Solve</h3>
              <p className="text-2xl font-bold">{dsaQuestions.length}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <Terminal className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <h3 className="font-semibold">Languages</h3>
              <p className="text-sm">JS, Python, Java</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <Clock className="w-8 h-8 mx-auto mb-2 text-orange-400" />
              <h3 className="font-semibold">Time Tracking</h3>
              <p className="text-sm">Real-time timer</p>
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

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
          >
            Start DSA Interview
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">DSA Interview</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeElapsed)}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-sm">{completedQuestions.length}/{dsaQuestions.length}</span>
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

      <div className="flex h-[calc(100vh-80px)]">
        {/* Problem Panel */}
        <div className="w-1/2 border-r border-gray-700 flex flex-col">
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold">{question.title}</h2>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  question.difficulty === 'Easy' ? 'bg-green-900 text-green-300' :
                  question.difficulty === 'Medium' ? 'bg-yellow-900 text-yellow-300' :
                  'bg-red-900 text-red-300'
                }`}>
                  {question.difficulty}
                </span>
                <span className="px-3 py-1 bg-blue-900 text-blue-300 rounded-full text-sm">
                  {question.category}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                >
                  💡 Hint
                </button>
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition-colors flex items-center space-x-1"
                >
                  {showSolution ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>Solution</span>
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Problem Description</h3>
              <p className="text-gray-300 leading-relaxed">{question.description}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Examples</h3>
              {question.examples.map((example, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4 mb-3">
                  <div className="mb-2">
                    <span className="text-sm text-gray-400">Input: </span>
                    <code className="text-green-400">{example.input}</code>
                  </div>
                  <div className="mb-2">
                    <span className="text-sm text-gray-400">Output: </span>
                    <code className="text-blue-400">{example.output}</code>
                  </div>
                  {example.explanation && (
                    <div>
                      <span className="text-sm text-gray-400">Explanation: </span>
                      <span className="text-gray-300">{example.explanation}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Constraints</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                {question.constraints.map((constraint, index) => (
                  <li key={index}>{constraint}</li>
                ))}
              </ul>
            </div>

            {showHint && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2 text-yellow-400">💡 Hint</h3>
                  <p className="text-gray-300">
                    Try using a hash map to store the numbers you've seen and their indices. 
                    For each number, check if its complement exists in the map.
                  </p>
                </div>
              </motion.div>
            )}

            {showSolution && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="bg-purple-900/20 border border-purple-600 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 text-purple-400">Expected Solution</h3>
                  <pre className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
                    <code className="text-green-400">{question.expectedSolution}</code>
                  </pre>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Code Editor Panel */}
        <div className="w-1/2 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
              </select>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={runCode}
                  disabled={isRunning}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg transition-colors"
                >
                  {isRunning ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  <span>Run (F9)</span>
                </button>
                
                <button
                  onClick={submitSolution}
                  disabled={testResults.length === 0}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Submit (Ctrl+Enter)</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-4">
              <textarea
                ref={codeEditorRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Write your solution here..."
                className="w-full h-full bg-gray-800 border border-gray-600 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                spellCheck={false}
              />
            </div>

            {/* Test Results */}
            {testResults.length > 0 && (
              <div className="border-t border-gray-700 p-4 max-h-64 overflow-y-auto">
                <h3 className="text-lg font-semibold mb-3">Test Results</h3>
                <div className="space-y-2">
                  {testResults.map((result) => (
                    <div
                      key={result.id}
                      className={`p-3 rounded-lg border ${
                        result.passed
                          ? 'bg-green-900/20 border-green-600 text-green-300'
                          : 'bg-red-900/20 border-red-600 text-red-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Test Case {result.id}</span>
                        {result.passed ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <div className="text-sm">
                        <div>Input: <code>{result.input}</code></div>
                        <div>Expected: <code>{result.expected}</code></div>
                        <div>Actual: <code>{result.actual}</code></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
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

      {/* Navigation */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-2 bg-gray-800 rounded-full px-4 py-2">
          <button
            onClick={() => currentQuestion > 0 && setCurrentQuestion(prev => prev - 1)}
            disabled={currentQuestion === 0}
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="px-4 py-1 text-sm">
            {currentQuestion + 1} / {dsaQuestions.length}
          </span>
          
          <button
            onClick={() => currentQuestion < dsaQuestions.length - 1 && setCurrentQuestion(prev => prev + 1)}
            disabled={currentQuestion === dsaQuestions.length - 1}
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}