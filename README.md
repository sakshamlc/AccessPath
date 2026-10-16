# AccessPath
### A ramp is not access. A journey is.

**Accessibility route guidance and improvement simulation for public spaces.**

AccessPath helps visitors explore whether they can reach a service based on recorded accessibility information. It helps facility managers identify barriers and compare how proposed improvements could change those journeys.

Developed for the **Tata Young Social Innovator Challenge**, addressing the problem:

> **Public spaces become more usable for people with disabilities.**

[Explore the Repository](https://github.com/sakshamlc/AccessPath) · [Report an Issue](https://github.com/sakshamlc/AccessPath/issues)

> **Prototype status:** Demonstrations use sample data, not a completed physical accessibility audit. Route results and simulated outcomes depend on recorded attributes and selected assumptions. Field measurements and user validation are planned.

---

## Why AccessPath?

An accessible entrance does not guarantee an accessible destination.

A visitor may enter a building and still encounter a locked door, stairs, a narrow passage or an unavailable lift before reaching the required service.

AccessPath treats accessibility as a **connected entrance-to-service journey**. It brings route evaluation and improvement planning into one workflow:

- **For visitors:** Which journey meets my selected mobility requirements?
- **For managers:** Which proposed change could make a destination reachable?
- **For both:** What evidence supports the result, and what remains unknown?

## Who It Serves

| User | Purpose |
|---|---|
| Wheelchair users | Explore journeys against selected clearance and step-free requirements. |
| Older adults and people with temporary mobility limitations | Find routes suited to their selected needs. |
| Facility managers | Investigate barriers and compare proposed interventions. |
| Accessibility coordinators | Review recorded evidence, missing information and action owners. |

## Core Capabilities

| Capability | What it does |
|---|---|
| **Entrance-to-service routing** | Evaluates connected paths between a selected entrance and destination. |
| **Mobility presets** | Checks routes against selected mobility requirements. |
| **Barrier-aware evaluation** | Accounts for recorded stairs, door restrictions, clearance limits and other connection attributes. |
| **Schematic map** | Displays locations, connections, barriers and route outcomes. |
| **Explicit uncertainty** | Keeps missing evidence visible instead of assuming accessibility. |
| **Improvement Simulator** | Applies hypothetical changes in a separate scenario while preserving the baseline records. |
| **Before-and-after comparison** | Shows how a proposed intervention changes the calculated journey. |
| **Evidence brief** | Summarises recorded barriers, proposed actions and responsible owners. |

### Understanding Route Outcomes

| Outcome | Meaning |
|---|---|
| **Meets recorded requirements** | A route matches the selected requirements using the available records. |
| **Blocked** | Recorded barriers prevent a matching journey through the evaluated network. |
| **Cannot verify** | Available evidence is insufficient to confirm a matching journey. |

If the interface uses **“Verified,”** it means checked against recorded prototype attributes. It does **not** establish real-world accessibility or regulatory compliance.

The schematic map is **not live GPS navigation**.

## Demo: One Door Change, a Reachable Office

The demonstration compares a restricted West Side Entrance door with a simulated authorised opening.

| Scenario | Door condition | Calculated outcome |
|---|---|---|
| **Baseline** | Recorded as closed/restricted | No matching route to the Administration Office in the recorded network. |
| **Simulation** | Modelled as open with 950 mm clearance | A 41 m step-free route, with a minimum route clearance of 900 mm. |

The route’s minimum clearance is determined by its narrowest recorded connection, which may differ from the modified door’s clearance.

**These figures describe a sample scenario, not measured impact at a real facility.**

The simulator answers:

> “Would this proposed change make the destination reachable under the selected requirements?”

It does not physically unlock doors, approve construction or implement improvements.

## How It Works

1. **Model the space:** Represent entrances, junctions and destinations as nodes, with connections as edges.
2. **Attach evidence:** Record relevant connection attributes, measurements and restrictions.
3. **Apply requirements:** Evaluate connections against the selected mobility needs.
4. **Evaluate the journey:** Calculate a matching route, identify recorded barriers or flag insufficient evidence.
5. **Simulate a change:** Modify selected attributes in a separate scenario.
6. **Compare outcomes:** Review the baseline and simulated result without overwriting the original records.

Route decisions should follow **explicit rules and recorded attributes**. Missing measurements must remain unknown rather than being treated as proof of accessibility.

## Run Locally

### Requirements

- Git
- Node.js compatible with the repository’s dependencies
- npm

### Installation

```bash
git clone https://github.com/sakshamlc/AccessPath.git
cd AccessPath
npm install
npm run dev
```

Open the local URL printed in the terminal.

Keep the development server running while using the application. Press `Ctrl + C` to stop it.

If an environment example file is included, follow its instructions and supply the required values locally. Never commit API keys, passwords or other secrets.

### Available Commands

To see the scripts supported by your checkout:

```bash
npm run
```

For installation errors, check the versions and dependency requirements in `package.json` and the lockfile. Commit dependency changes and the updated lockfile together.

## Suggested Demo Walkthrough

1. Open route guidance and select a mobility preset.
2. Choose an entrance and destination.
3. Inspect the calculated outcome and recorded barrier details.
4. Open the **Improvement Simulator**.
5. Compare the restricted-door baseline with the simulated open-door scenario.
6. Explain the resulting route, clearance and assumptions.
7. Return to the baseline to demonstrate that the original records are preserved.

During the demonstration, distinguish **recorded facts**, **missing evidence** and **hypothetical changes**.

## Pilot and Validation Plan

The proposed pilot covers **one wing or floor with approximately 15–25 locations**.

Planned activities:

- Record connections, relevant measurements and access restrictions.
- Review journeys with a person with a mobility limitation.
- Compare calculated routes with observed conditions.
- Test blocked journeys and missing-data cases.
- Review proposed improvements with facility staff and identify action owners.
- Update records after an improvement has been implemented and checked.

**These are planned activities, not completed results.**

## Current Limitations

- Sample records do not establish actual conditions at a facility.
- Results depend on the completeness, accuracy and freshness of the records.
- Changes such as locked doors or lift failures require updated information.
- Selected presets cannot capture every individual’s access requirements.
- Simulations do not establish construction feasibility, cost or approval.
- The prototype does not provide accessibility certification or emergency evacuation guidance.

## Feedback and Contributions

Feedback on route logic, accessibility, usability and evidence handling is welcome.

When reporting an issue, include:

- The entrance, destination and mobility requirements selected.
- The recorded conditions or simulation changes involved.
- The expected result and actual behaviour.
- A screenshot or reproduction steps, where helpful.

Please avoid including personal or sensitive information in public issues.

## Project Information

| Field | Details |
|---|---|
| **Project** | AccessPath |
| **Problem focus** | Making public spaces more usable for people with disabilities |
| **Approach** | Connected journey evaluation and improvement simulation |
| **Current stage** | Prototype using sample data |
| **Next milestone** | Field measurements and user validation |

---

**AccessPath — A ramp is not access. A journey is.**
