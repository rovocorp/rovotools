import type { Metadata } from "next";
import Link from "next/link";
import { t } from "@rovotools/localization";
import { WEB_URL } from "@rovotools/config";
import { BLOG_POSTS } from "@/lib/blog";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: t("en", "seo.blogTitle"),
  description: t("en", "seo.blogDescription"),
  alternates: { canonical: "/blog" },
  openGraph: {
    title: t("en", "seo.blogTitle"),
    description: t("en", "seo.blogDescription"),
    type: "website",
    url: `${WEB_URL}/blog`,
  },
};

export default function BlogPage(): React.ReactElement {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: t("en", "navigation.blog") }]} />
      <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{t("en", "navigation.blog")}</h1>
      <p className="mt-2 text-zinc-500">Guides that explain what our tools compute — and why.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {BLOG_POSTS.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <Badge variant="secondary" className="w-fit">
                  {post.category}
                </Badge>
                <CardTitle className="mt-2">{post.title}</CardTitle>
                <CardDescription>
                  {post.date} · {post.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  {t("en", "blog.readGuide")}
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
