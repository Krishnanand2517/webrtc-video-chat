import { FormEvent, useCallback, useState } from "react";

const LobbyScreen = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const handleSubmitForm = useCallback(
    (e: FormEvent) => {
      e.preventDefault();

      console.log(email, room);
    },
    [email, room]
  );

  return (
    <div>
      <h1>LobbyScreen</h1>

      <form onSubmit={handleSubmitForm}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
        />
        <br />
        <input
          type="text"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="Enter room id"
        />
        <br />
        <button>Join</button>
      </form>
    </div>
  );
};

export default LobbyScreen;
