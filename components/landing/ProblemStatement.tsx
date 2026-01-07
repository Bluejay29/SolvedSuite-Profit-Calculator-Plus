export default function ProblemStatement() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-primary mb-6">
          Are You Accidentally Working for Free?
        </h2>
        <p className="text-xl text-gray-700 leading-relaxed">
          Most handmade sellers lose money because they forget to account for labor, 
          overhead, and marketplace fees. You pour your heart into your craft, but are 
          you actually making a profit?
        </p>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Problem 1 */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <div className="text-4xl mb-4">😰</div>
            <h3 className="font-heading text-xl font-semibold text-primary mb-2">
              Underpricing
            </h3>
            <p className="text-gray-600">
              Forgetting to include labor costs means you're working for pennies per hour
            </p>
          </div>
          
          {/* Problem 2 */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <div className="text-4xl mb-4">💸</div>
            <h3 className="font-heading text-xl font-semibold text-primary mb-2">
              Hidden Fees
            </h3>
            <p className="text-gray-600">
              Marketplace fees eat into your profit, but you don't realize it until it's too late
            </p>
          </div>
          
          {/* Problem 3 */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="font-heading text-xl font-semibold text-primary mb-2">
              Material Waste
            </h3>
            <p className="text-gray-600">
              Over-ordering materials wastes money. Under-ordering delays projects.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}