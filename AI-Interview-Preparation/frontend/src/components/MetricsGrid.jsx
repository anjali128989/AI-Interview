// frontend/src/components/MetricsGrid.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const MetricsGrid = () => {
  const [data, setData] = useState(null);

  // Fetch data from our backend
  useEffect(() => {
    axios.get('https://ai-interview-delta-seven.vercel.app/api/interview/metrics')
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  if (!data) return <div>Loading Metrics...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      
      {/* Card 1: Speech Clarity */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
        <h3 className="text-sm font-semibold text-gray-500">Speech Clarity</h3>
        <div className="relative w-24 h-24 my-2">
            <svg className="w-full h-full" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" strokeWidth="3"/>
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10B981" strokeWidth="3" strokeDasharray={`${data.speechClarity}, 100`}/>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-xl font-bold">{data.speechClarity}%</span>
                <span className="text-xs text-green-500">Excellent</span>
            </div>
        </div>
      </div>

      {/* Card 2: Confidence Score */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500">Confidence Score</h3>
        <div className="h-24 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[{v:2}, {v:3}, {v:4}, {v:5}]}>
                    <Line type="monotone" dataKey="v" stroke="#3B82F6" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Card 3: Response Rating */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
        <h3 className="text-sm font-semibold text-gray-500">Response Rating</h3>
        <div className="text-3xl font-bold text-gray-800 mt-2">{data.responseRating}<span className="text-sm text-gray-400">/5</span></div>
        <div className="text-yellow-400 text-lg">★★★★★</div>
      </div>

       {/* Card 4: Filler Words */}
       <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 md:col-span-3 flex items-center justify-between">
        <div>
            <h3 className="text-sm font-semibold text-gray-500">Filler Word Count</h3>
            <span className="text-4xl font-bold text-red-500">{data.fillerWordCount}</span>
        </div>
        <div className="flex gap-2">
            {data.fillerWords.map(word => (
                <span key={word} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">{word}</span>
            ))}
        </div>
      </div>

    </div>
  );
};

export default MetricsGrid;