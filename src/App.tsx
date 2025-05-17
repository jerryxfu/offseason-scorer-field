import {useEffect, useState} from "react";
import {socket} from "./socket";

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
            <p>Status: {connected ? "Connected 🟢" : "Disconnected 🔴"}</p>
            <h1>Scorer</h1>
            <button onClick={sendScore}>+5 Blue</button>
        </div>
    );
}
