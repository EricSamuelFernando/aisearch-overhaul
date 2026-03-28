'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import BlogLatestArticles from './blog-latest-articles';
import { getArticleById } from '@/data/blogs';

export default function BlogArticleDetail({ articleId }: { articleId: string }) {
  const article = getArticleById(articleId);
  const [activeId, setActiveId] = React.useState<string>('');
  const clickLock = React.useRef(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Inject clickable # anchors into each heading
  React.useEffect(() => {
    if (!contentRef.current) return;
    const headings = contentRef.current.querySelectorAll('h2[id], h3[id]');
    headings.forEach((heading) => {
      if (heading.querySelector('.heading-anchor')) return;
      const anchor = document.createElement('a');
      anchor.className = 'heading-anchor';
      anchor.href = `#${heading.id}`;
      anchor.textContent = ' #';
      anchor.style.cssText =
        'color:#F07639;font-size:0.75em;margin-left:8px;opacity:0.5;text-decoration:none;font-weight:400;vertical-align:middle;';
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        (heading as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', `#${heading.id}`);
      });
      heading.appendChild(anchor);
    });
  }, [article]);

  // Scroll-spy: highlights the last TOC entry whose heading has passed the top threshold
  React.useEffect(() => {
    if (!article?.tableOfContents?.length) return;

    const tocIds = article.tableOfContents
      .map((item) => item.href.replace('#', ''))
      .filter(Boolean);

    const OFFSET = 220; // nav (~96px) + visible heading zone

    const updateActive = () => {
      if (clickLock.current) return;

      let current = '';
      for (const id of tocIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        // No break — iterate ALL headings so we always find the LAST one
        // above the threshold (deepest heading the user has scrolled past)
        if (el.getBoundingClientRect().top <= OFFSET) {
          current = id;
        }
      }
      setActiveId(current);
    };

    updateActive();

    const onScroll = () => requestAnimationFrame(updateActive);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateActive);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateActive);
    };
  }, [article]);

  const handleTocClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (!el) return;

    clickLock.current = true;
    setActiveId(id);
    el.style.scrollMarginTop = '140px';
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Release lock immediately when user manually scrolls
    const releaseLock = () => {
      clickLock.current = false;
      window.removeEventListener('wheel', releaseLock);
      window.removeEventListener('touchmove', releaseLock);
    };
    window.addEventListener('wheel', releaseLock, { passive: true, once: true });
    window.addEventListener('touchmove', releaseLock, { passive: true, once: true });

    // Fallback: release after smooth scroll finishes
    setTimeout(() => {
      clickLock.current = false;
      window.removeEventListener('wheel', releaseLock);
      window.removeEventListener('touchmove', releaseLock);
    }, 1000);
  };

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <Link href="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full bg-[#FFF6EC]">
        <div className="w-full py-10">
          <div className="max-w-7xl mx-auto px-4 md:px-6">

            {/* FEATURE GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-12">

              {/* IMAGE — FIRST ON MOBILE */}
              <div
                className="
                  order-1 lg:order-2
                  w-full
                  lg:max-w-xl
                  mx-auto lg:mx-0
                  lg:pl-10
                "
              >
                <div
                  className="
                    relative
                    w-full
                    h-[240px]
                    sm:h-[300px]
                    md:h-[360px]
                    lg:h-[560px]
                    xl:h-[620px]
                    rounded-2xl
                    overflow-hidden
                  "
                >
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="100vw"
                  />
                </div>
              </div>

              {/* TEXT — SECOND ON MOBILE */}
              <div
                className="
                  order-2 lg:order-1
                  w-full
                  lg:max-w-xl
                  mx-auto lg:mx-0
                  flex flex-col justify-center
                  text-start
                "
              >
                <h1 className="satoshi mt-3 text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#1B1B1B] leading-tight">
                  {article.title}
                </h1>

                <p className="mt-4 text-base text-[#545454] leading-relaxed">
                  {article.excerpt}
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="w-full bg-[#FFF6EC] py-14">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* LEFT SIDEBAR */}
            <aside className="lg:col-span-3 hidden lg:block">
              <div className="sticky top-24 w-[280px] space-y-5">

                {/* Table of contents */}
                {article.tableOfContents && article.tableOfContents.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-[#F07639] mb-4">
                      Table of contents
                    </p>
                    <ul className="space-y-3 text-sm">
                      {article.tableOfContents.map((item) => {
                        const isActive = activeId === item.href.replace('#', '');
                        return (
                          <li key={item.href}>
                            <a
                              href={item.href}
                              onClick={(e) => handleTocClick(e, item.href)}
                              className={`transition-colors cursor-pointer ${
                                isActive
                                  ? 'text-[#F07639] font-semibold'
                                  : 'text-[#1B1B1B] hover:opacity-70'
                              }`}
                            >
                              {item.label}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Divider */}
                <div className="w-[280px] h-px bg-[#EAECF0]" />

                {/* Contributors */}
                <div>
                  <p className="text-sm font-semibold text-[#F07639] mb-4">
                    Contributors
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={article.authorImage}
                        alt={article.author}
                        width={48}
                        height={48}
                        className="rounded-full object-cover object-top w-full h-full"
                      />
                    </div>
                    <p className="text-sm font-medium text-[#1B1B1B]">
                      {article.author}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="w-[280px] h-px bg-[#EAECF0]" />

                {/* Subscribe */}
                <div>
                  <p className="text-sm font-semibold text-[#F07639] mb-3">
                    Subscribe to our newsletter
                  </p>

                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full mb-3 px-4 py-2.5 text-sm text-[#565453] bg-transparent border border-[#170800] rounded-md focus:outline-none focus:ring-2 focus:ring-[#C26100]"
                  />

                  <Button className="w-full rounded-full bg-[#1B1B1B] text-white">
                    Subscribe
                  </Button>
                </div>

              </div>
            </aside>

            {/* MAIN CONTENT */}
            <div className="lg:col-span-9">
              <div
                ref={contentRef}
                className="
                  [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-[#1B1B1B] [&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:scroll-mt-36
                  [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-[#170800] [&_h3]:mb-3 [&_h3]:mt-6 [&_h3]:scroll-mt-36
                  [&_span]:scroll-mt-36
                  [&_p]:text-base [&_p]:text-[#565453] [&_p]:leading-relaxed [&_p]:mb-4
                  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-1
                  [&_li]:text-base [&_li]:text-[#565453] [&_li]:leading-relaxed
                  [&_blockquote]:border-l-4 [&_blockquote]:border-[#F07639] [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-[#545454] [&_blockquote]:my-6 [&_blockquote]:py-1
                  [&_a]:text-[#F07639] [&_a]:underline [&_a:hover]:opacity-75
                  [&_strong]:font-semibold [&_strong]:text-[#1B1B1B]
                  [&_img]:rounded-2xl [&_img]:w-full [&_img]:my-6
                "
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>
          </div>
        </div>
      </article>

      <BlogLatestArticles variant="detailed" />
    </main>
  );
}
