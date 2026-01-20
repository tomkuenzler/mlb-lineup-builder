import { formatRate, formatPercent } from '../utils/formatters';

const statGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "140px 1fr 1fr 1fr 1fr",
  columnGap: "8px",
  alignItems: "center",
  fontSize: "13px",
};

type LineupSlotProps = {
	order: number;
	position: string;
	player?: any;
	onAssign: (order: number) => void;
	onUnassign: (order: number) => void;
	onChangePosition: (order: number, position: string) => void;
  	isPositionSelected: boolean;
  	onSelectPosition: (order: number) => void;
  	splitKey: "vsRHP" | "vsLHP";
};

export default function LineupSlot({
	order,
	position,
	player,
	onAssign,
	onUnassign,
	onChangePosition,
	isPositionSelected,
	onSelectPosition,
	splitKey,
}: LineupSlotProps) {
  
  const split = player?.splits?.[splitKey];
  const hasValidSplit = split && split.PA >= 98;

  return (
    <div
      onClick={() => {
		  if (player) {
		    onUnassign(order);
		  } else {
		    onAssign(order);
		  }
		}}
      style={{
        display: "grid",
        gridTemplateColumns: "32px 44px 1.5fr 48px 48px 48px 48px",
        alignItems: "center",
        gap: "10px",
        padding: "6px 10px",
        borderBottom: "1px solid rgba(255,255,255,0.15)",
        fontSize: "14px",
        cursor: "pointer",
      }}
    >
      {/* Order */}
      <div
        style={{
          fontWeight: 700,
          textAlign: "center",
          opacity: 0.85,
        }}
      >
        {order}
      </div>

      {/* Position */}
      <div
		  onClick={(e) => {
		    e.stopPropagation();
		    onSelectPosition(order);
		  }}
		  style={{
		    padding: "2px 6px",
		    borderRadius: "6px",
		    fontWeight: 700,
		    cursor: "pointer",
		    background: isPositionSelected
		      ? "rgba(241,196,15,0.35)"
		      : "rgba(255,255,255,0.15)",
		    border: isPositionSelected
		      ? "2px solid #f1c40f"
		      : "none",
		    textAlign: "center",
		  }}
		>
		  {position}
		</div>

      {/* Player info */}
      <div>
		  {player ? (
		    <>
		      {/* Name + Bats */}
		      <div
		        style={{
		          display: "flex",
		          alignItems: "center",
		          gap: "6px",
		          fontWeight: 700,
		          fontSize: "13px",
		          whiteSpace: "nowrap",
		        }}
		      >
		        <span>{player.Name}</span>
		        {player.Bats && (
		          <span
		            style={{
		              fontSize: "11px",
		              fontWeight: 700,
		              color: 
		                player.Bats === "L" ? "#c8102e" :
		                player.Bats === "R" ? "#003087" :
		                player.Bats === "S" ? "#ffff00" :
		                "#ffffff",
		            }}
		          >
		            {player.Bats}
		          </span>
		        )}
		      </div>

		      {/* AVG / OBP / OPS */}
		      <div
		        style={{
		          fontSize: "11px",
		          opacity: 0.9,
		        }}
		      >
		        {formatRate(player.AVG)} / {formatRate(player.OBP)} /{" "}
		        {formatRate(player.OBP + player.SLG)}
		      </div>
		      {hasValidSplit && (
			      <div
			        style={{
			          fontSize: "11px",
			          opacity: 0.8,
			        }}
			      >
			        {formatRate(split.AVG)} / {formatRate(split.OBP)} /{" "}
			        {formatRate(split.OBP + split.SLG)}
			      </div>
		      )}
		    </>
		  ) : (
		    <div style={{ opacity: 0.5 }}>Empty</div>
		  )}
		</div>

		{/* wRC+ */}
		<div style={{ textAlign: "center" }}>
		  <div style={{ fontSize: "10px", opacity: 0.65 }}>wRC+</div>
		  <div style={{ fontSize: "12px", fontWeight: 600 }}>
		    {player?.["wRC+"] ?? ""}
		  </div>
		  <div style={{ fontSize: "12px", fontWeight: 600, opacity: 0.8 }}>
		    {split?.["wRC+"] ?? ""}
		  </div>
		</div>

		{/* K% */}
		<div style={{ textAlign: "center" }}>
		  <div style={{ fontSize: "10px", opacity: 0.65 }}>K%</div>
		  <div style={{ fontSize: "12px", fontWeight: 600 }}>
		    {player ? formatPercent(player["K%"]) : ""}
		  </div>
		  <div style={{ fontSize: "12px", fontWeight: 600, opacity: 0.8 }}>
		    {split ? formatPercent(split["K%"]) : ""}
		  </div>
		</div>

		{/* BB% */}
		<div style={{ textAlign: "center" }}>
		  <div style={{ fontSize: "10px", opacity: 0.65 }}>BB%</div>
		  <div style={{ fontSize: "12px", fontWeight: 600 }}>
		    {player ? formatPercent(player["BB%"]) : ""}
		  </div>
		  <div style={{ fontSize: "12px", fontWeight: 600, opacity: 0.8 }}>
		    {split ? formatPercent(split["BB%"]) : ""}
		  </div>
		</div>

		{/* WAR */}
		<div style={{ textAlign: "center" }}>
		  <div style={{ fontSize: "10px", opacity: 0.65 }}>WAR</div>
		  <div style={{ fontSize: "12px", fontWeight: 600 }}>
		    {player?.WAR ?? ""}
		  </div>
		</div>
    </div>
  );
}