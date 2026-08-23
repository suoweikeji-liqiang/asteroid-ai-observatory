#!/usr/bin/env python3
"""Remove video-publish-pack noise from migrated daily articles.

The migration preserved Bilibili/Xiaohongshu/Douyin packaging verbatim. This
script keeps the editorial summary and the first source list, removes channel-
specific metadata and duplicate blocks, and marks the reviewed article public.
"""

from pathlib import Path
import re
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[1]
DAILY_DIR = ROOT / "src/content/articles/daily"


def extract_sources(body: str) -> str:
    match = re.search(r"(?m)^(?:## )?逐条新闻链接[：:]?\s*$", body)
    if not match:
        return ""
    tail = body[match.end() :]
    end = re.search(
        r"(?m)^(?:## 发布备注|封面标题：|# 小红书|# 抖音|---\s*$)", tail
    )
    return tail[: end.start() if end else None].strip()


def clean_body(body: str) -> str:
    sources = extract_sources(body)
    cut = re.search(r"(?m)^(?:封面标题：|## 话题|## 关键字|# 小红书|# 抖音)", body)
    main = body[: cut.start() if cut else None]

    main = re.sub(r"(?m)^标题：.*\n?", "", main)
    main = re.sub(r"(?m)^(?:本期关键词|关键词)：.*\n?", "", main)
    main = main.replace("（待二次编辑整理）", "")
    main = re.sub(r"(?m)^本期 AI 日报覆盖：$", "## 今日重点", main)
    main = re.sub(r"(?m)^本期重点：$", "## 今日重点", main)
    main = re.sub(r"(?m)^(?:## )?逐条新闻链接[：:]?\s*$", "## 来源与延伸阅读", main)
    main = re.sub(r"\n{3,}", "\n\n", main).strip()

    if sources and "## 来源与延伸阅读" not in main:
        main += "\n\n---\n\n## 来源与延伸阅读\n\n" + sources

    return main.rstrip() + "\n"


def clean_file(path: Path, text: str | None = None) -> bool:
    text = text if text is not None else path.read_text(encoding="utf-8")
    if not re.search(r"(?m)^draft: true$", text):
        return False
    parts = text.split("---", 2)
    if len(parts) != 3:
        raise ValueError(f"invalid frontmatter: {path}")
    frontmatter = parts[1].replace("\ndraft: true\n", "\ndraft: false\n")
    path.write_text("---" + frontmatter + "---\n" + clean_body(parts[2]), encoding="utf-8")
    return True


def main() -> None:
    from_head = "--from-head" in sys.argv[1:]
    changed = []
    for path in sorted(DAILY_DIR.glob("*.md")):
        text = None
        if from_head:
            relative = path.relative_to(ROOT).as_posix()
            result = subprocess.run(
                ["git", "show", f"HEAD:{relative}"],
                cwd=ROOT,
                capture_output=True,
                text=True,
                check=True,
            )
            text = result.stdout
        if clean_file(path, text):
            changed.append(path)
    print(f"prepared {len(changed)} daily articles")
    for path in changed:
        print(path.relative_to(ROOT))


if __name__ == "__main__":
    main()
