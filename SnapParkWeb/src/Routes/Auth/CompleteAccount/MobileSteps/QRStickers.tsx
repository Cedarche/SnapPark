import { useRecoilState } from "recoil";
import { stepsArrayState } from "@/Reusable/RecoilState";
// import { generatePDF } from "@/Routes/Dashboard/DashComponents/GeneratePDF";

export default function QRStickers() {
  const [steps, setSteps] = useRecoilState(stepsArrayState);

  const updateStepStatus = (clickedStepName: any) => {
    const updatedSteps = steps.map((step) => {
      if (step.name === clickedStepName) {
        return { ...step, status: "current" };
      } else {
        if (step.status === "current") {
          return { ...step, status: "complete" };
        }
        return step;
      }
    });

    setSteps(updatedSteps);
  };
  
  return (
    <div className="bg-white shadow w-full mt-0">
      <div className="px-4 py-4 sm:p-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          Managing QR Codes
        </h3>
        <div className="mt-2 sm:flex-col sm:items-start sm:justify-between">
          <div className="max-w-xl text-sm text-gray-500">
            <p>
              Once you've entered all of your office parking spaces, we'll
              generate a unique QR code for each spot. <br />
              <br />
              On the Dashboard you can edit or complete your parking spots list,
              then generate a PDF and cut & attach the QR codes manually using
              the attached guide.
            </p>
          </div>
          <div className="mt-5 sm:ml-6 sm:mt-2 flex justify-end sm:flex-shrink-0 sm:items-center">
            <button
              type="button"
              onClick={() => updateStepStatus("Choose Plan")}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm
               font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline
                focus-visible:outline-2 focus-visible:outline-offset-2 
                focus-visible:outline-indigo-500"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
