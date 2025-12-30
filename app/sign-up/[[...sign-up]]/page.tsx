import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Left side - Sign Up Form (Neobrutalist) */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-[var(--color-secondary-background)]">
        <div
          className="w-full max-w-md border-4 border-black dark:border-white rounded-none p-6"
          style={{ boxShadow: 'var(--shadow)' }}
        >
          <SignUp
            appearance={{
              baseTheme: undefined,
              elements: {
                rootBox: 'w-full',
                card: 'bg-[var(--color-secondary-background)] shadow-none border-0 rounded-none',
                headerTitle: 'text-foreground text-3xl font-bold',
                headerSubtitle: 'text-muted-foreground text-sm',
                socialButtonsBlockButton:
                  'bg-background text-foreground border-4 border-black dark:border-white rounded-none hover:bg-[var(--color-secondary-background)]',
                socialButtonsBlockButtonText: 'text-foreground font-normal',
                dividerLine: 'bg-black dark:bg-white',
                dividerText: 'text-muted-foreground',
                formFieldLabel: 'text-foreground text-sm',
                formFieldInput:
                  'bg-background text-foreground placeholder:text-muted-foreground border-4 border-black dark:border-white rounded-none focus:ring-[var(--color-ring)] focus:border-[var(--color-ring)]',
                otpCodeFieldInput:
                  'bg-background text-foreground border-4 border-black dark:border-white rounded-none',
                formFieldSuccessText: 'text-[var(--color-main)]',
                formFieldErrorText: 'text-red-500',
                formHeaderTitle: 'text-foreground',
                formHeaderSubtitle: 'text-muted-foreground',
                formResendCodeLink:
                  'text-[var(--color-main)] hover:opacity-90',
                formFieldAction: 'text-[var(--color-main)] hover:opacity-90',
                formFieldInputShowPasswordButton: 'text-muted-foreground hover:text-foreground',
                identityPreviewText: 'text-foreground',
                identityPreviewEditButton: 'text-[var(--color-main)]',
                identityPreviewEditButtonIcon: 'text-[var(--color-main)]',
                footerActionText: 'text-muted-foreground',
                footerActionLink:
                  'text-[var(--color-main)] hover:opacity-90',
                formButtonPrimary:
                  'normal-case bg-[var(--color-main)] text-[var(--color-main-foreground)] border-4 border-black dark:border-white rounded-none shadow-none transition-transform hover:translate-x-[2px] hover:translate-y-[2px]'
              }
            }}
          />
        </div>
      </div>

      {/* Right side - Branding (Neobrutalist) */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 bg-[var(--color-main)] text-[var(--color-main-foreground)] border-l-4 border-black dark:border-white" style={{ boxShadow: 'var(--shadow)' }}>
        <div className="text-center max-w-lg">
          <div className="flex items-center justify-center mb-10">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-[var(--color-secondary-background)] border-4 border-black dark:border-white flex items-center justify-center -rotate-6" style={{ boxShadow: 'var(--shadow)' }}>
                <svg className="w-10 h-10 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-5xl font-bold tracking-tight">InDeXeR</h1>
            </div>
          </div>
          <p className="text-lg">
            Create an account to start managing your projects efficiently.
          </p>
        </div>
      </div>
    </div>
  );
}
