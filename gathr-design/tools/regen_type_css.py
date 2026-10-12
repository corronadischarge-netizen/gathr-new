"""Rebuild the type section of tokens.css from tokens.json (tokens.json is the source of truth).

Usage: python regen_type_css.py <tokens.json> <tokens.css>
Rewrites, in place:
  - the --text-<style> variables inside :root
  - the .<style> utility classes
Everything else in tokens.css is left as it is.
"""
import json
import re
import sys


def styles(tokens):
    families = tokens["type"]["families"]
    for group in tokens["type"]["groups"]:
        group_family = group.get("family", "sans")
        for s in group["styles"]:
            fam = s.get("family") or group_family
            if fam not in families:
                fam = "sans"
            yield fam, s


def main(json_path, css_path):
    tokens = json.load(open(json_path, encoding="utf-8"))
    css = open(css_path, encoding="utf-8").read()

    var_lines, class_blocks = [], []
    for fam, s in styles(tokens):
        italic = "italic " if s.get("fontStyle") == "italic" else ""
        usage = (s.get("usage") or "").replace("*/", "")
        var_lines.append(
            f"  --text-{s['name']}: {italic}{s['fontWeight']} {s['fontSize']}/{s['lineHeight']} var(--font-{fam}); /* {usage} */"
        )
        block = [
            f".{s['name']} {{",
            f"  font-family: var(--font-{fam});",
            f"  font-size: {s['fontSize']};",
            f"  line-height: {s['lineHeight']};",
            f"  font-weight: {s['fontWeight']};",
            f"  letter-spacing: {s.get('letterSpacing') or 'normal'};",
        ]
        if s.get("fontStyle") == "italic":
            block.append("  font-style: italic;")
        block.append("}")
        class_blocks.append("\n".join(block))

    # 1. replace the run of --text-* variables
    var_run = re.compile(r"(?:^  --text-[a-z-]+:.*\n)+", re.M)
    if not var_run.search(css):
        sys.exit("no --text-* variables found")
    css = var_run.sub("\n".join(var_lines) + "\n", css, count=1)

    # 2. replace the run of type utility classes (from the first .poster to the line before the first @font-face)
    start = css.find("\n.poster {")
    end = css.find("@font-face", start)
    if start == -1 or end == -1:
        sys.exit("type classes not found")
    css = css[: start + 1] + "\n".join(class_blocks) + "\n" + css[end:]

    open(css_path, "w", encoding="utf-8").write(css)
    print(f"rewrote {len(var_lines)} type styles in {css_path}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
