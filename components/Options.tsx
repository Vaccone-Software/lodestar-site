import schema from "@/data/schema.json";

// The config lines that belong to a page, read from the schema Lodestar
// itself emits (`lodestar schema`), so the guide cannot describe an option
// the app does not have. Each shows its type, its default, its
// description, and the shell command that sets it.

type Node = {
  type?: string | string[];
  description?: string;
  default?: unknown;
  enum?: unknown[];
  properties?: Record<string, Node>;
  minimum?: number;
  maximum?: number;
};

function lookup(path: string): Node | null {
  let node: Node = schema as Node;
  for (const part of path.split(".")) {
    const next = node.properties?.[part];
    if (!next) return null;
    node = next;
  }
  return node;
}

function typeOf(node: Node): string {
  const t = Array.isArray(node.type) ? node.type.filter((x) => x !== "null").join(" or ") : node.type;
  if (node.enum) return node.enum.map(String).join(" · ");
  return t ?? "";
}

function example(path: string, node: Node): string {
  const value =
    node.default !== undefined && node.default !== null
      ? typeof node.default === "string"
        ? node.default
        : JSON.stringify(node.default)
      : Array.isArray(node.type) || node.type === "object"
        ? "…"
        : node.type === "boolean"
          ? "true"
          : "…";
  return `lodestar config set ${path} ${value}`;
}

export default function Options({ keys }: { keys: string[] }) {
  const rows = keys.map((k) => [k, lookup(k)] as const).filter(([, n]) => n);
  if (rows.length === 0) return null;
  return (
    <dl className="border-hairline mt-6 border-t">
      {rows.map(([path, node]) => (
        <div key={path} className="border-hairline grid gap-x-8 gap-y-2 border-b py-5 lg:grid-cols-[18rem_1fr]">
          <dt>
            <code className="font-mono text-[13px] text-white/90">{path}</code>
            <div className="text-faint mt-1 font-mono text-[11px]">
              {typeOf(node!)}
              {node!.default !== undefined && node!.default !== null && typeof node!.default !== "object"
                ? ` · default ${String(node!.default)}`
                : ""}
            </div>
          </dt>
          <dd>
            <p className="text-dim text-[15px] leading-[1.6]">{node!.description}</p>
            <code className="text-faint mt-2 block font-mono text-[11.5px]">
              <span className="text-accent">$ </span>
              {example(path, node!)}
            </code>
          </dd>
        </div>
      ))}
    </dl>
  );
}
