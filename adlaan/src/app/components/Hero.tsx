export default function Hero() {
  return (
    <section className="relative min-h-[80vh] bg-black overflow-hidden">
      {/* Apple-style subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/30 to-black"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_black_70%)]"></div>
      
      <div className="relative z-10 flex flex-col justify-center items-center min-h-[80vh] px-6 lg:px-8">
        <div className="mx-auto max-w-6xl text-center">
          {/* Apple-style headline with refined typography */}
          <div className="mb-8">
            <div className="relative mb-6">
              <h1 className="font-system text-4xl lg:text-5xl xl:text-6xl font-light text-white/95 leading-[0.9] tracking-[-0.01em]">
                <span className="relative">
                  Every
                  {/* Subtle professional accent - smaller and more refined */}
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full"></div>
                </span>{' '}
                Agreement.
              </h1>
            </div>
            
            <p className="font-system text-2xl lg:text-3xl xl:text-4xl font-light text-white/85 italic leading-tight tracking-[-0.01em]">
              Legally Sound. Intelligently Reviewed.
            </p>
          </div>

          {/* Apple-style descriptive text */}
          <div className="mb-12">
            <p className="font-system text-lg lg:text-xl font-normal text-gray-300 leading-relaxed max-w-3xl mx-auto">
              From sales contracts to HR policies, Adlaan automates documentation with{' '}
              Arabic-rooted legal AI — refined for business, grounded in justice.
            </p>
          </div>

          {/* Apple-style CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="font-system w-full sm:w-auto bg-white text-black px-8 py-4 rounded-full text-base font-medium hover:bg-gray-100 transition-colors duration-200 shadow-lg">
              Request a Demo
            </button>
            <button className="font-system w-full sm:w-auto text-white px-8 py-4 rounded-full text-base font-medium border border-white/20 hover:border-white/40 hover:bg-white/10 transition-all duration-200 backdrop-blur-xl">
              Explore Workflows
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
