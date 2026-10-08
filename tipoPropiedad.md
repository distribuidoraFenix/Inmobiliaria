# INFORMACION A COMPLETAR SEGUN EL TIPO DE PROPIEDAD

[CARACTERISTICAS_GENERALES]
id=Identificador unico del registro (UUID/String)
tipo_propiedad=Clasificacion del inmueble (Enum)
tipo_transaccion=Venta, alquiler o anticretico (Enum)
precio=Valor numerico del inmueble (Decimal)
moneda=Divisa de la transaccion (Enum: USD, BOB, EUR, etc.)
superficie_total=Metros cuadrados totales del espacio o lote (Decimal)
departamento=Lugar del inmueble (Enum)
zona=
direccion=Ubicacion textual de la propiedad (String)
latitud=Coordenada de latitud (Decimal)
longitud=Coordenada de longitud (Decimal)
estado_disponibilidad=Disponible, reservado o vendido (Enum)
fecha_creacion=Timestamp del registro (Datetime)

[CASA]
superficie_construida=Metros cuadrados construidos (Decimal)
cantidad_plantas=Cantidad de pisos (Integer)
dormitorios=Numero de dormitorios (Integer)
banos=Numero de banos (Integer)
parqueo_capacidad=Capacidad de estacionamiento propio (Integer)
has_patio_jardin=Presencia de patio o jardin propio (Boolean)
is_gated_community=Ubicacion en condominio cerrado (Boolean)

[DEPARTAMENTO]
superficie_construida=Metros cuadrados construidos (Decimal)
numero_piso=Numero de piso donde se ubica (Integer)
dormitorios=Numero de dormitorios (Integer)
banos=Numero de banos (Integer)
has_balcon_terraza=Presencia de balcon o terraza (Boolean)
amenities=Areas comunes de la torre (Lista/Array de Strings)
includes_parqueo_baulera=Inclusion de parqueo o baulera en la transaccion (Boolean)

[HABITACION]
tipo_bano=Bano privado o compartido (Enum)
areas_compartidas=Acceso a areas comunes compartidas (Lista/Array de Strings)
is_furnished=Inclusion de amoblado (Boolean)
servicios_incluidos=Servicios basicos incluidos en el precio (Boolean)

[EDIFICIO]
superficie_construida_total=Metros cuadrados construidos totales (Decimal)
cantidad_plantas_total=Cantidad total de plantas o pisos (Integer)
unidades_autonomas=Numero de unidades funcionales autonomas (Integer)
ascensores_count=Cantidad de ascensores disponibles (Integer)
parqueo_subsuelo_capacidad=Capacidad total del subsuelo o parqueo general (Integer)

[OFICINA]
superficie_construida=Metros cuadrados construidos (Decimal)
divisiones_internas=Numero de divisiones o despachos internos (Integer)
banos_count=Cantidad de banos para personal o visitas (Integer)
has_meeting_rooms=Presencia de salas de reuniones (Boolean)
has_structured_cabling=Certificacion de cableado estructurado o red (Boolean)

[LOCAL_COMERCIAL]
superficie_construida=Metros cuadrados construidos (Decimal)
metros_frente=Metros lineales de frente o vitrina hacia la calle (Decimal)
altura_techo=Altura libre del techo en metros (Decimal)
has_smoke_extractor=Presencia de extractor de humos para gastronomia (Boolean)
flujo_peatonal=Tipo de flujo peatonal de la zona (Enum: Alto, Medio, Bajo)

[LOCAL_INDUSTRIAL]
superficie_construida=Metros cuadrados construidos (Decimal)
suministro_electrico=Tipo de suministro electrico (Enum: Monofasico, Bifasico, Trifasico)
resistencia_suelo=Resistencia de carga del suelo en toneladas por metro cuadrado (Decimal)
truck_access=Accesibilidad para transporte pesado o camiones (Boolean)
codigo_zonificacion_ambiental=Codigo de zonificacion de impacto ambiental (String)

[TERRENO]
metros_frente=Metros lineales de frente (Decimal)
metros_fondo=Metros lineales de fondo (Decimal)
topografia=Topografia del suelo (Enum: Plano, Inclinado, Irregular)
max_floors_allowed=Altura maxima de edificacion permitida en numero de pisos (Integer)
has_perimeter_wall=Presencia de muro perimetral (Boolean)
codigo_zonificacion_urbana=Tipo de suelo o codigo de zonificacion urbana (String)

[QUINTA]
superficie_areas_verdes=Superficie de areas verdes o terreno libre en metros cuadrados (Decimal)
has_guest_house=Presencia de viviendas auxiliares o casa de casero (Boolean)
infraestructura_recreacion=Piscina, churrasquera, canchas (Lista/Array de Strings)
tipo_fuente_agua=Tipo de fuente de agua (Enum: Red publica, Pozo propio)

[BAULERA]
volumen_m3=Volumen de almacenamiento en metros cubicos (Decimal)
ubicacion_edificio=Ubicacion dentro de la edificacion (Enum: Subsuelo, Piso tecnico, Terraza)
has_ventilation=Presencia de sistema de ventilacion forzada (Boolean)

[GARAGE]
tipo_espacio=Tipo de espacio (Enum: Techado, Subterraneo, Descubierto)
tipo_acceso=Tipo de acceso vehicular (Enum: Independiente, En linea)
is_automated_gate=Automatizacion del porton de ingreso (Boolean)

[GALPON]
superficie_construida=Metros cuadrados construidos (Decimal)
altura_cumbrera=Altura de la cumbrera o punto mas alto del techo en metros (Decimal)
tipo_piso=Tipo de piso (Enum: Concreto armado, Asfalto, Tierra)
portones_tecnicos_count=Cantidad y dimensiones de los portones de acceso tecnico (String)
