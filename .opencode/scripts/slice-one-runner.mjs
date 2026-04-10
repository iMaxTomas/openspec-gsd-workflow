#!/usr/bin/env node

import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const WORKTREE_ROOT = process.cwd();
const PASSIVE_DIR = path.join(WORKTREE_ROOT, ".opencode", "passive");
const STATE_LOG_PATH = path.join(PASSIVE_DIR, "state-log.md");
const CHECKPOINT_PATH = path.join(PASSIVE_DIR, "checkpoint.md");
const UNRESOLVED_ITEM_PATH = path.join(PASSIVE_DIR, "unresolved-item.md");
const HANDOFF_CANDIDATE_PATH = path.join(PASSIVE_DIR, "handoff-candidate.md");
const SLICE_TWO_BOUNDARY =
  "slice two only; keep one front-door owner; visible retained lanes only; no hidden internal subagents";
const SLICE_ONE_BOUNDARY =
  "slice one only; no hidden subagents; no unresolved-item or handoff-candidate outputs";

function parseArgs(argv) {
  const options = {
    task: "",
    writeTarget: "",
    noGo: "",
    lane: "",
    shadow: false,
    json: false,
    artifact: "",
    observationSource: "",
    affectedScope: "",
    blockingReason: "",
    nextNeededStep: "",
    whyNotable: "",
    supportingEvidenceRefs: "",
    confidence: "",
    promotionRisk: "",
    promote: "",
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
      case "--artifact":
        options.artifact = next ?? "";
        index += 1;
        break;
      case "--observation-source":
        options.observationSource = next ?? "";
        index += 1;
        break;
      case "--affected-scope":
        options.affectedScope = next ?? "";
        index += 1;
        break;
      case "--blocking-reason":
        options.blockingReason = next ?? "";
        index += 1;
        break;
      case "--next-needed-step":
        options.nextNeededStep = next ?? "";
        index += 1;
        break;
      case "--why-notable":
        options.whyNotable = next ?? "";
        index += 1;
        break;
      case "--supporting-evidence-refs":
        options.supportingEvidenceRefs = next ?? "";
        index += 1;
        break;
      case "--confidence":
        options.confidence = next ?? "";
        index += 1;
        break;
      case "--promotion-risk":
        options.promotionRisk = next ?? "";
        index += 1;
        break;
      case "--promote":
        options.promote = next ?? "";
        index += 1;
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

function slugify(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "item";
}

function normalizeCsv(value) {
  return value
    .split(",")
    .map((entry) => normalizeText(entry))
    .filter(Boolean)
    .join(", ");
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

function decidePromotionRoute({ artifact, promotionRisk, promote }) {
  if (artifact !== "handoff-candidate") {
    return {
      route: "defer",
      reason: "No promotion route is needed because the current passive artifact is not a handoff-candidate.",
    };
  }

  if (promote === "review" || promotionRisk === "high") {
    return {
      route: "review-lane",
      reason:
        "Promotion must pass through review-lane because the candidate is marked high-risk or explicitly requested for review-mediated promotion.",
    };
  }

  if (promote === "owner" || promotionRisk === "low") {
    return {
      route: "owner-correction",
      reason:
        "Promotion may stay with front-door-owner because the candidate is bounded and marked low-risk for explicit owner correction.",
    };
  }

  return {
    route: "defer",
    reason: "Promotion remains deferred because no explicit owner/review promotion decision was requested.",
  };
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

function normalizeBoundary(value, artifact) {
  if (!value || value === SLICE_ONE_BOUNDARY || artifact) {
    return SLICE_TWO_BOUNDARY;
  }

  return value;
}

function renderCheckpoint({ timestamp, boundary, lane, status, openQuestions }) {
  const questionLines = openQuestions.length
    ? openQuestions.map((question) => `  - ${question}`).join("\n")
    : "  - none";

  return [
    "# checkpoint",
    "",
    "Compact resumable checkpoint surface for the local OpenCode multiagent slice runtime.",
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

function renderUnresolvedItemEntry({
  itemId,
  timestamp,
  currentStatus,
  affectedScope,
  blockingReason,
  nextNeededStep,
  observationSource,
}) {
  return [
    "",
    `### ${itemId}`,
    `- item_id: ${itemId}`,
    `- first_seen: ${timestamp}`,
    `- current_status: ${currentStatus}`,
    `- affected_scope: ${affectedScope}`,
    `- blocking_reason: ${blockingReason}`,
    `- next_needed_step: ${nextNeededStep}`,
    `- observation_source: ${observationSource}`,
    "",
  ].join("\n");
}

function renderHandoffCandidateEntry({
  candidateId,
  sourceWindow,
  affectedScope,
  whyNotable,
  recommendedLane,
  supportingEvidenceRefs,
  confidence,
  observationSource,
  promotionStatus,
  promotionTimestamp,
  promotingActor,
  reviewEvidenceRef,
}) {
  return [
    "",
    `### ${candidateId}`,
    `- candidate_id: ${candidateId}`,
    `- source_window: ${sourceWindow}`,
    `- affected_scope: ${affectedScope}`,
    `- why_notable: ${whyNotable}`,
    `- recommended_lane: ${recommendedLane}`,
    `- supporting_evidence_refs: ${supportingEvidenceRefs}`,
    `- confidence: ${confidence}`,
    `- observation_source: ${observationSource}`,
    `- promotion_status: ${promotionStatus}`,
    `- promotion_timestamp: ${promotionTimestamp}`,
    `- promoting_actor: ${promotingActor}`,
    `- review_evidence_ref: ${reviewEvidenceRef}`,
    "",
  ].join("\n");
}

async function ensureArtifactFile(filePath, heading, description, fields) {
  try {
    await readFile(filePath, "utf8");
  } catch {
    const content = [
      `# ${heading}`,
      "",
      description,
      "",
      "## Fields",
      "",
      ...fields.map((field) => `- ${field}`),
      "",
      "## Entries",
      "",
    ].join("\n");
    await writeFile(filePath, `${content}\n`, "utf8");
  }
}

async function writePassiveArtifactRecord(options) {
  if (!options.artifact) {
    return null;
  }

  if (options.artifact === "unresolved-item") {
    await ensureArtifactFile(
      UNRESOLVED_ITEM_PATH,
      "unresolved-item",
      "Durable passive ledger for issues that remain open across local OpenCode slices.",
      [
        "item_id",
        "first_seen",
        "current_status",
        "affected_scope",
        "blocking_reason",
        "next_needed_step",
        "observation_source",
      ],
    );

    const itemId = `uri-${slugify(options.affectedScope || options.task)}-${Date.now()}`;
    await appendFile(
      UNRESOLVED_ITEM_PATH,
      renderUnresolvedItemEntry({
        itemId,
        timestamp: options.timestamp,
        currentStatus: options.promote === "owner" || options.promote === "review" ? "promotion-pending" : "open",
        affectedScope: options.affectedScope || "not declared",
        blockingReason: options.blockingReason || "not declared",
        nextNeededStep: options.nextNeededStep || "not declared",
        observationSource: options.observationSource || "not declared",
      }),
      "utf8",
    );

    return {
      artifactType: "unresolved-item",
      artifactId: itemId,
      artifactPath: UNRESOLVED_ITEM_PATH,
      promotionRoute: "defer",
      promotionReason: "Unresolved items remain durable passive records until a later explicit promotion decision.",
    };
  }

  if (options.artifact === "handoff-candidate") {
    await ensureArtifactFile(
      HANDOFF_CANDIDATE_PATH,
      "handoff-candidate",
      "Bounded passive ledger for observation-only candidates that may later be corrected or promoted into the formal line.",
      [
        "candidate_id",
        "source_window",
        "affected_scope",
        "why_notable",
        "recommended_lane",
        "supporting_evidence_refs",
        "confidence",
        "observation_source",
        "promotion_status",
        "promotion_timestamp",
        "promoting_actor",
        "review_evidence_ref",
      ],
    );

    const promotionDecision = decidePromotionRoute({
      artifact: options.artifact,
      promotionRisk: options.promotionRisk,
      promote: options.promote,
    });
    const candidateId = `hc-${slugify(options.affectedScope || options.task)}-${Date.now()}`;
    const promotionStatus = options.shadow
      ? "observation-only"
      : promotionDecision.route === "owner-correction"
        ? "promoted-by-owner-correction"
        : promotionDecision.route === "review-lane"
          ? "review-routed-awaiting-owner-adoption"
          : "observation-only";
    const promotingActor = options.shadow
      ? "not promoted"
      : promotionDecision.route === "owner-correction"
        ? "front-door-owner"
        : promotionDecision.route === "review-lane"
          ? "review-lane -> front-door-owner"
          : "not promoted";
    const reviewEvidenceRef =
      !options.shadow && promotionDecision.route === "review-lane"
        ? `review://${candidateId}`
        : "not required";

    await appendFile(
      HANDOFF_CANDIDATE_PATH,
      renderHandoffCandidateEntry({
        candidateId,
        sourceWindow: options.timestamp,
        affectedScope: options.affectedScope || "not declared",
        whyNotable: options.whyNotable || normalizeText(options.task),
        recommendedLane:
          promotionDecision.route === "owner-correction" ? "front-door-owner" : promotionDecision.route,
        supportingEvidenceRefs: normalizeCsv(options.supportingEvidenceRefs) || "not declared",
        confidence: options.confidence || "not declared",
        observationSource: options.observationSource || "not declared",
        promotionStatus,
        promotionTimestamp: options.timestamp,
        promotingActor,
        reviewEvidenceRef,
      }),
      "utf8",
    );

    return {
      artifactType: "handoff-candidate",
      artifactId: candidateId,
      artifactPath: HANDOFF_CANDIDATE_PATH,
      promotionRoute: promotionDecision.route,
      promotionReason: promotionDecision.reason,
      promotionStatus,
    };
  }

  throw new Error(`Unsupported artifact type: ${options.artifact}`);
}

async function writePassiveArtifacts({ timestamp, lane, stateDelta, status, openQuestions, artifact }) {
  await mkdir(PASSIVE_DIR, { recursive: true });

  const checkpointContent = await readFile(CHECKPOINT_PATH, "utf8");
  const boundary = normalizeBoundary(extractCheckpointField(checkpointContent, "current_boundary"), artifact);
  const sourceSlice = artifact
    ? "implement-opencode-multiagent-team-v3-slice-2-promotion-pipeline"
    : "implement-opencode-multiagent-team-v3-slice-1";

  const stateEntry = [
    "",
    `### ${timestamp}`,
    `- timestamp: ${timestamp}`,
    `- source_slice: ${sourceSlice}`,
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
  const boundary = normalizeBoundary(extractCheckpointField(checkpointContent, "current_boundary"), options.artifact);

  const { lane, reason } = classifyLane(options);
  const timestamp = new Date().toISOString();
  const passiveArtifact = await writePassiveArtifactRecord({
    ...options,
    timestamp,
  });

  let laneOutput = "shadow-mode: lane execution skipped";
  let ownerOutput = [
    `Boundary: ${boundary}`,
    `Lane used: ${lane}`,
    `Lane reason: ${reason}`,
    "Formal answer: shadow-mode classification only.",
    `Observation-only: ${passiveArtifact?.artifactType === "handoff-candidate" ? `${passiveArtifact.artifactId} recorded` : "none."}`,
    `Unresolved items: ${passiveArtifact?.artifactType === "unresolved-item" ? `${passiveArtifact.artifactId} recorded` : "none."}`,
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
      task:
        passiveArtifact == null
          ? options.task
          : `${options.task}\nPassive artifact request: ${passiveArtifact.artifactType} (${passiveArtifact.artifactId})\nPromotion route: ${passiveArtifact.promotionRoute}\nPromotion rationale: ${passiveArtifact.promotionReason}`,
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

    if (passiveArtifact != null) {
      status = `${status}; ${passiveArtifact.artifactType} recorded`;
      stateDelta = `${stateDelta} Recorded ${passiveArtifact.artifactType} ${passiveArtifact.artifactId} with ${passiveArtifact.promotionRoute} promotion handling.`;
    }
  }

  if (options.shadow && passiveArtifact != null) {
    status = `${status}; ${passiveArtifact.artifactType} recorded`;
    stateDelta = `${stateDelta} Recorded ${passiveArtifact.artifactType} ${passiveArtifact.artifactId} in passive shadow mode.`;
  }

  const persistedBoundary = await writePassiveArtifacts({
    timestamp,
    lane,
    stateDelta,
    status,
    artifact: options.artifact,
    openQuestions: [
      "whether hidden internal subagents should remain deferred after the slice-two promotion pipeline is validated",
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
    artifact: options.artifact || null,
    passiveArtifact,
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
