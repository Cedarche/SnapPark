import { Fragment, useEffect } from "react";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Spinner from "@/Reusable/Spinner";
import { approvedCurrencyArray, currencySymbols } from "@/Reusable/constants";

type ProjectStatus = "paid" | "In progress" | "overdue" | "unpaid";

const statuses: { [key in ProjectStatus]: string } = {
  paid: "text-green-700 bg-green-50 ring-green-600/20",
  "In progress": "text-gray-600 bg-gray-50 ring-gray-500/10",
  overdue: "text-yellow-800 bg-yellow-50 ring-yellow-600/20",
  unpaid: "text-red-800 bg-red-50 ring-red-600/20",
};

type Project = {
  id: number;
  name: string;
  href: string;
  status: ProjectStatus; // Use the ProjectStatus type here
  chargedTo: string;
  dueDate: string;
  dueDateTime: string;
};

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export default function InvoicesList({ userData }: any) {
  // useEffect(() => {
  //   console.log("Invoice Data: ", userData.data.plan.currencyCode);
  // }, []);

  const invoiceArray = userData?.invoices;


  if (
    invoiceArray.length === 0 ||
    (invoiceArray.length === 1 && invoiceArray[0]?.data?.number?.endsWith("0001"))
  ) {
    return (
      <div className="w-full min-h-[320px] bg-gray-50 mt-2 rounded-lg shadow-sm flex flex-col items-center justify-center">
        <ExclamationTriangleIcon className="h-10 w-10 text-yellow-300 mb-2" />
        There's nothing here yet...
        <span className="text-sm mt-1 text-gray-500 text-wrap">
          Invoices will appear as they are processed at the start of each new month.
        </span>
      </div>
    );
  }

  const sortedInvoiceArray = [...invoiceArray].sort(
    (a, b) => b.data.created - a.data.created,
  );

  if (!sortedInvoiceArray) {
    return (
      <div className="flex w-full items-center justify-center min-h-16">
        <Spinner />
      </div>
    );
  }
  return (
    <ul role="list" className="divide-y divide-gray-100 px-2">
      {sortedInvoiceArray.map((invoice) => (
        <li
          key={invoice?.data.id}
          className="flex items-center justify-between gap-x-6 py-5"
        >
          <div className="min-w-0">
            <div className="flex items-start gap-x-3">
              <p className="text-sm font-semibold leading-6 text-gray-900">
                {invoice?.data.number}
              </p>
              <p
                className={classNames(
                  statuses[invoice?.data.status],
                  "rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                )}
              >
                {invoice?.data.status.charAt(0).toUpperCase() +
                  invoice?.data.status.slice(1).toLowerCase()}
              </p>
            </div>
            <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
              <p className="whitespace-nowrap">
                Created at{" "}
                <time
                  dateTime={new Date(
                    invoice?.data.created * 1000,
                  ).toISOString()}
                >
                  {new Date(invoice?.data.created * 1000).toLocaleString(
                    "en-GB",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true, // Use 12-hour time format; set to false for 24-hour format
                    },
                  )}
                </time>
              </p>
              <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
                <circle cx={1} cy={1} r={1} />
              </svg>
              <p className="truncate">{invoice.data.total !== 0 ? `$${invoice.data.total/100} ${userData.data.plan.currencyCode}` : 'No usage'}</p>
            </div>
          </div>
          <div className="flex flex-none items-center gap-x-4">
            <a
              href={invoice?.data.hosted_invoice_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block"
            >
              View Invoice
              <span className="sr-only">, {invoice?.data.number}</span>
            </a>
            <Menu as="div" className="relative flex-none">
              <Menu.Button className="-m-2.5 block p-2.5 text-gray-500 hover:text-gray-900">
                <span className="sr-only">Open options</span>
                <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href={invoice?.data.hosted_invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={classNames(
                          active ? "bg-gray-50" : "",
                          "block px-3 py-1 text-sm leading-6 text-gray-900",
                        )}
                      >
                        Open
                        <span className="sr-only">
                          , {invoice?.data.number}
                        </span>
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href={invoice?.data.invoice_pdf}
                        // target="_blank"
                        // rel="noopener noreferrer"
                        className={classNames(
                          active ? "bg-gray-50" : "",
                          "block px-3 py-1 text-sm leading-6 text-gray-900",
                        )}
                      >
                        Download
                        <span className="sr-only">
                          , {invoice?.data.number}
                        </span>
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active ? "bg-gray-50" : "",
                          "block px-3 py-1 text-sm leading-6 text-gray-900",
                        )}
                      >
                        Delete
                        <span className="sr-only">
                          , {invoice?.data.number}
                        </span>
                      </a>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </li>
      ))}
    </ul>
  );
}
