import React from "react";

interface PlanningTabProps {
  data?: any[];
}

export const PlanningTab: React.FC<PlanningTabProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500 py-10">No data available</div>;
  }

  // Render content when data is available
  return (
    <div>
      <h2>Planning Tab</h2>
      {/* Render data */}
      <ul>
        {data.map((item, index) => (
          <li key={index}>
            {item.date}: {item.value}
          </li>
        ))}
      </ul>
    </div>
  );
};
