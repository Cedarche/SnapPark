import {  BellIcon, BoltIcon, QrCodeIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import TwoPhoneImage from '../../../assets/SP_2PhoneMockup_3000.png'
import { appName } from '@/Reusable/constants'

const features = [
  {
    name: 'Real-Time Availability',
    description: 'Instantly check parking spot availability through the web application. No more circling the lot looking for an open spot.',
    icon: BoltIcon, // Assuming you have an icon for representing availability or grid view
  },
  {
    name: 'Instant Notifications',
    description: 'Get notified when parking spots are about to run out and the moment the lot is full. Opt in for alerts with just a few taps.',
    icon: BellIcon, // Assuming you have a bell icon for notifications
  },
  {
    name: 'Effortless Registration',
    description: `Secure your spot with a quick scan. ${appName.toLowerCase().replace(/\b\w/g, char => char.toUpperCase())} streamlines parking for a hassle-free start to your workday.`,
    icon: QrCodeIcon, // Assuming you have a QR code icon or similar for scanning/registration
  },
  {
    name: 'Automatic reset',
    description: `All parking spots automatically reset to available at midnight, ready for the next day.`,
    icon: ArrowPathIcon, // Assuming you have a QR code icon or similar for scanning/registration
  },
]


export default function NotificationSection() {
  return (
    <div className="overflow-hidden bg-white py-24 sm:py-32 my-40 " id="NotificationSection">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:ml-auto lg:pl-4 lg:pt-0">
            <div className="lg:max-w-lg">
              <h2 className="text-base font-semibold leading-7 text-indigo-600">Stay Informed</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Intelligent Notifications</p>
              {/* <p className="mt-6 text-lg leading-8 text-gray-600">
                {appName.toLowerCase().replace(/\b\w/g, char => char.toUpperCase())} keeps you ahead with instant notifications. Receive an alert when only 3 spots are left and a full lot notification to save time. Customize your alerts to get updates via SMS or via the App, ensuring seamless parking every day.
              </p> */}
              <p className="mt-6 text-lg leading-8 text-gray-600">
              Snap Park simplifies workplace parking by using QR code stickers on each spot, allowing employees to check availability on their mobile devices. When full, Snap Park notifies all employees, ensuring everyone stays informed              </p>
              <dl className="mt-8 max-w-xl space-y-6 text-base leading-7 text-gray-600 lg:max-w-none">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900">
                      <feature.icon className="absolute left-1 top-2 h-5 w-5 text-indigo-600" aria-hidden="true" />
                      {feature.name}
                    </dt>{' '}
                    <dd className="inline">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <div className="flex items-start  justify-end lg:order-first">
            <img
              // src="https://tailwindui.com/img/component-images/dark-project-app-screenshot.png"
              src={TwoPhoneImage}
              alt="Product screenshot"
              className=" w-[21.5rem] max-w-none rounded-xl  sm:w-[40rem]  p-0"
              width={2432}
              height={1442}
            />
          </div>
        </div>
      </div>
    </div>
  )
}


