import { useState } from "react";
import styles from "./MdFileTree.module.css";

export type TreeNode =
  | { type: "file"; name: string; path: string }
  | { type: "folder"; name: string; children: TreeNode[] };

export interface RepoTree {
  repoName: string;
  children: TreeNode[];
}

// TODO: 백엔드 연동 시 API 응답으로 대체
const HARDCODED_TREES: RepoTree[] = [
  {
    repoName: "md-blog",
    children: [
      { type: "file", name: "README.md", path: "README.md" },
      {
        type: "folder",
        name: "docs",
        children: [
          { type: "file", name: "architecture.md", path: "docs/architecture.md" },
          { type: "file", name: "deployment.md", path: "docs/deployment.md" },
          {
            type: "folder",
            name: "api",
            children: [
              { type: "file", name: "auth.md", path: "docs/api/auth.md" },
              { type: "file", name: "blog.md", path: "docs/api/blog.md" },
            ],
          },
        ],
      },
      {
        type: "folder",
        name: "notes",
        children: [
          { type: "file", name: "ideas.md", path: "notes/ideas.md" },
        ],
      },
    ],
  },
  {
    repoName: "awesome-cli",
    children: [
      { type: "file", name: "README.md", path: "README.md" },
      {
        type: "folder",
        name: "docs",
        children: [
          { type: "file", name: "usage.md", path: "docs/usage.md" },
          { type: "file", name: "examples.md", path: "docs/examples.md" },
        ],
      },
    ],
  },
  {
    repoName: "study-notes",
    children: [
      { type: "file", name: "README.md", path: "README.md" },
      {
        type: "folder",
        name: "algorithms",
        children: [
          { type: "file", name: "sorting.md", path: "algorithms/sorting.md" },
          { type: "file", name: "trees.md", path: "algorithms/trees.md" },
        ],
      },
      {
        type: "folder",
        name: "system-design",
        children: [
          { type: "file", name: "caching.md", path: "system-design/caching.md" },
          { type: "file", name: "queues.md", path: "system-design/queues.md" },
        ],
      },
    ],
  },
];

function FolderIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className={styles.icon} aria-hidden="true">
      {open ? (
        <path
          fill="currentColor"
          d="M1.75 2A1.75 1.75 0 0 0 0 3.75v8.5C0 13.216.784 14 1.75 14h12.5A1.75 1.75 0 0 0 16 12.25v-7A1.75 1.75 0 0 0 14.25 3.5H7.81L6.31 2.18a1.75 1.75 0 0 0-1.13-.43H1.75z"
        />
      ) : (
        <path
          fill="currentColor"
          d="M1.75 2A1.75 1.75 0 0 0 0 3.75v8.5C0 13.216.784 14 1.75 14h12.5A1.75 1.75 0 0 0 16 12.25V5.75A1.75 1.75 0 0 0 14.25 4H7.06L5.81 2.69a1.75 1.75 0 0 0-1.24-.51H1.75z"
        />
      )}
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 16 16" className={styles.icon} aria-hidden="true">
      <path
        fill="currentColor"
        d="M2 1.75C2 .784 2.784 0 3.75 0h5.586c.464 0 .909.184 1.237.513l3.914 3.914c.329.328.513.773.513 1.237V14.25A1.75 1.75 0 0 1 13.25 16H3.75A1.75 1.75 0 0 1 2 14.25V1.75zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-3.75A1.75 1.75 0 0 1 8 4.25V1.5H3.75zM9.5 1.75v2.5c0 .138.112.25.25.25h2.5L9.5 1.75z"
      />
    </svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`${styles.chevron}${open ? " " + styles.chevronOpen : ""}`}
      aria-hidden="true"
    >
      <path fill="currentColor" d="M6 4l4 4-4 4z" />
    </svg>
  );
}

function NodeView({ node, depth }: { node: TreeNode; depth: number }) {
  const [open, setOpen] = useState(depth < 1);

  if (node.type === "file") {
    return (
      <div
        className={styles.row}
        style={{ paddingLeft: 12 + depth * 14 }}
        role="treeitem"
      >
        <span className={styles.iconSlot} aria-hidden="true" />
        <FileIcon />
        <span className={styles.label} translate="no">
          {node.name}
        </span>
      </div>
    );
  }

  return (
    <div role="treeitem" aria-expanded={open}>
      <button
        type="button"
        className={`${styles.row} ${styles.rowButton}`}
        style={{ paddingLeft: 12 + depth * 14 }}
        onClick={() => setOpen((v) => !v)}
      >
        <Chevron open={open} />
        <FolderIcon open={open} />
        <span className={styles.label} translate="no">
          {node.name}
        </span>
      </button>
      {open && (
        <div role="group">
          {node.children.map((child, i) => (
            <NodeView key={i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function RepoSection({ tree }: { tree: RepoTree }) {
  const [open, setOpen] = useState(true);
  return (
    <div className={styles.repo}>
      <button
        type="button"
        className={styles.repoHeader}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <Chevron open={open} />
        <span className={styles.repoName} translate="no">
          {tree.repoName}
        </span>
      </button>
      {open && (
        <div className={styles.repoChildren} role="group">
          {tree.children.map((child, i) => (
            <NodeView key={i} node={child} depth={0} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MdFileTree() {
  return (
    <nav className={styles.tree} aria-label="md 파일 트리" role="tree">
      <p className={styles.title}>Files</p>
      {HARDCODED_TREES.map((tree) => (
        <RepoSection key={tree.repoName} tree={tree} />
      ))}
    </nav>
  );
}
