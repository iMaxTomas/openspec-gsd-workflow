## ADDED Requirements

### Requirement: OpenCode routing SHALL follow a fixed hard gate matrix
The system SHALL route local OpenCode multiagent work by explicit hard gates rather than by free-form role preference or model prestige.

#### Scenario: Read-heavy work enters the research lane
- **WHEN** the task is read-heavy, discovery-heavy, comparison-heavy, or inspection-heavy
- **THEN** the system SHALL prefer the research lane
- **AND** it SHALL NOT escalate to execution or review by default

#### Scenario: Bounded write work enters the execution lane
- **WHEN** the task has a clear write boundary or a clear bounded implementation scope
- **THEN** the system SHALL prefer the execution lane
- **AND** the task SHALL identify the write boundary before execution starts

#### Scenario: High-risk or disagreement work enters the review lane
- **WHEN** the task is high-risk, high-cost, final-judgment, or contains materially conflicting prior results
- **THEN** the system SHALL prefer the review lane
- **AND** the review output SHALL return as evidence to the front-door owner

### Requirement: Hard gate thresholds SHALL remain inspectable
The system SHALL define threshold meanings for research, execution, and review routing so lane selection can be audited later.

#### Scenario: Research threshold is met
- **WHEN** the slice is primarily read-heavy, comparison-heavy, lookup-heavy, or inspection-heavy
- **AND** no frozen bounded write target exists yet
- **THEN** the system SHALL classify the slice as research-lane eligible

#### Scenario: Execution threshold is met
- **WHEN** the slice has a declared bounded write target and inspectable allowed write surface
- **AND** no-go boundaries were stated before write work starts
- **THEN** the system SHALL classify the slice as execution-lane eligible

#### Scenario: Review threshold is met
- **WHEN** the slice may affect architecture, topology, auth, governance, lane identity, or other cross-slice invariants
- **OR** the slice would consume a scarce or expensive reviewer path for more than commodity first-pass work
- **OR** the returned evidence implies materially conflicting bounded conclusions
- **THEN** the system SHALL classify the slice as review-lane eligible

### Requirement: Slice-external results SHALL remain observation-only until explicitly promoted
The system SHALL classify slice-external or later ad hoc session results as `observation-only` until a later explicit correction or promotion step incorporates them into the current formal line.

#### Scenario: External observation does not silently rewrite the current line
- **WHEN** a result is generated outside the frozen local slice or outside the declared lane path
- **THEN** the system SHALL record it as `observation-only`
- **AND** it SHALL NOT silently rewrite the current formal conclusion

#### Scenario: Promotion requires an explicit correction step
- **WHEN** the operator or later planning slice wants to adopt an `observation-only` result into the formal line
- **THEN** the system SHALL require an explicit correction or promotion step
- **AND** the earlier status boundary SHALL remain inspectable from the saved record

### Requirement: Observation-only promotion SHALL follow a preserved-lineage workflow
The system SHALL move `observation-only` material into the formal line only through a candidate, review-or-correction, and promotion workflow that preserves lineage.

#### Scenario: High-risk observation-only result requires review before promotion
- **WHEN** an `observation-only` result affects a high-risk or materially conflicting area
- **THEN** the system SHALL require a review-lane step before promotion
- **AND** the promoted record SHALL retain the original `observation-only` source reference

#### Scenario: Low-risk observation-only result may use owner correction
- **WHEN** an `observation-only` result stays inside a bounded low-risk local correction scope
- **THEN** the front-door owner MAY promote it through an explicit correction step
- **AND** the saved record SHALL include the promotion timestamp and promoting actor
