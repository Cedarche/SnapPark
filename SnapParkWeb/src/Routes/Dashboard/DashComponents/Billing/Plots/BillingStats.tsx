import React, { useEffect, useState } from "react";
import Calendar from "react-github-contribution-calendar";
import {
  CheckCircleIcon,
  BellAlertIcon,
  ArrowRightStartOnRectangleIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import { useRecoilState } from "recoil";
import { userState } from "@/Reusable/RecoilState";
import { Link } from "react-router-dom";

var weekNames = ["", "M", "T", "W", "T", "F", ""];
var panelAttributes = { rx: 3, ry: 3 };

var panelColors = ["#EEEEEE", "#8fff73", "#01ced2"];
var panelColors = ["#EEEEEE", "#BFF7B1", "#8fff73", "#48E7A3", "#01ced2"];

interface Usage {
  messageType: string;
  messageSent: boolean;
  date: {
    seconds: number;
    nanoseconds: number;
  };
}

interface OfficeData {
  usage: Usage[];
  parkingSpots: any[];
  notificationList: any[];
}

interface Props {
  yearUsage: any;
  PlotYearDropdown: any;
  combinedStatistics: any;
}

interface FormattedValues {
  [key: string]: number;
}

interface Stats {
  name: string;
  value: number;
  unit?: string; // Allow 'unit' to be a string or undefined
}

const BillingStats: React.FC<Props> = ({
  yearUsage,
  PlotYearDropdown,
  combinedStatistics,
}) => {
  const [formattedValues, setFormattedValues] =
    useState<FormattedValues>(exampleStatsData);
  const [until, setUntil] = useState("");
  const [statsArray, setStatistics] = useState<Stats[]>([]);


  // Get current date
  useEffect(() => {
    if (combinedStatistics) {
      const stats: Stats[] = [
        // Ensure the 'stats' array conforms to 'Stats[]'
        { name: "Number of carparks", value: combinedStatistics.totalSpots },
        {
          name: "Number of employees",
          value: combinedStatistics.totalEmployees,
        },
        {
          name: "Average utilisation",
          value: combinedStatistics.averageUtilisation.toFixed(2),
          unit: "%",
        }, // 'unit' is now allowed to be a string
      ];

      // console.log("Stats: ", stats);

      setStatistics(stats);
    }

    if (yearUsage) {
      const newFormattedValues = yearUsage.reduce((acc: Record<string, number>, curr: any) => {
        // Convert the timestamp to a Date object
        const date = new Date(curr.date.seconds * 1000);
        // Format the date as YYYY-MM-DD
        const dateString = date.toISOString().split("T")[0];
  
        // Use messageCount from the current usage entry
        acc[dateString] = (acc[dateString] || 0) + curr.messageCount;
  
        return acc;
      }, {});
  
      // console.log("Formatted usage values:", newFormattedValues);
      setFormattedValues(newFormattedValues);
  
      const today = new Date();
      const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      setUntil(formattedToday);
      // Use this formattedValues object to set your Calendar component's values
    }
  }, [yearUsage]);

  const currentDate = new Date().toLocaleDateString("en-GB"); // 'en-GB' uses day/month/year format

  return (
    <div className="flex flex-col p-0 h-full">
      <div className="flex flex-col flex-grow border-b lg:pl-5 lg:pr-5 lg:pb-5 mt-2">
        <div className="flex justify-between items-center pl-3 pb-4 lg:px-1">
          <h3 className="text-lg font-semibold leading-6  text-gray-900">
            Usage by Day
          </h3>
          <span className="text-sm font-normal  text-gray-500 tracking-wider">
            {/* {currentDate} */}
            <PlotYearDropdown />
          </span>{" "}
          {/* Display current date */}
        </div>
        <div className="flex-gro px-5 lg:mx-5 pb-2 md:px-0 mt-5">
          <Calendar
            values={formattedValues}
            until={until}
            panelColors={panelColors}
            weekNames={weekNames}
            panelAttributes={panelAttributes}
            weekLabelAttributes={{}} // Providing empty object if customization isn't needed
            monthLabelAttributes={{}} // Providing empty object if customization isn't needed
          />
          {/* Legend for calendar colors */}
          <div className="flex items-center justify-end w-full pr-5 text-xs">
            Less
            <div className="w-[10px] h-[10px] border bg-[#EEEEEE] rounded-[3px] mx-[1px] ml-1"></div>
            <div className="w-[10px] h-[10px] border bg-[#BFF7B1] rounded-[3px] mx-[1px]"></div>
            <div className="w-[10px] h-[10px] border bg-[#8fff73] rounded-[3px] mx-[1px]"></div>
            <div className="w-[10px] h-[10px] border bg-[#48E7A3] rounded-[3px] mx-[1px]"></div>
            <div className="w-[10px] h-[10px] border bg-[#01ced2] rounded-[3px] mx-[1px] mr-1"></div>
            More
          </div>
        </div>
      </div>
      <div className="flex-none">
        <Statistics stats={statsArray} />
      </div>
    </div>
  );
};

export default BillingStats;

function Statistics({ stats }: any) {
  return (
    <div className="bg-gray-200">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-px bg-white/5 sm:grid-cols-5 lg:grid-cols-3">
          {stats.map((stat: any) => (
            <div
              key={stat.name}
              className="bg-gray-50 px-4 py-4 sm:px-2 lg:px-4 overflow-hidden"
            >
              <p className="text-xs font-medium leading-6 text-gray-500">
                {stat.name}
              </p>
              <p className="mt-2 flex items-baseline gap-x-2">
                <span className="text-4xl md:text-2xl  xl:text-4xl font-semibold tracking-tight text-grey">
                  {stat.value}
                </span>
                {stat.unit ? (
                  <span className="text-sm text-gray-400">{stat.unit}</span>
                ) : null}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const exampleStatsData = {
  "2023-03-01": 0,
  "2023-03-02": 0,
  "2023-03-03": 1,
  "2023-03-06": 2,
  "2023-03-07": 0,
  "2023-03-08": 0,
  "2023-03-09": 1,
  "2023-03-10": 1,
  "2023-03-13": 2,
  "2023-03-14": 1,
  "2023-03-15": 1,
  "2023-03-16": 1,
  "2023-03-17": 0,
  "2023-03-20": 1,
  "2023-03-21": 2,
  "2023-03-22": 1,
  "2023-03-23": 2,
  "2023-03-24": 1,
  "2023-03-27": 0,
  "2023-03-28": 0,
  "2023-03-29": 2,
  "2023-03-30": 0,
  "2023-03-31": 1,
  "2023-04-03": 2,
  "2023-04-04": 1,
  "2023-04-05": 0,
  "2023-04-06": 0,
  "2023-04-07": 0,
  "2023-04-10": 2,
  "2023-04-11": 0,
  "2023-04-12": 2,
  "2023-04-13": 2,
  "2023-04-14": 0,
  "2023-04-17": 2,
  "2023-04-18": 1,
  "2023-04-19": 0,
  "2023-04-20": 0,
  "2023-04-21": 2,
  "2023-04-24": 2,
  "2023-04-25": 2,
  "2023-04-26": 1,
  "2023-04-27": 0,
  "2023-04-28": 0,
  "2023-05-01": 1,
  "2023-05-02": 1,
  "2023-05-03": 2,
  "2023-05-04": 0,
  "2023-05-05": 0,
  "2023-05-08": 1,
  "2023-05-09": 2,
  "2023-05-10": 0,
  "2023-05-11": 2,
  "2023-05-12": 2,
  "2023-05-15": 1,
  "2023-05-16": 1,
  "2023-05-17": 1,
  "2023-05-18": 0,
  "2023-05-19": 2,
  "2023-05-22": 1,
  "2023-05-23": 0,
  "2023-05-24": 2,
  "2023-05-25": 2,
  "2023-05-26": 1,
  "2023-05-29": 0,
  "2023-05-30": 2,
  "2023-05-31": 0,
  "2023-06-01": 1,
  "2023-06-02": 1,
  "2023-06-05": 2,
  "2023-06-06": 2,
  "2023-06-07": 2,
  "2023-06-08": 2,
  "2023-06-09": 0,
  "2023-06-12": 2,
  "2023-06-13": 2,
  "2023-06-14": 1,
  "2023-06-15": 1,
  "2023-06-16": 0,
  "2023-06-19": 0,
  "2023-06-20": 1,
  "2023-06-21": 0,
  "2023-06-22": 0,
  "2023-06-23": 0,
  "2023-06-26": 1,
  "2023-06-27": 0,
  "2023-06-28": 2,
  "2023-06-29": 1,
  "2023-06-30": 1,
  "2023-07-03": 2,
  "2023-07-04": 0,
  "2023-07-05": 2,
  "2023-07-06": 2,
  "2023-07-07": 0,
  "2023-07-10": 2,
  "2023-07-11": 1,
  "2023-07-12": 0,
  "2023-07-13": 1,
  "2023-07-14": 0,
  "2023-07-17": 1,
  "2023-07-18": 0,
  "2023-07-19": 2,
  "2023-07-20": 2,
  "2023-07-21": 1,
  "2023-07-24": 0,
  "2023-07-25": 0,
  "2023-07-26": 0,
  "2023-07-27": 2,
  "2023-07-28": 1,
  "2023-07-31": 0,
  "2023-08-01": 2,
  "2023-08-02": 0,
  "2023-08-03": 2,
  "2023-08-04": 0,
  "2023-08-07": 1,
  "2023-08-08": 0,
  "2023-08-09": 1,
  "2023-08-10": 1,
  "2023-08-11": 2,
  "2023-08-14": 0,
  "2023-08-15": 1,
  "2023-08-16": 2,
  "2023-08-17": 0,
  "2023-08-18": 1,
  "2023-08-21": 0,
  "2023-08-22": 2,
  "2023-08-23": 0,
  "2023-08-24": 2,
  "2023-08-25": 1,
  "2023-08-28": 2,
  "2023-08-29": 1,
  "2023-08-30": 0,
  "2023-08-31": 2,
  "2023-09-01": 2,
  "2023-09-04": 0,
  "2023-09-05": 1,
  "2023-09-06": 2,
  "2023-09-07": 0,
  "2023-09-08": 0,
  "2023-09-11": 1,
  "2023-09-12": 0,
  "2023-09-13": 1,
  "2023-09-14": 2,
  "2023-09-15": 1,
  "2023-09-18": 1,
  "2023-09-19": 0,
  "2023-09-20": 0,
  "2023-09-21": 1,
  "2023-09-22": 0,
  "2023-09-25": 2,
  "2023-09-26": 2,
  "2023-09-27": 1,
  "2023-09-28": 1,
  "2023-09-29": 0,
  "2023-10-02": 0,
  "2023-10-03": 1,
  "2023-10-04": 0,
  "2023-10-05": 0,
  "2023-10-06": 2,
  "2023-10-09": 0,
  "2023-10-10": 1,
  "2023-10-11": 1,
  "2023-10-12": 1,
  "2023-10-13": 0,
  "2023-10-16": 1,
  "2023-10-17": 1,
  "2023-10-18": 1,
  "2023-10-19": 1,
  "2023-10-20": 2,
  "2023-10-23": 0,
  "2023-10-24": 1,
  "2023-10-25": 2,
  "2023-10-26": 0,
  "2023-10-27": 1,
  "2023-10-30": 2,
  "2023-10-31": 0,
  "2023-11-01": 2,
  "2023-11-02": 1,
  "2023-11-03": 0,
  "2023-11-06": 0,
  "2023-11-07": 1,
  "2023-11-08": 2,
  "2023-11-09": 0,
  "2023-11-10": 0,
  "2023-11-13": 0,
  "2023-11-14": 0,
  "2023-11-15": 1,
  "2023-11-16": 2,
  "2023-11-17": 0,
  "2023-11-20": 0,
  "2023-11-21": 2,
  "2023-11-22": 2,
  "2023-11-23": 1,
  "2023-11-24": 2,
  "2023-11-27": 1,
  "2023-11-28": 0,
  "2023-11-29": 0,
  "2023-11-30": 2,
  "2023-12-01": 1,
  "2023-12-04": 0,
  "2023-12-05": 1,
  "2023-12-06": 2,
  "2023-12-07": 0,
  "2023-12-08": 2,
  "2023-12-11": 0,
  "2023-12-12": 2,
  "2023-12-13": 2,
  "2023-12-14": 1,
  "2023-12-15": 2,
  "2023-12-18": 2,
  "2023-12-19": 2,
  "2023-12-20": 2,
  "2023-12-21": 1,
  "2023-12-22": 2,
  "2023-12-25": 0,
  "2023-12-26": 2,
  "2023-12-27": 2,
  "2023-12-28": 1,
  "2023-12-29": 0,
  "2024-01-01": 1,
  "2024-01-02": 0,
  "2024-01-03": 2,
  "2024-01-04": 1,
  "2024-01-05": 0,
  "2024-01-08": 2,
  "2024-01-09": 0,
  "2024-01-10": 1,
  "2024-01-11": 0,
  "2024-01-12": 1,
  "2024-01-15": 2,
  "2024-01-16": 2,
  "2024-01-17": 0,
  "2024-01-18": 0,
  "2024-01-19": 2,
  "2024-01-22": 0,
  "2024-01-23": 0,
  "2024-01-24": 2,
  "2024-01-25": 0,
  "2024-01-26": 0,
  "2024-01-29": 2,
  "2024-01-30": 1,
  "2024-01-31": 2,
  "2024-02-01": 0,
  "2024-02-02": 0,
  "2024-02-05": 2,
  "2024-02-06": 2,
  "2024-02-07": 2,
  "2024-02-08": 2,
  "2024-02-09": 0,
  "2024-02-12": 0,
  "2024-02-13": 0,
  "2024-02-14": 2,
  "2024-02-15": 0,
  "2024-02-16": 0,
  "2024-02-19": 2,
  "2024-02-20": 0,
  "2024-02-21": 2,
  "2024-02-22": 2,
  "2024-02-23": 0,
  "2024-02-26": 2,
  "2024-02-27": 2,
  "2024-02-28": 1,
  "2024-02-29": 0,
  "2024-03-01": 0,
  "2024-03-04": 0,
  "2024-03-05": 1,
  "2024-03-06": 1,
  "2024-03-07": 0,
  "2024-03-08": 1,
  "2024-03-11": 2,
  "2024-03-12": 2,
  "2024-03-13": 0,
  "2024-03-14": 2,
  "2024-03-15": 0,
  "2024-03-18": 2,
  "2024-03-19": 2,
  "2024-03-20": 1,
  "2024-03-21": 1,
  "2024-03-22": 0,
};
