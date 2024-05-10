import { useEffect, useRef, useState } from 'react';
import './App.css';
import AttributeMDS from './Components/AttributeMDS/AttributeMDS';
import Pcp from './Components/PCPcomponent/Pcp';
import ScatterPlot from './Components/Scatterplot/ScatterPlot';
import ProfitLineGraph from './Components/ProfitLineGraph/ProfitLineGraph';
import LinePlot from './Components/LinePlot/LinePlot';
import CandleStick from './Components/CandleStickComponent/CandleStick';

function App() {
  const api_variable_names = {
    "data": "data",
    "vooData": "vd",
    "numericalData": "nd",
    "rawData": "rd",
    "categoryNames": 'cn',
    "kIndex": "ki",
    "elbowindex": "ei",
    "listOfMSE": "mse",
    "labels": "labels",
    "varMDS": "varMDS",
    "corMatrix": "corMatrix"
  }
  const attribute = {
    "Open": 2,
    "High": 3,
    "Low": 4,
    "Close": 5,
    "Adj Close": 6,
    "Volume": 7,
    "Outstanding": 8,
    "EPS": 9,
    "Net Income": 11,
    "EBITDA": 12,
    "Operating Income": 13,
    "Gross Profit": 14,
    "Revenue": 15,
    "P/E Ratio": 16,
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
  let [candleStickPlotData, setCandleStickPlotData] = useState([])
  let [pcpAxisOrder, setPcpAxisOrder] = useState([])
  let [categoryNames, setCategoryNames] = useState([])
  let [allData, setAllData] = useState([])
  let [vooData, setVooData] = useState([])
  let [kIndex, setKIndex] = useState(0)
  let [elbowIndex, setElbowIndex] = useState(0)
  let [label, setLabel] = useState([])
  let [variableMDScoordinates, setVariableMDScoordinates] = useState([])
  let [selectedAttributes, setSelectedAttributes] = useState(["Open", "Close"])
  let [rerender, triggerRerender] = useState("")
  // useState for start and end date inputs
  const [startDate, setStartDate] = useState('2014-01');
  const [endDate, setEndDate] = useState('2023-12');
  const [selectedStock, setSelectedStock] = useState("GOOGL")
  var [selectedStockIndex,setSelectedStockIndex] = useState(0)
  //Add new 0 to the list for every fetch call
  let fetchCalls = useRef([0, 0])
  useEffect(() => {
    /*
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
          console.log(data)
          setScatterPlotData(data)
        },
        fetchCalls.current[0] = 0
      )
    }
    */
    if (rerender === "selectedStock" || rerender === "selectedAttributes") {
      triggerRerender("")
      let tempArr = []
      let tempArrCandle = []
      for (let i = 0; i < allData.length; i++) {
        if (allData[i][0] === selectedStock) {
          tempArr.push([allData[i][attribute[selectedAttributes[0]]], allData[i][attribute[selectedAttributes[1]]]])
          tempArrCandle.push([allData[i][1], [allData[i][attribute["High"]], allData[i][attribute["Low"]], allData[i][attribute["Open"]], allData[i][attribute["Close"]]]])
        }
      }
      setScatterPlotData(tempArr)
      setCandleStickPlotData(tempArrCandle)
    }
    if (fetchCalls.current[1] === 0) {
      fetchCalls.current[1] = 1
      fetch("/api/getInitialStats/", {
        method: 'get'
      }).then(
        res => res.json()
      ).then(
        data => {
          let rawData = data[api_variable_names["data"]]
          setCategoryNames(data[api_variable_names["categoryNames"]])
          setAllData(rawData)
          setVooData(data[api_variable_names["vooData"]])
          setKIndex(data[api_variable_names["kIndex"]])
          setElbowIndex(data[api_variable_names["elbowindex"]])
          setLabel(data[api_variable_names["labels"]])
          setVariableMDScoordinates(data[api_variable_names["varMDS"]])
          if (data[api_variable_names["data"]][0] != undefined && data[api_variable_names["data"]][0] != undefined) {
            //Initialize array from 0 -> length of allData[0]
            setPcpAxisOrder(() => {
              let arr = []
              //Going up to length because of extra attribute - break up Date into month and year
              for (let i = 0; i <= data[api_variable_names["data"]][0].length; i++) {
                arr.push(i)
              }
              return arr
            })

            let tempCategoryList = []
            for (let i = 0; i < data[api_variable_names["categoryNames"]].length; i++) {
              if (i != 1) {
                tempCategoryList.push(data[api_variable_names["categoryNames"]][i])
              }
              else {
                tempCategoryList.push("Year")
                tempCategoryList.push("Month")
              }
            }
            setCategoryNames(tempCategoryList)
          }
          let tempArr = []
          let tempArrCandle = []
          for (let i = 0; i < rawData.length; i++) {
            if (rawData[i][0] === selectedStock) {
              tempArr.push([rawData[i][attribute[selectedAttributes[0]]], rawData[i][attribute[selectedAttributes[1]]]])
              tempArrCandle.push([rawData[i][1], [rawData[i][attribute["High"]], rawData[i][attribute["Low"]], rawData[i][attribute["Open"]], rawData[i][attribute["Close"]]]])
            }
          }
          setScatterPlotData(tempArr)
          setCandleStickPlotData(tempArrCandle)
        },
        // fetchCalls.current[1] = 0
      )
    }
  })
  return (
    <div className="container">
      <div className="top-row">
        {/* Line plot */}
        <div id="linePlot">
          <LinePlot colorMapping={colorMapping} vooData={vooData} allData={allData} startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} selectedStock={selectedStock} setSelectedStock={setSelectedStock} rerenderTrigger={triggerRerender} selectedStockIndex={selectedStockIndex} setSelectedStockIndex={setSelectedStockIndex}/>
        </div>
        {/* Candle plot */}
        <div className="box">
          <CandleStick width={window.innerWidth * .410} height={window.innerHeight * .40} data={candleStickPlotData} xAxisLabel={"Time"} yAxisLabel={"Prices"} xTicks={10} yTicks={10} attributeState={selectedAttributes} selectionHandler={setSelectedAttributes} rerenderTrigger={triggerRerender} startDate={startDate} endDate={endDate} selectedStock={selectedStock}/>
        </div>
        <div id="scatterPlotBox">
          <ScatterPlot width={window.innerWidth * .17} height={window.innerHeight * .32} data={scatterPlotData} xAxisLabel={selectedAttributes[0]} yAxisLabel={selectedAttributes[1]} xTicks={10} yTicks={10} attributeState={selectedAttributes} attributes={Object.keys(attribute)} selectionHandler={setSelectedAttributes} rerenderTrigger={triggerRerender} selectedStockIndex={selectedStockIndex} setSelectedStockIndex={setSelectedStockIndex} colorMapping={colorMapping}/>
        </div>
      </div>
      <div className="bottom-row">
        {/* PCP */}
        <div id="compareContainer">
          <ProfitLineGraph vooData={vooData} allData={allData} startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} />
        </div>
        {/* Attribute MDS */}
        <div className="pcpContainer">
          <Pcp colorMapping={colorMapping} categoryNames={categoryNames} allData={allData} label={label} pcpAxisOrder={pcpAxisOrder} setPcpAxisOrder={setPcpAxisOrder} />
          {/* <AttributeMDS colorMapping={colorMapping} categoryNames={categoryNames} kIndex={kIndex} elbowIndex={elbowIndex} label={label} variableMDScoordinates={variableMDScoordinates} pcpAxisOrder={pcpAxisOrder} setPcpAxisOrder={setPcpAxisOrder}/> */}
        </div>
      </div>
    </div>
  );
}

export default App;
