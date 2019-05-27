(function () {
    
    const url = 'https://csic-primo.hosted.exlibrisgroup.com/primo-explore/fulldisplay?docid=34CSIC_ALMA_DS';
    const context = '&context=L&vid=34CSIC_VU1&search_scope=CAT_BIB_scope&tab=default_tab&lang=es_ES';
    const portadas = 'http://cobertes.csuc.cat/cobertes.php?institucio=CSIC&isbn='
    const autorP = 'https://csic-primo.hosted.exlibrisgroup.com/primo-explore/search?query=creator,exact,'
    const autorF = ',AND&tab=default_tab&search_scope=default_scope&sortby=rank&vid=34CSIC_VU1&lang=es_ES&mode=advanced&offset=0'
    const resultados = document.querySelector('#resultados');
    const menu = document.querySelector('#prueba');

    var htmlContent = '<div class="mensaje">Elige una materia</div>';
    resultados.insertAdjacentHTML('beforeend', htmlContent);

    fetch('./datos/materias.json')
    .then(response => response.json())
    .then(materias => {
        let htmlNav = ""
        htmlNav = '<div class="topnav" id="myTopnav">' + materias.map(materia => 
                    `<div class="dropdown"><button class="dropbtn">${materia.no}<i class="fa fa-caret-down"></i></button>
                        <div class="dropdown-content">` + materia.sub.map(sub =>
                            `<a id="${sub.nu}" href="#">${sub.no}</a>`).join('')+
                        '</div></div>'
                    ).join('')+'<a href="javascript:void(0);" style="font-size:15px;" class="icon" onclick="myFunction()">&#9776;</a></div>';

        menu.insertAdjacentHTML('afterbegin', htmlNav);
        menu.addEventListener("click", mostrarResultados, false);
    });

    fetch("./datos/datos.xml" , {cache: "no-store"}).then((results) => {results.text().then(( str ) => {datos = str})});

    function mostrarResultados(e) {
    if (e.target !== e.currentTarget && e.target.id !=='') {
        let mat = e.target.id;
        resultados.innerHTML = '';

        let responseDoc = new DOMParser().parseFromString(datos, 'application/xml');

        var nodos = responseDoc.evaluate( `//cdu[starts-with(num,"${mat}")]/ancestor::libro | 
                                               //cdu[contains(num,":${mat}")]/ancestor::libro    `, 
                                                responseDoc, null, XPathResult.ANY_TYPE, null );
            
        const libros = [];
        let libro = nodos.iterateNext();
        while (libro) {
            iep = libro.getElementsByTagName('iep').item(0).innerHTML;
            titulo = libro.getElementsByTagName('titulo').item(0).innerHTML;
            autor = libro.getElementsByTagName('autor').item(0).innerHTML;
            if(autor !== '') {
                autorU = encodeURI(autor)
                autor = `<b>Autor: </b>${autor} <a href=${autorP}${autorU}${autorF} target="_blank">(+)</a>`
            }
            lugar = libro.getElementsByTagName('lugar').item(0).innerHTML;
            editor = libro.getElementsByTagName('editor').item(0).innerHTML;
            fecha = libro.getElementsByTagName('fecha').item(0).innerHTML;
            isbn = libro.getElementsByTagName('isbn').item(0).innerHTML;
            isbn = isbn.split(';')[0]
            if (isbn == '') {
                isbn = "9781111111111"
            }
            var ejem = [];
            var ej = libro.getElementsByTagName('ejem');
            var ej = Array.from(ej);
            ej.map(function(e) { 
                signatura = e.getElementsByTagName('sig').item(0).innerHTML;
                descripcion = e.getElementsByTagName('des').item(0).innerHTML;
                coleccion = e.getElementsByTagName('col').item(0).innerHTML;

                ejem.push([signatura, descripcion, coleccion]); 
            });
                 
            var l = new Libro(iep, titulo, autor, lugar, editor, fecha, isbn, ejem );
            libros.push(l);
            libro = nodos.iterateNext();
        }
        if(typeof libros !== 'undefined' && libros.length > 0) {
            var htmlContent = '';
            htmlContent = '<ul>' + libros.map(libro => 
                            `<li class="article">
                                <img src="${portadas}${libro.isbn}" width="80" height="110">
                                  <h2>
                                    <a href=${url}${libro.iep}${context} target="_blank">${libro.titulo}</a></h2>
                                    <p>${libro.autor}</p>
                                    <p><b>Edición: </b>${libro.lugar} ${libro.editor}, ${libro.fecha}</p>
                                        <ul>`+ libro.ejemplar.map(eje =>
                                        `<li><p><b>${eje[2]}</b> | <b>${eje[0]}</b> | <b>${eje[1]}</b></p></li>`).join('')+
                                        '</ul>'+'</li>').join('')+'</ul>';
        } else {
            var htmlContent = '';
            htmlContent = '<div class="mensaje">Ningún libro adquirido sobre esa materia en este mes</div>';
        }
        resultados.insertAdjacentHTML('beforeend', htmlContent);       
        }
     e.stopPropagation();
    }
})();
