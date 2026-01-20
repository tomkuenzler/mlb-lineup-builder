import players from './assets/projections_with_splits.json';
import PlayerCard from './components/PlayerCard';
import LineupColumn from './components/LineupColumn';
import PlayerFinderColumn from "./components/PlayerFinderColumn";
import { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import CompareLineups from "./pages/CompareLineups";


type LineupState = {
  lineupPlayersRHP: Record<number, Player>;
  lineupPlayersLHP: Record<number, Player>;
  lineupSlotsRHP: LineupSlotType[];
  lineupSlotsLHP: LineupSlotType[];
  benchPlayersRHP: (Player | null)[];
  benchPlayersLHP: (Player | null)[];
};

const emptyLineupState = (): LineupState => ({
  lineupPlayersRHP: {},
  lineupPlayersLHP: {},
  lineupSlotsRHP: defaultLineup,
  lineupSlotsLHP: defaultLineup,
  benchPlayersRHP: [null, null, null, null],
  benchPlayersLHP: [null, null, null, null],
});

const teams = Array.from(
  new Set(players.map((p) => p.Team).filter(Boolean))
).sort();

const freeAgents = players.filter(
  (p) => !p.Team || p.Team === "FA"
);

type LineupSlotType = {
  order: number;
  position: string;
};

type StatFilter = {
  stat: "wRC+";
  operator: ">=" | "<=" | ">" | "<";
  value: number;
};

type PlayerScope = "freeAgents" | "allPlayers";


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

function App() {

  function loadScenarioStorage(): Record<string, any[]> {
    const raw = localStorage.getItem("mlb-lineup-scenarios");
    if (!raw) return {};

    const parsed = JSON.parse(raw);

    // 🔥 MIGRATION: old array-based storage → team-based
    if (Array.isArray(parsed)) {
      return {
        LEGACY: parsed, // keeps old data instead of nuking it
      };
    }

    return parsed;
  }

  const [selectedTeam, setSelectedTeam] = useState(() => {
    return (
      localStorage.getItem("mlb-lineup-builder:selected-team") ||
      "BOS"
    );
  });

  const teamPlayers = players.filter(
    (p) => p.Team === selectedTeam
  );

  const [hasLoaded, setHasLoaded] = useState(false);

  const [faSearch, setFaSearch] = useState("");
  const filteredFreeAgents = freeAgents
  .filter((p) =>
    p.Name.toLowerCase().includes(faSearch.toLowerCase())
  )
  .sort((a, b) => b.WAR - a.WAR)
  .slice(0, 5);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [lineupPlayersRHP, setLineupPlayersRHP] =
    useState<Record<number, Player>>({});
  const [lineupPlayersLHP, setLineupPlayersLHP] =
    useState<Record<number, Player>>({});
  const [lineupSlotsRHP, setLineupSlotsRHP] = useState(defaultLineup);
  const [lineupSlotsLHP, setLineupSlotsLHP] = useState(defaultLineup);
  const [selectedPositionRHP, setSelectedPositionRHP] =
    useState<number | null>(null);
  const [selectedPositionLHP, setSelectedPositionLHP] =
    useState<number | null>(null);

  const [benchPlayersRHP, setBenchPlayersRHP] =
    useState<(Player | null)[]>([null, null, null, null]);

  const [benchPlayersLHP, setBenchPlayersLHP] =
    useState<(Player | null)[]>([null, null, null, null]);

  const [playerSearch, setPlayerSearch] = useState("");
  const [playerScope, setPlayerScope] = useState<PlayerScope>("freeAgents");

  const [statFilters, setStatFilters] = useState<StatFilter[]>([
    { stat: "wRC+", operator: ">=", value: 100 },
  ]);


  const handleAssignBenchRHP = (index: number) => {
    if (!selectedPlayer) return;

    setBenchPlayersRHP((prev) =>
      prev.map((p, i) => (i === index ? selectedPlayer : p))
    );

    setSelectedPlayer(null);
  };

  const handleUnassignBenchRHP = (index: number) => {
    setBenchPlayersRHP((prev) =>
      prev.map((p, i) => (i === index ? null : p))
    );
  };

  const handleAssignBenchLHP = (index: number) => {
    if (!selectedPlayer) return;

    setBenchPlayersLHP((prev) =>
      prev.map((p, i) => (i === index ? selectedPlayer : p))
    );

    setSelectedPlayer(null);
  };

  const handleUnassignBenchLHP = (index: number) => {
    setBenchPlayersLHP((prev) =>
      prev.map((p, i) => (i === index ? null : p))
    );
  };

  const handleAssignRHP = (order: number) => {
    if (!selectedPlayer) return;

    setLineupPlayersRHP((prev) => ({
      ...prev,
      [order]: selectedPlayer,
    }));

    setSelectedPlayer(null);
  };

  const handleUnassignRHP = (order: number) => {
    setLineupPlayersRHP((prev) => {
      const copy = { ...prev };
      delete copy[order];
      return copy;
    });
  };

  const handleChangePositionRHP = (order: number, position: string) => {
    setLineupSlotsRHP((prev) =>
      prev.map((slot) =>
        slot.order === order ? { ...slot, position } : slot
      )
    );
  };

  const handleAssignLHP = (order: number) => {
    if (!selectedPlayer) return;

    setLineupPlayersLHP((prev) => ({
      ...prev,
      [order]: selectedPlayer,
    }));

    setSelectedPlayer(null);
  };

  const handleUnassignLHP = (order: number) => {
    setLineupPlayersLHP((prev) => {
      const copy = { ...prev };
      delete copy[order];
      return copy;
    });
  };

  const handleChangePositionLHP = (order: number, position: string) => {
    setLineupSlotsLHP((prev) =>
      prev.map((slot) =>
        slot.order === order ? { ...slot, position } : slot
      )
    );
  };

  const handleSelectPositionRHP = (order: number) => {
    if (selectedPositionRHP === null) {
      setSelectedPositionRHP(order);
      return;
    }

    if (selectedPositionRHP === order) {
      setSelectedPositionRHP(null);
      return;
    }

    setLineupSlotsRHP((prev) => {
      const first = prev.find((s) => s.order === selectedPositionRHP)!;
      const second = prev.find((s) => s.order === order)!;

      return prev.map((slot) => {
        if (slot.order === first.order) {
          return { ...slot, position: second.position };
        }
        if (slot.order === second.order) {
          return { ...slot, position: first.position };
        }
        return slot;
      });
    });

    setSelectedPositionRHP(null);
  };

  const handleSelectPositionLHP = (order: number) => {
    if (selectedPositionLHP === null) {
      setSelectedPositionLHP(order);
      return;
    }

    if (selectedPositionLHP === order) {
      setSelectedPositionLHP(null);
      return;
    }

    setLineupSlotsLHP((prev) => {
      const first = prev.find((s) => s.order === selectedPositionLHP)!;
      const second = prev.find((s) => s.order === order)!;

      return prev.map((slot) => {
        if (slot.order === first.order) {
          return { ...slot, position: second.position };
        }
        if (slot.order === second.order) {
          return { ...slot, position: first.position };
        }
        return slot;
      });
    });

    setSelectedPositionLHP(null);
  };

  useEffect(() => {
    const raw = localStorage.getItem("mlb-lineup-builder:auto");
    const allTeams = raw ? JSON.parse(raw) : {};
    const state: LineupState | undefined = allTeams[selectedTeam];

    if (state) {
      setLineupPlayersRHP(state.lineupPlayersRHP);
      setLineupPlayersLHP(state.lineupPlayersLHP);
      setLineupSlotsRHP(state.lineupSlotsRHP);
      setLineupSlotsLHP(state.lineupSlotsLHP);
      setBenchPlayersRHP(state.benchPlayersRHP);
      setBenchPlayersLHP(state.benchPlayersLHP);
    } else {
      const empty = emptyLineupState();
      setLineupPlayersRHP(empty.lineupPlayersRHP);
      setLineupPlayersLHP(empty.lineupPlayersLHP);
      setLineupSlotsRHP(empty.lineupSlotsRHP);
      setLineupSlotsLHP(empty.lineupSlotsLHP);
      setBenchPlayersRHP(empty.benchPlayersRHP);
      setBenchPlayersLHP(empty.benchPlayersLHP);
    }

    setHasLoaded(true);
  }, [selectedTeam]);

  useEffect(() => {
    if (!hasLoaded) return;

    const raw = localStorage.getItem("mlb-lineup-builder:auto");
    const allTeams = raw ? JSON.parse(raw) : {};

    allTeams[selectedTeam] = {
      lineupPlayersRHP,
      lineupPlayersLHP,
      lineupSlotsRHP,
      lineupSlotsLHP,
      benchPlayersRHP,
      benchPlayersLHP,
    };

    localStorage.setItem(
      "mlb-lineup-builder:auto",
      JSON.stringify(allTeams)
    );
  }, [
    hasLoaded,
    selectedTeam,
    lineupPlayersRHP,
    lineupPlayersLHP,
    lineupSlotsRHP,
    lineupSlotsLHP,
    benchPlayersRHP,
    benchPlayersLHP,
  ]);

  const [savedScenarios, setSavedScenarios] = useState<any[]>([]);

  const handleSaveLineup = () => {
    const name = prompt("Name this lineup:");
    if (!name) return;

    const allTeams = loadScenarioStorage();

    const teamLineups = allTeams[selectedTeam] ?? [];

    const newLineup = {
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
      state: {
        lineupPlayersRHP,
        lineupPlayersLHP,
        lineupSlotsRHP,
        lineupSlotsLHP,
        benchPlayersRHP,
        benchPlayersLHP,
      },
    };

    const updatedTeamLineups = [...teamLineups, newLineup];

    const updatedAllTeams = {
      ...allTeams,
      [selectedTeam]: updatedTeamLineups,
    };

    localStorage.setItem(
      "mlb-lineup-scenarios",
      JSON.stringify(updatedAllTeams)
    );

    setSavedScenarios(updatedTeamLineups);
  };

  useEffect(() => {
    localStorage.setItem(
      "mlb-lineup-builder:selected-team",
      selectedTeam
    );
  }, [selectedTeam]);

  

  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  const [showSavedLineups, setShowSavedLineups] = useState(false);

  useEffect(() => {
    const allTeams = loadScenarioStorage();
    setSavedScenarios(allTeams[selectedTeam] ?? []);
  }, [selectedTeam]);

  function loadScenario(scenario: any) {
    const state = scenario.state;

    setLineupPlayersRHP(state.lineupPlayersRHP);
    setLineupPlayersLHP(state.lineupPlayersLHP);
    setLineupSlotsRHP(state.lineupSlotsRHP);
    setLineupSlotsLHP(state.lineupSlotsLHP);
    setBenchPlayersRHP(state.benchPlayersRHP);
    setBenchPlayersLHP(state.benchPlayersLHP);
  }

  function deleteScenario(id: string) {
    if (!confirm("Delete this saved lineup?")) return;

    const allTeams = loadScenarioStorage();

    const updatedTeamLineups =
      (allTeams[selectedTeam] ?? []).filter((l) => l.id !== id);

    const updatedAllTeams = {
      ...allTeams,
      [selectedTeam]: updatedTeamLineups,
    };

    localStorage.setItem(
      "mlb-lineup-scenarios",
      JSON.stringify(updatedAllTeams)
    );

    setSavedScenarios(updatedTeamLineups);
  }

  return (
  <>
    <nav style={{ marginBottom: "16px" }}>
      <Link to="/">Builder</Link>{" "}
      |{" "}
      <Link to="/compare">Compare Lineups</Link>
    </nav>

    <Routes>
      <Route
        path="/"
        element={
          <div
            style={{
              maxWidth: "2400px",
              margin: "0 auto",
              padding: "0 32px",
            }}
          >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <h1 style={{ margin: 0 }}>MLB Lineup Builder</h1>

            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: "6px",
                fontWeight: 600,
              }}
            >
              {teams.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                const raw = localStorage.getItem("mlb-lineup-builder:auto");
                if (!raw) return;

                const allTeams = JSON.parse(raw);
                delete allTeams[selectedTeam];

                localStorage.setItem(
                  "mlb-lineup-builder:auto",
                  JSON.stringify(allTeams)
                );

                const empty = emptyLineupState();
                setLineupPlayersRHP(empty.lineupPlayersRHP);
                setLineupPlayersLHP(empty.lineupPlayersLHP);
                setLineupSlotsRHP(empty.lineupSlotsRHP);
                setLineupSlotsLHP(empty.lineupSlotsLHP);
                setBenchPlayersRHP(empty.benchPlayersRHP);
                setBenchPlayersLHP(empty.benchPlayersLHP);
              }}
            >
              Clear Lineup
            </button>

            <button onClick={handleSaveLineup}>Save Lineup</button>
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginLeft: "12px",
                maxWidth: "900px",
                overflowX: "auto",
                paddingBottom: "4px",
                scrollbarWidth: "thin",
                scrollbarColor: "#374151 transparent",
              }}
            >
              {savedScenarios.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 10px",
                    borderRadius: "999px",
                    background:
                      s.id === activeScenarioId ? "#2563eb" : "#1f2937",
                    color: "white",
                    fontSize: "13px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    onClick={() => {
                      loadScenario(s);
                      setActiveScenarioId(s.id);
                    }}
                  >
                    {s.name}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteScenario(s.id);
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#fca5a5",
                      cursor: "pointer",
                      fontSize: "14px",
                      lineHeight: 1,
                    }}
                    title="Delete lineup"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

          </div>

          {/* Lineup */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "32px",
              marginBottom: "40px",
            }}
          >
            <LineupColumn
              title="vs RHP"
              lineupSlots={lineupSlotsRHP}
              lineupPlayers={lineupPlayersRHP}
              onAssign={handleAssignRHP}
              onUnassign={handleUnassignRHP}
              onChangePosition={handleChangePositionRHP}
              selectedPositionOrder={selectedPositionRHP}
              onSelectPosition={handleSelectPositionRHP}
              benchPlayers={benchPlayersRHP}
              onAssignBench={handleAssignBenchRHP}
              onUnassignBench={handleUnassignBenchRHP}
            />

            <LineupColumn
              title="vs LHP"
              lineupSlots={lineupSlotsLHP}
              lineupPlayers={lineupPlayersLHP}
              onAssign={handleAssignLHP}
              onUnassign={handleUnassignLHP}
              onChangePosition={handleChangePositionLHP}
              selectedPositionOrder={selectedPositionLHP}
              onSelectPosition={handleSelectPositionLHP}
              benchPlayers={benchPlayersLHP}
              onAssignBench={handleAssignBenchLHP}
              onUnassignBench={handleUnassignBenchLHP}
            />

            <PlayerFinderColumn
              players={players}
              search={playerSearch}
              onSearchChange={setPlayerSearch}
              scope={playerScope}
              onScopeChange={setPlayerScope}
              selectedPlayer={selectedPlayer}
              onSelect={setSelectedPlayer}
            />
          </div>

          {/* Player Pool */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "20px",
              maxWidth: "100vw",
            }}
          >
            {teamPlayers.map((player) => (
              <PlayerCard
                key={player.Name}
                player={player}
                isSelected={selectedPlayer?.Name === player.Name}
                onSelect={setSelectedPlayer}
              />
            ))}
          </div>    
        </div>
      }
    />

    {/* Compare page */}
      <Route path="/compare" element={<CompareLineups />} />
    </Routes>
  </>
);
}

export default App;