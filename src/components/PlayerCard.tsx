import { formatRate, formatPercent } from '../utils/formatters';

type Player = {
  Name: string;
  Team: string;
  Bats?: "L" | "R";
  AVG: number;
  OBP: number;
  SLG: number;
  "wRC+": number;
  "K%": number;
  "BB%": number;
  WAR: number;
};

type PlayerCardProps = {
  player: Player;
  isSelected: boolean;
  onSelect: (player: Player) => void;
};


export default function PlayerCard({ 
  player,
  isSelected,
  onSelect,
}: PlayerCardProps) {
  return (
    <div
      onClick={() => {
        console.log("Clicked:", player.Name);
        onSelect(player);
      }}
      style={{
        background: "#1e5c93",
        color: "white",
        padding: "16px 20px",
        borderRadius: "12px",
        width: "320px",
        cursor: "pointer",
        outline: isSelected ? "3px solid #f1c40f" : "none",
        boxShadow: isSelected
          ? "0 0 0 3px rgba(241,196,15,0.4)"
          : undefined,
      }}
    >
      {/* Name + Bats */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "22px",
          fontWeight: "600",
          marginBottom: "10px",
          textShadow: "0 3px 2px rgba(0,0,0,0.35)",
        }}
      >
        <span>{player.Name}</span>

        {player.Bats && (
          <span
            style={{
              fontWeight: "700",
              color: 
                player.Bats === "L" ? "#c8102e" :
                player.Bats === "R" ? "#003087" :
                player.Bats === "S" ? "#ffff00" :
                "#ffffff",
              padding: "2px 8px",
              borderRadius: "6px",
              background: "rgba(255,255,255,0.1)",
            }}
          >
            {player.Bats}
          </span>
        )}
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2.2fr 0.7fr 0.8fr 0.8fr 0.6fr",
          rowGap: "4px",
          fontSize: "13px",
        }}
      >
        {/* Headers */}
        <div style={{ opacity: 0.75 }}>AVG / OBP / OPS</div>
        <div style={{ opacity: 0.75, textAlign: "center" }}>wRC+</div>
        <div style={{ opacity: 0.75, textAlign: "center" }}>K%</div>
        <div style={{ opacity: 0.75, textAlign: "center" }}>BB%</div>
        <div style={{ opacity: 0.75, textAlign: "center" }}>WAR</div>

        {/* Values */}
        <div>
          {formatRate(player.AVG)} /{" "}
          {formatRate(player.OBP)} /{" "}
          {formatRate(player.OBP + player.SLG)}
        </div>
        <div style={{ textAlign: "center" }}>{player["wRC+"]}</div>
        <div style={{ textAlign: "center" }}>
          {formatPercent(player["K%"])}
        </div>
        <div style={{ textAlign: "center" }}>
          {formatPercent(player["BB%"])}
        </div>
        <div style={{ textAlign: "center" }}>{player.WAR}</div>
      </div>
    </div>
  );
}
