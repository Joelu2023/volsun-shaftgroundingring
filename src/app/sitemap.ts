import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/site";
import { products, applications, articles, caseStudies, industrialShaftGroundingSeoPage, bearingFlutingSeoPage } from "@/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  if (!base) {
    return [];
  }
  const indexableApplications = applications.filter((application) => application.isIndexable !== false);

  return [
    { url: `${base}/en` },
    { url: `${base}/zh` },
    { url: `${base}/en/products` },
    { url: `${base}/zh/products` },
    ...products.flatMap((product) => [
      { url: `${base}/en/products/${product.slug}` },
      { url: `${base}/zh/products/${product.slug}` },
    ]),
    { url: `${base}/en/contact` },
    { url: `${base}/zh/contact` },
    { url: `${base}/en/applications` },
    { url: `${base}/zh/applications` },
    { url: `${base}/en/case-studies` },
    { url: `${base}/zh/case-studies` },
    ...caseStudies.flatMap((c) => [
      { url: `${base}/en/case-studies/${c.slug}` },
      { url: `${base}/zh/case-studies/${c.slug}` },
    ]),
    ...indexableApplications.flatMap((application) => [
      { url: `${base}/en/applications/${application.slug}` },
      { url: `${base}/zh/applications/${application.slug}` },
    ]),
    { url: `${base}/en/about-us` },
    { url: `${base}/zh/about-us` },
    { url: `${base}/en/faq` },
    { url: `${base}/zh/faq` },
    { url: `${base}/en/resources` },
    { url: `${base}/zh/resources` },
    { url: `${base}/en${industrialShaftGroundingSeoPage.path}` },
    { url: `${base}/zh${industrialShaftGroundingSeoPage.path}` },
    { url: `${base}/en${bearingFlutingSeoPage.path}` },
    { url: `${base}/zh${bearingFlutingSeoPage.path}` },
    { url: `${base}/en/knowledge-center` },
    { url: `${base}/zh/knowledge-center` },
    ...articles.flatMap((article) => [
      { url: `${base}/en/knowledge-center/${article.slug}` },
      { url: `${base}/zh/knowledge-center/${article.slug}` },
    ]),
    { url: `${base}/en/privacy-policy` },
    { url: `${base}/zh/privacy-policy` },
  ];
}
