const faqs = [
    {
      id: 1,
      question: "How do employees sign up?",
      answer:
        "No accounts are required for employees, they join an office's notification list by scanning a QR code and tapping the 'Join Notification List' popup, then following the prompts.",
    },
    {
      id: 2,
      question: "What happens if someone forgets to scan in?",
      answer:
        "While this is a common issue when the system is first introduced into an office, a simple email reminder is usually enough to prevent it from happening again. Nobody wants to be the person who inconveniences their workmates. \n\nWe also provide an 'All Spots' sticker, which can be placed near the office's main entrance. Employees who forget to scan in the carpark, get a reminder as they walk through the front door.",
    },
    {
      id: 3,
      question: "What's stopping employees from reserving a spot early?",
      answer:
        "Whenever a parking spot is marked as taken, the name of the user and time it was taken is recorded. The office admin can easily check if anyone is marking spots early from the Dashboard.",
    },
    {
      id: 4,
      question: "Can I change what sort of notifications get sent out?",
      answer:
        "Yes, the office admin can edit how often notifications get sent out from within the Dashboard. For example, you can send a notification when there is 1 spot remaining, and another when the carpark is full. We also support sending custom messages when specific spots are taken.",
    },
    {
      id: 5,
      question: "How can I cancel my account?",
      answer:
        "You can cancel or suspend your account at any time from within the Dashboard.",
    },
    // More questions...
  ]
  
  export default function FAQ() {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-7xl divide-y divide-gray-900/10 px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
          <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">Frequently asked questions</h2>
          <dl className="mt-10 space-y-8 divide-y divide-gray-900/10">
            {faqs.map((faq) => (
              <div key={faq.id} className="pt-8 lg:grid lg:grid-cols-12 lg:gap-8">
                <dt className="text-base font-semibold leading-7 text-gray-900 lg:col-span-5">{faq.question}</dt>
                <dd className="mt-4 lg:col-span-7 lg:mt-0">
                  <p className="text-base leading-7 text-gray-600">{faq.answer}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    )
  }
  