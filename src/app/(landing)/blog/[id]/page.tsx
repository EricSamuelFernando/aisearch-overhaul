import BlogArticleDetail from '@/components/blog/blog-article-detail';

export default function BlogArticlePage({
  params,
}: {
  params: { id: string };
}) {
  return <BlogArticleDetail articleId={params.id} />;
}


