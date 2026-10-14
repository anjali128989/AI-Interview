// frontend/src/pages/Dashboard.jsx

import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Brain, FileText, ArrowRight, Sparkles } from "lucide-react";

import api from "../services/api";

const Dashboard = () => {
    const navigate = useNavigate();

    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRecentInterviews();
    }, []);

    const loadRecentInterviews = async () => {
        try {
            // Path only. baseURL in services/api.js adds https://<backend>/api
            const response = await api.get("/interview/history");

            const allInterviews = response.data.data || [];

            // Latest 5 interviews only
            setInterviews(allInterviews.slice(0, 5));
        } catch (err) {
            console.error("Failed to load interviews:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "Completed":
                return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
            case "InProgress":
                return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
            default:
                return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] text-white p-8 animate-pulse overflow-hidden relative">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 blur-3xl rounded-full" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 blur-3xl rounded-full" />

                {/* HERO SKELETON */}
                <div className="relative overflow-hidden bg-white/5 border border-white/10 rounded-[2rem] p-10 mb-10">
                    <div className="relative z-10 max-w-3xl">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-white/10" />
                            <div className="h-4 w-44 bg-white/10 rounded-lg" />
                        </div>

                        <div className="h-14 w-[70%] bg-white/10 rounded-2xl mb-5" />

                        <div className="space-y-3">
                            <div className="h-4 w-full bg-white/5 rounded-lg" />
                            <div className="h-4 w-[90%] bg-white/5 rounded-lg" />
                            <div className="h-4 w-[75%] bg-white/5 rounded-lg" />
                        </div>
                    </div>
                </div>

                {/* QUICK ACTIONS SKELETON */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    {[1, 2].map((item) => (
                        <div
                            key={item}
                            className="bg-white/5 border border-white/10 rounded-3xl p-7"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-white/10 mb-6" />
                            <div className="h-8 w-48 bg-white/10 rounded-xl mb-5" />

                            <div className="space-y-3 mb-8">
                                <div className="h-4 w-full bg-white/5 rounded-lg" />
                                <div className="h-4 w-[90%] bg-white/5 rounded-lg" />
                                <div className="h-4 w-[75%] bg-white/5 rounded-lg" />
                            </div>

                            <div className="h-12 w-full bg-white/10 rounded-xl" />
                        </div>
                    ))}
                </div>

                {/* RECENT INTERVIEWS SKELETON */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <div className="h-10 w-72 bg-white/10 rounded-xl mb-3" />
                            <div className="h-4 w-56 bg-white/5 rounded-lg" />
                        </div>
                        <div className="h-5 w-24 bg-cyan-500/20 rounded-lg" />
                    </div>

                    <div className="space-y-5">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="bg-black/20 border border-white/5 rounded-2xl p-6"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="h-8 w-52 bg-white/10 rounded-xl" />
                                            <div className="h-7 w-24 bg-white/10 rounded-full" />
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            <div className="h-4 w-28 bg-white/5 rounded-lg" />
                                            <div className="h-4 w-24 bg-white/5 rounded-lg" />
                                            <div className="h-4 w-24 bg-white/5 rounded-lg" />
                                            <div className="h-4 w-36 bg-white/5 rounded-lg" />
                                        </div>
                                    </div>

                                    <div className="h-12 w-44 bg-white/10 rounded-xl" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white p-8">
            {/* HERO SECTION */}
            <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500/10 to-purple-600/10 border border-white/10 rounded-[2rem] p-10 mb-10">
                <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 blur-3xl rounded-full" />

                <div className="relative z-10 max-w-3xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="text-cyan-400" size={28} />

                        <span className="text-cyan-400 font-semibold tracking-wide uppercase text-sm">
                            AI Interview Platform
                        </span>
                    </div>

                    <h1 className="text-5xl font-bold leading-tight mb-5">
                        Master Your Interviews with AI
                    </h1>

                    <p className="text-slate-300 text-lg leading-relaxed max-w-2xl">
                        Practice technical and HR interviews, analyze your ATS resume,
                        and improve your placement readiness with AI-powered feedback.
                    </p>
                </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
                {/* START INTERVIEW */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-7 hover:border-cyan-400/30 transition-all duration-300 group">
                    <div className="bg-cyan-500/10 w-fit p-4 rounded-2xl mb-5">
                        <Brain className="text-cyan-400" size={32} />
                    </div>

                    <h2 className="text-2xl font-semibold mb-3">Start Interview</h2>

                    <p className="text-slate-400 mb-8 leading-relaxed">
                        Practice AI-generated interview questions with real-time feedback
                        and performance evaluation.
                    </p>

                    <button
                        onClick={() => navigate("/interview")}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-600 py-3 rounded-xl font-semibold hover:scale-[1.02] transition-all duration-300"
                    >
                        Start Now
                        <ArrowRight size={18} />
                    </button>
                </div>

                {/* ATS RESUME */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-7 hover:border-purple-400/30 transition-all duration-300 group">
                    <div className="bg-purple-500/10 w-fit p-4 rounded-2xl mb-5">
                        <FileText className="text-purple-400" size={32} />
                    </div>

                    <h2 className="text-2xl font-semibold mb-3">ATS Resume Checker</h2>

                    <p className="text-slate-400 mb-8 leading-relaxed">
                        Analyze your resume against ATS systems and discover improvements
                        for better shortlisting chances.
                    </p>

                    <button
                        onClick={() => navigate("/ResumeAnalyzer")}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 py-3 rounded-xl font-semibold hover:scale-[1.02] transition-all duration-300"
                    >
                        Analyze Resume
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>

            {/* RECENT INTERVIEWS */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold">Recent Interviews</h2>

                        <p className="text-slate-400 mt-1">
                            Your latest AI interview sessions
                        </p>
                    </div>

                    <Link
                        to="/history"
                        className="text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                        View All →
                    </Link>
                </div>

                {/* EMPTY STATE */}
                {interviews.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-7xl mb-6">🧠</div>

                        <h3 className="text-3xl font-bold mb-4">No Interviews Yet</h3>

                        <p className="text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
                            Start your first AI-powered interview session and receive
                            intelligent feedback on your technical and communication skills.
                        </p>

                        <button
                            onClick={() => navigate("/interview-setup")}
                            className="bg-gradient-to-r from-cyan-500 to-purple-600 px-8 py-4 rounded-2xl font-semibold hover:scale-[1.03] transition-all duration-300"
                        >
                            Start Your First Interview
                        </button>
                    </div>
                )}

                {/* INTERVIEW LIST */}
                {interviews.length > 0 && (
                    <div className="space-y-5">
                        {interviews.map((interview) => (
                            <div
                                key={interview._id}
                                className="bg-black/20 border border-white/5 rounded-2xl p-6 hover:border-cyan-400/20 transition-all duration-300"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                                    {/* LEFT */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <h3 className="text-2xl font-semibold">
                                                {interview.jobRole}
                                            </h3>

                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(
                                                    interview.status
                                                )}`}
                                            >
                                                {interview.status}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-3 text-slate-400 text-sm">
                                            <span>📋 {interview.questionType}</span>
                                            <span>⚡ {interview.difficulty}</span>
                                            <span>⏱️ {interview.duration} mins</span>
                                            <span>📅 {formatDate(interview.createdAt)}</span>
                                        </div>
                                    </div>

                                    {/* RIGHT */}
                                    <div className="flex gap-3">
                                        {interview.status === "Completed" ? (
                                            <button
                                                onClick={() =>
                                                    navigate(`/interview-result/${interview._id}`)
                                                }
                                                className="bg-emerald-500 hover:bg-emerald-600 px-5 py-3 rounded-xl font-medium transition-all"
                                            >
                                                View Result
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    navigate(`/interview/${interview._id}`)
                                                }
                                                className="bg-blue-500 hover:bg-blue-600 px-5 py-3 rounded-xl font-medium transition-all"
                                            >
                                                Retake
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;