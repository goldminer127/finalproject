import './LinePlot.css';
import * as d3 from 'd3';
import { useEffect, useRef, useState } from "react";

const { csv, select, scaleLinear, map, scaleBand, axisBottom, axisLeft, bin, max, range, format, selectAll, line, bisect } = d3;
const margin = { top: 30, bottom: 35, right: 10, left: 60 }
const width = window.innerWidth * .33
const height = window.innerHeight * .50

const months = {
    0: "Jan",
    1: "Feb",
    2: "Mar",
    3: "Apr",
    4: "May",
    5: "Jun",
    6: "Jul",
    7: "Aug",
    8: "Sep",
    9: "Oct",
    10: "Nov",
    11: "Dec",
}

function LinePlot({ colorMapping, vooData, allData, startDate, setStartDate, endDate, setEndDate, selectedStock, setSelectedStock, rerenderTrigger }) {
    var [selectedStockIndex,setSelectedStockIndex] = useState(-1)
    const svgRef = useRef();
    useEffect(() => {
        if (allData !== undefined && allData[0] !== undefined) {

            let startYear = startDate.split("-")[0]
            let startMonth = startDate.split("-")[1]
            let intStartMonth = 0;
            let intStartYear = 0;
            if (startMonth.substring(0, 1) === "0") {
                intStartMonth = parseInt(startMonth.substring(1, 2)) - 1
            }
            else {
                intStartMonth = parseInt(startMonth) - 1
            }
            intStartYear = parseInt(startYear)

            let endYear = endDate.split("-")[0]
            let endMonth = endDate.split("-")[1]
            let intEndMonth = 0;
            let intEndYear = 0;
            if (endMonth.substring(0, 1) === "0") {
                intEndMonth = parseInt(endMonth.substring(1, 2))
            }
            else {
                intEndMonth = parseInt(endMonth) - 1
            }
            intEndYear = parseInt(endYear)
            const startDateObj = new Date(intStartYear, intStartMonth);
            const endDateObj = new Date(intEndYear, intEndMonth);

            var vooClosingValues = []
            for (let i = 0; i < vooData.length; i++) {
                let date = new Date(vooData[i][1])
                //date.getMonth()>startDateObj.getMonth()&&date.getMonth()<endDateObj.getMonth()
                if (date.getFullYear() > startDateObj.getFullYear() && date.getFullYear() < endDateObj.getFullYear() ||
                    (date.getFullYear() == startDateObj.getFullYear() && date.getMonth() > startDateObj.getMonth()) ||
                    (date.getFullYear() == endDateObj.getFullYear() && date.getMonth() < endDateObj.getMonth())) {
                    vooClosingValues.push(vooData[i][5])
                }
            }
            vooClosingValues = vooClosingValues.reverse()

            var compositeClosingValues = []
            let tempList = []
            let listOfTickers = [allData[0][0]]
            for (let i = 0; i < allData.length; i++) {
                let date = new Date(allData[i][1])
                //date.getMonth()>startDateObj.getMonth()&&date.getMonth()<endDateObj.getMonth()
                if (date.getFullYear() > startDateObj.getFullYear() && date.getFullYear() < endDateObj.getFullYear() ||
                    (date.getFullYear() == startDateObj.getFullYear() && date.getMonth() >= startDateObj.getMonth()) ||
                    (date.getFullYear() == endDateObj.getFullYear() && date.getMonth() <= endDateObj.getMonth())) {
                    //For every months * years, it moves on to the next ticker
                    if (i > 0 && i % (12 * 10) == 0) {
                        compositeClosingValues.push(tempList)
                        tempList = [allData[i][5]]
                        listOfTickers.push(allData[i][0])
                    }
                    else {
                        tempList.push(allData[i][5])
                    }
                }
            }
            if (tempList.length > 0) compositeClosingValues.push(tempList)
            for (let i = 0; i < compositeClosingValues.length; i++) {
                compositeClosingValues[i] = compositeClosingValues[i].reverse()
            }


            const monthlyDates = [];
            const yearlyDates = [];
            // Start from the start date and loop until the end date, incrementing by one month
            for (let date = new Date(startDateObj); date < endDateObj; date.setFullYear(date.getFullYear() + 1)) {
                yearlyDates.push(new Date(date).getFullYear()); // Push each date into the monthlyDates array
            }
            // Start from the start date and loop until the end date, incrementing by one month
            for (let date = new Date(startDateObj); date < endDateObj; date.setMonth(date.getMonth() + 1)) {
                monthlyDates.push(new Date(date)); // Push each date into the monthlyDates array
            }

            const svg = d3.select(svgRef.current)
                .attr('width', width)
                .attr('height', height)
                .style('overflow', 'visible');
            svg.selectAll('*').remove();


            var xDomain = yearlyDates
            let monthList = []
            if (intEndYear - intStartYear <= 2) {
                for (let date = new Date(startDateObj); date < endDateObj; date.setMonth(date.getMonth() + ((intEndYear - intStartYear) + 1))) {

                    monthList.push(months[new Date(date).getMonth()] + "/" + new Date(date).getFullYear().toString().substring(2)); // Push each date into the monthlyDates array
                }
                xDomain = monthList
            }
            let maxOfLists = 0;
            for (let i = 0; i < compositeClosingValues.length; i++) {
                maxOfLists = Math.max(maxOfLists, Math.max(...compositeClosingValues[i]))
            }
            const yDomain = [0, Math.max(Math.max(...vooClosingValues), maxOfLists) + (Math.max(Math.max(...vooClosingValues), maxOfLists) * .001)];

            const xRange = [margin.left, width - margin.right]
            const yRange = [height - margin.bottom, margin.top + margin.top]

            const xScale = scaleBand(xDomain, xRange).padding(.1)
            const yScale = scaleLinear(yDomain, yRange)

            const xAxis = axisBottom(xScale)
            const yAxis = axisLeft(yScale)
            if (yDomain[1] >= 10000) yAxis.tickFormat(d3.format(".0e"));

            //Displaying axes
            svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(xAxis);
            svg.append("g").attr("transform", `translate(${margin.left},0)`).call(yAxis)

            //Displaying x-label
            svg.append("text").attr("class", "axis-label").attr("x", width / 2).attr("y", height).style("fill", "white").text("Time")
            //Displaying y-label
            svg.append("text").attr("class", "axis-label").attr("transform", "rotate(-90)").attr("x", (-height / 2) - (margin.top)).attr("y", margin.left / 3).style("fill", "white").text("Closing Price")
            //Displaying the title
            svg.append("text").attr("class", "chart-title").attr("text-anchor", "middle").attr("x", width / 2).attr("y", margin.top).style("fill", "white").text("Line Plot")

            const monthlyDomain = monthlyDates
            const monthlyRange = [margin.left, width - margin.right]
            const monthlyScale = scaleBand(monthlyDomain, monthlyRange).padding(.1)


            //Start coordinates of the path
            let path = 'M' + monthlyScale(monthlyDates[0]) + " , " + (yScale(vooClosingValues[0])) + " "
            //Adding rest of the coordinates to the path
            vooClosingValues.forEach((e, i) => {
                if (i > 0) {
                    path += 'L' + (monthlyScale(monthlyDates[i])) + " , " + (yScale(e)) + " "
                }
            })
            //Displaying the path
            svg.append('path').attr('fill', 'none').attr('stroke', 'white').attr('stroke-width', '3').attr('d', path)

            for (let i = 0; i < compositeClosingValues.length; i++) {
                path = 'M' + monthlyScale(monthlyDates[0]) + " , " + (yScale(compositeClosingValues[i][0])) + " "
                for (let j = 1; j < compositeClosingValues[0].length; j++) {
                    path += 'L' + (monthlyScale(monthlyDates[j])) + " , " + (yScale(compositeClosingValues[i][j])) + " "
                }
                svg.append('path').attr('fill', 'none').attr("class", "linePlotLine").attr('id', "linePlotLine" + i).attr('stroke', colorMapping[i]).attr('stroke-width', '2').style('opacity', .7).attr('d', path)
            }
            //Legend
            path = 'M' + (width - margin.right - 150) + " , " + (margin.top) + " L " + (width - margin.right - 100) + " , " + (margin.top)
            svg.append('path').attr('fill', 'none').attr('stroke', 'white').attr('stroke-width', "4").attr('d', path)
            svg.append('text').attr('fill', 'white').attr('x', (width - margin.right - 90)).attr('y', margin.top).style('font-size', '8px').text("VOO")
            for (let i = 0; i < compositeClosingValues.length; i++) {
                path = 'M' + (width - margin.right - 150) + " , " + (margin.top + ((i * 10)+10)) + " L " + (width - margin.right - 100) + " , " + (margin.top + ((i * 10)+10))
                svg.append('path').attr('fill', 'none').attr("class","legendStockLines").attr('id','legendStockLines'+i).attr('stroke', colorMapping[i]).attr('stroke-width', "3").attr('d', path).style('opacity', .7).on("click", function () {
                    // Code to be executed when 'myElement' is clicked
                    svg.selectAll('.legendStockLines').style('opacity', .5)
                    svg.selectAll('.linePlotLine').style('opacity', .5)
                    svg.select("#legendStockLines" + i).style('opacity', 1)
                    svg.select("#linePlotLine" + i).style('opacity', 1)
                    // selectedStockIndex = i
                    setSelectedStockIndex(i)
                    setSelectedStock(listOfTickers[i])
                    rerenderTrigger("selectedStock")
                })
                svg.append('text').attr('fill', 'white').attr('x', (width - margin.right - 90)).attr('y', margin.top + ((i * 10)+10)).style('font-size', '8px').text(listOfTickers[i])
                svg.selectAll('.legendStockLines').style('opacity', .5)
                svg.selectAll('.linePlotLine').style('opacity', .5)
                svg.select("#legendStockLines" + selectedStockIndex).style('opacity', 1)
                svg.select("#linePlotLine" + selectedStockIndex).style('opacity', 1)
            }
        }
    })

    return (
        <>
            <svg ref={svgRef}></svg>
        </>
    )
}
export default LinePlot;