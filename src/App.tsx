import {useEffect, useState} from "react";
import {socket} from "./socket";
import "./App.scss";
import StatusBar from "./components/statusbar/StatusBar.tsx";
import PlusMinusButton from "./components/plusminusbutton/PlusMinusButton.tsx";
import AllianceToggle from "./components/alliancetoggle/AllianceToggle.tsx";
import {Alliance} from "./types.ts";
import {useFlashOnChange} from "./hooks/useFlashOnChange.ts";

export default function App() {
    const [connected, setConnected] = useState(false);
    const [matchStatus, setMatchStatus] = useState("⏳ Awaiting...");
    const [allianceAuto, setAllianceAuto] = useState<Alliance>("blue");
    const [allianceEndgame, setAllianceEndgame] = useState<Alliance>("blue");
    const [allianceReef, setAllianceReef] = useState<Alliance>("blue");
    const [allianceNet, setAllianceNet] = useState<Alliance>("blue");
    const [allianceProcessor, setAllianceProcessor] = useState<Alliance>("blue");
    const [allianceThrough, setAllianceThrough] = useState<Alliance>("blue");
    const [alliancePenalty, setAlliancePenalty] = useState<Alliance>("blue");

    const AUTO_LEAVE_OPTIONS = ["Unknown", "Yes", "No"];
    const ENDGAME_OPTIONS = ["Unknown", "DeepCage", "ShallowCage", "Parked", "None"];
    const BRANCHES = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"] as const;
    const PENALTIES = ["g206", "g410", "g418", "g419", "g428"] as const;
    const FOULS = ["Minor", "Major", "Adjustment"] as const;
    const LEVELS = ["l4", "l3", "l2"] as const;

    const initialReefCheckboxes = Object.fromEntries(
        LEVELS.flatMap(level =>
            BRANCHES.map(branch => [[level, branch].join("-"), false])
        )
    ) as Record<string, boolean>;
    const [reefCheckboxesTeleop, setReefCheckboxesTeleop] = useState(initialReefCheckboxes);
    const [reefCheckboxesAuto, setReefCheckboxesAuto] = useState(initialReefCheckboxes);

    const [autoLeaveDropdowns, setAutoLeaveDropdowns] = useState<{ [robot: number]: string }>({
        1: "Unknown",
        2: "Unknown",
        3: "Unknown"
    });
    const [endgameDropdowns, setEndgameDropdowns] = useState<{ [robot: number]: string }>({
        1: "Unknown",
        2: "Unknown",
        3: "Unknown"
    });

    const [netCountAuto, setNetCountAuto] = useState(0);
    const [netCountTeleop, setNetCountTeleop] = useState(0);
    const [processorCountAuto, setProcessorCountAuto] = useState(0);
    const [processorCountTeleop, setProcessorCountTeleop] = useState(0);
    const [throughCountAuto, setThroughCountAuto] = useState(0);
    const [throughCountTeleop, setThroughCountTeleop] = useState(0);

    type FoulType = typeof FOULS[number];
    type PenaltyType = typeof PENALTIES[number];
    type ScoringType = "Net" | "Processor" | "Through";

    function handleAutoLeaveChange(robotId: 1 | 2 | 3, value: string) {
        setAutoLeaveDropdowns(prev => ({...prev, [robotId]: value}));
        const v = value === "Yes" ? "yes" : value === "No" ? "no" : "no";
        socket.emit("score.auto.leave:set", {
            alliance: allianceAuto,
            robotId: robotId,
            value: v,
        });
    }

    function handleEndgameChange(robotId: 1 | 2 | 3, value: string) {
        setEndgameDropdowns(prev => ({...prev, [robotId]: value}));
        let state: "none" | "parked" | "deepcage" | "shallowcage" = "none";
        if (value === "DeepCage") state = "deepcage";
        else if (value === "ShallowCage") state = "shallowcage";
        else if (value === "Parked") state = "parked";

        socket.emit("score.endgame:set", {
            alliance: allianceEndgame,
            robotId,
            state,
        });
    }

    const scoringHandlers: Record<ScoringType, { onPlus: (auto: boolean) => void; onMinus: (auto: boolean) => void; }> = {
        Net: {
            onPlus: (auto: boolean) => {
                (auto ? setNetCountAuto : setNetCountTeleop)((c) => c + 1);
                socket.emit("score.algae.net:add", {
                    alliance: allianceNet,
                    auto: auto,
                    count: 1,
                });
            },
            onMinus: (auto: boolean) => {
                (auto ? setNetCountAuto : setNetCountTeleop)((c) => Math.max(0, c - 1));
                if (!((auto ? netCountAuto : netCountTeleop) <= 0)) {
                    socket.emit("score.algae.net:remove", {
                        alliance: allianceNet,
                        auto: auto,
                        count: 1,
                    });
                }
            },
        },
        Processor: {
            onPlus: (auto: boolean) => {
                (auto ? setProcessorCountAuto : setProcessorCountTeleop)((c) => c + 1);

                socket.emit("score.algae.processor:add", {
                    alliance: allianceProcessor,
                    auto: auto,
                    count: 1,
                });
            },
            onMinus: (auto: boolean) => {
                (auto ? setProcessorCountAuto : setProcessorCountTeleop)((c) => Math.max(0, c - 1));

                if (!((auto ? processorCountAuto : processorCountTeleop) <= 0)) {
                    socket.emit("score.algae.processor:remove", {
                        alliance: allianceProcessor,
                        auto: auto,
                        count: 1,
                    });
                }
            },
        },
        Through: {
            onPlus: (auto: boolean) => {
                (auto ? setThroughCountAuto : setThroughCountTeleop)((c) => c + 1);
                socket.emit("score.coral.through:add", {
                    alliance: allianceThrough,
                    auto: auto,
                    count: 1,
                });
            },
            onMinus: (auto: boolean) => {
                (auto ? setThroughCountAuto : setThroughCountTeleop)((c) => Math.max(0, c - 1));
                if (!((auto ? throughCountAuto : throughCountTeleop) <= 0)) {
                    socket.emit("score.coral.through:remove", {
                        alliance: allianceThrough,
                        auto: auto,
                        count: 1,
                    });
                }
            },
        }
    };

    function reefHandler(auto: boolean, level: "l4" | "l3" | "l2", branch: "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l", value: boolean) {
        (auto ? setReefCheckboxesAuto : setReefCheckboxesTeleop)(
            prev => ({
                ...prev,
                [`${level}-${branch}`]: value
            })
        );

        if (value) {
            socket.emit("score.coral:add", {
                alliance: allianceReef,
                auto: auto,
                level,
                branch,
            });
        } else {
            socket.emit("score.coral:remove", {
                alliance: allianceReef,
                auto: auto,
                level,
                branch,
            });
        }
    }

    const [minorFoulCountRed, setMinorFoulCountRed] = useState(0);
    const [minorFoulCountBlue, setMinorFoulCountBlue] = useState(0);
    const [majorFoulCountRed, setMajorFoulCountRed] = useState(0);
    const [majorFoulCountBlue, setMajorFoulCountBlue] = useState(0);
    const [adjustmentFoulCountRed, setAdjustmentFoulCountRed] = useState(0);
    const [adjustmentFoulCountBlue, setAdjustmentFoulCountBlue] = useState(0);

    function getFoulHandlers(alliance: "red" | "blue") {
        return {
            Minor: {
                onPlus: () => {
                    (alliance === "red" ? setMinorFoulCountRed : setMinorFoulCountBlue)(c => c + 1);
                    socket.emit("score.foul:add", {
                        alliance,
                        type: "minor",
                        count: 1,
                    });
                },
                onMinus: () => {
                    const setCount = alliance === "red" ? setMinorFoulCountRed : setMinorFoulCountBlue;
                    const count = alliance === "red" ? minorFoulCountRed : minorFoulCountBlue;
                    setCount(c => Math.max(0, c - 1));
                    if (count > 0) {
                        socket.emit("score.foul:remove", {
                            alliance,
                            type: "minor",
                            count: 1,
                        });
                    }
                },
            },
            Major: {
                onPlus: () => {
                    (alliance === "red" ? setMajorFoulCountRed : setMajorFoulCountBlue)(c => c + 1);
                    socket.emit("score.foul:add", {
                        alliance,
                        type: "major",
                        count: 1,
                    });
                },
                onMinus: () => {
                    const setCount = alliance === "red" ? setMajorFoulCountRed : setMajorFoulCountBlue;
                    const count = alliance === "red" ? majorFoulCountRed : majorFoulCountBlue;
                    setCount(c => Math.max(0, c - 1));
                    if (count > 0) {
                        socket.emit("score.foul:remove", {
                            alliance,
                            type: "major",
                            count: 1,
                        });
                    }
                },
            },
            Adjustment: {
                onPlus: () => {
                    (alliance === "red" ? setAdjustmentFoulCountRed : setAdjustmentFoulCountBlue)(c => c + 1);
                    socket.emit("score.foul:add", {
                        alliance,
                        type: "adjustment",
                        count: 1,
                    });
                },
                onMinus: () => {
                    const setCount = alliance === "red" ? setAdjustmentFoulCountRed : setAdjustmentFoulCountBlue;
                    const count = alliance === "red" ? adjustmentFoulCountRed : adjustmentFoulCountBlue;
                    setCount(c => Math.max(0, c - 1));
                    if (count > 0) {
                        socket.emit("score.foul:remove", {
                            alliance,
                            type: "adjustment",
                            count: 1,
                        });
                    }
                },
            },
        };
    }

    const foulHandlersRed = getFoulHandlers("red");
    const foulHandlersBlue = getFoulHandlers("blue");

    function handlePenaltyChange(
        penalty: PenaltyType,
        value: boolean,
    ) {
        if (value) {
            socket.emit("score.penalty:set", {
                alliance: alliancePenalty,
                type: penalty,
                value: true,
            });
        } else {
            socket.emit("score.penalty:set", {
                alliance: alliancePenalty,
                type: penalty,
                value: false,
            });
        }
    }

    useEffect(() => {
        socket.on("connect", () => {
            console.log("Connected:", socket.id);
            setConnected(true);
        });

        socket.on("disconnect", () => {
            console.log("Disconnected");
            setConnected(false);
        });

        socket.on("score:ack", (msg) => {
            console.log("Server ack:", msg);
        });

        socket.on("match:start", () => {
            setMatchStatus("🟢 In progress!");
        });

        socket.on("match:end", () => {
            setMatchStatus("🔴 Ended");
        });

        socket.on("match:reset", () => {
            setMatchStatus("⏳ Awaiting...");
            setNetCountAuto(0);
            setNetCountTeleop(0);
            setProcessorCountAuto(0);
            setProcessorCountTeleop(0);
            setThroughCountAuto(0);
            setThroughCountTeleop(0);
            setMinorFoulCountRed(0);
            setMajorFoulCountRed(0);
            setAdjustmentFoulCountRed(0);
            setMinorFoulCountBlue(0);
            setMajorFoulCountBlue(0);
            setAdjustmentFoulCountBlue(0);
            setReefCheckboxesAuto(initialReefCheckboxes);
            setReefCheckboxesTeleop(initialReefCheckboxes);
            setAutoLeaveDropdowns({1: "Unknown", 2: "Unknown", 3: "Unknown"});
            setEndgameDropdowns({1: "Unknown", 2: "Unknown", 3: "Unknown"});

        });

        return () => {
            socket.off(); // clean up listeners
        };
    }, [initialReefCheckboxes]);

    const flashCoreContainer = useFlashOnChange(matchStatus.toLowerCase().includes("in progress"));

    return (<div>
        <StatusBar status={connected ? "Connected 🟢" : "Disconnected 🔴"} alliance={"Manual mode"} matchStatus={matchStatus} />
        {matchStatus.toLowerCase().includes("awaiting") && (
            <div className="overlay">
                <div className="overlay-content">
                    <h2>Waiting for match to start...</h2>
                    <p>Please wait until the match starts to begin scoring</p>
                </div>
            </div>
        )}
        <div className="core_container" ref={flashCoreContainer}>
            {/* FIRST ROW */}
            <div className="container_row" style={{height: "8.8rem"}}>
                <div className="container_col" style={{height: "100%"}}>
                    <h2>🤖 AUTO</h2>
                </div>
                <div className="container_col">
                    <table>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Leave?</th>
                        </tr>
                        </thead>
                        <tbody>
                        {[1, 2, 3].map((robot) => (<tr key={robot}>
                            <td>{robot}</td>
                            <td>
                                <select
                                    value={autoLeaveDropdowns[robot]}
                                    onChange={e => handleAutoLeaveChange(robot as 1 | 2 | 3, e.target.value)}
                                >
                                    {AUTO_LEAVE_OPTIONS.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </td>
                        </tr>))}
                        </tbody>
                    </table>
                    <AllianceToggle
                        alliance={allianceAuto}
                        checked={allianceAuto === "red"}
                        onChange={() => allianceAuto === "blue" ? setAllianceAuto("red") : setAllianceAuto("blue")}
                        label="" />
                </div>
                <div className="container_col">
                    <table>
                        <thead>
                        <tr>
                            <th>🪸</th>
                            {BRANCHES.map((branch) => (
                                <th key={branch}>{branch.toUpperCase()}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {LEVELS.map((level) => (
                            <tr key={level}>
                                <td>{level.toUpperCase()}</td>
                                {BRANCHES.map((branch) => (
                                    <td key={`${level}-${branch}-true`}>
                                        <input
                                            className="scale"
                                            type="checkbox"
                                            checked={reefCheckboxesAuto[`${level}-${branch}`] || false}
                                            onChange={event => reefHandler(true, level, branch, event.target.checked)}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    <AllianceToggle
                        alliance={allianceReef}
                        checked={allianceReef === "red"}
                        onChange={() => allianceReef === "blue" ? setAllianceReef("red") : setAllianceReef("blue")}
                        label="" />
                </div>
                <div className="container_col">
                    <table>
                        <thead>
                        <tr>
                            <th>L1</th>
                            <th>Processor</th>
                            <th>Net</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>
                                <PlusMinusButton
                                    onPlus={() => scoringHandlers.Through.onPlus(true)}
                                    onMinus={() => scoringHandlers.Through.onMinus(true)}
                                />
                            </td>
                            <td>
                                <PlusMinusButton
                                    onPlus={() => scoringHandlers.Processor.onPlus(true)}
                                    onMinus={() => scoringHandlers.Processor.onMinus(true)}
                                />
                            </td>
                            <td>
                                <PlusMinusButton
                                    onPlus={() => scoringHandlers.Net.onPlus(true)}
                                    onMinus={() => scoringHandlers.Net.onMinus(true)}
                                />
                            </td>
                        </tr>
                        <tr>
                            <th>
                                <p>{throughCountAuto}</p>
                            </th>
                            <th>
                                <p>{processorCountAuto}</p>
                            </th>
                            <th>
                                <p>{netCountAuto}</p>
                            </th>
                        </tr>
                        <tr>
                            <td>
                                <AllianceToggle
                                    alliance={allianceThrough}
                                    checked={allianceThrough === "red"}
                                    onChange={() => allianceThrough === "blue" ? setAllianceThrough("red") : setAllianceThrough("blue")}
                                    label="" />
                            </td>
                            <td>
                                <AllianceToggle
                                    alliance={allianceProcessor}
                                    checked={allianceProcessor === "red"}
                                    onChange={() => allianceProcessor === "blue" ? setAllianceProcessor("red") : setAllianceProcessor("blue")}
                                    label="" />
                            </td>
                            <td>
                                <AllianceToggle
                                    alliance={allianceNet}
                                    checked={allianceNet === "red"}
                                    onChange={() => allianceNet === "blue" ? setAllianceNet("red") : setAllianceNet("blue")}
                                    label="" />
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="hr_horiz" />

            {/* SECOND ROW */}
            <div className="container_row" style={{height: "8.8rem"}}>
                <div className="container_col" style={{height: "100%"}}>
                    <h2>🎮 TELEOP</h2>
                </div>
                <div className="container_col">
                    <table>
                        <thead>
                        <tr>
                            <th>🪸</th>
                            {BRANCHES.map((branch) => (
                                <th key={branch}>{branch.toUpperCase()}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {LEVELS.map((level) => (
                            <tr key={level}>
                                <td>{level.toUpperCase()}</td>
                                {BRANCHES.map((branch) => (
                                    <td key={`${level}-${branch}-false`}>
                                        <input
                                            className="scale"
                                            type="checkbox"
                                            checked={reefCheckboxesTeleop[`${level}-${branch}`] || false}
                                            onChange={event => reefHandler(false, level, branch, event.target.checked)}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    <AllianceToggle
                        alliance={allianceReef}
                        checked={allianceReef === "red"}
                        onChange={() => allianceReef === "blue" ? setAllianceReef("red") : setAllianceReef("blue")}
                        label="" />
                </div>
                <div className="container_col">
                    <table>
                        <thead>
                        <tr>
                            <th>L1</th>
                            <th>Processor</th>
                            <th>Net</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>
                                <PlusMinusButton
                                    onPlus={() => scoringHandlers.Through.onPlus(false)}
                                    onMinus={() => scoringHandlers.Through.onMinus(false)}
                                />
                            </td>
                            <td>
                                <PlusMinusButton
                                    onPlus={() => scoringHandlers.Processor.onPlus(false)}
                                    onMinus={() => scoringHandlers.Processor.onMinus(false)}
                                />
                            </td>
                            <td>
                                <PlusMinusButton
                                    onPlus={() => scoringHandlers.Net.onPlus(false)}
                                    onMinus={() => scoringHandlers.Net.onMinus(false)}
                                />
                            </td>
                        </tr>
                        <tr>
                            <th>
                                <p>{throughCountTeleop}</p>
                            </th>
                            <th>
                                <p>{processorCountTeleop}</p>
                            </th>
                            <th>
                                <p>{netCountTeleop}</p>
                            </th>
                        </tr>
                        <tr>
                            <td>
                                <AllianceToggle
                                    alliance={allianceThrough}
                                    checked={allianceThrough === "red"}
                                    onChange={() => allianceThrough === "blue" ? setAllianceThrough("red") : setAllianceThrough("blue")}
                                    label="" />
                            </td>
                            <td>
                                <AllianceToggle
                                    alliance={allianceProcessor}
                                    checked={allianceProcessor === "red"}
                                    onChange={() => allianceProcessor === "blue" ? setAllianceProcessor("red") : setAllianceProcessor("blue")}
                                    label="" />
                            </td>
                            <td>
                                <AllianceToggle
                                    alliance={allianceNet}
                                    checked={allianceNet === "red"}
                                    onChange={() => allianceNet === "blue" ? setAllianceNet("red") : setAllianceNet("blue")}
                                    label="" />
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <div className="container_col">
                    <h4>Robot team numbers</h4>
                    <table>
                        <thead>
                        <tr>
                            <th>Id</th>
                            <th>Blue</th>
                            <th>Red</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>
                                1
                            </td>
                            <td>
                                {/* BLUE 1 */}
                                0000
                            </td>
                            <td>
                                {/* RED 1 */}
                                0000
                            </td>
                        </tr>
                        <tr>
                            <td>
                                2
                            </td>
                            <td>
                                {/* BLUE 2 */}
                                0000
                            </td>
                            <td>
                                {/* RED 2 */}
                                0000
                            </td>
                        </tr>
                        <tr>
                            <td>
                                3
                            </td>
                            <td>
                                {/* BLUE 3 */}
                                0000
                            </td>
                            <td>
                                {/* RED 3 */}
                                0000
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="hr_horiz" />

            {/*THIRD ROW*/}
            <div className="container_row" style={{height: "10.5rem"}}>
                <div className="container_col">
                    <h2>⌛ ENDGAME</h2>
                    <table>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Position</th>
                        </tr>
                        </thead>
                        <tbody>
                        {[1, 2, 3].map((robot) => (<tr key={robot}>
                            <td>{robot}</td>
                            <td>
                                <select
                                    value={endgameDropdowns[robot]}
                                    onChange={e => handleEndgameChange(robot as 1 | 2 | 3, e.target.value)}
                                >
                                    {ENDGAME_OPTIONS.map((opt) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </td>
                        </tr>))}
                        </tbody>
                    </table>
                    <AllianceToggle
                        alliance={allianceEndgame}
                        checked={allianceEndgame === "red"}
                        onChange={() => allianceEndgame === "blue" ? setAllianceEndgame("red") : setAllianceEndgame("blue")}
                        label="" />
                </div>
                <div className="hr_vert" />
                <div className="container_col">
                    <h3>🟦 FOULS BLUE</h3>
                    <table>
                        <thead>
                        <tr>
                            <th>Foul</th>
                            <th>Count</th>
                        </tr>
                        </thead>
                        <tbody>{FOULS.map((foul) => (
                            <tr key={foul}>
                                <td>{foul}</td>
                                <td>
                                    <PlusMinusButton
                                        onPlus={foulHandlersBlue[foul]!.onPlus}
                                        onMinus={foulHandlersBlue[foul]!.onMinus}
                                    />
                                </td>
                                <td><p>
                                    {foul === "Minor"
                                        ? minorFoulCountBlue
                                        : foul === "Major"
                                            ? majorFoulCountBlue
                                            : adjustmentFoulCountBlue}
                                </p></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
                <div className="container_col">
                    <h3>🟥 FOULS RED</h3>
                    <table>
                        <thead>
                        <tr>
                            <th>Foul</th>
                            <th>Count</th>
                        </tr>
                        </thead>
                        <tbody>{FOULS.map((foul) => (
                            <tr key={foul}>
                                <td>{foul}</td>
                                <td>
                                    <PlusMinusButton
                                        onPlus={foulHandlersRed[foul]!.onPlus}
                                        onMinus={foulHandlersRed[foul]!.onMinus}
                                    />
                                </td>
                                <td><p>
                                    {foul === "Minor"
                                        ? minorFoulCountRed
                                        : foul === "Major"
                                            ? majorFoulCountRed
                                            : adjustmentFoulCountRed}
                                </p></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
                <div className="hr_vert" />
                <div className="container_col">
                    <h3>🏁 PENALTIES</h3>

                    <table>
                        <tbody>
                        {PENALTIES.map((penalty) => (
                            <tr key={penalty}>
                                <td>{penalty.toUpperCase()}</td>
                                <td>
                                    <input
                                        className="scale"
                                        type="checkbox"
                                        onChange={(event) => handlePenaltyChange(penalty, event.target.checked)}
                                    />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
        <div className="copyright">
            <p>© Developed by Jerry Fu 2025-{new Date().getFullYear()}</p>
        </div>
    </div>);
}
