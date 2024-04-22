import { useEffect, useRef, useState } from 'react';
import './App.css';
import AttributeMDS from './Components/AttributeMDS/AttributeMDS';
import Pcp from './Components/PCPcomponent/Pcp';
import ScatterPlot from './Components/Scatterplot/ScatterPlot';

function App() {
  let [scatterPlotData, setScatterPlotData] = useState([])
  let [selectedAttributes, setSelectedAttributes] = useState(["Open","Close"])
  let [rerender, setRerender] = useState("")
  //Add new 0 to the list for every fetch call
  let fetchCalls = useRef([0])
  useEffect(() =>{
    if ((scatterPlotData.length <= 0 || rerender === "scatterPlot") && fetchCalls.current[0] === 0) {
      fetchCalls.current[0] = 1
      fetch("/api/getRawDataForManyAttributes", {
        method: 'post',
        headers: {'Content-Type':'application/json', 'accept': 'application/json'},
        body: JSON.stringify({
          "list": selectedAttributes
        })
      }).then(
        res => res.json()
      ).then(
        data => {
          setScatterPlotData(data)
        },
        fetchCalls.current[0] = 0
      )
    }
  }, [])
  return (
      <div className="container">
        {console.log(scatterPlotData)}
        <div className="top-row">
          {/* Line plot */}
          <div className="box">Div 1</div>
          {/* Candle plot */}
          <div className="box">Div 2</div>
          {/* Scatter plot */}
          <div className="box">Div 3</div>
        </div>
        <div className="bottom-row">
          {/* PCP */}
          <div className="big-box">
            <Pcp/>
          </div>
          {/* Attribute MDS */}
          <div className="box">
            <AttributeMDS/>
          </div>
        </div>
      </div>
  );
}

export default App;
