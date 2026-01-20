import { useEffect, useState } from "react";
import LineupColumn from "../components/LineupColumn";

type SavedScenario = {
  id: string;
  name: string;
  createdAt: number;
  state: {
    lineupPlayersRHP: Record<number, Player>;
    lineupPlayersLHP: Record<number, Player>;
    lineupSlotsRHP: any[];
    lineupSlotsLHP: any[];
    benchPlayersRHP: (Player | null)[];
    benchPlayersLHP: (Player | null)[];
  };
};

export default function CompareLineups() {
  const [allScenarios, setAllScenarios] = useState<SavedScenario[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Load all saved lineups (across all teams)
  useEffect(() => {
    const raw = localStorage.getItem("mlb-lineup-scenarios");
    if (!raw) return;

    const allTeams = JSON.parse(raw);
    const flattened: SavedScenario[] = Object.values(allTeams).flat();
    setAllScenarios(flattened);
  }, []);

  function toggleScenario(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  }

  const selectedScenarios = allScenarios.filter((s) =>
    selectedIds.includes(s.id)
  );

  return (
    <div
      style={{
        maxWidth: "2600px",
        margin: "0 auto",
        padding: "24px 32px",
      }}
    >
      <h1 style={{ marginBottom: "16px" }}>Compare Lineups</h1>

      {/* Selector */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "24px",
        }}
      >
        {allScenarios.map((s) => {
          const active = selectedIds.includes(s.id);

          return (
            <button
              key={s.id}
              onClick={() => toggleScenario(s.id)}
              style={{
                padding: "6px 10px",
                borderRadius: "6px",
                border: active ? "1px solid #7CFC9A" : "1px solid #444",
                background: active
                  ? "rgba(124,252,154,0.15)"
                  : "transparent",
                color: "inherit",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              {s.name}
            </button>
          );
        })}
      </div>

      {selectedScenarios.length === 0 && (
        <div style={{ opacity: 0.7 }}>
          Select one or more saved lineups to compare.
        </div>
      )}

      {/* Comparison Grid */}
      {selectedScenarios.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${selectedScenarios.length}, 1fr)`,
            alignItems: "flex-start",
          }}
        >
          {selectedScenarios.map((scenario) => {
            const s = scenario.state;

            return (
              <div
                key={scenario.id}
                style={{
                  transform: "scale(0.9)",
                  transformOrigin: "top center",
                }}
              >
                <h3
                  style={{
                    textAlign: "center",
                    marginBottom: "12px",
                  }}
                >
                  {scenario.name}
                </h3>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "24px",
                  }}
                >
                  <LineupColumn
                    title="vs RHP"
                    lineupSlots={s.lineupSlotsRHP}
                    lineupPlayers={s.lineupPlayersRHP}
                    benchPlayers={s.benchPlayersRHP}
                    onAssign={() => {}}
                    onUnassign={() => {}}
                    onChangePosition={() => {}}
                    onSelectPosition={() => {}}
                    selectedPositionOrder={null}
                    onAssignBench={() => {}}
                    onUnassignBench={() => {}}
                  />

                  <LineupColumn
                    title="vs LHP"
                    lineupSlots={s.lineupSlotsLHP}
                    lineupPlayers={s.lineupPlayersLHP}
                    benchPlayers={s.benchPlayersLHP}
                    onAssign={() => {}}
                    onUnassign={() => {}}
                    onChangePosition={() => {}}
                    onSelectPosition={() => {}}
                    selectedPositionOrder={null}
                    onAssignBench={() => {}}
                    onUnassignBench={() => {}}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
