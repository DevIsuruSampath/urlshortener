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

export function TrafficChart() {
  const [hasRecharts, setHasRecharts] = useState(false);

  useEffect(() => {
    // Check if recharts is available
    try {
      require('recharts');
      setHasRecharts(true);
    } catch (e) {
      setHasRecharts(false);
    }
  }, []);

  if (hasRecharts) {
    // Dynamic import to avoid build errors
    const RechartsComponent = require('./RechartsChart').default;
    return <RechartsComponent />;
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