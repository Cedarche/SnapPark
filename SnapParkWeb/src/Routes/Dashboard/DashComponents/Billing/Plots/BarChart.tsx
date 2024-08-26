import React from "react";
import { Group } from "@visx/group";
import { BarGroup } from "@visx/shape";
import { AxisBottom, AxisLeft } from "@visx/axis"; // Import AxisLeft for the Y-axis
import { ExampleBarData } from "./ExampleData";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { GridRows } from "@visx/grid";

export type BarGroupProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  events?: boolean;
  data: ChartData[]; // Specify that data is an array of ChartData objects
};

interface ChartData {
  date: string;
  [key: string]: number | string;
}

type CityName = string;

const blue = "#aeeef8";
export const axisColor = "grey";
const purple = "#00fbff";
export const background = "#ffffff";
const defaultMargin = { top: 40, right: 0, bottom: 40, left: 50 }; // Adjust left margin for Y-axis

export default function BarChart({
  width,
  height,
  data,
  events = false,
  margin = defaultMargin,
}: BarGroupProps) {
  // bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // console.log("Bar chart data: ", data);

  //   const data = ExampleBarData;
  const keys = Object.keys(data[0]).filter((d) => d !== "date") as CityName[];

  // accessors
  const getDate = (d: any) => d.date; // Use 'any' type or create a more specific type for your data

  // Find the max temperature value and add 4
  const maxTemp =
    Math.max(
      ...data.flatMap((d: ChartData) =>
        keys.map((key) =>
          typeof d[key] === "number" ? (d[key] as number) : Number(d[key]),
        ),
      ),
    ) + 2;

  // scales
  const dateScale = scaleBand<string>({
    domain: data.map(getDate),
    padding: 0.1,
  });
  const cityScale = scaleBand<string>({
    domain: keys,
    padding: 0.1,
  });
  const tempScale = scaleLinear<number>({
    domain: [0, maxTemp],
    nice: true,
  });
  const colorScale = scaleOrdinal<string, string>({
    domain: keys,
    range: ["#00aeff", "#00fffb", "#00ffae", "#00ff37"],
  });

  // update scale output dimensions
  dateScale.rangeRound([0, xMax]);
  cityScale.rangeRound([0, dateScale.bandwidth()]);
  tempScale.range([yMax, 0]);

  const Legend = ({ keys, colorScale }) => {
    return (
      <div
        className="mb-2"
        style={{ display: "flex", justifyContent: "center",}}
      >
        {keys.map((key) => (
          <div key={key} className="inline-flex mr-4 items-center">
            <div
              style={{
                width: 12,
                height: 12,
                backgroundColor: colorScale(key),
                marginRight: 5,
                borderRadius: 2,
              }}
            />
            <div className="text-xs text-gray-500">{key}</div>
          </div>
        ))}
      </div>
    );
  };

  return width < 10 ? null : (
    <>
      <svg width={width} height={height}>
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill={background}
          rx={14}
        />
        <Group top={margin.top} left={margin.left}>
          <BarGroup
            data={data}
            keys={keys}
            height={yMax}
            x0={getDate}
            x0Scale={dateScale}
            x1Scale={cityScale}
            yScale={tempScale}
            color={colorScale}
          >
            {(barGroups) =>
              barGroups.map((barGroup) => (
                <Group
                  key={`bar-group-${barGroup.index}-${barGroup.x0}`}
                  left={barGroup.x0}
                >
                  {barGroup.bars.map((bar) => (
                    <rect
                      key={`bar-group-bar-${barGroup.index}-${bar.index}-${bar.value}-${bar.key}`}
                      x={bar.x}
                      y={bar.y}
                      width={bar.width}
                      height={bar.height}
                      fill={bar.color}
                      rx={4}
                      onClick={() => {
                        if (!events) return;
                        const { key, value } = bar;
                        alert(JSON.stringify({ key, value }));
                      }}
                    />
                  ))}
                </Group>
              ))
            }
          </BarGroup>
          <AxisLeft
            scale={tempScale}
            stroke={axisColor}
            tickStroke={axisColor}
            tickValues={tempScale
              .ticks()
              .filter((tick) => Number.isInteger(tick))} // Filter for integer values
            tickFormat={(value) => `${value}`} // Format as string to avoid implicit conversion
            tickLabelProps={() => ({
              fill: axisColor,
              fontSize: 11,
              dx: "-1.5em",
              dy: "0.25em",
            })}
            label={"Total Notifications"}
            labelProps={{
              dx: "10px",
              fontSize: 11,
              fill: "grey",
              textAnchor: "middle",
            }}
          />

          <GridRows
            scale={tempScale} // Use the tempScale for the y-axis to align grid rows with temperature values
            width={xMax} // Use the calculated width of the chart area
            strokeDasharray="1,3" // Optional: creates dashed lines
            stroke={axisColor} // Use the axisColor for the grid lines
            strokeOpacity={0.5} // Adjust opacity to make grid lines less prominent
            pointerEvents="none" // Ensures grid lines don't interfere with other interactions
          />
        </Group>
        <AxisBottom
          top={yMax + margin.top}
          left={50} // Offset the entire axis to align with the bar groups
          scale={dateScale}
          stroke={axisColor}
          tickStroke={axisColor}
          hideAxisLine={false} // Show the axis line for visual verification
          tickLabelProps={() => ({
            fill: axisColor,
            fontSize: 11,
            textAnchor: "middle",
          })}
        />
      </svg>
      <Legend keys={keys} colorScale={colorScale} />
    </>
  );
}
