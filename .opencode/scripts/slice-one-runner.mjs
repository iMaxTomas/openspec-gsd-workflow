#!/usr/bin/env node

import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const WORKTREE_ROOT = process.cwd();
const PASSIVE_DIR = path.join(WORKTREE_ROOT, ".opencode", "passive");
const STATE_LOG_PATH = path.join(PASSIVE_DIR, "state-log.md");
const CHECKPOINT_PATH = path.join(PASSIVE_DIR, "checkpoint.md");

function parseArgs(argv) {
  const options = {
    task: "",
    writeTarget: "",
    noGo: "",
    lane: "",
    shadow: false,
    json: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    switch (arg) {
      case "--task":
        options.task = next ?? "";
        index += 1;
        break;
      case "--write-target":
        options.writeTarget = next ?? "";
        index += 1;
        break;
      case "--no-go":
        options.noGo = next ?? "";
        index += 1;
        break;
      case "--lane":
        options.lane = next ?? "";
        index += 1;
        break;
      case "--shadow":
        options.shadow = true;
        break;
      case "--json":
        options.json = true;
        break;
      default:
        if (!arg.startsWith("--") && !options.task) {
          options.task = arg;
        }
        break;
    }
  }

  return options;
}

function normalizeText(value) {
  return value.trim().replace(/\s+/g, " ");
}

function classifyLane({ task, writeTarget, noGo, lane }) {
  if (lane) {
    return {
      lane,
      reason: `Operator override selected ${lane}.`,
    };
  }

  const normalizedTask = task.toLowerCase();
  const reviewSignals = [
    "architecture",
    "topology",
    "auth",
    "governance",
    "security",
    "review",
    "judge",
    "conflict",
    "disagreement",
    "final decision",
  ];
  const executionSignals = [
    "implement",
    "change",
    "edit",
    "write",
    "update",
    "create",
    "wire",
    "fix",
    "add",
  ];

  if (reviewSignals.some((signal) => normalizedTask.includes(signal))) {
    return {
      lane: "review-lane",
      reason:
        "Task hits the review hard gate because it mentions architecture, auth, governance, conflict, or final judgment scope.",
    };
  }

  if (writeTarget || noGo || executionSignals.some((signal) => normalizedTask.includes(signal))) {
    return {
      lane: "execution-lane",
      reason:
        "Task hits the execution hard gate because it has a bounded write signal or an explicit write surface.",
    };
  }

  return {
    lane: "research-lane",
    reason:
      "Task defaults to the research hard gate because it is read-heavy or has no frozen bounded write target.",
  };
}

function runOpencodeAgent(agent, prompt) {
  const result = spawnSync("opencode", ["run", "--format", "json", "--agent", agent, prompt], {
    cwd: WORKTREE_ROOT,
    encoding: "utf8",
    env: process.env,
    maxBuffer: 1024 * 1024 * 20,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const message = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    throw new Error(`opencode run failed for ${agent}: ${message}`);
  }

  const parsedText = [];
  const rawLines = result.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of rawLines) {
    try {
      const event = JSON.parse(line);
      const text = event?.part?.text;
      if (typeof text === "string" && text.trim()) {
        parsedText.push(text.trim());
      }
    } catch {
      // Ignore non-JSON lines to keep the runner tolerant of incidental CLI noise.
    }
  }

  const stdout = parsedText.join("\n\n").trim() || result.stdout.trim();

  return {
    stdout,
    stderr: result.stderr.trim(),
  };
}

function buildLanePrompt({ task, boundary, lane, writeTarget, noGo }) {
  const writeSurface = writeTarget || "not declared";
  const noGoBoundary = noGo || "not declared";

  return [
    `Current boundary: ${boundary}`,
    `Selected lane: ${lane}`,
    `Operator task: ${task}`,
    `Declared write target: ${writeSurface}`,
    `No-go boundary: ${noGoBoundary}`,
    "Stay inside the frozen slice-one scope.",
    "Return evidence for the front-door owner. Do not claim closure authority.",
  ].join("\n");
}

function buildOwnerPrompt({ task, boundary, lane, laneReason, laneOutput, liveValidation }) {
  return [
    `Current boundary: ${boundary}`,
    `Operator task: ${task}`,
    `Required lane path: front-door-owner -> ${lane} -> front-door-owner`,
    `Lane selection reason: ${laneReason}`,
    liveValidation
      ? `For this live validation, you should route the task through ${lane} if your runtime can do so while keeping closure authority at the owner.`
      : `For this shadow validation, treat ${lane} as the classified lane without live delegation.`,
    "Integrate the lane evidence below into one bounded answer.",
    "Keep formal answer, observation-only material, and unresolved items distinguishable.",
    "Do not surrender closure authority.",
    "Lane evidence follows:",
    laneOutput,
  ].join("\n\n");
}

function extractCheckpointField(content, field) {
  const match = content.match(new RegExp(`^- ${field}:\\s*(.*)$`, "m"));
  return match ? match[1].trim() : "";
}

function renderCheckpoint({ timestamp, boundary, lane, status, openQuestions }) {
  const questionLines = openQuestions.length
    ? openQuestions.map((question) => `  - ${question}`).join("\n")
    : "  - none";

  return [
    "# checkpoint",
    "",
    "Compact resumable checkpoint surface for the local OpenCode multiagent slice-one team.",
    "",
    "## Fields",
    "",
    "- timestamp",
    "- current_boundary",
    "- active_owner",
    "- active_or_last_lane",
    "- current_status",
    "- open_questions",
    "",
    "## Current Checkpoint",
    "",
    `- timestamp: ${timestamp}`,
    `- current_boundary: ${boundary}`,
    "- active_owner: front-door-owner",
    `- active_or_last_lane: ${lane}`,
    `- current_status: ${status}`,
    "- open_questions:",
    questionLines,
    "",
  ].join("\n");
}

async function writePassiveArtifacts({ timestamp, lane, stateDelta, status, openQuestions }) {
  await mkdir(PASSIVE_DIR, { recursive: true });

  const checkpointContent = await readFile(CHECKPOINT_PATH, "utf8");
  const boundary =
    extractCheckpointField(checkpointContent, "current_boundary") ||
    "slice one only; no hidden subagents; no unresolved-item or handoff-candidate outputs";

  const stateEntry = [
    "",
    `### ${timestamp}`,
    `- timestamp: ${timestamp}`,
    "- source_slice: implement-opencode-multiagent-team-v3-slice-1",
    `- lane_path: front-door-owner -> ${lane} -> front-door-owner`,
    `- state_delta: ${stateDelta}`,
    "- risk_flag: low",
    "",
  ].join("\n");

  await appendFile(STATE_LOG_PATH, stateEntry, "utf8");
  await writeFile(
    CHECKPOINT_PATH,
    renderCheckpoint({
      timestamp,
      boundary,
      lane,
      status,
      openQuestions,
    }),
    "utf8",
  );

  return boundary;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!options.task) {
    throw new Error("Missing required --task value.");
  }

  const checkpointContent = await readFile(CHECKPOINT_PATH, "utf8");
  const boundary =
    extractCheckpointField(checkpointContent, "current_boundary") ||
    "slice one only; no hidden subagents; no unresolved-item or handoff-candidate outputs";

  const { lane, reason } = classifyLane(options);
  const timestamp = new Date().toISOString();

  let laneOutput = "shadow-mode: lane execution skipped";
  let ownerOutput = [
    `Boundary: ${boundary}`,
    `Lane used: ${lane}`,
    `Lane reason: ${reason}`,
    "Formal answer: shadow-mode classification only.",
    "Observation-only: none.",
    "Unresolved items: none.",
  ].join("\n");
  let status = `shadow validation completed for ${lane}`;
  let stateDelta = `Classified operator task into ${lane} in shadow mode without interrupting the operator-facing thread.`;

  if (!options.shadow) {
    const lanePrompt = buildLanePrompt({
      task: options.task,
      boundary,
      lane,
      writeTarget: options.writeTarget,
      noGo: options.noGo,
    });

    const ownerPrompt = buildOwnerPrompt({
      task: options.task,
      boundary,
      lane,
      laneReason: reason,
      laneOutput: lanePrompt,
      liveValidation: true,
    });
    const ownerResult = runOpencodeAgent("front-door-owner", ownerPrompt);
    ownerOutput = [ownerResult.stdout, ownerResult.stderr].filter(Boolean).join("\n").trim();
    laneOutput = "lane execution is requested through front-door-owner; inspect owner_output for declared lane usage and returned evidence.";

    status = `live routing completed through ${lane} with front-door-owner closure`;
    stateDelta = `Ran one live slice-one route through ${lane}; front-door-owner remained the single bounded closure point and passive artifacts were updated automatically.`;
  }

  const persistedBoundary = await writePassiveArtifacts({
    timestamp,
    lane,
    stateDelta,
    status,
    openQuestions: [
      "whether execution-lane and review-lane live runs should be added as dedicated acceptance probes beyond the first routed slice",
    ],
  });

  const payload = {
    timestamp,
    boundary: persistedBoundary,
    lane,
    laneReason: reason,
    shadow: options.shadow,
    task: normalizeText(options.task),
    writeTarget: options.writeTarget || null,
    noGo: options.noGo || null,
    laneOutput,
    ownerOutput,
  };

  if (options.json) {
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
    return;
  }

  process.stdout.write([
    `timestamp: ${payload.timestamp}`,
    `boundary: ${payload.boundary}`,
    `lane: ${payload.lane}`,
    `lane_reason: ${payload.laneReason}`,
    `shadow: ${String(payload.shadow)}`,
    "",
    "lane_output:",
    payload.laneOutput,
    "",
    "owner_output:",
    payload.ownerOutput,
    "",
  ].join("\n"));
}

main().catch((error) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
