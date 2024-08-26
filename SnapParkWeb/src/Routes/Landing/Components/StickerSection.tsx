import { QrCodeIcon, PrinterIcon, ScissorsIcon, MapPinIcon } from '@heroicons/react/20/solid'
import ExampleSticker from '../../../assets/Example_Sticker.png'
import { appName } from '@/Reusable/constants'

const features = [
  {
    name: 'Custom QR Codes',
    description: 'Each parking spot gets a unique QR code, ensuring accurate tracking and ease of use for all employees.',
    icon: QrCodeIcon,
  },
  {
    name: 'Easy to Print',
    description: 'Print your QR stickers with any standard printer. Our designs are optimized for hassle-free printing and use.',
    icon: PrinterIcon,
  },
  {
    name: 'Simple Setup',
    description: 'Cut out and place the stickers yourself—no need for professional installation.',
    icon: ScissorsIcon,
  },
  // {
  //   name: 'Precise Placement',
  //   description: 'With clear instructions for placement, ensuring maximum visibility and scan-ability for each parking spot.',
  //   icon: MapPinIcon,
  // },
]

export default function StickerSection() {
  return (
    <div className="bg-white py-24" id="Stickers">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-20 sm:rounded-3xl sm:px-10 sm:py-24 lg:py-24 xl:px-24">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center lg:gap-y-0">
            <div className="lg:row-start-2 lg:max-w-md">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Streamline Your Parking
                <br />
                With {appName.toLowerCase().replace(/\b\w/g, char => char.toUpperCase())} QR Stickers.
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Create a seamless parking experience for your employees with custom QR codes for every spot. Easily print, cut, and place stickers for efficient spot management and real-time updates.
              </p>
            </div>
            <img
              // src="https://tailwindui.com/img/component-images/dark-project-app-screenshot.png"
              src={ExampleSticker}
              alt="Product screenshot"
              className="relative -z-20 py-5 min-w-full  max-w-[20rem] rounded-xl shadow-xl ring-1 ring-white/10 sm:min-w-[400px] lg:min-w-[400px] lg:ml-12 lg:row-span-4  lg:max-w-[20rem]"
              width={700}
              height={1000}
            />
            <div className="max-w-xl lg:row-start-3 lg:mt-10 lg:max-w-md lg:border-t lg:border-white/10 lg:pt-10">
              <dl className="max-w-xl space-y-8 text-base leading-7 text-gray-300 lg:max-w-none">
                {features.map((feature) => (
                  <div key={feature.name} className="relative">
                    <dt className="ml-9 inline-block font-semibold text-white">
                      <feature.icon className="absolute left-1 top-1 h-5 w-5 text-indigo-500" aria-hidden="true" />
                      {feature.name}
                    </dt>
                    <dd className="mt-2">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
