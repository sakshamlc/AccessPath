AccessPath
A ramp is not access. A journey is.
AccessPath is an accessibility route guidance and improvement simulation prototype for public spaces. It helps visitors understand whether they can reach a service and helps facility managers explore which changes could remove barriers along the journey.
Developed for the Tata Young Social Innovator Challenge, addressing the problem: Public spaces become more usable for people with disabilities.
Prototype status: Demonstrations use sample data, not a completed physical accessibility audit. Simulated outcomes show what the recorded network predicts under selected assumptions. Field measurements and user validation are the next milestones.

The problem
An accessible entrance does not guarantee an accessible destination. A visitor may encounter a locked door, stairs, a narrow connection, or an unavailable lift further along the route.
AccessPath treats accessibility as a connected journey from an entrance to a service, rather than a label attached to a building.
Who it serves
- Wheelchair users and people seeking step-free routes: understand available journeys and recorded barriers.
- Older adults and people with temporary mobility limitations: explore routes suited to their needs.
- Facility managers and accessibility coordinators: investigate barriers and compare proposed improvements.
Core capabilities
Capability	Purpose
Entrance-to-service routing	Evaluate a journey through the recorded network.
Needs presets	Assess routes for selected mobility requirements.
Barrier-aware route evaluation	Account for recorded restrictions such as stairs, closed doors and clearance limits.
Schematic map	Show entrances, destinations, connections and route outcomes.
Explicit uncertainty	Distinguish matching routes, blocked journeys and cases that cannot be verified.
Improvement Simulator	Apply hypothetical changes and compare their effect without overwriting the original audit.
Before-and-after comparison	Explain how a selected intervention changes the route outcome.
Evidence brief	Support discussion of recorded barriers, proposed actions and responsible owners.


The schematic map is not live GPS navigation. Route results depend on the completeness, accuracy and freshness of the underlying records.
Example: one door change, a reachable office
The demonstration compares a restricted West Side Entrance door with a simulated authorised opening.
Scenario	Input	Demonstrated outcome
Before	Door recorded as closed/restricted	No matching route to the Administration Office in the recorded network.
After	Door simulated open with a 950 mm clearance	A 41 m step-free route is calculated, with a 900 mm minimum route clearance.


These figures describe the demo scenario, not measured impact at a real facility. “Verified” in the prototype refers to checks against recorded demo attributes; it does not establish real-world accessibility or regulatory compliance.
The simulator helps a manager ask: “Would this proposed change make the destination reachable under the selected requirements?” It does not physically unlock a door or implement an improvement.
How it works
1. Represent locations as nodes and connections as edges.
2. Associate connections with recorded attributes and barriers.
3. Evaluate connections against the selected user requirements.
4. Calculate a matching route, identify a blocked journey, or flag insufficient evidence.
5. Apply proposed changes in a separate simulation scenario.
6. Compare the baseline with the simulated outcome.
Route decisions should be grounded in recorded attributes and explicit rules. Missing evidence must remain visible rather than being treated as proof of accessibility.
Run locally
Requirements
- Git
- A Node.js version compatible with the dependencies in package.json
- npm
Setup
Clone your AccessPath repository using its GitHub URL, then open a terminal in the project folder:
cd AccessPath
npm install
npm run dev
Open the local URL printed by the development server. Keep the terminal running while using the application. Press Ctrl + C to stop it.
If the repository contains an environment example file, follow its instructions and supply the required values locally. Never commit real API keys or passwords.
Dependency troubleshooting
If installation reports the specific conflict between vite@8.3.4 and a root esbuild@^0.25.0 dependency, align esbuild with the compatible range reported by npm:
npm install --save-dev esbuild@^0.28.0
npm run dev
Commit the resulting package.json and lockfile together so collaborators receive the same dependency fix.
To list the scripts actually available in your checkout:
npm run
Suggested demo walkthrough
1. Open the route guidance view and select a mobility preset.
2. Choose an entrance and destination.
3. Inspect the route outcome and recorded barrier details.
4. Open the Improvement Simulator.
5. Compare the restricted-door baseline with the simulated open-door scenario.
6. Explain the resulting route and the assumptions behind it.
7. Return to the baseline to show that the original record is preserved.
Pilot and validation plan
The proposed pilot covers one wing or floor with approximately 15–25 locations.
- Record connections, relevant measurements and access restrictions.
- Review journeys with a person with a mobility limitation.
- Compare route predictions with observed conditions.
- Check blocked connections and missing-data cases.
- Review proposed improvements with facility staff and identify owners.
- Update records after an improvement has been implemented and checked.
These are planned activities, not completed results.
Current limitations
- Sample records do not establish actual conditions at a facility.
- Changing conditions, such as a newly locked door or failed lift, require updated records.
- A route result cannot capture every individual's access requirements.
- Simulating an improvement does not confirm its construction feasibility, cost or approval.
- This prototype does not provide accessibility certification or emergency evacuation guidance.
Project information
Project: AccessPath
Challenge: Tata Young Social Innovator Challenge
Focus: Public-space accessibility, connected journeys and improvement planning
Stage: Prototype; field validation planned
