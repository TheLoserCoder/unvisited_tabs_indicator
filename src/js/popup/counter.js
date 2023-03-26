import React from "react";

import { TextField, FormControlLabel } from "@material-ui/core";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  root: {
    justifyContent: "space-between",
  },
});


export function Counter(props)
{
    const classes = useStyles();
    const [value, setValue] = useState(props.value || 0);

    useEffect(() => {
        if(!props.onChange) return;
        props.onChange({target: {name: props.name, value}})
      }, [value]);

    const onChange = (e) => {
        let newValue = e.target.value
        const [start, end] = props.range || [0, 10];
        if(newValue < start){
            newValue = start;
        }else if(newValue > end){
            newValue = end;
        }
        setValue(newValue)
    }
    return(
        <FormControlLabel sx = {{margin: "0px"}} className={classes.root} labelPlacement = "start" 
        control={
        <TextField sx = {{width: "80px", margin: "5px 0px"}}
        onChange = {onChange}
        value = {value}
        size="small"
        inputProps={ {
            style: {
                textAlign: "center"
            },
            type: "number", name: props.name}} />} 
        label = {props.label}/>
    )
}