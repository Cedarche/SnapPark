import React, { useEffect, useState } from 'react';

interface ExpirationDateProps {
  userData: any; // Consider defining a more specific type for userData
  planData: {
    status: string;
  };
}

const ExpirationDate: React.FC<ExpirationDateProps> = ({ userData, planData }) => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (planData?.status === 'trialing' && userData && userData.data.createdAt) {
      const createdAtDate = new Date(userData.data.createdAt.seconds * 1000);
      const expirationPeriod = 30; // Set your expiration period in days

      // Calculate expiration date
      const expirationDateTime = createdAtDate.getTime() + expirationPeriod * 24 * 60 * 60 * 1000 - 1 * 24 * 60 * 60 * 1000;
      const expiration = new Date(expirationDateTime);
      const expirationString = `Expires on ${expiration.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`;

      setMessage(expirationString);
    } else {
      // Calculate the 1st of the next month
      const currentDate = new Date();
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      const billingString = `Your next bill will be on ${nextMonth.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`;

      setMessage(billingString);
    }
  }, [userData, planData]);

  return (
    <div className="mt-1 text-xs text-gray-600 sm:flex sm:items-center">
      {message}
    </div>
  );
};

export default ExpirationDate;
