//

m.unshift( mut_slice( m, _.findIndex( m, y => y.level == 0 ) // take root folder and place it at the top of the array

//

let sortBy = n => x => x.sort( (a,b) => a[n].localeCompare( b[n] ) ) // sorting result are different with _.sortBy or _.orderBy in lodash

let ignoreRoot = x => { let n = mut_slice(x,0);sortBy("pathx")(x);return [n,...x] } // sort everything except the first value ( root value )

//

function mut_slice(m,n){
	return m.splice(n,1)[0] //  splice return a array, mut_slice just one value
}

//

function csvToJson(m){

	console.log("csvToJson")

	let obj = {}
	let source
	let first

	;( () => {

		source = mut_slice(m,0)
		first  = source.pathx

	})()

	// console.log(source)

	for( let x of m ){

		;[...x.pathx.split("/")].reduce( (o,v,i,arr) => {

			if( o[v] == undefined ){

				o[v] = [{},{}] // o[v] = {} | o[v] = [{},{}]

			}

			if( x.type == "file" && i == arr.length-1 ){

				Object.assign( o[v][0], { ...x } ) // Object.assign( o[v], { ...x } )

			}

			if( x.type == "folder" && i == arr.length-1 ){

				Object.assign( o[v][0], { ...x } ) // Object.assign( o[v], { ...x } )

			}

			return o[v][1]

		}, obj )

	}

	return { [first] : [source,obj] } // Object.assign( obj, source )

}

//

function jsontree( nested_obj, obj = { str: "" }, level=0 ){

	for ( let key of Object.keys( nested_obj ) ) {

		let attrs = nested_obj[key][0]

		let styleClass = ( attrs.color == "lightcoral" ) ? "red_label" : ""

		if ( attrs.type == "file" ){

			let data = `${key} : ${attrs.size} | ${formatBytes(attrs.size)}`

			let indicator = ( (x) => {
			  if (x.color == "powderblue")
			    return `&nbsp&nbsp<span style="" >[➕]&nbsp</span>`
			  else if (x.color == "lightcoral")
			    return `&nbsp&nbsp<span style="">[➖]&nbsp</span>`
			  else
			    return ""
			})(attrs)

			obj.str += `<li id="child"

				title="${path.join(attrs.source,attrs.pathx)}"
				class="${styleClass}">

				<span class="label_2"
					onclick="myFunction(this)"
					id=""
					style="background:${attrs.color}"
				>${data} | ${attrs.ext} </span>${indicator}

			</li>` /*id="${attrs.hashx}"*/

		}else if( attrs.type == "folder" ){

			let title = attrs.level != 0 ? path.join(attrs.source,attrs.pathx) : attrs.source

			if( attrs.size === 0 ){

				obj.str += `<li title="${title}" style="background:${attrs.color}" ><button class="tree" onclick="foo(this)">${key}</button>
					<ul>
						<li>➥&nbsp&nbsp<i>dossier vide</i></li>
					</ul>
				</li>`

			}else{

			obj.str += `<li class="${styleClass}">

				<span>

					<button class="tree" onclick="foo(this)"
						data-toggle="${ ( x => x == 0 ? key.split("/").at(-1) : key )(attrs.level) }"
						data-level="${attrs.level}"
						data-source="${attrs.source.split("/")[0]}"
						title="${title}"
						class="${styleClass}"
						style="background:${attrs.color}">${key}</button>

					<span class="label">${ numberWithSpaces(attrs.size) }</span>

					<span class="label">${ formatBytes(attrs.size) }</span>

				</span><span style="margin-right:15px;">${attrs.hashx}</span><!-- ici le span hashx -->

			<ul>` /*<span style="margin-right:15px;">${attrs.hashx}</span>*/

			jsontree( nested_obj[key][1], obj, level+1 )

			obj.str += `</ul></li>`

			}

		}

	}

	return obj.str

}
