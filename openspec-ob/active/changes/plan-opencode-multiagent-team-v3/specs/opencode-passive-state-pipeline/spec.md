## ADDED Requirements

### Requirement: Passive state handling SHALL remain a non-interfering pipeline
The system SHALL model passive state handling as a pipeline that reads evidence and writes bounded artifacts. The passive path SHALL NOT behave as a hidden operator-facing team or a second orchestration owner.

#### Scenario: Passive path reads evidence and writes bounded artifacts
- **WHEN** the passive state path runs after local OpenCode work
- **THEN** it SHALL read saved evidence inputs only
- **AND** it SHALL write only bounded artifacts such as logs, checkpoints, unresolved items, or handoff candidates

#### Scenario: Passive path does not interrupt the main thread
- **WHEN** the passive state path produces a checkpoint or synthesized status
- **THEN** it SHALL NOT interrupt the operator-facing conversation by default
- **AND** it SHALL NOT seize routing or decision authority from the front-door owner

### Requirement: Passive pipeline SHALL use a fixed bounded artifact schema
The system SHALL define a stable minimum schema for passive outputs so later implementation can write logs and checkpoints without reopening the planning line.

#### Scenario: State log is written
- **WHEN** the passive pipeline records a chronological state update
- **THEN** the `state-log` artifact SHALL include `timestamp`, `source_slice`, `lane_path`, `state_delta`, and `risk_flag`

#### Scenario: Checkpoint is written
- **WHEN** the passive pipeline records a resumable checkpoint
- **THEN** the `checkpoint` artifact SHALL include `timestamp`, `current_boundary`, `active_owner`, `active_or_last_lane`, `current_status`, and `open_questions`

#### Scenario: Unresolved item is written
- **WHEN** the passive pipeline records an issue that persists across slices
- **THEN** the `unresolved-item` artifact SHALL include `item_id`, `first_seen`, `current_status`, `affected_scope`, `blocking_reason`, and `next_needed_step`

#### Scenario: Handoff candidate is written
- **WHEN** the passive pipeline records a bounded candidate for later specialist or owner follow-up
- **THEN** the `handoff-candidate` artifact SHALL include `candidate_id`, `source_window`, `affected_scope`, `why_notable`, `recommended_lane`, `supporting_evidence_refs`, and `confidence`

### Requirement: Passive pipeline outputs SHALL stay distinguishable from formal task answers
The system SHALL keep passive pipeline outputs distinguishable from formal owner answers and specialist lane evidence.

#### Scenario: Checkpoint output stays separate from the current bounded answer
- **WHEN** a checkpoint or handoff candidate is produced
- **THEN** the system SHALL classify it as passive state output rather than as the formal answer for the current task
- **AND** later reuse SHALL be able to distinguish passive state from the main task conclusion

### Requirement: Passive pipeline cadence SHALL remain bounded and non-interrupting
The system SHALL limit passive state generation to bounded execution points so the passive path does not become a chatty hidden participant.

#### Scenario: Passive pipeline runs on bounded cadence
- **WHEN** the system runs passive state handling for a local OpenCode line
- **THEN** it SHALL run only on window close, explicit status request, or bounded replay points
- **AND** it SHALL NOT emit operator-visible interruption by default
