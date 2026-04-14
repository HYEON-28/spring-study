export type Lang = "ko" | "en" | "ja" | "zh";

export const I18N: Record<Lang, Record<string, string>> = {
  ko: {
    nav_login: "로그인",
    nav_signup: "회원가입",
    hero_badge: "GitHub 레포를 블로그로 바꾸는 가장 쉬운 방법",
    hero_h1:
      'GitHub 레포를<br><span class="highlight">블로그처럼</span> 관리하세요',
    hero_desc:
      "로그인하고 레포를 연결하세요.<br>오늘 수정한 내용을 자동으로 요약하고,<br>다양한 언어로 번역해 전 세계와 공유합니다.",
    hero_cta_primary: "GitHub로 시작하기",
    hero_cta_secondary: "기능 살펴보기",
    feat_label: "Features",
    feat_title: "레포 하나로 블로그 그 이상",
    feat_sub: "commit 히스토리가 곧 콘텐츠가 됩니다",
    f1_title: "오늘 수정한 내용 모아보기",
    f1_desc:
      "하루 동안 변경된 파일과 커밋을 자동으로 수집해 한눈에 보여줍니다. 무엇이 바뀌었는지 빠르게 파악하세요.",
    f2_title: "AI 요약 정리",
    f2_desc:
      "오늘 수정한 내용을 AI가 자동으로 읽기 좋은 요약본으로 변환합니다. 복잡한 diff도 단숨에 이해할 수 있습니다.",
    f3_title: "다국어 번역",
    f3_desc:
      "한국어, 일본어, 영어, 중국어 — 원하는 언어로 자동 번역해 전 세계 개발자와 아이디어를 공유하세요.",
    f4_title: "트위터 공유",
    f4_desc:
      "요약본을 바로 트위터에 공유하세요. 내가 만든 것을 세상에 알리고 더 많은 피드백을 받을 수 있습니다.",
    f5_title: "GitHub 완전 연동",
    f5_desc:
      "GitHub OAuth로 1분 안에 연결. 레포를 선택하면 나머지는 자동입니다. 별도 설정이 필요 없습니다.",
    f6_title: "히스토리 아카이브",
    f6_desc:
      "날짜별 요약이 자동으로 쌓입니다. 지난 날의 작업 기록을 블로그 포스트처럼 언제든 다시 찾아볼 수 있습니다.",
    demo_h2: "commit → 요약 → 공유,<br>단 3단계",
    demo_p:
      "평소처럼 코드를 push하면 GitBlog가 알아서 변경 내용을 분석하고 읽기 좋은 글로 만들어 줍니다.",
    demo_cta: "무료로 시작하기 →",
    demo_card_title: "오늘의 변경사항 — main.py",
    ai_label: "✦ AI 요약",
    ai_summary:
      '<strong style="color:#e6edf3">데이터 요청 방식을 비동기(async/await)로 전환했습니다.</strong><br>aiohttp를 도입해 병렬 네트워크 처리 성능을 개선하고 타입 힌트를 추가해 코드 안정성을 높였습니다.',
    share_title: "오늘의 작업을 세상에 공유하세요",
    share_desc:
      "AI가 만든 요약본을 트위터에 바로 올리세요.<br>개발 일지를 꾸준히 공유하면 당신의 성장이 보입니다.",
    share_btn: "트위터로 공유하기",
    footer_copy: "© 2025 GitBlog. GitHub 레포를 블로그처럼.",
    footer_privacy: "개인정보처리방침",
    footer_terms: "이용약관",
  },
  en: {
    nav_login: "Sign in",
    nav_signup: "Sign up",
    hero_badge: "The easiest way to turn your GitHub repo into a blog",
    hero_h1:
      'Manage your GitHub repo<br><span class="highlight">like a blog</span>',
    hero_desc:
      "Sign in and connect your repo.<br>Auto-summarize today's changes<br>and share them worldwide in any language.",
    hero_cta_primary: "Start with GitHub",
    hero_cta_secondary: "Explore features",
    feat_label: "Features",
    feat_title: "More than a blog from one repo",
    feat_sub: "Your commit history becomes your content",
    f1_title: "Daily change digest",
    f1_desc:
      "Automatically collects all modified files and commits from the day, giving you a clear at-a-glance view of what changed.",
    f2_title: "AI-powered summaries",
    f2_desc:
      "AI reads your diffs and turns them into polished, readable summaries — no matter how complex the changes.",
    f3_title: "Multilingual translation",
    f3_desc:
      "Korean, Japanese, English, Chinese — auto-translate to any language and share ideas with developers worldwide.",
    f4_title: "Share to Twitter",
    f4_desc:
      "Post your AI summary directly to Twitter. Let the world know what you built and gather feedback.",
    f5_title: "Deep GitHub integration",
    f5_desc:
      "Connect in under a minute via GitHub OAuth. Select a repo and everything else is automatic — zero setup.",
    f6_title: "History archive",
    f6_desc:
      "Daily summaries accumulate automatically. Browse past work like blog posts — anytime, without digging through commits.",
    demo_h2: "commit → summarize → share,<br>just 3 steps",
    demo_p:
      "Push code as usual and GitBlog automatically analyzes your changes and turns them into a readable post.",
    demo_cta: "Get started for free →",
    demo_card_title: "today's changes — main.py",
    ai_label: "✦ AI Summary",
    ai_summary:
      '<strong style="color:#e6edf3">Switched data fetching to async/await.</strong><br>Introduced aiohttp for parallel network performance and added type hints to improve code reliability.',
    share_title: "Share today's work with the world",
    share_desc:
      "Post your AI-generated summary straight to Twitter.<br>Consistent sharing makes your growth visible.",
    share_btn: "Share on Twitter",
    footer_copy: "© 2025 GitBlog. Your GitHub repo, like a blog.",
    footer_privacy: "Privacy Policy",
    footer_terms: "Terms of Service",
  },
  ja: {
    nav_login: "ログイン",
    nav_signup: "新規登録",
    hero_badge: "GitHubリポジトリをブログに変える最も簡単な方法",
    hero_h1:
      'GitHubリポジトリを<br><span class="highlight">ブログのように</span>管理しよう',
    hero_desc:
      "ログインしてリポジトリを接続するだけ。<br>今日の変更を自動で要約し、<br>多言語に翻訳して世界中とシェアできます。",
    hero_cta_primary: "GitHubで始める",
    hero_cta_secondary: "機能を見る",
    feat_label: "機能",
    feat_title: "リポジトリ一つでブログ以上のこと",
    feat_sub: "commitの履歴がそのままコンテンツになります",
    f1_title: "今日の変更をまとめて確認",
    f1_desc:
      "1日の変更ファイルとコミットを自動収集して一覧表示。何が変わったか素早く把握できます。",
    f2_title: "AI要約レポート",
    f2_desc:
      "今日の変更内容をAIが自動で読みやすい要約に変換します。複雑なdiffも一瞬で理解できます。",
    f3_title: "多言語翻訳",
    f3_desc:
      "韓国語・日本語・英語・中国語に自動翻訳。世界中の開発者とアイデアをシェアしましょう。",
    f4_title: "Twitterシェア",
    f4_desc:
      "要約を直接Twitterに投稿。自分の成果を世界に発信し、より多くのフィードバックを得ましょう。",
    f5_title: "GitHub完全連携",
    f5_desc:
      "GitHub OAuthで1分以内に接続。リポジトリを選ぶだけで、あとはすべて自動です。",
    f6_title: "履歴アーカイブ",
    f6_desc:
      "日付別の要約が自動で蓄積されます。過去の作業記録をブログ記事のようにいつでも振り返れます。",
    demo_h2: "commit → 要約 → シェア、<br>たった3ステップ",
    demo_p:
      "普段通りにコードをpushするだけ。GitBlogが変更内容を分析し、読みやすい記事に仕上げます。",
    demo_cta: "無料で始める →",
    demo_card_title: "今日の変更 — main.py",
    ai_label: "✦ AI要約",
    ai_summary:
      '<strong style="color:#e6edf3">データ取得処理を非同期（async/await）に切り替えました。</strong><br>aiohttpを導入して並列処理を高速化し、型ヒントを追加してコードの安全性を向上させました。',
    share_title: "今日の作業を世界にシェアしよう",
    share_desc:
      "AIが作成した要約をそのままTwitterに投稿しましょう。<br>継続的な発信があなたの成長を可視化します。",
    share_btn: "Twitterでシェアする",
    footer_copy: "© 2025 GitBlog. GitHubリポジトリをブログのように。",
    footer_privacy: "プライバシーポリシー",
    footer_terms: "利用規約",
  },
  zh: {
    nav_login: "登录",
    nav_signup: "注册",
    hero_badge: "将 GitHub 仓库变成博客的最简单方式",
    hero_h1: '像博客一样管理你的<br><span class="highlight">GitHub 仓库</span>',
    hero_desc:
      "登录并连接你的仓库。<br>自动汇总今日修改内容，<br>翻译成多种语言与全世界分享。",
    hero_cta_primary: "用 GitHub 开始",
    hero_cta_secondary: "了解功能",
    feat_label: "功能特色",
    feat_title: "一个仓库，远不止博客",
    feat_sub: "commit 历史即是内容本身",
    f1_title: "今日变更一览",
    f1_desc:
      "自动收集当天修改的文件和提交记录，集中展示，让你快速掌握今天做了什么。",
    f2_title: "AI 智能摘要",
    f2_desc:
      "AI 自动将今日修改内容转化为易读摘要，再复杂的 diff 也能瞬间理解。",
    f3_title: "多语言翻译",
    f3_desc:
      "支持韩语、日语、英语、中文——自动翻译，轻松与全球开发者分享你的想法。",
    f4_title: "分享到 Twitter",
    f4_desc: "直接将 AI 摘要发布到 Twitter，让世界看见你的成果，获取更多反馈。",
    f5_title: "深度 GitHub 集成",
    f5_desc:
      "通过 GitHub OAuth 一分钟内完成连接，选择仓库后其余全部自动处理，无需额外配置。",
    f6_title: "历史归档",
    f6_desc: "按日期自动积累摘要，随时像翻阅博客文章一样回顾过去的工作记录。",
    demo_h2: "commit → 摘要 → 分享，<br>只需 3 步",
    demo_p:
      "像往常一样 push 代码，GitBlog 会自动分析变更内容并生成易读的文章。",
    demo_cta: "免费开始使用 →",
    demo_card_title: "今日变更 — main.py",
    ai_label: "✦ AI 摘要",
    ai_summary:
      '<strong style="color:#e6edf3">将数据请求方式切换为异步（async/await）。</strong><br>引入 aiohttp 提升并行网络处理性能，并添加类型提示以增强代码稳定性。',
    share_title: "将今日成果分享给世界",
    share_desc:
      "将 AI 生成的摘要直接发布到 Twitter。<br>持续分享开发日志，让你的成长清晰可见。",
    share_btn: "分享到 Twitter",
    footer_copy: "© 2025 GitBlog. 像博客一样管理 GitHub 仓库。",
    footer_privacy: "隐私政策",
    footer_terms: "服务条款",
  },
};
