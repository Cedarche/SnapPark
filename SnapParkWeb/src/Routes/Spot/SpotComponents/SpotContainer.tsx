//
import PropagateLoader from "react-spinners/BarLoader";
import Progress from "./Progress";

export default function SpotContainer({
  officeData,
  spotID,
  available,
  handleNavigate,
  handleToggleAvailability,
  loading,
}: any) {
  const statusClasses = available
    ? "bg-green-100 fill-green-500 ring-green-200"
    : "bg-red-100 fill-red-500 ring-red-200";
  const statusText = available ? "Available" : "Taken";

  return (
    <div
      className="container mx-auto px-4 sm:px-6 lg:px-8 "
      style={{ maxWidth: "400px" }}
    >
      <div
        className="divide-y divide-none overflow-hidden rounded-xl border
         bg-white shadow-xl mt-5 flex-row"
      >
        <div className="py-4 pt-3 bg-white ">
          <div className="w-full px-4 py-1 p-6 flex flex-row items-center justify-between ">
            <span className="text-sm font-medium">Company: </span>
            <span
              className="inline-flex items-center rounded-md bg-gray-50 px-2 py-2 
              text-md font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
              onClick={handleNavigate}
            >
              {officeData?.company}
            </span>
          </div>
          <div className="w-full px-4 py-1 p-6 flex flex-row items-center justify-between ">
            <span className="text-sm font-medium">Office: </span>
            <span
              className="inline-flex items-center rounded-md bg-gray-50 px-2 py-2 
              text-md font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
              onClick={handleNavigate}
            >
              {officeData?.office}
            </span>
          </div>
        </div>

        <div
          className={`mt-0 px-4 py-5 sm:p-6  flex flex-row justify-between ring-2 mx-3
             bg-green-100 bg-opacity-25 ${statusClasses} ring-inset rounded-xl `}
        >
          <p className="text-2xl font-bold">{spotID}</p>
          <span
            className={`inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-sm 
              font-medium ${statusClasses}`}
          >
            <svg className="h-1.5 w-1.5" viewBox="0 0 6 6" aria-hidden="true">
              <circle cx="3" cy="3" r="3" />
            </svg>
            {statusText}
          </span>
        </div>
        <div
          className="px-4 py-6 sm:px-6"
          style={{
            borderTop: "none",
            borderBottom: "1px solid lightgrey",
          }}
        >
          <Progress data={officeData?.parkingSpots ?? []} />
        </div>
        <div
          className="px-4 py-4 sm:p-6 flex flex-row justify-center items-center
           bg-gray-100 ring-gray-900/5 ring-inset"
        >
          <button
            type="button"
            onClick={handleToggleAvailability}
            className="rounded-xl w-full bg-blue-600 px-6 py-3 text-center text-md font-semibold
               text-white shadow-md hover:bg-indigo-500 focus-visible:outline 
               focus-visible:outline-2 focus-visible:outline-offset-2
                focus-visible:outline-indigo-600"
          >
            {loading ? (
              <div className="w-full flex justify-center min-h-full">
                {/* <Spinner /> */}
                <PropagateLoader
                  color="#fff"
                  loading={loading}
                  // size={24}
                  cssOverride={{ margin: 9, borderRadius: 4 }}
                  height={6}
                  width={100}
                  aria-label="Loading Spinner"
                  data-testid="loader"
                />
              </div>
            ) : available ? (
              "Mark as taken"
            ) : (
              "Vacate parking spot"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
