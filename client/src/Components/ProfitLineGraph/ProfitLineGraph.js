import './ProfitLineGraph.css';
import * as d3 from 'd3';
import { useEffect, useRef, useState } from "react";
import ProfitLineGraphMenu from './ProfitLineGraphMenu';

const {csv,select,scaleLinear,map,scaleBand,axisBottom,axisLeft,bin,max,range,format,selectAll,line,bisect} = d3;
const margin = {top:30,bottom:50,right:1,left:60}
const width = window.innerWidth * .6 * .75
const height = window.innerHeight * .47

const months = {
    0:"Jan",
    1:"Feb",
    2:"Mar",
    3:"Apr",
    4:"May",
    5:"Jun",
    6:"Jul",
    7:"Aug",
    8:"Sep",
    9:"Oct",
    10:"Nov",
    11:"Dec",
    
}

function ProfitLineGraph({vooData, allData,startDate, setStartDate, endDate, setEndDate}) {
    var [plgRenderer,setPlgRerenderer] = useState(0)
    let uniqueStrings = new Set();

    // Iterate through the 2D list and add the first column strings to the Set
    for (let i = 0; i < allData.length; i++) {
        uniqueStrings.add(allData[i][0]);
    }

    // Convert Set back to an array if needed
    let tickerList = Array.from(uniqueStrings);
    const [initialDeposit, setInitialDeposit] = useState(1000);
    let [stockWeightList,setStockWeightList] = useState(['6.29', '22.07', '17.55', '11.64', '15.75', '7.53', '5.38', '5.29', '4.39', '4.11'])
    
    
    
    const checkInputConditions = () =>{
        if(initialDeposit!=undefined&&initialDeposit>=0&&initialDeposit<=1000000){
            if (startDate && endDate) {
                let startYear = startDate.split("-")[0]
                let startMonth = startDate.split("-")[1]
                let intStartMonth = 0;
                let intStartYear = 0;
                if(startMonth.substring(0,1)==="0"){
                    intStartMonth = parseInt(startMonth.substring(1,2))-1
                }
                else{
                    intStartMonth = parseInt(startMonth)-1
                }
                intStartYear = parseInt(startYear)+1

                let endYear = endDate.split("-")[0]
                let endMonth = endDate.split("-")[1]
                let intEndMonth = 0;
                let intEndYear = 0;
                if(endMonth.substring(0,1)==="0"){
                    intEndMonth = parseInt(endMonth.substring(1,2))-1
                }
                else{
                    intEndMonth = parseInt(endMonth)-1
                }
                intEndYear = parseInt(endYear)+1
                const startDateObj = new Date(intStartYear,intStartMonth);
                const endDateObj = new Date(intEndYear,intEndMonth);
                if (startDateObj.getTime() > endDateObj.getTime()) {
                    alert('Start date must be before end date');
                } else {
                  // Proceed with the desired action
                  let sum = 0
                    for(let i = 0;i<stockWeightList.length;i++){
                        if(stockWeightList[i]!=undefined&&stockWeightList[i]!=null&&stockWeightList[i]!=NaN&&stockWeightList[i]!='')sum += parseFloat(stockWeightList[i])
                        // sum += parseFloat(stockWeightList[i])
                    }
                    if(sum==100){
                        // alert("good")
                        return 1
                    }
                    else{
                        // alert("Stocks need to add up to 100")
                        return -1
                    }
                }
            }
            else{
                // alert("Dates not defined")
                return -1
            }
        }
        else{
            // alert('Initial deposit needs to be between 0 and 1000000');
            return -1
        }
    }

    const handleSubmitClicked = () => {
        //checkInputConditions()
        setPlgRerenderer(plgRenderer+1)
        console.log("renderer = "+plgRenderer)
        console.log(initialDeposit)
        console.log(stockWeightList)
        console.log(startDate)
        console.log(endDate)
    }
    
    const svgRef = useRef();
    useEffect(() => {
        if(allData!==undefined && allData[0]!==undefined){
            if(checkInputConditions()>0){
                let floatInitialDeposit = parseFloat(""+initialDeposit)
                let startYear = startDate.split("-")[0]
                let startMonth = startDate.split("-")[1]
                let intStartMonth = 0;
                let intStartYear = 0;
                if(startMonth.substring(0,1)==="0"){
                    intStartMonth = parseInt(startMonth.substring(1,2))-1
                }
                else{
                    intStartMonth = parseInt(startMonth)-1
                }
                intStartYear = parseInt(startYear)

                let endYear = endDate.split("-")[0]
                let endMonth = endDate.split("-")[1]
                let intEndMonth = 0;
                let intEndYear = 0;
                if(endMonth.substring(0,1)==="0"){
                    intEndMonth = parseInt(endMonth.substring(1,2))
                }
                else{
                    intEndMonth = parseInt(endMonth)-1
                }
                intEndYear = parseInt(endYear)
                const startDateObj = new Date(intStartYear,intStartMonth);
                const endDateObj = new Date(intEndYear,intEndMonth);

                var vooClosingValues = []
                
                for(let i = 0;i<vooData.length;i++){
                    let date = new Date(vooData[i][1])
                    //date.getMonth()>startDateObj.getMonth()&&date.getMonth()<endDateObj.getMonth()
                    if (date.getFullYear() > startDateObj.getFullYear() && date.getFullYear() < endDateObj.getFullYear() ||
                    (date.getFullYear() == startDateObj.getFullYear() && date.getMonth() >= startDateObj.getMonth() && date.getMonth() <= endDateObj.getMonth())||
                    (date.getFullYear() == endDateObj.getFullYear() && date.getMonth() >= startDateObj.getMonth() && date.getMonth() <= endDateObj.getMonth())) {
                        vooClosingValues.push(vooData[i][5])
                    }
                }
                vooClosingValues = vooClosingValues.reverse()

                let vooProfitList = []
                vooProfitList.push(floatInitialDeposit)
                for(let i = 0;i<vooClosingValues.length;i++){
                    let profit = floatInitialDeposit+((vooClosingValues[i]-vooClosingValues[0])*(floatInitialDeposit/vooClosingValues[0]))
                    vooProfitList.push(profit)
                }

                var compositeClosingValues = []
                let tempList = []
                for(let i = 0;i<allData.length;i++){
                    let date = new Date(allData[i][1])
                    //date.getMonth()>startDateObj.getMonth()&&date.getMonth()<endDateObj.getMonth()
                    if (date.getFullYear() > startDateObj.getFullYear() && date.getFullYear() < endDateObj.getFullYear() ||
                    (date.getFullYear() == startDateObj.getFullYear() && date.getMonth() >= startDateObj.getMonth() && date.getMonth() <= endDateObj.getMonth())||
                    (date.getFullYear() == endDateObj.getFullYear() && date.getMonth() >= startDateObj.getMonth() && date.getMonth() <= endDateObj.getMonth())) {
                        //For every months * years, it moves on to the next ticker
                        if(i>0&&i%(12*10)==0){
                            compositeClosingValues.push(tempList)
                            tempList = [allData[i][5]]
                        }
                        else{
                            tempList.push(allData[i][5])
                        }
                    }
                }
                if(tempList.length>0)compositeClosingValues.push(tempList)
                for(let i = 0;i<compositeClosingValues.length;i++){
                    compositeClosingValues[i] = compositeClosingValues[i].reverse()
                }

                let compositeDifferenceList = []
                for(let i = 0;i<compositeClosingValues.length;i++){
                    let tempDiffList = []
                    for(let j = 0;j<compositeClosingValues[0].length;j++){
                        let difference = (((compositeClosingValues[i][j]-compositeClosingValues[i][0])*((floatInitialDeposit*(stockWeightList[i]/100))/compositeClosingValues[i][0])))
                        tempDiffList.push(difference)
                    }
                    compositeDifferenceList.push(tempDiffList)
                }
                
                let compositeProfitList = []
                for(let col = 0;col<compositeDifferenceList[0].length;col++){
                    let sum = 0;
                    for(let row = 0;row<compositeDifferenceList.length;row++){
                        sum+=compositeDifferenceList[row][col]
                    }
                    compositeProfitList.push(floatInitialDeposit+sum)
                }

                const monthlyDates = [];
                const yearlyDates = [];
                // Start from the start date and loop until the end date, incrementing by one month
                for (let date = new Date(startDateObj); date <= endDateObj; date.setFullYear(date.getFullYear() + 1)) {
                    yearlyDates.push(new Date(date).getFullYear()); // Push each date into the monthlyDates array
                }
                // Start from the start date and loop until the end date, incrementing by one month
                for (let date = new Date(startDateObj); date <= endDateObj; date.setMonth(date.getMonth() + 1)) {
                    monthlyDates.push(new Date(date)); // Push each date into the monthlyDates array
                }
                    
                    const svg = d3.select(svgRef.current)
                    .attr('width', width)
                    .attr('height', height)
                    .style('overflow', 'visible');
                    svg.selectAll('*').remove();
                    
                    
                    var xDomain = yearlyDates
                    let monthList = []
                    if(intEndYear-intStartYear<=2){
                        for (let date = new Date(startDateObj); date < endDateObj; date.setMonth(date.getMonth() + ((intEndYear-intStartYear)+1))) {
                            
                            monthList.push(months[new Date(date).getMonth()]+"/"+new Date(date).getFullYear().toString().substring(2)); // Push each date into the monthlyDates array
                        }
                        xDomain = monthList
                    }
                    const yDomain = [0,Math.max(Math.max(...vooProfitList),Math.max(...compositeProfitList))+Math.max(Math.max(...vooProfitList),Math.max(...compositeProfitList))*.01];

                    const xRange = [margin.left,width - margin.right]
                    const yRange = [height - margin.bottom, margin.top+margin.top]
                    
                    const xScale = scaleBand(xDomain,xRange).padding(.1)
                    const yScale = scaleLinear(yDomain,yRange)
                    
                    const xAxis= axisBottom(xScale)
                    const yAxis= axisLeft(yScale)
                    if(yDomain[1]>10000)yAxis.tickFormat(d3.format(".0e"));
                    
                    //Displaying axes
                    svg.append("g").attr("transform",`translate(0,${height - margin.bottom})`).call(xAxis);
                    svg.append("g").attr("transform",`translate(${margin.left},0)`).call(yAxis)

                    //Displaying x-label
                    svg.append("text").attr("class","axis-label").attr("x",width/2).attr("y",height-5).style("fill","white").text("Time")
                    //Displaying y-label
                    svg.append("text").attr("class","axis-label").attr("transform", "rotate(-90)").attr("x",(-height/2)-(margin.top)).attr("y",margin.left/3).style("fill","white").text("Profit ($)")
                    //Displaying the title
                    svg.append("text").attr("class","chart-title").attr("text-anchor","middle").attr("x", width/2).attr("y",margin.top).style("fill","white").text("Stock Visualizer")

                    const monthlyDomain = monthlyDates
                    const monthlyRange = [margin.left, width - margin.right]
                    const monthlyScale = scaleBand(monthlyDomain,monthlyRange).padding(.1)

                    
                    //Start coordinates of the path
                    let path = 'M'+monthlyScale(monthlyDates[0])+" , "+(yScale(vooProfitList[0]))+" "
                    //Adding rest of the coordinates to the path
                    vooProfitList.forEach((e,i)=>{
                        if(i>0){
                            path += 'L'+(monthlyScale(monthlyDates[i]))+" , "+(yScale(e))+" "
                        }
                    })
                    //Displaying the path
                    svg.append('path').attr('fill','none').attr('stroke','white').attr('stroke-width','3').attr('d',path)

                    //Start coordinates of the path
                    path = 'M'+monthlyScale(monthlyDates[0])+" , "+(yScale(compositeProfitList[0]))+" "
                    //Adding rest of the coordinates to the path
                    compositeProfitList.forEach((e,i)=>{
                        if(i>0){
                            path += 'L'+(monthlyScale(monthlyDates[i]))+" , "+(yScale(e))+" "
                        }
                    })
                    //Displaying the path
                    svg.append('path').attr('fill','none').attr('stroke','red').attr('stroke-width','3').attr('d',path)
                    path = 'M'+monthlyScale(monthlyDates[monthlyDates.length-1])+" , "+(yScale(compositeProfitList[compositeProfitList.length-1]))+" "
                    path += 'L'+(monthlyScale(monthlyDates[monthlyDates.length-1]))+" , "+(yScale(vooProfitList[vooProfitList.length-1]))+" "
                    svg.append("path")
                    .attr("d", path)
                    .attr("stroke", "white")
                    .attr("stroke-width", 2)
                    .attr("fill", "none")
                    .attr("stroke-dasharray", "5,5"); // Set the dash pattern
                    let difference = Math.max(compositeProfitList[compositeProfitList.length-1],vooProfitList[vooProfitList.length-1])-Math.min(compositeProfitList[compositeProfitList.length-1],vooProfitList[vooProfitList.length-1])
                    svg.append('text').attr('fill','white').attr('x',(monthlyScale(monthlyDates[monthlyDates.length-1])-50)).attr('y',(yScale(vooProfitList[vooProfitList.length-1])+yScale(compositeProfitList[compositeProfitList.length-1]))/2).style('font-size','10px').text("$"+parseFloat(difference.toFixed(2)).toLocaleString())
                    //Legend
                    path = 'M'+(width-margin.right-100)+" , "+(margin.top)+" L "+(width-margin.right-50)+" , "+(margin.top)
                    svg.append('path').attr('fill','none').attr('stroke','red').attr('stroke-width',"3").attr('d',path)
                    svg.append('text').attr('fill','white').attr('x',(width-margin.right-40)).attr('y',margin.top).style('font-size','10px').text("Stocks")
                    path = 'M'+(width-margin.right-100)+" , "+(margin.top+20)+" L "+(width-margin.right-50)+" , "+(margin.top+20)
                    svg.append('path').attr('fill','none').attr('stroke','white').attr('stroke-width',"3").attr('d',path)
                    svg.append('text').attr('fill','white').attr('x',(width-margin.right-40)).attr('y',margin.top+22).style('font-size','10px').text("VOO")
                }
            }
    })
    return(
        <>
        <div className="ProfitLineGraphContainer">
            <div className="ProfitLineGraphLeft">
                <ProfitLineGraphMenu tickerList={tickerList} initialDeposit={initialDeposit} setInitialDeposit={setInitialDeposit} stockWeightList={stockWeightList} setStockWeightList={setStockWeightList} startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} handleSubmitClicked={handleSubmitClicked}/>
            </div>
            <div className="ProfitLineGraphRight">
                <svg ref={svgRef}></svg>
            </div>
        </div>
        </>
    )
}

export default ProfitLineGraph;