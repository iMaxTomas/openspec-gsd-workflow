## ADDED Requirements

### Requirement: PowerShell 7 SHALL define the shell integration surface
The system SHALL define PowerShell 7, invoked as `pwsh`, as the shell integration surface for the Windows-local terminal workflow.

#### Scenario: Preferred workflow launches the intended shell surface
- **WHEN** the preferred Windows-local workflow initializes its shell environment
- **THEN** it SHALL target PowerShell 7 through the `pwsh` invocation surface
- **AND** it SHALL keep that shell choice inspectable from later implementation evidence

#### Scenario: Shell integration remains bounded
- **WHEN** the planning line defines shell behavior
- **THEN** it SHALL keep the shell integration boundary limited to the PowerShell 7 surface
- **AND** it SHALL NOT widen into unrelated shell variants by default

### Requirement: Terminal personalization SHALL remain bounded and inspectable
The system SHALL define terminal and shell personalization as a bounded configuration surface rather than an ad hoc set of appearance changes.

#### Scenario: Personalization remains attributable
- **WHEN** later implementation adds terminal or shell appearance changes
- **THEN** the system SHALL keep those changes attributable to a defined personalization surface
- **AND** the operator SHALL be able to distinguish baseline behavior from personalized behavior

#### Scenario: Personalization remains compatible across local paths
- **WHEN** personalization is applied to the preferred VTM path and the still-relevant WezTerm path
- **THEN** the system SHALL define compatibility expectations for both paths
- **AND** it SHALL NOT allow personalization to invalidate the supported non-primary path by accident

### Requirement: Maple Mono SHALL define the default font baseline
The system SHALL define Maple Mono as the default font baseline for the Windows-local terminal workflow.

#### Scenario: Preferred path uses Maple Mono as baseline
- **WHEN** the local terminal workflow applies its font configuration
- **THEN** it SHALL use Maple Mono as the default baseline font
- **AND** later implementation evidence SHALL be able to show where that baseline is applied

#### Scenario: Font baseline remains compatible with personalization
- **WHEN** additional appearance personalization is introduced later
- **THEN** the system SHALL preserve Maple Mono as the baseline font decision
- **AND** it SHALL treat other appearance changes as bounded personalization rather than font-baseline drift
