import './ProfitLineGraph.css';

import { useEffect, useRef, useState } from "react";



function ProfitLineGraphMenu({tickerList, initialDeposit, setInitialDeposit, stockWeightList, setStockWeightList, startDate, setStartDate, endDate, setEndDate, handleSubmitClicked}) {
    var [sumStockWeights,setSumStockWeights] = useState(100)
    
    const calculateStockWeightSum=(list)=>{
        let sum = 0
        for(let i = 0;i<list.length;i++){
            if(list[i]!=undefined&&list[i]!=null&&list[i]!=NaN&&list[i]!='')sum += parseFloat(list[i])
        }
        setSumStockWeights(sum.toFixed(2))
    }

    // Function to handle start date change
    const handleInitialDepositChange = (event) => {
        setInitialDeposit(event.target.value);
    };
    // Function to handle changes in stockWeight for a specific index
    const handleStockWeightChange = (event, index) => {
        const newStockWeightList = [...stockWeightList];
        newStockWeightList[index] = event.target.value;
        setStockWeightList(newStockWeightList);
        calculateStockWeightSum(newStockWeightList)
    };
    // Function to handle start date change
    const handleStartDateChange = (event) => {
        setStartDate(event.target.value);
    };

    // Function to handle end date change
    const handleEndDateChange = (event) => {
        setEndDate(event.target.value);
    };
    
    

    // Function to format date in yyyy-mm format
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Add padding if needed
        return `${year}-${month}`;
    };

    // Get the minimum and maximum allowed dates
    const minDate = new Date(2014, 0); // January 2014
    const maxDate = new Date(2023, 11); // December 2023

    return(
        <>
            
                <div className="ProfitLineGraphMenu-title">Menu</div>
                    <div className="ProfitLineGraphInput-group">
                        <div className='ProfitLineGraphInputInitialDepositContainer'>
                            <label htmlFor="initial-deposit" className='ProfitLineGraphTextOrLabel' >Initial Deposit:</label>
                            <input 
                            type="number" 
                            id="initial-deposit" 
                            name="initial-deposit" 
                            min="0" 
                            max="1000000" 
                            className='ProfitLineGraphinput'
                            value={initialDeposit}
                            onChange={(e)=>handleInitialDepositChange(e)}
                            />
                        </div>
                </div>
                <div id='ProfitLineGraphMenuPortfolio'>
                    <p id='ProfitLineGraphMenuPortfolioPar'><strong>Portfolio</strong></p>
                </div>
                {tickerList.map((ticker, index) => (
                <div className="ProfitLineGraphInput-group" key={index}>
                    <div className="ProfitLineGraphStock-inputs">
                        <label htmlFor={`stock-${ticker}`} className='ProfitLineGraphTextOrLabel'>{ticker}:</label>
                        <input
                        type="number"
                        className='ProfitLineGraphinput'
                        id={`stock-value-${ticker}`}
                        name={`stock-value-${ticker}`}
                        min="0"
                        max="100"
                        step="1"
                        value={stockWeightList[index]} // Set value to stockWeightList state
                        onChange={(event) => handleStockWeightChange(event, index)} // Handle changes in stockWeightList
                        />
                        
                    </div>
                </div>
                ))}
                <div id='ProfitLineGraphMenuStockTotal'>
                    {sumStockWeights==100?
                        <p id='ProfitLineGraphMenuGoodSum'>Portfolio total: {sumStockWeights}</p>
                        :
                        <p id='ProfitLineGraphMenuBadSum'>Portfolio total: {sumStockWeights}</p>
                    }
                </div>
                <div className="ProfitLineGraphInput-group">
                    <div className='ProfitLineGraphInputDateInput'>
                        <label htmlFor="start-date" className='ProfitLineGraphTextOrLabel'>Start Date:</label>
                        <input 
                        type="month" 
                        id="start-date" 
                        name="start-date" 
                        min={formatDate(minDate)} 
                        max={formatDate(maxDate)} 
                        className='ProfitLineGraphinput'
                        value={startDate}
                        onChange={(e)=>handleStartDateChange(e)}
                        />
                    </div>
                </div>
                <div className="ProfitLineGraphInput-group">
                    <div className='ProfitLineGraphInputDateInput'>
                        <label htmlFor="end-date" className='ProfitLineGraphTextOrLabel'>End Date:</label>
                        <input 
                        type="month" 
                        id="end-date" 
                        name="end-date" 
                        min={formatDate(minDate)} 
                        max={formatDate(maxDate)} 
                        className='ProfitLineGraphinput'
                        value={endDate}
                        onChange={(e)=>handleEndDateChange(e)}
                        />
                    </div>
                </div>
        </>
    )
}


export default ProfitLineGraphMenu;