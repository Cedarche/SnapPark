import { Fragment, useEffect, useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import "./TableScrollbar.css";
import ActivityFeedDropdown from "./ActivityFeedDropdown";

// Define ActivityItem type
// Define ActivityItem type
interface ActivityItem {
  available: boolean;
  name: string;
  timestamp: {
    seconds: number;
    nanoseconds: number;
  };
  spot: string;
}

// Define ActivityFeedProps type
interface ActivityFeedProps {
  officeData: {
    activity: ActivityItem[];
    allActivity?: { id: string; activity: ActivityItem[] }[]; // Optional allActivity field with correct structure
  };
}

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

function formatTimestamp(timestamp: { seconds: number; nanoseconds: number }) {
  // Convert timestamp to milliseconds and create a Date object
  const date = new Date(timestamp.seconds * 1000);

  // Format the date to "HH:MM AM/PM"
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12; // Convert 24h to 12h format and handle 0 as 12
  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes; // Add leading zero to minutes if needed

  return `${formattedHours}:${formattedMinutes} ${ampm}`;
}

export default function ActivityFeed({ officeData }: ActivityFeedProps) {
  const [groupedActivities, setGroupedActivity] = useState<
    Record<string, ActivityItem[]>
  >({});
  const [selectedDay, setSelectedDay] = useState<string>(
    new Date().toLocaleDateString(),
  ); // Initialize with current date



  const currentDate = new Date().toLocaleDateString();
  const heading =
    selectedDay === currentDate ? "Today's Activity" : selectedDay;

  useEffect(() => {
    const activitiesToUse = officeData?.allActivity?.flatMap(day => day.activity) || officeData?.activity || [];

    if (activitiesToUse.length) {
      const groupedActivities = groupActivitiesByDate(activitiesToUse);
      console.log('Grouped: ', groupedActivities)
      setGroupedActivity(groupedActivities); // Assume setGroupedActivity updates a state variable that holds the grouped activities
    }
  }, [officeData]);

  if (
    selectedDay &&
    (!groupedActivities[selectedDay] ||
      groupedActivities[selectedDay].length === 0)
  ) {
    return (
      <>
        <div className="flex w-full items-center justify-between  mb-4 px-3 ">
          <h1 className="text-2xl   font-semibold tracking-normal text-grey">
            {selectedDay ? selectedDay : `Today's Activites`}
          </h1>
          <ActivityFeedDropdown
            dates={Object.keys(groupedActivities)}
            onSelectDate={setSelectedDay}
          />
        </div>
        <div className="border-t p-5 text-sm flex items-center  flex-row">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 mr-2"
          >
            {/* SVG path data */}
          </svg>
          Nothing to report for {selectedDay}.
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex w-full items-center justify-between  mb-4 px-3 ">
        <h1 className="text-2xl   font-semibold tracking-normal text-grey">
          {heading}
        </h1>
        <ActivityFeedDropdown
          dates={Object.keys(groupedActivities).reverse()}
          onSelectDate={setSelectedDay}
        />
      </div>
      {Object.entries(groupedActivities)
        .reverse()
        .map(
          ([date, activities]) =>
            (!selectedDay || date === selectedDay) && (
              <Fragment key={date}>
                <ul className="space-y-3 mx-5 max-h-80 overflow-auto hide-scrollbars">
                  {activities.map((activityItem) => (
                    <li
                      key={`${date}-${activityItem.timestamp.seconds}`}
                      className="relative flex gap-x-6"
                    >
                      <div
                        className={classNames(
                          "absolute left-0 top-0 flex w-6 justify-center",
                          "h-6",
                        )}
                      >
                        <div className="w-px bg-gray-200" />
                      </div>
                      <>
                        <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
                          {activityItem.available ? (
                            <div className="h-1.5 w-1.5 rounded-full bg-green-100 ring-1 ring-green-300" />
                          ) : (
                            <div className="h-1.5 w-1.5 rounded-full bg-red-100 ring-1 ring-red-300" />
                          )}
                        </div>
                        <p className="flex-auto py-0.5 -ml-4 text-xs leading-5 text-gray-500">
                          <span className="font-medium text-gray-900">
                            {activityItem.name}
                          </span>{" "}
                          {activityItem.available ? "left " : "used "}
                          <span className="font-medium text-gray-900">
                            {activityItem.spot}
                          </span>
                        </p>
                        <time
                          dateTime={new Date(
                            activityItem.timestamp.seconds * 1000,
                          ).toISOString()}
                          className="flex-none py-0.5 text-xs leading-5 text-gray-500"
                        >
                          {formatTimestamp(activityItem.timestamp)}
                        </time>
                      </>
                    </li>
                  ))}
                </ul>
              </Fragment>
            ),
        )}
    </>
  );
}

function groupActivitiesByDate(activities: ActivityItem[]) {
  const grouped = activities.reduce(
    (acc, activity) => {
      const date = new Date(
        activity.timestamp.seconds * 1000,
      ).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(activity);
      return acc;
    },
    {} as Record<string, ActivityItem[]>,
  );

  // Sort the activities within each group by timestamp in descending order
  Object.keys(grouped).forEach((date) => {
    grouped[date].sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
  });

  return grouped;
}
