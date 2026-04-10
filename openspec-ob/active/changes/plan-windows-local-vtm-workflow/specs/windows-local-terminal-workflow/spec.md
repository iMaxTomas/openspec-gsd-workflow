## ADDED Requirements

### Requirement: Windows-local terminal workflow SHALL prefer VTM on the Windows side
The system SHALL define the preferred operator-facing terminal workflow as a Windows-local VTM path rather than a transport-first pattern where VTM is primarily launched from the remote side.

#### Scenario: Preferred path keeps rendering and input local to Windows
- **WHEN** the operator uses the preferred terminal workflow
- **THEN** the workflow SHALL treat Windows as the local rendering and input surface for VTM
- **AND** the remote host SHALL remain a target environment rather than the primary user-interface host

#### Scenario: Preferred path remains distinguishable from transport-first alternatives
- **WHEN** a non-primary transport-first path remains available
- **THEN** the system SHALL keep the Windows-local VTM path distinguishable as the preferred workflow
- **AND** it SHALL NOT treat the transport-first path as equal by default

### Requirement: Windows-local terminal workflow SHALL define WezTerm as a relevant local path
The system SHALL preserve WezTerm as a relevant local terminal emulator path even when it is not the preferred operator-facing workflow.

#### Scenario: WezTerm remains supported without becoming the primary path
- **WHEN** the planning line describes local terminal options on Windows
- **THEN** it SHALL keep WezTerm in the supported local story
- **AND** it SHALL NOT require WezTerm to replace the preferred Windows-local VTM path

#### Scenario: WezTerm parity remains inspectable
- **WHEN** later implementation validates the local terminal setup
- **THEN** the system SHALL keep the WezTerm parity surface inspectable
- **AND** it SHALL define whether the non-primary path still satisfies the required shell, font, and theme expectations
