// app/page.tsx

import {
  Bell,
  CreditCard,
  Home,
  PiggyBank,
  Repeat,
  ShieldCheck,
  Zap,
  TrendingUp,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-green-400 mb-8">
          <ShieldCheck size={16} />
          Connected with BankID
        </div>

        <h1 className="text-6xl font-bold max-w-4xl leading-tight">
          Your Personal Economy Agent
        </h1>

        <p className="text-xl text-slate-400 mt-6 max-w-3xl">
          An AI that continuously monitors your finances, finds better deals,
          negotiates services, moves savings, refinances loans, and can even
          act on your behalf when you've approved it.
        </p>

        <div className="flex gap-4 mt-10">
          <button className="bg-green-500 hover:bg-green-600 px-6 py-4 rounded-xl font-semibold">
            Login with BankID
          </button>

          <button className="border border-slate-700 px-6 py-4 rounded-xl">
            Watch Demo
          </button>
        </div>
      </section>

      {/* Permission Levels */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold mb-10">
          Choose How Much Control You Give
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <PermissionCard
            title="Suggest Only"
            description="AI finds opportunities and gives recommendations."
          />

          <PermissionCard
            title="Ask Before Acting"
            description="AI prepares actions and waits for approval."
          />

          <PermissionCard
            title="Autonomous"
            description="AI executes approved categories automatically."
          />
        </div>
      </section>

      {/* Dashboard */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold mb-10">
          Opportunities Found Today
        </h2>

        <div className="grid lg:grid-cols-2 gap-6">
          <OpportunityCard
            icon={<Home />}
            title="Mortgage Optimization"
            savings="2,340 kr/month"
            description="Bank A offers 2.10% compared to your current 3.45%."
            action="Move Mortgage"
          />

          <OpportunityCard
            icon={<PiggyBank />}
            title="Better Savings Account"
            savings="+3,700 kr/year"
            description="Move 100,000 kr to a 4.15% savings account."
            action="Open Account & Move Funds"
          />

          <OpportunityCard
            icon={<Repeat />}
            title="Subscriptions"
            savings="489 kr/month"
            description="7 unused subscriptions detected."
            action="Cancel Subscriptions"
          />

          <OpportunityCard
            icon={<Zap />}
            title="Electricity Provider"
            savings="4,100 kr/year"
            description="Found a cheaper provider with same coverage."
            action="Switch Provider"
          />
        </div>
      </section>

      {/* AI Agent Rules */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold mb-10">
          Automation Rules
        </h2>

        <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800">
          <ul className="space-y-5 text-slate-300">
            <li>
              ✓ Move mortgage if interest rate is at least 0.50% lower
            </li>
            <li>
              ✓ Move savings automatically if gain exceeds 1,000 kr/year
            </li>
            <li>
              ✓ Cancel subscriptions unused for 60+ days
            </li>
            <li>
              ✓ Renegotiate insurance annually
            </li>
            <li>
              ✓ Ask approval for transactions above 20,000 kr
            </li>
          </ul>
        </div>
      </section>

      {/* Example Notification */}
      <section className="max-w-4xl mx-auto px-6 pb-32">
        <div className="bg-green-500/10 border border-green-500/30 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="text-green-400" />
            <h3 className="font-bold text-xl">
              Agent Found Better Savings Account
            </h3>
          </div>

          <p className="text-slate-300 mb-6">
            I found a savings account paying 4.15% interest.
            Moving your 100,000 kr would generate approximately
            1,650 kr more per year.
          </p>

          <div className="flex gap-4">
            <button className="bg-green-500 px-5 py-3 rounded-xl">
              Yes, Open Account & Move Funds
            </button>

            <button className="border border-slate-700 px-5 py-3 rounded-xl">
              Review Details
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function PermissionCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
      <h3 className="font-bold text-xl mb-3">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  );
}

function OpportunityCard({
  title,
  description,
  savings,
  action,
  icon,
}: any) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h3 className="font-bold text-xl">{title}</h3>
      </div>

      <p className="text-green-400 font-semibold mb-2">
        Potential Savings: {savings}
      </p>

      <p className="text-slate-400 mb-6">{description}</p>

      <button className="bg-white text-black px-4 py-2 rounded-xl">
        {action}
      </button>
    </div>
  );
}
