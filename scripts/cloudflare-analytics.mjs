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

function increment(map, key, amount) {
  const normalizedKey = key?.trim() || "（未知）";
  map.set(normalizedKey, (map.get(normalizedKey) ?? 0) + amount);
}

function topEntries(map, limit = 10) {
  return [...map.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([name, value]) => ({ name, value }));
}

function summarize(groups, since, until) {
  const paths = new Map();
  const referrers = new Map();
  const countries = new Map();
  const devices = new Map();
  let pageViews = 0;
  let visits = 0;

  for (const group of groups) {
    const count = Number(group.count ?? 0);
    const groupVisits = Number(group.sum?.visits ?? 0);
    pageViews += count;
    visits += groupVisits;
    increment(paths, group.dimensions?.requestPath, count);
    increment(referrers, group.dimensions?.refererHost || "直接访问", count);
    increment(countries, group.dimensions?.countryName, count);
    increment(devices, group.dimensions?.deviceType, count);
  }

  return {
    generatedAt: new Date().toISOString(),
    range: { since, until },
    pageViews,
    visits,
    pagesPerVisit: visits > 0 ? Number((pageViews / visits).toFixed(2)) : 0,
    topPaths: topEntries(paths),
    topReferrers: topEntries(referrers),
    topCountries: topEntries(countries),
    devices: topEntries(devices),
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
  const query = `query WebAnalytics($accountId: String!, $siteTag: String!, $since: String!, $until: String!) {
    viewer {
      accounts(filter: { accountTag: $accountId }) {
        rumPageloadEventsAdaptiveGroups(
          filter: { datetime_gt: $since, datetime_leq: $until, siteTag: $siteTag }
          limit: 5000
        ) {
          count
          dimensions {
            requestPath
            countryName
            deviceType
            refererHost
          }
          sum { visits }
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
      variables: { accountId, siteTag, since, until },
    }),
  });

  const payload = await response.json();
  if (!response.ok || payload.errors?.length) {
    const message = payload.errors?.map((error) => error.message).join("; ") || response.statusText;
    throw new Error(`Cloudflare Analytics API 查询失败：${message}`);
  }

  return payload.data?.viewer?.accounts?.[0]?.rumPageloadEventsAdaptiveGroups ?? [];
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
  const since = sinceDate.toISOString();
  const until = untilDate.toISOString();
  const groups = await queryAnalytics({
    token: requireEnvironment("CLOUDFLARE_API_TOKEN"),
    accountId: requireEnvironment("CLOUDFLARE_ACCOUNT_ID"),
    siteTag: requireEnvironment("CLOUDFLARE_SITE_TAG"),
    since,
    until,
  });
  const report = summarize(groups, since, until);

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
