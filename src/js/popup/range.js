import React from "react";
import { Slider, Grid } from "@material-ui/core";


export function Range(props)
{
  const onChange = (e) => {
    if(props.onChange){
      props.onChange(e)
    }
  }
    return(
        <Grid container direction="row" alignItems="center" justifyContent="space-between">
            <Grid item>
                <span>{props.label}</span>
            </Grid>
            <Grid item>
                <Slider value = {props.value} onChange={onChange} name = {props.name} sx = {{width: "130px", margin: "5px 0px"}}/>
            </Grid>
        </Grid>

        )
}