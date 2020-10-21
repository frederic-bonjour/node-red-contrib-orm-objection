module.exports = (RED) => {
  'use strict';

  const Knex = require('knex');
  const { Model, knexSnakeCaseMappers } = require('objection');
  let knex;

  function OrmDbServer(config) {
    RED.nodes.createNode(this, config);

    this.connect = async () => {
      this.emit('state', 'connecting');
      knex = Knex({
        client: 'mysql2',
        connection: {
          host: config.host,
          port: config.port,
          user: config.user,
          password: config.password,
          database: config.database,
          timezone : "+00:00",
          dateStrings: true,
        },
        ...knexSnakeCaseMappers(),
      });

      // Give the knex object to Objection.

      Model.knex(knex);

      await knex.select(knex.raw('1'));
      this.emit('state', 'connected');
    };

    this.on('close', async done => {
      knex.destroy();
      this.emit('state');
      done();
    });
  }
  
  // TODO
  RED.nodes.registerType(
    'ORM-DB-Server',
    OrmDbServer,
    {
      credentials: {
        user: { type: 'text' },
        password: { type: 'password' }
      }
    }
  );



  function ObjectionORM(config) {
    RED.nodes.createNode(this, config);
    this.serverConfig = RED.nodes.getNode(config.server);

    if (!this.serverConfig) {
      this.error('ORM database not configured');
      return;
    }

    this.setState = (code, info) => {
      if (code === 'connecting') {
        this.status({ fill: 'grey', shape: 'ring', text: 'connecting...' });
      }
      else if (code === 'connected') {
        this.status({ fill: 'green', shape: 'dot', text: 'connected' });
      }
      else if (code === 'error') {
        this.status({ fill: 'red', shape: 'ring', text: info });
      }
      else if (code === 'querying') {
        this.status({ fill: 'orange', shape: 'dot', text: 'querying...' });
      }
      else if (code === 'queryDone') {
        this.status({ fill: 'blue', shape: 'dot', text: 'query done' });
      }
      else {
        this.status({});
      }
    };

    this.serverConfig.on('state', (code, info) => this.setState(code, info));

    /**
     * An input message arrives...
     */
    this.on('input', async msg => {
      const models = this.context().global.objectionModels;
      const modelName = msg.topic || config.model;
      console.log(modelName);
      if (!models[modelName]) {
        this.error(`msg.topic must contain a valid Model name (received: "${modelName}").`);
      }

      try {
        this.setState('querying');
        let qb = models[modelName].query(knex);
        if (msg.byId) {
          qb.findById(msg.byId);
        } else if (msg.where) {
          qb.where(msg.where);
        }
        const graph = msg.graph || config.graph;
        if (graph) {
          qb.withGraphFetched(graph);
        }
        const result = await qb;
        this.setState('queryDone');
        msg.payload = result;
        this.send(msg);
      } catch (error) {
          this.error(error, msg);
          this.setState('error', error.toString());
        }
    });

    this.on('close', async () => {
      this.serverConfig.removeAllListeners();
      this.setState();
    });

    this.serverConfig.connect();
  }
  RED.nodes.registerType('Objection-ORM', ObjectionORM);
};
