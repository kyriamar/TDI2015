# Guideout
Guideout es un producto que pretende brindar a ciclistas la posibilidad de establecer una conducción guiada segura y eficiente, sin la necesidad de desviar su atención del tránsito. 

Se trata de un casco conectado mediante bluetooth a una app mobile vinculada a Google Maps. Una vez conectado el dispositivo, el usuario escoge su destino dentro de la app obteniendo una ruta para llegar y comienza el recorrido.  

Para ello, la app codifica las señales (habitualmente manifestadas en una pantalla) en impulsos vibratorios y las transmite a los motores de vibración en el casco. El casco está equipado además con luces led indicadoras de freno, que se encienden automáticamente cuando el conductor disminuye su velocidad, y señaleros que son activados mediante un switch desde el manillar, posibilitando una circulación más responsable y segura.


# Installation

### Aplicación mobile
La aplicación mobile está implementada en ionic, framework basado en cordova y angular.js y se puede compilar tanto para Android como para IOS. La aplicación está testeada en Android.

Para poder compilar la aplicación es necesario instalar node.js, ionic y cordova.

```sh
$ npm install -g cordova ionic
```
Luego clonar este repositorio y compilar para la plataforma que se desee
```sh
$ git https://github.com/kyriamar/TDI2015.git
$ cd TDIBike
$ ionic build [android | ios]
$ ionic run --device
```

### Raspberry

Para correr el listener en raspberry se debe tener un dongle bluetooth e instalar el stack bluez.
Para correr el listener se debe ejecutar el archivo
```sh
$ sudo python raspberry_server.py
```