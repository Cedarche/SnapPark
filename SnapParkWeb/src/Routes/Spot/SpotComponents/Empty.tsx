import {
    ExclamationTriangleIcon,
    PlusCircleIcon,
  } from "@heroicons/react/24/outline";

export default function Empty() {
    return (
      <div className="text-center w-full h-screen flex items-center pt-20 flex-col">
        <div
          className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full
                       bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10"
        >
          <ExclamationTriangleIcon
            className="h-6 w-6 text-yellow-500"
            aria-hidden="true"
          />
        </div>
        <h3 className="mt-2 text-sm font-semibold text-gray-900">
          No park ID found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          If you believe this is an error, please <a href="/contact" className="text-blue-500">contact us</a>.
        </p>
        <div className="mt-6">
          {/* <button
            type="button"
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            New Project
          </button> */}
        </div>
      </div>
    );
  }
  