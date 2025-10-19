export default function Features() {
  return (
    <section className="features py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16 text-white bg-gradient-to-r from-purple to-cyan bg-clip-text text-transparent">
          Why Choose Adlaan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="feature text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:shadow-2xl hover:shadow-purple/20 transition-all duration-300 group">
            <div className="icon mb-6">
              <svg className="w-16 h-16 mx-auto text-cyan group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-white">Advanced AI Technology</h3>
            <p className="text-platinum leading-relaxed">
              Cutting-edge AI models trained on vast legal datasets for accurate and reliable assistance.
            </p>
          </div>
          <div className="feature text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:shadow-2xl hover:shadow-purple/20 transition-all duration-300 group">
            <div className="icon mb-6">
              <svg className="w-16 h-16 mx-auto text-cyan group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-white">Secure & Compliant</h3>
            <p className="text-platinum leading-relaxed">
              Enterprise-grade security with full compliance to legal standards and data protection regulations.
            </p>
          </div>
          <div className="feature text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:shadow-2xl hover:shadow-purple/20 transition-all duration-300 group">
            <div className="icon mb-6">
              <svg className="w-16 h-16 mx-auto text-cyan group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-white">Team Collaboration</h3>
            <p className="text-platinum leading-relaxed">
              Seamless collaboration tools that integrate with your existing legal workflows and team structures.
            </p>
          </div>
          <div className="feature text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:shadow-2xl hover:shadow-purple/20 transition-all duration-300 group">
            <div className="icon mb-6">
              <svg className="w-16 h-16 mx-auto text-cyan group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-white">Proven Results</h3>
            <p className="text-platinum leading-relaxed">
              Trusted by top law firms worldwide, delivering measurable improvements in efficiency and outcomes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}