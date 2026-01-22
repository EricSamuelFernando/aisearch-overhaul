import Image from 'next/image';
import Link from 'next/link';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  authorImage: string;
  date: string;
}

const relatedArticles: Article[] = [
  {
    id: '1',
    title: 'The Human Side of Real Estate: Why Agents Still Matter',
    excerpt: 'Agents provide a personal touch in an era dominated by digital tools',
    image: '/assets/images/leftside-blog-img.png',
    author: 'Alex Whitten',
    authorImage: '/assets/images/company-hero.jpg',
    date: '17 Jun 2022',
  },
  {
    id: '2',
    title: 'What No One Tells You About Your First Home Purchase',
    excerpt: 'Here are some hidden costs and considerations for first-time homebuyers',
    image: '/assets/images/rightside-blog-img.jpg',
    author: 'Alex Whitten',
    authorImage: '/assets/images/leftside-blog-img.png',
    date: '17 Jun 2022',
  },
  {
    id: '3',
    title: 'Selling in a Slow Market? Here\'s What Actually Works',
    excerpt: 'Tips for pricing to better results, and how to stay ahead when the market cools',
    image: '/assets/images/Inside-BlogIMg.png',
    author: 'Alex Whitten',
    authorImage: '/assets/images/rightside-blog-img.jpg',
    date: '17 Jun 2022',
  },
];

export default function BlogRelatedArticles({ currentArticleId }: { currentArticleId: string }) {
  // Filter out current article
  const articles = relatedArticles.filter(article => article.id !== currentArticleId).slice(0, 3);

  return (
    <section className="py-16 px-4 md:px-10 bg-[#FAF9F5]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-[#1B1B1B] mb-10">
          Related Blogs You Might Like
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/blog/${article.id}`}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#1B1B1B] mb-3 group-hover:text-orange-500 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                    <Image
                      src={article.authorImage}
                      alt={article.author}
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-xs">{article.author}</p>
                    <p className="text-xs text-gray-500">{article.date}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}


