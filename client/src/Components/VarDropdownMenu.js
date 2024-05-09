import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useState } from "react";

const VarDropdownMenu = ({variables, displayText, onChange, axisControl, selectedAttr, rerenderTrigger}) =>
{
    const [currentAttr, changeAttr] = useState('');
    const createMenuItems = () => {
        let items = []
        variables.forEach((item, index) => items.push(
                <MenuItem value={item} key={index}>
                    {item}
                </MenuItem>
        ))
        return items;
    }

    const handleChange = (event) => {
        changeAttr(event.target.value);
        rerenderTrigger("scatterPlot")
        if(axisControl === "x") {
            onChange([event.target.value, selectedAttr[1]]);
        }
        else {
            onChange([selectedAttr[0], event.target.value]);
        }
    };

    return(
        <FormControl>
            <InputLabel id='varMenuLabel'>{displayText}</InputLabel>
            <Select labelId="varMenuLabel" label={displayText} value={currentAttr} sx={{width: '10rem'}} onChange={handleChange}>
                <MenuItem value="">
                    <em>None</em>
                </MenuItem>
                {createMenuItems()}
            </Select>
        </FormControl>
    );
}

export default VarDropdownMenu;