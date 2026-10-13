// frontend/src/components/ResumeUploader.js
import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, FileText, CheckCircle } from 'lucide-react';

const ResumeUploader = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);

    try {
      const res = await axios.post('https://ai-interview-delta-seven.vercel.app/api/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
      if (onUploadSuccess && res.data.resumeText) {
        onUploadSuccess(res.data.resumeText);
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          ATS Resume Analyzer
        </h1>

        <p className="text-slate-400 mt-2 text-sm">
          Upload your resume and get AI-powered ATS analysis instantly.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-2xl">

        {!result ? (
          <div className="border-2 border-dashed border-slate-600 rounded-2xl p-14 text-center hover:border-purple-400 transition-all duration-300">

            <UploadCloud
              size={60}
              className="mx-auto text-purple-400 mb-5"
            />

            <h2 className="text-2xl font-semibold mb-2">
              Upload Resume
            </h2>

            <p className="text-slate-400 mb-6">
              {file
                ? file.name
                : "Drag & drop your resume or select a file"}
            </p>

            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="resume-upload"
              accept=".pdf,.doc,.docx"
            />

            <label
              htmlFor="resume-upload"
              className="cursor-pointer inline-block bg-gradient-to-r from-purple-600 to-pink-500 hover:bg-pink-400 text-black font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg"
            >
              Select Resume
            </label>

            {file && (
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="block w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-500 hover:scale-[1.01] text-white py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
              >
                {uploading ? "Analyzing Resume..." : "Analyze Resume"}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">

            {/* Success */}
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-5 py-4 rounded-2xl">
              <CheckCircle size={22} />
              <span className="font-semibold text-lg">
                Analysis Complete
              </span>
            </div>

            {/* ATS Score */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold">
                  ATS Score
                </h2>

                <span className="text-purple-400 font-bold text-2xl">
                  {result.analysis.score}/100
                </span>
              </div>

              <div className="w-full bg-slate-700 h-4 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-600 to-pink-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${result.analysis.score}%` }}
                />
              </div>
            </div>

            {/* Grid */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* Strengths */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-emerald-400 mb-4">
                  Strengths
                </h2>

                <ul className="space-y-3">
                  {result.analysis.strengths.map((item, index) => (
                    <li
                      key={index}
                      className="bg-black/20 px-4 py-3 rounded-xl text-slate-200"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-red-400 mb-4">
                  Weaknesses
                </h2>

                <ul className="space-y-3">
                  {result.analysis.weaknesses?.map((item, index) => (
                    <li
                      key={index}
                      className="bg-black/20 px-4 py-3 rounded-xl text-slate-200"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Reupload */}
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setFile(null);
              }}
              className="w-full bg-white/10 hover:bg-white/20 border border-white/10 py-3 rounded-xl font-medium transition-all duration-300"
            >
              Upload Another Resume
            </button>
          </div>
        )}
      </div>
    </div>
  );

};

export default ResumeUploader;