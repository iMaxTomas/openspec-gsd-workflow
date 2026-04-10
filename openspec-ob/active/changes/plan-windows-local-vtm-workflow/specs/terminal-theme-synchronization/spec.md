## ADDED Requirements

### Requirement: Shell and terminal emulator SHALL synchronize light and dark theme state
The system SHALL define synchronized light and dark behavior between shell semantic color state and terminal appearance state for the Windows-local workflow.

#### Scenario: Light mode stays synchronized
- **WHEN** the workflow enters its light-mode state
- **THEN** the shell semantic color state and terminal appearance state SHALL represent the same light-mode intent
- **AND** the operator SHALL NOT need to manually reconcile conflicting shell and terminal themes

#### Scenario: Dark mode stays synchronized
- **WHEN** the workflow enters its dark-mode state
- **THEN** the shell semantic color state and terminal appearance state SHALL represent the same dark-mode intent
- **AND** the operator SHALL NOT need to manually reconcile conflicting shell and terminal themes

### Requirement: Theme synchronization SHALL remain inspectable across supported local paths
The system SHALL keep theme synchronization inspectable for both the preferred Windows-local VTM path and the still-relevant WezTerm path.

#### Scenario: Preferred VTM path exposes synchronized state
- **WHEN** later implementation validates theme behavior on the preferred VTM path
- **THEN** the system SHALL be able to show the synchronized shell and terminal state for that path
- **AND** the validation surface SHALL distinguish synchronized behavior from unsynchronized fallback behavior

#### Scenario: WezTerm path keeps parity expectations visible
- **WHEN** later implementation validates the WezTerm path
- **THEN** the system SHALL keep theme parity expectations visible for that path
- **AND** it SHALL record whether the non-primary path still satisfies synchronized light and dark behavior

### Requirement: Synchronized themes SHALL satisfy baseline readability constraints
The system SHALL define baseline readability, contrast, and usability expectations for synchronized light and dark themes.

#### Scenario: Readability constraints apply to light mode
- **WHEN** the workflow uses synchronized light mode
- **THEN** the shell and terminal presentation SHALL satisfy the defined readability and contrast expectations
- **AND** later implementation SHALL be able to validate those expectations

#### Scenario: Readability constraints apply to dark mode
- **WHEN** the workflow uses synchronized dark mode
- **THEN** the shell and terminal presentation SHALL satisfy the defined readability and contrast expectations
- **AND** later implementation SHALL be able to validate those expectations
