type Props = {
  lineupSlots: LineupSlotType[];
  lineupPlayers: Record<number, Player>;

  // builder-only (optional)
  onAssign?: (order: number) => void;
  onUnassign?: (order: number) => void;
  onChangePosition?: (order: number, position: string) => void;
  onSelectPosition?: (order: number) => void;
  selectedPositionOrder?: number | null;

  readOnly?: boolean;
};

export default function LineupView({
  lineupSlots,
  lineupPlayers,
  onUnassign,
  onSelectPosition,
  selectedPositionOrder,
  readOnly = false,
}: Props) {
  return (
    <div>
      {lineupSlots.map((slot) => {
        const player = lineupPlayers[slot.order];
        const selected = selectedPositionOrder === slot.order;

        return (
          <div
            key={slot.order}
            onClick={() =>
              !readOnly && onSelectPosition?.(slot.order)
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 0",
              cursor: readOnly ? "default" : "pointer",
              background: selected
                ? "rgba(255,255,255,0.08)"
                : "transparent",
            }}
          >
            <div style={{ width: "20px" }}>{slot.order}</div>
            <div style={{ width: "36px", fontWeight: 600 }}>
              {slot.position}
            </div>

            <div style={{ flex: 1 }}>
              {player ? player.Name : <em>Empty</em>}
            </div>

            {!readOnly && player && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUnassign?.(slot.order);
                }}
              >
                ✕
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
