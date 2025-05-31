import {useEffect, useState} from "react";
import {socket} from "./socket";
import "./App.scss";
import StatusBar from "./components/statusbar/StatusBar.tsx";
import PlusMinusButton from "./components/plusminusbutton/PlusMinusButton.tsx";
import AllianceToggle from "./components/alliancetoggle/AllianceToggle.tsx";
import {Alliance} from "./types.ts";

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
    const [reefCheckboxes, setReefCheckboxes] = useState(initialReefCheckboxes);

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

    const [netCount, setNetCount] = useState(0);
    const [processorCount, setProcessorCount] = useState(0);
    const [throughCount, setThroughCount] = useState(0);

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

    const scoringHandlers: Record<ScoringType, { onPlus: () => void; onMinus: () => void; }> = {
        Net: {
            onPlus: () => {
                setNetCount((c) => c + 1);
                socket.emit("score.algae.net:add", {
                    alliance: allianceNet,
                    count: 1,
                });
            },
            onMinus: () => {
                setNetCount((c) => Math.max(0, c - 1));
                if (!(netCount <= 0)) {
                    socket.emit("score.algae.net:remove", {
                        alliance: allianceNet,
                        count: 1,
                    });
                }
            },
        },
        Processor: {
            onPlus: () => {
                setProcessorCount((c) => c + 1);
                socket.emit("score.algae.processor:add", {
                    alliance: allianceProcessor,
                    count: 1,
                });
            },
            onMinus: () => {
                setProcessorCount((c) => Math.max(0, c - 1));
                if (!(processorCount <= 0)) {
                    socket.emit("score.algae.processor:remove", {
                        alliance: allianceProcessor,
                        count: 1,
                    });
                }
            },
        },
        Through: {
            onPlus: () => {
                setThroughCount((c) => c + 1);
                socket.emit("score.coral.through:add", {
                    alliance: allianceThrough,
                    count: 1,
                });
            },
            onMinus: () => {
                setThroughCount((c) => Math.max(0, c - 1));
                if (!(throughCount <= 0)) {
                    socket.emit("score.coral.through:remove", {
                        alliance: allianceThrough,
                        count: 1,
                    });
                }
            },
        }
    };

    function reefHandler(level: "l4" | "l3" | "l2", branch: "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l", value: boolean) {
        setReefCheckboxes(prev => ({
            ...prev,
            [`${level}-${branch}`]: value
        }));

        if (value) {
            socket.emit("score.coral:add", {
                alliance: allianceReef,
                level,
                branch,
            });
        } else {
            socket.emit("score.coral:remove", {
                alliance: allianceReef,
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
            setNetCount(0);
            setProcessorCount(0);
            setThroughCount(0);
            setMinorFoulCountRed(0);
            setMajorFoulCountRed(0);
            setAdjustmentFoulCountRed(0);
            setMinorFoulCountBlue(0);
            setMajorFoulCountBlue(0);
            setAdjustmentFoulCountBlue(0);
            setReefCheckboxes(initialReefCheckboxes);
            setAutoLeaveDropdowns({1: "Unknown", 2: "Unknown", 3: "Unknown"});
            setEndgameDropdowns({1: "Unknown", 2: "Unknown", 3: "Unknown"});

        });

        return () => {
            socket.off(); // clean up listeners
        };
    }, [initialReefCheckboxes]);

    return (<div>
        <StatusBar status={connected ? "Connected 🟢" : "Disconnected 🔴"} alliance={"Manual mode"} matchStatus={matchStatus} />

        <div className="core_container">
            {/* FIRST ROW */}
            <div className="container_row" style={{height: "11rem"}}>
                <div className="container_col">
                    <h2>🤖 AUTONOMOUS</h2>
                    <table>
                        <thead>
                        <tr>
                            <th>Robot #</th>
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
                        <tr>
                            <td>
                                <AllianceToggle
                                    alliance={allianceAuto}
                                    checked={allianceAuto === "red"}
                                    onChange={() => allianceAuto === "blue" ? setAllianceAuto("red") : setAllianceAuto("blue")}
                                    label="" />
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <div className="hr_vert" />
                <div className="container_col">
                    <h2>⌛ ENDGAME</h2>
                    <table>
                        <thead>
                        <tr>
                            <th>Robot #</th>
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
                        <tr>
                            <td>
                                <AllianceToggle
                                    alliance={allianceEndgame}
                                    checked={allianceEndgame === "red"}
                                    onChange={() => allianceEndgame === "blue" ? setAllianceEndgame("red") : setAllianceEndgame("blue")}
                                    label="" />
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <div className="hr_vert" />
                <div className="container_col">
                    <h2>🟦 FOULS BLUE</h2>
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
                    <h2>🟥 FOULS RED</h2>
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
            </div>

            <div className="hr_horiz" />

            {/* SECOND ROW */}
            <div className="container_row">
                <div className="container_col">
                    <table>
                        <thead>
                        <tr>
                            <th>Branch</th>
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
                                    <td key={`${level}-${branch}`}>
                                        <input
                                            className="scale"
                                            type="checkbox"
                                            checked={reefCheckboxes[`${level}-${branch}`] || false}
                                            onChange={event => reefHandler(level, branch, event.target.checked)}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                        <tr>
                            <td>
                                <AllianceToggle
                                    alliance={allianceReef}
                                    checked={allianceReef === "red"}
                                    onChange={() => allianceReef === "blue" ? setAllianceReef("red") : setAllianceReef("blue")}
                                    label="" />
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <div className="container_col">
                    <table>
                        <thead>
                        <tr>
                            <th>Net</th>
                            <th>Processor</th>
                            <th>L1</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>
                                <PlusMinusButton
                                    onPlus={() => scoringHandlers.Net.onPlus()}
                                    onMinus={() => scoringHandlers.Net.onMinus()}
                                />
                            </td>
                            <td>
                                <PlusMinusButton
                                    onPlus={() => scoringHandlers.Processor.onPlus()}
                                    onMinus={() => scoringHandlers.Processor.onMinus()}
                                />
                            </td>
                            <td>
                                <PlusMinusButton
                                    onPlus={() => scoringHandlers.Through.onPlus()}
                                    onMinus={() => scoringHandlers.Through.onMinus()}
                                />
                            </td>
                        </tr>
                        <tr>
                            <th>
                                <p>{netCount}</p>
                            </th>
                            <th>
                                <p>{processorCount}</p>
                            </th>
                            <th>
                                <p>{throughCount}</p>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <AllianceToggle
                                    alliance={allianceNet}
                                    checked={allianceNet === "red"}
                                    onChange={() => allianceNet === "blue" ? setAllianceNet("red") : setAllianceNet("blue")}
                                    label="" />
                            </th>
                            <th>
                                <AllianceToggle
                                    alliance={allianceProcessor}
                                    checked={allianceProcessor === "red"}
                                    onChange={() => allianceProcessor === "blue" ? setAllianceProcessor("red") : setAllianceProcessor("blue")}
                                    label="" />
                            </th>
                            <th>
                                <AllianceToggle
                                    alliance={allianceThrough}
                                    checked={allianceThrough === "red"}
                                    onChange={() => allianceThrough === "blue" ? setAllianceThrough("red") : setAllianceThrough("blue")}
                                    label="" />
                            </th>
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
                            <th>Team number</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>
                                1
                            </td>
                            <td>
                                0000
                            </td>
                        </tr>
                        <tr>
                            <td>
                                2
                            </td>
                            <td>
                                0000
                            </td>
                        </tr>
                        <tr>
                            <td>
                                3
                            </td>
                            <td>
                                0000
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/*<div className="hr_horiz" />*/}

            {/* THIRD ROW */}
            {/*<div className="container_row" style={{height: "12.5rem"}}>*/}
            {/*    <div className="container_col">*/}
            {/*        <h2>🏁 PENALTIES</h2>*/}

            {/*        <table>*/}
            {/*            <thead>*/}
            {/*            <tr>*/}
            {/*                <th>Penalty</th>*/}
            {/*                <th>Effect</th>*/}
            {/*            </tr>*/}
            {/*            </thead>*/}
            {/*            <tbody>*/}
            {/*            {PENALTIES.map((penalty) => (*/}
            {/*                <tr key={penalty}>*/}
            {/*                    <td>{penalty.toUpperCase()}</td>*/}
            {/*                    <td>*/}
            {/*                        <input*/}
            {/*                            className="scale"*/}
            {/*                            type="checkbox"*/}
            {/*                            onChange={(event) => handlePenaltyChange(penalty, event.target.checked)}*/}
            {/*                        />*/}
            {/*                    </td>*/}
            {/*                </tr>*/}
            {/*            ))}*/}
            {/*            </tbody>*/}
            {/*        </table>*/}
            {/*    </div>*/}

            {/*</div>*/}
        </div>
        <div className="copyright">
            <p>© Developed by Jerry Fu 2025-{new Date().getFullYear()}</p>
        </div>
    </div>);
}
