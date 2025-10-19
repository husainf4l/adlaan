import Image from 'next/image';

export default function Solutions() {
  return (
    <section className="solutions py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="content">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">
              How Lawyers Use Harvey
            </h2>
            <p className="text-gray-600 mb-4">
              Harvey AI transforms legal practice by providing intelligent assistance across all aspects of legal work. From research and drafting to analysis and strategy, our AI-powered tools help lawyers work more efficiently and effectively.
            </p>
            <p className="text-gray-600 mb-4">
              Whether you&apos;re a solo practitioner or part of a large firm, Harvey adapts to your workflow, learning from your preferences and delivering personalized support that enhances your legal expertise.
            </p>
            <p className="text-gray-600">
              Join thousands of legal professionals who have already integrated Harvey into their practice to achieve better outcomes and focus on what matters most – serving their clients.
            </p>
          </div>
          <div className="video">
            <div className="relative">
              <Image
                src="/images/video-placeholder.jpg"
                alt="How Lawyers Use Harvey"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
              <button className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-opacity">
                <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}