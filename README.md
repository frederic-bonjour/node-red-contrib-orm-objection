# node-red-contrib-orm-objection

[Node-RED](https://nodered.org) node to query a MySQL database with the [Objection ORM](https://vincit.github.io/objection.js/).

Official repository: [https://github.com/frederic-bonjour/node-red-contrib-orm-objection](https://github.com/frederic-bonjour/node-red-contrib-orm-objection)

## Installation

* Install this Node from the Node-RED palette.
* Create a JS file that describes all your models (see [Objection doc](https://vincit.github.io/objection.js/guide/models.html)). This file must export an object with the model names as keys.
* In the `settings.js` file of your Node-RED installation, import this file in the `functionGlobalContext` section :

```javascript
functionGlobalContext: {
    // os:require('os'),
    objectionModels: require('./models')
},
```
(Of course, change the `./models` path to suit your needs.)

Finally, restart Node-RED.

## Usage

### Select

* Insert a `storage/Objection ORM` into your Flow and configure the database connection.
* Optionnaly select a Model name (or use `msg.topic` in the incoming message).
* Optionnaly select the [graph](https://vincit.github.io/objection.js/api/query-builder/eager-methods.html#withgraphfetched) to be fetched along with the model (or use `msg.graph` in the incoming message).

The incoming message may contains the following properties:

* `where`: an [**object**](http://knexjs.org/#Builder-where) representing the WHERE clause.
* `byId`: an integer or a String that will be used in the [`findById()`](https://vincit.github.io/objection.js/api/query-builder/find-methods.html#findbyid) method.
* `orderBy`: a String to choose on which column the results should be sorted on.


### Patch (update)

* Insert a `storage/Objection ORM` into your Flow and configure the database connection.
* Select a Model name.
* Optionnaly select the [graph](https://vincit.github.io/objection.js/api/query-builder/eager-methods.html#withgraphfetched) to be fetched along with the model (or use `msg.graph` in the incoming message).

The incoming message must contain the following property:

* `patch`: an object with the 2 properties:
  * `id`: ID of the model to patch
  * `props`: object containing the properties to update
