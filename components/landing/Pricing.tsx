export default function Pricing() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600">
            One plan with everything you need to maximize your profits
          </p>
        </div>

        {/* Pricing Card */}
        <div className="bg-gradient-to-br from-primary to-primary-light rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8 sm:p-12">
            {/* Plan Name */}
            <div className="text-center mb-8">
              <h3 className="font-heading text-2xl font-bold text-white mb-2">
                Pro Plan
              </h3>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-accent">$34.99</span>
                <span className="text-xl text-white/80">/month</span>
              </div>
              <p className="text-secondary-light mt-2">7-day free trial • Cancel anytime</p>
            </div>

            {/* Features List */}
            <div className="space-y-4 mb-8">
              {[
                "Unlimited Calculations",
                "AI-Powered Material Calculator",
                "AI Weekly Price Monitoring",
                "AI Competitive Price Suggestions",
                "Marketplace Fee Integrator (Etsy, Shopify, Amazon)",
                "Save Unlimited Products",
                "Instant AI Recall",
                "Calculation History",
                "Savings Tracker",
                "Priority Support"
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white text-lg">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <a
              href="/signup"
              className="block w-full bg-accent hover:bg-accent-dark text-primary font-bold text-center px-8 py-4 rounded-lg text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Start Free Trial
            </a>
            
            <p className="text-center text-white/70 text-sm mt-4">
              No credit card required for trial
            </p>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="mt-12 bg-secondary/10 rounded-xl p-8 text-center">
          <h4 className="font-heading text-2xl font-bold text-primary mb-4">
            Pays for Itself in the First Week
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div>
              <div className="text-3xl font-bold text-secondary mb-2">$200-500</div>
              <p className="text-gray-600">Monthly savings from preventing underpricing</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary mb-2">$100-300</div>
              <p className="text-gray-600">Monthly savings from material optimization</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary mb-2">$100-500</div>
              <p className="text-gray-600">Monthly savings from better supplier prices</p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t-2 border-secondary/20">
            <p className="text-xl font-semibold text-primary">
              Total Value: <span className="text-secondary">$500-1,600/month</span> for just <span className="text-accent">$34.99/month</span>
            </p>
            <p className="text-gray-600 mt-2">That's a 14-46x return on investment!</p>
          </div>
        </div>
      </div>
    </section>
  );
}