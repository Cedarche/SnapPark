import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
} from "recharts";

interface BarChartProps {
  chartData: any[]; // Ideally, define a more specific type for your data
}

const BarChartExample: React.FC<BarChartProps> = ({ chartData }) => {
  if (!chartData || chartData.length === 0) {
    return <div>Loading...</div>;
  }

  console.log(chartData)

  // Function to get all unique keys (except 'name') from the chartData
  const getUniqueKeys = (data: any[]) => {
    const keys = new Set<string>();
    data.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (key !== "name") {
          keys.add(key);
        }
      });
    });
    return Array.from(keys);
  };

  const uniqueKeys = getUniqueKeys(chartData);

  const colors = [
    "#8884d895",
    "#83a6ed95",
    "#8dd1e195",
    "#82ca9d95",
    "#a4de6c95",
    "#d0ed5795",
    "#ffc65895",
    "#ff9e4a95",
    "#ff804295",
    "#ff666695",
  ];

  // Calculate the maximum value across all bars
  const maxValue = Math.max(
    ...chartData.map((data) =>
      Math.max(...uniqueKeys.map((key) => data[key] || 0)),
    ),
  );

  // Function to dynamically generate a color

  return (
    <ResponsiveContainer width="99%" height={400}>
      <BarChart
        data={chartData}
        margin={{
          top: 30,
          right: 0,
          left: 10,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis
          domain={[0, maxValue + 1]}
          // tickFormatter={(value) => Math.round(value).toString()}
        >
          <Label
            value="Notifications"
            offset={0}
            position="insideLeft"
            angle={-90}
            style={{ textAnchor: "middle" }}
          />
        </YAxis>
        <Tooltip />
        {/* <Legend /> */}
        {uniqueKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={colors[index % colors.length]}
            barSize={100}
          /> // Set barSize to control width
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartExample;
