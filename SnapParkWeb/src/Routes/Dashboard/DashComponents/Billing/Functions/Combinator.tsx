interface DailyData {
  value: number;
  offices: { [key: string]: number }; // Defines an index signature for offices
}
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const officeYearCombinator = (usage, targetYear, targetOfficeID) => {
  // Initialize an empty array to hold all combinedUsage for the target year and office ID
  let annualOfficeCombinedUsage = [];

  // Iterate through each usage record
  usage.forEach((usageRecord) => {
    // We assume combinedUsage array exists; you might want to add checks if this might not always be the case
    usageRecord.data.combinedUsage.forEach((item) => {
      const date = new Date(item.date.seconds * 1000);
      const year = date.getFullYear();

      // Check if the year matches the targetYear and the officeID matches the targetOfficeID
      if (year === targetYear && item.officeID === targetOfficeID) {
        // Add it to the annualOfficeCombinedUsage array
        annualOfficeCombinedUsage.push(item);
      }
    });
  });

  // console.log(`Combined Usage for ${targetYear} at office ${targetOfficeID}: `, annualOfficeCombinedUsage);
  return annualOfficeCombinedUsage;
};

export const yearCombinator = (usage, targetYear) => {
  //   console.log("Offices: ", officeIds);

  // Initialize an empty array to hold all combinedUsage for the target year
  let annualCombinedUsage = [];

  // Iterate through each usage record
  usage.forEach((usageRecord) => {
    const year = new Date(
      usageRecord.data.combinedUsage[0].date.seconds * 1000,
    ).getFullYear();
    if (year === targetYear) {
      // Extract combinedUsage and add it to the annualCombinedUsage array
      const combinedUsage = usageRecord.data.combinedUsage;
      annualCombinedUsage = annualCombinedUsage.concat(combinedUsage);
    }
  });

  // console.log(`Combined Usage for ${targetYear}: `, annualCombinedUsage);
  return annualCombinedUsage;
};

export const summarizeDailyUsage = (
  usageData: any[],
  officeDetails: { id: string; name: string }[],
  targetYear: number,
) => {
  // Create a map from office IDs to names for easy lookup
  const officeIdToNameMap = new Map<string, string>(
    officeDetails.map((office) => [office.id, office.name]),
  );

  const dailyUsageMap = new Map<string, DailyData>();

  usageData.forEach((usagePeriod) => {
    usagePeriod.data.combinedUsage.forEach((usageEntry) => {
      const date = new Date(usageEntry.date.seconds * 1000);
      const year = date.getFullYear();

      // Only process data for the target year
      if (year === targetYear) {
        const month = date.getMonth();
        const day = date.getDate();
        const dateString = `${year}-${month + 1}-${day}`;
        const messageCount = usageEntry.messageCount || 1;
        const officeID = usageEntry.officeID;
        const officeName = officeIdToNameMap.get(officeID) || "Unknown Office"; // Get office name or default to 'Unknown Office'

        // Aggregate daily usage
        let dailyData = dailyUsageMap.get(dateString);
        if (!dailyData) {
          dailyData = { value: 0, offices: {} };
          dailyUsageMap.set(dateString, dailyData);
        }
        dailyData.value += messageCount;
        // Use office name instead of ID
        dailyData.offices[officeName] =
          (dailyData.offices[officeName] || 0) + messageCount;
      }
    });
  });

  // Convert the Map to an array for easier consumption and sort by date
  const dailyUsage = Array.from(dailyUsageMap).map(([date, data]) => ({
    date,
    value: data.value,
    offices: data.offices,
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return dailyUsage;
};

export const summarizeData = (usage, planData) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthIndex = currentDate.getMonth();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentMonthName = monthNames[currentMonthIndex];
  const dateString = `${currentMonthName}${currentYear}`;
  const period = `${monthNames[currentDate.getMonth()]}, ${currentDate.getFullYear()}`;

  // Find the usage data for the current month and year
  const currentUsage = usage.find((item) => item.id === dateString);

  if (currentUsage) {
    const activeUsage = currentUsage.data.activeUsage;
    const totalUsage = currentUsage.data.totalUsage;
    // console.log(`Active Usage for ${dateString}: ${activeUsage}`);
    // console.log(`Total Usage for ${dateString}: ${totalUsage}`);


    const currency = planData?.subscriptionCurrency || "USD";

    // const pricePerUnit =
    //   planData?.priceMonthly[currency] || planData?.priceMonthly.USD;
    const pricePerUnit = planData?.price;

    // Calculate total cost based on total usage for the current period and price per unit
    const totalCost = (activeUsage * pricePerUnit).toFixed(2);
    // console.log('Total Cost:', totalCost)

    return { period, activeUsage, totalUsage, totalCost, currency };
  } else {
    const currency = planData?.subscriptionCurrency || "USD";

    // console.log(`No usage data found for ${dateString}`);
    return { period, activeUsage: 0, totalUsage: 0, totalCost: 0, currency };
  }
};

interface ChartData {
  [key: string]: any;
}

export const combineUsageData = (
  usageData: any[],
  officeDetails,
  targetYear,
): ChartData[] => {
  const data: Record<string, ChartData> = {};
  const officeNameMap = new Map<string, string>();

  // Map office IDs to names
  officeDetails.forEach((office: { id: string; name: string }) => {
    officeNameMap.set(office.id, office.name);
  });

  // Initialize data with proxy months and office names set to 0
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentMonth = new Date().getMonth(); // Get current month index (0-11)

  months.slice(0, currentMonth + 1).forEach((month) => {
    data[month] = { date: month }; // Initialize each month
    officeNameMap.forEach((name, id) => {
      data[month][name] = 0; // Initialize all offices with 0 usage for the month
    });
  });

  // Iterate over all usage data entries
  usageData.forEach((period) => {
    period.data.combinedUsage.forEach((usageEntry: any) => {
      const date = new Date(usageEntry.date.seconds * 1000);
      const month = date.toLocaleString("default", { month: "long" });
      const messageCount = usageEntry.messageCount || 1;
      const officeName = officeNameMap.get(usageEntry.officeID);

      if (officeName) {
        // Increment the usage for the specific office and month
        data[month][officeName] =
          ((data[month][officeName] as number) || 0) + messageCount;
      }
    });
  });

  return Object.values(data);
};

export const combineStats = (offices, targetYear) => {
  //   console.log("Combined offices: ", offices);
  //   let combinedActivity = [];
  let totalSpots = 0;
  let totalEmployees = 0;

  let utilisation = 0;

  offices.forEach((office) => {
    // combinedActivity = combinedActivity.concat(office.data.activity);
    totalSpots += office.data.parkingSpots.length;
    totalEmployees += office.data.notificationList.length;

    office.data.parkingSpots.forEach((spot) => {
      utilisation += spot.utilisation;
    });
  });

  const averageUtilisation = utilisation / totalSpots;

  //   console.log('totalSpots: ', totalSpots)
  //   console.log('totalEmployees: ', totalEmployees)
  //   console.log('averageUtilisation: ', averageUtilisation)

  return { totalSpots, totalEmployees, averageUtilisation };
};
