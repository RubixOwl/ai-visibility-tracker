# Jev Docs: strict source-only lookup

Open **Jev Docs.html** by double-clicking it. Type a question or select a topic. Use **Read surrounding document** to check context, or browse all documents below the results.

## What this version guarantees

Returned passages are copied from the Markdown documents under `__DOCS_DIR__`, with relative filenames and line numbers. No AI model writes answers. No API key, paid account, server, installation, or internet connection is needed to use the HTML file. API cost is $0 per question; ordinary computer electricity still applies.

The app is a document search tool with a question box. It does not explain or synthesize answers, remember previous questions, or guarantee that a matching passage answers the question. Rephrase with specific keywords when needed. A failed search does not prove the documents lack the answer. Documentation itself can contain errors or outdated statements.

The source folder's surrounding proposal files are excluded. The course website is not included, and course coverage has not been verified. Source Markdown is shown literally, including code and formatting markers, to preserve evidence. No document examples are executed.

## Updating the snapshot

After updating the official documents, rebuild with:

```powershell
python build.py "<path-to-docs>"
```

Then reopen or refresh `Jev Docs.html`. The builder reads only Markdown in the fixed source directory, rejects source path junctions, skips linked files and directories, and writes the generated HTML beside this README. The generated HTML embeds a copy of the documents, so moving it also moves that snapshot.

## Why this design

The owner's selected requirement is exact source passages and free operation. A deterministic search tool satisfies this more directly than an autonomous agent. The local agent framework's CHEAT-SHEET also recommends starting with code when no LLM is needed. The agent-architect workflow was used to scope the role; no Codex model configuration or autonomous agent was activated because this deliverable does not use an agent runtime.

The suggested `Gpt_6_Jev Agent.md` selects `gpt-6-astra` and asks it to search files. Those instructions are useful boundaries, but they do not mechanically guarantee source-only generated answers. No current model price comparison was performed; this version avoids model charges entirely.

Optional future directions: local AI explanations have no per-call API bill but require model downloads and adequate hardware; a small hosted model introduces metered charges. Both need answer-quality evaluation and can introduce unsupported claims. Neither is enabled in this strict version.

## Verification

Run `node verify.js` from this directory. The checks validate every excerpt against embedded source lines, representative retrieval questions, empty and unrelated searches, UI handlers, and absence of remote scripts/network calls. The builder uses only the Python standard library. Search is performed entirely within the HTML page.

The official TypeSafe System One documentation confirms Jev returns typed decisions and does not generate explanations: https://docs.typesafe.ai/concepts/system-one . Jev itself is therefore not needed to operate this lookup tool.


