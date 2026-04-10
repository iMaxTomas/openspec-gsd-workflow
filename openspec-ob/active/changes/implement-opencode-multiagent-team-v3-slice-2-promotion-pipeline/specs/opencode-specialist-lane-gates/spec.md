## MODIFIED Requirements

### Requirement: Observation-only promotion SHALL follow a preserved-lineage workflow
The system SHALL move `observation-only` material into the formal line only through a candidate, review-or-correction, and promotion workflow that preserves lineage.

#### Scenario: Slice two owner correction promotes low-risk observation-only material
- **WHEN** a bounded low-risk `observation-only` result is captured as a handoff candidate in slice two
- **THEN** the front-door owner MAY perform an explicit correction step without hidden subagents
- **AND** the saved record SHALL include the original observation-only source, promotion timestamp, and promoting actor

#### Scenario: Slice two review-lane promotion handles high-risk material
- **WHEN** a captured `observation-only` result affects architecture, governance, lane identity, or other high-risk scope
- **THEN** the system SHALL route the promotion decision through the review lane
- **AND** the promoted record SHALL retain the candidate lineage and review-lane evidence reference

#### Scenario: Unresolved observation remains durable without silent promotion
- **WHEN** a candidate cannot yet be promoted into the formal line
- **THEN** the system SHALL preserve it as an `unresolved-item` or `handoff-candidate`
- **AND** it SHALL NOT silently rewrite the current formal conclusion
