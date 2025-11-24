import { assert } from "chai";
import { IotMeasurementRegistryInstance } from "../types/truffle-contracts";
const IotMeasurementRegistry = artifacts.require("IotMeasurementRegistry");

contract("IotMeasurementRegistry", accounts => {
  const owner = accounts[0];
  const admin = accounts[1];
  const sensor1 = accounts[2];
  const sensor2 = accounts[3];

  let instance: IotMeasurementRegistryInstance;

  before(async () => {
    instance = await IotMeasurementRegistry.deployed();
  });

  // -----------------------------------------
  // ADMIN TESTS
  // -----------------------------------------

  it("owner can register admin", async () => {
    await instance.registerAdmin(admin, { from: owner });

    const isAdmin = await instance.admins(admin);
    assert.equal(isAdmin, true, "Admin should be registered");
  });

  // -----------------------------------------
  // SENSOR REGISTRATION TESTS
  // -----------------------------------------

  it("admin can register a sensor", async () => {
    await instance.registerSensor(
      sensor1,
      "Warsaw",
      "Poland",
      100,
      { from: admin }
    );


    const rawSensor = await instance.sensors(sensor1);

    const sensor = {
      exists: rawSensor[0],
      city: rawSensor[1],
      country: rawSensor[2],
      range: rawSensor[3].toNumber(),
    };

    assert.equal(sensor.exists, true);
    assert.equal(sensor.city, "Warsaw");
    assert.equal(sensor.country, "Poland");
    assert.equal(sensor.range, 100);
  });

  it("owner can register another sensor", async () => {
    await instance.registerSensor(
      sensor2,
      "Berlin",
      "Germany",
      150,
      { from: owner }
    );

    const rawSensor = await instance.sensors(sensor2);

    const sensor = {
      exists: rawSensor[0],
      city: rawSensor[1],
      country: rawSensor[2],
      range: rawSensor[3].toNumber(),
    };

    assert.equal(sensor.exists, true);
    assert.equal(sensor.city, "Berlin");
    assert.equal(sensor.country, "Germany");
    assert.equal(sensor.range, 150);
  });

  // -----------------------------------------
  // MEASUREMENT TESTS
  // -----------------------------------------

  it("sensor can store measurement", async () => {
    await instance.storeMeasurement("temp:24C", { from: sensor1 });

    const result = await instance.getMeasurements(sensor1, { from: sensor1 });
    assert.equal(result.length, 1);
    assert.equal(result[0].data, "temp:24C");
  });

  it("admin can read measurements of a sensor", async () => {
    const measurements = await instance.getMeasurements(sensor1, { from: admin });
    assert.equal(measurements.length, 1);
    assert.equal(measurements[0].data, "temp:24C");
  });

  it("sensor cannot read measurements of another sensor", async () => {
    try {
      await instance.getMeasurements(sensor2, { from: sensor1 });
      assert.fail("Should not allow access");
    } catch (err) {
      if (err instanceof Error) {
        assert.include(err.message, "Access denied");
      } else {
        assert.fail("Nieoczekiwany błąd");
      }
    }
  });

  // -----------------------------------------
  // LIST RETRIEVAL TESTS
  // -----------------------------------------

  it("owner can get all sensors", async () => {
    const response = await instance.getAllSensors({ from: owner });

    const sensors = response[0]; // Sensor[] memory
    const addresses = response[1]; // addresses[]

    assert.equal(addresses.length, 2, "There should be 2 sensors registered");
    assert.equal(sensors[0].exists, true);
    assert.equal(sensors[1].exists, true);
  });

  it("admin can get all measurements", async () => {
    const result = await instance.getAllMeasurements({ from: admin });

    const sensorAddresses = result[0];
    const allMeasurements = result[1];

    assert.equal(sensorAddresses.length, 2);
    assert.isArray(allMeasurements);

    // Only sensor1 has 1 measurement
    assert.equal(allMeasurements[0].length > 0 || allMeasurements[1].length > 0, true);
  });
});
