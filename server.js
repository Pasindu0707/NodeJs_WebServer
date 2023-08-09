const http=require('http')
const Event=require('./logEvent')
const EventEmmiter=require('events')
const fs=require('fs')
const path=require('path')
const fspromises=require('fs').promises

class MyEvent extends EventEmmiter{}

const event=new MyEvent()

event.on('log',(msg,fileName)=>Event(msg,fileName))


const PORT=process.env.PORT|| 3500

const serveFile=async(filePath,contentType,response)=>{
    try{
        const rawData=await fspromises.readFile(
            filePath,
            !contentType.includes('image')?'utf-8':''
            )
        const data=contentType==='application/json'
        ?JSON.parse(rawData):rawData
        response.writeHead(
            filePath.includes('404.html')?404:200,
            {'content-Type':contentType}
            )
        response.end(
            contentType==='application/json'?JSON.stringify(data):data
        )

    }catch(err){
        console.log(err)
        event.emit('log',`${err.name}:${err.message}`,'errLogs.txt')
        response.statusCode=500
        response.end()
    }
}


const server=http.createServer((req,res)=>{
    console.log(req.url,req.method)
    event.emit('log',`${req.url}\t${req.method}`,'logs.txt')

    const extention=path.extname(req.url)

    let contentType

    switch(extention){
        case '.css':
            contentType='text/css'
            break
        case '.js':
            contentType='text/javascript'
            break
        case '.jpeg':
            contentType='text/jpeg'
            break
        case '.json':
            contentType='text/json'
            break
        default:
            contentType='text/html'
    }

    let filePath=
        contentType==='text/html'&& req.url==='/'
            ?path.join(__dirname,'views','index.html')
            :contentType==='text/html' && req.url.slice(-1)==='/'
                ?path.join(__dirname,'views',req.url,'index.html')
                :contentType==='text/html'
                    ?path.join(__dirname,'views',req.url)
                    :path.join(__dirname,req.url);

    //makes .html extention not required in browser
    if(!extention && req.url.slice(-1)!=='/')filePath += '.html'

    const fileExists=fs.existsSync(filePath)

    if(fileExists){
        serveFile(filePath,contentType,res)

    }
    else{
        switch(path.parse(filePath).base){
            case 'old-page.html':
                res.writeHead(301,{'Location':'/new-page.html'});
                res.end()
                break
            default:
                serveFile(path.join(__dirname,'views','404.html'),'text/html',res)
        }
    }


    /*let pathFile

    if(req.url==='/'||req.url==='index.html'){
        res.statusCode=200
        res.setHeader('Content-Type','text/html')
        pathFile=path.join(__dirname,'views','index.html')
        fs.readFile(pathFile,'utf-8',(err,data)=>{
            res.end(data)
        })
    }*/


})

server.listen(PORT,()=>console.log(`Server running on port ${PORT}`))


/*setTimeout(()=>{
    
    event.emit('anyName','Event Emitted!')

},2000)*/