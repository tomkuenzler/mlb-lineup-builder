import LineupSlot from "./LineupSlot";
import LineupSummary from "./LineupSummary";

type LineupSlotType = {
  order: number;
  position: string;
};

const defaultLineup: LineupSlotType[] = [
  { order: 1, position: "1B" },
  { order: 2, position: "2B" },
  { order: 3, position: "3B" },
  { order: 4, position: "SS" },
  { order: 5, position: "LF" },
  { order: 6, position: "CF" },
  { order: 7, position: "RF" },
  { order: 8, position: "C" },
  { order: 9, position: "DH" },
];

type LineupColumnProps = {
  title: string;
  lineupSlots: { order: number; position: string }[];
  lineupPlayers: Record<number, Player>;
  onAssign: (order: number) => void;
  onUnassign: (order: number) => void;
  onChangePosition: (order: number, position: string) => void;
  selectedPositionOrder: number | null;
  onSelectPosition: (order: number) => void;
  benchPlayers: (Player | null)[];
  onAssignBench: (index: number) => void;
  onUnassignBench: (index: number) => void;
};


export default function LineupColumn({
  title,
  lineupSlots,
  lineupPlayers,
  onAssign,
  onUnassign,
  onChangePosition,
  selectedPositionOrder,
  onSelectPosition,
  benchPlayers,
  onAssignBench,
  onUnassignBench,
}: LineupColumnProps) {

  const splitKey: "vsRHP" | "vsLHP" =
    title === "vs RHP" ? "vsRHP" : "vsLHP";

  return (
    <div
      style={{
        background: "#1e5c93",
        color: "white",
        borderRadius: "12px",
        padding: "12px",
      }}
    >
      <div
        style={{
          fontSize: "18px",
          fontWeight: 700,
          textAlign: "center",
          marginBottom: "8px",
        }}
      >
        {title}
      </div>

      {/* Starting Lineup */}
      {lineupSlots.map((slot) => (
        <LineupSlot
          key={slot.order}
          order={slot.order}
          position={slot.position}
          player={lineupPlayers[slot.order]}
          onAssign={onAssign}
          onUnassign={onUnassign}
          onChangePosition={onChangePosition}
          isPositionSelected={selectedPositionOrder === slot.order}
          onSelectPosition={onSelectPosition}
          splitKey={splitKey}
        />
      ))}

      {/* Bench */}
      <div
        style={{
          marginTop: "14px",
          paddingTop: "10px",
          borderTop: "1px solid rgba(255,255,255,0.25)",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            fontWeight: 700,
            opacity: 0.85,
            marginBottom: "8px",
            textAlign: "center",
          }}
        >
          Bench
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "8px",
          }}
        >
          {benchPlayers.map((player, i) => (
            <div
              key={i}
              onClick={() =>
                player ? onUnassignBench(i) : onAssignBench(i)
              }
              style={{
                height: "58px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              {player ? player.Name : "Bench"}
            </div>
          ))}
        </div>
      </div>

      <LineupSummary
        players={Object.values(lineupPlayers).filter(Boolean)}
        splitKey={splitKey}
      />
    </div>
  );
}
