import React from "react";

import { TextField, FormControlLabel } from "@material-ui/core";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  root: {
    justifyContent: "space-between",
  },
});

export function ColorPicker(props)
{
    const classes = useStyles();

    const onChange = (e) => {
       if(props.onChange){
        props.onChange(e)
       }


    }
    return(
        <FormControlLabel sx = {{margin: "0px"}} className={classes.root} labelPlacement = "start" 
        control={
        <TextField sx = {{width: "80px", margin: "5px 0px"}}
        onChange = {onChange}
      
        size="small"
        inputProps={ {
            style: {
                textAlign: "center"
            },
            type: "color", name: props.name, value: props.value}} />} 
        label = {props.label}/>
    )
}