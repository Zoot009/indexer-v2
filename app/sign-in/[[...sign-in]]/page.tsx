import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Sign In Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-black p-8">
        <div className="w-full max-w-md">
          <SignIn 
            appearance={{
              baseTheme: undefined,
              elements: {
                rootBox: "w-full",
                card: "bg-black shadow-none border-0",
                headerTitle: "text-white text-2xl font-semibold",
                headerSubtitle: "text-gray-400 text-sm",
                socialButtonsBlockButton: "bg-gray-900 border-gray-800 text-white hover:bg-gray-800",
                socialButtonsBlockButtonText: "text-white font-normal",
                formFieldLabel: "text-white text-sm",
                formFieldInput: "bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 focus:ring-emerald-500 focus:border-emerald-500",
                formButtonPrimary: "bg-emerald-500 hover:bg-emerald-600 text-white normal-case shadow-none",
                footerActionLink: "text-emerald-500 hover:text-emerald-400",
                identityPreviewText: "text-white",
                identityPreviewEditButton: "text-emerald-500",
                formFieldInputShowPasswordButton: "text-gray-400 hover:text-white",
                formFieldAction: "text-emerald-500 hover:text-emerald-400",
                footer: "hidden",
                dividerLine: "bg-gray-800",
                dividerText: "text-gray-400",
                formFieldSuccessText: "text-emerald-400",
                formFieldErrorText: "text-red-400",
                identityPreviewEditButtonIcon: "text-emerald-500",
                formHeaderTitle: "text-white",
                formHeaderSubtitle: "text-gray-400",
                otpCodeFieldInput: "bg-gray-900 border-gray-800 text-white",
                formResendCodeLink: "text-emerald-500 hover:text-emerald-400",
                footerActionText: "text-gray-400",
              },
            }}
          />
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-teal-700 items-center justify-center p-12">
        <div className="text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-teal-600 flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-6xl font-bold text-white">InDeXeR</h1>
            </div>
          </div>
          <p className="text-teal-200 text-xl max-w-md mx-auto">
            Log in to access your projects and continue where you left off.
          </p>
        </div>
      </div>
    </div>
  );
}
