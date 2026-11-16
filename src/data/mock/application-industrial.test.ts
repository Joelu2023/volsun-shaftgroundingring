import assert from "node:assert/strict";
import test from "node:test";
import { industrialMotorsApplicationPage } from "@/data/mock/application-industrial";
import { getArticleRecordBySlug, isArticleLocalePublished } from "@/data/mock/articles";
import { getResourcePageRegistryEntry } from "@/data/mock/resource-page-registry";

test("EN industrial page adds related resources with valid targets", () => {
  const page = industrialMotorsApplicationPage;
  assert.equal(page.relatedResources.length, 6);
  assert.equal(page.locales.en.relatedResourcesTitle, "Related Technical Resources");
  assert.equal(page.locales.zh.relatedResourcesTitle, "相关技术文章");
  assert.notDeepEqual(
    page.relatedResourcesZh.map((item) => item.href),
    page.relatedResources.map((item) => item.href),
  );

  const hrefs = page.relatedResources.map((item) => item.href);
  assert.equal(new Set(hrefs).size, hrefs.length);

  for (const item of page.relatedResources) {
    if (item.articleSlug) {
      assert.ok(getArticleRecordBySlug(item.articleSlug), item.articleSlug);
      assert.equal(item.href, `/knowledge-center/${item.articleSlug}`);
    } else {
      const slug = item.href.replace(/^\/resources\//, "");
      assert.ok(getResourcePageRegistryEntry(slug, "en"), item.href);
    }
  }
});

test("EN industrial pump card has exactly one Pump Systems backlink", () => {
  const pump = industrialMotorsApplicationPage.typicalApplications.en.find((card) => card.id === "app-pump");
  assert.ok(pump);
  assert.equal(pump!.ctaHref, "/applications/pump-systems");
  assert.equal(pump!.ctaLabel, "Explore Pump Systems Application");

  const zhPump = industrialMotorsApplicationPage.typicalApplications.zh.find((card) => card.id === "app-pump");
  assert.ok(zhPump);
  assert.equal(zhPump!.ctaHref, undefined);
  assert.equal(zhPump!.ctaLabel, undefined);

  const enCardsWithPumpHref = industrialMotorsApplicationPage.typicalApplications.en.filter(
    (card) => card.ctaHref === "/applications/pump-systems",
  );
  assert.equal(enCardsWithPumpHref.length, 1);
});

test("EN industrial engineering data checklist is advisory only", () => {
  const page = industrialMotorsApplicationPage;
  assert.ok(page.engineeringDataItems.length >= 8);
  assert.match(page.locales.en.engineeringDataLead ?? "", /if available/i);
  assert.ok(page.engineeringDataItems.some((item) => /if available/i.test(item)));
  assert.equal(page.locales.zh.engineeringDataTitle, "咨询前建议准备的信息");
  assert.notDeepEqual(page.engineeringDataItemsZh, page.engineeringDataItems);
});

test("EN industrial how-it-works links stay compact and valid", () => {
  const links = industrialMotorsApplicationPage.howItWorksLinks;
  assert.equal(links.length, 3);
  assert.deepEqual(
    links.map((item) => item.label),
    ["Diagnose", "Measure", "Install"],
  );
  for (const item of links) {
    assert.ok(item.articleSlug);
    assert.ok(getArticleRecordBySlug(item.articleSlug!), item.articleSlug);
  }
});

test("EN industrial fans copy removes HVAC landing wording", () => {
  const fans = industrialMotorsApplicationPage.typicalApplications.en.find((card) => card.id === "app-fans");
  assert.ok(fans);
  assert.doesNotMatch(fans!.body, /\bHVAC\b|\bAHU\b|cooling tower|chiller/i);
  assert.match(fans!.body, /industrial process fans and blowers/i);

  const zhFans = industrialMotorsApplicationPage.typicalApplications.zh.find((card) => card.id === "app-fans");
  assert.ok(zhFans);
  assert.match(zhFans!.body, /暖通/);
});

test("ZH industrial page keeps frozen SEO and adds reviewed Chinese copy only", () => {
  const page = industrialMotorsApplicationPage;
  const zh = page.locales.zh;
  const en = page.locales.en;

  assert.equal(zh.seoTitle, "工业电机轴接地环 | 变频轴承电流防护");
  assert.equal(
    zh.seoDescription,
    "保护逆变驱动工业电机，降低轴电流相关轴承损伤风险，并按结构与适配条件评审接地方案。",
  );
  assert.equal(zh.heroTitle, "用于变频轴承防护的工业电机轴接地环方案");
  assert.equal(en.seoTitle, "Industrial Motor Shaft Grounding Rings | VFD Bearing Current Protection");
  assert.equal(en.heroTitle, "Industrial Motor Shaft Grounding Rings for VFD Bearing Protection");
  assert.equal(page.productSelection.en[0]?.title, "Arc-shaped ST/STW review");
  assert.equal(page.ctas.en[0]?.label, "Select Product by Shaft Size");
  assert.equal(page.ctas.en[0]?.href, "/products");
  assert.equal(page.ctas.en[1]?.href, "/contact?cta_key=engineer&application_interest=industrial-motors");

  assert.deepEqual(
    page.ctas.zh.map((item) => ({ id: item.id, label: item.label, href: item.href })),
    [
      { id: "cta-size", label: "查看产品系列", href: "/products" },
      {
        id: "cta-engineer",
        label: "联系沃尔兴",
        href: "/contact?cta_key=engineer&application_interest=industrial-motors",
      },
      {
        id: "cta-quote",
        label: "申请报价",
        href: "/contact?cta_key=quote&application_interest=industrial-motors",
      },
    ],
  );
  assert.deepEqual(
    page.productSelection.zh.map((item) => item.productSlug),
    ["split-shaft-grounding-ring", "solid-shaft-grounding-ring", "custom-shaft-grounding-ring"],
  );
  assert.deepEqual(page.engineeringDataItemsZh, [
    "电机类型",
    "电机功率",
    "电机转速",
    "适配轴径",
    "安装空间",
    "使用环境",
    "环境条件",
    "安装约束",
    "现有轴承故障现象",
    "电机照片或图纸（如有）",
  ]);

  const zhText = JSON.stringify({
    locale: zh,
    values: page.values.zh,
    typical: page.typicalApplications.zh,
    how: page.howItWorks.zh,
    oem: page.oemRetrofitPoints.zh,
    selection: page.productSelection.zh,
    comparison: page.comparisonRows.zh,
    faq: page.faq.zh,
    ctas: page.ctas.zh,
    resources: page.relatedResourcesZh,
    checklist: page.engineeringDataItemsZh,
  });
  for (const phrase of [
    "可验证结果",
    "电蚀事件下降",
    "按轴径选型",
    "申请工程支持",
    "减少非计划停机",
    "降低全生命周期成本",
    "使用寿命延长",
    "停机时间减少",
    "成本降低",
    "整环",
    "弧形",
    "实心",
    "分体式",
    "整体式",
    "/en/",
  ]) {
    assert.equal(zhText.includes(phrase), false, phrase);
  }
  assert.match(zhText, /受控的旁路泄放路径/);
  assert.match(zhText, /不能解决所有轴承故障/);
  assert.match(zhText, /具体型号结构差异、适用条件及安装方式需要根据产品资料和工程评审确认/);
  assert.match(zhText, /待研发复核/);

  for (const item of page.relatedResourcesZh) {
    assert.ok(item.articleSlug);
    const record = getArticleRecordBySlug(item.articleSlug!);
    assert.ok(record, item.articleSlug);
    assert.equal(isArticleLocalePublished(record!, "zh"), true, item.articleSlug);
    assert.equal(item.href, `/knowledge-center/${item.articleSlug}`);
  }
});
