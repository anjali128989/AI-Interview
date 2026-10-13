import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

import api from '../services/api';

const Analytics = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('all');

 
useEffect(() => {
  let cancelled = false;

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(
        `/interview/analytics?range=${timeRange}`
      );

      if (!cancelled) {
        setAnalytics(response.data?.data ?? null);
      }
    } catch (err) {
      console.error(
        'Failed to load analytics:',
        err.response?.status,
        err.response?.data || err.message
      );

      if (!cancelled) {
        setError(
          err.response?.status === 401
            ? 'Your session has expired. Please log in again.'
            : err.response?.status === 404
              ? 'Analytics endpoint not found. Check your backend route.'
              : 'Failed to load analytics. Please try again.'
        );
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  loadAnalytics();

  return () => {
    cancelled = true;
  };
}, [timeRange]);
  const COLORS = [
    '#6366f1',
    '#8b5cf6',
    '#a855f7',
    '#d946ef',
    '#ec4899'
  ];

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1120] relative overflow-hidden">

        {/* Background Glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/20 blur-3xl rounded-full"></div>

          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/20 blur-3xl rounded-full"></div>
        </div>

        <div className="relative z-10 animate-pulse">

          {/* Header Skeleton */}
          <div className="backdrop-blur-xl bg-white/5 border-b border-white/10">

            <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

              <div>
                <div className="h-10 w-72 bg-white/10 rounded-xl mb-3"></div>

                <div className="h-4 w-96 bg-white/5 rounded-lg"></div>
              </div>

              <div className="flex gap-4">

                <div className="h-12 w-40 bg-white/10 rounded-xl"></div>

                <div className="h-12 w-44 bg-indigo-500/20 rounded-xl"></div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-6 py-8">

            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl"
                >

                  <div className="flex justify-between items-start mb-6">

                    <div className="w-14 h-14 rounded-2xl bg-white/10"></div>

                    <div className="w-24 h-6 rounded-full bg-white/10"></div>
                  </div>

                  <div className="h-4 w-32 bg-white/10 rounded mb-4"></div>

                  <div className="h-10 w-28 bg-white/10 rounded-xl"></div>
                </div>
              ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl"
                >

                  <div className="h-6 w-52 bg-white/10 rounded-lg mb-6"></div>

                  <div className="h-[320px] rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">

                    <div className="space-y-3 w-full px-6">

                      <div className="h-3 bg-white/10 rounded w-full"></div>

                      <div className="h-3 bg-white/10 rounded w-5/6"></div>

                      <div className="h-3 bg-white/10 rounded w-4/6"></div>

                      <div className="h-3 bg-white/10 rounded w-3/6"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl"
                >

                  <div className="h-6 w-48 bg-white/10 rounded-lg mb-6"></div>

                  <div className="h-[320px] rounded-2xl bg-white/5 border border-white/5"></div>
                </div>
              ))}
            </div>

            {/* Table Skeleton */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden mb-8">

              <div className="px-6 py-5 border-b border-white/10">

                <div className="h-6 w-52 bg-white/10 rounded-lg"></div>
              </div>

              <div className="p-6 space-y-5">

                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between border-b border-white/5 pb-5"
                  >

                    <div className="space-y-3">

                      <div className="h-5 w-40 bg-white/10 rounded"></div>

                      <div className="h-4 w-72 bg-white/5 rounded"></div>
                    </div>

                    <div className="h-10 w-28 bg-white/10 rounded-xl"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights Skeleton */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">

              <div className="h-7 w-60 bg-white/10 rounded-lg mb-6"></div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="bg-white/5 border border-white/10 rounded-2xl p-5"
                  >

                    <div className="w-12 h-12 rounded-xl bg-white/10 mb-4"></div>

                    <div className="h-5 w-32 bg-white/10 rounded mb-3"></div>

                    <div className="space-y-2">

                      <div className="h-3 bg-white/5 rounded w-full"></div>

                      <div className="h-3 bg-white/5 rounded w-5/6"></div>

                      <div className="h-3 bg-white/5 rounded w-4/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center p-6 relative overflow-hidden">

        <div className="absolute w-[500px] h-[500px] bg-red-500/10 blur-3xl rounded-full top-[-150px] right-[-100px]" />
        <div className="absolute w-[400px] h-[400px] bg-indigo-500/10 blur-3xl rounded-full bottom-[-120px] left-[-80px]" />

        <div className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl max-w-md w-full text-center">

          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl shadow-lg shadow-indigo-500/30">
            📉
          </div>

          <h2 className="text-3xl font-bold text-white mt-6">
            No Analytics Yet
          </h2>

          <p className="text-slate-400 mt-3 leading-relaxed">
            {error ||
              'You haven’t completed any interviews yet.'}
          </p>

          <button
            onClick={() => navigate('/interview')}
            className="mt-8 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-indigo-500/30"
          >
            Start First Interview
          </button>
        </div>
      </div>
    );
  }

  const {
    overview,
    performanceByRole,
    performanceByDifficulty,
    progressOverTime,
    categoryScores,
    recentInterviews
  } = analytics;

  return (
    <div className="min-h-screen bg-[#0b1120] text-white relative overflow-hidden">

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/20 blur-3xl rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/20 blur-3xl rounded-full"></div>
      </div>

      <div className="relative z-10">

        {/* Header */}
        <div className="backdrop-blur-xl bg-white/5 border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-5">

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  AI Interview Analytics
                </h1>

                <p className="text-slate-400 mt-2 text-sm">
                  Track performance, evaluate growth, and improve weak areas.
                </p>
              </div>

              <div className="flex items-center gap-4">

                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl outline-none backdrop-blur-xl"
                >
                  <option className="text-black" value="week">
                    Last 7 Days
                  </option>

                  <option className="text-black" value="month">
                    Last 30 Days
                  </option>

                  <option className="text-black" value="all">
                    All Time
                  </option>
                </select>

                <button
                  onClick={() =>
                    navigate('/interview')
                  }
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 transition-all duration-300 px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/30"
                >
                  + Start Interview
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

            <StatCard
              title="Total Interviews"
              value={overview.totalInterviews}
              icon="📝"
              trend={
                overview.interviewsThisMonth > 0
                  ? `+${overview.interviewsThisMonth} this month`
                  : null
              }
            />

            <StatCard
              title="Average Score"
              value={`${overview.averageScore}%`}
              icon="🎯"
              trend={
                overview.scoreImprovement > 0
                  ? `↑ ${overview.scoreImprovement}%`
                  : null
              }
            />

            <StatCard
              title="Questions Practiced"
              value={formatNumber(overview.totalQuestions)}
              icon="💬"
              trend={`${overview.completionRate}% completion`}
            />

            <StatCard
              title="Practice Time"
              value={`${Math.floor(
                overview.totalPracticeTime / 60
              )}h ${overview.totalPracticeTime % 60}m`}
              icon="⏱️"
              trend={overview.mostActiveDay}
            />
          </div>

          {/* Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            {/* Progress Chart */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">

              <h3 className="text-xl font-bold mb-6">
                📈 Progress Over Time
              </h3>

              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={progressOverTime}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#2a2f45"
                  />

                  <XAxis
                    dataKey="date"
                    tick={{
                      fill: '#94a3b8',
                      fontSize: 12
                    }}
                  />

                  <YAxis
                    domain={[0, 100]}
                    tick={{
                      fill: '#94a3b8',
                      fontSize: 12
                    }}
                  />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#6366f1"
                    strokeWidth={3}
                  />

                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke="#22c55e"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Role Chart */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">

              <h3 className="text-xl font-bold mb-6">
                🎯 Performance by Role
              </h3>

              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={performanceByRole}
                  layout="vertical"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#2a2f45"
                  />

                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{
                      fill: '#94a3b8',
                      fontSize: 12
                    }}
                  />

                  <YAxis
                    dataKey="role"
                    type="category"
                    width={120}
                    tick={{
                      fill: '#94a3b8',
                      fontSize: 11
                    }}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="averageScore"
                    fill="#8b5cf6"
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            {/* Radar */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">

              <h3 className="text-xl font-bold mb-6">
                🕸 Skills Assessment
              </h3>

              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={categoryScores}>

                  <PolarGrid stroke="#334155" />

                  <PolarAngleAxis
                    dataKey="category"
                    tick={{
                      fill: '#cbd5e1',
                      fontSize: 11
                    }}
                  />

                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{
                      fill: '#64748b',
                      fontSize: 10
                    }}
                  />

                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.4}
                  />

                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">

              <h3 className="text-xl font-bold mb-6">
                📊 Difficulty Distribution
              </h3>

              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={performanceByDifficulty}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {performanceByDifficulty.map(
                      (entry, index) => (
                        <Cell
                          key={index}
                          fill={
                            COLORS[index % COLORS.length]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden mb-8">

            <div className="px-6 py-5 border-b border-white/10">
              <h3 className="text-xl font-bold">
                🕐 Recent Interviews
              </h3>
            </div>

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-white/5 border-b border-white/10">

                  <tr>

                    <th className="px-6 py-4 text-left text-xs text-slate-400 uppercase">
                      Date
                    </th>

                    <th className="px-6 py-4 text-left text-xs text-slate-400 uppercase">
                      Role
                    </th>

                    <th className="px-6 py-4 text-left text-xs text-slate-400 uppercase">
                      Difficulty
                    </th>

                    <th className="px-6 py-4 text-left text-xs text-slate-400 uppercase">
                      Score
                    </th>

                    <th className="px-6 py-4 text-left text-xs text-slate-400 uppercase">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs text-slate-400 uppercase">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {recentInterviews.map((interview) => (
                    <tr
                      key={interview._id}
                      className="border-b border-white/5 hover:bg-white/5 transition"
                    >

                      <td className="px-6 py-5 text-slate-300 text-sm">
                        {new Date(
                          interview.createdAt
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-5 text-white font-medium">
                        {interview.jobRole}
                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${interview.difficulty ===
                              'Easy'
                              ? 'bg-green-500/20 text-green-300'
                              : interview.difficulty ===
                                'Medium'
                                ? 'bg-yellow-500/20 text-yellow-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}
                        >
                          {interview.difficulty}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-indigo-400 font-bold">
                        {interview.averageScore || 'N/A'}%
                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${interview.status ===
                              'Completed'
                              ? 'bg-green-500/20 text-green-300'
                              : interview.status ===
                                'InProgress'
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-gray-500/20 text-gray-300'
                            }`}
                        >
                          {interview.status}
                        </span>
                      </td>

                      <td className="px-6 py-5">

                        <button
                          onClick={() =>
                            navigate(
                              `/interview-result/${interview._id}`
                            )
                          }
                          className="text-indigo-400 hover:text-indigo-300 font-semibold transition"
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">

            <h3 className="text-2xl font-bold mb-6">
              💡 Personalized Insights
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {analytics.insights?.map((insight, index) => (
                <div
                  key={index}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition"
                >

                  <div className="text-3xl mb-3">
                    {insight.icon}
                  </div>

                  <h4 className="font-bold text-lg mb-2">
                    {insight.title}
                  </h4>

                  <p className="text-slate-400 text-sm leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  title,
  value,
  icon,
  trend
}) => {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 hover:scale-[1.02] transition-all duration-300 shadow-xl">

      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-r from-indigo-500/10 to-purple-500/10"></div>

      <div className="relative z-10">

        <div className="flex justify-between items-start mb-5">

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg">
            {icon}
          </div>

          {trend && (
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/20">
              {trend}
            </span>
          )}
        </div>

        <p className="text-slate-400 text-sm mb-2">
          {title}
        </p>

        <h2 className="text-4xl font-black text-white">
          {value}
        </h2>
      </div>
    </div>
  );
};

export default Analytics;