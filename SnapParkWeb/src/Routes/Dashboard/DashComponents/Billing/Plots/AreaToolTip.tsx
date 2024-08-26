import React, { useState, useMemo, useCallback, useEffect } from "react";
import { AreaClosed, LinePath, Line, Bar } from "@visx/shape";
import appleStock, { AppleStock } from "@visx/mock-data/lib/mocks/appleStock";
import { curveMonotoneX, curveLinear } from "@visx/curve";
import { GridRows, GridColumns } from "@visx/grid";
import { scaleTime, scaleLinear } from "@visx/scale";
import {
  withTooltip,
  Tooltip,
  TooltipWithBounds,
  defaultStyles,
} from "@visx/tooltip";
import { WithTooltipProvidedProps } from "@visx/tooltip/lib/enhancers/withTooltip";
import { localPoint } from "@visx/event";
import { LinearGradient } from "@visx/gradient";
import { max, extent, bisector } from "d3-array";
import { timeFormat } from "d3-time-format";
import { AxisLeft, AxisBottom } from "@visx/axis";

type TooltipData = AppleStock;

const gradients = {
  WaterLevel: { start: "#00bfff", end: "#008acc" },
  Salinity: { start: "#dd00ff", end: "#dd00ff" },
  Pressure: { start: "#00e454", end: "#328900" },
  Temperature: { start: "#ff8400", end: "#b33900" },
};

// const stock = appleStock.slice(800);
export const background = "#ffffff";
export const background2 = "#363537";
export const accentColor = "#767676";
export const accentColorDark = "#75daad";
const tooltipStyles = {
  ...defaultStyles,
  background,
  border: "1px solid #75daad",
  color: "black",
};

// util
const formatDate = timeFormat("%b %d, '%y");

// accessors
// const getDate = (d: any) => d.date ? new Date(d.date) : new Date();
const getDate = (d: any) => {
  // Attempt to parse the date string using a specific format if the standard parsing fails
  const parsedDate = d.date ? new Date(d.date) : new Date();
  // Check if the parsed date is Invalid Date and try a custom parsing method
  if (isNaN(parsedDate.getTime())) {
    const parts = d.date.split("-").map(Number); // Split the date string and convert parts to numbers
    if (parts.length === 3) {
      // Construct a new Date object using the parts assuming [year, month, day] format
      // Note: months are 0-indexed in JavaScript Date, hence the `parts[1] - 1`
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
  }
  return parsedDate;
};

const getStockValue = (d: any) => parseFloat(d.value.toFixed(2));
const bisectDate = bisector<AppleStock, Date>((d) => new Date(d.date)).left;

const axisColor = "grey";
const axisColor2 = "#c3c3c3";

export type AreaProps = {
  width: number;
  height: number;
  data: any[];
  plotType?: any;
  margin?: { top: number; right: number; bottom: number; left: number };
};

export default withTooltip<AreaProps, TooltipData>(
  ({
    width,
    height,
    data,
    plotType,
    margin = { top: 20, right: 20, bottom: 45, left: 45 },
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
  }: AreaProps & WithTooltipProvidedProps<TooltipData>) => {
    if (width < 10) return null;
    // if(!data) return null;

    const [numTicksX, setNumTicksX] = useState(10); // Default number of ticks

    useEffect(() => {
      console.log("Data: ", data);
    }, []);

    useEffect(() => {
      const handleResize = () => {
        // Set number of ticks based on window width
        setNumTicksX(window.innerWidth <= 768 ? 5 : 10); // Fewer ticks for smaller screens
      };

      // Call the resize function initially and add event listener on window resize
      handleResize();
      window.addEventListener("resize", handleResize);

      // Cleanup event listener on component unmount
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    const [gradientId] = useState(`gradient-${plotType}-${Date.now()}`);
    const [tooltipID] = useState(`gradient-${plotType}-${Date.now()}`);

    // bounds
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const axisBottomTickLabelProps = {
      textAnchor: "middle" as const,
      fontFamily: "Arial",
      fontSize: 11,
      fill: axisColor,
    };
    const axisLeftTickLabelProps = {
      dx: "-0.25em",
      dy: "0.25em",
      fontFamily: "Arial",
      fontSize: 11,
      textAnchor: "end" as const,
      fill: axisColor,
    };

    // scales
    const dateScale = useMemo(
      () =>
        scaleTime({
          range: [margin.left, innerWidth + margin.left],
          domain: extent(data || [], getDate) as [Date, Date],
        }),
      [data, innerWidth, margin.left],
    );

    const stockValueScale = useMemo(
      () =>
        scaleLinear({
          range: [innerHeight + margin.top, margin.top],
          // domain: [0, (max(data, getStockValue) || 0) + innerHeight / 3], // Adjust this to ensure proper scaling
          domain: [0, (max(data, getStockValue) ?? 0) + 4],
          nice: true,
        }),
      [data, innerHeight, margin.top],
    );

    // tooltip handler
    const handleTooltip = useCallback(
      (
        event:
          | React.TouchEvent<SVGRectElement>
          | React.MouseEvent<SVGRectElement>,
      ) => {
        const { x } = localPoint(event) || { x: 0 };
        const x0 = dateScale.invert(x);
        const index = bisectDate(data, x0, 1);
        const d0 = data[index - 1];
        const d1 = data[index];
        let d = d0;
        if (d1 && getDate(d1)) {
          d =
            x0.valueOf() - getDate(d0).valueOf() >
            getDate(d1).valueOf() - x0.valueOf()
              ? d1
              : d0;
        }
        showTooltip({
          tooltipData: d,
          tooltipLeft: x,
          tooltipTop: stockValueScale(getStockValue(d)),
        });
      },
      [showTooltip, stockValueScale, dateScale],
    );

    return (
      <div>
        <svg width={width} height={height}>
          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill={`white`}
            rx={14}
          />

          <GridRows
            left={margin.left}
            scale={stockValueScale}
            width={innerWidth}
            strokeDasharray="1,3"
            stroke={accentColor}
            strokeOpacity={0}
            pointerEvents="none"
          />
          <GridColumns
            top={margin.top}
            scale={dateScale}
            height={innerHeight}
            strokeDasharray="1,3"
            stroke={accentColor}
            strokeOpacity={0.5}
            pointerEvents="none"
          />
          <AxisLeft
            left={margin.left}
            scale={stockValueScale}
            numTicks={8}
            stroke={axisColor}
            tickStroke={axisColor}
            tickLabelProps={axisLeftTickLabelProps}
            label={"Notifications per Day"}
            labelProps={{
              dx: "10px", // Position of the label
              // dy: '-20px', // Shift the label vertically
              fontSize: 11, // Font size
              fill: axisColor, // Text color
              textAnchor: "middle", // Text alignment
            }}
          />
          <AxisBottom
            top={height - margin.bottom}
            left={0}
            scale={dateScale}
            numTicks={numTicksX}
            stroke={axisColor}
            tickStroke={axisColor}
            tickLabelProps={axisBottomTickLabelProps}
          />
          <LinePath<AppleStock>
            data={data}
            x={(d) => dateScale(getDate(d)) ?? 0}
            y={(d) => stockValueScale(getStockValue(d)) ?? 0}
            stroke={"#4F46E5"}
            strokeWidth={1}
            curve={curveLinear}
          />
          {data.map((d, i) => (
            <g
              key={`circle-${i}`}
              transform={`translate(${dateScale(getDate(d))}, ${stockValueScale(getStockValue(d))})`}
            >
              {/* Outer circle */}
              <circle
                cx={0}
                cy={0}
                r={5} // Outer radius
                fill={"#4800ff"}
                fillOpacity={0.3} // Adjust opacity for outer circle
              />
              {/* Inner circle */}
              <circle
                cx={0}
                cy={0}
                r={2} // Inner radius
                fill={"#4F46E5"}
                stroke={"#0d00fd"}
                strokeWidth={2} // Adjust strokeWidth to control the thickness of the outer border
              />
            </g>
          ))}

          {/* <AreaClosed<AppleStock>
              data={data}
              x={(d) => dateScale(getDate(d)) ?? 0}
              y={(d) => stockValueScale(getStockValue(d)) ?? 0}
              yScale={stockValueScale}
              strokeWidth={1}
              stroke={'transparent'}
              fill={`url(#${gradientId})`}
              curve={curveMonotoneX}
            /> */}
          {/* // stroke={`url(#${gradientId})`} */}
          {/* // fill={`url(#${gradientId})`} */}

          <Bar
            x={margin.left}
            y={margin.top}
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            rx={14}
            onTouchStart={handleTooltip}
            onTouchMove={handleTooltip}
            onMouseMove={handleTooltip}
            onMouseLeave={() => hideTooltip()}
          />
          {tooltipData && (
            <g>
              <Line
                from={{ x: tooltipLeft, y: margin.top }}
                to={{ x: tooltipLeft, y: innerHeight + margin.top }}
                stroke={accentColorDark}
                strokeWidth={2}
                pointerEvents="none"
                strokeDasharray="5,2"
              />
              <circle
                cx={tooltipLeft}
                cy={tooltipTop + 1}
                r={4}
                fill="black"
                fillOpacity={0.1}
                stroke="black"
                strokeOpacity={0.1}
                strokeWidth={2}
                pointerEvents="none"
              />
              <circle
                cx={tooltipLeft}
                cy={tooltipTop}
                r={4}
                fill={accentColorDark}
                stroke="white"
                strokeWidth={2}
                pointerEvents="none"
              />
            </g>
          )}
        </svg>
        {tooltipData && (
          <div className="bg-white">
            <TooltipWithBounds
              key={tooltipID}
              top={tooltipTop - 12}
              left={tooltipLeft}
              style={tooltipStyles}
            >
              {`${getStockValue(tooltipData) + " " + "Notifications"}`}
            </TooltipWithBounds>
            <Tooltip
              top={innerHeight + margin.top - 8}
              left={tooltipLeft}
              style={{
                ...defaultStyles,
                minWidth: 72,
                textAlign: "center",
                transform: "translateX(-50%)",
              }}
            >
              {formatDate(getDate(tooltipData))}
            </Tooltip>
          </div>
        )}
      </div>
    );
  },
);
