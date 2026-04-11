# AI Dialogue Modes Canvas

```text
+====================================================================================================================+
|                                   OpenSpec + GSD + Worktree: Four Usage Modes                                     |
|                                 How the human asks -> what AI does -> where output lands -> how to continue      |
+====================================================================================================================+

  I first decide what this round is for
  -> define the work
  -> push the work manually
  -> automate the iteration mechanics
  -> audit whether it is actually complete


                         not this : every request means "AI fully automates the whole project"
                         but this : first choose a mode, then let AI act as planner / copilot / operator / auditor


                                         +--------------------------------------+
                                         |  What role do I want AI to play now? |
                                         |                                      |
                                         |  A. planner                          |
                                         |  B. manual copilot                   |
                                         |  C. automation operator              |
                                         |  D. completion auditor               |
                                         +------------------+-------------------+
                                                            |
                +-------------------------------------------+-------------------------------------------+
                |                                           |                                           |
                v                                           v                                           v

    +----------------------------------+       +----------------------------------+       +----------------------------------+
    | Mode 1                           |       | Mode 2                           |       | Mode 3                           |
    | Pure OpenSpec Planning           |       | OpenSpec + GSD Manual Execution  |       | Full OpenSpec-GSD Automation     |
    +----------------------------------+       +----------------------------------+       +----------------------------------+
    | Goal                             |       | Goal                             |       | Goal                             |
    | freeze decisions before coding   |       | keep human control while         |       | let scripts drive the iteration  |
    |                                  |       | leaving resumable checkpoints    |       | mechanics                        |
    |                                  |       |                                  |       |                                  |
    | Human says                       |       | Human says                       |       | Human says                       |
    | "Do not code yet.                |       | "Work on task 2.3 from          |       | "Start an iteration for         |
    |  Help me define auth-refactor.   |       |  auth-refactor. Stop at a clean  |       |  auth-refactor. Manage branch,   |
    |  I want scope, decisions,        |       |  boundary and leave me a         |       |  pause, worktree, and resume     |
    |  non-goals, and acceptance."     |       |  checkpoint before we switch."   |       |  using the repo workflow."       |
    |                                  |       |                                  |       |                                  |
    | AI actually does                 |       | AI actually does                 |       | AI actually does                 |
    | 1. creates change folder         |       | 1. reads proposal / design /    |       | 1. starts an iteration branch    |
    |    openspec-ob/active/changes/   |       |    tasks to confirm task 2.3     |       |    ./git-agent.sh start-iteration|
    |    auth-refactor/                |       | 2. implements only that slice    |       |    --name auth-refactor          |
    | 2. writes proposal.md            |       | 3. stops at a clean boundary     |       |    --goal "Implement auth..."    |
    |    with goal, scope, context     |       | 4. writes what is done /         |       | 2. when it is time to pause,     |
    | 3. writes design.md              |       |    unfinished / next into        |       |    writes a checkpoint           |
    |    with frozen decisions         |       |    checkpoint / handoff          |       |    node .opencode/scripts/       |
    | 4. writes tasks.md               |       | 5. leaves a continue-here note   |       |    gsd-pause-work.mjs            |
    |    with small implementation     |       |    for the next window           |       |    auth-refactor                 |
    |    steps                         |       |                                  |       | 3. when a fresh surface is       |
    |                                  |       | Output lands                     |       |    needed, creates a worktree    |
    | Output lands                     |       | => .opencode/passive/            |       |    ./scripts/create-session-     |
    | => proposal.md                   |       |    checkpoint.md                 |       |    worktree.sh opencode-lab      |
    | => design.md                     |       | => .continue-here.md             |       |    auth-refactor "$(pwd)"        |
    | => tasks.md                      |       | => .gsd/phases/<change-id>/...   |       | 4. inside the new session,       |
    |                                  |       |                                  |       |    resumes from saved state      |
    | Next round                       |       | Next round                       |       |    node .opencode/scripts/       |
    | "Start task 1."                  |       | "Continue from the last          |       |    gsd-resume-work.mjs           |
    | -> AI follows the task list      |       |  checkpoint and pick up task     |       |    auth-refactor                 |
    |                                  |       |  2.4."                           |       |                                  |
    | This mode feels like             |       | -> AI reads the checkpoint first |       | Output lands                     |
    | drawing the blueprint first      |       |                                  |       | => .git-agent/manifest.json      |
    +----------------------------------+       | This mode feels like             |       | => .opencode/passive/            |
                                               | doing one slice, then leaving     |       |    checkpoint.md                 |
                                               | a trail marker                    |       | => new session worktree          |
                                               +----------------------------------+       |                                  |
                                                                                           | Next round                       |
                                                                                           | "Enter the latest worktree and   |
                                                                                           |  continue."                      |
                                                                                           | -> AI reads the handoff first    |
                                                                                           |                                  |
                                                                                           | This mode feels like             |
                                                                                           | I press start, the workflow      |
                                                                                           | handles the relay                |
                                                                                           +----------------------------------+


                                                            |
                                                            v

                                            +----------------------------------+
                                            | Mode 4                           |
                                            | OpenSpec Completion Audit        |
                                            +----------------------------------+
                                            | Goal                             |
                                            | stop pushing work and verify     |
                                            | whether it is really done        |
                                            |                                  |
                                            | Human says                       |
                                            | "Do not keep coding. Audit       |
                                            |  auth-refactor against proposal, |
                                            |  design, tasks, and acceptance   |
                                            |  criteria. Show me what is done, |
                                            |  missing, and unsupported."      |
                                            |                                  |
                                            | AI actually does                 |
                                            | 1. reads the original promise    |
                                            |    proposal.md / design.md /     |
                                            |    tasks.md / specs              |
                                            | 2. reads current code, tests,    |
                                            |    and docs                      |
                                            | 3. compares promise <-> evidence |
                                            |    item by item                  |
                                            | 4. separates findings into       |
                                            |    done / partial / missing /    |
                                            |    unverified                    |
                                            | 5. writes a gap-oriented report  |
                                            |                                  |
                                            | Output lands                     |
                                            | => audit-report.md               |
                                            | => gap-list.md                   |
                                            | => remaining-tasks.md            |
                                            |                                  |
                                            | Next round                       |
                                            | "Reopen only the gaps from the   |
                                            |  audit."                         |
                                            | -> AI turns audit gaps into      |
                                            |    follow-up tasks               |
                                            |                                  |
                                            | This mode feels like             |
                                            | final inspection before          |
                                            | calling the job done             |
                                            +----------------------------------+


+--------------------------------------------------------------------------------------------------------------------+
|                                                Four shortest distinctions                                           |
| Mode 1 = define what to build first                                                                                |
| Mode 2 = build while manually controlling context / checkpoint / handoff                                           |
| Mode 3 = automate the branch / pause / worktree / resume mechanics                                                 |
| Mode 4 = stop pushing and verify whether OpenSpec was actually fulfilled                                           |
+--------------------------------------------------------------------------------------------------------------------+


+--------------------------------------------------------------------------------------------------------------------+
|                                                  Quick selector                                                     |
| The request is still fuzzy              -> Mode 1                                                                   |
| The plan is clear, but I want control   -> Mode 2                                                                   |
| The mechanics are repetitive            -> Mode 3                                                                   |
| People say "it's done" and I doubt it   -> Mode 4                                                                   |
+--------------------------------------------------------------------------------------------------------------------+
```
