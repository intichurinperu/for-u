export function scriptLines(script: string, width = 35): string[] {
  const lines: string[] = [];
  for (const paragraph of script.split(/\r?\n/)) {
    let line = "";
    for (const word of paragraph.trim().split(/\s+/).filter(Boolean)) {
      if (line && Array.from(line + " " + word).length > width) {
        lines.push(line);
        line = "";
      }
      const chars = Array.from(word);
      while (chars.length > width) {
        if (line) {
          lines.push(line);
          line = "";
        }
        lines.push(chars.splice(0, width).join(""));
      }
      line += (line ? " " : "") + chars.join("");
    }
    if (line) lines.push(line);
    else if (!paragraph.trim()) lines.push("");
  }
  return lines.length ? lines : [""];
}
