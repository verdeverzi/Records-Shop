const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');
require('dotenv').config();

const Record = require('../models/recordModel');
const User = require('../models/userModel');
// const Address = require("../models/addressModel");

(async () => {
  try {
    //! CONNECT TO DB
    const {
      DB_PROTOCOL,
      DB_USERNAME,
      DB_PASSWORD,
      DB_HOST,
      DB_NAME,
      DB_QUERIES,
    } = process.env;

    const URI = `${DB_PROTOCOL}${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}?${DB_QUERIES}`;

    mongoose.set('strictQuery', false);
    mongoose.connect(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    //! Delete all the old users and records
    await User.deleteMany({});
    console.log(`Users purged`);

    //! Delete all the old records
    await Record.deleteMany();
    console.log('Records purged');

    //!! Generate an array of fake user data

    await Promise.all(
      Array.from({ length: 2 }, async () => {
        const user = new User({
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
          age: faker.random.numeric(2),
          email: faker.internet.email(),
          password: '!Test1234',
          avatarURL: process.env.CLOUD_AVATAR,
          role: faker.helpers.arrayElement(['User', 'Admin']),
          address: {
            street: faker.address.street(),
            city: faker.address.city(),
          },
        });

        return user.save();
      })
    );

    //!! Generate an array of fake user data
    const records = Array.from(
      { length: 20 },
      () =>
        new Record({
          title: faker.music.songName(),
          artist: `${faker.name.firstName()} ${faker.name.lastName()}`,
          year: Math.floor(Math.random() * (2022 - 1970 + 1) + 1970),
          img: faker.image.image(),
          price: faker.commerce.price(10, 20),
        })
    );

    //! Seed the fake data into the database
    await Record.insertMany(records);
    console.log('Data seeded successfully!');
  } catch (error) {
    console.error('Error while seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
})();
