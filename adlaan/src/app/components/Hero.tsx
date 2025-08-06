export default function Hero() {
  return (
    <section className="bg-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-gray-50 rounded-full text-sm font-medium text-gray-700 mb-8">
            <span className="text-green-500 mr-2">●</span>
            Professional Class AI
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Domain-specific AI for
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">
              Middle East professionals
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Enterprise-grade AI solutions tailored for legal firms, financial institutions, 
            and professional service providers across the Middle East region.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors text-lg">
              Request a Demo
            </button>
            <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors text-lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Watch Video
            </button>
          </div>

          {/* Hero Visual - Placeholder for now */}
          <div className="relative">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 shadow-lg">
              <div className="bg-white rounded-xl shadow-md p-6 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-left">
                  <div className="text-sm text-gray-500 mb-2">Contract Analysis - Arabic/English</div>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="text-gray-800 font-medium mb-2">Analyzing commercial agreement...</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="font-medium text-blue-900">Risk Assessment</div>
                  <div className="text-blue-700">Low Risk Detected</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="font-medium text-green-900">Compliance Check</div>
                  <div className="text-green-700">DIFC Compliant</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="font-medium text-purple-900">Language Support</div>
                  <div className="text-purple-700">AR/EN Bilingual</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
