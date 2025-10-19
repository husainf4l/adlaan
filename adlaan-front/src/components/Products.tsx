import Link from 'next/link';

export default function Products() {
  return (
    <section className="products py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Our Products
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="product bg-white p-6 rounded-lg shadow-md text-center">
            <div className="icon mb-4">
              <svg className="w-12 h-12 mx-auto text-orange-web" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Harvey Assistant</h3>
            <p className="text-gray-600 mb-4">
              AI-powered legal assistant that helps with research, drafting, and analysis.
            </p>
            <Link href="#" className="text-blue-600 hover:text-blue-800 font-medium">
              Learn more →
            </Link>
          </div>
          <div className="product bg-white p-6 rounded-lg shadow-md text-center">
            <div className="icon mb-4">
              <svg className="w-12 h-12 mx-auto text-orange-web" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Harvey Knowledge</h3>
            <p className="text-gray-600 mb-4">
              Comprehensive knowledge base for legal precedents and case law.
            </p>
            <Link href="#" className="text-blue-600 hover:text-blue-800 font-medium">
              Learn more →
            </Link>
          </div>
          <div className="product bg-white p-6 rounded-lg shadow-md text-center">
            <div className="icon mb-4">
              <svg className="w-12 h-12 mx-auto text-orange-web" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Harvey Vault</h3>
            <p className="text-gray-600 mb-4">
              Secure document storage and management for legal teams.
            </p>
            <Link href="#" className="text-blue-600 hover:text-blue-800 font-medium">
              Learn more →
            </Link>
          </div>
          <div className="product bg-white p-6 rounded-lg shadow-md text-center">
            <div className="icon mb-4">
              <svg className="w-12 h-12 mx-auto text-orange-web" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Harvey Workflows</h3>
            <p className="text-gray-600 mb-4">
              Automated workflows to streamline legal processes.
            </p>
            <Link href="#" className="text-blue-600 hover:text-blue-800 font-medium">
              Learn more →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}