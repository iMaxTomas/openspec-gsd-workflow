## MODIFIED Requirements

### Requirement: Passive pipeline SHALL use a fixed bounded artifact schema
The system SHALL define a stable minimum schema for passive outputs so later implementation can write logs and checkpoints without reopening the planning line.

#### Scenario: Slice two widens passive outputs beyond slice one
- **WHEN** the second local implementation slice is landed
- **THEN** the passive pipeline SHALL continue to write `state-log` and `checkpoint`
- **AND** it SHALL additionally support bounded `unresolved-item` and `handoff-candidate` outputs
- **AND** those additional outputs SHALL remain passive artifacts rather than operator-facing answers

### Requirement: Passive pipeline outputs SHALL stay distinguishable from formal task answers
The system SHALL keep passive pipeline outputs distinguishable from formal owner answers and specialist lane evidence.

#### Scenario: Slice two passive outputs remain non-interfering
- **WHEN** `unresolved-item` or `handoff-candidate` artifacts are written in slice two
- **THEN** they SHALL NOT interrupt the operator-facing thread by default
- **AND** they SHALL remain distinguishable from the current formal owner answer

#### Scenario: Passive outputs preserve lineage for later promotion
- **WHEN** passive artifacts become candidates for later formal adoption
- **THEN** the system SHALL preserve the original observation-only source reference
- **AND** it SHALL preserve the later promotion or correction record
