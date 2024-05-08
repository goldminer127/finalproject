import './Pcp.css';
import * as d3 from 'd3';
import { useEffect, useRef, useState } from "react";

const {csv,select,scaleLinear,map,scaleBand,axisBottom,axisLeft,bin,max,range,format,selectAll,line,bisect} = d3;
const margin = {top:20,bottom:20,right:10,left:40}
const width = window.innerWidth * .4
const height = window.innerHeight * .5
//Holds thresholds attribute values have to be between. For categorical data, the threshold is the index of the category options
var attributeTresholds = []
//Holds coordinates for upper slider
var slider1Coordinates = []
//Holds coordinates for lower slider
var slider2Coordinates = []

const ATTR_FONT_SIZE = 8


function Pcp({colorMapping, categoryNames,allData,label, pcpAxisOrder, setPcpAxisOrder}) {
    var [pcpRenderer,setPcpRerenderer] = useState(0)
    var displayedCategoryNames = []
    categoryNames.forEach((attr,i)=>{
        if(attr !== "EBITDA"){
            if(attr.split(" ").length>1){
                displayedCategoryNames.push(attr.split(" ")[0].substring(0,3)+". "+attr.split(" ")[1].substring(0,3)+".")
            }
            else if(attr.length<=6){
                displayedCategoryNames.push(attr)
            }
            else{
                displayedCategoryNames.push(attr.substring(0,3))
            }
        }
        else{
            displayedCategoryNames.push(attr)
        }
    })

    if(allData!=undefined&&allData[0]!=undefined){
        let listOfLists = []
        
        for(let i = 0;i<allData.length;i++){
            let tempDataList = []
            for(let k = 0;k<allData[0].length;k++){
                if(k!=1){
                    tempDataList.push(allData[i][k])
                }
                else{
                    let arr = allData[i][k].split("-")
                    tempDataList.push(arr[0])
                    tempDataList.push(arr[1])
                }
            }
            listOfLists.push(tempDataList)
        }
        allData = listOfLists
        

    }
    const svgRef = useRef();
    useEffect(() => {
        if(allData!=undefined&&allData[0]!=undefined){
        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .style('overflow', 'visible');
        svg.selectAll('*').remove();
        let axisIndex = 0;
    
        const pcpXDomain = [0,allData[0].length];
        const pcpXRange = [margin.left,width - margin.right]
        const pcpXScale = scaleLinear(pcpXDomain,pcpXRange)
        //Making the svg where the chart will go
        // const PCP = select('#pcpContainer').append('svg').attr('width',width).attr('height',height)
        svg.append("text").attr('id','svgplot').style("text-anchor", "middle").attr("x", width/2).attr("y", 20).text('Parallel Coordinate Plot').style("fill", "white")
        
        let dictOfScales = {}
        //Making axes
        for(let j = 0;j<allData[0].length;j++){
            if(typeof allData[0][pcpAxisOrder[j]] =="string"){
                const OPTIONS = Array.from(new Set(allData.map(row => row[pcpAxisOrder[j]])));
                //The domain is set to the options
                const yDomain = OPTIONS
                const yRange = [height - margin.bottom, margin.top+margin.top]
                const yScale = scaleBand(yDomain,yRange).padding(1)
                dictOfScales[displayedCategoryNames[pcpAxisOrder[j]]] = yScale
                slider1Coordinates.push(yScale(OPTIONS[OPTIONS.length-1]))
                slider2Coordinates.push(yScale(OPTIONS[0]))
                attributeTresholds.push([0,OPTIONS.length-1])
                const yAxis= axisLeft(yScale)
                svg.append("g")    
                .attr("transform", `translate(${pcpXScale(j)}, 0)`)
                .attr('id', 'pcpAxis' + axisIndex)
                .attr('class', 'pcpAxis')
                .style('stroke-width', '2px')
                .style("font-size",ATTR_FONT_SIZE+"px")
                .call(d3.drag()
                .on('drag', function(event) {
                    select(this).attr("transform", `translate(${Math.max(margin.left, Math.min(width - margin.right, event.x))}, 0)`);
                })
                .on('end',function(event){
                    //When users drops the slider, it snaps to the nearest tick
                    var listOfxScaleValues = []
                    for(let index = 0;index<displayedCategoryNames.length;index++){
                        listOfxScaleValues.push(pcpXScale(index))
                    }
                    // Snap to the nearest category position
                    var xPos = event.x
        
                    var closestCategoryIndex = 0
                    for(let index = 0;index<=listOfxScaleValues.length;index++){
                        if(index == listOfxScaleValues.length-1){
                            if(xPos<=listOfxScaleValues[index]){
                                closestCategoryIndex = index
                                break
                            }
                        }
                        else{
                            if(xPos>=listOfxScaleValues[index]&&xPos<=listOfxScaleValues[index+1]){
                                let midpoint = (listOfxScaleValues[index]+listOfxScaleValues[index+1])/2
                                if(xPos<midpoint){
                                    closestCategoryIndex = index
                                }
                                else{
                                    closestCategoryIndex = index+1
                                }
                                break
                            }
                        }
                    }
                    var temp = pcpAxisOrder[j];
                    pcpAxisOrder[j] = pcpAxisOrder[closestCategoryIndex]
                    pcpAxisOrder[closestCategoryIndex] = temp;
                    //Rerender pcp somehow
                    setPcpRerenderer(pcpRenderer+1)
                })
            ).call(yAxis).append("text").style("text-anchor", "middle").attr('id','pcpText'+axisIndex).attr("y", margin.top*1.5).text(displayedCategoryNames[pcpAxisOrder[j]]).style("fill", "white").style("font-size",ATTR_FONT_SIZE+"px")
            //Upper slider
            svg.append("circle")
                .attr("cx", pcpXScale(j))
                .attr("cy", slider1Coordinates[j])
                .attr("r", 5)
                .style("fill", "blue")
                .call(d3.drag()
                .on("drag", function(event) {
                    select(this).attr("cy", event.y)
                })
                .on("end", function() {
                    //When users drops the slider, it snaps to the nearest tick
                    var listOfyScaleValues = []
                    for(let index = 0;index<yScale.domain().length;index++){
                        listOfyScaleValues.push(yScale(yScale.domain()[index]))
                    }
                    // Snap to the nearest category position
                    var yPos = select(this).attr("cy")
                    
                    var closestCategoryIndex = 0
                    for(let index = 0;index<=listOfyScaleValues.length;index++){
                        if(index == listOfyScaleValues.length-1){
                            if(yPos<=listOfyScaleValues[index]){
                                closestCategoryIndex = index
                                break
                            }
                        }
                        else{
                            if(yPos<=listOfyScaleValues[index]&&yPos>=listOfyScaleValues[index+1]){
                                let midpoint = (listOfyScaleValues[index]+listOfyScaleValues[index+1])/2
                                if(yPos>midpoint){
                                    closestCategoryIndex = index
                                }
                                else{
                                    closestCategoryIndex = index+1
                                }
                                break
                            }
                        }
                    }
                    var yValue = listOfyScaleValues[closestCategoryIndex];
                    // Move the slider to the snapped position
                    select(this).attr("cy", yValue); 
                    attributeTresholds[pcpAxisOrder[j]][1] = closestCategoryIndex
                    slider1Coordinates[pcpAxisOrder[j]] = yValue
                    setPcpRerenderer(pcpRenderer+1)

                }))
            //Lower slider
            svg.append("circle")
            .attr("cx", pcpXScale(j))
            .attr("cy", slider2Coordinates[pcpAxisOrder[j]])
            .attr("r", 5)
            .style("fill", "red")
            .call(d3.drag()
            .on("drag", function(event) {
                select(this).attr("cy", event.y)
            })
            .on("end", function() {
                var listOfyScaleValues = []
                for(let index = 0;index<yScale.domain().length;index++){
                    listOfyScaleValues.push(yScale(yScale.domain()[index]))
                }
                // Snap to the nearest category position
                var yPos = select(this).attr("cy")
                
                var closestCategoryIndex = 0
                for(let index = 0;index<=listOfyScaleValues.length;index++){
                    if(index == listOfyScaleValues.length-1){
                        if(yPos<=listOfyScaleValues[index]){
                            closestCategoryIndex = index
                            break
                        }
                    }
                    else{
                        if(yPos<=listOfyScaleValues[index]&&yPos>=listOfyScaleValues[index+1]){
                            let midpoint = (listOfyScaleValues[index]+listOfyScaleValues[index+1])/2
                            if(yPos>midpoint){
                                closestCategoryIndex = index
                            }
                            else{
                                closestCategoryIndex = index+1
                            }
                            break
                        }
                    }
                }
                var yValue = listOfyScaleValues[closestCategoryIndex];
                // Move the slider to the snapped position
                select(this).attr("cy", yValue); 
                attributeTresholds[pcpAxisOrder[j]][0] = closestCategoryIndex
                slider2Coordinates[pcpAxisOrder[j]] = yValue
                setPcpRerenderer(pcpRenderer+1)
            }))
            axisIndex++
            }
            else{
                const dataColumnj = allData.map(row => row[pcpAxisOrder[j]]);
                const yDomain = [Math.min(...dataColumnj)-(Math.min(...dataColumnj)*.01),Math.max(...dataColumnj)+(Math.max(...dataColumnj)*.01)]
                const yRange = [height - margin.bottom, margin.top+margin.top]
                const yScale = scaleLinear(yDomain,yRange)
                const invertedYscale = scaleLinear(yRange,yDomain)
                attributeTresholds.push([invertedYscale.range()[0],invertedYscale.range()[1]])
                dictOfScales[displayedCategoryNames[pcpAxisOrder[j]]] = yScale
                slider1Coordinates.push(yScale(Math.max(...dataColumnj)))
                slider2Coordinates.push(yScale(Math.min(...dataColumnj)))
                const yAxis= axisLeft(yScale)
                yAxis.tickFormat(d3.format(".0e"));
                svg.append("g")
                .attr("transform", `translate(${pcpXScale(j)}, 0)`)
                .attr('id', 'pcpAxis' + axisIndex)
                .attr('class', 'pcpAxis')
                .style('stroke-width', '2px')
                .style("font-size",ATTR_FONT_SIZE+"px")
                .call(d3.drag()
                .on('drag', function(event) {
                    select(this).attr("transform", `translate(${Math.max(margin.left, Math.min(width - margin.right, event.x))}, 0)`);
                })
               .on('end',function(event){
                    //When users drops the slider, it snaps to the nearest tick
                    var listOfxScaleValues = []
                    for(let index = 0;index<allData[0].length;index++){
                        listOfxScaleValues.push(pcpXScale(index))
                    }
                    // Snap to the nearest category position
                    var xPos = event.x
        
                    var closestCategoryIndex = 0
                    for(let index = 0;index<=listOfxScaleValues.length;index++){
                        if(index == listOfxScaleValues.length-1){
                            if(xPos<=listOfxScaleValues[index]){
                                closestCategoryIndex = index
                                break
                            }
                        }
                        else{
                            if(xPos>=listOfxScaleValues[index]&&xPos<=listOfxScaleValues[index+1]){
                                let midpoint = (listOfxScaleValues[index]+listOfxScaleValues[index+1])/2
                                if(xPos<midpoint){
                                    closestCategoryIndex = index
                                }
                                else{
                                    closestCategoryIndex = index+1
                                }
                                break
                            }
                        }
                    }
                    var temp = pcpAxisOrder[j];
                    pcpAxisOrder[j] = pcpAxisOrder[closestCategoryIndex]
                    pcpAxisOrder[closestCategoryIndex] = temp;
                    //Rerender pcp somehow
                    //console.log(pcpAxisOrder)
                    setPcpRerenderer(pcpRenderer+1)

                    /*
                    makePcpPlot()
                    */
                })
            ).call(yAxis).append("text").style("text-anchor", "middle").attr('id','pcpText'+axisIndex).attr("y", margin.top*1.5).text(displayedCategoryNames[pcpAxisOrder[j]]).style("fill", "white").style("font-size",ATTR_FONT_SIZE+"px")
            //Upper slider
            svg.append("circle")
                .attr("cx", pcpXScale(j))
                .attr("cy", slider1Coordinates[pcpAxisOrder[j]])
                .attr("r", 5)
                .style("fill", "blue")
                .call(d3.drag()
                .on("drag", function(event) {
                    select(this).attr("cy", Math.max(margin.top*2,Math.min(height-margin.bottom,event.y)))
                })
                .on("end", function() {
                    var yPos = select(this).attr("cy")
                    attributeTresholds[pcpAxisOrder[j]][1] = invertedYscale(yPos)
                    slider1Coordinates[pcpAxisOrder[j]] = yPos
                    setPcpRerenderer(pcpRenderer+1)
                }))
            //Lower slider
            svg.append("circle")
                .attr("cx", pcpXScale(j))
                .attr("cy", slider2Coordinates[pcpAxisOrder[j]])
                .attr("r", 5)
                .style("fill", "red")
                .call(d3.drag()
                .on("drag", function(event) {
                    select(this).attr("cy", Math.max(margin.top*2,Math.min(height-margin.bottom,event.y)))
                })
                .on("end", function() {
                    var yPos = select(this).attr("cy")
                    attributeTresholds[pcpAxisOrder[j]][0] = invertedYscale(yPos)
                    slider2Coordinates[pcpAxisOrder[j]] = yPos
                    setPcpRerenderer(pcpRenderer+1)
                }))
            axisIndex++
            }
            
        }
        //Used to color the lines by ticker
        let colorIndex=0
        let lineIndex = 0;
       //Making the lines that go through the axes
       for(let j = 0;j<allData.length;j++){
           let validRow = true;
           for(let index = 0;index<displayedCategoryNames.length;index++){
               if(typeof allData[j][pcpAxisOrder[index]] === 'string'){
                   let valueIndex = dictOfScales[displayedCategoryNames[pcpAxisOrder[index]]].domain().indexOf(allData[j][pcpAxisOrder[index]])
                   if(valueIndex<attributeTresholds[pcpAxisOrder[index]][0] || valueIndex>attributeTresholds[pcpAxisOrder[index]][1]){
                       index = displayedCategoryNames.length+1
                       validRow=false
                    }
                }
                else{
                    let valueOfRowElement = parseFloat(allData[j][pcpAxisOrder[index]])
                    if(valueOfRowElement<attributeTresholds[pcpAxisOrder[index]][0] || valueOfRowElement>attributeTresholds[pcpAxisOrder[index]][1]){
                        index = displayedCategoryNames.length+1
                        validRow=false
                    }
                }
            }
            if(validRow){
                for(let index = 1;index<displayedCategoryNames.length;index++){
                    svg.append("path").attr("id", "line"+lineIndex).style("fill", "none" ).style("stroke", colorMapping[colorIndex]).style("opacity", '.8').style('stroke-width', '.6px').attr("d",(d,i)=>{
                        return 'M'+pcpXScale(index-1)+","+(dictOfScales[displayedCategoryNames[pcpAxisOrder[index-1]]](allData[j][pcpAxisOrder[index-1]]))+ ' L' + pcpXScale(index)+","+(dictOfScales[displayedCategoryNames[pcpAxisOrder[index]]](allData[j][pcpAxisOrder[index]]))
                    })
                    lineIndex++
                }
            }
            //When the next ticker is being iterated through, changes the color
            if(j>0&&j%(allData.length/10)==0){
                colorIndex++
            }
            
        }
        
    }
    })
    return(
        <>
            <svg ref={svgRef}></svg>
        </>
    )
}

export default Pcp;