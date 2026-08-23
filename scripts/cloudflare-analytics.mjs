#!/usr/bin/env node

const GRAPHQL_ENDPOINT = "https://api.cloudflare.com/client/v4/graphql";
const DEFAULT_HOURS = 24;

function readArgs(argv) {
  const options = { hours: DEFAULT_HOURS, format: "text" };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--hours") {
      options.hours = Number(argv[index + 1]);
      index += 1;
    } else if (argument === "--days") {
      options.hours = Number(argv[index + 1]) * 24;
      index += 1;
    } else if (argument === "--markdown") {
      options.format = "markdown";
    } else if (argument === "--json") {
      options.format = "json";
    } else if (argument === "--help" || argument === "-h") {
      options.help = true;
    } else {
      throw new Error(`未知参数：${argument}`);
    }
  }

  if (!Number.isFinite(options.hours) || options.hours <= 0 || options.hours > 24 * 90) {
    throw new Error("--hours 必须是 1 到 2160 之间的数字");
  }

  return options;
}

function requireEnvironment(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`缺少环境变量 ${name}`);
  }
  return value;
}

function toCloudflareTimestamp(date) {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

function formatGroups(groups, directFallback = false) {
  return groups.slice(0, 10).map((group) => ({
    name: group.dimensions?.metric?.trim() || (directFallback ? "直接访问" : "（未知）"),
    value: Math.round(Number(group.count ?? 0) * Number(group.avg?.sampleInterval ?? 1)),
  }));
}

function summarize(data, since, until) {
  const total = data.total?.[0] ?? {};
  const pageViews = Number(total.count ?? 0);
  const visits = Number(total.sum?.visits ?? 0);

  return {
    generatedAt: new Date().toISOString(),
    range: { since, until },
    pageViews,
    visits,
    pagesPerVisit: visits > 0 ? Number((pageViews / visits).toFixed(2)) : 0,
    topPaths: formatGroups(data.topPaths ?? []),
    topReferrers: formatGroups(data.topReferers ?? [], true),
    topCountries: formatGroups(data.countries ?? []),
    devices: formatGroups(data.topDeviceTypes ?? []),
  };
}

function table(title, rows) {
  const body = rows.length
    ? rows.map((row) => `| ${row.name.replaceAll("|", "\\|")} | ${row.value} |`).join("\n")
    : "| 暂无数据 | 0 |";
  return `### ${title}\n\n| 项目 | 页面浏览量 |\n| --- | ---: |\n${body}`;
}

function formatMarkdown(report) {
  return [
    "## Cloudflare Web Analytics",
    "",
    `统计区间：${report.range.since} ～ ${report.range.until}`,
    "",
    `- 页面浏览量：**${report.pageViews}**`,
    `- 访问量：**${report.visits}**`,
    `- 每次访问页数：**${report.pagesPerVisit}**`,
    "",
    table("热门页面", report.topPaths),
    "",
    table("访问来源", report.topReferrers),
    "",
    table("国家和地区", report.topCountries),
    "",
    table("设备", report.devices),
  ].join("\n");
}

function formatText(report) {
  const lines = [
    `统计区间：${report.range.since} ～ ${report.range.until}`,
    `页面浏览量：${report.pageViews}`,
    `访问量：${report.visits}`,
    `每次访问页数：${report.pagesPerVisit}`,
    "",
    "热门页面：",
    ...report.topPaths.map((row, index) => `${index + 1}. ${row.name} — ${row.value}`),
    "",
    "访问来源：",
    ...report.topReferrers.map((row, index) => `${index + 1}. ${row.name} — ${row.value}`),
  ];
  return lines.join("\n");
}

async function queryAnalytics({ token, accountId, siteTag, since, until }) {
  const query = `query WebAnalytics(
    $accountTag: string
    $filter: AccountRumPageloadEventsAdaptiveGroupsFilter_InputObject
    $order: string
  ) {
    viewer {
      accounts(filter: { accountTag: $accountTag }) {
        total: rumPageloadEventsAdaptiveGroups(filter: $filter, limit: 1) {
          count
          sum { visits }
        }
        topReferers: rumPageloadEventsAdaptiveGroups(filter: $filter, limit: 15, orderBy: [$order]) {
          count
          avg { sampleInterval }
          dimensions { metric: refererHost }
        }
        topPaths: rumPageloadEventsAdaptiveGroups(filter: $filter, limit: 15, orderBy: [$order]) {
          count
          avg { sampleInterval }
          dimensions { metric: requestPath }
        }
        topDeviceTypes: rumPageloadEventsAdaptiveGroups(filter: $filter, limit: 15, orderBy: [$order]) {
          count
          avg { sampleInterval }
          dimensions { metric: deviceType }
        }
        countries: rumPageloadEventsAdaptiveGroups(filter: $filter, limit: 200, orderBy: [$order]) {
          count
          avg { sampleInterval }
          dimensions { metric: countryName }
        }
      }
    }
  }`;

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: {
        accountTag: accountId,
        filter: {
          AND: [
            { datetime_geq: since, datetime_leq: until },
            { bot: 0 },
            { siteTag_in: [siteTag] },
          ],
        },
        order: "count_DESC",
      },
    }),
  });

  const payload = await response.json();
  if (!response.ok || payload.errors?.length) {
    const message = payload.errors?.map((error) => error.message).join("; ") || response.statusText;
    throw new Error(`Cloudflare Analytics API 查询失败：${message}`);
  }

  const account = payload.data?.viewer?.accounts?.[0];
  if (!account) {
    throw new Error("Cloudflare Analytics API 未返回目标帐户，请检查 Token 的帐户范围");
  }
  return account;
}

function printHelp() {
  console.log(`用法：npm run analytics -- [选项]

选项：
  --hours N     查询最近 N 小时，默认 24
  --days N      查询最近 N 天
  --markdown    输出 Markdown 报告
  --json        输出 JSON
  -h, --help    显示帮助

所需环境变量：
  CLOUDFLARE_API_TOKEN
  CLOUDFLARE_ACCOUNT_ID
  CLOUDFLARE_SITE_TAG`);
}

async function main() {
  const options = readArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const untilDate = new Date();
  const sinceDate = new Date(untilDate.getTime() - options.hours * 60 * 60 * 1000);
  const since = toCloudflareTimestamp(sinceDate);
  const until = toCloudflareTimestamp(untilDate);
  const data = await queryAnalytics({
    token: requireEnvironment("CLOUDFLARE_API_TOKEN"),
    accountId: requireEnvironment("CLOUDFLARE_ACCOUNT_ID"),
    siteTag: requireEnvironment("CLOUDFLARE_SITE_TAG"),
    since,
    until,
  });
  const report = summarize(data, since, until);

  if (options.format === "json") {
    console.log(JSON.stringify(report, null, 2));
  } else if (options.format === "markdown") {
    console.log(formatMarkdown(report));
  } else {
    console.log(formatText(report));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
