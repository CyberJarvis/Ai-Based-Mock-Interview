import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  X, 
  Brain, 
  User, 
  Briefcase, 
  Award, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { generateResumeAnalysis, generateJobRecommendations } from '@/utils/resumeAnalyzer';

const ResumeUpload = ({ onResumeUpload, onAnalysisComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF, DOC, DOCX, or TXT file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    setUploading(true);
    
    try {
      let extractedText = '';
      
      if (file.type === 'text/plain') {
        // Handle plain text files
        extractedText = await file.text();
      } else if (file.type === 'application/pdf') {
        // For PDF files, we'll use a simple approach
        // In production, you might want to use pdf-parse or similar library
        toast.info('PDF processing: Please also paste your resume content in the text area below for better results');
        extractedText = `Resume file: ${file.name} (PDF processing requires manual input)`;
      } else {
        // For DOC/DOCX files
        toast.info('DOC/DOCX processing: Please paste your resume content in the text area below');
        extractedText = `Resume file: ${file.name} (Document processing requires manual input)`;
      }

      setUploadedFile(file);
      setResumeText(extractedText);
      
      // Call parent callback
      onResumeUpload({
        fileName: file.name,
        content: extractedText,
        file: file
      });

      toast.success('Resume uploaded successfully!');
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Error processing resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const analyzeResume = async (content) => {
    if (!content || content.trim().length < 100) return;
    
    setAnalyzing(true);
    try {
      const analysisResult = await generateResumeAnalysis(content);
      if (analysisResult.success) {
        setAnalysis(analysisResult.data);
        setShowAnalysis(true);
        
        // Generate job recommendations
        const recommendationsResult = await generateJobRecommendations(analysisResult.data);
        if (recommendationsResult.success) {
          setRecommendations(recommendationsResult.data.recommendations || []);
        }
        
        if (onAnalysisComplete) {
          onAnalysisComplete({
            analysis: analysisResult.data,
            recommendations: recommendationsResult.data
          });
        }
        
        toast.success('Resume analyzed successfully!');
      } else {
        toast.error('Failed to analyze resume. Please try again.');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Error analyzing resume. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTextChange = (event) => {
    const text = event.target.value;
    setResumeText(text);
    
    onResumeUpload({
      fileName: uploadedFile?.name || 'manual-input.txt',
      content: text,
      file: uploadedFile,
      analysis: analysis
    });
  };

  // Auto-analyze when resume text changes (debounced)
  useEffect(() => {
    if (resumeText && resumeText.trim().length > 100) {
      const timer = setTimeout(() => {
        analyzeResume(resumeText);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [resumeText]);

  const removeFile = () => {
    setUploadedFile(null);
    setResumeText('');
    setAnalysis(null);
    setRecommendations([]);
    setShowAnalysis(false);
    onResumeUpload(null);
    if (onAnalysisComplete) {
      onAnalysisComplete(null);
    }
    // Reset file input
    const fileInput = document.getElementById('resume-upload');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <motion.div
        className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300"
        whileHover={{ scale: 1.01 }}
      >
        {!uploadedFile ? (
          <div>
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            </motion.div>
            <label htmlFor="resume-upload" className="cursor-pointer">
              <span className="text-lg font-medium text-gray-700 block mb-2">
                Upload your resume
              </span>
              <p className="text-sm text-gray-500 mb-4">
                PDF, DOC, DOCX, or TXT up to 5MB
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </div>
            </label>
            <Input
              id="resume-upload"
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-medium text-gray-700 block">
                    {uploadedFile.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Resume Content Textarea */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Resume Content
          </label>
          {analyzing && (
            <div className="flex items-center text-blue-600 text-sm">
              <Brain className="w-4 h-4 mr-2 animate-pulse" />
              Analyzing...
            </div>
          )}
        </div>
        <textarea
          className="w-full p-4 border border-gray-300 rounded-xl resize-vertical min-h-[200px] text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="Paste your resume content here or upload a file above..."
          value={resumeText}
          onChange={handleTextChange}
        />
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>AI analysis will start automatically as you type</span>
          {resumeText.length > 0 && (
            <span>{resumeText.length} characters</span>
          )}
        </div>
      </div>

      {/* AI Analysis Results */}
      <AnimatePresence>
        {showAnalysis && analysis && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200"
          >
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">AI Resume Analysis</h3>
            </div>

            {/* Summary Section */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Profile Summary
                </h4>
                {analysis.summary && (
                  <div className="space-y-2 text-sm">
                    {analysis.summary.name && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{analysis.summary.name}</span>
                      </div>
                    )}
                    {analysis.summary.title && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Role:</span>
                        <span className="font-medium">{analysis.summary.title}</span>
                      </div>
                    )}
                    {analysis.summary.experience && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Experience:</span>
                        <span className="font-medium">{analysis.summary.experience}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Resume Score
                </h4>
                <div className="flex items-center space-x-3">
                  <div className={`text-2xl font-bold ${
                    analysis.score >= 80 ? 'text-green-600' : 
                    analysis.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {analysis.score}%
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        analysis.score >= 80 ? 'bg-green-600' : 
                        analysis.score >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${analysis.score}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Section */}
            {analysis.skills && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Award className="w-4 h-4 mr-2" />
                  Key Skills
                </h4>
                <div className="space-y-3">
                  {analysis.skills.technical?.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 block mb-2">Technical:</span>
                      <div className="flex flex-wrap gap-2">
                        {analysis.skills.technical.slice(0, 8).map((skill, index) => (
                          <Badge key={index} className="bg-blue-100 text-blue-800">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysis.skills.tools?.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 block mb-2">Tools:</span>
                      <div className="flex flex-wrap gap-2">
                        {analysis.skills.tools.slice(0, 6).map((tool, index) => (
                          <Badge key={index} className="bg-purple-100 text-purple-800">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Job Recommendations */}
            {recommendations.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Recommended Roles
                </h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {recommendations.slice(0, 4).map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-900 text-sm">{rec.title}</span>
                        <Badge className={`${
                          rec.match >= 90 ? 'bg-green-100 text-green-800' :
                          rec.match >= 70 ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        } text-xs`}>
                          {rec.match}% match
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{rec.reasoning}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading States */}
      {uploading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center text-blue-600">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <Clock className="w-5 h-5 mr-2" />
            </motion.div>
            Processing resume...
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;