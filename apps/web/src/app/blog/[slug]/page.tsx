import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { t } from "@rovotools/localization";
import { WEB_URL } from "@rovotools/config";
import { BLOG_POSTS, getBlogPost } from "@/lib/blog";
import { Badge } from "@/components/ui/badge";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdSlot from "@/components/ads/AdSlot";
import ToolCard from "@/components/tools/ToolCard";
import { getAdSlotId } from "@/lib/ads";
import { getToolRegistry } from "@/lib/registry";

export function generateStaticParams(): Array<{ slug: string }> {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (post === undefined) {
    return { title: t("en", "errors.notFound") };
  }
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `${WEB_URL}/blog/${post.slug}`,
      publishedTime: post.date,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }): Promise<React.ReactElement> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (post === undefined) {
    notFound();
  }
  const registry = getToolRegistry();
  const relatedTools = post.relatedTools
    .map((toolId) => registry.get(toolId))
    .filter((entry): entry is NonNullable<typeof entry> => entry !== undefined);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { "@type": "Organization", name: "RovoCorp LTD", url: WEB_URL },
    mainEntityOfPage: `${WEB_URL}/blog/${post.slug}`,
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs
        crumbs={[
          { label: t("en", "navigation.home"), href: "/" },
          { label: t("en", "navigation.blog"), href: "/blog" },
          { label: post.title },
        ]}
      />
      <Link
        href="/blog"
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t("en", "blog.allPosts")}
      </Link>
      <div className="mt-4">
        <Badge variant="secondary">{post.category}</Badge>
      </div>
      <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{post.title}</h1>
      <p className="mt-2 text-sm text-zinc-500">{post.date}</p>
      <div className="mt-6 space-y-4 text-zinc-700 dark:text-zinc-300">
        {post.body.map((paragraph, index) => (
          <p key={index} className="leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
      {relatedTools.length > 0 ? (
        <section aria-labelledby="related-heading" className="mt-10">
          <h2 id="related-heading" className="text-xl font-bold sm:text-2xl">
            {t("en", "tool.relatedTools")}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {relatedTools.map((entry) => (
              <ToolCard key={entry.definition.id} entry={entry} />
            ))}
          </div>
        </section>
      ) : null}
      <AdSlot placement="blog-footer" slotId={getAdSlotId("blog-footer")} />
    </article>
  );
}
