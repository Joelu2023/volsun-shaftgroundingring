import assert from "node:assert/strict";
import test from "node:test";
import { electricVehiclesApplicationPage } from "@/data/mock/application-ev";
import { getApplicationBySlug } from "@/data/mock/applications";
import { PHASE1A_APPLICATION_PATHS } from "@/lib/seo/zh-index-policy";

const page = electricVehiclesApplicationPage;
const en = page.locales.en;
const zh = page.locales.zh;

const FORBIDDEN = [
  "300,000",
  "300000",
  "30 万",
  "30万",
  "0.2",
  "10 Ω",
  "10Ω",
  "≤10",
  "0.1",
  "800",
  "20%",
  "MCF",
  "48K",
  "48k",
];

function visibleZhText(): string {
  const chunks = [
    zh.heroKicker,
    zh.heroTitle,
    zh.heroSubtitle,
    zh.validationFootnote,
    zh.whyFailTitle,
    zh.whyFailBody,
    ...zh.whyFailBullets,
    zh.provenTitle,
    zh.provenBody,
    ...page.proofCards.zh.flatMap((card) => [card.title, card.body]),
    zh.protectTitle,
    zh.protectBody,
    ...page.efficiencyBenefits.zh.flatMap((item) => [item.title, item.body]),
    zh.durabilityTitle,
    zh.durabilityBody,
    ...page.durabilityMetrics.zh.flatMap((item) => [item.label, item.value, item.note]),
    zh.trustedTitle,
    zh.trustedBody,
    zh.scaleTitle,
    zh.scaleBody,
    ...page.scalableProductionPoints.zh,
    zh.recommendedTitle,
    ...page.recommendedSolutions.zh.flatMap((item) => [item.title, item.summary, item.imageAlt]),
    zh.viewProductLabel,
    zh.midCtaTitle,
    zh.faqTitle,
    ...page.faq.zh.flatMap((item) => [item.question, item.answer]),
    zh.ctaTitle,
    zh.ctaBody,
    zh.heroNeutralLabel,
    ...page.ctas.zh.flatMap((item) => [item.label, item.href]),
  ];
  return chunks.join("\n");
}

test("EV English page keeps the baseline copy and structure", () => {
  assert.equal(en.seoTitle, "Electric Vehicle Motor Shaft Grounding | Oil-Cooled EV Applications");
  assert.equal(
    en.seoDescription,
    "EV-focused shaft grounding page for oil-cooled motors, application fit review, FAQ, and custom sample CTA.",
  );
  assert.equal(en.heroTitle, "Shaft Grounding Rings for Oil-Cooled EV Motors");
  assert.equal(
    en.heroSubtitle,
    "Suitable for oil-cooled EV motors and compatible with common transmission oil environments. The fiber structure maintains stable shaft contact under high-speed operation.",
  );
  assert.equal(en.provenTitle, "Stable contact in oil-cooled applications");
  assert.equal(en.recommendedTitle, "Recommended EV solutions");
  assert.equal(en.scaleTitle, "Production handoff support");
  assert.equal(en.faqTitle, "FAQ");
  assert.deepEqual(
    page.proofCards.en.map((card) => card.title),
    ["Oil-cooled EV motor suitability", "Stable shaft contact", "Application fit review"],
  );
  assert.equal(page.efficiencyBenefits.en.length, 3);
  assert.equal(page.durabilityMetrics.en.length, 3);
  assert.deepEqual(page.scalableProductionPoints.en, [
    "Application review from sample fit to production handoff.",
    "Process control and documentation alignment based on confirmed project scope.",
    "Custom shaft-size adaptation when standard structures do not fit.",
  ]);
  assert.deepEqual(
    page.recommendedSolutions.en.map((item) => item.title),
    ["VS-RD/RDW Solid Ring Review", "Custom EV Shaft Grounding Package"],
  );
  assert.equal(
    page.recommendedSolutions.en[1]?.summary,
    "For unique e-axle envelope constraints, shaft geometries, and contact position requirements.",
  );
  assert.equal(page.heroImagePath.en, "/images/applications/application-shaft-grounding-ev-oil-cooled-motor-v1.webp");
  assert.equal(page.ctas.en[0]?.href, "/contact?cta_key=sample&application_interest=electric-vehicles");
  assert.equal(page.ctas.en[1]?.href, "/contact?cta_key=engineer&application_interest=electric-vehicles");
});

test("EV Chinese page is separated from English modules and keeps frozen SEO", () => {
  assert.equal(zh.seoTitle, "电动车电机轴接地 | 油冷 EV 应用");
  assert.equal(zh.seoDescription, "面向油冷 EV 电机的轴接地应用页，说明适配评审、FAQ 与样品询盘入口。");
  assert.equal(zh.heroTitle, "面向油冷 EV 电机的轴接地环");
  assert.equal(zh.recommendedTitle, "相关产品资料");
  assert.equal(zh.scaleTitle, "项目评估条件");
  assert.equal(zh.faqTitle, "常见问题");
  assert.equal(page.heroImagePath.zh, null);
  assert.equal(page.efficiencyBenefits.zh.length, 0);
  assert.equal(page.durabilityMetrics.zh.length, 0);
  assert.deepEqual(
    page.recommendedSolutions.zh.map((item) => item.productSlug),
    ["solid-shaft-grounding-ring", "custom-shaft-grounding-ring"],
  );
  assert.equal(
    page.recommendedSolutions.zh.some((item) => item.productSlug.includes("split")),
    false,
  );
  assert.equal(page.ctas.zh[0]?.label, "申请定制样品");
  assert.equal(page.ctas.zh[1]?.label, "联系 EV 电机工程师");
  assert.equal(page.ctas.zh[0]?.href, "/contact?cta_key=sample&application_interest=electric-vehicles");
  assert.equal(page.ctas.zh[1]?.href, "/contact?cta_key=engineer&application_interest=electric-vehicles");
  assert.equal(page.scalableProductionPoints.zh.length, 9);

  const text = visibleZhText();
  for (const token of FORBIDDEN) {
    assert.equal(text.includes(token), false, token);
  }
  assert.equal(text.includes("Oil-cooled"), false);
  assert.equal(text.includes("Stable shaft"), false);
  assert.equal(text.includes("Recommended EV"), false);
  assert.equal(text.includes("ST/STW"), false);
  assert.equal(text.includes("split-shaft"), false);
  assert.match(text, /油液牌号、温度范围、流动或浸没条件、轴几何、接触位置及安装空间进行评估/);
  assert.match(text, /不按轴径自动选用型号|不按轴径自动推荐型号/);
  assert.match(text, /标准化量产导入服务/);
});

test("EV listing recommendation and Chinese index allowlist stay on the baseline", () => {
  assert.deepEqual(getApplicationBySlug("electric-vehicles")?.recommendedProducts, [
    "split-shaft-grounding-ring",
    "custom-shaft-grounding-ring",
  ]);
  assert.ok(PHASE1A_APPLICATION_PATHS.includes("/applications/electric-vehicles"));
});
