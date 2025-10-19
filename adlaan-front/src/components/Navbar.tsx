import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-white text-2xl font-bold bg-gradient-to-r from-purple to-cyan bg-clip-text text-transparent">
          Adlaan
        </Link>
        <div className="space-x-8">
          <Link href="/" className="text-white/80 hover:text-white transition-colors duration-300 font-medium">
            Home
          </Link>
          <Link href="/about" className="text-white/80 hover:text-white transition-colors duration-300 font-medium">
            About
          </Link>
          <Link href="/contact" className="text-white/80 hover:text-white transition-colors duration-300 font-medium">
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
}