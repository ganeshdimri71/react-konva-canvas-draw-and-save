import React from "react";
import "./App.css";
import LineDrawOne from "./components/LineDrawOne";
import LineDrawWithSnap from "./components/LineDrawWithSnap";

function App() {
  return (
    <div className="App">
      {/* <LineDrawOne /> */}
      <LineDrawWithSnap />
    </div>
  );
}

export default App;

/* Use Transformer for Selection: https://konvajs.org/docs/select_and_transform/Basic_demo.html
Use Group for creating individual shape: https://konvajs.org/docs/groups_and_layers/Groups.html
*/
