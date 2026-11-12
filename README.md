# deploy-to-prod-example

**Your AI agent can't merge or ship to production without your phone.**

This repository is a working [Signeto](https://signeto.dev) example. Claude Code works on it like any project, but `main` only changes when you approve the exact merge on your iPhone, and the production deploy only runs when you approve that too. The agent never holds a GitHub credential.

The app is a tiny status service (`GET /health`). The deploy is simulated: [`deploy.yml`](.github/workflows/deploy.yml) runs the tests and writes a deploy summary, so you can try the whole flow without servers.

## What happens

```
You: "merge PR #1"
  │
Claude Code ──► Signeto gateway (on your computer) ──► your iPhone
                  │                                       │
                  │  builds the exact action:             │  shows: repo, PR #1, into main,
                  │  repo, PR, head commit, method        │  squash, commit 3f9a…  → Face ID
                  │                                       │
                  ◄──────────── signed approval ──────────┘
                  │
                  ├─ verifies the signature against your paired phone
                  ├─ mints a GitHub App token for this one repo, this one action, < 1 hour
                  ├─ merges exactly the approved commit (if the PR moved, it refuses)
                  └─ records request, approval and result in a hash-chained ledger
```

- **The branch is protected on GitHub's side.** A ruleset lets only the Signeto GitHub App update `main`. `git push`, `gh pr merge` and the **Merge** button all fail, for the agent and for you. That is what makes the approval required instead of optional.
- **What you see is what you sign.** The phone shows the action the gateway built, not the agent's description of it, and the gateway executes its own frozen copy.
- **Fail closed.** No answer, a denial, an expired approval or an unreachable relay: nothing runs, and Claude Code is told why.

## Try it

You need a Mac or Linux machine with Node.js 22.13+, an iPhone with the Signeto app, the GitHub CLI (`gh`) and Claude Code. The [install guides](https://signeto.dev/docs/install/) have the details.

1. **Fork this repository** (it must stay public, or be on a paid GitHub plan, for the ruleset to be enforced), then clone your fork:
   ```sh
   gh repo fork signeto/deploy-to-prod-example --clone
   cd deploy-to-prod-example
   ```
2. **Install Signeto and run setup** in the clone:
   ```sh
   npm install -g signeto
   signeto setup
   ```
   Setup creates the gateway, signs you in, pairs your phone, creates a GitHub App for your fork, adds the "main only via Signeto" ruleset, connects Claude Code and sends a test approval. The starter policy already covers this repo: merges into `main` and runs of `deploy.yml` on `main` need your phone.
3. **Open a pull request** on your fork. Any small change works, for example a new field in `health()` in `src/server.js`.
4. **Ask Claude Code to merge it:**
   > Merge my open pull request into main.

   Your phone shows the merge. Approve with Face ID; the PR merges with a green **Signeto** check on the commit.
5. **Ask Claude Code to deploy:**
   > Run the production deploy for main.

   Approve, and the `deploy` workflow runs on exactly the commit you saw. Or deny it with a reason: Claude Code gets your reason and nothing runs.
6. **Try to get around it.** Ask Claude Code to merge with `gh pr merge`, or click **Merge** on GitHub. Both fail: only the Signeto App may update `main`.
7. **Look at the record:**
   ```sh
   signeto ledger              # every request, approval and result, hash-chained
   signeto github audit        # every commit on main traced back to an approval
   ```

## The policy

`signeto setup` writes `~/.signeto/signeto.yml`. The rules this example uses:

```yaml
rules:
  - tool: github.merge_pull_request
    when: { base: main }
    tier: 3                 # your phone, Face ID, every time
    approver: you

  - tool: github.dispatch_workflow
    when: { workflow: deploy.yml, ref: main }
    tier: 3
    approver: you

  - tool: "*.read_*"
    when: { classification: { in: [public, internal] } }
    tier: 1                 # reads go through, and are still recorded
```

Anything the policy doesn't recognise asks for approval. See [Policies](https://github.com/signeto/signeto/blob/main/docs/guide/README.md#policies-in-one-page).

## Undo

- Remove the protection: your fork's **Settings → Rules → Rulesets → "main only via Signeto"**.
- Remove Claude Code's entry: `claude mcp remove signeto`.
- Delete the GitHub App: GitHub **Settings → Developer settings → GitHub Apps**.

## License

Apache-2.0. Signeto is made by Diretek Solutions, LLC.
