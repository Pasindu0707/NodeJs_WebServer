const {format}=require('date-fns')
const {v4:uuid}=require('uuid')

const path=require('path')
const fs=require('fs')
const fsPromise=require('fs').promises

const Event=async(message,logName)=>{
    const date=format(new Date(),"yyyy/MM/dd\tHH/mm//ss")
    const type=`${date}\t${uuid()}\t${message}\n`
    console.log(type)

    try{
    if(!fs.existsSync(path.join(__dirname,'logFile'))){
        await fsPromise.mkdir(path.join(__dirname,'logFile'))
    }

    await fsPromise.appendFile(path.join(__dirname,'logFile',logName),type)
    }
    catch(err){
        console.error(err)
    }
}

module.exports=Event