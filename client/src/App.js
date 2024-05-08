import { useEffect, useRef, useState } from 'react';
import './App.css';
import AttributeMDS from './Components/AttributeMDS/AttributeMDS';
import Pcp from './Components/PCPcomponent/Pcp';
import ScatterPlot from './Components/Scatterplot/ScatterPlot';
import ProfitLineGraph from './Components/ProfitLineGraph/ProfitLineGraph';

function App() {
  const api_variable_names = {
    "data": "data",
    "vooData": "vd",
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
const colorMapping = {
  0: "red",
  1: "orange",
  2: "yellow",
  3: "green",
  4: "blue",
  5: "indigo",
  6: "lavender",
  7: "cyan",
  8: "pink",
  9: "lime",
  10: "magenta",
  11: "brown",
  12: "white",
  13: "olive",
  14: "peach",
  15: "maroon",
  16: "violet",
  17: "turquoise",
  18: "teal",
  19: "salmon"
};

  let [scatterPlotData, setScatterPlotData] = useState([])
  let [pcpAxisOrder,setPcpAxisOrder] = useState([])
  let [categoryNames,setCategoryNames] = useState([])
  let [allData,setAllData] = useState([])
  let [vooData, setVooData] = useState([])
  let [kIndex,setKIndex] = useState(0)
  let [elbowIndex,setElbowIndex] = useState(0)
  let [label,setLabel] = useState([])
  let [variableMDScoordinates,setVariableMDScoordinates] = useState([])
  let [selectedAttributes, setSelectedAttributes] = useState(["Open","Close"])
  let [rerender, setRerender] = useState("")
  //Add new 0 to the list for every fetch call
  let fetchCalls = useRef([0,0])
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
    
    if (fetchCalls.current[1] === 0) {
      fetchCalls.current[1] = 1
      fetch("/api/getInitialStats/", {
        method: 'get'
      }).then(
        res => res.json()
      ).then(
        data => {
          setCategoryNames(data[api_variable_names["categoryNames"]])
          setAllData(data[api_variable_names["data"]])
          setVooData(data[api_variable_names["vooData"]])
          setKIndex(data[api_variable_names["kIndex"]])
          setElbowIndex(data[api_variable_names["elbowindex"]])
          setLabel(data[api_variable_names["labels"]])
          setVariableMDScoordinates(data[api_variable_names["varMDS"]])
          if(data[api_variable_names["data"]][0]!=undefined && data[api_variable_names["data"]][0] != undefined){
            //Initialize array from 0 -> length of allData[0]
            setPcpAxisOrder(()=>{
              let arr = []
              //Going up to length because of extra attribute - break up Date into month and year
              for(let i = 0; i <= data[api_variable_names["data"]][0].length;i++){
                arr.push(i)
              }
              return arr
            })

            let tempCategoryList = []
            for(let i = 0;i<data[api_variable_names["categoryNames"]].length;i++){
                if(i!=1){
                    tempCategoryList.push(data[api_variable_names["categoryNames"]][i])
                }
                else{
                    tempCategoryList.push("Year")
                    tempCategoryList.push("Month")
                }
            }
            setCategoryNames(tempCategoryList)
          }
        },
        // fetchCalls.current[1] = 0
      )
    }
  }, [])
  return (
      <div className="container">
        <div className="top-row">
          {/* Line plot */}
          <div className="box">Div 1</div>
          {/* Candle plot */}
          <div className="box">Div 2</div>
          <div id="scatterPlotBox" className="box">
            <ScatterPlot width={window.visualViewport.width * .28} height={window.visualViewport.height * .4} data={Object.keys(scatterPlotData).map((key) => scatterPlotData[key])[0]} xAxisLabel={"Open"} yAxisLabel={"Close"} xTicks={10} yTicks={10} />
          </div>
        </div>
        <div className="bottom-row">
          {/* PCP */}
          <div id="compareContainer">
            <ProfitLineGraph categoryNames={categoryNames.slice(0, 8)} vooData={vooData} allData={allData}/>
          </div>
          {/* Attribute MDS */}
          <div className="pcpContainer">
            <Pcp colorMapping={colorMapping} categoryNames={categoryNames} allData={allData} label={label} pcpAxisOrder={pcpAxisOrder} setPcpAxisOrder={setPcpAxisOrder}/>
            {/* <AttributeMDS colorMapping={colorMapping} categoryNames={categoryNames} kIndex={kIndex} elbowIndex={elbowIndex} label={label} variableMDScoordinates={variableMDScoordinates} pcpAxisOrder={pcpAxisOrder} setPcpAxisOrder={setPcpAxisOrder}/> */}
          </div>
        </div>
      </div>
  );
}

export default App;
