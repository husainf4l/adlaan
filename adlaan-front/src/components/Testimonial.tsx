export default function Testimonial() {
  return (
    <section className="testimonial py-16 bg-oxford-blue text-white">
      <div className="container mx-auto px-4 text-center">
        <blockquote className="max-w-4xl mx-auto">
          <p className="text-2xl md:text-3xl font-light mb-6 italic">
            &ldquo;Harvey has revolutionized the way we approach legal research and document review. The AI&apos;s ability to understand complex legal concepts and provide accurate insights has saved us countless hours and improved the quality of our work.&rdquo;
          </p>
          <cite className="text-lg font-semibold">
            Sarah Johnson, Partner at Gibson Dunn
          </cite>
        </blockquote>
      </div>
    </section>
  );
}