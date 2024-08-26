import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";

// Replace with your server URL
const socket = io("http://localhost:3000", {
  transports: ["websocket"], // Ensure the WebSocket transport is used
});

function FinanceApp() {
  const [total, setTotal] = useState(0);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch initial total
    fetchTotal();

    // Listen for 'total' events from the server
    socket.on("total", (newTotal) => {
      setTotal(newTotal);
    });

    // Clean up the connection on component unmount
    return () => {
      socket.off("total");
    };
  }, []);

  //   Fetch total
  const fetchTotal = async () => {
    try {
      const response = await fetch("http://localhost:3000/total");
      const data = await response.json();
      setTotal(data.total);
    } catch (error) {
      setError("There was an error fetching the total!");
    }
  };

  //   Add
  const handleAdd = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      setError("Invalid amount");
      return;
    }
    try {
      await axios.post("http://localhost:3000/add", { amount: parsedAmount });
      setAmount("");
    } catch (error) {
      setError("There was an error adding the amount!");
    }
  };

  //   Remove
  const handleRemove = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      setError("Invalid amount");
      return;
    }
    try {
      await axios.post("http://localhost:3000/remove", {
        amount: parsedAmount,
      });
      setAmount("");
    } catch (error) {
      setError("There was an error removing the amount!");
    }
  };

  return (
    <div className="container">
      <h1>Finance App</h1>
      <div className="total-display">
        <h2>Total: ${total}</h2>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="controls">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
        />
        <button onClick={handleAdd}>Add</button>
        <button onClick={handleRemove}>Remove</button>
      </div>
    </div>
  );
}

export default FinanceApp;
