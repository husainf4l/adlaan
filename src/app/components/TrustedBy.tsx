export default function TrustedBy() {
  const companies = [
    { name: "Emirates NBD", logo: "emirates-nbd" },
    { name: "Al Rajhi Bank", logo: "al-rajhi" },
    { name: "ADNOC", logo: "adnoc" },
    { name: "SABIC", logo: "sabic" },
    { name: "Dubai Holding", logo: "dubai-holding" },
    { name: "Qatar National Bank", logo: "qnb" },
    { name: "Al Futtaim", logo: "al-futtaim" },
    { name: "Emaar", logo: "emaar" },
    { name: "Mubadala", logo: "mubadala" },
    { name: "Kuwait Finance House", logo: "kfh" },
    { name: "Majid Al Futtaim", logo: "maf" },
    { name: "Almarai", logo: "almarai" }
  ];

  return (
    <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Built for Industry Leaders
          </h2>
          <p className="text-lg text-gray-600">
            Trusted by leading organizations across the Middle East
          </p>
        </div>

        {/* Company Logos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center">
          {companies.map((company, index) => (
            <div
              key={index}
              className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Placeholder logo - in production, these would be actual company logos */}
              <div className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs text-gray-500 font-medium text-center leading-tight">
                  {company.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">500+</div>
            <div className="text-gray-600">Legal Professionals</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">50+</div>
            <div className="text-gray-600">Enterprise Clients</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">1M+</div>
            <div className="text-gray-600">Documents Processed</div>
          </div>
        </div>

        <div className="text-center mt-12">
          <a href="#customers" className="text-black font-medium hover:text-gray-700 transition-colors">
            See All Customers →
          </a>
        </div>
      </div>
    </section>
  );
}
