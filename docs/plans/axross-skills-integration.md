# axross/skills 統合計画

このリポジトリ（claude-loop-template）を、自前スキル 14 本を抱える構成から、
[axross/skills](https://github.com/axross/skills) のスキルをインストールして使う構成へ
移行するための計画書。あわせて axross/skills の Claude 向け hooks とサブエージェント
（`.claude/agents/`）を取り込む。

> **この文書は移行作業のための作業文書**であり、テンプレートが配布する成果物ではない。
> 移行が完了したら削除する（`docs/plans/` ごと）。

参照した実装:

- [axross/skills](https://github.com/axross/skills) — スキルの**供給元**。2 層モデル
  （`skills/` が source、`.agents/skills/` が実体、`.claude/skills/` が symlink）。
  `.claude/agents/{implementer,reviewer}.md`、hooks、CI を持つ。
- [axross/btnopen.com](https://github.com/axross/btnopen.com) — スキルの**消費側**の実例。
  `.claude/skills/` は `axross/skills` から `--copy` でインストールした実体のみ。
  自前スキルはゼロで、プロジェクト固有の知識は `docs/` に置いている。
  **このテンプレートが目指すのは btnopen.com 側の形**。

---

## 0. 前提となる決定

| # | 決定 | 内容 |
| - | ---- | ---- |
| D1 | 取り込み方式 | `npx skills` でインストールし、`.claude/skills/**` と `skills-lock.json` をコミットする（btnopen.com と同じ消費側モデル） |
| D2 | INIT / トークン | 大幅縮小して維持。スキル本文からトークンが消えるため、残るのは hooks・CI・README・`CLAUDE.md` の Project Overview のみ |
| D3 | `address` | `loop-engineering` に完全置換して削除。`loop-engineering` は `user-invocable: false`（モデル起動）なので、**必ずロードされるよう `AGENTS.md` / `CLAUDE.md` に明記**して補う |
| D4 | `handoff` | 削除 |
| D5 | `performance-and-reliability-requirements` | 削除（上流 `code-review` の performance lens に吸収済み） |

---

## 1. 現状と目標構成

### 1.1 現状

```
AGENTS.md                     # working agreement + スキル索引テーブル（14 行）
CLAUDE.md                     # @AGENTS.md の 1 行のみ
.claude/skills/**             # 自前スキル 14 本 / .md 81 ファイル / 6,201 行
                              #   → {{TOKEN}} 191 箇所、INIT:OPTIONAL 57 箇所を内包
.claude/hooks/*.sh            # session-start / format / check（トークン入り）
.claude/settings.json         # effortLevel + SessionStart hook
INIT.md / init.sh / tokens.json  # 28 トークンの置換機構 + 削除手順
README.template.md            # 初期化後 README の種
REVIEW.md                     # 投稿レビュー方針
.github/workflows/            # claude-review / merge-checks / template-checks
```

### 1.2 目標

```
AGENTS.md                     # host-neutral な working agreement（索引テーブルは廃止）
CLAUDE.md                     # @AGENTS.md + Claude Code 固有事項
.claude/skills/**             # axross/skills からインストールした実体（生成物）
skills-lock.json              # インストール済みスキルのピン留め（新規）
.claude/agents/               # implementer.md / reviewer.md（新規）
.claude/hooks/*.sh            # 上流版の改良を取り込み
.claude/settings.json         # + 任意の OTEL env ブロック
.claude/settings.local-example.json  # + send_later の permissions.allow
docs/                         # プロジェクト固有知識の置き場（新規・雛形）
  index.md / overview.md / glossary.md
  specs/ conventions/ operations/ decisions/
  operations/agent-skills.md  # インストール手順 + 逸脱レジスタ
INIT.md / init.sh / tokens.json  # 大幅縮小
REVIEW.md                     # 索引前提を除去、リンク先を新スキル名へ
.github/workflows/            # + branch-governance-audit.yaml
```

### 1.3 いちばん大きな構造変化

1. **スキル索引テーブルの廃止。** 現 `AGENTS.md` は 14 行の索引テーブルで
   ルーティングしている。上流のスキルは自分の `description` に発火条件を
   前置きする設計なので、索引は「同期し続けなければならない二重帳簿」になる。
   btnopen.com は索引を持たず、`CLAUDE.md` に「毎セッション必ず読む 5 つ」だけを
   書いて、残りは discovery に任せている。
2. **プロジェクト固有スキル → `docs/`。** 現 INIT Step 5 は「structure / component /
   routing / UI / domain のスキルを自作せよ」と指示している。btnopen.com は
   [その方針を明示的に撤回](https://github.com/axross/btnopen.com/blob/main/docs/decisions/2026-08-09-keep-project-conventions-in-docs-rather-than-repository-local-skills.md)
   し、3 本の自前スキル（533 ルール / 2,815 行）を `docs/` に退避した。
   テンプレートもこれに追随し、`living-product-specification` スキルと組で
   `docs/` の雛形を配る。
3. **トークン機構の縮小。** 上流スキルは `{{TOKEN}}` を一切持たない。
   トークン 314 箇所のうち 191 箇所（61%）がスキル内にあり、移行で消滅する。
   `INIT:OPTIONAL` も 86 箇所中 57 箇所（66%）が消える。
4. **Node への依存が発生する。** インストール／更新に `npx skills` が要る。
   インストール後のスキルは素の Markdown なので**実行時は Node 不要**だが、
   「フレームワーク非依存」の但し書きは更新が必要。

---

## 2. スキル対応表

### 2.1 置換（14 本 → 上流スキル）

| 現テンプレのスキル | 置換先（axross/skills） | 備考 |
| ------------------ | ----------------------- | ---- |
| `address` | `loop-engineering` | **D3**。スラッシュコマンド（`user-invocable: true`）→ モデル起動（`false`）。起動保証を `AGENTS.md`/`CLAUDE.md` で担保する |
| `agent-skills-best-practices` | `agent-skill-authoring` + `agent-skill-management` | 2 本に分割。`scripts/check-links.sh`（bash）→ `check-links.mjs`（Node） |
| `application-security-requirements` | `application-security` | |
| `code-review-guideline` | `code-review` | 見出しアンカーが変わる（`#repository-review-policy-overlay` → `#posted-and-ci-reviews`） |
| `development-guidelines` | `software-development` + `conventional-commits` | コミット規約が別スキルへ分離。`preview-environments.md` に相当するものは上流に**無い**（§5.3） |
| `e2e-testing-guidelines` | `end-to-end-testing` | シナリオカバレッジの扱いを要確認 |
| `github-operation-guidelines` | `github-operation` | |
| `handoff` | — | **D4**：削除。`loop-engineering` の `resuming-and-handoff.md` は「プロジェクトが handoff スキルを持つ場合のみ」参照する設計なので、無くても整合する |
| `maintainable-code-guidelines` | `code-maintainability` | |
| `observability-guidelines` | `software-instrumentation`（+ `sentry-instrumentation` / `amplitude-instrumentation`） | ベンダ固有分が別スキルに切り出されている |
| `performance-and-reliability-requirements` | — | **D5**：削除。上流 `code-review/references/review-lenses.md` の performance lens が担当 |
| `product-requirement-guidelines` | `product-requirement-document-authoring` | |
| `quality-assurance-guidelines` | `quality-assurance` | |
| `unit-test-guidelines` | `unit-testing`（+ `vitest-testing` / `jest-testing`） | ランナー固有分が別スキル |

### 2.2 新規に入るもの（テンプレートに相当物が無かった）

| スキル | 位置づけ |
| ------ | -------- |
| `professional-behavior` | **必須・常時**。知らないことの扱い、調べ方、人に訊く判断、報告の仕方。btnopen.com では「最初にロードするもの」 |
| `conventional-commits` | コミットヘッダ規約 + バリデータ |
| `agent-skill-management` | スキルの 2 層モデル、インストール／更新、ドリフト検知、上流の不備の扱い |
| `technical-document-authoring` | 設計文書・RFC・ADR・runbook・README の書き方 |
| `living-product-specification` | `docs/` に置く「製品の現状仕様」の維持。5 つのバリデータ付き。**§1.3-2 の docs 化とセット** |

### 2.3 スタック依存（INIT で選択インストール）

`wireframe-design` / `high-fidelity-ui-design` / `react-component-development` /
`react-component-styling` / `next-app-development` / `expo-app-development` /
`tanstack-query-development` / `zod-schema` / `sentry-instrumentation` /
`amplitude-instrumentation` / `jest-testing` / `vitest-testing`

### 2.4 コアセット（案）

フレームワーク非依存テンプレートとして**常に**入れる 16 本:

```
professional-behavior  loop-engineering  software-development  conventional-commits
github-operation  code-review  quality-assurance  code-maintainability
application-security  software-instrumentation  unit-testing  end-to-end-testing
product-requirement-document-authoring  technical-document-authoring
agent-skill-authoring  agent-skill-management
```

`living-product-specification` は `docs/` 雛形を配るなら 17 本目として常設。

---

## 3. 変更箇所（ファイル単位・網羅リスト）

### 3.1 スキル層

| 対象 | 変更 |
| ---- | ---- |
| `.claude/skills/**`（81 ファイル / 6,201 行） | **全削除**し、`npx skills add axross/skills --agent claude-code --yes --copy --skill <name>…` で入れ直す |
| `skills-lock.json` | **新規**。インストールしたスキルの一覧とハッシュ。`.claude/skills/` の内容と 1:1 対応させる |
| `.claude/skills/agent-skills-best-practices/scripts/check-links.sh` | 削除。後継は installed `agent-skill-authoring/scripts/check-links.mjs`（Node 必須） |

**インストール時の落とし穴**（btnopen.com の `docs/operations/agent-skills.md` に記録されている実害）:

- 外部ソースに対して `--skill '*'` を使うと**カタログ全体**が入る。Expo / TanStack Query /
  Amplitude / Jest まで巻き込むので、必ず名前を列挙する。
- `--skill` は 1 フラグ 1 スキル。カンマ区切りは**何にもマッチせず、何もインストールせず、
  ロックファイルも書かず、ヘルプのような出力で正常終了する**（サイレント失敗）。
- 環境によっては `npx skills …` が `could not determine executable to run` で落ちる。
  その時だけ `npx --yes skills@latest …` を使う。
- インストール済みディレクトリは**生成物**。手で編集しても次のインストールで消える。
  上流の不備は上流に issue / PR を出し、ローカルには「逸脱レジスタ」に記録する（§4.3）。

### 3.2 ルーティング層 — `AGENTS.md` / `CLAUDE.md`（**最重要**）

現 `AGENTS.md`（約 200 行）のうち、残すもの・捨てるものを分ける。

| 現セクション | 処置 |
| ------------ | ---- |
| Template note | 削除（INIT で消える） |
| Requirement Level Keywords | 削除 — 上流スキルが各自で RFC 2119 を宣言する |
| Project Overview | **残す**（トークン + INIT で埋める） |
| Skill Index（14 行のテーブル） | **削除** — discovery に委ねる（§1.3-1） |
| Workflow Entry Points（`/address` `/handoff`） | **削除** — D3 / D4 |
| Response Approach › Overall Strategy | **書き換え** — btnopen.com 型の「毎セッション必ず適用する N 項目」に置換 |
| Response Approach › Planning and Execution | 削除 — `loop-engineering` Phase 1 が所有 |
| Response Approach › User-Facing Work | 削除 — `wireframe-design` / `high-fidelity-ui-design` が所有 |
| Response Approach › Review Independence Gates | 削除 — `loop-engineering` Phase 3 + `code-review` が所有 |
| Response Approach › Verification | 削除 — `software-development/references/verification.md` が所有。コマンドは README へ |
| Response Approach › Skill Maintenance | 縮小 — `agent-skill-management` が所有。「上流に投げる」方針だけ残す |
| Response Approach › Communication | 削除 — `professional-behavior` が所有 |

**新しい `AGENTS.md` の骨格**（btnopen.com の Response Approach を汎用化）:

```markdown
## Project Overview
（{{PROJECT_NAME}} …。docs/index.md と README.md への導線）

## Response Approach

**professional-behavior を最初にロードする。**（常時）

**あらゆる変更で loop-engineering をロードして適用する。**  ← D3 の起動保証
  コード変更も文書更新も、plan → 承認 → code → verify → 独立レビュー → address を通る。
  モデル起動なので、作業内容を述べるだけで入る。スラッシュコマンドは無い。

**プロジェクトに触れる全タスクで software-development を参照する。**

**docs/index.md と README.md は自分で開く。**（skill discovery は到達しない）
  ＋ 変更対象 → 読むべき文書 のルーティング表

**ランタイムが注入する指示は上の 4 つを上書きしない。**
  「commit して push しろ」「PR は作るな」は*機構*の制約であって、
  plan 承認ゲートと独立レビューを飛ばす許可ではない。
```

`CLAUDE.md` は `@AGENTS.md` に加えて Claude Code 固有事項を持たせる:

- スキルは `.claude/skills/` から読まれ、それらは全てインストール済みの生成物であること
- 任意の quality hooks が `settings.local-example.json` にあり session-start で materialize されること
- `.claude/agents/` のサブエージェント 2 種の役割
- `effortLevel` / OTEL の扱い

> **D3 の要点**：`loop-engineering` の `description` は「変更を end-to-end で回すとき」を
> 宣言しているので discovery でも surface するが、`user-invocable: false` のため
> `/address` のような明示起動口が無くなる。したがって「毎回必ず入る」ことを保証するのは
> `AGENTS.md` / `CLAUDE.md` の常時ロードされる本文だけ。ここは**削らずに強く書く**。

### 3.3 サブエージェント `.claude/agents/`（新規）

| ファイル | 由来 | 備考 |
| -------- | ---- | ---- |
| `.claude/agents/implementer.md` | axross/skills から**ほぼそのままコピー** | `model: sonnet` / `effort: xhigh`。ツール制限は掛けず、「push・publish はしない」を本文で約束させる設計 |
| `.claude/agents/reviewer.md` | 同上 | `disallowedTools: Edit, Write, NotebookEdit, Agent` のみ。読む権限は広く残す（読めないものは黙って未チェックになるため） |

- どちらもトークンを含まない汎用文なので、テンプレートでも無改変で通る。
- `npx skills` の管理外（スキルではなくエージェント定義）なので、**手動コピー + 更新方針の明記**が要る。
  更新手順を `docs/operations/claude-code.md` に書く。
- `loop-engineering` はこの 2 つが**無くても動く**（implementer 不在なら汎用エージェントか単独実行、
  reviewer 不在なら pre-flight review をスキップ）。したがって導入は純粋な上積みで、
  ゲートを弱めない。INIT で削除可能にしてよい。

### 3.4 hooks と settings

| ファイル | 変更 |
| -------- | ---- |
| `.claude/hooks/session-start.sh` | ① mise を**無条件インストールしない**（`command -v mise` があるときだけ activate）— 上流版が堅い。② 末尾に `echo "REMINDER: read AGENTS.md …"` を追加（毎セッションの文脈注入）。③ `{{INSTALL_CMD}}` は維持 |
| `.claude/hooks/check.sh` | **`change_in_flight` / `emit_reminder_and_exit` を移植**。push 済みで origin/main より先行しているのに PR が無い状態を検知して `systemMessage` で警告する。loop-engineering の未完了を検知する仕掛けで、ループ用テンプレートには特に価値が高い |
| `.claude/hooks/format.sh` | 変更なし（トークンのまま） |
| `.claude/settings.local-example.json` | `permissions.allow` に `mcp__Claude_Code_Remote__send_later` / `…delete_trigger` を追加。**`loop-engineering` Phase 3 が self-wake に使う**ので、無いと毎回許可プロンプトが出る |
| `.claude/settings.json` | 任意の `env` ブロック（`OTEL_RESOURCE_ATTRIBUTES: repository={{PROJECT_NAME}}`）を INIT:OPTIONAL 付きで追加。既定は無効でよい |

### 3.5 CI（`.github/workflows/`）

| ファイル | 変更 |
| -------- | ---- |
| `claude-review.yaml` | ほぼ現状維持。`REVIEW.md` 参照はそのまま有効。任意で上流の OTEL ゲーティング（`CLAUDE_OTEL_EXPORTER_OTLP_ENDPOINT` が空なら telemetry を明示 off）を取り込む |
| `merge-checks.yaml` | トークンはそのまま。追加候補: **skills ドリフト検知ジョブ**（再インストールして `git diff --exit-code`）。`skills-lock.json` と `.claude/skills/` の乖離を機械的に捕まえる |
| `branch-governance-audit.yaml` | **新規（上流から移植）**。`claude/*` ブランチが default より先行しているのに open PR が無い状態を毎時スイープして落とす。loop-engineering の**サーバ側の床**。ループ用テンプレートの中核機能として推奨 |
| `template-checks.yaml` | 現在 `check-links.sh`（bash）を叩いている。移行後は installed の `check-links.mjs`（Node）に差し替える。テンプレートリポジトリ自身の CI にだけ Node が要ることになる |

### 3.6 `REVIEW.md`

| 箇所 | 変更 |
| ---- | ---- |
| 冒頭のリンク | `code-review-guideline/SKILL.md` → `code-review/SKILL.md`、アンカーを `#posted-and-ci-reviews` へ |
| Severity Vocabulary | 「`AGENTS.md` skill index にある skill の MUST」→「`description` で発火する skill の MUST」に書き換え（索引廃止に伴う。2 箇所） |
| Mandatory Checks | 同上（Skill conformance の定義）。上流は**第 3 のチェック「Subtractive pass」**（何を削るべきか、5 レンズ）を持つ。文書中心のリポジトリ向けの色が強いので、テンプレートに入れるかは要判断 |
| Do Not Report | 「Anything CI already enforces」という包括表現をやめ、上流のように**列挙**に変える（CI が増えるたびにレビュー範囲が黙って狭まるのを防ぐ）。INIT で埋める |
| Reporting | `github-operation-guidelines` → `github-operation` にリンク更新 |
| 任意で追加 | 上流の「Reading Beyond the Diff」「What Is Not Evidence」。特に後者（著者自身の検証表・受入基準チェックは証拠にならない）は汎用的で価値が高い |

### 3.7 INIT / トークン機構（**D2**）

| ファイル | 変更 |
| -------- | ---- |
| `tokens.json` | `ERROR_TRACKER` / `LOGGER` / `SOURCE_DIR` / `TEST_DIR` を**削除**（スキル内にしか出現しない）。`LINTER` / `FORMATTER` / `UNIT_TEST_FRAMEWORK` / `E2E_TEST_FRAMEWORK` / `CMS_OR_DATA_LAYER` / `HOSTING_PLATFORM` / `START_CMD` / `TYPECHECK_CMD` は README.template.md の表にしか残らないので、README の書き方次第で削減可。28 → 16〜19 本 |
| `init.sh` | 変更ほぼ不要（マニフェスト駆動）。`check` のリンク検査呼び出し先を `.mjs` に変更 |
| `INIT.md` Step 1 | 1d の「optional capability の have/add/skip」は**スキル選択に読み替え**。§2.3 のどれを入れるかを訊く形へ |
| `INIT.md` Step 3 | トークン表を縮小 |
| `INIT.md` Step 4 | **ほぼ全消し**。「optional capability を skip したらこのスキルとこの逆リンクを消せ」という長大な削除リスト（e2e 10 箇所、observability 10 箇所、data-layer 8 箇所、auth 6 箇所、preview-env 6 箇所…）は、スキルが生成物になった時点で不要になる。代わりに「§2.4 のコア + §2.3 から選んだものをインストールする」1 手順に置換 |
| `INIT.md` Step 5 | 「プロジェクト固有スキルを作る」→ **「`docs/` を書く」に転換**（§1.3-2）。archetypes への参照は `agent-skill-authoring/references/project-skill-archetypes.md` に付け替えるか、docs 化に伴い落とす |
| `INIT.md` Step 6 | `.claude/agents/` の扱いを追記 |
| `INIT.md` Step 7 / チェックリスト | `check-links.sh` → `check-links.mjs`（4 箇所）。「skill index が `.claude/skills/` と一致すること」の項目は削除、代わりに「`skills-lock.json` と `.claude/skills/` が一致すること」へ |
| `README.template.md` | `/address` `/handoff` の節を「loop-engineering — 変更を end-to-end で回す」に書き換え。`@claude review` 節は維持。Tech stack / Testing の表は残す |

### 3.8 テンプレート自身の `README.md`

- 「What's inside」のツリーを全面差し替え（`skills-lock.json`、`.claude/agents/`、`docs/` を追加、
  自前スキル 12 本の列挙を削除）
- 「skill core（12 guideline skills）」という説明を「axross/skills からインストールする N 本」に変更
- `/address` `/handoff` の説明を `loop-engineering` に置換
- Getting started に **skills のインストール／更新手順**と `npx skills` の落とし穴を追記
- 「framework-agnostic」の但し書きに **Node が更新時に要る**ことを明記

### 3.9 その他

| ファイル | 変更 |
| -------- | ---- |
| `.gitignore` | 変更不要（`npx skills` は node_modules を作らない）。ただし `docs/` 雛形の検証に Node ツールを足すなら `node_modules/` を追加 |
| `docs/**` | **新規**（§4.3） |

---

## 4. 新設するもの

### 4.1 `skills-lock.json`

`npx skills` が生成する。`sourceType: "github"`, `source: "axross/skills"` になる。
`.claude/skills/` の中身と 1:1 で対応させ、**両方を同じコミットに含める**。

### 4.2 `.claude/agents/{implementer,reviewer}.md`

§3.3。

### 4.3 `docs/` 雛形

btnopen.com の構成を汎用化した骨格を配る:

```
docs/
  index.md                     # 3 つの本体（specs / conventions / operations）への案内 + decisions
  overview.md                  # 製品は何か（INIT で書く）
  glossary.md                  # 用語（製品の語 / リポジトリの語）
  specs/                       # 現在の振る舞い（living-product-specification が管理）
  conventions/                 # コードの書き方（旧・プロジェクト固有スキルの行き先）
    repository-map.md          # ← 旧「Project Structure スキル」
  operations/
    agent-skills.md            # ★ インストール・更新手順 + 逸脱／欠落レジスタ
    claude-code.md             # ★ hooks / settings / サブエージェント / telemetry
    development-workflow.md    # loop-engineering の実運用
  decisions/                   # 決定ログ（YYYY-MM-DD-<kebab>.md）
```

`operations/agent-skills.md` が特に重要。btnopen.com のものをテンプレート化して、以下を持たせる:

- 正しい再インストールコマンド（ロックファイルからスキル名を導出する形）
- `--skill '*'` 禁止、カンマ区切り禁止の警告
- **逸脱レジスタ**：インストール済みスキルの MUST に反する実装をする場合、
  「黙って破る」のでも「スキルを書き換える」のでもなく、ここに記録する。
  レジスタに無い逸脱は指摘対象、というルール。
- **欠落の扱い**：上流スキルが間違っている／古い／このケースに沈黙している場合、
  人間の許可を得てから上流に issue を出し、それまではローカルに記録する。

### 4.4 `.github/workflows/branch-governance-audit.yaml`

§3.5。

---

## 5. 未解決 / 要判断

### 5.1 `AGENTS.md` を残すか、`CLAUDE.md` 一本にするか

- axross/skills: `AGENTS.md`（host-neutral）+ `CLAUDE.md`（`@AGENTS.md` + Claude 固有）の 2 枚
- btnopen.com: `CLAUDE.md` 1 枚のみ
- 現テンプレ: `CLAUDE.md` = `@AGENTS.md` の 1 行

**推奨は axross/skills 方式**（2 枚）。現テンプレの構造を壊さず、将来 Codex 等を足せる。
D3 で「AGENTS.md / CLAUDE.md で指定」と決めているので、この形が合う。

### 5.2 `REVIEW.md` の Subtractive pass を入れるか

上流の第 3 の必須チェック（何を削るべきか、5 レンズ）は、Markdown 中心リポジトリの
文脈が強い。汎用テンプレートに入れると全プロジェクトに固定コストが乗る。
**既定では入れず、`INIT:OPTIONAL` で選ばせる**のが妥当。

### 5.3 上流に無い機能の行き先

| 現テンプレの資産 | 上流に相当物 | 提案 |
| ---------------- | ------------ | ---- |
| `development-guidelines/references/preview-environments.md`（PR ごとのプレビュー環境） | **無い** | `docs/operations/preview-deployment.md` の雛形に転記。btnopen.com も docs 側に持っている |
| `e2e-testing-guidelines/references/scenario-coverage.md`（ジャーニーカタログ） | 上流 `end-to-end-testing` の内容を要確認 | 未収載なら `docs/conventions/testing.md` へ |
| `product-requirement-guidelines/references/template.md`（計画文書テンプレ） | `product-requirement-document-authoring` にあるはず | 要差分確認。上流優位なら破棄 |
| `address/references/visual-design-options.md` | `loop-engineering` の plan-document + `wireframe-design` に分散 | 破棄 |

**移行前に、削除する 14 本と置換先の差分レビューを 1 本ずつ行うこと。**
上流にしか無いものは取り込みで得られるが、テンプレートにしか無いものは黙って失われる。

### 5.4 Codex 対応

axross/skills は `.codex/hooks.json` + `.codex/config.toml` を持ち、同じ hooks を
`SKILLS_SESSION_BOOTSTRAP=1` で共有している。テンプレートは現在 Claude Code 専用を
明言（INIT Step 1e）。**今回のスコープ外**とし、必要なら後続で。

### 5.5 上流の更新にどう追随するか

`skills-lock.json` は再インストールしないと動かない。追随の運用として:

- `merge-checks.yaml` にドリフト検知ジョブ（§3.5）
- あるいは Dependabot 的な定期リフレッシュ workflow（週次で再インストールして差分があれば PR）

**要判断**：テンプレートに定期リフレッシュを同梱するか、手順書だけにするか。

---

## 6. 実施順序

各フェーズを独立した PR にして、`loop-engineering`（移行後）／現 `/address`（移行中）で回す。

| # | フェーズ | 内容 | 依存 |
| - | -------- | ---- | ---- |
| 1 | 差分レビュー | 削除予定 14 本 × 置換先の内容差分を洗い、失われる資産を §5.3 の行き先に確定させる | — |
| 2 | スキル入れ替え | `.claude/skills/**` 削除 → `npx skills` でコア 16〜17 本をインストール → `skills-lock.json` コミット | 1 |
| 3 | ルーティング書き換え | `AGENTS.md` / `CLAUDE.md` を新骨格へ。索引テーブル削除、D3 の起動保証を明記 | 2 |
| 4 | サブエージェント | `.claude/agents/` 2 ファイル追加 | 2 |
| 5 | hooks / settings | check.sh の in-flight リマインダ、session-start の REMINDER、send_later 許可 | 3 |
| 6 | REVIEW.md | 索引前提の除去、リンク先更新、Do-Not-Report の列挙化 | 2, 3 |
| 7 | CI | `branch-governance-audit.yaml` 追加、`template-checks.yaml` を `.mjs` へ、ドリフト検知（任意） | 2 |
| 8 | `docs/` 雛形 | `index.md` / `agent-skills.md` / `claude-code.md` ほか | 2 |
| 9 | INIT 再構築 | Step 4 の削除リスト撤去、Step 5 の docs 化、tokens.json 縮小、チェックリスト更新 | 2–8 すべて |
| 10 | README 更新 | テンプレート自身の README と `README.template.md` | 9 |

フェーズ 2 と 3 を分けると、2 の直後は「スキルはあるがルーティングが旧のまま」という
壊れた中間状態になる。**2 と 3 は同一 PR にまとめる**のが安全。

---

## 7. リスク

| リスク | 影響 | 緩和 |
| ------ | ---- | ---- |
| `loop-engineering` が起動されない | 変更がループ外で流れ、独立レビューを経ずに done と報告される | `AGENTS.md`/`CLAUDE.md` の常時ロード本文で強制（D3）＋ `branch-governance-audit.yaml` のサーバ側の床＋ check.sh の in-flight リマインダ、の三重 |
| 削除する 14 本にしか無い資産の喪失 | 静かに劣化 | フェーズ 1 の差分レビューを必須にする |
| インストール済みスキルを手で直してしまう | 次のインストールで消える。消えるまでの間、上流が同意していないルールを装う | `docs/operations/agent-skills.md` の逸脱レジスタ運用 |
| `--skill '*'` / カンマ区切りのサイレント失敗 | カタログ全採用、または無言の未インストール | 手順書に明記（§3.1）、`skills-lock.json` と `.claude/skills/` の一致を CI で検査 |
| Node 依存の追加 | 「フレームワーク非依存」の主張が弱まる | インストール時のみ必要である旨を README に明記。インストール後のスキルは素の Markdown |
| 上流の破壊的変更 | スキル名・アンカーの変更で `REVIEW.md` や docs のリンクが腐る | `skills-lock.json` でピン留め。更新は明示的な操作に限定し、リンク検査を CI に置く |
