
import uniqid from "uniqid";

let browser = chrome || browser;

class EventRouter
{
    constructor()
    {
        this.routes = {};
    }

    on(event, callback)
    {
        if(this.routes[event]){
            this.routes[event].push(callback);
        }else{
            this.routes[event] = [callback];
        }
    }
    once(event,  callback){
        const cb =  (data, port) => {
            this.removeListener(event, cb);
            return callback(data, port);
        }
        this.on(event, cb);
    }

    async dispatch(event)
    {
        if(!this.routes[event]) return 0;
        const result = await Promise.all(
            this.routes[event].map(cb => cb(...([...arguments].slice(1)) ))
        );
    
        if(result.length === 1) return result[0];
        else return result;
        
    }
    removeListener(event, callback)
    {
        if(!this.routes[event]) return;

        if(!callback){
            delete this.routes[event];
            return;
        }

        this.routes[event] = this.routes[event].filter(cb => cb !== callback);
    }
}

class Type extends EventRouter
{
    constructor(type)
    {
        super();
        this.type = type;
        this.port = null;
    }

    async sendMessage(event, data)
    {
        const reqId = uniqid();
        return new Promise((res, rej) => {
            browser.runtime.sendMessage({event, type: this.type, data, reqId}, (resp) => {
                const { error, data } = resp;
                if(error){
                    rej(error);
                }else{
                    res(data);
                }
            })
           
        })
    }

    createPort(initData)
    {
        return  new TypePort(this.type, initData);
    }
}

export class TypePort extends EventRouter{
    constructor(type, initData = {})
    {
       super();
       this.type = type;
       this.initData = initData;
       this.createPort();
    }

    static getPortData(portName)
    {
        return  JSON.parse(portName);
    }

    createPort() 
    {
        if(typeof this.type === "string")
        {
            this.nativePort = browser.runtime.connect({name: JSON.stringify({type: this.type, initData: this.initData})});
        }else{
            this.nativePort = this.type;
            const {type, initData} = TypePort.getPortData(this.nativePort.name);
            this.type = type;
            this.initData = initData;
        }
        
        this.nativePort.onMessage.addListener(this.onMessage.bind(this));
        this.nativePort.onDisconnect.addListener(this.onDisconnect.bind(this));
    }
    
    async onMessage(message, nativePort)
    {
        const {error, resId, reqId, event, data} = message;

        if(error){
            console.error("Error: ", error);
            this.removeListener(resId);
            return;
        }

        if(resId){
            this.dispatch(resId, data, this);
            return;
        }

        if(reqId){
            const response = {};
            try{
                const res = await this.dispatch(event, data, this);
                if(res === 0){
                    response.error = {
                        details: `No such event("${event}") handler for server!`
                    }
                }else{
                    response.data = res;
                }
            }catch(e){
                console.log(e)
                response.error = {
                    details: e.stack
                }
            }
           

            nativePort.postMessage({...response, resId: reqId, event});
        }

    }

    postMessage(event, data)
    {
        const reqId = uniqid();
        try{    
            this.nativePort.postMessage({reqId, event, data});
        }catch(e){
            this.createPort();
            this.nativePort.postMessage({reqId, event, data});
        }

        return new Promise((res) => {
             this.once(reqId, res);
        })
    }

    onDisconnect(nativePort)
    {
        this.dispatch("disconnect", nativePort)
    }

    disconnect()
    {
        this.nativePort.disconnect();
    }
}

export class Types
{
    constructor(types)
    {
        types.forEach(type => {
            this[type] = new Type(type);
        });

        browser.runtime.onConnect.addListener(this.onConnect.bind(this));
        browser.runtime.onMessage.addListener(this.onMessage.bind(this));
    }

     onMessage(message, sender, sendResponse)
    {
        const {event, type, data } = message;

        const response = {};
        if(this[type]){
            (this[type].dispatch(event, data, sender)).then((data) => {
                if(data === 0){
                    response.error = {
                        details: `No such event("${event}") handler!`
                    }
                }else{
                    response.data = data;
                }
                sendResponse({...response,  event});
            }, (rej) => {
                response.error = {
                    details: rej.toString()
                };
                sendResponse({...response,  event});
            })
        }else{
            response.error = {
                details: `No such type("${type}") handler!`
            };

            sendResponse({...response, event});
        }
     

        return true;
    } 

    onConnect(nativePort)
    {
        const {type} = TypePort.getPortData(nativePort.name);
        if(!this[type]) return;

        const port = new TypePort(nativePort);

        this[type].dispatch("connect", port);
    }

}