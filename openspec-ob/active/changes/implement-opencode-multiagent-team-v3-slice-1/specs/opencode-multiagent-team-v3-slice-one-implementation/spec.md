## ADDED Requirements

### Requirement: Slice one SHALL implement one custom primary front-door owner
The system SHALL implement the first local landing with one custom primary front-door owner that remains the only operator-visible closure point.

#### Scenario: Custom primary owner closes a delegated slice
- **WHEN** one local OpenCode task uses one or more retained lanes in slice one
- **THEN** the custom primary owner SHALL remain the only operator-visible closure point
- **AND** lane results SHALL return as evidence rather than as peer conclusions

### Requirement: Slice one SHALL keep retained lanes visible
The system SHALL keep execution, research, and review as visible retained lanes during the first local landing.

#### Scenario: First local landing exposes retained lanes
- **WHEN** slice one is implemented
- **THEN** execution, research, and review SHALL remain visible retained lanes
- **AND** the system SHALL NOT require hidden internal subagents for the first landing

### Requirement: Slice one SHALL enforce the frozen hard-gate matrix
The system SHALL implement the research, execution, and review routing gates from the v3 planning line during the first local landing.

#### Scenario: Read-heavy slice routes to research
- **WHEN** a local slice is read-heavy and has no frozen bounded write target
- **THEN** the system SHALL route it through the research lane in slice one

#### Scenario: Bounded write slice routes to execution
- **WHEN** a local slice has a declared bounded write target and inspectable allowed write surface
- **THEN** the system SHALL route it through the execution lane in slice one
