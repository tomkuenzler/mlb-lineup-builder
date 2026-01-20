import { leagueAverages } from "../constants/leagueAverages";

const average = (values: number[]) =>
  values.length === 0
    ? 0
    : values.reduce((a, b) => a + b, 0) / values.length;

const diff = (value: number, league: number) =>
  value - league;


type Props = {
  players: Player[];
  splitKey: "vsRHP" | "vsLHP";
};

export default function LineupSummary({ 
  players,
  splitKey,
}: Props) {

  if (players.length === 0) return null;

  const splitStats = players
    .map((p) => p.splits?.[splitKey])
    .filter((s): s is NonNullable<typeof s> => s && s.PA >= 100);

  const avg = (values: number[]) =>
    values.length
      ? values.reduce((a, b) => a + b, 0) / values.length
      : 0;

  const splitAVG = avg(splitStats.map((s) => s.AVG));
  const splitOBP = avg(splitStats.map((s) => s.OBP));
  const splitSLG = avg(splitStats.map((s) => s.SLG));
  const splitOPS = splitOBP + splitSLG;
  const splitWRC = avg(splitStats.map((s) => s["wRC+"]));

  const summary = {
    avg: average(players.map((p) => p.AVG)),
    obp: average(players.map((p) => p.OBP)),
    slg: average(players.map((p) => p.SLG)),
    ops: average(players.map((p) => p.OBP + p.SLG)),
    wrc: average(players.map((p) => p["wRC+"])),
    //war: sum(players.map((p) => p["WAR"])),
  };

  const stats = [
    { key: "avg", label: "AVG", decimals: 3 },
    { key: "obp", label: "OBP", decimals: 3 },
    { key: "slg", label: "SLG", decimals: 3 },
    { key: "ops", label: "OPS", decimals: 3 },
    { key: "wrc", label: "wRC+", decimals: 0 },
    //{ key: "war", label: "WAR", decimals: 1 },
  ] as const;

  return (
    <div
      style={{
        marginTop: "16px",
        paddingTop: "12px",
        borderTop: "1px solid rgba(255,255,255,0.25)",
        fontSize: "13px",
      }}
    >
      {/* Headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          fontWeight: 700,
          textAlign: "center",
          marginBottom: "4px",
        }}
      >
        {stats.map((s) => (
          <div key={s.key}>{s.label}</div>
        ))}
      </div>

      {/* Values */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          textAlign: "center",
          marginBottom: "4px",
        }}
      >
        {stats.map((s) => {
          const value = summary[s.key];
          return (
            <div key={s.key}>
              {s.decimals === 0
                ? Math.round(value)
                : value.toFixed(s.decimals).replace(/^0/, "")}
            </div>
          );
        })}
      </div>

      {/* Deltas */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          textAlign: "center",
          opacity: 0.8,
        }}
      >
        {stats.map((s) => {
          const delta = diff(summary[s.key], leagueAverages[s.key]);
          const positive = delta >= 0;

          return (
            <div
              key={s.key}
              style={{
                color: positive ? "#7CFC9A" : "#FF8A8A",
                fontWeight: 600,
              }}
            >
              {positive ? "+" : ""}
              {s.decimals === 0
                ? Math.round(delta)
                : delta.toFixed(3).replace(/^0/, "")}
            </div>
          );
        })}
      </div>

      {splitStats.length > 0 && (
  <div
    style={{
      marginTop: "10px",
      paddingTop: "8px",
      borderTop: "1px solid rgba(255,255,255,0.25)",
      fontSize: "12px",
    }}
  >
    <div
      style={{
        fontWeight: 700,
        marginBottom: "4px",
        opacity: 0.9,
      }}
    >
      {splitKey === "vsRHP" ? "vs RHP (Last 3Y)" : "vs LHP (Last 3Y)"}
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        textAlign: "center",
        gap: "4px",
      }}
    >
      <div>
        <div style={{ opacity: 0.6 }}>AVG</div>
        <div>{splitAVG.toFixed(3).replace(/^0/, "")}</div>
      </div>
      <div>
        <div style={{ opacity: 0.6 }}>OBP</div>
        <div>{splitOBP.toFixed(3).replace(/^0/, "")}</div>
      </div>
      <div>
        <div style={{ opacity: 0.6 }}>SLG</div>
        <div>{splitSLG.toFixed(3).replace(/^0/, "")}</div>
      </div>
      <div>
        <div style={{ opacity: 0.6 }}>OPS</div>
        <div>{splitOPS.toFixed(3).replace(/^0/, "")}</div>
      </div>
      <div>
        <div style={{ opacity: 0.6 }}>wRC+</div>
        <div>{Math.round(splitWRC)}</div>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
