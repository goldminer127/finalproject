import { useEffect, useRef, useState } from 'react';
import './App.css';
import AttributeMDS from './Components/AttributeMDS/AttributeMDS';
import Pcp from './Components/PCPcomponent/Pcp';
import ScatterPlot from './Components/Scatterplot/ScatterPlot';

function App() {
  const api_variable_names = {
    "data": "data",
    "numericalData":"nd",
    "rawData":"rd",
    "categoryNames":'cn',
    "kIndex": "ki",
    "elbowindex": "ei",
    "listOfMSE": "mse",
    "labels": "labels",
    "varMDS": "varMDS",
    "corMatrix": "corMatrix"
}
  let [scatterPlotData, setScatterPlotData] = useState([])
  let [pcpAxisOrder,setPcpAxisOrder] = useState([])
  let [categoryNames,setCategoryNames] = useState([])
  let [allData,setAllData] = useState([])
  let [kIndex,setKIndex] = useState(0)
  let [elbowIndex,setElbowIndex] = useState(0)
  let [label,setLabel] = useState([])
  let [variableMDScoordinates,setVariableMDScoordinates] = useState([])
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
    
    if (fetchCalls.current[0] === 0) {
      fetchCalls.current[0] = 1
      fetch("/api/getInitialStats/", {
        method: 'get'
      }).then(
        res => res.json()
      ).then(
        data => {
          setCategoryNames(data[api_variable_names["categoryNames"]])
          setAllData(data[api_variable_names["data"]])
          setKIndex(data[api_variable_names["kIndex"]])
          setElbowIndex(data[api_variable_names["elbowindex"]])
          setLabel(data[api_variable_names["labels"]])
          setVariableMDScoordinates(data[api_variable_names["varMDS"]])
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
            <Pcp categoryNames={categoryNames} allData={allData} label={label} pcpAxisOrder={pcpAxisOrder} setPcpAxisOrder={setPcpAxisOrder}/>
          </div>
          {/* Attribute MDS */}
          <div className="box">
            <AttributeMDS categoryNames={categoryNames} kIndex={kIndex} elbowIndex={elbowIndex} label={label} variableMDScoordinates={variableMDScoordinates} pcpAxisOrder={pcpAxisOrder} setPcpAxisOrder={setPcpAxisOrder}/>
          </div>
        </div>
      </div>
  );
}

export default App;
