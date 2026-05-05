import { useEffect, useState } from "react";
import { getBlogFileTree, type BlogFileTreeRepo, type FileTreeNode } from "../api/blogApi";
import { useLang } from "../context/LangContext";
import { useGoogleTranslate } from "../hooks/useGoogleTranslate";
import styles from "./MdFileTree.module.css";

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

interface NodeViewProps {
  node: FileTreeNode;
  depth: number;
  repoFullName: string;
  selectedPath: string | null;
  onFileSelect: (repoFullName: string, path: string) => void;
}

function NodeView({ node, depth, repoFullName, selectedPath, onFileSelect }: NodeViewProps) {
  const [open, setOpen] = useState(depth < 1);

  if (node.type === "file") {
    const isSelected = node.path === selectedPath;
    return (
      <button
        type="button"
        className={`${styles.row} ${styles.rowButton} ${isSelected ? styles.rowSelected : ""}`}
        style={{ paddingLeft: 12 + depth * 14 }}
        role="treeitem"
        onClick={() => onFileSelect(repoFullName, node.path!)}
      >
        <span className={styles.iconSlot} aria-hidden="true" />
        <FileIcon />
        <span className={styles.label}>{node.name}</span>
      </button>
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
        <span className={styles.label}>{node.name}</span>
      </button>
      {open && (
        <div role="group">
          {(node.children ?? []).map((child, i) => (
            <NodeView
              key={i}
              node={child}
              depth={depth + 1}
              repoFullName={repoFullName}
              selectedPath={selectedPath}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface RepoSectionProps {
  tree: BlogFileTreeRepo;
  selectedPath: string | null;
  onFileSelect: (repoFullName: string, path: string) => void;
}

function RepoSection({ tree, selectedPath, onFileSelect }: RepoSectionProps) {
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
            <NodeView
              key={i}
              node={child}
              depth={0}
              repoFullName={tree.repoFullName}
              selectedPath={selectedPath}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface Props {
  username: string;
  selectedPath: string | null;
  onFileSelect: (repoFullName: string, path: string) => void;
}

export default function MdFileTree({ username, selectedPath, onFileSelect }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [repos, setRepos] = useState<BlogFileTreeRepo[]>([]);
  const { lang } = useLang();
  const { translateTo } = useGoogleTranslate();

  useEffect(() => {
    getBlogFileTree(username)
      .then((data) => setRepos(data))
      .catch(() => setRepos([]));
  }, [username]);

  useEffect(() => {
    if (repos.length === 0) return;
    translateTo(lang);
  }, [repos, lang, translateTo]);

  return (
    <nav className={styles.tree} aria-label="md 파일 트리" role="tree">
      <button
        type="button"
        className={styles.mobileToggle}
        onClick={() => setMobileOpen((v) => !v)}
        aria-expanded={mobileOpen}
      >
        <span className={styles.mobileToggleLabel}>Files</span>
        <svg
          viewBox="0 0 16 16"
          className={`${styles.toggleChevron}${mobileOpen ? " " + styles.toggleChevronOpen : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>
      <div className={`${styles.treeBody}${mobileOpen ? " " + styles.treeBodyOpen : ""}`}>
        <p className={styles.title}>Files</p>
        {repos.map((tree) => (
          <RepoSection
            key={tree.repoName}
            tree={tree}
            selectedPath={selectedPath}
            onFileSelect={onFileSelect}
          />
        ))}
      </div>
    </nav>
  );
}
