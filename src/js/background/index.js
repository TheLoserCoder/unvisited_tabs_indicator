import { browser } from "../config";
import { Types } from "../tools/Port";
export const server = new Types(["global"]);
browser.runtime.onInstalled.addListener(async () => {
    const set = await getSettings();
    if(!set){
        browser.storage.local.set({settings: {
            x: 8,
            y: 12,
            radius: 4,
            color: {r: 255, g: 255, b:255, a:1},
            brightness: 50
        }})
    }
   
});

async function getSettings()
{
    return new Promise(res => {
        browser.storage.local.get("settings", ({settings}) => {
            res(settings);
        })
    })
}

async function updateSettings(newData)
{
    const settings = await getSettings();
    console.log(newData)
    settings[newData.name] = newData.value;
    console.log(settings)
    browser.storage.local.set({settings});
    return settings;
}

server.global.on("connect", (port) => {
    port.on("getSettings", getSettings);
    port.on("updateSettings", updateSettings);
});

browser.tabs.onCreated.addListener(async (tab) => {
    if(tab.active) return;
    async function onUpdated(tabId, changeInfo, _tab){
        if(tab.id == tabId){
            if(changeInfo.favIconUrl){
                if(!_tab.active){
                    const [dataUrl, settings] = await Promise.all([getImage(changeInfo.favIconUrl), getSettings()])
                    browser.tabs.sendMessage(tabId, {event: "setFavIcon", data: {dataUrl, settings}});
                }
               
                browser.tabs.onUpdated.removeListener(onUpdated);
            }
        }
    }

    
    browser.tabs.onUpdated.addListener(onUpdated)
})

browser.tabs.onActivated.addListener(async ({tabId}) => {
        browser.tabs.sendMessage(tabId, {event: "setOriginal"});
})


export async function getImage(url)
{
    const resp = await fetch(url);
    const blobData = await resp.blob();
    const reader = new FileReader();
    return new Promise((res) => {
        reader.addEventListener("load", (e) => {
            res(e.target.result);
        })
        reader.readAsDataURL(blobData);
    })
}
