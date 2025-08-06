export default function About() {
  return (
    <section className="relative bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Section Header */}
          <div className="mb-16">
            <h2 className="font-system text-3xl lg:text-4xl xl:text-5xl font-light text-gray-900 leading-tight tracking-[-0.01em] mb-6">
              About Adlaan
            </h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent mx-auto mb-8"></div>
            <p className="font-system text-xl lg:text-2xl font-light text-gray-600 leading-relaxed">
              Pioneering the future of legal technology through Arabic-rooted AI intelligence.
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <h3 className="font-system text-2xl lg:text-3xl font-light text-gray-900 mb-4">
                Built on the Principle of ʿAdl
              </h3>
              <p className="font-system text-lg text-gray-600 leading-relaxed mb-6">
                Adlaan represents more than advanced AI technology—it embodies the Arabic concept of{' '}
                <span className="font-medium text-gray-900">ʿadl</span> (justice), ensuring every legal 
                document is not just accurate, but fundamentally fair and balanced.
              </p>
              <p className="font-system text-lg text-gray-600 leading-relaxed">
                Our dual-layer justice system combines cutting-edge artificial intelligence with 
                time-tested principles of legal equity, creating documentation that serves both 
                precision and purpose.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300/50 rounded-2xl p-6 hover:shadow-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300">
                <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-system text-lg font-semibold text-gray-900 mb-2">Justice-First AI</h4>
                <p className="font-system text-sm text-gray-600">
                  Every algorithm designed with fairness and balance at its core.
                </p>
              </div>

              <div className="bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300/50 rounded-2xl p-6 hover:shadow-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300">
                <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-system text-lg font-semibold text-gray-900 mb-2">Agentic Workflows</h4>
                <p className="font-system text-sm text-gray-600">
                  Intelligent automation that adapts to your specific legal needs.
                </p>
              </div>
            </div>
          </div>

          {/* Right Content - Visual Element */}
          <div className="relative">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300/50 rounded-3xl p-8 lg:p-12 hover:shadow-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300">
              {/* Arabic calligraphy or visual representation */}
              <div className="text-center mb-8">
                <div className="inline-block bg-white rounded-2xl p-8 shadow-lg">
                  <div className="text-6xl lg:text-7xl font-light text-gray-900 mb-4">
                    عدل
                  </div>
                  <div className="font-system text-lg text-gray-600">
                    Justice • Fairness • Balance
                  </div>
                </div>
              </div>
              
              {/* Stats or highlights */}
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="font-system text-2xl lg:text-3xl font-light text-gray-900 mb-1">99.7%</div>
                  <div className="font-system text-sm text-gray-600">Accuracy Rate</div>
                </div>
                <div className="text-center">
                  <div className="font-system text-2xl lg:text-3xl font-light text-gray-900 mb-1">50+</div>
                  <div className="font-system text-sm text-gray-600">Legal Frameworks</div>
                </div>
                <div className="text-center">
                  <div className="font-system text-2xl lg:text-3xl font-light text-gray-900 mb-1">24/7</div>
                  <div className="font-system text-sm text-gray-600">AI Assistance</div>
                </div>
                <div className="text-center">
                  <div className="font-system text-2xl lg:text-3xl font-light text-gray-900 mb-1">2</div>
                  <div className="font-system text-sm text-gray-600">Languages</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="inline-flex items-center gap-4">
            <button className="font-system bg-gray-900 text-white px-8 py-4 rounded-full text-base font-medium hover:bg-gray-800 transition-colors duration-200 shadow-lg">
              Learn More About Our Technology
            </button>
            <button className="font-system text-gray-900 px-8 py-4 rounded-full text-base font-medium border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200">
              View Case Studies
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
