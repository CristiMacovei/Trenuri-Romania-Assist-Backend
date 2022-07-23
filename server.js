const express = require('express');
const cors = require('cors');

const database = require('./database-integration.js')

const app = express();
app.use(cors());
app.use(express.json());

function compressName(string) {
  return string.toLowerCase().replaceAll(' ', '').replaceAll('.', '').replaceAll('â', 'a').replaceAll('ă', 'a').replaceAll('î', 'i').replaceAll('ș', 's').replaceAll('ş', 's').replaceAll('ț', 't').replaceAll('ţ', 't');
}

async function init() {
  try {
    await database.init();
  }
  catch (error) {
    console.log('Blew up when trying to sync to the database');
    console.log(error);
  }

  app.listen(process.env.PORT | 9342, () => {
    console.log(`Running on rocket fuel | port ${process.env.PORT | 9342}`);
  })
}

init();

app.post('/upload', async (req, res) => {
  let stationName = req.body.stationName;
  let shouldOverwrite = false;
  const latitude = req.body.latitude;
  const longitude = req.body.longitude;

  console.log(stationName);

  if (stationName.startsWith('--OVERWRITE')) {
    stationName = stationName.substring(11);
    shouldOverwrite = true;
  }

  const compressedName = compressName(stationName);

  
  const station = await database.findByCompressedName(compressedName);
  
  if (station) {
    if (shouldOverwrite) {
      await station.destroy();
    }
    else {
      res.json({
        status: 'error',
        message: 'Station already exists'
      });

      return;
    }
  }

  await database.addRecord(compressedName, latitude, longitude);
  res.json({
    status: 'success',
    message: 'Station added'
  });
})

app.get('/fetch', async (req, res) => {
  const stations = await database.findAll();
  
  res.json({
    status: 'success',
    json: stations.map(station => ({
      name: station.name,
      latitude: station.latitude,
      longitude: station.longitude
    }))
  });
})

app.get('/locate', async (req, res) => {
  const compressedName = compressName(req.query.name);

  const station = await database.findByCompressedName(compressedName);

  if (station) {
    res.json({
      status: 'success',
      latitude: station.latitude,
      longitude: station.longitude
    });
  }
  else {
    res.json({
      status: 'error',
      message: 'Station not found'
    });
  }
})