'use client';

import { useRouter } from 'next/navigation';

export default function Cancel() {
  const router = useRouter();

  const returnToSignup = () => {
    router.push('/');
  };

  const tryAgain = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
            <svg className="h-10 w-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Subscription Canceled
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Your subscription process was canceled. No charges were made.
          </p>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What happened?</h3>
            <p className="text-gray-600 text-left">
              The payment process was interrupted or you chose to cancel. 
              Your account is still active with limited features, and you can 
              upgrade to premium anytime.
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-900 mb-2">Still want to upgrade?</h4>
            <p className="text-sm text-blue-800">
              You can try subscribing again anytime. Your free account gives you 
              access to basic features so you can see how SolvedSuite works.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={tryAgain}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Try Again
            </button>
            <button
              onClick={returnToSignup}
              className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Continue with Free Account
            </button>
          </div>

          <div className="mt-6 text-center">
            <a 
              href="mailto:support@solvedsuite.com"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Need Help? Contact Support
            </a>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 mt-8">
          <p>Questions about SolvedSuite?</p>
          <p className="mt-1">We're here to help you make the best choice for your business.</p>
        </div>
      </div>
    </div>
  );
}