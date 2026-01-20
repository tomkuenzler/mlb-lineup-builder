import PlayerCard from "./PlayerCard";
import { useState, useEffect } from "react";

type Props = {
  players: Player[];
  search: string;
  onSearchChange: (v: string) => void;
  selectedPlayer: Player | null;
  onSelect: (p: Player) => void;
};

type StatKey =
  | "wRC+"
  | "K%"
  | "BB%"
  | "AVG"
  | "OBP"
  | "SLG"
  | "Def"
  | "WAR";

type SplitKey = "overall" | "vsRHP" | "vsLHP";

type StatFilter = {
  stat: StatKey;
  split: SplitKey;
  operator: ">" | "<";
  value: number;
};

type PlayerScope =
  | "FREE_AGENTS"
  | "ALL_PLAYERS"
  | { team: string };

type SortOption =
  | { type: "WAR" }
  | {
      type: "STAT";
      stat: StatKey;
      split: SplitKey;
      direction: "ASC" | "DESC";
    };


export default function PlayerFinderColumn({
  players,
  search,
  onSearchChange,
  scope,
  onScopeChange,
  selectedPlayer,
  onSelect,
}: Props) {

  const [batsFilter, setBatsFilter] =
    useState<"ALL" | "L" | "R" | "S">("ALL");

  const [statFilters, setStatFilters] = useState<StatFilter[]>([]);
  const [statSplit, setStatSplit] = useState<SplitKey>("overall");
  const [statOperator, setStatOperator] =
    useState<">" | ">=" | "<" | "<=">(">");
  const [teamFilter, setTeamFilter] = useState<string>("ALL");
  const [playerScope, setPlayerScope] =
    useState<PlayerScope>("FREE_AGENTS");
  const [draftStat, setDraftStat] = useState<StatFilter>({
    stat: "wRC+",
    split: "overall",
    operator: ">",
    value: 100,
  });
  const [sortOption, setSortOption] = useState<SortOption>({
    type: "WAR",
  });


  function passesStatFilter(player: Player, filter: StatFilter) {
    let value: number | undefined;

    if (filter.split === "overall") {
      value = player[filter.stat];
    } else {
      value = player.splits?.[filter.split]?.[filter.stat];
    }

    if (value == null) return false;

    switch (filter.operator) {
      case ">":
        return value > filter.value;
      case ">=":
        return value >= filter.value;
      case "<":
        return value < filter.value;
      case "<=":
        return value <= filter.value;
      default:
        return true;
    }
  }

  function resetFilters() {
    onSearchChange("");
    setBatsFilter("ALL");
    setStatFilters([]);
  }

  // function resetFilters() {
  //   onSearchChange("");
  //   setBatsFilter("ALL");
  //   setStatFilter(null);
  // }


  // useEffect(() => {
  //   if (!statFilter) return;

  //   setStatFilter((prev) =>
  //     prev ? { ...prev, split: statSplit } : prev
  //   );
  // }, [statSplit]);

  const teams = Array.from(
    new Set(players.map((p) => p.Team).filter(Boolean))
  ).sort();


  function getStatValue(player: Player, filter: StatFilter): number | null {
    if (filter.split === "overall") {
      return player[filter.stat] ?? null;
    }

    return player.splits?.[filter.split]?.[filter.stat] ?? null;
  }

  function comparePlayers(a: Player, b: Player) {
    if (statFilters.length === 0) {
      return (b.WAR ?? 0) - (a.WAR ?? 0);
    }

    const primary = statFilters[0];

    const aValue = getStatValue(a, primary);
    const bValue = getStatValue(b, primary);

    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    if (primary.operator === ">") {
      return bValue - aValue;
    }

    return aValue - bValue;
  }

  // function addStatFilter(filter: StatFilter) {
  //   setStatFilters((prev) => [...prev, filter]);
  // }

  function sortPlayers(a: Player, b: Player) {
    if (sortOption.type === "WAR") {
      return (b.WAR ?? 0) - (a.WAR ?? 0);
    }

    const { stat, split, direction } = sortOption;

    const aValue =
      split === "overall"
        ? a[stat]
        : a.splits?.[split]?.[stat];

    const bValue =
      split === "overall"
        ? b[stat]
        : b.splits?.[split]?.[stat];

    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    return direction === "DESC"
      ? bValue - aValue
      : aValue - bValue;
  }

  const filteredPlayers = players.filter((player) => {
    // Name search
    if (
      search &&
      !player.Name.toLowerCase().includes(search.toLowerCase())
    )
      return false;

    // Bats
    if (batsFilter !== "ALL" && player.Bats !== batsFilter)
      return false;

    // Stat filter
    if (
      statFilters.length > 0 &&
      !statFilters.every((filter) => passesStatFilter(player, filter))
    ) {
      return false;
    }

    // Scope / Team filter
    if (playerScope === "FREE_AGENTS") {
      if (player.Team && player.Team !== "FA") return false;
    }

    if (typeof playerScope === "object") {
      if (player.Team !== playerScope.team) return false;
    }


    // Team filter
    if (teamFilter !== "ALL") {
      if (player.Team !== teamFilter) return false;
    }

    return true;
  })
  .sort(sortPlayers)
  return (
    <div
      style={{
        background: "#13293d", // darker than PlayerCard
        color: "white",
        borderRadius: "12px",
        padding: "14px",
        minHeight: "97%",
      }}
    >

      <h3 style={{ textAlign: "center" }}>Player Finder</h3>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "10px",
          flexWrap: "wrap",
        }}
      >
        {/* Search */}
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search players..."
          style={{
            padding: "6px",
            flex: "1 1 200px",
          }}
        />

        {/* Scope */}
        <select
          value={
            playerScope === "FREE_AGENTS"
              ? "FREE_AGENTS"
              : playerScope === "ALL_PLAYERS"
              ? "ALL_PLAYERS"
              : playerScope.team
          }
          onChange={(e) => {
            const value = e.target.value;

            if (value === "FREE_AGENTS") {
              setPlayerScope("FREE_AGENTS");
            } else if (value === "ALL_PLAYERS") {
              setPlayerScope("ALL_PLAYERS");
            } else {
              setPlayerScope({ team: value });
            }
          }}
        >
          <option value="FREE_AGENTS">Free Agents</option>
          <option value="ALL_PLAYERS">All Players</option>
          <option disabled>──────────</option>

          {teams.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>
        {/* Sort */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <label>Sort</label>
            <select
              value={
                sortOption.type === "WAR"
                  ? "WAR"
                  : `${sortOption.stat}-${sortOption.split}-${sortOption.direction}`
              }
              onChange={(e) => {
                const value = e.target.value;

                if (value === "WAR") {
                  setSortOption({ type: "WAR" });
                  return;
                }

                const [stat, split, direction] = value.split("-");

                setSortOption({
                  type: "STAT",
                  stat: stat as StatKey,
                  split: split as SplitKey,
                  direction: direction as "ASC" | "DESC",
                });
              }}
            >
              <option value="WAR">WAR (default)</option>

              <option value="wRC+-overall-DESC">wRC+ (Overall)</option>
              <option value="wRC+-vsRHP-DESC">wRC+ vs RHP</option>
              <option value="wRC+-vsLHP-DESC">wRC+ vs LHP</option>

              <option value="AVG-overall-DESC">AVG</option>
              <option value="OBP-overall-DESC">OBP</option>
              <option value="SLG-overall-DESC">SLG</option>

              <option value="BB%-overall-DESC">BB%</option>
              <option value="K%-overall-ASC">K% (lower better)</option>
              <option value="Def-overall-DESC">Def</option>
            </select>
          </div>
      </div>

      {/* Filters Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          marginBottom: "12px",
          flexWrap: "wrap",
          fontSize: "13px",
        }}
      >
        {/* Bats Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <label>Bats</label>
          <select
            value={batsFilter}
            onChange={(e) => setBatsFilter(e.target.value as any)}
          >
            <option value="ALL">All</option>
            <option value="L">Left</option>
            <option value="R">Right</option>
            <option value="S">Switch</option>
          </select>
        </div>

        {/* Stat Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <label>Stat</label>
          <select
            value={draftStat.stat}
            onChange={(e) =>
              setDraftStat((prev) => ({
                ...prev,
                stat: e.target.value as StatKey,
              }))
            }
          >
            <option value="wRC+">wRC+</option>
            <option value="BB%">BB%</option>
            <option value="K%">K%</option>
            <option value="AVG">AVG</option>
            <option value="OBP">OBP</option>
            <option value="SLG">SLG</option>
            <option value="Def">Def</option>
            <option value="WAR">WAR</option>
          </select>
        </div>

        {/* Split */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <label>Split</label>
          <select
            value={draftStat.split}
            onChange={(e) =>
              setDraftStat((prev) => ({
                ...prev,
                split: e.target.value as SplitKey,
              }))
            }
          >
            <option value="overall">Overall</option>
            <option value="vsRHP">vs RHP</option>
            <option value="vsLHP">vs LHP</option>
          </select>
        </div>

        {/* Operator */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <label>Op</label>
          <select
            value={draftStat.operator}
            onChange={(e) =>
              setDraftStat((prev) => ({
                ...prev,
                operator: e.target.value as ">" | "<",
              }))
            }
          >
            <option value=">">{">"}</option>
            <option value="<">{"<"}</option>
          </select>
        </div>

        {/* Value */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <label>Value</label>
          <input
            type="number"
            value={draftStat.value}
            onChange={(e) =>
              setDraftStat((prev) => ({
                ...prev,
                value: Number(e.target.value),
              }))
            }
            style={{ width: "70px" }}
          />
        </div>
        <button
          onClick={() =>
            setStatFilters((prev) => [...prev, draftStat])
          }
        >
          Add Filter
        </button>
        <button
          onClick={resetFilters}
          style={{
            marginLeft: "auto",
            padding: "4px 10px",
            borderRadius: "6px",
            background: "#1f3a5f",
            color: "white",
            border: "1px solid #2c4c7c",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          Reset
        </button>
      </div>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {statFilters.map((filter, index) => (
          <div
            key={index}
            style={{
              background: "#1f3a5f",
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer",
            }}
            onClick={() =>
              setStatFilters((prev) =>
                prev.filter((_, i) => i !== index)
              )
            }
            title="Click to remove"
          >
            {filter.stat} {filter.operator} {filter.value} ({filter.split})
          </div>
        ))}
      </div>

      {/* Results */}
      <div
        style={{
          display: "grid",
          justifyItems: "center",
          gap: "6px",
          maxHeight: "700px",
          overflowY: "auto",
          paddingRight: "6px",
        }}
      >
        {filteredPlayers.map((player) => (
          <div key={player.Name} style={{ transform: "scale(0.9)" }}>
            <PlayerCard
              player={player}
              isSelected={selectedPlayer?.Name === player.Name}
              onSelect={onSelect}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
