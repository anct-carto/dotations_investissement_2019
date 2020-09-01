	
/* FONCTIONS DE FORMATAGE DES NOMBRES ET DES CHAINES DE CARACTERE */
		
		//Fonctions de formatage de nombres et du texte
		function format1(nombre){ //2 chiffres après la virgule
		  nombre=parseFloat(nombre).toFixed(2);
		  return nombre;
		}
		function format2(nombre){ //séparateurs de milliers
		  nombre=parseFloat(nombre).toFixed(0);
		  nombre += '';
		  var sep = '&nbsp;';
		  var reg = /(\d+)(\d{3})/;
		  while( reg.test( nombre)) {
			nombre = nombre.replace( reg, '$1' +sep +'$2');
		  }
		  return nombre;
		}
		function format3(nombre){ // pas de chiffre après la virgule
		  nombre=parseFloat(nombre).toFixed(0);
		  return nombre;
		}
		
		function format4(nombre){ // valeur absolue
		  nombre=parseFloat(nombre).toFixed(2);
		  return Math.abs(nombre);
		}
		
		function format5(nombre){ // remplacer virgule par le point et donner le % avec 2 chiffres apres la virgule
		  nombre = nombre.replace(',','.')
		  nombre = nombre*100;
		  nombre=parseFloat(nombre).toFixed(2);
		  return nombre;
		}
		
		function format6(texte){ // Mettre le premier caractère en majuscule
		  texte = (texte+'').charAt(0).toUpperCase()+texte.substr(1);
		  return texte;
		}
	
