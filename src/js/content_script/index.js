import { browser } from "../config";
import uniqid from "uniqid";
const canvas = document.createElement("canvas");
canvas.width = 16;
canvas.height = 16;
const context = canvas.getContext('2d');
const link = document.createElement("link");
link.rel="icon";
let orignalFavIcon = null;
let dataUrlBuf = null;
async function setFavIcon(data){
  const img = document.createElement("img");
  img.addEventListener("load", () => {
    const height = 16;
    const width = 16;
    context.filter = `brightness(${data.settings.brightness}%)`;
    context.drawImage(img, 0, 0, width, height);
    context.filter = "brightness(100%)";
    context.arc(data.settings.x, data.settings.y, data.settings.radius, 0, 2*Math.PI);
    context.fillStyle = `rgba(${data.settings.color.r}, ${data.settings.color.g},  ${data.settings.color.b}, ${data.settings.color.a})`;
    context.fill();
    dataUrlBuf = canvas.toDataURL();
    link.href=  dataUrlBuf;
    document.head.appendChild(link); 
  });
  img.src = data.dataUrl;
  orignalFavIcon = data.dataUrl;

}
const observer = new MutationObserver((mutations) => {
    for(const mut of mutations){
      //if(mut.addedNodes[0] && mut.addedNodes[0].nodeName !== "LINK") continue;
      if( Array.from(mut.addedNodes).includes(link) ||  Array.from(mut.removedNodes).includes(link) ){
      }else{
        if(link.parentNode ==document.head ){
          document.head.removeChild(link);
        }
        
        document.head.appendChild(link); 
      }
    }

});

async function setOriginal()
{
  if(!orignalFavIcon) return;
  observer.disconnect();
  //document.head.removeChild(link);
  link.href = orignalFavIcon;
}
browser.runtime.onMessage.addListener(({event, data}) => {
  if(event == "setFavIcon"){
    setFavIcon(data)
  }else if(event == "setOriginal"){
    setOriginal()
  }
});

document.addEventListener("DOMContentLoaded", () => {
  observer.observe(document.head, {childList: true})

})
