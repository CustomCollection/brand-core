import AccountSidebar from '@/components/account/AccountSidebar';

export const metadata = {
  title: 'My Account | Brand Core',
  description: 'Manage your account details and preferences.',
};

export default function AccountLayout({ children }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-light uppercase tracking-wider text-primary animate-fade-in-up">
          My Account
        </h1>
      </div>
      <div className="flex flex-col md:flex-row gap-12 animate-fade-in-up animate-delay-100">
        <AccountSidebar />
        <main className="flex-1 bg-background">{children}</main>
      </div>
    </div>
  );
}
