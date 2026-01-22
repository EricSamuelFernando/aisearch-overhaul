import BlogHero from '@/components/blog/blog-hero';
import BlogFeatured from '@/components/blog/blog-featured';
import BlogLatestArticles from '@/components/blog/blog-latest-articles';
import BlogCTA from '@/components/blog/blog-cta';

const BlogPage = () => {
  return (
    <main className="bg-[#FFF6EC]">
      <BlogHero />
      {/* <BlogFeatured /> */}
      <BlogLatestArticles />
      {/* <BlogCTA /> */}
    </main>
  );
};

export default BlogPage;


