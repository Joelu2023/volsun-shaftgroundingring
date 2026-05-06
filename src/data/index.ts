export { siteConfig, homeHeroCtas, navigationZh, navigationEn, enHeaderLogoSrc, publicContact, whatsappConfig } from "./mock/site";
export { products, getProductBySlug, getProductForLocale } from "./mock/products";
export type { ProductDetail, ProductFeature, ProductSpecField } from "./mock/products";
export { applications, getApplicationBySlug, getApplicationForLocale } from "./mock/applications";
export type { ApplicationDetail } from "./mock/applications";
export { electricVehiclesApplicationPage, getElectricVehiclesContent } from "./mock/application-ev";
export type { EvApplicationPageData } from "./mock/application-ev";
export { industrialMotorsApplicationPage, getIndustrialMotorsContent } from "./mock/application-industrial";
export type { IndustrialApplicationPageData } from "./mock/application-industrial";
export { caseStudies, getCaseStudyBySlug } from "./mock/case-studies";
export type { CaseStudy } from "./mock/case-studies";
export { articles, getArticleBySlug, getArticleForLocale, getArticleRecordBySlug } from "./mock/articles";
export type { ArticleDetail, ArticleRecord, ArticleResolved } from "./mock/articles";
export { faqItems, getFaqItems } from "./mock/faq";
export {
  resources,
  resourceContactHref,
  getResourceForLocale,
  EN_CATALOG_DOWNLOAD_SLUG,
  EN_INSTALLATION_GUIDE_DOWNLOAD_SLUG,
} from "./mock/resources";
export type { ResourceItem } from "./mock/resources";
export { homeContent, getHomeContent, HOME_EN_APPLICATION_SLOTS } from "./mock/home";
export type { HomeEnApplicationSlot } from "./mock/home";
export { inquiryTypeOptions, getInquiryTypeOptions } from "./mock/inquiry-types";
export { PAGE_SOURCE_HOME, PAGE_SOURCE_ABOUT, CTA_SOURCE_CONVERSION_FORM } from "./mock/tracking";
export {
  ABOUT_EN_FACTORY_FACADE_SRC,
  ABOUT_EN_CERTIFICATE_SLIDES,
  ABOUT_EN_FACTORY_CAROUSEL_SLIDES,
  ABOUT_EN_VOLSUN_PARAGRAPHS,
} from "./mock/about-en";
export {
  industrialShaftGroundingSeoPage,
  getIndustrialShaftGroundingSeoContent,
} from "./mock/resource-industrial-shaft-grounding-seo";
export type { IndustrialShaftGroundingSeoPageData } from "./mock/resource-industrial-shaft-grounding-seo";
export {
  bearingFlutingSeoPage,
  getBearingFlutingSeoContent,
  SHAFT_GROUNDING_SEO_RESOURCE_PATH,
  BEARING_FLUTING_SEO_RESOURCE_PATH,
} from "./mock/resource-bearing-fluting-seo";
export type { BearingFlutingSeoPageData } from "./mock/resource-bearing-fluting-seo";
export { staticPageMeta, getPageMeta } from "./mock/page-meta";
export type { StaticPageMetaKey } from "./mock/page-meta";
export { aboutContent, getAboutContent } from "./mock/about";
