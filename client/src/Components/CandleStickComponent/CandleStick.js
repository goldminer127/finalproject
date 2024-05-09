import * as d3 from 'd3';
import { useEffect, useRef } from "react";

const CandleStick = ({ data, width, height, xAxisLabel, yAxisLabel, xTicks, yTicks,startDate,endDate}) => {
    const svgRef = useRef();
    const margin = { top: 10, bottom: 40, right: 1, left: 30 }
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

    useEffect(() => {
        //Data[1] contains [high,low,open,close] values in that index order
        if (Array.isArray(data)) {
            const svg = d3.select(svgRef.current)
                .attr('width', width)
                .attr('height', height)
                .style('overflow', 'visible');

            svg.selectAll('*').remove();
            
            //const x = d3.scaleBand()
              //  .domain(data.map(entry => entry[0]))
                //.range([0, width]);
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
            var xDomain = yearlyDates
            let monthList = []
            if (intEndYear - intStartYear <= 2) {
                for (let date = new Date(startDateObj); date < endDateObj; date.setMonth(date.getMonth() + ((intEndYear - intStartYear) + 1))) {

                    monthList.push(months[new Date(date).getMonth()] + "/" + new Date(date).getFullYear().toString().substring(2)); // Push each date into the monthlyDates array
                }
                xDomain = monthList
            }
            const monthlyDomain = monthlyDates
            const monthlyRange = [margin.left, width - margin.right]
            const monthlyScale = d3.scaleBand(monthlyDomain, monthlyRange).padding(.1)
            const xRange = [margin.left, width - margin.right]
            const x = d3.scaleBand(xDomain, xRange).padding(.1)

            const y = d3.scaleLinear()
                .domain([Math.min.apply(Math, data.map(entry => entry[1][1])), Math.max.apply(Math, data.map(entry => entry[1][0]))])
                .range([height, 0]);

            const xAxis = d3.axisBottom(x).ticks(data.length).ticks((xTicks === undefined) ? 10 : xTicks);
            const yAxis = d3.axisLeft(y).ticks((yTicks === undefined) ? 10 : yTicks);
            svg.append('g')
                .call(xAxis)
                .attr('transform', 'translate(0,' + height + ')');
            svg.append('g').attr("transform", `translate(${margin.left},0)`)
                .call(yAxis);
            svg.append('text')
                .attr('x', width / 2)
                .attr('y', height + 35)
                .attr('fill', 'white')
                .text(xAxisLabel);
            svg.append('text')
                .attr('transform', 'rotate(270)')
                // .attr('y', -33)
                .attr("y", 0)
                .attr('x', -height / 2)
                .attr('fill', 'white')
                .text(yAxisLabel);
            svg.append('text')
                .attr('x', width / 2 - 20)
                .attr('y', margin.top)
                .attr('fill', 'white')
                .text('Candle Stick Plot');
            
            for(let i = 0;i<data.length;i++){
                let d = new Date(data[i][0])
                let arr = data[i][1]

                svg.append("line")
                .attr("x1", monthlyScale(d))
                .attr("x2", monthlyScale(d))
                .attr("y1", y(arr[0]))
                .attr("y2", y(arr[1]))
                .attr("stroke", "white")
                .style("width", 100)
            }
            
            /*
            // Show the main vertical line
            svg.selectAll("vertLines")
                .data(data)
                .enter()
                .append("line")
                .attr("x1", entry => monthlyScale(entry[0]))
                .attr("x2", entry => monthlyScale(entry[0]))
                .attr("y1", entry =>{
                    console.log("y1: "+(entry[1][0]))
                    return y(entry[1][0])
                })
                .attr("y2", entry => {
                    console.log("y2: "+(entry[1][1]))
                    y(entry[1][1])
                })
                .attr("stroke", "white")
                .style("width", 100)
                */
                
                for(let i = 0;i<data.length;i++){
                    let d = new Date(data[i][0])
                    let arr = data[i][1]

                    svg.append("rect")
                .attr("x",monthlyScale(d) - 4/2)
                .attr("y",y(Math.max(arr[2], arr[3])))
                .attr("height", y(Math.min(arr[2], arr[3])) - y(Math.max(arr[2], arr[3])))
                .attr("width", 4)
                .attr("stroke", "white")
                .style("fill", (arr[2] > arr[3]) ? "red" : "green")
            }
            /*
            // Show the box
            svg.selectAll("boxes")
                .data(data)
                .enter()
                .append("rect")
                .attr("x", entry => monthlyScale(entry[0]) - 4/2)
                .attr("y", entry => y(Math.max(entry[1][2], entry[1][3])))
                .attr("height", entry => y(Math.min(entry[1][2], entry[1][3])) - y(Math.max(entry[1][2], entry[1][3])))
                .attr("width", 4)
                .attr("stroke", "white")
                .style("fill", entry => (entry[1][2] < entry[1][3]) ? "red" : "green")
                */
        }
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: '30px' }}>
            <svg ref={svgRef} />
        </div>
    );
}

export default CandleStick;