import React, { MutableRefObject } from 'react';
import logo from './logo.svg';
import './App.css';
import MidiWriter from 'midi-writer-js';

function App() {
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  const lastTimestamp : MutableRefObject<number> = React.useRef(0);
  const history : MutableRefObject<[string, number, number][]>= React.useRef([]);
  const beatsPerMinute : MutableRefObject<number>= React.useRef(77);

  const dict : [string, number][] = [
    ["1", 1],

    ["dd2", 1/2 + 1/4 + 1/8],
    ["d2", 1/2 + 1/4],
    ["2", 1/2],

    ["dd4", 1/4 + 1/8 + 1/16],
    ["d4", 1/4 + 1/8],
    ["4", 1/4],
    ["4t", 1/6],

    ["d8", 1/8 + 1/16],
    ["8", 1/8],
    ["8t", 1/12],

    ["d16", 1/16 + 1/32],
    ["16", 1/16],
    ["16t", 1/24],

    ["32", 1/32],

    ["64", 1/32],
  ]

  function convertLengthToPercent(t : number, bpm : number) : number {
    const n = t / 1000;
    const b = 1 / (bpm / 60) * 4;
    const val = n / b;
    return val;
  }

  function convertPercentToNote(p : number) : string {
    return (dict.sort( (a,b) => {
      return (Math.abs(a[1] - p)) - (Math.abs(b[1] - p))
    } )[0])[0];
  }

  function click() {
    if(lastTimestamp.current > 0) {
      const t = Date.now() - lastTimestamp.current;

      history.current.push([convertPercentToNote(convertLengthToPercent(t, beatsPerMinute.current)), t, Date.now()]);
      lastTimestamp.current = Date.now();
      
      console.log(history.current[history.current.length - 1].toString() + "ms -> " + convertPercentToNote(convertLengthToPercent(t, beatsPerMinute.current)));
    }
    else {
      lastTimestamp.current = Date.now();
    }

    forceUpdate();
  }

  function clear() {
    lastTimestamp.current = 0;
    history.current = [];
    console.clear();

    forceUpdate();
  }

  function generateMIDI() {
    const track = new MidiWriter.Track();

    track.addEvent(new MidiWriter.ProgramChangeEvent({instrument: 1}));

    history.current.forEach((e) => {
      const note = new MidiWriter.NoteEvent({pitch: ["G4"], duration: e[0]});
      track.addEvent(note);
    });

    const write = new MidiWriter.Writer(track);
    console.log(write.dataUri());

    forceUpdate();
  }

  const Result = () => {
    const arr : JSX.Element[] = [];
    history.current.forEach((e) => {
      arr.push(<p key={e.toString()}>{convertPercentToNote(convertLengthToPercent(e[1], beatsPerMinute.current))}</p>);
    });

    return (
      <div>
        {arr}
      </div>
    );
  }

  const Body = () => {
    return (
      <div>
        <button onClick={click}>{"Click here"}</button>
        <button onClick={clear}>{"Reset"}</button>
        <button onClick={generateMIDI}>{"Generate MIDI"}</button>
        <Result />
      </div>
    );
  }

  return (
    <div className="App">
      <Body />
    </div>
  );
}

export default App;
