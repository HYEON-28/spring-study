CREATE TABLE users (
  id                  BINARY(16)       NOT NULL DEFAULT (UUID_TO_BIN(UUID(), 1)),
  github_id           BIGINT UNSIGNED  NOT NULL,
  github_username     VARCHAR(50)      NOT NULL,
  name                VARCHAR(255),
  email               VARCHAR(255),
  avatar_url          VARCHAR(500),
  github_profile_url  VARCHAR(255),
  access_token        TEXT             NOT NULL,
  refresh_token       TEXT,
  last_login_at       DATETIME,
  created_at          DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at          DATETIME,

  PRIMARY KEY (id),
  UNIQUE KEY uq_github_id    (github_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE repositories (
  id               BINARY(16)       NOT NULL DEFAULT (UUID_TO_BIN(UUID(), 1)),
  github_repo_id   BIGINT UNSIGNED  NOT NULL,
  owner_github_id  BIGINT UNSIGNED  NOT NULL,
  name             VARCHAR(100)     NOT NULL,
  full_name        VARCHAR(200)     NOT NULL,
  description      TEXT,
  html_url         VARCHAR(500)     NOT NULL,
  default_branch   VARCHAR(100)     NOT NULL DEFAULT 'main',
  language         VARCHAR(50),
  is_private       TINYINT(1)       NOT NULL DEFAULT 0,
  created_at       DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_github_repo_id (github_repo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE user_repositories (
  id             BINARY(16)   NOT NULL DEFAULT (UUID_TO_BIN(UUID(), 1)),
  user_id        BINARY(16)   NOT NULL,
  repository_id  BINARY(16)   NOT NULL,
  connected_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  active      TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_repository (user_id, repository_id),
  CONSTRAINT fk_ur_user        FOREIGN KEY (user_id)       REFERENCES users(id),
  CONSTRAINT fk_ur_repository  FOREIGN KEY (repository_id) REFERENCES repositories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- GitHub 레포의 md 파일 캐시 스냅샷
-- repositories 단위로 생성 → 동일 레포를 N명이 써도 1벌만 유지
CREATE TABLE repository_snapshots (
  id               BINARY(16)      NOT NULL DEFAULT (UUID_TO_BIN(UUID(), 1)),
  repository_id    BINARY(16)      NOT NULL,
  sha_tree         VARCHAR(40)     NOT NULL,        -- GitHub tree sha, 변경 감지용
  md_file_count    SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  last_synced_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_snapshot_repo (repository_id),      -- 레포당 스냅샷 1개
  CONSTRAINT fk_rs_repository FOREIGN KEY (repository_id) REFERENCES repositories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- md 파일 원본 + 파싱 결과 저장
-- repository_snapshot 단위 → 유저 수와 무관하게 파일당 1벌
CREATE TABLE md_files (
  id                  BINARY(16)       NOT NULL DEFAULT (UUID_TO_BIN(UUID(), 1)),
  snapshot_id         BINARY(16)       NOT NULL,
  file_path           VARCHAR(500)    NOT NULL,     -- 'docs/components/button.md'
  file_name           VARCHAR(255)     NOT NULL,     -- 'button.md'
  title               VARCHAR(500),                  -- frontmatter title or h1
  raw_content         MEDIUMTEXT       NOT NULL,
  parsed_html         MEDIUMTEXT,                    -- 렌더링 캐시
  github_sha          VARCHAR(40)      NOT NULL,     -- blob sha, 파일 단위 변경 감지
  frontmatter         JSON,                          -- { date, tags, description, ... }
  reading_time_min    TINYINT UNSIGNED,
  created_at          DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_md_file (snapshot_id, file_path),    -- 스냅샷 내 경로 중복 방지
  CONSTRAINT fk_mf_snapshot FOREIGN KEY (snapshot_id) REFERENCES repository_snapshots(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 폴더/파일 트리 구조
-- parent_id self-join 으로 깊이 무제한 재현
CREATE TABLE md_file_tree (
  id             BINARY(16)    NOT NULL DEFAULT (UUID_TO_BIN(UUID(), 1)),
  snapshot_id    BINARY(16)    NOT NULL,
  parent_id      BINARY(16),                         -- NULL = 루트
  md_file_id     BINARY(16),                         -- type=file 일 때만 값 있음
  node_type      ENUM('folder','file') NOT NULL,
  name           VARCHAR(255)  NOT NULL,             -- 'components' or 'button.md'
  path           VARCHAR(1000) NOT NULL,             -- 'docs/components'
  sort_order     SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY idx_tree_snapshot  (snapshot_id),
  KEY idx_tree_parent    (parent_id),
  CONSTRAINT fk_mft_snapshot    FOREIGN KEY (snapshot_id) REFERENCES repository_snapshots(id),
  CONSTRAINT fk_mft_parent      FOREIGN KEY (parent_id)   REFERENCES md_file_tree(id),
  CONSTRAINT fk_mft_md_file     FOREIGN KEY (md_file_id)  REFERENCES md_files(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 유저가 특정 레포를 블로그로 지정
-- user_repositories 와 별개 → 연동과 블로그 지정은 다른 액션
CREATE TABLE blog_repositories (
  id                  BINARY(16)    NOT NULL DEFAULT (UUID_TO_BIN(UUID(), 1)),
  user_id             BINARY(16)    NOT NULL,
  user_repository_id  BINARY(16)    NOT NULL,        -- user_repositories.id 참조
  snapshot_id         BINARY(16)    NOT NULL,        -- 최신 스냅샷 참조
  active           TINYINT(1)    NOT NULL DEFAULT 1,
  display_order       INT           NOT NULL DEFAULT 0,
  created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_blog_repo (user_id, user_repository_id),
  CONSTRAINT fk_br_user            FOREIGN KEY (user_id)            REFERENCES users(id),
  CONSTRAINT fk_br_user_repository FOREIGN KEY (user_repository_id) REFERENCES user_repositories(id),
  CONSTRAINT fk_br_snapshot        FOREIGN KEY (snapshot_id)        REFERENCES repository_snapshots(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 동기화 이력
-- repository_snapshots 단위로 기록 → 유저 수와 무관하게 1번 처리된 내역 추적
CREATE TABLE sync_logs (
  id              BINARY(16)    NOT NULL DEFAULT (UUID_TO_BIN(UUID(), 1)),
  snapshot_id     BINARY(16)    NOT NULL,
  triggered_by    ENUM('webhook','manual','schedule') NOT NULL,
  status          ENUM('success','failed','partial')  NOT NULL,
  files_added     SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  files_updated   SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  files_deleted   SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  error_message   TEXT,
  started_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at     DATETIME,

  PRIMARY KEY (id),
  KEY idx_sync_snapshot (snapshot_id),
  CONSTRAINT fk_sl_snapshot FOREIGN KEY (snapshot_id) REFERENCES repository_snapshots(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;