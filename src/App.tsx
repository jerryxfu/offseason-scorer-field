import {useEffect, useState} from "react";
import {socket} from "./socket";
import "./App.scss";
import StatusBar from "./components/statusbar/StatusBar.tsx";
import PlusMinusButton from "./components/plusminusbutton/PlusMinusButton.tsx";

export default function App() {
    const [connected, setConnected] = useState(false);
    const [matchStatus, setMatchStatus] = useState("⏳ Awaiting...");

    const AUTO_LEAVE_OPTIONS = ["Unknown", "Yes", "No"];
    const ENDGAME_OPTIONS = ["Unknown", "DeepCage", "ShallowCage", "Parked", "None"];
    const BRANCHES = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"] as const;
    const PENALTIES = ["g206", "g410", "g418", "g419", "g428"] as const;
    const FOULS = ["Minor", "Major", "Adjustment"] as const;
    const LEVELS = ["l4", "l3", "l2"] as const;

    const [netCount, setNetCount] = useState(0);
    const [processorCount, setProcessorCount] = useState(0);
    const [throughCount, setThroughCount] = useState(0);

    type FoulType = typeof FOULS[number];
    type PenaltyType = typeof PENALTIES[number];
    type ScoringType = "Net" | "Processor" | "Through";

    function handleAutoLeaveChange(robotId: 1 | 2 | 3, value: string) {
        const v = value === "Yes" ? "yes" : value === "No" ? "no" : "no";
        socket.emit("score.auto.leave:set", {
            alliance: "red",
            robotId: robotId,
            value: v,
        });
    }

    function handleEndgameChange(robotId: 1 | 2 | 3, value: string) {
        let state: "none" | "parked" | "deepcage" | "shallowcage" = "none";
        if (value === "DeepCage") state = "deepcage";
        else if (value === "ShallowCage") state = "shallowcage";
        else if (value === "Parked") state = "parked";
        socket.emit("score.endgame:set", {
            alliance: "red",
            robotId,
            state,
        });
    }

    const scoringHandlers: Record<ScoringType, { onPlus: () => void; onMinus: () => void; }> = {
        Net: {
            onPlus: () => {
                setNetCount((c) => c + 1);
                socket.emit("score.algae.processor:add", {
                    alliance: "red",
                    count: 1,
                });
            },
            onMinus: () => {
                setNetCount((c) => Math.max(0, c - 1));
                if (!(netCount <= 0)) {
                    socket.emit("score.algae.processor:remove", {
                        alliance: "red",
                        count: 1,
                    });
                }
            },
        },
        Processor: {
            onPlus: () => {
                setProcessorCount((c) => c + 1);
                socket.emit("score.algae.net:add", {
                    alliance: "red",
                    count: 1,
                });
            },
            onMinus: () => {
                setProcessorCount((c) => Math.max(0, c - 1));
                if (!(processorCount <= 0)) {
                    socket.emit("score.algae.net:remove", {
                        alliance: "red",
                        count: 1,
                    });
                }
            },
        },
        Through: {
            onPlus: () => {
                setThroughCount((c) => c + 1);
                socket.emit("score.coral.through:add", {
                    alliance: "red",
                    count: 1,
                });
            },
            onMinus: () => {
                setThroughCount((c) => Math.max(0, c - 1));
                if (!(throughCount <= 0)) {
                    socket.emit("score.coral.through:remove", {
                        alliance: "red",
                        count: 1,
                    });
                }
            },
        }
    };

    function reefHandler(level: "l4" | "l3" | "l2", branch: "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l", value: boolean) {
        if (value) {
            socket.emit("score.coral:add", {
                alliance: "red",
                level,
                branch,
            });
        } else {
            socket.emit("score.coral:remove", {
                alliance: "red",
                level,
                branch,
            });
        }
    }

    const [minorFoulCount, setMinorFoulCount] = useState(0);
    const [majorFoulCount, setMajorFoulCount] = useState(0);
    const [adjustmentFoulCount, setAdjustmentFoulCount] = useState(0);

    const foulHandlers: Record<FoulType, { onPlus: () => void; onMinus: () => void; }> = {
        Minor: {
            onPlus: () => {
                setMinorFoulCount((c) => c + 1);
                socket.emit("score.foul:add", {
                    alliance: "red",
                    type: "minor",
                    count: 1,
                });
            },
            onMinus: () => {
                setMinorFoulCount((c) => Math.max(0, c - 1));
                if (!(minorFoulCount <= 0)) {
                    socket.emit("score.foul:remove", {
                        alliance: "red",
                        type: "minor",
                        count: 1,
                    });
                }
            },
        },
        Major: {
            onPlus: () => {
                setMajorFoulCount((c) => c + 1);
                socket.emit("score.foul:add", {
                    alliance: "red",
                    type: "major",
                    count: 1,
                });
            },
            onMinus: () => {
                setMajorFoulCount((c) => Math.max(0, c - 1));
                if (!(majorFoulCount <= 0)) {
                    socket.emit("score.foul:remove", {
                        alliance: "red",
                        type: "major",
                        count: 1,
                    });
                }
            },
        },
        Adjustment: {
            onPlus: () => {
                setAdjustmentFoulCount((c) => c + 1);
                socket.emit("score.foul:add", {
                    alliance: "red",
                    type: "adjustment",
                    count: 1,
                });
            },
            onMinus: () => {
                setAdjustmentFoulCount((c) => Math.max(0, c - 1));
                if (!(adjustmentFoulCount <= 0)) {
                    socket.emit("score.foul:remove", {
                        alliance: "red",
                        type: "adjustment",
                        count: 1,
                    });
                }
            },
        },
    };

    function handlePenaltyChange(
        penalty: PenaltyType,
        value: boolean,
    ) {
        if (value) {
            socket.emit("score.penalty:set", {
                alliance: "red",
                type: penalty,
                value: true,
            });
        } else {
            socket.emit("score.penalty:set", {
                alliance: "red",
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
            setMinorFoulCount(0);
            setMajorFoulCount(0);
            setAdjustmentFoulCount(0);
        });

        return () => {
            socket.off(); // clean up listeners
        };
    }, []);

    return (<div>
        <StatusBar status={connected ? "Connected 🟢" : "Disconnected 🔴"} alliance={"Manual mode"} matchStatus={matchStatus} />

        <div className="core_container">
            {/* FIRST ROW */}
            <div className="container_row" style={{height: "10rem"}}>
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
                                <select onChange={e => handleAutoLeaveChange(robot as 1 | 2 | 3, e.target.value)}>
                                    {AUTO_LEAVE_OPTIONS.map((opt) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </td>
                        </tr>))}
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
                                <select onChange={e => handleEndgameChange(robot as 1 | 2 | 3, e.target.value)}>
                                    {ENDGAME_OPTIONS.map((opt) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </td>
                        </tr>))}
                        </tbody>
                    </table>
                </div>
                <div className="hr_vert" />
                <div className="container_col">
                    <h2>🚩 FOULS</h2>
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
                                        onPlus={foulHandlers[foul]!.onPlus}
                                        onMinus={foulHandlers[foul]!.onMinus}
                                    />
                                </td>
                                <td><p>
                                    {foul === "Minor"
                                        ? minorFoulCount
                                        : foul === "Major"
                                            ? majorFoulCount
                                            : adjustmentFoulCount}
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
                                <td>{level}</td>
                                {BRANCHES.map((branch) => (
                                    <td key={`${level}-${branch}`}>
                                        <input className="scale" type="checkbox"
                                               onChange={(event) => reefHandler(level, branch, event.target.checked)} />
                                    </td>
                                ))}
                            </tr>
                        ))}
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
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="hr_horiz" />

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
