const fs = require('fs');
const path = require('path');
const template = require('art-template');
const os = require('os');

/**
 * 遍历指定目录下的所有文件
 * @param {*} dir
 */
const getAllFile=function(dir){
    let res=[]
    function traverse(dir){
        fs.readdirSync(dir).forEach((file)=>{
            const pathname=path.join(dir,file)
            if(fs.statSync(pathname).isDirectory()){
                traverse(pathname)
            }else{
                res.push(pathname)
            }
        })
    }
    traverse(dir)
    return res;
}

let res = [];
if (["linux", "darwin"].indexOf(os.platform()) !== -1) {
    res = getAllFile(__dirname + '/src');
} else {
    res = getAllFile(__dirname + '\\src');
}
console.info(res);

const GLOBAL_DATA = {
    //ARTIFACTS: "`ll |grep *[^sources].jar| awk '{print $9}'`"   // 默认制品位置
    user: {
        name: 'liuxinzhang',
        age: 25
    }
};

function delDir(path){
    let files = [];
    if(fs.existsSync(path)){
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
            let curPath = path + "/" + file;
            //判断是否是文件夹
            if(fs.statSync(curPath).isDirectory()){
                delDir(curPath); //递归删除文件夹
            } else {
                //是文件的话说明是最后一层不需要递归
                fs.unlinkSync(curPath); //删除文件
            }
        });
        fs.rmdirSync(path);
    }
}

// 清空目标文件夹
delDir(__dirname+'\\dist');

// 开始渲染
res.forEach((filePath, index) => {
    let fileName = path.basename(filePath);
    // 目标位置
    let dist = filePath.replace("src",'dist');

    const direction = path.join(dist,"../");

    fs.mkdir(direction,{recursive:true},(err)=>{
        if(err)  {
            return console.log(err);
        }
        // 模板文件渲染
        if(fileName.indexOf(".art")>-1 || fileName.indexOf(".yml")>-1){
            fileName = fileName.replace(".art","");
            const html = template(path.resolve(filePath), {...GLOBAL_DATA,inner_data:GLOBAL_DATA});
            fs.writeFile(direction+fileName, html, err => {
                if (err) {
                    return console.error(err)
                }
            })
        }
        // 非模板文件拷贝
        else {
            const readStream = fs.createReadStream(filePath);
            const writeStream = fs.createWriteStream(dist);
            readStream.pipe(writeStream);
        }
    });

})

