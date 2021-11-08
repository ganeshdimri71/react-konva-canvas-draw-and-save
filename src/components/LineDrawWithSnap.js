import React, { useEffect, useState, useRef } from "react";
import { Circle, Layer, Line, Stage } from "react-konva";
import { useDispatch, useSelector } from "react-redux";
import {
  getNodes,
  getHistory,
  getLines,
  getTempLine,
  getTempLineHistory,
  updateTempLine,
  updateTempLineHistory,
  updateNodes,
  updateLines,
  updateHistory,
  getCursorPoint,
  updateCursorPoint,
} from "../features/shapesSlice";
import jsPDF from "jspdf";

const LineDrawWithSnap = () => {
  const stageRef = useRef();
  const [tool, setTool] = useState("draw"); // setting default tool to be "draw"
  const dispatch = useDispatch(); // creating dispatch variable
  const lines = useSelector(getLines); // creating lines array and assigning values from store
  const tempLine = useSelector(getTempLine); // creating temp lines array and assigning values from store
  const nodes = useSelector(getNodes); // creating nodes array and assigning values from store
  const history = useSelector(getHistory); // creating history array and assigning values from store
  const tempLineHistory = useSelector(getTempLineHistory); // creating temporary line history array and assigning values from store
  const cursorPoint = useSelector(getCursorPoint); // getting cursor point

  const createNode = (e) => {
    // if mouse click is left button click
    if (window.event.which === 1) {
      let name = "node"; //name to define its property
      if (tool === "draw") {
        let pos = e.target.getStage().getPointerPosition(); // getting present cursor position

        let oldNodes = nodes.slice(0, nodes.length); // getting previous nodes array
        // pushing new node to old nodes array
        oldNodes.push([
          pos.x,
          pos.y,
          pos.x - 10,
          pos.x + 10,
          pos.y - 10,
          pos.y + 10,
          nodes.length,
          name,
        ]);
        dispatch(
          /* Dispatching new node array to store for updation */
          updateNodes(oldNodes)
        );
        if (nodes.length > 0) {
          dispatch(
            /* Dispatching temporary line to lines array to store for updation */
            updateLines([
              ...lines,
              {
                points: [
                  tempLine?.points[0],
                  tempLine?.points[1],
                  tempLine?.points[2],
                  tempLine?.points[3],
                ],
                id: tempLine?.id,
                name: "line",
              },
            ])
          );
        }
        dispatch(
          /* clearing temporary line */
          updateTempLine([])
        );
      }
    } else {
      /* won't create node when right and middle buttons are pressed */
      dispatch(updateNodes([...nodes]));
    }
  };

  const createTemporaryLine = (e) => {
    let name = "tempLine";
    let pos = e.target.getStage().getPointerPosition();
    if (tool === "draw") {
      /* loading last node's data */
      if (nodes.length > 0) {
        let lastNode = nodes[nodes.length - 1];
        /* dispatching temporary line's positions */
        dispatch(
          updateTempLine({
            points: [lastNode[0], lastNode[1], pos.x, pos.y],
            id: lines.length,
            name,
          })
        );
      }
    }
    /* updating current cursor position, this can be used to get temporary line when tool is switched from view to draw */
    dispatch(updateCursorPoint({ x: pos.x, y: pos.y }));
  };

  const updateNode = (e) => {
    if (tool === "selection") {
      let _x = e?.target?.attrs?.x; //getting present cursor position value and setting it onto x
      let _y = e?.target?.attrs?.y; //getting present cursor position value and setting it onto y
      let _id = e?.target?.attrs?.id; //getting old node id using event
      let _name = e?.target?.attrs?.name; //getting old node name using event

      // copying nodes array values to new variable
      let newNodes = nodes.slice(0, nodes.length);
      /* put old value to history in here, as of now it can't be done */
      /* Updating the x,y co-ordinates of node in old nodes array */
      newNodes[_id] = [_x, _y, _x - 10, _x + 10, _y - 10, _y + 10, _id, _name];
      dispatch(updateNodes(newNodes));

      if (nodes.length > 1) {
        // allows dragging only single node created without line
        if (_id === 0) {
          /* Changing first node's position and line connected to it */
          let newlines = lines.slice(0, lines.length);
          newlines[_id] = {
            points: [_x, _y, newNodes[_id + 1][0], newNodes[_id + 1][1]],
            id: _id,
            name: "line",
          };
          dispatch(updateLines(newlines));
        } else if (_id === newNodes.length - 1) {
          /* Changing last node's position and line connected to it */
          let newlines = lines.slice(0, lines.length - 1);
          newlines[_id] = {
            points: [newNodes[_id - 1][0], newNodes[_id - 1][1], _x, _y],
            id: _id,
            name: "line",
          };
          dispatch(updateLines(newlines));
        } else {
          /* Changing middles node's position and line's connected to it */
          let newlines = lines.slice(0, lines.length);
          newlines[_id - 1] = {
            points: [newNodes[_id - 1][0], newNodes[_id - 1][1], _x, _y],
            id: _id - 1,
            name: "line",
          };
          newlines[_id] = {
            points: [_x, _y, newNodes[_id + 1][0], newNodes[_id + 1][1]],
            id: _id,
            name: "line",
          };
          dispatch(updateLines(newlines));
        }
      }
    }
  };

  const reset = () => {
    /* Emptying all arrays */
    dispatch(updateTempLine([]));
    dispatch(updateLines([]));
    dispatch(updateNodes([]));
    dispatch(updateHistory([]));
    dispatch(updateTempLineHistory([]));
  };

  const undo = () => {
    if (lines.length === 0 || nodes.length === 0) {
      return;
    } else {
      /* getting value of line which is going to be removed */
      let removedLine = lines.slice(lines.length - 1, lines.length);
      /* getting value of node which is going to be removed */
      let removedNode = nodes.slice(nodes.length - 1, nodes.length);
      /* getting value of line which is going to be kept */
      let newLines = lines.slice(0, lines.length - 1);
      /* getting value of node which is going to be kept */
      let newNodes = nodes.slice(0, nodes.length - 1);
      if (tempLine) {
        dispatch(
          updateTempLine({
            points: [
              newNodes[newNodes.length - 1][0],
              newNodes[newNodes.length - 1][1],
              tempLine?.points[2],
              tempLine?.points[3],
            ],
            id: tempLine?.id,
            name: tempLine?.name,
          })
        );
      }
      dispatch(updateLines(newLines));
      dispatch(updateNodes(newNodes));
      dispatch(updateHistory([...history, removedLine, removedNode, tempLine]));
    }
  };

  const redo = () => {
    if (history.length === 0) {
      return;
    }
    /* getting value of line which is going to be added */
    let addingLine = history[history.length - 3];
    /* getting value of node which is going to be added */
    let addingNode = history[history.length - 2];
    /* getting value of history which is going to be kept */
    let latestHistory = history.slice(0, history.length - 3);
    dispatch(updateHistory(latestHistory));
    /* getting value of line which is going to be kept */
    let newLines = lines.slice(0, lines.length);
    /* getting value of node which is going to be kept */
    let newNodes = nodes.slice(0, nodes.length);
    let latestLines = [];
    let latestNodes = [];
    /* adding value's of lines which is going to be kept */
    latestLines = newLines.concat(addingLine);
    /* adding value's of nodes which is going to be kept */
    latestNodes = newNodes.concat(addingNode);
    dispatch(updateLines(latestLines));
    dispatch(updateNodes(latestNodes));

    if (tempLine) {
      dispatch(
        updateTempLine({
          points: [
            latestNodes[latestNodes.length - 1][0],
            latestNodes[latestNodes.length - 1][1],
            tempLine.points[2],
            tempLine.points[3],
          ],
          id: tempLine.id,
          name: tempLine.name,
        })
      );
    }
  };

  const changeTool = () => {
    if (tool === "draw") {
      setTool("selection");
      dispatch(updateTempLineHistory(tempLine));
      dispatch(updateTempLine([]));
    } else {
      setTool("draw");
      /* updating temporary line with respect to current cursor position */
      if (tempLineHistory) {
        dispatch(
          updateTempLine({
            points: [
              tempLineHistory?.points[0],
              tempLineHistory?.points[1],
              cursorPoint?.x,
              cursorPoint?.y,
            ],
            id: tempLineHistory?.id,
            name: tempLineHistory?.name,
          })
        );
        dispatch(updateTempLineHistory([]));
      }
    }
  };

  useEffect(() => {
    const undoRedoFunction = (event) => {
      if (event.ctrlKey && (event.key === "z" || event.key === "Z")) {
        undo();
      } else if (event.ctrlKey && (event.key === "y" || event.key === "Y")) {
        redo();
      }
    };

    const drawSelect = (event) => {
      if (event.key === "p" || event.key === "P") {
        changeTool();
      } else if (event.key === "v" || event.key === "V") {
        changeTool();
      }
    };

    document.addEventListener("keydown", undoRedoFunction);
    document.addEventListener("keydown", drawSelect);
    return () => {
      document.removeEventListener("keydown", undoRedoFunction);
      document.removeEventListener("keydown", drawSelect);
    };
  }, [undo, redo, changeTool]);

  const savePdf = () => {
    let pdf = new jsPDF("l", "px", [window.innerWidth, window.innerHeight]);
    pdf.setTextColor("#000000");
    // first add texts
    stageRef.current.find("Text").forEach((text) => {
      const size = text.fontSize() / 0.75; // convert pixels to points
      pdf.setFontSize(size);
      pdf.text(text.text(), text.x(), text.y(), {
        baseline: "top",
        angle: -text.getAbsoluteRotation(),
      });
    });

    // then put image on top of texts (so texts are not visible)
    pdf.addImage(
      stageRef.current.toDataURL({ pixelRatio: 5 }), // increases quality by 5 times
      0,
      0,
      window.innerWidth,
      window.innerHeight
    );
    let name = prompt("Enter file name");
    pdf.save(name);
  };

  const downloadURI = (uri, name) => {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const savePng = () => {
    const uri = stageRef.current.toDataURL({ pixelRatio: 5 });
    /* toDataURL() method returns a data URI containing a representation of the image in the format specified by the type parameter (defaults to PNG). The returned image is in a resolution of 96 dpi. If the height or width of the canvas is 0 or larger than the maximum canvas size, the string "data:," is returned */
    // console.log(uri);
    // we also can save uri as file
    let name = prompt("Enter file name");
    downloadURI(uri, `${name}.png`);
  };

  return (
    <div>
      <div className="header">
        <div>
          <input
            type="radio"
            id="selection"
            checked={tool === "selection"}
            onChange={changeTool}
          />
          <label htmlFor="selection">Selection</label>
        </div>
        <div>
          <input
            type="radio"
            id="draw"
            checked={tool === "draw"}
            onChange={changeTool}
          />
          <label htmlFor="draw">Draw</label>
        </div>
        <button
          onClick={undo}
          style={{
            padding: "5px 15px",
            background: "red",
            color: "white",
            margin: "5px",
            outlineWidth: 0,
            border: "1px solid black",
            borderRadius: "999px",
            boxShadow: "2px 2px 3px 1px rgba(0,0,0,0.3)",
          }}
        >
          Undo
        </button>
        <button
          onClick={redo}
          style={{
            padding: "5px 15px",
            background: "green",
            color: "white",
            margin: "5px",
            outlineWidth: 0,
            border: "1px solid black",
            borderRadius: "999px",
            boxShadow: "2px 2px 3px 1px rgba(0,0,0,0.3)",
          }}
        >
          Redo
        </button>
        <button
          onClick={reset}
          style={{
            padding: "5px 15px",
            background: "dimgray",
            color: "white",
            margin: "5px",
            outlineWidth: 0,
            border: "1px solid black",
            borderRadius: "999px",
            boxShadow: "2px 2px 3px 1px rgba(0,0,0,0.3)",
          }}
        >
          Reset
        </button>
        <button
          onClick={savePdf}
          style={{
            padding: "5px 15px",
            background: "orangered",
            color: "white",
            margin: "5px",
            outlineWidth: 0,
            border: "1px solid black",
            borderRadius: "999px",
            boxShadow: "2px 2px 3px 1px rgba(0,0,0,0.3)",
          }}
        >
          Save as PDF
        </button>
        <button
          onClick={savePng}
          style={{
            padding: "5px 15px",
            background: "#4267B2",
            color: "white",
            margin: "5px",
            outlineWidth: 0,
            border: "1px solid black",
            borderRadius: "999px",
            boxShadow: "2px 2px 3px 1px rgba(0,0,0,0.3)",
          }}
        >
          Save as Image
        </button>
      </div>
      <Stage
        style={{ border: "2px dashed black" }}
        width={window.innerWidth - 30}
        height={window.innerHeight - 45}
        onClick={createNode}
        onMouseMove={createTemporaryLine}
        id="stage"
        ref={stageRef}
      >
        <Layer>
          <Line
            key={Math.abs(Math.random() * 12345)}
            points={tempLine.points}
            //stroke="#df4b26"
            stroke="#959595"
            strokeWidth={1}
            tension={0.5}
            lineCap="round"
            id={tempLine.id}
          />
          {lines.map((line) => (
            <>
              <Line
                key={Math.abs(Math.random() * 12345)}
                points={line.points}
                //stroke="#df4b26"
                stroke="#959595"
                strokeWidth={1}
                tension={0.5}
                lineCap="round"
                id={line.id}
              />
            </>
          ))}
          {nodes.map((node) => (
            <>
              <Circle
                key={node[6]}
                x={node[0]}
                y={node[1]}
                radius={4}
                stroke={"#adb5bd"}
                fill={"#adb5bd"}
                strokeWidth={2}
                draggable
                onDragMove={(e) => updateNode(e)}
                id={node[6]}
                name={node[7]}
              />
            </>
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default LineDrawWithSnap;
