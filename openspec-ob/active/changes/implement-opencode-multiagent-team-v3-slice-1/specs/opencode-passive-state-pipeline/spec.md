## MODIFIED Requirements

### Requirement: Passive pipeline SHALL use a fixed bounded artifact schema
The system SHALL define a stable minimum schema for passive outputs so later implementation can write logs and checkpoints without reopening the planning line.

#### Scenario: Slice one limits passive outputs to state log and checkpoint
- **WHEN** the first local implementation slice is landed
- **THEN** the passive pipeline SHALL write `state-log` and `checkpoint` outputs only
- **AND** `unresolved-item` and `handoff-candidate` outputs SHALL remain deferred beyond slice one

### Requirement: Passive pipeline cadence SHALL remain bounded and non-interrupting
The system SHALL limit passive state generation to bounded execution points so the passive path does not become a chatty hidden participant.

#### Scenario: Slice one passive output stays non-interfering
- **WHEN** slice one passive logging/checkpoint wiring runs
- **THEN** it SHALL NOT interrupt the operator-facing thread by default
- **AND** it SHALL keep passive output distinguishable from formal owner answers
