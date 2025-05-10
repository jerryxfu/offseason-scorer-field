import {useEffect, useState} from "react";
import {socket} from "./socket";
import "./App.scss";

export default function App() {
    const [connected, setConnected] = useState(false);

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

        return () => {
            socket.off(); // clean up listeners
        };
    }, []);

    const sendScore = () => {
        socket.emit("score:add", {alliance: "blue", points: 5});
    };

    return (
        <div>
            <h1>Scorer</h1>
            <p>Status: {connected ? "Connected" : "Disconnected"}</p>
            <button onClick={sendScore}>+5 Blue</button>
            <div className="scoreboard">
                <div className="auto">
                    <div>
                        <p><b>Auto</b></p>
                        <ul>
                            <li>1</li>
                            <li>2</li>
                            <li>3</li>
                        </ul>
                    </div>

                    <div style={{marginLeft: "30px"}}>
                        <p style={{marginTop: "6px", marginBottom: "7px"}}>Leave</p>
                        <select id="leave_1">
                            <option value="Unknown">Unknown</option>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                        </select>
                        <br></br>
                        <select id="leave_2">
                            <option value="Unknown">Unknown</option>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                        </select>
                        <br></br>
                        <select id="leave_3">
                            <option value="Unknown">Unknown</option>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                        </select>
                    </div>
                </div>
                <div className="endgame">
                    <div>
                        <p><b>Endgame</b></p>
                        <ul>
                            <li>1</li>
                            <li>2</li>
                            <li>3</li>
                        </ul>
                    </div>

                    <div> 
                        <br></br>
                        <select id="barge_1" style={{marginTop: "14px"}}>
                            <option value="Unknown">Unknown</option>
                            <option value="None">None</option>
                            <option value="Parked">Parked</option>
                            <option value="ShallowCage">ShallowCage</option>
                            <option value="DeepCage">DeepCage</option>
                        </select>
                        <br></br>
                        <select id="barge_2">
                            <option value="Unknown">Unknown</option>
                            <option value="None">None</option>
                            <option value="Parked">Parked</option>
                            <option value="ShallowCage">ShallowCage</option>
                            <option value="DeepCage">DeepCage</option>
                        </select>
                        <br></br>
                        <select id="barge_3">
                            <option value="Unknown">Unknown</option>
                            <option value="None">None</option>
                            <option value="Parked">Parked</option>
                            <option value="ShallowCage">ShallowCage</option>
                            <option value="DeepCage">DeepCage</option>
                        </select>
                    </div>
                </div>
                <div className="bonuses">
                    <div>
                        <p><b>Bonuses</b></p>
                        <ul>
                            <li>Auto Bonus</li>
                            <li>Coral Bonus</li>
                            <li>Barge Bonus</li>
                            <li>Coopertition</li>
                        </ul>
                    </div>

                    <div style={{marginLeft: "30px"}}>
                        <select id="leave_1">
                            <option value="Unknown">Unknown</option>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                        </select>
                        <br></br>
                        <select id="leave_2">
                            <option value="Unknown">Unknown</option>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                        </select>
                        <br></br>
                        <select id="leave_3">
                            <option value="Unknown">Unknown</option>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
