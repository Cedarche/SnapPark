import React from "react";

interface PlanData {
  status: string;
}

interface StatusConfig {
  [key: string]: {
    bgColor: string;
    textColor: string;
    fill: string;
    text: string;
  };
}

const statusConfig: StatusConfig = {
  active: {
    bgColor: "bg-green-100",
    textColor: "text-green-700",
    fill: "fill-green-500",
    text: "Active",
  },
  suspended: {
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    fill: "fill-yellow-500",
    text: "Suspended",
  },
  past_due: {
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    fill: "fill-yellow-500",
    text: "Service paused. Please add or update payment details.",
  },
  unpaid: {
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    fill: "fill-red-500",
    text: "Service paused. Please add orupdate payment details.",
  },
  canceled: {
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    fill: "fill-red-500",
    text: "Not Active",
  },
  trialing: {
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    fill: "fill-green-500",
    text: "Free for 30 Days",
  },
  default: {
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    fill: "fill-yellow-500",
    text: "Something went wrong...",
  },
};

function renderStatusBadge(status: string): JSX.Element {
  const { bgColor, textColor, fill, text } =
    statusConfig[status] || statusConfig.default;

  return (
    <span
      className={`inline-flex items-center gap-x-1.5 rounded-md ${bgColor} px-2 py-1 text-xs font-medium ${textColor}`}
    >
      <svg
        className={`h-1.5 w-1.5 ${fill}`}
        viewBox="0 0 6 6"
        aria-hidden="true"
      >
        <circle cx="3" cy="3" r="3" />
      </svg>
      {text}
    </span>
  );
}

interface AccountStatusProps {
  planData: PlanData;
}

const AccountStatus: React.FC<AccountStatusProps> = ({ planData }) => {
  return (
    <div className="text-sm -ml-0.5 my-0.5 font-medium text-gray-700">
      {renderStatusBadge(planData?.status)}
    </div>
  );
};

export default AccountStatus;
