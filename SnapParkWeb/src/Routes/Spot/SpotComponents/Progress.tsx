interface ProgressProps {
  data: Array<{
    name: string;
    available: boolean;
    office: string;
    utilisation: number;
  }>;
}

export default function Progress({ data }: ProgressProps) {
  const sortedData = [...data].sort((a, b) => {
    return a.available === b.available ? 0 : a.available ? 1 : -1;
  });

  // Check if any spot's name is longer than 2 characters
  const isNameLongerThanTwo = data.some(spot => spot.name.length > 2);

  // Set the threshold based on the length of the spot names
  const threshold = isNameLongerThanTwo ? 5 : 9;

  return (
    <div>
      <h4 className="sr-only">Status</h4>
      <p className="text-sm font-medium text-gray-900">
        Remaining Parking Spots
      </p>
      <div className="mt-2 flex" aria-hidden="true">
        {sortedData.map((spot, index) => (
          <div key={index} className="mx-1 flex-1 items-center justify-center">
            <div className="overflow-hidden rounded-full bg-gray-200 flex-1">
              <div
                className="h-2 rounded-full bg-indigo-600"
                style={{
                  width: spot.available ? "0%" : "100%",
                }}
              />
            </div>
            {data.length <= threshold ? (
              <div
                className="text-gray-500 text-center mt-1 font-semibold"
                style={{ fontSize: "13px" }}
              >
                {spot.name}
              </div>
            ) : // <div
            //   className="text-gray-500 text-center mt-1 font-semibold"
            //   style={{ fontSize: "7px" }}
            // >
            //   {spot.name}
            // </div>
            null}
          </div>
        ))}
      </div>
    </div>
  );
}
