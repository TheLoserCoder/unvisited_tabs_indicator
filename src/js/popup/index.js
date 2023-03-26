import React, {useState, useEffect} from "react";
import {createRoot} from "react-dom/client";
import { Stack } from "@material-ui/core";
import { Counter } from "./counter";
import { ChromePicker } from "react-color";
import { TypePort } from "../tools/Port";

const port = new TypePort("global");

function App()
{
    const [settings, setSettings] = useState(null);
    const [color, setColor] = useState(null);
    const getSettings = async () => {
       const s = await port.postMessage("getSettings");
       console.log(s)
       setSettings(s);
    };

    const updateSetting = async (e) => {
        const s = await port.postMessage("updateSettings", {name: e.target.name, value: e.target.value});
        setSettings(s);    
    }
    useEffect(() => {
        getSettings()
    }, []);

    console.log(color);
    return(
        !settings ? null :
        <Stack  direction={"row"}>
            <Stack>
                <Counter onChange={updateSetting} value = {settings.x} range = {[-8, 24]} name = "x" label= "X:"/>
                <Counter onChange={updateSetting}  value = {settings.y} range = {[-8, 24]}  name = "y" label= "Y:"/>
                <Counter onChange={updateSetting}  value = {settings.radius} range = {[1, 8]} n name = "radius" label= "Radius:"/>
                <Counter onChange={updateSetting}  value = {settings.brightness} range = {[0, 100]} n name = "brightness" label = "Brightness"/>
                <ChromePicker color={color || settings.color} 
                
                onChange={(color) => setColor(color.rgb)}
                onChangeComplete = {(color) => {
                    updateSetting({
                        target: {
                            name: "color",
                            value: color.rgb
                        }
                    })
                }} width="200px"/>
                
            </Stack>
            <div style = {
                {
                    position: "relative",
                    marginLeft: "30px",
                    width: "160px",
                    height: "160px",
                    boxShadow: "0 0 3px 3px gray",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    backgroundColor: "white",
                    backgroundImage: "linear-gradient( 45deg, #e8e8e8 25%, transparent 25%, transparent 74%, #e8e8e8 75%, #e8e8e8), linear-gradient( 45deg,#e8e8e8 25%, transparent 25%, transparent 74%, #e8e8e8 75%, #e8e8e8)",
                    backgroundSize: "20px 20px", 
                    backgroundPosition: "0 0, 10px 10px"
                }
            }>
                <div
                    style = {
                        {
                            width: "140px",
                            height: "140px",
                            background: "linear-gradient(0deg, rgba(131,58,180,1) 0%, rgba(253,62,38,1) 50%, rgba(252,176,69,1) 100%)",
                            borderRadius: "50%",
                            fontSize: "100px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            filter: `brightness(${settings.brightness}%)`,
                            zIndex: 1,
                        }
                    }
                >
                    I
                </div>
                <div style={{
                    position: "absolute",
                    top: `${settings.y * 10 - (settings.radius * 20)/2}px`,
                    left: `${settings.x * 10 - (settings.radius * 20)/2}px`,
                    borderRadius: "50%",
                    width: `${settings.radius * 20}px`,
                    height: `${settings.radius * 20}px`,
                    backgroundColor: `rgba(${settings.color.r}, ${settings.color.g},  ${settings.color.b}, ${settings.color.a})`,
                    zIndex: 2
                }}>

                </div>
            </div>
        </Stack>
    )
}

const root = createRoot(document.body);

root.render(<App/>);