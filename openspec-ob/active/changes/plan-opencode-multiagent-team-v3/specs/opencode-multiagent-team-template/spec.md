## ADDED Requirements

### Requirement: OpenCode multiagent team SHALL expose one front-door owner
The system SHALL define one operator-visible front-door owner for the local OpenCode multiagent team. The front-door owner SHALL receive the task, restate the current boundary, decide whether specialist help is needed, integrate returned evidence, and provide the final bounded answer.

#### Scenario: Front-door owner remains the only closure point
- **WHEN** a local OpenCode task uses one or more specialist lanes
- **THEN** the front-door owner SHALL remain the only operator-visible closure point
- **AND** the returned answer SHALL be integrated into one bounded response instead of multiple peer conclusions

#### Scenario: Specialist outputs return as evidence, not as ownership transfer
- **WHEN** a specialist lane completes a delegated task
- **THEN** the system SHALL treat that result as evidence returned to the front-door owner
- **AND** it SHALL NOT treat the specialist lane as a replacement owner by default

### Requirement: Front-door owner SHALL follow an explicit closure contract
The system SHALL require the front-door owner to make boundary, lane usage, and answer classification inspectable at the operator surface.

#### Scenario: Owner restates the bounded slice
- **WHEN** the front-door owner accepts a local OpenCode task
- **THEN** it SHALL restate the current bounded scope before lane delegation or final closure
- **AND** the restated boundary SHALL remain inspectable from the saved record

#### Scenario: Owner distinguishes formal answer from observation-only material
- **WHEN** the front-door owner returns a bounded answer
- **THEN** it SHALL keep the formal answer distinguishable from `observation-only` material and unresolved items
- **AND** specialist evidence SHALL remain attributable to the lane that produced it

### Requirement: Specialist roles SHALL be modeled as on-demand lanes
The system SHALL model retained specialists as on-demand lanes for execution, research, and review rather than as permanent operator-visible peer brains.

#### Scenario: Research work uses the research lane
- **WHEN** the task is exploration, comparison, code reading, document lookup, or inspection work
- **THEN** the system SHALL classify that work as research-lane eligible
- **AND** the main owner SHALL keep final integration authority

#### Scenario: Shared ownership does not emerge from lane labels
- **WHEN** lane labels such as execution, research, or review are defined
- **THEN** the system SHALL treat those labels as bounded helper roles
- **AND** it SHALL NOT infer equal owner authority from the presence of multiple lanes

### Requirement: Model bindings SHALL remain transitional
The system SHALL keep current model-to-role bindings as transitional appendix material rather than as permanent architectural truth.

#### Scenario: Model refresh keeps the team shape stable
- **WHEN** a future implementation changes the current model mapped to the front-door owner or any specialist lane
- **THEN** the team shape SHALL remain defined by owner, lane, and gate responsibilities
- **AND** the architecture SHALL NOT require a rewrite solely because the model binding changed
