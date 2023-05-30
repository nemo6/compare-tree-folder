const fs      = require("fs")
const http    = require("http")
const path    = require("path")
const _       = require("lodash")
const clc     = require("cli-color")
const dayjs   = require("dayjs")
const hash    = require("crypto").createHash

let err = true

;( async () => {

	_.mixin({serverEx,csvToJson,jsontree})

	// const A = "E:/HDD"
	// const B = "F:/HDD"

	// const A = "C:/Users/test/Desktop/Nouveau dossier (3)/a2/dropbox (2)"
	// const B = "C:/Users/test/Desktop/Nouveau dossier (3)/b/dropbox (3)"

	let m = [
	"C:/Users/test/Downloads/partage/lofi/doublon (old)",
	"C:/Users/test/Downloads/partage/lofi/doublon",
	]

	let [A,B] = m

	globalThis["count"]=0;VA=(await walk_update(A))/*.filter(x=>x.type=="folder")*/
	globalThis["count"]=0;VB=(await walk_update(B))/*.filter(x=>x.type=="folder")*/

	let purple = _([...VA,...VB])
	.filter(x=>x.type=="file")
	.groupBy("hashx")
	.values()
	.filter( x => x.length > 1 )
	.filter( x => {
		if( x.length > 2 || x[0].pathx != x[1].pathx ) return true
	})
	// .thru( x => JSON.stringify(x,null,2) )
	// .server()
	.flatten()
	.map("pathx")
	.valueOf()

	let not_include = (a,b) => {

		for( let k in a ){

			if( purple.includes(a[k].pathx) )
			{
				a[k].color = "#ae87ff"
				continue
			}

			if( !_.map(b,"pathx").includes(a[k].pathx) )
			a[k].color = "powderblue"
			else
			a[k].color = ""
		}

		return a
	}

	let foo = (m) => {

		let [a,b] = m

		let ma = [...a]
		let mb = [...b]

		global["w"] = []

		let argv = [[a,ma],[b,mb]]

		let bar = (h,j) => {

			for( let k in argv[h][1] ){

				if( !_.map(argv[j][1],"pathx").includes(argv[h][1][k].pathx) ){

					let copy = _.clone(argv[h][0][k])
					copy.opacity = 0.5
					copy.color = ""
					copy.source = `copy from [${copy.source}]`
					argv[j][0].push(copy)

					{
						let {source,pathx} = argv[h][0][k]
						w.push(path.join(source,pathx))
					}

				}

			}

		}

		bar(0,1);_.flip(bar)(0,1)

		return [a,b]

	}

	let flowx = _.flow(csvToJson,jsontree)

	let mapIn = m => [not_include(...m),_.flip(not_include)(...m)]

	let sortP = x => _.sortBy(x,"pathx")
 		
 	_.mixin({arr,mapIn,foo,serverEx,render})

	_()
	.arr(VA,VB)
	.mapIn()
	.foo()
	.map(sortP)
	.tap( m => {

		let a = m[0]
		let b = m[1]

		for( let i=0;i<a.length;i++ ){
			if( a[i].size != b[i].size ){
			a[i].color = "lightcoral"
			b[i].color = "lightcoral"
			}
		}

	})
	.map(flowx)
	.render()
	.serverEx("html")
	.valueOf()

})()

async function walk_update(x){

	let bool = false

	let filename = x
	.replace(":\\","_")
	.replace(/\\/g,"_")
	+ ".json"

	if( fs.existsSync( "temp/" + filename ) ){
		console.log("already exist")
		return JSON.parse(fs.readFileSync( "temp/" + filename , "utf8" ))
	}

	let m = (await walk_folder(x))[0]

	let p = x
	for( let k in m ) {
		m[k].source = x
		m[k].pathx=m[k].pathx.replace( p + "/" , "" )
	}

	if( fs.existsSync("temp") && bool ){
		fs.writeFileSync( "temp/" + filename , JSON.stringify(m,null,2) )
	}

	return m
}

async function walk_folder(dir,level=0) {

	// count++;console.log(count)

	let table = []

	let size = 0
	let list = await fs.promises.readdir(dir)

	for ( let file of list ){

		let pathx = dir + "/" + file

		let stats = (await fs.promises.stat(pathx))

		if ( stats.isFile() ) {

			let data = await imohash2(pathx,stats.size)

			table.push({
			    "pathx"    : pathx,
			    "size"     : stats.size,
			    "type"     : "file",
			    "level"    : level,
			    "opacity"  : 1,
			    "hashx"    : hash("sha1").update(data).digest("hex"),
			    "source"   : dir.split("/").slice(6,7).join(""),
			})
			/*table.push({
			    "pathx": pathx,
			    "size": stats.size,
			    "type": "file",
			    "level": level,
			    "opacity": 1
			})*/
			size += stats.size

		}else if ( stats.isDirectory() ){

			level++
			let [a,b] = await walk_folder(pathx,level)
			table = table.concat( a )
			size += b
			level--
		}
	
	}

	if( level != 0 )
	table.push({
	    "pathx": dir,
	    "size": size,
	    "type": "folder",
	    "level": (level - 1),
	    "opacity": 1
	})

	return [table,size]

}

async function imohash2(x,n){
	if( n < 13 ) return (await fs.promises.readFile(x))
	let middle = new Promise( (resolve,reject) => {
		fs.open( x, "r", (status,fd) => {
			// fs.read(fd, buffer, offset, length, position, callback)
			let buffer = new Buffer.alloc(7) // Buffer.alloc(101)
			let position = ( n % 2 == 0 ) ? Math.trunc(n/2)-1 : Math.trunc(n/2) 
			fs.read( fd, buffer, 0, 7, position-3, (err,num) => {
				resolve(buffer)
			})
		})
	})
	let beginning = new Promise( (resolve,reject) => {
		fs.open( x, "r", function(status,fd){
			// fs.read(fd, buffer, offset, length, position, callback)
			let buffer = new Buffer.alloc(3)
			fs.read( fd, buffer, 0, 3, 0, function(err,num) {
				resolve(buffer)
			})
		})
	})
	let end = new Promise( (resolve,reject) => {
		fs.open( x, "r", function(status,fd){
			// fs.read(fd, buffer, offset, length, position, callback)
			let buffer = new Buffer.alloc(3)
			fs.read( fd, buffer, 0, 3, n-3, function(err,num) {
				resolve(buffer)
			})
		})
	})
	return (await Promise.all([beginning,middle,end])).join("")
}

/*function walk_csv(dir,table=[],level=0) {

	count++;console.log(count)

	let size = 0
	let list = fs.readdirSync(dir)

	for ( let file of list ){

		let pathx = dir + "/" + file

		let stats = fs.statSync(pathx)

		if( stats.isFile() ){

			table.push({
			    "pathx": pathx,
			    "size": stats.size,
			    "type": "file",
			    "dc": dayjs(stats.atime).valueOf(),
			    "dm": dayjs(stats.mtime).valueOf(),
			    "level": level,
			    "opacity": 1
			})

			size += stats.size

		}

		else if ( stats.isDirectory() ){

			level++
			size += walk_csv(pathx,table,level)[1]
			level--
		}

	}

	if( level != 0 ) table.push( { "pathx":dir, "size" : size, "type":"folder", "level":(level-1), "opacity":1 } )

	return [table,size]

}*/

function jsontree(nested_obj,obj={"str":""},table=[]){ // function rec(

	for ( let key of Object.keys(nested_obj) ) {

		if( !["_pathx","_size","_type","_dc","_dm","_level","_opacity","_color","_source"].includes(key) ){

			let styleClass = ( nested_obj[key]._color == "lightcoral" ) ? "red_label" : "" // style="opacity:${nested_obj[key]._opacity}"

			if ( nested_obj[key]._type == "file" ){

				let title = `${ [...table,key].join("/") }`

				let data = `${key} : ${nested_obj[key]._size} | ${formatBytes(nested_obj[key]._size)}`

				obj.str += `<li id="child" title="${nested_obj[key]._source}/${title}" class="${styleClass}">

					<span onclick="myFunction(this)" class="label_2" style="opacity:${nested_obj[key]._opacity};background:${nested_obj[key]._color}">${data}</span

				</li>`

			}else if( nested_obj[key]._type == "folder" ){

				let title = `${ [...table,key].join("/") }`

				let source = ( x => { if( x._opacity == 1 )
				return x._source + "/" + title
				else
				return x._source})(nested_obj[key])

				obj.str += `<li id="parent" class="${styleClass}">

					<span style="opacity:${nested_obj[key]._opacity}">

						<button onclick="foo(this)" data-toggle="${title}" title="${source}" class="${styleClass}" style="background:${nested_obj[key]._color}">${key}</button>

						<span class="label">${ numberWithSpaces(nested_obj[key]._size) }</span>

						<span class="label">${ formatBytes(nested_obj[key]._size) }</span>

					</span>

				<ul>`

				table.push(key)

				jsontree(nested_obj[key],obj,table)

				table.pop()

				obj.str += `</ul></li>`

			}

		}

	}

	return obj.str

}

function csvToJson(m){

	let obj = {}

	let source = m[0].source
	let first  = source.split("/").pop()

	for( let x of m ){

		try{

			;[...x.pathx.split("/")].reduce( (o,v,i,arr) => {

				if( o[v] == undefined ){

					o[v] = {}

				}

				if( x.type == "file" && i == arr.length-1 ){

					let w = ( (x) => { let w={};for( let k in x ){
					w["_"+k]=x[k]};return w
					})(x)

					Object.assign( o[v], { ...w } )

				}

				if( x.type == "folder" && i == arr.length-1 ){

					let w = ( (x) => { let w={};for( let k in x ){
					w["_"+k]=x[k]};return w
					})(x)

					if( Object.keys(w).includes(v) ) console.log(x)

					Object.assign( o[v], { ...w } )

				}

				return o[v]

			},obj)

		}catch(e){ if(err) console.log(e); err=false }

	}

	let size = _(m)
	.filter( x => x.type == "file" && x.opacity == 1 )
	.map("size")
	.sum()

	return { [first] : Object.assign( obj, { _size:size, _type:"folder" } ) }
}

function arr(x,...y){
	return y
}

function numberWithSpaces(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g,".")
}

function formatBytes(bytes,decimals=3) {
  if (bytes === 0) return "0 octets"
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["octets", "ko", "mo", "go", "to", "po", "eo", "zo", "yo"];
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  float = parseFloat((bytes / Math.pow(k, i)).toFixed(dm))
  return Math.trunc(float) + " " + sizes[i]
}

function server(x,n){

	const http = require("http")
	const PORT = 8080

	http.createServer(function (req, res) {
		
		res.writeHead(200,{"content-type":`text/${n};charset=utf8`})

		res.end(x)
		
	}).listen(PORT)

	console.log(`Running at port ${PORT}`)

}

function serverEx(x,n){

	const express    = require("express")
	const bodyParser = require("body-parser")
	const app        = express()
	const port       = 8080

	app.use(express.static(__dirname,{ index: false }))
	app.use(bodyParser.urlencoded({ extended: true }))

	app.get("/", function (req,res) {

		res.writeHead(200,{"content-type":`text/${n};charset=utf8`})
		res.end(x)

	})

	app.listen(port)

	console.log(`Running at port ${port}`)

}

function render(m){ return `
<link rel="stylesheet" href="style.css">

<div style="display:flex;">

	<div style="white-space:pre;">${m[0]}</div>

	<div style="white-space:pre;">${m[1]}</div>

</div>

<br><input id="myInput" style=""></input>

${fs.readFileSync("index.html","utf8")}

<pre>
${w.map( (x,i) => (i+1).toString().padStart(2,"0") + " " + x ).join("\n")}
</pre>

<!--<div>
${w.map( (x,i) => `<img style="width:15%;" src="${x}">` ).join("<br>")}
</div>-->

`}

function init(){
require("dayjs/locale/fr")
dayjs.locale("fr")
return require("lodash")}
