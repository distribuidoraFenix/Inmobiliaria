# new-mod-login

*Fecha: viernes 30 de octubre 2026*

## MODULO
* Se modifico la estructura del login para no utilizar triggers
* Se creo un contexto global de autenticacion
* Modificamos el formulario de login eliminando el singup por parte del usuario y aplicando el darkmode
* Se incluyeron un logotipo y el nombre de la app de acuerdo al registro en la tabla configuracion
* Se incluyo un cargado dinamico del favicon y el nombre para mostrar en la pestaña del navegador
## BASE DE DATOS
* Se creo la tabla configuracion

*Fecha: domingo 01 de noviembre 2026*

## MODULO login
* Se modifico el mensaje de error de ingles a español
* Se reviso el archivo RutaAdmin => para no usarlo para un login mas claro y poder controlara la redireccion de las rutas...
* Se modifico el archivo principal app => evita que nos direccione directamente y permite revisar el tipo de usuario para realizar la redireccion corresponiente
* Se modifico el formulario de login => se añadio un settimeout para lograr que se vea el mensaje de bienvenida
