const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: '.sqlite3',
})

function defineModels() {
  sequelize.define('Station', {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    latitude: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
    longitude: {
      type: Sequelize.FLOAT,
      allowNull: false
    }
  })
}

async function init() {
  defineModels();

  await sequelize.authenticate();
  await sequelize.sync();
}

async function findAll() {
  const stations = await sequelize.models.Station.findAll();

  return stations;
}

async function findByCompressedName(compressedName) {
  const station = await sequelize.models.Station.findOne({
    where: {
      name: compressedName
    }
  });

  return station;
}

async function addRecord(compressedName, latitude, longitude) {
  const station = await sequelize.models.Station.create({
    name: compressedName,
    latitude,
    longitude
  });

  await station.save();

  return station;
}

module.exports = {
  init, 
  findAll,
  findByCompressedName,
  addRecord
};