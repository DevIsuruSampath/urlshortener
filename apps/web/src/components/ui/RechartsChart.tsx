"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const chartData = [
  { day: "Sat", clicks: 55, completions: 39 },
  { day: "Sun", clicks: 40, completions: 28 },
  { day: "Mon", clicks: 70, completions: 49 },
  { day: "Tue", clicks: 60, completions: 42 },
  { day: "Wed", clicks: 75, completions: 55 },
  { day: "Thu", clicks: 82, completions: 59 },
  { day: "Fri", clicks: 67, completions: 47 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">{label}</p>
        <p className="tooltip-value">
          <span className="tooltip-dot" style={{ backgroundColor: '#e50914' }} />
          Clicks: <strong>{payload[0].value}</strong>
        </p>
        <p className="tooltip-value">
          <span className="tooltip-dot" style={{ backgroundColor: '#7fe8a0' }} />
          Completions: <strong>{payload[1].value}</strong>
        </p>
        <p className="tooltip-value">
          Drop-off: <strong>{((1 - payload[1].value / payload[0].value) * 100).toFixed(1)}%</strong>
        </p>
      </div>
    );
  }
  return null;
};

export default function RechartsChart() {
  return (
    <div className="traffic-chart">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis 
            dataKey="day" 
            stroke="var(--muted)"
            tick={{ fill: 'var(--text)' }}
          />
          <YAxis 
            stroke="var(--muted)"
            tick={{ fill: 'var(--text)' }}
            label={{ 
              value: 'Count', 
              angle: -90, 
              position: 'insideLeft',
              fill: 'var(--text)'
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="clicks" 
            name="Total Clicks"
            stroke="#e50914" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="completions" 
            name="Valid Completions"
            stroke="#7fe8a0" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}