export default function Features() {
  const features = [
    {
      icon: "🤖",
      title: "AI-Powered Material Calculator",
      description: "Tell us what you want to make, and AI instantly calculates exact quantities needed. No more over-ordering or running out of materials.",
      highlight: "Unique Feature"
    },
    {
      icon: "💰",
      title: "Profit Calculator",
      description: "Factor in materials, labor, overhead, and marketplace fees to see your true profit margin.",
      highlight: null
    },
    {
      icon: "🔍",
      title: "AI Weekly Price Monitoring",
      description: "AI automatically checks for better material prices every week and notifies you of savings opportunities.",
      highlight: "Unique Feature"
    },
    {
      icon: "🏪",
      title: "Marketplace Fee Integrator",
      description: "Pre-configured for Etsy, Shopify, Amazon Handmade. See your net profit after all fees.",
      highlight: null
    },
    {
      icon: "📊",
      title: "AI Competitive Price Suggestion",
      description: "Get AI-powered market analysis and optimal pricing recommendations for your craft category.",
      highlight: null
    },
    {
      icon: "💾",
      title: "Save & Instant Recall",
      description: "Save your products once, and AI instantly recalls them whenever you need. Fast calculations every time.",
      highlight: null
    }
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4">
            Everything You Need to Price Profitably
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            SolvedSuite combines AI technology with proven pricing strategies to help you 
            maximize profits on every handmade item you create.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-transparent hover:border-secondary"
            >
              {feature.highlight && (
                <span className="inline-block bg-accent text-primary text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  {feature.highlight}
                </span>
              )}
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="font-heading text-xl font-semibold text-primary mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Universal for All Crafts */}
        <div className="mt-16 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-2xl p-8 text-center">
          <h3 className="font-heading text-2xl font-bold text-primary mb-4">
            Universal for ALL Handmade Crafts
          </h3>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            {[
              "Jewelry", "Woodworking", "Candles", "Soap", "Resin Art", 
              "Textiles", "Leather", "Ceramics", "Metalwork", "Painting",
              "Baking", "Sewing", "Knitting", "Crochet", "And More!"
            ].map((craft, index) => (
              <span 
                key={index}
                className="bg-white px-4 py-2 rounded-full text-primary font-medium shadow-sm"
              >
                {craft}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}