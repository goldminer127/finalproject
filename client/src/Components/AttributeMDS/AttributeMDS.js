import './AttributeMDS.css';
import * as d3 from 'd3';
import { useEffect, useRef, useState } from "react";


const {csv,select,scaleLinear,map,scaleBand,axisBottom,axisLeft,bin,max,range,format,selectAll,line,bisect} = d3;
const margin = {top:20,bottom:20,right:20,left:20}
const width = window.innerWidth * .33
const height = window.innerHeight * .5
//Holds the indicies that have been swapped
var listOfSelectedIndices = []
//This holds the attributes displayed in the variable's mds plot
var listOfSelectedAttributes = []
const  AttributeMDS = ({colorMapping, categoryNames, kIndex, elbowIndex, label, variableMDScoordinates, pcpAxisOrder, setPcpAxisOrder}) => {
    var [mdsRenderer,setMdsRerenderer] = useState(0)
    const svgRef = useRef();
    useEffect(() => {

        let xDataPoints = variableMDScoordinates.map(coord => coord[0]);
        let yDataPoints = variableMDScoordinates.map(coord => coord[1]);
        
        const svg = d3.select(svgRef.current)
                .attr('width', width)
                .attr('height', height)
                .style('overflow', 'visible');
        svg.selectAll('*').remove();

        //Display the list of selected points
        const xDomain = [-1,1]
        const yDomain = [-1,1]

        const xRange = [margin.left,width-margin.right]
        const yRange = [height - margin.bottom, margin.top]

        const xScale = scaleLinear(xDomain,xRange)
        const yScale = scaleLinear(yDomain,yRange)

        

        //Making the svg where the chart will go
        svg.append("text").attr('id','varMdsPlot').style("text-anchor", "middle").attr("x", width/2).attr("y", 20).text('Variable Multidimensional Scaling Plot').style("fill", "white")

        svg.append('text').attr('id','displayedListOfSelectedAttributes').attr('x',100).attr('y',height-margin.top).text('Ordering: []').style("fill","white")

        
        //Draws lines between points
        svg.selectAll('.varline').remove()
        for(let index = 0;index<listOfSelectedIndices.length-1;index++){
            svg.append('path').attr("class", "varline").style("fill", "none" ).style("stroke", 'green').attr("d",()=>{
                //Drawing the line from one vertex to the other
                return 'M'+xScale(xDataPoints[listOfSelectedIndices[index]])+","+(yScale(yDataPoints[listOfSelectedIndices[index]]))+ ' L' + xScale(xDataPoints[listOfSelectedIndices[index+1]])+","+yScale(yDataPoints[listOfSelectedIndices[index+1]])
            })
        }
        

        //Making scale for the size of the variable mds vertices. The possible correlation values are between 0 and 1 and so the range of sizes are 5-15
        let corDomain = [0,1]
        let corRange = [5,15]
        let corScale = scaleLinear(corDomain,corRange)
        //Adding circles to the graph using the data
        for(let j = 0;j<xDataPoints.length;j++){
            // let correlationOfColumn = corMatrix.map(l=>l[j])
            let correlationMagnitude = 0

            //Drawing the points
            svg.append('circle').attr('id','varMdsPoint'+j).attr('cx', xScale(xDataPoints[j])).attr('cy', yScale(yDataPoints[j])).attr('r',corScale(correlationMagnitude)).attr('stroke','grey').attr('fill',colorMapping[label[j]]).on('click',(e,i)=>{
                //When a point gets clicked
                
                let id = parseInt(e.srcElement.id.split('varMdsPoint')[1])
                
                const indexOfNewValue = listOfSelectedAttributes.indexOf(categoryNames[id]);
                //If the attribute is in the list, remove it. If attribute is not in list, add it
                if (indexOfNewValue !== -1) {
                    listOfSelectedAttributes.splice(indexOfNewValue, 1)
                    listOfSelectedIndices.splice(indexOfNewValue, 1);
                } else {
                    listOfSelectedAttributes.push(categoryNames[id])
                    listOfSelectedIndices.push(id)
                }
                
                //Display the list of selected points
                document.getElementById('displayedListOfSelectedAttributes').textContent = 'Ordering: ['+listOfSelectedAttributes.toString()+']'
                let numericalIndicies = []
                let categoricalIndicies = []
                for (let i = 0; i < (categoryNames.length)-2; i++) {
                    numericalIndicies.push(i);
                }
                for (let i = 0; i < 3; i++) {
                    categoricalIndicies.push((categoryNames.length)-2+i);
                }
                if(listOfSelectedAttributes.length>0){
                    const filteredArray = numericalIndicies.filter(item => !listOfSelectedIndices.includes(item));
                    const newArray = (listOfSelectedIndices.concat(filteredArray)).concat(categoricalIndicies)
                    //Update the indicies array
                    setPcpAxisOrder(newArray)

                    //Draws lines between points
                    svg.selectAll('.varline').remove()
                    for(let index = 0;index<listOfSelectedIndices.length-1;index++){
                        svg.append('path').attr("class", "varline").style("fill", "none" ).style("stroke", 'green').attr("d",()=>{
                            //Drawing the line from one vertex to the other
                            return 'M'+xScale(xDataPoints[listOfSelectedIndices[index]])+","+(yScale(yDataPoints[listOfSelectedIndices[index]]))+ ' L' + xScale(xDataPoints[listOfSelectedIndices[index+1]])+","+yScale(yDataPoints[listOfSelectedIndices[index+1]])
                        })
                    }
                }
                else{
                    //If no points are selected, reset the indicies
                    //This will rerender pcp
                    setPcpAxisOrder(Array.from({ length: categoryNames.length }, (_, index) => index))
                    
                    
                }
                //Marking/unmarking the vertex that was selected
                if(listOfSelectedIndices.includes(id)){
                    document.getElementById('varMdsPoint'+j).style.strokeWidth = corScale(correlationMagnitude)/2
                }
                else{
                    document.getElementById('varMdsPoint'+j).style.strokeWidth = 1
                }

            })
        }
        //Adding text to the points
        svg.append('g').selectAll('text').data(xDataPoints).join('text').attr('x', (d, i) => xScale(d)).attr('y', (d, i) => yScale(yDataPoints[i])).text((d, i) => categoryNames[i]).attr('dx', 15).attr('dy', (d,i)=>{
            //Since W% and L% have the same coordinates, have to move L% text to make both visible
            if(categoryNames[i]=="L%"){
                return 10
            }
            else{
                return 0
            }
        }).attr('fill', 'white');

        //Adding a button to the variable's mds plot. It resets the index ordering
        svg.append("foreignObject").attr("width", 100).attr("height", 30).attr("x", 30).attr("y", height-(margin.top*1.75)).append("xhtml:button").style("background-color", "transparent").style("color", "white").style('border','1px solid white').style("border-radius", '10px').style('outline','1px solid white').text("Clear").on("click",()=>{
            
        svg.selectAll('.varline').remove()
        // for(let index = 0;index<(categoryNames.length-2);index++){
            // document.getElementById('varMdsPoint'+index).style.strokeWidth = 1
        // }
        if(document.getElementById('displayedListOfSelectedAttributes')!=undefined)document.getElementById('displayedListOfSelectedAttributes').textContent = 'Ordering: []'
        // setListOfSelectedAttributes([])
        listOfSelectedAttributes=[]
        listOfSelectedIndices = []
        //This will rerender pcp
        setPcpAxisOrder(Array.from({ length: categoryNames.length }, (_, index) => index))
        })
        if(document.getElementById('displayedListOfSelectedAttributes')!=undefined)document.getElementById('displayedListOfSelectedAttributes').textContent = 'Ordering: ['+listOfSelectedAttributes.toString()+']'

    })

    return(
        <>
            <svg ref={svgRef}></svg>
            {/* <p id='displayedListOfSelectedAttributes'>{listOfSelectedAttributes}</p> */}
            {/* <div>Div 4</div> */}
        </>
    )
}

export default AttributeMDS;