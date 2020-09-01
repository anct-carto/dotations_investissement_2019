	
		// Création de la carte
		var map = L.map('mapid', {maxZoom:11, minZoom:5 })
		.setView([46.5, -1.8], 6);
		map.zoomControl.setPosition('topright');
		map.attributionControl.addAttribution('<a href="https://cartotheque.cget.gouv.fr/cartes" style="text-decoration:none;" target="_blank ">ANCT</a>');
			
		//Ajout du panneau latéral
		var sidebar = L.control.sidebar('sidebar').addTo(map);
		sidebar.open('home');
		
		echelon = "";
		
/* COULEURS - STYLES - LEGENDE */
		
		//Images de légende
		var imageBounds = [[51.9, -5.4],[49.8, 0.16]]; 
		var legende = L.imageOverlay('img/picto_legende.png', imageBounds, {zIndex : '1000'} );
		map.addLayer(legende);
		var legende_cd = L.imageOverlay('img/picto_legende_cd.png', imageBounds, {zIndex : '1000'} );
		var legende_epci = L.imageOverlay('img/picto_legende_epci.png', imageBounds, {zIndex : '1000'} );
		var legende_com = L.imageOverlay('img/picto_legende_com.png', imageBounds, {zIndex : '1000'} );
		
		//Fonctions de définition des couleurs
		function getColor1(d) { //Total des dotations par habitant
			return 	d > 40 ? '#6864bb' : //élevé
			d <= 20  ? '#f1e3f3' : //faible
			d <= 40 ? '#a7a5d8' : //moyen
			'grey' ;
		}
		
		function getColor2(d) { //Nombre de projets portés dans la collectivité
			return 	d > 4 ? '#DE3B33' : //élevé
			d <= 2  ? '#FFAD99' : //faible
			d <= 4 ? '#FF8071' : //moyen
			'grey' ;
		}
		
		//Style des polygones départements
		function style1(feature) {
			return {
			fillColor: getColor1(feature.properties.total_dotation_hab),
			weight: 0.8,
			opacity: 1,
			color: 'white',
			fillOpacity: 1
		};
		}
		
		function style2(feature) {
			return {
			fillColor: getColor2(feature.properties.nb_projets),
			weight: 0.8,
			opacity: 1,
			color: 'white',
			fillOpacity: 1
		};
		}
		
		function style3(feature) {
			return {
			fillColor: getColor2(feature.properties.nb_projets),
			weight: 0.1,
			opacity: 1,
			color: 'white',
			fillOpacity: 1
		};
		}
		
		
/* CREATION DES COUCHES */		
		
		//Niveaux d'affichage des couches
		map.createPane('selection');
		map.getPane('selection').style.zIndex = 600;
		map.createPane('regions');
		map.getPane('regions').style.zIndex = 500;
		map.createPane('markers');
		map.getPane('markers').style.zIndex = 550;
		map.createPane('bigMarker');
		map.getPane('bigMarker').style.zIndex = 580;
		map.createPane('labels');
		map.getPane('labels').style.zIndex = 610;
		
		//Couches du fond de carte
		Cache = L.geoJSON(JS_masque, {color: "#9de0d4", weight: 0, opacity: 1, fillOpacity: 1}).addTo(map);
		Cercles_drom = L.geoJSON(JS_drom, {color: "#ffffff", weight: 0.5, opacity: 0.7, fillOpacity: 0}).addTo(map);
		Contour_Regions = L.geoJSON(js_reg, {
			style: {interactive: false, color: "#ffffff", weight: 1.5, opacity: 1, pane:'regions', fillOpacity: 0}
		}).addTo(map);
		
		Fond_Regions = L.geoJSON(js_reg, {
			style: {interactive: false, fillColor: "#FAFAFA", weight: 0, opacity: 1, fillOpacity: 1}
		}).addTo(map);
		
		
		//Création des labels
		var createLabelIcon = function(labelClass,labelText){
		return L.divIcon({ 
		className: labelClass,
		html: labelText
		})
		}
		
		//Label Regions
		labelsReg = L.geoJSON(JS_chef_lieu, {
				pointToLayer: function(feature, latlng) {
					return L.marker(latlng,{icon:createLabelIcon("labelClassReg", feature.properties.libgeom),pane:'labels', interactive: false})
				},
				filter : function(feature, layer) {
                return feature.properties.STATUT == "région";
				}		
		}).addTo(map)
		
		//Label Departements
		labelsDep = L.geoJSON(JS_chef_lieu, {
				pointToLayer: function(feature, latlng) {
					return L.marker(latlng,{icon:createLabelIcon("labelClassDep", feature.properties.libgeom),pane:'labels', interactive: false})
				},
				filter : function(feature, layer) {
                return feature.properties.STATUT == "département";
				}		
		})
		
		//Label Canton
		labelsCan = L.geoJSON(JS_chef_lieu, {
				pointToLayer: function(feature, latlng) {
					return L.marker(latlng,{icon:createLabelIcon("labelClassCan", feature.properties.libgeom),pane:'labels', interactive: false})
				},
				filter : function(feature, layer) {
                return feature.properties.STATUT == "sous-prefecture";
				}		
		})
		
		//Départements
		departement = L.geoJSON(js_dep, {
			style: style1,
			onEachFeature: function(feature, layer) {
					layer.bindTooltip(feature.properties.libgeo + ' (' + feature.properties.codgeo + ')', {className: 'Tooltips', direction: "center", sticky:true});
					layer.on('click', function(e) {
						popupDEP(feature.properties);
						selectProjets("departement", feature.properties.codgeo);
						geoSelect(e.target._latlngs);	
						});	
					}
		});
		departement.addTo(map);
		
		//Conseils départementaux
		cd = L.geoJSON(js_collectivites, {
			style: style2,
			filter : function(feature, layer) {
                return feature.properties.layer == "conseil_departemental";
				},	
			onEachFeature: function(feature, layer) {
					layer.bindTooltip(feature.properties.libgeo + ' (' + feature.properties.codgeo + ')', {className: 'Tooltips', direction: "center", sticky:true});
					layer.on('click', function(e) {
						popupCOL(feature.properties);
						selectProjets(feature.properties.layer, feature.properties.codgeo);
						geoSelect(e.target._latlngs);
						});	
					}
		});
		
		//Intercommunalités
		epci = L.geoJSON(js_collectivites, {
			style: style2,
			filter : function(feature, layer) {
                return feature.properties.layer == "epci";
				},	
			onEachFeature: function(feature, layer) {
					layer.bindTooltip(feature.properties.libgeo + ' (' + feature.properties.codgeo + ')', {className: 'Tooltips', direction: "center", sticky:true});
					layer.on('click', function(e) {
						popupCOL(feature.properties);
						selectProjets(feature.properties.layer, feature.properties.codgeo);
						geoSelect(e.target._latlngs);
						});	
					}
		});
		
		//Communes
		com = L.geoJSON(js_collectivites, {
			style: style3,
			filter : function(feature, layer) {
                return feature.properties.layer == "commune";
				},	
			onEachFeature: function(feature, layer) {
					layer.bindTooltip(feature.properties.libgeo + ' (' + feature.properties.codgeo + ')', {className: 'Tooltips', direction: "center", sticky:true});
					layer.on('click', function(e) {
						popupCOL(feature.properties);
						selectProjets(feature.properties.layer, feature.properties.codgeo);
						geoSelect(e.target._latlngs);	
						});	
					}
		});
		

/* CONTENU DES FICHES */
	
		//Création de la fiche récapitulative par département
		function popupDEP(e) {
			if (document.getElementById('sidebar').classList.contains('collapsed')){sidebar.open('home');}
			masquerPanneaux();
			document.getElementById('popupDEP').style.display = "block";
			document.getElementById('tableDEP').style.display = "block";
			//Remplissage de la popup
			document.getElementById('NOMDEP').innerHTML = "<h1>"+e.libgeo+" ("+e.codgeo+")</h1><span>Fiche Département</span>";
			//document.getElementById('LIEN').innerHTML = "<a class='liste' href='maps/Dotations_investissement_departement_"+e.codgeo+".png' target=_blank >&rarr; Télécharger la carte pour le département</a>";
			document.getElementById('POPDEP').innerHTML = "<span>"+format2(e.pop19)+" habitants</span>";
			document.getElementById('DIDEP').innerHTML = "<span>"+format2(e.total_dotations)+"&nbsp;€</span>";
			document.getElementById('DIHA').innerHTML = "<span>"+format2(e.total_dotation_hab)+"&nbsp;€</span>";
			document.getElementById('NB_PROJETS').innerHTML = "<span>"+e.total_nb_projets+"</span>";
		}
		
		//Création des fiches pour les collectivités
		function popupCOL(e) {
			if (document.getElementById('sidebar').classList.contains('collapsed')){sidebar.open('home');}
			masquerPanneaux();
			document.getElementById('popupCOL').style.display = "block";
			//Remplissage de la popup
			document.getElementById('NOMCOL').innerHTML = "<h1>"+e.libgeo+" ("+e.codgeo+")</h1><span>Fiche "+e.echelon+"</span>";
			document.getElementById('POP19').innerHTML = "<span>"+format2(e.pop19)+" habitants</span>";
			document.getElementById('DI_COL').innerHTML = "<span>"+format2(e.tot_sub)+"&nbsp;€</span>";
			//document.getElementById('DIHA_COL').innerHTML = "<span>"+format2(e.sub_hab)+"&nbsp;€</span>";
			document.getElementById('NB_PROJETS_COL').innerHTML = "<span>"+e.nb_projets+"</span>";
		}
		
		//Affichage de la liste des projets associés à une collectivité données
		var extractTab = [];
		function selectProjets(layer, id_terr){
			extractTab.length = 0;
			//Extraction des projets d'un département, tous niveaux de collectivité confondus
			if(layer == "departement"){
				document.getElementById('LISTE_PROJETS_DEP').innerHTML = "";
				extract = L.geoJSON(js_projets, {
					filter: function(feature, layer) {return feature.properties.id_dep == id_terr },
					onEachFeature: function(feature, layer) {
						extractTab.push([ [feature.properties.id_projet],[feature.properties.description],[feature.properties.dotation],[feature.properties.echelon],[feature.properties.categorie],[feature.properties.cout_total],[feature.properties.montant_sub],[feature.properties.pct_sub],[feature.properties.nom_terr],[feature.properties.pop19],[feature.properties.nom_echelon],[feature.properties.nom_dep]]);
						document.getElementById('LISTE_PROJETS_DEP').innerHTML += 
							"<li class='liste' onClick='ficheProjet(\""+feature.properties.id_projet+"\");'><a href='#'>"+format6(feature.properties.description)+"</a></li>";
						}
					})
			}
			//Extraction des projets dans un niveau de collectivite donné
			else {
				document.getElementById('LISTE_PROJETS').innerHTML = "";
				extract = L.geoJSON(js_projets, {
					filter: function(feature, layer) {return feature.properties.echelon == layer || feature.properties.id_terr == id_terr },
					onEachFeature: function(feature, layer) {
						extractTab.push([ [feature.properties.id_projet],[feature.properties.description],[feature.properties.dotation],[feature.properties.echelon],[feature.properties.categorie],[feature.properties.cout_total],[feature.properties.montant_sub],[feature.properties.pct_sub],[feature.properties.nom_terr],[feature.properties.pop19],[feature.properties.nom_echelon],[feature.properties.nom_dep]]);
						document.getElementById('LISTE_PROJETS').innerHTML += 
							"<li class='liste' onClick='ficheProjet(\""+feature.properties.id_projet+"\");'><a href='#'>"+format6(feature.properties.description)+"</a></li>";
						}
					})
			}	
		}
		
		//Ecriture de la fiche projet
		function ficheProjet(e){
			for (var i = 0; i < extractTab.length; i++) {
				if(e == extractTab[i][0]){
					document.getElementById('TITRE_TABLEAU_PROJET').innerHTML = "<span>Département "+extractTab[i][11]+"</span></br><span>Fiche projet</span>";
					document.getElementById('DESCRIPTION').innerHTML = "<span>"+extractTab[i][1]+"</span>";
					document.getElementById('NOM_COL').innerHTML = "<span>"+extractTab[i][8]+"</span>";
					document.getElementById('ECHELON').innerHTML = "<span>"+extractTab[i][10]+"</span>";
					document.getElementById('CATEGORIE').innerHTML = "<span>"+extractTab[i][4]+"</span>";
					document.getElementById('DOTATION').innerHTML = "<span>"+extractTab[i][2]+"</span>";
					document.getElementById('COUT').innerHTML = "<span>"+format2(extractTab[i][5])+"&nbsp;€</span>";
					document.getElementById('SUBVENTION').innerHTML = "<span>"+format2(extractTab[i][6])+"&nbsp;€</span>";
					document.getElementById('LEVIER').innerHTML = "<span>"+format3(extractTab[i][7]*100)+"&nbsp;%</span>";
				}
			}
			masquerPanneaux();
			document.getElementById('popupPROJET').style.display = "block";
		}
	
	
/* ACTIONS */
		
		function resetView() {
			map.setView([46.5, -1.8], 6);		
		}
		
		function resetMap () {
			sidebar.open('home');
			echelon = "departement";
			masquerPanneaux();
			document.getElementById('accueil').style.display = "block";
			document.getElementById('credits').style.display = "block";
			if(selection) {map.removeLayer(selection);}
			map.addLayer(departement);
			map.removeLayer(cd);
			map.removeLayer(com);
			map.removeLayer(epci);
			map.addLayer(legende);
			map.removeLayer(legende_cd);
			map.removeLayer(legende_com);
			map.removeLayer(legende_epci);
			document.getElementById('logo_dep').className = "onglet_off";
			document.getElementById('logo_epci').className = "onglet_off";
			document.getElementById('logo_com').className = "onglet_off";
			}
			
		function retourAccueil () {
			resetView();
			resetMap ();
		}
		
		//Masque tous les panneaux
		var panneaux = document.getElementsByClassName("panneau");
		function masquerPanneaux() {
			for (var i = 0; i < panneaux.length; i++) {
				panneaux[i].style.display = "none";
			}
		}
		
		// Switch entre les onglets
		function switchEPCI() {
			echelon = "epci";
			masquerPanneaux();
			if(selection) {map.removeLayer(selection);}
			document.getElementById('panneauEPCI').style.display = "block";
			map.removeLayer(departement);
			epci.addTo(map);
			map.removeLayer(com);
			map.removeLayer(cd);
			map.addLayer(legende_epci);
			map.removeLayer(legende_cd);
			map.removeLayer(legende_com);
			map.removeLayer(legende);
			document.getElementById('logo_dep').className = "onglet_off";
			document.getElementById('logo_epci').className = "onglet_on";
			document.getElementById('logo_com').className = "onglet_off";
			}
		
		function switchCD() {
			echelon = "cd";
			masquerPanneaux(); 
			if(selection) {map.removeLayer(selection);}
			document.getElementById('panneauCD').style.display = "block";
			map.removeLayer(departement);
			cd.addTo(map);
			map.removeLayer(com);
			map.removeLayer(epci);
			map.addLayer(legende_cd);
			map.removeLayer(legende);
			map.removeLayer(legende_com);
			map.removeLayer(legende_epci);
			document.getElementById('logo_dep').className = "onglet_on";
			document.getElementById('logo_epci').className = "onglet_off";
			document.getElementById('logo_com').className = "onglet_off";
			}
				
		function switchCommunes() {
			echelon = "commune";
			masquerPanneaux();
			if(selection) {map.removeLayer(selection);}
			document.getElementById('panneauCommunes').style.display = "block";
			map.removeLayer(departement);
			com.addTo(map);
			map.removeLayer(cd);
			map.removeLayer(epci);
			map.addLayer(legende_com);
			map.removeLayer(legende_cd);
			map.removeLayer(legende);
			map.removeLayer(legende_epci);
			document.getElementById('logo_dep').className = "onglet_off";
			document.getElementById('logo_epci').className = "onglet_off";
			document.getElementById('logo_com').className = "onglet_on";
			}
		
		//Action au clic sur "home"
		document.getElementById("logo").addEventListener("click", function(event){
			event.stopPropagation();
			retourAccueil();
		});

		//Entourer territoire sélectionné
		var selection; //lors d'un simple clic
		function geoSelect(e) {
			if(selection) {map.removeLayer(selection);}
			selection = new L.polygon(e, {weight:3, color:"#e1ff2f",interactive: false, pane:'selection', fillOpacity: 0});
			selection.addTo(map);
		}
		
		//Action au clic sur la carte
		map.on('click', function(e) { 
			//event.stopPropagation();
			//if(selection) {map.removeLayer(selection);}
			//e.preventDefault();
			});
			
		//Action de retour à la fiche de la collectivité
		function retour() {
			masquerPanneaux();
			if (echelon=="departement"){document.getElementById('popupDEP').style.display = "block";}
			else{document.getElementById('popupCOL').style.display = "block";}
			}
		
/* BARRES DE RECHERCHE */		
		
		var Recherche = L.layerGroup([com,epci,cd]);
		
		//Barre de recherche n°2 (en haut à droite)
		var searchControl = new L.control.search({
			layer: Recherche,
			initial: false,
			position:'topright',
			propertyName: 'libgeo',
			collapsed: true,
			marker: false,
			moveToLocation: function(latlng, title, map) {
				//var zoom = map.getBoundsZoom(latlng.layer.getBounds());
				map.setView(latlng, 8);
			}
		})
		
		searchControl.on('search:locationfound', function(e) {
			if(e.layer.feature.properties.layer == "conseil_departemental"){switchCD();}
			else if(e.layer.feature.properties.layer == "epci"){switchEPCI();}
			else {switchCommunes();}
			geoSelect(e.layer._latlngs);
			popupCOL(e.layer.feature.properties);
			selectProjets(e.layer.feature.properties.layer, e.layer.feature.properties.codgeo);
		});
		
		map.addControl(searchControl);
	
	resetMap();
