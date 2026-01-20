export default function CompareLineups() {
  const [leftId, setLeftId] = useState<string>("");
  const [rightId, setRightId] = useState<string>("");

  const saved = JSON.parse(
    localStorage.getItem("mlb-lineup-scenarios") ?? "[]"
  );

  const left = saved.find((s) => s.id === leftId);
  const right = saved.find((s) => s.id === rightId);

  return (
    <div style={{ padding: "24px" }}>
      <h2>Compare Lineups</h2>

      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        <select value={leftId} onChange={(e) => setLeftId(e.target.value)}>
          <option value="">Select lineup A</option>
          {saved.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <select value={rightId} onChange={(e) => setRightId(e.target.value)}>
          <option value="">Select lineup B</option>
          {saved.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {left && right && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "32px",
          }}
        >
          {[left, right].map((scenario) => (
            <div key={scenario.id}>
              <h3 style={{ textAlign: "center" }}>{scenario.name}</h3>

              <LineupColumn
                title="vs RHP"
                lineupSlots={scenario.state.lineupSlotsRHP}
                lineupPlayers={scenario.state.lineupPlayersRHP}
                readOnly?: boolean;
                if (readOnly) return;
              />

              <LineupColumn
                title="vs LHP"
                lineupSlots={scenario.state.lineupSlotsLHP}
                lineupPlayers={scenario.state.lineupPlayersLHP}
                readOnly?: boolean;
                if (readOnly) return;
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}