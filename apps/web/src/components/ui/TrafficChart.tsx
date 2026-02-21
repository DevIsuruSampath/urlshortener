"use client";

import { useEffect, useState } from 'react';

const chartData = [
  { day: "Sat", clicks: 55, completions: 39 },
  { day: "Sun", clicks: 40, completions: 28 },
  { day: "Mon", clicks: 70, completions: 49 },
  { day: "Tue", clicks: 60, completions: 42 },
  { day: "Wed", clicks: 75, completions: 55 },
  { day: "Thu", clicks: 82, completions: 59 },
  { day: "Fri", clicks: 67, completions: 47 },
];

// Inline Recharts component to avoid separate file import
function RechartsChart() {
  const [Chart, setChart] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    // Dynamic import to avoid build errors
    import('recharts').then((recharts) => {
      const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = recharts;
      
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

      const ChartComponent = () => (
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

      setChart(() => ChartComponent);
    }).catch(() => {
      // If recharts fails to load, stay with null
      setChart(null);
    });
  }, []);

  if (!Chart) {
    return null; // Will be caught by parent component
  }

  return <Chart />;
}

export function TrafficChart() {
  const [hasRecharts, setHasRecharts] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if recharts is available
    try {
      // Try to dynamically import recharts
      import('recharts').then(() => {
        setHasRecharts(true);
      }).catch(() => {
        setHasRecharts(false);
      });
    } catch (e) {
      setHasRecharts(false);
    }
  }, []);

  // Show loading state while checking
  if (hasRecharts === null) {
    return (
      <div className="traffic-chart">
        <div className="simple-chart">
          <p className="muted">Loading chart...</p>
        </div>
      </div>
    );
  }

  if (hasRecharts) {
    return <RechartsChart />;
  }

  // Fallback to simple HTML/CSS chart
  const maxClicks = Math.max(...chartData.map(d => d.clicks));
  
  return (
    <div className="traffic-chart">
      <div className="simple-chart">
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#e50914' }} />
            <span>Total Clicks</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#7fe8a0' }} />
            <span>Valid Completions</span>
          </div>
        </div>
        
        <div className="chart-bars">
          {chartData.map((item, index) => {
            const clickPercent = (item.clicks / maxClicks) * 90;
            const completionPercent = (item.completions / maxClicks) * 90;
            const dropOff = ((1 - item.completions / item.clicks) * 100).toFixed(1);
            
            return (
              <div key={index} className="chart-bar-group">
                <div className="bar-label">{item.day}</div>
                <div className="bars-container">
                  <div 
                    className="bar clicks-bar" 
                    style={{ width: `${clickPercent}%` }}
                    title={`Clicks: ${item.clicks}`}
                  >
                    <span className="bar-value">{item.clicks}</span>
                  </div>
                  <div 
                    className="bar completions-bar" 
                    style={{ width: `${completionPercent}%` }}
                    title={`Completions: ${item.completions}`}
                  >
                    <span className="bar-value">{item.completions}</span>
                  </div>
                </div>
                <div className="bar-dropoff">{dropOff}% drop</div>
              </div>
            );
          })}
        </div>
        
        <div className="chart-axis">
          <div className="axis-label">Days</div>
          <div className="axis-label">Count</div>
        </div>
      </div>
    </div>
  );
}